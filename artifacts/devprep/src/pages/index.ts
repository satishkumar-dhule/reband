// DevPrep Ultra Pro Max - Page Components
// 30 Autonomous Agents with Message Passing Coordination

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, TextField, Select, MenuItem, FormControl, InputLabel, Slider, LinearProgress, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { GitHubButton, GitHubIconButton, GitHubCard, GitHubStatCard, GitHubListCard, GitHubBadge, GitHubInput, GitHubSelect, GitHubFormGroup, GitHubThemeToggle, GitHubTable, GitHubProgress, GitHubAvatar, GitHubAlert } from '../components/github';
import { Clock, BookOpen, Flame, Trophy, ArrowRight, MessageSquare, ThumbsUp, Plus, Search, User } from 'lucide-react';
import { ExpandMore, Check, Close, Star, TrendingUp, Schedule, PlayArrow, Pause, Delete, Edit, Add, Remove, FilterList, Sort, Download, Upload, Refresh, Settings, Notifications, Message, Share, Favorite, Comment, Visibility, PersonAdd, GroupAdd, Search as SearchMui, Cloud, Security, Code, School, Work, EmojiEvents, Timeline, Psychology, Science, LibraryBooks, Support, Celebration, Feedback, LocalLibrary, Menu, Home, Dashboard, Person, CalendarToday, Assessment, Storage, CloudQueue, Http, Speed, Build, TestTube, AutoFixHigh, GitHub, Twitter, LinkedIn, Facebook, Instagram, YouTube, Send, AttachFile, PhotoCamera, VideoCall, Mic, ScreenShare, Fullscreen, FullscreenExit, ZoomIn, ZoomOut, RotateLeft, RotateRight, Flip, Crop, Brightness4, Brightness7, DarkMode, LightMode, Language, Translate, FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted, FormatListNumbered, FormatQuote, Code as CodeIcon, Link as LinkIcon, Mail, Phone, LocationOn, AccessTime, DateRange, Event, LocalOffer, Tag, Category, Folder, FileCopy, DeleteForever, Lock, LockOpen, Visibility as VisibilityIcon, VisibilityOff, Fingerprint, VerifiedUser, Security, Shield, Warning, Error, Info, Success, Help, Search as SearchIcon, Filter, Sort as SortIcon, Refresh as RefreshIcon, MoreVert, MoreHoriz, ArrowBack, ArrowForward, ArrowUpward, ArrowDownward, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp, KeyboardArrowDown, CheckCircle, Cancel, DeleteSweep, Archive, Unarchive, MarkEmailRead, MarkEmailUnread, Inbox, Outbox, Drafts, Send as SendIcon, Reply, ReplyAll, Forward, DeleteOutline, AddCircle, RemoveCircle, ControlPoint, Create, Clear, SearchOff, ShoppingCart, Payment, CreditCard, AccountBalance, TrendingUp as TrendingUpIcon, ShowChart, PieChart as PieChartIcon, BarChart as BarChartIcon, Timeline as TimelineIcon, BubbleChart, MultilineChart, Cancel as CancelIcon, CheckCircle as CheckCircleIcon, RadioButtonChecked, RadioButtonUnchecked, CheckBox, CheckBoxOutlineBlank, IndeterminateCheckBox, Star as StarIcon, StarBorder, Favorite as FavoriteIcon, FavoriteBorder, ThumbUp, ThumbDown, Share as ShareIcon, Flag, Bookmark, BookmarkBorder, LocalOffer as LocalOfferIcon, Label, LabelOff, Folder as FolderIcon, FolderOpen, CreateNewFolder, FileUpload, FileDownload, CloudUpload, CloudDownload, Lock as LockIcon, LockOpen as LockOpenIcon, Visibility as VisibilityIcon2, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

// Page Interface
export interface PageProps {
  agentId?: string;
}

// Dashboard Page - Agent 1 (GitHub Theme)
export const DashboardPage: React.FC<PageProps> = () => {
  const [progress] = React.useState(65);
  
  // GitHub color palette
  const colors = {
    primary: '#0969da',   // GitHub blue
    success: '#1a7f37',   // GitHub green
    warning: '#bf8700',   // GitHub yellow/orange
    purple: '#8250df',   // GitHub purple
  };
  
  return (
    <Box sx={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}>
      <Typography variant="h4" gutterBottom sx={{ color: '#c9d1d9', fontWeight: 600, mb: 3 }}>
        Dashboard
      </Typography>
      
      {/* Stats Grid - Using GitHubStatCard */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        <GitHubStatCard
          label="Total Learning Hours"
          value="127.5"
          change={{ value: 12, isPositive: true }}
          icon={<Clock size={16} />}
        />
        <GitHubStatCard
          label="Questions Answered"
          value="1,234"
          change={{ value: 8, isPositive: true }}
          icon={<BookOpen size={16} />}
        />
        <GitHubStatCard
          label="Current Streak"
          value="14 days"
          icon={<Flame size={16} />}
        />
        <GitHubStatCard
          label="Achievements"
          value="18/30"
          icon={<Trophy size={16} />}
        />
      </div>
      
      {/* Progress and Learning Paths Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '16px'
      }}>
        {/* Weekly Progress Card - Using GitHubCard + GitHubProgress */}
        <GitHubCard
          title="Weekly Progress"
          variant="bordered"
          padding="md"
        >
          <GitHubProgress 
            value={progress} 
            showLabel 
            size="md"
            color={colors.primary}
          />
          <p style={{ 
            color: '#8b949e', 
            fontSize: '13px', 
            marginTop: '8px',
            margin: '8px 0 0 0'
          }}>
            {progress}% of weekly goal completed
          </p>
        </GitHubCard>
        
        {/* Active Learning Paths Card - Using GitHubCard + GitHubListCard */}
        <GitHubCard
          title="Active Learning Paths"
          variant="bordered"
          padding="none"
        >
          <GitHubListCard
            items={[
              {
                id: '1',
                title: 'DevOps Mastery',
                subtitle: 'Step 5 of 12 • 45 min remaining',
                badge: 'In Progress',
                icon: <BookOpen size={16} />,
              },
              {
                id: '2',
                title: 'Kubernetes Fundamentals',
                subtitle: 'Step 2 of 8 • 30 min remaining',
                badge: 'Started',
                icon: <BookOpen size={16} />,
              },
            ]}
            onItemClick={(id) => console.log('Clicked:', id)}
          />
        </GitHubCard>
      </div>
    </Box>
  );
};

// Learning Paths Page - Agent 2
export const LearningPathsPage: React.FC<PageProps> = () => {
  const paths = [
    { id: 1, title: 'DevOps Mastery', steps: 12, completed: 5, difficulty: 'Advanced', duration: '20 hours', icon: '🚀', color: '#6366f1' },
    { id: 2, title: 'Kubernetes Fundamentals', steps: 8, completed: 2, difficulty: 'Intermediate', duration: '15 hours', icon: '☸️', color: '#326ce5' },
    { id: 3, title: 'AWS Solutions Architect', steps: 15, completed: 0, difficulty: 'Advanced', duration: '30 hours', icon: '☁️', color: '#ff9900' },
    { id: 4, title: 'Docker & Containers', steps: 10, completed: 7, difficulty: 'Beginner', duration: '12 hours', icon: '🐳', color: '#2496ed' },
    { id: 5, title: 'CI/CD Pipelines', steps: 6, completed: 3, difficulty: 'Intermediate', duration: '8 hours', icon: '🔄', color: '#06b6d4' },
  ];
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Learning Paths</Typography>
      <Grid container spacing={3}>
        {paths.map(path => (
          <Grid item xs={12} md={4} key={path.id}>
            <Card sx={{ '&:hover': { boxShadow: 6 } }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h4" sx={{ mr: 2 }}>{path.icon}</Typography>
                  <Box>
                    <Typography variant="h6">{path.title}</Typography>
                    <Chip label={path.difficulty} size="small" color={path.difficulty === 'Beginner' ? 'success' : path.difficulty === 'Intermediate' ? 'warning' : 'error'} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>{path.duration}</Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption">Progress: {path.completed}/{path.steps} steps</Typography>
                  <LinearProgress variant="determinate" value={(path.completed / path.steps) * 100} sx={{ height: 6, borderRadius: 3 }} />
                </Box>
                <Button variant="contained" fullWidth>Continue Learning</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Code Practice Page - Agent 3 (GitHub Theme)
export const CodePracticePage: React.FC<PageProps> = () => {
  const challenges = [
    { id: 1, title: 'Reverse a Linked List', difficulty: 'Medium', category: 'Data Structures', completed: false },
    { id: 2, title: 'Implement Binary Search', difficulty: 'Easy', category: 'Algorithms', completed: true },
    { id: 3, title: 'Merge Two Sorted Arrays', difficulty: 'Medium', category: 'Algorithms', completed: false },
    { id: 4, title: 'Design a Rate Limiter', difficulty: 'Hard', category: 'System Design', completed: false },
  ];

  // Helper to get badge color based on difficulty
  const getDifficultyColor = (difficulty: string): 'green' | 'orange' | 'red' => {
    switch (difficulty) {
      case 'Easy': return 'green';
      case 'Medium': return 'orange';
      case 'Hard': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Box sx={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}>
      {/* Header */}
      <Box sx={{ mb: 3, borderBottom: '1px solid #d0d7de', pb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CodeIcon sx={{ fontSize: 28, color: '#24292f' }} />
          <Typography variant="h4" sx={{ fontWeight: 600, color: '#24292f', fontSize: '1.75rem' }}>
            Code Practice
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: '#656d76', mt: 0.5 }}>
          Sharpen your coding skills with algorithmic challenges
        </Typography>
      </Box>

      {/* Search & Filters */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <GitHubInput
          placeholder="Search challenges..."
          size="small"
          style={{ width: 280 }}
        />
        <GitHubSelect
          options={[
            { value: '', label: 'Difficulty' },
            { value: 'Easy', label: 'Easy' },
            { value: 'Medium', label: 'Medium' },
            { value: 'Hard', label: 'Hard' },
          ]}
          size="sm"
          style={{ minWidth: 140 }}
        />
        <GitHubSelect
          options={[
            { value: '', label: 'Category' },
            { value: 'Algorithms', label: 'Algorithms' },
            { value: 'Data Structures', label: 'Data Structures' },
            { value: 'System Design', label: 'System Design' },
          ]}
          size="sm"
          style={{ minWidth: 160 }}
        />
      </Box>

      {/* Challenge List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {challenges.map(challenge => (
          <GitHubCard
            key={challenge.id}
            variant="bordered"
            padding="md"
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              {/* Challenge Info */}
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CodeIcon sx={{ fontSize: 20, color: '#656d76' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', color: '#24292f' }}>
                    {challenge.title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  <GitHubBadge
                    color={getDifficultyColor(challenge.difficulty)}
                    size="sm"
                  >
                    {challenge.difficulty}
                  </GitHubBadge>
                  <GitHubBadge
                    color="gray"
                    size="sm"
                    outline
                  >
                    {challenge.category}
                  </GitHubBadge>
                </Box>
              </Box>

              {/* Action Button */}
              <GitHubButton
                variant={challenge.completed ? 'outline' : 'primary'}
                size="small"
              >
                {challenge.completed ? 'Review' : 'Solve'}
              </GitHubButton>
            </Box>
          </GitHubCard>
        ))}
      </Box>
    </Box>
  );
};

// Interview Simulator Page - Agent 4 (GitHub Theme)
export const InterviewSimulatorPage: React.FC<PageProps> = () => {
  const cardData = [
    { title: 'Technical Interview', description: 'Practice technical questions with AI-powered feedback.', badge: '50+ Questions', badgeColor: 'blue' as const },
    { title: 'System Design', description: 'Practice system design problems like a real interview.', badge: '30+ Scenarios', badgeColor: 'green' as const },
    { title: 'Behavioral Questions', description: 'Prepare for behavioral questions with sample answers.', badge: '40+ Questions', badgeColor: 'purple' as const },
  ];

  return (
    <Box sx={{ padding: '24px' }}>
      <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 600, color: 'var(--gh-text-primary, #f0f6fc)', fontFamily: 'var(--gh-font-sans)' }}>Interview Simulator</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {cardData.map((item, index) => (
          <GitHubCard key={index} title={item.title} description={item.description} badge={<GitHubBadge color={item.badgeColor} size="sm">{item.badge}</GitHubBadge>} variant="bordered" padding="md" className="gh-card-hover">
            <GitHubButton variant="primary" fullWidth icon={<PlayArrow size={16} />}>Start Practice</GitHubButton>
          </GitHubCard>
        ))}
      </div>
      <style>{`.gh-card-hover { transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; } .gh-card-hover:hover { transform: translateY(-2px); box-shadow: var(--gh-shadow-md); border-color: var(--gh-accent-primary, #58a6ff); }`}</style>
    </Box>
  );
};

// Voice Practice Page - Agent 5 (GitHub Theme)
export const VoicePracticePage: React.FC<PageProps> = () => {
  const [recording, setRecording] = React.useState(false);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Voice Practice</Typography>
      <GitHubCard sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Practice Your Interview Voice</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>Record yourself answering interview questions and get AI feedback on your communication skills.</Typography>
        
        <Box sx={{ my: 4 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: recording ? '#cf222e' : '#0969da',
              mx: 'auto',
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              boxShadow: recording ? '0 0 0 4px rgba(207, 34, 46, 0.3)' : 'none',
              animation: recording ? 'pulse 1.5s infinite' : 'none',
            }}
          >
            <Mic sx={{ fontSize: 60, color: 'white' }} />
          </Box>
          <Typography 
            variant="h6" 
            sx={{ color: recording ? '#cf222e' : '#57606a' }}
          >
            {recording ? 'Recording...' : 'Click to Start Recording'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <GitHubButton 
            variant={recording ? 'danger' : 'primary'} 
            size="lg"
            icon={recording ? <Pause /> : <PlayArrow />}
            onClick={() => setRecording(!recording)}
          >
            {recording ? 'Pause' : 'Start'}
          </GitHubButton>
          <GitHubButton 
            variant="secondary" 
            size="lg"
            disabled={!recording}
          >
            Stop & Analyze
          </GitHubButton>
        </Box>
        
        <GitHubAlert type="info" sx={{ mt: 3 }}>
          AI will analyze: Clarity, Pace, Confidence, Tone, and provide improvement tips.
        </GitHubAlert>
      </GitHubCard>
    </Box>
  );
};

// Flashcards Page - Agent 6 (GitHub Theme)
export const FlashcardsPage: React.FC<PageProps> = () => {
  const [currentCard, setCurrentCard] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  
  const cards = [
    { question: 'What is Docker?', answer: 'A platform for developing, shipping, and running applications in containers.' },
    { question: 'What is Kubernetes?', answer: 'An open-source container orchestration platform for automating deployment, scaling, and management.' },
    { question: 'What is CI/CD?', answer: 'Continuous Integration/Continuous Deployment - practices for frequently delivering apps to customers.' },
  ];
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: '#1f2328' }}>Flashcards</Typography>
      
      {/* Flashcard with GitHub styling - flip animation */}
      <Box
        onClick={() => setFlipped(!flipped)}
        sx={{
          perspective: '1000px',
          cursor: 'pointer',
          mb: 3,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            minHeight: 280,
            transition: 'transform 0.4s ease',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front - Question */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              minHeight: 280,
              p: 4,
              bgcolor: '#ffffff',
              border: '1px solid #d0d7de',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              backfaceVisibility: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#656d76', mb: 2, fontSize: '0.875rem' }}>
              Card {currentCard + 1} of {cards.length}
            </Typography>
            <Typography variant="h5" sx={{ textAlign: 'center', color: '#1f2328', fontWeight: 500 }}>
              {cards[currentCard].question}
            </Typography>
            <Typography variant="body2" sx={{ mt: 3, color: '#656d76', textAlign: 'center' }}>
              Click to see answer
            </Typography>
          </Box>
          
          {/* Back - Answer */}
          <Box
            sx={{
              position: 'absolute',
              width: '100%',
              minHeight: 280,
              p: 4,
              bgcolor: '#f6f8fa',
              border: '1px solid #d0d7de',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ color: '#656d76', mb: 2, fontSize: '0.875rem' }}>
              Answer
            </Typography>
            <Typography variant="h5" sx={{ textAlign: 'center', color: '#1f2328', fontWeight: 500 }}>
              {cards[currentCard].answer}
            </Typography>
            <Typography variant="body2" sx={{ mt: 3, color: '#656d76', textAlign: 'center' }}>
              Click to see question
            </Typography>
          </Box>
        </Box>
      </Box>
      
      {/* GitHub-styled button controls */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <GitHubButton
          variant="outline"
          size="md"
          onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setFlipped(false); }}
          disabled={currentCard === 0}
        >
          Previous
        </GitHubButton>
        <GitHubButton
          variant="primary"
          size="md"
          onClick={() => setFlipped(!flipped)}
          style={{ backgroundColor: '#0969da' }}
        >
          {flipped ? 'Show Question' : 'Show Answer'}
        </GitHubButton>
        <GitHubButton
          variant="outline"
          size="md"
          onClick={() => { setCurrentCard(Math.min(cards.length - 1, currentCard + 1)); setFlipped(false); }}
          disabled={currentCard === cards.length - 1}
        >
          Next
        </GitHubButton>
      </Box>
    </Box>
  );
};

// Analytics Page - Agent 9
export const AnalyticsPage: React.FC<PageProps> = () => {
  // GitHub theme colors
  const githubBlue = '#0969da';
  const githubGreen = '#1a7f37';
  const chartBgColor = '#f6f8fa';

  const metricsData = [
    { metric: 'Total Study Time', value: '127.5 hours', change: '+12%' },
    { metric: 'Questions Answered', value: '1,234', change: '+8%' },
    { metric: 'Accuracy Rate', value: '78%', change: '+5%' },
  ];

  const columns = [
    { key: 'metric', header: 'Metric', width: '50%' },
    { key: 'value', header: 'Value', width: '25%' },
    { 
      key: 'change', 
      header: 'Change', 
      width: '25%',
      render: (row: typeof metricsData[0]) => (
        <GitHubBadge color="green" size="sm">{row.change}</GitHubBadge>
      )
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#24292f' }}>Analytics</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <GitHubCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#24292f' }}>Performance Over Time</Typography>
              <Box sx={{ 
                height: 200, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: chartBgColor, 
                borderRadius: 1,
                border: '1px solid #d0d7de'
              }}>
                {/* Simulated line chart using CSS - GitHub blue */}
                <svg width="280" height="120" viewBox="0 0 280 120" style={{ margin: '0 auto' }}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={githubBlue} stopOpacity="0.3" />
                      <stop offset="100%" stopColor={githubBlue} stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M0,100 Q40,80 70,85 T140,60 T210,40 T280,20" 
                    fill="none" 
                    stroke={githubBlue} 
                    strokeWidth="2.5"
                  />
                  <path 
                    d="M0,100 Q40,80 70,85 T140,60 T210,40 T280,20 L280,120 L0,120 Z" 
                    fill="url(#chartGradient)" 
                  />
                  <circle cx="70" cy="85" r="4" fill={githubBlue} />
                  <circle cx="140" cy="60" r="4" fill={githubBlue} />
                  <circle cx="210" cy="40" r="4" fill={githubBlue} />
                  <circle cx="280" cy="20" r="4" fill={githubBlue} />
                </svg>
              </Box>
            </Box>
          </GitHubCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <GitHubCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#24292f' }}>Skills Breakdown</Typography>
              <Box sx={{ 
                height: 200, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                bgcolor: chartBgColor, 
                borderRadius: 1,
                border: '1px solid #d0d7de'
              }}>
                {/* Simulated pie chart - GitHub style colors */}
                <svg width="140" height="140" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke={githubBlue} strokeWidth="20" strokeDasharray="125.6 251.2" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke={githubGreen} strokeWidth="20" strokeDasharray="75.4 301.6" strokeDashoffset="-125.6" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8250df" strokeWidth="20" strokeDasharray="50.2 326.8" strokeDashoffset="-201" />
                </svg>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: githubBlue }} />
                    <Typography variant="caption" sx={{ color: '#57606a' }}>Algorithms (50%)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: githubGreen }} />
                    <Typography variant="caption" sx={{ color: '#57606a' }}>System Design (30%)</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#8250df' }} />
                    <Typography variant="caption" sx={{ color: '#57606a' }}>Frontend (20%)</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </GitHubCard>
        </Grid>
        <Grid item xs={12}>
          <GitHubCard>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#24292f' }}>Detailed Metrics</Typography>
              <GitHubTable 
                columns={columns} 
                data={metricsData} 
                size="md"
                hoverable={true}
                striped={true}
              />
            </Box>
          </GitHubCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// Community Page - Agent 10 - GitHub Theme Migration
export const CommunityPage: React.FC<PageProps> = () => {
  const discussions = [
    { id: 1, title: 'Best resources for learning Kubernetes in 2024', author: 'DevUser1', replies: 24, votes: 45 },
    { id: 2, title: 'How I cracked the AWS Solutions Architect exam', author: 'CloudExpert', replies: 56, votes: 128 },
    { id: 3, title: 'Tips for technical interviews at FAANG companies', author: 'InterviewPro', replies: 89, votes: 234 },
  ];

  return (
    <Box className="gh-page-container">
      <Typography variant="h4" gutterBottom className="gh-page-title">Community</Typography>

      {/* Header Actions - GitHub-style */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <GitHubButton variant="primary" size="sm" icon={<Plus size={16} />}>
          New Discussion
        </GitHubButton>
        <Box className="gh-search-wrapper" style={{ position: 'relative', width: '280px' }}>
          <GitHubInput
            size="sm"
            placeholder="Search discussions..."
            style={{ paddingLeft: '36px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gh-text-secondary, #8b949e)', pointerEvents: 'none' }} />
        </Box>
      </Box>

      {/* Discussions List - GitHub-style */}
      <div className="gh-discussion-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {discussions.map((discussion) => (
          <GitHubCard
            key={discussion.id}
            variant="bordered"
            padding="md"
            className="gh-discussion-item"
          >
            {/* Discussion Title - GitHub link style */}
            <h3
              className="gh-discussion-title"
              style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--gh-link, #0969da)',
                cursor: 'pointer',
              }}
            >
              {discussion.title}
            </h3>

            {/* Discussion Metadata - GitHub-style with lucide icons */}
            <div
              className="gh-discussion-meta"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                fontSize: '12px',
                color: 'var(--gh-text-secondary, #8b949e)',
              }}
            >
              {/* Author */}
              <span className="gh-discussion-author" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={14} />
                {discussion.author}
              </span>

              {/* Replies */}
              <span className="gh-discussion-replies" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MessageSquare size={14} />
                {discussion.replies} replies
              </span>

              {/* Votes */}
              <span className="gh-discussion-votes" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ThumbsUp size={14} />
                {discussion.votes} votes
              </span>
            </div>
          </GitHubCard>
        ))}
      </div>

      {/* Empty State - GitHub-style */}
      {discussions.length === 0 && (
        <div className="gh-empty-state" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--gh-text-secondary, #8b949e)' }}>
          <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p>No discussions yet. Start the first one!</p>
        </div>
      )}
    </Box>
  );
};

// Job Tracker Page - Agent 13 (GitHub Theme)
export const JobTrackerPage: React.FC<PageProps> = () => {
  const applications = [
    { id: 1, company: 'Google', position: 'Software Engineer', status: 'interview', date: '2024-03-15' },
    { id: 2, company: 'Amazon', position: 'DevOps Engineer', status: 'applied', date: '2024-03-20' },
    { id: 3, company: 'Microsoft', position: 'Cloud Engineer', status: 'offer', date: '2024-03-10' },
  ];

  // GitHub color mapping for status
  const getStatusColor = (status: string): 'green' | 'orange' | 'blue' => {
    switch (status) {
      case 'offer': return 'green';
      case 'interview': return 'orange';
      case 'applied': return 'blue';
      default: return 'blue';
    }
  };

  // GitHubTable columns definition
  const columns = [
    { key: 'company', header: 'Company', width: '20%' },
    { key: 'position', header: 'Position', width: '25%' },
    { 
      key: 'status', 
      header: 'Status', 
      width: '15%',
      render: (row: typeof applications[0]) => (
        <GitHubBadge 
          color={getStatusColor(row.status)} 
          size="sm"
          style={{ 
            textTransform: 'capitalize',
            backgroundColor: row.status === 'offer' ? '#dafbe1' : row.status === 'interview' ? '#fff1e5' : '#ddf4ff',
            color: row.status === 'offer' ? '#1a7f37' : row.status === 'interview' ? '#bf8700' : '#0969da',
            border: `1px solid ${row.status === 'offer' ? '#1a7f37' : row.status === 'interview' ? '#bf8700' : '#0969da'}`,
          }}
        >
          {row.status}
        </GitHubBadge>
      ),
    },
    { key: 'date', header: 'Applied Date', width: '15%' },
    { 
      key: 'actions', 
      header: 'Actions', 
      width: '15%',
      align: 'right' as const,
      render: () => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <GitHubIconButton 
            icon={<Edit size={14} />} 
            label="Edit" 
            variant="ghost"
            size="sm"
            style={{ color: '#57606a' }}
          />
          <GitHubIconButton 
            icon={<Delete size={14} />} 
            label="Delete" 
            variant="ghost"
            size="sm"
            style={{ color: '#cf222e' }}
          />
        </div>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
        fontWeight: 600,
        color: '#24292f',
        marginBottom: '24px',
      }}>
        Job Tracker
      </Typography>
      <div style={{ marginBottom: '24px' }}>
        <GitHubButton variant="primary" icon={<Add size={16} />}>
          Add Application
        </GitHubButton>
      </div>
      <div style={{ 
        border: '1px solid #d0d7de', 
        borderRadius: '6px',
        overflow: 'hidden',
      }}>
        <GitHubTable 
          columns={columns} 
          data={applications}
          size="md"
          hoverable={true}
          striped={true}
          emptyMessage="No job applications yet"
        />
      </div>
    </Box>
  );
};

// Settings Page - Agent 20
export const SettingsPage: React.FC<PageProps> = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'var(--gh-text-primary, #c9d1d9)', fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Settings</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <GitHubCard title="Profile" padding="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <GitHubFormGroup label="Name">
                <GitHubInput 
                  type="text" 
                  defaultValue="John Doe" 
                  placeholder="Enter your name"
                />
              </GitHubFormGroup>
              <GitHubFormGroup label="Email">
                <GitHubInput 
                  type="email" 
                  defaultValue="john@example.com" 
                  placeholder="Enter your email"
                />
              </GitHubFormGroup>
              <GitHubFormGroup label="Bio">
                <GitHubInput 
                  defaultValue="Software Engineer passionate about DevOps" 
                  placeholder="Tell us about yourself"
                  style={{ 
                    minHeight: '80px', 
                    padding: '8px 12px',
                    resize: 'vertical'
                  } as React.CSSProperties}
                />
              </GitHubFormGroup>
            </div>
          </GitHubCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <GitHubCard title="Preferences" padding="md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <GitHubFormGroup label="Theme">
                <GitHubSelect 
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'auto', label: 'Auto' }
                  ]}
                  defaultValue="dark"
                  placeholder="Select theme"
                />
              </GitHubFormGroup>
              <GitHubFormGroup label="Theme Toggle Preview">
                <GitHubThemeToggle showLabel variant="button" />
              </GitHubFormGroup>
              <GitHubFormGroup label="Notifications">
                <GitHubSelect 
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'important', label: 'Important Only' },
                    { value: 'none', label: 'None' }
                  ]}
                  defaultValue="all"
                  placeholder="Select notification preference"
                />
              </GitHubFormGroup>
              <div style={{ marginTop: '8px' }}>
                <GitHubButton variant="primary">
                  Save Changes
                </GitHubButton>
              </div>
            </div>
          </GitHubCard>
        </Grid>
      </Grid>
    </Box>
  );
};

// Export all pages
export const pages = {
  DashboardPage,
  LearningPathsPage,
  CodePracticePage,
  InterviewSimulatorPage,
  VoicePracticePage,
  FlashcardsPage,
  AnalyticsPage,
  CommunityPage,
  JobTrackerPage,
  SettingsPage,
};

export default pages;
