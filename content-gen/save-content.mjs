import { createClient } from '@libsql/client';

const DB_URL = 'file:local.db';

let dbClient = null;

function getDb() {
  if (!dbClient) {
    dbClient = createClient({
      url: DB_URL,
    });
  }
  return dbClient;
}

function generateId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

const INSERT_STMTS = {
  question: `INSERT INTO questions (id, question, answer, explanation, difficulty, channel, sub_channel, tags, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,

  flashcard: `INSERT INTO flashcards (id, channel, front, back, hint, code_example, difficulty, tags, category, status, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,

  exam: `INSERT INTO certifications (id, name, provider, description, difficulty, category, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'active', ?)`,

  voiceSession: `INSERT INTO voice_sessions (id, topic, description, channel, difficulty, question_ids, total_questions, estimated_minutes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

  codingChallenge: `INSERT INTO questions (id, question, answer, explanation, difficulty, channel, sub_channel, tags, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
};

const VALID_TYPES = ['question', 'flashcard', 'exam', 'voiceSession', 'codingChallenge'];

export async function saveContent(content, type) {
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`Invalid content type: ${type}. Valid types: ${VALID_TYPES.join(', ')}`);
  }

  const db = getDb();
  const id = content.id || generateId();
  const timestamp = now();

  try {
    switch (type) {
      case 'question': {
        const stmt = INSERT_STMTS.question;
        await db.execute({
          sql: stmt,
          args: [
            id,
            content.question,
            content.answer,
            content.explanation || '',
            content.difficulty || 'intermediate',
            content.channel,
            content.subChannel || '',
            JSON.stringify(content.tags || []),
            timestamp,
          ],
        });
        return { id, ...content, status: 'active', createdAt: timestamp };
      }

      case 'flashcard': {
        const stmt = INSERT_STMTS.flashcard;
        await db.execute({
          sql: stmt,
          args: [
            id,
            content.channel,
            content.front,
            content.back,
            content.hint || '',
            content.codeExample || '',
            content.difficulty || 'intermediate',
            JSON.stringify(content.tags || []),
            content.category || '',
            timestamp,
          ],
        });
        return { id, ...content, status: 'active', createdAt: timestamp };
      }

      case 'exam': {
        const stmt = INSERT_STMTS.exam;
        await db.execute({
          sql: stmt,
          args: [
            id,
            content.name,
            content.provider || 'DevPrep',
            content.description || '',
            content.difficulty || 'intermediate',
            content.category || 'development',
            timestamp,
          ],
        });
        return { id, ...content, status: 'active', createdAt: timestamp };
      }

      case 'voiceSession': {
        const stmt = INSERT_STMTS.voiceSession;
        await db.execute({
          sql: stmt,
          args: [
            id,
            content.topic,
            content.description || '',
            content.channel,
            content.difficulty || 'intermediate',
            JSON.stringify(content.questionIds || []),
            content.totalQuestions || 0,
            content.estimatedMinutes || 5,
            timestamp,
          ],
        });
        return { id, ...content, createdAt: timestamp };
      }

      case 'codingChallenge': {
        const stmt = INSERT_STMTS.codingChallenge;
        await db.execute({
          sql: stmt,
          args: [
            id,
            content.question,
            content.answer,
            content.explanation || '',
            content.difficulty || 'intermediate',
            content.channel || 'coding',
            content.subChannel || content.category || 'general',
            JSON.stringify(content.tags || []),
            timestamp,
          ],
        });
        return { id, ...content, status: 'active', createdAt: timestamp };
      }

      default:
        throw new Error(`Unhandled content type: ${type}`);
    }
  } catch (error) {
    console.error(`Failed to save ${type}:`, error.message);
    throw error;
  }
}

export default { saveContent };
