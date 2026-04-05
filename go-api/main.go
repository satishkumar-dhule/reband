package main

import (
	"devprep-api/db"
	"devprep-api/handlers"
	"devprep-api/middleware"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
)

func main() {
	port := os.Getenv("GO_API_PORT")
	if port == "" {
		port = "3001"
	}

	database, err := db.Open()
	if err != nil {
		log.Fatalf("[go-api] failed to open database: %v", err)
	}
	defer database.Close()

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.CORS)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Compress(5))

	// ─── Health & Info ─────────────────────────────────────────────────────────
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"status":    "ok",
			"service":   "devprep-go-api",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"go":        runtime.Version(),
		})
	})

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{
			"service": "DevPrep Go API",
			"version": "1.0.0",
			"docs":    fmt.Sprintf("http://localhost:%s/api/v1", port),
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

		// Channels & Stats
		r.Get("/channels", handlers.GetChannels(database))
		r.Get("/stats", handlers.GetStats(database))
		r.Get("/channels/{channelId}/subchannels", handlers.GetSubchannels(database))
		r.Get("/channels/{channelId}/companies", handlers.GetCompanies(database))

		// Questions — note: /random must be registered before /{questionId}
		r.Get("/questions", handlers.GetQuestions(database))
		r.Get("/questions/random", handlers.GetRandomQuestion(database))
		r.Get("/questions/{questionId}", handlers.GetQuestion(database))

		// Coding Challenges
		r.Get("/coding/challenges", handlers.GetChallenges(database))
		r.Get("/coding/random", handlers.GetRandomChallenge(database))
		r.Get("/coding/stats", handlers.GetChallengeStats(database))
		r.Get("/coding/challenges/{id}", handlers.GetChallenge(database))

		// Flashcards
		r.Get("/flashcards", handlers.GetFlashcards(database))
		r.Get("/flashcards/{channelId}", handlers.GetFlashcardsByChannel(database))

		// Voice Sessions
		r.Get("/voice-sessions", handlers.GetVoiceSessions(database))

		// Certifications
		r.Get("/certifications", handlers.GetCertifications(database))
		r.Get("/certifications/{id}", handlers.GetCertification(database))

		// Learning Paths
		r.Get("/learning-paths", handlers.GetLearningPaths(database))
		r.Get("/learning-paths/{pathId}", handlers.GetLearningPath(database))
	})

	log.Printf("[go-api] listening on :%s", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("[go-api] server error: %v", err)
	}
}
