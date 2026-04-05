import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { AppLayout } from '@/lib/ui';
import { SEOHead } from '@/lib/ui';
import { curatedPaths } from '../lib/learning-paths-data';
import { allChannelsConfig } from '../lib/channels-config';
import { Button } from '@/lib/ui';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/lib/ui';
import {
  Home, ChevronRight, Clock, Trophy, CheckCircle2, Circle,
  BookOpen, RotateCcw, ArrowRight, Layers
} from 'lucide-react';

interface ChannelCount {
  id: string;
  questionCount: number;
}

interface CustomPath {
  id: string;
  name: string;
  channels: string[];
  certifications: string[];
  createdAt: string;
}

function getSeenCount(channelId: string): number {
  try {
    const raw = localStorage.getItem(`marked-${channelId}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

function getFlashcardsSeen(channelId: string): number {
  try {
    const raw = localStorage.getItem(`flashcards-progress-${channelId}`);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

export default function PathDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const pathId = params.id;

  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({});
  const [countsLoaded, setCountsLoaded] = useState(false);
  const [, forceUpdate] = useState(0);

  // Find path — check curated paths first, then localStorage custom paths
  const path = useMemo(() => {
    const curated = curatedPaths.find(p => p.id === pathId);
    if (curated) return curated;

    try {
      const customPaths: CustomPath[] = JSON.parse(localStorage.getItem('customPaths') || '[]');
      const custom = customPaths.find(p => p.id === pathId);
      if (custom) {
        return {
          id: custom.id,
          name: custom.name,
          icon: Layers,
          description: `Custom learning path with ${custom.channels.length} channel${custom.channels.length !== 1 ? 's' : ''}`,
          channels: custom.channels,
          difficulty: 'Custom' as any,
          duration: 'Self-paced',
          totalQuestions: 0,
          skills: [],
        };
      }
    } catch {}
    return null;
  }, [pathId]);

  // Fetch channel question counts from API
  useEffect(() => {
    fetch('/api/channels')
      .then(r => r.json())
      .then((data: ChannelCount[]) => {
        const counts: Record<string, number> = {};
        for (const ch of data) {
          counts[ch.id] = Number(ch.questionCount);
        }
        setChannelCounts(counts);
        setCountsLoaded(true);
      })
      .catch(() => setCountsLoaded(true));
  }, []);

  // Mark path as started in localStorage
  useEffect(() => {
    if (!pathId) return;
    try {
      const active: string[] = JSON.parse(localStorage.getItem('activeLearningPaths') || '[]');
      if (!active.includes(pathId)) {
        active.push(pathId);
        localStorage.setItem('activeLearningPaths', JSON.stringify(active));
      }
    } catch {}
  }, [pathId]);

  // Per-channel progress (live from localStorage)
  const channelProgress = useMemo(() => {
    if (!path) return [];
    return path.channels.map(channelId => {
      const config = allChannelsConfig.find(c => c.id === channelId);
      const seen = getSeenCount(channelId);
      const total = channelCounts[channelId] ?? 0;
      const pct = total > 0 ? Math.min(Math.round((seen / total) * 100), 100) : 0;
      return {
        id: channelId,
        name: config?.name ?? channelId,
        description: config?.description ?? '',
        seen,
        total,
        pct,
        flashcardsSeen: getFlashcardsSeen(channelId),
        done: total > 0 && seen >= total,
      };
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, channelCounts, forceUpdate]);

  const overallSeen = channelProgress.reduce((s, c) => s + c.seen, 0);
  const overallTotal = channelProgress.reduce((s, c) => s + c.total, 0);
  const overallPct = overallTotal > 0 ? Math.min(Math.round((overallSeen / overallTotal) * 100), 100) : 0;
  const doneChannels = channelProgress.filter(c => c.done).length;

  if (!path) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <p className="text-[var(--gh-fg-muted)] mb-4">Path not found.</p>
          <Button variant="outline" onClick={() => setLocation('/learning-paths')}>
            Browse Learning Paths
          </Button>
        </div>
      </AppLayout>
    );
  }

  const Icon = path.icon;
  const difficultyColor =
    path.difficulty === 'Beginner' || path.difficulty === 'Beginner Friendly'
      ? 'text-[var(--gh-success-fg)] bg-[var(--gh-success-subtle)] border-[var(--gh-success-muted)]'
      : path.difficulty === 'Intermediate'
      ? 'text-[var(--gh-attention-fg)] bg-[var(--gh-attention-subtle)] border-[var(--gh-attention-muted)]'
      : path.difficulty === 'Advanced'
      ? 'text-[var(--gh-danger-fg)] bg-[var(--gh-danger-subtle)] border-[var(--gh-danger-muted)]'
      : 'text-[var(--gh-fg-muted)] bg-[var(--gh-canvas-subtle)] border-[var(--gh-border)]';

  return (
    <>
      <SEOHead
        title={`${path.name} Path - DevPrep`}
        description={path.description}
        canonical={`https://open-interview.github.io/path/${pathId}`}
      />

      <AppLayout>
        <div className="bg-[var(--gh-canvas-subtle)] min-h-screen">
          <div className="max-w-4xl mx-auto px-4 py-8 lg:px-8">

            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">
                    <Home className="w-3.5 h-3.5 mr-1" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/learning-paths">Learning Paths</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{path.name}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Path Header */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[var(--gh-canvas-default)] border border-[var(--gh-border)] rounded-md p-6 mb-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-md bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-accent-fg)] shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h1 className="text-xl font-semibold text-[var(--gh-fg)]">{path.name}</h1>
                    {path.difficulty !== 'Custom' && (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${difficultyColor}`}>
                        {path.difficulty}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--gh-fg-muted)]">{path.description}</p>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-4 text-xs text-[var(--gh-fg-subtle)] mb-5">
                {path.duration && path.duration !== 'Self-paced' && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {path.duration}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  {path.channels.length} channel{path.channels.length !== 1 ? 's' : ''}
                </div>
                {overallTotal > 0 && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {overallTotal} questions
                  </div>
                )}
              </div>

              {/* Overall progress */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium text-[var(--gh-fg-muted)]">Overall progress</span>
                  <span className="text-xs font-semibold text-[var(--gh-fg)]">
                    {doneChannels}/{path.channels.length} channels complete
                    {overallTotal > 0 && ` · ${overallPct}%`}
                  </span>
                </div>
                <div className="h-2 bg-[var(--gh-border)] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[var(--gh-accent-emphasis)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${overallPct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
                {overallPct === 100 && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-[var(--gh-success-fg)]">
                    <CheckCircle2 className="w-4 h-4" />
                    Path complete! Great work.
                  </div>
                )}
              </div>
            </motion.div>

            {/* Channel list */}
            <h2 className="text-sm font-semibold text-[var(--gh-fg-muted)] uppercase tracking-wide mb-3">
              Channels in this path
            </h2>

            <div className="space-y-3">
              {channelProgress.map((ch, i) => (
                <motion.div
                  key={ch.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-[var(--gh-canvas-default)] border rounded-md p-4 transition-colors ${
                    ch.done
                      ? 'border-[var(--gh-success-muted)]'
                      : 'border-[var(--gh-border)] hover:border-[var(--gh-accent-fg)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Done / not done icon */}
                    <div className="shrink-0">
                      {ch.done ? (
                        <CheckCircle2 className="w-5 h-5 text-[var(--gh-success-fg)]" />
                      ) : (
                        <Circle className="w-5 h-5 text-[var(--gh-border)]" />
                      )}
                    </div>

                    {/* Channel info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`font-medium text-sm ${ch.done ? 'text-[var(--gh-success-fg)]' : 'text-[var(--gh-fg)]'}`}>
                          {ch.name}
                        </span>
                        <span className="text-xs text-[var(--gh-fg-muted)] shrink-0">
                          {countsLoaded
                            ? ch.total > 0
                              ? `${ch.seen} / ${ch.total}`
                              : `${ch.seen} seen`
                            : '…'}
                        </span>
                      </div>

                      {ch.description && (
                        <p className="text-xs text-[var(--gh-fg-muted)] mb-2 truncate">{ch.description}</p>
                      )}

                      {/* Progress bar */}
                      <div className="h-1.5 bg-[var(--gh-border)] rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${ch.done ? 'bg-[var(--gh-success-fg)]' : 'bg-[var(--gh-accent-emphasis)]'}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${ch.pct}%` }}
                          transition={{ duration: 0.5, delay: i * 0.04 }}
                        />
                      </div>
                    </div>

                    {/* Go to channel button */}
                    <Button
                      size="sm"
                      variant={ch.done ? 'outline' : ch.seen > 0 ? 'outline' : 'primary'}
                      onClick={() => setLocation(`/channel/${ch.id}`)}
                      className="shrink-0 h-8 text-xs"
                    >
                      {ch.done ? (
                        <>
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Review
                        </>
                      ) : ch.seen > 0 ? (
                        <>
                          Continue
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </>
                      ) : (
                        <>
                          Start
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Refresh progress hint */}
            <p className="text-center text-xs text-[var(--gh-fg-subtle)] mt-6">
              Progress updates as you study each channel • Questions you mark are tracked automatically
            </p>

          </div>
        </div>
      </AppLayout>
    </>
  );
}
