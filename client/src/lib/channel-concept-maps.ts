// Channel concept maps - structured topic breakdowns for each channel
// Used by: Channel Detail page, content generation scripts, learning paths

export interface ConceptNode {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites?: string[]; // concept IDs that should be learned first
  estimatedMinutes: number;
}

export interface ChannelConceptMap {
  channelId: string;
  overview: string; // 2-3 sentence description of the entire topic
  whyItMatters: string; // why this matters in interviews / real work
  coreConcepts: ConceptNode[]; // ordered learning path from basics to advanced
  interviewFocus: string[]; // what interviewers typically ask about
  relatedChannels: string[]; // channel IDs to study next
  recommendedOrder: string[]; // ordered concept IDs for learning
}

export const channelConceptMaps: Record<string, ChannelConceptMap> = {
  // ─── CS Fundamentals ───────────────────────────────────────────────

  'data-structures': {
    channelId: 'data-structures',
    overview: 'Data structures are the building blocks of efficient software. They define how data is organized, stored, and accessed — directly impacting the speed and memory usage of your programs. Mastering them is essential for technical interviews and real-world system design.',
    whyItMatters: 'Every coding interview tests data structure knowledge. Choosing the right structure is the difference between an O(n) and O(1) solution. In production, the wrong choice can mean the difference between a responsive app and a crashed server.',
    coreConcepts: [
      { id: 'arrays', name: 'Arrays & Strings', description: 'Contiguous memory, indexing, iteration patterns, two-pointer technique, sliding window', difficulty: 'beginner', estimatedMinutes: 45 },
      { id: 'linked-lists', name: 'Linked Lists', description: 'Singly and doubly linked lists, insertion, deletion, reversal, fast/slow pointer', difficulty: 'beginner', estimatedMinutes: 40 },
      { id: 'stacks-queues', name: 'Stacks & Queues', description: 'LIFO/FIFO, implementation, monotonic stacks, deque, circular buffers', difficulty: 'beginner', estimatedMinutes: 35 },
      { id: 'hash-tables', name: 'Hash Tables & Sets', description: 'Hash functions, collision resolution, HashMap, HashSet, frequency counting', difficulty: 'beginner', estimatedMinutes: 40 },
      { id: 'trees', name: 'Trees & Binary Trees', description: 'Tree traversal (inorder, preorder, postorder, level-order), BST properties, height, depth', difficulty: 'intermediate', prerequisites: ['linked-lists'], estimatedMinutes: 60 },
      { id: 'heaps', name: 'Heaps & Priority Queues', description: 'Min-heap, max-heap, heapify, top-K elements, heap sort', difficulty: 'intermediate', prerequisites: ['trees'], estimatedMinutes: 45 },
      { id: 'graphs', name: 'Graphs', description: 'Adjacency list/matrix, BFS, DFS, connected components, topological sort', difficulty: 'intermediate', prerequisites: ['trees'], estimatedMinutes: 60 },
      { id: 'tries', name: 'Tries (Prefix Trees)', description: 'Prefix matching, autocomplete, word search, insertion and lookup', difficulty: 'advanced', prerequisites: ['trees'], estimatedMinutes: 35 },
      { id: 'advanced-trees', name: 'Advanced Trees', description: 'AVL trees, Red-Black trees, segment trees, Fenwick trees', difficulty: 'advanced', prerequisites: ['trees', 'heaps'], estimatedMinutes: 50 },
    ],
    interviewFocus: ['When to use array vs linked list', 'Hash table collision handling', 'Tree traversal patterns', 'Graph BFS vs DFS', 'Heap for top-K problems'],
    relatedChannels: ['algorithms', 'complexity-analysis', 'dynamic-programming'],
    recommendedOrder: ['arrays', 'linked-lists', 'stacks-queues', 'hash-tables', 'trees', 'heaps', 'graphs', 'tries', 'advanced-trees'],
  },

  'complexity-analysis': {
    channelId: 'complexity-analysis',
    overview: 'Complexity analysis is the mathematical framework for measuring how efficiently an algorithm uses time and space. Big-O notation lets you predict how your code will scale as input grows — a critical skill for writing performant software.',
    whyItMatters: 'Interviewers expect you to analyze and discuss the complexity of every solution. Understanding complexity helps you choose between approaches and justify your design decisions.',
    coreConcepts: [
      { id: 'big-o-basics', name: 'Big-O Fundamentals', description: 'What Big-O means, common complexity classes (O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ))', difficulty: 'beginner', estimatedMinutes: 30 },
      { id: 'time-complexity', name: 'Time Complexity Analysis', description: 'Counting operations, best/average/worst case, amortized analysis', difficulty: 'beginner', estimatedMinutes: 40 },
      { id: 'space-complexity', name: 'Space Complexity Analysis', description: 'Memory usage, auxiliary space, recursion stack, in-place algorithms', difficulty: 'beginner', estimatedMinutes: 30 },
      { id: 'common-patterns', name: 'Common Complexity Patterns', description: 'Nested loops, recursive calls, divide and conquer, master theorem', difficulty: 'intermediate', prerequisites: ['time-complexity'], estimatedMinutes: 45 },
      { id: 'tradeoffs', name: 'Time-Space Tradeoffs', description: 'Memoization, caching, trading memory for speed, when to optimize', difficulty: 'intermediate', prerequisites: ['time-complexity', 'space-complexity'], estimatedMinutes: 35 },
    ],
    interviewFocus: ['Analyzing your own solution', 'Comparing two approaches', 'Explaining why O(n log n) beats O(n²)', 'Amortized analysis of dynamic arrays'],
    relatedChannels: ['algorithms', 'data-structures', 'dynamic-programming'],
    recommendedOrder: ['big-o-basics', 'time-complexity', 'space-complexity', 'common-patterns', 'tradeoffs'],
  },

  'algorithms': {
    channelId: 'algorithms',
    overview: 'Algorithms are step-by-step procedures for solving computational problems. From sorting and searching to graph traversal and optimization, algorithms form the core toolkit every engineer needs for technical interviews and efficient software design.',
    whyItMatters: 'Algorithmic thinking is the #1 skill tested in coding interviews. Knowing the right algorithm for a problem can reduce a brute-force solution from hours to milliseconds.',
    coreConcepts: [
      { id: 'sorting', name: 'Sorting Algorithms', description: 'Bubble, selection, insertion, merge, quick, heap sort — when to use each', difficulty: 'beginner', estimatedMinutes: 50 },
      { id: 'searching', name: 'Searching Algorithms', description: 'Linear search, binary search, binary search on answer space', difficulty: 'beginner', estimatedMinutes: 35 },
      { id: 'two-pointers', name: 'Two Pointers & Sliding Window', description: 'Array/string scanning, fixed and variable windows, subarray problems', difficulty: 'beginner', estimatedMinutes: 40 },
      { id: 'recursion', name: 'Recursion & Backtracking', description: 'Base cases, recursive trees, permutations, combinations, N-Queens', difficulty: 'intermediate', prerequisites: ['sorting'], estimatedMinutes: 55 },
      { id: 'divide-conquer', name: 'Divide & Conquer', description: 'Merge sort pattern, quickselect, closest pair, matrix multiplication', difficulty: 'intermediate', prerequisites: ['recursion'], estimatedMinutes: 40 },
      { id: 'greedy', name: 'Greedy Algorithms', description: 'Activity selection, interval scheduling, Huffman coding, when greedy works', difficulty: 'intermediate', estimatedMinutes: 45 },
      { id: 'graph-algorithms', name: 'Graph Algorithms', description: 'BFS, DFS, Dijkstra, Bellman-Ford, Floyd-Warshall, Kruskal, Prim', difficulty: 'advanced', prerequisites: ['recursion'], estimatedMinutes: 70 },
      { id: 'dynamic-programming', name: 'Dynamic Programming', description: 'Overlapping subproblems, optimal substructure, memoization, tabulation', difficulty: 'advanced', prerequisites: ['recursion', 'greedy'], estimatedMinutes: 75 },
    ],
    interviewFocus: ['Binary search variations', 'Sliding window patterns', 'Graph traversal applications', 'DP problem identification', 'Choosing the right algorithm'],
    relatedChannels: ['data-structures', 'complexity-analysis', 'dynamic-programming'],
    recommendedOrder: ['sorting', 'searching', 'two-pointers', 'recursion', 'divide-conquer', 'greedy', 'graph-algorithms', 'dynamic-programming'],
  },

  'dynamic-programming': {
    channelId: 'dynamic-programming',
    overview: 'Dynamic Programming (DP) is an optimization technique that solves complex problems by breaking them into overlapping subproblems and storing results to avoid redundant computation. It is one of the most feared interview topics — but follows predictable patterns.',
    whyItMatters: 'DP questions separate strong candidates from average ones at top companies. Once you recognize the patterns, DP becomes systematic rather than magical.',
    coreConcepts: [
      { id: 'dp-intro', name: 'DP Foundations', description: 'What makes a problem suitable for DP: overlapping subproblems + optimal substructure', difficulty: 'beginner', estimatedMinutes: 30 },
      { id: 'memoization', name: 'Top-Down (Memoization)', description: 'Recursive approach with caching, converting recursion to memoized solutions', difficulty: 'beginner', prerequisites: ['dp-intro'], estimatedMinutes: 40 },
      { id: 'tabulation', name: 'Bottom-Up (Tabulation)', description: 'Iterative approach, building DP table, space optimization', difficulty: 'intermediate', prerequisites: ['memoization'], estimatedMinutes: 45 },
      { id: '1d-dp', name: '1D DP Problems', description: 'Fibonacci, climbing stairs, house robber, coin change, longest increasing subsequence', difficulty: 'intermediate', prerequisites: ['tabulation'], estimatedMinutes: 55 },
      { id: '2d-dp', name: '2D DP Problems', description: 'Grid paths, edit distance, longest common subsequence, knapsack', difficulty: 'advanced', prerequisites: ['1d-dp'], estimatedMinutes: 65 },
      { id: 'interval-dp', name: 'Interval DP', description: 'Matrix chain multiplication, burst balloons, palindrome partitioning', difficulty: 'advanced', prerequisites: ['2d-dp'], estimatedMinutes: 50 },
      { id: 'dp-patterns', name: 'DP Pattern Recognition', description: 'How to identify DP problems, common templates, decision trees', difficulty: 'advanced', prerequisites: ['1d-dp', '2d-dp'], estimatedMinutes: 40 },
    ],
    interviewFocus: ['Identifying DP vs greedy', 'State definition and transitions', 'Space optimization from O(n²) to O(n)', 'Reconstructing the solution from DP table'],
    relatedChannels: ['algorithms', 'complexity-analysis', 'data-structures'],
    recommendedOrder: ['dp-intro', 'memoization', 'tabulation', '1d-dp', '2d-dp', 'interval-dp', 'dp-patterns'],
  },

  // ─── Engineering ───────────────────────────────────────────────────

  'system-design': {
    channelId: 'system-design',
    overview: 'System design is the art of architecting scalable, reliable, and maintainable software systems. It covers everything from load balancers and databases to caching strategies and microservices — the skills that separate senior engineers from juniors.',
    whyItMatters: 'System design interviews are the gatekeeper for senior roles. You need to demonstrate that you can design real-world systems like URL shorteners, chat apps, and social media feeds from scratch.',
    coreConcepts: [
      { id: 'sd-basics', name: 'System Design Fundamentals', description: 'Requirements gathering, capacity estimation, API design, high-level architecture', difficulty: 'beginner', estimatedMinutes: 40 },
      { id: 'load-balancing', name: 'Load Balancing', description: 'L4 vs L7, algorithms (round-robin, least connections, consistent hashing), health checks', difficulty: 'beginner', estimatedMinutes: 35 },
      { id: 'caching', name: 'Caching Strategies', description: 'CDN, Redis, Memcached, cache invalidation, write-through vs write-back, cache stampede', difficulty: 'intermediate', prerequisites: ['load-balancing'], estimatedMinutes: 50 },
      { id: 'databases', name: 'Database Design', description: 'SQL vs NoSQL, replication, sharding, CAP theorem, consistency models, indexing', difficulty: 'intermediate', estimatedMinutes: 60 },
      { id: 'messaging', name: 'Message Queues & Event Streaming', description: 'Kafka, RabbitMQ, pub/sub, event sourcing, CQRS, exactly-once delivery', difficulty: 'intermediate', prerequisites: ['databases'], estimatedMinutes: 45 },
      { id: 'microservices', name: 'Microservices Architecture', description: 'Service boundaries, API gateways, service mesh, distributed tracing, circuit breakers', difficulty: 'advanced', prerequisites: ['load-balancing', 'caching'], estimatedMinutes: 55 },
      { id: 'scalability', name: 'Scalability Patterns', description: 'Horizontal vs vertical scaling, read replicas, partitioning, rate limiting, backpressure', difficulty: 'advanced', prerequisites: ['databases', 'caching'], estimatedMinutes: 50 },
      { id: 'real-world', name: 'Real-World System Designs', description: 'Design URL shortener, Twitter, YouTube, Uber, WhatsApp — end-to-end walkthroughs', difficulty: 'advanced', prerequisites: ['microservices', 'scalability'], estimatedMinutes: 90 },
    ],
    interviewFocus: ['Requirements clarification', 'Tradeoff analysis (SQL vs NoSQL, consistency vs availability)', 'Capacity estimation', 'Handling failures and edge cases', 'Scaling from 1K to 1M users'],
    relatedChannels: ['backend', 'database', 'devops', 'kubernetes'],
    recommendedOrder: ['sd-basics', 'load-balancing', 'caching', 'databases', 'messaging', 'microservices', 'scalability', 'real-world'],
  },

  'frontend': {
    channelId: 'frontend',
    overview: 'Frontend engineering covers everything users see and interact with — from HTML/CSS fundamentals to modern React patterns, performance optimization, and accessibility. It is a rapidly evolving field that demands both technical depth and design sensibility.',
    whyItMatters: 'Frontend interviews test your understanding of the browser, JavaScript internals, framework patterns, and the ability to build performant, accessible user interfaces at scale.',
    coreConcepts: [
      { id: 'html-css', name: 'HTML & CSS Fundamentals', description: 'Semantic HTML, CSS box model, flexbox, grid, responsive design, media queries', difficulty: 'beginner', estimatedMinutes: 40 },
      { id: 'javascript', name: 'JavaScript Deep Dive', description: 'Closures, prototypes, event loop, promises, async/await, this binding, hoisting', difficulty: 'beginner', estimatedMinutes: 55 },
      { id: 'dom', name: 'DOM & Browser APIs', description: 'DOM manipulation, event delegation, Web APIs, intersection observer, requestAnimationFrame', difficulty: 'beginner', estimatedMinutes: 35 },
      { id: 'react-basics', name: 'React Fundamentals', description: 'Components, props, state, lifecycle, hooks (useState, useEffect, useContext)', difficulty: 'intermediate', prerequisites: ['javascript'], estimatedMinutes: 50 },
      { id: 'react-patterns', name: 'React Advanced Patterns', description: 'Custom hooks, context patterns, render props, compound components, HOCs', difficulty: 'intermediate', prerequisites: ['react-basics'], estimatedMinutes: 45 },
      { id: 'state-management', name: 'State Management', description: 'Local vs global state, Redux, Zustand, React Query, optimistic updates', difficulty: 'intermediate', prerequisites: ['react-basics'], estimatedMinutes: 40 },
      { id: 'performance', name: 'Frontend Performance', description: 'Bundle splitting, lazy loading, code splitting, memoization, virtual DOM, Core Web Vitals', difficulty: 'advanced', prerequisites: ['react-patterns'], estimatedMinutes: 50 },
      { id: 'testing-fe', name: 'Frontend Testing', description: 'Unit testing (Jest), component testing (RTL), E2E (Playwright), visual regression', difficulty: 'advanced', estimatedMinutes: 40 },
      { id: 'accessibility', name: 'Accessibility (a11y)', description: 'ARIA, keyboard navigation, screen readers, color contrast, semantic HTML, WCAG', difficulty: 'intermediate', estimatedMinutes: 35 },
    ],
    interviewFocus: ['JavaScript event loop', 'React reconciliation and rendering', 'CSS layout without frameworks', 'Performance optimization strategies', 'Building a component from scratch'],
    relatedChannels: ['testing', 'system-design', 'algorithms'],
    recommendedOrder: ['html-css', 'javascript', 'dom', 'react-basics', 'react-patterns', 'state-management', 'accessibility', 'performance', 'testing-fe'],
  },

  'backend': {
    channelId: 'backend',
    overview: 'Backend engineering is the engine room of software — APIs, databases, authentication, caching, and business logic. It is about building reliable, scalable services that power great user experiences.',
    whyItMatters: 'Backend interviews test your understanding of API design, database modeling, concurrency, distributed systems, and the ability to reason about system behavior under load.',
    coreConcepts: [
      { id: 'api-design', name: 'API Design', description: 'REST principles, GraphQL, RPC, versioning, pagination, error handling, idempotency', difficulty: 'beginner', estimatedMinutes: 45 },
      { id: 'auth', name: 'Authentication & Authorization', description: 'Sessions, JWT, OAuth 2.0, OpenID Connect, RBAC, API keys, CORS', difficulty: 'intermediate', prerequisites: ['api-design'], estimatedMinutes: 50 },
      { id: 'db-modeling', name: 'Database Modeling', description: 'Schema design, normalization, relationships, migrations, indexing strategies', difficulty: 'intermediate', estimatedMinutes: 45 },
      { id: 'caching-be', name: 'Backend Caching', description: 'Redis patterns, cache invalidation, CDN, HTTP caching headers, stale-while-revalidate', difficulty: 'intermediate', prerequisites: ['api-design'], estimatedMinutes: 40 },
      { id: 'async-processing', name: 'Async Processing', description: 'Message queues, background jobs, webhooks, event-driven architecture, retries', difficulty: 'advanced', prerequisites: ['api-design'], estimatedMinutes: 50 },
      { id: 'microservices-be', name: 'Microservices', description: 'Service decomposition, inter-service communication, distributed transactions, sagas', difficulty: 'advanced', prerequisites: ['db-modeling', 'async-processing'], estimatedMinutes: 55 },
      { id: 'monitoring', name: 'Monitoring & Observability', description: 'Logging, metrics, tracing, alerting, SLOs, error budgets, dashboards', difficulty: 'advanced', estimatedMinutes: 40 },
    ],
    interviewFocus: ['API design decisions', 'Database query optimization', 'Handling concurrent requests', 'Designing a rate limiter', 'Debugging production issues'],
    relatedChannels: ['database', 'system-design', 'devops', 'security'],
    recommendedOrder: ['api-design', 'auth', 'db-modeling', 'caching-be', 'async-processing', 'microservices-be', 'monitoring'],
  },

  'database': {
    channelId: 'database',
    overview: 'Databases are the foundation of persistent data storage. Understanding SQL, NoSQL, indexing, transactions, and query optimization is essential for any engineer who works with data — which is every engineer.',
    whyItMatters: 'Database questions appear in almost every backend and full-stack interview. Knowing when to use which database and how to query it efficiently is a core engineering skill.',
    coreConcepts: [
      { id: 'sql-basics', name: 'SQL Fundamentals', description: 'SELECT, JOIN, GROUP BY, subqueries, window functions, CTEs, transactions', difficulty: 'beginner', estimatedMinutes: 50 },
      { id: 'indexing', name: 'Indexing & Query Optimization', description: 'B-tree indexes, composite indexes, EXPLAIN plans, covering indexes, index selectivity', difficulty: 'intermediate', prerequisites: ['sql-basics'], estimatedMinutes: 45 },
      { id: 'nosql', name: 'NoSQL Databases', description: 'Document (MongoDB), key-value (Redis), column-family (Cassandra), graph (Neo4j)', difficulty: 'intermediate', prerequisites: ['sql-basics'], estimatedMinutes: 45 },
      { id: 'transactions', name: 'Transactions & ACID', description: 'ACID properties, isolation levels, locks, deadlocks, MVCC, serializability', difficulty: 'advanced', prerequisites: ['sql-basics'], estimatedMinutes: 50 },
      { id: 'replication', name: 'Replication & Sharding', description: 'Master-slave, multi-master, consistent hashing, partition strategies, read replicas', difficulty: 'advanced', prerequisites: ['indexing'], estimatedMinutes: 50 },
      { id: 'orm', name: 'ORM & Query Builders', description: 'Drizzle, Prisma, Sequelize, N+1 problem, migrations, connection pooling', difficulty: 'intermediate', prerequisites: ['sql-basics'], estimatedMinutes: 35 },
    ],
    interviewFocus: ['SQL query writing', 'Index design for a given query pattern', 'SQL vs NoSQL tradeoffs', 'Handling slow queries', 'Designing a schema for a given domain'],
    relatedChannels: ['backend', 'system-design', 'data-engineering'],
    recommendedOrder: ['sql-basics', 'indexing', 'nosql', 'orm', 'transactions', 'replication'],
  },

  // ─── DevOps & Cloud ────────────────────────────────────────────────

  'devops': {
    channelId: 'devops',
    overview: 'DevOps bridges development and operations — automating the path from code commit to production deployment. It encompasses CI/CD, infrastructure as code, containerization, monitoring, and the culture of shared ownership.',
    whyItMatters: 'DevOps interviews test your understanding of the entire software delivery pipeline. Companies want engineers who can not only write code but also deploy, monitor, and maintain it.',
    coreConcepts: [
      { id: 'ci-cd', name: 'CI/CD Pipelines', description: 'Continuous integration, continuous delivery, pipeline design, testing gates, blue-green deployments', difficulty: 'beginner', estimatedMinutes: 40 },
      { id: 'containers', name: 'Containers & Docker', description: 'Docker fundamentals, images, volumes, networking, Docker Compose, multi-stage builds', difficulty: 'beginner', estimatedMinutes: 45 },
      { id: 'iac', name: 'Infrastructure as Code', description: 'Terraform, CloudFormation, Pulumi, state management, modules, drift detection', difficulty: 'intermediate', prerequisites: ['containers'], estimatedMinutes: 50 },
      { id: 'orchestration', name: 'Container Orchestration', description: 'Kubernetes basics, pods, services, deployments, ingress, Helm charts', difficulty: 'intermediate', prerequisites: ['containers'], estimatedMinutes: 55 },
      { id: 'gitops', name: 'GitOps & Configuration Management', description: 'ArgoCD, Flux, Git as source of truth, declarative infrastructure, automated sync', difficulty: 'advanced', prerequisites: ['iac', 'orchestration'], estimatedMinutes: 40 },
      { id: 'monitoring-devops', name: 'Monitoring & Alerting', description: 'Prometheus, Grafana, log aggregation, alert routing, on-call, incident management', difficulty: 'advanced', estimatedMinutes: 45 },
    ],
    interviewFocus: ['CI/CD pipeline design', 'Docker vs VM tradeoffs', 'Kubernetes architecture', 'Rolling vs blue-green deployments', 'Debugging a failed deployment'],
    relatedChannels: ['kubernetes', 'system-design', 'sre', 'terraform'],
    recommendedOrder: ['ci-cd', 'containers', 'iac', 'orchestration', 'gitops', 'monitoring-devops'],
  },

  'kubernetes': {
    channelId: 'kubernetes',
    overview: 'Kubernetes is the industry standard for container orchestration. It manages the deployment, scaling, and operation of containerized applications across clusters of machines — making it essential knowledge for modern infrastructure roles.',
    whyItMatters: 'Kubernetes is one of the most in-demand skills in the job market. CKA/CKAD certifications validate hands-on expertise, and interviewers expect deep knowledge of K8s primitives.',
    coreConcepts: [
      { id: 'k8s-basics', name: 'Kubernetes Fundamentals', description: 'Architecture (API server, etcd, scheduler, kubelet), nodes, pods, namespaces', difficulty: 'beginner', estimatedMinutes: 45 },
      { id: 'workloads', name: 'Workload Resources', description: 'Deployments, StatefulSets, DaemonSets, Jobs, CronJobs, ReplicaSets', difficulty: 'beginner', prerequisites: ['k8s-basics'], estimatedMinutes: 50 },
      { id: 'services-networking', name: 'Services & Networking', description: 'ClusterIP, NodePort, LoadBalancer, Ingress, NetworkPolicies, DNS', difficulty: 'intermediate', prerequisites: ['k8s-basics'], estimatedMinutes: 50 },
      { id: 'storage', name: 'Storage & Volumes', description: 'PersistentVolumes, PersistentVolumeClaims, StorageClasses, ConfigMaps, Secrets', difficulty: 'intermediate', prerequisites: ['k8s-basics'], estimatedMinutes: 40 },
      { id: 'scheduling', name: 'Scheduling & Resource Management', description: 'Node selectors, taints/tolerations, affinity/anti-affinity, resource limits, QoS', difficulty: 'advanced', prerequisites: ['workloads'], estimatedMinutes: 45 },
      { id: 'security-k8s', name: 'Security', description: 'RBAC, service accounts, pod security standards, network policies, secrets management', difficulty: 'advanced', prerequisites: ['services-networking'], estimatedMinutes: 50 },
      { id: 'troubleshooting', name: 'Troubleshooting', description: 'Debugging pods, logs, events, kubectl exec, ephemeral containers, cluster health', difficulty: 'advanced', prerequisites: ['workloads', 'services-networking'], estimatedMinutes: 45 },
    ],
    interviewFocus: ['Pod lifecycle', 'Service types and when to use each', 'Debugging a CrashLoopBackOff', 'RBAC configuration', 'Horizontal Pod Autoscaler'],
    relatedChannels: ['devops', 'sre', 'docker', 'terraform'],
    recommendedOrder: ['k8s-basics', 'workloads', 'services-networking', 'storage', 'scheduling', 'security-k8s', 'troubleshooting'],
  },

  // ─── AI & ML ───────────────────────────────────────────────────────

  'machine-learning': {
    channelId: 'machine-learning',
    overview: 'Machine Learning enables computers to learn patterns from data and make predictions without explicit programming. From linear regression to neural networks, ML is transforming every industry and is a core skill for data-focused roles.',
    whyItMatters: 'ML interviews test both theoretical understanding and practical application. You need to know when to use which algorithm, how to evaluate models, and how to handle real-world data challenges.',
    coreConcepts: [
      { id: 'ml-basics', name: 'ML Foundations', description: 'Supervised vs unsupervised learning, training/test split, overfitting, cross-validation', difficulty: 'beginner', estimatedMinutes: 40 },
      { id: 'linear-models', name: 'Linear Models', description: 'Linear regression, logistic regression, regularization (L1/L2), gradient descent', difficulty: 'beginner', prerequisites: ['ml-basics'], estimatedMinutes: 45 },
      { id: 'trees-ensembles', name: 'Trees & Ensembles', description: 'Decision trees, random forests, gradient boosting (XGBoost, LightGBM)', difficulty: 'intermediate', prerequisites: ['linear-models'], estimatedMinutes: 50 },
      { id: 'svm-knn', name: 'SVM & Nearest Neighbors', description: 'Support vector machines, kernels, k-NN, distance metrics, curse of dimensionality', difficulty: 'intermediate', prerequisites: ['linear-models'], estimatedMinutes: 40 },
      { id: 'clustering', name: 'Clustering & Dimensionality Reduction', description: 'K-means, DBSCAN, hierarchical clustering, PCA, t-SNE, UMAP', difficulty: 'intermediate', prerequisites: ['ml-basics'], estimatedMinutes: 45 },
      { id: 'neural-networks', name: 'Neural Networks', description: 'Perceptrons, backpropagation, activation functions, layers, optimization', difficulty: 'advanced', prerequisites: ['linear-models'], estimatedMinutes: 55 },
      { id: 'model-eval', name: 'Model Evaluation & Selection', description: 'Precision, recall, F1, ROC-AUC, confusion matrix, hyperparameter tuning, bias-variance', difficulty: 'intermediate', prerequisites: ['ml-basics'], estimatedMinutes: 40 },
    ],
    interviewFocus: ['Bias-variance tradeoff', 'Choosing the right algorithm', 'Handling imbalanced data', 'Feature engineering', 'Explaining model predictions'],
    relatedChannels: ['data-engineering', 'generative-ai', 'python', 'computer-vision', 'nlp'],
    recommendedOrder: ['ml-basics', 'linear-models', 'model-eval', 'trees-ensembles', 'svm-knn', 'clustering', 'neural-networks'],
  },

  'generative-ai': {
    channelId: 'generative-ai',
    overview: 'Generative AI creates new content — text, images, code, audio — using large language models and diffusion models. It is the fastest-growing area in tech, powering everything from ChatGPT to autonomous agents.',
    whyItMatters: 'GenAI interviews test your understanding of transformer architecture, prompt engineering, RAG, fine-tuning, and the practical challenges of deploying LLMs in production.',
    coreConcepts: [
      { id: 'genai-basics', name: 'Generative AI Foundations', description: 'What is generative AI, LLMs, diffusion models, tokenization, context windows', difficulty: 'beginner', estimatedMinutes: 35 },
      { id: 'transformers', name: 'Transformer Architecture', description: 'Self-attention, multi-head attention, encoder-decoder, positional encoding', difficulty: 'intermediate', prerequisites: ['genai-basics'], estimatedMinutes: 55 },
      { id: 'prompt-engineering', name: 'Prompt Engineering', description: 'Zero-shot, few-shot, chain-of-thought, ReAct, prompt templates, evaluation', difficulty: 'beginner', prerequisites: ['genai-basics'], estimatedMinutes: 40 },
      { id: 'rag', name: 'RAG (Retrieval-Augmented Generation)', description: 'Vector databases, embeddings, retrieval pipelines, chunking strategies, hybrid search', difficulty: 'intermediate', prerequisites: ['transformers'], estimatedMinutes: 50 },
      { id: 'fine-tuning', name: 'Fine-Tuning & Adaptation', description: 'Full fine-tuning, LoRA, QLoRA, instruction tuning, RLHF, DPO', difficulty: 'advanced', prerequisites: ['transformers'], estimatedMinutes: 55 },
      { id: 'llm-apps', name: 'Building LLM Applications', description: 'LangChain, LlamaIndex, function calling, agents, tool use, evaluation frameworks', difficulty: 'intermediate', prerequisites: ['rag'], estimatedMinutes: 45 },
      { id: 'llm-ops', name: 'LLM Operations', description: 'Model serving, latency optimization, cost management, monitoring, guardrails', difficulty: 'advanced', prerequisites: ['llm-apps'], estimatedMinutes: 45 },
    ],
    interviewFocus: ['How transformers work', 'RAG architecture design', 'Prompt engineering best practices', 'Fine-tuning vs RAG tradeoffs', 'Handling hallucinations'],
    relatedChannels: ['machine-learning', 'prompt-engineering', 'llm-ops', 'nlp'],
    recommendedOrder: ['genai-basics', 'prompt-engineering', 'transformers', 'rag', 'llm-apps', 'fine-tuning', 'llm-ops'],
  },

  // ─── Security ──────────────────────────────────────────────────────

  'security': {
    channelId: 'security',
    overview: 'Application security protects software from vulnerabilities and attacks. From OWASP Top 10 to cryptography, secure coding practices to threat modeling, security is a first-class concern in modern software development.',
    whyItMatters: 'Security questions appear in every senior-level interview. Companies need engineers who can write secure code, identify vulnerabilities, and understand the attack surface of their systems.',
    coreConcepts: [
      { id: 'sec-basics', name: 'Security Fundamentals', description: 'CIA triad, threat modeling, attack vectors, security vs usability, defense in depth', difficulty: 'beginner', estimatedMinutes: 35 },
      { id: 'owasp', name: 'OWASP Top 10', description: 'Injection, XSS, CSRF, broken auth, SSRF, insecure deserialization, security misconfiguration', difficulty: 'beginner', prerequisites: ['sec-basics'], estimatedMinutes: 50 },
      { id: 'crypto', name: 'Cryptography', description: 'Symmetric/asymmetric encryption, hashing, digital signatures, certificates, TLS', difficulty: 'intermediate', prerequisites: ['sec-basics'], estimatedMinutes: 50 },
      { id: 'auth-security', name: 'Authentication Security', description: 'Password hashing (bcrypt, argon2), MFA, OAuth flows, session management, JWT security', difficulty: 'intermediate', prerequisites: ['crypto'], estimatedMinutes: 45 },
      { id: 'secure-coding', name: 'Secure Coding Practices', description: 'Input validation, output encoding, parameterized queries, least privilege, error handling', difficulty: 'intermediate', prerequisites: ['owasp'], estimatedMinutes: 40 },
      { id: 'appsec', name: 'Application Security Testing', description: 'SAST, DAST, dependency scanning, penetration testing, bug bounties, security reviews', difficulty: 'advanced', prerequisites: ['secure-coding'], estimatedMinutes: 45 },
    ],
    interviewFocus: ['Explaining a vulnerability and fix', 'SQL injection prevention', 'Secure session management', 'TLS handshake process', 'Designing a secure API'],
    relatedChannels: ['backend', 'networking', 'devops'],
    recommendedOrder: ['sec-basics', 'owasp', 'crypto', 'auth-security', 'secure-coding', 'appsec'],
  },

  // ─── Testing ───────────────────────────────────────────────────────

  'testing': {
    channelId: 'testing',
    overview: 'Testing ensures software works correctly and continues to work as it evolves. From unit tests to integration tests, testing is the safety net that enables confident refactoring and rapid deployment.',
    whyItMatters: 'Testing questions assess whether you write production-quality code. Companies want engineers who test their work, not engineers who hope it works.',
    coreConcepts: [
      { id: 'testing-basics', name: 'Testing Fundamentals', description: 'Why test, test pyramid, TDD, BDD, arrange-act-assert, test doubles', difficulty: 'beginner', estimatedMinutes: 35 },
      { id: 'unit-testing', name: 'Unit Testing', description: 'Jest, Vitest, mocking, stubs, spies, test coverage, edge cases', difficulty: 'beginner', prerequisites: ['testing-basics'], estimatedMinutes: 45 },
      { id: 'integration-testing', name: 'Integration Testing', description: 'API testing, database testing, test containers, fixture management', difficulty: 'intermediate', prerequisites: ['unit-testing'], estimatedMinutes: 40 },
      { id: 'component-testing', name: 'Component Testing', description: 'React Testing Library, rendering, user events, accessibility testing', difficulty: 'intermediate', prerequisites: ['unit-testing'], estimatedMinutes: 40 },
      { id: 'e2e-testing', name: 'End-to-End Testing', description: 'Playwright, Cypress, page objects, visual testing, flaky test management', difficulty: 'advanced', prerequisites: ['integration-testing'], estimatedMinutes: 50 },
      { id: 'test-strategy', name: 'Test Strategy & CI', description: 'When to test what, test selection, parallelization, code coverage thresholds', difficulty: 'advanced', estimatedMinutes: 35 },
    ],
    interviewFocus: ['Writing a test for a given function', 'Mocking external dependencies', 'Testing async code', 'What to test vs what not to test', 'Debugging a flaky test'],
    relatedChannels: ['frontend', 'backend', 'e2e-testing', 'api-testing'],
    recommendedOrder: ['testing-basics', 'unit-testing', 'integration-testing', 'component-testing', 'e2e-testing', 'test-strategy'],
  },

  // ─── Management ────────────────────────────────────────────────────

  'behavioral': {
    channelId: 'behavioral',
    overview: 'Behavioral interviews assess how you handle real-world situations: conflicts, failures, leadership, and teamwork. Using the STAR method (Situation, Task, Action, Result), you structure compelling stories from your experience.',
    whyItMatters: 'Behavioral interviews are 50% of the decision at many companies. Amazon famously uses leadership principles as a hard gate. Great technical skills mean nothing if you cannot communicate your impact.',
    coreConcepts: [
      { id: 'star-method', name: 'STAR Method', description: 'Situation, Task, Action, Result — the framework for structuring behavioral answers', difficulty: 'beginner', estimatedMinutes: 30 },
      { id: 'conflict', name: 'Conflict & Disagreement', description: 'Handling disagreements with teammates, managers, and stakeholders', difficulty: 'beginner', prerequisites: ['star-method'], estimatedMinutes: 30 },
      { id: 'failure', name: 'Failure & Learning', description: 'Discussing mistakes, production incidents, what you learned, how you improved', difficulty: 'beginner', prerequisites: ['star-method'], estimatedMinutes: 30 },
      { id: 'leadership', name: 'Leadership & Initiative', description: 'Taking ownership, mentoring, driving projects, influencing without authority', difficulty: 'intermediate', prerequisites: ['star-method'], estimatedMinutes: 35 },
      { id: 'prioritization', name: 'Prioritization & Tradeoffs', description: 'Managing competing deadlines, saying no, technical debt vs feature delivery', difficulty: 'intermediate', estimatedMinutes: 30 },
      { id: 'culture-fit', name: 'Culture & Values', description: 'Company values alignment, diversity, remote work, growth mindset', difficulty: 'beginner', estimatedMinutes: 25 },
    ],
    interviewFocus: ['Tell me about yourself', 'Biggest challenge you faced', 'Time you disagreed with a decision', 'How you handle ambiguity', 'Why this company'],
    relatedChannels: ['engineering-management', 'system-design'],
    recommendedOrder: ['star-method', 'conflict', 'failure', 'leadership', 'prioritization', 'culture-fit'],
  },
};

// Helper: get concept map for a channel
export function getChannelConceptMap(channelId: string): ChannelConceptMap | null {
  return channelConceptMaps[channelId] || null;
}

// Helper: get all concept IDs for a channel in recommended order
export function getConceptOrder(channelId: string): string[] {
  const map = channelConceptMaps[channelId];
  return map?.recommendedOrder || [];
}

// Helper: get concept by ID within a channel
export function getConcept(channelId: string, conceptId: string): ConceptNode | null {
  const map = channelConceptMaps[channelId];
  if (!map) return null;
  return map.coreConcepts.find(c => c.id === conceptId) || null;
}

// Helper: get beginner concepts for a channel
export function getBeginnerConcepts(channelId: string): ConceptNode[] {
  const map = channelConceptMaps[channelId];
  if (!map) return [];
  return map.coreConcepts.filter(c => c.difficulty === 'beginner');
}

// Helper: check if a channel has a concept map
export function hasConceptMap(channelId: string): boolean {
  return channelId in channelConceptMaps;
}
