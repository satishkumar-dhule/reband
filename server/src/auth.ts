import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as authSchema from "./auth-schema";

const libsqlClient = createClient({ url: "file:local.db" });
const db = drizzle(libsqlClient, { schema: authSchema });

const replitDomain = process.env.REPLIT_DOMAINS
  ? `https://${process.env.REPLIT_DOMAINS}`
  : null;

const replitDevDomain = process.env.REPLIT_DEV_DOMAIN
  ? `https://${process.env.REPLIT_DEV_DOMAIN}`
  : null;

const trustedOrigins = [
  "http://localhost:5000",
  "http://localhost:5001",
  "http://localhost:5173",
  "https://stage-open-interview.github.io",
  "https://open-interview.github.io",
  ...(replitDomain ? [replitDomain] : []),
  ...(replitDevDomain ? [replitDevDomain] : []),
];

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
