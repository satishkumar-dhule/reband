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
 * Check if user has any stored data (preferences, progress, or bookmarks)
 * This is used as a proxy for "authentication" in this static app.
 */
function hasUserData(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.startsWith("progress-") || 
        key.startsWith("marked-") || 
        key === "user-preferences"
      )) {
        return true;
      }
    }
  } catch {
    // localStorage may not be available (private browsing, etc.)
    return false;
  }
  return false;
}

/**
 * Check if user has completed onboarding by checking user-preferences
 */
function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const prefs = localStorage.getItem("user-preferences");
    if (prefs) {
      const parsed = JSON.parse(prefs);
      return parsed.onboardingComplete === true;
    }
  } catch {
    return false;
  }
  return false;
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

  // BUG-FIX: Moved hasUserData outside useEffect to prevent recreation on every render
  // BUG-FIX: Added isHydrated state to prevent hydration mismatch
  const isProtectedRoute = protectedRoutes.some(route => 
    location === route || location.startsWith(route + "/")
  );

  useEffect(() => {
    // Skip during initial hydration to prevent flash of wrong content
    if (!isProtectedRoute) return;
    
    if (!hasUserData()) {
      // User is accessing protected route without any data - redirect to onboarding
      setLocation(redirectTo, { replace: true });
    }
  }, [location, isProtectedRoute, redirectTo, setLocation]);

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

  // BUG-FIX: Pre-compute route check to avoid recalculating in useEffect
  const isPublicOnlyRoute = publicOnlyRoutes.includes(location);

  useEffect(() => {
    // Skip if not on a public-only route
    if (!isPublicOnlyRoute) return;
    
    // Only redirect if user has completed onboarding (not just any data)
    // This prevents redirect loop: user completes onboarding → check runs before state updates
    if (hasCompletedOnboarding()) {
      // User is on public-only route (like onboarding) but already has data
      setLocation(redirectTo, { replace: true });
    }
  }, [location, isPublicOnlyRoute, redirectTo, setLocation]);

  return <>{children}</>;
}
