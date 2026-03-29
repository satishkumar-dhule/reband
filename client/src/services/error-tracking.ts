// Error tracking service - can be connected to Sentry, LogRocket, etc.
type ErrorLevel = 'info' | 'warn' | 'error' | 'fatal';

interface TrackedError {
  level: ErrorLevel;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  timestamp: number;
}

class ErrorTrackingService {
  private errors: Array<TrackedError> = [];
  private maxErrors = 100;

  constructor() {
    // Set up global error handlers
    if (typeof window !== 'undefined') {
      window.addEventListener('error', this.handleWindowError.bind(this));
      window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
    }
  }

  private handleWindowError(event: globalThis.ErrorEvent) {
    this.track('error', event.message, event.error?.stack);
  }

  private handleUnhandledRejection(event: PromiseRejectionEvent) {
    this.track('error', 'Unhandled Promise rejection', event.reason?.stack || String(event.reason));
  }

  track(level: ErrorLevel, message: string, stack?: string, context?: Record<string, unknown>) {
    const error: TrackedError = {
      level,
      message,
      stack,
      context,
      timestamp: Date.now(),
    };
    
    this.errors.push(error);
    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    // In production, send to error tracking service:
    // Sentry?.captureException(new Error(message), { extra: { stack, context } });
    
    console[level === 'fatal' ? 'error' : level](`[${level.toUpperCase()}]`, message);
  }

  getRecentErrors(): Array<TrackedError> {
    return [...this.errors];
  }
}

export const errorTracking = new ErrorTrackingService();

// Convenience methods
export function trackError(message: string, context?: Record<string, any>) {
  errorTracking.track('error', message, new Error().stack, context);
}

export function trackWarning(message: string, context?: Record<string, any>) {
  errorTracking.track('warn', message, undefined, context);
}
