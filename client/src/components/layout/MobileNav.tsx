import { useState } from "react";
import { useLocation } from "wouter";
import { Home, BookOpen, Bookmark, BarChart2, Mic, Sparkles, Bot, Plus } from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "Channels", path: "/channels" },
  { icon: Mic, label: "Voice", path: "/voice-interview", highlight: true },
  { icon: BarChart2, label: "Stats", path: "/stats" },
  { icon: Bookmark, label: "Saved", path: "/bookmarks" },
];

export function MobileNav() {
  const [location, setLocation] = useLocation();
  const [showAgentPopup, setShowAgentPopup] = useState(false);

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-2xl border-t border-white/10 shadow-2xl shadow-black/10" />
        
        {/* Gradient accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        
        <div className="relative flex items-stretch justify-around h-18 px-2 py-2">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            const isHighlight = item.highlight;
            
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={cn(
                  "relative flex flex-col items-center justify-center flex-1 gap-0.5 py-1 transition-all duration-300",
                  active ? "text-primary" : "text-muted-foreground"
                )}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Active indicator bar */}
                {active && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-0.5 bg-gradient-to-r from-primary to-emerald-500 rounded-full shadow-lg shadow-primary/50" />
                )}
                
                {/* Icon container */}
                <div className={cn(
                  "relative p-2 rounded-2xl transition-all duration-300",
                  active 
                    ? "bg-gradient-to-br from-primary/20 to-emerald-500/10 shadow-lg shadow-primary/20" 
                    : isHighlight 
                      ? "bg-gradient-to-br from-primary to-emerald-500 shadow-lg shadow-primary/30 -mt-2"
                      : "hover:bg-muted/50"
                )}>
                  {isHighlight && !active ? (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
                      <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                  ) : (
                    <Icon
                      className={cn(
                        "w-5 h-5 transition-all duration-300",
                        active ? "text-primary drop-shadow-sm" : "",
                        isHighlight && "text-white"
                      )}
                      strokeWidth={active ? 2.5 : 1.8}
                    />
                  )}
                  
                  {/* Glow effect for active */}
                  {active && (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-emerald-500/20 rounded-2xl blur-md -z-10" />
                  )}
                </div>
                
                <span className={cn(
                  "text-[10px] font-semibold transition-all duration-300",
                  active ? "text-primary" : isHighlight ? "text-primary -mt-1" : ""
                )}>
                  {item.label}
                </span>
                
                {/* Active dot indicator */}
                {active && (
                  <span className="absolute bottom-0 w-1 h-1 rounded-full bg-primary animate-pulse shadow-lg shadow-primary" />
                )}
              </button>
            );
          })}
        </div>
        
        {/* Floating Agent Indicator */}
        <button 
          onClick={() => setShowAgentPopup(!showAgentPopup)}
          className="absolute -top-5 left-1/2 -translate-x-1/2 z-10 group"
        >
          <div className="relative flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary/90 to-emerald-500/90 backdrop-blur-xl rounded-full border border-white/20 shadow-lg shadow-primary/30 transition-all duration-300 group-hover:scale-105">
            {/* Animated ring */}
            <div className="absolute inset-0 rounded-full bg-primary/50 animate-ping" />
            
            <div className="relative flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-white animate-pulse" />
              <span className="text-[10px] font-bold text-white">30</span>
              <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
            </div>
            
            {/* PRO badge */}
            <span className="px-1.5 py-0.5 text-[8px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-full">
              PRO
            </span>
          </div>
        </button>
        
        {/* Agent Popup */}
        {showAgentPopup && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3 bg-card/95 backdrop-blur-2xl rounded-2xl border border-border/50 shadow-2xl animate-in slide-in-from-bottom-2 fade-in duration-200">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Active Agents</span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-black rounded-full">
                30
              </span>
            </div>
            <div className="flex gap-2">
              {['UI/UX', 'DB', 'Google', 'DevOps', 'AI/ML'].map((cat, i) => (
                <div 
                  key={cat}
                  className={cn(
                    "flex flex-col items-center gap-0.5 p-2 rounded-lg bg-muted/50 text-[9px] font-medium",
                    "hover:bg-primary/10 cursor-pointer transition-colors"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    ["bg-purple-500", "bg-blue-500", "bg-pink-500", "bg-amber-500", "bg-emerald-500"][i]
                  )} />
                  {cat}
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>
      
      {/* Spacer for fixed bottom nav */}
      <div className="h-20 lg:hidden" />
    </>
  );
}
