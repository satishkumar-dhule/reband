import { ReactNode } from "react";

/**
 * No login required — all data is stored in the browser.
 * isAuthenticated always returns true so SRS, stats, and all
 * features work for every visitor without an account.
 */
export function isAuthenticated(): boolean {
  return true;
}

export function setAuthToken(_token: string): void {}
export function getAuthToken(): string | null { return 'guest'; }
export function clearAuthToken(): void {}

interface ProtectedRouteProps {
  children: ReactNode;
  protectedRoutes?: string[];
  redirectTo?: string;
}

/** Passthrough — no auth gate, every route is publicly accessible. */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}

interface PublicRouteProps {
  children: ReactNode;
  publicOnlyRoutes?: string[];
  redirectTo?: string;
}

/** Passthrough — onboarding is optional, not enforced. */
export function PublicRoute({ children }: PublicRouteProps) {
  return <>{children}</>;
}
