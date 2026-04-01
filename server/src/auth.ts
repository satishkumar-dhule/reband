import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { client } from "../db";

export const auth = betterAuth({
  database: drizzleAdapter(client, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  trustedOrigins: [
    "http://localhost:5000",
    "http://localhost:5001",
    "http://localhost:5173",
    "https://stage-open-interview.github.io",
    "https://open-interview.github.io",
  ],
});