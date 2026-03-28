import "dotenv/config";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@shared/schema";

const rawUrl = process.env.TURSO_DATABASE_URL ?? "file:local.db";
// Fall back to local SQLite if the URL is a placeholder or missing
const url = (rawUrl && rawUrl.startsWith("libsql://") && !rawUrl.includes("your-database"))
  ? rawUrl
  : "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

export const client = createClient({
  url,
  authToken: url.startsWith("file:") ? undefined : authToken,
});

export const db = drizzle(client, { schema });
