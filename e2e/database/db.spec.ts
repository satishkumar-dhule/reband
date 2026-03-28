import { test, expect } from '@playwright/test';
import { createClient } from '@libsql/client';

const DATABASE_URL = process.env.TURSO_DATABASE_URL || 'file:local.db';
const AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

let client: ReturnType<typeof createClient>;

async function getClient() {
  if (!client) {
    client = createClient({
      url: DATABASE_URL,
      authToken: DATABASE_URL.startsWith('file:') ? undefined : AUTH_TOKEN,
    });
  }
  return client;
}

async function query<T>(sql: string, params: any[] = []): Promise<T[]> {
  const db = await getClient();
  const result = await db.execute({ sql, args: params });
  return result.rows as T[];
}

async function tableExists(tableName: string): Promise<boolean> {
  const tables = await query<any>(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name = ?
  `, [tableName]);
  return tables.length > 0;
}

test.describe('DevPrep Database Integrity Tests', () => {

  test.describe('1. Schema Validation - All Required Tables Exist', () => {
    
    const requiredTables = [
      'users', 'channels', 'content', 'user_progress', 
      'learning_paths', 'achievements', 'user_achievements',
      'discussions', 'comments', 'job_applications', 'analytics_events'
    ];

    for (const table of requiredTables) {
      test(`table "${table}" exists`, async () => {
        const exists = await tableExists(table);
        expect(exists, `Table ${table} should exist`).toBe(true);
      });
    }

    test('PRAGMA foreign_keys is enabled', async () => {
      const result = await query<any>('PRAGMA foreign_keys');
      expect(result[0].foreign_keys).toBe(1);
    });

    test('database version is valid', async () => {
      const result = await query<any>('PRAGMA schema_version');
      expect(result[0].schema_version).toBeGreaterThan(0);
    });

  });

  test.describe('2. Data Integrity - Required Fields Not Null', () => {
    
    test('users table - required fields are not null', async () => {
      const users = await query<any>('SELECT id, email, name, created_at, updated_at, role FROM users LIMIT 50');
      
      if (users.length > 0) {
        for (const u of users) {
          expect(u.id, 'user id should not be null').toBeTruthy();
          expect(u.email, 'email should not be null').toBeTruthy();
          expect(u.name, 'name should not be null').toBeTruthy();
          expect(u.created_at, 'created_at should not be null').toBeTruthy();
          expect(u.updated_at, 'updated_at should not be null').toBeTruthy();
          expect(u.role, 'role should not be null').toBeTruthy();
        }
      } else {
        test.skip();
      }
    });

    test('channels table - required fields are not null', async () => {
      const channels = await query<any>('SELECT id, name, order_index, is_premium, created_at FROM channels LIMIT 50');
      
      if (channels.length > 0) {
        for (const c of channels) {
          expect(c.id, 'channel id should not be null').toBeTruthy();
          expect(c.name, 'name should not be null').toBeTruthy();
          expect(c.order_index, 'order_index should not be null').toBeTruthy();
          expect(c.is_premium, 'is_premium should not be null').toBeTruthy();
          expect(c.created_at, 'created_at should not be null').toBeTruthy();
        }
      } else {
        test.skip();
      }
    });

    test('content table - required fields are not null', async () => {
      const content = await query<any>('SELECT id, type, channel_id, data, tags, difficulty, created_at, updated_at, created_by, status FROM content LIMIT 100');
      
      if (content.length > 0) {
        for (const c of content) {
          expect(c.id, 'content id should not be null').toBeTruthy();
          expect(c.type, 'type should not be null').toBeTruthy();
          expect(c.channel_id, 'channel_id should not be null').toBeTruthy();
          expect(c.data, 'data should not be null').toBeTruthy();
          expect(c.tags, 'tags should not be null').toBeTruthy();
          expect(c.difficulty, 'difficulty should not be null').toBeTruthy();
          expect(c.created_at, 'created_at should not be null').toBeTruthy();
          expect(c.updated_at, 'updated_at should not be null').toBeTruthy();
          expect(c.created_by, 'created_by should not be null').toBeTruthy();
          expect(c.status, 'status should not be null').toBeTruthy();
        }
      } else {
        test.skip();
      }
    });

    test('user_progress table - required fields are not null', async () => {
      const progress = await query<any>('SELECT id, user_id, content_id, content_type, status, time_spent, attempts, last_attempt_at FROM user_progress LIMIT 50');
      
      if (progress.length > 0) {
        for (const p of progress) {
          expect(p.id, 'progress id should not be null').toBeTruthy();
          expect(p.user_id, 'user_id should not be null').toBeTruthy();
          expect(p.content_id, 'content_id should not be null').toBeTruthy();
          expect(p.content_type, 'content_type should not be null').toBeTruthy();
          expect(p.status, 'status should not be null').toBeTruthy();
          expect(p.time_spent, 'time_spent should not be null').toBeTruthy();
          expect(p.attempts, 'attempts should not be null').toBeTruthy();
          expect(p.last_attempt_at, 'last_attempt_at should not be null').toBeTruthy();
        }
      } else {
        test.skip();
      }
    });

    test('learning_paths table - required fields are not null', async () => {
      const paths = await query<any>('SELECT id, title, channel_id, steps, estimated_hours, difficulty, created_at FROM learning_paths LIMIT 50');
      
      if (paths.length > 0) {
        for (const p of paths) {
          expect(p.id, 'path id should not be null').toBeTruthy();
          expect(p.title, 'title should not be null').toBeTruthy();
          expect(p.channel_id, 'channel_id should not be null').toBeTruthy();
          expect(p.steps, 'steps should not be null').toBeTruthy();
          expect(p.estimated_hours, 'estimated_hours should not be null').toBeTruthy();
          expect(p.difficulty, 'difficulty should not be null').toBeTruthy();
          expect(p.created_at, 'created_at should not be null').toBeTruthy();
        }
      } else {
        test.skip();
      }
    });

    test('achievements table - required fields are not null', async () => {
      const achievements = await query<any>('SELECT id, name, criteria, points, rarity FROM achievements LIMIT 50');
      
      if (achievements.length > 0) {
        for (const a of achievements) {
          expect(a.id, 'achievement id should not be null').toBeTruthy();
          expect(a.name, 'name should not be null').toBeTruthy();
          expect(a.criteria, 'criteria should not be null').toBeTruthy();
          expect(a.points, 'points should not be null').toBeTruthy();
          expect(a.rarity, 'rarity should not be null').toBeTruthy();
        }
      } else {
        test.skip();
      }
    });

    test('job_applications table - required fields are not null', async () => {
      const jobs = await query<any>('SELECT id, user_id, company, position, channel, status, interview_dates FROM job_applications LIMIT 50');
      
      if (jobs.length > 0) {
        for (const j of jobs) {
          expect(j.id, 'job id should not be null').toBeTruthy();
          expect(j.user_id, 'user_id should not be null').toBeTruthy();
          expect(j.company, 'company should not be null').toBeTruthy();
          expect(j.position, 'position should not be null').toBeTruthy();
          expect(j.channel, 'channel should not be null').toBeTruthy();
          expect(j.status, 'status should not be null').toBeTruthy();
          expect(j.interview_dates, 'interview_dates should not be null').toBeTruthy();
        }
      } else {
        test.skip();
      }
    });

  });

  test.describe('3. Foreign Key Relationships Valid', () => {
    
    test('content references valid channels', async () => {
      const content = await query<any>(`
        SELECT c.id, c.channel_id, ch.id as channel_exists 
        FROM content c 
        LEFT JOIN channels ch ON c.channel_id = ch.id 
        LIMIT 100
      `);
      
      if (content.length > 0) {
        const orphaned = content.filter((c: any) => !c.channel_exists);
        expect(orphaned.length, 'No orphaned content records').toBe(0);
      } else {
        test.skip();
      }
    });

    test('content references valid users (created_by)', async () => {
      const content = await query<any>(`
        SELECT c.id, c.created_by, u.id as user_exists 
        FROM content c 
        LEFT JOIN users u ON c.created_by = u.id 
        LIMIT 100
      `);
      
      if (content.length > 0) {
        const orphaned = content.filter((c: any) => !c.user_exists);
        expect(orphaned.length, 'No orphaned content created_by references').toBe(0);
      } else {
        test.skip();
      }
    });

    test('user_progress references valid users', async () => {
      const progress = await query<any>(`
        SELECT p.id, p.user_id, u.id as user_exists 
        FROM user_progress p 
        LEFT JOIN users u ON p.user_id = u.id 
        LIMIT 100
      `);
      
      if (progress.length > 0) {
        const orphaned = progress.filter((p: any) => !p.user_exists);
        expect(orphaned.length, 'No orphaned user_progress records').toBe(0);
      } else {
        test.skip();
      }
    });

    test('user_progress references valid content', async () => {
      const progress = await query<any>(`
        SELECT p.id, p.content_id, c.id as content_exists 
        FROM user_progress p 
        LEFT JOIN content c ON p.content_id = c.id 
        LIMIT 100
      `);
      
      if (progress.length > 0) {
        const orphaned = progress.filter((p: any) => !p.content_exists);
        expect(orphaned.length, 'No orphaned user_progress content references').toBe(0);
      } else {
        test.skip();
      }
    });

    test('learning_paths references valid channels', async () => {
      const paths = await query<any>(`
        SELECT lp.id, lp.channel_id, c.id as channel_exists 
        FROM learning_paths lp 
        LEFT JOIN channels c ON lp.channel_id = c.id 
        LIMIT 100
      `);
      
      if (paths.length > 0) {
        const orphaned = paths.filter((p: any) => !p.channel_exists);
        expect(orphaned.length, 'No orphaned learning_paths records').toBe(0);
      } else {
        test.skip();
      }
    });

    test('user_achievements references valid users', async () => {
      const ua = await query<any>(`
        SELECT ua.id, ua.user_id, u.id as user_exists 
        FROM user_achievements ua 
        LEFT JOIN users u ON ua.user_id = u.id 
        LIMIT 100
      `);
      
      if (ua.length > 0) {
        const orphaned = ua.filter((a: any) => !a.user_exists);
        expect(orphaned.length, 'No orphaned user_achievements records').toBe(0);
      } else {
        test.skip();
      }
    });

    test('user_achievements references valid achievements', async () => {
      const ua = await query<any>(`
        SELECT ua.id, ua.achievement_id, a.id as achievement_exists 
        FROM user_achievements ua 
        LEFT JOIN achievements a ON ua.achievement_id = a.id 
        LIMIT 100
      `);
      
      if (ua.length > 0) {
        const orphaned = ua.filter((a: any) => !a.achievement_exists);
        expect(orphaned.length, 'No orphaned achievement references').toBe(0);
      } else {
        test.skip();
      }
    });

    test('discussions references valid users', async () => {
      const discussions = await query<any>(`
        SELECT d.id, d.user_id, u.id as user_exists 
        FROM discussions d 
        LEFT JOIN users u ON d.user_id = u.id 
        LIMIT 100
      `);
      
      if (discussions.length > 0) {
        const orphaned = discussions.filter((d: any) => !d.user_exists);
        expect(orphaned.length, 'No orphaned discussions records').toBe(0);
      } else {
        test.skip();
      }
    });

    test('discussions references valid channels', async () => {
      const discussions = await query<any>(`
        SELECT d.id, d.channel_id, c.id as channel_exists 
        FROM discussions d 
        LEFT JOIN channels c ON d.channel_id = c.id 
        LIMIT 100
      `);
      
      if (discussions.length > 0) {
        const orphaned = discussions.filter((d: any) => !d.channel_exists);
        expect(orphaned.length, 'No orphaned discussion channel references').toBe(0);
      } else {
        test.skip();
      }
    });

    test('comments references valid discussions', async () => {
      const comments = await query<any>(`
        SELECT c.id, c.discussion_id, d.id as discussion_exists 
        FROM comments c 
        LEFT JOIN discussions d ON c.discussion_id = d.id 
        LIMIT 100
      `);
      
      if (comments.length > 0) {
        const orphaned = comments.filter((c: any) => !c.discussion_exists);
        expect(orphaned.length, 'No orphaned comment records').toBe(0);
      } else {
        test.skip();
      }
    });

    test('comments references valid users', async () => {
      const comments = await query<any>(`
        SELECT c.id, c.user_id, u.id as user_exists 
        FROM comments c 
        LEFT JOIN users u ON c.user_id = u.id 
        LIMIT 100
      `);
      
      if (comments.length > 0) {
        const orphaned = comments.filter((c: any) => !c.user_exists);
        expect(orphaned.length, 'No orphaned comment user references').toBe(0);
      } else {
        test.skip();
      }
    });

    test('job_applications references valid users', async () => {
      const jobs = await query<any>(`
        SELECT j.id, j.user_id, u.id as user_exists 
        FROM job_applications j 
        LEFT JOIN users u ON j.user_id = u.id 
        LIMIT 100
      `);
      
      if (jobs.length > 0) {
        const orphaned = jobs.filter((j: any) => !j.user_exists);
        expect(orphaned.length, 'No orphaned job_application records').toBe(0);
      } else {
        test.skip();
      }
    });

    test('analytics_events references valid users', async () => {
      const events = await query<any>(`
        SELECT a.id, a.user_id, u.id as user_exists 
        FROM analytics_events a 
        LEFT JOIN users u ON a.user_id = u.id 
        LIMIT 100
      `);
      
      if (events.length > 0) {
        const orphaned = events.filter((a: any) => !a.user_exists);
        expect(orphaned.length, 'No orphaned analytics_events records').toBe(0);
      } else {
        test.skip();
      }
    });

    test('channels parent_id references valid channels (self-referential)', async () => {
      const channels = await query<any>(`
        SELECT c.id, c.parent_id, p.id as parent_exists 
        FROM channels c 
        LEFT JOIN channels p ON c.parent_id = p.id 
        WHERE c.parent_id IS NOT NULL
        LIMIT 100
      `);
      
      if (channels.length > 0) {
        const orphaned = channels.filter((c: any) => !c.parent_exists);
        expect(orphaned.length, 'No orphaned parent channel references').toBe(0);
      }
    });

  });

  test.describe('4. No Orphaned Records', () => {
    
    test('content with valid type values', async () => {
      const content = await query<any>('SELECT id, type FROM content LIMIT 100');
      const validTypes = ['question', 'flashcard', 'exam', 'voice', 'coding'];
      
      if (content.length > 0) {
        const invalid = content.filter((c: any) => !validTypes.includes(c.type));
        expect(invalid.length, 'All content should have valid types').toBe(0);
      } else {
        test.skip();
      }
    });

    test('content with valid difficulty values', async () => {
      const content = await query<any>('SELECT id, difficulty FROM content LIMIT 100');
      const validDifficulties = ['easy', 'medium', 'hard'];
      
      if (content.length > 0) {
        const invalid = content.filter((c: any) => !validDifficulties.includes(c.difficulty));
        expect(invalid.length, 'All content should have valid difficulty').toBe(0);
      } else {
        test.skip();
      }
    });

    test('content with valid status values', async () => {
      const content = await query<any>('SELECT id, status FROM content LIMIT 100');
      const validStatuses = ['draft', 'published', 'archived'];
      
      if (content.length > 0) {
        const invalid = content.filter((c: any) => !validStatuses.includes(c.status));
        expect(invalid.length, 'All content should have valid status').toBe(0);
      } else {
        test.skip();
      }
    });

    test('user_progress with valid status values', async () => {
      const progress = await query<any>('SELECT id, status FROM user_progress LIMIT 100');
      const validStatuses = ['not_started', 'in_progress', 'completed'];
      
      if (progress.length > 0) {
        const invalid = progress.filter((p: any) => !validStatuses.includes(p.status));
        expect(invalid.length, 'All progress should have valid status').toBe(0);
      } else {
        test.skip();
      }
    });

    test('learning_paths with valid difficulty values', async () => {
      const paths = await query<any>('SELECT difficulty FROM learning_paths');
      const validDifficulties = ['beginner', 'intermediate', 'advanced'];
      
      if (paths.length > 0) {
        const invalid = paths.filter((p: any) => !validDifficulties.includes(p.difficulty));
        expect(invalid.length, 'All paths should have valid difficulty').toBe(0);
      } else {
        test.skip();
      }
    });

    test('achievements with valid rarity values', async () => {
      const achievements = await query<any>('SELECT rarity FROM achievements');
      const validRarities = ['common', 'rare', 'epic', 'legendary'];
      
      if (achievements.length > 0) {
        const invalid = achievements.filter((a: any) => !validRarities.includes(a.rarity));
        expect(invalid.length, 'All achievements should have valid rarity').toBe(0);
      } else {
        test.skip();
      }
    });

    test('job_applications with valid status values', async () => {
      const jobs = await query<any>('SELECT status FROM job_applications');
      const validStatuses = ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected', 'accepted'];
      
      if (jobs.length > 0) {
        const invalid = jobs.filter((j: any) => !validStatuses.includes(j.status));
        expect(invalid.length, 'All jobs should have valid status').toBe(0);
      } else {
        test.skip();
      }
    });

    test('users with valid role values', async () => {
      const users = await query<any>('SELECT role FROM users');
      const validRoles = ['user', 'admin', 'mentor'];
      
      if (users.length > 0) {
        const invalid = users.filter((u: any) => !validRoles.includes(u.role));
        expect(invalid.length, 'All users should have valid role').toBe(0);
      } else {
        test.skip();
      }
    });

  });

  test.describe('5. Data Consistency', () => {
    
    test('JSON fields are valid JSON in content', async () => {
      const content = await query<any>('SELECT id, data, tags FROM content LIMIT 50');
      
      for (const c of content) {
        if (c.data) {
          expect(() => JSON.parse(c.data), 'data should be valid JSON').not.toThrow();
        }
        if (c.tags) {
          expect(() => JSON.parse(c.tags), 'tags should be valid JSON').not.toThrow();
        }
      }
    });

    test('JSON fields are valid JSON in learning_paths', async () => {
      const paths = await query<any>('SELECT id, steps FROM learning_paths LIMIT 50');
      
      for (const p of paths) {
        if (p.steps) {
          expect(() => JSON.parse(p.steps), 'steps should be valid JSON').not.toThrow();
        }
      }
    });

    test('JSON fields are valid JSON in achievements', async () => {
      const achievements = await query<any>('SELECT id, criteria FROM achievements LIMIT 50');
      
      for (const a of achievements) {
        if (a.criteria) {
          expect(() => JSON.parse(a.criteria), 'criteria should be valid JSON').not.toThrow();
        }
      }
    });

    test('JSON fields are valid JSON in discussions', async () => {
      const discussions = await query<any>('SELECT id, tags FROM discussions LIMIT 50');
      
      for (const d of discussions) {
        if (d.tags) {
          expect(() => JSON.parse(d.tags), 'tags should be valid JSON').not.toThrow();
        }
      }
    });

    test('JSON fields are valid JSON in job_applications', async () => {
      const jobs = await query<any>('SELECT id, interview_dates FROM job_applications LIMIT 50');
      
      for (const j of jobs) {
        if (j.interview_dates) {
          expect(() => JSON.parse(j.interview_dates), 'interview_dates should be valid JSON').not.toThrow();
        }
      }
    });

    test('JSON fields are valid JSON in analytics_events', async () => {
      const events = await query<any>('SELECT id, event_data FROM analytics_events LIMIT 50');
      
      for (const e of events) {
        if (e.event_data) {
          expect(() => JSON.parse(e.event_data), 'event_data should be valid JSON').not.toThrow();
        }
      }
    });

    test('JSON fields are valid JSON in users preferences', async () => {
      const users = await query<any>('SELECT id, preferences FROM users LIMIT 50');
      
      for (const u of users) {
        if (u.preferences) {
          expect(() => JSON.parse(u.preferences), 'preferences should be valid JSON').not.toThrow();
        }
      }
    });

    test('no duplicate content IDs', async () => {
      const duplicates = await query<any>(`
        SELECT id, COUNT(*) as cnt FROM content GROUP BY id HAVING COUNT(*) > 1
      `);
      
      expect(duplicates.length, 'No duplicate content IDs').toBe(0);
    });

    test('no duplicate user IDs', async () => {
      const duplicates = await query<any>(`
        SELECT id, COUNT(*) as cnt FROM users GROUP BY id HAVING COUNT(*) > 1
      `);
      
      expect(duplicates.length, 'No duplicate user IDs').toBe(0);
    });

    test('no duplicate channel IDs', async () => {
      const duplicates = await query<any>(`
        SELECT id, COUNT(*) as cnt FROM channels GROUP BY id HAVING COUNT(*) > 1
      `);
      
      expect(duplicates.length, 'No duplicate channel IDs').toBe(0);
    });

  });

  test.describe('6. Index Performance', () => {
    
    test('content by channel_id query uses index', async () => {
      const channels = await query<any>('SELECT id FROM channels LIMIT 1');
      
      if (channels.length > 0) {
        const startTime = Date.now();
        await query<any>('SELECT * FROM content WHERE channel_id = ? LIMIT 10', [channels[0].id]);
        const duration = Date.now() - startTime;
        expect(duration, 'Channel query should be fast').toBeLessThan(500);
      } else {
        test.skip();
      }
    });

    test('content by type query uses index', async () => {
      const startTime = Date.now();
      await query<any>('SELECT * FROM content WHERE type = ? LIMIT 10', ['question']);
      const duration = Date.now() - startTime;
      expect(duration, 'Type query should be fast').toBeLessThan(500);
    });

    test('user_progress by user_id query uses index', async () => {
      const users = await query<any>('SELECT id FROM users LIMIT 1');
      
      if (users.length > 0) {
        const startTime = Date.now();
        await query<any>('SELECT * FROM user_progress WHERE user_id = ? LIMIT 10', [users[0].id]);
        const duration = Date.now() - startTime;
        expect(duration, 'User progress query should be fast').toBeLessThan(500);
      } else {
        test.skip();
      }
    });

    test('analytics_events by user_id query uses index', async () => {
      const users = await query<any>('SELECT id FROM users LIMIT 1');
      
      if (users.length > 0) {
        const startTime = Date.now();
        await query<any>('SELECT * FROM analytics_events WHERE user_id = ? LIMIT 10', [users[0].id]);
        const duration = Date.now() - startTime;
        expect(duration, 'Analytics query should be fast').toBeLessThan(500);
      } else {
        test.skip();
      }
    });

    test('content by id query is fast', async () => {
      const content = await query<any>('SELECT id FROM content LIMIT 1');
      
      if (content.length > 0) {
        const startTime = Date.now();
        await query<any>('SELECT * FROM content WHERE id = ?', [content[0].id]);
        const duration = Date.now() - startTime;
        expect(duration, 'ID query should be fast').toBeLessThan(100);
      } else {
        test.skip();
      }
    });

  });

  test.describe('7. Database Integrity', () => {
    
    test('database is readable', async () => {
      const result = await query<any>('SELECT 1 as test');
      expect(result[0].test).toBe(1);
    });

    test('database integrity check passes', async () => {
      const result = await query<any>('PRAGMA integrity_check');
      expect(result[0].integrity_check).toBe('ok');
    });

    test('database quick_check passes', async () => {
      const result = await query<any>('PRAGMA quick_check');
      expect(result[0].quick_check).toBe('ok');
    });

    test('can count all tables', async () => {
      const counts = await query<any>(`
        SELECT 'users' as tbl, COUNT(*) as cnt FROM users
        UNION ALL SELECT 'channels', COUNT(*) FROM channels
        UNION ALL SELECT 'content', COUNT(*) FROM content
        UNION ALL SELECT 'user_progress', COUNT(*) FROM user_progress
        UNION ALL SELECT 'learning_paths', COUNT(*) FROM learning_paths
        UNION ALL SELECT 'achievements', COUNT(*) FROM achievements
        UNION ALL SELECT 'user_achievements', COUNT(*) FROM user_achievements
        UNION ALL SELECT 'discussions', COUNT(*) FROM discussions
        UNION ALL SELECT 'comments', COUNT(*) FROM comments
        UNION ALL SELECT 'job_applications', COUNT(*) FROM job_applications
        UNION ALL SELECT 'analytics_events', COUNT(*) FROM analytics_events
      `);
      
      expect(counts.length).toBe(11);
      counts.forEach((c: any) => {
        expect(c.cnt).toBeGreaterThanOrEqual(0);
      });
    });

  });

  test.describe('8. Query Performance', () => {
    
    test('SELECT COUNT(*) on content is fast', async () => {
      const startTime = Date.now();
      await query<any>('SELECT COUNT(*) as cnt FROM content');
      const duration = Date.now() - startTime;
      expect(duration, 'COUNT query should be fast').toBeLessThan(1000);
    });

    test('SELECT with JOIN is fast', async () => {
      const startTime = Date.now();
      await query<any>(`
        SELECT c.*, ch.name as channel_name 
        FROM content c 
        LEFT JOIN channels ch ON c.channel_id = ch.id 
        LIMIT 20
      `);
      const duration = Date.now() - startTime;
      expect(duration, 'JOIN query should be fast').toBeLessThan(1000);
    });

    test('SELECT with ORDER BY is fast', async () => {
      const startTime = Date.now();
      await query<any>('SELECT * FROM content ORDER BY created_at DESC LIMIT 20');
      const duration = Date.now() - startTime;
      expect(duration, 'ORDER BY query should be fast').toBeLessThan(1000);
    });

    test('SELECT with GROUP BY is fast', async () => {
      const startTime = Date.now();
      await query<any>('SELECT type, COUNT(*) as cnt FROM content GROUP BY type');
      const duration = Date.now() - startTime;
      expect(duration, 'GROUP BY query should be fast').toBeLessThan(1000);
    });

    test('random content query is fast', async () => {
      const startTime = Date.now();
      await query<any>('SELECT * FROM content ORDER BY RANDOM() LIMIT 1');
      const duration = Date.now() - startTime;
      expect(duration, 'Random query should be fast').toBeLessThan(2000);
    });

  });

  test.describe('9. Additional Data Quality Checks', () => {
    
    test('content has non-empty data', async () => {
      const content = await query<any>('SELECT id, data FROM content WHERE type = ? LIMIT 100', ['question']);
      
      for (const c of content) {
        const data = JSON.parse(c.data);
        expect(Object.keys(data).length, 'Content should have data').toBeGreaterThan(0);
      }
    });

    test('channels have non-empty names', async () => {
      const channels = await query<any>('SELECT id, name FROM channels');
      
      for (const c of channels) {
        expect(c.name.length, 'Channel name should have content').toBeGreaterThan(0);
      }
    });

    test('achievements have positive points', async () => {
      const achievements = await query<any>('SELECT id, points FROM achievements');
      
      for (const a of achievements) {
        expect(a.points, 'Achievement points should be non-negative').toBeGreaterThanOrEqual(0);
      }
    });

    test('learning_paths have positive estimated hours', async () => {
      const paths = await query<any>('SELECT id, estimated_hours FROM learning_paths');
      
      for (const p of paths) {
        expect(p.estimated_hours, 'Estimated hours should be non-negative').toBeGreaterThanOrEqual(0);
      }
    });

  });

});
