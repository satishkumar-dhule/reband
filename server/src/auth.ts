/**
 * Better Auth configuration for DevPrep/Open-Interview
 * 
 * Provides authentication via email/password with session management.
 * Uses Drizzle ORM adapter for SQLite (libsql) database.
 * 
 * @module auth
 * @requires better-auth
 * @requires better-auth/adapters/drizzle
 * @requires drizzle-orm/libsql
 * @requires @libsql/client
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as authSchema from "./auth-schema";

// Initialize libsql client for local SQLite database
const libsqlClient = createClient({ url: "file:local.db" });

// Create Drizzle ORM instance with auth schema
const db = drizzle(libsqlClient, { schema: authSchema });

// Build trusted origins list from environment variables
const replitDomain = process.env.REPLIT_DOMAINS
  ? `https://${process.env.REPLIT_DOMAINS}`
  : null;

const replitDevDomain = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : null;

// Trusted origins for CORS and session security
const trustedOrigins = [
  "http://localhost:5000",
  "http://localhost:5001",
  "http://localhost:5173",
  "https://stage-open-interview.github.io",
  "https://open-interview.github.io",
  ...(replitDomain ? [replitDomain] : []),
  ...(replitDevDomain ? [replitDevDomain] : []),
];

/**
 * Better Auth instance configured for DevPrep
 * 
 * Features:
 * - Email/password authentication
 * - 7-day session expiration with daily age updates
 * - CORS protection via trusted origins
 * 
 * @example
 * // Use in API routes:
 * import { auth } from './auth';
 * 
 * // Protect a route:
 * app.get('/api/protected', auth.session, (req, res) => {
 *   res.json({ user: req.session.user });
 * });
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: authSchema,
  }),
  baseURL: process.env.BETTER_AUTH_URL ||
    (process.env.REPLIT_DOMAINS
      ? `https://${process.env.REPLIT_DOMAINS}`
      : "http://localhost:5000"),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins,
});
