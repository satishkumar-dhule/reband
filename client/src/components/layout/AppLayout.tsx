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

      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <MobileHeader title={title} showBack={showBackOnMobile} />

        <main
          className={`flex-1 ${
            fullWidth
              ? "pb-24 lg:pb-6"
              : "max-w-5xl mx-auto w-full px-4 lg:px-8 py-4 lg:py-8 pb-28 lg:pb-8"
          }`}
        >
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
