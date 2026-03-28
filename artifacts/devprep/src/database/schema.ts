// Database Schema Redesign - SQLite with better-sqlite3
// Coordinates with 30 agents for various operations

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
  preferences: UserPreferences;
  role: 'user' | 'admin' | 'mentor';
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationPreferences;
  learningGoals: LearningGoal[];
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  slack: boolean;
  frequency: 'realtime' | 'daily' | 'weekly';
}

export interface LearningGoal {
  id: string;
  title: string;
  targetDate: number;
  progress: number;
  status: 'active' | 'completed' | 'paused';
}

// Content Types
export interface Content {
  id: string;
  type: 'question' | 'flashcard' | 'exam' | 'voice' | 'coding';
  channelId: string;
  data: ContentData;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  status: 'draft' | 'published' | 'archived';
}

export interface ContentData {
  title?: string;
  question?: string;
  answer?: string;
  options?: string[];
  correctAnswer?: number;
  prompt?: string;
  code?: string;
  solution?: string;
}

// Channels
export interface Channel {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  parentId?: string;
  order: number;
  isPremium: boolean;
  createdAt: number;
}

// Progress Tracking
export interface UserProgress {
  id: string;
  userId: string;
  contentId: string;
  contentType: string;
  status: 'not_started' | 'in_progress' | 'completed';
  score?: number;
  timeSpent: number;
  attempts: number;
  lastAttemptAt: number;
  completedAt?: number;
  notes?: string;
}

// Learning Paths
export interface LearningPath {
  id: string;
  title: string;
  description: string;
  channelId: string;
  steps: LearningStep[];
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: number;
}

export interface LearningStep {
  id: string;
  order: number;
  contentId: string;
  contentType: string;
  title: string;
  isRequired: boolean;
}

// Achievements & Gamification
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: AchievementCriteria;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCriteria {
  type: 'streak' | 'completion' | 'score' | 'social';
  target: number;
  timeframe?: 'daily' | 'weekly' | 'total';
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  earnedAt: number;
  progress?: number;
}

// Community & Social
export interface Discussion {
  id: string;
  userId: string;
  channelId: string;
  contentId?: string;
  title: string;
  body: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  replyCount: number;
  createdAt: number;
  updatedAt: number;
  isPinned: boolean;
  isLocked: boolean;
}

export interface Comment {
  id: string;
  discussionId: string;
  userId: string;
  body: string;
  parentId?: string;
  upvotes: number;
  downvotes: number;
  createdAt: number;
}

// Mentorship
export interface Mentor {
  id: string;
  userId: string;
  expertise: string[];
  bio: string;
  hourlyRate: number;
  availability: Availability[];
  rating: number;
  reviewCount: number;
}

export interface Availability {
  dayOfWeek: number;
  startHour: number;
  endHour: number;
}

export interface Session {
  id: string;
  mentorId: string;
  userId: string;
  scheduledAt: number;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  feedback?: string;
  rating?: number;
}

// Job Tracking
export interface JobApplication {
  id: string;
  userId: string;
  company: string;
  position: string;
  channel: 'linkedin' | 'indeed' | 'company-site' | 'referral' | 'other';
  status: 'wishlist' | 'applied' | 'screening' | 'interview' | 'offer' | 'rejected' | 'accepted';
  salary?: number;
  location?: string;
  appliedAt?: number;
  responseAt?: number;
  interviewDates?: number[];
  notes?: string;
}

// Analytics Events
export interface AnalyticsEvent {
  id: string;
  userId: string;
  eventType: string;
  eventData: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userAgent: string;
  ipHash: string;
}

// Database Operations Interface
export interface Database {
  // Users
  getUser(id: string): User | undefined;
  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User;
  updateUser(id: string, data: Partial<User>): User | undefined;
  
  // Content
  getContent(id: string): Content | undefined;
  getContentByChannel(channelId: string, type?: string): Content[];
  createContent(content: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Content;
  updateContent(id: string, data: Partial<Content>): Content | undefined;
  deleteContent(id: string): boolean;
  
  // Channels
  getChannel(id: string): Channel | undefined;
  getAllChannels(): Channel[];
  createChannel(channel: Omit<Channel, 'id' | 'createdAt'>): Channel;
  
  // Progress
  getUserProgress(userId: string): UserProgress[];
  updateProgress(id: string, data: Partial<UserProgress>): UserProgress | undefined;
  
  // Learning Paths
  getLearningPath(id: string): LearningPath | undefined;
  getLearningPathsByChannel(channelId: string): LearningPath[];
  
  // Achievements
  getAchievements(): Achievement[];
  getUserAchievements(userId: string): UserAchievement[];
  
  // Discussions
  getDiscussions(channelId: string): Discussion[];
  createDiscussion(discussion: Omit<Discussion, 'id' | 'createdAt' | 'updatedAt'>): Discussion;
  
  // Jobs
  getJobApplications(userId: string): JobApplication[];
  updateJobApplication(id: string, data: Partial<JobApplication>): JobApplication | undefined;
  
  // Analytics
  trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void;
  getEvents(userId: string, eventType?: string, limit?: number): AnalyticsEvent[];
}

// SQLite Schema SQL
export const SCHEMA_SQL = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  preferences TEXT NOT NULL DEFAULT '{}',
  role TEXT NOT NULL DEFAULT 'user'
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  parent_id TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_premium INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES channels(id)
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}',
  tags TEXT NOT NULL DEFAULT '[]',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  FOREIGN KEY (channel_id) REFERENCES channels(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',
  score INTEGER,
  time_spent INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at INTEGER NOT NULL,
  completed_at INTEGER,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (content_id) REFERENCES content(id)
);

-- Learning paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  channel_id TEXT NOT NULL,
  steps TEXT NOT NULL DEFAULT '[]',
  estimated_hours REAL NOT NULL DEFAULT 0,
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  created_at INTEGER NOT NULL,
  FOREIGN KEY (channel_id) REFERENCES channels(id)
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  criteria TEXT NOT NULL DEFAULT '{}',
  points INTEGER NOT NULL DEFAULT 0,
  rarity TEXT NOT NULL DEFAULT 'common'
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  earned_at INTEGER NOT NULL,
  progress INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- Discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  channel_id TEXT NOT NULL,
  content_id TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  reply_count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_locked INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (channel_id) REFERENCES channels(id),
  FOREIGN KEY (content_id) REFERENCES content(id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  parent_id TEXT,
  upvotes INTEGER NOT NULL DEFAULT 0,
  downvotes INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (parent_id) REFERENCES comments(id)
);

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'other',
  status TEXT NOT NULL DEFAULT 'wishlist',
  salary INTEGER,
  location TEXT,
  applied_at INTEGER,
  response_at INTEGER,
  interview_dates TEXT NOT NULL DEFAULT '[]',
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data TEXT NOT NULL DEFAULT '{}',
  timestamp INTEGER NOT NULL,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  ip_hash TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_channel ON content(channel_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_channel ON discussions(channel_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics_events(timestamp);
`;

export default SCHEMA_SQL;
