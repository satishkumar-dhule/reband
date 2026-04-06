// Turso HTTP API adapter for Cloudflare Workers
// Uses libsql over HTTP instead of file-based SQLite

interface Env {
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  DB?: any; // D1Database - type from @cloudflare/workers-types
}

export interface WorkerDB {
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  run(sql: string, params?: unknown[]): Promise<{ changes: number }>;
}

// D1 adapter
export function createD1Adapter(db: any): WorkerDB {
  return {
    async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
      const stmt = db.prepare(sql);
      if (params && params.length > 0) {
        const bound = stmt.bind(...(params as any[]));
        const result = await bound.all();
        return (result.results || []) as T[];
      }
      const result = await stmt.all();
      return (result.results || []) as T[];
    },
    async run(sql: string, params?: unknown[]): Promise<{ changes: number }> {
      const stmt = db.prepare(sql);
      if (params && params.length > 0) {
        const result = await stmt.bind(...(params as any[])).run();
        return { changes: result.meta?.changes ?? 0 };
      }
      const result = await stmt.run();
      return { changes: result.meta?.changes ?? 0 };
    },
  };
}

// Turso HTTP adapter using fetch
export function createTursoAdapter(env: Env): WorkerDB {
  const baseUrl = env.TURSO_DATABASE_URL;
  const authToken = env.TURSO_AUTH_TOKEN;

  if (!baseUrl || !authToken) {
    return createFallbackAdapter();
  }

  return {
    async query<T>(sql: string, params?: unknown[]): Promise<T[]> {
      const body = {
        statements: [
          {
            sql,
            args: params ? params.map(toTursoArg) : [],
          },
        ],
      };

      const res = await fetch(`${baseUrl}/v2/pipeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Turso query failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const result = data.results?.[0];
      if (result?.type === "ok" && result.response?.type === "rows") {
        const rows = result.response.rows || [];
        const cols = result.response.cols || [];
        return rows.map((row: any[]) => {
          const obj: Record<string, unknown> = {};
          cols.forEach((col: string, i: number) => {
            obj[col] = fromTursoValue(row[i]);
          });
          return obj as T;
        });
      }
      return [];
    },

    async run(sql: string, params?: unknown[]): Promise<{ changes: number }> {
      const body = {
        statements: [
          {
            sql,
            args: params ? params.map(toTursoArg) : [],
          },
        ],
      };

      const res = await fetch(`${baseUrl}/v2/pipeline`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`Turso run failed: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const result = data.results?.[0];
      if (result?.type === "ok") {
        return { changes: result.response?.affected_row_count ?? 0 };
      }
      return { changes: 0 };
    },
  };
}

// Fallback adapter for static-only mode (no DB)
function createFallbackAdapter(): WorkerDB {
  return {
    async query<T>(): Promise<T[]> {
      return [];
    },
    async run(): Promise<{ changes: number }> {
      return { changes: 0 };
    },
  };
}

// Turso argument encoding
function toTursoArg(arg: unknown): { type: string; value: string } {
  if (arg === null || arg === undefined) {
    return { type: "null", value: "" };
  }
  if (typeof arg === "number") {
    return { type: "integer", value: String(arg) };
  }
  if (typeof arg === "boolean") {
    return { type: "integer", value: arg ? "1" : "0" };
  }
  if (typeof arg === "object") {
    return { type: "text", value: JSON.stringify(arg) };
  }
  return { type: "text", value: String(arg) };
}

// Turso value decoding
function fromTursoValue(val: { type: string; value: string } | null): unknown {
  if (!val || val.type === "null") return null;
  switch (val.type) {
    case "integer":
    case "float":
      return Number(val.value);
    case "text":
    case "blob":
      return val.value;
    default:
      return val.value;
  }
}

export function createDB(env: Env): WorkerDB {
  // Use D1 if available
  if (env.DB) {
    return createD1Adapter(env.DB);
  }
  // Fall back to Turso HTTP
  return createTursoAdapter(env);
}
