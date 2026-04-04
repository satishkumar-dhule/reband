#!/usr/bin/env node
/**
 * Unified Data Pipeline - Generate content across all sections
 * Usage: node script/unified-data-pipeline.js --section=all --count=100
 */

import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:local.db' });

const CHANNELS = {
  questions: {
    algorithms: { subChannels: ['data-structures', 'sorting', 'dynamic-programming', 'graphs', 'trees'], target: 500 },
    'system-design': { subChannels: ['infrastructure', 'distributed-systems', 'api-design', 'caching', 'message-queues'], target: 300 },
    frontend: { subChannels: ['react', 'javascript', 'css', 'performance', 'web-apis'], target: 300 },
    backend: { subChannels: ['apis', 'microservices', 'caching', 'authentication', 'server-architecture'], target: 300 },
    database: { subChannels: ['sql', 'nosql', 'indexing', 'transactions', 'query-optimization'], target: 200 },
    devops: { subChannels: ['cicd', 'docker', 'automation', 'gitops'], target: 200 },
    security: { subChannels: ['web-security', 'authentication', 'cryptography', 'owasp'], target: 150 },
    'machine-learning': { subChannels: ['supervised', 'unsupervised', 'deep-learning', 'nlp'], target: 150 },
    'generative-ai': { subChannels: ['llm-fundamentals', 'fine-tuning', 'rag', 'agents', 'evaluation'], target: 150 },
    behavioral: { subChannels: ['star-method', 'leadership-principles', 'soft-skills', 'conflict-resolution'], target: 100 },
  },
  flashcards: {
    algorithms: { target: 200 },
    'system-design': { target: 100 },
    frontend: { target: 100 },
    backend: { target: 100 },
    database: { target: 80 },
    devops: { target: 80 },
    security: { target: 60 },
    'machine-learning': { target: 60 },
    'generative-ai': { target: 60 },
  },
  voiceSessions: {
    algorithms: { sessions: 20, perSession: 8 },
    'system-design': { sessions: 15, perSession: 6 },
    frontend: { sessions: 15, perSession: 6 },
    backend: { sessions: 15, perSession: 6 },
    behavioral: { sessions: 30, perSession: 4 },
    devops: { sessions: 10, perSession: 6 },
  },
  learningPaths: {
    company: { target: 20 },
    'job-title': { target: 15 },
    skill: { target: 25 },
    certification: { target: 10 },
  }
};

const COMPANIES = ['Google', 'Amazon', 'Meta', 'Netflix', 'Microsoft', 'Apple', 'Nvidia', 'Tesla', 'Uber', 'Airbnb'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const DIFFICULTY_WEIGHTS = [0.3, 0.5, 0.2];

function generateId() {
  return crypto.randomUUID();
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getDifficulty() {
  const r = Math.random();
  let cumulative = 0;
  for (let i = 0; i < DIFFICULTY_WEIGHTS.length; i++) {
    cumulative += DIFFICULTY_WEIGHTS[i];
    if (r < cumulative) return DIFFICULTIES[i];
  }
  return 'intermediate';
}

function randomCompanies(count = 3) {
  const shuffled = [...COMPANIES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Sample question templates per channel
const QUESTION_TEMPLATES = {
  algorithms: [
    'Explain the difference between BFS and DFS. When would you use each?',
    'How does a hash table work? What are collision resolution strategies?',
    'What is dynamic programming? When should you use it?',
    'Explain the quicksort algorithm and its time complexity.',
    'How would you find the shortest path in a weighted graph?',
    'What is a binary search tree? How do you balance it?',
    'Explain the sliding window technique with an example.',
    'How do you detect a cycle in a linked list?',
    'What is the difference between merge sort and heap sort?',
    'Explain the two-pointer technique and its use cases.',
    'How would you implement a LRU cache?',
    'What is topological sorting and when is it used?',
  ],
  frontend: [
    'Explain the difference between useEffect and useLayoutEffect in React.',
    'How does the virtual DOM work in React?',
    'What is the purpose of React.memo and when should you use it?',
    'Explain the component lifecycle in React.',
    'How does context API work in React? When should you use it?',
    'What are React hooks rules? Why do they exist?',
    'Explain the difference between controlled and uncontrolled components.',
    'How would you optimize a React application for performance?',
    'What is server-side rendering vs client-side rendering?',
    'Explain how CSS flexbox works.',
  ],
  backend: [
    'Explain the difference between REST and GraphQL APIs.',
    'What is the purpose of indexing in databases?',
    'How does OAuth 2.0 authentication work?',
    'What are microservices? What are their advantages and disadvantages?',
    'Explain the concept of message queues in distributed systems.',
    'What is the difference between SQL and NoSQL databases?',
    'How would you implement authentication in a web application?',
    'What is caching? How would you implement it in a web app?',
    'Explain the CAP theorem.',
    'What is database normalization?',
  ],
  'system-design': [
    'Design a URL shortening service like bit.ly. What are the key components?',
    'How would you design a distributed cache system?',
    'Design a real-time notification system for a social network.',
    'How would you design a search engine like Google?',
    'Design a ride-sharing app like Uber.',
    'How would you design a content delivery network (CDN)?',
    'Design a chat application like WhatsApp.',
    'How would you design a file storage system like Dropbox?',
    'Design a news feed system like Facebook.',
    'How would you design a parking lot management system?',
  ],
};

const ANSWER_TEMPLATES = {
  algorithms: [
    'BFS uses a queue and explores level by level, useful for finding shortest path in unweighted graphs. DFS uses a stack (or recursion) and goes deep first, useful for topological sorting, cycle detection, and solving puzzles.',
    'A hash table uses a hash function to map keys to array indices. Collision resolution strategies include: chaining (linked list at each bucket), open addressing (linear probing, quadratic probing, double hashing).',
    'Dynamic programming solves problems by breaking them into overlapping subproblems and storing results. Use it when: problem has optimal substructure, subproblems repeat, and we can build solution from smaller subproblems.',
    'Quicksort is a divide-and-conquer algorithm that selects a pivot and partitions the array around it. Average time complexity is O(n log n), worst case O(n²) when pivot selection is poor.',
  ],
  frontend: [
    'useEffect runs asynchronously after the browser paints, while useLayoutEffect runs synchronously after DOM mutations but before the browser paints. Use useLayoutEffect when you need to prevent flicker.',
    'Virtual DOM is a lightweight copy of the real DOM. When state changes, React creates a new virtual DOM, compares it with previous (diffing), and calculates minimal changes to apply to real DOM (reconciliation).',
    'React.memo is a higher-order component that memoizes a component. It re-renders only when props change. Use it for pure components that render often with same props.',
    'React component lifecycle has three phases: Mounting (constructor, render, componentDidMount), Updating (render, componentDidUpdate), and Unmounting (componentWillUnmount).',
  ],
  backend: [
    'REST uses fixed endpoints (GET/POST/PUT/DELETE) with multiple endpoints for related data. GraphQL uses a single endpoint where clients specify exactly what data they need. REST is simpler, GraphQL reduces over-fetching.',
    'Database indexes are data structures that improve query speed. Types: B-tree (default), hash (exact match), full-text. Trade-offs: faster reads but slower writes and more storage.',
    'OAuth 2.0 flow: 1) User clicks login, 2) App redirects to provider, 3) User grants permission, 4) Provider redirects with code, 5) App exchanges code for access token.',
  ],
  'system-design': [
    'Key components include: API server for handling requests, database for storing mappings, cache layer (Redis) for fast lookups, and load balancer for distributing traffic. Use base-62 encoding for generating unique codes.',
    'Use consistent hashing for distributing keys across cache nodes. Implement LRU or LFU eviction policies. Handle cache invalidation carefully, use replication for fault tolerance.',
    'Use WebSockets or Server-Sent Events for real-time communication. Implement a message queue (Kafka/RabbitMQ) for decoupling. Use push notification services for mobile.',
  ],
};

// Flashcard templates
const FLASHCARD_TEMPLATES = {
  algorithms: [
    { front: 'What is the time complexity of binary search?', back: 'O(log n) - halves the search space with each comparison' },
    { front: 'What data structure uses LIFO?', back: 'Stack - Last In, First Out' },
    { front: 'What data structure uses FIFO?', back: 'Queue - First In, First Out' },
    { front: 'What is the time complexity of quicksort average case?', back: 'O(n log n)' },
    { front: 'What is a hash collision?', back: 'When two different keys hash to the same index' },
  ],
  frontend: [
    { front: 'What hook runs after render?', back: 'useEffect - runs after DOM updates' },
    { front: 'What hook runs before paint?', back: 'useLayoutEffect - synchronous, before browser paint' },
    { front: 'What is React.memo for?', back: 'Memoization - prevents re-render if props unchanged' },
    { front: 'What does useCallback do?', back: 'Memoizes callback functions to prevent recreation' },
    { front: 'What does useMemo do?', back: 'Memoizes computed values' },
  ],
};

async function generateQuestions(channel, subChannel, count = 10) {
  const templates = QUESTION_TEMPLATES[channel] || QUESTION_TEMPLATES.algorithms;
  const answers = ANSWER_TEMPLATES[channel] || ANSWER_TEMPLATES.algorithms;
  
  const results = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * templates.length);
    const question = templates[idx];
    const answer = answers[idx] || 'Comprehensive answer covering key concepts and practical applications.';
    
    results.push({
      id: generateId(),
      question: question + ' (Generated)',
      answer,
      explanation: `This question tests knowledge of ${channel} concepts and practical application.`,
      difficulty: getDifficulty(),
      channel,
      sub_channel: subChannel,
      tags: JSON.stringify([channel, subChannel]),
      status: 'active',
      source_url: null,
      videos: null,
      companies: JSON.stringify(randomCompanies()),
      eli5: `Simple explanation of ${question.split('?')[0]}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  return results;
}

async function generateFlashcards(channel, count = 10) {
  const templates = FLASHCARD_TEMPLATES[channel] || FLASHCARD_TEMPLATES.algorithms;
  const results = [];
  
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * templates.length);
    const template = templates[idx];
    
    results.push({
      id: generateId(),
      channel,
      front: template.front + ' (Generated)',
      back: template.back,
      hint: null,
      code_example: null,
      difficulty: getDifficulty(),
      tags: JSON.stringify([channel]),
      category: channel,
      status: 'active',
      created_at: new Date().toISOString(),
    });
  }
  return results;
}

async function generateVoiceSession(channel, sessionNum) {
  return {
    id: generateId(),
    topic: `${channel} Practice Session ${sessionNum}`,
    description: `Practice interview questions for ${channel}`,
    channel,
    difficulty: randomFrom(DIFFICULTIES),
    questionIds: JSON.stringify([]), // Will be populated later
    totalQuestions: randomFrom([5, 6, 7, 8]),
    estimatedMinutes: randomFrom([15, 20, 25, 30]),
    created_at: new Date().toISOString(),
  };
}

async function generateLearningPath(type, num) {
  const titles = {
    company: ['Google SWE Interview Prep', 'Amazon Leadership Prep', 'Meta System Design'],
    'job-title': ['Frontend Engineer Path', 'Backend Engineer Path', 'SRE Interview Prep'],
    skill: ['Data Structures Mastery', 'System Design Fundamentals', 'React Deep Dive'],
    certification: ['AWS Solutions Architect', 'Kubernetes Administrator'],
  };
  
  const targets = titles[type] || titles.skill;
  
  return {
    id: generateId(),
    title: targets[num % targets.length] + ` #${num}`,
    description: `Comprehensive learning path for ${type} interview preparation`,
    path_type: type,
    target_company: type === 'company' ? targets[num % targets.length].split(' ')[0] : null,
    target_job_title: type === 'job-title' ? targets[num % targets.length] : null,
    difficulty: randomFrom(DIFFICULTIES),
    estimated_hours: randomFrom([20, 40, 60, 80]),
    question_ids: JSON.stringify([]),
    channels: JSON.stringify(['algorithms', 'system-design']),
    tags: JSON.stringify([type]),
    milestones: JSON.stringify([]),
    status: 'active',
    created_at: new Date().toISOString(),
  };
}

async function runSection(section, options = {}) {
  console.log(`\n📦 Running section: ${section}`);
  
  const counts = options.counts || { questions: 10, flashcards: 5, voiceSessions: 2, learningPaths: 1 };
  
  switch (section) {
    case 'questions':
    case 'all': {
      for (const [channel, config] of Object.entries(CHANNELS.questions)) {
        const questions = await generateQuestions(channel, config.subChannels[0], counts.questions);
        for (const q of questions) {
          try {
            await client.execute({
              sql: `INSERT INTO questions (id, question, answer, explanation, difficulty, channel, sub_channel, tags, status, source_url, videos, companies, eli5, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [q.id, q.question, q.answer, q.explanation, q.difficulty, q.channel, q.sub_channel, q.tags, q.status, q.source_url, q.videos, q.companies, q.eli5, q.created_at, q.updated_at]
            });
          } catch (e) { /* skip duplicates */ }
        }
        console.log(`  ✓ Generated ${questions.length} questions for ${channel}`);
      }
      break;
    }
    
    case 'flashcards':
    case 'all': {
      for (const [channel, config] of Object.entries(CHANNELS.flashcards)) {
        const cards = await generateFlashcards(channel, counts.flashcards);
        for (const c of cards) {
          try {
            await client.execute({
              sql: `INSERT INTO flashcards (id, channel, front, back, hint, code_example, difficulty, tags, category, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [c.id, c.channel, c.front, c.back, c.hint, c.code_example, c.difficulty, c.tags, c.category, c.status, c.created_at]
            });
          } catch (e) { /* skip */ }
        }
        console.log(`  ✓ Generated ${cards.length} flashcards for ${channel}`);
      }
      break;
    }
    
    case 'voice-sessions':
    case 'all': {
      for (const [channel, config] of Object.entries(CHANNELS.voiceSessions)) {
        for (let i = 0; i < config.sessions; i++) {
          const session = await generateVoiceSession(channel, i + 1);
          try {
            await client.execute({
              sql: `INSERT INTO voice_sessions (id, topic, description, channel, difficulty, question_ids, total_questions, estimated_minutes, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [session.id, session.topic, session.description, session.channel, session.difficulty, session.questionIds, session.totalQuestions, session.estimatedMinutes, session.created_at]
            });
          } catch (e) { /* skip */ }
        }
        console.log(`  ✓ Generated ${config.sessions} voice sessions for ${channel}`);
      }
      break;
    }
    
    case 'learning-paths':
    case 'all': {
      for (const [type, config] of Object.entries(CHANNELS.learningPaths)) {
        for (let i = 0; i < config.target; i++) {
          const path = await generateLearningPath(type, i);
          try {
            await client.execute({
              sql: `INSERT INTO learning_paths (id, title, description, path_type, target_company, target_job_title, difficulty, estimated_hours, question_ids, channels, tags, milestones, status, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              args: [path.id, path.title, path.description, path.path_type, path.target_company, path.target_job_title, path.difficulty, path.estimated_hours, path.question_ids, path.channels, path.tags, path.milestones, path.status, path.created_at]
            });
          } catch (e) { /* skip */ }
        }
        console.log(`  ✓ Generated ${config.target} learning paths for type: ${type}`);
      }
      break;
    }
  }
}

async function getStats() {
  const tables = ['questions', 'flashcards', 'voice_sessions', 'learning_paths', 'certifications'];
  const stats = {};
  for (const t of tables) {
    try {
      const result = await client.execute({ sql: `SELECT COUNT(*) as c FROM ${t}` });
      stats[t] = result.rows[0]?.c || 0;
    } catch (e) {
      stats[t] = 0;
    }
  }
  return stats;
}

async function main() {
  const args = process.argv.slice(2);
  const section = args.find(a => a.startsWith('--section='))?.split('=')[1] || 'all';
  const countsArg = args.find(a => a.startsWith('--counts='))?.split('=')[1] || '';
  
  const counts = { questions: 10, flashcards: 5, voiceSessions: 2, learningPaths: 1 };
  if (countsArg) {
    const [q, f, v, l] = countsArg.split(',').map(Number);
    if (!isNaN(q)) counts.questions = q;
    if (!isNaN(f)) counts.flashcards = f;
    if (!isNaN(v)) counts.voiceSessions = v;
    if (!isNaN(l)) counts.learningPaths = l;
  }

  console.log('🚀 Unified Data Pipeline Starting...');
  console.log(`   Section: ${section}`);
  console.log(`   Counts per channel:`, counts);

  const beforeStats = await getStats();
  console.log('\n📊 Before:', beforeStats);

  const sections = section === 'all' 
    ? ['questions', 'flashcards', 'voice-sessions', 'learning-paths']
    : [section];

  for (const s of sections) {
    await runSection(s, { counts });
  }

  const afterStats = await getStats();
  console.log('\n📊 After:', afterStats);
  console.log('\n✅ Pipeline complete!');

  await client.close();
}

main().catch(console.error);
