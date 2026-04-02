import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import { Inbox, Info, Description, Code, Link, Chat } from '@mui/icons-material';
import { useContentStore } from '@/stores/contentStore';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const { 
    allChannels, 
    channelId, 
    section, 
    setSection, 
    switchChannel, 
    isMobileSidebarOpen,
    closeMobileSidebar
  } = useContentStore();
  const navigate = useNavigate();

  const handleSectionChange = (sec: string) => {
    setSection(sec);
    closeMobileSidebar();
  };

  const handleChannelSelect = (id: string) => {
    switchChannel(id);
    closeMobileSidebar();
  };

  return (
    <Drawer
      variant="temporary"
      open={isMobileSidebarOpen}
      onClose={closeMobileSidebar}
      sx={{ width: 240, boxSizing: 'border-box' }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" component="div" sx={{ mb: 4 }}>
          Channels
        </Typography>
        <List>
          {allChannels.map((channel) => (
            <ListItem button key={channel.id} selected={channelId === channel.id} onClick={() => handleChannelSelect(channel.id)}>
              <ListItemIcon>
                {/* Icon based on channel - for simplicity, using Inbox */}
                <Inbox />
              </ListItemIcon>
              <ListItemText primary={channel.name} />
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" component="div" sx={{ mb: 4 }}>
          Sections
        </Typography>
        <List>
          {[ 
            { id: 'qa', name: 'Q&A', icon: <Inbox /> },
            { id: 'flashcards', name: 'Flashcards', icon: <Description /> },
            { id: 'exam', name: 'Exam', icon: <Link /> },
            { id: 'voice', name: 'Voice Practice', icon: <Chat /> },
            { id: 'coding', name: 'Coding', icon: <Code /> },
            { id: 'stats', name: 'Stats', icon: <Info /> }
          ].map((sec) => (
            <ListItem button key={sec.id} selected={section === sec.id} onClick={() => handleSectionChange(sec.id)}>
              <ListItemIcon>
                {sec.icon}
              </ListItemIcon>
              <ListItemText primary={sec.name} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}