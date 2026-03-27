import { Switch, Route } from "wouter";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeProvider } from "./context/ThemeContext";
import { CreditsProvider } from "./context/CreditsContext";
import { AchievementProvider } from "./context/AchievementContext";
import { UserPreferencesProvider } from "./context/UserPreferencesContext";
import NotFound from "@/pages/not-found";

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

const Loader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

function Router() {
  return (
    <Suspense fallback={<Loader />}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/channels" component={Channels} />
        <Route path="/channel/:id" component={QuestionViewer} />
        <Route path="/channel/:id/:questionId" component={QuestionViewer} />
        <Route path="/voice-interview" component={VoicePractice} />
        <Route path="/voice-session" component={VoiceSession} />
        <Route path="/voice-session/:questionId" component={VoiceSession} />
        <Route path="/review" component={ReviewSession} />
        <Route path="/coding" component={CodingChallenge} />
        <Route path="/coding/:id" component={CodingChallenge} />
        <Route path="/stats" component={Stats} />
        <Route path="/bookmarks" component={Bookmarks} />
        <Route path="/profile" component={Profile} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UserPreferencesProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <CreditsProvider>
                <AchievementProvider>
                  <Router />
                </AchievementProvider>
              </CreditsProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </UserPreferencesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
