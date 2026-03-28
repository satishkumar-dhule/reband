import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { getAllQuestions } from '../lib/questions-loader';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { ProgressStorage } from '../services/storage.service';
import { STORAGE_KEYS } from '../lib/constants';
import type { Question } from '../types';
import {
  Bookmark, Trash2, ChevronRight, Filter,
  CheckCircle, Building2, X, BookOpen
} from 'lucide-react';

interface BookmarkedQuestion extends Question {
  channelId: string;
}

const difficultyLabel: Record<string, { label: string; color: string }> = {
  beginner:     { label: 'Easy',   color: 'text-green-600 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  intermediate: { label: 'Medium', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
  advanced:     { label: 'Hard',   color: 'text-red-600 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
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
        <div className="max-w-5xl mx-auto px-4 py-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-muted-foreground" />
                Bookmarks
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {bookmarkedQuestions.length} saved question{bookmarkedQuestions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Filters */}
          {bookmarkedQuestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filterChannel}
                onChange={e => setFilterChannel(e.target.value)}
                className="h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
                className="h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                data-testid="filter-difficulty"
              >
                <option value="all">All difficulties</option>
                <option value="beginner">Easy</option>
                <option value="intermediate">Medium</option>
                <option value="advanced">Hard</option>
              </select>
              {hasFilters && (
                <button
                  onClick={() => { setFilterChannel('all'); setFilterDifficulty('all'); }}
                  className="flex items-center gap-1 h-8 px-2 text-xs text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-md transition-colors"
                  data-testid="button-clear-filters"
                >
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          )}

          {/* Empty state */}
          {bookmarkedQuestions.length === 0 ? (
            <div className="rounded-md border border-border bg-card p-12 text-center">
              <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <h2 className="text-base font-semibold text-foreground mb-1">No bookmarks yet</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Bookmark questions while studying to review them later
              </p>
              <button
                onClick={() => setLocation('/channels')}
                className="px-4 py-1.5 text-sm rounded-md font-medium text-white"
                style={{ backgroundColor: 'var(--gh-green)' }}
                data-testid="button-browse"
              >
                Browse questions
              </button>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="rounded-md border border-border bg-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No questions match your filters</p>
            </div>
          ) : (
            <div className="rounded-md border border-border bg-card divide-y divide-border">
              {filteredQuestions.map((question) => {
                const diff = difficultyLabel[question.difficulty] || difficultyLabel.beginner;
                const isCompleted = ProgressStorage.getCompleted(question.channelId).includes(question.id);

                return (
                  <div
                    key={question.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => goToQuestion(question)}
                    data-testid={`bookmark-${question.id}`}
                  >
                    {/* Left: icon */}
                    <div className="hidden sm:flex w-8 h-8 rounded-md bg-muted items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                    </div>

                    {/* Main */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-xs text-muted-foreground capitalize">{fmt(question.channelId)}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${diff.color}`}>
                          {diff.label}
                        </span>
                        {isCompleted && (
                          <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400">
                            <CheckCircle className="w-3 h-3" />
                            Done
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
                        {question.question}
                      </p>
                      {question.companies && question.companies.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Building2 className="w-3 h-3 shrink-0" />
                          <span className="truncate">{question.companies.slice(0, 3).join(', ')}
                            {question.companies.length > 3 ? ` +${question.companies.length - 3}` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={e => { e.stopPropagation(); removeBookmark(question); }}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        aria-label="Remove bookmark"
                        data-testid={`remove-bookmark-${question.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
