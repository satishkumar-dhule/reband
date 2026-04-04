/**
 * Gen Z Sidebar - Pure Black, Neon Accents
 * Minimal, modern, addictive
 */

import { useLocation } from 'wouter';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Home, BookOpen, Award, Mic, Code, Target,
  BarChart2, Bookmark, Flame, Brain
} from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', path: '/', section: 'main' },
  { icon: BookOpen, label: 'Channels', path: '/channels', section: 'learn' },
  { icon: Award, label: 'Certifications', path: '/certifications', section: 'learn' },
  { icon: Brain, label: 'My Path', path: '/my-path', section: 'learn' },
  { icon: Mic, label: 'Voice', path: '/voice-interview', section: 'practice' },
  { icon: Code, label: 'Coding', path: '/coding', section: 'practice' },
  { icon: Target, label: 'Tests', path: '/tests', section: 'practice' },
  { icon: Flame, label: 'Review', path: '/review', section: 'practice' },
  { icon: BarChart2, label: 'Stats', path: '/stats', section: 'progress' },
  { icon: Bookmark, label: 'Saved', path: '/bookmarks', section: 'progress' },
];

export function GenZSidebar() {
  const [location, setLocation] = useLocation();
  const prefersReducedMotion = useReducedMotion();

  const handleNavKeyDown = (e: React.KeyboardEvent, path: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setLocation(path);
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-background border-r border-border flex flex-col z-50 hidden lg:flex">
      {/* Logo */}
      <button
        onClick={() => setLocation('/')}
        onKeyDown={(e) => handleNavKeyDown(e, '/')}
        aria-label="Go to home"
        className="p-6 border-b border-border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-cyan-500 rounded-[12px] flex items-center justify-center">
            <Brain className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-black text-lg text-foreground">CodeReels</div>
            <div className="text-xs text-muted-foreground">Interview Prep</div>
          </div>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Home */}
        {navItems.filter(item => item.section === 'main').map((item) => {
          const isActive = item.path === "/" ? location === "/" : location.startsWith(item.path);
          const Icon = item.icon;
          return (
            <motion.button
              key={item.path}
              whileHover={prefersReducedMotion ? undefined : { x: 4 }}
              whileTap={prefersReducedMotion ? undefined : {}}
              onClick={() => setLocation(item.path)}
              onKeyDown={(e) => handleNavKeyDown(e, item.path)}
              tabIndex={0}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                isActive
                  ? 'bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
              <span className="font-semibold">{item.label}</span>
            </motion.button>
          );
        })}

        {/* Learn Section */}
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase mb-2 px-2">Learn</div>
          <div className="space-y-1">
            {navItems.filter(item => item.section === 'learn').map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.path}
                  whileHover={prefersReducedMotion ? undefined : { x: 4 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  onClick={() => setLocation(item.path)}
                  onKeyDown={(e) => handleNavKeyDown(e, item.path)}
                  tabIndex={0}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 text-foreground'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span className="font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Practice Section */}
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase mb-2 px-2">Practice</div>
          <div className="space-y-1">
            {navItems.filter(item => item.section === 'practice').map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.path}
                  whileHover={prefersReducedMotion ? undefined : { x: 4 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  onClick={() => setLocation(item.path)}
                  onKeyDown={(e) => handleNavKeyDown(e, item.path)}
                  tabIndex={0}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 text-foreground'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span className="font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Progress Section */}
        <div>
          <div className="text-xs font-bold text-muted-foreground uppercase mb-2 px-2">Progress</div>
          <div className="space-y-1">
            {navItems.filter(item => item.section === 'progress').map((item) => {
              const isActive = location === item.path;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.path}
                  whileHover={prefersReducedMotion ? undefined : { x: 4 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  onClick={() => setLocation(item.path)}
                  onKeyDown={(e) => handleNavKeyDown(e, item.path)}
                  tabIndex={0}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-cyan-500/20 border border-primary/30 text-foreground'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={2} />
                  <span className="font-semibold">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}
