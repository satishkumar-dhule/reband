import { createContext, useContext, useState, useEffect, ReactNode, lazy, Suspense } from 'react';

interface DeferredContextType {
  isReady: boolean;
  mount: () => void;
}

const DeferredContext = createContext<DeferredContextType | null>(null);

export function useDeferred() {
  const ctx = useContext(DeferredContext);
  if (!ctx) throw new Error('useDeferred must be used within DeferredProvider');
  return ctx;
}

export function DeferredProvider({ 
  children, 
  delay = 1000,
  fallback = null 
}: { 
  children: ReactNode; 
  delay?: number;
  fallback?: ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <DeferredContext.Provider value={{ isReady, mount: () => setIsReady(true) }}>
      {isReady ? children : (fallback || null)}
    </DeferredContext.Provider>
  );
}

export function LazyContextProvider({ 
  children, 
  loader 
}: { 
  children: ReactNode; 
  loader: () => Promise<{ default: React.ComponentType<any> }>;
}) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (mounted) return;
    loader().then(mod => {
      setComponent(() => mod.default);
      setMounted(true);
    });
  }, [mounted, loader]);

  if (!Component) return null;

  return <Component>{children}</Component>;
}

export function createDeferredProvider(
  importFn: () => Promise<{ default: React.ComponentType<any> }>,
  delay = 2000
) {
  return function DeferredWrapper({ children }: { children: ReactNode }) {
    const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

    useEffect(() => {
      const timer = setTimeout(() => {
        importFn().then(mod => setComponent(() => mod.default));
      }, delay);
      return () => clearTimeout(timer);
    }, [delay]);

    if (!Component) return <DeferredProvider>{children}</DeferredProvider>;
    return <Component>{children}</Component>;
  };
}
