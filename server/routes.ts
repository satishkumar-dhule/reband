import type { Express } from "express";
import { type Server, request as httpRequest } from "http";
import { client } from "./db";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "client", "public", "data");

async function readDataFile(filename: string): Promise<any | null> {
  try {
    const content = await fs.promises.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

const MAX_CACHE_SIZE = 500;
const CACHE_TTL = 3_600_000; // 1 hour in-memory TTL

// LRU cache with ETag support
const channelCache = new Map<string, { data: any; timestamp: number; etag: string }>();

function makeETag(data: any): string {
  const str = JSON.stringify(data);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return `"${(hash >>> 0).toString(36)}"`;
}

interface CacheResult<T> {
  data: T;
  etag: string;
}

async function getCached<T>(key: string, fetchFn: () => Promise<T>): Promise<CacheResult<T>> {
  const cached = channelCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    channelCache.delete(key);
    channelCache.set(key, cached);
    return { data: cached.data as T, etag: cached.etag };
  }
  const data = await fetchFn();
  if (channelCache.size >= MAX_CACHE_SIZE) {
    const firstKey = channelCache.keys().next().value;
    if (firstKey) channelCache.delete(firstKey);
  }
  const etag = makeETag(data);
  channelCache.set(key, { data, timestamp: Date.now(), etag });
  return { data, etag };
}

function invalidateChannelCache(): void {
  channelCache.clear();
}

// Send JSON with ETag + aggressive HTTP caching; sends 304 if client has current version
function sendCached(req: any, res: any, result: CacheResult<any>, maxAgeSeconds = 3600) {
  res.set("ETag", result.etag);
  res.set("Vary", "Accept-Encoding");
  if (req.headers["if-none-match"] === result.etag) {
    res.status(304).end();
    return;
  }
  res.set("Cache-Control", `public, max-age=${maxAgeSeconds}, stale-while-revalidate=86400`);
  res.json(result.data);
}

// Safe JSON.parse wrapper to prevent crashes from malformed data
function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (e) {
    console.warn(`⚠️  Failed to parse JSON: ${e}, using fallback`);
    return fallback;
  }
}


// Helper to parse JSON fields from DB
function parseQuestion(row: any) {
  let answer = row.answer;
  let options: { id: string; text: string; isCorrect: boolean }[] | undefined = undefined;

  // Check if answer contains MCQ JSON format — preserve options, extract correct answer text
  if (answer && typeof answer === 'string' && answer.trim().startsWith('[{')) {
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.text !== undefined) {
        const correctOption = parsed.find((opt: any) => opt.isCorrect === true);
        if (correctOption && correctOption.text) {
          // Preserve options for frontend MCQ rendering
          options = parsed.map((opt: any, idx: number) => ({
            id: opt.id || String.fromCharCode(65 + idx), // A, B, C, D fallback
            text: opt.text,
            isCorrect: opt.isCorrect === true,
          }));
          // Set answer to the correct option text for contexts that don't support MCQ
          answer = correctOption.text;
        }
      }
    } catch (e) {
      console.warn(`⚠️  Question ${row.id} has malformed answer field`);
    }
  }

  return {
    id: row.id,
    question: row.question,
    answer: answer,
    explanation: row.explanation,
    diagram: row.diagram,
    difficulty: row.difficulty,
    tags: safeJsonParse(row.tags, []),
    channel: row.channel,
    subChannel: row.sub_channel,
    sourceUrl: row.source_url,
    videos: safeJsonParse(row.videos, null),
    companies: safeJsonParse(row.companies, null),
    eli5: row.eli5,
    lastUpdated: row.last_updated,
    ...(options ? { options } : {}),
  };
}



export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now(), mode: "browser-storage" });
  });

  // Keep-alive endpoint for preventing Replit sleep
  app.get("/api/keep-alive", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Offline sync endpoint — accepts client-side change records and persists to DB
  app.post("/api/sync", async (req, res) => {
    try {
      const { entity, entityId, action, data } = req.body;
      if (!entity || !entityId || !action) {
        return res.status(400).json({ error: "entity, entityId, and action are required" });
      }

      // Route to the right table based on entity type
      if (entity === "question_history" || entity === "history") {
        const qId = (data?.questionId) ?? entityId;
        await client.execute({
          sql: `INSERT INTO question_history (question_id, event_type, event_source, metadata, created_at)
                VALUES (?, ?, ?, ?, ?)`,
          args: [qId, action, "client-sync", JSON.stringify(data ?? {}), new Date().toISOString()],
        });
      } else if (entity === "progress" || entity === "session") {
        await client.execute({
          sql: `INSERT INTO user_sessions (id, session_type, status, started_at, last_accessed_at)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET status=excluded.status, last_accessed_at=excluded.last_accessed_at`,
          args: [entityId, data?.sessionType ?? "study", action, new Date().toISOString(), new Date().toISOString()],
        });
      }
      // Silently succeed for unknown entity types (client-side only data)
      res.json({ ok: true, entity, entityId, action });
    } catch (error) {
      console.error("Sync error:", error);
      res.status(500).json({ error: "Sync failed" });
    }
  });
  
  // Get all channels with question counts (cached)
  app.get("/api/channels", async (req, res) => {
    try {
      const result = await getCached('channels', async () => {
        const r = await client.execute({
          sql: "SELECT channel, COUNT(*) as count FROM questions WHERE status != 'deleted' GROUP BY channel",
          args: []
        });
        return r.rows.map((row: any) => ({ id: row.channel, questionCount: row.count }));
      });
      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching channels:", error);
      res.status(500).json({ error: "Failed to fetch channels" });
    }
  });

  // Full-text search across questions
  app.get("/api/search", async (req, res) => {
    const { q, limit: limitParam } = req.query;
    if (!q || typeof q !== "string" || q.trim().length < 2) {
      return res.status(400).json({ error: "Query must be at least 2 characters" });
    }
    const limit = Math.min(parseInt(String(limitParam ?? "20"), 10) || 20, 50);
    const term = `%${q.trim().toLowerCase()}%`;
    try {
      const cacheKey = `search-${q.trim().toLowerCase()}-${limit}`;
      const result = await getCached(cacheKey, async () => {
        const sql = `
          SELECT id, question, answer, difficulty, channel, sub_channel, tags, companies, videos, diagram
          FROM questions
          WHERE status != 'deleted'
            AND (
              LOWER(question) LIKE ?
              OR LOWER(answer) LIKE ?
              OR LOWER(tags) LIKE ?
            )
          LIMIT ?
        `;
        const r = await client.execute({ sql, args: [term, term, term, limit] });
        return r.rows.map((row: any) => ({
          id: row.id,
          question: row.question,
          answer: typeof row.answer === "string" ? row.answer.slice(0, 200) : "",
          difficulty: row.difficulty,
          channel: row.channel,
          subChannel: row.sub_channel,
          tags: (() => {
            try { return JSON.parse(row.tags || "[]"); } catch { return []; }
          })(),
          companies: (() => {
            try { return JSON.parse(row.companies || "[]"); } catch { return []; }
          })(),
          hasVideo: !!row.videos && row.videos !== "null" && row.videos !== "{}",
          hasDiagram: typeof row.diagram === "string" && row.diagram.length > 20,
        }));
      });
      res.json({ results: result.data, total: result.data.length });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ error: "Search failed" });
    }
  });

  // Support legacy query-param format: /api/questions?channel=X
  app.get("/api/questions", async (req, res) => {
    const { channel } = req.query;
    if (!channel || typeof channel !== "string") {
      return res.status(400).json({ error: "Missing required query param: channel" });
    }
    try {
      const { subChannel, difficulty } = req.query;
      const cacheKey = `questions-${channel}-${subChannel ?? 'all'}-${difficulty ?? 'all'}`;
      const result = await getCached(cacheKey, async () => {
        let sql = "SELECT id, question, answer, explanation, difficulty, sub_channel, tags, channel, diagram, eli5, videos, companies, source_url FROM questions WHERE channel = ? AND status != 'deleted'";
        const args: any[] = [channel];
        if (subChannel && subChannel !== "all") { sql += " AND sub_channel = ?"; args.push(subChannel); }
        if (difficulty && difficulty !== "all") { sql += " AND difficulty = ?"; args.push(difficulty); }
        sql += " ORDER BY created_at ASC";
        const r = await client.execute({ sql, args });
        return r.rows.map((row: any) => parseQuestion(row));
      });
      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Get questions for a channel (cached)
  app.get("/api/questions/:channelId", async (req, res) => {
    try {
      const { channelId } = req.params;
      const { subChannel, difficulty } = req.query;
      const cacheKey = `questions-${channelId}-${subChannel ?? 'all'}-${difficulty ?? 'all'}`;
      const result = await getCached(cacheKey, async () => {
        let sql = "SELECT id, question, answer, explanation, difficulty, sub_channel, tags, channel, diagram, eli5, videos, companies, source_url FROM questions WHERE channel = ? AND status != 'deleted'";
        const args: any[] = [channelId];
        if (subChannel && subChannel !== "all") { sql += " AND sub_channel = ?"; args.push(subChannel); }
        if (difficulty && difficulty !== "all") { sql += " AND difficulty = ?"; args.push(difficulty); }
        sql += " ORDER BY created_at ASC";
        const r = await client.execute({ sql, args });
        return r.rows.map((row: any) => parseQuestion(row));
      });
      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Get a random question (must be before :questionId to avoid route conflict)
  app.get("/api/question/random", async (req, res) => {
    try {
      const { channel, difficulty } = req.query;
      
      let sql = "SELECT * FROM questions WHERE 1=1";
      const args: any[] = [];

      if (channel && channel !== "all") {
        sql += " AND channel = ?";
        args.push(channel);
      }
      if (difficulty && difficulty !== "all") {
        sql += " AND difficulty = ?";
        args.push(difficulty);
      }

      sql += " ORDER BY RANDOM() LIMIT 1";

      const result = await client.execute({ sql, args });

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No questions found" });
      }

      res.json(parseQuestion(result.rows[0]));
    } catch (error) {
      console.error("Error fetching random question:", error);
      res.status(500).json({ error: "Failed to fetch random question" });
    }
  });

  // Get a single question by ID (cached)
  app.get("/api/question/:questionId", async (req, res) => {
    try {
      const { questionId } = req.params;
      const cacheKey = `question-${questionId}`;
      const result = await getCached(cacheKey, async () => {
        const r = await client.execute({
          sql: "SELECT * FROM questions WHERE id = ? LIMIT 1",
          args: [questionId]
        });
        if (r.rows.length === 0) return null;
        return parseQuestion(r.rows[0]);
      });
      if (result.data === null) {
        return res.status(404).json({ error: "Question not found" });
      }
      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching question:", error);
      res.status(500).json({ error: "Failed to fetch question" });
    }
  });

  // Get channel stats (cached)
  app.get("/api/stats", async (req, res) => {
    try {
      const result = await getCached('stats', async () => {
        const r = await client.execute(
          "SELECT channel, difficulty, COUNT(*) as count FROM questions WHERE status != 'deleted' GROUP BY channel, difficulty"
        );
        const statsMap = new Map<string, { total: number; beginner: number; intermediate: number; advanced: number }>();
        for (const row of r.rows) {
          const channel = row.channel as string;
          const difficulty = row.difficulty as string;
          const count = Number(row.count);
          if (!statsMap.has(channel)) {
            statsMap.set(channel, { total: 0, beginner: 0, intermediate: 0, advanced: 0 });
          }
          const stat = statsMap.get(channel)!;
          stat.total += count;
          if (difficulty === 'beginner') stat.beginner = count;
          if (difficulty === 'intermediate') stat.intermediate = count;
          if (difficulty === 'advanced') stat.advanced = count;
        }
        return Array.from(statsMap.entries()).map(([id, stat]) => ({ id, ...stat }));
      });
      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Get subchannels for a channel (cached)
  app.get("/api/subchannels/:channelId", async (req, res) => {
    try {
      const { channelId } = req.params;
      const result = await getCached(`subchannels-${channelId}`, async () => {
        const r = await client.execute({
          sql: "SELECT DISTINCT sub_channel FROM questions WHERE channel = ? ORDER BY sub_channel",
          args: [channelId]
        });
        return r.rows.map((row: any) => row.sub_channel);
      });
      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching subchannels:", error);
      res.status(500).json({ error: "Failed to fetch subchannels" });
    }
  });

  // Get companies for a channel (cached)
  app.get("/api/companies/:channelId", async (req, res) => {
    try {
      const { channelId } = req.params;
      const result = await getCached(`companies-${channelId}`, async () => {
        const r = await client.execute({
          sql: "SELECT companies FROM questions WHERE channel = ? AND companies IS NOT NULL",
          args: [channelId]
        });
        const companiesSet = new Set<string>();
        for (const row of r.rows) {
          if (row.companies) {
            try {
              const parsed = JSON.parse(row.companies as string);
              parsed.forEach((c: string) => companiesSet.add(c));
            } catch {}
          }
        }
        return Array.from(companiesSet).sort();
      });
      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  // Note: Bot activity is served from static JSON file at /data/bot-activity.json
  // Generated during build by fetch-questions-for-build.js

  // ============================================
  // CODING CHALLENGES API
  // ============================================

  // Helper to parse coding challenge from DB row
  function parseCodingChallenge(row: any) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      difficulty: row.difficulty,
      category: row.category,
      tags: safeJsonParse(row.tags, []),
      companies: safeJsonParse(row.companies, []),
      starterCode: {
        javascript: row.starter_code_js || '',
        python: row.starter_code_py || '',
      },
      testCases: safeJsonParse(row.test_cases, []),
      hints: safeJsonParse(row.hints, []),
      sampleSolution: {
        javascript: row.solution_js || '',
        python: row.solution_py || '',
      },
      complexity: {
        time: row.complexity_time || 'O(n)',
        space: row.complexity_space || 'O(1)',
        explanation: row.complexity_explanation || '',
      },
      timeLimit: row.time_limit || 15,
    };
  }

  // Get all coding challenges (cached)
  app.get("/api/coding/challenges", async (req, res) => {
    try {
      const { difficulty, category } = req.query;
      const cacheKey = `challenges-${difficulty ?? 'all'}-${category ?? 'all'}`;
      
      const result = await getCached(cacheKey, async () => {
        let sql = "SELECT * FROM coding_challenges WHERE 1=1";
        const args: any[] = [];

        if (difficulty && difficulty !== "all") {
          sql += " AND difficulty = ?";
          args.push(difficulty);
        }
        if (category && category !== "all") {
          sql += " AND category = ?";
          args.push(category);
        }

        sql += " ORDER BY created_at DESC";

        const r = await client.execute({ sql, args });
        return r.rows.map(parseCodingChallenge);
      });

      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching coding challenges:", error);
      res.status(500).json({ error: "Failed to fetch coding challenges" });
    }
  });

  // Get a single coding challenge by ID
  app.get("/api/coding/challenge/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await client.execute({
        sql: "SELECT * FROM coding_challenges WHERE id = ? LIMIT 1",
        args: [id]
      });

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Challenge not found" });
      }

      res.json(parseCodingChallenge(result.rows[0]));
    } catch (error) {
      console.error("Error fetching coding challenge:", error);
      res.status(500).json({ error: "Failed to fetch challenge" });
    }
  });

  // Get a random coding challenge
  app.get("/api/coding/random", async (req, res) => {
    try {
      const { difficulty } = req.query;
      
      let sql = "SELECT * FROM coding_challenges WHERE 1=1";
      const args: any[] = [];

      if (difficulty && difficulty !== "all") {
        sql += " AND difficulty = ?";
        args.push(difficulty);
      }

      sql += " ORDER BY RANDOM() LIMIT 1";

      const result = await client.execute({ sql, args });

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No challenges found" });
      }

      res.json(parseCodingChallenge(result.rows[0]));
    } catch (error) {
      console.error("Error fetching random challenge:", error);
      res.status(500).json({ error: "Failed to fetch random challenge" });
    }
  });

  // Get coding challenge stats
  app.get("/api/coding/stats", async (_req, res) => {
    try {
      const result = await client.execute(
        "SELECT difficulty, category, COUNT(*) as count FROM coding_challenges GROUP BY difficulty, category"
      );

      const stats = {
        total: 0,
        byDifficulty: { easy: 0, medium: 0 },
        byCategory: {} as Record<string, number>,
      };

      for (const row of result.rows) {
        const count = Number(row.count);
        stats.total += count;
        
        const diff = row.difficulty as string;
        if (diff === 'easy' || diff === 'medium') {
          stats.byDifficulty[diff] += count;
        }
        
        const cat = row.category as string;
        stats.byCategory[cat] = (stats.byCategory[cat] || 0) + count;
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching coding stats:", error);
      res.status(500).json({ error: "Failed to fetch coding stats" });
    }
  });

  // ============================================
  // QUESTION HISTORY API
  // ============================================

  // Helper to parse history record from DB row
  function parseHistoryRecord(row: any) {
    return {
      id: row.id,
      questionId: row.question_id,
      questionType: row.question_type,
      eventType: row.event_type,
      eventSource: row.event_source,
      sourceName: row.source_name,
      changesSummary: row.changes_summary,
      changedFields: safeJsonParse(row.changed_fields, []),
      beforeSnapshot: safeJsonParse(row.before_snapshot, null),
      afterSnapshot: safeJsonParse(row.after_snapshot, null),
      reason: row.reason,
      metadata: safeJsonParse(row.metadata, null),
      createdAt: row.created_at,
    };
  }

  // Get history index (summary for all questions) - must come before /:questionId
  app.get("/api/history/index", async (_req, res) => {
    try {
      const result = await client.execute(
        `SELECT question_id, question_type, event_type, created_at
         FROM question_history
         ORDER BY created_at DESC`
      );

      const questions: Record<string, any> = {};
      let totalEvents = 0;

      for (const row of result.rows) {
        const qId = row.question_id as string;
        const qType = row.question_type as string;
        const eType = row.event_type as string;
        const createdAt = row.created_at as string;

        totalEvents++;
        if (!questions[qId]) {
          questions[qId] = {
            questionType: qType,
            totalEvents: 0,
            latestEvent: null,
            eventTypes: {},
          };
        }
        questions[qId].totalEvents++;
        questions[qId].eventTypes[eType] = (questions[qId].eventTypes[eType] || 0) + 1;
        if (!questions[qId].latestEvent || createdAt > questions[qId].latestEvent.createdAt) {
          questions[qId].latestEvent = { eventType: eType, createdAt };
        }
      }

      res.json({
        questions,
        totalEvents,
        totalQuestions: Object.keys(questions).length,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error building history index:", error);
      res.status(500).json({ error: "Failed to build history index" });
    }
  });

  // Get full history data for a specific question (combined summary + records)
  app.get("/api/history/:questionId/full", async (req, res) => {
    try {
      const { questionId } = req.params;
      const { type = "question" } = req.query;

      const [recordsResult, typeSummary, latestResult] = await Promise.all([
        client.execute({
          sql: `SELECT * FROM question_history WHERE question_id = ? AND question_type = ? ORDER BY created_at DESC LIMIT 50`,
          args: [questionId, type as string],
        }),
        client.execute({
          sql: `SELECT event_type, COUNT(*) as count FROM question_history WHERE question_id = ? AND question_type = ? GROUP BY event_type`,
          args: [questionId, type as string],
        }),
        client.execute({
          sql: `SELECT * FROM question_history WHERE question_id = ? AND question_type = ? ORDER BY created_at DESC LIMIT 1`,
          args: [questionId, type as string],
        }),
      ]);

      const eventTypes: Record<string, number> = {};
      let totalEvents = 0;
      for (const row of typeSummary.rows) {
        const count = Number(row.count);
        eventTypes[row.event_type as string] = count;
        totalEvents += count;
      }

      const latest = latestResult.rows.length > 0
        ? { eventType: latestResult.rows[0].event_type as string, createdAt: latestResult.rows[0].created_at as string }
        : null;

      res.json({
        questionId,
        questionType: type,
        totalEvents,
        latestEvent: latest,
        eventTypes,
        history: recordsResult.rows.map(parseHistoryRecord),
      });
    } catch (error) {
      console.error("Error fetching full question history:", error);
      res.status(500).json({ error: "Failed to fetch question history" });
    }
  });

  // Get history for a specific question
  app.get("/api/history/:questionId", async (req, res) => {
    try {
      const { questionId } = req.params;
      const { type = 'question', limit = '50' } = req.query;
      
      const result = await client.execute({
        sql: `SELECT * FROM question_history 
              WHERE question_id = ? AND question_type = ? 
              ORDER BY created_at DESC 
              LIMIT ?`,
        args: [questionId, type as string, parseInt(limit as string)]
      });

      res.json(result.rows.map(parseHistoryRecord));
    } catch (error) {
      console.error("Error fetching question history:", error);
      res.status(500).json({ error: "Failed to fetch question history" });
    }
  });

  // Get history summary (count of events) for a question
  app.get("/api/history/:questionId/summary", async (req, res) => {
    try {
      const { questionId } = req.params;
      const { type = 'question' } = req.query;
      
      const result = await client.execute({
        sql: `SELECT event_type, COUNT(*) as count 
              FROM question_history 
              WHERE question_id = ? AND question_type = ?
              GROUP BY event_type`,
        args: [questionId, type as string]
      });

      const summary: Record<string, number> = {};
      let total = 0;
      for (const row of result.rows) {
        const count = Number(row.count);
        summary[row.event_type as string] = count;
        total += count;
      }

      // Get latest event
      const latestResult = await client.execute({
        sql: `SELECT * FROM question_history 
              WHERE question_id = ? AND question_type = ?
              ORDER BY created_at DESC LIMIT 1`,
        args: [questionId, type as string]
      });

      const latest = latestResult.rows.length > 0 
        ? parseHistoryRecord(latestResult.rows[0]) 
        : null;

      res.json({ total, byType: summary, latest });
    } catch (error) {
      console.error("Error fetching history summary:", error);
      res.status(500).json({ error: "Failed to fetch history summary" });
    }
  });

  // Add a history record (for bots and system use)
  app.post("/api/history", async (req, res) => {
    try {
      const {
        questionId,
        questionType = 'question',
        eventType,
        eventSource,
        sourceName,
        changesSummary,
        changedFields,
        beforeSnapshot,
        afterSnapshot,
        reason,
        metadata
      } = req.body;

      if (!questionId || !eventType || !eventSource) {
        return res.status(400).json({ 
          error: "Missing required fields: questionId, eventType, eventSource" 
        });
      }

      const result = await client.execute({
        sql: `INSERT INTO question_history 
              (question_id, question_type, event_type, event_source, source_name, 
               changes_summary, changed_fields, before_snapshot, after_snapshot, 
               reason, metadata, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          questionId,
          questionType,
          eventType,
          eventSource,
          sourceName || null,
          changesSummary || null,
          changedFields ? JSON.stringify(changedFields) : null,
          beforeSnapshot ? JSON.stringify(beforeSnapshot) : null,
          afterSnapshot ? JSON.stringify(afterSnapshot) : null,
          reason || null,
          metadata ? JSON.stringify(metadata) : null,
          new Date().toISOString()
        ]
      });

      res.json({ success: true, id: Number(result.lastInsertRowid) });
    } catch (error) {
      console.error("Error adding history record:", error);
      res.status(500).json({ error: "Failed to add history record" });
    }
  });

  // Get recent history across all questions (for admin/dashboard)
  app.get("/api/history", async (req, res) => {
    try {
      const { limit = '100', type, eventType, source } = req.query;
      
      let sql = "SELECT * FROM question_history WHERE 1=1";
      const args: any[] = [];

      if (type && type !== 'all') {
        sql += " AND question_type = ?";
        args.push(type);
      }
      if (eventType && eventType !== 'all') {
        sql += " AND event_type = ?";
        args.push(eventType);
      }
      if (source && source !== 'all') {
        sql += " AND event_source = ?";
        args.push(source);
      }

      sql += " ORDER BY created_at DESC LIMIT ?";
      args.push(parseInt(limit as string));

      const result = await client.execute({ sql, args });
      res.json(result.rows.map(parseHistoryRecord));
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // ============================================
  // CERTIFICATIONS API
  // ============================================

  // Helper to parse certification from DB row
  function parseCertification(row: any) {
    return {
      id: row.id,
      name: row.name,
      provider: row.provider,
      description: row.description,
      icon: row.icon || 'award',
      color: row.color || 'text-primary',
      difficulty: row.difficulty,
      category: row.category,
      estimatedHours: row.estimated_hours || 40,
      examCode: row.exam_code,
      officialUrl: row.official_url,
      domains: safeJsonParse(row.domains, []),
      channelMappings: safeJsonParse(row.channel_mappings, []),
      tags: safeJsonParse(row.tags, []),
      prerequisites: safeJsonParse(row.prerequisites, []),
      status: row.status || 'active',
      questionCount: row.question_count || 0,
      passingScore: row.passing_score || 70,
      examDuration: row.exam_duration || 90,
      createdAt: row.created_at,
      lastUpdated: row.last_updated,
    };
  }

  // Get all certifications (cached)
  app.get("/api/certifications", async (req, res) => {
    try {
      const { category, difficulty, provider, status = 'active' } = req.query;
      const cacheKey = `certifications-${category ?? 'all'}-${difficulty ?? 'all'}-${provider ?? 'all'}-${status}`;
      
      const result = await getCached(cacheKey, async () => {
        let sql = "SELECT * FROM certifications WHERE status = ?";
        const args: any[] = [status];

        if (category && category !== 'all') {
          sql += " AND category = ?";
          args.push(category);
        }
        if (difficulty && difficulty !== 'all') {
          sql += " AND difficulty = ?";
          args.push(difficulty);
        }
        if (provider && provider !== 'all') {
          sql += " AND provider LIKE ?";
          args.push(`%${provider}%`);
        }

        sql += " ORDER BY name ASC";

        const r = await client.execute({ sql, args });
        return r.rows.map(parseCertification);
      });

      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching certifications:", error);
      res.status(500).json({ error: "Failed to fetch certifications" });
    }
  });

  // Get a single certification by ID
  app.get("/api/certification/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await client.execute({
        sql: "SELECT * FROM certifications WHERE id = ? LIMIT 1",
        args: [id]
      });

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Certification not found" });
      }

      res.json(parseCertification(result.rows[0]));
    } catch (error) {
      console.error("Error fetching certification:", error);
      res.status(500).json({ error: "Failed to fetch certification" });
    }
  });

  // Get certification stats
  app.get("/api/certifications/stats", async (_req, res) => {
    try {
      const result = await client.execute(
        "SELECT category, difficulty, COUNT(*) as count, SUM(question_count) as questions FROM certifications WHERE status = 'active' GROUP BY category, difficulty"
      );

      const stats = {
        total: 0,
        totalQuestions: 0,
        byCategory: {} as Record<string, number>,
        byDifficulty: {} as Record<string, number>,
      };

      for (const row of result.rows) {
        const count = Number(row.count);
        const questions = Number(row.questions) || 0;
        stats.total += count;
        stats.totalQuestions += questions;
        
        const cat = row.category as string;
        stats.byCategory[cat] = (stats.byCategory[cat] || 0) + count;
        
        const diff = row.difficulty as string;
        stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + count;
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching certification stats:", error);
      res.status(500).json({ error: "Failed to fetch certification stats" });
    }
  });

  // Get questions for a certification (by channel)
  app.get("/api/certification/:id/questions", async (req, res) => {
    try {
      const { id } = req.params;
      const { domain, difficulty, limit = '50' } = req.query;
      
      const cacheKey = `cert-questions-${id}-${domain}-${difficulty}-${limit}`;
      
      const result = await getCached(cacheKey, async () => {
        let sql = "SELECT * FROM questions WHERE channel = ? AND status != 'deleted'";
        const args: any[] = [id];

        if (domain && domain !== 'all') {
          sql += " AND sub_channel = ?";
          args.push(domain);
        }
        if (difficulty && difficulty !== 'all') {
          sql += " AND difficulty = ?";
          args.push(difficulty);
        }

        sql += " ORDER BY RANDOM() LIMIT ?";
        args.push(parseInt(limit as string));

        const r = await client.execute({ sql, args });
        return r.rows.map(parseQuestion);
      });

      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching certification questions:", error);
      res.status(500).json({ error: "Failed to fetch certification questions" });
    }
  });

  // Update certification question count (called after generating questions)
  app.post("/api/certification/:id/update-count", async (req, res) => {
    try {
      const { id } = req.params;
      
      const countResult = await client.execute({
        sql: "SELECT COUNT(*) as count FROM questions WHERE channel = ? AND status != 'deleted'",
        args: [id]
      });
      
      const count = countResult.rows[0]?.count || 0;
      
      await client.execute({
        sql: "UPDATE certifications SET question_count = ?, last_updated = ? WHERE id = ?",
        args: [count, new Date().toISOString(), id]
      });

      res.json({ success: true, questionCount: count });
    } catch (error) {
      console.error("Error updating certification count:", error);
      res.status(500).json({ error: "Failed to update count" });
    }
  });

  // ============================================
  // LEARNING PATHS API
  // ============================================

  // Helper to parse learning path from DB row
  function parseLearningPath(row: any) {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      pathType: row.path_type,
      targetCompany: row.target_company,
      targetJobTitle: row.target_job_title,
      difficulty: row.difficulty,
      estimatedHours: row.estimated_hours,
      questionIds: safeJsonParse(row.question_ids, []),
      channels: safeJsonParse(row.channels, []),
      tags: safeJsonParse(row.tags, []),
      prerequisites: safeJsonParse(row.prerequisites, []),
      learningObjectives: safeJsonParse(row.learning_objectives, []),
      milestones: safeJsonParse(row.milestones, []),
      popularity: row.popularity || 0,
      completionRate: row.completion_rate || 0,
      averageRating: row.average_rating || 0,
      metadata: safeJsonParse(row.metadata, {}),
      status: row.status,
      createdAt: row.created_at,
      lastUpdated: row.last_updated,
      lastGenerated: row.last_generated,
    };
  }

  // Get all learning paths with filters (cached)
  app.get("/api/learning-paths", async (req, res) => {
    try {
      const { 
        pathType, 
        difficulty, 
        company, 
        jobTitle, 
        search,
        limit = '50',
        offset = '0'
      } = req.query;
      
      const cacheKey = `learning-paths-${pathType}-${difficulty}-${company}-${jobTitle}-${search}-${limit}-${offset}`;
      
      const data = await getCached(cacheKey, async () => {
        let sql = "SELECT * FROM learning_paths WHERE status = 'active'";
        const args: any[] = [];

        if (pathType && pathType !== 'all') {
          sql += " AND path_type = ?";
          args.push(pathType);
        }
        if (difficulty && difficulty !== 'all') {
          sql += " AND difficulty = ?";
          args.push(difficulty);
        }
        if (company) {
          sql += " AND target_company = ?";
          args.push(company);
        }
        if (jobTitle) {
          sql += " AND target_job_title = ?";
          args.push(jobTitle);
        }
        if (search) {
          sql += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)";
          const searchPattern = `%${search}%`;
          args.push(searchPattern, searchPattern, searchPattern);
        }

        sql += " ORDER BY popularity DESC, created_at DESC LIMIT ? OFFSET ?";
        args.push(parseInt(limit as string), parseInt(offset as string));

        const result = await client.execute({ sql, args });
        return result.rows.map(parseLearningPath);
      });

      res.json(data);
    } catch (error) {
      console.error("Error fetching learning paths:", error);
      res.status(500).json({ error: "Failed to fetch learning paths" });
    }
  });

  // ── Static sub-routes MUST come before /:pathId to avoid shadowing ──

  // Get learning path stats
  app.get("/api/learning-paths/stats", async (_req, res) => {
    try {
      const result = await client.execute(
        "SELECT path_type, difficulty, COUNT(*) as count FROM learning_paths WHERE status = 'active' GROUP BY path_type, difficulty"
      );
      const stats = { total: 0, byType: {} as Record<string, number>, byDifficulty: {} as Record<string, number> };
      for (const row of result.rows) {
        const count = Number(row.count);
        stats.total += count;
        const type = row.path_type as string;
        stats.byType[type] = (stats.byType[type] || 0) + count;
        const diff = row.difficulty as string;
        stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + count;
      }
      res.json(stats);
    } catch (error) {
      console.error("Error fetching learning path stats:", error);
      res.status(500).json({ error: "Failed to fetch learning path stats" });
    }
  });

  // Get available companies (for filtering)
  app.get("/api/learning-paths/filters/companies", async (_req, res) => {
    try {
      const result = await client.execute(
        "SELECT DISTINCT target_company FROM learning_paths WHERE target_company IS NOT NULL AND status = 'active' ORDER BY target_company"
      );
      res.json(result.rows.map(r => r.target_company));
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  // Get available job titles (for filtering)
  app.get("/api/learning-paths/filters/job-titles", async (_req, res) => {
    try {
      const result = await client.execute(
        "SELECT DISTINCT target_job_title FROM learning_paths WHERE target_job_title IS NOT NULL AND status = 'active' ORDER BY target_job_title"
      );
      res.json(result.rows.map(r => r.target_job_title));
    } catch (error) {
      console.error("Error fetching job titles:", error);
      res.status(500).json({ error: "Failed to fetch job titles" });
    }
  });

  // Create a custom learning path
  app.post("/api/learning-paths", async (req, res) => {
    try {
      const { title, description, channels, difficulty, estimatedHours, pathType } = req.body;
      if (!title || !channels || !Array.isArray(channels)) {
        return res.status(400).json({ error: "title and channels are required" });
      }
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO learning_paths (id, title, description, path_type, difficulty, estimated_hours, channels, question_ids, tags, prerequisites, learning_objectives, milestones, metadata, status, created_at, last_updated)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        args: [
          id,
          title,
          description ?? "",
          pathType ?? "skill",
          difficulty ?? "intermediate",
          estimatedHours ?? 40,
          JSON.stringify(channels),
          JSON.stringify([]),
          JSON.stringify(channels),
          JSON.stringify([]),
          JSON.stringify([]),
          JSON.stringify([]),
          JSON.stringify({}),
          now,
          now,
        ],
      });
      const result = await client.execute({ sql: "SELECT * FROM learning_paths WHERE id = ? LIMIT 1", args: [id] });
      res.status(201).json(parseLearningPath(result.rows[0]));
    } catch (error) {
      console.error("Error creating learning path:", error);
      res.status(500).json({ error: "Failed to create learning path" });
    }
  });

  // Get a single learning path by ID (must come after static sub-routes)
  app.get("/api/learning-paths/:pathId", async (req, res) => {
    try {
      const { pathId } = req.params;
      const result = await client.execute({
        sql: "SELECT * FROM learning_paths WHERE id = ? LIMIT 1",
        args: [pathId]
      });
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Learning path not found" });
      }
      res.json(parseLearningPath(result.rows[0]));
    } catch (error) {
      console.error("Error fetching learning path:", error);
      res.status(500).json({ error: "Failed to fetch learning path" });
    }
  });

  // Increment popularity when user starts a path
  app.post("/api/learning-paths/:pathId/start", async (req, res) => {
    try {
      const { pathId } = req.params;
      
      await client.execute({
        sql: "UPDATE learning_paths SET popularity = popularity + 1 WHERE id = ?",
        args: [pathId]
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating path popularity:", error);
      res.status(500).json({ error: "Failed to update popularity" });
    }
  });

  // ============================================
  // USER SESSION ENDPOINTS (for resume feature)
  // ============================================

  // Get all active sessions for a user
  app.get("/api/user/sessions", async (_req, res) => {
    try {
      const result = await client.execute(
        "SELECT * FROM user_sessions WHERE status = 'active' ORDER BY last_accessed_at DESC"
      );
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching user sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  // Get a specific session
  app.get("/api/user/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const result = await client.execute({
        sql: "SELECT * FROM user_sessions WHERE id = ?",
        args: [sessionId]
      });
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Session not found" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Create or update a session
  app.post("/api/user/sessions", async (req, res) => {
    try {
      const {
        sessionKey,
        sessionType,
        title,
        subtitle,
        channelId,
        certificationId,
        progress = 0,
        totalItems = 0,
        completedItems = 0,
        sessionData = {}
      } = req.body;

      if (!sessionKey || !sessionType || !title) {
        return res.status(400).json({ error: "sessionKey, sessionType, and title are required" });
      }

      // Check if session already exists
      const existing = await client.execute({
        sql: "SELECT id FROM user_sessions WHERE session_key = ? AND status = 'active'",
        args: [sessionKey]
      });

      if (existing.rows.length > 0) {
        // Update existing session
        const sessionId = existing.rows[0].id;
        await client.execute({
          sql: `UPDATE user_sessions 
                SET title = ?, subtitle = ?, progress = ?, completed_items = ?, 
                    session_data = ?, last_accessed_at = ?
                WHERE id = ?`,
          args: [
            title,
            subtitle || null,
            progress,
            completedItems,
            JSON.stringify(sessionData),
            new Date().toISOString(),
            sessionId
          ]
        });
        res.json({ id: sessionId, updated: true });
      } else {
        // Create new session
        const sessionId = crypto.randomUUID();
        await client.execute({
          sql: `INSERT INTO user_sessions 
                (id, session_key, session_type, title, subtitle, channel_id, certification_id, 
                 progress, total_items, completed_items, session_data, started_at, last_accessed_at, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            sessionId,
            sessionKey,
            sessionType,
            title,
            subtitle || null,
            channelId || null,
            certificationId || null,
            progress,
            totalItems,
            completedItems,
            JSON.stringify(sessionData),
            new Date().toISOString(),
            new Date().toISOString(),
            'active'
          ]
        });
        res.json({ id: sessionId, created: true });
      }
    } catch (error) {
      console.error("Error saving session:", error);
      res.status(500).json({ error: "Failed to save session" });
    }
  });

  // Update session progress
  app.put("/api/user/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { progress, completedItems, sessionData } = req.body;

      await client.execute({
        sql: `UPDATE user_sessions 
              SET progress = ?, completed_items = ?, session_data = ?, last_accessed_at = ?
              WHERE id = ?`,
        args: [
          progress,
          completedItems,
          JSON.stringify(sessionData),
          new Date().toISOString(),
          sessionId
        ]
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Delete/abandon a session
  app.delete("/api/user/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      await client.execute({
        sql: "UPDATE user_sessions SET status = 'abandoned' WHERE id = ?",
        args: [sessionId]
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  // Complete a session
  app.post("/api/user/sessions/:sessionId/complete", async (req, res) => {
    try {
      const { sessionId } = req.params;
      
      await client.execute({
        sql: "UPDATE user_sessions SET status = 'completed', completed_at = ? WHERE id = ?",
        args: [new Date().toISOString(), sessionId]
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error completing session:", error);
      res.status(500).json({ error: "Failed to complete session" });
    }
  });

  // ============================================
  // TESTS API (knowledge tests)
  // ============================================

  app.get("/api/tests", async (_req, res) => {
    try {
      const data = await readDataFile("tests.json");
      res.json(data || []);
    } catch (error) {
      console.error("Error fetching tests:", error);
      res.status(500).json({ error: "Failed to fetch tests" });
    }
  });

  app.get("/api/tests/:channelId", async (req, res) => {
    try {
      const { channelId } = req.params;
      const data = await readDataFile("tests.json");
      const tests: any[] = Array.isArray(data) ? data : [];
      const test = tests.find((t: any) => t.channelId === channelId) || null;
      if (!test) return res.status(404).json({ error: "Test not found" });
      res.json(test);
    } catch (error) {
      console.error("Error fetching test for channel:", error);
      res.status(500).json({ error: "Failed to fetch test" });
    }
  });

  // ============================================
  // FLASHCARDS API
  // ============================================

  app.get("/api/flashcards/:channelId", async (req, res) => {
    try {
      const { channelId } = req.params;
      const cacheKey = `flashcards-${channelId}`;
      
      const result = await getCached(cacheKey, async () => {
        const r = await client.execute({
          sql: "SELECT * FROM flashcards WHERE channel = ? AND status = 'active' ORDER BY created_at ASC",
          args: [channelId],
        });
        return r.rows.map((row: any) => ({
          id: row.id,
          channel: row.channel,
          front: row.front,
          back: row.back,
          hint: row.hint,
          codeExample: row.code_example,
          mnemonic: row.mnemonic,
          difficulty: row.difficulty,
          tags: safeJsonParse(row.tags, []),
          category: row.category,
        }));
      });

      sendCached(req, res, result);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      res.status(500).json({ error: "Failed to fetch flashcards" });
    }
  });

  // ============================================
  // VOICE SESSIONS API
  // ============================================

  app.get("/api/voice-sessions", async (req, res) => {
    try {
      const { channel } = req.query;
      let sql = "SELECT * FROM voice_sessions";
      const args: any[] = [];
      if (channel) {
        sql += " WHERE channel = ?";
        args.push(channel);
      }
      sql += " ORDER BY created_at DESC";
      const result = await client.execute({ sql, args });
      const sessions = result.rows.map((row: any) => ({
        id: row.id,
        topic: row.topic,
        description: row.description,
        channel: row.channel,
        difficulty: row.difficulty,
        questionIds: safeJsonParse(row.question_ids, []),
        totalQuestions: row.total_questions,
        estimatedMinutes: row.estimated_minutes,
      }));
      res.json({ sessions });
    } catch (error) {
      console.error("Error fetching voice sessions:", error);
      res.status(500).json({ error: "Failed to fetch voice sessions" });
    }
  });

  // ============================================
  // SIMILAR QUESTIONS API
  // ============================================

  app.get("/api/similar-questions/:questionId", async (req, res) => {
    try {
      const { questionId } = req.params;
      const result = await client.execute({
        sql: `SELECT qr.target_question_id as id, qr.strength as similarity, q.question, q.channel
              FROM question_relationships qr
              JOIN questions q ON qr.target_question_id = q.id
              WHERE qr.source_question_id = ?
              ORDER BY qr.strength DESC
              LIMIT 6`,
        args: [questionId],
      });
      const similar = result.rows.map((row: any) => ({
        id: row.id,
        question: row.question,
        channel: row.channel,
        similarity: (row.similarity || 50) / 100,
      }));
      res.json(similar);
    } catch (error) {
      console.error("Error fetching similar questions:", error);
      res.status(500).json({ error: "Failed to fetch similar questions" });
    }
  });

  // ============================================
  // CHANGELOG API
  // ============================================

  app.get("/api/changelog", async (_req, res) => {
    try {
      const data = await readDataFile("changelog.json");
      res.json(data || { entries: [], stats: { totalQuestionsAdded: 0, totalQuestionsImproved: 0, lastUpdated: new Date().toISOString() } });
    } catch (error) {
      console.error("Error fetching changelog:", error);
      res.status(500).json({ error: "Failed to fetch changelog" });
    }
  });

  // ============================================
  // BOT ACTIVITY API
  // ============================================

  app.get("/api/bot-activity", async (_req, res) => {
    try {
      const [statsResult, runsResult, queueResult, ledgerResult] = await Promise.all([
        client.execute(
          `SELECT bot_name, COUNT(*) as total_runs,
           SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as successful_runs,
           MAX(started_at) as last_run
           FROM bot_runs GROUP BY bot_name`
        ),
        client.execute("SELECT * FROM bot_runs ORDER BY started_at DESC LIMIT 20"),
        client.execute("SELECT * FROM work_queue ORDER BY created_at DESC LIMIT 50"),
        client.execute("SELECT * FROM bot_ledger ORDER BY created_at DESC LIMIT 100"),
      ]);

      const stats = statsResult.rows.map((row: any) => ({
        botName: row.bot_name,
        totalRuns: Number(row.total_runs),
        successfulRuns: Number(row.successful_runs),
        totalCreated: 0,
        totalUpdated: 0,
        totalDeleted: 0,
        lastRun: row.last_run,
      }));

      const runs = runsResult.rows.map((row: any) => ({
        id: row.id,
        botName: row.bot_name,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        status: row.status,
      }));

      const queue = queueResult.rows.map((row: any) => ({
        id: row.id,
        itemType: row.item_type,
        itemId: row.item_id,
        action: row.action,
        priority: row.priority,
        status: row.status,
        reason: row.reason,
        createdBy: row.created_by,
        assignedTo: row.assigned_to,
        createdAt: row.created_at,
      }));

      const ledger = ledgerResult.rows.map((row: any) => ({
        id: row.id,
        botName: row.bot_name,
        action: row.action,
        itemType: row.item_type,
        itemId: row.item_id,
        reason: row.reason,
        createdAt: row.created_at,
      }));

      res.json({ stats, runs, queue, ledger });
    } catch (error) {
      console.error("Error fetching bot activity:", error);
      res.status(500).json({ error: "Failed to fetch bot activity" });
    }
  });

  // ============================================
  // GITHUB ANALYTICS API
  // ============================================

  app.get("/api/github-analytics", async (_req, res) => {
    try {
      const data = await readDataFile("github-analytics.json");
      res.json(data || {});
    } catch (error) {
      console.error("Error fetching github analytics:", error);
      res.status(500).json({ error: "Failed to fetch github analytics" });
    }
  });

  // ============================================
  // INTELLIGENCE API (AI-generated insights)
  // ============================================

  app.get("/api/intelligence", async (_req, res) => {
    res.json({
      cognitiveMap: null,
      companyWeights: null,
      companyProfiles: null,
      knowledgeDNA: null,
      mockInterviews: null,
    });
  });

  // ============================================
  // INTERVIEWER COMMENTS API
  // ============================================

  app.get("/api/interviewer-comments", async (_req, res) => {
    res.json({
      skip: ["Okay, let's move on.", "Skipping this one.", "No worries, next question."],
      shuffle: ["Let's mix things up!", "Different order now.", "Shuffling questions."],
      quick_answer: ["Great, quick and to the point!", "Good concise answer.", "Well done, nice and brief."],
      long_pause: ["Take your time.", "No rush, think it through.", "It's okay to take a moment."],
      retry: ["Let's try that again.", "Give it another shot.", "No problem, retry when ready."],
      good_score: ["Excellent work!", "Great performance!", "You're doing really well!"],
      bad_score: ["Keep practicing, you'll get there.", "Don't worry, it takes time.", "Room to improve, keep going."],
      first_question: ["Welcome! Let's get started.", "Ready for your first question?", "Let's begin!"],
      last_question: ["Last question, you've got this!", "Final question coming up!", "Almost done, great job so far!"],
      idle: ["Still there?", "Take your time.", "Whenever you're ready."],
    });
  });

  // ============================================
  // USER PROGRESS API (missing route)
  // ============================================

  // Get user progress across all channels
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      // For now, return empty array since we don't have a progress table
      // This can be extended to store actual progress in IndexedDB
      const result = await client.execute({
        sql: "SELECT * FROM user_sessions WHERE session_key LIKE ? AND status = 'active'",
        args: [`${userId}-%`]
      });

      const progress = result.rows.map((row: any) => ({
        channelId: row.channel_id,
        completedQuestions: safeJsonParse(row.completed_items, []),
        markedQuestions: [],
        lastVisitedIndex: 0,
      }));

      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ error: "Failed to fetch progress" });
    }
  });

  // --- Go API Proxy ---
  // Forwards /go-api/* → http://localhost:3001/* so the React frontend
  // can reach the Go service from the same origin without CORS issues.
  app.all("/go-api/*", (req, res) => {
    const targetPath = req.url.replace(/^\/go-api/, "") || "/";
    const proxyReq = httpRequest(
      { hostname: "localhost", port: 3001, path: targetPath, method: req.method,
        headers: { ...req.headers, host: "localhost:3001" } },
      (proxyRes) => {
        res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
      }
    );
    proxyReq.on("error", (e) => {
      if (!res.headersSent) res.status(502).json({ error: "Go API unavailable", detail: e.message });
    });
    req.pipe(proxyReq, { end: true });
  });

  return httpServer;
}
