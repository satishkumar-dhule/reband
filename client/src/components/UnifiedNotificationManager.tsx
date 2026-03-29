import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  duration?: number;
  createdAt: string;
}

interface UnifiedNotificationsContextType {
  notifications: Notification[];
  showToast: (title: string, description?: string, variant?: 'default' | 'destructive' | 'success' | 'warning') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const UnifiedNotificationsContext = createContext<UnifiedNotificationsContextType | null>(null);

export function UnifiedNotificationManager({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showToast = useCallback((title: string, description?: string, variant: 'default' | 'destructive' | 'success' | 'warning' = 'default') => {
    const type = variant === 'destructive' ? 'error' : variant === 'success' ? 'success' : variant === 'warning' ? 'warning' : 'info';
    const newNotification: Notification = {
      id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      type,
      title,
      message: description || '',
      createdAt: new Date().toISOString(),
      duration: 5000,
    };
    setNotifications(prev => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss after duration (default 5 seconds)
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
      }, duration);
    }
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <UnifiedNotificationsContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
      {children}
    </UnifiedNotificationsContext.Provider>
  );
}

export function useUnifiedNotifications() {
  const context = useContext(UnifiedNotificationsContext);
  if (!context) {
    throw new Error('useUnifiedNotifications must be used within UnifiedNotificationManager');
  }
  return context;
}
