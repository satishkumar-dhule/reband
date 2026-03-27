// DevPrep Ultra Pro Max - Page Components
// 30 Autonomous Agents with Message Passing Coordination

import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Button, Chip, Avatar, List, ListItem, ListItemAvatar, ListItemText, Divider, TextField, Select, MenuItem, FormControl, InputLabel, Slider, LinearProgress, CircularProgress, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore, Check, Close, Star, TrendingUp, Schedule, PlayArrow, Pause, Delete, Edit, Add, Remove, FilterList, Sort, Download, Upload, Refresh, Settings, Notifications, Message, Share, Favorite, Comment, Visibility, PersonAdd, GroupAdd, Search, Cloud, Security, Code, School, Work, EmojiEvents, Timeline, Psychology, Science, LibraryBooks, Support, Celebration, Feedback, LocalLibrary, Menu, Home, Dashboard, Person, CalendarToday, Assessment, Storage, CloudQueue, Http, Speed, Build, TestTube, AutoFixHigh, GitHub, Twitter, LinkedIn, Facebook, Instagram, YouTube, Send, AttachFile, PhotoCamera, VideoCall, Mic, ScreenShare, Fullscreen, FullscreenExit, ZoomIn, ZoomOut, RotateLeft, RotateRight, Flip, Crop, Brightness4, Brightness7, DarkMode, LightMode, Language, Translate, FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted, FormatListNumbered, FormatQuote, Code as CodeIcon, Link as LinkIcon, Mail, Phone, LocationOn, AccessTime, DateRange, Event, LocalOffer, Tag, Category, Folder, FileCopy, DeleteForever, Lock, LockOpen, Visibility as VisibilityIcon, VisibilityOff, Fingerprint, VerifiedUser, Security, Shield, Warning, Error, Info, Success, Help, Search as SearchIcon, Filter, Sort as SortIcon, Refresh as RefreshIcon, MoreVert, MoreHoriz, ArrowBack, ArrowForward, ArrowUpward, ArrowDownward, KeyboardArrowLeft, KeyboardArrowRight, KeyboardArrowUp, KeyboardArrowDown, CheckCircle, Cancel, DeleteSweep, Archive, Unarchive, MarkEmailRead, MarkEmailUnread, Inbox, Outbox, Drafts, Send as SendIcon, Reply, ReplyAll, Forward, DeleteOutline, AddCircle, RemoveCircle, ControlPoint, Create, Clear, SearchOff, ShoppingCart, Payment, CreditCard, AccountBalance, TrendingUp as TrendingUpIcon, ShowChart, PieChart as PieChartIcon, BarChart as BarChartIcon, Timeline as TimelineIcon, BubbleChart, MultilineChart, Cancel as CancelIcon, CheckCircle as CheckCircleIcon, RadioButtonChecked, RadioButtonUnchecked, CheckBox, CheckBoxOutlineBlank, IndeterminateCheckBox, Star as StarIcon, StarBorder, Favorite as FavoriteIcon, FavoriteBorder, ThumbUp, ThumbDown, Share as ShareIcon, Flag, Bookmark, BookmarkBorder, LocalOffer as LocalOfferIcon, Label, LabelOff, Folder as FolderIcon, FolderOpen, CreateNewFolder, FileUpload, FileDownload, CloudUpload, CloudDownload, Lock as LockIcon, LockOpen as LockOpenIcon, Visibility as VisibilityIcon2, VisibilityOff as VisibilityOffIcon } from '@mui/icons-material';

// Page Interface
export interface PageProps {
  agentId?: string;
}

// Dashboard Page - Agent 1
export const DashboardPage: React.FC<PageProps> = () => {
  const [progress] = React.useState(65);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#6366f1', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Learning Hours</Typography>
              <Typography variant="h3">127.5</Typography>
              <Chip label="+12% this week" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#10b981', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Questions Answered</Typography>
              <Typography variant="h3">1,234</Typography>
              <Chip label="+8% this week" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#f59e0b', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Current Streak</Typography>
              <Typography variant="h3">14 days</Typography>
              <Chip label="Best: 21 days" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: '#ec4899', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Achievements</Typography>
              <Typography variant="h3">18/30</Typography>
              <Chip label="12 in progress" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Weekly Progress</Typography>
              <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{progress}% of weekly goal completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Learning Paths</Typography>
              <List>
                <ListItem>
                  <ListItemAvatar><Avatar sx={{ bgcolor: '#6366f1' }}>D</Avatar></ListItemAvatar>
                  <ListItemText primary="DevOps Mastery" secondary="Step 5 of 12 • 45 min remaining" />
                  <Chip label="In Progress" color="primary" size="small" />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemAvatar><Avatar sx={{ bgcolor: '#10b981' }}>K</Avatar></ListItemAvatar>
                  <ListItemText primary="Kubernetes Fundamentals" secondary="Step 2 of 8 • 30 min remaining" />
                  <Chip label="Started" color="success" size="small" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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

// Code Practice Page - Agent 3
export const CodePracticePage: React.FC<PageProps> = () => {
  const challenges = [
    { id: 1, title: 'Reverse a Linked List', difficulty: 'Medium', category: 'Data Structures', completed: false },
    { id: 2, title: 'Implement Binary Search', difficulty: 'Easy', category: 'Algorithms', completed: true },
    { id: 3, title: 'Merge Two Sorted Arrays', difficulty: 'Medium', category: 'Algorithms', completed: false },
    { id: 4, title: 'Design a Rate Limiter', difficulty: 'Hard', category: 'System Design', completed: false },
  ];
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Code Practice</Typography>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField placeholder="Search challenges..." size="small" />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Difficulty</InputLabel>
          <Select label="Difficulty" defaultValue="">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Hard">Hard</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Category</InputLabel>
          <Select label="Category" defaultValue="">
            <MenuItem value="">All</MenuItem>
            <MenuItem value="Algorithms">Algorithms</MenuItem>
            <MenuItem value="Data Structures">Data Structures</MenuItem>
            <MenuItem value="System Design">System Design</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={2}>
        {challenges.map(challenge => (
          <Grid item xs={12} md={6} key={challenge.id}>
            <Card>
              <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{challenge.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Chip label={challenge.difficulty} size="small" color={challenge.difficulty === 'Easy' ? 'success' : challenge.difficulty === 'Medium' ? 'warning' : 'error'} />
                    <Chip label={challenge.category} size="small" variant="outlined" />
                  </Box>
                </Box>
                <Button variant={challenge.completed ? 'outlined' : 'contained'} color={challenge.completed ? 'success' : 'primary'}>
                  {challenge.completed ? 'Review' : 'Solve'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

// Interview Simulator Page - Agent 4
export const InterviewSimulatorPage: React.FC<PageProps> = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Interview Simulator</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Technical Interview</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>Practice technical questions with AI-powered feedback.</Typography>
              <Chip label="50+ Questions" sx={{ mb: 2 }} />
              <Button variant="contained" fullWidth startIcon={<PlayArrow />}>Start Practice</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>System Design</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>Practice system design problems like a real interview.</Typography>
              <Chip label="30+ Scenarios" sx={{ mb: 2 }} />
              <Button variant="contained" fullWidth startIcon={<PlayArrow />}>Start Practice</Button>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Behavioral Questions</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>Prepare for behavioral questions with sample answers.</Typography>
              <Chip label="40+ Questions" sx={{ mb: 2 }} />
              <Button variant="contained" fullWidth startIcon={<PlayArrow />}>Start Practice</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Voice Practice Page - Agent 5
export const VoicePracticePage: React.FC<PageProps> = () => {
  const [recording, setRecording] = React.useState(false);
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Voice Practice</Typography>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>Practice Your Interview Voice</Typography>
        <Typography variant="body1" color="text.secondary" paragraph>Record yourself answering interview questions and get AI feedback on your communication skills.</Typography>
        
        <Box sx={{ my: 4 }}>
          <Avatar sx={{ width: 120, height: 120, bgcolor: recording ? '#ef4444' : '#6366f1', mx: 'auto', mb: 2 }}>
            {recording ? <Mic sx={{ fontSize: 60 }} /> : <Mic sx={{ fontSize: 60 }} />}
          </Avatar>
          <Typography variant="h6" color={recording ? 'error' : 'text.secondary'}>
            {recording ? 'Recording...' : 'Click to Start Recording'}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button variant="contained" size="large" startIcon={recording ? <Pause /> : <PlayArrow />} onClick={() => setRecording(!recording)}>
            {recording ? 'Pause' : 'Start'}
          </Button>
          <Button variant="outlined" size="large" disabled={!recording}>
            Stop & Analyze
          </Button>
        </Box>
        
        <Alert severity="info" sx={{ mt: 3 }}>
          AI will analyze: Clarity, Pace, Confidence, Tone, and provide improvement tips.
        </Alert>
      </Card>
    </Box>
  );
};

// Flashcards Page - Agent 6
export const FlashcardsPage: React.FC<PageProps> = () => {
  const [currentCard, setCurrentCard] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);
  
  const cards = [
    { question: 'What is Docker?', answer: 'A platform for developing, shipping, and running applications in containers.' },
    { question: 'What is Kubernetes?', answer: 'An open-source container orchestration platform for automating deployment, scaling, and management.' },
    { question: 'What is CI/CD?', answer: 'Continuous Integration/Continuous Deployment - practices for frequently delivering apps to customers.' },
  ];
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Flashcards</Typography>
      <Card sx={{ p: 4, minHeight: 300, cursor: 'pointer' }} onClick={() => setFlipped(!flipped)}>
        <Typography variant="caption" color="text.secondary">Card {currentCard + 1} of {cards.length}</Typography>
        <Typography variant="h4" sx={{ mt: 2, textAlign: 'center' }}>
          {flipped ? cards[currentCard].answer : cards[currentCard].question}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          {flipped ? 'Answer' : 'Question'} - Click to {flipped ? 'see question' : 'see answer'}
        </Typography>
      </Card>
      <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setFlipped(false); }}>Previous</Button>
        <Button variant="contained" onClick={() => setFlipped(!flipped)}>{flipped ? 'Show Question' : 'Show Answer'}</Button>
        <Button variant="outlined" onClick={() => { setCurrentCard(Math.min(cards.length - 1, currentCard + 1)); setFlipped(false); }}>Next</Button>
      </Box>
    </Box>
  );
};

// Analytics Page - Agent 9
export const AnalyticsPage: React.FC<PageProps> = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Analytics</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Performance Over Time</Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <TrendingUp sx={{ fontSize: 60, color: '#10b981' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">Skills Breakdown</Typography>
              <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                <PieChartIcon sx={{ fontSize: 60, color: '#6366f1' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">Detailed Metrics</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell>Change</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Study Time</TableCell>
                      <TableCell>127.5 hours</TableCell>
                      <TableCell><Chip label="+12%" color="success" size="small" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Questions Answered</TableCell>
                      <TableCell>1,234</TableCell>
                      <TableCell><Chip label="+8%" color="success" size="small" /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Accuracy Rate</TableCell>
                      <TableCell>78%</TableCell>
                      <TableCell><Chip label="+5%" color="success" size="small" /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Community Page - Agent 10
export const CommunityPage: React.FC<PageProps> = () => {
  const discussions = [
    { id: 1, title: 'Best resources for learning Kubernetes in 2024', author: 'DevUser1', replies: 24, votes: 45 },
    { id: 2, title: 'How I cracked the AWS Solutions Architect exam', author: 'CloudExpert', replies: 56, votes: 128 },
    { id: 3, title: 'Tips for technical interviews at FAANG companies', author: 'InterviewPro', replies: 89, votes: 234 },
  ];
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Community</Typography>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="contained" startIcon={<Add />}>New Discussion</Button>
        <Box>
          <TextField size="small" placeholder="Search discussions..." />
        </Box>
      </Box>
      <List>
        {discussions.map(discussion => (
          <Card key={discussion.id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{discussion.title}</Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">by {discussion.author}</Typography>
                <Typography variant="caption" color="text.secondary"><Comment /> {discussion.replies} replies</Typography>
                <Typography variant="caption" color="text.secondary"><ThumbUp /> {discussion.votes} votes</Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>
    </Box>
  );
};

// Job Tracker Page - Agent 13
export const JobTrackerPage: React.FC<PageProps> = () => {
  const applications = [
    { id: 1, company: 'Google', position: 'Software Engineer', status: 'interview', date: '2024-03-15' },
    { id: 2, company: 'Amazon', position: 'DevOps Engineer', status: 'applied', date: '2024-03-20' },
    { id: 3, company: 'Microsoft', position: 'Cloud Engineer', status: 'offer', date: '2024-03-10' },
  ];
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Job Tracker</Typography>
      <Button variant="contained" startIcon={<Add />} sx={{ mb: 3 }}>Add Application</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map(app => (
              <TableRow key={app.id}>
                <TableCell>{app.company}</TableCell>
                <TableCell>{app.position}</TableCell>
                <TableCell>
                  <Chip 
                    label={app.status} 
                    color={app.status === 'offer' ? 'success' : app.status === 'interview' ? 'warning' : 'default'}
                    size="small" 
                  />
                </TableCell>
                <TableCell>{app.date}</TableCell>
                <TableCell>
                  <IconButton size="small"><Edit /></IconButton>
                  <IconButton size="small"><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// Settings Page - Agent 20
export const SettingsPage: React.FC<PageProps> = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>Settings</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Profile</Typography>
              <TextField fullWidth label="Name" defaultValue="John Doe" sx={{ mb: 2 }} />
              <TextField fullWidth label="Email" defaultValue="john@example.com" sx={{ mb: 2 }} />
              <TextField fullWidth label="Bio" multiline rows={3} defaultValue="Software Engineer passionate about DevOps" />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Preferences</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Theme</InputLabel>
                <Select label="Theme" defaultValue="dark">
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="auto">Auto</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Notifications</InputLabel>
                <Select label="Notifications" defaultValue="all">
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="important">Important Only</MenuItem>
                  <MenuItem value="none">None</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained">Save Changes</Button>
            </CardContent>
          </Card>
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
