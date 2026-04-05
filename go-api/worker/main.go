//go:build worker

// Package main is the Cloudflare Workers entry point for the DevPrep Go API.
// Build with: GOOS=js GOARCH=wasm go build -tags worker -o ../dist/app.wasm .
package main

import (
	"devprep-api/db"
	"devprep-api/internal/app"
	"log/slog"
	"os"

	"github.com/syumai/workers"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level: slog.LevelInfo,
	}))
	slog.SetDefault(logger)

	database, err := db.Open()
	if err != nil {
		slog.Error("failed to open database", "error", err)
		// Workers runtime will surface this as a 500 — log and exit.
		os.Exit(1)
	}

	router := app.NewRouter(database)

	slog.Info("Cloudflare Worker starting", "version", app.Version)
	workers.Serve(router)
}
