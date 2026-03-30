import { ReactNode, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Home, BookOpen, Mic, Code, RotateCcw, BarChart2,
  Bookmark, Award, User, Map, Search, Menu, X, Brain,
} from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { UnifiedSearch } from "../UnifiedSearch";
import { useCredits } from "@/context/CreditsContext";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { icon: Home,      label: "Home",     path: "/" },
  { icon: BookOpen,  label: "Channels", path: "/channels" },
  { icon: Mic,       label: "Voice",    path: "/voice-interview" },
  { icon: Code,      label: "Coding",   path: "/coding" },
  { icon: RotateCcw, label: "Review",   path: "/review" },
  { icon: BarChart2, label: "Stats",    path: "/stats" },
  { icon: Bookmark,  label: "Saved",    path: "/bookmarks" },
  { icon: Map,       label: "Paths",    path: "/learning-paths" },
  { icon: Award,     label: "Badges",   path: "/badges" },
  { icon: User,      label: "Profile",  path: "/profile" },
] as const;

type NavItemType = (typeof NAV_ITEMS)[number];

function NavItem({ item, active, onClick }: { item: NavItemType; active: boolean; onClick?: () => void }) {
  const [, setLocation] = useLocation();
  const Icon = item.icon;
  return (
    <button
      onClick={() => { setLocation(item.path); onClick?.(); }}
      data-testid={`nav-${item.label.toLowerCase()}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-[7px] rounded-md text-sm transition-colors text-left",
        active
          ? "bg-[var(--sidebar-active-bg)] text-foreground font-medium"
          : "text-muted-foreground hover:bg-[var(--sidebar-active-bg)] hover:text-foreground"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
      <span>{item.label}</span>
    </button>
  );
}

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const isActive = useCallback(
    (path: string) => path === "/" ? location === "/" : location.startsWith(path),
    [location]
  );
  return (
    <nav className="flex flex-col gap-0.5 px-2 py-3">
      {NAV_ITEMS.map((item) => (
        <NavItem key={item.path} item={item} active={isActive(item.path)} onClick={onClose} />
      ))}
    </nav>
  );
}

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  fullWidth?: boolean;
  hideNav?: boolean;
  showBackOnMobile?: boolean;
}

export function AppLayout({ children, hideNav = false }: AppLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { balance, formatCredits } = useCredits();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (
        e.key === "/" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  if (hideNav) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">

      {/* ─── TOP HEADER ─────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-[56px] flex items-center gap-3 px-4 border-b"
        style={{ background: "var(--header-bg)", borderColor: "var(--sidebar-border)" }}
      >
        {/* Logo */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 shrink-0"
          aria-label="Go to home"
          data-testid="link-home-logo"
        >
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
            style={{ background: "var(--gh-blue)" }}
          >
            <Brain className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold text-sm hidden sm:block text-foreground">DevPrep</span>
        </button>

        {/* Search bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 h-9 px-3 rounded-md border text-sm text-muted-foreground flex-1 max-w-xs transition-colors hover:border-[var(--gh-blue)]"
          style={{ background: "var(--background)", borderColor: "var(--sidebar-border)" }}
          data-testid="button-search"
          aria-label="Search"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd
            className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded border font-mono leading-none"
            style={{ borderColor: "var(--sidebar-border)", color: "var(--muted-foreground)" }}
          >
            /
          </kbd>
        </button>

        <div className="flex-1" />

        {/* Credits */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs">
          <span className="font-semibold" style={{ color: "var(--gh-blue)" }}>
            {formatCredits(balance)}
          </span>
          <span className="text-muted-foreground">credits</span>
        </div>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Open menu"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* ─── BODY (below fixed header) ──────────────────── */}
      <div className="flex pt-[56px] min-h-[calc(100vh-56px)]">

        {/* ─── DESKTOP SIDEBAR ──────────────────────────── */}
        <aside
          className="hidden lg:block shrink-0 w-52 xl:w-60 border-r"
          style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
        >
          <div className="sticky top-[56px] h-[calc(100vh-56px)] overflow-y-auto">
            <SidebarNav />
          </div>
        </aside>

        {/* ─── MAIN CONTENT ─────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* ─── MOBILE DRAWER ──────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div
            className="relative flex flex-col w-64 border-r shadow-xl"
            style={{ background: "var(--sidebar-bg)", borderColor: "var(--sidebar-border)" }}
          >
            <div
              className="flex items-center justify-between px-4 h-[56px] border-b shrink-0"
              style={{ borderColor: "var(--sidebar-border)" }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center"
                  style={{ background: "var(--gh-blue)" }}
                >
                  <Brain className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-sm text-foreground">DevPrep</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close menu"
                data-testid="button-close-mobile-menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* ─── SEARCH MODAL ───────────────────────────────── */}
      <UnifiedSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
