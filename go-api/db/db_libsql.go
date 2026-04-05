//go:build worker

package db

import (
	"database/sql"
	"fmt"
	"log/slog"
	"os"

	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

// Open connects to a remote Turso/libSQL database.
// Required env vars:
//   - LIBSQL_URL: the libsql:// or https:// URL (e.g. libsql://mydb-org.turso.io)
//   - LIBSQL_AUTH_TOKEN: the auth token issued by Turso
func Open() (*sql.DB, error) {
	url := os.Getenv("LIBSQL_URL")
	if url == "" {
		return nil, fmt.Errorf("LIBSQL_URL env var is required for the Cloudflare Worker build")
	}
	token := os.Getenv("LIBSQL_AUTH_TOKEN")
	if token == "" {
		return nil, fmt.Errorf("LIBSQL_AUTH_TOKEN env var is required for the Cloudflare Worker build")
	}

	// The libsql driver accepts the token as a URL query param or via a connector.
	// Append it as authToken query param.
	dsn := url + "?authToken=" + token

	db, err := sql.Open("libsql", dsn)
	if err != nil {
		return nil, fmt.Errorf("open libsql: %w", err)
	}

	// Remote libSQL is stateless — keep connections minimal.
	db.SetMaxOpenConns(5)
	db.SetMaxIdleConns(2)

	if err := db.Ping(); err != nil {
		db.Close()
		return nil, fmt.Errorf("ping libsql: %w", err)
	}

	slog.Info("database connected", "url", url, "driver", "libsql")
	return db, nil
}
