import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

// Define the shape of our store
interface ContentStoreState {
  allChannels: Array<{ id: string; name: string }>;
  channelId: string;
  section: string;
  showOnboarding: boolean;
  showChannelBrowser: boolean;
  isMobileSidebarOpen: boolean;
  // Setters
  setAllChannels: (channels: Array<{ id: string; name: string }>) => void;
  setChannelId: (id: string) => void;
  setSection: (section: string) => void;
  setShowOnboarding: (show: boolean) => void;
  setShowChannelBrowser: (show: boolean) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  // Additional setters from original code (we'll implement as needed)
  setMergedContent: (content: any) => void;
  toggleTheme: () => void;
  completeOnboarding: () => void;
  switchChannel: (id: string) => void;
  closeMobileSidebar: () => void;
}

// Create the context
const ContentStoreContext = createContext<ContentStoreState | null>(null);

// Provider component
export const ContentStoreProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state with default values
  const [allChannels, setAllChannels] = useState<Array<{ id: string; name: string }>>([
    { id: 'devops', name: 'DevOps' },
    { id: 'frontend', name: 'Frontend' },
    { id: 'backend', name: 'Backend' },
    { id: 'mobile', name: 'Mobile' },
    { id: 'data', name: 'Data Science' },
  ]);

  const [channelId, setChannelId] = useState('devops');
  const [section, setSection] = useState('qa');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChannelBrowser, setShowChannelBrowser] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Mock implementations for other setters
  const setMergedContent = (content: any) => {
    // In a real app, this would update merged content state
    console.log('Setting merged content:', content);
  };

  const toggleTheme = () => {
    // In a real app, this would toggle the theme
    console.log('Toggling theme');
  };

  const completeOnboarding = () => {
    setShowOnboarding(false);
  };

  const switchChannel = (id: string) => {
    setChannelId(id);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  // Memoize the state and setters to prevent unnecessary re-renders
  const storeValue = useMemo(() => ({
    allChannels,
    channelId,
    section,
    showOnboarding,
    showChannelBrowser,
    isMobileSidebarOpen,
    setAllChannels,
    setChannelId,
    setSection,
    setShowOnboarding,
    setShowChannelBrowser,
    setIsMobileSidebarOpen,
    setMergedContent,
    toggleTheme,
    completeOnboarding,
    switchChannel,
    closeMobileSidebar,
  }), [
    allChannels,
    channelId,
    section,
    showOnboarding,
    showChannelBrowser,
    isMobileSidebarOpen,
  ]);

  return (
    <ContentStoreContext.Provider value={storeValue}>
      {children}
    </ContentStoreContext.Provider>
  );
};

// Hook to use the store
export const useContentStore = () => {
  const context = useContext(ContentStoreContext);
  if (context === null) {
    throw new Error('useContentStore must be used within a ContentStoreProvider');
  }
  return context;
};