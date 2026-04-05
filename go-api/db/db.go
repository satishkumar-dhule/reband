// Package db provides the database connection.
// The actual driver and Open() implementation is selected by build tags:
//   - default (no tag): uses modernc.org/sqlite (local file, for development and self-hosted)
//   - worker: uses libsql HTTP driver (Turso) for Cloudflare Workers
package db
