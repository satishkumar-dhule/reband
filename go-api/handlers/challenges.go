package handlers

import (
        "database/sql"
        "devprep-api/middleware"
        "devprep-api/models"
        "fmt"
        "net/http"
        "time"

        "github.com/go-chi/chi/v5"
)

func scanChallenge(rows *sql.Rows) (models.CodingChallenge, error) {
        var c models.CodingChallenge
        var tags, companies, testCases, hints models.JSONRaw
        var jsCode, pyCode, solJS, solPy, compTime, compSpace, compExpl sql.NullString
        var timeLimit sql.NullInt64

        err := rows.Scan(
                &c.ID, &c.Title, &c.Description, &c.Difficulty, &c.Category,
                &tags, &companies, &jsCode, &pyCode, &testCases, &hints,
                &solJS, &solPy, &compTime, &compSpace, &compExpl, &timeLimit,
        )
        if err != nil {
                return c, err
        }

        if tags != nil {
                c.Tags = tags
        }
        if companies != nil {
                c.Companies = companies
        }
        if testCases != nil {
                c.TestCases = testCases
        }
        if hints != nil {
                c.Hints = hints
        }

        c.StarterCode = models.StarterCode{
                JavaScript: nullStr(jsCode),
                Python:     nullStr(pyCode),
        }
        c.Solution = models.Solution{
                JavaScript: nullStr(solJS),
                Python:     nullStr(solPy),
        }
        c.Complexity = models.Complexity{
                Time:        orDefault(nullStr(compTime), "O(n)"),
                Space:       orDefault(nullStr(compSpace), "O(1)"),
                Explanation: nullStr(compExpl),
        }
        if timeLimit.Valid {
                c.TimeLimit = int(timeLimit.Int64)
        } else {
                c.TimeLimit = 15
        }
        return c, nil
}

func nullStr(n sql.NullString) string {
        if n.Valid {
                return n.String
        }
        return ""
}

func orDefault(s, d string) string {
        if s == "" {
                return d
        }
        return s
}

const challengeSelect = `SELECT id, title, description, difficulty, category,
        tags, companies, starter_code_js, starter_code_py, test_cases, hints,
        solution_js, solution_py, complexity_time, complexity_space, complexity_explanation, time_limit
        FROM coding_challenges`

// GET /api/v1/coding/challenges
// Query params: difficulty, category, page, page_size
func GetChallenges(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                difficulty := queryStr(r, "difficulty")
                category := queryStr(r, "category")
                page := queryInt(r, "page", 1)
                pageSize := queryInt(r, "page_size", 20)
                if pageSize > 100 {
                        pageSize = 100
                }

                cacheKey := fmt.Sprintf("challenges-%s-%s-%d-%d", difficulty, category, page, pageSize)
                if cached, ok := middleware.Global.Get(cacheKey); ok {
                        middleware.SetReadCache(w, 120, 300)
                        writeJSON(w, http.StatusOK, cached)
                        return
                }

                where := " WHERE 1=1"
                args := []any{}

                if difficulty != "" && difficulty != "all" {
                        where += " AND difficulty = ?"
                        args = append(args, difficulty)
                }
                if category != "" && category != "all" {
                        where += " AND category = ?"
                        args = append(args, category)
                }

                var total int
                if err := db.QueryRow("SELECT COUNT(*) FROM coding_challenges"+where, args...).Scan(&total); err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to count challenges")
                        return
                }

                offset, totalPages, hasNext, hasPrev := paginate(total, page, pageSize)

                rows, err := db.Query(challengeSelect+where+" ORDER BY created_at DESC LIMIT ? OFFSET ?", append(args, pageSize, offset)...)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch challenges")
                        return
                }
                defer rows.Close()

                challenges := make([]models.CodingChallenge, 0, pageSize)
                for rows.Next() {
                        c, err := scanChallenge(rows)
                        if err == nil {
                                challenges = append(challenges, c)
                        }
                }

                result := models.Paginated[models.CodingChallenge]{
                        Data:       challenges,
                        Total:      total,
                        Page:       page,
                        PageSize:   pageSize,
                        TotalPages: totalPages,
                        HasNext:    hasNext,
                        HasPrev:    hasPrev,
                }

                middleware.Global.Set(cacheKey, result, 2*time.Minute)
                middleware.SetReadCache(w, 120, 300)
                writeJSON(w, http.StatusOK, result)
        }
}

// GET /api/v1/coding/challenges/{id}
func GetChallenge(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                id := chi.URLParam(r, "id")

                rows, err := db.Query(challengeSelect+" WHERE id = ? LIMIT 1", id)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch challenge")
                        return
                }
                defer rows.Close()

                if !rows.Next() {
                        writeError(w, http.StatusNotFound, "challenge not found")
                        return
                }

                c, err := scanChallenge(rows)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to parse challenge")
                        return
                }

                writeJSON(w, http.StatusOK, c)
        }
}

// GET /api/v1/coding/random
func GetRandomChallenge(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                difficulty := queryStr(r, "difficulty")

                where := " WHERE 1=1"
                args := []any{}
                if difficulty != "" && difficulty != "all" {
                        where += " AND difficulty = ?"
                        args = append(args, difficulty)
                }

                rows, err := db.Query(challengeSelect+where+" ORDER BY RANDOM() LIMIT 1", args...)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch random challenge")
                        return
                }
                defer rows.Close()

                if !rows.Next() {
                        writeError(w, http.StatusNotFound, "no challenges found")
                        return
                }

                c, err := scanChallenge(rows)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to parse challenge")
                        return
                }

                writeJSON(w, http.StatusOK, c)
        }
}

// GET /api/v1/coding/stats
func GetChallengeStats(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                const key = "coding-stats"
                if cached, ok := middleware.Global.Get(key); ok {
                        writeJSON(w, http.StatusOK, cached)
                        return
                }

                rows, err := db.Query("SELECT difficulty, category, COUNT(*) FROM coding_challenges GROUP BY difficulty, category")
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch stats")
                        return
                }
                defer rows.Close()

                type stats struct {
                        Total        int            `json:"total"`
                        ByDifficulty map[string]int `json:"byDifficulty"`
                        ByCategory   map[string]int `json:"byCategory"`
                }

                s := stats{
                        ByDifficulty: map[string]int{},
                        ByCategory:   map[string]int{},
                }

                for rows.Next() {
                        var diff, cat string
                        var count int
                        if err := rows.Scan(&diff, &cat, &count); err != nil {
                                continue
                        }
                        s.Total += count
                        s.ByDifficulty[diff] += count
                        s.ByCategory[cat] += count
                }

                middleware.Global.Set(key, s, 5*time.Minute)
                writeJSON(w, http.StatusOK, s)
        }
}

