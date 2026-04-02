const fs = require('fs');
const path = 'client/src/components/question/ExtremeAnswerPanel.tsx';
let content = fs.readFileSync(path, 'utf8');

// Check if Eli5Formatter already exists
if (content.includes('function Eli5Formatter')) {
  console.log('Eli5Formatter already exists');
  process.exit(0);
}

const eli5Formatter = `// ============================================
// ELI5 Formatter - Friendly, Engaging Content
// ============================================

interface Eli5Segment {
  type: 'paragraph' | 'bullet' | 'heading' | 'funfact' | 'analogy' | 'example' | 'tip';
  content: string;
}

function parseEli5Content(text: string): Eli5Segment[] {
  if (!text) return [];
  
  const segments: Eli5Segment[] = [];
  const lines = text.split('\\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Fun Fact detection
    if (
      trimmed.match(/^(fun fact|fyi|did you know|interesting)/i) ||
      trimmed.match(/^\\*\\*fun fact/i) ||
      trimmed.match(/^[-–—]\\s*fun fact/i) ||
      trimmed.startsWith('💡')
    ) {
      const content = trimmed
        .replace(/^(fun fact|fyi|did you know|interesting|💡)\\s*[:\\-–—]?\\s*/i, '')
        .replace(/^\\*\\*fun fact[:\\-]\\s*/i, '')
        .replace(/^[-–—]\\s*fun fact[:\\-]\\s*/i, '')
        .trim();
      if (content) segments.push({ type: 'funfact', content });
      continue;
    }
    
    // Tip detection
    if (
      trimmed.match(/^(pro tip|pro-tip|helpful tip|quick tip|hint)/i) ||
      trimmed.match(/^[-–—]\\s*tip/i) ||
      trimmed.startsWith('✨')
    ) {
      const content = trimmed
        .replace(/^(pro tip|pro-tip|helpful tip|quick tip|hint|✨)\\s*[:\\-–—]?\\s*/i, '')
        .replace(/^[-–—]\\s*tip[:\\-]\\s*/i, '')
        .trim();
      if (content) segments.push({ type: 'tip', content });
      continue;
    }
    
    // Analogy detection
    if (
      trimmed.match(/^(analogy|think of it|like when|imagine|example:|for example)/i) ||
      trimmed.match(/^\\(.*as.*\\)/) ||
      trimmed.startsWith('🎯') ||
      trimmed.startsWith('⚡')
    ) {
      const content = trimmed
        .replace(/^(analogy|think of it|like when|imagine)\\s*[:\\-–—]?\\s*/i, '')
        .replace(/^\\(.*\\)\\s*/, '')
        .replace(/^[🎯⚡]\\s*/, '')
        .trim();
      if (content) segments.push({ type: 'analogy', content });
      continue;
    }
    
    // Example detection
    if (
      trimmed.match(/^example\\s*[:\\-]/i) ||
      trimmed.startsWith('📝')
    ) {
      const content = trimmed
        .replace(/^example\\s*[:\\-]\\s*/i, '')
        .replace(/^[📝]\\s*/, '')
        .trim();
      if (content) segments.push({ type: 'example', content });
      continue;
    }
    
    // Heading detection
    if (trimmed.startsWith('##') || (trimmed.startsWith('**') && trimmed.endsWith('**'))) {
      const content = trimmed.replace(/^##\\s*/, '').replace(/\\*\\*/g, '').trim();
      if (content) segments.push({ type: 'heading', content });
      continue;
    }
    
    // Bullet point detection
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      const content = trimmed.replace(/^[-•*]\\s*/, '').trim();
      if (content) segments.push({ type: 'bullet', content });
      continue;
    }
    
    // Numbered list detection
    if (trimmed.match(/^\\d+[.)]\\s/)) {
      const content = trimmed.replace(/^\\d+[.)]\\s*/, '').trim();
      if (content) segments.push({ type: 'bullet', content });
      continue;
    }
    
    // Default: paragraph
    if (trimmed) {
      segments.push({ type: 'paragraph', content: trimmed });
    }
  }
  
  return segments;
}

function Eli5Formatter({ content }: { content: string }) {
  const segments = parseEli5Content(content);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const renderContent = (text: string) => {
    // Parse inline code
    const parts = text.split(\`\\\`([^\\\\\\\`]+)\\\`/g\`);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <code
            key={idx}
            className="px-1.5 py-0.5 mx-0.5 bg-primary/15 text-primary rounded font-mono text-[0.85em] border border-primary/25"
          >
            {part}
          </code>
        );
      }
      
      // Parse bold text
      const boldParts = part.split(/\\*\\*([^*]+)\\*\\*/g);
      return boldParts.map((bp, bi) => {
        if (bi % 2 === 1) {
          return <strong key={\\\`\${idx}-\${bi}\\\`} className="font-semibold">{bp}</strong>;
        }
        return <span key={\\\`\${idx}-\${bi}\\\`}>{bp}</span>;
      });
    });
  };
  
  if (segments.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-start gap-3"
      >
        <Baby className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <p className="text-sm text-muted-foreground italic">Loading explanation...</p>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      {/* Scrollable Content */}
      <div 
        ref={scrollRef}
        className="max-h-[60vh] overflow-y-auto pr-1 scroll-smooth scrollbar-thin scrollbar-thumb-primary/30 scrollbar-track-transparent hover:scrollbar-thumb-primary/50"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--primary) / 0.3) transparent'
        }}
      >
        <div className="space-y-3">
          {segments.map((segment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              {/* Fun Fact Callout */}
              {segment.type === 'funfact' && (
                <div className="group relative p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 rounded-xl border border-amber-200/50 dark:border-amber-700/30 overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-200/20 to-transparent rounded-bl-full" />
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0 animate-pulse">💡</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
                        Fun Fact
                      </p>
                      <p className="text-sm sm:text-base text-amber-800 dark:text-amber-300 leading-relaxed">
                        {renderContent(segment.content)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Analogy Callout */}
              {segment.type === 'analogy' && (
                <div className="relative p-4 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-xl border border-emerald-200/50 dark:border-emerald-700/30">
                  <div className="absolute -left-1 top-4 bottom-4 w-1 bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full" />
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">🎯</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                        Think of it like this
                      </p>
                      <p className="text-sm sm:text-base text-emerald-800 dark:text-emerald-300 leading-relaxed">
                        {renderContent(segment.content)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Example Callout */}
              {segment.type === 'example' && (
                <div className="relative p-4 bg-violet-50/60 dark:bg-violet-950/30 rounded-xl border border-violet-200/50 dark:border-violet-700/30">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">📝</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 mb-1">
                        Example
                      </p>
                      <p className="text-sm sm:text-base text-violet-800 dark:text-violet-300 leading-relaxed">
                        {renderContent(segment.content)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Tip Callout */}
              {segment.type === 'tip' && (
                <div className="relative p-4 bg-sky-50/60 dark:bg-sky-950/30 rounded-xl border border-sky-200/50 dark:border-sky-700/30">
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">✨</span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
                        Pro Tip
                      </p>
                      <p className="text-sm sm:text-base text-sky-800 dark:text-sky-300 leading-relaxed">
                        {renderContent(segment.content)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Heading */}
              {segment.type === 'heading' && (
                <div className="flex items-center gap-2 pt-2 pb-1">
                  <Baby className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-bold text-foreground">
                    {renderContent(segment.content)}
                  </h3>
                </div>
              )}
              
              {/* Bullet Point with Friendly Icon */}
              {segment.type === 'bullet' && (
                <div className="flex items-start gap-3 pl-1">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center mt-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-primary/70" />
                  </div>
                  <p className="text-sm sm:text-base text-foreground leading-relaxed flex-1">
                    {renderContent(segment.content)}
                  </p>
                </div>
              )}
              
              {/* Paragraph */}
              {segment.type === 'paragraph' && (
                <div className="flex items-start gap-3">
                  <Baby className="w-4 h-4 text-primary/60 shrink-0 mt-1.5" />
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed">
                    {renderContent(segment.content)}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Scroll Hint for long content */}
      {segments.length > 5 && (
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none flex items-end justify-center pb-2">
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
            Scroll for more ↓
          </p>
        </div>
      )}
    </motion.div>
  );
}
`;

// Find where to insert - before export function ExtremeAnswerPanel
const insertPoint = content.indexOf('export function ExtremeAnswerPanel');
if (insertPoint === -1) {
  console.error('Could not find export function ExtremeAnswerPanel');
  process.exit(1);
}

content = content.slice(0, insertPoint) + eli5Formatter + '\n' + content.slice(insertPoint);
fs.writeFileSync(path, content);
console.log('Eli5Formatter added successfully');
