/**
 * Channel Detail Page
 * Shows topic overview, concept map, learning progression, and entry points to practice
 * Route: /channel/:id (overview) and /channel/:id/practice (questions)
 */

import { useState, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import {
  AppLayout, SEOHead, SkipLink, Button, Badge,
  PageHeader, GenericPageSkeleton, EmptyState,
} from '@/lib/ui';
import { allChannelsConfig } from '../lib/channels-config';
import {
  getChannelConceptMap, getBeginnerConcepts, hasConceptMap,
  getConcept,
} from '../lib/channel-concept-maps';
import { useChannelStats } from '../hooks/use-stats';
import { useProgress } from '../hooks';
import {
  BookOpen, Play, ChevronRight, Target, Clock, Zap,
  ArrowLeft, Layers, Brain, Award, TrendingUp, CheckCircle2,
  Circle, Lock,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  'boxes': Layers, 'chart-line': TrendingUp, 'git-branch': ChevronRight,
  'binary': Zap, 'puzzle': Brain, 'git-merge': ChevronRight,
  'calculator': Target, 'cpu': Zap, 'terminal': BookOpen,
  'layout': Layers, 'server': Layers, 'database': Layers,
  'infinity': TrendingUp, 'activity': TrendingUp, 'box': Layers,
  'cloud': Layers, 'layers': Layers, 'workflow': TrendingUp,
  'brain': Brain, 'message-circle': BookOpen, 'eye': Brain,
  'file-text': BookOpen, 'code': BookOpen, 'shield': Lock,
  'network': Layers, 'monitor': Layers, 'smartphone': Layers,
  'check-circle': CheckCircle2, 'zap': Zap, 'gauge': TrendingUp,
  'users': BookOpen, 'award': Award, 'sparkles': Brain,
};

const categoryLabels: Record<string, string> = {
  frontend: 'Frontend', backend: 'Backend', cloud: 'Cloud', data: 'Data',
  security: 'Security', ai: 'AI/ML', fundamentals: 'Fundamentals',
  engineering: 'Engineering', certification: 'Cert', testing: 'Testing',
  management: 'Management', mobile: 'Mobile',
};

const difficultyColor: Record<string, string> = {
  beginner: 'gh-label-green',
  intermediate: 'gh-label-yellow',
  advanced: 'gh-label-red',
};

const difficultyLabel: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export default function ChannelDetail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/channel/:id');
  const channelId = params?.id || '';

  const channelConfig = useMemo(
    () => allChannelsConfig.find(c => c.id === channelId),
    [channelId],
  );

  const conceptMap = useMemo(
    () => getChannelConceptMap(channelId),
    [channelId],
  );

  const { stats } = useChannelStats();
  const { completed } = useProgress(channelId);

  const channelStats = useMemo(
    () => stats?.find(s => s.id === channelId),
    [stats, channelId],
  );

  const totalQuestions = channelStats?.total ?? 0;
  const progressPct = totalQuestions > 0 ? Math.round((completed.length / totalQuestions) * 100) : 0;
  const beginnerConcepts = useMemo(() => getBeginnerConcepts(channelId), [channelId]);
  const Icon = channelConfig ? (iconMap[channelConfig.icon] || Layers) : Layers;

  if (!channelConfig) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <EmptyState
            icon={<BookOpen className="w-10 h-10" />}
            title="Topic not found"
            description="The topic you are looking for does not exist."
            action={
              <Button onClick={() => setLocation('/channels')} variant="primary" size="sm">
                Browse all topics
              </Button>
            }
          />
        </div>
      </AppLayout>
    );
  }

  const catLabel = categoryLabels[channelConfig.category] ?? channelConfig.category;

  return (
    <>
      <SkipLink />
      <AppLayout>
        <SEOHead
          title={`${channelConfig.name} | DevPrep`}
          description={conceptMap?.overview || channelConfig.description}
        />

        {/* ── Header ── */}
        <div className="bg-card border-b border-border">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
            {/* Back link */}
            <button
              onClick={() => setLocation('/channels')}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to all topics
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-primary" strokeWidth={2} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl font-bold">{channelConfig.name}</h1>
                  <Badge className="text-[10px] capitalize bg-muted text-muted-foreground border-0">
                    {catLabel}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{channelConfig.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {totalQuestions > 0 ? `${totalQuestions} questions` : 'Questions coming soon'}
                  </span>
                  {progressPct > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      {progressPct}% completed
                    </span>
                  )}
                  {conceptMap && (
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      {conceptMap.coreConcepts.length} concepts
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mt-6">
              <Button
                onClick={() => setLocation(`/channel/${channelId}/practice`)}
                variant="primary"
                size="sm"
                icon={<Play className="w-4 h-4" />}
                disabled={totalQuestions === 0}
              >
                Start Practicing
              </Button>
              <Button
                onClick={() => setLocation(`/channel/${channelId}/flashcards`)}
                variant="ghost"
                size="sm"
                icon={<Brain className="w-4 h-4" />}
              >
                Flashcards
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 space-y-8">
          {/* ── Overview ── */}
          {conceptMap && (
            <section>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                What You Will Learn
              </h2>
              <div className="gh-card p-5">
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{conceptMap.overview}</p>
                <div className="p-3 bg-muted/50 rounded-md border border-border">
                  <p className="text-xs font-medium mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    Why This Matters
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{conceptMap.whyItMatters}</p>
                </div>
              </div>
            </section>
          )}

          {/* ── Interview Focus Areas ── */}
          {conceptMap && conceptMap.interviewFocus.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Interview Focus Areas
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {conceptMap.interviewFocus.map((focus, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 bg-card border border-border rounded-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{focus}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Learning Path / Concept Map ── */}
          {conceptMap && conceptMap.coreConcepts.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Learning Path — {conceptMap.coreConcepts.length} Concepts
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Study concepts in order. Each builds on the previous ones. Start with beginner topics and work your way up.
              </p>
              <div className="space-y-2">
                {conceptMap.coreConcepts.map((concept, index) => {
                  const conceptCompleted = completed.filter(id => id.includes(concept.id)).length;
                  const isLocked = (concept.prerequisites || []).some(
                    prereq => !completed.some(id => id.includes(prereq)),
                  );

                  return (
                    <div
                      key={concept.id}
                      className={`gh-card p-4 border rounded-md transition-all ${
                        isLocked ? 'opacity-60' : 'hover-elevate'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Step number */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isLocked
                            ? 'bg-muted text-muted-foreground'
                            : concept.difficulty === 'beginner'
                            ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                            : concept.difficulty === 'intermediate'
                            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                            : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {isLocked ? <Lock className="w-3 h-3" /> : index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-semibold">{concept.name}</h3>
                            <Badge className={`text-[10px] capitalize ${difficultyColor[concept.difficulty]}`}>
                              {difficultyLabel[concept.difficulty]}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{concept.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              ~{concept.estimatedMinutes} min
                            </span>
                            {concept.prerequisites && concept.prerequisites.length > 0 && (
                              <span>
                                Requires: {concept.prerequisites.map(p => {
                                  const prereq = getConcept(channelId, p);
                                  return prereq?.name || p;
                                }).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── No concept map yet ── */}
          {!conceptMap && (
            <section>
              <div className="gh-card p-8 text-center border-dashed">
                <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-sm font-semibold mb-1">Concept map coming soon</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  We are building a structured learning path for this topic. In the meantime, jump straight into practice questions.
                </p>
                <Button
                  onClick={() => setLocation(`/channel/${channelId}/practice`)}
                  variant="primary"
                  size="sm"
                  icon={<Play className="w-4 h-4" />}
                  disabled={totalQuestions === 0}
                >
                  Start Practicing
                </Button>
              </div>
            </section>
          )}

          {/* ── Related Topics ── */}
          {conceptMap && conceptMap.relatedChannels.length > 0 && (
            <section>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Related Topics
              </h2>
              <div className="flex flex-wrap gap-2">
                {conceptMap.relatedChannels.map(relatedId => {
                  const related = allChannelsConfig.find(c => c.id === relatedId);
                  if (!related) return null;
                  const RelatedIcon = iconMap[related.icon] || Layers;
                  return (
                    <button
                      key={relatedId}
                      onClick={() => setLocation(`/channel/${relatedId}`)}
                      className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md hover-elevate transition-all text-left"
                    >
                      <RelatedIcon className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm">{related.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </AppLayout>
    </>
  );
}
