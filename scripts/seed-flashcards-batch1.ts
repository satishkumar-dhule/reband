/**
 * Issue #61 — Flashcards batch 1: algorithms, frontend, backend, machine-learning, generative-ai, security
 * Run: npx tsx scripts/seed-flashcards-batch1.ts
 */
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({ url: "file:local.db" });
const NOW = new Date().toISOString();
const id = () => crypto.randomUUID();

const flashcards = [
  // ── ALGORITHMS ────────────────────────────────────────────────────────────
  { channel: "algorithms", front: "What is the time complexity of binary search?", back: "O(log n) — halves search space each iteration. Requires sorted array." },
  { channel: "algorithms", front: "What data structure does BFS use?", back: "Queue (FIFO). BFS processes nodes level by level using a queue." },
  { channel: "algorithms", front: "What data structure does DFS use?", back: "Stack (LIFO) — or the call stack when implemented recursively." },
  { channel: "algorithms", front: "Worst case time complexity of bubble sort?", back: "O(n²) — compares every pair. Use only for nearly-sorted small arrays." },
  { channel: "algorithms", front: "What makes a sorting algorithm 'stable'?", back: "A stable sort preserves the relative order of equal elements (e.g., merge sort is stable; quicksort is not)." },
  { channel: "algorithms", front: "Time complexity of heap operations (insert, extract-min)?", back: "O(log n) for both insert and extract-min/max. Building a heap from n elements is O(n)." },
  { channel: "algorithms", front: "What is memoization?", back: "Caching the results of expensive function calls so they aren't recomputed. Top-down dynamic programming technique." },
  { channel: "algorithms", front: "What is the difference between memoization and tabulation?", back: "Memoization: top-down, recursive, caches as needed. Tabulation: bottom-up, iterative, fills a table from base cases up." },
  { channel: "algorithms", front: "What is the Master Theorem used for?", back: "Solving recurrences of the form T(n) = aT(n/b) + f(n). Used to analyze divide-and-conquer algorithms like merge sort." },
  { channel: "algorithms", front: "Recurrence relation for merge sort?", back: "T(n) = 2T(n/2) + O(n) → O(n log n) by Master Theorem (Case 2)." },
  { channel: "algorithms", front: "What is a topological sort and when can you use it?", back: "A linear ordering of vertices such that for every edge u→v, u comes before v. Only possible on Directed Acyclic Graphs (DAGs)." },
  { channel: "algorithms", front: "What is the Floyd-Warshall algorithm used for?", back: "All-pairs shortest paths in a weighted graph. O(V³) time. Works with negative edges (no negative cycles). Uses dynamic programming." },
  { channel: "algorithms", front: "What is a greedy algorithm and when does it fail?", back: "Makes the locally optimal choice at each step. Fails when local optima don't lead to the global optimum (e.g., 0/1 Knapsack requires DP, not greedy)." },
  { channel: "algorithms", front: "What is Kadane's algorithm?", back: "Finds the maximum subarray sum in O(n). Track current_sum = max(arr[i], current_sum + arr[i]) and update max_sum = max(max_sum, current_sum)." },
  { channel: "algorithms", front: "Time complexity of insertion sort (best and worst)?", back: "Best: O(n) on already-sorted array. Worst: O(n²) on reverse-sorted array. Good for small or nearly-sorted arrays." },
  { channel: "algorithms", front: "What is the two-pointer technique?", back: "Use two indices that move toward each other (or in the same direction) to solve array/string problems in O(n) instead of O(n²). E.g., pair sum in sorted array." },
  { channel: "algorithms", front: "What is a sliding window?", back: "Maintain a window of fixed or variable size over an array/string. Expand right, shrink left. Solves subarray/substring problems in O(n)." },
  { channel: "algorithms", front: "What is the time complexity of building a hash table vs lookup?", back: "Build: O(n). Average lookup/insert/delete: O(1). Worst case (many collisions): O(n). Use chaining or open addressing to handle collisions." },
  { channel: "algorithms", front: "What is a trie and what is it used for?", back: "A prefix tree where each node represents a character. Used for autocomplete, spell-checking, and IP routing. O(L) lookup where L = key length." },
  { channel: "algorithms", front: "What is the difference between in-order, pre-order, and post-order traversal?", back: "In-order (L→Root→R): sorted output for BST. Pre-order (Root→L→R): serialize tree. Post-order (L→R→Root): delete tree, evaluate expression trees." },

  // ── FRONTEND ──────────────────────────────────────────────────────────────
  { channel: "frontend", front: "What is the difference between == and === in JavaScript?", back: "== allows type coercion (1 == '1' is true). === is strict equality, no coercion (1 === '1' is false). Always prefer ===." },
  { channel: "frontend", front: "What is a closure in JavaScript?", back: "A function that retains access to its outer scope's variables even after the outer function has returned. Used for data encapsulation and factory functions." },
  { channel: "frontend", front: "What is the difference between null and undefined?", back: "undefined: variable declared but not assigned. null: intentional absence of value (explicitly assigned). typeof null === 'object' (historical bug)." },
  { channel: "frontend", front: "What is event bubbling vs event capturing?", back: "Bubbling: event propagates from target UP to document root. Capturing: event propagates DOWN from root to target. Use addEventListener(event, fn, true) for capture phase." },
  { channel: "frontend", front: "What does useEffect cleanup function do?", back: "The function returned from useEffect runs before the next effect or on component unmount. Used to clean up subscriptions, timers, or event listeners to prevent memory leaks." },
  { channel: "frontend", front: "What is the difference between useMemo and useCallback?", back: "useMemo: memoizes a computed value. useCallback: memoizes a function reference. Both prevent unnecessary recalculations/recreations between renders." },
  { channel: "frontend", front: "What is CSS specificity?", back: "Determines which CSS rule wins when multiple rules apply. Order (highest to lowest): !important > inline > ID > class/attribute/pseudo-class > element/pseudo-element." },
  { channel: "frontend", front: "What is the difference between display:flex and display:grid?", back: "Flexbox: one-dimensional layout (row OR column). Grid: two-dimensional (rows AND columns simultaneously). Use flex for components, grid for page layout." },
  { channel: "frontend", front: "What is CORS and why does it exist?", back: "Cross-Origin Resource Sharing — browser security policy preventing web pages from making requests to a different domain. Server must send Access-Control-Allow-Origin header to allow cross-origin requests." },
  { channel: "frontend", front: "What is the difference between localStorage, sessionStorage, and cookies?", back: "localStorage: persists until cleared, ~5MB, no expiry. sessionStorage: cleared when tab closes. Cookies: sent with every HTTP request, 4KB, can have expiry, accessible by server." },
  { channel: "frontend", front: "What is a Service Worker?", back: "A JS script running in the background, separate from the web page. Enables offline caching, push notifications, and background sync. Intercepts network requests via fetch event." },
  { channel: "frontend", front: "What is the virtual DOM?", back: "An in-memory representation of the real DOM. React updates the virtual DOM, diffs it against the previous version, and only patches the changed real DOM nodes (reconciliation)." },
  { channel: "frontend", front: "What is tree shaking?", back: "A bundler optimization that removes unused code (dead code) from the final bundle. Requires ES modules (import/export) — CommonJS (require) cannot be tree-shaken." },
  { channel: "frontend", front: "What is the difference between margin and padding?", back: "Padding: space inside the element, between content and border (part of element). Margin: space outside the element's border (between elements). Margins can collapse; padding cannot." },
  { channel: "frontend", front: "What is debouncing vs throttling?", back: "Debouncing: delays function execution until N ms after last call. Good for search inputs. Throttling: limits execution to at most once per N ms. Good for scroll/resize handlers." },

  // ── BACKEND ───────────────────────────────────────────────────────────────
  { channel: "backend", front: "What is an idempotent HTTP method?", back: "A method where multiple identical requests have the same effect as one. GET, PUT, DELETE, HEAD are idempotent. POST is NOT idempotent (creates multiple resources)." },
  { channel: "backend", front: "What is the difference between PUT and PATCH?", back: "PUT: replaces the entire resource (full update). PATCH: partially modifies a resource (partial update). PUT is idempotent; PATCH may or may not be." },
  { channel: "backend", front: "What is a message queue and what problem does it solve?", back: "Decouples producers from consumers. Producer sends messages without waiting for consumer. Enables async processing, load leveling, and fault tolerance. Examples: RabbitMQ, Kafka, SQS." },
  { channel: "backend", front: "What is the difference between synchronous and asynchronous processing?", back: "Synchronous: caller waits for response before continuing. Asynchronous: caller continues immediately; result delivered later via callback, promise, or message queue." },
  { channel: "backend", front: "What is a deadlock?", back: "Two or more processes are waiting for each other to release resources, resulting in indefinite blocking. Prevention: acquire locks in consistent order, use timeouts, or lock-free algorithms." },
  { channel: "backend", front: "What is connection pooling?", back: "Reusing a pool of pre-established database connections instead of creating a new connection for each request. Reduces latency and resource usage. E.g., pg-pool for PostgreSQL." },
  { channel: "backend", front: "What HTTP status code means 'created successfully'?", back: "201 Created. The request succeeded and a new resource was created. The Location header should point to the new resource URL." },
  { channel: "backend", front: "What is the difference between 401 and 403 HTTP status codes?", back: "401 Unauthorized: not authenticated (need to log in). 403 Forbidden: authenticated but not authorized (you don't have permission for this resource)." },
  { channel: "backend", front: "What is a circuit breaker pattern?", back: "Prevents cascading failures by stopping calls to a failing service. States: CLOSED (normal), OPEN (failing — block calls), HALF-OPEN (test if service recovered). Used in microservices." },
  { channel: "backend", front: "What is database sharding?", back: "Horizontally partitioning a database across multiple servers (shards). Each shard holds a subset of data. Enables horizontal scaling but adds complexity (cross-shard queries, resharding)." },
  { channel: "backend", front: "What is the N+1 query problem?", back: "Fetching N records, then making an additional query for each record (1+N total queries). Fix: eager loading with JOIN or batch loading (e.g., Dataloader). Common in ORMs." },
  { channel: "backend", front: "What is HTTPS and why does it matter?", back: "HTTP over TLS. Encrypts data in transit, authenticates the server (via certificate), and ensures integrity. Prevents eavesdropping and man-in-the-middle attacks." },
  { channel: "backend", front: "What is the difference between horizontal and vertical scaling?", back: "Vertical (scale up): bigger machine (more CPU/RAM). Horizontal (scale out): more machines. Horizontal scaling has no ceiling and enables fault tolerance but requires stateless design." },
  { channel: "backend", front: "What is event sourcing?", back: "Storing state changes as an append-only log of events rather than current state. Full audit trail, time travel debugging, event replay. Used in CQRS patterns and Kafka-based systems." },
  { channel: "backend", front: "What is the difference between monolithic and microservices architecture?", back: "Monolith: single deployable unit, simpler but harder to scale parts independently. Microservices: small independent services, each with own DB. Better scalability and team autonomy but higher operational complexity." },

  // ── MACHINE LEARNING ──────────────────────────────────────────────────────
  { channel: "machine-learning", front: "What is gradient descent?", back: "Optimization algorithm that iteratively moves model parameters in the direction that reduces the loss function. Update: θ = θ - α × ∇L(θ), where α is learning rate." },
  { channel: "machine-learning", front: "What is the difference between batch, mini-batch, and stochastic gradient descent?", back: "Batch: uses all training data per update (slow, memory-heavy). Stochastic (SGD): uses 1 sample (noisy but fast). Mini-batch: uses 32-256 samples — best of both worlds. Most common in practice." },
  { channel: "machine-learning", front: "What is regularization and why is it used?", back: "Technique to reduce overfitting by adding a penalty for large weights. L1 (Lasso): adds |w| — promotes sparsity. L2 (Ridge): adds w² — shrinks weights. Dropout: randomly deactivates neurons." },
  { channel: "machine-learning", front: "What is cross-validation?", back: "Technique to estimate model performance on unseen data. K-fold: split data into k folds, train on k-1, validate on 1, repeat k times, average results. Reduces variance of performance estimate." },
  { channel: "machine-learning", front: "What is the difference between supervised, unsupervised, and reinforcement learning?", back: "Supervised: labeled data, predict output (classification, regression). Unsupervised: no labels, find patterns (clustering, PCA). Reinforcement: agent learns via rewards/penalties in an environment." },
  { channel: "machine-learning", front: "What is a confusion matrix?", back: "Table showing TP, FP, FN, TN for a classification model. Rows = actual class, Columns = predicted class. Used to compute precision, recall, F1 score." },
  { channel: "machine-learning", front: "What is feature engineering?", back: "Creating or transforming input variables to improve model performance. Includes: normalization, encoding categoricals, creating interaction terms, handling missing values, binning." },
  { channel: "machine-learning", front: "What is a random forest?", back: "Ensemble of decision trees trained on different bootstrap samples with random feature subsets. Final prediction by majority vote. Reduces variance vs single decision tree." },
  { channel: "machine-learning", front: "What is the vanishing gradient problem?", back: "In deep networks, gradients become exponentially small during backpropagation. Makes early layers train very slowly. Solutions: ReLU activations, batch normalization, residual connections (ResNet)." },
  { channel: "machine-learning", front: "What is transfer learning?", back: "Reusing a model trained on one task as the starting point for a new related task. Fine-tune pretrained weights on your dataset. Enables high performance with limited data (e.g., fine-tuning BERT, ResNet)." },
  { channel: "machine-learning", front: "What is the difference between classification and regression?", back: "Classification: predict a discrete category label (spam/not-spam, dog/cat). Regression: predict a continuous numeric value (house price, temperature)." },
  { channel: "machine-learning", front: "What is PCA (Principal Component Analysis)?", back: "Dimensionality reduction technique. Projects data onto principal components (directions of maximum variance). Reduces noise, speeds training. Data must be normalized first." },
  { channel: "machine-learning", front: "What is the difference between a model parameter and a hyperparameter?", back: "Parameters: learned from data during training (weights, biases). Hyperparameters: set before training (learning rate, batch size, number of layers). Tuned via cross-validation or grid search." },

  // ── GENERATIVE AI ─────────────────────────────────────────────────────────
  { channel: "generative-ai", front: "What is a token in the context of LLMs?", back: "The basic unit of text that models process. Roughly 4 characters or 3/4 of a word. 'ChatGPT' = 1 token. 'Artificial intelligence' = 3 tokens. Context window is measured in tokens." },
  { channel: "generative-ai", front: "What is temperature in LLM sampling?", back: "Controls randomness in output. Temperature=0: deterministic (always picks most likely token). Temperature=1: default randomness. Temperature>1: more creative/random. Temperature<1: more focused/conservative." },
  { channel: "generative-ai", front: "What is a prompt?", back: "The input text given to an LLM. Includes instructions, context, examples, and the query. Prompt engineering is the art of crafting inputs that guide model behavior to desired outputs." },
  { channel: "generative-ai", front: "What is few-shot prompting?", back: "Providing 2-5 examples of desired input/output format in the prompt before asking the actual question. Helps LLMs understand the task pattern without any fine-tuning." },
  { channel: "generative-ai", front: "What is an embedding?", back: "A dense vector representation of text (or images/audio) in high-dimensional space. Semantically similar items have vectors close together. Used in search, RAG, and recommendation systems." },
  { channel: "generative-ai", front: "What is a vector database?", back: "A database optimized for storing and querying high-dimensional vectors (embeddings). Uses approximate nearest-neighbor (ANN) search. Examples: Pinecone, Weaviate, Chroma, pgvector." },
  { channel: "generative-ai", front: "What is hallucination in LLMs?", back: "When an LLM confidently generates false or fabricated information not supported by its training data. Mitigated by RAG (grounding), temperature tuning, system prompts, and fact-checking layers." },
  { channel: "generative-ai", front: "What is fine-tuning an LLM?", back: "Further training a pretrained LLM on a specific dataset to adapt its behavior for a particular task or domain. More expensive than prompting/RAG but better for style/format adaptation." },
  { channel: "generative-ai", front: "What is a system prompt?", back: "Instructions given to an LLM before the user conversation. Sets context, persona, constraints, and rules. E.g., 'You are a helpful customer support agent for Acme Corp. Always be polite.'" },
  { channel: "generative-ai", front: "What is chain-of-thought prompting?", back: "Asking the LLM to think step-by-step before giving the final answer. Significantly improves performance on multi-step reasoning, math, and logic problems. Trigger: 'Let's think step by step...'" },
  { channel: "generative-ai", front: "What is the difference between GPT and BERT architectures?", back: "GPT: decoder-only transformer, autoregressive (predicts next token). Good for generation. BERT: encoder-only, bidirectional (sees all tokens). Good for classification and embeddings." },
  { channel: "generative-ai", front: "What is RLHF?", back: "Reinforcement Learning from Human Feedback. Used to align LLMs with human preferences: collect human rankings of outputs → train reward model → fine-tune LLM with RL to maximize reward. Used in ChatGPT, Claude." },

  // ── SECURITY ──────────────────────────────────────────────────────────────
  { channel: "security", front: "What is CSRF and how do you prevent it?", back: "Cross-Site Request Forgery: tricks authenticated users into submitting malicious requests. Prevention: CSRF tokens (synchronizer token pattern), SameSite cookie attribute, CORS checks." },
  { channel: "security", front: "What is the difference between symmetric and asymmetric encryption?", back: "Symmetric: same key for encryption and decryption (AES). Fast, used for bulk data. Asymmetric: public key encrypts, private key decrypts (RSA, ECC). Used for key exchange and digital signatures." },
  { channel: "security", front: "What is OWASP Top 10?", back: "The 10 most critical web application security risks. Key items: Injection, Broken Authentication, XSS, IDOR, Security Misconfiguration, Outdated Components, SSRF. Published by the Open Web Application Security Project." },
  { channel: "security", front: "What is TLS and how does the TLS handshake work?", back: "TLS (Transport Layer Security) encrypts network traffic. Handshake: (1) Client hello (cipher suites), (2) Server hello + certificate, (3) Key exchange, (4) Session keys derived, (5) Encrypted communication begins." },
  { channel: "security", front: "What is a hash function and what makes a cryptographic hash secure?", back: "Maps input to fixed-size digest. Secure properties: deterministic, one-way (preimage resistant), collision resistant (hard to find two inputs with same hash), avalanche effect (small input change → very different hash)." },
  { channel: "security", front: "What is the principle of least privilege?", back: "Grant users/processes only the minimum permissions needed to perform their job. Limits blast radius of breaches. Applied to DB users, IAM roles, OS processes, and API scopes." },
  { channel: "security", front: "What is a man-in-the-middle (MITM) attack?", back: "Attacker intercepts communication between two parties, potentially eavesdropping or tampering. Prevented by TLS/HTTPS, certificate pinning, and mutual TLS (mTLS)." },
  { channel: "security", front: "What is salting in password hashing?", back: "A random unique value added to each password before hashing. Prevents rainbow table attacks and ensures two users with the same password have different hashes. Use bcrypt, Argon2, or scrypt — they include salts automatically." },
  { channel: "security", front: "What is a zero-day vulnerability?", back: "A security flaw unknown to the software vendor — zero days to fix. Exploited in the wild before a patch exists. Mitigated by defense-in-depth, anomaly detection, and network segmentation." },
  { channel: "security", front: "What is the difference between IDS and IPS?", back: "IDS (Intrusion Detection System): monitors and ALERTS on suspicious activity. IPS (Intrusion Prevention System): monitors and BLOCKS suspicious activity in real-time. IPS is active; IDS is passive." },
];

async function main() {
  console.log(`Seeding ${flashcards.length} flashcards...`);
  let count = 0;
  for (const f of flashcards) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO flashcards
        (id, channel, front, back, difficulty, status, created_at)
        VALUES (?,?,?,?,?,?,?)`,
      args: [id(), f.channel, f.front, f.back, "intermediate", "active", NOW],
    });
    count++;
    console.log(`[${f.channel}] ${f.front.slice(0, 60)}`);
  }
  console.log(`\nDone! ${count} flashcards inserted.`);
  client.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
