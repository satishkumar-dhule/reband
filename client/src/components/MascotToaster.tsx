/**
 * Mascot Toaster - Shows toast messages as speech bubbles from the 16-bit mascot
 * On desktop: Messages appear as dialogue bubbles from the mascot
 * On mobile: Falls back to standard toast notifications
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { X, CheckCircle, XCircle, MessageSquare, AlertTriangle, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/unified/Button';
import { IconButton } from '@/components/unified/Button';

interface MascotMessage {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
}

// Global event for mascot messages - use this to show messages from anywhere
export const showMascotMessage = (message: Omit<MascotMessage, 'id'>) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('mascot-message', { detail: message }));
  }
};

// Convenience functions for common message types
export const mascotSay = {
  success: (title: string, description?: string) => 
    showMascotMessage({ title, description, variant: 'success' }),
  error: (title: string, description?: string) => 
    showMascotMessage({ title, description, variant: 'destructive' }),
  warning: (title: string, description?: string) => 
    showMascotMessage({ title, description, variant: 'warning' }),
  info: (title: string, description?: string) => 
    showMascotMessage({ title, description, variant: 'default' }),
};

// Hook to use mascot messages instead of toasts on desktop
export function useMascotToast() {
  const { toast } = useToast();
  
  const mascotToast = useCallback((props: {
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => {
    // On desktop, show as mascot message
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      showMascotMessage({
        title: props.title,
        description: props.description,
        variant: props.variant === 'destructive' ? 'destructive' : 'default',
      });
    } else {
      // On mobile, use regular toast
      toast(props);
    }
  }, [toast]);
  
  return { toast: mascotToast };
}

// Get icon based on variant for mascot personality
function getMascotIcon(variant?: string) {
  switch (variant) {
    case 'success':
      return CheckCircle;
    case 'destructive':
      return XCircle;
    case 'warning':
      return AlertTriangle;
    default:
      return MessageSquare;
  }
}


// Desktop Mascot Message Bubble
function MascotBubble({ 
  message, 
  onDismiss,
  mascotPosition 
}: { 
  message: MascotMessage;
  onDismiss: () => void;
  mascotPosition: number;
}) {
  const Icon = getMascotIcon(message.variant);
  
  // Auto dismiss after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, message.duration || 4000);
    return () => clearTimeout(timer);
  }, [message.duration, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className="fixed bottom-20 z-[var(--z-toast)] max-w-xs"
      style={{ left: Math.max(16, Math.min(mascotPosition - 80, window.innerWidth - 280)) }}
    >
        {/* Speech bubble */}
      <div className={cn(
        "relative rounded-2xl p-3 shadow-xl border backdrop-blur-sm",
        message.variant === 'destructive' 
          ? "bg-[var(--gh-danger-bg)] border-[var(--gh-danger-border)]" 
          : message.variant === 'success'
          ? "bg-[var(--gh-success-bg)] border-[var(--gh-success-border)]"
          : message.variant === 'warning'
          ? "bg-[var(--gh-warning-bg)] border-[var(--gh-warning-border)]"
          : "bg-[var(--gh-canvas)] border-[var(--gh-border)]"
      )}>
        {/* Close button */}
        <IconButton
          icon={<X className="w-3 h-3" />}
          onClick={onDismiss}
          size="xs"
          variant="ghost"
          className="absolute top-1 right-1"
          aria-label="Dismiss"
        />
        
        {/* Content */}
        <div className="flex items-start gap-2 pr-4">
          <Icon className={cn(
            "w-5 h-5 flex-shrink-0",
            message.variant === 'destructive' ? "text-[var(--gh-danger-fg)]" :
            message.variant === 'success' ? "text-[var(--gh-success-fg)]" :
            message.variant === 'warning' ? "text-[var(--gh-attention-fg)]" :
            "text-[var(--gh-accent-fg)]"
          )} />
          <div className="min-w-0">
            {message.title && (
              <p className={cn(
                "font-semibold text-sm",
                message.variant === 'destructive' ? "text-[var(--gh-danger-fg)]" :
                message.variant === 'success' ? "text-[var(--gh-success-fg)]" :
                message.variant === 'warning' ? "text-[var(--gh-attention-fg)]" :
                "text-[var(--gh-fg)]"
              )}>
                {message.title}
              </p>
            )}
            {message.description && (
              <p className="text-xs text-[var(--gh-fg-muted)] mt-0.5 leading-relaxed">
                {message.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Speech bubble tail pointing to mascot */}
        <div 
          className={cn(
            "absolute -bottom-2 w-4 h-4 rotate-45",
            message.variant === 'destructive' ? "bg-[var(--gh-danger-bg)]" :
            message.variant === 'success' ? "bg-[var(--gh-success-bg)]" :
            message.variant === 'warning' ? "bg-[var(--gh-attention-bg)]" :
            "bg-[var(--gh-canvas)]"
          )}
          style={{ left: '50%', marginLeft: '-8px' }}
        />
      </div>
    </motion.div>
  );
}

// Main Mascot Toaster Component
export function MascotToaster() {
  const [messages, setMessages] = useState<MascotMessage[]>([]);
  const [mascotPosition, setMascotPosition] = useState(100);
  const { toasts, dismiss } = useToast();
  
  // Track mascot position
  useEffect(() => {
    const updatePosition = () => {
      const mascot = document.querySelector('[data-testid="pixel-mascot"]');
      if (mascot) {
        const rect = mascot.getBoundingClientRect();
        setMascotPosition(rect.left + rect.width / 2);
      }
    };
    
    updatePosition();
    const interval = setInterval(updatePosition, 500);
    return () => clearInterval(interval);
  }, []);
  
  // Listen for mascot messages
  useEffect(() => {
    const handleMessage = (e: CustomEvent<Omit<MascotMessage, 'id'>>) => {
      const newMessage: MascotMessage = {
        ...e.detail,
        id: `mascot-${Date.now()}-${Math.random()}`,
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Trigger mascot reaction
      if (e.detail.variant === 'success') {
        window.dispatchEvent(new CustomEvent('mascot-celebrate'));
      } else if (e.detail.variant === 'destructive') {
        window.dispatchEvent(new CustomEvent('mascot-sad'));
      }
    };
    
    window.addEventListener('mascot-message', handleMessage as EventListener);
    return () => window.removeEventListener('mascot-message', handleMessage as EventListener);
  }, []);
  
  // Convert regular toasts to mascot messages on desktop
  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 768) return;
    
    toasts.forEach(toast => {
      // Check if we already have this toast as a mascot message
      const exists = messages.some(m => m.id === `toast-${toast.id}`);
      if (!exists && toast.open) {
        const newMessage: MascotMessage = {
          id: `toast-${toast.id}`,
          title: toast.title as string,
          description: toast.description as string,
          variant: toast.variant as any,
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Dismiss the original toast since we're showing it as mascot message
        dismiss(toast.id);
        
        // Trigger mascot reaction
        if (toast.variant === 'destructive') {
          window.dispatchEvent(new CustomEvent('mascot-sad'));
        } else {
          window.dispatchEvent(new CustomEvent('mascot-celebrate'));
        }
      }
    });
  }, [toasts, messages, dismiss]);
  
  const dismissMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
  }, []);
  
  // Only show on desktop
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {messages.slice(-3).map((message, index) => (
        <MascotBubble
          key={message.id}
          message={message}
          onDismiss={() => dismissMessage(message.id)}
          mascotPosition={mascotPosition}
        />
      ))}
    </AnimatePresence>
  );
}

export default MascotToaster;
