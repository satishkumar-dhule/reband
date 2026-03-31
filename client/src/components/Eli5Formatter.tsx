/**
 * Eli5Formatter - Warm, friendly "Explain Like I'm 5" content renderer
 * 
 * Features:
 * - Warm amber/orange color scheme for friendliness
 * - Child mascot SVG icon
 * - Larger, readable text
 * - Decorative sparkles for playful feel
 * - Support for paragraphs, lists, and inline code
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Copy, Check } from 'lucide-react';
import { Button } from './unified/Button';

interface Eli5FormatterProps {
  content: string;
}

export function Eli5Formatter({ content }: Eli5FormatterProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse content to handle line breaks and simple formatting
  const formatContent = (text: string) => {
    if (!text) return null;
    
    // Split by double newlines for paragraphs
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    
    return paragraphs.map((paragraph, pIndex) => {
      // Check if it's a list (starts with - or * or numbered)
      const trimmedPara = paragraph.trim();
      if (trimmedPara.startsWith('- ') || trimmedPara.startsWith('* ')) {
        const items = trimmedPara.split(/\n/).filter(line => line.trim());
        return (
          <ul key={pIndex} className="space-y-2 my-3 ml-2">
            {items.map((item, iIndex) => (
              <li key={iIndex} className="flex gap-3">
                <span className="shrink-0 mt-1.5 w-2 h-2 rounded-full bg-amber-400 dark:bg-amber-500" />
                <span className="text-foreground/90">{item.replace(/^[-*]\s*/, '')}</span>
              </li>
            ))}
          </ul>
        );
      }
      
      // Check if it's a numbered list
      if (/^\d+[.)]\s/.test(trimmedPara)) {
        const items = trimmedPara.split(/\n/).filter(line => line.trim());
        return (
          <ol key={pIndex} className="space-y-2 my-3 ml-2 [counter-reset:list-counter]">
            {items.map((item, iIndex) => (
              <li key={iIndex} className="flex gap-3 [counter-increment:list-counter]">
                <span className="shrink-0 mt-1 text-amber-500 dark:text-amber-400 font-bold">
                  {iIndex + 1}.
                </span>
                <span className="text-foreground/90">{item.replace(/^\d+[.)]\s*/, '')}</span>
              </li>
            ))}
          </ol>
        );
      }
      
      // Regular paragraph - handle inline code
      const parts = trimmedPara.split(/`([^`]+)`/g);
      return (
        <p key={pIndex} className="mb-3 last:mb-0 text-foreground/90 leading-relaxed">
          {parts.map((part, index) => {
            if (index % 2 === 1) {
              return (
                <code 
                  key={index}
                  className="px-2 py-0.5 mx-1 bg-amber-100/60 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-lg text-[0.9em] font-mono border border-amber-200/60 dark:border-amber-700/40"
                >
                  {part}
                </code>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Warm, friendly background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-yellow-50/90 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-yellow-950/40" />
      
      {/* Decorative soft border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-amber-200/60 dark:border-amber-700/40" />
      
      {/* Content container */}
      <div className="relative p-5 sm:p-6">
        {/* Header with mascot */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Friendly child mascot SVG */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/60 dark:to-orange-900/60 flex items-center justify-center shadow-md border-2 border-amber-200/60 dark:border-amber-700/50">
              <svg 
                className="w-7 h-7 text-amber-600 dark:text-amber-400"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Simple child face */}
                <circle cx="12" cy="10" r="6" />
                {/* Eyes */}
                <circle cx="10" cy="9" r="1" fill="currentColor" stroke="none" />
                <circle cx="14" cy="9" r="1" fill="currentColor" stroke="none" />
                {/* Smile */}
                <path d="M9 12 Q12 15 15 12" strokeWidth="1.5" />
                {/* Body hint */}
                <path d="M8 22 Q12 16 16 22" />
                {/* Raised arm */}
                <path d="M16 14 Q18 12 20 10" />
              </svg>
            </div>
            
            {/* Labels */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Explain Like I&apos;m 5
              </span>
              <p className="text-xs text-amber-500/80 dark:text-amber-500/70 mt-0.5">
                Simple words, big understanding
              </p>
            </div>
          </div>
          
          {/* Copy button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-600 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-900/40"
            aria-label="Copy ELI5 content"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
        
        {/* ELI5 Content - larger, friendlier text */}
        <div className="text-base sm:text-lg leading-relaxed">
          {formatContent(content)}
        </div>
        
        {/* Decorative sparkles */}
        <div className="absolute top-3 right-3 opacity-50">
          <Sparkles className="w-5 h-5 text-amber-400 dark:text-amber-600" />
        </div>
        <div className="absolute bottom-3 left-3 opacity-40">
          <Sparkles className="w-4 h-4 text-orange-300 dark:text-orange-700" />
        </div>
        <div className="absolute top-1/2 -right-1 opacity-30">
          <Heart className="w-4 h-4 text-rose-300 dark:text-rose-700" />
        </div>
        
        {/* Bottom decorative dots */}
        <div className="absolute bottom-4 right-4 flex gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-300 dark:bg-amber-600 opacity-60" />
          <span className="w-1.5 h-1.5 rounded-full bg-orange-300 dark:bg-orange-600 opacity-50" />
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 dark:bg-yellow-600 opacity-40" />
        </div>
      </div>
    </motion.div>
  );
}
