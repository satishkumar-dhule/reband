import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AppLayout, SEOHead, SkipLink, Button, IconButton,
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
  PageHeader, EmptyState, GenericPageSkeleton, DifficultyBadge,
} from '@/lib/ui';
import { loadChannelQuestions } from '../lib/questions-loader';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { ProgressStorage } from '../services/storage.service';
import { STORAGE_KEYS } from '../lib/constants';
import type { Question } from '../types';
import { Bookmark, Trash2, ChevronRight, Filter, CheckCircle, Building2, X, BookOpen } from 'lucide-react';

interface BookmarkedQuestion extends Question { channelId: string; }


function fmt(id: string) {
  return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function Bookmarks() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { getSubscribedChannels } = useUserPreferences();
  const [filterChannel, setFilterChannel] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const { data: bookmarkedQuestions = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const channelIds = new Set<string>(getSubscribedChannels().map(c => c.id));
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith(STORAGE_KEYS.MARKED_PREFIX)) channelIds.add(key.replace(STORAGE_KEYS.MARKED_PREFIX, ''));
        }
      } catch {}

      const channelsWithMarks = Array.from(channelIds).filter(ch => ProgressStorage.getMarked(ch).length > 0);
      const bookmarked: BookmarkedQuestion[] = [];
      await Promise.all(channelsWithMarks.map(async channelId => {
        const markedIds = ProgressStorage.getMarked(channelId);
        if (!markedIds.length) return;
        try {
          const questions = await loadChannelQuestions(channelId);
          markedIds.forEach(qid => {
            const q = questions.find(x => x.id === qid);
            if (q) bookmarked.push({ ...q, channelId });
          });
        } catch {}
      }));
      return bookmarked;
    },
  });

  const deleteBookmark = useMutation({
    mutationFn: async (question: BookmarkedQuestion) => { ProgressStorage.toggleMarked(question.channelId, question.id); return question; },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookmarks'] }),
  });

  const channelsWithBookmarks = useMemo(() =>
    Array.from(new Set(bookmarkedQuestions.map(q => q.channelId))),
    [bookmarkedQuestions]
  );

  const filteredQuestions = useMemo(() => bookmarkedQuestions.filter(q => {
    if (filterChannel !== 'all' && q.channelId !== filterChannel) return false;
    if (filterDifficulty !== 'all' && q.difficulty !== filterDifficulty) return false;
    return true;
  }), [bookmarkedQuestions, filterChannel, filterDifficulty]);

  const hasFilters = filterChannel !== 'all' || filterDifficulty !== 'all';

  if (isLoading) {
    return (
      <>
        <SEOHead title="Bookmarks | DevPrep" description="View and manage your bookmarked questions" />
        <AppLayout><GenericPageSkeleton /></AppLayout>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Bookmarks | DevPrep" description="View and manage your bookmarked interview questions" />
      <SkipLink />

      <AppLayout>
        {/* ── Page Header — same shell as AllChannels / Certifications ── */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <PageHeader
              title={
                <span className="flex items-center gap-2">
                  Bookmarks
                  <Badge className="text-xs bg-muted text-muted-foreground border-0">
                    {bookmarkedQuestions.length}
                  </Badge>
                </span>
              }
              subtitle="Saved questions for your interview preparation"
              className="mb-0"
            />
          </div>
        </div>

        {/* ── Content ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8" id="main-content">
          {bookmarkedQuestions.length === 0 ? (
            <EmptyState
              icon={<Bookmark className="w-10 h-10" />}
              title="No bookmarks yet"
              description="Bookmark questions while studying to build your personalized review list."
              action={
                <Button variant="primary" onClick={() => setLocation('/channels')} data-testid="button-browse">
                  Browse Channels
                </Button>
              }
            />
          ) : (
            <div className="bg-card border border-border rounded-md overflow-hidden">
              {/* Filter bar */}
              <div className="bg-muted/40 border-b border-border px-4 py-3 flex flex-wrap items-center gap-3">
                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
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
                {hasFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setFilterChannel('all'); setFilterDifficulty('all'); }}
                    icon={<X className="w-3.5 h-3.5" />}
                    data-testid="button-clear-filters"
                  >
                    Clear filters
                  </Button>
                )}
              </div>

              {/* Empty filtered state */}
              {filteredQuestions.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <p className="text-sm">No questions match your filters</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredQuestions.map(question => {
                    const isCompleted = ProgressStorage.getCompleted(question.channelId).includes(question.id);

                    return (
                      <div
                        key={question.id}
                        className="flex items-start gap-4 px-4 py-4 hover:bg-muted/30 cursor-pointer transition-colors group"
                        onClick={() => setLocation(`/channel/${question.channelId}/${question.id}`)}
                        data-testid={`bookmark-${question.id}`}
                      >
                        {/* Status icon */}
                        <div className="mt-0.5 shrink-0">
                          {isCompleted
                            ? <CheckCircle className="w-5 h-5 text-primary" />
                            : <BookOpen className="w-5 h-5 text-muted-foreground" />
                          }
                        </div>

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-semibold text-primary">{fmt(question.channelId)}</span>
                            <Badge className={`text-[10px] ${diff.badgeClass}`}>{diff.label}</Badge>
                          </div>
                          <h3 className="text-sm font-semibold group-hover:text-primary line-clamp-2 leading-snug transition-colors">
                            {question.question}
                          </h3>
                          {question.companies && question.companies.length > 0 && (
                            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Building2 className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">
                                {question.companies.slice(0, 3).join(', ')}
                                {question.companies.length > 3 ? ` +${question.companies.length - 3}` : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-center">
                          <IconButton
                            icon={<Trash2 className="w-4 h-4" />}
                            variant="outline"
                            size="sm"
                            onClick={e => { e.stopPropagation(); deleteBookmark.mutate(question); }}
                            aria-label="Remove bookmark"
                            data-testid={`remove-bookmark-${question.id}`}
                          />
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
