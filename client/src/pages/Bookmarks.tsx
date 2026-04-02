import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { loadChannelQuestions } from '../lib/questions-loader';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { ProgressStorage } from '../services/storage.service';
import { STORAGE_KEYS } from '../lib/constants';
import type { Question } from '../types';
import {
  Bookmark, Trash2, ChevronRight, Filter,
  CheckCircle, Building2, X, BookOpen, Home
} from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import { Button, IconButton } from '../components/unified/Button';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '../components/ui/select';

interface BookmarkedQuestion extends Question {
  channelId: string;
}

const difficultyLabel: Record<string, { label: string; class: string }> = {
  beginner:     { label: 'Easy',   class: 'gh-label-green' },
  intermediate: { label: 'Medium', class: 'gh-label-yellow' },
  advanced:     { label: 'Hard',   class: 'gh-label-red' },
};

function fmt(id: string) {
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function Bookmarks() {
  const [, setLocation] = useLocation();
  const { getSubscribedChannels } = useUserPreferences();
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<BookmarkedQuestion[]>([]);
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadBookmarks() {
      setIsLoading(true);
      const subscribedChannels = getSubscribedChannels();
      const channelIds = new Set<string>();
      subscribedChannels.forEach(c => channelIds.add(c.id));
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(STORAGE_KEYS.MARKED_PREFIX)) {
            channelIds.add(key.replace(STORAGE_KEYS.MARKED_PREFIX, ''));
          }
        }
      } catch {
        // localStorage access error - skip marked prefix scan
      }

      // Load questions for each channel that has bookmarks
      const channelsWithMarks = Array.from(channelIds).filter(
        ch => ProgressStorage.getMarked(ch).length > 0
      );

      const bookmarked: BookmarkedQuestion[] = [];
      await Promise.all(
        channelsWithMarks.map(async channelId => {
          const markedIds = ProgressStorage.getMarked(channelId);
          if (markedIds.length === 0) return;
          try {
            const questions = await loadChannelQuestions(channelId);
            markedIds.forEach(questionId => {
              const question = questions.find(q => q.id === questionId);
              if (question) bookmarked.push({ ...question, channelId });
            });
          } catch {
            // Channel load failed — skip silently
          }
        })
      );

      if (!cancelled) {
        setBookmarkedQuestions(bookmarked);
        setIsLoading(false);
      }
    }

    loadBookmarks();
    return () => { cancelled = true; };
  }, [getSubscribedChannels]);

  const channelsWithBookmarks = useMemo(() =>
    Array.from(new Set(bookmarkedQuestions.map(q => q.channelId))),
    [bookmarkedQuestions]
  );

  const filteredQuestions = useMemo(() => bookmarkedQuestions.filter(q => {
    if (filterChannel !== 'all' && q.channelId !== filterChannel) return false;
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    return true;
  }), [bookmarkedQuestions, filterChannel, filterDifficulty]);

  const removeBookmark = (question: BookmarkedQuestion) => {
    ProgressStorage.toggleMarked(question.channelId, question.id);
    setBookmarkedQuestions(prev => prev.filter(q => q.id !== question.id));
  };

  const goToQuestion = (question: BookmarkedQuestion) => {
    setLocation(`/channel/${question.channelId}/${question.id}`);
  };

  const hasFilters = filterChannel !== 'all' || filterDifficulty !== 'all';

  return (
    <>
      <SEOHead
        title="Bookmarks - DevPrep"
        description="View and manage your bookmarked interview questions"
      />
      <AppLayout>
        <div className="bg-[var(--gh-canvas-subtle)] min-h-screen" id="main-content">
          <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <Breadcrumb className="mb-6">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/" className="flex items-center gap-1">
                    <Home className="w-3.5 h-3.5" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Bookmarks</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-[var(--gh-fg)] flex items-center gap-2">
                  <Bookmark className="w-6 h-6 text-[var(--gh-fg-muted)]" />
                  Bookmarks
                  <span className="ml-2 gh-label gh-label-gray px-2 py-0.5 rounded-full text-xs">
                    {bookmarkedQuestions.length}
                  </span>
                </h1>
                <p className="text-sm text-[var(--gh-fg-muted)] mt-1">
                  Saved questions for your interview preparation
                </p>
              </div>
            </div>

            {/* Filters & Content Card */}
            <div className="gh-card overflow-hidden">
              {/* Filter Bar */}
              <div className="bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)] px-4 py-3 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Filter className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                  <Select value={filterChannel} onValueChange={setFilterChannel}>
                    <SelectTrigger className="h-8 w-[160px]" data-testid="filter-channel">
                      <SelectValue placeholder="All channels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All channels</SelectItem>
                      {channelsWithBookmarks.map(ch => (
                        <SelectItem key={ch} value={ch}>{fmt(ch)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger className="h-8 w-[140px]" data-testid="filter-difficulty">
                      <SelectValue placeholder="All difficulties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All difficulties</SelectItem>
                      <SelectItem value="beginner">Easy</SelectItem>
                      <SelectItem value="intermediate">Medium</SelectItem>
                      <SelectItem value="advanced">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setFilterChannel('all'); setFilterDifficulty('all'); }}
                    data-testid="button-clear-filters"
                  >
                    <X className="w-3.5 h-3.5" /> Clear filters
                  </Button>
                )}
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="flex items-center justify-center min-h-[40vh] bg-[var(--gh-canvas)]">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-[var(--gh-accent-fg)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[var(--gh-fg-muted)]">Loading bookmarks…</p>
                  </div>
                </div>
              ) : bookmarkedQuestions.length === 0 ? (
                <div className="flex items-center justify-center min-h-[40vh] bg-[var(--gh-canvas)]">
                  <div className="text-center max-w-sm px-4">
                    <Bookmark className="w-12 h-12 text-[var(--gh-fg-subtle)] mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-[var(--gh-fg)] mb-2">No bookmarks yet</h2>
                    <p className="text-[var(--gh-fg-muted)] mb-6">
                      Bookmark questions while studying to build your personalized study list.
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setLocation('/channels')}
                      data-testid="button-browse"
                    >
                      Browse Channels
                    </Button>
                  </div>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="flex items-center justify-center min-h-[20vh] bg-[var(--gh-canvas)]">
                  <p className="text-[var(--gh-fg-muted)]">No questions match your selected filters</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--gh-border)]">
                  {filteredQuestions.map((question) => {
                    const diff = difficultyLabel[question.difficulty] || difficultyLabel.beginner;
                    const isCompleted = ProgressStorage.getCompleted(question.channelId).includes(question.id);

                    return (
                      <div
                        key={question.id}
                        className="flex items-start gap-4 px-4 py-4 hover:bg-[var(--gh-canvas-subtle)] cursor-pointer transition-colors group"
                        onClick={() => goToQuestion(question)}
                        data-testid={`bookmark-${question.id}`}
                      >
                        {/* Status Icon */}
                        <div className="mt-1 shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-[var(--gh-success-fg)]" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-[var(--gh-fg-subtle)]" />
                          )}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-semibold text-[var(--gh-accent-fg)] hover:underline">
                              {fmt(question.channelId)}
                            </span>
                            <span className={`gh-label ${diff.class}`}>
                              {diff.label}
                            </span>
                          </div>
                          <h3 className="text-base font-semibold text-[var(--gh-fg)] group-hover:text-[var(--gh-accent-fg)] line-clamp-2 leading-snug">
                            {question.question}
                          </h3>
                          
                          <div className="mt-2 flex items-center gap-4 text-xs text-[var(--gh-fg-muted)]">
                            {question.companies && question.companies.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">
                                  {question.companies.slice(0, 3).join(', ')}
                                  {question.companies.length > 3 ? ` +${question.companies.length - 3}` : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-center">
                          <IconButton
                            icon={<Trash2 className="w-4 h-4" />}
                            variant="outline"
                            size="sm"
                            onClick={e => { e.stopPropagation(); removeBookmark(question); }}
                            aria-label="Remove bookmark"
                            data-testid={`remove-bookmark-${question.id}`}
                          />
                          <ChevronRight className="w-4 h-4 text-[var(--gh-fg-subtle)] group-hover:text-[var(--gh-accent-fg)]" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
