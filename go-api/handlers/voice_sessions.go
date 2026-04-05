package handlers

import (
	"database/sql"
	"devprep-api/middleware"
	"devprep-api/models"
	"fmt"
	"net/http"
	"time"
)

const voiceSelect = `SELECT id, topic, description, channel, difficulty,
	question_ids, total_questions, estimated_minutes FROM voice_sessions`

func scanVoiceSession(rows *sql.Rows) (models.VoiceSession, error) {
	var v models.VoiceSession
	var description sql.NullString
	var questionIDs models.JSONRaw
	var estMin sql.NullInt64

	err := rows.Scan(
		&v.ID, &v.Topic, &description, &v.Channel, &v.Difficulty,
		&questionIDs, &v.TotalQuestions, &estMin,
	)
	if err != nil {
		return v, err
	}

	if description.Valid {
		v.Description = &description.String
	}
	if estMin.Valid {
		v.EstimatedMinutes = int(estMin.Int64)
	} else {
		v.EstimatedMinutes = 5
	}
	v.QuestionIDs = questionIDs
	return v, nil
}

// GET /api/v1/voice-sessions
// Query params: channel, difficulty, page, page_size
func GetVoiceSessions(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		channel := queryStr(r, "channel")
		difficulty := queryStr(r, "difficulty")
		page := queryInt(r, "page", 1)
		pageSize := queryInt(r, "page_size", 20)
		if pageSize > 100 {
			pageSize = 100
		}

		cacheKey := fmt.Sprintf("voice-%s-%s-%d-%d", channel, difficulty, page, pageSize)
		if cached, ok := middleware.Global.Get(cacheKey); ok {
			middleware.SetReadCache(w, 120, 300)
			writeJSON(w, http.StatusOK, cached)
			return
		}

		where := " WHERE 1=1"
		args := []any{}

		if channel != "" && channel != "all" {
			where += " AND channel = ?"
			args = append(args, channel)
		}
		if difficulty != "" && difficulty != "all" {
			where += " AND difficulty = ?"
			args = append(args, difficulty)
		}

		var total int
		if err := db.QueryRow("SELECT COUNT(*) FROM voice_sessions"+where, args...).Scan(&total); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to count voice sessions")
			return
		}

		offset, totalPages, hasNext, hasPrev := paginate(total, page, pageSize)

		rows, err := db.Query(voiceSelect+where+" ORDER BY total_questions DESC LIMIT ? OFFSET ?", append(args, pageSize, offset)...)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to fetch voice sessions")
			return
		}
		defer rows.Close()

		sessions := make([]models.VoiceSession, 0, pageSize)
		for rows.Next() {
			v, err := scanVoiceSession(rows)
			if err == nil {
				sessions = append(sessions, v)
			}
		}

		result := models.Paginated[models.VoiceSession]{
			Data:       sessions,
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
