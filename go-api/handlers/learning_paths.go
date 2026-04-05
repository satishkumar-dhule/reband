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

const pathSelect = `SELECT id, title, description, path_type, target_company, target_job_title,
	difficulty, estimated_hours, question_ids, channels, tags, prerequisites,
	learning_objectives, milestones, popularity, completion_rate, average_rating
	FROM learning_paths`

func scanPath(rows *sql.Rows) (models.LearningPath, error) {
	var p models.LearningPath
	var targetCompany, targetJobTitle sql.NullString
	var estHours, popularity, completionRate, avgRating sql.NullInt64
	var questionIDs, channels, tags, prerequisites, objectives, milestones models.JSONRaw

	err := rows.Scan(
		&p.ID, &p.Title, &p.Description, &p.PathType,
		&targetCompany, &targetJobTitle,
		&p.Difficulty, &estHours,
		&questionIDs, &channels, &tags, &prerequisites,
		&objectives, &milestones,
		&popularity, &completionRate, &avgRating,
	)
	if err != nil {
		return p, err
	}

	if targetCompany.Valid {
		p.TargetCompany = &targetCompany.String
	}
	if targetJobTitle.Valid {
		p.TargetJobTitle = &targetJobTitle.String
	}
	if estHours.Valid {
		p.EstimatedHours = int(estHours.Int64)
	}
	if popularity.Valid {
		p.Popularity = int(popularity.Int64)
	}
	if completionRate.Valid {
		p.CompletionRate = int(completionRate.Int64)
	}
	if avgRating.Valid {
		p.AverageRating = int(avgRating.Int64)
	}

	p.QuestionIDs = questionIDs
	p.Channels = channels
	p.Tags = tags
	p.Prerequisites = prerequisites
	p.LearningObjectives = objectives
	p.Milestones = milestones
	return p, nil
}

// GET /api/v1/learning-paths
// Query params: path_type, difficulty, company, job_title, page, page_size
func GetLearningPaths(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		pathType := queryStr(r, "path_type")
		difficulty := queryStr(r, "difficulty")
		company := queryStr(r, "company")
		jobTitle := queryStr(r, "job_title")
		page := queryInt(r, "page", 1)
		pageSize := queryInt(r, "page_size", 20)
		if pageSize > 100 {
			pageSize = 100
		}

		cacheKey := fmt.Sprintf("paths-%s-%s-%s-%s-%d-%d", pathType, difficulty, company, jobTitle, page, pageSize)
		if cached, ok := middleware.Global.Get(cacheKey); ok {
			middleware.SetReadCache(w, 120, 300)
			writeJSON(w, http.StatusOK, cached)
			return
		}

		where := " WHERE status = 'active'"
		args := []any{}

		if pathType != "" && pathType != "all" {
			where += " AND path_type = ?"
			args = append(args, pathType)
		}
		if difficulty != "" && difficulty != "all" {
			where += " AND difficulty = ?"
			args = append(args, difficulty)
		}
		if company != "" {
			where += " AND target_company = ?"
			args = append(args, company)
		}
		if jobTitle != "" {
			where += " AND target_job_title = ?"
			args = append(args, jobTitle)
		}

		var total int
		if err := db.QueryRow("SELECT COUNT(*) FROM learning_paths"+where, args...).Scan(&total); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to count paths")
			return
		}

		offset, totalPages, hasNext, hasPrev := paginate(total, page, pageSize)

		rows, err := db.Query(pathSelect+where+" ORDER BY popularity DESC, title ASC LIMIT ? OFFSET ?", append(args, pageSize, offset)...)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to fetch paths")
			return
		}
		defer rows.Close()

		paths := make([]models.LearningPath, 0, pageSize)
		for rows.Next() {
			p, err := scanPath(rows)
			if err == nil {
				paths = append(paths, p)
			}
		}

		result := models.Paginated[models.LearningPath]{
			Data:       paths,
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

// GET /api/v1/learning-paths/{pathId}
func GetLearningPath(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "pathId")

		rows, err := db.Query(pathSelect+" WHERE id = ? LIMIT 1", id)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to fetch path")
			return
		}
		defer rows.Close()

		if !rows.Next() {
			writeError(w, http.StatusNotFound, "learning path not found")
			return
		}

		p, err := scanPath(rows)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to parse path")
			return
		}

		writeJSON(w, http.StatusOK, p)
	}
}
