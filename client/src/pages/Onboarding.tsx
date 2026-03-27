/**
 * Onboarding Page - First-time user experience
 * Guide users through setting up their learning journey
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { allChannelsConfig, getRecommendedChannels } from '../lib/channels-config';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '../components/ui/breadcrumb';
import {
  Sparkles, ArrowRight, ArrowLeft, Check, Code, Server, Layout, Database,
  Cloud, Brain, Target, Rocket, BookOpen, Zap, ChevronRight, Star, Trophy
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  icon: any;
  channels: string[];
}

const roles: Role[] = [
  {
    id: 'frontend',
    name: 'Frontend Developer',
    description: 'React, JavaScript, CSS, and modern web development',
    icon: Layout,
    channels: ['frontend', 'react', 'javascript', 'css', 'html']
  },
  {
    id: 'backend',
    name: 'Backend Engineer',
    description: 'Node.js, Python, databases, and APIs',
    icon: Server,
    channels: ['backend', 'nodejs', 'python', 'database', 'api']
  },
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    description: 'End-to-end development with React and Node.js',
    icon: Code,
    channels: ['frontend', 'backend', 'database', 'api']
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    description: 'Cloud infrastructure, containers, and CI/CD',
    icon: Cloud,
    channels: ['devops', 'docker', 'kubernetes', 'aws', 'ci-cd']
  },
  {
    id: 'data',
    name: 'Data Engineer',
    description: 'Data pipelines, SQL, and analytics',
    icon: Database,
    channels: ['database', 'sql', 'python', 'data-engineering']
  },
  {
    id: 'ml',
    name: 'ML Engineer',
    description: 'Machine learning, AI, and data science',
    icon: Brain,
    channels: ['python', 'ml', 'ai', 'data-science']
  }
];

const steps = [
  { id: 1, title: 'Welcome', description: 'Get started with DevPrep' },
  { id: 2, title: 'Choose Your Path', description: 'Select your career focus' },
  { id: 3, title: 'Set Goals', description: 'Define your learning objectives' },
  { id: 4, title: 'Ready to Go', description: 'Start your journey' }
];

const getRoleGradient = (roleId: string): string => {
  const gradients: Record<string, string> = {
    frontend: 'linear-gradient(135deg, hsl(210 100% 50%) 0%, hsl(190 100% 50%) 100%)',
    backend: 'linear-gradient(135deg, hsl(142 76% 36%) 0%, hsl(160 76% 46%) 100%)',
    fullstack: 'linear-gradient(135deg, hsl(270 100% 65%) 0%, hsl(330 100% 65%) 100%)',
    devops: 'linear-gradient(135deg, hsl(25 92% 50%) 0%, hsl(0 84% 60%) 100%)',
    data: 'linear-gradient(135deg, hsl(240 100% 65%) 0%, hsl(270 100% 65%) 100%)',
    ml: 'linear-gradient(135deg, hsl(350 85% 65%) 0%, hsl(330 100% 65%) 100%)'
  };
  return gradients[roleId] || 'var(--gradient-primary)';
};

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { setRole, skipOnboarding } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);

  const recommendedChannels = selectedRole 
    ? getRecommendedChannels(selectedRole)
    : [];

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId)
        ? prev.filter(c => c !== channelId)
        : [...prev, channelId]
    );
  };

  const handleComplete = () => {
    if (selectedRole) {
      setRole(selectedRole);
    }
    skipOnboarding();
    setLocation('/');
  };

  const canProceed = () => {
    if (currentStep === 1) return true;
    if (currentStep === 2) return selectedRole !== null;
    if (currentStep === 3) return selectedChannels.length > 0;
    return true;
  };

  return (
    <>
      <SEOHead
        title="Welcome to DevPrep - Get Started 🚀"
        description="Set up your personalized learning journey"
        canonical="https://open-interview.github.io/onboarding"
      />

      <AppLayout>
        <div className="min-h-screen" style={{ background: 'var(--color-base-dark)', color: 'var(--color-text-primary)' }}>
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                      currentStep > step.id
                        ? 'gradient-text'
                        : currentStep === step.id
                          ? 'border-2'
                          : ''
                    }`}
                    style={{
                      background: currentStep > step.id 
                        ? 'var(--gradient-primary)' 
                        : currentStep === step.id 
                          ? 'rgba(0,0,0,0.2)' 
                          : 'var(--color-base-elevated)',
                      color: currentStep > step.id || currentStep === step.id
                        ? 'white' 
                        : 'var(--color-text-tertiary)',
                      borderColor: currentStep === step.id 
                        ? 'var(--color-accent-cyan)' 
                        : 'transparent'
                    }}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 md:w-24 h-0.5 mx-2 transition-all`}
                        style={{
                          background: currentStep > step.id 
                            ? 'var(--gradient-primary)' 
                            : 'var(--color-border-subtle)'
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h2 className="font-bold" style={{ fontSize: 'var(--text-xl)' }}>{steps[currentStep - 1].title}</h2>
                <p style={{ color: 'var(--color-text-tertiary)' }}>{steps[currentStep - 1].description}</p>
              </div>
            </div>

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full flex items-center justify-center animate-pulse-glow" style={{ background: 'var(--gradient-primary)' }}>
                      <Rocket className="w-12 h-12" style={{ color: 'white' }} aria-hidden="true" />
                    </div>
                    <h1 className="font-black" style={{ fontSize: 'clamp(2.5rem, 5vw, 3.75rem)' }}>
                      Welcome to <span className="gradient-text">DevPrep</span>
                    </h1>
                    <p className="max-w-2xl mx-auto" style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-tertiary)' }}>
                      Your personal AI-powered interview preparation assistant. Let's set up your learning journey in just a few steps.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'hsla(190, 100%, 50%, 0.15)' }}>
                        <BookOpen className="w-6 h-6" style={{ color: 'var(--color-accent-cyan)' }} />
                      </div>
                      <h3 className="font-bold mb-2" style={{ fontSize: 'var(--text-lg)' }}>Learn</h3>
                      <p style={{ color: 'var(--color-text-tertiary)' }}>Access thousands of questions across multiple topics</p>
                    </div>
                    <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'hsla(190, 100%, 50%, 0.15)' }}>
                        <Target className="w-6 h-6" style={{ color: 'var(--color-accent-cyan)' }} />
                      </div>
                      <h3 className="font-bold mb-2" style={{ fontSize: 'var(--text-lg)' }}>Practice</h3>
                      <p style={{ color: 'var(--color-text-tertiary)' }}>Voice interviews, coding challenges, and more</p>
                    </div>
                    <div className="glass-card" style={{ borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)' }}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'hsla(142, 76%, 46%, 0.15)' }}>
                        <Trophy className="w-6 h-6" style={{ color: 'var(--color-success-light)' }} />
                      </div>
                      <h3 className="font-bold mb-2" style={{ fontSize: 'var(--text-lg)' }}>Achieve</h3>
                      <p style={{ color: 'var(--color-text-tertiary)' }}>Track progress and earn badges</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                      onClick={() => setLocation('/')}
                      className="transition-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cyan)]"
                      style={{ 
                        padding: '0.75rem 1.5rem', 
                        color: 'var(--color-text-tertiary)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      Skip for now
                    </button>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="btn-primary glow-hover-cyan flex items-center gap-2"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      Get Started <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="font-black mb-2" style={{ fontSize: 'var(--text-3xl)' }}>Choose Your Career Path</h2>
                    <p style={{ color: 'var(--color-text-tertiary)' }}>Select the role you're preparing for</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.id;
                      
                      return (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-6 text-left transition-all card-premium ${isSelected ? 'glow-cyan' : ''}`}
                          style={{
                            borderRadius: 'var(--radius-xl)',
                            border: `2px solid ${isSelected ? 'var(--color-accent-cyan)' : 'var(--color-border-subtle)'}`,
                            background: isSelected ? 'hsla(190, 100%, 50%, 0.08)' : 'var(--color-base-card)'
                          }}
                        >
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4`} style={{ background: getRoleGradient(role.id) }}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-bold mb-1" style={{ fontSize: 'var(--text-lg)' }}>{role.name}</h3>
                          <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{role.description}</p>
                          {isSelected && (
                            <div className="mt-4 flex items-center gap-2" style={{ color: 'var(--color-accent-cyan)' }}>
                              <Check className="w-5 h-5" />
                              <span className="font-semibold">Selected</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-8">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="flex items-center gap-2 transition-fast"
                      style={{ 
                        padding: '0.75rem 1.5rem', 
                        color: 'var(--color-text-tertiary)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                    <button
                      onClick={() => {
                        if (selectedRole) {
                          const role = roles.find(r => r.id === selectedRole);
                          if (role) {
                            setSelectedChannels(role.channels);
                          }
                          setCurrentStep(3);
                        }
                      }}
                      disabled={!selectedRole}
                      className="btn-primary glow-hover-cyan flex items-center gap-2"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        opacity: selectedRole ? 1 : 0.5,
                        cursor: selectedRole ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Continue <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-8">
                    <h2 className="font-black mb-2" style={{ fontSize: 'var(--text-3xl)' }}>Select Topics to Focus On</h2>
                    <p style={{ color: 'var(--color-text-tertiary)' }}>Choose the areas you want to practice</p>
                  </div>

                  <div className="p-4 rounded-xl mb-6 glass-card" style={{ border: '1px solid hsla(190, 100%, 50%, 0.3)' }}>
                    <div className="flex items-center gap-2" style={{ color: 'var(--color-accent-cyan)' }}>
                      <Zap className="w-5 h-5" />
                      <span className="font-semibold">Recommended for {roles.find(r => r.id === selectedRole)?.name}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {recommendedChannels.slice(0, 9).map((channel) => {
                      const isSelected = selectedChannels.includes(channel.id);
                      
                      return (
                        <button
                          key={channel.id}
                          onClick={() => toggleChannel(channel.id)}
                          className="p-4 rounded-xl text-left transition-all"
                          style={{
                            border: `1px solid ${isSelected ? 'var(--color-accent-cyan)' : 'var(--color-border-subtle)'}`,
                            background: isSelected ? 'hsla(190, 100%, 50%, 0.08)' : 'var(--color-base-card)'
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{channel.name}</span>
                            {isSelected && <Check className="w-5 h-5" style={{ color: 'var(--color-accent-cyan)' }} />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex items-center gap-2 transition-fast"
                      style={{ 
                        padding: '0.75rem 1.5rem', 
                        color: 'var(--color-text-tertiary)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={selectedChannels.length === 0}
                      className="btn-primary glow-hover-cyan flex items-center gap-2"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        opacity: selectedChannels.length > 0 ? 1 : 0.5,
                        cursor: selectedChannels.length > 0 ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Complete Setup <Sparkles className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8 text-center"
                >
                  <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center animate-pulse-glow" style={{ background: 'var(--gradient-primary)' }}>
                    <Trophy className="w-16 h-16" style={{ color: 'white' }} />
                  </div>

                  <div>
                    <h2 className="font-black mb-4" style={{ fontSize: 'var(--text-4xl)' }}>You're All Set!</h2>
                    <p className="max-w-2xl mx-auto" style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text-tertiary)' }}>
                      Your personalized learning path is ready. Start practicing and land your dream job!
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8">
                    <div className="text-center">
                      <div className="font-black gradient-text" style={{ fontSize: 'var(--text-3xl)' }}>{selectedChannels.length}</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Topics</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black" style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-accent-cyan)' }}>{roles.find(r => r.id === selectedRole)?.name.split(' ')[0]}</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Focus</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black" style={{ fontSize: 'var(--text-3xl)', color: 'var(--color-success-light)' }}>20+</div>
                      <div className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Channels</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                      onClick={() => setLocation('/')}
                      className="btn-primary glow-hover-cyan flex items-center gap-2"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      Start Learning <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
