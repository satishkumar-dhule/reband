import { useState } from "react";
import { useLocation } from "wouter";
import {
  Home, BookOpen, Bookmark, BarChart2,
  Mic, Code, RotateCcw, User, Brain,
  Sparkles, Zap, Bot, Cpu, Layers, Gauge, Settings,
  ChevronDown, ChevronRight, LogOut, Bell,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../ThemeToggle";

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

const agentCategories = [
  { icon: Zap, label: "UI/UX", count: 5, gradient: "from-purple-500/20 via-violet-500/10 to-fuchsia-500/20", border: "border-purple-500/30", glow: "shadow-purple-500/20" },
  { icon: Cpu, label: "Database", count: 5, gradient: "from-blue-500/20 via-cyan-500/10 to-teal-500/20", border: "border-blue-500/30", glow: "shadow-blue-500/20" },
  { icon: Sparkles, label: "Google", count: 5, gradient: "from-pink-500/20 via-rose-500/10 to-red-500/20", border: "border-pink-500/30", glow: "shadow-pink-500/20" },
  { icon: Layers, label: "DevOps", count: 5, gradient: "from-amber-500/20 via-orange-500/10 to-yellow-500/20", border: "border-amber-500/30", glow: "shadow-amber-500/20" },
  { icon: Gauge, label: "AI/ML", count: 5, gradient: "from-emerald-500/20 via-green-500/10 to-teal-500/20", border: "border-emerald-500/30", glow: "shadow-emerald-500/20" },
  { icon: Settings, label: "System", count: 5, gradient: "from-slate-500/20 via-zinc-500/10 to-neutral-500/20", border: "border-slate-500/30", glow: "shadow-slate-500/20" },
];

function AgentStatusBadge() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary/10 via-emerald-500/10 to-primary/10 border border-primary/20 backdrop-blur-sm">
        <div className="relative">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-background animate-ping" />
        </div>
        <div className="flex-1">
          <span className="text-xs font-bold text-foreground">30 AI Agents Active</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="flex gap-0.5">
              {[...Array(3)].map((_, i) => (
                <span 
                  key={i}
                  className="w-1 h-1 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </span>
          </div>
        </div>
        <span className="px-2.5 py-1 text-[10px] font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black rounded-full flex items-center gap-1 shadow-lg shadow-amber-500/30">
          <Sparkles className="w-3 h-3" />
          PRO MAX
        </span>
      </div>
      
      {/* Hover expansion */}
      <div className={cn(
        "absolute top-full left-0 right-0 mt-2 p-3 rounded-xl bg-card/95 backdrop-blur-xl border border-border/50 shadow-2xl transition-all duration-300 overflow-hidden",
        isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}>
        <div className="grid grid-cols-2 gap-2">
          {agentCategories.slice(0, 4).map((cat) => (
            <div key={cat.label} className={cn(
              "flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br border",
              cat.gradient, cat.border
            )}>
              <cat.icon className="w-3.5 h-3.5 text-foreground" />
              <span className="text-[10px] font-medium text-foreground">{cat.label}</span>
              <span className="ml-auto text-[9px] text-muted-foreground">{cat.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  gradient = "from-primary/10 to-transparent"
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  gradient?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/20 pb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider hover:text-foreground transition-colors group"
      >
        <Icon className="w-3.5 h-3.5 text-primary/70 group-hover:text-primary transition-colors" />
        <span className="flex-1 text-left">{title}</span>
        <ChevronDown className={cn(
          "w-3.5 h-3.5 transition-transform duration-200",
          isOpen ? "rotate-0" : "-rotate-90"
        )} />
      </button>
      <div className={cn(
        "space-y-1 overflow-hidden transition-all duration-300",
        isOpen ? "mt-2 opacity-100" : "mt-0 opacity-0 h-0"
      )}>
        {children}
      </div>
    </div>
  );
}

export function Sidebar() {
  const [location, setLocation] = useLocation();
  const [agentsExpanded, setAgentsExpanded] = useState(true);

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-76 flex-col border-r border-border/50 bg-gradient-to-b from-background via-background/95 to-background z-50">
      {/* Gradient accent lines */}
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-primary/30 via-transparent to-primary/30" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-accent/20 via-transparent to-accent/20" />
      
      {/* Logo Section */}
      <button
        onClick={() => setLocation("/")}
        className="flex items-center gap-3 px-5 py-5 border-b border-border/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-300 group"
      >
        <div className="relative">
          <div className="w-12 h-12 bg-gradient-to-br from-primary via-emerald-500 to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-all duration-300 group-hover:scale-105">
            <Brain className="w-6 h-6 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-primary to-emerald-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-lg text-foreground flex items-center gap-2">
            DevPrep Ultra
            <span className="px-2 py-0.5 text-[9px] font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 text-black rounded-lg flex items-center gap-0.5 shadow-lg shadow-amber-500/20">
              <Sparkles className="w-2.5 h-2.5" />
              PRO MAX
            </span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <Bot className="w-3 h-3 text-primary" />
            <span>30 AI Agents Powered</span>
            <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
          </div>
        </div>
      </button>

      {/* Agent Status */}
      <div className="px-4 py-4">
        <AgentStatusBadge />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        <CollapsibleSection title="Main Menu" icon={Settings} defaultOpen={true}>
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  active
                    ? "bg-gradient-to-r from-primary/20 via-primary/10 to-transparent border-l-[3px] border-primary text-foreground shadow-sm shadow-primary/15"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-[3px] border-transparent"
                )}
                style={{ animationDelay: `${i * 0.03}s` }}
              >
                {/* Hover glow */}
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                  active && "opacity-100"
                )} />
                
                <div className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 relative z-10",
                  active ? "bg-primary/25 shadow-sm shadow-primary/20" : "bg-muted/50 group-hover:bg-muted"
                )}>
                  <Icon
                    className={cn("w-4 h-4 shrink-0", active ? "text-primary drop-shadow-sm" : "")}
                    strokeWidth={active ? 2.5 : 2}
                  />
                </div>
                <span className="relative z-10">{item.label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-sm shadow-primary animate-pulse relative z-10" />
                )}
              </button>
            );
          })}
        </CollapsibleSection>

        {/* Agent Categories */}
        <div className="mt-4">
          <CollapsibleSection 
            title="Active Agents" 
            icon={Bot} 
            defaultOpen={agentsExpanded}
            gradient="from-primary/20 to-emerald-500/10"
          >
            <div className="grid grid-cols-2 gap-2">
              {agentCategories.map((cat, i) => (
                <button
                  key={cat.label}
                  onClick={() => setLocation("/channels")}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl bg-gradient-to-br border transition-all duration-300 hover:scale-105 cursor-pointer hover:shadow-lg",
                    cat.gradient, cat.border, cat.glow
                  )}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <div className="p-1.5 rounded-lg bg-background/50">
                    <cat.icon className="w-4 h-4 text-foreground" />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground">{cat.label}</span>
                  <span className="text-[9px] text-muted-foreground">{cat.count} agents</span>
                </button>
              ))}
            </div>
          </CollapsibleSection>
        </div>
      </nav>

      {/* User Profile Section */}
      <div className="px-3 py-3 border-t border-border/30">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-muted/50 via-muted/30 to-transparent hover:from-muted/70 transition-colors cursor-pointer group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">Guest User</div>
            <div className="text-xs text-muted-foreground">Pro Member</div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border/30 flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-2">
          <Settings className="w-3 h-3" />
          Theme
        </span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
