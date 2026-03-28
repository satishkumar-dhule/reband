import { useState } from 'react';
import { useLocation } from 'wouter';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useCredits } from '../context/CreditsContext';
import { EnhancedMermaid } from '../components/EnhancedMermaid';
import { ListenButton } from '../components/ListenButton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  Brain, ChevronLeft, Eye, Flame, Sparkles, Zap, Check, RotateCcw
} from 'lucide-react';

// Mock SRS data - replace with actual implementation
const mockReviewCards = [
  {
    id: 'q-1',
    question: 'How would you find all processes running on port 8080 and terminate them safely?',
    answer: 'Use `lsof -ti:8080 | xargs kill -9` or `netstat -tulpn | grep 8080` to find PIDs, then `kill -15 <PID>` for graceful shutdown.',
    tldr: 'Use lsof or netstat to find PIDs, then kill -15 for graceful termination',
    codeInterpretation: `\`\`\`bash
lsof -ti:8080 | xargs kill -15
\`\`\`

**Line-by-line breakdown:**

1. \`lsof -ti:8080\`
   - \`lsof\` = List Open Files command
   - \`-t\` = Output PIDs only (terse mode)
   - \`-i:8080\` = Filter by internet connections on port 8080
   - Returns: Space-separated list of process IDs

2. \`|\` = Pipe operator
   - Takes output from left command
   - Passes it as input to right command

3. \`xargs kill -15\`
   - \`xargs\` = Converts input into arguments
   - \`kill -15\` = Send SIGTERM signal (graceful shutdown)
   - Each PID becomes: \`kill -15 <PID>\`

**Example execution:**
\`\`\`bash
# If PIDs are 1234 and 5678
lsof -ti:8080        # Returns: 1234 5678
xargs kill -15       # Executes: kill -15 1234 5678
\`\`\``,
    explanation: `**Finding Processes:**
- \`lsof -ti:8080\` - Lists PIDs using port 8080
- \`netstat -tulpn | grep 8080\` - Alternative method

**Terminating Safely:**
- \`kill -15 <PID>\` - SIGTERM (graceful shutdown)
- \`kill -9 <PID>\` - SIGKILL (force kill, last resort)

**Best Practice:** Always try SIGTERM first to allow cleanup.`,
    diagram: `graph LR
    A[Port 8080] --> B[lsof -ti:8080]
    B --> C[Get PIDs]
    C --> D[kill -15 PID]
    D --> E{Process Stopped?}
    E -->|Yes| F[Done]
    E -->|No| G[kill -9 PID]`,
    difficulty: 'intermediate',
    channel: 'linux',
    dueDate: new Date(),
    interval: 1,
    easeFactor: 2.5
  },
  {
    id: 'q-2',
    question: 'What is the difference between TCP and UDP?',
    answer: 'TCP is connection-oriented, reliable, ordered delivery. UDP is connectionless, faster, no guaranteed delivery. TCP for accuracy, UDP for speed.',
    tldr: 'TCP = reliable & ordered, UDP = fast & connectionless',
    codeInterpretation: `\`\`\`python
# TCP Socket Example
import socket

# Create TCP socket
tcp_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
tcp_socket.connect(('server.com', 80))
tcp_socket.send(b'GET / HTTP/1.1')
\`\`\`

**Line-by-line breakdown:**

1. \`socket.socket(socket.AF_INET, socket.SOCK_STREAM)\`
   - \`AF_INET\` = IPv4 address family
   - \`SOCK_STREAM\` = TCP protocol (stream-based)
   - Creates a TCP socket object

2. \`tcp_socket.connect(('server.com', 80))\`
   - Initiates 3-way handshake
   - Establishes connection before data transfer
   - Blocks until connection established

3. \`tcp_socket.send(b'GET / HTTP/1.1')\`
   - Sends data reliably
   - Guarantees delivery and order
   - Waits for acknowledgment

**UDP Alternative:**
\`\`\`python
# UDP Socket - No connection needed
udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
udp_socket.sendto(b'data', ('server.com', 53))  # Fire and forget
\`\`\``,
    explanation: `**TCP (Transmission Control Protocol):**
- Connection-oriented (3-way handshake)
- Guaranteed delivery with acknowledgments
- Ordered packet delivery
- Flow control and congestion control
- Use cases: HTTP, FTP, Email

**UDP (User Datagram Protocol):**
- Connectionless (no handshake)
- No delivery guarantees
- No ordering
- Lower overhead, faster
- Use cases: DNS, Video streaming, Gaming`,
    difficulty: 'beginner',
    channel: 'networking',
    dueDate: new Date(),
    interval: 1,
    easeFactor: 2.5
  },
  {
    id: 'q-3',
    question: 'Explain the CAP theorem',
    answer: 'CAP theorem states distributed systems can only guarantee 2 of 3: Consistency, Availability, Partition tolerance. Must choose based on requirements.',
    tldr: 'Pick 2 of 3: Consistency, Availability, Partition tolerance',
    codeInterpretation: `\`\`\`javascript
// CP System Example (MongoDB)
const result = await db.collection.findOneAndUpdate(
  { _id: userId },
  { $inc: { balance: -100 } },
  { writeConcern: { w: 'majority' } }  // Wait for majority acknowledgment
);
\`\`\`

**Line-by-line breakdown:**

1. \`findOneAndUpdate({ _id: userId }, ...)\`
   - Atomic operation on single document
   - Finds document by ID and updates it

2. \`{ $inc: { balance: -100 } }\`
   - \`$inc\` = Increment operator
   - Decrements balance by 100
   - Atomic operation ensures consistency

3. \`{ writeConcern: { w: 'majority' } }\`
   - \`w: 'majority'\` = Wait for majority of nodes
   - Ensures **Consistency** across replicas
   - Sacrifices **Availability** during network partition
   - This is a **CP choice** (Consistency + Partition tolerance)

**AP System Alternative (Cassandra):**
\`\`\`javascript
// AP System - Always available, eventual consistency
await client.execute(
  'UPDATE users SET balance = balance - 100 WHERE id = ?',
  [userId],
  { consistency: cassandra.types.consistencies.one }  // Any node responds
);
\`\`\``,
    explanation: `**The Three Guarantees:**

1. **Consistency (C):** All nodes see the same data at the same time
2. **Availability (A):** Every request receives a response
3. **Partition Tolerance (P):** System continues despite network failures

**Trade-offs:**
- **CP Systems:** Consistent + Partition tolerant (MongoDB, HBase)
- **AP Systems:** Available + Partition tolerant (Cassandra, DynamoDB)
- **CA Systems:** Consistent + Available (Traditional RDBMS, but not truly distributed)

In practice, partition tolerance is mandatory for distributed systems, so you choose between CP or AP.`,
    diagram: `graph TD
    CAP[CAP Theorem] --> C[Consistency]
    CAP --> A[Availability]
    CAP --> P[Partition Tolerance]
    C --> CP[CP: MongoDB]
    A --> AP[AP: Cassandra]
    P --> CP
    P --> AP`,
    difficulty: 'advanced',
    channel: 'system-design',
    dueDate: new Date(),
    interval: 1,
    easeFactor: 2.5
  }
];

const confidenceLevels = [
  { id: 'again', label: 'Again', color: 'gh-label-red', interval: 1 },
  { id: 'hard', label: 'Hard', color: 'gh-label-yellow', interval: 2 },
  { id: 'good', label: 'Good', color: 'gh-label-blue', interval: 4 },
  { id: 'easy', label: 'Easy', color: 'gh-label-green', interval: 7 }
];

// Diagram section
function DiagramSection({ diagram }: { diagram: string }) {
  const [renderSuccess, setRenderSuccess] = useState<boolean | null>(null);
  
  if (renderSuccess === false) return null;
  
  return (
    <div className="mt-4 p-4 gh-card bg-[var(--gh-canvas-inset)]">
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-[var(--gh-fg-muted)]" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--gh-fg-muted)]">Diagram</span>
      </div>
      <div className="overflow-x-auto">
        <EnhancedMermaid 
          chart={diagram} 
          onRenderResult={(success) => setRenderSuccess(success)}
        />
      </div>
    </div>
  );
}

// Markdown preprocessing
function preprocessMarkdown(text: string): string {
  if (!text) return '';
  let processed = text;
  processed = processed.replace(/([^\n])(```)/g, '$1\n$2');
  processed = processed.replace(/(```\w*)\s*\n?\s*([^\n`])/g, '$1\n$2');
  processed = processed.replace(/^\*\*\s*$/gm, '');
  processed = processed.replace(/\*\*\s*\n\s*([^*]+)\*\*/g, '**$1**');
  processed = processed.replace(/^[•·]\s*/gm, '- ');
  processed = processed.replace(/\n{3,}/g, '\n\n');
  return processed.trim();
}

export default function ReviewSessionGenZ() {
  const [, setLocation] = useLocation();
  const { onSRSReview } = useCredits();
  const [cards] = useState(mockReviewCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [streak, setStreak] = useState(0);

  const currentCard = cards[currentIndex];
  const progress = (reviewedCount / cards.length) * 100;

  const handleConfidence = (level: string) => {
    const rating = level as 'again' | 'hard' | 'good' | 'easy';
    onSRSReview(rating);

    setReviewedCount(prev => prev + 1);
    setStreak(prev => level === 'easy' || level === 'good' ? prev + 1 : 0);
    setShowAnswer(false);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setLocation('/stats');
    }
  };

  const handleRevealAnswer = () => {
    setShowAnswer(true);
  };

  if (!currentCard) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="w-16 h-16 bg-[var(--gh-success-subtle)] text-[var(--gh-success-fg)] rounded-full flex items-center justify-center mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-[var(--gh-fg)] mb-2">Review Complete!</h2>
          <p className="text-[var(--gh-fg-muted)] mb-6 text-center">
            You've reviewed all cards for today. Your memory is leveling up!
          </p>
          <button
            onClick={() => setLocation('/')}
            className="gh-btn gh-btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <SEOHead
        title="SRS Review - Spaced Repetition 🧠"
        description="Review your cards with spaced repetition"
        canonical="https://open-interview.github.io/review"
      />

      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setLocation('/')}
                className="flex items-center gap-1 text-sm text-[var(--gh-accent-fg)] hover:underline"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Dashboard
              </button>

              <div className="flex items-center gap-4 text-sm font-medium">
                <div className="flex items-center gap-1.5 text-[var(--gh-attention-fg)]">
                  <Flame className="w-4 h-4" />
                  <span>Streak: {streak}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--gh-fg-muted)]">
                  <Brain className="w-4 h-4" />
                  <span>{reviewedCount} / {cards.length}</span>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="gh-progress">
              <div 
                className="gh-progress-bar" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Card Container */}
          <div className="gh-card shadow-sm overflow-hidden">
            {/* Card Content */}
            <div className="p-6 md:p-8">
              {/* Metadata */}
              <div className="flex items-center gap-2 mb-6">
                <span className="gh-label gh-label-gray uppercase text-[10px]">
                  {currentCard.channel}
                </span>
                <span className={`gh-label text-[10px] uppercase ${
                  currentCard.difficulty === 'beginner' ? 'gh-label-green' :
                  currentCard.difficulty === 'intermediate' ? 'gh-label-yellow' :
                  'gh-label-red'
                }`}>
                  {currentCard.difficulty}
                </span>
              </div>

              {/* Question */}
              <div className="min-h-[120px] flex items-center justify-center mb-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-center text-[var(--gh-fg)] leading-snug">
                  {currentCard.question}
                </h2>
              </div>

              {/* Action Area */}
              {!showAnswer ? (
                <div className="flex justify-center">
                  <button
                    onClick={handleRevealAnswer}
                    className="gh-btn gh-btn-primary px-8 py-2.5 text-base"
                  >
                    Reveal Answer
                  </button>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* TLDR */}
                  {currentCard.tldr && (
                    <div className="p-4 rounded-md border-l-4 border-[var(--gh-accent-fg)] bg-[var(--gh-canvas-subtle)]">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                        <span className="text-xs font-bold uppercase text-[var(--gh-accent-fg)]">TL;DR</span>
                      </div>
                      <p className="text-sm text-[var(--gh-fg)]">{currentCard.tldr}</p>
                    </div>
                  )}

                  {/* Main Answer */}
                  <div className="p-6 bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-md">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--gh-accent-fg)]" />
                        <span className="font-semibold text-[var(--gh-fg)]">Full Answer</span>
                      </div>
                      <ListenButton 
                        text={`${currentCard.answer}${currentCard.explanation ? '. ' + currentCard.explanation : ''}`}
                        label="Listen"
                        size="sm"
                      />
                    </div>
                    <p className="text-lg text-[var(--gh-fg)] leading-relaxed">
                      {currentCard.answer}
                    </p>
                  </div>

                  {/* Code Interpretation */}
                  {currentCard.codeInterpretation && (
                    <div className="p-6 bg-[var(--gh-canvas-inset)] border border-[var(--gh-border)] rounded-md">
                      <div className="flex items-center gap-2 mb-4">
                        <Check className="w-4 h-4 text-[var(--gh-fg-muted)]" />
                        <span className="font-bold uppercase text-xs text-[var(--gh-fg-muted)] tracking-wider">Analysis</span>
                      </div>
                      <div className="prose prose-sm max-w-none prose-slate">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ className, children }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match && !String(children).includes('\n');
                              
                              if (isInline) {
                                return (
                                  <code className="px-1.5 py-0.5 rounded bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-xs font-mono text-[var(--gh-fg)]">
                                    {children}
                                  </code>
                                );
                              }
                              
                              return (
                                <div className="my-4 rounded-md overflow-hidden border border-[var(--gh-border)]">
                                  <SyntaxHighlighter
                                    language={match ? match[1] : 'text'}
                                    style={vscDarkPlus}
                                    customStyle={{ 
                                      margin: 0, 
                                      padding: '1rem',
                                      fontSize: '0.85rem',
                                    }}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              );
                            },
                            p: ({children}) => <p className="mb-3 text-[var(--gh-fg-muted)]">{children}</p>,
                            strong: ({children}) => <strong className="font-semibold text-[var(--gh-fg)]">{children}</strong>,
                            ul: ({children}) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                            li: ({children}) => <li className="text-[var(--gh-fg-muted)]">{children}</li>
                          }}
                        >
                          {preprocessMarkdown(currentCard.codeInterpretation)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Diagram */}
                  {currentCard.diagram && <DiagramSection diagram={currentCard.diagram} />}

                  {/* Rating Section */}
                  <div className="pt-6 border-t border-[var(--gh-border)]">
                    <p className="text-center text-sm font-medium text-[var(--gh-fg-muted)] mb-4">
                      How well did you know this?
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {confidenceLevels.map((level) => (
                        <button
                          key={level.id}
                          onClick={() => handleConfidence(level.id)}
                          className="gh-btn gh-btn-outline group relative"
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            level.id === 'again' ? 'bg-[var(--gh-danger-emphasis)]' :
                            level.id === 'hard' ? 'bg-[var(--gh-attention-emphasis)]' :
                            level.id === 'good' ? 'bg-[var(--gh-accent-emphasis)]' :
                            'bg-[var(--gh-success-emphasis)]'
                          }`} />
                          {level.label}
                          <span className="ml-2 text-[10px] text-[var(--gh-fg-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
                            {level.interval}d
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Footer */}
            <div className="px-6 py-4 bg-[var(--gh-canvas-subtle)] border-t border-[var(--gh-border)] flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[var(--gh-fg-subtle)]">
              <span>Spaced Repetition System</span>
              <div className="flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                <span>Active Session</span>
              </div>
            </div>
          </div>

          {/* Hint */}
          {!showAnswer && (
            <div className="mt-8 p-4 gh-card bg-[var(--gh-accent-subtle)] border-[var(--gh-border)] flex gap-3 items-start">
              <Zap className="w-4 h-4 text-[var(--gh-accent-fg)] mt-0.5" />
              <div className="text-sm text-[var(--gh-fg)]">
                <p className="font-semibold mb-1">Pro Tip</p>
                <p>Try to recall the answer out loud or write it down before revealing. This strengthens memory recall neural pathways!</p>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
