// Package app provides the shared chi router wired with all middleware and routes.
// Both the standard HTTP server (main.go) and the Cloudflare Workers entry point
// (worker/main.go) call NewRouter() to get a fully configured handler.
package app

import (
	"database/sql"
	"devprep-api/handlers"
	"devprep-api/middleware"
	"encoding/json"
	"net/http"
	"os"
	"runtime"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

const Version = "2.0.0"

// NewRouter builds and returns the fully configured HTTP router.
func NewRouter(db *sql.DB) http.Handler {
	r := chi.NewRouter()

	// ─── Middleware stack ───────────────────────────────────────────────────────
	r.Use(middleware.Security)
	r.Use(middleware.RequestID)
	r.Use(middleware.Logger)

	// CORS: configurable via CORS_ORIGINS env var (comma-separated list).
	// Defaults to permissive "*" when env var is empty (dev-friendly).
	corsOrigins := parseCORSOrigins(os.Getenv("CORS_ORIGINS"))
	r.Use(middleware.NewCORS(middleware.CORSConfig{AllowedOrigins: corsOrigins}))

	// Rate limiter: 60 req/s per IP, burst of 120.
	// Cloudflare WAF handles higher-level DDoS; this guards individual IPs.
	rl := middleware.NewRateLimiter(60, 120)
	r.Use(rl.Middleware)

	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Compress(5))
	r.Use(chimiddleware.Timeout(30 * time.Second))

	// ─── Health & Root ─────────────────────────────────────────────────────────
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		status := "ok"
		if err := db.PingContext(r.Context()); err != nil {
			status = "degraded"
			w.WriteHeader(http.StatusServiceUnavailable)
		}
		writeJSON(w, map[string]any{
			"status":    status,
			"service":   "devprep-go-api",
			"version":   Version,
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"go":        runtime.Version(),
		})
	})

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		scheme := "https"
		if r.TLS == nil && r.Header.Get("X-Forwarded-Proto") != "https" {
			scheme = "http"
		}
		base := scheme + "://" + r.Host
		writeJSON(w, map[string]any{
			"service": "DevPrep Go API",
			"version": Version,
			"docs":    base + "/api/v1",
			"endpoints": map[string]string{
				"health":         "GET /health",
				"channels":       "GET /api/v1/channels",
				"stats":          "GET /api/v1/stats",
				"questions":      "GET /api/v1/questions",
				"question":       "GET /api/v1/questions/{questionId}",
				"random_q":       "GET /api/v1/questions/random",
				"subchannels":    "GET /api/v1/channels/{channelId}/subchannels",
				"companies":      "GET /api/v1/channels/{channelId}/companies",
				"challenges":     "GET /api/v1/coding/challenges",
				"challenge":      "GET /api/v1/coding/challenges/{id}",
				"random_c":       "GET /api/v1/coding/random",
				"coding_stats":   "GET /api/v1/coding/stats",
				"flashcards":     "GET /api/v1/flashcards",
				"flashcards_ch":  "GET /api/v1/flashcards/{channelId}",
				"voice_sessions": "GET /api/v1/voice-sessions",
				"certifications": "GET /api/v1/certifications",
				"certification":  "GET /api/v1/certifications/{id}",
				"paths":          "GET /api/v1/learning-paths",
				"path":           "GET /api/v1/learning-paths/{pathId}",
			},
		})
	})

	// ─── API v1 ────────────────────────────────────────────────────────────────
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/channels", handlers.GetChannels(db))
		r.Get("/stats", handlers.GetStats(db))
		r.Get("/channels/{channelId}/subchannels", handlers.GetSubchannels(db))
		r.Get("/channels/{channelId}/companies", handlers.GetCompanies(db))

		// /random must be registered before /{questionId}
		r.Get("/questions", handlers.GetQuestions(db))
		r.Get("/questions/random", handlers.GetRandomQuestion(db))
		r.Get("/questions/{questionId}", handlers.GetQuestion(db))

		r.Get("/coding/challenges", handlers.GetChallenges(db))
		r.Get("/coding/random", handlers.GetRandomChallenge(db))
		r.Get("/coding/stats", handlers.GetChallengeStats(db))
		r.Get("/coding/challenges/{id}", handlers.GetChallenge(db))

		r.Get("/flashcards", handlers.GetFlashcards(db))
		r.Get("/flashcards/{channelId}", handlers.GetFlashcardsByChannel(db))

		r.Get("/voice-sessions", handlers.GetVoiceSessions(db))

		r.Get("/certifications", handlers.GetCertifications(db))
		r.Get("/certifications/{id}", handlers.GetCertification(db))

		r.Get("/learning-paths", handlers.GetLearningPaths(db))
		r.Get("/learning-paths/{pathId}", handlers.GetLearningPath(db))
	})

	return r
}

func writeJSON(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

// parseCORSOrigins parses a comma-separated list of allowed origins.
// Returns nil (allow all) if the env var is empty.
func parseCORSOrigins(raw string) []string {
	if raw == "" {
		return nil
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
