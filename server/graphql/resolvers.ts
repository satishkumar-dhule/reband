import { client } from "../db";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { gzipSync } from "zlib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "..", "..", "client", "public", "data");

async function readDataFile(filename: string): Promise<any | null> {
  try {
    const content = await fs.promises.readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

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
            isCorrect: opt.isCorrect === true,
          }));
          answer = correctOption.text;
        }
      }
    } catch {}
  }

  return {
    id: row.id,
    question: row.question,
    answer,
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
      javascript: row.starter_code_js || "",
      python: row.starter_code_py || "",
    },
    testCases: safeJsonParse(row.test_cases, []),
    hints: safeJsonParse(row.hints, []),
    sampleSolution: {
      javascript: row.solution_js || "",
      python: row.solution_py || "",
    },
    complexity: {
      time: row.complexity_time || "O(n)",
      space: row.complexity_space || "O(1)",
      explanation: row.complexity_explanation || "",
    },
    timeLimit: row.time_limit || 15,
  };
}

function parseCertification(row: any) {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    description: row.description,
    icon: row.icon || "award",
    color: row.color || "text-primary",
    difficulty: row.difficulty,
    category: row.category,
    estimatedHours: row.estimated_hours || 40,
    examCode: row.exam_code,
    officialUrl: row.official_url,
    domains: safeJsonParse(row.domains, []),
    channelMappings: safeJsonParse(row.channel_mappings, []),
    tags: safeJsonParse(row.tags, []),
    prerequisites: safeJsonParse(row.prerequisites, []),
    status: row.status || "active",
    questionCount: row.question_count || 0,
    passingScore: row.passing_score || 70,
    examDuration: row.exam_duration || 90,
    createdAt: row.created_at,
    lastUpdated: row.last_updated,
  };
}

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

export const resolvers = {
  JSON: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => {
      if (ast.kind === "StringValue") return ast.value;
      if (ast.kind === "BooleanValue") return ast.value;
      if (ast.kind === "IntValue") return parseInt(ast.value);
      if (ast.kind === "FloatValue") return parseFloat(ast.value);
      if (ast.kind === "NullValue") return null;
      return null;
    },
  },

  Query: {
    health: () => ({
      status: "ok",
      timestamp: Date.now(),
      mode: "browser-storage",
    }),

    channels: async () => {
      const r = await client.execute({
        sql: "SELECT channel, COUNT(*) as count FROM questions WHERE status != 'deleted' GROUP BY channel",
        args: [],
      });
      return r.rows.map((row: any) => ({ id: row.channel, questionCount: row.count }));
    },

    stats: async () => {
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
        if (difficulty === "beginner") stat.beginner = count;
        if (difficulty === "intermediate") stat.intermediate = count;
        if (difficulty === "advanced") stat.advanced = count;
      }
      return Array.from(statsMap.entries()).map(([id, stat]) => ({ id, ...stat }));
    },

    questions: async (_: any, { channelId, subChannel, difficulty }: any) => {
      let sql =
        "SELECT id, question, answer, explanation, difficulty, sub_channel, tags, channel, diagram, eli5, videos, companies, source_url FROM questions WHERE channel = ? AND status != 'deleted'";
      const args: any[] = [channelId];
      if (subChannel && subChannel !== "all") { sql += " AND sub_channel = ?"; args.push(subChannel); }
      if (difficulty && difficulty !== "all") { sql += " AND difficulty = ?"; args.push(difficulty); }
      sql += " ORDER BY created_at ASC";
      const r = await client.execute({ sql, args });
      return r.rows.map(parseQuestion);
    },

    question: async (_: any, { id }: any) => {
      const r = await client.execute({ sql: "SELECT * FROM questions WHERE id = ? LIMIT 1", args: [id] });
      if (r.rows.length === 0) return null;
      return parseQuestion(r.rows[0]);
    },

    randomQuestion: async (_: any, { channel, difficulty }: any) => {
      let sql = "SELECT * FROM questions WHERE 1=1";
      const args: any[] = [];
      if (channel && channel !== "all") { sql += " AND channel = ?"; args.push(channel); }
      if (difficulty && difficulty !== "all") { sql += " AND difficulty = ?"; args.push(difficulty); }
      sql += " ORDER BY RANDOM() LIMIT 1";
      const result = await client.execute({ sql, args });
      if (result.rows.length === 0) return null;
      return parseQuestion(result.rows[0]);
    },

    search: async (_: any, { query, limit = 20 }: any) => {
      const safeLimit = Math.min(parseInt(String(limit ?? "20"), 10) || 20, 50);
      const term = `%${query.trim().toLowerCase()}%`;
      const sql = `
        SELECT id, question, answer, difficulty, channel, sub_channel, tags, companies, videos, diagram
        FROM questions
        WHERE status != 'deleted'
          AND (LOWER(question) LIKE ? OR LOWER(answer) LIKE ? OR LOWER(tags) LIKE ?)
        LIMIT ?
      `;
      const r = await client.execute({ sql, args: [term, term, term, safeLimit] });
      const results = r.rows.map((row: any) => ({
        id: row.id,
        question: row.question,
        answer: typeof row.answer === "string" ? row.answer.slice(0, 200) : "",
        difficulty: row.difficulty,
        channel: row.channel,
        subChannel: row.sub_channel,
        tags: safeJsonParse(row.tags, []),
        companies: safeJsonParse(row.companies, []),
        hasVideo: !!row.videos && row.videos !== "null" && row.videos !== "{}",
        hasDiagram: typeof row.diagram === "string" && row.diagram.length > 20,
      }));
      return { results, total: results.length };
    },

    subchannels: async (_: any, { channelId }: any) => {
      const r = await client.execute({
        sql: "SELECT DISTINCT sub_channel FROM questions WHERE channel = ? ORDER BY sub_channel",
        args: [channelId],
      });
      return r.rows.map((row: any) => row.sub_channel);
    },

    companies: async (_: any, { channelId }: any) => {
      const r = await client.execute({
        sql: "SELECT companies FROM questions WHERE channel = ? AND companies IS NOT NULL",
        args: [channelId],
      });
      const set = new Set<string>();
      for (const row of r.rows) {
        if (row.companies) {
          try {
            JSON.parse(row.companies as string).forEach((c: string) => set.add(c));
          } catch {}
        }
      }
      return Array.from(set).sort();
    },

    codingChallenges: async (_: any, { difficulty, category }: any) => {
      let sql = "SELECT * FROM coding_challenges WHERE 1=1";
      const args: any[] = [];
      if (difficulty && difficulty !== "all") { sql += " AND difficulty = ?"; args.push(difficulty); }
      if (category && category !== "all") { sql += " AND category = ?"; args.push(category); }
      sql += " ORDER BY created_at DESC";
      const r = await client.execute({ sql, args });
      return r.rows.map(parseCodingChallenge);
    },

    codingChallenge: async (_: any, { id }: any) => {
      const result = await client.execute({ sql: "SELECT * FROM coding_challenges WHERE id = ? LIMIT 1", args: [id] });
      if (result.rows.length === 0) return null;
      return parseCodingChallenge(result.rows[0]);
    },

    randomCodingChallenge: async (_: any, { difficulty }: any) => {
      let sql = "SELECT * FROM coding_challenges WHERE 1=1";
      const args: any[] = [];
      if (difficulty && difficulty !== "all") { sql += " AND difficulty = ?"; args.push(difficulty); }
      sql += " ORDER BY RANDOM() LIMIT 1";
      const result = await client.execute({ sql, args });
      if (result.rows.length === 0) return null;
      return parseCodingChallenge(result.rows[0]);
    },

    codingStats: async () => {
      const result = await client.execute(
        "SELECT difficulty, category, COUNT(*) as count FROM coding_challenges GROUP BY difficulty, category"
      );
      const stats: any = { total: 0, byDifficulty: { easy: 0, medium: 0 }, byCategory: {} };
      for (const row of result.rows) {
        const count = Number(row.count);
        stats.total += count;
        const diff = row.difficulty as string;
        if (diff === "easy" || diff === "medium") stats.byDifficulty[diff] += count;
        const cat = row.category as string;
        stats.byCategory[cat] = (stats.byCategory[cat] || 0) + count;
      }
      return stats;
    },

    certifications: async (_: any, { category, difficulty, provider, status = "active" }: any) => {
      let sql = "SELECT * FROM certifications WHERE status = ?";
      const args: any[] = [status];
      if (category && category !== "all") { sql += " AND category = ?"; args.push(category); }
      if (difficulty && difficulty !== "all") { sql += " AND difficulty = ?"; args.push(difficulty); }
      if (provider && provider !== "all") { sql += " AND provider LIKE ?"; args.push(`%${provider}%`); }
      sql += " ORDER BY name ASC";
      const r = await client.execute({ sql, args });
      return r.rows.map(parseCertification);
    },

    certification: async (_: any, { id }: any) => {
      const result = await client.execute({ sql: "SELECT * FROM certifications WHERE id = ? LIMIT 1", args: [id] });
      if (result.rows.length === 0) return null;
      return parseCertification(result.rows[0]);
    },

    certificationStats: async () => {
      const result = await client.execute(
        "SELECT category, difficulty, COUNT(*) as count, SUM(question_count) as questions FROM certifications WHERE status = 'active' GROUP BY category, difficulty"
      );
      const stats: any = { total: 0, totalQuestions: 0, byCategory: {}, byDifficulty: {} };
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
      return stats;
    },

    certificationQuestions: async (_: any, { id, domain, difficulty, limit = 50 }: any) => {
      let sql = "SELECT * FROM questions WHERE channel = ? AND status != 'deleted'";
      const args: any[] = [id];
      if (domain && domain !== "all") { sql += " AND sub_channel = ?"; args.push(domain); }
      if (difficulty && difficulty !== "all") { sql += " AND difficulty = ?"; args.push(difficulty); }
      sql += " ORDER BY RANDOM() LIMIT ?";
      args.push(parseInt(String(limit)));
      const r = await client.execute({ sql, args });
      return r.rows.map(parseQuestion);
    },

    learningPaths: async (_: any, { pathType, difficulty, company, jobTitle, search, limit = 50, offset = 0 }: any) => {
      let sql = "SELECT * FROM learning_paths WHERE status = 'active'";
      const args: any[] = [];
      if (pathType && pathType !== "all") { sql += " AND path_type = ?"; args.push(pathType); }
      if (difficulty && difficulty !== "all") { sql += " AND difficulty = ?"; args.push(difficulty); }
      if (company) { sql += " AND target_company = ?"; args.push(company); }
      if (jobTitle) { sql += " AND target_job_title = ?"; args.push(jobTitle); }
      if (search) {
        sql += " AND (title LIKE ? OR description LIKE ? OR tags LIKE ?)";
        const p = `%${search}%`;
        args.push(p, p, p);
      }
      sql += " ORDER BY popularity DESC, created_at DESC LIMIT ? OFFSET ?";
      args.push(parseInt(String(limit)), parseInt(String(offset)));
      const result = await client.execute({ sql, args });
      return result.rows.map(parseLearningPath);
    },

    learningPath: async (_: any, { id }: any) => {
      const result = await client.execute({ sql: "SELECT * FROM learning_paths WHERE id = ? LIMIT 1", args: [id] });
      if (result.rows.length === 0) return null;
      return parseLearningPath(result.rows[0]);
    },

    learningPathStats: async () => {
      const result = await client.execute(
        "SELECT path_type, difficulty, COUNT(*) as count FROM learning_paths WHERE status = 'active' GROUP BY path_type, difficulty"
      );
      const stats: any = { total: 0, byType: {}, byDifficulty: {} };
      for (const row of result.rows) {
        const count = Number(row.count);
        stats.total += count;
        const type = row.path_type as string;
        stats.byType[type] = (stats.byType[type] || 0) + count;
        const diff = row.difficulty as string;
        stats.byDifficulty[diff] = (stats.byDifficulty[diff] || 0) + count;
      }
      return stats;
    },

    learningPathFilterCompanies: async () => {
      const result = await client.execute(
        "SELECT DISTINCT target_company FROM learning_paths WHERE target_company IS NOT NULL AND status = 'active' ORDER BY target_company"
      );
      return result.rows.map((r: any) => r.target_company);
    },

    learningPathFilterJobTitles: async () => {
      const result = await client.execute(
        "SELECT DISTINCT target_job_title FROM learning_paths WHERE target_job_title IS NOT NULL AND status = 'active' ORDER BY target_job_title"
      );
      return result.rows.map((r: any) => r.target_job_title);
    },

    userSessions: async () => {
      const result = await client.execute(
        "SELECT * FROM user_sessions WHERE status = 'active' ORDER BY last_accessed_at DESC"
      );
      return result.rows;
    },

    userSession: async (_: any, { id }: any) => {
      const result = await client.execute({ sql: "SELECT * FROM user_sessions WHERE id = ?", args: [id] });
      if (result.rows.length === 0) return null;
      return result.rows[0];
    },

    flashcards: async (_: any, { channelId }: any) => {
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
    },

    voiceSessions: async (_: any, { channel }: any) => {
      let sql = "SELECT * FROM voice_sessions";
      const args: any[] = [];
      if (channel) { sql += " WHERE channel = ?"; args.push(channel); }
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
      return { sessions };
    },

    similarQuestions: async (_: any, { questionId }: any) => {
      const result = await client.execute({
        sql: `SELECT qr.target_question_id as id, qr.strength as similarity, q.question, q.channel
              FROM question_relationships qr
              JOIN questions q ON qr.target_question_id = q.id
              WHERE qr.source_question_id = ?
              ORDER BY qr.strength DESC
              LIMIT 6`,
        args: [questionId],
      });
      return result.rows.map((row: any) => ({
        id: row.id,
        question: row.question,
        channel: row.channel,
        similarity: (row.similarity || 50) / 100,
      }));
    },

    changelog: async () => {
      const data = await readDataFile("changelog.json");
      return data || { entries: [], stats: { totalQuestionsAdded: 0, totalQuestionsImproved: 0, lastUpdated: new Date().toISOString() } };
    },

    botActivity: async () => {
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

      return {
        stats: statsResult.rows.map((row: any) => ({
          botName: row.bot_name,
          totalRuns: Number(row.total_runs),
          successfulRuns: Number(row.successful_runs),
          totalCreated: 0,
          totalUpdated: 0,
          totalDeleted: 0,
          lastRun: row.last_run,
        })),
        runs: runsResult.rows.map((row: any) => ({
          id: row.id,
          botName: row.bot_name,
          startedAt: row.started_at,
          completedAt: row.completed_at,
          status: row.status,
        })),
        queue: queueResult.rows.map((row: any) => ({
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
        })),
        ledger: ledgerResult.rows.map((row: any) => ({
          id: row.id,
          botName: row.bot_name,
          action: row.action,
          itemType: row.item_type,
          itemId: row.item_id,
          reason: row.reason,
          createdAt: row.created_at,
        })),
      };
    },

    githubAnalytics: async () => {
      return await readDataFile("github-analytics.json") || {};
    },

    intelligence: () => ({
      cognitiveMap: null,
      companyWeights: null,
      companyProfiles: null,
      knowledgeDNA: null,
      mockInterviews: null,
    }),

    interviewerComments: () => ({
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
    }),

    history: async (_: any, { questionId, type = "question", limit = 50 }: any) => {
      const result = await client.execute({
        sql: `SELECT * FROM question_history WHERE question_id = ? AND question_type = ? ORDER BY created_at DESC LIMIT ?`,
        args: [questionId, type, parseInt(String(limit))],
      });
      return result.rows.map(parseHistoryRecord);
    },

    historyFull: async (_: any, { questionId, type = "question" }: any) => {
      const [recordsResult, typeSummary, latestResult] = await Promise.all([
        client.execute({
          sql: `SELECT * FROM question_history WHERE question_id = ? AND question_type = ? ORDER BY created_at DESC LIMIT 50`,
          args: [questionId, type],
        }),
        client.execute({
          sql: `SELECT event_type, COUNT(*) as count FROM question_history WHERE question_id = ? AND question_type = ? GROUP BY event_type`,
          args: [questionId, type],
        }),
        client.execute({
          sql: `SELECT * FROM question_history WHERE question_id = ? AND question_type = ? ORDER BY created_at DESC LIMIT 1`,
          args: [questionId, type],
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

      return {
        questionId,
        questionType: type,
        totalEvents,
        latestEvent: latest,
        eventTypes,
        history: recordsResult.rows.map(parseHistoryRecord),
      };
    },

    historyIndex: async () => {
      const result = await client.execute(
        "SELECT question_id, question_type, event_type, created_at FROM question_history ORDER BY created_at DESC"
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
          questions[qId] = { questionType: qType, totalEvents: 0, latestEvent: null, eventTypes: {} };
        }
        questions[qId].totalEvents++;
        questions[qId].eventTypes[eType] = (questions[qId].eventTypes[eType] || 0) + 1;
        if (!questions[qId].latestEvent || createdAt > questions[qId].latestEvent.createdAt) {
          questions[qId].latestEvent = { eventType: eType, createdAt };
        }
      }
      return { questions, totalEvents, totalQuestions: Object.keys(questions).length, generatedAt: new Date().toISOString() };
    },

    historySummary: async (_: any, { questionId, type = "question" }: any) => {
      const result = await client.execute({
        sql: `SELECT event_type, COUNT(*) as count FROM question_history WHERE question_id = ? AND question_type = ? GROUP BY event_type`,
        args: [questionId, type],
      });
      const summary: Record<string, number> = {};
      let total = 0;
      for (const row of result.rows) {
        const count = Number(row.count);
        summary[row.event_type as string] = count;
        total += count;
      }
      const latestResult = await client.execute({
        sql: `SELECT * FROM question_history WHERE question_id = ? AND question_type = ? ORDER BY created_at DESC LIMIT 1`,
        args: [questionId, type],
      });
      const latest = latestResult.rows.length > 0 ? parseHistoryRecord(latestResult.rows[0]) : null;
      return { total, byType: summary, latest };
    },

    historyAll: async (_: any, { limit = 100, type, eventType, source }: any) => {
      let sql = "SELECT * FROM question_history WHERE 1=1";
      const args: any[] = [];
      if (type && type !== "all") { sql += " AND question_type = ?"; args.push(type); }
      if (eventType && eventType !== "all") { sql += " AND event_type = ?"; args.push(eventType); }
      if (source && source !== "all") { sql += " AND event_source = ?"; args.push(source); }
      sql += " ORDER BY created_at DESC LIMIT ?";
      args.push(parseInt(String(limit)));
      const result = await client.execute({ sql, args });
      return result.rows.map(parseHistoryRecord);
    },

    tests: async () => {
      return await readDataFile("tests.json") || [];
    },

    test: async (_: any, { channelId }: any) => {
      const data = await readDataFile("tests.json");
      const tests: any[] = Array.isArray(data) ? data : [];
      return tests.find((t: any) => t.channelId === channelId) || null;
    },

    progress: async (_: any, { userId }: any) => {
      const result = await client.execute({
        sql: "SELECT * FROM user_sessions WHERE session_key LIKE ? AND status = 'active'",
        args: [`${userId}-%`],
      });
      return result.rows.map((row: any) => ({
        channelId: row.channel_id,
        completedQuestions: safeJsonParse(row.completed_items, []),
        markedQuestions: [],
        lastVisitedIndex: 0,
      }));
    },
  },

  Mutation: {
    sync: async (_: any, { entity, entityId, action, data }: any) => {
      if (entity === "question_history" || entity === "history") {
        const qId = (data?.questionId) ?? entityId;
        await client.execute({
          sql: `INSERT INTO question_history (question_id, event_type, event_source, metadata, created_at) VALUES (?, ?, ?, ?, ?)`,
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
      return { ok: true, entity, entityId, action };
    },

    addHistory: async (_: any, args: any) => {
      const { questionId, questionType = "question", eventType, eventSource, sourceName, changesSummary, changedFields, beforeSnapshot, afterSnapshot, reason, metadata } = args;
      const result = await client.execute({
        sql: `INSERT INTO question_history (question_id, question_type, event_type, event_source, source_name, changes_summary, changed_fields, before_snapshot, after_snapshot, reason, metadata, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          questionId, questionType, eventType, eventSource,
          sourceName || null, changesSummary || null,
          changedFields ? JSON.stringify(changedFields) : null,
          beforeSnapshot ? JSON.stringify(beforeSnapshot) : null,
          afterSnapshot ? JSON.stringify(afterSnapshot) : null,
          reason || null,
          metadata ? JSON.stringify(metadata) : null,
          new Date().toISOString(),
        ],
      });
      return { success: true, id: Number(result.lastInsertRowid) };
    },

    createLearningPath: async (_: any, { title, description, channels, difficulty, estimatedHours, pathType }: any) => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      await client.execute({
        sql: `INSERT INTO learning_paths (id, title, description, path_type, difficulty, estimated_hours, channels, question_ids, tags, prerequisites, learning_objectives, milestones, metadata, status, created_at, last_updated)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
        args: [id, title, description ?? "", pathType ?? "skill", difficulty ?? "intermediate", estimatedHours ?? 40, JSON.stringify(channels), JSON.stringify([]), JSON.stringify(channels), JSON.stringify([]), JSON.stringify([]), JSON.stringify([]), JSON.stringify({}), now, now],
      });
      const result = await client.execute({ sql: "SELECT * FROM learning_paths WHERE id = ? LIMIT 1", args: [id] });
      return parseLearningPath(result.rows[0]);
    },

    startLearningPath: async (_: any, { id }: any) => {
      await client.execute({ sql: "UPDATE learning_paths SET popularity = popularity + 1 WHERE id = ?", args: [id] });
      return { success: true };
    },

    createOrUpdateUserSession: async (_: any, { sessionKey, sessionType, title, subtitle, channelId, certificationId, progress = 0, totalItems = 0, completedItems = 0, sessionData = {} }: any) => {
      const existing = await client.execute({
        sql: "SELECT id FROM user_sessions WHERE session_key = ? AND status = 'active'",
        args: [sessionKey],
      });
      if (existing.rows.length > 0) {
        const sessionId = existing.rows[0].id;
        await client.execute({
          sql: `UPDATE user_sessions SET title = ?, subtitle = ?, progress = ?, completed_items = ?, session_data = ?, last_accessed_at = ? WHERE id = ?`,
          args: [title, subtitle || null, progress, completedItems, JSON.stringify(sessionData), new Date().toISOString(), sessionId],
        });
        return { id: sessionId, updated: true, created: false };
      } else {
        const sessionId = crypto.randomUUID();
        await client.execute({
          sql: `INSERT INTO user_sessions (id, session_key, session_type, title, subtitle, channel_id, certification_id, progress, total_items, completed_items, session_data, started_at, last_accessed_at, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [sessionId, sessionKey, sessionType, title, subtitle || null, channelId || null, certificationId || null, progress, totalItems, completedItems, JSON.stringify(sessionData), new Date().toISOString(), new Date().toISOString(), "active"],
        });
        return { id: sessionId, created: true, updated: false };
      }
    },

    updateUserSession: async (_: any, { id, progress, completedItems, sessionData }: any) => {
      await client.execute({
        sql: `UPDATE user_sessions SET progress = ?, completed_items = ?, session_data = ?, last_accessed_at = ? WHERE id = ?`,
        args: [progress, completedItems, JSON.stringify(sessionData), new Date().toISOString(), id],
      });
      return { success: true };
    },

    deleteUserSession: async (_: any, { id }: any) => {
      await client.execute({ sql: "UPDATE user_sessions SET status = 'abandoned' WHERE id = ?", args: [id] });
      return { success: true };
    },

    completeUserSession: async (_: any, { id }: any) => {
      await client.execute({ sql: "UPDATE user_sessions SET status = 'completed', completed_at = ? WHERE id = ?", args: [new Date().toISOString(), id] });
      return { success: true };
    },

    updateCertificationCount: async (_: any, { id }: any) => {
      const countResult = await client.execute({
        sql: "SELECT COUNT(*) as count FROM questions WHERE channel = ? AND status != 'deleted'",
        args: [id],
      });
      const count = countResult.rows[0]?.count || 0;
      await client.execute({
        sql: "UPDATE certifications SET question_count = ?, last_updated = ? WHERE id = ?",
        args: [count, new Date().toISOString(), id],
      });
      return { success: true, questionCount: Number(count) };
    },
  },
};
