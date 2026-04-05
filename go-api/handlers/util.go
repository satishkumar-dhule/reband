package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
)

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func queryStr(r *http.Request, key string) string {
	return r.URL.Query().Get(key)
}

func queryInt(r *http.Request, key string, def int) int {
	s := r.URL.Query().Get(key)
	if s == "" {
		return def
	}
	n, err := strconv.Atoi(s)
	if err != nil || n < 1 {
		return def
	}
	return n
}

func paginate(total, page, pageSize int) (offset int, totalPages int, hasNext, hasPrev bool) {
	if page < 1 {
		page = 1
	}
	totalPages = (total + pageSize - 1) / pageSize
	offset = (page - 1) * pageSize
	hasNext = page < totalPages
	hasPrev = page > 1
	return
}
