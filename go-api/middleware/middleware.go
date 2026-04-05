package middleware

import (
	"log"
	"net/http"
	"sync"
	"time"
)

// ─── CORS ────────────────────────────────────────────────────────────────────

func CORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-Request-ID")
		w.Header().Set("Access-Control-Max-Age", "86400")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// ─── Logger ──────────────────────────────────────────────────────────────────

type statusWriter struct {
	http.ResponseWriter
	status int
}

func (sw *statusWriter) WriteHeader(code int) {
	sw.status = code
	sw.ResponseWriter.WriteHeader(code)
}

func Logger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}
		next.ServeHTTP(sw, r)
		log.Printf("[go-api] %s %s %d %s", r.Method, r.URL.Path, sw.status, time.Since(start))
	})
}

// ─── Read Cache Headers ───────────────────────────────────────────────────────

func SetReadCache(w http.ResponseWriter, maxAge, staleWhileRevalidate int) {
	w.Header().Set("Cache-Control", "public, max-age="+itoa(maxAge)+", stale-while-revalidate="+itoa(staleWhileRevalidate))
	w.Header().Set("Vary", "Accept-Encoding")
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	buf := make([]byte, 0, 10)
	for n > 0 {
		buf = append([]byte{byte('0' + n%10)}, buf...)
		n /= 10
	}
	return string(buf)
}

// ─── In-Memory LRU Cache ─────────────────────────────────────────────────────

const (
	defaultTTL     = 60 * time.Second
	maxCacheSize   = 200
)

type cacheEntry struct {
	data      any
	expiresAt time.Time
}

type Cache struct {
	mu      sync.Mutex
	entries map[string]*cacheEntry
	keys    []string
}

var Global = &Cache{
	entries: make(map[string]*cacheEntry),
}

func (c *Cache) Get(key string) (any, bool) {
	c.mu.Lock()
	defer c.mu.Unlock()
	e, ok := c.entries[key]
	if !ok || time.Now().After(e.expiresAt) {
		return nil, false
	}
	return e.data, true
}

func (c *Cache) Set(key string, val any, ttl time.Duration) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if len(c.keys) >= maxCacheSize {
		oldest := c.keys[0]
		c.keys = c.keys[1:]
		delete(c.entries, oldest)
	}

	if _, exists := c.entries[key]; !exists {
		c.keys = append(c.keys, key)
	}

	c.entries[key] = &cacheEntry{
		data:      val,
		expiresAt: time.Now().Add(ttl),
	}
}

func (c *Cache) Invalidate(prefix string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	newKeys := c.keys[:0]
	for _, k := range c.keys {
		if len(k) >= len(prefix) && k[:len(prefix)] == prefix {
			delete(c.entries, k)
		} else {
			newKeys = append(newKeys, k)
		}
	}
	c.keys = newKeys
}
