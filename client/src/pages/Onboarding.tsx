/**
 * Onboarding Page - First-time user experience
 * Guide users through setting up their learning journey
 */

import { useState } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '@/lib/ui';
import { SEOHead } from '@/lib/ui';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { PreferencesStorage, OnboardingStorage } from '../services/storage.service';
import { getRecommendedChannelsFromManifest } from '../lib/channels-manifest';
import { t } from '../lib/i18n';
import {
  ArrowRight, ArrowLeft, Check, Code, Server, Layout, Database,
  Cloud, Brain, Target, Rocket, BookOpen, Zap, ChevronRight, Trophy, Sparkles, Star
} from 'lucide-react';
import { Button } from '@/lib/ui';

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
    name: t('role.frontend'),
    description: t('role.frontend.desc'),
    icon: Layout,
    channels: ['frontend', 'react', 'javascript', 'css', 'html']
  },
  {
    id: 'backend',
    name: t('role.backend'),
    description: t('role.backend.desc'),
    icon: Server,
    channels: ['backend', 'nodejs', 'python', 'database', 'api']
  },
  {
    id: 'fullstack',
    name: t('role.fullstack'),
    description: t('role.fullstack.desc'),
    icon: Code,
    channels: ['frontend', 'backend', 'database', 'api']
  },
  {
    id: 'devops',
    name: t('role.devops'),
    description: t('role.devops.desc'),
    icon: Cloud,
    channels: ['devops', 'docker', 'kubernetes', 'aws', 'ci-cd']
  },
  {
    id: 'data',
    name: t('role.data'),
    description: t('role.data.desc'),
    icon: Database,
    channels: ['database', 'sql', 'python', 'data-engineering']
  },
  {
    id: 'ml',
    name: t('role.ml'),
    description: t('role.ml.desc'),
    icon: Brain,
    channels: ['python', 'ml', 'ai', 'data-science']
  }
];

const steps = [
  { id: 1, title: t('onboarding.step1.title'), description: t('onboarding.step1.description') },
  { id: 2, title: t('onboarding.step2.title'), description: t('onboarding.step2.description') },
  { id: 3, title: t('onboarding.step3.title'), description: t('onboarding.step3.description') },
  { id: 4, title: t('onboarding.step4.title'), description: t('onboarding.step4.description') }
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
    ? getRecommendedChannelsFromManifest(selectedRole)
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
      setValidationError(t('onboarding.validation.selectRole'));
      return;
    }
    if (currentStep === 3 && selectedChannels.length === 0) {
      setValidationError(t('onboarding.validation.selectChannels'));
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
                    <h1 className="text-3xl font-bold text-[var(--gh-fg)] mb-4">{t('onboarding.welcome.title')}</h1>
                    <p className="text-[var(--gh-fg-muted)] text-lg mb-10 max-w-lg">
                      {t('onboarding.welcome.subtitle')}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl">
                      <div className="flex flex-col items-center p-4">
                        <div className="w-10 h-10 rounded-md bg-[var(--gh-success-subtle)] flex items-center justify-center mb-3 text-[var(--gh-success-fg)]">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{t('onboarding.welcome.learn')}</h3>
                        <p className="text-xs text-[var(--gh-fg-muted)]">{t('onboarding.welcome.learn.desc')}</p>
                      </div>
                      <div className="flex flex-col items-center p-4">
                        <div className="w-10 h-10 rounded-md bg-[var(--gh-attention-subtle)] flex items-center justify-center mb-3 text-[var(--gh-attention-fg)]">
                          <Target className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{t('onboarding.welcome.practice')}</h3>
                        <p className="text-xs text-[var(--gh-fg-muted)]">{t('onboarding.welcome.practice.desc')}</p>
                      </div>
                      <div className="flex flex-col items-center p-4">
                        <div className="w-10 h-10 rounded-md bg-[var(--gh-done-subtle)] flex items-center justify-center mb-3 text-[var(--gh-done-fg)]">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <h3 className="font-semibold text-sm mb-1">{t('onboarding.welcome.achieve')}</h3>
                        <p className="text-xs text-[var(--gh-fg-muted)]">{t('onboarding.welcome.achieve.desc')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-[var(--gh-fg)] mb-2">{t('onboarding.chooseRole.title')}</h2>
                      <p className="text-[var(--gh-fg-muted)]">{t('onboarding.chooseRole.subtitle')}</p>
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
                                {t('onboarding.chooseRole.selected')}
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
                      <h2 className="text-2xl font-bold text-[var(--gh-fg)] mb-2">{t('onboarding.selectChannels.title')}</h2>
                      <p className="text-[var(--gh-fg-muted)]">{t('onboarding.selectChannels.subtitle')}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-6 p-3 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded-md text-sm text-[var(--gh-fg-muted)]">
                      <Zap className="w-4 h-4 text-[var(--gh-attention-fg)]" />
                      {t('onboarding.selectChannels.recommended', { role: roles.find(r => r.id === selectedRole)?.name || '' })}
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
                    <h2 className="text-3xl font-bold text-[var(--gh-fg)] mb-4">{t('onboarding.complete.title')}</h2>
                    <p className="text-[var(--gh-fg-muted)] text-lg mb-10 max-w-md">
                      {t('onboarding.complete.subtitle')}
                    </p>

                    <div className="flex gap-12 mb-12">
                      <div>
                        <div className="text-3xl font-bold text-[var(--gh-fg)]">{selectedChannels.length}</div>
                        <div className="text-sm text-[var(--gh-fg-muted)]">{t('onboarding.complete.topics')}</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-[var(--gh-fg)]">20+</div>
                        <div className="text-sm text-[var(--gh-fg-muted)]">{t('onboarding.complete.channels')}</div>
                      </div>
                      <div>
                        <div className="text-3xl font-bold text-[var(--gh-accent-fg)]">
                          <Star className="w-8 h-8 inline-block fill-current" />
                        </div>
                        <div className="text-sm text-[var(--gh-fg-muted)]">{t('onboarding.complete.ready')}</div>
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
                        {t('onboarding.button.skip')}
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
                        <ArrowLeft className="w-4 h-4 mr-2" /> {t('onboarding.button.back')}
                      </Button>
                    )}
                  </div>

                  {currentStep < 4 ? (
                    <Button 
                      variant="primary"
                      onClick={handleContinue}
                      disabled={currentStep === 2 && !selectedRole || currentStep === 3 && selectedChannels.length === 0}
                    >
                      {t('onboarding.button.continue')} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      variant="success"
                      onClick={handleComplete}
                    >
                      {t('onboarding.button.startJourney')} <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <p className="text-center mt-8 text-sm text-[var(--gh-fg-subtle)]">
              {t('onboarding.footer.community')}
            </p>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
