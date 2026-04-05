import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedMermaid } from './EnhancedMermaid';
import { YouTubePlayer } from './YouTubePlayer';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  BookOpen, Lightbulb, ExternalLink,
  ChevronDown, Baby, Tag,
  GitBranch, Play, FileText
} from 'lucide-react';
import type { Question } from '../lib/data';
import { GiscusComments } from './GiscusComments';
import { QuestionFeedback } from './QuestionFeedback';
import { SimilarQuestions } from './SimilarQuestions';
import { formatTag } from '../lib/utils';
import { BlogService } from '../services/api.service';
import { Button } from './unified/Button';
import { preprocessMarkdown, renderWithInlineCode, isValidMermaidDiagram } from '../lib/markdown-utils';
import { CodeBlock } from './shared/CodeBlock';

type MediaTab = 'tldr' | 'diagram' | 'eli5' | 'video';

interface AnswerPanelProps {
  question: Question;
  isCompleted: boolean;
}

// Compact expandable card component
function ExpandableCard({ 
  title, 
  icon, 
  children, 
  defaultExpanded = true,
  variant = 'default',
  badge
}: { 
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  variant?: 'default' | 'highlight' | 'success' | 'purple';
  badge?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const variantStyles = {
    default: 'bg-card border border-border',
    highlight: 'bg-[var(--gh-accent-emphasis)]/5 border border-[var(--gh-accent-emphasis)]/20',
    success: 'bg-gh-success-subtle border border-gh-success/20',
    purple: 'bg-gh-done-subtle border border-gh-done/20',
  };

  const iconStyles = {
    default: 'text-muted-foreground',
    highlight: 'text-[var(--gh-accent-emphasis)]',
    success: 'text-gh-success',
    purple: 'text-gh-done',
  };

  return (
    <div className={`rounded-md border overflow-hidden ${variantStyles[variant]}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-start px-2.5 py-1.5 h-auto"
      >
        <div className="flex items-center gap-1.5">
          <span className={iconStyles[variant]}>{icon}</span>
          <span className="font-medium text-xs">{title}</span>
          {badge && (
            <span className="px-1 py-0.5 bg-[var(--gh-accent-emphasis)]/10 text-[var(--gh-accent-emphasis)] text-[8px] font-medium rounded">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground ml-auto transition-transform ${isExpanded ? '' : '-rotate-90'}`} />
      </Button>
      
      {isMobile ? (
        isExpanded && <div className="px-2.5 pb-2">{children}</div>
      ) : (
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-2.5 pb-2">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

// Tabbed Media Panel for TLDR, Diagram, ELI5, and Video
function TabbedMediaPanel({ 
  question,
  hasTldr,
  hasDiagram,
  hasEli5,
  hasVideo
}: { 
  question: Question;
  hasTldr: boolean;
  hasDiagram: boolean;
  hasEli5: boolean;
  hasVideo: boolean;
}) {
  const [diagramRenderSuccess, setDiagramRenderSuccess] = useState<boolean | null>(null);
  
  // Determine if diagram tab should show - only after we know render result
  const showDiagramTab = hasDiagram && diagramRenderSuccess !== false;
  
  // Build available tabs
  const availableTabs: MediaTab[] = [];
  if (hasTldr) availableTabs.push('tldr');
  if (showDiagramTab) availableTabs.push('diagram');
  if (hasEli5) availableTabs.push('eli5');
  if (hasVideo) availableTabs.push('video');
  
  const [activeTab, setActiveTab] = useState<MediaTab>(() => {
    if (hasTldr) return 'tldr';
    if (hasEli5) return 'eli5';
    if (hasVideo) return 'video';
    return 'diagram';
  });
  
  // Switch away from diagram tab if it fails
  useEffect(() => {
    if (diagramRenderSuccess === false && activeTab === 'diagram') {
      if (hasTldr) setActiveTab('tldr');
      else if (hasEli5) setActiveTab('eli5');
      else if (hasVideo) setActiveTab('video');
    }
  }, [diagramRenderSuccess, activeTab, hasTldr, hasEli5, hasVideo]);
  
  // Handle diagram render result
  const handleDiagramRenderResult = useCallback((success: boolean) => {
    setDiagramRenderSuccess(success);
  }, []);
  
  // If no tabs available at all, don't render
  if (availableTabs.length === 0 && diagramRenderSuccess === false) return null;
  // If only diagram and it hasn't loaded yet, show loading state
  if (availableTabs.length === 0 && !hasTldr && !hasEli5 && !hasVideo && diagramRenderSuccess === null) {
    return (
      <div className="rounded-xl sm:rounded-2xl border border-border bg-card p-4 text-center text-muted-foreground text-sm">
        Loading…
      </div>
    );
  }
  if (availableTabs.length === 0) return null;

  const tabConfig = {
    tldr: { label: 'TL;DR', icon: <Lightbulb className="w-3.5 h-3.5" />, color: 'text-[var(--gh-accent-emphasis)]' },
    diagram: { label: 'Diagram', icon: <GitBranch className="w-3.5 h-3.5" />, color: 'text-gh-done' },
    eli5: { label: 'ELI5', icon: <Baby className="w-3.5 h-3.5" />, color: 'text-gh-success' },
    video: { label: 'Video', icon: <Play className="w-3.5 h-3.5" />, color: 'text-gh-pink' },
  };

  return (
    <div className="rounded-lg sm:rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-white/10 bg-black/20" role="tablist">
        {availableTabs.map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'ghost'}
            size="sm"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 justify-center gap-1.5 px-2 py-1.5 text-xs sm:text-sm font-medium transition-all relative !hover:bg-transparent ${
              activeTab === tab 
                ? `${tabConfig[tab].color} bg-white/5` 
                : 'text-white/50'
            }`}
          >
            <span className={activeTab === tab ? tabConfig[tab].color : ''}>{tabConfig[tab].icon}</span>
            <span>{tabConfig[tab].label}</span>
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabIndicator"
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                  tab === 'tldr' ? 'bg-[var(--gh-accent-emphasis)]' :
                  tab === 'diagram' ? 'bg-gh-done' :
                  tab === 'eli5' ? 'bg-gh-success' : 'bg-gh-pink'
                }`}
              />
            )}
          </Button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="p-2 sm:p-3">
        <AnimatePresence mode="wait">
          {activeTab === 'tldr' && hasTldr && (
            <motion.div
              key="tldr"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2"
            >
              <Lightbulb aria-hidden="true" className="w-4 h-4 text-[var(--gh-accent-emphasis)] shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/90 leading-relaxed">{renderWithInlineCode(question.answer)}</p>
            </motion.div>
          )}
          
          {activeTab === 'diagram' && hasDiagram && (
            <motion.div
              key="diagram"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <EnhancedMermaid 
                chart={question.diagram!} 
                onRenderResult={handleDiagramRenderResult}
                caption={`${question.channel} / ${question.subChannel}`}
              />
            </motion.div>
          )}
          
          {activeTab === 'eli5' && hasEli5 && (
            <motion.div
              key="eli5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-2"
            >
              <span aria-hidden="true" className="text-base flex-shrink-0">🧒</span>
              <p className="text-sm text-foreground/90 leading-relaxed">{renderWithInlineCode(question.eli5 || '')}</p>
            </motion.div>
          )}
          
          {activeTab === 'video' && hasVideo && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <YouTubePlayer 
                shortVideo={question.videos?.shortVideo} 
                longVideo={question.videos?.longVideo} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function AnswerPanel({ question }: AnswerPanelProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isMobileView, setIsMobileView] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  const [blogPost, setBlogPost] = useState<{ title: string; slug: string; url: string } | null>(null);

  // Track mobile view reactively
  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 640);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch blog post info for this question
  useEffect(() => {
    const controller = new AbortController();
    
    BlogService.getByQuestionId(question.id)
      .then(setBlogPost)
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Failed to fetch blog post:', err);
        setBlogPost(null);
      });
    
    return () => controller.abort();
  }, [question.id]);

  // On mobile, diagrams don't render, so don't show the tab
  const hasTldr = !!question.answer;
  const hasDiagram = !isMobileView && isValidMermaidDiagram(question.diagram);
  const hasEli5 = !!question.eli5;
  const hasVideo = !!(question.videos?.shortVideo || question.videos?.longVideo);
  const hasMediaContent = hasTldr || hasDiagram || hasEli5 || hasVideo;

  // Memoize markdown rendering components to avoid recreating them on every render
  const markdownComponents = useMemo(() => ({
    code({ className, children }: any) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const codeContent = String(children).replace(/\n$/, '');
      const isInline = !match && !String(children).includes('\n');
      
      if (isInline) {
        return (
          <code className="px-1 py-0.5 bg-[var(--gh-accent-emphasis)]/10 text-[var(--gh-accent-emphasis)] rounded text-[0.85em] font-mono">
            {children}
          </code>
        );
      }
      
      if (language === 'mermaid') {
        if (!isValidMermaidDiagram(codeContent)) return null;
        return (
          <div className="my-3">
            <EnhancedMermaid chart={codeContent} caption="Diagram from code block" />
          </div>
        );
      }
      
      return (
        <div className="my-2">
          <CodeBlock code={codeContent} language={language} />
        </div>
      );
    },
    p({ children }: any) {
      return <p className="mb-2 leading-relaxed text-foreground/90 text-sm">{children}</p>;
    },
    h1({ children }: any) {
      return <h1 className="text-base font-bold mb-2 mt-4 text-foreground border-b border-border pb-1">{children}</h1>;
    },
    h2({ children }: any) {
      return <h2 className="text-sm font-bold mb-2 mt-3 text-foreground">{children}</h2>;
    },
    h3({ children }: any) {
      return <h3 className="text-sm font-semibold mb-1.5 mt-2 text-foreground/90">{children}</h3>;
    },
    strong({ children }: any) {
      return <strong className="font-semibold text-foreground">{children}</strong>;
    },
    ul({ children }: any) {
      return <ul className="space-y-1 mb-2 ml-1">{children}</ul>;
    },
    ol({ children }: any) {
      return <ol className="space-y-1 mb-2 ml-1 [counter-reset:list-counter]">{children}</ol>;
    },
    li({ children, node }: any) {
      const parent = node?.parent;
      const isOrdered = parent?.tagName === 'ol';
      
      return (
        <li className="flex gap-2 text-foreground/90 text-sm [counter-increment:list-counter]">
          <span className="shrink-0 text-[var(--gh-accent-emphasis)] mt-0.5">
            {isOrdered ? <span className="text-xs font-medium before:content-[counter(list-counter)'.']" /> : '•'}
          </span>
          <span className="flex-1">{children}</span>
        </li>
      );
    },
    a({ href, children }: any) {
      return (
        <a href={href} className="text-[var(--gh-accent-emphasis)] hover:underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    blockquote({ children }: any) {
      return (
        <blockquote className="border-l-2 border-[var(--gh-accent-emphasis)]/50 pl-3 py-1 my-2 bg-[var(--gh-accent-emphasis)]/5 text-muted-foreground italic text-sm">
          {children}
        </blockquote>
      );
    },
    table({ children }: any) {
      return (
        <div className="my-2 overflow-x-auto rounded border border-[var(--gh-border)]">
          <table className="w-full border-collapse text-sm">{children}</table>
        </div>
      );
    },
    th({ children }: any) {
      return <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wide bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)] text-[var(--gh-fg-muted)]">{children}</th>;
    },
    td({ children }: any) {
      return <td className="px-4 py-3 border-b border-[var(--gh-border)] text-sm text-[var(--gh-fg)]">{children}</td>;
    },
  }), []);

  const renderMarkdown = useCallback((text: string) => {
    const processedText = preprocessMarkdown(text);
    
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={markdownComponents}
      >
        {processedText}
      </ReactMarkdown>
    );
  }, [markdownComponents]);

  return (
    <motion.div
      ref={scrollContainerRef}
      initial={isMobileView ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full overflow-y-auto overflow-x-hidden bg-background"
    >
      <div className="w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-3 pb-16 space-y-1.5">

        {/* Tabbed Media Panel */}
        {hasMediaContent && (
          <TabbedMediaPanel
            question={question}
            hasTldr={hasTldr}
            hasDiagram={hasDiagram}
            hasEli5={hasEli5}
            hasVideo={hasVideo}
          />
        )}

        {/* Full Explanation */}
        <ExpandableCard
          title="Full Explanation"
          icon={<BookOpen className="w-3.5 h-3.5" />}
          defaultExpanded={true}
          badge={question.explanation ? `${Math.ceil(question.explanation.split(' ').length / 200)} min` : undefined}
        >
          <div className="prose prose-sm max-w-none">
            {renderMarkdown(question.explanation)}
          </div>
        </ExpandableCard>

        {/* Tags - Compact + Feedback */}
        <div className="flex items-start justify-between gap-1.5 pt-0.5">
          <div className="flex items-start gap-1.5 flex-1 min-w-0">
            {question.tags && question.tags.length > 0 && (
              <>
                <Tag className="w-2.5 h-2.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex flex-wrap gap-0.5">
                  {question.tags.map(tag => (
                    <span key={tag} className="px-1 py-0.5 bg-muted text-[8px] font-mono text-muted-foreground rounded border border-border">
                      {formatTag(tag)}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          <QuestionFeedback questionId={question.id} />
        </div>

        {/* References */}
        {(question.sourceUrl || blogPost) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {question.sourceUrl && (
              <a href={question.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded-md text-[10px]">
                <ExternalLink className="w-2.5 h-2.5 text-muted-foreground" />
                <span className="text-muted-foreground">Source</span>
              </a>
            )}
            {blogPost && (
              <a href={`https://openstackdaily.github.io${blogPost.url}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--gh-accent-emphasis)]/10 hover:bg-[var(--gh-accent-emphasis)]/20 border border-[var(--gh-accent-emphasis)]/30 rounded-md text-[10px]">
                <FileText className="w-2.5 h-2.5 text-[var(--gh-accent-emphasis)]" />
                <span className="text-[var(--gh-accent-emphasis)]">Blog</span>
              </a>
            )}
          </div>
        )}

        {/* Similar Questions */}
        <SimilarQuestions questionId={question.id} currentChannel={question.channel} />

        {/* Discussion */}
        <GiscusComments questionId={question.id} />

      </div>
    </motion.div>
  );
}
