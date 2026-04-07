import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation } from 'wouter';
import { gql } from '../lib/graphql-client';
import { GET_CHANNELS, GET_CERTIFICATIONS } from '../lib/graphql-queries';
import { motion } from 'framer-motion';
import { AppLayout } from '@/lib/ui';
import { SEOHead } from '@/lib/ui';
import { curatedPaths } from '../lib/learning-paths-data';
import { allChannelsConfig } from '../lib/channels-config';
import { Button } from '@/lib/ui';
import { getDifficultyClasses } from '@/lib/difficulty';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/lib/ui';
import {
  Home, ChevronRight, Clock, Trophy, CheckCircle2, Circle,
  BookOpen, RotateCcw, ArrowRight, Layers, Award
} from 'lucide-react';

interface ChannelCount {
  id: string;
  questionCount: number;
}

interface CertificationData {
  id: string;
  name: string;
  provider: string;
  icon: string;
  category: string;
}

interface CustomPath {
  id: string;
  name: string;
  channels: string[];
  certifications: string[];
  createdAt: string;
}

// Resolved path shape used internally
interface ResolvedPath {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  channels: string[];
  certifications: string[];
  difficulty: string;
  duration: string;
  totalQuestions: number;
  skills: string[];
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

  const [path, setPath] = useState<ResolvedPath | null | undefined>(undefined); // undefined = loading
  const [channelCounts, setChannelCounts] = useState<Record<string, number>>({});
  const [countsLoaded, setCountsLoaded] = useState(false);
  const [certDetails, setCertDetails] = useState<CertificationData[]>([]);
  const [, forceUpdate] = useState(0);

  // Load the path — check curated first, then localStorage custom paths
  useEffect(() => {
    const curated = curatedPaths.find(p => p.id === pathId);
    if (curated) {
      setPath({
        ...curated,
        certifications: [],
        difficulty: curated.difficulty,
      } as ResolvedPath);
      return;
    }

    try {
      const raw = localStorage.getItem('customPaths');
      const customPaths: CustomPath[] = raw ? JSON.parse(raw) : [];
      const custom = customPaths.find(p => p.id === pathId);
      if (custom) {
        setPath({
          id: custom.id,
          name: custom.name,
          icon: Layers,
          description: `Custom learning path with ${custom.channels.length} channel${custom.channels.length !== 1 ? 's' : ''}${custom.certifications.length > 0 ? ` and ${custom.certifications.length} certification${custom.certifications.length !== 1 ? 's' : ''}` : ''}`,
          channels: custom.channels,
          certifications: custom.certifications,
          difficulty: 'Custom',
          duration: 'Self-paced',
          totalQuestions: 0,
          skills: [],
        });
      } else {
        setPath(null);
      }
    } catch {
      setPath(null);
    }
  }, [pathId]);

  // Mark path as active in localStorage
  useEffect(() => {
    if (!pathId || path === undefined || path === null) return;
    try {
      const active: string[] = JSON.parse(localStorage.getItem('activeLearningPaths') || '[]');
      if (!active.includes(pathId)) {
        active.push(pathId);
        localStorage.setItem('activeLearningPaths', JSON.stringify(active));
      }
    } catch {}
  }, [pathId, path]);

  // Fetch channel question counts
  useEffect(() => {
    gql<{ channels: ChannelCount[] }>(GET_CHANNELS)
      .then(data => {
        const counts: Record<string, number> = {};
        for (const ch of (data.channels || [])) counts[ch.id] = Number(ch.questionCount);
        setChannelCounts(counts);
        setCountsLoaded(true);
      })
      .catch(() => setCountsLoaded(true));
  }, []);

  // Fetch certification details (for names/providers)
  useEffect(() => {
    if (!path || path.certifications.length === 0) return;
    gql<{ certifications: CertificationData[] }>(GET_CERTIFICATIONS)
      .then(data => setCertDetails(data.certifications || []))
      .catch(() => {});
  }, [path]);

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

  // Per-certification info
  const certProgress = useMemo(() => {
    if (!path) return [];
    return path.certifications.map(certId => {
      const detail = certDetails.find(c => c.id === certId);
      return {
        id: certId,
        name: detail?.name ?? certId,
        provider: detail?.provider ?? '',
      };
    });
  }, [path, certDetails]);

  const overallSeen = channelProgress.reduce((s, c) => s + c.seen, 0);
  const overallTotal = channelProgress.reduce((s, c) => s + c.total, 0);
  const overallPct = overallTotal > 0 ? Math.min(Math.round((overallSeen / overallTotal) * 100), 100) : 0;
  const doneChannels = channelProgress.filter(c => c.done).length;
  const totalItems = channelProgress.length + certProgress.length;

  // Still loading path from localStorage
  if (path === undefined) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center text-muted-foreground">
          Loading path…
        </div>
      </AppLayout>
    );
  }

  if (path === null) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <p className="text-muted-foreground">Path not found. It may have been deleted or belong to a different browser session.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setLocation('/learning-paths')}>
              Browse Paths
            </Button>
            <Button variant="primary" onClick={() => setLocation('/my-path')}>
              My Paths
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const Icon = path.icon;

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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${getDifficultyClasses(path.difficulty)}`}>
                        {path.difficulty}
                      </span>
                    )}
                    {path.difficulty === 'Custom' && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-[var(--gh-border)] text-muted-foreground">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[var(--gh-fg-muted)]">{path.description}</p>
                </div>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-4 text-xs text-[var(--gh-fg-subtle)] mb-5 flex-wrap">
                {path.duration && path.duration !== 'Self-paced' && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {path.duration}
                  </div>
                )}
                {channelProgress.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    {channelProgress.length} channel{channelProgress.length !== 1 ? 's' : ''}
                  </div>
                )}
                {certProgress.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" />
                    {certProgress.length} certification{certProgress.length !== 1 ? 's' : ''}
                  </div>
                )}
                {overallTotal > 0 && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {overallTotal} questions
                  </div>
                )}
              </div>

              {/* Overall progress (channels only) */}
              {channelProgress.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[var(--gh-fg-muted)]">Channel progress</span>
                    <span className="text-xs font-semibold text-[var(--gh-fg)]">
                      {doneChannels}/{channelProgress.length} complete
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
                      All channels complete! Great work.
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* ── Channels ── */}
            {channelProgress.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-[var(--gh-fg-muted)] uppercase tracking-wide mb-3">
                  Channels in this path
                </h2>
                <div className="space-y-3 mb-8">
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
                        <div className="shrink-0">
                          {ch.done ? (
                            <CheckCircle2 className="w-5 h-5 text-[var(--gh-success-fg)]" />
                          ) : (
                            <Circle className="w-5 h-5 text-[var(--gh-border)]" />
                          )}
                        </div>

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

                          <div className="h-1.5 bg-[var(--gh-border)] rounded-full overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${ch.done ? 'bg-[var(--gh-success-fg)]' : 'bg-[var(--gh-accent-emphasis)]'}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${ch.pct}%` }}
                              transition={{ duration: 0.5, delay: i * 0.04 }}
                            />
                          </div>
                        </div>

                        <Button
                          size="sm"
                          variant={ch.done ? 'outline' : ch.seen > 0 ? 'outline' : 'primary'}
                          onClick={() => setLocation(`/channel/${ch.id}`)}
                          className="shrink-0 h-8 text-xs"
                        >
                          {ch.done ? (
                            <><RotateCcw className="w-3 h-3 mr-1" />Review</>
                          ) : ch.seen > 0 ? (
                            <>Continue<ArrowRight className="w-3 h-3 ml-1" /></>
                          ) : (
                            <>Start<ChevronRight className="w-3 h-3 ml-1" /></>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* ── Certifications ── */}
            {certProgress.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-[var(--gh-fg-muted)] uppercase tracking-wide mb-3">
                  Certifications in this path
                </h2>
                <div className="space-y-3 mb-8">
                  {certProgress.map((cert, i) => (
                    <motion.div
                      key={cert.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (channelProgress.length + i) * 0.04 }}
                      className="bg-[var(--gh-canvas-default)] border border-[var(--gh-border)] rounded-md p-4 transition-colors hover:border-[var(--gh-accent-fg)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          <Award className="w-5 h-5 text-[var(--gh-accent-fg)]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-sm text-[var(--gh-fg)]">{cert.name}</span>
                          {cert.provider && (
                            <p className="text-xs text-[var(--gh-fg-muted)] mt-0.5">{cert.provider}</p>
                          )}
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setLocation(`/certification/${cert.id}`)}
                            className="h-8 text-xs"
                          >
                            Practice
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setLocation(`/certification/${cert.id}/exam`)}
                            className="h-8 text-xs"
                          >
                            Exam<ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}

            {/* Empty state — path has no items */}
            {totalItems === 0 && (
              <div className="bg-[var(--gh-canvas-default)] border border-[var(--gh-border)] rounded-md p-8 text-center">
                <p className="text-sm text-muted-foreground mb-4">This path has no channels or certifications yet.</p>
                <Button variant="outline" size="sm" onClick={() => setLocation('/my-path')}>
                  Edit Path
                </Button>
              </div>
            )}

            <p className="text-center text-xs text-[var(--gh-fg-subtle)] mt-6">
              Progress updates as you study each channel · Questions you mark are tracked automatically
            </p>

          </div>
        </div>
      </AppLayout>
    </>
  );
}
