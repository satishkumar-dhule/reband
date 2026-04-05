//go:build !worker

package db

import (
	"database/sql"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"

	_ "modernc.org/sqlite"
)

// Open opens a local SQLite database.
// DATABASE_PATH env var overrides the default path (../local.db relative to the binary).
func Open() (*sql.DB, error) {
	dbPath := os.Getenv("DATABASE_PATH")
	if dbPath == "" {
		dbPath = filepath.Join("..", "local.db")
	}

	abs, err := filepath.Abs(dbPath)
	if err != nil {
		return nil, fmt.Errorf("resolve db path %q: %w", dbPath, err)
	}

	if _, err := os.Stat(abs); os.IsNotExist(err) {
		return nil, fmt.Errorf("database file not found at %s — set DATABASE_PATH env var", abs)
	}

	dsn := abs + "?_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)&_pragma=foreign_keys(ON)&_pragma=cache_size(-20000)&mode=ro"
	db, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("open sqlite: %w", err)
	}

	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(5)

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping sqlite: %w", err)
	}

	slog.Info("database connected", "path", abs, "driver", "sqlite")
	return db, nil
}
