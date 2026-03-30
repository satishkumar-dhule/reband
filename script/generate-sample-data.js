/**
 * Generate sample static JSON data for DevPrep app.
 * Run without a database to create realistic interview questions.
 * 
 * Usage: node script/generate-sample-data.js
 */

import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = 'client/public/data';

const channels = {
  algorithms: {
    name: 'Algorithms',
    questions: [
      {
        id: 'algo-001',
        question: 'Explain the difference between BFS and DFS. When would you use each?',
        answer: 'BFS (Breadth-First Search) explores level by level, using a queue. DFS (Depth-First Search) explores as deep as possible before backtracking, using a stack or recursion. Use BFS when you need the shortest path in an unweighted graph or want to find all neighbors first. Use DFS when you want to explore deep paths, detect cycles, or when memory is a concern for wide trees.',
        explanation: 'BFS guarantees shortest path in unweighted graphs but uses more memory. DFS uses less memory but may not find shortest path. The choice depends on the problem structure and what you need to find.',
        difficulty: 'beginner',
        channel: 'algorithms',
        subChannel: 'Graph Traversal',
        tags: ['BFS', 'DFS', 'graphs', 'traversal'],
        companies: ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft'],
        relevanceScore: 95,
        voiceSuitable: true,
        voiceKeywords: ['queue', 'stack', 'recursion', 'level-by-level', 'backtracking', 'shortest path'],
        isNew: true
      },
      {
        id: 'algo-002',
        question: 'What is the time complexity of quicksort in the worst case, average case, and best case?',
        answer: 'Worst case: O(n²) when pivot is always the smallest or largest element. Average case: O(n log n) when pivot randomly splits the array. Best case: O(n log n) when pivot is always the median.',
        explanation: 'Quicksort is a divide-and-conquer algorithm that partitions the array around a pivot. The efficiency depends on how balanced the partitions are. Randomizing the pivot or using median-of-three helps avoid worst-case behavior in practice.',
        difficulty: 'intermediate',
        channel: 'algorithms',
        subChannel: 'Sorting',
        tags: ['sorting', 'quicksort', 'time complexity', 'divide and conquer'],
        companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Goldman Sachs'],
        relevanceScore: 90,
        voiceSuitable: true,
        voiceKeywords: ['partition', 'pivot', 'divide and conquer', 'recursion', 'logarithmic', 'quadratic'],
        isNew: true
      },
      {
        id: 'algo-003',
        question: 'How would you find the kth largest element in an unsorted array?',
        answer: 'Use quickselect algorithm with average O(n) time. Select a random pivot, partition the array, and recursively search the partition containing the kth element. For guaranteed O(n), use the median of medians selection algorithm.',
        explanation: 'Quickselect is a selection algorithm based on quicksort partitioning. It has average linear time but worst-case O(n²). The BFPRT (median of medians) algorithm guarantees O(n) worst case but with higher constant factors.',
        difficulty: 'intermediate',
        channel: 'algorithms',
        subChannel: 'Selection',
        tags: ['quickselect', 'selection', 'partition', 'divide and conquer'],
        companies: ['Google', 'Amazon', 'Bloomberg', 'LinkedIn'],
        relevanceScore: 88,
        voiceSuitable: true,
        voiceKeywords: ['quickselect', 'partition', 'recursion', 'pivot', 'kth element', 'selection algorithm'],
        isNew: true
      },
      {
        id: 'algo-004',
        question: 'Explain the sliding window technique. Give an example problem where it is useful.',
        answer: 'Sliding window is a technique for processing subarrays/substrings by maintaining a "window" that slides through the data. Useful for finding subarrays meeting conditions like maximum sum of size k, longest substring with k distinct characters, or minimum size subarray sum.',
        explanation: 'Instead of computing for all possible subarrays (O(n²)), sliding window reduces to O(n) by reusing calculations from the previous window. Two types: fixed window size and dynamic window size that expands/contracts.',
        difficulty: 'beginner',
        channel: 'algorithms',
        subChannel: 'Two Pointers',
        tags: ['sliding window', 'arrays', 'strings', 'optimization'],
        companies: ['Meta', 'Amazon', 'Microsoft', 'Goldman Sachs', 'Apple'],
        relevanceScore: 92,
        voiceSuitable: true,
        voiceKeywords: ['window', 'subarray', 'substring', 'two pointers', 'O(n)', 'dynamic size'],
        isNew: true
      },
      {
        id: 'algo-005',
        question: 'What is binary search? When can it be applied?',
        answer: 'Binary search finds a target in a sorted array by repeatedly dividing the search interval in half. Apply only when data is sorted (or monotonic) and random access is available (O(1) lookup). Time: O(log n), Space: O(1) iteratively or O(log n) recursively.',
        explanation: 'Binary search works on sorted data by comparing the target with the middle element and eliminating half the remaining elements. Variations include finding first/last occurrence, insertion position, and search in rotated arrays.',
        difficulty: 'beginner',
        channel: 'algorithms',
        subChannel: 'Searching',
        tags: ['binary search', 'sorted arrays', 'searching', 'divide and conquer'],
        companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Bloomberg'],
        relevanceScore: 95,
        voiceSuitable: true,
        voiceKeywords: ['sorted', 'divide', 'half', 'logarithmic', 'middle', 'monotonic'],
        isNew: true
      }
    ]
  },
  'data-structures': {
    name: 'Data Structures',
    questions: [
      {
        id: 'ds-001',
        question: 'What is the difference between an array and a linked list?',
        answer: 'Arrays provide O(1) random access but O(n) insertion/deletion (shifting). Linked lists provide O(1) insertion/deletion at head but O(n) random access. Arrays have better cache locality; linked lists use extra memory for pointers.',
        explanation: 'Arrays store elements contiguously in memory, enabling fast random access but expensive modifications. Linked lists store elements scattered with pointers between them, enabling fast modifications but slow access.',
        difficulty: 'beginner',
        channel: 'data-structures',
        subChannel: 'Linear Structures',
        tags: ['arrays', 'linked lists', 'memory', 'time complexity'],
        companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'],
        relevanceScore: 95,
        voiceSuitable: true,
        voiceKeywords: ['contiguous', 'pointers', 'O(1)', 'O(n)', 'cache locality', 'random access'],
        isNew: true
      },
      {
        id: 'ds-002',
        question: 'Explain how a hash table works. What are collisions and how are they handled?',
        answer: 'Hash tables use a hash function to map keys to array indices. Collisions occur when two keys hash to the same index. Handle via chaining (linked list at each bucket) or open addressing (probe to next empty slot).',
        explanation: 'Good hash tables achieve O(1) average insert, delete, and lookup. Collisions degrade performance. Load factor (n/buckets) should stay below 0.7-0.75 for good performance.',
        difficulty: 'intermediate',
        channel: 'data-structures',
        subChannel: 'Hash Tables',
        tags: ['hash table', 'hash function', 'collisions', 'chaining', 'open addressing'],
        companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple', 'Uber'],
        relevanceScore: 93,
        voiceSuitable: true,
        voiceKeywords: ['hash function', 'bucket', 'collision', 'chaining', 'probing', 'load factor'],
        isNew: true
      },
      {
        id: 'ds-003',
        question: 'What are the differences between a stack and a queue?',
        answer: 'Stack: LIFO (Last In First Out) - push/pop from same end. Queue: FIFO (First In First Out) - enqueue at tail, dequeue at head. Both can be implemented with arrays or linked lists.',
        explanation: 'Stacks are used for DFS, function call stacks, undo mechanisms. Queues are used for BFS, task scheduling, breadth-first traversal, message queues.',
        difficulty: 'beginner',
        channel: 'data-structures',
        subChannel: 'Linear Structures',
        tags: ['stack', 'queue', 'LIFO', 'FIFO'],
        companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
        relevanceScore: 90,
        voiceSuitable: true,
        voiceKeywords: ['LIFO', 'FIFO', 'push', 'pop', 'enqueue', 'dequeue'],
        isNew: true
      },
      {
        id: 'ds-004',
        question: 'Explain the structure of a binary heap. What are its time complexities?',
        answer: 'Binary heap is a complete binary tree stored in array. Max-heap: parent >= children. Min-heap: parent <= children. Insert: O(log n), Extract Max/Min: O(log n), Peek: O(1). Used for priority queues and heapsort.',
        explanation: 'Heaps maintain the heap property - the root is the maximum (or minimum). The tree is complete, so array storage is efficient. Parent at i, children at 2i+1 and 2i+2.',
        difficulty: 'intermediate',
        channel: 'data-structures',
        subChannel: 'Trees',
        tags: ['heap', 'priority queue', 'binary tree', 'heapify'],
        companies: ['Google', 'Amazon', 'Microsoft', 'Bloomberg', 'Goldman Sachs'],
        relevanceScore: 85,
        voiceSuitable: true,
        voiceKeywords: ['complete tree', 'heap property', 'priority queue', 'heapify', 'logarithmic'],
        isNew: true
      },
      {
        id: 'ds-005',
        question: 'What is a trie (prefix tree)? When would you use it?',
        answer: 'Trie is a tree where each node represents a prefix. Each node has children for possible next characters. Used for autocomplete, IP routing, spell checking. Operations: insert O(m), search O(m), prefix search O(m) where m = word length.',
        explanation: 'Tries provide fast prefix-based lookups. Memory can be optimized with compressed tries ( Ternary Search Tree). Perfect for problems involving string prefixes or auto-complete.',
        difficulty: 'intermediate',
        channel: 'data-structures',
        subChannel: 'Trees',
        tags: ['trie', 'prefix tree', 'strings', 'autocomplete'],
        companies: ['Google', 'Meta', 'Amazon', 'Apple', 'Uber'],
        relevanceScore: 82,
        voiceSuitable: true,
        voiceKeywords: ['prefix', 'autocomplete', 'IP routing', 'spell check', 'dictionary'],
        isNew: true
      }
    ]
  },
  'system-design': {
    name: 'System Design',
    questions: [
      {
        id: 'sd-001',
        question: 'Design a URL shortening service like bit.ly. What are the key components?',
        answer: 'Key components: (1) Hash function for generating short codes (base62), (2) Database for mapping short->long URLs, (3) Load balancer, (4) Caching layer (Redis), (5) Analytics service. Considerations: handle collisions, rate limiting, analytics tracking, high availability.',
        explanation: 'URL shortening needs: unique ID generation (Snowflake or random + check), efficient lookup, caching for popular URLs, redirect handling. Scale considerations: billions of URLs, millions of requests/sec.',
        difficulty: 'intermediate',
        channel: 'system-design',
        subChannel: 'Web Services',
        tags: ['URL shortening', 'hash function', 'caching', 'database', 'load balancer'],
        companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Uber'],
        relevanceScore: 88,
        voiceSuitable: true,
        voiceKeywords: ['base62', 'hash', 'cache', 'redirect', 'unique ID', 'Snowflake'],
        isNew: true
      },
      {
        id: 'sd-002',
        question: 'How would you design a distributed cache system?',
        answer: 'Use consistent hashing to distribute keys across cache nodes. Each node owns a range of the hash ring. When adding/removing nodes, only O(1/n) keys need to move. Implement replication for fault tolerance. Use TTL for cache expiration.',
        explanation: 'Consistent hashing minimizes data movement during node changes. Virtual nodes improve load distribution. Cache invalidation strategies: write-through, write-back, cache-aside.',
        difficulty: 'advanced',
        channel: 'system-design',
        subChannel: 'Caching',
        tags: ['distributed cache', 'consistent hashing', 'cache invalidation', 'replication'],
        companies: ['Google', 'Amazon', 'Meta', 'Netflix', 'Uber'],
        relevanceScore: 85,
        voiceSuitable: true,
        voiceKeywords: ['consistent hashing', 'virtual nodes', 'cache miss', 'TTL', 'replication', 'sharding'],
        isNew: true
      },
      {
        id: 'sd-003',
        question: 'Design a rate limiting system. What algorithms would you use?',
        answer: 'Token bucket: tokens added at fixed rate, each request consumes token. Leaky bucket: requests processed at fixed rate. Both allow burst handling. Store counters in Redis with sliding window for accuracy. Consider distributed rate limiting using Redis INCR.',
        explanation: 'Rate limiting protects services from abuse. Token bucket allows bursts. Leaky bucket smooths requests. Sliding window is more accurate than fixed window but uses more memory.',
        difficulty: 'advanced',
        channel: 'system-design',
        subChannel: 'API Design',
        tags: ['rate limiting', 'token bucket', 'leaky bucket', 'throttling'],
        companies: ['Google', 'Meta', 'Amazon', 'Stripe', 'Uber'],
        relevanceScore: 82,
        voiceSuitable: true,
        voiceKeywords: ['token bucket', 'leaky bucket', 'throttle', 'quotas', 'distributed', 'Redis'],
        isNew: true
      },
      {
        id: 'sd-004',
        question: 'How does load balancing work? What algorithms are commonly used?',
        answer: 'Load balancers distribute traffic across servers. Algorithms: Round Robin (sequential), Least Connections (fewest active), IP Hash (session affinity), Weighted (capacity-based). Health checks route around failed servers.',
        explanation: 'Load balancers can be L4 (transport) or L7 (application). L7 can route based on content. Active health checks probe servers; passive checks detect failures from errors.',
        difficulty: 'intermediate',
        channel: 'system-design',
        subSubChannel: 'Infrastructure',
        tags: ['load balancing', 'round robin', 'health checks', 'high availability'],
        companies: ['Google', 'Amazon', 'Meta', 'Netflix', 'Microsoft'],
        relevanceScore: 85,
        voiceSuitable: true,
        voiceKeywords: ['round robin', 'least connections', 'health check', 'L4', 'L7', 'affinity'],
        isNew: true
      },
      {
        id: 'sd-005',
        question: 'Design a real-time notification system.',
        answer: 'Components: (1) Notification service receiving events, (2) Message queue (Kafka/RabbitMQ) for reliability, (3) Fanout service for multi-channel delivery, (4) Push notification service (APNS/FCM), (5) WebSocket server for real-time. Use idempotency keys to handle duplicates.',
        explanation: 'Notification systems need to handle spikes, maintain user preferences, track delivery status, and support multiple channels (push, email, SMS). Consider offline delivery and notification scheduling.',
        difficulty: 'advanced',
        channel: 'system-design',
        subChannel: 'Real-time Systems',
        tags: ['notifications', 'WebSocket', 'message queue', 'push notifications', 'event-driven'],
        companies: ['Meta', 'Amazon', 'Netflix', 'Uber', 'Spotify'],
        relevanceScore: 80,
        voiceSuitable: true,
        voiceKeywords: ['WebSocket', 'message queue', 'push', 'APNS', 'FCM', 'fanout', 'idempotency'],
        isNew: true
      },
      {
        id: 'sd-006',
        question: 'What is the CAP theorem? How do you choose between consistency and availability?',
        answer: 'CAP theorem: distributed systems can only guarantee 2 of 3 - Consistency, Availability, Partition tolerance. Since network partitions happen, you choose between CP (strong consistency, may be unavailable) or AP (high availability, eventual consistency).',
        explanation: 'Modern systems favor availability (AP) with eventual consistency. Use CP when transactions require strong consistency (banking). Use AP when stale reads are acceptable (social media likes).',
        difficulty: 'advanced',
        channel: 'system-design',
        subChannel: 'Distributed Systems',
        tags: ['CAP theorem', 'consistency', 'availability', 'partition tolerance', 'distributed systems'],
        companies: ['Google', 'Amazon', 'Meta', 'Netflix', 'Uber'],
        relevanceScore: 88,
        voiceSuitable: true,
        voiceKeywords: ['consistency', 'availability', 'partition', 'eventual consistency', 'strong consistency', 'network partition'],
        isNew: true
      }
    ]
  },
  frontend: {
    name: 'Frontend',
    questions: [
      {
        id: 'fe-001',
        question: 'Explain the virtual DOM. How does React use it for rendering?',
        answer: 'Virtual DOM is a JavaScript representation of the actual DOM. React creates a virtual tree, compares it with previous version (diffing), then calculates minimum changes needed (reconciliation), and batches updates to actual DOM. This minimizes expensive DOM operations.',
        explanation: 'DOM manipulation is slow; Virtual DOM reduces direct DOM manipulation. React uses a diffing algorithm to find differences and minimizes re-renders. Components re-render when state or props change.',
        difficulty: 'intermediate',
        channel: 'frontend',
        subChannel: 'React',
        tags: ['React', 'virtual DOM', 'reconciliation', 'rendering'],
        companies: ['Meta', 'Amazon', 'Microsoft', 'Netflix', 'Uber'],
        relevanceScore: 92,
        voiceSuitable: true,
        voiceKeywords: ['virtual DOM', 'diffing', 'reconciliation', 're-render', 'state', 'props'],
        isNew: true
      },
      {
        id: 'fe-002',
        question: 'What is the difference between useEffect and useLayoutEffect?',
        answer: 'useEffect runs asynchronously after the browser paints - use for data fetching, subscriptions. useLayoutEffect runs synchronously after DOM mutations but before paint - use for DOM measurements, preventing visual flicker. Prefer useEffect unless you need to block rendering.',
        explanation: 'useLayoutEffect fires before the browser repaints, allowing you to make DOM changes without showing intermediate states. Use sparingly as it blocks the browser from painting.',
        difficulty: 'intermediate',
        channel: 'frontend',
        subChannel: 'React Hooks',
        tags: ['React hooks', 'useEffect', 'useLayoutEffect', 'rendering'],
        companies: ['Meta', 'Amazon', 'Microsoft', 'Airbnb', 'Stripe'],
        relevanceScore: 88,
        voiceSuitable: true,
        voiceKeywords: ['synchronous', 'asynchronous', 'paint', 'DOM measurements', 'flicker', 'cleanup'],
        isNew: true
      },
      {
        id: 'fe-003',
        question: 'Explain CSS box model. What is the difference between content-box and border-box?',
        answer: 'Box model: content + padding + border + margin. content-box: width/height only includes content (default). border-box: width/height includes content + padding + border. Use border-box for predictable sizing.',
        explanation: 'box-sizing: border-box makes calculations easier - you set total size and padding/border are included. Modern CSS resets often set * { box-sizing: border-box }.',
        difficulty: 'beginner',
        channel: 'frontend',
        subChannel: 'CSS',
        tags: ['CSS', 'box model', 'layout', 'sizing'],
        companies: ['Meta', 'Amazon', 'Google', 'Shopify', 'Airbnb'],
        relevanceScore: 90,
        voiceSuitable: true,
        voiceKeywords: ['content', 'padding', 'border', 'margin', 'box-sizing', 'width', 'height'],
        isNew: true
      },
      {
        id: 'fe-004',
        question: 'What is closure in JavaScript? Provide an example.',
        answer: 'A closure is a function that remembers its lexical scope even when executed outside that scope. Example: inner function accessing outer function variables. Used for data privacy, function factories, maintaining state.',
        explanation: 'Closures are created every time a function is defined. They "close over" variables from their surrounding scope. Essential for callbacks, event handlers, and module patterns.',
        difficulty: 'intermediate',
        channel: 'frontend',
        subChannel: 'JavaScript',
        tags: ['JavaScript', 'closures', 'scope', 'lexical scope'],
        companies: ['Meta', 'Amazon', 'Google', 'Microsoft', 'Netflix'],
        relevanceScore: 93,
        voiceSuitable: true,
        voiceKeywords: ['function', 'scope', 'lexical', 'inner function', 'outer variable', 'closure'],
        isNew: true
      },
      {
        id: 'fe-005',
        question: 'How does event bubbling and capturing work in the DOM?',
        answer: 'Event propagation has 3 phases: capturing (root to target), at target, and bubbling (target to root). Events bubble by default - handlers on parent elements fire after child handlers. Use event.stopPropagation() to stop bubbling. Use capture phase with addEventListener third parameter.',
        explanation: 'Understanding event flow is crucial for event delegation - attaching one handler to parent instead of many to children. Useful for dynamic content and performance optimization.',
        difficulty: 'intermediate',
        channel: 'frontend',
        subChannel: 'JavaScript',
        tags: ['DOM', 'events', 'bubbling', 'capturing', 'event delegation'],
        companies: ['Meta', 'Amazon', 'Google', 'Microsoft', 'Shopify'],
        relevanceScore: 85,
        voiceSuitable: true,
        voiceKeywords: ['propagation', 'bubbling', 'capturing', 'stopPropagation', 'event delegation', 'target'],
        isNew: true
      },
      {
        id: 'fe-006',
        question: 'Explain the difference between CSS Grid and Flexbox.',
        answer: 'Flexbox is one-dimensional - layouts in a single row or column. Grid is two-dimensional - rows and columns simultaneously. Use Flexbox for component layouts (nav bars, cards), Grid for page layouts (overall structure).',
        explanation: 'Flexbox: justify-content, align-items for alignment along axis. Grid: template-rows, template-columns for explicit 2D structure. Both work together well.',
        difficulty: 'beginner',
        channel: 'frontend',
        subChannel: 'CSS',
        tags: ['CSS', 'Flexbox', 'Grid', 'layout'],
        companies: ['Meta', 'Amazon', 'Google', 'Airbnb', 'Shopify'],
        relevanceScore: 88,
        voiceSuitable: true,
        voiceKeywords: ['one-dimensional', 'two-dimensional', 'rows', 'columns', 'justify-content', 'template'],
        isNew: true
      }
    ]
  },
  backend: {
    name: 'Backend',
    questions: [
      {
        id: 'be-001',
        question: 'Explain RESTful API design principles. What makes an API truly RESTful?',
        answer: 'REST uses client-server architecture, stateless interactions, cacheable responses, uniform interfaces (resources as URLs), layered system. Use HTTP methods properly: GET (read), POST (create), PUT (update), DELETE (remove). Use status codes correctly.',
        explanation: 'True REST uses HATEOAS (hypermedia links). Most "REST" APIs are actually REST-like. Key principles: resource-oriented URLs, stateless, standard HTTP methods, proper status codes, JSON responses.',
        difficulty: 'intermediate',
        channel: 'backend',
        subChannel: 'API Design',
        tags: ['REST', 'API', 'HTTP', 'RESTful', 'web services'],
        companies: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Stripe'],
        relevanceScore: 90,
        voiceSuitable: true,
        voiceKeywords: ['REST', 'HTTP methods', 'status codes', 'resource', 'stateless', 'HATEOAS'],
        isNew: true
      },
      {
        id: 'be-002',
        question: 'What is the difference between SQL and NoSQL databases? When would you choose each?',
        answer: 'SQL: relational, structured data, ACID transactions, fixed schema. NoSQL: non-relational, flexible schema, horizontal scaling, eventual consistency. Choose SQL for transactions, complex queries, structured data. Choose NoSQL for scale, flexible schema, unstructured data.',
        explanation: 'SQL (PostgreSQL, MySQL): mature, strong consistency, complex queries. NoSQL (MongoDB, Cassandra): scale, flexibility, specific use cases. Many apps use both - polyglot persistence.',
        difficulty: 'intermediate',
        channel: 'backend',
        subChannel: 'Databases',
        tags: ['SQL', 'NoSQL', 'databases', 'ACID', 'eventual consistency'],
        companies: ['Amazon', 'Google', 'Meta', 'Netflix', 'Uber'],
        relevanceScore: 92,
        voiceSuitable: true,
        voiceKeywords: ['relational', 'ACID', 'schema', 'horizontal scaling', 'eventual consistency', 'polyglot'],
        isNew: true
      },
      {
        id: 'be-003',
        question: 'Explain the concept of database indexing. How does it improve query performance?',
        answer: 'Indexes are data structures (typically B-trees) that allow fast lookup without scanning entire table. Trade-off: faster reads, slower writes, more storage. Use on columns in WHERE, JOIN, ORDER BY. Avoid over-indexing.',
        explanation: 'Primary key is automatically indexed. Composite indexes follow left-to-right rule. Index cardinality matters - unique indexes more effective. Use EXPLAIN to analyze queries.',
        difficulty: 'intermediate',
        channel: 'backend',
        subChannel: 'Databases',
        tags: ['indexing', 'B-tree', 'performance', 'database', 'query optimization'],
        companies: ['Amazon', 'Google', 'Meta', 'Goldman Sachs', 'Bloomberg'],
        relevanceScore: 90,
        voiceSuitable: true,
        voiceKeywords: ['B-tree', 'index', 'cardinality', 'EXPLAIN', 'composite index', 'scan'],
        isNew: true
      },
      {
        id: 'be-004',
        question: 'What is microservices architecture? What are its advantages and challenges?',
        answer: 'Microservices: decompose app into independent services, each owning its data. Advantages: independent deployment, technology flexibility, team autonomy, scalability. Challenges: distributed systems complexity, data consistency, service discovery, monitoring.',
        explanation: 'Microservices suit large teams and complex applications. Start with monolith, extract services when needed. Use API gateway, service mesh, distributed tracing.',
        difficulty: 'intermediate',
        channel: 'backend',
        subChannel: 'Architecture',
        tags: ['microservices', 'monolith', 'distributed systems', 'API gateway', 'service discovery'],
        companies: ['Amazon', 'Netflix', 'Uber', 'Spotify', 'Meta'],
        relevanceScore: 88,
        voiceSuitable: true,
        voiceKeywords: ['independent deployment', 'service discovery', 'API gateway', 'distributed tracing', 'data consistency', 'polyglot'],
        isNew: true
      },
      {
        id: 'be-005',
        question: 'Explain authentication vs authorization. What are common authentication methods?',
        answer: 'Authentication: verify WHO you are (login). Authorization: verify WHAT you can do (permissions). Authentication methods: session-based, token-based (JWT), OAuth 2.0, API keys. Multi-factor adds extra security layer.',
        explanation: 'JWTs are stateless tokens for API authentication. OAuth 2.0 delegates authentication to identity providers. API keys identify applications, not users. MFA combines multiple factors (password + code, biometrics).',
        difficulty: 'intermediate',
        channel: 'backend',
        subChannel: 'Security',
        tags: ['authentication', 'authorization', 'JWT', 'OAuth', 'security', 'MFA'],
        companies: ['Amazon', 'Google', 'Meta', 'Stripe', 'Microsoft'],
        relevanceScore: 90,
        voiceSuitable: true,
        voiceKeywords: ['authentication', 'authorization', 'JWT', 'OAuth', 'token', 'session', 'MFA'],
        isNew: true
      },
      {
        id: 'be-006',
        question: 'What is caching and why is it important? Explain common caching strategies.',
        answer: 'Caching stores frequently accessed data in fast storage (memory). Strategies: Cache-aside (app manages), Write-through (sync), Write-back (async). Use Redis/Memcached. Consider cache invalidation patterns.',
        explanation: 'Caching reduces latency, database load, costs. TTL for expiration. Cache invalidation is hard - consider write-through for consistency, write-back for write-heavy. Cache stampede prevention with mutex/locking.',
        difficulty: 'intermediate',
        channel: 'backend',
        subSubChannel: 'Performance',
        tags: ['caching', 'Redis', 'cache invalidation', 'performance', 'memory'],
        companies: ['Amazon', 'Netflix', 'Meta', 'Google', 'Uber'],
        relevanceScore: 85,
        voiceSuitable: true,
        voiceKeywords: ['cache', 'Redis', 'invalidation', 'TTL', 'write-through', 'write-back', 'cache-aside'],
        isNew: true
      }
    ]
  }
};

function generateChannelsJson() {
  const channelStats = [];
  
  for (const [channelId, data] of Object.entries(channels)) {
    const questions = data.questions;
    const stats = {
      total: questions.length,
      beginner: questions.filter(q => q.difficulty === 'beginner').length,
      intermediate: questions.filter(q => q.difficulty === 'intermediate').length,
      advanced: questions.filter(q => q.difficulty === 'advanced').length
    };
    
    channelStats.push({
      id: channelId,
      questionCount: stats.total,
      total: stats.total,
      beginner: stats.beginner,
      intermediate: stats.intermediate,
      advanced: stats.advanced,
      newThisWeek: stats.total
    });
  }
  
  return channelStats;
}

function generateChannelFiles() {
  const channelData = {};
  
  for (const [channelId, data] of Object.entries(channels)) {
    const questions = data.questions;
    const subChannels = [...new Set(questions.map(q => q.subChannel))];
    const companies = [...new Set(questions.flatMap(q => q.companies || []))];
    const stats = {
      total: questions.length,
      beginner: questions.filter(q => q.difficulty === 'beginner').length,
      intermediate: questions.filter(q => q.difficulty === 'intermediate').length,
      advanced: questions.filter(q => q.difficulty === 'advanced').length
    };
    
    channelData[channelId] = {
      questions,
      subChannels: subChannels.sort(),
      companies: companies.sort(),
      stats
    };
  }
  
  return channelData;
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  console.log('Generating sample data for DevPrep...\n');
  
  ensureDir(OUTPUT_DIR);
  
  console.log('Generating channels.json...');
  const channelsJson = generateChannelsJson();
  fs.writeFileSync(path.join(OUTPUT_DIR, 'channels.json'), JSON.stringify(channelsJson, null, 0));
  console.log(`  ✓ Created channels.json with ${channelsJson.length} channels`);
  
  console.log('\nGenerating channel JSON files...');
  const channelData = generateChannelFiles();
  
  for (const [channelId, data] of Object.entries(channelData)) {
    const filePath = path.join(OUTPUT_DIR, `${channelId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 0));
    console.log(`  ✓ Created ${channelId}.json with ${data.questions.length} questions`);
  }
  
  console.log('\nGenerating all-questions.json (search index)...');
  const allQuestions = Object.values(channelData).flatMap(d => d.questions.map(q => ({
    id: q.id,
    question: q.question,
    channel: q.channel,
    subChannel: q.subChannel,
    difficulty: q.difficulty,
    tags: q.tags,
    companies: q.companies
  })));
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'all-questions.json'), JSON.stringify(allQuestions, null, 0));
  console.log(`  ✓ Created all-questions.json with ${allQuestions.length} questions`);
  
  console.log('\nGenerating stats.json...');
  const totalQuestions = Object.values(channelData).reduce((sum, d) => sum + d.questions.length, 0);
  const stats = {
    totalQuestions,
    totalChannels: Object.keys(channelData).length,
    channels: channelsJson,
    lastUpdated: new Date().toISOString()
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'stats.json'), JSON.stringify(stats, null, 0));
  console.log('  ✓ Created stats.json');
  
  console.log('\n✅ Sample data generation complete!');
  console.log(`   Files created in: ${OUTPUT_DIR}/`);
  console.log(`   - channels.json`);
  Object.keys(channelData).forEach(id => console.log(`   - ${id}.json`));
  console.log('   - all-questions.json');
  console.log('   - stats.json');
}

main();
