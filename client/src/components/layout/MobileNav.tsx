import { useLocation } from "wouter";
import { Home, BookOpen, Bookmark, BarChart2, Mic } from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: BookOpen, label: "Channels", path: "/channels" },
  { icon: Mic, label: "Voice", path: "/voice-interview" },
  { icon: BarChart2, label: "Stats", path: "/stats" },
  { icon: Bookmark, label: "Saved", path: "/bookmarks" },
];

export function MobileNav() {
  const [location, setLocation] = useLocation();

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background border-t border-border">
      <div className="flex items-stretch justify-around h-14 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 gap-0.5 py-1 transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={active ? 2.5 : 1.8}
              />
              <span className={cn("text-[10px] font-medium", active ? "text-primary" : "")}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
