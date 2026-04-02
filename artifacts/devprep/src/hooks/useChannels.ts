import { useState, useEffect } from 'react';
import { useContentStore } from '@/stores/contentStore';

export const useChannels = () => {
  const { allChannels, setAllChannels } = useContentStore();

  // In a real app, you would fetch channels from an API
  useEffect(() => {
    // Mock data - in reality, this would come from an API
    const mockChannels = [
      { id: 'devops', name: 'DevOps' },
      { id: 'frontend', name: 'Frontend' },
      { id: 'backend', name: 'Backend' },
      { id: 'mobile', name: 'Mobile' },
      { id: 'data', name: 'Data Science' },
    ];
    setAllChannels(mockChannels);
  }, [setAllChannels]);

  return allChannels;
};