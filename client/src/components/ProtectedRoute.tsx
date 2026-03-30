import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { PreferencesStorage } from "../services/storage.service";

/**
 * Check if user has completed onboarding (i.e., is "authenticated" in this app)
 */
export function isAuthenticated(): boolean {
  try {
    return PreferencesStorage.get().onboardingComplete === true;
  } catch {
    return false;
  }
}

// Keep these exports for backward compatibility with tests
export function setAuthToken(_token: string): void {
  // No-op: authentication is now determined by onboardingComplete in user-preferences
}

export function getAuthToken(): string | null {
  return isAuthenticated() ? 'onboarding-complete' : null;
}

export function clearAuthToken(): void {
  // No-op: use user preferences to manage auth state
}

interface ProtectedRouteProps {
  children: ReactNode;
  protectedRoutes?: string[];
  redirectTo?: string;
}

/**
 * ProtectedRoute wrapper - redirects users who haven't completed onboarding
 */
export function ProtectedRoute({
  children,
  protectedRoutes = ["/review", "/stats", "/bookmarks", "/profile", "/learning-paths", "/badges", "/my-path", "/certifications", "/tests"],
  redirectTo = "/onboarding",
}: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const isProtectedRoute = protectedRoutes.some(route =>
      location === route || location.startsWith(route + "/")
    );

    if (isProtectedRoute && !isAuthenticated()) {
      setLocation(redirectTo, { replace: true });
    }
  }, [location, protectedRoutes, redirectTo, setLocation]);

  return <>{children}</>;
}

interface PublicRouteProps {
  children: ReactNode;
  publicOnlyRoutes?: string[];
  redirectTo?: string;
}

/**
 * PublicRoute wrapper - redirects authenticated users away from public-only routes
 */
export function PublicRoute({
  children,
  publicOnlyRoutes = ["/onboarding"],
  redirectTo = "/",
}: PublicRouteProps) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const isPublicOnlyRoute = publicOnlyRoutes.includes(location);

    if (isPublicOnlyRoute && isAuthenticated()) {
      setLocation(redirectTo, { replace: true });
    }
  }, [location, publicOnlyRoutes, redirectTo, setLocation]);

  return <>{children}</>;
}
