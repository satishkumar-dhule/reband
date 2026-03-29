import { Switch, Route, useLocation } from "wouter";
import { Suspense, lazy, useState, useEffect, ReactNode } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "@/context/ThemeContext";
import { CreditsProvider } from "@/context/CreditsContext";
import { AchievementProvider } from "@/context/AchievementContext";
import { UserPreferencesProvider } from "@/context/UserPreferencesContext";
import { UnifiedNotificationProvider } from "@/components/UnifiedNotificationManager";
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

function MinimalApp() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <Suspense fallback={<SkeletonLoader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/channels" component={Channels} />
        <Route path="/channel/:id" component={QuestionViewer} />
        <Route path="/channel/:id/:questionId" component={QuestionViewer} />
        <Route path="/voice-interview" component={VoicePractice} />
        <Route path="/voice-session" component={VoiceSession} />
        <Route path="/review" component={ReviewSession} />
        <Route path="/coding" component={CodingChallenge} />
        <Route path="/coding/:id" component={CodingChallenge} />
        <Route path="/stats" component={Stats} />
        <Route path="/bookmarks" component={Bookmarks} />
        <Route path="/profile" component={Profile} />
        <Route path="/learning-paths" component={LearningPaths} />
        <Route path="/badges" component={Badges} />
        <Route path="/onboarding" component={Onboarding} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function FullApp() {
  return (
    <CreditsProvider>
      <AchievementProvider>
        <UnifiedNotificationProvider>
          <MinimalApp />
        </UnifiedNotificationProvider>
      </AchievementProvider>
    </CreditsProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserPreferencesProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <FullApp />
            </TooltipProvider>
          </QueryClientProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
