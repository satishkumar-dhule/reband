import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

// Auth token keys and configuration
const AUTH_TOKEN_KEY = 'devprep-auth-token';
const AUTH_EXPIRY_KEY = 'devprep-auth-expiry';
const AUTH_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Set authentication token with expiry timestamp
 * Call this after successful login/onboarding completion
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_EXPIRY_KEY, String(Date.now() + AUTH_DURATION_MS));
}

/**
 * Check if user is currently authenticated with valid (non-expired) token
 */
export function isAuthenticated(): boolean {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const expiry = localStorage.getItem(AUTH_EXPIRY_KEY);
  
  if (!token || !expiry) return false;
  
  // Check if token has expired
  if (Date.now() > parseInt(expiry, 10)) {
    clearAuthToken();
    return false;
  }
  
  return true;
}

/**
 * Clear authentication token and expiry
 */
export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_EXPIRY_KEY);
}

interface ProtectedRouteProps {
  children: ReactNode;
  protectedRoutes?: string[];
  redirectTo?: string;
}

/**
 * ProtectedRoute wrapper - redirects unauthenticated users away from protected routes
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
