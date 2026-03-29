import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav, mobileNavConfig } from "./MobileNav";
import { UnifiedSearch } from "../UnifiedSearch";
import { Sheet, SheetContent } from "../ui/sheet";
import { ScrollArea } from "../ui/scroll-area";
import { useLocation } from "wouter";
import { ThemeToggle } from "../ThemeToggle";
import { Search, Menu, X, Brain } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  fullWidth?: boolean;
  hideNav?: boolean;
  showBackOnMobile?: boolean;
}

// Use shared navigation config from MobileNav - ensures consistency across all navigation elements
const mobileNavItems = mobileNavConfig;

export function AppLayout({
  children,
  hideNav = false,
}: AppLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  if (hideNav) {
    return <>{children}</>;
  }

  const handleNavClick = (path: string) => {
    setLocation(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) =>
    path === "/" ? location === "/" : location.startsWith(path);

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Top header */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3 h-[44px] px-4 border-b"
          style={{
            backgroundColor: "var(--header-bg)",
            borderColor: "var(--sidebar-border)",
          }}
        >
          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden flex items-center justify-center w-[44px] h-[44px] rounded-md text-[var(--sidebar-foreground)] hover:text-[var(--primary)] transition-colors"
            aria-label="Open menu"
            data-testid="button-mobile-menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2">
            <div
              className="w-6 h-6 rounded flex items-center justify-center"
              style={{ backgroundColor: "var(--gh-blue)" }}
            >
              <Brain className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-sm text-[var(--sidebar-foreground)]">DevPrep</span>
          </div>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden sm:flex flex-1 max-w-xs items-center gap-2 h-[44px] px-3 rounded-md border text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
            style={{
              backgroundColor: "var(--popover)",
              borderColor: "var(--border)",
            }}
            data-testid="button-search"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border border-[var(--border)] text-[var(--muted-foreground)]">
              /
            </kbd>
          </button>

          <div className="flex-1" />

          <ThemeToggle />
        </header>

        <main id="main-content" className="flex-1 pb-24 lg:pb-0 max-w-full" tabIndex={-1}>
          {children}
        </main>
      </div>

      <MobileNav />

      <UnifiedSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Menu Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0 border-r" style={{ borderColor: "var(--sidebar-border)", backgroundColor: "var(--sidebar-bg)" }}>
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "var(--sidebar-border)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: "var(--gh-blue)" }}>
                  <Brain className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-semibold text-sm text-foreground">DevPrep</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded text-muted-foreground hover-elevate"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <ScrollArea className="flex-1 py-2">
              <div className="px-2 space-y-0.5">
                {mobileNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavClick(item.path)}
                      className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        active
                          ? "bg-[var(--sidebar-active-bg)] font-semibold text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-[var(--sidebar-active-bg)]"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
