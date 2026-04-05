import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Layers, BookOpen, FlaskConical, FileCheck2, Map, Mic, BarChart3,
  ChevronLeft, ChevronRight, Search, X, Loader2, Zap, Database,
  SlidersHorizontal, Hash, ArrowUpRight, Code2, Star
} from "lucide-react";
import { Badge } from '@/lib/ui';
import { Button } from '@/lib/ui';
import { Input } from '@/lib/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/ui';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/lib/ui';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/lib/ui';

// ─── API helpers ───────────────────────────────────────────────────────────
const BASE = "/go-api/api/v1";

async function apiFetch(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
  return r.json();
}

type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type Channel = { id: string; questionCount: number };
type ChannelStat = { id: string; total: number; beginner: number; intermediate: number; advanced: number };
type Question = {
  id: string; channel: string; subChannel?: string; difficulty: string;
  question: string; answer: string; companies?: string[];
};
type Flashcard = { id: string; channel: string; front: string; back: string; difficulty?: string };
type Certification = { id: string; name: string; category?: string; difficulty?: string; description?: string };
type LearningPath = { id: string; title?: string; name?: string; pathType?: string; difficulty?: string; jobTitle?: string; company?: string };
type VoiceSession = { id: string; channel: string; prompt: string; difficulty?: string };

// ─── Difficulty badge ───────────────────────────────────────────────────────
function DiffBadge({ d }: { d?: string }) {
  if (!d) return null;
  const lc = d.toLowerCase();
  const color =
    lc === "beginner" ? "bg-green-500/15 text-green-700 dark:text-green-400" :
    lc === "intermediate" ? "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400" :
    "bg-red-500/15 text-red-600 dark:text-red-400";
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${color}`}>
      {lc === "beginner" && <Star className="w-3 h-3" />}
      {lc === "intermediate" && <Star className="w-3 h-3 fill-current" />}
      {lc === "advanced" && <Zap className="w-3 h-3" />}
      {d}
    </span>
  );
}

// ─── Pagination bar ─────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }: { page: number; totalPages: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 pt-4" data-testid="pagination-bar">
      <Button size="icon" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)} data-testid="button-prev-page">
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm text-muted-foreground px-2">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>
      <Button size="icon" variant="outline" disabled={page >= totalPages} onClick={() => onPage(page + 1)} data-testid="button-next-page">
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ─── Loading / error states ─────────────────────────────────────────────────
function Loading() {
  return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function Err({ msg }: { msg: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
      <X className="w-8 h-8 text-destructive" />
      <p className="text-sm">{msg}</p>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
      <Database className="w-8 h-8" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

// ─── OVERVIEW TAB ───────────────────────────────────────────────────────────
function OverviewTab() {
  const channels = useQuery<Channel[]>({ queryKey: ["/go-api/channels"], queryFn: () => apiFetch(`${BASE}/channels`) });
  const stats = useQuery<ChannelStat[]>({ queryKey: ["/go-api/stats"], queryFn: () => apiFetch(`${BASE}/stats`) });
  const flashcards = useQuery<Paginated<Flashcard>>({ queryKey: ["/go-api/flashcards/count"], queryFn: () => apiFetch(`${BASE}/flashcards?page_size=1`) });
  const certs = useQuery<Paginated<Certification>>({ queryKey: ["/go-api/certs/count"], queryFn: () => apiFetch(`${BASE}/certifications?page_size=1`) });
  const paths = useQuery<Paginated<LearningPath>>({ queryKey: ["/go-api/paths/count"], queryFn: () => apiFetch(`${BASE}/learning-paths?page_size=1`) });
  const voice = useQuery<Paginated<VoiceSession>>({ queryKey: ["/go-api/voice/count"], queryFn: () => apiFetch(`${BASE}/voice-sessions?page_size=1`) });

  const totalQ = channels.data?.reduce((s, c) => s + c.questionCount, 0) ?? 0;

  const statCards = [
    { label: "Channels", value: channels.data?.length ?? "—", icon: Layers, tab: "channels" },
    { label: "Questions", value: totalQ || "—", icon: BookOpen, tab: "questions" },
    { label: "Flashcards", value: flashcards.data?.total ?? "—", icon: FlaskConical, tab: "flashcards" },
    { label: "Certifications", value: certs.data?.total ?? "—", icon: FileCheck2, tab: "certifications" },
    { label: "Learning Paths", value: paths.data?.total ?? "—", icon: Map, tab: "learning-paths" },
    { label: "Voice Sessions", value: voice.data?.total ?? "—", icon: Mic, tab: "voice" },
  ];

  const top10 = (stats.data ?? []).sort((a, b) => b.total - a.total).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label} data-testid={`card-stat-${label.toLowerCase().replace(/ /g, "-")}`}>
            <CardContent className="pt-4 pb-3 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{label}</span>
              </div>
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4" />
            Top channels by question count
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.isLoading ? <Loading /> : stats.isError ? <Err msg="Could not load stats" /> : (
            <div className="space-y-2">
              {top10.map((s) => {
                const pct = Math.round((s.total / top10[0].total) * 100);
                return (
                  <div key={s.id} className="flex items-center gap-3" data-testid={`row-channel-stat-${s.id}`}>
                    <span className="w-36 text-sm font-medium truncate">{s.id}</span>
                    <div className="flex-1 relative h-5 rounded bg-muted overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 rounded bg-primary/30 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-[11px] font-medium">
                        {s.total} total · {s.beginner}B · {s.intermediate}I · {s.advanced}A
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── CHANNELS TAB ───────────────────────────────────────────────────────────
function ChannelsTab() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError } = useQuery<Channel[]>({
    queryKey: ["/go-api/channels"],
    queryFn: () => apiFetch(`${BASE}/channels`),
  });

  const filtered = (data ?? []).filter(c => c.id.includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Filter channels…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          data-testid="input-channel-search"
        />
      </div>

      {isLoading ? <Loading /> : isError ? <Err msg="Could not load channels" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {filtered.map(c => (
            <div
              key={c.id}
              className="flex flex-col gap-1 rounded-md border p-3 hover-elevate"
              data-testid={`card-channel-${c.id}`}
            >
              <div className="flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm font-medium truncate">{c.id}</span>
              </div>
              <span className="text-xs text-muted-foreground">{c.questionCount} questions</span>
            </div>
          ))}
          {filtered.length === 0 && <p className="col-span-full text-sm text-muted-foreground py-8 text-center">No channels match "{search}"</p>}
        </div>
      )}
    </div>
  );
}

// ─── QUESTIONS TAB ───────────────────────────────────────────────────────────
function QuestionsTab() {
  const [channel, setChannel] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const channels = useQuery<Channel[]>({ queryKey: ["/go-api/channels"], queryFn: () => apiFetch(`${BASE}/channels`) });

  const params = new URLSearchParams({ page: String(page), page_size: "10" });
  if (channel) params.set("channel", channel);
  if (difficulty) params.set("difficulty", difficulty);
  if (search) params.set("search", search);

  const { data, isLoading, isError } = useQuery<Paginated<Question>>({
    queryKey: ["/go-api/questions", channel, difficulty, search, page],
    queryFn: () => apiFetch(`${BASE}/questions?${params}`),
  });

  const resetPage = useCallback(() => setPage(1), []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search questions…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setSearch(draft); resetPage(); } }}
            data-testid="input-question-search"
          />
        </div>
        {search && (
          <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setDraft(""); resetPage(); }} data-testid="button-clear-search">
            <X className="w-4 h-4" />
          </Button>
        )}
        <Select value={channel || "__all__"} onValueChange={v => { setChannel(v === "__all__" ? "" : v); resetPage(); }}>
          <SelectTrigger className="w-44" data-testid="select-channel">
            <SelectValue placeholder="All channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All channels</SelectItem>
            {(channels.data ?? []).map(c => (
              <SelectItem key={c.id} value={c.id}>{c.id}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={difficulty || "__all__"} onValueChange={v => { setDifficulty(v === "__all__" ? "" : v); resetPage(); }}>
          <SelectTrigger className="w-40" data-testid="select-difficulty">
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {isLoading ? <Loading /> : isError ? <Err msg="Could not load questions" /> : !data?.data.length ? (
        <Empty label="No questions found — try adjusting your filters" />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{data.total} questions found</p>
          <div className="space-y-2">
            {data.data.map(q => (
              <div
                key={q.id}
                className="rounded-md border p-4 space-y-2 hover-elevate cursor-pointer"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                data-testid={`card-question-${q.id}`}
              >
                <div className="flex flex-wrap items-start gap-2">
                  <p className="flex-1 text-sm font-medium leading-snug">{q.question}</p>
                  <div className="flex flex-wrap gap-1 flex-shrink-0">
                    <Badge variant="secondary" className="text-[11px]">{q.channel}</Badge>
                    <DiffBadge d={q.difficulty} />
                  </div>
                </div>
                {expanded === q.id && (
                  <div className="pt-2 border-t text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {q.answer}
                    {q.companies && q.companies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {q.companies.map(co => (
                          <Badge key={co} variant="outline" className="text-[10px]">{co}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}

// ─── FLASHCARDS TAB ─────────────────────────────────────────────────────────
function FlashcardsTab() {
  const [channel, setChannel] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [page, setPage] = useState(1);
  const [flipped, setFlipped] = useState<string | null>(null);

  const channels = useQuery<Channel[]>({ queryKey: ["/go-api/channels"], queryFn: () => apiFetch(`${BASE}/channels`) });

  const params = new URLSearchParams({ page: String(page), page_size: "12" });
  if (channel) params.set("channel", channel);
  if (difficulty) params.set("difficulty", difficulty);

  const { data, isLoading, isError } = useQuery<Paginated<Flashcard>>({
    queryKey: ["/go-api/flashcards", channel, difficulty, page],
    queryFn: () => apiFetch(`${BASE}/flashcards?${params}`),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={channel || "__all__"} onValueChange={v => { setChannel(v === "__all__" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44" data-testid="select-flashcard-channel">
            <SelectValue placeholder="All channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All channels</SelectItem>
            {(channels.data ?? []).map(c => <SelectItem key={c.id} value={c.id}>{c.id}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficulty || "__all__"} onValueChange={v => { setDifficulty(v === "__all__" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40" data-testid="select-flashcard-difficulty">
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <Loading /> : isError ? <Err msg="Could not load flashcards" /> : !data?.data.length ? (
        <Empty label="No flashcards found" />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{data.total} flashcards — click a card to reveal the answer</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.data.map(f => (
              <div
                key={f.id}
                className="rounded-md border p-4 min-h-[120px] cursor-pointer hover-elevate space-y-2"
                onClick={() => setFlipped(flipped === f.id ? null : f.id)}
                data-testid={`card-flashcard-${f.id}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug flex-1">
                    {flipped === f.id ? f.back : f.front}
                  </p>
                  <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                    {flipped === f.id ? "Answer" : "Question"}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">{f.channel}</Badge>
                  {f.difficulty && <DiffBadge d={f.difficulty} />}
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}

// ─── CERTIFICATIONS TAB ─────────────────────────────────────────────────────
function CertificationsTab() {
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState("");
  const [category, setCategory] = useState("");

  const params = new URLSearchParams({ page: String(page), page_size: "15" });
  if (difficulty) params.set("difficulty", difficulty);
  if (category) params.set("category", category);

  const { data, isLoading, isError } = useQuery<Paginated<Certification>>({
    queryKey: ["/go-api/certifications", difficulty, category, page],
    queryFn: () => apiFetch(`${BASE}/certifications?${params}`),
  });

  const categories = Array.from(new Set((data?.data ?? []).map(c => c.category).filter(Boolean)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={difficulty || "__all__"} onValueChange={v => { setDifficulty(v === "__all__" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40" data-testid="select-cert-difficulty">
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <Loading /> : isError ? <Err msg="Could not load certifications" /> : !data?.data.length ? (
        <Empty label="No certifications found" />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{data.total} certifications</p>
          <div className="space-y-2">
            {data.data.map(c => (
              <div key={c.id} className="rounded-md border p-4 space-y-1.5 hover-elevate" data-testid={`card-cert-${c.id}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold flex-1">{c.name || c.id}</p>
                  {c.category && <Badge variant="secondary" className="text-[10px]">{c.category}</Badge>}
                  <DiffBadge d={c.difficulty} />
                </div>
                {c.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{c.description}</p>
                )}
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}

// ─── LEARNING PATHS TAB ─────────────────────────────────────────────────────
function LearningPathsTab() {
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState("");

  const params = new URLSearchParams({ page: String(page), page_size: "15" });
  if (difficulty) params.set("difficulty", difficulty);

  const { data, isLoading, isError } = useQuery<Paginated<LearningPath>>({
    queryKey: ["/go-api/learning-paths", difficulty, page],
    queryFn: () => apiFetch(`${BASE}/learning-paths?${params}`),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={difficulty || "__all__"} onValueChange={v => { setDifficulty(v === "__all__" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40" data-testid="select-path-difficulty">
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <Loading /> : isError ? <Err msg="Could not load learning paths" /> : !data?.data.length ? (
        <Empty label="No learning paths found" />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{data.total} learning paths</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.data.map(p => (
              <Card key={p.id} data-testid={`card-path-${p.id}`}>
                <CardContent className="pt-4 pb-3 space-y-2">
                  <p className="text-sm font-semibold leading-snug line-clamp-2">{p.title || p.name || p.id}</p>
                  <div className="flex flex-wrap gap-1">
                    {p.pathType && <Badge variant="secondary" className="text-[10px]">{p.pathType}</Badge>}
                    {p.company && <Badge variant="outline" className="text-[10px]">{p.company}</Badge>}
                    {p.jobTitle && <Badge variant="outline" className="text-[10px]">{p.jobTitle}</Badge>}
                    <DiffBadge d={p.difficulty} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}

// ─── VOICE SESSIONS TAB ─────────────────────────────────────────────────────
function VoiceSessionsTab() {
  const [page, setPage] = useState(1);
  const [channel, setChannel] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const channels = useQuery<Channel[]>({ queryKey: ["/go-api/channels"], queryFn: () => apiFetch(`${BASE}/channels`) });

  const params = new URLSearchParams({ page: String(page), page_size: "12" });
  if (channel) params.set("channel", channel);
  if (difficulty) params.set("difficulty", difficulty);

  const { data, isLoading, isError } = useQuery<Paginated<VoiceSession>>({
    queryKey: ["/go-api/voice-sessions", channel, difficulty, page],
    queryFn: () => apiFetch(`${BASE}/voice-sessions?${params}`),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Select value={channel || "__all__"} onValueChange={v => { setChannel(v === "__all__" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-44" data-testid="select-voice-channel">
            <SelectValue placeholder="All channels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All channels</SelectItem>
            {(channels.data ?? []).map(c => <SelectItem key={c.id} value={c.id}>{c.id}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={difficulty || "__all__"} onValueChange={v => { setDifficulty(v === "__all__" ? "" : v); setPage(1); }}>
          <SelectTrigger className="w-40" data-testid="select-voice-difficulty">
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All difficulties</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? <Loading /> : isError ? <Err msg="Could not load voice sessions" /> : !data?.data.length ? (
        <Empty label="No voice sessions found" />
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{data.total} voice sessions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {data.data.map(v => (
              <div key={v.id} className="rounded-md border p-4 space-y-2 hover-elevate" data-testid={`card-voice-${v.id}`}>
                <p className="text-sm font-medium leading-snug line-clamp-3">{v.prompt}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-[10px]">{v.channel}</Badge>
                  <DiffBadge d={v.difficulty} />
                </div>
              </div>
            ))}
          </div>
          <Pagination page={page} totalPages={data.totalPages} onPage={setPage} />
        </>
      )}
    </div>
  );
}

// ─── ROOT ───────────────────────────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "channels", label: "Channels", icon: Layers },
  { id: "questions", label: "Questions", icon: BookOpen },
  { id: "flashcards", label: "Flashcards", icon: FlaskConical },
  { id: "certifications", label: "Certifications", icon: FileCheck2 },
  { id: "learning-paths", label: "Paths", icon: Map },
  { id: "voice", label: "Voice", icon: Mic },
] as const;

export default function GoExplorer() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon" data-testid="button-back-home">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-semibold leading-none">Go API Explorer</h1>
                <p className="text-[11px] text-muted-foreground leading-none mt-0.5">Live data from the Go service</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              go-api:3001
            </Badge>
            <a href="/go-api/" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs" data-testid="button-api-index">
                API Index
                <ArrowUpRight className="w-3 h-3" />
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 py-6" id="main-content">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <TabsTrigger key={id} value={id} className="gap-1.5 text-xs" data-testid={`tab-${id}`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="channels"><ChannelsTab /></TabsContent>
          <TabsContent value="questions"><QuestionsTab /></TabsContent>
          <TabsContent value="flashcards"><FlashcardsTab /></TabsContent>
          <TabsContent value="certifications"><CertificationsTab /></TabsContent>
          <TabsContent value="learning-paths"><LearningPathsTab /></TabsContent>
          <TabsContent value="voice"><VoiceSessionsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
