/**
 * Standalone Mermaid Diagram Component
 * Robust diagram rendering with proper error handling
 */

import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  content: string;
  className?: string;
}

export function MermaidDiagram({ content, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const renderAttemptRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const attemptId = ++renderAttemptRef.current;

    const renderDiagram = async () => {
      if (!containerRef.current) {
        console.warn('MermaidDiagram: Container ref not ready');
        return;
      }

      try {
        console.log(`🎨 [Attempt ${attemptId}] Starting Mermaid render...`);
        setStatus('loading');
        setError(null);

        // Clear container safely
        containerRef.current.textContent = '';

        // Extract mermaid code from markdown if needed
        let mermaidCode = content.trim();
        
        if (content.includes('```mermaid')) {
          const match = content.match(/```mermaid\s*\n([\s\S]*?)```/);
          if (match) {
            mermaidCode = match[1].trim();
          }
        } else if (content.includes('```')) {
          const match = content.match(/```\s*\n([\s\S]*?)```/);
          if (match) {
            mermaidCode = match[1].trim();
          }
        }

        console.log(`📝 [Attempt ${attemptId}] Code length: ${mermaidCode.length} chars`);
        console.log(`📝 [Attempt ${attemptId}] First 100 chars:`, mermaidCode.substring(0, 100));

        // Dynamic import with error handling
        let mermaid;
        try {
          console.log(`📦 [Attempt ${attemptId}] Importing Mermaid...`);
          const mermaidModule = await import('mermaid');
          // Handle both default and named exports
          mermaid = mermaidModule.default || mermaidModule;
          
          // Verify mermaid has the required methods
          if (!mermaid || typeof mermaid.initialize !== 'function' || typeof mermaid.render !== 'function') {
            console.error('Mermaid module structure:', Object.keys(mermaidModule));
            throw new Error('Mermaid module does not have required methods');
          }
          
          console.log(`✅ [Attempt ${attemptId}] Mermaid imported successfully`);
        } catch (importError: any) {
          console.error('Import error details:', importError);
          throw new Error(`Failed to import Mermaid: ${importError.message}`);
        }

        if (cancelled) {
          console.log(`⏹️ [Attempt ${attemptId}] Cancelled before init`);
          return;
        }

        // Initialize Mermaid
        console.log(`⚙️ [Attempt ${attemptId}] Initializing Mermaid...`);
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#00ff88',
            primaryTextColor: '#ffffff',
            primaryBorderColor: '#00d4ff',
            lineColor: '#00d4ff',
            secondaryColor: '#00d4ff',
            tertiaryColor: '#1a1a1a',
            background: '#000000',
            mainBkg: '#1a1a1a',
            secondBkg: '#0a0a0a',
            textColor: '#ffffff',
            fontSize: '14px',
            fontFamily: 'ui-monospace, monospace',
          },
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
          },
          securityLevel: 'loose',
          logLevel: 'debug',
        });
        console.log(`✅ [Attempt ${attemptId}] Mermaid initialized`);

        if (cancelled) {
          console.log(`⏹️ [Attempt ${attemptId}] Cancelled before render`);
          return;
        }

        // Generate unique ID
        const id = `mermaid-${attemptId}-${Date.now()}`;
        console.log(`🆔 [Attempt ${attemptId}] Using ID: ${id}`);

        // Render with timeout
        console.log(`🎬 [Attempt ${attemptId}] Starting render...`);
        const renderPromise = mermaid.render(id, mermaidCode);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Render timeout after 10 seconds')), 10000)
        );

        const result = await Promise.race([renderPromise, timeoutPromise]);

        if (cancelled) {
          console.log(`⏹️ [Attempt ${attemptId}] Cancelled after render`);
          return;
        }

        if (!result || !result.svg) {
          throw new Error('Render returned no SVG');
        }

        // Insert SVG safely using DOMPurify if available, otherwise use innerHTML
        if (containerRef.current) {
          // Check if DOMPurify is available for sanitization
          if (typeof DOMPurify !== 'undefined') {
            const clean = DOMPurify.sanitize(result.svg, { USE_PROFILES: { svg: true } });
            containerRef.current.innerHTML = clean;
          } else {
            // Fallback: Mermaid generates safe SVG, but this is less secure
            containerRef.current.innerHTML = result.svg;
          }
          console.log(`✅ [Attempt ${attemptId}] Diagram rendered successfully!`);
          console.log(`📊 [Attempt ${attemptId}] SVG length: ${result.svg.length} chars`);
          setStatus('success');
        }
      } catch (err: any) {
        if (cancelled) {
          console.log(`⏹️ [Attempt ${attemptId}] Cancelled during error handling`);
          return;
        }

        console.error(`❌ [Attempt ${attemptId}] Render error:`, err);
        console.error(`❌ [Attempt ${attemptId}] Error stack:`, err.stack);
        
        setError(err.message || 'Unknown error');
        setStatus('error');

        // Show error in container safely - escape user content
        if (containerRef.current) {
          // Escape any HTML in error message to prevent XSS
          const escapeHtml = (str: string) => str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
          
          containerRef.current.innerHTML = `
            <div style="color: #ff0080; padding: 20px; text-align: center;">
              <div style="font-size: 24px; margin-bottom: 10px;">⚠️</div>
              <div style="font-weight: bold; margin-bottom: 5px;">Diagram Render Error</div>
              <div style="font-size: 12px; opacity: 0.8;">${escapeHtml(err.message || 'Unknown error')}</div>
            </div>
          `;
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      renderDiagram();
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      console.log(`🧹 [Attempt ${attemptId}] Cleanup`);
    };
  }, [content]);

  return (
    <div className={`mermaid-diagram-wrapper ${className}`}>
      {status === 'loading' && (
        <div className="flex flex-col items-center justify-center p-8 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 dark:border-green-400"></div>
          <p className="text-xs text-muted-foreground">Rendering diagram...</p>
        </div>
      )}
      
      <div
        ref={containerRef}
        className="mermaid-container"
        style={{
          minHeight: status === 'loading' ? '200px' : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />

      {status === 'error' && error && (
        <details className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <summary className="text-sm text-red-400 cursor-pointer hover:text-red-300">
            Show diagram code
          </summary>
          <pre className="mt-2 text-xs text-cyan-500 dark:text-cyan-400 overflow-x-auto p-2 bg-background/30 rounded">
            {content}
          </pre>
        </details>
      )}
    </div>
  );
}

export default MermaidDiagram;
