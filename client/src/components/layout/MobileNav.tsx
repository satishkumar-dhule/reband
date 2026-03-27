import { useState } from "react";
import { useLocation } from "wouter";
import { Home, BookOpen, Bookmark, BarChart2, Mic } from "lucide-react";
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
  const [activeIndex, setActiveIndex] = useState(0);

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  const getActiveIndex = () => {
    const index = navItems.findIndex(item => isActive(item.path));
    return index >= 0 ? index : 0;
  };

  const currentActiveIndex = getActiveIndex();

  return (
    <>
      <style>{`@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }`}</style>
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="relative mx-3 mb-2">
          <div className="absolute inset-0 glass-card-strong rounded-3xl" />
          
          <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent" />
          
          <div className="absolute top-2 bottom-2 transition-all duration-300 ease-out">
            <div 
              className="absolute top-0 h-full w-[72px] bg-gradient-to-b from-cyan-500/20 via-purple-500/10 to-transparent rounded-2xl transition-all duration-300 ease-out"
              style={{
                transform: `translateX(calc(${currentActiveIndex} * (100% + 8px) + 8px - 36px))`,
              }}
            />
            <div 
              className="absolute top-1 bottom-1 w-[68px] bg-gradient-to-br from-cyan-500/25 to-purple-500/15 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/20 transition-all duration-300 ease-out"
              style={{
                transform: `translateX(calc(${currentActiveIndex} * (100% + 8px) + 8px - 34px))`,
              }}
            />
            <div 
              className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-2xl opacity-30 blur-sm transition-all duration-300 ease-out animate-pulse"
              style={{
                transform: `translateX(calc(${currentActiveIndex} * (100% + 8px) + 8px - 36px))`,
              }}
            />
          </div>
          
          <div className="relative flex items-stretch justify-around h-16 px-1 py-1">
            {navItems.map((item, i) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const isHighlight = item.highlight;
              
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    setActiveIndex(i);
                    setLocation(item.path);
                  }}
                  aria-label={item.label}
                  className={cn(
                    "relative flex flex-col items-center justify-center flex-1 gap-0.5 py-1 transition-all duration-300 group",
                    active ? "text-cyan-400" : "text-muted-foreground/70 hover:text-muted-foreground"
                  )}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {active && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full shadow-lg shadow-cyan-400/60 animate-pulse" />
                  )}
                  
                  <div className={cn(
                    "relative p-2.5 rounded-2xl transition-all duration-300 group-hover:scale-105",
                    active 
                      ? "bg-gradient-to-br from-cyan-500/30 to-purple-500/20 shadow-lg shadow-cyan-500/25 border border-cyan-500/30" 
                      : isHighlight 
                        ? "bg-gradient-to-r from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/40 -mt-3"
                        : "bg-white/5 hover:bg-white/10 border border-white/5"
                  )}>
                    {active && (
                      <div className="absolute inset-0.5 bg-gradient-to-br from-white/20 to-transparent rounded-2xl" />
                    )}
                    
                    {isHighlight && !active ? (
                      <div className="relative w-11 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/40 border border-white/20">
                        <div className="absolute inset-0 rounded-xl bg-cyan-500/50 animate-ping" />
                        <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="relative">
                        <Icon
                          className={cn(
                            "w-5 h-5 transition-all duration-300",
                            active ? "text-cyan-400 drop-shadow-sm" : "",
                            isHighlight && "text-white"
                          )}
                          strokeWidth={active ? 2.5 : 1.8}
                        />
                        
                        {active && (
                          <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/40 to-purple-500/30 rounded-xl blur-md -z-10" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-[10px] font-semibold transition-all duration-300 tracking-wide",
                    active ? "text-cyan-400 drop-shadow-sm" : isHighlight ? "text-cyan-400 -mt-2 font-bold" : ""
                  )}>
                    {item.label}
                  </span>
                  
                  {active && (
                    <div className="absolute bottom-0 flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400" />
                      <span className="w-1 h-1 rounded-full bg-purple-400 animate-pulse shadow-lg shadow-purple-400" style={{ animationDelay: '0.2s' }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      
      <div className="h-24 lg:hidden" />
    </>
  );
}