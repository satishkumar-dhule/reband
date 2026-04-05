package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"sync"

	_ "modernc.org/sqlite"
)

var (
	instance *sql.DB
	once     sync.Once
)

func Open() (*sql.DB, error) {
	var initErr error
	once.Do(func() {
		dbPath := os.Getenv("DATABASE_PATH")
		if dbPath == "" {
			dbPath = filepath.Join("..", "local.db")
		}

		abs, err := filepath.Abs(dbPath)
		if err != nil {
			initErr = fmt.Errorf("resolve db path: %w", err)
			return
		}

		if _, err := os.Stat(abs); os.IsNotExist(err) {
			initErr = fmt.Errorf("database file not found at %s", abs)
			return
		}

		db, err := sql.Open("sqlite", abs+"?_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)&_pragma=foreign_keys(ON)&_pragma=cache_size(-20000)&mode=ro")
		if err != nil {
			initErr = fmt.Errorf("open sqlite: %w", err)
			return
		}

		db.SetMaxOpenConns(10)
		db.SetMaxIdleConns(5)

		if err := db.Ping(); err != nil {
			initErr = fmt.Errorf("ping db: %w", err)
			return
		}

		log.Printf("[db] connected to %s", abs)
		instance = db
	})

	return instance, initErr
}

func Get() *sql.DB {
	if instance == nil {
		panic("db not initialized — call Open() first")
	}
	return instance
}
