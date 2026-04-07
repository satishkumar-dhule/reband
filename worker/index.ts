import { Hono } from "hono";
import { cors } from "hono/cors";
import { compress } from "hono/compress";
import { secureHeaders } from "hono/secure-headers";
import { getCached, sendCachedResponse, invalidateCache } from "./cache";
import { createDB, WorkerDB } from "./db";

type Bindings = {
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
  DB?: any;
  CORS_ORIGINS?: string;
  GO_API_URL?: string;
  LOG_LEVEL?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Middleware
app.use("*", cors());
app.use((c, next) => {
  // Skip compression for health/keep-alive endpoints
  const path = c.req.path;
  if (path === "/api/health" || path === "/api/keep-alive") {
    return next();
  }
  return compress()(c, next);
});
app.use("*", secureHeaders());

// ─── Static JSON fallback helpers ───
// When no DB is configured, serve from pre-built static JSON files.
// The worker fetches these from the Pages asset URL at runtime.

const STATIC_CACHE = new Map<string, { data: unknown; ts: number }>();
const STATIC_CACHE_TTL = 3_600_000; // 1 hour

async function loadStaticJSON(filename: string): Promise<unknown | null> {
  const cached = STATIC_CACHE.get(filename);
  if (cached && Date.now() - cached.ts < STATIC_CACHE_TTL) return cached.data;

  try {
    // In Cloudflare Pages Functions, /data/* is served as static assets
    // We can fetch them via the same origin
    const res = await fetch(`https://devprep-pages.pages.dev/data/${filename}`);
    if (!res.ok) return null;
    const data = await res.json();
    STATIC_CACHE.set(filename, { data, ts: Date.now() });
    return data;
  } catch {
    return null;
  }
}

function hasDB(env: Bindings): boolean {
  return !!(env.DB || (env.TURSO_DATABASE_URL && env.TURSO_AUTH_TOKEN));
}

// Helper: parse JSON fields from DB rows or static JSON objects
function parseQuestion(row: any) {
  let answer = row.answer;
  let options: { id: string; text: string; isCorrect: boolean }[] | undefined = undefined;

  if (answer && typeof answer === "string" && answer.trim().startsWith("[{")) {
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.text !== undefined) {
        const correctOption = parsed.find((opt: any) => opt.isCorrect === true);
        if (correctOption && correctOption.text) {
          options = parsed.map((opt: any, idx: number) => ({
            id: opt.id || String.fromCharCode(65 + idx),
            text: opt.text,
            isCorrect: opt.isCorrect || false,
          }));
          answer = correctOption.text;
        }
      }
    } catch {
      // Not MCQ JSON, keep as-is
    }
  }

  return {
    ...row,
    answer,
    options,
    tags: row.tags ? (typeof row.tags === "string" ? JSON.parse(row.tags) : row.tags) : [],
    companies: row.companies
      ? typeof row.companies === "string"
        ? JSON.parse(row.companies)
        : row.companies
      : [],
  };
}

// ─── Health Check ───
app.get("/api/health", async (c) => {
  const dbMode = hasDB(c.env) ? "database" : "static";
  return c.json({ status: "ok", mode: dbMode, timestamp: new Date().toISOString() });
});

// ─── Keep Alive ───
app.get("/api/keep-alive", (c) => c.json({ alive: true }));

// ─── Channels ───
app.get("/api/channels", async (c) => {
  if (!hasDB(c.env)) {
    const data = await loadStaticJSON("channels.json");
    if (data) return c.json(data);
  }
  const result = await getCached("channels", async () => {
    const db = createDB(c.env);
    return await db.query<any[]>(
      `SELECT cm.channel_id as id,
              cm.channel_id,
              MIN(cm.channel_name) as channel_name,
              MIN(cm.label) as label,
              MIN(cm.description) as description,
              MIN(cm.icon) as icon,
              MIN(cm.color) as color,
              MIN(cm.order_index) as order_index,
              MIN(cm.is_active) as is_active,
              COUNT(DISTINCT q.id) as questionCount
       FROM channel_mappings cm
       LEFT JOIN questions q ON q.id = cm.question_id AND q.is_active = 1
       WHERE cm.is_active = 1
       GROUP BY cm.channel_id
       ORDER BY MIN(cm.order_index) ASC`,
    );
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Search ───
app.get("/api/search", async (c) => {
  const q = c.req.query("q") || "";
  const channel = c.req.query("channel");
  const difficulty = c.req.query("difficulty");

  if (!q) return c.json({ results: [] });

  // Static fallback: search all-questions.json
  if (!hasDB(c.env)) {
    const allQuestions = await loadStaticJSON("all-questions.json");
    if (Array.isArray(allQuestions)) {
      const results = allQuestions
        .filter((item: any) => {
          const matchQ = item.question?.toLowerCase().includes(q.toLowerCase());
          const matchA = item.answer?.toLowerCase().includes(q.toLowerCase());
          const matchCh = !channel || item.channel === channel;
          const matchDiff = !difficulty || item.difficulty === difficulty;
          return (matchQ || matchA) && matchCh && matchDiff;
        })
        .slice(0, 50);
      return c.json(results);
    }
  }

  const result = await getCached(`search:${q}:${channel}:${difficulty}`, async () => {
    const db = createDB(c.env);
    let sql = `
      SELECT DISTINCT q.id, q.question, q.difficulty, q.channel, q.answer,
             q.tags, q.companies, q.relevance_score
      FROM questions q
      WHERE q.is_active = 1
    `;
    const params: any[] = [];
    if (channel) { sql += ` AND q.channel = ?`; params.push(channel); }
    if (difficulty) { sql += ` AND q.difficulty = ?`; params.push(difficulty); }
    sql += ` AND (q.question LIKE ? OR q.answer LIKE ? OR q.tags LIKE ?)`;
    const like = `%${q}%`;
    params.push(like, like, like);
    sql += ` ORDER BY q.relevance_score DESC LIMIT 50`;
    const rows = await db.query(sql, params);
    return rows.map(parseQuestion);
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Questions (query param format) ───
app.get("/api/questions", async (c) => {
  const channel = c.req.query("channel");
  const subChannel = c.req.query("subChannel");
  const difficulty = c.req.query("difficulty");
  if (!channel) return c.json([]);

  // Static fallback
  if (!hasDB(c.env)) {
    const data = await loadStaticJSON(`channel-${channel}.json`);
    if (Array.isArray(data)) {
      let filtered = data;
      if (subChannel) filtered = filtered.filter((q: any) => q.subchannel === subChannel);
      if (difficulty) filtered = filtered.filter((q: any) => q.difficulty === difficulty);
      return c.json(filtered);
    }
  }

  const result = await getCached(`questions:qp:${channel}:${subChannel}:${difficulty}`, async () => {
    const db = createDB(c.env);
    let sql = `SELECT q.* FROM questions q JOIN channel_mappings cm ON q.id = cm.question_id WHERE cm.channel_id = ? AND q.is_active = 1`;
    const params: any[] = [channel];
    if (subChannel) { sql += ` AND q.subchannel = ?`; params.push(subChannel); }
    if (difficulty) { sql += ` AND q.difficulty = ?`; params.push(difficulty); }
    sql += ` ORDER BY q.relevance_score DESC`;
    const rows = await db.query(sql, params);
    return rows.map(parseQuestion);
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Questions by Channel (path param) ───
app.get("/api/questions/:channelId", async (c) => {
  const channelId = c.req.param("channelId");
  const subChannel = c.req.query("subChannel");
  const difficulty = c.req.query("difficulty");

  // Static fallback
  if (!hasDB(c.env)) {
    const data = await loadStaticJSON(`channel-${channelId}.json`);
    if (Array.isArray(data)) {
      let filtered = data;
      if (subChannel) filtered = filtered.filter((q: any) => q.subchannel === subChannel);
      if (difficulty) filtered = filtered.filter((q: any) => q.difficulty === difficulty);
      return c.json(filtered);
    }
  }

  const result = await getCached(`questions:${channelId}:${subChannel}:${difficulty}`, async () => {
    const db = createDB(c.env);
    let sql = `SELECT q.* FROM questions q JOIN channel_mappings cm ON q.id = cm.question_id WHERE cm.channel_id = ? AND q.is_active = 1`;
    const params: any[] = [channelId];
    if (subChannel) { sql += ` AND q.subchannel = ?`; params.push(subChannel); }
    if (difficulty) { sql += ` AND q.difficulty = ?`; params.push(difficulty); }
    sql += ` ORDER BY q.relevance_score DESC`;
    const rows = await db.query(sql, params);
    return rows.map(parseQuestion);
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Random Question ───
app.get("/api/question/random", async (c) => {
  const channel = c.req.query("channel");
  const difficulty = c.req.query("difficulty");

  if (!hasDB(c.env)) {
    const allQ = await loadStaticJSON("all-questions.json");
    if (Array.isArray(allQ)) {
      let pool = allQ as any[];
      if (channel) pool = pool.filter((q: any) => q.channel === channel);
      if (difficulty) pool = pool.filter((q: any) => q.difficulty === difficulty);
      if (pool.length > 0) {
        const random = pool[Math.floor(Math.random() * pool.length)];
        return c.json(random);
      }
    }
    return c.json({ error: "No questions found" }, 404);
  }

  const result = await getCached(`random:${channel}:${difficulty}`, async () => {
    const db = createDB(c.env);
    let sql = `SELECT * FROM questions WHERE is_active = 1`;
    const params: any[] = [];
    if (channel) { sql += ` AND channel = ?`; params.push(channel); }
    if (difficulty) { sql += ` AND difficulty = ?`; params.push(difficulty); }
    sql += ` ORDER BY RANDOM() LIMIT 1`;
    const rows = await db.query(sql, params);
    return rows.length > 0 ? parseQuestion(rows[0]) : null;
  });
  if (!result.data) return c.json({ error: "No questions found" }, 404);
  return sendCachedResponse(c.req.raw, result);
});

// ─── Single Question ───
app.get("/api/question/:questionId", async (c) => {
  const questionId = c.req.param("questionId");

  if (!hasDB(c.env)) {
    const allQ = await loadStaticJSON("all-questions.json");
    if (Array.isArray(allQ)) {
      const found = (allQ as any[]).find((q: any) => q.id === questionId);
      if (found) return c.json(found);
    }
    return c.json({ error: "Question not found" }, 404);
  }

  const result = await getCached(`question:${questionId}`, async () => {
    const db = createDB(c.env);
    const rows = await db.query<any[]>("SELECT * FROM questions WHERE id = ? AND is_active = 1", [questionId]);
    return rows.length > 0 ? parseQuestion(rows[0]) : null;
  });
  if (!result.data) return c.json({ error: "Question not found" }, 404);
  return sendCachedResponse(c.req.raw, result);
});

// ─── Stats ───
app.get("/api/stats", async (c) => {
  if (!hasDB(c.env)) {
    const data = await loadStaticJSON("stats.json");
    if (data) return c.json(data);
  }
  const result = await getCached("stats", async () => {
    const db = createDB(c.env);
    return await db.query<any[]>(
      `SELECT cm.channel_id, cm.label, q.difficulty, COUNT(*) as count
       FROM channel_mappings cm
       JOIN questions q ON q.id = cm.question_id
       WHERE q.is_active = 1 AND cm.is_active = 1
       GROUP BY cm.channel_id, cm.label, q.difficulty`,
    );
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Subchannels ───
app.get("/api/subchannels/:channelId", async (c) => {
  const channelId = c.req.param("channelId");
  const result = await getCached(`subchannels:${channelId}`, async () => {
    const db = createDB(c.env);
    return await db.query<any[]>(
      `SELECT DISTINCT subchannel FROM questions WHERE channel = ? AND subchannel IS NOT NULL AND is_active = 1 ORDER BY subchannel`,
      [channelId],
    );
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Companies ───
app.get("/api/companies/:channelId", async (c) => {
  const channelId = c.req.param("channelId");
  const result = await getCached(`companies:${channelId}`, async () => {
    const db = createDB(c.env);
    const rows = await db.query<any[]>(
      `SELECT companies FROM questions WHERE channel = ? AND companies IS NOT NULL AND is_active = 1`,
      [channelId],
    );
    const companies = new Set<string>();
    rows.forEach((row: any) => {
      if (row.companies) {
        try {
          const arr = typeof row.companies === "string" ? JSON.parse(row.companies) : row.companies;
          if (Array.isArray(arr)) arr.forEach((co: string) => companies.add(co));
        } catch { /* ignore */ }
      }
    });
    return Array.from(companies).sort();
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Flashcards ───
app.get("/api/flashcards/:channelId", async (c) => {
  const channelId = c.req.param("channelId");
  if (!hasDB(c.env)) {
    const data = await loadStaticJSON("flashcards.json");
    if (Array.isArray(data)) {
      const filtered = (data as any[]).filter((f: any) => f.channel_id === channelId);
      return c.json(filtered);
    }
  }
  const result = await getCached(`flashcards:${channelId}`, async () => {
    const db = createDB(c.env);
    return await db.query<any[]>(`SELECT * FROM flashcards WHERE channel_id = ? ORDER BY difficulty ASC`, [channelId]);
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Coding Challenges ───
app.get("/api/coding/challenges", async (c) => {
  const difficulty = c.req.query("difficulty");
  const category = c.req.query("category");

  if (!hasDB(c.env)) {
    const data = await loadStaticJSON("coding-challenges.json");
    if (Array.isArray(data)) {
      let filtered = data as any[];
      if (difficulty) filtered = filtered.filter((ch: any) => ch.difficulty === difficulty);
      if (category) filtered = filtered.filter((ch: any) => ch.category === category);
      return c.json(filtered);
    }
  }

  const result = await getCached(`coding:${difficulty}:${category}`, async () => {
    const db = createDB(c.env);
    let sql = "SELECT * FROM coding_challenges WHERE is_active = 1";
    const params: any[] = [];
    if (difficulty) { sql += " AND difficulty = ?"; params.push(difficulty); }
    if (category) { sql += " AND category = ?"; params.push(category); }
    sql += " ORDER BY difficulty ASC, title ASC";
    return await db.query(sql, params);
  });
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/coding/challenge/:id", async (c) => {
  const id = c.req.param("id");
  const result = await getCached(`coding:${id}`, async () => {
    const db = createDB(c.env);
    const rows = await db.query<any[]>("SELECT * FROM coding_challenges WHERE id = ? AND is_active = 1", [id]);
    return rows.length > 0 ? rows[0] : null;
  });
  if (!result.data) return c.json({ error: "Challenge not found" }, 404);
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/coding/random", async (c) => {
  const difficulty = c.req.query("difficulty");
  const result = await getCached(`coding:random:${difficulty}`, async () => {
    const db = createDB(c.env);
    let sql = "SELECT * FROM coding_challenges WHERE is_active = 1";
    const params: any[] = [];
    if (difficulty) { sql += " AND difficulty = ?"; params.push(difficulty); }
    sql += " ORDER BY RANDOM() LIMIT 1";
    const rows = await db.query(sql, params);
    return rows.length > 0 ? rows[0] : null;
  });
  if (!result.data) return c.json({ error: "No challenges found" }, 404);
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/coding/stats", async (c) => {
  const result = await getCached("coding:stats", async () => {
    const db = createDB(c.env);
    return await db.query<any[]>(
      `SELECT difficulty, COUNT(*) as count FROM coding_challenges WHERE is_active = 1 GROUP BY difficulty`,
    );
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Certifications ───
app.get("/api/certifications", async (c) => {
  const category = c.req.query("category");
  const difficulty = c.req.query("difficulty");
  const provider = c.req.query("provider");
  const status = c.req.query("status");

  if (!hasDB(c.env)) {
    const data = await loadStaticJSON("certifications.json");
    if (Array.isArray(data)) {
      let filtered = data as any[];
      if (category) filtered = filtered.filter((x: any) => x.category === category);
      if (difficulty) filtered = filtered.filter((x: any) => x.difficulty === difficulty);
      if (provider) filtered = filtered.filter((x: any) => x.provider === provider);
      if (status) filtered = filtered.filter((x: any) => x.status === status);
      return c.json(filtered);
    }
  }

  const result = await getCached(`certifications:${category}:${difficulty}:${provider}:${status}`, async () => {
    const db = createDB(c.env);
    let sql = "SELECT * FROM certifications WHERE is_active = 1";
    const params: any[] = [];
    if (category) { sql += " AND category = ?"; params.push(category); }
    if (difficulty) { sql += " AND difficulty = ?"; params.push(difficulty); }
    if (provider) { sql += " AND provider = ?"; params.push(provider); }
    if (status) { sql += " AND status = ?"; params.push(status); }
    sql += " ORDER BY name ASC";
    return await db.query(sql, params);
  });
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/certification/:id", async (c) => {
  const id = c.req.param("id");
  const result = await getCached(`certification:${id}`, async () => {
    const db = createDB(c.env);
    const rows = await db.query<any[]>("SELECT * FROM certifications WHERE id = ? AND is_active = 1", [id]);
    return rows.length > 0 ? rows[0] : null;
  });
  if (!result.data) return c.json({ error: "Certification not found" }, 404);
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/certifications/stats", async (c) => {
  const result = await getCached("certifications:stats", async () => {
    const db = createDB(c.env);
    const byCategory = await db.query<any[]>("SELECT category, COUNT(*) as count FROM certifications WHERE is_active = 1 GROUP BY category");
    const byDifficulty = await db.query<any[]>("SELECT difficulty, COUNT(*) as count FROM certifications WHERE is_active = 1 GROUP BY difficulty");
    return { byCategory, byDifficulty };
  });
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/certification/:id/questions", async (c) => {
  const id = c.req.param("id");
  const domain = c.req.query("domain");
  const difficulty = c.req.query("difficulty");
  const limit = parseInt(c.req.query("limit") || "50", 10);

  const result = await getCached(`cert:${id}:questions:${domain}:${difficulty}:${limit}`, async () => {
    const db = createDB(c.env);
    let sql = `SELECT q.* FROM questions q WHERE q.certification_id = ? AND q.is_active = 1`;
    const params: any[] = [id];
    if (domain) { sql += ` AND q.domain = ?`; params.push(domain); }
    if (difficulty) { sql += ` AND q.difficulty = ?`; params.push(difficulty); }
    sql += ` ORDER BY q.relevance_score DESC LIMIT ${limit}`;
    const rows = await db.query(sql, params);
    return rows.map(parseQuestion);
  });
  return sendCachedResponse(c.req.raw, result);
});

app.post("/api/certification/:id/update-count", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const db = createDB(c.env);
  await db.run("UPDATE certifications SET question_count = ? WHERE id = ?", [body.count || 0, id]);
  return c.json({ success: true });
});

// ─── Learning Paths ───
app.get("/api/learning-paths", async (c) => {
  const pathType = c.req.query("pathType");
  const difficulty = c.req.query("difficulty");
  const company = c.req.query("company");
  const jobTitle = c.req.query("jobTitle");
  const search = c.req.query("search");
  const limit = parseInt(c.req.query("limit") || "100", 10);
  const offset = parseInt(c.req.query("offset") || "0", 10);

  if (!hasDB(c.env)) {
    const data = await loadStaticJSON("learning-paths.json");
    if (Array.isArray(data)) {
      let filtered = data as any[];
      if (pathType) filtered = filtered.filter((p: any) => p.pathType === pathType);
      if (difficulty) filtered = filtered.filter((p: any) => p.difficulty === difficulty);
      if (company) filtered = filtered.filter((p: any) => p.company === company);
      if (jobTitle) filtered = filtered.filter((p: any) => p.jobTitle === jobTitle);
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter((p: any) => p.title?.toLowerCase().includes(s) || p.description?.toLowerCase().includes(s));
      }
      return c.json(filtered.slice(offset, offset + limit));
    }
  }

  const result = await getCached(`paths:${pathType}:${difficulty}:${company}:${jobTitle}:${search}:${limit}:${offset}`, async () => {
    const db = createDB(c.env);
    let sql = "SELECT * FROM learning_paths WHERE is_active = 1";
    const params: any[] = [];
    if (pathType) { sql += " AND path_type = ?"; params.push(pathType); }
    if (difficulty) { sql += " AND difficulty = ?"; params.push(difficulty); }
    if (search) { sql += " AND (title LIKE ? OR description LIKE ?)"; params.push(`%${search}%`, `%${search}%`); }
    sql += " ORDER BY order_index ASC";
    sql += ` LIMIT ${limit} OFFSET ${offset}`;
    return await db.query(sql, params);
  });
  return sendCachedResponse(c.req.raw, result);
});

app.post("/api/learning-paths", async (c) => {
  const body = await c.req.json();
  const db = createDB(c.env);
  const result = await db.run(
    "INSERT INTO learning_paths (title, description, path_type, difficulty, steps, is_active) VALUES (?, ?, ?, ?, ?, 1)",
    [body.title, body.description, body.pathType, body.difficulty, JSON.stringify(body.steps || [])],
  );
  return c.json({ success: true, id: result.changes });
});

app.get("/api/learning-paths/stats", async (c) => {
  const result = await getCached("learning-paths:stats", async () => {
    const db = createDB(c.env);
    const byType = await db.query<any[]>("SELECT path_type, COUNT(*) as count FROM learning_paths WHERE is_active = 1 GROUP BY path_type");
    const byDifficulty = await db.query<any[]>("SELECT difficulty, COUNT(*) as count FROM learning_paths WHERE is_active = 1 GROUP BY difficulty");
    return { byType, byDifficulty };
  });
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/learning-paths/filters/companies", async (c) => {
  const result = await getCached("paths:companies", async () => {
    const db = createDB(c.env);
    const rows = await db.query<any[]>("SELECT DISTINCT company FROM learning_paths WHERE company IS NOT NULL AND is_active = 1 ORDER BY company");
    return rows.map((r: any) => r.company);
  });
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/learning-paths/filters/job-titles", async (c) => {
  const result = await getCached("paths:job-titles", async () => {
    const db = createDB(c.env);
    const rows = await db.query<any[]>("SELECT DISTINCT job_title FROM learning_paths WHERE job_title IS NOT NULL AND is_active = 1 ORDER BY job_title");
    return rows.map((r: any) => r.job_title);
  });
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/learning-paths/:pathId", async (c) => {
  const pathId = c.req.param("pathId");
  const result = await getCached(`learning-path:${pathId}`, async () => {
    const db = createDB(c.env);
    const rows = await db.query<any[]>("SELECT * FROM learning_paths WHERE id = ? AND is_active = 1", [pathId]);
    return rows.length > 0 ? rows[0] : null;
  });
  if (!result.data) return c.json({ error: "Learning path not found" }, 404);
  return sendCachedResponse(c.req.raw, result);
});

app.post("/api/learning-paths/:pathId/start", async (c) => {
  const pathId = c.req.param("pathId");
  const db = createDB(c.env);
  await db.run("UPDATE learning_paths SET popularity = popularity + 1 WHERE id = ?", [pathId]);
  return c.json({ success: true });
});

// ─── User Sessions ───
app.get("/api/user/sessions", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) return c.json({ sessions: [] });
  const result = await getCached(`sessions:${userId}`, async () => {
    const db = createDB(c.env);
    return await db.query<any[]>("SELECT * FROM user_sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50", [userId]);
  });
  return sendCachedResponse(c.req.raw, result);
});

app.post("/api/user/sessions", async (c) => {
  const body = await c.req.json();
  const db = createDB(c.env);
  // Upsert by sessionKey if provided
  if (body.sessionKey) {
    await db.run(
      `INSERT OR REPLACE INTO user_sessions (session_key, user_id, title, status, data, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [body.sessionKey, body.userId, body.title || "New Session", "active", JSON.stringify(body.data || {}), new Date().toISOString(), new Date().toISOString()],
    );
    return c.json({ success: true, sessionKey: body.sessionKey });
  }
  const result = await db.run(
    "INSERT INTO user_sessions (user_id, title, status, data) VALUES (?, ?, ?, ?)",
    [body.userId, body.title || "New Session", "active", JSON.stringify(body.data || {})],
  );
  return c.json({ success: true, id: result.changes });
});

app.get("/api/user/sessions/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const db = createDB(c.env);
  const rows = await db.query<any[]>("SELECT * FROM user_sessions WHERE id = ?", [sessionId]);
  if (rows.length === 0) return c.json({ error: "Session not found" }, 404);
  return c.json(rows[0]);
});

app.put("/api/user/sessions/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const body = await c.req.json();
  const db = createDB(c.env);
  await db.run(
    "UPDATE user_sessions SET data = ?, updated_at = ? WHERE id = ?",
    [JSON.stringify(body.data || {}), new Date().toISOString(), sessionId],
  );
  return c.json({ success: true });
});

app.delete("/api/user/sessions/:sessionId", async (c) => {
  const sessionId = c.req.param("sessionId");
  const db = createDB(c.env);
  await db.run("DELETE FROM user_sessions WHERE id = ?", [sessionId]);
  return c.json({ success: true });
});

app.post("/api/user/sessions/:sessionId/complete", async (c) => {
  const sessionId = c.req.param("sessionId");
  const db = createDB(c.env);
  await db.run(
    "UPDATE user_sessions SET status = 'completed', completed_at = ? WHERE id = ?",
    [new Date().toISOString(), sessionId],
  );
  return c.json({ success: true });
});

// ─── Sync ───
app.post("/api/sync", async (c) => {
  const body = await c.req.json();
  const db = createDB(c.env);
  const results: { action: string; count: number }[] = [];

  if (body.sessions) {
    for (const session of body.sessions) {
      await db.run(
        `INSERT OR REPLACE INTO user_sessions (id, user_id, title, status, data, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [session.id, session.userId, session.title, session.status, JSON.stringify(session.data || {}), session.createdAt || new Date().toISOString(), session.updatedAt || new Date().toISOString()],
      );
    }
    results.push({ action: "sessions", count: body.sessions.length });
  }

  if (body.history) {
    for (const record of body.history) {
      await db.run(
        "INSERT INTO question_history (question_id, action, data, changed_at) VALUES (?, ?, ?, ?)",
        [record.questionId, record.action, JSON.stringify(record.data || {}), record.changedAt || new Date().toISOString()],
      );
    }
    results.push({ action: "history", count: body.history.length });
  }

  return c.json({ success: true, results });
});

// ─── History ───
app.get("/api/history/index", async (c) => {
  const result = await getCached("history:index", async () => {
    const db = createDB(c.env);
    return await db.query<any[]>("SELECT question_id, COUNT(*) as change_count, MAX(changed_at) as last_changed FROM question_history GROUP BY question_id ORDER BY last_changed DESC LIMIT 100");
  });
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/history", async (c) => {
  const limit = parseInt(c.req.query("limit") || "50", 10);
  const type = c.req.query("type");
  const eventType = c.req.query("eventType");
  const source = c.req.query("source");

  const result = await getCached(`history:all:${limit}:${type}:${eventType}:${source}`, async () => {
    const db = createDB(c.env);
    let sql = "SELECT * FROM question_history WHERE 1=1";
    const params: any[] = [];
    if (type) { sql += " AND action = ?"; params.push(type); }
    if (eventType) { sql += " AND event_type = ?"; params.push(eventType); }
    if (source) { sql += " AND source = ?"; params.push(source); }
    sql += ` ORDER BY changed_at DESC LIMIT ${limit}`;
    return await db.query(sql, params);
  });
  return sendCachedResponse(c.req.raw, result);
});

app.post("/api/history", async (c) => {
  const body = await c.req.json();
  const db = createDB(c.env);
  await db.run(
    "INSERT INTO question_history (question_id, action, data) VALUES (?, ?, ?)",
    [body.questionId, body.action, JSON.stringify(body.data || {})],
  );
  return c.json({ success: true });
});

app.get("/api/history/:questionId", async (c) => {
  const questionId = c.req.param("questionId");
  const type = c.req.query("type");
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const result = await getCached(`history:${questionId}:${type}:${limit}`, async () => {
    const db = createDB(c.env);
    let sql = "SELECT * FROM question_history WHERE question_id = ?";
    const params: any[] = [questionId];
    if (type) { sql += " AND action = ?"; params.push(type); }
    sql += ` ORDER BY changed_at DESC LIMIT ${limit}`;
    return await db.query(sql, params);
  });
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/history/:questionId/summary", async (c) => {
  const questionId = c.req.param("questionId");
  const result = await getCached(`history:${questionId}:summary`, async () => {
    const db = createDB(c.env);
    return await db.query<any[]>("SELECT action, COUNT(*) as count FROM question_history WHERE question_id = ? GROUP BY action", [questionId]);
  });
  return sendCachedResponse(c.req.raw, result);
});

app.get("/api/history/:questionId/full", async (c) => {
  const questionId = c.req.param("questionId");
  const result = await getCached(`history:${questionId}:full`, async () => {
    const db = createDB(c.env);
    const summary = await db.query<any[]>("SELECT action, COUNT(*) as count FROM question_history WHERE question_id = ? GROUP BY action", [questionId]);
    const records = await db.query<any[]>("SELECT * FROM question_history WHERE question_id = ? ORDER BY changed_at DESC LIMIT 50", [questionId]);
    return { summary, records };
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Tests ───
app.get("/api/tests", async (c) => {
  const data = await loadStaticJSON("tests.json");
  if (data) return c.json(data);
  return c.json([]);
});

app.get("/api/tests/:channelId", async (c) => {
  const channelId = c.req.param("channelId");
  const data = await loadStaticJSON("tests.json");
  if (Array.isArray(data)) {
    const found = (data as any[]).find((t: any) => t.channel === channelId || t.channelId === channelId);
    if (found) return c.json(found);
  }
  return c.json({ error: "Test not found" }, 404);
});

// ─── Voice Sessions ───
app.get("/api/voice-sessions", async (c) => {
  const channel = c.req.query("channel");
  const result = await getCached(`voice-sessions:${channel}`, async () => {
    const db = createDB(c.env);
    let sql = "SELECT * FROM voice_sessions ORDER BY created_at DESC LIMIT 20";
    if (channel) sql = `SELECT * FROM voice_sessions WHERE channel = '${channel}' ORDER BY created_at DESC LIMIT 20`;
    return await db.query<any[]>(sql);
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Similar Questions ───
app.get("/api/similar-questions/:questionId", async (c) => {
  const questionId = c.req.param("questionId");
  const result = await getCached(`similar:${questionId}`, async () => {
    const db = createDB(c.env);
    return await db.query<any[]>(
      `SELECT q.* FROM questions q JOIN question_relationships qr ON q.id = qr.related_question_id WHERE qr.question_id = ? AND q.is_active = 1 ORDER BY qr.relationship_type ASC LIMIT 6`,
      [questionId],
    );
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Changelog ───
app.get("/api/changelog", async (c) => {
  const data = await loadStaticJSON("changelog.json");
  if (data) return c.json(data);
  return c.json([]);
});

// ─── Bot Activity ───
app.get("/api/bot-activity", async (c) => {
  if (!hasDB(c.env)) return c.json({ stats: {}, recentRuns: [], workQueue: [], ledger: [] });
  const result = await getCached("bot-activity", async () => {
    const db = createDB(c.env);
    const stats = await db.query<any[]>("SELECT type, COUNT(*) as count, MAX(created_at) as last_run FROM bot_runs GROUP BY type");
    const recentRuns = await db.query<any[]>("SELECT * FROM bot_runs ORDER BY created_at DESC LIMIT 20");
    const workQueue = await db.query<any[]>("SELECT * FROM work_queue WHERE status = 'pending' ORDER BY priority ASC LIMIT 50");
    const ledger = await db.query<any[]>("SELECT * FROM bot_ledger ORDER BY created_at DESC LIMIT 50");
    return { stats, recentRuns, workQueue, ledger };
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── GitHub Analytics ───
app.get("/api/github-analytics", async (c) => {
  const data = await loadStaticJSON("github-analytics.json");
  if (data) return c.json(data);
  return c.json({ stars: 0, forks: 0, watchers: 0 });
});

// ─── Intelligence ───
app.get("/api/intelligence", async (c) => c.json({ similar: null, knowledgeGraph: null, insights: null }));

// ─── Interviewer Comments ───
app.get("/api/interviewer-comments", async (c) => {
  const result = await getCached("interviewer-comments", async () => [
    { id: "1", category: "positive", text: "Strong problem-solving approach" },
    { id: "2", category: "positive", text: "Good communication skills" },
    { id: "3", category: "improvement", text: "Could benefit from more practice with edge cases" },
    { id: "4", category: "improvement", text: "Consider discussing trade-offs more explicitly" },
    { id: "5", category: "skip", text: "Let's move to the next topic" },
    { id: "6", category: "shuffle", text: "Let me pick a different question" },
    { id: "7", category: "retry", text: "Try this question again" },
  ]);
  return sendCachedResponse(c.req.raw, result);
});

// ─── Progress ───
app.get("/api/progress/:userId", async (c) => {
  const userId = c.req.param("userId");
  const result = await getCached(`progress:${userId}`, async () => {
    const db = createDB(c.env);
    const sessions = await db.query<any[]>(
      "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed FROM user_sessions WHERE user_id = ? OR session_key LIKE ?",
      [userId, `${userId}:%`],
    );
    return sessions[0] || { total: 0, completed: 0 };
  });
  return sendCachedResponse(c.req.raw, result);
});

// ─── Proxy to Go API ───
app.all("/go-api/*", async (c) => {
  const goApiUrl = c.env.GO_API_URL || "https://devprep-go-api.workers.dev";
  const path = c.req.path.replace("/go-api", "");
  const url = `${goApiUrl}${path}`;
  return fetch(url, {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.method !== "GET" ? await c.req.raw.arrayBuffer() : undefined,
  });
});

// ─── 404 Fallback ───
app.notFound((c) => c.json({ error: "Not found" }, 404));

export default app;
