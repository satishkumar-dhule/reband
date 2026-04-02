import { Switch, Route, useLocation, Router } from "wouter";
import { Suspense, lazy, useState, useEffect, ReactNode, useMemo } from "react";
import { useUserPreferences } from "./context/UserPreferencesContext";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "@/context/ThemeContext";
import { CreditsProvider } from "@/context/CreditsContext";
import { AchievementProvider } from "@/context/AchievementContext";
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import { UnifiedNotificationManager } from "@/components/UnifiedNotificationManager";
import { LiveRegionProvider } from "@/components/LiveRegion";
import { SidebarProvider } from "@/context/SidebarContext";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import { OfflineBanner } from "@/components/OfflineBanner";
import NotFound from "@/pages/not-found";

// Import prefetch utilities
import { 
  registerRouteForPrefetch, 
  prefetchCriticalRoutes, 
} from './lib/prefetch';

/**
 * Preload heavy modules in background using requestIdleCallback.
 * Uses browser idle time instead of arbitrary setTimeout delays,
 * ensuring initial render and user interaction are never blocked.
 * 
 * Connection-aware: skips heavy preloads on slow connections.
 */
function preloadHeavyModules() {
  if (typeof window === 'undefined') return;

  // Skip preloading on slow connections to save bandwidth
  const conn = (navigator as any).connection;
  const isSlowConnection = conn && (conn.saveData || conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g');
  if (isSlowConnection) return;

  // Priority-ordered list of heavy modules to preload during idle time
  const heavyModules = [
    { name: 'Mermaid', importFn: () => import('mermaid/dist/mermaid.esm.mjs'), priority: 3 },
    { name: 'Syntax highlighter', importFn: () => import('react-syntax-highlighter'), priority: 2 },
    { name: 'React markdown', importFn: () => import('react-markdown'), priority: 1 },
  ];

  // Sort by priority (highest first)
  heavyModules.sort((a, b) => b.priority - a.priority);

  // Preload each module during a separate idle callback
  // This ensures the browser can interleave user interactions between preloads
  heavyModules.forEach((mod, index) => {
    const load = () => {
      mod.importFn()
        .then(() => {/* Module preloaded silently */})
        .catch(() => {/* Silently fail — module will load on demand */});
    };

    if ('requestIdleCallback' in window) {
      // Stagger each module load into its own idle callback
      // Higher priority modules get shorter timeouts (loaded sooner)
      const timeout = index === 0 ? 2000 : index === 1 ? 4000 : 6000;
      requestIdleCallback(load, { timeout });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(load, 2000 + index * 1500);
    }
  });
}

// Register routes for prefetching
function registerRoutesForPrefetching() {
  // Register critical routes for hover prefetching
  registerRouteForPrefetch('/channels', () => import('@/pages/AllChannels'));
  registerRouteForPrefetch('/channel/:id', () => import('@/pages/QuestionViewer'));
  registerRouteForPrefetch('/voice-interview', () => import('@/pages/VoicePractice'));
  registerRouteForPrefetch('/voice-session', () => import('@/pages/VoiceSession'));
  registerRouteForPrefetch('/coding', () => import('@/pages/CodingChallenge'));
  registerRouteForPrefetch('/review', () => import('@/pages/ReviewSession'));
  registerRouteForPrefetch('/stats', () => import('@/pages/Stats'));
  registerRouteForPrefetch('/learning-paths', () => import('@/pages/LearningPaths'));
  registerRouteForPrefetch('/badges', () => import('@/pages/Badges'));
  registerRouteForPrefetch('/certifications', () => import('@/pages/Certifications'));
  registerRouteForPrefetch('/tests', () => import('@/pages/Tests'));
}

const Home = lazy(() => import("@/pages/Home"));
const Channels = lazy(() => import("@/pages/AllChannels"));
const QuestionViewer = lazy(() => import("@/pages/QuestionViewer"));
const VoicePractice = lazy(() => import("@/pages/VoicePractice"));
const VoiceSession = lazy(() => import("@/pages/VoiceSession"));
const Stats = lazy(() => import("@/pages/Stats"));
const Bookmarks = lazy(() => import("@/pages/Bookmarks"));
const Profile = lazy(() => import("@/pages/Profile"));
const ReviewSession = lazy(() => import("@/pages/ReviewSession"));
const CodingChallenge = lazy(() => import("@/pages/CodingChallenge"));
const LearningPaths = lazy(() => import("@/pages/LearningPaths"));
const Badges = lazy(() => import("@/pages/Badges"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Certifications = lazy(() => import("@/pages/Certifications"));
const CertificationPractice = lazy(() => import("@/pages/CertificationPractice"));
const CertificationExam = lazy(() => import("@/pages/CertificationExam"));
const Tests = lazy(() => import("@/pages/Tests"));
const TestSession = lazy(() => import("@/pages/TestSession"));
const MyPath = lazy(() => import("@/pages/MyPath"));
const BotActivity = lazy(() => import("@/pages/BotActivity"));
const TrainingMode = lazy(() => import("@/pages/TrainingMode"));
const About = lazy(() => import("@/pages/About"));
const WhatsNew = lazy(() => import("@/pages/WhatsNew"));

/**
 * OnboardingGuard — no longer forces users through onboarding.
 * All routes are freely accessible; progress is stored in the browser.
 */
function OnboardingGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

// Lightweight suspense fallback — minimal flicker on navigation
function EnhancedSuspenseFallback() {
  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center" id="main-content">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--gh-accent-fg)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    </main>
  );
}

function MinimalApp() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Memoize the Suspense component to prevent unnecessary re-renders
  const suspenseFallback = useMemo(() => <EnhancedSuspenseFallback />, []);

  return (
    <Suspense fallback={suspenseFallback}>
      <Switch>
        {/* Channels */}
        <Route path="/channels" component={Channels} />
        
        {/* Channel routes */}
        <Route path="/channel/:id" component={QuestionViewer} />
        <Route path="/channel/:id/:questionId" component={QuestionViewer} />
        
        {/* Voice routes */}
        <Route path="/voice-interview" component={VoicePractice} />
        <Route path="/voice-session" component={VoiceSession} />
        
        {/* Coding routes */}
        <Route path="/coding" component={CodingChallenge} />
        <Route path="/coding/:id" component={CodingChallenge} />
        
        {/* Protected routes - require user data */}
        <Route path="/review" component={ReviewSession} />
        <Route path="/stats" component={Stats} />
        <Route path="/bookmarks" component={Bookmarks} />
        <Route path="/profile" component={Profile} />
        <Route path="/learning-paths" component={LearningPaths} />
        <Route path="/badges" component={Badges} />
        <Route path="/certifications" component={Certifications} />
        <Route path="/certification/:id/exam" component={CertificationExam} />
        <Route path="/certification/:id" component={CertificationPractice} />
        <Route path="/tests" component={Tests} />
        <Route path="/test/:channelId" component={TestSession} />
        <Route path="/my-path" component={MyPath} />
        
        {/* Public-only route */}
        <Route path="/onboarding" component={Onboarding} />
        
        {/* About & What's New */}
        <Route path="/about" component={About} />
        <Route path="/whats-new" component={WhatsNew} />

        {/* Bot activity */}
        <Route path="/bot-activity" component={BotActivity} />
        
        {/* Training */}
        <Route path="/training" component={TrainingMode} />
        
        {/* Home route - must come BEFORE catch-all */}
        <Route path="/" component={Home} />
        
        {/* 404 - catch-all must be LAST */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function FullApp() {
  // Preload heavy modules once on app mount
  useEffect(() => {
    preloadHeavyModules();
    prefetchCriticalRoutes();
  }, []);
  
  return (
    <Router>
      <LiveRegionProvider>
        <SidebarProvider>
        <CreditsProvider>
          <AchievementProvider>
            <UnifiedNotificationManager>
              <ProtectedRoute protectedRoutes={["/review", "/stats", "/bookmarks", "/profile", "/learning-paths", "/badges", "/my-path", "/certifications", "/tests"]}>
                <PublicRoute publicOnlyRoutes={["/onboarding"]} redirectTo="/">
                  <OfflineBanner />
                  <OnboardingGuard>
                    <MinimalApp />
                  </OnboardingGuard>
                </PublicRoute>
              </ProtectedRoute>
            </UnifiedNotificationManager>
          </AchievementProvider>
        </CreditsProvider>
        </SidebarProvider>
      </LiveRegionProvider>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserPreferencesProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <div className="min-h-screen">
                {/* Skip Navigation Link - P0 Accessibility Fix */}
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--gh-btn-primary-bg)] focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--gh-btn-primary-bg)]"
                >
                  Skip to main content
                </a>
                <FullApp />
              </div>
            </TooltipProvider>
          </QueryClientProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
