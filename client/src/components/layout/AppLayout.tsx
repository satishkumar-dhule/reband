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
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
        <MobileHeader title={title} showBack={showBackOnMobile} />

        <main
          className={`flex-1 ${
            fullWidth
              ? "pb-24 lg:pb-6"
              : "max-w-6xl mx-auto w-full px-4 lg:px-8 py-4 lg:py-8 pb-28 lg:pb-8"
          }`}
        >
          {/* Premium gradient accent at top of content */}
          <div className="relative mb-6">
            <div className="absolute inset-x-0 -top-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
