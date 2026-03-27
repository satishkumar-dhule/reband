import { useLocation } from "wouter";
import { ArrowLeft, Brain } from "lucide-react";

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onSearchClick?: () => void;
  transparent?: boolean;
  showSearch?: boolean;
}

export function MobileHeader({
  title,
  showBack,
}: MobileHeaderProps) {
  const [location, setLocation] = useLocation();

  if (showBack) {
    return (
      <header className="sticky top-0 z-40 lg:hidden bg-background border-b border-border">
        <div className="flex items-center h-12 px-4 gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-1 -ml-1 hover:bg-muted rounded-md transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          {title && (
            <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 lg:hidden bg-background border-b border-border">
      <div className="flex items-center justify-between h-12 px-4">
        <button
          onClick={() => setLocation("/")}
          className="flex items-center gap-2"
        >
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <Brain className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-sm text-foreground">Code Reels</span>
        </button>

        {title && (
          <span className="text-sm font-medium text-muted-foreground truncate max-w-[140px]">
            {title}
          </span>
        )}
      </div>
    </header>
  );
}
