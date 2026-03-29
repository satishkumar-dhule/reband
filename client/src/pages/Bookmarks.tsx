import { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { getAllQuestions } from '../lib/questions-loader';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { ProgressStorage } from '../services/storage.service';
import { STORAGE_KEYS } from '../lib/constants';
import type { Question } from '../types';
import {
  Bookmark, Trash2, ChevronRight, Filter,
  CheckCircle, Building2, X, BookOpen, Home
} from 'lucide-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';

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

  useEffect(() => {
    const subscribedChannels = getSubscribedChannels();
    const allQuestions = getAllQuestions();
    const bookmarked: BookmarkedQuestion[] = [];
    const channelIds = new Set<string>();
    subscribedChannels.forEach(c => channelIds.add(c.id));
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEYS.MARKED_PREFIX)) {
        channelIds.add(key.replace(STORAGE_KEYS.MARKED_PREFIX, ''));
      }
    }
    channelIds.forEach(channelId => {
      const markedIds = ProgressStorage.getMarked(channelId);
      markedIds.forEach(questionId => {
        const question = allQuestions.find(q => q.id === questionId);
        if (question) bookmarked.push({ ...question, channelId });
      });
    });
    setBookmarkedQuestions(bookmarked);
  }, []);

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
                  <select
                    value={filterChannel}
                    onChange={e => setFilterChannel(e.target.value)}
                    className="h-8 px-2 text-sm rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] text-[var(--gh-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent-emphasis)]"
                    data-testid="filter-channel"
                  >
                    <option value="all">All channels</option>
                    {channelsWithBookmarks.map(ch => (
                      <option key={ch} value={ch}>{fmt(ch)}</option>
                    ))}
                  </select>
                  <select
                    value={filterDifficulty}
                    onChange={e => setFilterDifficulty(e.target.value)}
                    className="h-8 px-2 text-sm rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas)] text-[var(--gh-fg)] focus:outline-none focus:ring-2 focus:ring-[var(--gh-accent-emphasis)]"
                    data-testid="filter-difficulty"
                  >
                    <option value="all">All difficulties</option>
                    <option value="beginner">Easy</option>
                    <option value="intermediate">Medium</option>
                    <option value="advanced">Hard</option>
                  </select>
                </div>

                {hasFilters && (
                  <button
                    onClick={() => { setFilterChannel('all'); setFilterDifficulty('all'); }}
                    className="gh-btn gh-btn-outline h-8 px-3 text-sm"
                    data-testid="button-clear-filters"
                  >
                    <X className="w-3.5 h-3.5" /> Clear filters
                  </button>
                )}
              </div>

              {/* Content */}
              {bookmarkedQuestions.length === 0 ? (
                <div className="p-12 text-center bg-[var(--gh-canvas)]">
                  <Bookmark className="w-12 h-12 text-[var(--gh-fg-subtle)] mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-[var(--gh-fg)] mb-2">No bookmarks yet</h2>
                  <p className="text-[var(--gh-fg-muted)] mb-6 max-w-sm mx-auto">
                    Bookmark questions while studying to build your personalized study list.
                  </p>
                  <button
                    onClick={() => setLocation('/channels')}
                    className="gh-btn gh-btn-primary"
                    data-testid="button-browse"
                  >
                    Browse Channels
                  </button>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="p-12 text-center bg-[var(--gh-canvas)]">
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
                          <button
                            onClick={e => { e.stopPropagation(); removeBookmark(question); }}
                            className="gh-btn gh-btn-outline p-2 text-[var(--gh-fg-muted)] hover:text-[var(--gh-danger-fg)] hover:border-[var(--gh-danger-emphasis)]"
                            aria-label="Remove bookmark"
                            data-testid={`remove-bookmark-${question.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
