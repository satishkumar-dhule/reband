import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  AppLayout, SEOHead, SkipLink, Button, Badge,
  PageHeader, EmptyState, Input,
} from '@/lib/ui';
import { allChannelsConfig } from '../lib/channels-config';
import { curatedPaths } from '../lib/learning-paths-data';
import { Plus, ChevronRight, Check, X, Search, Clock, Trophy, Layers, Trash2, Award } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getDifficultyClasses } from '@/lib/difficulty';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Certification {
  id: string;
  name: string;
  provider: string;
  icon: string;
  category: string;
}

interface SavedPath {
  id: string;
  name: string;
  channels: string[];
  certifications: string[];
  createdAt: string;
}

interface CustomPathForm {
  name: string;
  channels: string[];
  certifications: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadSavedPaths(): SavedPath[] {
  try {
    return JSON.parse(localStorage.getItem('customPaths') || '[]');
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LearningPaths() {
  const [, setLocation] = useLocation();

  // ── Custom path creation modal ──
  const [showCustom, setShowCustom] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [certsError, setCertsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customPath, setCustomPath] = useState<CustomPathForm>({ name: '', channels: [], certifications: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // ── User's saved paths (live from localStorage) ──
  const [savedPaths, setSavedPaths] = useState<SavedPath[]>([]);

  // ── Curated path filter ──
  type TabValue = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';
  const [activeTab, setActiveTab] = useState<TabValue>('all');

  // Load saved paths from localStorage on mount
  useEffect(() => {
    setSavedPaths(loadSavedPaths());
  }, []);

  // Reload saved paths when the modal closes (new path was just created)
  useEffect(() => {
    if (!showCustom) setSavedPaths(loadSavedPaths());
  }, [showCustom]);

  // Load certifications for the modal
  useEffect(() => {
    async function loadCerts() {
      setCertsLoading(true);
      setCertsError(null);
      try {
        const res = await fetch('/api/certifications');
        if (res.ok) setCertifications(await res.json());
        else setCertsError('Failed to load certifications');
      } catch { setCertsError('Failed to load certifications'); }
      finally { setCertsLoading(false); }
    }
    loadCerts();
  }, []);

  const handleSelectPath = (pathId: string) => {
    try {
      const current: string[] = JSON.parse(localStorage.getItem('activeLearningPaths') || '[]');
      if (!current.includes(pathId)) current.push(pathId);
      localStorage.setItem('activeLearningPaths', JSON.stringify(current));
    } catch {}
    setLocation(`/path/${pathId}`);
  };

  const handleDeleteSavedPath = (pathId: string) => {
    if (!window.confirm('Delete this path? This cannot be undone.')) return;
    try {
      const updated = savedPaths.filter(p => p.id !== pathId);
      localStorage.setItem('customPaths', JSON.stringify(updated));
      setSavedPaths(updated);
      toast({ title: 'Path deleted' });
    } catch {
      toast({ title: 'Error', description: 'Could not delete path.', variant: 'destructive' });
    }
  };

  const resetCustomPath = useCallback(() => {
    setCustomPath({ name: '', channels: [], certifications: [] });
    setSearchQuery('');
    setShowCustom(false);
    setIsSubmitting(false);
  }, []);

  const handleCreateCustomPath = () => {
    if (isSubmitting) return;
    if (!customPath.name.trim() || (customPath.channels.length === 0 && customPath.certifications.length === 0)) {
      toast({ title: 'Missing Information', description: 'Add a name and select at least one topic.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const pathId = `custom-${Date.now()}`;
      const newPath: SavedPath = {
        id: pathId,
        name: customPath.name.trim(),
        channels: customPath.channels,
        certifications: customPath.certifications,
        createdAt: new Date().toISOString(),
      };
      const existing = loadSavedPaths();
      existing.push(newPath);
      localStorage.setItem('customPaths', JSON.stringify(existing));
      toast({ title: 'Path Created', description: `"${newPath.name}" is ready to start.` });
      resetCustomPath();
      setLocation(`/path/${pathId}`);
    } catch {
      toast({ title: 'Error', description: 'Could not save path.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleChannel = (id: string) =>
    setCustomPath(p => ({ ...p, channels: p.channels.includes(id) ? p.channels.filter(c => c !== id) : [...p.channels, id] }));

  const toggleCertification = (id: string) =>
    setCustomPath(p => ({ ...p, certifications: p.certifications.includes(id) ? p.certifications.filter(c => c !== id) : [...p.certifications, id] }));

  const filteredPaths = useMemo(() =>
    activeTab === 'all' ? curatedPaths : curatedPaths.filter(p => p.difficulty === activeTab),
    [activeTab]
  );

  const filteredChannels = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allChannelsConfig.filter(ch => ch.name.toLowerCase().includes(q) || ch.id.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredCerts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return certifications.filter(c => c.name.toLowerCase().includes(q) || c.provider.toLowerCase().includes(q));
  }, [certifications, searchQuery]);

  // Close modal on Escape
  useEffect(() => {
    if (!showCustom) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') resetCustomPath(); };
    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => { modalRef.current?.querySelector<HTMLElement>('[autofocus]')?.focus(); }, 50);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showCustom, resetCustomPath]);

  return (
    <>
      <SEOHead
        title="Learning Paths | DevPrep"
        description="Curated learning paths for different tech careers"
      />
      <SkipLink />

      <AppLayout>
        {/* ── Page Header ── */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <PageHeader
              title="Learning Paths"
              subtitle="Curated journeys to help you master specific domains"
              actions={
                <Button variant="primary" onClick={() => setShowCustom(true)} icon={<Plus className="w-4 h-4" />}>
                  Create Custom Path
                </Button>
              }
              className="mb-5"
            />

            {/* Difficulty filter */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'Beginner', 'Intermediate', 'Advanced'] as const).map(tab => (
                <Button
                  key={tab}
                  size="sm"
                  variant={activeTab === tab ? 'primary' : 'ghost'}
                  onClick={() => setActiveTab(tab as TabValue)}
                  data-testid={`filter-tab-${tab}`}
                >
                  {tab === 'all' ? 'All Paths' : tab}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-10">

          {/* ── Your Custom Paths ── */}
          {savedPaths.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Your custom paths</h2>
                <span className="text-xs text-muted-foreground">{savedPaths.length} path{savedPaths.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedPaths.map(path => (
                  <div
                    key={path.id}
                    className="group bg-card border border-border rounded-md p-4 flex flex-col hover-elevate transition-all"
                    data-testid={`card-custom-path-${path.id}`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm leading-tight truncate">{path.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Created {new Date(path.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="text-[10px] shrink-0 bg-muted text-muted-foreground border-border">
                        Custom
                      </Badge>
                    </div>

                    {/* Topics summary */}
                    <div className="flex flex-wrap gap-1.5 mb-4 flex-1">
                      {path.channels.slice(0, 3).map(chId => {
                        const ch = allChannelsConfig.find(c => c.id === chId);
                        return (
                          <span key={chId} className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full">
                            {ch?.name ?? chId}
                          </span>
                        );
                      })}
                      {path.certifications.slice(0, 2).map(certId => (
                        <span key={certId} className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Award className="w-2.5 h-2.5" />{certId}
                        </span>
                      ))}
                      {(path.channels.length + path.certifications.length) > 5 && (
                        <span className="text-[10px] text-muted-foreground self-center">
                          +{path.channels.length + path.certifications.length - 5} more
                        </span>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {path.channels.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5" />{path.channels.length} channel{path.channels.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {path.certifications.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5" />{path.certifications.length} cert{path.certifications.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSavedPath(path.id)}
                          aria-label="Delete path"
                          className="text-destructive"
                          icon={<Trash2 className="w-3.5 h-3.5" />}
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleSelectPath(path.id)}
                          icon={<ChevronRight className="w-3.5 h-3.5" />}
                          iconPosition="right"
                          data-testid={`button-open-custom-path-${path.id}`}
                        >
                          Open
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Curated Paths ── */}
          <section>
            {savedPaths.length > 0 && (
              <h2 className="text-base font-semibold mb-4">Curated paths</h2>
            )}
            {filteredPaths.length === 0 ? (
              <EmptyState
                icon={<Search className="w-10 h-10" />}
                title="No paths found"
                description="Try a different difficulty filter."
                action={<Button variant="outline" size="sm" onClick={() => setActiveTab('all')}>Show all</Button>}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPaths.map(path => {
                  const Icon = path.icon;
                  return (
                    <div
                      key={path.id}
                      className="group bg-card border border-border rounded-md p-4 flex flex-col hover-elevate transition-all"
                      data-testid={`card-path-${path.id}`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm leading-tight">{path.name}</h3>
                        </div>
                        <Badge className={`text-[10px] capitalize shrink-0 ${getDifficultyClasses(path.difficulty)}`}>
                          {path.difficulty}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 flex-1">{path.description}</p>

                      <ul className="flex flex-wrap gap-1.5 mb-4 list-none p-0 m-0">
                        {path.skills.slice(0, 3).map(skill => (
                          <li key={skill} className="bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full">
                            {skill}
                          </li>
                        ))}
                        {path.skills.length > 3 && (
                          <li className="text-[10px] text-muted-foreground self-center">+{path.skills.length - 3} more</li>
                        )}
                      </ul>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{path.duration}</span>
                          <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" />{path.totalQuestions} questions</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSelectPath(path.id)}
                          icon={<ChevronRight className="w-3.5 h-3.5" />}
                          iconPosition="right"
                          data-testid={`button-start-path-${path.id}`}
                        >
                          Start
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* ── Create Custom Path Modal ── */}
        {showCustom && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={resetCustomPath}
            aria-modal="true"
            role="dialog"
            aria-labelledby="custom-path-modal-title"
          >
            <div
              ref={modalRef}
              className="bg-card border border-border rounded-md shadow-xl max-w-2xl w-full max-h-[90dvh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h2 id="custom-path-modal-title" className="font-semibold">Create Custom Path</h2>
                <Button variant="ghost" size="sm" onClick={resetCustomPath} aria-label="Close dialog" icon={<X className="w-4 h-4" />} />
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                <div>
                  <label htmlFor="path-name-input" className="block text-sm font-medium mb-1.5">Path Name</label>
                  <Input
                    id="path-name-input"
                    placeholder="e.g., My Interview Prep"
                    value={customPath.name}
                    onChange={e => setCustomPath(p => ({ ...p, name: e.target.value }))}
                    autoFocus
                  />
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                    aria-label="Search channels and certifications"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Channels ({customPath.channels.length} selected)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {filteredChannels.slice(0, 12).map(ch => (
                      <Button
                        key={ch.id}
                        onClick={() => toggleChannel(ch.id)}
                        variant={customPath.channels.includes(ch.id) ? 'primary' : 'outline'}
                        size="sm"
                        className="justify-between"
                      >
                        <span className="truncate">{ch.name}</span>
                        {customPath.channels.includes(ch.id) && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Certifications ({customPath.certifications.length} selected)</h3>
                  {certsLoading ? (
                    <p className="text-sm text-muted-foreground py-4">Loading certifications…</p>
                  ) : certsError ? (
                    <p className="text-sm text-destructive py-4">{certsError}</p>
                  ) : filteredCerts.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">No certifications found</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {filteredCerts.slice(0, 12).map(cert => (
                        <Button
                          key={cert.id}
                          onClick={() => toggleCertification(cert.id)}
                          variant={customPath.certifications.includes(cert.id) ? 'primary' : 'outline'}
                          size="sm"
                          className="justify-between"
                        >
                          <span className="truncate">{cert.name}</span>
                          {customPath.certifications.includes(cert.id) && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-border flex justify-end gap-3">
                <Button variant="outline" onClick={resetCustomPath} disabled={isSubmitting}>Cancel</Button>
                <Button
                  variant="primary"
                  disabled={isSubmitting || !customPath.name.trim() || (customPath.channels.length === 0 && customPath.certifications.length === 0)}
                  onClick={handleCreateCustomPath}
                >
                  {isSubmitting ? 'Creating…' : 'Create Path'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>
    </>
  );
}
