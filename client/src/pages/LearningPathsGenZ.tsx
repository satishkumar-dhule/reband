import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { allChannelsConfig } from '../lib/channels-config';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import {
  Code, Server, Rocket, Target, Sparkles, Brain,
  Plus, ChevronRight, Check, X, Search, Home, Clock, Trophy
} from 'lucide-react';
import { Button } from "../components/ui/button";
import { toast } from '@/hooks/use-toast';

// Certification type
interface Certification {
  id: string;
  name: string;
  provider: string;
  icon: string;
  category: string;
}

// Custom path type
interface CustomPath {
  name: string;
  channels: string[];
  certifications: string[];
}

// Curated Learning Paths
const curatedPaths = [
  {
    id: 'frontend',
    name: 'Frontend Developer',
    icon: Code,
    description: 'Master React, JavaScript, and modern web development',
    channels: ['frontend', 'react-native', 'javascript', 'algorithms'],
    difficulty: 'Beginner',
    duration: '3-6 months',
    totalQuestions: 450,
    skills: ['React', 'JavaScript', 'CSS', 'HTML', 'TypeScript'],
  },
  {
    id: 'backend',
    name: 'Backend Engineer',
    icon: Server,
    description: 'Build scalable APIs and microservices',
    channels: ['backend', 'database', 'system-design', 'algorithms'],
    difficulty: 'Intermediate',
    duration: '4-8 months',
    totalQuestions: 520,
    skills: ['Node.js', 'Python', 'SQL', 'REST APIs', 'Microservices'],
  },
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    icon: Rocket,
    description: 'End-to-end application development',
    channels: ['frontend', 'backend', 'database', 'devops', 'system-design'],
    difficulty: 'Advanced',
    duration: '6-12 months',
    totalQuestions: 680,
    skills: ['React', 'Node.js', 'SQL', 'AWS', 'System Design'],
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    icon: Target,
    description: 'Infrastructure, CI/CD, and cloud platforms',
    channels: ['devops', 'kubernetes', 'aws', 'terraform', 'docker'],
    difficulty: 'Advanced',
    duration: '4-8 months',
    totalQuestions: 420,
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD'],
  },
  {
    id: 'mobile',
    name: 'Mobile Developer',
    icon: Sparkles,
    description: 'iOS and Android app development',
    channels: ['react-native', 'ios', 'android', 'frontend'],
    difficulty: 'Intermediate',
    duration: '4-6 months',
    totalQuestions: 380,
    skills: ['React Native', 'Swift', 'Kotlin', 'Mobile UI', 'App Store'],
  },
  {
    id: 'data',
    name: 'Data Engineer',
    icon: Brain,
    description: 'Data pipelines, warehousing, and analytics',
    channels: ['data-engineering', 'database', 'python', 'aws'],
    difficulty: 'Advanced',
    duration: '6-10 months',
    totalQuestions: 490,
    skills: ['Python', 'SQL', 'Spark', 'Airflow', 'Data Modeling'],
  }
];

export default function LearningPathsGenZ() {
  const [, setLocation] = useLocation();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);
  const [certsError, setCertsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'Beginner' | 'Intermediate' | 'Advanced'>('all');
  
  // Custom path builder state
  const [customPath, setCustomPath] = useState<CustomPath>({
    name: '',
    channels: [],
    certifications: []
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Load certifications
  useEffect(() => {
    async function loadCerts() {
      setCertsLoading(true);
      setCertsError(null);
      try {
        const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/';
        const response = await fetch(`${basePath}data/certifications.json`);
        if (response.ok) {
          const data = await response.json();
          setCertifications(data);
        } else {
          setCertsError('Failed to load certifications');
        }
      } catch (e) {
        setCertsError('Failed to load certifications');
        console.error('Failed to load certifications:', e);
      } finally {
        setCertsLoading(false);
      }
    }
    loadCerts();
  }, []);

  const handleSelectPath = (pathId: string) => {
    setSelectedPath(pathId);
    const path = curatedPaths.find(p => p.id === pathId);
    if (path) {
      try {
        const currentPaths = JSON.parse(localStorage.getItem('activeLearningPaths') || '[]');
        if (!currentPaths.includes(pathId)) {
          currentPaths.push(pathId);
        }
        localStorage.setItem('activeLearningPaths', JSON.stringify(currentPaths));
      } catch (e) {
        console.error('Failed to save path:', e);
      }
    }
    setLocation('/');
  };

  const resetCustomPath = () => {
    setCustomPath({ name: '', channels: [], certifications: [] });
    setSearchQuery('');
    setShowCustom(false);
  };

  const handleCreateCustomPath = () => {
    if (!customPath.name || (customPath.channels.length === 0 && customPath.certifications.length === 0)) {
      toast({
        title: 'Missing Information',
        description: 'Please add a name and select at least one channel or certification',
        variant: 'destructive'
      });
      return;
    }

    try {
      const pathId = `custom-${Date.now()}`;
      const newPath = {
        id: pathId,
        name: customPath.name,
        channels: customPath.channels,
        certifications: customPath.certifications,
        createdAt: new Date().toISOString()
      };

      const existingPaths = JSON.parse(localStorage.getItem('customPaths') || '[]');
      const updatedPaths = [...existingPaths, newPath];
      localStorage.setItem('customPaths', JSON.stringify(updatedPaths));

      const currentPaths = JSON.parse(localStorage.getItem('activeLearningPaths') || '[]');
      if (!currentPaths.includes(pathId)) {
        currentPaths.push(pathId);
      }
      localStorage.setItem('activeLearningPaths', JSON.stringify(currentPaths));
      
      localStorage.setItem('customLearningPath', JSON.stringify({
        name: newPath.name,
        channels: newPath.channels,
        certifications: newPath.certifications
      }));

      toast({
        title: 'Path Created',
        description: `"${customPath.name}" has been created successfully`,
      });

      resetCustomPath();
      setLocation('/');
    } catch (e) {
      console.error('Failed to save custom path:', e);
      toast({
        title: 'Error',
        description: 'Failed to save custom path. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const toggleChannel = (channelId: string) => {
    setCustomPath(prev => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter(c => c !== channelId)
        : [...prev.channels, channelId]
    }));
  };

  const toggleCertification = (certId: string) => {
    setCustomPath(prev => ({
      ...prev,
      certifications: prev.certifications.includes(certId)
        ? prev.certifications.filter(c => c !== certId)
        : [...prev.certifications, certId]
    }));
  };

  const filteredPaths = curatedPaths.filter(path => 
    activeTab === 'all' || path.difficulty === activeTab
  );

  const filteredChannels = allChannelsConfig.filter(ch =>
    ch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCerts = certifications.filter(cert =>
    cert.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEOHead
        title="Learning Paths - DevPrep"
        description="Curated learning paths for different tech careers"
        canonical="https://open-interview.github.io/learning-paths"
      />

      <AppLayout>
        <div className="bg-[var(--gh-canvas-subtle)] min-h-screen">
          <div className="max-w-5xl mx-auto px-4 py-8 lg:px-8">
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
                  <BreadcrumbPage>Learning Paths</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-[var(--gh-fg)]">Learning Paths</h1>
                <p className="text-[var(--gh-fg-muted)]">Curated journeys designed to help you master specific domains.</p>
              </div>
              <Button 
                onClick={() => setShowCustom(true)}
                className="bg-[var(--gh-accent-emphasis)] text-white hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Path
              </Button>
            </div>

            <div className="flex border-b border-[var(--gh-border)] mb-6 overflow-x-auto gap-2">
              {['all', 'Beginner', 'Intermediate', 'Advanced'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-[var(--gh-accent-fg)] text-[var(--gh-fg)]'
                      : 'border-transparent text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:border-[var(--gh-border)]'
                  }`}
                >
                  {tab === 'all' ? 'All Paths' : tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPaths.map((path) => {
                const Icon = path.icon;
                const difficultyColor = 
                  path.difficulty === 'Beginner' ? 'bg-[var(--gh-diff-beginner-bg)] text-[var(--gh-diff-beginner)] border-[var(--gh-diff-beginner)]' :
                  path.difficulty === 'Intermediate' ? 'bg-[var(--gh-diff-intermediate-bg)] text-[var(--gh-diff-intermediate)] border-[var(--gh-diff-intermediate)]' :
                  'bg-[var(--gh-diff-advanced-bg)] text-[var(--gh-diff-advanced)] border-[var(--gh-diff-advanced)]';

                return (
                  <div 
                    key={path.id}
                    className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md p-5 flex flex-col hover:border-[var(--gh-accent-fg)] hover:scale-[1.02] transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-md bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-accent-fg)] group-hover:bg-[var(--gh-accent-subtle)] transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[var(--gh-fg)] group-hover:text-[var(--gh-accent-fg)] transition-colors">
                            {path.name}
                          </h3>
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${difficultyColor}`}>
                            {path.difficulty}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-[var(--gh-fg-muted)] mb-4 flex-1">
                      {path.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {path.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-fg-muted)] text-[10px] px-2 py-0.5 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {path.skills.length > 3 && (
                        <span className="text-[var(--gh-fg-subtle)] text-[10px] self-center">
                          +{path.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[var(--gh-border-muted)]">
                      <div className="flex items-center gap-4 text-xs text-[var(--gh-fg-subtle)]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {path.duration}
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3.5 h-3.5" />
                          {path.totalQuestions} questions
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => handleSelectPath(path.id)}
                        className="h-8 text-xs border-[var(--gh-border)] hover:bg-[var(--gh-canvas-inset)]"
                      >
                        Start Path
                        <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Path Modal (Simplified implementation for GitHub style) */}
            {showCustom && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm pb-safe">
                <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md shadow-xl max-w-2xl w-full max-h-[90dvh] max-h-[90svh] flex flex-col pb-safe">
                  <div className="p-4 border-b border-[var(--gh-border)] flex items-center justify-between">
                    <h2 className="font-semibold">Create Custom Path</h2>
                    <button onClick={resetCustomPath} className="text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)]">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto momentum-scroll space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-[var(--gh-fg)] mb-2">Path Name</label>
                      <input 
                        type="text"
                        placeholder="e.g., My Interview Prep"
                        value={customPath.name}
                        onChange={(e) => setCustomPath(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-fg)] focus:ring-2 focus:ring-[var(--gh-accent-fg)] outline-none"
                      />
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--gh-fg-muted)]" />
                      <input 
                        type="text"
                        placeholder="Search topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 rounded-md border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-fg)] focus:ring-2 focus:ring-[var(--gh-accent-fg)] outline-none"
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3">Select Channels ({customPath.channels.length})</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {filteredChannels.slice(0, 10).map(ch => (
                          <button
                            key={ch.id}
                            onClick={() => toggleChannel(ch.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-md text-sm border transition-colors ${
                              customPath.channels.includes(ch.id)
                                ? 'bg-[var(--gh-accent-subtle)] border-[var(--gh-accent-fg)] text-[var(--gh-accent-fg)]'
                                : 'bg-[var(--gh-canvas-subtle)] border-[var(--gh-border)] text-[var(--gh-fg-muted)] hover:border-[var(--gh-fg-subtle)]'
                            }`}
                          >
                            {ch.name}
                            {customPath.channels.includes(ch.id) && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-3">Select Certifications ({customPath.certifications.length})</h3>
                      {certsLoading ? (
                        <div className="flex items-center justify-center py-8 text-[var(--gh-fg-muted)]">
                          <div className="animate-spin w-5 h-5 border-2 border-[var(--gh-border)] border-t-[var(--gh-accent-fg)] rounded-full mr-2" />
                          Loading certifications...
                        </div>
                      ) : certsError ? (
                        <div className="text-[var(--gh-danger-fg)] text-sm py-4">
                          {certsError}
                        </div>
                      ) : certifications.length === 0 ? (
                        <div className="text-[var(--gh-fg-muted)] text-sm py-4">
                          No certifications available
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {filteredCerts.slice(0, 10).map(cert => (
                            <button
                              key={cert.id}
                              onClick={() => toggleCertification(cert.id)}
                              className={`flex items-center justify-between px-3 py-2 rounded-md text-sm border transition-colors ${
                                customPath.certifications.includes(cert.id)
                                  ? 'bg-[var(--gh-accent-subtle)] border-[var(--gh-accent-fg)] text-[var(--gh-accent-fg)]'
                                  : 'bg-[var(--gh-canvas-subtle)] border-[var(--gh-border)] text-[var(--gh-fg-muted)] hover:border-[var(--gh-fg-subtle)]'
                              }`}
                            >
                              {cert.name}
                              {customPath.certifications.includes(cert.id) && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-[var(--gh-border)] flex justify-end gap-3">
                    <Button variant="outline" onClick={resetCustomPath}>Cancel</Button>
                    <Button 
                      className="bg-[var(--gh-accent-emphasis)] text-white hover:opacity-90"
                      disabled={!customPath.name || customPath.channels.length === 0}
                      onClick={handleCreateCustomPath}
                    >
                      Create Path
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
