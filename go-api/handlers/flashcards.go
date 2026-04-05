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

const flashcardSelect = `SELECT id, channel, front, back, hint, code_example, mnemonic,
	difficulty, tags, category FROM flashcards`

func scanFlashcard(rows *sql.Rows) (models.Flashcard, error) {
	var f models.Flashcard
	var hint, codeExample, mnemonic, category sql.NullString
	var tags models.JSONRaw

	err := rows.Scan(
		&f.ID, &f.Channel, &f.Front, &f.Back,
		&hint, &codeExample, &mnemonic,
		&f.Difficulty, &tags, &category,
	)
	if err != nil {
		return f, err
	}

	if hint.Valid {
		f.Hint = &hint.String
	}
	if codeExample.Valid {
		f.CodeExample = &codeExample.String
	}
	if mnemonic.Valid {
		f.Mnemonic = &mnemonic.String
	}
	if category.Valid {
		f.Category = &category.String
	}
	if tags != nil {
		f.Tags = tags
	}
	return f, nil
}

// GET /api/v1/flashcards
// Query params: channel, difficulty, page, page_size
func GetFlashcards(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		channel := queryStr(r, "channel")
		difficulty := queryStr(r, "difficulty")
		page := queryInt(r, "page", 1)
		pageSize := queryInt(r, "page_size", 50)
		if pageSize > 200 {
			pageSize = 200
		}

		cacheKey := fmt.Sprintf("flashcards-%s-%s-%d-%d", channel, difficulty, page, pageSize)
		if cached, ok := middleware.Global.Get(cacheKey); ok {
			middleware.SetReadCache(w, 120, 300)
			writeJSON(w, http.StatusOK, cached)
			return
		}

		where := " WHERE status = 'active'"
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
		if err := db.QueryRow("SELECT COUNT(*) FROM flashcards"+where, args...).Scan(&total); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to count flashcards")
			return
		}

		offset, totalPages, hasNext, hasPrev := paginate(total, page, pageSize)

		rows, err := db.Query(flashcardSelect+where+" ORDER BY created_at ASC LIMIT ? OFFSET ?", append(args, pageSize, offset)...)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to fetch flashcards")
			return
		}
		defer rows.Close()

		cards := make([]models.Flashcard, 0, pageSize)
		for rows.Next() {
			f, err := scanFlashcard(rows)
			if err == nil {
				cards = append(cards, f)
			}
		}

		result := models.Paginated[models.Flashcard]{
			Data:       cards,
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

// GET /api/v1/flashcards/{channelId}
// Backwards-compatible per-channel endpoint
func GetFlashcardsByChannel(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		channelID := chi.URLParam(r, "channelId")
		cacheKey := "flashcards-channel-" + channelID

		if cached, ok := middleware.Global.Get(cacheKey); ok {
			middleware.SetReadCache(w, 120, 300)
			writeJSON(w, http.StatusOK, cached)
			return
		}

		rows, err := db.Query(flashcardSelect+" WHERE channel = ? AND status = 'active' ORDER BY created_at ASC", channelID)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to fetch flashcards")
			return
		}
		defer rows.Close()

		cards := []models.Flashcard{}
		for rows.Next() {
			f, err := scanFlashcard(rows)
			if err == nil {
				cards = append(cards, f)
			}
		}

		middleware.Global.Set(cacheKey, cards, 2*time.Minute)
		middleware.SetReadCache(w, 120, 300)
		writeJSON(w, http.StatusOK, cards)
	}
}
