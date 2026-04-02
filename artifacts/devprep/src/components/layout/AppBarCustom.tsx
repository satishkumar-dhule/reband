import { AppBar, Toolbar, Typography, IconButton, Button, Tooltip, Box } from '@mui/material';
import { Search, Menu, Notifications } from '@mui/icons-material';
import { useContentStore } from '@/stores/contentStore';

export default function AppBarCustom() {
  const { channelId, section, setShowChannelBrowser, setSection, switchChannel, showOnboarding } = useContentStore();
  
  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar>
        <IconButton 
          edge="start" 
          color="inherit" 
          aria-label="open drawer"
          onClick={() => setShowChannelBrowser(true)}
          sx={{ mr: 2 }}
        >
          <Tooltip title="Browse Channels">
            <Menu />
          </Tooltip>
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          DevPrep
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            variant="contained" 
            size="small" 
            startIcon={<Search />}
          >
            Search
          </Button>
          <Box sx={{ ml: 2 }} />
          <Tooltip title="Notifications">
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
          </Tooltip>
          <Box sx={{ ml: 2 }} />
          <Button 
            variant="outlined" 
            size="small" 
            color="secondary"
          >
            Profile
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}