/**
 * i18n translations for DevPrep
 * 
 * Add new translations here. The key is the translation ID, 
 * and value is the English text.
 * 
 * For future language support, add additional locale files and
 * update the i18n configuration in client/src/lib/i18n.ts
 */

export const en = {
  // App
  'app.name': 'DevPrep',
  'app.tagline': 'Free Technical Interview Prep',
  
  // Onboarding - Steps
  'onboarding.step1.title': 'Welcome',
  'onboarding.step1.description': 'Get started with DevPrep',
  'onboarding.step2.title': 'Choose Your Path',
  'onboarding.step2.description': 'Select your career focus',
  'onboarding.step3.title': 'Set Goals',
  'onboarding.step3.description': 'Define your learning objectives',
  'onboarding.step4.title': 'Ready to Go',
  'onboarding.step4.description': 'Start your journey',
  
  // Onboarding - Step 1 Content
  'onboarding.welcome.title': 'Welcome to DevPrep',
  'onboarding.welcome.subtitle': 'Your personal AI-powered interview preparation assistant. Let\'s set up your learning journey in just a few steps.',
  'onboarding.welcome.learn': 'Learn',
  'onboarding.welcome.learn.desc': 'Thousands of interview questions',
  'onboarding.welcome.practice': 'Practice',
  'onboarding.welcome.practice.desc': 'Voice & coding sessions',
  'onboarding.welcome.achieve': 'Achieve',
  'onboarding.welcome.achieve.desc': 'Track progress & earn badges',
  
  // Onboarding - Step 2 Content
  'onboarding.chooseRole.title': 'Choose Your Career Path',
  'onboarding.chooseRole.subtitle': 'Select the role you\'re currently focusing on.',
  'onboarding.chooseRole.selected': 'SELECTED',
  
  // Onboarding - Step 3 Content
  'onboarding.selectChannels.title': 'Select Focus Areas',
  'onboarding.selectChannels.subtitle': 'Pick the topics you want to prioritize in your prep.',
  'onboarding.selectChannels.recommended': 'Recommended based on your {role} choice',
  
  // Onboarding - Step 4 Content
  'onboarding.complete.title': 'You\'re all set!',
  'onboarding.complete.subtitle': 'Your personalized roadmap is ready. Let\'s start building the career you deserve.',
  'onboarding.complete.topics': 'Topics',
  'onboarding.complete.channels': 'Channels',
  'onboarding.complete.ready': 'Ready',
  
  // Onboarding - Buttons
  'onboarding.button.skip': 'Skip for now',
  'onboarding.button.back': 'Back',
  'onboarding.button.continue': 'Continue',
  'onboarding.button.startJourney': 'Start Your Journey',
  
  // Onboarding - Validation
  'onboarding.validation.selectRole': 'Please select a career path to continue',
  'onboarding.validation.selectChannels': 'Please select at least one focus area to continue',
  
  // Onboarding - Footer
  'onboarding.footer.community': 'Welcome to the community of world-class developers.',
  
  // Roles
  'role.frontend': 'Frontend Developer',
  'role.frontend.desc': 'React, JavaScript, CSS, and modern web development',
  'role.backend': 'Backend Engineer',
  'role.backend.desc': 'Node.js, Python, databases, and APIs',
  'role.fullstack': 'Full Stack Developer',
  'role.fullstack.desc': 'End-to-end development with React and Node.js',
  'role.devops': 'DevOps Engineer',
  'role.devops.desc': 'Cloud infrastructure, containers, and CI/CD',
  'role.data': 'Data Engineer',
  'role.data.desc': 'Data pipelines, SQL, and analytics',
  'role.ml': 'ML Engineer',
  'role.ml.desc': 'Machine learning, AI, and data science',
  
  // Home - Dashboard
  'home.dashboard': 'Dashboard',
  'home.quickActions': 'Quick Actions',
  'home.yourTopics': 'Your Topics',
  'home.viewAll': 'View all',
  
  // Home - Quick Actions
  'home.action.voicePractice': 'Voice Practice',
  'home.action.voicePractice.desc': 'AI speech analysis',
  'home.action.codingChallenges': 'Coding Challenges',
  'home.action.codingChallenges.desc': 'Solve problems',
  'home.action.srsReview': 'SRS Review',
  'home.action.srsReview.desc': 'Spaced repetition',
  'home.action.learningPaths': 'Learning Paths',
  'home.action.learningPaths.desc': 'Curated journeys',
  
  // Home - Credits
  'home.credits': 'Credits',
  'home.credits.available': 'Available credits',
  'home.credits.view': 'View credits & redeem coupons →',
  
  // Home - Stats
  'home.stats.yourProgress': 'Your Progress',
  'home.stats.questionsCompleted': 'questions completed',
  'home.stats.topicsUnlocked': 'topics unlocked',
  'home.stats.overallProgress': 'overall progress',
  'home.stats.dayStreak': 'day streak',
  'home.stats.totalCompletion': 'Total completion',
  
  // Home - Recent Activity
  'home.activity.recent': 'Recent Activity',
  'home.activity.study': 'Study Activity',
  'home.activity.streak.active': '{count} day streak — keep going!',
  'home.activity.streak.none': 'Start a streak today!',
  
  // Home - Achievements
  'home.achievements': 'Achievements',
  'home.achievements.viewAll': 'View all',
  'home.achievements.badgeCount': '{count} badge earned — keep going to unlock more!',
  
  // Home - CTA
  'home.cta.ready': 'Ready to practice?',
  'home.cta.subtitle': 'Jump into a topic channel and start answering questions.',
  'home.cta.explore': 'Explore all channels',
  'home.cta.paths': 'View learning paths',
  
  // Home - Error
  'home.error.channels': 'Failed to load channels',
  'home.error.tryAgain': 'Try Again',
  
  // Home - Activity Items
  'home.activity.completedQuiz': 'Completed React Hooks quiz',
  'home.activity.reviewedFlashcards': 'Reviewed 8 JavaScript flashcards',
  'home.activity.voiceInterview': 'Finished voice interview session',
  'home.activity.earnedBadge': 'Earned \'First Steps\' badge',
  'home.activity.solvedChallenge': 'Solved Binary Search challenge',
  'home.activity.time.2h': '2h ago',
  'home.activity.time.4h': '4h ago',
  'home.activity.time.yesterday': 'Yesterday',
  'home.activity.time.2days': '2 days ago',
  'home.activity.time.3days': '3 days ago',
} as const;

export type TranslationKey = keyof typeof en;