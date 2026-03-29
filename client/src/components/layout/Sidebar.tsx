import { useLocation } from "wouter";
import {
  Home, BookOpen, Bookmark, BarChart2,
  Mic, Code, RotateCcw, User, Map, Award,
  Brain,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { ThemeToggle } from "../ThemeToggle";

const navItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: BookOpen, label: "Channels", path: "/channels" },
  { icon: Mic, label: "Voice Practice", path: "/voice-interview" },
  { icon: Code, label: "Coding", path: "/coding" },
  { icon: RotateCcw, label: "SRS Review", path: "/review" },
  { icon: BarChart2, label: "Stats", path: "/stats" },
  { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
  { icon: Map, label: "Learning Paths", path: "/learning-paths" },
  { icon: Award, label: "Badges", path: "/badges" },
  { icon: User, label: "Profile", path: "/profile" },
];

function NavItem({
  item,
  isActive,
  onClick,
}: {
  item: typeof navItems[0];
  isActive: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      onClick={onClick}
      aria-label={item.label}
      data-testid={`nav-${item.path.replace("/", "") || "home"}`}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors text-left",
        isActive
          ? "bg-[var(--sidebar-active-bg)] font-semibold text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-[var(--sidebar-active-bg)]"
      )}
    >
      <Icon
        className={cn("w-4 h-4 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")}
        strokeWidth={isActive ? 2.5 : 2}
      />
      <span>{item.label}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--gh-blue)]" />
      )}
    </button>
  );
}

export function Sidebar() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 h-screen w-[260px] flex-col z-50"
      style={{
        backgroundColor: "var(--sidebar-bg)",
        borderRight: "1px solid var(--sidebar-border)",
      }}
    >
      {/* Logo */}
      <button
        onClick={() => setLocation("/")}
        className="flex items-center gap-2.5 px-4 py-4 border-b hover:bg-[var(--sidebar-active-bg)] transition-colors"
        style={{ borderColor: "var(--sidebar-border)" }}
        data-testid="nav-logo"
      >
        <div
          className="w-8 h-8 rounded-md flex items-center justify-center"
          style={{ backgroundColor: "var(--gh-blue)" }}
        >
          <Brain className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground leading-tight">DevPrep</div>
          <div className="text-xs text-muted-foreground leading-tight">Interview Platform</div>
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
          Navigation
        </p>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isActive={isActive(item.path)}
            onClick={() => setLocation(item.path)}
          />
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-3 py-3 border-t flex items-center justify-between"
        style={{ borderColor: "var(--sidebar-border)" }}
      >
        <span className="text-xs text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>
    </aside>
  );
}
