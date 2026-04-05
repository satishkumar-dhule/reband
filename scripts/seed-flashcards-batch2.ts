/**
 * Issue #61 — Flashcard Batch 2: system-design, devops, kubernetes, database, behavioral
 * Run: npx tsx scripts/seed-flashcards-batch2.ts
 */
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({ url: "file:local.db" });
const NOW = new Date().toISOString();
const id = () => crypto.randomUUID();

const flashcards = [
  // ── SYSTEM DESIGN ─────────────────────────────────────────────────────────
  {
    id: id(), channel: "system-design", front: "What is the CAP theorem?",
    back: "A distributed system can only guarantee 2 of 3: Consistency (every read gets the latest write), Availability (every request gets a response), Partition Tolerance (system continues despite network splits). Since network partitions are unavoidable, systems choose CP (consistent, may reject requests) or AP (available, may return stale data).",
    hint: "Think: CP = consistent but may return errors; AP = always responds but may be stale",
    code_example: "Examples: CP = HBase, MongoDB (write concern=majority); AP = Cassandra, DynamoDB (eventually consistent reads)",
    mnemonic: "CAP: Can't have All three Properties",
    difficulty: "intermediate", tags: JSON.stringify(["system-design", "distributed-systems", "cap-theorem"]), category: "concepts", status: "active",
  },
  {
    id: id(), channel: "system-design", front: "What is consistent hashing and why use it for distributed caches/databases?",
    back: "Consistent hashing maps keys and servers onto a virtual ring. When a server is added/removed, only K/N keys move (K=total keys, N=total servers) instead of K keys in modular hashing. This minimizes rebalancing when scaling. Used in: Cassandra, Dynamo, Memcached clusters, CDN routing.",
    hint: "Ring of hash values 0-2^32, servers placed at positions, keys assigned to clockwise-next server",
    code_example: "Add server: only 1/N of keys reassign. Remove server: only 1/N of keys reassign. vs. mod hashing: all keys reassign.",
    mnemonic: "Consistent = only ~1/N keys move when ring changes",
    difficulty: "advanced", tags: JSON.stringify(["system-design", "consistent-hashing", "distributed-systems"]), category: "concepts", status: "active",
  },
  {
    id: id(), channel: "system-design", front: "What is the difference between a message queue and a pub/sub system?",
    back: "Message Queue (SQS, RabbitMQ): point-to-point, one consumer processes each message, message deleted after consumption. Pub/Sub (SNS, Kafka, Redis Pub/Sub): one message delivered to MULTIPLE subscribers simultaneously. Queue = load balancing work. Pub/Sub = broadcasting events.",
    hint: "Queue = one consumer takes it; Pub/Sub = all subscribers get it",
    code_example: "Order created → Queue: ONE inventory service processes it. Event: SNS → email service + analytics + inventory all get notified simultaneously.",
    mnemonic: "Queue = work distribution; Pub/Sub = event broadcast",
    difficulty: "intermediate", tags: JSON.stringify(["system-design", "messaging", "queue", "pub-sub"]), category: "messaging", status: "active",
  },
  {
    id: id(), channel: "system-design", front: "What is database sharding?",
    back: "Sharding splits a large database into smaller, faster horizontal partitions (shards), each holding a subset of rows. Each shard is an independent database on a separate server. Shard key determines which shard stores a row. Allows horizontal scaling for reads AND writes. Complexity: cross-shard joins, rebalancing.",
    hint: "Horizontal partitioning across multiple servers by shard key",
    code_example: "User table sharded by user_id % 4: shard0=users 0,4,8; shard1=users 1,5,9; shard2=users 2,6,10; shard3=users 3,7,11",
    mnemonic: "Shard = horizontal slice across servers",
    difficulty: "intermediate", tags: JSON.stringify(["system-design", "database", "sharding", "scaling"]), category: "database", status: "active",
  },
  {
    id: id(), channel: "system-design", front: "What is the difference between horizontal and vertical scaling?",
    back: "Vertical (scale up): add more CPU/RAM/disk to existing server. Simple but has limits (biggest machine has ceiling) and creates single point of failure. Horizontal (scale out): add more servers. Theoretically unlimited, requires load balancing and stateless design, handles failure of individual nodes. Most modern systems scale horizontally.",
    hint: "Vertical = bigger box; Horizontal = more boxes",
    code_example: "Vertical: t2.micro → m5.24xlarge (limit: $10k/month, 96 vCPU). Horizontal: 10x t2.micro behind a load balancer (no limit, replace failed instances automatically).",
    mnemonic: "Vertical = up/down; Horizontal = left/right (more machines)",
    difficulty: "basic", tags: JSON.stringify(["system-design", "scalability", "horizontal", "vertical"]), category: "concepts", status: "active",
  },
  {
    id: id(), channel: "system-design", front: "What is a write-ahead log (WAL) and why do databases use it?",
    back: "WAL: all changes are written to a sequential log BEFORE they're applied to the main data files. If the DB crashes, recovery replays the WAL to restore consistency. Benefits: durability (crash recovery), replication (stream WAL to replicas), point-in-time recovery. Used by: PostgreSQL, MySQL InnoDB, SQLite, Kafka (commit log).",
    hint: "Log first, apply data second → crash recovery by replaying log",
    code_example: "PostgreSQL: WAL written to pg_wal/. Replica: streaming replication reads WAL and applies changes. Recovery: crash → replay WAL from last checkpoint.",
    mnemonic: "Write Ahead = log before data → durability guarantee",
    difficulty: "advanced", tags: JSON.stringify(["system-design", "database", "wal", "durability", "replication"]), category: "database", status: "active",
  },
  {
    id: id(), channel: "system-design", front: "What is a load balancer and what are the different load balancing algorithms?",
    back: "Load balancer distributes requests across multiple servers. Algorithms: Round Robin (sequential), Weighted Round Robin (more to powerful servers), Least Connections (to server with fewest active connections), IP Hash (same client → same server), Random. L4 (TCP level), L7 (HTTP level with URL routing). Examples: AWS ALB (L7), NLB (L4), nginx, HAProxy.",
    hint: "Distributes traffic — know the key algorithms and L4 vs L7",
    code_example: "Round robin: A→server1, B→server2, C→server1. Least connections: if server1 has 100 active and server2 has 10, send new request to server2.",
    mnemonic: "Load balancer = traffic cop for servers",
    difficulty: "basic", tags: JSON.stringify(["system-design", "load-balancing", "infrastructure"]), category: "infrastructure", status: "active",
  },
  {
    id: id(), channel: "system-design", front: "What is the difference between a CDN and a reverse proxy?",
    back: "CDN (Content Delivery Network): globally distributed edge servers that CACHE static content (images, JS, CSS, videos) close to users. Focus: geographic latency reduction. Examples: CloudFront, Cloudflare, Fastly. Reverse Proxy: sits in front of backend servers, forwards requests, handles SSL termination, caching, rate limiting, auth. Focus: backend protection/routing. Example: nginx. CDNs are often reverse proxies, but not all reverse proxies are CDNs.",
    hint: "CDN = geographic cache distribution; Reverse proxy = gateway to backend",
    code_example: "CDN: user in Tokyo → Cloudflare Tokyo PoP (cached) → 5ms. Without CDN → San Francisco origin → 180ms. Reverse proxy: client → nginx (SSL, rate limit, cache) → backend servers.",
    mnemonic: "CDN = geography; Reverse proxy = gateway",
    difficulty: "intermediate", tags: JSON.stringify(["system-design", "cdn", "reverse-proxy", "caching"]), category: "infrastructure", status: "active",
  },
  {
    id: id(), channel: "system-design", front: "What is idempotency and why is it important in distributed systems?",
    back: "An operation is idempotent if applying it multiple times produces the same result as applying it once. Critical for retry logic: if a payment request times out (did it succeed?), retry safely only if idempotent. Implement with: idempotency keys (unique request ID), deduplication tables, conditional operations. HTTP: GET/PUT/DELETE are idempotent; POST is not.",
    hint: "f(f(x)) = f(x) — safe to retry multiple times",
    code_example: "Non-idempotent: POST /transfer {amount: 100} — retrying charges twice! Idempotent: POST /transfer {amount: 100, idempotency_key: 'req-abc123'} — second request returns cached result.",
    mnemonic: "Idempotent = safe to retry = same result no matter how many times",
    difficulty: "intermediate", tags: JSON.stringify(["system-design", "distributed-systems", "idempotency", "reliability"]), category: "concepts", status: "active",
  },
  {
    id: id(), channel: "system-design", front: "What is eventual consistency vs strong consistency?",
    back: "Strong consistency: after a write completes, ALL subsequent reads return the new value (ACID databases, single-master setups). Higher latency. Eventual consistency: after a write, reads MAY return old data for some period, but eventually ALL nodes converge to the new value (Cassandra, DynamoDB default, DNS). Higher availability. Choose based on requirements: bank balance = strong; user profile avatar = eventual OK.",
    hint: "Strong = always fresh; Eventual = will be fresh eventually",
    code_example: "Strong: Write user balance to master → read from replica → guaranteed to see new value. Eventual: Write tweet to Cassandra → some replicas may show old count for 100ms → all replicas converge.",
    mnemonic: "Strong = always right now; Eventual = right...eventually",
    difficulty: "intermediate", tags: JSON.stringify(["system-design", "consistency", "distributed-systems", "databases"]), category: "concepts", status: "active",
  },

  // ── DEVOPS ────────────────────────────────────────────────────────────────
  {
    id: id(), channel: "devops", front: "What is Infrastructure as Code (IaC) and what are its benefits?",
    back: "IaC: manage and provision infrastructure through code/config files instead of manual processes. Benefits: version control (git blame for infra), reproducibility (same config → same environment), automation (CI/CD pipelines), drift detection, documentation. Tools: Terraform (multi-cloud), CloudFormation (AWS), Pulumi (general purpose code), Ansible (configuration management).",
    hint: "Treat infrastructure like application code — version controlled, automated, reproducible",
    code_example: "Terraform: define EC2 instance in .tf file → git commit → CI applies → identical environments every time. vs. ClickOps: manual console clicks → undocumented → can't reproduce.",
    mnemonic: "IaC = infrastructure in git = reproducible environments",
    difficulty: "basic", tags: JSON.stringify(["devops", "iac", "terraform", "automation"]), category: "concepts", status: "active",
  },
  {
    id: id(), channel: "devops", front: "What is CI/CD? What's the difference between Continuous Integration, Continuous Delivery, and Continuous Deployment?",
    back: "CI (Continuous Integration): automatically build and test code on every push. Catches bugs early. CD (Delivery): code is always in a deployable state; deploy to production is MANUAL. CD (Deployment): automatic deployment to production after tests pass — no human gate. CI → CD Delivery → CD Deployment. Most orgs do CI + CD Delivery (manual prod deploy for safety).",
    hint: "CI = auto test; Delivery = manual prod deploy gate; Deployment = auto prod deploy",
    code_example: "CI: git push → GitHub Actions → build + unit tests + linting → all must pass. CD Delivery: deploy to staging automatically, button to deploy prod. CD Deployment: staging passes → prod deploy automatically.",
    mnemonic: "CI tests, CD delivers, Continuous Deployment auto-ships",
    difficulty: "basic", tags: JSON.stringify(["devops", "ci-cd", "automation", "deployment"]), category: "concepts", status: "active",
  },
  {
    id: id(), channel: "devops", front: "What is a Dockerfile and what is a .dockerignore file?",
    back: "Dockerfile: set of instructions to build a Docker image (FROM, RUN, COPY, ENV, EXPOSE, CMD). Each instruction creates a new layer. .dockerignore: like .gitignore — lists files/dirs to EXCLUDE from the build context sent to Docker daemon. Include: node_modules, .git, *.log, .env, dist. Without .dockerignore, large directories are sent unnecessarily, slowing builds.",
    hint: "Dockerfile = recipe; .dockerignore = what NOT to include in build",
    code_example: ".dockerignore:\nnode_modules\n.git\n.env\n*.log\ndist\n.DS_Store\nThis prevents 200MB node_modules from being sent as build context.",
    mnemonic: "Dockerfile = blueprint; .dockerignore = exclude list",
    difficulty: "basic", tags: JSON.stringify(["devops", "docker", "containers", "dockerfile"]), category: "containers", status: "active",
  },
  {
    id: id(), channel: "devops", front: "What is Kubernetes and what problems does it solve?",
    back: "Kubernetes (K8s): container orchestration platform. Solves: container scheduling (which node?), self-healing (restart crashed containers), auto-scaling (HPA), load balancing (Services), rolling updates (zero-downtime deploys), config/secret management (ConfigMap/Secret), service discovery (DNS). Alternative: Docker Swarm (simpler, less powerful), ECS (AWS-specific).",
    hint: "Orchestrates containers: scheduling, healing, scaling, networking",
    code_example: "Without K8s: manually manage 50 containers across 10 VMs. With K8s: define desired state (5 replicas), K8s schedules, monitors, restarts failed, scales based on CPU, routes traffic.",
    mnemonic: "K8s = fleet management for containers",
    difficulty: "basic", tags: JSON.stringify(["devops", "kubernetes", "containers", "orchestration"]), category: "containers", status: "active",
  },
  {
    id: id(), channel: "devops", front: "What is blue-green deployment?",
    back: "Blue-green: maintain TWO identical production environments (blue=current, green=new version). Deploy to green, run tests, then switch load balancer to green. Blue becomes idle/standby. Rollback = switch LB back to blue (instant). Downside: requires 2x infrastructure cost. Variation: canary (gradually shift % of traffic to new version).",
    hint: "Two identical envs, flip the switch, instant rollback",
    code_example: "Blue: v1.0 serving 100% traffic. Deploy v1.1 to Green. Test Green. Switch LB: Green now serves 100%. Blue idle. If issue: switch back to Blue in < 1 second.",
    mnemonic: "Blue-Green = two lanes, switch instantly",
    difficulty: "intermediate", tags: JSON.stringify(["devops", "deployment", "blue-green", "zero-downtime"]), category: "deployment", status: "active",
  },

  // ── KUBERNETES ────────────────────────────────────────────────────────────
  {
    id: id(), channel: "kubernetes", front: "What is the difference between a Pod, ReplicaSet, and Deployment?",
    back: "Pod: smallest deployable unit, one or more containers sharing network/storage. ReplicaSet: ensures N pods always running (self-healing). Deployment: manages ReplicaSets, adds rolling updates, rollback history. Hierarchy: Deployment → ReplicaSet → Pods. In practice, always use Deployment — never create naked Pods or ReplicaSets directly.",
    hint: "Pod = container group; ReplicaSet = maintain count; Deployment = rolling updates",
    code_example: "kubectl create deployment web --image=nginx --replicas=3\n→ creates Deployment → creates ReplicaSet → creates 3 Pods\nkubectl rollout undo deployment/web → rolls back to previous ReplicaSet",
    mnemonic: "Deployment → ReplicaSet → Pod (always use Deployments!)",
    difficulty: "basic", tags: JSON.stringify(["kubernetes", "pods", "replicaset", "deployment"]), category: "workloads", status: "active",
  },
  {
    id: id(), channel: "kubernetes", front: "What is the difference between a ConfigMap and a Secret in Kubernetes?",
    back: "ConfigMap: stores non-sensitive configuration as key-value pairs (app config, env vars, config files). Stored in plaintext in etcd. Secret: stores sensitive data (passwords, tokens, TLS certs) — base64 encoded (NOT encrypted by default!). Both can be mounted as volumes or env vars. For actual encryption: enable etcd encryption at rest or use Sealed Secrets/Vault.",
    hint: "ConfigMap = non-sensitive config; Secret = sensitive data (base64, not truly encrypted by default)",
    code_example: "ConfigMap: DB_HOST=postgres.svc, APP_MODE=production\nSecret: DB_PASSWORD=c2VjcmV0 (base64 of 'secret')\nNote: base64 is encoding not encryption — not secure without etcd encryption at rest",
    mnemonic: "ConfigMap = config, plaintext OK; Secret = sensitive, base64 (add encryption at rest!)",
    difficulty: "intermediate", tags: JSON.stringify(["kubernetes", "configmap", "secret", "configuration"]), category: "configuration", status: "active",
  },
  {
    id: id(), channel: "kubernetes", front: "What is a Kubernetes Service? What are the four service types?",
    back: "Service: stable DNS name + IP for a set of pods (selected by labels). Pods are ephemeral — Service provides stable endpoint. Types: ClusterIP (internal only, default), NodePort (exposes on each node's IP + port, external access), LoadBalancer (provisions cloud LB, external access), ExternalName (maps to external DNS name).",
    hint: "Service = stable endpoint for ephemeral pods; know 4 types",
    code_example: "ClusterIP: my-db.default.svc.cluster.local → internal DNS\nNodePort: node-ip:30080 → any worker node's IP\nLoadBalancer: provisioned cloud ALB/NLB with external IP\nExternalName: my-db → external.database.com (CNAME)",
    mnemonic: "ClusterIP=internal, NodePort=node IP, LoadBalancer=cloud LB, ExternalName=DNS alias",
    difficulty: "intermediate", tags: JSON.stringify(["kubernetes", "services", "networking", "clusterip", "nodeport"]), category: "networking", status: "active",
  },
  {
    id: id(), channel: "kubernetes", front: "What is a Kubernetes namespace and why use them?",
    back: "Namespace: virtual cluster within a K8s cluster — logical partition for resources. Use cases: environment separation (dev/staging/prod in one cluster), team isolation, resource quotas per team, RBAC scope. Default namespaces: default, kube-system (K8s components), kube-public (publicly readable), kube-node-lease. Most names scoped to namespace; some (Nodes, PVs) are cluster-scoped.",
    hint: "Virtual partitions within a cluster for isolation and organization",
    code_example: "kubectl create ns team-alpha\nkubectl apply -f app.yaml -n team-alpha\n# Services communicate across namespaces: svc-name.namespace.svc.cluster.local\ncurl http://db.team-alpha.svc.cluster.local:5432",
    mnemonic: "Namespace = virtual cluster boundaries",
    difficulty: "basic", tags: JSON.stringify(["kubernetes", "namespace", "organization", "isolation"]), category: "concepts", status: "active",
  },
  {
    id: id(), channel: "kubernetes", front: "What is a Kubernetes Ingress and how does it differ from a Service of type LoadBalancer?",
    back: "Ingress: HTTP/HTTPS routing rules at L7 (URL path, hostname-based routing) with a single external IP. One Ingress can route to multiple services based on rules. LoadBalancer Service: one cloud load balancer (and IP) PER service — expensive at scale. Ingress Controller (nginx, traefik) implements Ingress rules. 10 services = 1 Ingress vs 10 LoadBalancer Services (10x cost).",
    hint: "Ingress = L7 HTTP router, one IP for many services; LB Service = one IP per service",
    code_example: "Ingress rule:\n/api → backend-service:8080\n/app → frontend-service:3000\nvs. without ingress: 2 LoadBalancer services = 2 cloud LBs = 2x cost",
    mnemonic: "Ingress = HTTP smart router (1 LB → many services)",
    difficulty: "intermediate", tags: JSON.stringify(["kubernetes", "ingress", "networking", "routing"]), category: "networking", status: "active",
  },

  // ── DATABASE ──────────────────────────────────────────────────────────────
  {
    id: id(), channel: "database", front: "What is an index in a database and how does it work?",
    back: "Index: separate data structure (usually B-tree) that stores sorted values of one or more columns with pointers to actual rows. Without index: full table scan O(n). With index: B-tree binary search O(log n). Trade-off: faster reads but slower writes (index must be updated on INSERT/UPDATE/DELETE) and uses storage. Use for: frequently queried columns, JOIN conditions, ORDER BY, foreign keys.",
    hint: "Pre-sorted lookup structure = O(log n) vs O(n) table scan",
    code_example: "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'x@y.com';\nWithout index: Seq Scan on users, cost 1000.00\nWith index: Index Scan using idx_users_email, cost 8.30",
    mnemonic: "Index = book index = skip to the right page instantly",
    difficulty: "basic", tags: JSON.stringify(["database", "indexing", "performance", "b-tree"]), category: "performance", status: "active",
  },
  {
    id: id(), channel: "database", front: "What is the N+1 query problem and how do you solve it?",
    back: "N+1 problem: loading N records, then issuing 1 query per record to load related data = N+1 total queries. Example: fetch 100 posts (1 query), then fetch author for each post (100 queries) = 101 queries. Solutions: JOIN (single query), eager loading (ORM's .includes()/.with()), batch loading (DataLoader), subquery.",
    hint: "1 parent query + N child queries = bad; use JOIN or eager loading",
    code_example: "BAD (N+1):\nposts = db.query('SELECT * FROM posts')  # 1 query\nfor post in posts:\n    author = db.query(f'SELECT * FROM users WHERE id={post.author_id}')  # 100 queries!\n\nGOOD (JOIN):\nresult = db.query('SELECT p.*, u.name FROM posts p JOIN users u ON p.author_id = u.id')  # 1 query",
    mnemonic: "N+1 = fetch list, then loop fetching each detail. JOIN = single query",
    difficulty: "intermediate", tags: JSON.stringify(["database", "n+1", "performance", "orm", "queries"]), category: "performance", status: "active",
  },
  {
    id: id(), channel: "database", front: "What is ACID in databases?",
    back: "ACID = Atomicity (transaction fully completes or fully rolls back — no partial states), Consistency (transaction brings DB from one valid state to another — constraints enforced), Isolation (concurrent transactions don't see each other's intermediate states), Durability (committed transactions survive crashes — written to disk). Guaranteed by: PostgreSQL, MySQL, SQLite. Relaxed in: NoSQL databases for performance.",
    hint: "Atomic (all-or-nothing), Consistent (valid states), Isolated (concurrent OK), Durable (survives crash)",
    code_example: "Transfer $100: BEGIN; UPDATE accounts SET bal=bal-100 WHERE id=1; UPDATE accounts SET bal=bal+100 WHERE id=2; COMMIT;\nAtomic: if second UPDATE fails, first is rolled back. No partial money disappears.",
    mnemonic: "ACID: All-or-nothing Commits In Databases",
    difficulty: "basic", tags: JSON.stringify(["database", "acid", "transactions", "consistency"]), category: "concepts", status: "active",
  },
  {
    id: id(), channel: "database", front: "What is the difference between a clustered and non-clustered index?",
    back: "Clustered index: determines the PHYSICAL ORDER of rows in the table. One per table (usually the primary key). The data IS the index (B-tree leaf nodes contain the actual rows). Non-clustered index: separate structure with pointers to rows. Multiple allowed. Lookup: non-clustered finds pointer → follows pointer to row (double I/O if row not in index — 'bookmark lookup'). Covering index: non-clustered index includes all queried columns → no bookmark lookup needed.",
    hint: "Clustered = data order = PK; Non-clustered = separate structure with pointers",
    code_example: "Clustered: PK index on users.id — rows physically sorted by id\nNon-clustered: idx on users.email — separate B-tree, leaf = (email, id pointer)\nCovering: idx on (email, name) — SELECT name WHERE email = 'x' satisfied from index alone",
    mnemonic: "Clustered = the table IS sorted; Non-clustered = pointer table",
    difficulty: "advanced", tags: JSON.stringify(["database", "indexing", "clustered", "non-clustered"]), category: "performance", status: "active",
  },
  {
    id: id(), channel: "database", front: "What is database normalization? What are 1NF, 2NF, 3NF?",
    back: "Normalization: organize DB to reduce redundancy and improve integrity. 1NF: atomic values (no arrays in cells), each row uniquely identified. 2NF: 1NF + no partial dependencies (non-key columns depend on ENTIRE primary key). 3NF: 2NF + no transitive dependencies (non-key column shouldn't depend on another non-key column). Denormalization: intentionally violate for read performance (store computed/redundant data).",
    hint: "1NF=atomic, 2NF=full key dependency, 3NF=no transitive dependency",
    code_example: "1NF violation: user.phones = '555-1234,555-5678' → split into separate rows\n2NF violation: order_item(order_id, product_id, product_name) → product_name depends only on product_id, not full PK\n3NF violation: employee(id, dept_id, dept_name) → dept_name depends on dept_id (not directly on employee id)",
    mnemonic: "1st=no arrays, 2nd=full key, 3rd=no chains",
    difficulty: "intermediate", tags: JSON.stringify(["database", "normalization", "1nf", "2nf", "3nf"]), category: "design", status: "active",
  },

  // ── BEHAVIORAL ────────────────────────────────────────────────────────────
  {
    id: id(), channel: "behavioral", front: "What is the STAR method for answering behavioral interview questions?",
    back: "STAR: Situation (context, when/where/who), Task (your specific responsibility or challenge), Action (what YOU specifically did — use 'I' not 'we'), Result (quantifiable outcome — numbers, %, time saved, revenue impact). 90% of the answer should be Action + Result. Keep total response to 2-3 minutes. End with a lesson or reflection.",
    hint: "Situation → Task → Action (heavy here) → Result (quantify!)",
    code_example: "Weak: 'We improved performance.'\nSTAR: 'S: Our checkout was timing out under Black Friday load. T: I was the only backend engineer available. A: I profiled and found N+1 query, added eager loading + index, deployed in 2 hours. R: Page load: 8s → 0.8s, zero timeouts, $2M in sales saved.'",
    mnemonic: "STAR = Story Telling Achieves Results",
    difficulty: "basic", tags: JSON.stringify(["behavioral", "star-method", "interviewing"]), category: "interview", status: "active",
  },
  {
    id: id(), channel: "behavioral", front: "How do you answer 'Tell me about yourself' in a tech interview?",
    back: "Formula (90 seconds): Present (current role + 1-2 key achievements), Past (relevant experience that led here), Future (why this specific role/company). Focus on technical achievements and relevance. Don't read your resume. End with why you're excited about THIS company/role. Tailor to what the company values (scale, ML, fintech, etc.).",
    hint: "Present → Past → Future, 90 seconds, end with why THIS company",
    code_example: "GOOD: 'Currently at Stripe building payment APIs handling 10M TPS. Before that, built data pipelines at Meta processing 5PB daily. I'm excited about XYZ Company because of [specific product/mission/tech challenge] — I want to [specific goal alignment].'\nBAD: 'Well, I graduated in 2018 and my first job was...' [chronological resume recitation]",
    mnemonic: "Now → Then → Why Here",
    difficulty: "basic", tags: JSON.stringify(["behavioral", "tell-me-about-yourself", "interviewing"]), category: "interview", status: "active",
  },
  {
    id: id(), channel: "behavioral", front: "How do you demonstrate leadership on a team when you're not the manager?",
    back: "Technical leadership without authority: (1) Initiative — volunteer for ambiguous/hard problems before being asked. (2) Mentorship — pair program, review PRs with teaching intent, document tribal knowledge. (3) Influence — use data and demos instead of opinions. (4) Process improvement — propose and implement improvements (test coverage, runbooks, on-call rotations). (5) Ownership — treat the system like you own it long-term.",
    hint: "Lead with initiative, mentorship, data-driven influence, and ownership mindset",
    code_example: "Story: 'Our on-call was chaos. Without being asked, I documented our top 10 alert runbooks, reduced MTTR from 45→12 minutes, then taught the team how I debugged each. Team now follows the same playbooks.'",
    mnemonic: "Leaders: initiate, mentor, influence with data, own the outcome",
    difficulty: "intermediate", tags: JSON.stringify(["behavioral", "leadership", "teamwork", "influence"]), category: "leadership", status: "active",
  },

  // ── CLOUD CERTIFICATIONS ──────────────────────────────────────────────────
  {
    id: id(), channel: "certifications", front: "AWS: What is the difference between S3, EBS, and EFS?",
    back: "S3: object storage (files up to 5TB, unlimited scale, globally accessible via HTTP). EBS: block storage for a SINGLE EC2 instance (like a hard drive, 1 AZ, low latency). EFS: shared NFS filesystem, multiple EC2 instances across AZs can mount simultaneously. Use: S3=backups/static files/objects; EBS=OS disk/database storage; EFS=shared app data across instances.",
    hint: "S3=HTTP object storage; EBS=one instance's disk; EFS=shared NFS",
    code_example: "S3: aws s3 cp myfile.zip s3://my-bucket/ (HTTP upload, accessible anywhere)\nEBS: EC2 instance's /dev/sda1 (local disk, one machine)\nEFS: mount -t nfs4 fs-xxx.efs.us-east-1.amazonaws.com:/ /mnt/efs (shared across instances)",
    mnemonic: "S3=Simple Storage Service (objects); EBS=Elastic Block Store (one EC2); EFS=Elastic File System (shared)",
    difficulty: "basic", tags: JSON.stringify(["aws-saa", "storage", "s3", "ebs", "efs"]), category: "storage", status: "active",
  },
  {
    id: id(), channel: "certifications", front: "Kubernetes: What is the difference between a Deployment and a StatefulSet?",
    back: "Deployment: for STATELESS apps. Pods are interchangeable (can replace any pod with any pod). Random pod names (pod-xyz123). StatefulSet: for STATEFUL apps (databases, message queues). Stable pod names (pod-0, pod-1, pod-2), stable persistent volumes per pod, ordered startup/shutdown (pod-0 before pod-1). Use StatefulSet for: Cassandra, MongoDB, Kafka, Redis cluster, Elasticsearch.",
    hint: "Deployment=stateless (interchangeable pods); StatefulSet=stateful (stable identity + storage)",
    code_example: "Deployment: pods named web-7d9cf6c7b8-abc (random). Delete pod → new one created with different name, might get different PV.\nStatefulSet: pods named db-0, db-1, db-2 (stable). db-0 always gets its own PVC (db-0-data). Predictable.",
    mnemonic: "StatefulSet = stable state + stable names + stable volumes",
    difficulty: "intermediate", tags: JSON.stringify(["cka", "kubernetes", "statefulset", "deployment", "stateful"]), category: "workloads", status: "active",
  },
  {
    id: id(), channel: "certifications", front: "Terraform: What is the difference between terraform plan and terraform apply?",
    back: "terraform plan: reads current state + desired config, computes DIFF, shows what will be created/updated/destroyed — NO actual changes made. Shows +/~/- symbols. Like a dry run. terraform apply: runs plan internally then EXECUTES the changes (prompts for confirmation or use -auto-approve). Always review plan output before apply. In CI/CD: separate plan (PR comment) from apply (merge to main).",
    hint: "plan=dry run (no changes); apply=execute (makes real changes)",
    code_example: "$ terraform plan\n+ aws_instance.web (will create)\n~ aws_security_group.allow_ssh (will modify: add port 443)\n- aws_instance.old (will destroy)\n\n$ terraform apply   # prompts 'Do you want to perform these actions?'\nyes",
    mnemonic: "Plan = preview; Apply = execute",
    difficulty: "basic", tags: JSON.stringify(["terraform-associate", "terraform", "plan", "apply", "workflow"]), category: "workflow", status: "active",
  },
];

async function main() {
  console.log(`Seeding ${flashcards.length} flashcards (system-design, devops, k8s, database, behavioral, certifications)...`);
  let count = 0;
  for (const f of flashcards) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO flashcards
        (id, channel, front, back, hint, code_example, mnemonic, difficulty, tags, category, status, created_at)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [f.id, f.channel, f.front, f.back, f.hint, f.code_example, f.mnemonic, f.difficulty, f.tags, f.category, f.status, NOW],
    });
    count++;
    console.log(`[${f.channel}] ${f.front.slice(0, 55)}...`);
  }
  console.log(`\nDone! ${count} flashcards inserted.`);
  client.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
