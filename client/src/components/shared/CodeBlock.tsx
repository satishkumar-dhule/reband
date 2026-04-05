/**
 * Shared CodeBlock — syntax-highlighted code with a copy button.
 * Used by AnswerPanel, GenZAnswerPanel, UnifiedAnswerPanel and the AI chat.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { Code2, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CodeBlockProps {
  code: string;
  language: string;
  /** 'compact' = small padding/font (inside prose), 'full' = larger (standalone) */
  size?: 'compact' | 'full';
  className?: string;
}

export function CodeBlock({ code, language, size = 'compact', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden border border-border bg-muted/50',
        size === 'full' && 'shadow-xl',
        className,
      )}
    >
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between border-b border-border bg-muted',
        size === 'compact' ? 'px-3 py-1.5' : 'px-5 py-3',
      )}>
        <div className="flex items-center gap-2">
          <Code2 className={cn('text-primary', size === 'compact' ? 'w-3.5 h-3.5' : 'w-5 h-5')} />
          <span className={cn(
            'uppercase tracking-wider text-primary font-bold',
            size === 'compact' ? 'text-[10px]' : 'text-sm',
          )}>
            {language || 'code'}
          </span>
        </div>
        <motion.button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-500 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Code */}
      <SyntaxHighlighter
        style={vscDarkPlus as SyntaxHighlighterProps['style']}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          padding: size === 'compact' ? '0.75rem' : '1.5rem',
          background: 'transparent',
          fontSize: size === 'compact' ? '0.75rem' : '0.875rem',
          lineHeight: '1.6',
        }}
        wrapLines
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
