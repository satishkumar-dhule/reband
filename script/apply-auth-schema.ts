/**
 * Script to apply Better Auth schema to SQLite database
 * Run: npx tsx script/apply-auth-schema.ts
 */

import { createClient } from "@libsql/client";

const client = createClient({
  url: "file:local.db",
});

const schema = `
-- Better Auth tables (user, session, account, verification)

CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "email_verified" integer NOT NULL DEFAULT 0,
  "image" text,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY NOT NULL,
  "expires_at" text,
  "token" text NOT NULL UNIQUE,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY NOT NULL,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" text,
  "refresh_token_expires_at" text,
  "scope" text,
  "password" text,
  "created_at" text NOT NULL,
  "updated_at" text NOT NULL
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" text NOT NULL,
  "created_at" text,
  "updated_at" text
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS "session_user_id" ON "session"("user_id");
CREATE INDEX IF NOT EXISTS "session_token" ON "session"("token");
CREATE INDEX IF NOT EXISTS "account_user_id" ON "account"("user_id");
CREATE INDEX IF NOT EXISTS "account_provider" ON "account"("provider_id", "account_id");
CREATE INDEX IF NOT EXISTS "verification_identifier" ON "verification"("identifier");
`;

async function main() {
  console.log("Applying Better Auth schema...");
  
  try {
    await client.execute({ sql: schema, args: [] });
    console.log("Schema applied successfully!");
  } catch (error) {
    console.error("Error applying schema:", error);
    process.exit(1);
  }
}

main();