import { Switch, Route, useLocation, Router } from "wouter";
import { Suspense, lazy, useEffect, ReactNode, startTransition, ComponentType } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary, RouteErrorBoundary } from "./components/ErrorBoundary";
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
import {
  HomeSkeleton,
  ChannelsSkeleton,
  QuestionViewerSkeleton,
  CodingSkeleton,
  StatsSkeleton,
  ReviewSkeleton,
  VoiceSkeleton,
  CertificationsSkeleton,
  ProfileSkeleton,
  GenericPageSkeleton,
} from "@/components/skeletons/PageSkeletons";

// Import prefetch utilities
import { 
  registerRouteForPrefetch, 
  prefetchCriticalRoutes, 
} from './lib/prefetch';
import { warmCachesOnIdle } from './lib/queryClient';

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
  registerRouteForPrefetch('/profile', () => import('@/pages/Profile'));
  registerRouteForPrefetch('/learning-paths', () => import('@/pages/LearningPaths'));
  registerRouteForPrefetch('/badges', () => import('@/pages/Badges'));
  registerRouteForPrefetch('/certifications', () => import('@/pages/Certifications'));
  registerRouteForPrefetch('/tests', () => import('@/pages/Tests'));
}

/**
 * Retry wrapper for lazy imports.
 * If a dynamic import fails (e.g. during server restart / HMR),
 * retry once. If the retry also fails, force a full page reload
 * so the browser fetches the latest module from the server.
 */
function lazyWithRetry<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>
) {
  return lazy(() =>
    importFn().catch(() =>
      importFn().catch(() => {
        // Both attempts failed — reload to clear stale module cache
        window.location.reload();
        return importFn();
      })
    )
  );
}

const Home = lazyWithRetry(() => import("@/pages/Home"));
const Channels = lazyWithRetry(() => import("@/pages/AllChannels"));
const QuestionViewer = lazyWithRetry(() => import("@/pages/QuestionViewer"));
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
const PathDetail = lazy(() => import("@/pages/PathDetail"));
const GoExplorer = lazy(() => import("@/pages/GoExplorer"));

/**
 * OnboardingGuard — no longer forces users through onboarding.
 * All routes are freely accessible; progress is stored in the browser.
 */
function OnboardingGuard({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

/** Redirect /stats → /profile (stats merged into profile page) */
function StatsRedirect() {
  const [, nav] = useLocation();
  useEffect(() => { nav('/profile'); }, [nav]);
  return null;
}

/** Wrap a lazy component with its own Suspense + per-route ErrorBoundary + skeleton. */
function S<P extends object>(
  Component: ComponentType<P>,
  Fallback: ComponentType
): ComponentType<P> {
  return function SuspenseRoute(props: P) {
    return (
      <RouteErrorBoundary>
        <Suspense fallback={<Fallback />}>
          <Component {...props} />
        </Suspense>
      </RouteErrorBoundary>
    );
  };
}

const HomeRoute = S(Home, HomeSkeleton);
const ChannelsRoute = S(Channels, ChannelsSkeleton);
const QuestionViewerRoute = S(QuestionViewer, QuestionViewerSkeleton);
const VoicePracticeRoute = S(VoicePractice, VoiceSkeleton);
const VoiceSessionRoute = S(VoiceSession, VoiceSkeleton);
const CodingChallengeRoute = S(CodingChallenge, CodingSkeleton);
const ReviewSessionRoute = S(ReviewSession, ReviewSkeleton);
const StatsRoute = S(Stats, StatsSkeleton);
const BookmarksRoute = S(Bookmarks, GenericPageSkeleton);
const ProfileRoute = S(Profile, ProfileSkeleton);
const LearningPathsRoute = S(LearningPaths, GenericPageSkeleton);
const BadgesRoute = S(Badges, GenericPageSkeleton);
const CertificationsRoute = S(Certifications, CertificationsSkeleton);
const CertificationPracticeRoute = S(CertificationPractice, CertificationsSkeleton);
const CertificationExamRoute = S(CertificationExam, CertificationsSkeleton);
const TestsRoute = S(Tests, GenericPageSkeleton);
const TestSessionRoute = S(TestSession, GenericPageSkeleton);
const MyPathRoute = S(MyPath, GenericPageSkeleton);
const PathDetailRoute = S(PathDetail, GenericPageSkeleton);
const OnboardingRoute = S(Onboarding, GenericPageSkeleton);
const AboutRoute = S(About, GenericPageSkeleton);
const WhatsNewRoute = S(WhatsNew, GenericPageSkeleton);
const BotActivityRoute = S(BotActivity, GenericPageSkeleton);
const TrainingModeRoute = S(TrainingMode, GenericPageSkeleton);
const GoExplorerRoute = S(GoExplorer, GenericPageSkeleton);

function MinimalApp() {
  const [location] = useLocation();

  useEffect(() => {
    startTransition(() => {
      window.scrollTo(0, 0);
    });
  }, [location]);

  return (
    <Switch>
      {/* Channels */}
      <Route path="/channels" component={ChannelsRoute} />

      {/* Channel routes */}
      <Route path="/channel/:id" component={QuestionViewerRoute} />
      <Route path="/channel/:id/:questionId" component={QuestionViewerRoute} />

      {/* Voice routes */}
      <Route path="/voice-interview" component={VoicePracticeRoute} />
      <Route path="/voice-session" component={VoiceSessionRoute} />

      {/* Coding routes */}
      <Route path="/coding" component={CodingChallengeRoute} />
      <Route path="/coding/:id" component={CodingChallengeRoute} />

      {/* Protected routes */}
      <Route path="/review" component={ReviewSessionRoute} />
      <Route path="/stats" component={StatsRedirect} />
      <Route path="/bookmarks" component={BookmarksRoute} />
      <Route path="/profile" component={ProfileRoute} />
      <Route path="/learning-paths" component={LearningPathsRoute} />
      <Route path="/badges" component={BadgesRoute} />
      <Route path="/certifications" component={CertificationsRoute} />
      <Route path="/certification/:id/exam" component={CertificationExamRoute} />
      <Route path="/certification/:id" component={CertificationPracticeRoute} />
      <Route path="/tests" component={TestsRoute} />
      <Route path="/test/:channelId" component={TestSessionRoute} />
      <Route path="/my-path" component={MyPathRoute} />
      <Route path="/path/:id" component={PathDetailRoute} />

      {/* Public-only route */}
      <Route path="/onboarding" component={OnboardingRoute} />

      {/* About & What's New */}
      <Route path="/about" component={AboutRoute} />
      <Route path="/whats-new" component={WhatsNewRoute} />

      {/* Bot activity */}
      <Route path="/bot-activity" component={BotActivityRoute} />

      {/* Training */}
      <Route path="/training" component={TrainingModeRoute} />

      {/* Go API Explorer */}
      <Route path="/go-explorer" component={GoExplorerRoute} />

      {/* Home route — must come BEFORE catch-all */}
      <Route path="/" component={HomeRoute} />

      {/* 404 — catch-all must be LAST */}
      <Route component={NotFound} />
    </Switch>
  );
}

function FullApp() {
  // Preload heavy modules once on app mount
  useEffect(() => {
    preloadHeavyModules();
    prefetchCriticalRoutes();
    warmCachesOnIdle(); // Prefetch static JSON during idle time
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
