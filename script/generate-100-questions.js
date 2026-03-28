#!/usr/bin/env node
/**
 * Quick Question Generator
 * Generates 100+ questions for local testing
 */

import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:local.db' });

const QUESTION_TEMPLATES = {
  'system-design': [
    { q: 'Design a URL shortening service like bit.ly. What are the key components?', d: 'intermediate' },
    { q: 'How would you design a distributed cache system?', d: 'advanced' },
    { q: 'Design a real-time notification system for a social network.', d: 'advanced' },
    { q: 'How would you design a search engine like Google?', d: 'advanced' },
    { q: 'Design a ride-sharing app like Uber.', d: 'intermediate' },
    { q: 'How would you design a content delivery network (CDN)?', d: 'intermediate' },
    { q: 'Design a chat application like WhatsApp.', d: 'intermediate' },
    { q: 'How would you design a file storage system like Dropbox?', d: 'intermediate' },
    { q: 'Design a news feed system like Facebook.', d: 'advanced' },
    { q: 'How would you design a parking lot management system?', d: 'beginner' },
    { q: 'Design an elevator system for a multi-story building.', d: 'intermediate' },
    { q: 'How would you design a Twitter-like microblogging platform?', d: 'advanced' },
  ],
  'algorithms': [
    { q: 'Explain the difference between BFS and DFS. When would you use each?', d: 'intermediate' },
    { q: 'How does a hash table work? What are collision resolution strategies?', d: 'intermediate' },
    { q: 'What is dynamic programming? When should you use it?', d: 'intermediate' },
    { q: 'Explain the quicksort algorithm and its time complexity.', d: 'intermediate' },
    { q: 'How would you find the shortest path in a weighted graph?', d: 'intermediate' },
    { q: 'What is a binary search tree? How do you balance it?', d: 'intermediate' },
    { q: 'Explain the sliding window technique with an example.', d: 'intermediate' },
    { q: 'How do you detect a cycle in a linked list?', d: 'beginner' },
    { q: 'What is the difference between merge sort and heap sort?', d: 'intermediate' },
    { q: 'Explain the two-pointer technique and its use cases.', d: 'intermediate' },
    { q: 'How would you implement a LRU cache?', d: 'advanced' },
    { q: 'What is topological sorting and when is it used?', d: 'intermediate' },
  ],
  'frontend': [
    { q: 'Explain the difference between useEffect and useLayoutEffect in React.', d: 'intermediate' },
    { q: 'How does the virtual DOM work in React?', d: 'intermediate' },
    { q: 'What is the purpose of React.memo and when should you use it?', d: 'intermediate' },
    { q: 'Explain the component lifecycle in React.', d: 'beginner' },
    { q: 'How does context API work in React? When should you use it?', d: 'intermediate' },
    { q: 'What are React hooks rules? Why do they exist?', d: 'beginner' },
    { q: 'Explain the difference between controlled and uncontrolled components.', d: 'intermediate' },
    { q: 'How would you optimize a React application for performance?', d: 'advanced' },
    { q: 'What is server-side rendering vs client-side rendering?', d: 'intermediate' },
    { q: 'Explain how CSS flexbox works.', d: 'beginner' },
    { q: 'What is the box model in CSS?', d: 'beginner' },
    { q: 'How does event bubbling and capturing work in JavaScript?', d: 'intermediate' },
  ],
  'backend': [
    { q: 'Explain the difference between REST and GraphQL APIs.', d: 'intermediate' },
    { q: 'What is the purpose of indexing in databases?', d: 'intermediate' },
    { q: 'How does OAuth 2.0 authentication work?', d: 'intermediate' },
    { q: 'What are microservices? What are their advantages and disadvantages?', d: 'intermediate' },
    { q: 'Explain the concept of message queues in distributed systems.', d: 'intermediate' },
    { q: 'What is the difference between SQL and NoSQL databases?', d: 'beginner' },
    { q: 'How would you implement authentication in a web application?', d: 'intermediate' },
    { q: 'What is caching? How would you implement it in a web app?', d: 'intermediate' },
    { q: 'Explain the CAP theorem.', d: 'advanced' },
    { q: 'What is database normalization?', d: 'beginner' },
    { q: 'How does a load balancer work?', d: 'intermediate' },
    { q: 'What are design patterns? Name a few commonly used ones.', d: 'intermediate' },
  ],
  'devops': [
    { q: 'What is Docker and how does it differ from a virtual machine?', d: 'beginner' },
    { q: 'Explain the Kubernetes architecture and its main components.', d: 'intermediate' },
    { q: 'What is CI/CD? Explain the pipeline stages.', d: 'beginner' },
    { q: 'How would you monitor a production application?', d: 'intermediate' },
    { q: 'What is Infrastructure as Code? What tools do you use?', d: 'intermediate' },
    { q: 'Explain the difference between Docker swarm and Kubernetes.', d: 'intermediate' },
    { q: 'What is GitOps and how does it work?', d: 'intermediate' },
    { q: 'How do you handle secrets management in DevOps?', d: 'intermediate' },
    { q: 'What is container orchestration?', d: 'beginner' },
    { q: 'Explain blue-green deployment strategy.', d: 'intermediate' },
    { q: 'What is Kubernetes service and how does it work?', d: 'intermediate' },
    { q: 'How would you implement logging in a distributed system?', d: 'intermediate' },
  ],
  'kubernetes': [
    { q: 'What is a Kubernetes Pod and how does it differ from a container?', d: 'beginner' },
    { q: 'Explain Kubernetes deployment strategies.', d: 'intermediate' },
    { q: 'What is a Kubernetes Service and what are its types?', d: 'intermediate' },
    { q: 'How does Kubernetes handle networking?', d: 'advanced' },
    { q: 'What are Kubernetes ConfigMaps and Secrets?', d: 'beginner' },
    { q: 'Explain the difference between StatefulSet and Deployment.', d: 'intermediate' },
    { q: 'What is a Kubernetes Ingress and how does it work?', d: 'intermediate' },
    { q: 'How would you secure a Kubernetes cluster?', d: 'advanced' },
    { q: 'What are Helm charts and why are they used?', d: 'beginner' },
    { q: 'Explain Kubernetes resource quotas and limits.', d: 'intermediate' },
    { q: 'What is Kubernetes namespace and when should you use it?', d: 'beginner' },
    { q: 'How does Kubernetes handle persistent storage?', d: 'intermediate' },
  ],
  'aws': [
    { q: 'Explain the difference between EC2 and Lambda.', d: 'intermediate' },
    { q: 'What is Amazon S3 and what are its storage classes?', d: 'intermediate' },
    { q: 'How does AWS IAM work? What are best practices?', d: 'intermediate' },
    { q: 'Explain Amazon RDS and its benefits over self-managed databases.', d: 'intermediate' },
    { q: 'What is Amazon VPC and how does it work?', d: 'intermediate' },
    { q: 'How does CloudFront CDN work?', d: 'intermediate' },
    { q: 'What is AWS Lambda and when should you use it?', d: 'intermediate' },
    { q: 'Explain the AWS shared responsibility model.', d: 'beginner' },
    { q: 'What is Amazon DynamoDB and how does it differ from RDS?', d: 'intermediate' },
    { q: 'How would you design a highly available architecture on AWS?', d: 'advanced' },
    { q: 'What is AWS Elastic Beanstalk?', d: 'beginner' },
    { q: 'Explain AWS security best practices.', d: 'intermediate' },
  ],
  'data-structures': [
    { q: 'What is the difference between an array and a linked list?', d: 'beginner' },
    { q: 'Explain the stack and queue data structures.', d: 'beginner' },
    { q: 'What is a hash table and how does it work?', d: 'intermediate' },
    { q: 'Explain binary trees and binary search trees.', d: 'intermediate' },
    { q: 'What is a heap data structure? What are its use cases?', d: 'intermediate' },
    { q: 'Explain the difference between B-tree and B+ tree.', d: 'advanced' },
    { q: 'What is a trie data structure? When is it used?', d: 'intermediate' },
    { q: 'Explain graph representations - adjacency matrix vs adjacency list.', d: 'intermediate' },
    { q: 'What is a red-black tree and why is it used?', d: 'advanced' },
    { q: 'Explain the difference between stack and heap memory.', d: 'beginner' },
    { q: 'What is a skip list and how does it work?', d: 'advanced' },
    { q: 'How would you implement a set data structure?', d: 'intermediate' },
  ],
  'security': [
    { q: 'What is XSS attack and how do you prevent it?', d: 'intermediate' },
    { q: 'Explain SQL injection and how to prevent it.', d: 'intermediate' },
    { q: 'What is CSRF attack and how does protection work?', d: 'intermediate' },
    { q: 'Explain the difference between symmetric and asymmetric encryption.', d: 'intermediate' },
    { q: 'What is HTTPS and how does it work?', d: 'beginner' },
    { q: 'What is authentication vs authorization?', d: 'beginner' },
    { q: 'Explain the OWASP Top 10 vulnerabilities.', d: 'intermediate' },
    { q: 'What is a DDoS attack and how do you mitigate it?', d: 'intermediate' },
    { q: 'What is OAuth 2.0 and how does it work?', d: 'intermediate' },
    { q: 'Explain the concept of security headers in HTTP.', d: 'intermediate' },
    { q: 'What is penetration testing?', d: 'beginner' },
    { q: 'How do you secure a REST API?', d: 'intermediate' },
  ],
  'machine-learning': [
    { q: 'Explain the difference between supervised and unsupervised learning.', d: 'beginner' },
    { q: 'What is overfitting and how do you prevent it?', d: 'intermediate' },
    { q: 'Explain the bias-variance tradeoff.', d: 'intermediate' },
    { q: 'What is gradient descent and how does it work?', d: 'intermediate' },
    { q: 'Explain the difference between classification and regression.', d: 'beginner' },
    { q: 'What is a neural network and how does it learn?', d: 'intermediate' },
    { q: 'Explain the backpropagation algorithm.', d: 'advanced' },
    { q: 'What is transfer learning and why is it useful?', d: 'intermediate' },
    { q: 'Explain the difference between precision and recall.', d: 'intermediate' },
    { q: 'What is feature engineering?', d: 'intermediate' },
    { q: 'How do you evaluate a machine learning model?', d: 'intermediate' },
    { q: 'What is the difference between bagging and boosting?', d: 'advanced' },
  ],
  'behavioral': [
    { q: 'Tell me about a challenging technical problem you solved.', d: 'intermediate' },
    { q: 'Describe a time you had a conflict with a team member.', d: 'intermediate' },
    { q: 'Tell me about a project you are most proud of.', d: 'beginner' },
    { q: 'How do you handle tight deadlines?', d: 'beginner' },
    { q: 'Describe a time you failed and what you learned.', d: 'intermediate' },
    { q: 'How do you prioritize tasks when everything is urgent?', d: 'intermediate' },
    { q: 'Tell me about a time you had to learn something quickly.', d: 'beginner' },
    { q: 'How do you handle criticism of your work?', d: 'intermediate' },
    { q: 'Describe your ideal work environment.', d: 'beginner' },
    { q: 'How do you stay updated with new technologies?', d: 'beginner' },
    { q: 'Tell me about a time you went above and beyond.', d: 'intermediate' },
    { q: 'How would you handle a difficult customer?', d: 'intermediate' },
  ],
};

const ANSWERS = {
  'system-design': [
    'Key components include: API server for handling requests, database for storing URL mappings, cache layer (Redis) for fast lookups, and load balancer for distributing traffic. Use base-62 encoding for generating unique short codes. Consider scalability with read replicas and CDN for static content.',
    'Use consistent hashing for distributing keys across cache nodes. Implement LRU or LFU eviction policies. Handle cache invalidation carefully, use replication for fault tolerance, and ensure partition tolerance using techniques like virtual nodes.',
    'Use WebSockets or Server-Sent Events for real-time communication. Implement a message queue (Kafka/RabbitMQ) for decoupling. Use push notification services (APNs/FCM) for mobile. Store notifications in a database with proper indexing for fast retrieval.',
    'Components include: crawler to collect web pages, indexer to process and categorize content, ranking algorithm (PageRank) to determine relevance, and search interface. Use distributed storage (GFS), MapReduce for processing, and BigTable for structured data.',
  ],
  'algorithms': [
    'BFS uses a queue and explores level by level, useful for finding shortest path in unweighted graphs. DFS uses a stack (or recursion) and goes deep first, useful for topological sorting, cycle detection, and solving puzzles. BFS uses more memory but finds shortest path; DFS uses less memory but may not find shortest path.',
    'A hash table uses a hash function to map keys to array indices. Collision resolution strategies include: chaining (linked list at each bucket), open addressing (linear probing, quadratic probing, double hashing). Load factor affects performance - typically maintain below 0.7.',
    'Dynamic programming solves problems by breaking them into overlapping subproblems and storing results. Use it when: problem has optimal substructure, subproblems repeat, and we can build solution from smaller subproblems. Examples: fibonacci, knapsack, longest common subsequence.',
  ],
  'frontend': [
    'useEffect runs asynchronously after the browser paints, while useLayoutEffect runs synchronously after DOM mutations but before the browser paints. Use useLayoutEffect when you need to make visual changes based on DOM measurements to prevent flicker.',
    'Virtual DOM is a lightweight copy of the real DOM. When state changes, React creates a new virtual DOM, compares it with previous (diffing), and calculates minimal changes to apply to real DOM (reconciliation). This improves performance by minimizing direct DOM manipulation.',
    'React.memo is a higher-order component that memoizes a component. It re-renders only when props change. Use it for pure components that render often with same props, but avoid if props are objects/arrays that are recreated each render.',
  ],
  'backend': [
    'REST uses fixed endpoints (GET/POST/PUT/DELETE) with multiple endpoints for related data. GraphQL uses a single endpoint where clients specify exactly what data they need. REST is simpler, GraphQL reduces over-fetching but adds complexity.',
    'Database indexes are data structures that improve query speed. Types: B-tree (default), hash (exact match), full-text. Trade-offs: faster reads but slower writes and more storage. Create indexes on columns frequently used in WHERE, JOIN, and ORDER BY clauses.',
    'OAuth 2.0 is an authorization framework. Flow: 1) User clicks "Login with Google", 2) App redirects to Google, 3) User grants permission, 4) Google redirects back with authorization code, 5) App exchanges code for access token, 6) App uses token to access resources.',
  ],
  'devops': [
    'Docker containers share the host OS kernel, making them lightweight and fast to start. VMs include full OS, taking minutes to start and more resources. Containers are portable, provide isolation, and are great for microservices.',
    'Kubernetes architecture: Master node (API server, etcd, scheduler, controller manager) controls the cluster. Worker nodes run pods (smallest deployable units) with containers. Users interact via kubectl or dashboard.',
    'CI/CD pipeline: 1) Code commit triggers build, 2) Automated tests run, 3) Code is packaged, 4) Deployment to staging, 5) Additional tests, 6) Deployment to production. Tools: Jenkins, GitLab CI, GitHub Actions.',
  ],
};

function generateId() {
  return crypto.randomUUID();
}

function getRandomTags(channel) {
  const tagsMap = {
    'system-design': ['scalability', 'distributed-systems', 'architecture'],
    'algorithms': ['data-structures', 'complexity', 'optimization'],
    'frontend': ['react', 'javascript', 'performance'],
    'backend': ['api', 'database', 'architecture'],
    'devops': ['docker', 'kubernetes', 'automation'],
    'kubernetes': ['containers', 'orchestration', 'cloud-native'],
    'aws': ['cloud', 'serverless', 'architecture'],
    'data-structures': ['arrays', 'trees', 'graphs'],
    'security': ['authentication', 'encryption', 'web-security'],
    'machine-learning': ['deep-learning', 'neural-networks', 'data-science'],
    'behavioral': ['soft-skills', 'communication', 'leadership'],
  };
  return tagsMap[channel] || ['general'];
}

async function generateQuestion(channel, template) {
  const id = generateId();
  const tags = getRandomTags(channel);
  
  // Generate answer based on template or use default
  let answer = '';
  if (ANSWERS[channel] && ANSWERS[channel].length > 0) {
    answer = ANSWERS[channel][Math.floor(Math.random() * ANSWERS[channel].length)];
  } else {
    answer = `This is a comprehensive answer about ${template.q.toLowerCase()}. Key points include understanding the fundamentals, practical implementation considerations, and best practices for production systems.`;
  }

  return {
    id,
    question: template.q,
    answer: answer,
    explanation: `This question tests knowledge of ${channel} concepts and practical application.`,
    difficulty: template.d,
    channel: channel,
    sub_channel: 'general',
    tags: JSON.stringify(tags),
    status: 'active',
    source_url: null,
    videos: null,
    companies: JSON.stringify(['Google', 'Meta', 'Amazon']),
    eli5: `In simple terms: ${template.q.split('?')[0]}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  console.log('🤖 Generating 100+ questions...\n');

  let totalGenerated = 0;
  const channels = Object.keys(QUESTION_TEMPLATES);

  // Distribute questions: 10 per channel × 10 channels = 100+ questions
  for (const channel of channels) {
    const templates = QUESTION_TEMPLATES[channel];
    const questionsToGen = Math.min(12, templates.length + Math.floor(Math.random() * 5));
    
    console.log(`📝 Generating ${questionsToGen} questions for ${channel}...`);
    
    for (let i = 0; i < questionsToGen; i++) {
      const template = templates[i % templates.length];
      const q = await generateQuestion(channel, template);
      
      try {
        await client.execute({
          sql: `INSERT INTO questions (id, question, answer, explanation, difficulty, channel, sub_channel, tags, status, source_url, videos, companies, eli5, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [q.id, q.question, q.answer, q.explanation, q.difficulty, q.channel, q.sub_channel, q.tags, q.status, q.source_url, q.videos, q.companies, q.eli5, q.created_at, q.updated_at]
        });
        totalGenerated++;
      } catch (err) {
        console.log(`  ⚠️  Error: ${err.message}`);
      }
    }
  }

  // Get final count
  const result = await client.execute({ sql: 'SELECT COUNT(*) as count FROM questions' });
  console.log(`\n✅ Generated ${totalGenerated} new questions`);
  console.log(`📊 Total questions in database: ${result.rows[0].count}`);
  
  // Show breakdown
  const breakdown = await client.execute({ sql: 'SELECT channel, COUNT(*) as count FROM questions GROUP BY channel ORDER BY count DESC' });
  console.log('\n📈 Breakdown by channel:');
  breakdown.rows.forEach(r => console.log(`  ${r.channel}: ${r.count}`));
  
  await client.close();
}

main().catch(console.error);
