import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BETTER_AUTH_URL || "https://open-interview.github.io",
  basePath: "/api/auth",
});

// Export types for use throughout the app
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;

// Helper hooks/functions
export const { useSession, signIn, signOut, signUp, getSession } = authClient;