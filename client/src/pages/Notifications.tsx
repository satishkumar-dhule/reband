/**
 * Notifications Page
 * Shows all past toast notifications
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import {
  Bell, Check, Trash2, CheckCheck, Info, AlertCircle, 
  CheckCircle, AlertTriangle, X
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: string;
  read: boolean;
  link?: string;
}

const STORAGE_KEY = 'app-notifications';

const typeIcons = {
  success: <CheckCircle className="w-5 h-5 text-[var(--gh-success-fg)]" />,
  error: <AlertCircle className="w-5 h-5 text-[var(--gh-danger-fg)]" />,
  info: <Info className="w-5 h-5 text-[var(--gh-accent-fg)]" />,
  warning: <AlertTriangle className="w-5 h-5 text-[var(--gh-attention-fg)]" />,
};

const typeColors = {
  success: 'bg-[var(--gh-success-subtle)] border-[var(--gh-success-emphasis)]/20',
  error: 'bg-[var(--gh-danger-subtle)] border-[var(--gh-danger-emphasis)]/20',
  info: 'bg-[var(--gh-accent-subtle)] border-[var(--gh-accent-emphasis)]/20',
  warning: 'bg-[var(--gh-attention-subtle)] border-[var(--gh-attention-emphasis)]/20',
};

export default function Notifications() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        setNotifications(stored ? JSON.parse(stored) : []);
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();

    // Listen for new notifications
    const handleNewNotification = () => loadNotifications();
    window.addEventListener('notification-added', handleNewNotification);
    return () => window.removeEventListener('notification-added', handleNewNotification);
  }, []);

  // Save notifications
  const saveNotifications = (updated: Notification[]) => {
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleNotificationClick = (notification: Notification) => {
    setNotifications(prev => {
      const updated = prev.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    
    if (notification.link) {
      setLocation(notification.link);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAll = () => {
    saveNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <SEOHead
        title="Notifications - Code Reels"
        description="View your notifications and alerts"
      />
      
      <AppLayout title="Notifications" showBackOnMobile>
        <div className="max-w-4xl mx-auto pb-8">
          {/* Header Actions */}
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-4"
            >
              <div className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </div>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
                </button>
              </div>
            </motion.div>
          )}

          {/* Notifications List */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {notifications.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-center min-h-[40vh] bg-card rounded-2xl border border-border"
                >
                  <div className="text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <Bell className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">No notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      You're all caught up! Notifications will appear here.
                    </p>
                  </div>
                </motion.div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-card rounded-xl border overflow-hidden ${
                      notification.read ? 'border-border' : typeColors[notification.type]
                    } ${notification.link ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
                  >
                    <div 
                      className="flex items-start gap-3 p-4"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {typeIcons[notification.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={`font-medium text-sm ${notification.read ? 'text-muted-foreground' : ''}`}>
                            {notification.title}
                          </h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNotification(notification.id);
                            }}
                            className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                        {notification.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-muted-foreground">
                            {formatTime(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                          {notification.link && (
                            <span className="text-[10px] text-primary">Tap to view →</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
