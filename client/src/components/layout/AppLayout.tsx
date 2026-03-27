import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { MobileHeader } from "./MobileHeader";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  fullWidth?: boolean;
  hideNav?: boolean;
  showBackOnMobile?: boolean;
}

// Design system colors aligned with design-system.css
const DESIGN_SYSTEM = {
  // Primary accent colors from design-system.css
  accentCyan: "hsl(190 100% 50%)",
  accentPurple: "hsl(270 100% 65%)",
  accentPink: "hsl(330 100% 65%)",
  
  // Background colors from design-system.css
  background: "hsl(0 0% 2%)",
  card: "hsl(0 0% 6.5%)",
  elevated: "hsl(0 0% 8%)",
  
  // Text colors from design-system.css
  textPrimary: "hsl(0 0% 98%)",
  textSecondary: "hsl(0 0% 75%)",
  textTertiary: "hsl(0 0% 53%)",
  
  // Border colors from design-system.css
  borderSubtle: "hsl(0 0% 12%)",
  borderDefault: "hsl(0 0% 18%)",
} as const;

export function AppLayout({
  children,
  title,
  fullWidth = false,
  hideNav = false,
  showBackOnMobile = false,
}: AppLayoutProps) {
  if (hideNav) {
    return <>{children}</>;
  }

  return (
    <div 
      className="min-h-screen flex" 
      style={{ backgroundColor: DESIGN_SYSTEM.background }}
    >
      <Sidebar />

      <div className="flex-1 lg:ml-[280px] flex flex-col min-w-0">
        <MobileHeader title={title} showBack={showBackOnMobile} />

        <main
          id="main-content"
          className={`flex-1 ${
            fullWidth
              ? "pb-24 lg:pb-6"
              : "max-w-6xl mx-auto w-full px-4 lg:px-8 py-4 lg:py-8 pb-28 lg:pb-8"
          }`}
        >
          {/* Premium gradient accent at top of content - using design system cyan/purple colors */}
          <div className="relative mb-6">
            <div 
              className="absolute inset-x-0 -top-4 h-px" 
              style={{
                background: `linear-gradient(to right, transparent, ${DESIGN_SYSTEM.accentCyan}40, ${DESIGN_SYSTEM.accentPurple}40, transparent)`
              }}
            />
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
