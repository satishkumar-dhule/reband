package handlers

import (
        "database/sql"
        "devprep-api/middleware"
        "devprep-api/models"
        "encoding/json"
        "fmt"
        "net/http"
        "time"

        "github.com/go-chi/chi/v5"
)

// scanQuestion maps a DB row to a Question model.
func scanQuestion(rows *sql.Rows) (models.Question, error) {
        var q models.Question
        var diagram, sourceURL, eli5, tldr, lastUpdated sql.NullString
        var tags, videos, companies models.JSONRaw
        var isNew int

        err := rows.Scan(
                &q.ID, &q.Question, &q.Answer, &q.Explanation,
                &diagram, &q.Difficulty, &tags,
                &q.Channel, &q.SubChannel, &sourceURL,
                &videos, &companies, &eli5, &tldr, &isNew, &lastUpdated,
        )
        if err != nil {
                return q, err
        }

        if diagram.Valid {
                q.Diagram = &diagram.String
        }
        if sourceURL.Valid {
                q.SourceURL = &sourceURL.String
        }
        if eli5.Valid {
                q.Eli5 = &eli5.String
        }
        if tldr.Valid {
                q.TLDR = &tldr.String
        }
        if lastUpdated.Valid {
                q.LastUpdated = &lastUpdated.String
        }
        if tags != nil {
                q.Tags = tags
        }
        if videos != nil {
                q.Videos = videos
        }
        if companies != nil {
                q.Companies = companies
        }
        q.IsNew = isNew == 1
        return q, nil
}

const questionSelect = `SELECT id, question, answer, explanation, diagram, difficulty,
        tags, channel, sub_channel, source_url, videos, companies, eli5, tldr, is_new, last_updated
        FROM questions`

// GET /api/v1/questions
// Query params: channel, sub_channel, difficulty, page, page_size, search
func GetQuestions(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                channel := queryStr(r, "channel")
                subCh := queryStr(r, "sub_channel")
                difficulty := queryStr(r, "difficulty")
                search := queryStr(r, "search")
                page := queryInt(r, "page", 1)
                pageSize := queryInt(r, "page_size", 50)
                if pageSize > 200 {
                        pageSize = 200
                }

                cacheKey := fmt.Sprintf("questions-%s-%s-%s-%s-%d-%d", channel, subCh, difficulty, search, page, pageSize)

                if cached, ok := middleware.Global.Get(cacheKey); ok {
                        middleware.SetReadCache(w, 60, 120)
                        writeJSON(w, http.StatusOK, cached)
                        return
                }

                where := " WHERE status != 'deleted'"
                args := []any{}

                if channel != "" && channel != "all" {
                        where += " AND channel = ?"
                        args = append(args, channel)
                }
                if subCh != "" && subCh != "all" {
                        where += " AND sub_channel = ?"
                        args = append(args, subCh)
                }
                if difficulty != "" && difficulty != "all" {
                        where += " AND difficulty = ?"
                        args = append(args, difficulty)
                }
                if search != "" {
                        where += " AND (question LIKE ? OR answer LIKE ?)"
                        like := "%" + search + "%"
                        args = append(args, like, like)
                }

                // Count total
                var total int
                countSQL := "SELECT COUNT(*) FROM questions" + where
                if err := db.QueryRow(countSQL, args...).Scan(&total); err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to count questions")
                        return
                }

                offset, totalPages, hasNext, hasPrev := paginate(total, page, pageSize)

                dataSQL := questionSelect + where + " ORDER BY created_at ASC LIMIT ? OFFSET ?"
                dataArgs := append(args, pageSize, offset)

                rows, err := db.Query(dataSQL, dataArgs...)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch questions")
                        return
                }
                defer rows.Close()

                questions := make([]models.Question, 0, pageSize)
                for rows.Next() {
                        q, err := scanQuestion(rows)
                        if err != nil {
                                continue
                        }
                        questions = append(questions, q)
                }

                result := models.Paginated[models.Question]{
                        Data:       questions,
                        Total:      total,
                        Page:       page,
                        PageSize:   pageSize,
                        TotalPages: totalPages,
                        HasNext:    hasNext,
                        HasPrev:    hasPrev,
                }

                middleware.Global.Set(cacheKey, result, 60*time.Second)
                middleware.SetReadCache(w, 60, 120)
                writeJSON(w, http.StatusOK, result)
        }
}

// GET /api/v1/questions/{questionId}
func GetQuestion(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                id := chi.URLParam(r, "questionId")

                rows, err := db.Query(questionSelect+" WHERE id = ? LIMIT 1", id)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch question")
                        return
                }
                defer rows.Close()

                if !rows.Next() {
                        writeError(w, http.StatusNotFound, "question not found")
                        return
                }

                q, err := scanQuestion(rows)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to parse question")
                        return
                }

                writeJSON(w, http.StatusOK, q)
        }
}

// GET /api/v1/questions/random
// Query params: channel, difficulty
func GetRandomQuestion(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                channel := queryStr(r, "channel")
                difficulty := queryStr(r, "difficulty")

                where := " WHERE status != 'deleted'"
                args := []any{}

                if channel != "" && channel != "all" {
                        where += " AND channel = ?"
                        args = append(args, channel)
                }
                if difficulty != "" && difficulty != "all" {
                        where += " AND difficulty = ?"
                        args = append(args, difficulty)
                }

                rows, err := db.Query(questionSelect+where+" ORDER BY RANDOM() LIMIT 1", args...)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch random question")
                        return
                }
                defer rows.Close()

                if !rows.Next() {
                        writeError(w, http.StatusNotFound, "no questions found")
                        return
                }

                q, err := scanQuestion(rows)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to parse question")
                        return
                }

                writeJSON(w, http.StatusOK, q)
        }
}

// GET /api/v1/channels
func GetChannels(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                const key = "channels"
                if cached, ok := middleware.Global.Get(key); ok {
                        middleware.SetReadCache(w, 300, 600)
                        writeJSON(w, http.StatusOK, cached)
                        return
                }

                rows, err := db.Query("SELECT channel, COUNT(*) FROM questions WHERE status != 'deleted' GROUP BY channel ORDER BY channel")
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch channels")
                        return
                }
                defer rows.Close()

                channels := []models.Channel{}
                for rows.Next() {
                        var c models.Channel
                        if err := rows.Scan(&c.ID, &c.QuestionCount); err == nil {
                                channels = append(channels, c)
                        }
                }

                middleware.Global.Set(key, channels, 5*time.Minute)
                middleware.SetReadCache(w, 300, 600)
                writeJSON(w, http.StatusOK, channels)
        }
}

// GET /api/v1/channels/{channelId}/subchannels
func GetSubchannels(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                channelID := chi.URLParam(r, "channelId")
                cacheKey := "subchannels-" + channelID

                if cached, ok := middleware.Global.Get(cacheKey); ok {
                        writeJSON(w, http.StatusOK, cached)
                        return
                }

                rows, err := db.Query("SELECT DISTINCT sub_channel FROM questions WHERE channel = ? ORDER BY sub_channel", channelID)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch subchannels")
                        return
                }
                defer rows.Close()

                subs := []string{}
                for rows.Next() {
                        var s string
                        if err := rows.Scan(&s); err == nil {
                                subs = append(subs, s)
                        }
                }

                middleware.Global.Set(cacheKey, subs, 5*time.Minute)
                writeJSON(w, http.StatusOK, subs)
        }
}

// GET /api/v1/channels/{channelId}/companies
func GetCompanies(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                channelID := chi.URLParam(r, "channelId")
                cacheKey := "companies-" + channelID

                if cached, ok := middleware.Global.Get(cacheKey); ok {
                        writeJSON(w, http.StatusOK, cached)
                        return
                }

                rows, err := db.Query("SELECT DISTINCT companies FROM questions WHERE channel = ? AND companies IS NOT NULL", channelID)
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch companies")
                        return
                }
                defer rows.Close()

                seen := map[string]bool{}
                result := []string{}
                for rows.Next() {
                        var raw sql.NullString
                        if err := rows.Scan(&raw); err != nil || !raw.Valid {
                                continue
                        }
                        var arr []string
                        if err := json.Unmarshal([]byte(raw.String), &arr); err != nil {
                                continue
                        }
                        for _, c := range arr {
                                if !seen[c] {
                                        seen[c] = true
                                        result = append(result, c)
                                }
                        }
                }

                middleware.Global.Set(cacheKey, result, 5*time.Minute)
                writeJSON(w, http.StatusOK, result)
        }
}

// GET /api/v1/stats
func GetStats(db *sql.DB) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
                const key = "stats"
                if cached, ok := middleware.Global.Get(key); ok {
                        middleware.SetReadCache(w, 120, 300)
                        writeJSON(w, http.StatusOK, cached)
                        return
                }

                rows, err := db.Query("SELECT channel, difficulty, COUNT(*) FROM questions WHERE status != 'deleted' GROUP BY channel, difficulty")
                if err != nil {
                        writeError(w, http.StatusInternalServerError, "failed to fetch stats")
                        return
                }
                defer rows.Close()

                statsMap := map[string]*models.ChannelStats{}
                for rows.Next() {
                        var channel, difficulty string
                        var count int
                        if err := rows.Scan(&channel, &difficulty, &count); err != nil {
                                continue
                        }
                        if _, ok := statsMap[channel]; !ok {
                                statsMap[channel] = &models.ChannelStats{ID: channel}
                        }
                        s := statsMap[channel]
                        s.Total += count
                        switch difficulty {
                        case "beginner":
                                s.Beginner = count
                        case "intermediate":
                                s.Intermediate = count
                        case "advanced":
                                s.Advanced = count
                        }
                }

                stats := make([]models.ChannelStats, 0, len(statsMap))
                for _, s := range statsMap {
                        stats = append(stats, *s)
                }

                middleware.Global.Set(key, stats, 2*time.Minute)
                middleware.SetReadCache(w, 120, 300)
                writeJSON(w, http.StatusOK, stats)
        }
}
