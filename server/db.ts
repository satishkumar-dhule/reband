import "dotenv/config";
import { createClient } from "@libsql/client";

const url = "file:local.db";

export const client = createClient({
  url,
});

export const db = client;

/**
 * Apply SQLite performance PRAGMAs for maximum read throughput.
 * Must be called once at startup before any queries run.
 *
 * WAL mode:        Concurrent readers + writer; no reader blocks writer
 * synchronous=NORMAL: Safe durability without fsync on every write (~3x faster writes)
 * cache_size=-65536: 64 MB page cache kept in RAM (eliminates most disk I/O)
 * mmap_size=268435456: 256 MB memory-mapped I/O (OS-managed, zero-copy reads)
 * temp_store=MEMORY: Temp tables and indices in RAM (faster GROUP BY / ORDER BY)
 * journal_size_limit: Cap WAL file at 64 MB to prevent unbounded growth
 * busy_timeout=5000: Wait up to 5 s instead of failing immediately on lock
 */
export async function applyPerformancePragmas(): Promise<void> {
  const pragmas = [
    "PRAGMA journal_mode = WAL",
    "PRAGMA synchronous = NORMAL",
    "PRAGMA cache_size = -65536",
    "PRAGMA mmap_size = 268435456",
    "PRAGMA temp_store = MEMORY",
    "PRAGMA journal_size_limit = 67108864",
    "PRAGMA busy_timeout = 5000",
    "PRAGMA wal_autocheckpoint = 1000",
  ];

  for (const pragma of pragmas) {
    await client.execute(pragma);
  }

  console.log("[db] SQLite performance PRAGMAs applied (WAL, 64MB cache, 256MB mmap)");
}
