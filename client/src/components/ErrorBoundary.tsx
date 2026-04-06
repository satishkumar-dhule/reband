/**
 * Error Boundary Component
 * Catches JavaScript errors in child components and displays fallback UI
 */

import { Component, type ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/unified/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.forceUpdate();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Something went wrong
              </h1>
              <p className="text-muted-foreground">
                An unexpected error occurred. Please try again or return to the home page.
              </p>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <div className="text-left bg-muted/50 rounded-lg p-4 overflow-auto max-h-48">
                <p className="text-sm font-mono text-destructive mb-2">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Button variant="primary" size="md" onClick={this.handleRetry}>
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
              <Button variant="secondary" size="md" onClick={this.handleGoHome}>
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// ROUTE-LEVEL ERROR BOUNDARY
// Keeps app shell (header, nav) intact on page crash
// ============================================

/**
 * Per-route error boundary. Shows an inline error card instead of a
 * full-screen takeover, so the navigation remains usable and users can
 * navigate to a different page without a full browser reload.
 */
export class RouteErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    console.error('[RouteErrorBoundary] Page-level error:', error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    this.forceUpdate();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">This page ran into a problem</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              An error occurred while loading this page. You can retry or navigate elsewhere.
            </p>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <div className="text-left bg-muted/50 rounded-lg p-3 overflow-auto max-h-36 w-full max-w-md">
              <p className="text-xs font-mono text-destructive">{this.state.error.message}</p>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="primary" size="sm" onClick={this.handleRetry}>
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </Button>
            <Button variant="secondary" size="sm" onClick={() => { window.location.href = '/'; }}>
              <Home className="w-3.5 h-3.5" />
              Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// HOOK FOR FUNCTIONAL COMPONENTS
// ============================================
interface UseErrorBoundaryReturn {
  showBoundary: (error: Error) => void;
}

export function useErrorBoundary(): UseErrorBoundaryReturn {
  const showBoundary = (error: Error): void => {
    throw error;
  };
  return { showBoundary };
}

// ============================================
// SPECIALIZED ERROR BOUNDARIES
// ============================================

export function PageErrorBoundary({ children }: { children: ReactNode }): React.ReactElement {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Page error:', error);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({
  children,
  fallbackMessage = 'Failed to load component',
}: {
  children: ReactNode;
  fallbackMessage?: string;
}): React.ReactElement {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5 text-center">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-destructive" />
          <p className="text-sm text-muted-foreground">{fallbackMessage}</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
