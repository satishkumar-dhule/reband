import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: ReactNode;
  // Routes that require authentication
  protectedRoutes?: string[];
  // Route to redirect to if not authenticated
  redirectTo?: string;
}

/**
 * ProtectedRoute component - wraps routes that require authentication
 * 
 * For this static app, we check localStorage for user progress/preferences
 * as a proxy for "authentication". In a real app, this would check
 * an auth context or JWT token.
 */
export function ProtectedRoute({
  children,
  protectedRoutes = ["/profile", "/bookmarks", "/stats", "/badges", "/learning-paths", "/my-path"],
  redirectTo = "/onboarding",
}: ProtectedRouteProps) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if user has any progress or preferences stored
    // This is a simple heuristic - in production would use proper auth
    const hasUserData = () => {
      // Check for any progress in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("progress-") || key.startsWith("marked-") || key === "user-preferences")) {
          return true;
        }
      }
      return false;
    };

    const isProtectedRoute = protectedRoutes.some(route => 
      location === route || location.startsWith(route + "/")
    );

    if (isProtectedRoute && !hasUserData()) {
      // User is accessing protected route without any data - redirect to onboarding
      setLocation(redirectTo, { replace: true });
    }
  }, [location, protectedRoutes, redirectTo, setLocation]);

  return <>{children}</>;
}

/**
 * PublicRoute component - redirects already authenticated users away
 * (e.g., from /onboarding if user already has data)
 */
export function PublicRoute({
  children,
  publicOnlyRoutes = ["/onboarding"],
  redirectTo = "/",
}: {
  children: ReactNode;
  publicOnlyRoutes?: string[];
  redirectTo?: string;
}) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if user has any progress stored
    const hasUserData = () => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("progress-") || key.startsWith("marked-") || key === "user-preferences")) {
          return true;
        }
      }
      return false;
    };

    const isPublicOnlyRoute = publicOnlyRoutes.includes(location);

    if (isPublicOnlyRoute && hasUserData()) {
      // User is on public-only route (like onboarding) but already has data
      setLocation(redirectTo, { replace: true });
    }
  }, [location, publicOnlyRoutes, redirectTo, setLocation]);

  return <>{children}</>;
}
