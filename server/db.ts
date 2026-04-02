import "dotenv/config";
import { createClient } from "@libsql/client";

const url = "file:local.db";

export const client = createClient({
  url,
});

export const db = client;