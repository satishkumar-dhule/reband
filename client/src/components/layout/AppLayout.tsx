import { ReactNode, useState, useEffect, useCallback, useRef } from "react";
import { useFocusTrap } from "@/hooks/use-focus-trap";
import { useLocation } from "wouter";
import {
  Home, BookOpen, Mic, Code, RotateCcw,
  Bookmark, User, Map, Search, Menu, X, Award,
  Terminal,
} from "lucide-react";
import { UnifiedSearch } from "../UnifiedSearch";
import { cn } from "@/lib/utils";
import { MobileBottomNav } from "./UnifiedNav";

const PRACTICE_ITEMS = [
  { icon: Home,      label: "Home",      path: "/" },
  { icon: BookOpen,  label: "Questions", path: "/channels" },
  { icon: Award,     label: "Certs",     path: "/certifications" },
  { icon: Mic,       label: "Voice",     path: "/voice-interview" },
  { icon: Code,      label: "Coding",    path: "/coding" },
] as const;

const LEARNING_ITEMS = [
  { icon: Map,       label: "Paths",     path: "/learning-paths" },
  { icon: RotateCcw, label: "Review",    path: "/review" },
  { icon: Bookmark,  label: "Saved",     path: "/bookmarks" },
] as const;

const ACCOUNT_ITEMS = [
  { icon: User,      label: "Profile & Stats", path: "/profile" },
] as const;

type AnyNavItem = { icon: any; label: string; path: string };

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-3 pt-4 pb-1">
      <span className="text-[10px] text-[var(--gh-fg-subtle)] uppercase tracking-[0.1em] select-none">
        [ {label} ]
      </span>
    </div>
  );
}

function NavItem({
  item,
  active,
  onClick,
}: {
  item: AnyNavItem;
  active: boolean;
  onClick?: () => void;
}) {
  const [, setLocation] = useLocation();
  const Icon = item.icon;
  return (
    <button
      onClick={() => { setLocation(item.path); onClick?.(); }}
      data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-[7px] text-[12.5px] transition-all duration-[0.12s] text-left rounded-sm relative",
        active
          ? "text-[#00d084] bg-[rgba(0,208,132,0.10)] border-l-2 border-l-[#00d084] pl-[10px]"
          : "text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-overlay)] border-l-2 border-l-transparent pl-[10px]"
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={active ? 2.5 : 2} />
      <span>{item.label}</span>
    </button>
  );
}

function SidebarNav({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const isActive = useCallback(
    (path: string) => {
      if (path === "/") return location === "/";
      if (path === "/certifications")
        return location.startsWith("/certifications") || location.startsWith("/certification/");
      return location.startsWith(path);
    },
    [location]
  );

  return (
    <nav className="flex flex-col py-2">
      <SectionLabel label="Practice" />
      {PRACTICE_ITEMS.map((item) => (
        <NavItem key={item.path} item={item} active={isActive(item.path)} onClick={onClose} />
      ))}

      <SectionLabel label="Learning" />
      {LEARNING_ITEMS.map((item) => (
        <NavItem key={item.path} item={item} active={isActive(item.path)} onClick={onClose} />
      ))}

      <SectionLabel label="Account" />
      {ACCOUNT_ITEMS.map((item) => (
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

export function AppLayout({ children, hideNav = false, fullWidth = false }: AppLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLocation] = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);

  useFocusTrap(drawerRef, { enabled: mobileOpen, returnFocus: true });

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
      if (e.key === "Escape") {
        if (mobileOpen) setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [mobileOpen]);

  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--gh-canvas)]">

      {/* ─── TOPBAR ─────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-[var(--z-header)] h-[var(--header-height)] flex items-center gap-3 px-4 border-b border-[var(--gh-border)]"
        style={{ background: "var(--header-bg)" }}
      >
        {/* Logo — terminal green @ mark */}
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 shrink-0"
          aria-label="Go to home"
          data-testid="link-home-logo"
        >
          <div className="w-7 h-7 rounded flex items-center justify-center bg-[rgba(0,208,132,0.12)] border border-[rgba(0,208,132,0.25)]">
            <Terminal className="w-3.5 h-3.5 text-[#00d084]" strokeWidth={2} />
          </div>
          <span className="text-[13px] font-medium hidden sm:block text-[var(--gh-fg)]">
            DevPrep
          </span>
        </button>

        {/* Search bar */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 h-8 px-3 rounded border text-xs text-[var(--gh-fg-muted)] flex-1 max-w-xs transition-all duration-[0.12s] hover:border-[#3d4f6e] hover:text-[var(--gh-fg)] bg-[var(--gh-canvas-inset)] border-[var(--gh-border)]"
          data-testid="button-search"
          aria-label="Search"
        >
          <Search className="w-3 h-3 shrink-0" />
          <span className="flex-1 text-left">Search...</span>
          <kbd
            className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded border font-mono leading-none border-[var(--gh-border)] text-[var(--gh-fg-subtle)]"
          >
            /
          </kbd>
        </button>

        <div className="flex-1" />

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] hover:bg-[var(--gh-canvas-overlay)] transition-all duration-[0.12s]"
          aria-label="Open menu"
          data-testid="button-mobile-menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </header>

      {/* ─── BODY ────────────────────────────────────────── */}
      <div className="flex justify-center pt-[var(--header-height)] min-h-[calc(100vh-var(--header-height))]">
        <div className={cn("flex flex-1 w-full", !fullWidth && "max-w-[--container-max]")}>

          {/* ─── DESKTOP SIDEBAR ──────────────────────────── */}
          <aside
            className="hidden lg:block shrink-0 w-[220px] border-r border-[var(--gh-border)]"
            style={{ background: "var(--sidebar-bg)" }}
          >
            <div className="sticky top-[var(--header-height)] h-[calc(100vh-var(--header-height))] overflow-y-auto">
              <SidebarNav />
            </div>
          </aside>

          {/* ─── MAIN CONTENT ─────────────────────────────── */}
          <main className="flex-1 min-w-0 pb-[60px] lg:pb-0 bg-[var(--gh-canvas)]">
            {children}
          </main>
        </div>
      </div>

      {/* ─── MOBILE DRAWER ──────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[var(--z-drawer)] flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={drawerRef}
            className="relative flex flex-col w-[220px] border-r border-[var(--gh-border)]"
            style={{ background: "var(--sidebar-bg)" }}
            role="document"
          >
            <div className="flex items-center justify-between px-4 h-[var(--header-height)] border-b border-[var(--gh-border)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded flex items-center justify-center bg-[rgba(0,208,132,0.12)] border border-[rgba(0,208,132,0.25)]">
                  <Terminal className="w-3 h-3 text-[#00d084]" strokeWidth={2} />
                </div>
                <span className="text-[13px] font-medium text-[var(--gh-fg)]">DevPrep</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded text-[var(--gh-fg-muted)] hover:text-[var(--gh-fg)] transition-all duration-[0.12s]"
                aria-label="Close menu"
                aria-expanded="true"
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

      {/* ─── MOBILE BOTTOM NAV ────────────────────────────── */}
      <MobileBottomNav />
    </div>
  );
}
