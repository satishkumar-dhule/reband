import { Switch, Route, useLocation } from "wouter";
import { Suspense, lazy, useState, useEffect, ReactNode } from "react";
import { useUserPreferences } from "./context/UserPreferencesContext";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "@/context/ThemeContext";
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import { CreditsProvider } from "@/context/CreditsContext";
import { LiveRegionProvider } from "@/components/LiveRegion";
import { ProtectedRoute, PublicRoute } from "@/components/ProtectedRoute";
import NotFound from "@/pages/not-found";
import { SkeletonLoader } from "@/components/mobile/SkeletonLoader";

const Home = lazy(() => import("@/pages/Home"));
const Channels = lazy(() => import("@/pages/AllChannelsGenZ"));
const QuestionViewer = lazy(() => import("@/pages/QuestionViewerGenZ"));
const VoicePractice = lazy(() => import("@/pages/VoicePracticeGenZ"));
const VoiceSession = lazy(() => import("@/pages/VoiceSessionGenZ"));
const Stats = lazy(() => import("@/pages/StatsGenZ"));
const Bookmarks = lazy(() => import("@/pages/Bookmarks"));
const Profile = lazy(() => import("@/pages/ProfileGenZ"));
const ReviewSession = lazy(() => import("@/pages/ReviewSessionGenZ"));
const CodingChallenge = lazy(() => import("@/pages/CodingChallengeGenZ"));
const LearningPaths = lazy(() => import("@/pages/LearningPathsGenZ"));
const Badges = lazy(() => import("@/pages/BadgesGenZ"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const Certifications = lazy(() => import("@/pages/CertificationsGenZ"));
const Tests = lazy(() => import("@/pages/TestsGenZ"));
const MyPath = lazy(() => import("@/pages/MyPathGenZ"));
const BotActivity = lazy(() => import("@/pages/BotActivity"));

/**
 * OnboardingGuard - Redirects new users to onboarding
 * Handles user journey: new users get guided to onboarding flow
 */
function OnboardingGuard({ children }: { children: ReactNode }) {
  const { needsOnboarding } = useUserPreferences();
  const [location, setLocation] = useLocation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Wait for hydration
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (isReady && needsOnboarding && location !== '/onboarding') {
      // Redirect new users to onboarding
      setLocation('/onboarding');
    }
  }, [isReady, needsOnboarding, location, setLocation]);

  // Don't render children until ready to prevent flash
  if (isReady && needsOnboarding && location !== '/onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--gh-canvas-subtle)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--gh-accent-emphasis)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--gh-fg-muted)]">Setting up your experience...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function MinimalApp() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Suspense fallback={<SkeletonLoader />}>
      <Switch>
        {/* Public routes - no auth required */}
        <Route path="/" component={Home} />
        <Route path="/channels" component={Channels} />
        <Route path="/channel/:id" component={QuestionViewer} />
        <Route path="/channel/:id/:questionId" component={QuestionViewer} />
        <Route path="/voice-interview" component={VoicePractice} />
        <Route path="/voice-session" component={VoiceSession} />
        <Route path="/coding" component={CodingChallenge} />
        <Route path="/coding/:id" component={CodingChallenge} />
        
        {/* Protected routes - require user data */}
        <ProtectedRoute protectedRoutes={["/review", "/stats", "/bookmarks", "/profile", "/learning-paths", "/badges", "/my-path", "/certifications", "/tests"]}>
          <Route path="/review" component={ReviewSession} />
          <Route path="/stats" component={Stats} />
          <Route path="/bookmarks" component={Bookmarks} />
          <Route path="/profile" component={Profile} />
          <Route path="/learning-paths" component={LearningPaths} />
          <Route path="/badges" component={Badges} />
          <Route path="/certifications" component={Certifications} />
          <Route path="/tests" component={Tests} />
          <Route path="/my-path" component={MyPath} />
        </ProtectedRoute>
        
        {/* Public-only route - redirect authenticated users away */}
        <PublicRoute publicOnlyRoutes={["/onboarding"]} redirectTo="/">
          <Route path="/onboarding" component={Onboarding} />
        </PublicRoute>
        
        <Route path="/bot-activity" component={BotActivity} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function FullApp() {
  return (
    <LiveRegionProvider>
      <OnboardingGuard>
        <MinimalApp />
      </OnboardingGuard>
    </LiveRegionProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserPreferencesProvider>
          <CreditsProvider>
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
          </CreditsProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
