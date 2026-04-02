/**
 * Onboarding Page - First-time user experience
 * Guide users through setting up their learning journey
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { PreferencesStorage, OnboardingStorage } from '../services/storage.service';
import { getRecommendedChannels } from '../lib/channels-config';
import {
  ArrowRight, ArrowLeft, Check, Code, Server, Layout, Database,
  Cloud, Brain, Target, Rocket, BookOpen, Zap, ChevronRight, Trophy, Sparkles, Star
} from 'lucide-react';
import { Button } from '@/components/unified/Button';

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

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { setRole, skipOnboarding } = useUserPreferences();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    OnboardingStorage.getSubscribedChannels() // Restore from localStorage
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  const recommendedChannels = selectedRole 
    ? getRecommendedChannels(selectedRole)
    : [];

  const toggleChannel = (channelId: string) => {
    setSelectedChannels(prev => {
      const updated = prev.includes(channelId)
        ? prev.filter(c => c !== channelId)
        : [...prev, channelId];
      // Persist to OnboardingStorage for survival across browser restarts
      OnboardingStorage.setSubscribedChannels(updated);
      return updated;
    });
    // Clear validation error when user selects a channel
    setValidationError(null);
  };

  const handleContinue = () => {
    // Validate before proceeding
    if (currentStep === 2 && !selectedRole) {
      setValidationError('Please select a career path to continue');
      return;
    }
    if (currentStep === 3 && selectedChannels.length === 0) {
      setValidationError('Please select at least one focus area to continue');
      return;
    }
    setValidationError(null);
    setCurrentStep(prev => prev + 1);
  };

  const handleComplete = () => {
    // Persist to dedicated OnboardingStorage keys for fast early-read
    if (selectedRole) {
      OnboardingStorage.setRole(selectedRole);
      setRole(selectedRole);
    } else {
      skipOnboarding();
    }

    // Persist selected channels to OnboardingStorage
    if (selectedChannels.length > 0) {
      OnboardingStorage.setSubscribedChannels(selectedChannels);
      const current = PreferencesStorage.get();
      const mergedChannels = Array.from(new Set([...current.subscribedChannels, ...selectedChannels]));
      PreferencesStorage.update({
        subscribedChannels: mergedChannels
      });
    }

    // Mark onboarding as complete in dedicated key
    OnboardingStorage.completeOnboarding();

    setLocation('/channels', { replace: true });
  };

  return (
    <>
      <SEOHead
        title="Welcome to DevPrep - Get Started 🚀"
        description="Set up your personalized learning journey"
        canonical="https://open-interview.github.io/onboarding"
      />

      <AppLayout hideNav={true}>
        <div className="min-h-screen bg-[var(--gh-canvas-subtle)] flex flex-col items-center py-12 px-6">
          <div className="max-w-3xl w-full">
            {/* Header / Progress Indicator */}
            <div className="flex items-center justify-center gap-2 mb-12">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                      currentStep >= step.id 
                        ? 'bg-[var(--gh-accent-emphasis)] border-[var(--gh-accent-emphasis)] text-white' 
                        : 'bg-[var(--gh-canvas)] border-[var(--gh-border)] text-[var(--gh-fg-muted)]'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  {index < steps.length - 1 && (
                    <div 
                      className={`w-12 h-0.5 mx-2 ${
                        currentStep > step.id ? 'bg-[var(--gh-accent-emphasis)]' : 'bg-[var(--gh-border)]'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md shadow-sm overflow-hidden min-h-[500px] flex flex-col">
              {/* Step Content */}
              <div className="flex-1 p-8">
                {currentStep === 1 && (
                  <div className="flex flex-col items-center text-center py-8">
                    <div className="w-20 h-20 rounded-xl bg-[var(--gh-canvas-inset)] border border-[var(--gh-border)] flex items-center justify-center mb-6 text-[var(--gh-accent-fg)]">
                      <Rocket className="w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-[var(--gh-fg)] mb-4">Welcome to DevPrep</h1>
                    <p className="text-[var(--gh-fg-muted)] text-lg mb-10 max-w-lg">
                      Your personal AI-powered interview preparation assistant. Let's set up your learning journey in just a few steps.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
                      <div className="flex flex-col items-center p-4">
                        <div className="w-10 h-10 rounded-md bg-[var(--gh-success-subtle)] flex items-center justify-center mb-3 text-[var(--gh-success-fg)]">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">Learn</h3>
                        <p className="text-xs text-[var(--gh-fg-muted)]">Thousands of interview questions</p>
                      </div>
                      <div className="flex flex-col items-center p-4">
                        <div className="w-10 h-10 rounded-md bg-[var(--gh-attention-subtle)] flex items-center justify-center mb-3 text-[var(--gh-attention-fg)]">
                          <Target className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">Practice</h3>
                        <p className="text-xs text-[var(--gh-fg-muted)]">Voice & coding sessions</p>
                      </div>
                      <div className="flex flex-col items-center p-4">
                        <div className="w-10 h-10 rounded-md bg-[var(--gh-done-subtle)] flex items-center justify-center mb-3 text-[var(--gh-done-fg)]">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">Achieve</h3>
                        <p className="text-xs text-[var(--gh-fg-muted)]">Track progress & earn badges</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-[var(--gh-fg)] mb-2">Choose Your Career Path</h2>
                      <p className="text-[var(--gh-fg-muted)]">Select the role you're currently focusing on.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {roles.map((role) => {
                        const Icon = role.icon;
                        const isSelected = selectedRole === role.id;
                        return (
                          <Button
                            key={role.id}
                            variant={isSelected ? 'outline' : 'ghost'}
                            onClick={() => {
                              setSelectedRole(role.id);
                              setValidationError(null);
                            }}
                            className={`flex flex-col items-start p-6 rounded-md border text-left transition-all h-auto ${
                              isSelected 
                                ? 'bg-[var(--gh-canvas-subtle)] border-[var(--gh-accent-fg)] ring-1 ring-[var(--gh-accent-fg)]' 
                                : 'bg-[var(--gh-canvas)] border-[var(--gh-border)] hover:border-[var(--gh-border-strong)] hover:bg-muted/30'
                            }`}
                          >
                            <div className={`p-2 rounded-md mb-4 ${isSelected ? 'bg-[var(--gh-accent-subtle)] text-[var(--gh-accent-fg)]' : 'bg-[var(--gh-canvas-inset)] text-[var(--gh-fg-muted)]'}`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold mb-1">{role.name}</h3>
                            <p className="text-sm text-[var(--gh-fg-muted)]">{role.description}</p>
                            {isSelected && (
                              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[var(--gh-accent-fg)]">
                                <Check className="w-3.5 h-3.5" />
                                SELECTED
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-[var(--gh-fg)] mb-2">Select Focus Areas</h2>
                      <p className="text-[var(--gh-fg-muted)]">Pick the topics you want to prioritize in your prep.</p>
                    </div>

                    <div className="flex items-center gap-2 mb-6 p-3 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-md text-sm text-[var(--gh-fg-muted)]">
                      <Zap className="w-4 h-4 text-[var(--gh-attention-fg)]" />
                      Recommended based on your <strong>{roles.find(r => r.id === selectedRole)?.name}</strong> choice
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {recommendedChannels.slice(0, 12).map((channel) => {
                        const isSelected = selectedChannels.includes(channel.id);
                        return (
                          <Button
                            key={channel.id}
                            variant={isSelected ? 'outline' : 'ghost'}
                            onClick={() => toggleChannel(channel.id)}
                            className={`flex items-center justify-between px-4 py-3 rounded-md border text-sm transition-all h-auto justify-start font-normal ${
                              isSelected 
                                ? 'bg-[var(--gh-accent-subtle)] border-[var(--gh-accent-fg)] text-[var(--gh-accent-fg)] font-semibold' 
                                : 'bg-[var(--gh-canvas)] border-[var(--gh-border)] text-[var(--gh-fg-muted)] hover:border-[var(--gh-border-strong)] hover:bg-muted/30'
                            }`}
                          >
                            <span className="truncate mr-2">{channel.name}</span>
                            {isSelected && <Check className="w-4 h-4 shrink-0" />}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="flex flex-col items-center text-center py-12">
                    <div className="w-24 h-24 rounded-full bg-[var(--gh-success-subtle)] flex items-center justify-center mb-8 text-[var(--gh-success-fg)]">
                      <Sparkles className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-[var(--gh-fg)] mb-4">You're all set!</h2>
                    <p className="text-[var(--gh-fg-muted)] text-lg mb-10 max-w-md">
                      Your personalized roadmap is ready. Let's start building the career you deserve.
                    </p>

                    <div className="flex gap-12 mb-12">
                      <div>
                        <div className="text-3xl font-bold text-[var(--gh-fg)]">{selectedChannels.length}</div>
                        <div className="text-sm text-[var(--gh-fg-muted)]">Topics</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-[var(--gh-fg)]">20+</div>
                        <div className="text-sm text-[var(--gh-fg-muted)]">Channels</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-[var(--gh-accent-fg)]">
                          <Star className="w-8 h-8 inline-block fill-current" />
                        </div>
                        <div className="text-sm text-[var(--gh-fg-muted)]">Ready</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-6 bg-[var(--gh-canvas-subtle)] border-t border-[var(--gh-border)]">
                {validationError && (
                  <div className="mb-4 p-3 bg-[var(--gh-danger-subtle)] border border-[var(--gh-danger-emphasis)]/20 rounded-md">
                    <p className="text-sm text-[var(--gh-danger-fg)]" role="alert">
                      {validationError}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-3">
                    {currentStep === 1 ? (
                      <Button 
                        variant="outline" 
                        onClick={() => setLocation('/')}
                        className="text-[var(--gh-fg-muted)]"
                      >
                        Skip for now
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCurrentStep(prev => prev - 1);
                          setValidationError(null);
                        }}
                        className="text-[var(--gh-fg)]"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                    )}
                  </div>

                  {currentStep < 4 ? (
                    <Button 
                      variant="primary"
                      onClick={handleContinue}
                      disabled={currentStep === 2 && !selectedRole || currentStep === 3 && selectedChannels.length === 0}
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      variant="success"
                      onClick={handleComplete}
                    >
                      Start Your Journey <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center mt-8 text-sm text-[var(--gh-fg-subtle)]">
              Welcome to the community of world-class developers.
            </p>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
