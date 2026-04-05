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

const certSelect = `SELECT id, name, provider, description, icon, color,
	difficulty, category, estimated_hours, exam_code, official_url,
	domains, channel_mappings, tags, prerequisites,
	question_count, passing_score, exam_duration
	FROM certifications`

func scanCert(rows *sql.Rows) (models.Certification, error) {
	var c models.Certification
	var examCode, officialURL sql.NullString
	var domains, channelMappings, tags, prerequisites models.JSONRaw
	var estHours, qCount, passingScore, examDuration sql.NullInt64

	err := rows.Scan(
		&c.ID, &c.Name, &c.Provider, &c.Description, &c.Icon, &c.Color,
		&c.Difficulty, &c.Category, &estHours, &examCode, &officialURL,
		&domains, &channelMappings, &tags, &prerequisites,
		&qCount, &passingScore, &examDuration,
	)
	if err != nil {
		return c, err
	}

	if examCode.Valid {
		c.ExamCode = &examCode.String
	}
	if officialURL.Valid {
		c.OfficialURL = &officialURL.String
	}
	if estHours.Valid {
		c.EstimatedHours = int(estHours.Int64)
	}
	if qCount.Valid {
		c.QuestionCount = int(qCount.Int64)
	}
	if passingScore.Valid {
		c.PassingScore = int(passingScore.Int64)
	} else {
		c.PassingScore = 70
	}
	if examDuration.Valid {
		c.ExamDuration = int(examDuration.Int64)
	} else {
		c.ExamDuration = 90
	}

	c.Domains = domains
	c.ChannelMappings = channelMappings
	c.Tags = tags
	c.Prerequisites = prerequisites
	return c, nil
}

// GET /api/v1/certifications
// Query params: category, difficulty, page, page_size
func GetCertifications(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		category := queryStr(r, "category")
		difficulty := queryStr(r, "difficulty")
		page := queryInt(r, "page", 1)
		pageSize := queryInt(r, "page_size", 20)
		if pageSize > 100 {
			pageSize = 100
		}

		cacheKey := fmt.Sprintf("certs-%s-%s-%d-%d", category, difficulty, page, pageSize)
		if cached, ok := middleware.Global.Get(cacheKey); ok {
			middleware.SetReadCache(w, 300, 600)
			writeJSON(w, http.StatusOK, cached)
			return
		}

		where := " WHERE status = 'active'"
		args := []any{}

		if category != "" && category != "all" {
			where += " AND category = ?"
			args = append(args, category)
		}
		if difficulty != "" && difficulty != "all" {
			where += " AND difficulty = ?"
			args = append(args, difficulty)
		}

		var total int
		if err := db.QueryRow("SELECT COUNT(*) FROM certifications"+where, args...).Scan(&total); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to count certifications")
			return
		}

		offset, totalPages, hasNext, hasPrev := paginate(total, page, pageSize)

		rows, err := db.Query(certSelect+where+" ORDER BY name ASC LIMIT ? OFFSET ?", append(args, pageSize, offset)...)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to fetch certifications")
			return
		}
		defer rows.Close()

		certs := make([]models.Certification, 0, pageSize)
		for rows.Next() {
			c, err := scanCert(rows)
			if err == nil {
				certs = append(certs, c)
			}
		}

		result := models.Paginated[models.Certification]{
			Data:       certs,
			Total:      total,
			Page:       page,
			PageSize:   pageSize,
			TotalPages: totalPages,
			HasNext:    hasNext,
			HasPrev:    hasPrev,
		}

		middleware.Global.Set(cacheKey, result, 5*time.Minute)
		middleware.SetReadCache(w, 300, 600)
		writeJSON(w, http.StatusOK, result)
	}
}

// GET /api/v1/certifications/{id}
func GetCertification(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")

		rows, err := db.Query(certSelect+" WHERE id = ? LIMIT 1", id)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to fetch certification")
			return
		}
		defer rows.Close()

		if !rows.Next() {
			writeError(w, http.StatusNotFound, "certification not found")
			return
		}

		c, err := scanCert(rows)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to parse certification")
			return
		}

		writeJSON(w, http.StatusOK, c)
	}
}
