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
  color: string;
  channels: string[];
}

const roles: Role[] = [
  {
    id: 'frontend',
    name: 'Frontend Developer',
    description: 'React, JavaScript, CSS, and modern web development',
    icon: Layout,
    color: 'from-blue-500 to-cyan-500',
    channels: ['frontend', 'react', 'javascript', 'css', 'html']
  },
  {
    id: 'backend',
    name: 'Backend Engineer',
    description: 'Node.js, Python, databases, and APIs',
    icon: Server,
    color: 'from-green-500 to-emerald-500',
    channels: ['backend', 'nodejs', 'python', 'database', 'api']
  },
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    description: 'End-to-end development with React and Node.js',
    icon: Code,
    color: 'from-purple-500 to-pink-500',
    channels: ['frontend', 'backend', 'database', 'api']
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    description: 'Cloud infrastructure, containers, and CI/CD',
    icon: Cloud,
    color: 'from-orange-500 to-red-500',
    channels: ['devops', 'docker', 'kubernetes', 'aws', 'ci-cd']
  },
  {
    id: 'data',
    name: 'Data Engineer',
    description: 'Data pipelines, SQL, and analytics',
    icon: Database,
    color: 'from-indigo-500 to-purple-500',
    channels: ['database', 'sql', 'python', 'data-engineering']
  },
  {
    id: 'ml',
    name: 'ML Engineer',
    description: 'Machine learning, AI, and data science',
    icon: Brain,
    color: 'from-rose-500 to-pink-500',
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
        <div className="min-h-screen bg-background text-foreground">
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Progress Steps */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                      currentStep > step.id
                        ? 'bg-primary text-primary-foreground'
                        : currentStep === step.id
                          ? 'bg-primary/20 text-primary border-2 border-primary'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 md:w-24 h-0.5 mx-2 transition-all ${
                        currentStep > step.id ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{steps[currentStep - 1].title}</h2>
                <p className="text-muted-foreground">{steps[currentStep - 1].description}</p>
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
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-cyan-500 rounded-full flex items-center justify-center">
                      <Rocket className="w-12 h-12 text-black" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black">
                      Welcome to <span className="bg-gradient-to-r from-primary to-cyan-500 bg-clip-text text-transparent">DevPrep</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Your personal AI-powered interview preparation assistant. Let's set up your learning journey in just a few steps.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="p-6 bg-muted/50 rounded-2xl border border-border">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Learn</h3>
                      <p className="text-muted-foreground">Access thousands of questions across multiple topics</p>
                    </div>
                    <div className="p-6 bg-muted/50 rounded-2xl border border-border">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
                        <Target className="w-6 h-6 text-cyan-500" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Practice</h3>
                      <p className="text-muted-foreground">Voice interviews, coding challenges, and more</p>
                    </div>
                    <div className="p-6 bg-muted/50 rounded-2xl border border-border">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                        <Trophy className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h3 className="font-bold text-lg mb-2">Achieve</h3>
                      <p className="text-muted-foreground">Track progress and earn badges</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                      onClick={() => setLocation('/')}
                      className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Skip for now
                    </button>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-8 py-3 bg-gradient-to-r from-primary to-cyan-500 rounded-xl font-bold text-black hover:scale-105 transition-transform flex items-center gap-2"
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
                    <h2 className="text-3xl font-black mb-2">Choose Your Career Path</h2>
                    <p className="text-muted-foreground">Select the role you're preparing for</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roles.map((role) => {
                      const Icon = role.icon;
                      const isSelected = selectedRole === role.id;
                      
                      return (
                        <button
                          key={role.id}
                          onClick={() => setSelectedRole(role.id)}
                          className={`p-6 rounded-2xl border-2 text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-xl flex items-center justify-center mb-4`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-bold text-lg mb-1">{role.name}</h3>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                          {isSelected && (
                            <div className="mt-4 flex items-center gap-2 text-primary">
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
                      className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
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
                      className="px-8 py-3 bg-gradient-to-r from-primary to-cyan-500 rounded-xl font-bold text-black hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                    <h2 className="text-3xl font-black mb-2">Select Topics to Focus On</h2>
                    <p className="text-muted-foreground">Choose the areas you want to practice</p>
                  </div>

                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/30 mb-6">
                    <div className="flex items-center gap-2 text-primary">
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
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{channel.name}</span>
                            {isSelected && <Check className="w-5 h-5 text-primary" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-8">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" /> Back
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={selectedChannels.length === 0}
                      className="px-8 py-3 bg-gradient-to-r from-primary to-cyan-500 rounded-xl font-bold text-black hover:scale-105 transition-transform flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                  <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
                    <Trophy className="w-16 h-16 text-black" />
                  </div>

                  <div>
                    <h2 className="text-4xl font-black mb-4">You're All Set!</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Your personalized learning path is ready. Start practicing and land your dream job!
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8">
                    <div className="text-center">
                      <div className="text-3xl font-black text-primary">{selectedChannels.length}</div>
                      <div className="text-sm text-muted-foreground">Topics</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-cyan-500">{roles.find(r => r.id === selectedRole)?.name.split(' ')[0]}</div>
                      <div className="text-sm text-muted-foreground">Focus</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-emerald-500">30+</div>
                      <div className="text-sm text-muted-foreground">AI Agents</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-4 pt-8">
                    <button
                      onClick={() => setLocation('/')}
                      className="px-8 py-3 bg-gradient-to-r from-primary to-cyan-500 rounded-xl font-bold text-black hover:scale-105 transition-transform flex items-center gap-2"
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
