/**
 * Listen Button Component
 * Text-to-speech button for reading answers aloud
 */

import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { speak, stop, getIsSpeaking, isTTSSupported } from '../lib/text-to-speech';
import { Button, IconButton } from './unified/Button';

interface ListenButtonProps {
  text: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ListenButton({ 
  text, 
  label = 'Listen', 
  className = '',
  size = 'md'
}: ListenButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if TTS is supported
  const supported = isTTSSupported();
  
  // Sync with global speaking state
  useEffect(() => {
    const interval = setInterval(() => {
      const speaking = getIsSpeaking();
      if (!speaking && isPlaying) {
        setIsPlaying(false);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  // Stop on unmount
  useEffect(() => {
    return () => {
      if (isPlaying) {
        stop();
      }
    };
  }, [isPlaying]);
  
  const handleClick = () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      speak(text, {
        onStart: () => {
          setIsLoading(false);
          setIsPlaying(true);
        },
        onEnd: () => {
          setIsPlaying(false);
        },
        onError: () => {
          setIsLoading(false);
          setIsPlaying(false);
        }
      });
      
      // Fallback timeout in case onStart doesn't fire
      setTimeout(() => {
        setIsLoading(false);
        if (getIsSpeaking()) {
          setIsPlaying(true);
        }
      }, 500);
    }
  };
  
  if (!supported) {
    return null; // Don't show button if TTS not supported
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  const buttonVariant = isPlaying ? 'primary' : 'outline';
  
  return (
    <Button
      variant={buttonVariant}
      size={size === 'sm' ? 'sm' : 'md'}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
      aria-label={isPlaying ? 'Stop listening' : 'Listen to answer'}
    >
      {isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isPlaying ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
      <span>{isPlaying ? 'Stop' : label}</span>
    </Button>
  );
}

// Compact icon-only version
export function ListenIconButton({ 
  text, 
  className = '',
  size = 'md'
}: Omit<ListenButtonProps, 'label'>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const supported = isTTSSupported();
  
  useEffect(() => {
    const interval = setInterval(() => {
      const speaking = getIsSpeaking();
      if (!speaking && isPlaying) {
        setIsPlaying(false);
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [isPlaying]);
  
  useEffect(() => {
    return () => {
      if (isPlaying) {
        stop();
      }
    };
  }, [isPlaying]);
  
  const handleClick = () => {
    if (isPlaying) {
      stop();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      speak(text, {
        onStart: () => {
          setIsLoading(false);
          setIsPlaying(true);
        },
        onEnd: () => {
          setIsPlaying(false);
        },
        onError: () => {
          setIsLoading(false);
          setIsPlaying(false);
        }
      });
      
      setTimeout(() => {
        setIsLoading(false);
        if (getIsSpeaking()) {
          setIsPlaying(true);
        }
      }, 500);
    }
  };
  
  if (!supported) {
    return null;
  }
  
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-2.5',
  };
  
  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };
  
  return (
    <IconButton
      onClick={handleClick}
      disabled={isLoading}
      size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
      variant={isPlaying ? 'primary' : 'ghost'}
      className={className}
      aria-label={isPlaying ? 'Stop listening' : 'Listen to answer'}
      icon={isLoading ? (
        <Loader2 className={`${iconSizes[size]} animate-spin`} />
      ) : isPlaying ? (
        <VolumeX className={iconSizes[size]} />
      ) : (
        <Volume2 className={iconSizes[size]} />
      )}
    />
  );
}
