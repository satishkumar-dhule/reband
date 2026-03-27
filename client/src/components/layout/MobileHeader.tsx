import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Brain, Sparkles, Bot, Bell, Search, Menu } from "lucide-react";
import { cn } from "../../lib/utils";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onSearchClick?: () => void;
  transparent?: boolean;
  showSearch?: boolean;
}

export function MobileHeader({
  title,
  showBack,
}: MobileHeaderProps) {
  const [location, setLocation] = useLocation();
  const [agentCount, setAgentCount] = useState(30);

  if (showBack) {
    return (
      <header className="sticky top-0 z-40 lg:hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl" />
        
        {/* Gradient accent lines */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
        
        <div className="relative flex items-center h-14 px-4 gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-2.5 -ml-2 hover:bg-primary/10 rounded-xl transition-all duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 text-foreground group-hover:text-primary transition-colors group-hover:scale-110" />
          </button>
          
          {title && (
            <h1 className="text-base font-semibold text-foreground truncate flex-1">{title}</h1>
          )}
          
          {/* Animated Agent Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-primary/15 via-primary/10 to-emerald-500/15 border border-primary/20 backdrop-blur-sm">
            <div className="relative">
              <Bot className="w-3.5 h-3.5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>
            <span className="text-[11px] font-bold text-primary tabular-nums">{agentCount}</span>
          </div>
          
          {/* Notification bell */}
          <button className="p-2 hover:bg-primary/10 rounded-xl transition-colors relative">
            <Bell className="w-4.5 h-4.5 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 lg:hidden">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl" />
      
      {/* Gradient accent lines */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-primary/20 via-primary/5 to-transparent" />
      
      <div className="relative flex items-center justify-between h-14 px-4">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2.5 group"
        >
          {/* Logo with glow */}
          <div className="relative">
            <div className="w-9 h-9 bg-gradient-to-br from-primary via-emerald-500 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
              <Brain className="w-4.5 h-4.5 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          </div>
          
          <div>
            <span className="font-bold text-sm text-foreground flex items-center gap-1.5">
              DevPrep Ultra
              <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black rounded-lg flex items-center gap-0.5 shadow-lg shadow-amber-500/20">
                <Sparkles className="w-2 h-2" />
                PRO MAX
              </span>
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1">
          {/* Search button */}
          <button className="p-2.5 hover:bg-primary/10 rounded-xl transition-all duration-200 group">
            <Search className="w-4.5 h-4.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </button>
          
          {/* Agent Badge - Enhanced */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-primary/15 to-emerald-500/15 border border-primary/20 backdrop-blur-sm">
            <div className="relative flex items-center">
              <Bot className="w-3.5 h-3.5 text-primary animate-pulse" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-ping" />
            </div>
            <span className="text-[11px] font-bold text-primary tabular-nums">{agentCount}</span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
          
          {/* Menu button */}
          <button className="p-2.5 hover:bg-primary/10 rounded-xl transition-colors">
            <Menu className="w-4.5 h-4.5 text-muted-foreground" />
          </button>
        </div>
      </div>
      
      {/* Animated status bar */}
      <div className="relative h-0.5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10" />
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          <span 
            className="w-8 h-0.5 bg-gradient-to-r from-primary to-emerald-500 rounded-full animate-pulse" 
            style={{ opacity: 0.6 }}
          />
          <span 
            className="w-12 h-0.5 bg-gradient-to-r from-primary via-emerald-500 to-accent rounded-full animate-pulse" 
            style={{ opacity: 0.8, animationDelay: '0.2s' }}
          />
          <span 
            className="w-6 h-0.5 bg-gradient-to-r from-emerald-500 to-accent rounded-full animate-pulse" 
            style={{ opacity: 0.5, animationDelay: '0.4s' }}
          />
        </div>
      </div>
    </header>
  );
}
