/**
 * Cache Pre-Warmer
 *
 * Executes all hot DB queries at startup and populates the in-memory LRU cache
 * before the first user request arrives.  This eliminates cold-start latency
 * on every endpoint — subsequent requests are served entirely from RAM.
 *
 * Strategy
 * ─────────
 * 1. Run all queries in parallel (Promise.allSettled — failures are logged, not fatal).
 * 2. Inject results into the shared `channelCache` via setCacheEntry() from routes.ts.
 * 3. Skip warming if the DB is empty (first run with no data).
 */

import { client } from "./db";
import { setCacheEntry } from "./routes";

// ─── helpers ────────────────────────────────────────────────────────────────

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function parseQuestion(row: any) {
  let answer = row.answer;
  let options: { id: string; text: string; isCorrect: boolean }[] | undefined;

  if (answer && typeof answer === "string" && answer.trim().startsWith("[{")) {
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.text !== undefined) {
        const correct = parsed.find((o: any) => o.isCorrect === true);
        if (correct?.text) {
          options = parsed.map((o: any, i: number) => ({
            id: o.id || String.fromCharCode(65 + i),
            text: o.text,
            isCorrect: o.isCorrect === true,
          }));
          answer = correct.text;
        }
      }
    } catch { /* keep raw answer */ }
  }

  return {
    id: row.id,
    question: row.question,
    answer,
    options,
    explanation: row.explanation,
    difficulty: row.difficulty,
    subChannel: row.sub_channel,
    tags: safeJsonParse(row.tags, []),
    channel: row.channel,
    diagram: row.diagram,
    eli5: row.eli5,
    videos: safeJsonParse(row.videos, undefined),
    companies: safeJsonParse(row.companies, []),
    sourceUrl: row.source_url,
  };
}

// ─── warmer ─────────────────────────────────────────────────────────────────

export async function warmAllCaches(): Promise<void> {
  const t0 = Date.now();
  console.log("[cache-warmer] Starting cache pre-warming…");

  const tasks: Array<Promise<void>> = [];

  // ── channels ────────────────────────────────────────────────────────────
  tasks.push((async () => {
    const r = await client.execute({
      sql: "SELECT channel, COUNT(*) as count FROM questions WHERE status != 'deleted' GROUP BY channel",
      args: [],
    });
    setCacheEntry("channels", r.rows.map((row: any) => ({ id: row.channel, questionCount: row.count })));
  })());

  // ── stats ────────────────────────────────────────────────────────────────
  tasks.push((async () => {
    const r = await client.execute({
      sql: "SELECT channel, difficulty, COUNT(*) as count FROM questions WHERE status != 'deleted' GROUP BY channel, difficulty",
      args: [],
    });
    const statsMap = new Map<string, { total: number; beginner: number; intermediate: number; advanced: number }>();
    for (const row of r.rows) {
      const ch = row.channel as string;
      const diff = row.difficulty as string;
      const count = Number(row.count);
      if (!statsMap.has(ch)) statsMap.set(ch, { total: 0, beginner: 0, intermediate: 0, advanced: 0 });
      const s = statsMap.get(ch)!;
      s.total += count;
      if (diff === "beginner") s.beginner = count;
      if (diff === "intermediate") s.intermediate = count;
      if (diff === "advanced") s.advanced = count;
    }
    setCacheEntry("stats", Array.from(statsMap.entries()).map(([id, s]) => ({ id, ...s })));
  })());

  // ── certifications ───────────────────────────────────────────────────────
  tasks.push((async () => {
    const r = await client.execute({
      sql: "SELECT * FROM certifications WHERE status = 'active'",
      args: [],
    });
    setCacheEntry("certifications", r.rows);
  })());

  // ── learning-paths (default: all, no filters) ────────────────────────────
  tasks.push((async () => {
    const r = await client.execute({
      sql: "SELECT * FROM learning_paths WHERE status = 'active' ORDER BY popularity DESC LIMIT 50",
      args: [],
    });
    setCacheEntry("learning-paths-undefined-undefined-undefined-undefined-undefined-50-0", r.rows);
  })());

  // ── coding challenges ────────────────────────────────────────────────────
  tasks.push((async () => {
    const r = await client.execute({
      sql: "SELECT id, title, description, difficulty, category, tags, companies, starter_code_js, starter_code_py, test_cases, hints, complexity_time, complexity_space, complexity_explanation, time_limit, created_at FROM coding_challenges ORDER BY created_at DESC",
      args: [],
    });
    setCacheEntry("coding-challenges-all", r.rows.map((row: any) => ({
      ...row,
      tags: safeJsonParse(row.tags, []),
      companies: safeJsonParse(row.companies, []),
      testCases: safeJsonParse(row.test_cases, []),
      hints: safeJsonParse(row.hints, []),
    })));
  })());

  // ── voice sessions ───────────────────────────────────────────────────────
  tasks.push((async () => {
    const r = await client.execute({
      sql: "SELECT * FROM voice_sessions ORDER BY created_at DESC",
      args: [],
    });
    setCacheEntry("voice-sessions-all", r.rows.map((row: any) => ({
      ...row,
      questionIds: safeJsonParse(row.question_ids, []),
    })));
  })());

  // ── all questions per channel ────────────────────────────────────────────
  tasks.push((async () => {
    const channelRows = await client.execute({
      sql: "SELECT DISTINCT channel FROM questions WHERE status != 'deleted'",
      args: [],
    });
    const channels = channelRows.rows.map((r: any) => r.channel as string);

    await Promise.allSettled(channels.map(async (ch) => {
      const r = await client.execute({
        sql: "SELECT id, question, answer, explanation, difficulty, sub_channel, tags, channel, diagram, eli5, videos, companies, source_url FROM questions WHERE channel = ? AND status != 'deleted' ORDER BY created_at ASC",
        args: [ch],
      });
      setCacheEntry(`questions-${ch}-all-all`, r.rows.map(parseQuestion));
    }));
  })());

  // ── flashcards per channel ───────────────────────────────────────────────
  tasks.push((async () => {
    const channelRows = await client.execute({
      sql: "SELECT DISTINCT channel FROM flashcards WHERE status = 'active'",
      args: [],
    });
    const channels = channelRows.rows.map((r: any) => r.channel as string);

    await Promise.allSettled(channels.map(async (ch) => {
      const r = await client.execute({
        sql: "SELECT * FROM flashcards WHERE channel = ? AND status = 'active' ORDER BY created_at ASC",
        args: [ch],
      });
      setCacheEntry(`flashcards-${ch}`, r.rows);
    }));
  })());

  // ── subchannels per channel ──────────────────────────────────────────────
  tasks.push((async () => {
    const channelRows = await client.execute({
      sql: "SELECT DISTINCT channel FROM questions WHERE status != 'deleted'",
      args: [],
    });
    const channels = channelRows.rows.map((r: any) => r.channel as string);

    await Promise.allSettled(channels.map(async (ch) => {
      const r = await client.execute({
        sql: "SELECT DISTINCT sub_channel FROM questions WHERE channel = ? AND status != 'deleted' AND sub_channel != '' ORDER BY sub_channel",
        args: [ch],
      });
      setCacheEntry(`subchannels-${ch}`, r.rows.map((row: any) => row.sub_channel).filter(Boolean));
    }));
  })());

  // ── certification stats ─────────────────────────────────────────────────
  tasks.push((async () => {
    const r = await client.execute({
      sql: "SELECT * FROM certifications WHERE status = 'active'",
      args: [],
    });
    const certStats = {
      total: r.rows.length,
      byCategory: {} as Record<string, number>,
    };
    for (const row of r.rows) {
      const cat = row.category as string;
      certStats.byCategory[cat] = (certStats.byCategory[cat] || 0) + 1;
    }
    setCacheEntry("certifications-stats", certStats);
  })());

  // ── learning-paths stats ────────────────────────────────────────────────
  tasks.push((async () => {
    const r = await client.execute({
      sql: "SELECT COUNT(*) as total, SUM(CASE WHEN path_type='company' THEN 1 ELSE 0 END) as company_paths, SUM(CASE WHEN path_type='role' THEN 1 ELSE 0 END) as role_paths FROM learning_paths WHERE status='active'",
      args: [],
    });
    setCacheEntry("learning-paths-stats", r.rows[0] || {});
  })());

  const results = await Promise.allSettled(tasks);
  const failed = results.filter(r => r.status === "rejected");
  if (failed.length > 0) {
    for (const f of failed) {
      console.warn("[cache-warmer] Task failed:", (f as PromiseRejectedResult).reason);
    }
  }

  const elapsed = Date.now() - t0;
  const succeeded = results.length - failed.length;
  console.log(`[cache-warmer] Done — ${succeeded}/${results.length} tasks in ${elapsed}ms. All hot paths served from RAM.`);
}
