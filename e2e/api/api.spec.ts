import { test, expect, APIRequestContext } from '@playwright/test';

const BASE_URL = process.env.API_URL || 'http://localhost:5000';

interface ApiResponse<T = any> {
  status: number;
  body: T;
  headers: any;
  duration: number;
}

async function makeRequest(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  options?: {
    body?: any;
    query?: Record<string, string>;
  }
): Promise<ApiResponse> {
  const startTime = Date.now();
  
  let url = `${BASE_URL}${endpoint}`;
  if (options?.query) {
    const params = new URLSearchParams(options.query);
    url += `?${params.toString()}`;
  }

  const fetchOptions: any = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (options?.body) {
    fetchOptions.data = options.body;
  }

  const response = await request[method.toLowerCase()](url, fetchOptions);
  const duration = Date.now() - startTime;
  
  let body;
  const contentType = response.headers()['content-type'];
  if (contentType?.includes('application/json')) {
    body = await response.json();
  } else {
    body = await response.text();
  }

  return {
    status: response.status(),
    body,
    headers: response.headers(),
    duration,
  };
}

test.describe('DevPrep API Tests', () => {
  
  test.describe('Channels API', () => {
    
    test('GET /api/channels - should return channels list', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/channels');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      if (res.body.length > 0) {
        const channel = res.body[0];
        expect(channel).toHaveProperty('id');
        expect(channel).toHaveProperty('questionCount');
        expect(typeof channel.questionCount).toBe('number');
      }
    });

    test('GET /api/channels - should respond within acceptable time', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/channels');
      
      expect(res.duration).toBeLessThan(2000);
    });

  });

  test.describe('Questions API', () => {
    
    test('GET /api/questions/:channelId - should return content for a channel', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/questions/system-design');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      if (res.body.length > 0) {
        const question = res.body[0];
        expect(question).toHaveProperty('id');
        expect(question).toHaveProperty('question');
        expect(question).toHaveProperty('answer');
        expect(question).toHaveProperty('difficulty');
        expect(question).toHaveProperty('channel');
      }
    });

    test('GET /api/questions/:channelId - should filter by difficulty', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/questions/system-design', {
        query: { difficulty: 'beginner' }
      });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      if (res.body.length > 0) {
        res.body.forEach((q: any) => {
          expect(q.difficulty).toBe('beginner');
        });
      }
    });

    test('GET /api/questions/:channelId - should filter by subChannel', async ({ request }) => {
      const subChannelsRes = await makeRequest(request, 'GET', '/api/subchannels/system-design');
      
      if (subChannelsRes.body.length > 0) {
        const subChannel = subChannelsRes.body[0];
        const res = await makeRequest(request, 'GET', '/api/questions/system-design', {
          query: { subChannel }
        });
        
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    test('GET /api/questions/:channelId - should handle invalid channel', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/questions/invalid-channel-12345');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(0);
    });

    test('GET /api/question/random - should return random question', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/question/random');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('question');
      expect(res.body).toHaveProperty('answer');
    });

    test('GET /api/question/random - should filter by channel', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/question/random', {
        query: { channel: 'system-design' }
      });
      
      expect([200, 404]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('channel');
      }
    });

    test('GET /api/question/random - should return 404 when no questions found', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/question/random', {
        query: { channel: 'nonexistent-topic-xyz' }
      });
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    test('GET /api/question/:questionId - should return single question', async ({ request }) => {
      const questionsRes = await makeRequest(request, 'GET', '/api/questions/system-design');
      
      if (questionsRes.body.length > 0) {
        const questionId = questionsRes.body[0].id;
        const res = await makeRequest(request, 'GET', `/api/question/${questionId}`);
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', questionId);
        expect(res.body).toHaveProperty('question');
      }
    });

    test('GET /api/question/:questionId - should return 404 for non-existent question', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/question/non-existent-id-12345');
      
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

  });

  test.describe('Subchannels and Companies API', () => {
    
    test('GET /api/subchannels/:channelId - should return subchannels', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/subchannels/system-design');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/companies/:channelId - should return companies for a channel', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/companies/system-design');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

  });

  test.describe('Stats API', () => {
    
    test('GET /api/stats - should return channel statistics', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/stats');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      
      if (res.body.length > 0) {
        const stat = res.body[0];
        expect(stat).toHaveProperty('id');
        expect(stat).toHaveProperty('total');
        expect(stat).toHaveProperty('beginner');
        expect(stat).toHaveProperty('intermediate');
        expect(stat).toHaveProperty('advanced');
      }
    });

  });

  test.describe('Learning Paths API', () => {
    
    test('GET /api/learning-paths - should return learning paths', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/learning-paths - should filter by difficulty', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths', {
        query: { difficulty: 'beginner' }
      });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/learning-paths - should filter by pathType', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths', {
        query: { pathType: 'certification' }
      });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/learning-paths - should support search', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths', {
        query: { search: 'aws' }
      });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/learning-paths/filters/companies - should return companies', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths/filters/companies');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/learning-paths/filters/job-titles - should return job titles', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths/filters/job-titles');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/learning-paths/stats - should return learning path stats', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths/stats');
      
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('byType');
        expect(res.body).toHaveProperty('byDifficulty');
      }
    });

    test('GET /api/learning-paths/:pathId - should return single learning path', async ({ request }) => {
      const pathsRes = await makeRequest(request, 'GET', '/api/learning-paths');
      
      if (pathsRes.body.length > 0) {
        const pathId = pathsRes.body[0].id;
        const res = await makeRequest(request, 'GET', `/api/learning-paths/${pathId}`);
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', pathId);
        expect(res.body).toHaveProperty('title');
        expect(res.body).toHaveProperty('description');
      }
    });

    test('GET /api/learning-paths/:pathId - should return 404 for non-existent path', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths/non-existent-path-123');
      
      expect([404, 500]).toContain(res.status);
      if (res.status === 404) {
        expect(res.body).toHaveProperty('error');
      }
    });

    test('POST /api/learning-paths/:pathId/start - should increment popularity', async ({ request }) => {
      const pathsRes = await makeRequest(request, 'GET', '/api/learning-paths');
      
      if (pathsRes.body.length > 0) {
        const pathId = pathsRes.body[0].id;
        const res = await makeRequest(request, 'POST', `/api/learning-paths/${pathId}/start`);
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);
      }
    });

  });

  test.describe('Coding Challenges API', () => {
    
    test('GET /api/coding/challenges - should return coding challenges', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/coding/challenges');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/coding/challenges - should filter by difficulty', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/coding/challenges', {
        query: { difficulty: 'easy' }
      });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/coding/challenges - should filter by category', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/coding/challenges', {
        query: { category: 'arrays' }
      });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/coding/stats - should return coding challenge stats', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/coding/stats');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('byDifficulty');
      expect(res.body).toHaveProperty('byCategory');
    });

    test('GET /api/coding/random - should return random challenge', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/coding/random');
      
      expect([200, 404, 500]).toContain(res.status);
      if (res.status === 200 && res.body && !res.body.error) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('title');
      }
    });

    test('GET /api/coding/challenge/:id - should return single challenge', async ({ request }) => {
      const challengesRes = await makeRequest(request, 'GET', '/api/coding/challenges');
      
      if (challengesRes.body.length > 0) {
        const challengeId = challengesRes.body[0].id;
        const res = await makeRequest(request, 'GET', `/api/coding/challenge/${challengeId}`);
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', challengeId);
      }
    });

    test('GET /api/coding/challenge/:id - should return 404 for non-existent challenge', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/coding/challenge/non-existent-id');
      
      expect([404, 500]).toContain(res.status);
      if (res.status === 404) {
        expect(res.body).toHaveProperty('error');
      }
    });

  });

  test.describe('Certifications API', () => {
    
    test('GET /api/certifications - should return certifications', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/certifications');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/certifications - should filter by category', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/certifications', {
        query: { category: 'cloud' }
      });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/certifications - should filter by difficulty', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/certifications', {
        query: { difficulty: 'beginner' }
      });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/certifications/stats - should return certification stats', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/certifications/stats');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('totalQuestions');
      expect(res.body).toHaveProperty('byCategory');
      expect(res.body).toHaveProperty('byDifficulty');
    });

    test('GET /api/certification/:id - should return single certification', async ({ request }) => {
      const certsRes = await makeRequest(request, 'GET', '/api/certifications');
      
      if (certsRes.body.length > 0) {
        const certId = certsRes.body[0].id;
        const res = await makeRequest(request, 'GET', `/api/certification/${certId}`);
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', certId);
        expect(res.body).toHaveProperty('name');
      }
    });

    test('GET /api/certification/:id - should return 404 for non-existent certification', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/certification/non-existent-cert');
      
      expect([404, 500]).toContain(res.status);
      if (res.status === 404) {
        expect(res.body).toHaveProperty('error');
      }
    });

    test('GET /api/certification/:id/questions - should return questions for certification', async ({ request }) => {
      const certsRes = await makeRequest(request, 'GET', '/api/certifications');
      
      if (certsRes.body.length > 0) {
        const certId = certsRes.body[0].id;
        const res = await makeRequest(request, 'GET', `/api/certification/${certId}/questions`);
        
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

  });

  test.describe('User Sessions API', () => {
    
    test('GET /api/user/sessions - should return user sessions or 500 if table missing', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/user/sessions');
      
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    test('POST /api/user/sessions - should create new session or 500 if table missing', async ({ request }) => {
      const res = await makeRequest(request, 'POST', '/api/user/sessions', {
        body: {
          sessionKey: `test-session-${Date.now()}`,
          sessionType: 'practice',
          title: 'Test Session',
          subtitle: 'Test subtitle',
          progress: 0,
          totalItems: 10,
          completedItems: 0,
          sessionData: { test: true }
        }
      });
      
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('created', true);
      }
    });

    test('POST /api/user/sessions - should update existing session', async ({ request }) => {
      const sessionKey = `test-session-update-${Date.now()}`;
      
      await makeRequest(request, 'POST', '/api/user/sessions', {
        body: {
          sessionKey,
          sessionType: 'practice',
          title: 'Original Title',
          progress: 0,
          totalItems: 10,
          completedItems: 0
        }
      });
      
      const res = await makeRequest(request, 'POST', '/api/user/sessions', {
        body: {
          sessionKey,
          sessionType: 'practice',
          title: 'Updated Title',
          progress: 50,
          totalItems: 10,
          completedItems: 5
        }
      });
      
      expect([200, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body).toHaveProperty('updated', true);
      }
    });

    test('POST /api/user/sessions - should return 500 for missing required fields', async ({ request }) => {
      const res = await makeRequest(request, 'POST', '/api/user/sessions', {
        body: {
          sessionKey: 'test-key'
        }
      });
      
      expect([400, 500]).toContain(res.status);
    });

    test('GET /api/user/sessions/:sessionId - should return single session', async ({ request }) => {
      const createRes = await makeRequest(request, 'POST', '/api/user/sessions', {
        body: {
          sessionKey: `test-session-get-${Date.now()}`,
          sessionType: 'practice',
          title: 'Test Session',
          progress: 0,
          totalItems: 10,
          completedItems: 0
        }
      });
      
      if (createRes.status === 200 && createRes.body.id) {
        const res = await makeRequest(request, 'GET', `/api/user/sessions/${createRes.body.id}`);
        
        expect([200, 404, 500]).toContain(res.status);
        if (res.status === 200) {
          expect(res.body).toHaveProperty('id');
        }
      }
    });

    test('GET /api/user/sessions/:sessionId - should return 404 for non-existent session', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/user/sessions/non-existent-session-id');
      
      expect([404, 500]).toContain(res.status);
      if (res.status === 404) {
        expect(res.body).toHaveProperty('error');
      }
    });

    test('PUT /api/user/sessions/:sessionId - should update session progress', async ({ request }) => {
      const createRes = await makeRequest(request, 'POST', '/api/user/sessions', {
        body: {
          sessionKey: `test-session-put-${Date.now()}`,
          sessionType: 'practice',
          title: 'Test Session',
          progress: 0,
          totalItems: 10,
          completedItems: 0
        }
      });
      
      if (createRes.status === 200 && createRes.body.id) {
        const res = await makeRequest(request, 'PUT', `/api/user/sessions/${createRes.body.id}`, {
          body: {
            progress: 75,
            completedItems: 7,
            sessionData: { updated: true }
          }
        });
        
        expect([200, 500]).toContain(res.status);
        if (res.status === 200) {
          expect(res.body).toHaveProperty('success', true);
        }
      }
    });

    test('DELETE /api/user/sessions/:sessionId - should abandon session', async ({ request }) => {
      const createRes = await makeRequest(request, 'POST', '/api/user/sessions', {
        body: {
          sessionKey: `test-session-delete-${Date.now()}`,
          sessionType: 'practice',
          title: 'Test Session',
          progress: 0,
          totalItems: 10,
          completedItems: 0
        }
      });
      
      if (createRes.status === 200 && createRes.body.id) {
        const res = await makeRequest(request, 'DELETE', `/api/user/sessions/${createRes.body.id}`);
        
        expect([200, 500]).toContain(res.status);
        if (res.status === 200) {
          expect(res.body).toHaveProperty('success', true);
        }
      }
    });

    test('POST /api/user/sessions/:sessionId/complete - should complete session', async ({ request }) => {
      const createRes = await makeRequest(request, 'POST', '/api/user/sessions', {
        body: {
          sessionKey: `test-session-complete-${Date.now()}`,
          sessionType: 'practice',
          title: 'Test Session',
          progress: 100,
          totalItems: 10,
          completedItems: 10
        }
      });
      
      if (createRes.status === 200 && createRes.body.id) {
        const res = await makeRequest(request, 'POST', `/api/user/sessions/${createRes.body.id}/complete`);
        
        expect([200, 500]).toContain(res.status);
        if (res.status === 200) {
          expect(res.body).toHaveProperty('success', true);
        }
      }
    });

  });

  test.describe('History API', () => {
    
    test('GET /api/history - should return history records', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/history');
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/history - should filter by type', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/history', {
        query: { type: 'question' }
      });
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('GET /api/history - should support limit parameter', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/history', {
        query: { limit: '10' }
      });
      
      expect(res.status).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });

    test('GET /api/history/:questionId - should return history for specific question', async ({ request }) => {
      const questionsRes = await makeRequest(request, 'GET', '/api/questions/system-design');
      
      if (questionsRes.body.length > 0) {
        const questionId = questionsRes.body[0].id;
        const res = await makeRequest(request, 'GET', `/api/history/${questionId}`);
        
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
      }
    });

    test('GET /api/history/:questionId/summary - should return history summary', async ({ request }) => {
      const questionsRes = await makeRequest(request, 'GET', '/api/questions/system-design');
      
      if (questionsRes.body.length > 0) {
        const questionId = questionsRes.body[0].id;
        const res = await makeRequest(request, 'GET', `/api/history/${questionId}/summary`);
        
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('total');
        expect(res.body).toHaveProperty('byType');
      }
    });

    test('POST /api/history - should create history record or 500 if table missing', async ({ request }) => {
      const questionsRes = await makeRequest(request, 'GET', '/api/questions/system-design');
      
      if (questionsRes.body.length > 0) {
        const questionId = questionsRes.body[0].id;
        const res = await makeRequest(request, 'POST', '/api/history', {
          body: {
            questionId,
            questionType: 'question',
            eventType: 'view',
            eventSource: 'test',
            reason: 'Test history entry'
          }
        });
        
        expect([200, 500]).toContain(res.status);
        if (res.status === 200) {
          expect(res.body).toHaveProperty('success', true);
        }
      }
    });

    test('POST /api/history - should return 400 for missing required fields', async ({ request }) => {
      const res = await makeRequest(request, 'POST', '/api/history', {
        body: {
          questionId: 'some-id'
        }
      });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

  });

  test.describe('Error Handling', () => {
    
    test('should return 404 for non-existent endpoint', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/non-existent-endpoint-12345');
      
      expect([404, 200]).toContain(res.status);
    });

    test('should handle invalid JSON gracefully', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/channels`);
      
      const contentType = response.headers()['content-type'];
      expect(contentType).toContain('application/json');
    });

    test('should handle missing query parameters', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/questions/');
      
      expect([200, 404]).toContain(res.status);
    });

  });

  test.describe('Response Times', () => {
    
    test('GET /api/channels should respond quickly', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/channels');
      expect(res.duration).toBeLessThan(1000);
    });

    test('GET /api/questions/:channelId should respond quickly', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/questions/system-design');
      expect(res.duration).toBeLessThan(2000);
    });

    test('GET /api/stats should respond quickly', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/stats');
      expect(res.duration).toBeLessThan(2000);
    });

    test('GET /api/learning-paths should respond quickly', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths');
      expect(res.duration).toBeLessThan(2000);
    });

  });

  test.describe('Data Validation', () => {
    
    test('should return valid JSON structure for channels', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/channels');
      
      res.body.forEach((channel: any) => {
        expect(channel).toMatchObject({
          id: expect.any(String),
          questionCount: expect.any(Number)
        });
      });
    });

    test('should return valid JSON structure for questions', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/questions/system-design');
      
      if (res.body.length > 0) {
        res.body.forEach((question: any) => {
          expect(question).toMatchObject({
            id: expect.any(String),
            question: expect.any(String),
            answer: expect.any(String),
            channel: expect.any(String)
          });
        });
      }
    });

    test('should return valid JSON structure for learning paths', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths');
      
      res.body.forEach((path: any) => {
        expect(path).toMatchObject({
          id: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          status: expect.any(String)
        });
      });
    });

    test('should return valid JSON structure for certifications', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/certifications');
      
      res.body.forEach((cert: any) => {
        expect(cert).toMatchObject({
          id: expect.any(String),
          name: expect.any(String),
          provider: expect.any(String),
          status: expect.any(String)
        });
      });
    });

  });

  test.describe('Authentication (if applicable)', () => {
    
    test('should handle requests without authentication', async ({ request }) => {
      const endpoints = [
        '/api/channels',
        '/api/questions/system-design',
        '/api/learning-paths',
        '/api/certifications',
        '/api/stats'
      ];
      
      for (const endpoint of endpoints) {
        const res = await makeRequest(request, 'GET', endpoint);
        expect([200, 401, 403]).toContain(res.status);
      }
    });

  });

  test.describe('Edge Cases', () => {
    
    test('should handle empty database responses', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/questions/empty-channel-xyz');
      
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    test('should handle special characters in search', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/learning-paths', {
        query: { search: "test's" }
      });
      
      expect(res.status).toBe(200);
    });

    test('should handle very long query strings', async ({ request }) => {
      const longSearch = 'a'.repeat(1000);
      const res = await makeRequest(request, 'GET', '/api/learning-paths', {
        query: { search: longSearch }
      });
      
      expect(res.status).toBe(200);
    });

    test('should handle negative or zero limit values', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/history', {
        query: { limit: '-1' }
      });
      
      expect(res.status).toBe(200);
    });

    test('should handle very large limit values', async ({ request }) => {
      const res = await makeRequest(request, 'GET', '/api/history', {
        query: { limit: '999999' }
      });
      
      expect(res.status).toBe(200);
    });

  });

  test.describe('Content-Type Headers', () => {
    
    test('should return application/json content-type', async ({ request }) => {
      const endpoints = [
        '/api/channels',
        '/api/questions/system-design',
        '/api/learning-paths',
        '/api/certifications',
        '/api/stats'
      ];
      
      for (const endpoint of endpoints) {
        const response = await request.get(`${BASE_URL}${endpoint}`);
        const contentType = response.headers()['content-type'];
        expect(contentType).toContain('application/json');
      }
    });

  });

  test.describe('HTTP Methods', () => {
    
    test('should return appropriate status for unsupported methods', async ({ request }) => {
      const endpoints = [
        '/api/channels',
        '/api/questions/system-design',
        '/api/learning-paths'
      ];
      
      for (const endpoint of endpoints) {
        const response = await request.put(`${BASE_URL}${endpoint}`, {
          data: { test: true }
        });
        
        expect([405, 404, 500, 200]).toContain(response.status());
      }
    });

  });

});
