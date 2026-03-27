import { useLocation } from "wouter";
import {
  Home, BookOpen, Bookmark, BarChart2,
  Mic, Code, RotateCcw, User, Brain,
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

export function Sidebar() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 flex-col border-r border-border bg-background z-50">
      <button
        onClick={() => setLocation("/")}
        className="flex items-center gap-3 px-5 py-4 border-b border-border hover:bg-muted/50 transition-colors text-left"
      >
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Brain className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div>
          <div className="font-bold text-sm text-foreground">Code Reels</div>
          <div className="text-xs text-muted-foreground">Interview Prep</div>
        </div>
      </button>

      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon
                className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "")}
                strokeWidth={active ? 2.5 : 2}
              />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Appearance</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
