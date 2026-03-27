import { useState } from "react";
import { useLocation } from "wouter";
import {
  Home, BookOpen, Bookmark, BarChart2,
  Mic, Code, RotateCcw, User, Brain,
  Sparkles, Settings,
  ChevronDown, LogOut, Bell,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../ThemeToggle";

const COLORS = {
  primary: "hsl(190 100% 50%)",
  secondary: "hsl(270 100% 65%)",
  accent: "hsl(330 100% 65%)",
  success: "hsl(142 76% 36%)",
  warning: "hsl(38 92% 50%)",
  error: "hsl(0 84% 60%)",
};

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "Channels", path: "/channels" },
  { icon: Mic, label: "Voice Practice", path: "/voice-interview" },
  { icon: Code, label: "Coding", path: "/coding" },
  { icon: RotateCcw, label: "SRS Review", path: "/review" },
  { icon: BarChart2, label: "Stats", path: "/stats" },
  { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
  { icon: User, label: "Profile", path: "/profile" },
];

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[hsl(0_0%_12%)] pb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[hsl(0_0%_53%)] uppercase tracking-wider hover:text-[hsl(0_0%_98%)] transition-colors group"
      >
        <Icon 
          className="w-3.5 h-3.5 transition-all duration-300" 
          style={{ color: isOpen ? COLORS.primary : undefined }}
        />
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown 
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-300",
            isOpen ? "rotate-0" : "-rotate-90"
          )} 
        />
      </button>
      <div 
        className={cn(
          "space-y-1.5 overflow-hidden transition-all duration-300 ease-out",
          isOpen ? "mt-2.5 opacity-100" : "mt-0 opacity-0 h-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

function NavItem({ 
  item, 
  isActive, 
  onClick,
  delay 
}: { 
  item: typeof navItems[0]; 
  isActive: boolean; 
  onClick: () => void;
  delay: number;
}) {
  const Icon = item.icon;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group",
        isActive
          ? "text-[hsl(0_0%_98%)]"
          : "text-[hsl(0_0%_75%)] hover:text-[hsl(0_0%_98%)]"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {isActive && (
        <div 
          className="absolute inset-0 rounded-xl blur-sm"
          style={{ 
            background: 'linear-gradient(135deg, hsla(190, 100%, 50%, 0.15) 0%, hsla(270, 100%, 65%, 0.08) 100%)',
            boxShadow: '0 0 20px hsla(190, 100%, 50%, 0.2), inset 0 0 20px hsla(190, 100%, 50%, 0.08)'
          }}
        />
      )}
      
      <div 
        className={cn(
          "absolute inset-0 rounded-xl transition-all duration-300",
          isActive 
            ? "bg-gradient-to-r from-primary/15 via-transparent to-transparent opacity-100" 
            : "bg-gradient-to-r from-[hsl(0_0%_12%)] via-transparent to-transparent opacity-0 group-hover:opacity-100"
        )}
      />
      
      <div 
        className={cn(
          "relative z-10 p-1.5 rounded-lg transition-all duration-300 border",
          isActive 
            ? "border-[hsla(190,100%,50%,0.3)] shadow-lg"
            : "border-transparent group-hover:border-[hsla(0,0%,53%,0.2)] group-hover:shadow-md"
        )}
        style={isActive ? { 
          background: 'linear-gradient(135deg, hsla(190, 100%, 50%, 0.2) 0%, hsla(270, 100%, 65%, 0.1) 100%)',
          boxShadow: '0 4px 12px hsla(190, 100%, 50%, 0.2)'
        } : {}}
      >
        <Icon
          className={cn(
            "w-4 h-4 shrink-0 transition-all duration-300",
            isActive ? "drop-shadow-sm" : ""
          )}
          style={isActive ? { 
            color: COLORS.primary,
            strokeWidth: 2.5
          } : {}}
        />
      </div>
      
      <span className="relative z-10">{item.label}</span>
      
      {isActive && (
        <span 
          className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ 
            backgroundColor: COLORS.primary,
            boxShadow: '0 0 10px hsla(190, 100%, 50%, 0.8), 0 0 20px hsla(190, 100%, 50%, 0.5)'
          }}
        />
      )}
    </button>
  );
}

export function Sidebar() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[300px] flex-col border-r border-[hsl(0_0%_12%)] bg-gradient-to-b from-[hsl(0_0%_0%)] via-[hsl(0_0%_2%)] to-[hsl(0_0%_0%)] z-50">
      <style>{`@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }`}</style>
      <div 
        className="absolute top-0 left-0 w-full h-64 pointer-events-none opacity-30"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 20% -20%, hsla(190, 100%, 50%, 0.2) 0%, transparent 70%)',
        }}
      />
      
      <div 
        className="absolute top-0 left-0 w-px h-full"
        style={{
          background: 'linear-gradient(to bottom, hsla(190, 100%, 50%, 0.4) 0%, transparent 20%, transparent 80%, hsla(190, 100%, 50%, 0.4) 100%)'
        }}
      />
      <div 
        className="absolute top-0 right-0 w-px h-full"
        style={{
          background: 'linear-gradient(to bottom, hsla(0, 0%, 18%, 0.8) 0%, transparent 20%, transparent 80%, hsla(0, 0%, 18%, 0.8) 100%)'
        }}
      />
      
      <button
        onClick={() => setLocation("/")}
        className="relative flex items-center gap-3 px-5 py-5 border-b border-[hsl(0_0%_12%)] hover:bg-gradient-to-r hover:from-[hsla(190,100%,50%,0.05)] hover:to-transparent transition-all duration-300 group"
      >
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(90deg, hsla(190, 100%, 50%, 0.08) 0%, transparent 100%)'
          }}
        />
        
        <div className="relative">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{ 
              background: 'linear-gradient(135deg, hsl(190 100% 50%) 0%, hsl(270 100% 65%) 50%, hsl(330 100% 65%) 100%)',
              boxShadow: '0 4px 20px hsla(190, 100%, 50%, 0.3), 0 8px 30px hsla(190, 100%, 50%, 0.15)'
            }}
          >
            <Brain className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div 
            className="absolute -inset-1 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"
            style={{
              background: 'linear-gradient(135deg, hsl(190 100% 50%) 0%, hsl(330 100% 65%) 100%)'
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0 relative z-10">
          <div className="font-bold text-lg text-[hsl(0_0%_98%)] flex items-center gap-2">
            DevPrep Ultra
            <span 
              className="px-2 py-0.5 text-[9px] font-bold rounded-lg flex items-center gap-0.5 shadow-lg"
              style={{ 
                background: 'linear-gradient(135deg, hsl(190 100% 50%) 0%, hsl(270 100% 65%) 50%, hsl(330 100% 65%) 100%)',
                color: '#000',
                boxShadow: '0 2px 10px hsla(190, 100%, 50%, 0.3)'
              }}
            >
              <Sparkles className="w-2.5 h-2.5" />
              PRO MAX
            </span>
          </div>
          <div className="text-xs text-[hsl(0_0%_53%)] mt-0.5">
            Your Learning Platform
          </div>
        </div>
      </button>

      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <CollapsibleSection title="Main Menu" icon={Settings} defaultOpen={true}>
          {navItems.map((item, i) => (
            <NavItem
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              onClick={() => setLocation(item.path)}
              delay={i * 50}
            />
          ))}
        </CollapsibleSection>
      </nav>

      <div className="px-3 py-3 border-t border-[hsl(0_0%_12%)]">
        <div className="relative p-3 rounded-xl overflow-hidden group">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-[hsla(270,100%,65%,0.1)] via-[hsla(270,100%,65%,0.05)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(270 100% 65%) 0%, hsl(270 100% 75%) 50%, hsl(330 100% 65%) 100%)',
                  boxShadow: '0 4px 15px hsla(270, 100%, 65%, 0.25)'
                }}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              <span 
                className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[hsl(0_0%_0%)]"
                style={{ backgroundColor: COLORS.success, boxShadow: '0 0 8px hsla(142, 76%, 36%, 0.8)' }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[hsl(0_0%_98%)] truncate">Guest User</div>
              <div className="text-xs text-[hsl(0_0%_53%)] flex items-center gap-1">
                <span 
                  className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                  style={{ 
                    background: 'linear-gradient(135deg, hsl(190 100% 50%) 0%, hsl(270 100% 65%) 100%)',
                    color: '#fff'
                  }}
                >
                  PRO
                </span>
                Member
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button aria-label="Notifications" className="p-2 rounded-lg hover:bg-[hsl(0_0%_8%)] transition-colors group/btn">
                <Bell className="w-4 h-4 text-[hsl(0_0%_53%)] group-hover/btn:text-[hsl(0_0%_98%)] transition-colors" />
              </button>
              <button aria-label="Log out" className="p-2 rounded-lg hover:bg-[hsl(0_0%_8%)] transition-colors group/btn">
                <LogOut className="w-4 h-4 text-[hsl(0_0%_53%)] group-hover/btn:text-[hsl(0_0%_98%)] transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-[hsl(0_0%_12%)] flex items-center justify-between">
        <span className="text-xs text-[hsl(0_0%_53%)] flex items-center gap-2">
          <Settings className="w-3 h-3" />
          Theme
        </span>
        <ThemeToggle />
      </div>
    </aside>
  );
}