/**
 * My Path - View and Manage Custom Learning Paths
 * Shows all custom paths created by the user + curated paths
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout, EmptyState } from '@/lib/ui';
import { SEOHead } from '@/lib/ui';
import { allChannelsConfig, getChannelName } from '../lib/channels-config';
import { curatedPaths } from '../lib/learning-paths-data';
import { Button, IconButton, MotionButton } from '@/lib/ui';
import { Input } from '@/lib/ui';
import {
  Plus, Trash2, Edit, ChevronRight, Brain, Check, Target, Clock, Sparkles, Award,
  X, Search
} from 'lucide-react';

interface CustomPath {
  id: string;
  name: string;
  channels: string[];
  certifications: string[];
  createdAt: string;
}

// Certification type
interface Certification {
  id: string;
  name: string;
  provider: string;
  icon: string;
  category: string;
}

export default function MyPath() {
  const [, setLocation] = useLocation();
  const [customPaths, setCustomPaths] = useState<CustomPath[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const editModalRef = useRef<HTMLDivElement>(null);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPath, setEditingPath] = useState<CustomPath | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    channels: [] as string[],
    certifications: [] as string[]
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Load custom paths from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('customPaths');
      if (saved) {
        setCustomPaths(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load paths:', e);
    }
  }, []);

  // Load certifications
  useEffect(() => {
    async function loadCerts() {
      try {
        const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/';
        const response = await fetch(`${basePath}data/certifications.json`);
        if (response.ok) {
          const data = await response.json();
          setCertifications(data);
        }
      } catch (e) {
        console.error('Failed to load certifications:', e);
      }
    }
    loadCerts();
  }, []);

  // Save paths to localStorage
  const savePaths = (paths: CustomPath[]) => {
    try {
      localStorage.setItem('customPaths', JSON.stringify(paths));
      setCustomPaths(paths);
    } catch (e) {
      console.error('Failed to save paths:', e);
    }
  };

  // Delete a custom path with confirmation
  const deletePath = (pathId: string) => {
    if (!window.confirm('Delete this path? This cannot be undone.')) return;
    const newPaths = customPaths.filter(p => p.id !== pathId);
    savePaths(newPaths);

    // If deleting active path, remove it from active paths
    try {
      const currentPaths = JSON.parse(localStorage.getItem('activeLearningPaths') || '[]');
      if (currentPaths.includes(pathId)) {
        const updatedPaths = currentPaths.filter((id: string) => id !== pathId);
        localStorage.setItem('activeLearningPaths', JSON.stringify(updatedPaths));
      }
    } catch (e) {
      console.error('Failed to update active paths:', e);
    }
  };

  // Toggle path activation (add or remove from active paths)
  const togglePathActivation = (path: CustomPath) => {
    try {
      const currentPaths = JSON.parse(localStorage.getItem('activeLearningPaths') || '[]');
      const updatedPaths: string[] = currentPaths.includes(path.id)
        ? currentPaths.filter((id: string) => id !== path.id)
        : [...currentPaths, path.id];
      localStorage.setItem('activeLearningPaths', JSON.stringify(updatedPaths));
      // Force re-render
      setCustomPaths(prev => [...prev]);
    } catch (e) {
      console.error('Failed to toggle path:', e);
    }
  };

  // Toggle curated path activation
  const toggleCuratedPathActivation = (path: typeof curatedPaths[0]) => {
    try {
      const currentPaths = JSON.parse(localStorage.getItem('activeLearningPaths') || '[]');
      const updatedPaths: string[] = currentPaths.includes(path.id)
        ? currentPaths.filter((id: string) => id !== path.id)
        : [...currentPaths, path.id];
      localStorage.setItem('activeLearningPaths', JSON.stringify(updatedPaths));
      setCustomPaths(prev => [...prev]);
    } catch (e) {
      console.error('Failed to toggle curated path:', e);
    }
  };

  // Check if a path is active
  const isPathActive = (pathId: string): boolean => {
    try {
      const currentPaths = JSON.parse(localStorage.getItem('activeLearningPaths') || '[]');
      return currentPaths.includes(pathId);
    } catch {
      return false;
    }
  };

  // Open edit modal
  const openEditModal = (path: CustomPath) => {
    setEditingPath(path);
    setEditForm({
      name: path.name,
      channels: [...path.channels],
      certifications: [...path.certifications]
    });
    setSearchQuery('');
    setShowEditModal(true);
  };

  // Toggle channel in edit form
  const toggleEditChannel = (channelId: string) => {
    setEditForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  // Toggle certification in edit form
  const toggleEditCertification = (certId: string) => {
    setEditForm(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certId)
        ? prev.certifications.filter(c => c !== certId)
        : [...prev.certifications, certId]
    }));
  };

  // Save edited path
  const saveEditedPath = () => {
    if (!editingPath || !editForm.name || (editForm.channels.length === 0 && editForm.certifications.length === 0)) {
      alert('Please add a name and select at least one channel or certification');
      return;
    }

    try {
      const updatedPath = {
        ...editingPath,
        name: editForm.name,
        channels: editForm.channels,
        certifications: editForm.certifications
      };

      const updatedPaths = customPaths.map(p => 
        p.id === editingPath.id ? updatedPath : p
      );

      savePaths(updatedPaths);

      setShowEditModal(false);
      setEditingPath(null);
    } catch (e) {
      console.error('Failed to save edited path:', e);
    }
  };

  // Filter channels and certs by search
  const filteredChannels = useMemo(() => allChannelsConfig.filter(ch =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [searchQuery]);

  const filteredCerts = useMemo(() => certifications.filter(cert =>
    cert.name.toLowerCase().includes(searchQuery.toLowerCase())
  ), [certifications, searchQuery]);

  // Escape key + focus trap for edit modal
  useEffect(() => {
    if (!showEditModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setShowEditModal(false); setEditingPath(null); }
    };
    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => {
      const first = editModalRef.current?.querySelector<HTMLElement>('input, button');
      first?.focus();
    }, 50);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showEditModal]);

  return (
    <>
      <SEOHead
        title="My Path - Custom Learning Journeys"
        description="View and manage your custom learning paths"
        canonical="https://open-interview.github.io/my-path"
      />

      <AppLayout>
        {/* Edit Path Modal */}
        <AnimatePresence>
          {showEditModal && editingPath && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-6 pb-safe"
              onClick={() => { setShowEditModal(false); setEditingPath(null); }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-path-modal-title"
            >
              <motion.div
                ref={editModalRef}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-background border border-border rounded-[32px] max-w-4xl w-full max-h-[90dvh] max-h-[90svh] overflow-hidden flex flex-col pb-safe"
              >
                {/* Header */}
                <div className="p-8 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 id="edit-path-modal-title" className="text-3xl font-black">Edit Path</h2>
                    <IconButton
                      icon={<X className="w-5 h-5" />}
                      aria-label="Close dialog"
                      onClick={() => { setShowEditModal(false); setEditingPath(null); }}
                      variant="ghost"
                      size="sm"
                    />
                  </div>
                  
                  {/* Path Name Input */}
                  <Input
                    type="text"
                    placeholder="Path Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-6 py-4 bg-muted/50 text-xl"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto momentum-scroll p-8 space-y-8">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search channels and certifications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-4 py-3 bg-muted/50"
                    />
                  </div>

                  {/* Selected Summary */}
                  {(editForm.channels.length > 0 || editForm.certifications.length > 0) && (
                    <div 
                      className="p-4 border border-[var(--gh-accent-emphasis)] rounded-[16px]"
                      style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gh-accent-emphasis) 10%, transparent), color-mix(in srgb, var(--gh-accent-emphasis) 10%, transparent))' }}
                    >
                      <div className="text-sm text-muted-foreground mb-2">Selected:</div>
                      <div className="flex items-center gap-4 text-sm font-semibold">
                        <span>{editForm.channels.length} channels</span>
                        <span>•</span>
                        <span>{editForm.certifications.length} certifications</span>
                      </div>
                    </div>
                  )}

                  {/* Channels Section */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Channels</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {filteredChannels.slice(0, 20).map((channel) => {
                        const isSelected = editForm.channels.includes(channel.id);
                        return (
                          <Button
                            key={channel.id}
                            onClick={() => toggleEditChannel(channel.id)}
                            variant={isSelected ? 'primary' : 'outline'}
                            className={`p-4 justify-start h-auto ${isSelected ? 'bg-primary/20 border-primary' : ''}`}
                          >
                            <span className="font-semibold">{channel.name}</span>
                            {isSelected && <Check className="w-5 h-5 ml-auto" />}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Certifications Section */}
                  <div>
                    <h3 className="text-xl font-bold mb-4">Certifications</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {filteredCerts.slice(0, 20).map((cert) => {
                        const isSelected = editForm.certifications.includes(cert.id);
                        return (
                          <Button
                            key={cert.id}
                            onClick={() => toggleEditCertification(cert.id)}
                            variant={isSelected ? 'primary' : 'outline'}
                            className={`p-4 justify-start h-auto ${isSelected ? 'bg-primary/20 border-primary' : ''}`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <div className="text-xs text-muted-foreground mb-1">{cert.provider}</div>
                                <div className="font-semibold text-sm">{cert.name}</div>
                              </div>
                              {isSelected && <Check className="w-5 h-5 ml-2" />}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-border flex gap-3">
                  <Button
                    onClick={() => { setShowEditModal(false); setEditingPath(null); }}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={saveEditedPath}
                    disabled={!editForm.name || (editForm.channels.length === 0 && editForm.certifications.length === 0)}
                    variant="primary"
                    size="lg"
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="min-h-screen bg-background text-foreground">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <h1 className="text-6xl md:text-7xl font-black mb-4">
                My
                <br />
                <span 
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, var(--gh-accent-emphasis), var(--gh-accent-emphasis))' }}
                >
                  custom paths
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {customPaths.length} custom {customPaths.length === 1 ? 'path' : 'paths'} created
              </p>
            </motion.div>

            {/* Create New Path Button */}
            <MotionButton
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              variant="outline"
              onClick={() => setLocation('/learning-paths')}
              className="w-full p-8 backdrop-blur-xl rounded-[24px] border-2 border-dashed border-[var(--gh-accent-emphasis)] hover:border-[var(--gh-accent-emphasis)] transition-all group mb-8"
              style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--gh-accent-emphasis) 20%, transparent), color-mix(in srgb, var(--gh-accent-emphasis) 20%, transparent))' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, var(--gh-accent-emphasis), var(--gh-accent-emphasis))' }}
                  >
                    <Plus className="w-8 h-8 text-primary-foreground" strokeWidth={3} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold mb-1">Create New Path</h3>
                    <p className="text-muted-foreground">Build your own learning journey</p>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-primary group-hover:translate-x-2 transition-transform" />
              </div>
            </MotionButton>

            {/* Custom Paths Grid */}
            {customPaths.length === 0 ? (
              <EmptyState
                icon={<Brain className="w-8 h-8" />}
                title="No custom paths yet"
                description="Create your first learning path to build a focused, personalised study plan across any mix of channels and certifications."
                variant="info"
                size="lg"
                action={
                  <Button variant="primary" onClick={() => setLocation('/learning-paths')}>
                    Create a Path
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customPaths.map((path, i) => {
                  const isActive = isPathActive(path.id);

                  return (
                    <motion.div
                      key={path.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      className={`group relative p-6 backdrop-blur-xl rounded-[24px] border-2 transition-all overflow-hidden ${
                        isActive
                          ? 'border-[var(--gh-accent-emphasis)]'
                          : 'bg-muted/50 border-border hover:border-border'
                      }`}
                      style={isActive ? { background: 'linear-gradient(135deg, color-mix(in srgb, var(--gh-accent-emphasis) 20%, transparent), color-mix(in srgb, var(--gh-accent-emphasis) 20%, transparent))' } : undefined}
                    >
                      {/* Active Badge */}
                      {isActive && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-[var(--gh-accent-emphasis)] text-[var(--gh-accent-fg)] rounded-full text-xs font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Active
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-16 h-16 rounded-[16px] flex items-center justify-center flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--gh-done-fg), var(--gh-danger-fg))' }}
                          >
                            <Brain className="w-8 h-8 text-foreground" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-1">{path.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Created {new Date(path.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-background/30 rounded-[12px]">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Target className="w-3 h-3" />
                              <span>Channels</span>
                            </div>
                            <div className="font-bold">{path.channels.length}</div>
                          </div>
                          <div className="p-3 bg-background/30 rounded-[12px]">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Award className="w-3 h-3" />
                              <span>Certifications</span>
                            </div>
                            <div className="font-bold">{path.certifications.length}</div>
                          </div>
                        </div>

                        {/* Channels Preview */}
                        {path.channels.length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-2">Channels</div>
                            <div className="flex flex-wrap gap-2">
                              {path.channels.slice(0, 3).map((channelId) => (
                                <span
                                  key={channelId}
                                  className="px-2 py-1 bg-muted/50 rounded-full text-xs font-medium"
                                >
                                  {getChannelName(channelId)}
                                </span>
                              ))}
                              {path.channels.length > 3 && (
                                <span className="px-2 py-1 bg-muted/50 rounded-full text-xs font-medium text-muted-foreground">
                                  +{path.channels.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2">
                          <Button
                            onClick={() => togglePathActivation(path)}
                            variant={isActive ? 'secondary' : 'primary'}
                            className="flex-1"
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          
                          <IconButton
                            icon={<Edit className="w-5 h-5" />}
                            aria-label="Edit path"
                            onClick={() => openEditModal(path)}
                            variant="outline"
                          />
                          
                          <IconButton
                            icon={<Trash2 className="w-5 h-5" />}
                            aria-label="Delete path"
                            onClick={() => deletePath(path.id)}
                            variant="danger"
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Curated Paths Section */}
            <div className="mt-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                <h2 className="text-4xl font-black mb-2">Curated Paths</h2>
                <p className="text-muted-foreground">Pre-built learning journeys for popular career paths</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {curatedPaths.map((path, i) => {
                  const Icon = path.icon;
                  const isActive = isPathActive(path.id);

                  return (
                    <motion.div
                      key={path.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className={`group relative p-6 backdrop-blur-xl rounded-[24px] border-2 transition-all overflow-hidden ${
                        isActive
                          ? 'border-[var(--gh-accent-emphasis)]'
                          : 'bg-muted/50 border-border hover:border-border'
                      }`}
                      style={isActive ? { background: 'linear-gradient(135deg, color-mix(in srgb, var(--gh-accent-emphasis) 20%, transparent), color-mix(in srgb, var(--gh-accent-emphasis) 20%, transparent))' } : undefined}
                    >
                      {/* Background gradient on hover */}
                      <div 
                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                        style={{ background: `linear-gradient(135deg, ${path.gradientFrom}, ${path.gradientTo})` }}
                      />

                      {/* Active Badge */}
                      {isActive && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-[var(--gh-accent-emphasis)] text-[var(--gh-accent-fg)] rounded-full text-xs font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Active
                        </div>
                      )}

                      <div className="relative space-y-4">
                        {/* Header */}
                        <div className="flex items-start gap-4">
                          <div 
                            className="w-16 h-16 rounded-[16px] flex items-center justify-center flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${path.gradientFrom}, ${path.gradientTo})` }}
                          >
                            <Icon className="w-8 h-8 text-foreground" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-1">{path.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{path.description}</p>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 bg-background/30 rounded-[12px]">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Target className="w-3 h-3" />
                              <span>Difficulty</span>
                            </div>
                            <div className="font-bold text-sm">{path.difficulty}</div>
                          </div>
                          <div className="p-3 bg-background/30 rounded-[12px]">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                              <Clock className="w-3 h-3" />
                              <span>Duration</span>
                            </div>
                            <div className="font-bold text-sm">{path.duration}</div>
                          </div>
                        </div>

                        {/* Channels Preview */}
                        <div>
                          <div className="text-xs text-muted-foreground mb-2">Channels ({path.channels.length})</div>
                          <div className="flex flex-wrap gap-2">
                            {path.channels.slice(0, 3).map((channelId) => (
                              <span
                                key={channelId}
                                className="px-2 py-1 bg-muted/50 rounded-full text-xs font-medium"
                              >
                                {getChannelName(channelId)}
                              </span>
                            ))}
                            {path.channels.length > 3 && (
                              <span className="px-2 py-1 bg-muted/50 rounded-full text-xs font-medium text-muted-foreground">
                                +{path.channels.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Salary */}
                        <div className="pt-2 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-1">Avg. salary</div>
                          <div className="font-bold" style={{ color: 'var(--gh-accent-emphasis)' }}>{path.salary}</div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2">
                          <Button
                            onClick={() => toggleCuratedPathActivation(path)}
                            variant={isActive ? 'secondary' : 'primary'}
                            fullWidth
                          >
                            {isActive ? 'Deactivate' : 'Activate Path'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
