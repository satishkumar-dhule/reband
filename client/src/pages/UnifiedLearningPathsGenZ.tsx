/**
 * Unified Learning Paths - All paths in one place
 * Shows: Active paths, Custom paths, Curated paths
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { allChannelsConfig } from '../lib/channels-config';
import { BottomSheet, FloatingButton } from '../components/mobile';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import {
  Plus, Trash2, Edit, ChevronRight, Brain, Check, Target, Clock, Sparkles, Award,
  Code, Server, Rocket, X, Search, Star, Zap, Trophy, Building2
} from 'lucide-react';
import { Button, IconButton, ButtonGroup } from '@/components/unified/Button';
import { Input } from '@/components/ui/input';

interface CustomPath {
  id: string;
  name: string;
  channels: string[];
  certifications: string[];
  createdAt: string;
}

interface Certification {
  id: string;
  name: string;
  provider: string;
  icon: string;
  category: string;
}

export default function UnifiedLearningPathsGenZ() {
  const [, setLocation] = useLocation();
  const [view, setView] = useState<'all' | 'custom' | 'curated'>('all');
  const [customPaths, setCustomPaths] = useState<CustomPath[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [curatedPaths, setCuratedPaths] = useState<any[]>([]);
  const [showPathModal, setShowPathModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [modalTab, setModalTab] = useState<'channels' | 'certifications'>('channels');
  const [searchQuery, setSearchQuery] = useState('');
  const [curatedSearchQuery, setCuratedSearchQuery] = useState('');
  
  const [customForm, setCustomForm] = useState({
    name: '',
    channels: [] as string[],
    certifications: [] as string[]
  });

  const [editForm, setEditForm] = useState({
    name: '',
    channels: [] as string[],
    certifications: [] as string[]
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('customLearningPaths');
      if (saved) {
        setCustomPaths(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load custom paths:', e);
    }
  }, []);

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

  useEffect(() => {
    async function loadCuratedPaths() {
      try {
        const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/';
        const response = await fetch(`${basePath}data/learning-paths.json`);
        if (response.ok) {
          const data = await response.json();
          const mappedPaths = data.map((path: any) => {
            const questionIds = typeof path.questionIds === 'string' ? JSON.parse(path.questionIds) : path.questionIds;
            const channels = typeof path.channels === 'string' ? JSON.parse(path.channels) : path.channels;
            const tags = typeof path.tags === 'string' ? JSON.parse(path.tags) : path.tags;
            const learningObjectives = typeof path.learningObjectives === 'string' ? JSON.parse(path.learningObjectives) : path.learningObjectives;
            const milestones = typeof path.milestones === 'string' ? JSON.parse(path.milestones) : path.milestones;
            
            return {
              id: path.id,
              name: path.title,
              icon: getIconForPath(path.pathType),
              color: getColorForPath(path.pathType),
              description: path.description,
              channels: channels || [],
              difficulty: path.difficulty.charAt(0).toUpperCase() + path.difficulty.slice(1),
              duration: `${path.estimatedHours}h`,
              totalQuestions: questionIds?.length || 0,
              jobs: learningObjectives?.slice(0, 3) || [],
              skills: tags?.slice(0, 5) || [],
              salary: getSalaryRange(path.targetJobTitle),
              pathType: path.pathType,
              targetCompany: path.targetCompany,
              milestones: milestones || []
            };
          });
          setCuratedPaths(mappedPaths);
        }
      } catch (e) {
        console.error('Failed to load curated paths:', e);
        setCuratedPaths([]);
      }
    }
    loadCuratedPaths();
  }, []);

  const getIconForPath = (pathType: string) => {
    const iconMap: Record<string, any> = {
      'job-title': Code,
      'company': Building2,
      'skill': Brain,
      'certification': Award
    };
    return iconMap[pathType] || Rocket;
  };

  const getColorForPath = (pathType: string) => {
    const colorMap: Record<string, string> = {
      'job-title': 'from-[var(--gh-accent-fg)] to-cyan-500',
      'company': 'from-[var(--gh-success-fg)] to-emerald-500',
      'skill': 'from-[var(--gh-done-fg)] to-pink-500',
      'certification': 'from-[var(--gh-attention-fg)] to-orange-500'
    };
    return colorMap[pathType] || 'from-indigo-500 to-purple-500';
  };

  const getSalaryRange = (jobTitle: string | null) => {
    const salaryMap: Record<string, string> = {
      'frontend-engineer': '$80k - $120k',
      'backend-engineer': '$90k - $140k',
      'fullstack-engineer': '$100k - $160k',
      'devops-engineer': '$110k - $170k',
      'data-engineer': '$95k - $150k',
      'mobile-developer': '$85k - $130k'
    };
    return jobTitle ? salaryMap[jobTitle] || '$80k - $150k' : '';
  };

  const [activePaths, setActivePaths] = useState<any[]>([]);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem('activeLearningPaths');
      if (saved) {
        const pathIds: string[] = JSON.parse(saved);
        setActivePaths(current => {
          const paths = pathIds.map((id: string) => {
            const custom = customPaths.find(p => p.id === id);
            if (custom) return { ...custom, type: 'custom' };
            const curated = curatedPaths.find(p => p.id === id);
            if (curated) return { ...curated, type: 'curated' };
            return null;
          }).filter(Boolean);
          return paths;
        });
      } else {
        setActivePaths([]);
      }
    } catch {
      setActivePaths([]);
    }
  }, [customPaths, curatedPaths]);

  const activateCustomPath = (pathId: string) => {
    try {
      const saved = localStorage.getItem('activeLearningPaths');
      const current = saved ? JSON.parse(saved) : [];
      if (!current.includes(pathId)) {
        current.push(pathId);
        localStorage.setItem('activeLearningPaths', JSON.stringify(current));
        window.location.reload();
      }
    } catch (e) {
      console.error('Failed to activate path:', e);
    }
  };

  const deactivateCustomPath = (pathId: string) => {
    try {
      const saved = localStorage.getItem('activeLearningPaths');
      const current = saved ? JSON.parse(saved) : [];
      const updated = current.filter((id: string) => id !== pathId);
      localStorage.setItem('activeLearningPaths', JSON.stringify(updated));
      window.location.reload();
    } catch (e) {
      console.error('Failed to deactivate path:', e);
    }
  };

  const deleteCustomPath = (pathId: string) => {
    if (!confirm('Delete this path? This cannot be undone.')) return;
    
    try {
      const updated = customPaths.filter(p => p.id !== pathId);
      localStorage.setItem('customLearningPaths', JSON.stringify(updated));
      setCustomPaths(updated);
      deactivateCustomPath(pathId);
    } catch (e) {
      console.error('Failed to delete path:', e);
    }
  };

  const saveEditedPath = () => {
    if (!selectedPath || !editForm.name || (editForm.channels.length === 0 && editForm.certifications.length === 0)) {
      alert('Please enter a name and select at least one channel or certification');
      return;
    }

    const updated = customPaths.map(p => 
      p.id === selectedPath.id 
        ? { ...p, name: editForm.name, channels: editForm.channels, certifications: editForm.certifications }
        : p
    );
    
    localStorage.setItem('customLearningPaths', JSON.stringify(updated));
    setCustomPaths(updated);
    setShowPathModal(false);
    setSelectedPath(null);
    setEditForm({ name: '', channels: [], certifications: [] });
  };

  const openPathModal = (path: any, mode: 'create' | 'edit' | 'view') => {
    setModalMode(mode);
    setSelectedPath(path);
    setModalTab('channels');
    
    if (mode === 'create') {
      setCustomForm({ name: '', channels: [], certifications: [] });
    } else if (mode === 'edit') {
      setEditForm({
        name: path.name,
        channels: path.channels || [],
        certifications: path.certifications || []
      });
    }
    
    setShowPathModal(true);
  };

  const closePathModal = () => {
    setShowPathModal(false);
    setSelectedPath(null);
    setModalMode('create');
    setSearchQuery('');
  };

  const toggleEditChannel = (channelId: string) => {
    setEditForm(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(id => id !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const toggleEditCertification = (certId: string) => {
    setEditForm(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certId)
        ? prev.certifications.filter(id => id !== certId)
        : [...prev.certifications, certId]
    }));
  };

  const saveCustomPath = () => {
    if (!customForm.name || (customForm.channels.length === 0 && customForm.certifications.length === 0)) {
      alert('Please enter a name and select at least one channel or certification');
      return;
    }

    const newPath: CustomPath = {
      id: `custom-${Date.now()}`,
      name: customForm.name,
      channels: customForm.channels,
      certifications: customForm.certifications,
      createdAt: new Date().toISOString()
    };

    const updated = [...customPaths, newPath];
    localStorage.setItem('customLearningPaths', JSON.stringify(updated));
    setCustomPaths(updated);
    setCustomForm({ name: '', channels: [], certifications: [] });
    closePathModal();
    activateCustomPath(newPath.id);
  };

  const filteredChannels = Object.values(allChannelsConfig).filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCerts = certifications.filter(cert =>
    cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cert.provider.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filterCuratedPaths = (paths: any[], query: string) => {
    if (!query) return paths;
    const q = query.toLowerCase();
    
    return paths.filter(path => {
      if (path.name.toLowerCase().includes(q)) return true;
      if (path.description.toLowerCase().includes(q)) return true;
      if (path.pathType.toLowerCase().includes(q)) return true;
      
      if (path.targetCompany && path.targetCompany.toLowerCase().includes(q)) return true;
      
      if (path.channels && Array.isArray(path.channels)) {
        if (path.channels.some((channel: string) => channel.toLowerCase().includes(q))) return true;
      }
      
      if (path.skills && Array.isArray(path.skills)) {
        if (path.skills.some((skill: string) => skill.toLowerCase().includes(q))) return true;
      }
      
      if (path.jobs && Array.isArray(path.jobs)) {
        if (path.jobs.some((job: string) => job.toLowerCase().includes(q))) return true;
      }
      
      if (path.difficulty && path.difficulty.toLowerCase().includes(q)) return true;
      
      return false;
    });
  };

  const isReadonly = modalMode === 'view';
  const currentChannels = modalMode === 'create' ? customForm.channels : (modalMode === 'edit' ? editForm.channels : selectedPath?.channels || []);
  const currentCertifications = modalMode === 'create' ? customForm.certifications : (modalMode === 'edit' ? editForm.certifications : selectedPath?.certifications || []);

  const handleTabChange = (tabId: 'all' | 'custom' | 'curated') => setView(tabId);

  return (
    <>
      <SEOHead
        title="Learning Paths - Open-Interview"
        description="Choose your career path and start learning"
      />

      <AppLayout>
        <div className="min-h-screen bg-background text-foreground pt-safe pb-safe">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full overflow-x-hidden">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 md:mb-12"
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-3 md:mb-4">
                Learning
                <br />
                <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">
                  Paths
                </span>
              </h1>
              <p className="text-base md:text-xl text-muted-foreground">
                {activePaths.length > 0 && `${activePaths.length} active • `}
                {customPaths.length} custom • {curatedPaths.length} curated
              </p>
            </motion.div>

            <div className="flex gap-2 mb-6 md:mb-8 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
              <ButtonGroup>
                <Button
                  variant={view === 'all' ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => handleTabChange('all')}
                >
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5" />
                  All Paths
                </Button>
                <Button
                  variant={view === 'custom' ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => handleTabChange('custom')}
                >
                  <Brain className="w-4 h-4 md:w-5 md:h-5" />
                  My Custom
                </Button>
                <Button
                  variant={view === 'curated' ? 'primary' : 'ghost'}
                  size="md"
                  onClick={() => handleTabChange('curated')}
                >
                  <Star className="w-4 h-4 md:w-5 md:h-5" />
                  Curated
                </Button>
              </ButtonGroup>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => openPathModal(null, 'create')}
              className="w-full p-6 md:p-8 bg-gradient-to-r from-primary/20 to-cyan-500/20 backdrop-blur-xl rounded-[20px] md:rounded-[24px] border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all group mb-6 md:mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-cyan-500 rounded-full flex items-center justify-center">
                    <Plus className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" strokeWidth={3} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg md:text-2xl font-bold mb-0.5 md:mb-1">Create Custom Path</h3>
                    <p className="text-sm md:text-base text-muted-foreground">Build your own learning journey</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 md:w-8 md:h-8 text-primary group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.button>

            {activePaths.length > 0 && (view === 'all' || view === 'custom') && (
              <div className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                  <Zap className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                  Active Paths
                </h2>
                <div className="grid gap-4 md:gap-6">
                  {activePaths.map((path: any) => {
                    const Icon = path.icon || Brain;
                    
                    return (
                      <motion.div
                        key={path.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative p-4 md:p-6 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl rounded-[20px] md:rounded-[24px] border border-primary/30 hover:border-primary/60 transition-all group"
                      >
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 px-2.5 py-1 md:px-3 md:py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Active
                        </div>

                        <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                          <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${path.color || 'from-purple-500 to-pink-500'} rounded-[14px] md:rounded-[16px] flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 md:w-8 md:h-8 text-foreground" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-2xl font-bold mb-0.5 md:mb-1 truncate">{path.name}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{path.description || `Created ${new Date(path.createdAt).toLocaleDateString()}`}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="md"
                            className="flex-1"
                            onClick={() => path.channels[0] ? setLocation(`/channel/${path.channels[0]}`) : setLocation('/learning-paths')}
                          >
                            Continue Learning
                          </Button>
                          <IconButton
                            icon={<X className="w-4 h-4 md:w-5 md:h-5" />}
                            variant="ghost"
                            size="md"
                            onClick={() => deactivateCustomPath(path.id)}
                            aria-label="Deactivate path"
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {(view === 'all' || view === 'custom') && customPaths.length > 0 && (
              <div className="mb-8 md:mb-12">
                <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
                  <Brain className="w-6 h-6 md:w-8 md:h-8 text-[var(--gh-done-fg)]" />
                  My Custom Paths
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {customPaths.map((path) => {
                    const isActive = activePaths.some((p: any) => p.id === path.id);
                    
                    return (
                      <motion.div
                        key={path.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 md:p-6 bg-card backdrop-blur-xl rounded-[20px] md:rounded-[24px] border border-border hover:border-primary/30 hover:scale-[1.02] transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3 md:mb-4">
                          <h3 className="text-lg md:text-xl font-bold flex-1 min-w-0 truncate">{path.name}</h3>
                          <div className="flex gap-1.5 md:gap-2 flex-shrink-0 ml-2">
                            <IconButton
                              icon={<Edit className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openPathModal(path, 'edit');
                              }}
                              aria-label="Edit path"
                            />
                            <IconButton
                              icon={<Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                              variant="danger"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteCustomPath(path.id);
                              }}
                              aria-label="Delete path"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 mb-3 md:mb-4">
                          <div className="text-xs md:text-sm text-muted-foreground">
                            {path.channels.length} channels • {path.certifications.length} certifications
                          </div>
                        </div>

                        <Button
                          variant={isActive ? 'secondary' : 'primary'}
                          size="md"
                          className="w-full"
                          onClick={() => isActive ? deactivateCustomPath(path.id) : activateCustomPath(path.id)}
                        >
                          {isActive ? 'Deactivate' : 'Activate Path'}
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {(view === 'all' || view === 'curated') && (
              <div>
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2 md:gap-3">
                    <Star className="w-6 h-6 md:w-8 md:h-8 text-[var(--gh-attention-fg)]" />
                    Curated Career Paths
                    {curatedSearchQuery && (
                      <span className="text-base md:text-lg font-normal text-muted-foreground">
                        ({filterCuratedPaths(curatedPaths, curatedSearchQuery).length} results)
                      </span>
                    )}
                  </h2>
                </div>
                
                <div className="mb-4 md:mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search paths by name, company, certification, or topic..."
                      value={curatedSearchQuery}
                      onChange={(e) => setCuratedSearchQuery(e.target.value)}
                      className="pl-10 md:pl-12"
                    />
                    {curatedSearchQuery && (
                      <IconButton
                        icon={<X className="w-4 h-4" />}
                        variant="ghost"
                        size="sm"
                        className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2"
                        onClick={() => setCuratedSearchQuery('')}
                        aria-label="Clear search"
                      />
                    )}
                  </div>
                  {curatedSearchQuery && (
                    <div className="mt-2 text-xs md:text-sm text-muted-foreground">
                      💡 Searching in: path names, descriptions, companies, certifications, topics, and skills
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {curatedPaths
                    .filter(path => {
                      if (!curatedSearchQuery) return true;
                      const query = curatedSearchQuery.toLowerCase();
                      
                      if (path.name.toLowerCase().includes(query)) return true;
                      if (path.description.toLowerCase().includes(query)) return true;
                      if (path.pathType.toLowerCase().includes(query)) return true;
                      
                      if (path.targetCompany && path.targetCompany.toLowerCase().includes(query)) return true;
                      
                      if (path.channels && Array.isArray(path.channels)) {
                        if (path.channels.some((channel: string) => channel.toLowerCase().includes(query))) return true;
                      }
                      
                      if (path.skills && Array.isArray(path.skills)) {
                        if (path.skills.some((skill: string) => skill.toLowerCase().includes(query))) return true;
                      }
                      
                      if (path.jobs && Array.isArray(path.jobs)) {
                        if (path.jobs.some((job: string) => job.toLowerCase().includes(query))) return true;
                      }
                      
                      if (path.difficulty && path.difficulty.toLowerCase().includes(query)) return true;
                      
                      return false;
                    })
                    .map((path) => {
                    const Icon = path.icon;
                    const isActive = activePaths.some((p: any) => p.id === path.id);
                    
                    return (
                      <motion.div
                        key={path.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 md:p-6 bg-card backdrop-blur-xl rounded-[20px] md:rounded-[24px] border border-border hover:border-primary/30 hover:scale-[1.02] transition-all duration-200 group cursor-pointer"
                        onClick={() => openPathModal(path, 'view')}
                      >
                        <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                          <div className={`w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${path.color} rounded-[14px] md:rounded-[16px] flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 md:w-8 md:h-8 text-foreground" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg md:text-xl font-bold mb-0.5 md:mb-1 line-clamp-2">{path.name}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{path.description}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 md:gap-2 mb-3 md:mb-4 text-xs text-muted-foreground">
                          <div>
                            <Clock className="w-3 h-3 inline mr-1" />
                            {path.duration}
                          </div>
                          <div>
                            <Target className="w-3 h-3 inline mr-1" />
                            {path.totalQuestions}Q
                          </div>
                          <div>
                            <Trophy className="w-3 h-3 inline mr-1" />
                            {path.difficulty}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs md:text-sm font-bold text-primary truncate">{path.salary}</span>
                          {isActive ? (
                            <span className="px-2.5 py-1 md:px-3 md:py-1 bg-primary/20 text-primary rounded-full text-xs font-bold">
                              Active
                            </span>
                          ) : (
                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                
                  {curatedSearchQuery && filterCuratedPaths(curatedPaths, curatedSearchQuery).length === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8 md:py-12"
                    >
                      <Search className="w-12 h-12 md:w-16 md:h-16 text-muted mx-auto mb-3 md:mb-4" />
                      <h3 className="text-xl md:text-2xl font-bold mb-2">No paths found</h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                        Try searching for something else or{' '}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCuratedSearchQuery('')}
                        >
                          clear your search
                        </Button>
                      </p>
                    </motion.div>
                  )}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showPathModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center md:p-6"
              onClick={closePathModal}
            >
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-card border-t md:border border-border rounded-t-[24px] md:rounded-[32px] max-w-4xl w-full h-[90dvh] h-[90svh] md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col mb-16 md:mb-0 pb-safe"
              >
                <div className="flex justify-center pt-3 pb-2 md:hidden">
                  <div className="w-12 h-1 bg-muted rounded-full" />
                </div>

                <div className="px-4 py-3 md:p-8 border-b border-border flex-shrink-0">
                  <div className="flex items-center justify-between mb-2 md:mb-4">
                    <h2 className="text-lg md:text-3xl font-black truncate pr-2">
                      {modalMode === 'create' ? 'Create Path' : modalMode === 'edit' ? 'Edit Path' : selectedPath?.name}
                    </h2>
                    <IconButton
                      icon={<X className="w-4 h-4 md:w-5 md:h-5" />}
                      variant="ghost"
                      size="md"
                      onClick={closePathModal}
                      aria-label="Close modal"
                    />
                  </div>

                  {!isReadonly && (
                    <Input
                      id="path-name-input"
                      type="text"
                      placeholder="Path name (e.g., 'My Frontend Journey')"
                      value={modalMode === 'create' ? customForm.name : editForm.name}
                      onChange={(e) => {
                        if (modalMode === 'create') {
                          setCustomForm(prev => ({ ...prev, name: e.target.value }));
                        } else {
                          setEditForm(prev => ({ ...prev, name: e.target.value }));
                        }
                      }}
                    />
                  )}

                  {isReadonly && selectedPath?.description && (
                    <div className="mt-2 md:mt-4">
                      <p className="text-sm md:text-base text-muted-foreground">{selectedPath.description}</p>
                      
                      <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-4">
                        <div className="p-3 bg-muted rounded-[12px]">
                          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <Clock className="w-3 h-3" />
                            Duration
                          </div>
                          <div className="font-bold">{selectedPath.duration}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-[12px]">
                          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <Target className="w-3 h-3" />
                            Questions
                          </div>
                          <div className="font-bold">{selectedPath.totalQuestions}</div>
                        </div>
                        <div className="p-3 bg-muted rounded-[12px]">
                          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                            <Trophy className="w-3 h-3" />
                            Level
                          </div>
                          <div className="font-bold">{selectedPath.difficulty}</div>
                        </div>
                      </div>
                      
                      {selectedPath.jobs && selectedPath.jobs.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-bold mb-2">What you'll learn:</div>
                          <div className="space-y-2">
                            {selectedPath.jobs.map((objective: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{objective}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {selectedPath.skills && selectedPath.skills.length > 0 && (
                        <div className="mt-4">
                          <div className="text-sm font-bold mb-2">Skills covered:</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedPath.skills.map((skill: string, idx: number) => (
                              <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex border-b border-border px-4 md:px-8 flex-shrink-0">
                  <Button
                    variant={modalTab === 'channels' ? 'primary' : 'ghost'}
                    size="md"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    onClick={() => setModalTab('channels')}
                  >
                    Channels ({currentChannels.length})
                  </Button>
                  <Button
                    variant={modalTab === 'certifications' ? 'primary' : 'ghost'}
                    size="md"
                    className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                    onClick={() => setModalTab('certifications')}
                  >
                    Certifications ({currentCertifications.length})
                  </Button>
                </div>

                {!isReadonly && (
                  <div className="p-3 md:p-4 border-b border-border flex-shrink-0">
                    <div className="relative">
                      <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                      <label htmlFor="learning-paths-search" className="sr-only">Search {modalTab}</label>
                      <Input
                        id="learning-paths-search"
                        type="text"
                        placeholder={`Search ${modalTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 md:pl-12"
                      />
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto momentum-scroll p-3 md:p-8 overscroll-contain pb-safe">
                  {modalTab === 'channels' ? (
                    <div className="space-y-2 md:space-y-3 pb-4">
                      {(isReadonly ? 
                        Object.values(allChannelsConfig).filter(c => currentChannels.includes(c.id)) :
                        filteredChannels
                      ).map((channel) => {
                        const isSelected = currentChannels.includes(channel.id);
                        return (
                          <Button
                            key={channel.id}
                            variant={isSelected ? 'primary' : 'outline'}
                            size="md"
                            disabled={isReadonly}
                            onClick={() => {
                              if (isReadonly) return;
                              if (modalMode === 'create') {
                                setCustomForm(prev => ({
                                  ...prev,
                                  channels: isSelected
                                    ? prev.channels.filter(id => id !== channel.id)
                                    : [...prev.channels, channel.id]
                                }));
                              } else {
                                toggleEditChannel(channel.id);
                              }
                            }}
                            className="w-full justify-start p-3 md:p-4 h-auto"
                          >
                            <span className="text-sm md:text-base">{channel.name}</span>
                            {isSelected && <Check className="w-4 h-4 md:w-5 md:h-5 ml-auto flex-shrink-0" />}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-2 md:space-y-3 pb-4">
                      {(isReadonly ?
                        certifications.filter(c => currentCertifications.includes(c.id)) :
                        filteredCerts
                      ).map((cert) => {
                        const isSelected = currentCertifications.includes(cert.id);
                        return (
                          <Button
                            key={cert.id}
                            variant={isSelected ? 'primary' : 'outline'}
                            size="md"
                            disabled={isReadonly}
                            onClick={() => {
                              if (isReadonly) return;
                              if (modalMode === 'create') {
                                setCustomForm(prev => ({
                                  ...prev,
                                  certifications: isSelected
                                    ? prev.certifications.filter(id => id !== cert.id)
                                    : [...prev.certifications, cert.id]
                                }));
                              } else {
                                toggleEditCertification(cert.id);
                              }
                            }}
                            className="w-full justify-start p-3 md:p-4 h-auto"
                          >
                            <div className="min-w-0 flex-1 text-left">
                              <div className="text-[10px] md:text-xs text-muted-foreground mb-0.5 md:mb-1">{cert.provider}</div>
                              <div className="text-xs md:text-sm truncate">{cert.name}</div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 md:w-5 md:h-5 ml-auto flex-shrink-0" />}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-4 md:p-8 border-t border-border bg-card flex-shrink-0 pb-safe-offset-4">
                  {isReadonly ? (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      onClick={() => {
                        activateCustomPath(selectedPath.id);
                        closePathModal();
                      }}
                    >
                      Activate This Path
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={
                        (modalMode === 'create' && (!customForm.name || (customForm.channels.length === 0 && customForm.certifications.length === 0))) ||
                        (modalMode === 'edit' && (!editForm.name || (editForm.channels.length === 0 && editForm.certifications.length === 0)))
                      }
                      onClick={modalMode === 'create' ? saveCustomPath : saveEditedPath}
                    >
                      {modalMode === 'create' ? 'Create Path' : 'Save Changes'}
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <FloatingButton
          icon={<Plus className="w-6 h-6" />}
          label="Create"
          onClick={() => openPathModal(null, 'create')}
          position="bottom-right"
          hideOnScroll={true}
        />
      </AppLayout>
    </>
  );
}
