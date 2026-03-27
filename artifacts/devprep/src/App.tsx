import * as React from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider, 
  Container,
  IconButton,
  Button,
  Tooltip,
} from '@mui/material';
import { 
  Home, 
  School, 
  Code, 
  Terminal, 
  Analytics, 
  Chat, 
  Widgets, 
  StarBorder, 
  Shield, 
  Settings,
  Person,
  Group,
  Timeline,
  InsertChart,
  BarChart,
  PieChart,
  TableChart,
  Menu,
  Notifications,
  VolumeUp,
  // Use available icons - check what's actually available
  Email,
  Link,
  Description,
  QuestionAnswer,
} from '@mui/icons-material';
import theme from './theme';

// Define 20 specialized agents as components
const agents = [
  { id: 1, name: 'Dashboard', icon: <Home />, description: 'Overview of your progress and stats' },
  { id: 2, name: 'Learning Paths', icon: <School />, description: 'Guided learning journeys' },
  { id: 3, name: 'Code Practice', icon: <Code />, description: 'Hands-on coding challenges' },
  { id: 4, name: 'Interview Simulator', icon: <Terminal />, description: 'Practice technical interviews' },
  { id: 5, name: 'Voice Practice', icon: <Chat />, description: 'Improve your interview speaking' },
  { id: 6, name: 'Flashcards', icon: <Description />, description: 'Spaced repetition learning' },
  { id: 7, name: 'Exam Mode', icon: <QuestionAnswer />, description: 'Test your knowledge' },
  { id: 8, name: 'Progress Tracker', icon: <InsertChart />, description: 'Track your learning journey' },
  { id: 9, name: 'Analytics', icon: <Analytics />, description: 'Deep insights into your performance' },
  { id: 10, name: 'Community', icon: <Group />, description: 'Learn with peers and mentors' },
  { id: 11, name: 'Mentor Match', icon: <Person />, description: 'Get personalized guidance' },
  { id: 12, name: 'Resume Builder', icon: <Email />, description: 'Create a winning resume' },
  { id: 13, name: 'Job Tracker', icon: <Link />, description: 'Manage your job applications' },
  { id: 14, name: 'Skill Gap Analyzer', icon: <BarChart />, description: 'Identify areas for improvement' },
  { id: 15, name: 'Mock Interview', icon: <VolumeUp />, description: 'Simulate real interview scenarios' },
  { id: 16, name: 'Study Planner', icon: <Timeline />, description: 'Organize your study schedule' },
  { id: 17, name: 'Resource Library', icon: <TableChart />, description: 'Access curated learning materials' },
  { id: 18, name: 'Achievements', icon: <StarBorder />, description: 'View your earned badges and certificates' },
  { id: 19, name: 'Feedback Hub', icon: <Notifications />, description: 'Give and receive feedback' },
  { id: 20, name: 'Settings', icon: <Settings />, description: 'Customize your experience' },
];

// Simple placeholder components for each agent
const AgentComponents: Record<number, React.FC> = {
  1: () => <div><h2>Dashboard</h2><p>Welcome to your DevPrep dashboard. Here you'll see your overall progress, streaks, and upcoming goals.</p></div>,
  2: () => <div><h2>Learning Paths</h2><p>Explore our curated learning paths for different tech roles and skills.</p></div>,
  3: () => <div><h2>Code Practice</h2><p>Practice coding challenges in multiple languages with instant feedback.</p></div>,
  4: () => <div><h2>Interview Simulator</h2><p>Simulate technical interviews with AI-powered feedback.</p></div>,
  5: () => <div><h2>Voice Practice</h2><p>Improve your communication skills with voice-based interview practice.</p></div>,
  6: () => <div><h2>Flashcards</h2><p>Use spaced repetition to memorize key concepts and facts.</p></div>,
  7: () => <div><h2>Exam Mode</h2><p>Test your knowledge with timed exams and get detailed results.</p></div>,
  8: () => <div><h2>Progress Tracker</h2><p>Visualize your learning journey over time with detailed analytics.</p></div>,
  9: () => <div><h2>Analytics</h2><p>Deep dive into your performance metrics and identify trends.</p></div>,
  10: () => <div><h2>Community</h2><p>Connect with fellow learners, ask questions, and share knowledge.</p></div>,
  11: () => <div><h2>Mentor Match</h2><p>Get paired with experienced mentors for personalized guidance.</p></div>,
  12: () => <div><h2>Resume Builder</h2><p>Create professional resumes tailored to tech roles using our AI assistant.</p></div>,
  13: () => <div><h2>Job Tracker</h2><p>Manage your job applications, track status, and prepare for interviews.</p></div>,
  14: () => <div><h2>Skill Gap Analyzer</h2><p>Identify your strengths and weaknesses compared to target roles.</p></div>,
  15: () => <div><h2>Mock Interview</h2><p>Practice full interviews with real-time feedback on your performance.</p></div>,
  16: () => <div><h2>Study Planner</h2><p>Plan your study schedule and set reminders for your learning goals.</p></div>,
  17: () => <div><h2>Resource Library</h2><p>Access books, videos, articles, and courses curated by experts.</p></div>,
  18: () => <div><h2>Achievements</h2><p>View your badges, certificates, and milestones earned on DevPrep.</p></div>,
  19: () => <div><h2>Feedback Hub</h2><p>Share your learning experience and get feedback from the community.</p></div>,
  20: () => <div><h2>Settings</h2><p>Customize your DevPrep experience, including theme, notifications, and privacy.</p></div>,
};

export default function App() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const [selectedAgentId, setSelectedAgentId] = React.useState(1);

  const handleAgentSelect = (id: number) => {
    setSelectedAgentId(id);
    setMobileOpen(false);
  };

  const SelectedAgentComponent = AgentComponents[selectedAgentId] || AgentComponents[1];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        {/* Drawer for navigation */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: 260,
            boxSizing: 'border-box',
          }}
        >
          <div sx={{ p: 3 }}>
            <Toolbar>
              <Typography variant="h6" noWrap>
                DevPrep Agents
              </Typography>
            </Toolbar>
            <Divider sx={{ my: 2 }} />
            <List>
              {agents.map((agent) => (
                <ListItem
                  button
                  key={agent.id}
                  selected={selectedAgentId === agent.id}
                  onClick={() => handleAgentSelect(agent.id)}
                  sx={{ mb: 1 }}
                >
                  <ListItemIcon>{agent.icon}</ListItemIcon>
                  <ListItemText primary={agent.name} />
                  <Tooltip title={agent.description} arrow>
                    {/* Using a simple span instead of FontSizeIcon to avoid import issues */}
                    <span style={{ fontSize: '0.75rem' }}>(i)</span>
                  </Tooltip>
                </ListItem>
              ))}
            </List>
          </div>
        </Drawer>

        {/* App Bar */}
        <AppBar position="fixed" sx={{ width: `calc(100% - 260px)`, ml: mobileOpen ? 0 : 260 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                marginRight: 2,
                ...(mobileOpen && { display: 'none' }),
              }}
              aria-label="open drawer"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
              DevPrep - {agents.find(agent => agent.id === selectedAgentId)?.name}
            </Typography>
            <Button color="inherit" startIcon={<Person />}>
              Profile
            </Button>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            width: `calc(100% - 260px)`,
            ml: mobileOpen ? 0 : 260,
            pt: 64, // height of app bar
            p: 3,
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <Container maxWidth="lg">
            <SelectedAgentComponent />
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}