/**
 * Unified Navigation Component
 * Design System: Gen Z Dark Theme with Neon Green Accents
 * Uses glassmorphism, glow effects, and consistent theming
 * 
 * Navigation Structure:
 * - Home: Dashboard
 * - Learn: Browse content (Channels, Certifications, My Path)
 * - Practice: Active learning (Voice, Tests, Coding, Review)
 * - Progress: Track achievements (Stats, Badges, Bookmarks, Profile)
 */

import { useLocation } from 'wouter';
import { useState, useMemo, memo, useCallback, useEffect, useRef } from 'react';
import {
  Home,
  GraduationCap,
  Mic,
  BarChart3,
  Code,
  Coins,
  ChevronRight,
  ChevronLeft,
  Target,
  Flame,
  Award,
  BookOpen,
  Bookmark,
  Trophy,
  Search,
  User,
  Info,
  Brain
} from 'lucide-react';
import { useCredits } from '../../context/CreditsContext';
import { useSidebar } from '../../context/SidebarContext';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { cn } from '../../lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { prefetchRoute } from '../../lib/prefetch';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  highlight?: boolean;
  badge?: string;
  description?: string;
}

// Main navigation - 5 core sections (MOBILE-FIRST)
const mainNavItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'paths', label: 'Paths', icon: Brain, path: '/learning-paths', description: 'Learning paths' },
  { id: 'practice', label: 'Practice', icon: Mic, path: '/voice-interview', highlight: true, description: 'Practice modes' },
  { id: 'learn', label: 'Learn', icon: GraduationCap, path: '/channels', description: 'Topics & certs' },
  { id: 'progress', label: 'Progress', icon: BarChart3, path: '/stats', description: 'Your stats' },
];

// Learn section - Browse learning content
const learnSubNav: NavItem[] = [
  { id: 'channels', label: 'Channels', icon: BookOpen, path: '/channels', description: 'Browse by topic' },
  { id: 'certifications', label: 'Certifications', icon: Award, path: '/certifications', description: 'Exam prep' },
  { id: 'my-path', label: 'My Path', icon: Brain, path: '/my-path', badge: 'NEW', description: 'Your learning journey' },
];

// Practice section - Active learning modes
const practiceSubNav: NavItem[] = [
  { id: 'voice', label: 'Voice Interview', icon: Mic, path: '/voice-interview', badge: '+10', description: 'AI mock interviews' },
  { id: 'tests', label: 'Quick Tests', icon: Target, path: '/tests', description: 'Timed challenges' },
  { id: 'coding', label: 'Coding', icon: Code, path: '/coding', description: 'Code challenges' },
  { id: 'review', label: 'SRS Review', icon: Flame, path: '/review', description: 'Spaced repetition' },
];

// Progress section - Track achievements
const progressSubNav: NavItem[] = [
  { id: 'stats', label: 'Statistics', icon: BarChart3, path: '/stats', description: 'Your progress' },
  { id: 'badges', label: 'Badges', icon: Trophy, path: '/badges', description: 'Achievements' },
  { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, path: '/bookmarks', description: 'Saved questions' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile', description: 'Settings & credits' },
  { id: 'about', label: 'About', icon: Info, path: '/about', description: 'About Open-Interview' },
];

function getActiveSection(location: string): string {
  if (location === '/') return 'home';
  if (location === '/learning-paths' || location.startsWith('/learning-paths/')) return 'paths';
  if (location === '/channels' || location.startsWith('/channel/') || location === '/certifications' || location.startsWith('/certification/') || location === '/my-path') return 'learn';
  if (location.startsWith('/voice') || location.startsWith('/test') || location.startsWith('/coding') || location === '/review') return 'practice';
  if (location === '/stats' || location === '/badges' || location === '/bookmarks' || location === '/profile') return 'progress';
  if (location === '/bot-activity') return 'bots';
  return 'home';
}

// ============================================
// MOBILE BOTTOM NAVIGATION - Gen Z Edition
// Pure Black, Neon Accents, Glassmorphism
// ============================================

export function MobileBottomNav() {
  const [location, setLocation] = useLocation();
  const { balance, formatCredits } = useCredits();
  const { preferences } = useUserPreferences();
  const [showMenu, setShowMenu] = useState<string | null>(null);
  
  // Check for reduced motion preference using media query
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const activeSection = getActiveSection(location);

  const handleNavClick = (item: NavItem) => {
    // Paths goes directly to learning paths page (no submenu)
    if (item.id === 'paths') {
      setShowMenu(null);
      setLocation(item.path);
    } else if (item.id === 'practice' || item.id === 'learn' || item.id === 'progress') {
      setShowMenu(showMenu === item.id ? null : item.id);
    } else {
      setShowMenu(null);
      setLocation(item.path);
    }
  };

  const getSubNav = (id: string) => {
    let items: NavItem[] = [];
    switch (id) {
      case 'learn': 
        items = learnSubNav;
        break;
      case 'practice': 
        items = practiceSubNav;
        break;
      case 'progress': 
        items = progressSubNav;
        break;
      default: 
        return [];
    }
    
    if (preferences.hideCertifications && id === 'learn') {
      return items.filter(item => item.id !== 'certifications');
    }
    
    return items;
  };

  const currentSubNav = showMenu ? getSubNav(showMenu) : [];

  return (
    <>
      <style>{`@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }`}</style>
      {/* Backdrop Overlay - CSS-only animation */}
      {showMenu && (
        <div
          className={`fixed inset-0 z-[65] bg-background/80 backdrop-blur-md lg:hidden ${prefersReducedMotion ? '' : 'animate-fade-in'}`}
          style={{ animationDuration: prefersReducedMotion ? '0ms' : '200ms' }}
          onClick={() => setShowMenu(null)}
        />
      )}

      {/* Full-screen Submenu with Premium UX - CSS-only animation */}
      {showMenu && currentSubNav.length > 0 && (
        <div
          className={`fixed inset-x-0 bottom-0 z-[70] glass-card border-t border-border rounded-t-[32px] shadow-2xl overflow-hidden lg:hidden max-h-[80vh] flex flex-col ${prefersReducedMotion ? '' : 'animate-slide-up'}`}
          style={{ 
            background: 'var(--gh-canvas-overlay)',
            animationDuration: prefersReducedMotion ? '0ms' : '300ms',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {/* Drag Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-foreground">
                  {showMenu === 'learn' ? 'Learn' : showMenu === 'practice' ? 'Practice' : 'Progress'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {showMenu === 'learn' ? 'Browse topics and certifications' : 
                   showMenu === 'practice' ? 'Choose your practice mode' : 
                   'Track your progress'}
                </p>
              </div>
              <button
                onClick={() => setShowMenu(null)}
                aria-label="Close submenu"
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors touch-manipulation"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Menu Items - Single Column for Better Touch Targets */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-28 pb-safe">
            {currentSubNav.map((item, index) => {
              const Icon = item.icon;
              const isActive = location === item.path || location.startsWith(item.path + '/');
              const isVoice = item.id === 'voice';
              
              return (
                <button
                  key={item.id}
                  onTouchStart={() => prefetchRoute(item.path)}
                  onMouseEnter={() => prefetchRoute(item.path)}
                  onClick={() => {
                    setLocation(item.path);
                    setShowMenu(null);
                  }}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-[20px] transition-all relative overflow-hidden min-h-[56px] touch-manipulation",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    isActive 
                      ? "bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30" 
                      : "bg-muted/50 hover:bg-muted border-2 border-transparent",
                    isVoice && !isActive && "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/10"
                  )}
                  style={{
                    animationDelay: prefersReducedMotion ? '0ms' : `${index * 50}ms`
                  }}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Icon - Glow effect for active state */}
                  <div className={cn(
                    "w-14 h-14 rounded-[16px] flex items-center justify-center flex-shrink-0 transition-all",
                    isActive 
                      ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/30" 
                      : isVoice 
                        ? "bg-gradient-to-br from-primary/20 to-primary/10"
                        : "bg-background"
                  )}>
                    <Icon className={cn(
                      "w-7 h-7",
                      isActive ? "text-primary-foreground" : "text-foreground"
                    )} strokeWidth={2} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "text-base font-bold",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full",
                          item.badge === 'NEW' 
                            ? "bg-emerald-500/20 text-emerald-400" 
                            : "bg-amber-500/20 text-amber-400"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <ChevronRight className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar - Premium Glassmorphism */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden pb-safe">
        <div className="glass-card border-t border-border shadow-2xl" style={{ 
          background: 'var(--gh-canvas-overlay)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)'
        }}>
          {/* Active Indicator - CSS custom properties for position */}
          <div 
            className="h-1 rounded-full transition-all duration-200 ease-out"
            style={{ 
              background: 'var(--gh-success-fg)',
              boxShadow: '0 0 20px var(--gh-success-fg)',
              width: 'calc(100% / 5 - 16px)',
              marginLeft: `calc(${(mainNavItems.findIndex(i => activeSection === i.id) || 0)} * (100% / 5))`,
              transform: `translateX(${((mainNavItems.findIndex(i => activeSection === i.id) || 0) - 1) * 4}px)`,
              maxWidth: '48px',
              marginRight: 'auto'
            }}
          />
          <div className="flex items-center justify-around h-[60px] px-1 max-w-md mx-auto">
            {mainNavItems.map((item) => {
              const isActive = activeSection === item.id;
              const hasSubmenu = item.id === 'practice' || item.id === 'learn' || item.id === 'progress';
              const isMenuOpen = showMenu === item.id;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item)}
                  onTouchStart={() => !hasSubmenu && prefetchRoute(item.path)}
                  onMouseEnter={() => !hasSubmenu && prefetchRoute(item.path)}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all touch-manipulation pt-1",
                    isActive || isMenuOpen ? "text-primary" : "text-muted-foreground"
                  )}
                  aria-label={item.label}
                  type="button"
                >
                  {/* Active Indicator - CSS-only transition */}
                  <div
                    className={cn(
                      "absolute top-0 w-8 h-0.5 rounded-full transition-opacity duration-200",
                      (isActive || isMenuOpen) ? "opacity-100" : "opacity-0"
                    )}
                    style={{ 
                      background: 'var(--gh-success-fg)',
                      boxShadow: '0 0 12px var(--gh-success-fg)'
                    }}
                  />
                    
                  {/* Icon Container - CSS scale transform instead of framer-motion */}
                  <div
                    className={cn(
                      "w-9 h-9 rounded-[12px] flex items-center justify-center transition-transform",
                      item.highlight
                        ? isActive || isMenuOpen
                          ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/50" 
                          : "bg-gradient-to-br from-primary/20 to-primary/10"
                        : isActive || isMenuOpen 
                          ? "bg-primary/15" 
                          : "bg-transparent"
                    )}
                    style={{ transform: prefersReducedMotion ? 'none' : undefined }}
                  >
                    <Icon className={cn(
                      "w-5 h-5",
                      item.highlight && (isActive || isMenuOpen) ? "text-primary-foreground" : ""
                    )} strokeWidth={2.5} />
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "text-[10px] font-medium leading-none mt-0.5",
                    isActive || isMenuOpen ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}


// ============================================
// NAV ITEM COMPONENT - Memoized for performance
// ============================================

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

const NavItemComponent = memo(function NavItem({ item, isActive, isCollapsed }: NavItemProps) {
  const [, setLocation] = useLocation();
  const Icon = item.icon;
  const isVoice = item.id === 'voice';
  
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLocation(item.path);
    }
  }, [item.path, setLocation]);

  const handleClick = useCallback(() => {
    setLocation(item.path);
  }, [item.path, setLocation]);
  
  const button = (
    <button
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ease-out group overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
        isCollapsed && "justify-center px-2",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground hover:text-foreground"
      )}
      style={isActive ? {
        background: 'hsl(150 100% 50% / 0.1)',
        border: '1px solid hsl(150 100% 50% / 0.15)'
      } : {
        background: 'transparent'
      }}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-all duration-200 ease-out",
        isActive 
          ? "text-primary-foreground" 
          : isVoice
            ? "text-primary"
            : "text-muted-foreground group-hover:text-foreground",
        !isActive && !isVoice && "group-hover:bg-muted/50"
      )}
      style={isActive ? {
        background: 'hsl(150 100% 50%)',
        boxShadow: '0 0 12px hsl(150 100% 50% / 0.3)'
      } : isVoice ? {
        background: 'hsl(150 100% 50% / 0.15)'
      } : {
        background: 'transparent'
      }}>
        <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
      </div>
      
      {(!isCollapsed) && (
        <>
          <span className="text-sm font-medium flex-1 text-left">
            {item.label}
          </span>
          {item.badge && (
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0",
              item.badge === 'NEW' 
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/20 text-amber-400"
            )}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </button>
  );
  
  // Use Radix Tooltip when collapsed for keyboard accessibility and collision detection
  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          align="center"
          className="gap-1.5 flex items-center"
          style={{ 
            background: 'hsl(0 0% 8% / 0.95)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid hsl(0 0% 15%)'
          }}
        >
          <span className="text-sm font-medium">{item.label}</span>
          {item.badge && (
            <span className={cn(
              "text-[10px] px-1.5 py-0.5 rounded font-medium",
              item.badge === 'NEW' 
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/20 text-amber-400"
            )}>
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }
  
  return <div className="relative">{button}</div>;
});

// ============================================
// DESKTOP SIDEBAR - Collapsible Premium Design
// ============================================

interface DesktopSidebarProps {
  onSearchClick: () => void;
}

export function DesktopSidebar({ onSearchClick }: DesktopSidebarProps) {
  const [location, setLocation] = useLocation();
  const { balance, formatCredits } = useCredits();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const { preferences } = useUserPreferences();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActive = (path: string) => 
    location === path || location.startsWith(path.replace(/\/$/, '') + '/');
  
  // Filter learn items based on preferences
  const filteredLearnSubNav = preferences.hideCertifications 
    ? learnSubNav.filter(item => item.id !== 'certifications')
    : learnSubNav;

  // Memoize active state check to avoid recalculation on every render
  const getIsActive = useCallback((path: string) => 
    location === path || location.startsWith(path.replace(/\/$/, '') + '/'),
    [location]
  );

  const SectionHeader = ({ icon: Icon, label }: { icon: React.ElementType; label: string }) => {
    if (isCollapsed) return <div className="h-px my-3 mx-2" style={{ background: 'hsl(0 0% 15% / 0.5)' }} />;
    
    return (
      <div 
        className="flex items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: 'hsl(0 0% 45%)' }}
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{label}</span>
      </div>
    );
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 z-40 flex flex-col transition-[width] duration-300 ease-out overflow-hidden",
      isCollapsed ? "w-16" : "w-64"
    )}
    style={{ 
      background: 'hsl(0 0% 6% / 0.95)',
      backdropFilter: 'blur(24px) saturate(200%)',
      WebkitBackdropFilter: 'blur(24px) saturate(200%)',
      borderRight: '1px solid hsl(0 0% 12%)'
    }}>
      {/* Header with Logo and Collapse Toggle */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-border">
        <button
          onClick={() => setLocation('/')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setLocation('/');
            }
          }}
          aria-label="Go to home"
          className={cn(
            "flex items-center gap-2.5",
            isCollapsed && "justify-center w-full",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar rounded-lg"
          )}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shrink-0 shadow-lg" style={{ boxShadow: '0 0 20px hsl(150 100% 50% / 0.3)' }}>
            <Mic className="w-4 h-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="text-left">
              <div className="font-semibold text-sm leading-tight">Open-Interview</div>
              <div className="text-[10px] text-muted-foreground">Interview Prep</div>
            </div>
          )}
        </button>
        
        {!isCollapsed && (
          <button
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="px-2 py-2">
          <button
            onClick={toggleSidebar}
            aria-label="Expand sidebar"
            className="w-full p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar flex items-center justify-center"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search */}
      <div className={cn("px-2 py-2", isCollapsed && "px-1")}>
        <button
          onClick={onSearchClick}
          aria-label="Search"
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors overflow-hidden",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            isCollapsed && "justify-center px-2"
          )}
          style={{
            background: 'hsl(0 0% 10% / 0.5)',
            border: '1px solid hsl(0 0% 12%)'
          }}
        >
          <Search className="w-4 h-4 shrink-0" />
          {!isCollapsed && (
            <>
              <span className="text-sm flex-1 text-left truncate">Search</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0" style={{ 
                background: 'hsl(0 0% 8%)',
                border: '1px solid hsl(0 0% 15%)'
              }}>⌘K</kbd>
            </>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden px-2 py-1 custom-scrollbar",
        isCollapsed && "px-1"
      )}>
        {/* Home */}
        <NavItemComponent item={{ id: 'home', label: 'Home', icon: Home, path: '/' }} isActive={getIsActive('/')} isCollapsed={isCollapsed} />
        
        {/* Learn Section */}
        <SectionHeader icon={GraduationCap} label="Learn" />
        {filteredLearnSubNav.map(item => <NavItemComponent key={item.id} item={item} isActive={getIsActive(item.path)} isCollapsed={isCollapsed} />)}
        
        {/* Practice Section */}
        <SectionHeader icon={Mic} label="Practice" />
        {practiceSubNav.map(item => <NavItemComponent key={item.id} item={item} isActive={getIsActive(item.path)} isCollapsed={isCollapsed} />)}
        
        {/* Progress Section */}
        <SectionHeader icon={BarChart3} label="Progress" />
        {progressSubNav.map(item => <NavItemComponent key={item.id} item={item} isActive={getIsActive(item.path)} isCollapsed={isCollapsed} />)}
      </nav>

      {/* Credits Footer */}
      <div className={cn("p-2 border-t border-border", isCollapsed && "p-1")}>
        <button
          onClick={() => setLocation('/profile')}
          aria-label="View credits"
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors overflow-hidden",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
            isCollapsed && "justify-center px-1.5"
          )}
          style={{
            background: 'hsl(45 100% 50% / 0.1)',
            border: '1px solid hsl(45 100% 50% / 0.2)'
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <div className="text-[10px] text-muted-foreground">Credits</div>
              <div className="text-sm font-bold truncate" style={{ color: 'hsl(45 100% 60%)' }}>{formatCredits(balance)}</div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

// ============================================
// MOBILE HEADER - Gen Z Edition
// ============================================

interface UnifiedMobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onSearchClick: () => void;
}

export function UnifiedMobileHeader({ title, showBack, onSearchClick }: UnifiedMobileHeaderProps) {
  const [, setLocation] = useLocation();
  const { balance, formatCredits } = useCredits();

  return (
    <header 
      className="sticky top-0 z-40 lg:hidden pt-safe"
      style={{ 
        background: 'hsl(0 0% 6% / 0.95)',
        backdropFilter: 'blur(24px) saturate(200%)',
        WebkitBackdropFilter: 'blur(24px) saturate(200%)',
        borderBottom: '1px solid hsl(0 0% 12%)'
      }}
    >
      <div className="flex items-center justify-between h-14 px-3">
        {/* Left: Back or Logo */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack ? (
            <button
              onClick={() => window.history.back()}
              aria-label="Go back"
              className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-[12px] transition-colors touch-manipulation"
              style={{
                background: 'hsl(0 0% 10% / 0.5)',
                border: '1px solid hsl(0 0% 12%)'
              }}
              type="button"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" strokeWidth={2} />
            </button>
          ) : (
            <button onClick={() => setLocation('/')} aria-label="Go to home" className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-[10px] flex items-center justify-center shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(150 100% 50%) 0%, hsl(150 100% 40%))',
                  boxShadow: '0 0 20px hsl(150 100% 50% / 0.3)'
                }}
              >
                <Brain className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <div>
                <span className="font-black text-sm text-foreground">Open-Interview</span>
                {!title && <div className="text-[10px] text-muted-foreground">Interview Prep</div>}
              </div>
            </button>
          )}
          
          {title && (
            <h1 className="font-bold text-sm text-foreground truncate ml-2">{title}</h1>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Credits - Gold Pill */}
          <button
            onClick={() => setLocation('/profile')}
            aria-label="View credits"
            className="flex items-center gap-1 px-2 py-1.5 rounded-[10px] transition-colors min-h-[36px] touch-manipulation"
style={{
               background: 'var(--gh-attention-emphasis) / 0.15',
               border: '1px solid hsl(45 100% 50% / 0.25)'
             }}
            type="button"
          >
            <Coins className="w-3.5 h-3.5" strokeWidth={2.5} style={{ color: 'hsl(45 100% 60%)' }} />
            <span className="text-xs font-bold" style={{ color: 'hsl(45 100% 60%)' }}>{formatCredits(balance)}</span>
          </button>

          {/* Search */}
          <button
            onClick={onSearchClick}
            aria-label="Search"
            className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-[12px] transition-colors touch-manipulation"
            style={{
              background: 'hsl(0 0% 10% / 0.5)',
              border: '1px solid hsl(0 0% 12%)'
            }}
            type="button"
          >
            <Search className="w-4 h-4 text-foreground" strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
