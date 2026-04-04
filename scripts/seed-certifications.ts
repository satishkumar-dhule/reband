/**
 * Issue #64 — Seed certification tracks and MCQ questions into the database.
 * Run: npx tsx scripts/seed-certifications.ts
 */
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({ url: "file:local.db" });

const NOW = new Date().toISOString();
const id = () => crypto.randomUUID();

// ─── Certification track records ──────────────────────────────────────────────
const certifications = [
  {
    id: "aws-saa",
    name: "AWS Solutions Architect Associate",
    provider: "Amazon",
    description: "Validates ability to design and deploy scalable, highly available, fault-tolerant systems on AWS.",
    icon: "cloud",
    color: "text-orange-500",
    difficulty: "intermediate",
    category: "cloud",
    estimatedHours: 80,
    examCode: "SAA-C03",
    officialUrl: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
    domains: JSON.stringify([
      { name: "Design Resilient Architectures", weight: 30 },
      { name: "Design High-Performing Architectures", weight: 28 },
      { name: "Design Secure Applications and Architectures", weight: 24 },
      { name: "Design Cost-Optimized Architectures", weight: 18 },
    ]),
    channelMappings: JSON.stringify(["aws", "system-design", "database"]),
    tags: JSON.stringify(["aws", "cloud", "amazon", "solutions-architect"]),
    passingScore: 72,
    examDuration: 130,
    questionCount: 0,
  },
  {
    id: "aws-developer",
    name: "AWS Developer Associate",
    provider: "Amazon",
    description: "Validates skills in developing, deploying, and debugging cloud-based applications using AWS.",
    icon: "code",
    color: "text-orange-400",
    difficulty: "intermediate",
    category: "cloud",
    estimatedHours: 60,
    examCode: "DVA-C02",
    officialUrl: "https://aws.amazon.com/certification/certified-developer-associate/",
    domains: JSON.stringify([
      { name: "Development with AWS Services", weight: 32 },
      { name: "Security", weight: 26 },
      { name: "Deployment", weight: 24 },
      { name: "Troubleshooting and Optimization", weight: 18 },
    ]),
    channelMappings: JSON.stringify(["aws", "backend", "devops"]),
    tags: JSON.stringify(["aws", "cloud", "amazon", "developer"]),
    passingScore: 72,
    examDuration: 130,
    questionCount: 0,
  },
  {
    id: "cka",
    name: "Certified Kubernetes Administrator",
    provider: "CNCF",
    description: "Validates skills in Kubernetes cluster administration, configuration, and troubleshooting.",
    icon: "server",
    color: "text-blue-500",
    difficulty: "advanced",
    category: "devops",
    estimatedHours: 100,
    examCode: "CKA",
    officialUrl: "https://www.cncf.io/certification/cka/",
    domains: JSON.stringify([
      { name: "Cluster Architecture, Installation & Configuration", weight: 25 },
      { name: "Workloads & Scheduling", weight: 15 },
      { name: "Services & Networking", weight: 20 },
      { name: "Storage", weight: 10 },
      { name: "Troubleshooting", weight: 30 },
    ]),
    channelMappings: JSON.stringify(["kubernetes", "devops", "linux"]),
    tags: JSON.stringify(["kubernetes", "cncf", "k8s", "devops", "cka"]),
    passingScore: 66,
    examDuration: 120,
    questionCount: 0,
  },
  {
    id: "ckad",
    name: "Certified Kubernetes Application Developer",
    provider: "CNCF",
    description: "Validates skills in designing, building, and deploying cloud-native applications for Kubernetes.",
    icon: "layers",
    color: "text-blue-400",
    difficulty: "intermediate",
    category: "devops",
    estimatedHours: 60,
    examCode: "CKAD",
    officialUrl: "https://www.cncf.io/certification/ckad/",
    domains: JSON.stringify([
      { name: "Application Design and Build", weight: 20 },
      { name: "Application Deployment", weight: 20 },
      { name: "Application Observability and Maintenance", weight: 15 },
      { name: "Application Environment, Configuration and Security", weight: 25 },
      { name: "Services and Networking", weight: 20 },
    ]),
    channelMappings: JSON.stringify(["kubernetes", "devops", "backend"]),
    tags: JSON.stringify(["kubernetes", "cncf", "k8s", "developer", "ckad"]),
    passingScore: 66,
    examDuration: 120,
    questionCount: 0,
  },
  {
    id: "terraform-associate",
    name: "HashiCorp Terraform Associate",
    provider: "HashiCorp",
    description: "Validates understanding of basic concepts, skills, and use cases for open-source Terraform.",
    icon: "git-branch",
    color: "text-purple-500",
    difficulty: "intermediate",
    category: "devops",
    estimatedHours: 40,
    examCode: "003",
    officialUrl: "https://www.hashicorp.com/certification/terraform-associate",
    domains: JSON.stringify([
      { name: "Understand Infrastructure as Code concepts", weight: 17 },
      { name: "Understand the purpose of Terraform", weight: 9 },
      { name: "Understand Terraform basics", weight: 24 },
      { name: "Use the Terraform CLI", weight: 22 },
      { name: "Interact with Terraform modules", weight: 12 },
      { name: "Use the core Terraform workflow", weight: 16 },
    ]),
    channelMappings: JSON.stringify(["terraform", "devops"]),
    tags: JSON.stringify(["terraform", "hashicorp", "iac", "devops"]),
    passingScore: 70,
    examDuration: 60,
    questionCount: 0,
  },
  {
    id: "security-plus",
    name: "CompTIA Security+",
    provider: "CompTIA",
    description: "Validates baseline cybersecurity skills. Industry-standard entry-level security certification.",
    icon: "shield",
    color: "text-red-500",
    difficulty: "intermediate",
    category: "security",
    estimatedHours: 60,
    examCode: "SY0-701",
    officialUrl: "https://www.comptia.org/certifications/security",
    domains: JSON.stringify([
      { name: "General Security Concepts", weight: 12 },
      { name: "Threats, Vulnerabilities, and Mitigations", weight: 22 },
      { name: "Security Architecture", weight: 18 },
      { name: "Security Operations", weight: 28 },
      { name: "Security Program Management and Oversight", weight: 20 },
    ]),
    channelMappings: JSON.stringify(["security", "networking"]),
    tags: JSON.stringify(["security", "comptia", "cybersecurity", "sec-plus"]),
    passingScore: 75,
    examDuration: 90,
    questionCount: 0,
  },
  {
    id: "azure-fundamentals",
    name: "Microsoft Azure Fundamentals",
    provider: "Microsoft",
    description: "Validates foundational knowledge of cloud concepts, Azure services, security, privacy, pricing, and support.",
    icon: "cloud",
    color: "text-sky-500",
    difficulty: "beginner",
    category: "cloud",
    estimatedHours: 30,
    examCode: "AZ-900",
    officialUrl: "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/",
    domains: JSON.stringify([
      { name: "Cloud Concepts", weight: 25 },
      { name: "Azure Architecture and Services", weight: 35 },
      { name: "Azure Management and Governance", weight: 30 },
      { name: "Azure Pricing and Support", weight: 10 },
    ]),
    channelMappings: JSON.stringify(["devops", "system-design"]),
    tags: JSON.stringify(["azure", "microsoft", "cloud", "fundamentals"]),
    passingScore: 70,
    examDuration: 60,
    questionCount: 0,
  },
  {
    id: "kubernetes-kcna",
    name: "Kubernetes and Cloud Native Associate",
    provider: "CNCF",
    description: "Entry-level certification validating foundational knowledge of Kubernetes and cloud-native technologies.",
    icon: "box",
    color: "text-blue-600",
    difficulty: "beginner",
    category: "devops",
    estimatedHours: 40,
    examCode: "KCNA",
    officialUrl: "https://www.cncf.io/certification/kcna/",
    domains: JSON.stringify([
      { name: "Kubernetes Fundamentals", weight: 46 },
      { name: "Container Orchestration", weight: 22 },
      { name: "Cloud Native Architecture", weight: 16 },
      { name: "Cloud Native Observability", weight: 8 },
      { name: "Cloud Native Application Delivery", weight: 8 },
    ]),
    channelMappings: JSON.stringify(["kubernetes", "devops"]),
    tags: JSON.stringify(["kubernetes", "cncf", "cloud-native", "kcna"]),
    passingScore: 75,
    examDuration: 90,
    questionCount: 0,
  },
];

// ─── MCQ Questions ─────────────────────────────────────────────────────────────
const questions = [
  // ── AWS SAA ───────────────────────────────────────────────────────────────
  {
    id: id(), channel: "aws", subChannel: "compute",
    question: `A company runs a web app on EC2 behind an ALB. During traffic spikes, the app slows down. The team wants automatic scaling without managing individual instances. Which solution is MOST appropriate?\nA) Use EC2 Auto Scaling with a target tracking policy based on ALBRequestCountPerTarget\nB) Use a larger EC2 instance type (vertical scaling)\nC) Create an AMI and manually launch instances during peak hours\nD) Use CloudWatch alarms to send an SNS notification to the ops team`,
    answer: "A) Use EC2 Auto Scaling with a target tracking policy based on ALBRequestCountPerTarget",
    explanation: `## Correct Answer: A\n\n### Why A is correct\nTarget tracking scaling policies with **ALBRequestCountPerTarget** maintain a constant number of requests per instance. When traffic spikes, Auto Scaling automatically adds instances; when traffic drops, it terminates them. This is fully automatic, cost-efficient, and requires no manual intervention.\n\n### Why B is wrong\nVertical scaling (larger instance) does not auto-scale. You still hit a ceiling, and the instance must be stopped to resize, causing downtime.\n\n### Why C is wrong\nManually launching instances defeats the purpose of automation and introduces human error and lag.\n\n### Why D is wrong\nSNS notification only alerts humans — it does not automatically provision capacity.\n\n### Key Concept\nAlways prefer **target tracking** over step/simple scaling for predictable, stable response times. The ALB metric is better than CPU for web tiers because it directly reflects user load.`,
    difficulty: "intermediate",
    tags: JSON.stringify(["aws-saa", "ec2", "auto-scaling", "alb", "amazon"]),
  },
  {
    id: id(), channel: "aws", subChannel: "storage",
    question: `A company stores 500 TB of infrequently accessed archive data and needs to retrieve specific files within 12 hours at the lowest cost. Which S3 storage class should they use?\nA) S3 Standard\nB) S3 Intelligent-Tiering\nC) S3 Glacier Flexible Retrieval\nD) S3 One Zone-IA`,
    answer: "C) S3 Glacier Flexible Retrieval",
    explanation: `## Correct Answer: C\n\n### Why C is correct\n**S3 Glacier Flexible Retrieval** (formerly S3 Glacier) offers the lowest storage cost for archives and supports retrieval within 1–12 hours (Standard retrieval). It is purpose-built for long-lived data that is rarely accessed.\n\n### Why A is wrong\nS3 Standard is for frequently accessed data — much higher per-GB cost with no retrieval delay. Massively over-provisioned for archive data.\n\n### Why B is wrong\nS3 Intelligent-Tiering is great for unpredictable access patterns, but has a monthly monitoring fee per object and does not reach Glacier-level pricing.\n\n### Why D is wrong\nS3 One Zone-IA stores data in a single AZ (no cross-AZ redundancy). It's cheaper than Standard-IA but does NOT offer archive-level pricing, and lacks durability guarantees.\n\n### Key Insight\nFor the exam: **lowest cost + 12-hour retrieval = Glacier Flexible Retrieval**. If they needed minutes = Glacier Instant Retrieval. If they needed milliseconds = Standard or Standard-IA.`,
    difficulty: "intermediate",
    tags: JSON.stringify(["aws-saa", "s3", "storage", "glacier", "amazon"]),
  },
  {
    id: id(), channel: "aws", subChannel: "networking",
    question: `A VPC has public and private subnets. EC2 instances in the private subnet need internet access to download security patches, but must NOT be directly reachable from the internet. What is the correct solution?\nA) Attach an Internet Gateway directly to the private subnet route table\nB) Place a NAT Gateway in the public subnet and route private subnet traffic to it\nC) Use a VPN connection to the corporate network for all internet traffic\nD) Move the instances to the public subnet and use security groups to restrict inbound traffic`,
    answer: "B) Place a NAT Gateway in the public subnet and route private subnet traffic to it",
    explanation: `## Correct Answer: B\n\n### Why B is correct\n**NAT Gateway** (in the public subnet) allows private subnet instances to initiate outbound connections to the internet while blocking all unsolicited inbound traffic. The flow: Private instance → NAT Gateway (public subnet) → Internet Gateway → Internet. Return traffic is allowed because NAT tracks connection state.\n\n### Why A is wrong\nAdding an IGW route to a private subnet route table effectively makes the subnet public (if instances have public IPs). A "private" subnet by definition should not have a direct IGW route.\n\n### Why C is wrong\nRouting all internet traffic through a VPN is architecturally complex, creates a bottleneck at the corporate gateway, and is not a standard AWS pattern for patch downloads.\n\n### Why D is wrong\nMoving instances to the public subnet exposes them to inbound internet traffic. Security groups alone cannot make an instance "private" in the network topology sense.\n\n### Architecture Rule\nPrivate subnet + outbound internet = NAT Gateway. Always in the public subnet. One per AZ for high availability.`,
    difficulty: "intermediate",
    tags: JSON.stringify(["aws-saa", "vpc", "nat-gateway", "networking", "amazon"]),
  },
  {
    id: id(), channel: "aws", subChannel: "databases",
    question: `A startup needs a fully managed relational database with automatic failover, up to 15 read replicas, and a serverless option for variable workloads. Which service should they choose?\nA) Amazon RDS for MySQL with Multi-AZ\nB) Amazon Aurora\nC) Amazon DynamoDB\nD) Amazon Redshift`,
    answer: "B) Amazon Aurora",
    explanation: `## Correct Answer: B\n\n### Why B is correct\n**Amazon Aurora** satisfies all three requirements:\n- **Automatic failover**: Aurora uses a cluster architecture with shared storage across 3 AZs. Failover typically completes in < 30 seconds\n- **Up to 15 read replicas**: Aurora supports up to 15 low-latency read replicas (vs. 5 for standard RDS)\n- **Serverless option**: Aurora Serverless v2 scales compute up/down automatically based on actual usage\n\n### Why A is wrong\nRDS Multi-AZ provides failover but only 5 read replicas and no native serverless option.\n\n### Why C is wrong\nDynamoDB is a NoSQL key-value/document database — not relational. Doesn't support SQL joins or ACID transactions across multiple tables.\n\n### Why D is wrong\nRedshift is a columnar data warehouse optimized for analytics (OLAP), not transactional workloads (OLTP).\n\n### Key Insight\nAurora = MySQL/PostgreSQL compatible, 5x MySQL throughput, 3x PostgreSQL throughput, global databases, and Serverless v2.`,
    difficulty: "intermediate",
    tags: JSON.stringify(["aws-saa", "aurora", "rds", "database", "amazon"]),
  },
  {
    id: id(), channel: "aws", subChannel: "serverless",
    question: `A company wants to trigger processing whenever an object is uploaded to an S3 bucket. The processing takes up to 5 minutes and should scale automatically. Which architecture is MOST cost-effective?\nA) S3 event notification → SQS → EC2 worker fleet with Auto Scaling\nB) S3 event notification → Lambda function\nC) S3 event notification → SNS → Lambda\nD) Poll S3 bucket with a cron job on EC2`,
    answer: "B) S3 event notification → Lambda function",
    explanation: `## Correct Answer: B\n\n### Why B is correct\nS3 can directly invoke Lambda on object creation events. Lambda scales automatically to the number of uploads, you pay only per invocation (not for idle time), and the max timeout of 15 minutes covers the 5-minute requirement. No EC2 or queue management needed.\n\n### Why A is wrong\nSQS + EC2 fleet works but is far more expensive (EC2 always running or slow to scale) and complex to manage. Not cost-effective for event-driven processing.\n\n### Why C is wrong\nS3 → SNS → Lambda adds an unnecessary hop. SNS is useful for fan-out to multiple subscribers. For a single processor, direct S3 → Lambda is simpler and equally reliable.\n\n### Why D is wrong\nPolling S3 with a cron job introduces latency (depends on cron frequency), wastes compute on empty polls, and requires managing EC2 uptime.\n\n### Decision Rule\n- Synchronous, < 15 min, event-driven = **Lambda**\n- Long-running (> 15 min) = Fargate, ECS, or EC2 + SQS`,
    difficulty: "beginner",
    tags: JSON.stringify(["aws-saa", "lambda", "s3", "serverless", "amazon"]),
  },

  // ── CKA ──────────────────────────────────────────────────────────────────
  {
    id: id(), channel: "kubernetes", subChannel: "pods",
    question: `You run: kubectl get pods and see a pod in "CrashLoopBackOff" state. What is the FIRST command you should run to diagnose the root cause?\nA) kubectl delete pod <pod-name> --force\nB) kubectl logs <pod-name> --previous\nC) kubectl exec -it <pod-name> -- /bin/sh\nD) kubectl describe node <node-name>`,
    answer: "B) kubectl logs <pod-name> --previous",
    explanation: `## Correct Answer: B\n\n### Why B is correct\n**CrashLoopBackOff** means the container is starting, crashing, and Kubernetes is restarting it with exponential back-off. The \`--previous\` flag shows logs from the **most recently terminated container instance**, which contains the actual crash output (stack trace, OOM error, config error, etc.).\n\n### Why A is wrong\nForce-deleting the pod destroys the crash evidence. Even if you recreate it, you haven't diagnosed anything.\n\n### Why C is wrong\nIn CrashLoopBackOff, the container crashes before you can exec into it. The exec will fail because the container isn't running long enough.\n\n### Why D is wrong\nNode describe is useful for node-level issues (DiskPressure, MemoryPressure) but not for application crashes.\n\n### Diagnostic Flow\n1. \`kubectl logs <pod> --previous\` → app-level crash\n2. \`kubectl describe pod <pod>\` → Events section for OOM, image pull errors, liveness probe failures\n3. \`kubectl get events --sort-by=.lastTimestamp\` → cluster-wide events`,
    difficulty: "beginner",
    tags: JSON.stringify(["cka", "kubernetes", "troubleshooting", "pods", "cncf"]),
  },
  {
    id: id(), channel: "kubernetes", subChannel: "scaling",
    question: `A Deployment has 3 replicas. You want Kubernetes to automatically scale it between 2 and 10 replicas based on CPU utilization, targeting 50% CPU. Which resource do you create?\nA) A VerticalPodAutoscaler (VPA)\nB) A HorizontalPodAutoscaler (HPA) with targetCPUUtilizationPercentage: 50\nC) Update the Deployment with maxReplicas: 10 directly\nD) A PodDisruptionBudget with minAvailable: 2`,
    answer: "B) A HorizontalPodAutoscaler (HPA) with targetCPUUtilizationPercentage: 50",
    explanation: `## Correct Answer: B\n\n### Why B is correct\nHPA watches the metrics server and adjusts the Deployment's replica count. Configuration:\n\`\`\`yaml\napiVersion: autoscaling/v2\nkind: HorizontalPodAutoscaler\nmetadata:\n  name: my-app-hpa\nspec:\n  scaleTargetRef:\n    apiVersion: apps/v1\n    kind: Deployment\n    name: my-app\n  minReplicas: 2\n  maxReplicas: 10\n  metrics:\n  - type: Resource\n    resource:\n      name: cpu\n      target:\n        type: Utilization\n        averageUtilization: 50\n\`\`\`\n\n### Why A is wrong\nVPA adjusts **CPU/memory requests** for individual pods (vertical scaling) — it does not change replica count.\n\n### Why C is wrong\nDeployments don't have a \`maxReplicas\` field directly. HPA manages replicas; the Deployment just defines the pod template.\n\n### Why D is wrong\nPodDisruptionBudget limits **voluntary disruptions** during maintenance — it's not a scaling tool.`,
    difficulty: "intermediate",
    tags: JSON.stringify(["cka", "kubernetes", "hpa", "scaling", "cncf"]),
  },
  {
    id: id(), channel: "kubernetes", subChannel: "config",
    question: `Your application needs to store database credentials that must NOT appear in pod specs or be stored in plain text in etcd. Which Kubernetes resource should you use, and what additional step improves security?\nA) ConfigMap, base64 encode the values manually\nB) Secret, enable etcd encryption at rest\nC) Secret, store them as environment variables in the Deployment spec\nD) ConfigMap with RBAC restrictions`,
    answer: "B) Secret, enable etcd encryption at rest",
    explanation: `## Correct Answer: B\n\n### Why B is correct\nKubernetes **Secrets** store sensitive data (base64-encoded, not encrypted by default in etcd). To truly protect them, you must **enable encryption at rest** in the kube-apiserver configuration (\`--encryption-provider-config\`). This ensures secrets are AES-256 encrypted in etcd storage.\n\n### Why A is wrong\nConfigMaps have no access control distinction from other configs. Base64 is encoding, not encryption — trivially reversible.\n\n### Why C is wrong\nUsing Secrets as env vars is better than ConfigMaps, but the question asks about the full security picture. Env vars can leak through \`kubectl describe pod\` and are visible in the pod spec without etcd encryption.\n\n### Why D is wrong\nConfigMaps with RBAC still store data in plain text in etcd. RBAC controls API access but doesn't encrypt stored data.\n\n### CKA Exam Tip\nKnow both the resource type AND the EncryptionConfiguration manifest structure for the kube-apiserver.`,
    difficulty: "advanced",
    tags: JSON.stringify(["cka", "kubernetes", "secrets", "security", "etcd", "cncf"]),
  },

  // ── Terraform Associate ───────────────────────────────────────────────────
  {
    id: id(), channel: "terraform", subChannel: "state-management",
    question: `Two engineers run 'terraform apply' simultaneously against the same remote state in S3. Without any locking mechanism, what is the risk?\nA) The second apply will fail with an authentication error\nB) Both applies will succeed but infrastructure may be duplicated or corrupted\nC) Terraform automatically queues the second apply until the first completes\nD) S3 versioning prevents any state corruption`,
    answer: "B) Both applies will succeed but infrastructure may be duplicated or corrupted",
    explanation: `## Correct Answer: B\n\n### Why B is correct\nWithout state locking, two concurrent \`terraform apply\` commands can both read the same state, make conflicting changes, and write back a corrupted or partial state. This can result in duplicate resources, missing resources, or an inconsistent state file that doesn't match actual infrastructure.\n\n### Why A is wrong\nAuthentication is unrelated to concurrency. Both engineers have valid credentials.\n\n### Why C is wrong\nTerraform does NOT automatically queue operations. It only queues if you use a backend that supports locking (like S3 + DynamoDB) AND locking is enabled.\n\n### Why D is wrong\nS3 versioning preserves old versions of the state file but does NOT prevent concurrent writes from creating a bad state in the first place.\n\n### Solution\nUse S3 backend + DynamoDB table for state locking:\n\`\`\`hcl\nterraform {\n  backend "s3" {\n    bucket         = "my-tf-state"\n    key            = "prod/terraform.tfstate"\n    region         = "us-east-1"\n    dynamodb_table = "tf-state-lock"\n    encrypt        = true\n  }\n}\n\`\`\``,
    difficulty: "intermediate",
    tags: JSON.stringify(["terraform-associate", "terraform", "state", "hashicorp"]),
  },
  {
    id: id(), channel: "terraform", subChannel: "modules",
    question: `A Terraform module is defined in './modules/network'. How do you reference an output named 'vpc_id' from this module in the root configuration?\nA) ${`module.network.outputs.vpc_id`}\nB) ${`var.network.vpc_id`}\nC) ${`module.network.vpc_id`}\nD) ${`data.network.vpc_id`}`,
    answer: "C) module.network.vpc_id",
    explanation: `## Correct Answer: C\n\n### Why C is correct\nOutputs from a child module are accessed using the syntax:\n\`module.<MODULE_NAME>.<OUTPUT_NAME>\`\n\nIn this case: \`module.network.vpc_id\`\n\nThe module block in root config:\n\`\`\`hcl\nmodule "network" {\n  source = "./modules/network"\n  cidr_block = "10.0.0.0/16"\n}\n\nresource "aws_instance" "web" {\n  vpc_security_group_ids = [module.network.vpc_id]\n}\n\`\`\`\n\n### Why A is wrong\n\`.outputs.\` is not part of the syntax. There's no \`outputs\` intermediate object.\n\n### Why B is wrong\n\`var.\` refers to input variables, not module outputs.\n\n### Why D is wrong\n\`data.\` refers to data sources (read-only queries of existing infrastructure), not module outputs.`,
    difficulty: "beginner",
    tags: JSON.stringify(["terraform-associate", "terraform", "modules", "hashicorp"]),
  },
  {
    id: id(), channel: "terraform", subChannel: "hcl-basics",
    question: `You run 'terraform plan' and see the symbol '~' next to a resource. What does this indicate?\nA) The resource will be destroyed and recreated\nB) The resource will be updated in-place\nC) The resource will be created for the first time\nD) The resource has a dependency conflict`,
    answer: "B) The resource will be updated in-place",
    explanation: `## Correct Answer: B\n\n### Plan Output Symbols\n| Symbol | Meaning |\n|--------|--------|\n| \`+\` | Create new resource |\n| \`-\` | Destroy resource |\n| \`~\` | Update in-place (modify existing resource) |\n| \`-/+\` | Destroy and recreate (replacement) |\n| \`<=\` | Read data source |\n\n### Why B is correct\n\`~\` (tilde) indicates Terraform will **update** the resource without destroying it. The resource ID remains the same. Example: changing an EC2 instance's tags.\n\n### Why A is wrong\nDestroy and recreate is shown as \`-/+\` (minus-plus). This happens when a change requires replacing the resource (e.g., changing an EC2 instance's AMI).\n\n### Why C is wrong\nNew creation is shown with \`+\` (plus).\n\n### Why D is wrong\nDependency conflicts cause plan errors, not a \`~\` symbol.\n\n### CKA Exam Tip\nAlways review \`-/+\` changes carefully — replacement means downtime for stateful resources.`,
    difficulty: "beginner",
    tags: JSON.stringify(["terraform-associate", "terraform", "plan", "hashicorp"]),
  },

  // ── Security+ ─────────────────────────────────────────────────────────────
  {
    id: id(), channel: "security", subChannel: "web-security",
    question: `An attacker injects malicious JavaScript into a product review field on an e-commerce site. When other users view the product page, the script runs in their browsers, stealing their session cookies. What type of attack is this?\nA) SQL Injection\nB) Cross-Site Request Forgery (CSRF)\nC) Stored Cross-Site Scripting (XSS)\nD) XML External Entity (XXE) attack`,
    answer: "C) Stored Cross-Site Scripting (XSS)",
    explanation: `## Correct Answer: C\n\n### Why C is correct\n**Stored XSS** (also called Persistent XSS) occurs when malicious script is saved to the server (in this case, the product review database) and then served to all users who view the page. The key indicators are:\n1. Script is stored server-side (in the review)\n2. Executes when other users load the page\n3. Steals cookies/session data\n\n### XSS Types\n| Type | Storage | Trigger |\n|------|---------|--------|\n| Stored | Server DB | Any user who views infected page |\n| Reflected | URL parameter | Victim clicks crafted link |\n| DOM-based | Browser DOM | JS reads malicious input from URL |\n\n### Why A is wrong\nSQL Injection targets the database directly with malicious SQL statements. It doesn't execute JavaScript in victims' browsers.\n\n### Why B is wrong\nCSRF tricks authenticated users into making unintended requests. It doesn't inject scripts and relies on the victim's existing session.\n\n### Why D is wrong\nXXE attacks exploit XML parsers to read local files or make server-side requests — unrelated to JavaScript injection.\n\n### Prevention\nHTTP-only cookies (prevent JS access), Content Security Policy (CSP), output encoding.`,
    difficulty: "beginner",
    tags: JSON.stringify(["security-plus", "security", "xss", "web-security", "comptia"]),
  },
  {
    id: id(), channel: "security", subChannel: "cryptography",
    question: `A company must ensure that messages cannot be altered in transit without detection AND the sender cannot deny sending the message. Which cryptographic mechanism satisfies BOTH requirements?\nA) Symmetric encryption (AES-256)\nB) Hashing (SHA-256)\nC) Digital signature\nD) Certificate Authority (CA)`,
    answer: "C) Digital signature",
    explanation: `## Correct Answer: C\n\n### Why C is correct\n**Digital signatures** use asymmetric cryptography to provide:\n1. **Integrity**: The signature is computed over the message hash. Any modification invalidates the signature\n2. **Non-repudiation**: Only the sender's private key can produce the signature. The sender cannot deny sending it\n\nProcess: Sender signs with private key → Receiver verifies with public key\n\n### Why A is wrong\nSymmetric encryption provides confidentiality but NOT non-repudiation. Both parties share the same key, so either could have created the message.\n\n### Why B is wrong\nHashing alone provides integrity (you can detect tampering) but NOT non-repudiation — anyone can compute a hash.\n\n### Why D is wrong\nA Certificate Authority issues digital certificates that bind a public key to an identity. It's infrastructure, not a mechanism that directly provides integrity + non-repudiation for a specific message.\n\n### Security Properties Summary\n| Mechanism | Confidentiality | Integrity | Non-repudiation |\n|-----------|----------------|-----------|----------------|\n| AES | ✅ | ❌ | ❌ |\n| SHA-256 | ❌ | ✅ | ❌ |\n| Digital Signature | ❌ | ✅ | ✅ |\n| AES + Digital Signature | ✅ | ✅ | ✅ |`,
    difficulty: "intermediate",
    tags: JSON.stringify(["security-plus", "security", "cryptography", "digital-signature", "comptia"]),
  },

  // ── Azure Fundamentals ────────────────────────────────────────────────────
  {
    id: id(), channel: "devops", subChannel: "ci-cd",
    question: `A company wants to run a web app without managing virtual machines, pay only for the compute time used, and automatically scale to zero when there are no requests. Which Azure service fits BEST?\nA) Azure Virtual Machines\nB) Azure Kubernetes Service (AKS)\nC) Azure Functions\nD) Azure App Service (Basic tier)`,
    answer: "C) Azure Functions",
    explanation: `## Correct Answer: C\n\n### Why C is correct\n**Azure Functions** is Azure's serverless compute service:\n- **No VM management**: Fully managed by Azure\n- **Pay-per-execution**: Billed per million executions and execution time — no cost at zero traffic\n- **Scale to zero**: No requests = no compute running = no cost\n- Automatically scales out based on demand\n\n### Why A is wrong\nAzure VMs always run (and bill) unless you deallocate them manually. They require OS patching, maintenance, and manual scaling.\n\n### Why B is wrong\nAKS runs containerized workloads on a cluster of VMs. Even with node auto-scaling, the minimum node count (usually 1) still runs and bills.\n\n### Why D is wrong\nApp Service Basic tier has dedicated instances running 24/7, even with zero traffic. It doesn't scale to zero.\n\n### Azure Compute Decision Tree\n- Full control needed → VM\n- Containerized apps → AKS or Container Apps\n- Event-driven, short tasks → Azure Functions\n- Long-running web apps → App Service`,
    difficulty: "beginner",
    tags: JSON.stringify(["azure-fundamentals", "azure", "functions", "serverless", "microsoft"]),
  },

  // ── KCNA ─────────────────────────────────────────────────────────────────
  {
    id: id(), channel: "kubernetes", subChannel: "pods",
    question: `What is the SMALLEST deployable unit in Kubernetes?\nA) Container\nB) Pod\nC) ReplicaSet\nD) Node`,
    answer: "B) Pod",
    explanation: `## Correct Answer: B\n\n### Why B is correct\nA **Pod** is the smallest deployable unit in Kubernetes. A pod encapsulates one or more containers, shared storage (volumes), a shared network namespace (IP address and ports), and a specification for how to run the containers.\n\nEven if a pod runs only one container, Kubernetes always manages the pod, not the container directly.\n\n### Why A is wrong\nContainers are the runtime component inside a pod. Kubernetes doesn't schedule individual containers — it schedules pods. Docker or containerd manages the containers inside the pod.\n\n### Why C is wrong\nA ReplicaSet manages multiple pods and ensures a desired number are running. It's a higher-level abstraction above pods.\n\n### Why D is wrong\nA Node is a worker machine (VM or physical server) that runs pods. It's part of the cluster infrastructure, not a deployable application unit.\n\n### Pod Key Facts\n- Containers in a pod share the same IP\n- Containers in a pod share the same localhost\n- Pods are ephemeral — don't store state in pods\n- Use Deployments (not raw pods) in production`,
    difficulty: "beginner",
    tags: JSON.stringify(["kubernetes-kcna", "kubernetes", "pods", "fundamentals", "cncf"]),
  },
];

async function main() {
  console.log("Seeding certifications...");

  // Insert certification tracks
  for (const cert of certifications) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO certifications
        (id, name, provider, description, icon, color, difficulty, category, estimated_hours, exam_code, official_url, domains, channel_mappings, tags, passing_score, exam_duration, status, question_count, created_at, last_updated)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        cert.id, cert.name, cert.provider, cert.description, cert.icon, cert.color,
        cert.difficulty, cert.category, cert.estimatedHours, cert.examCode,
        cert.officialUrl, cert.domains, cert.channelMappings, cert.tags,
        cert.passingScore, cert.examDuration, "active", cert.questionCount, NOW, NOW,
      ],
    });
    console.log("Cert upserted:", cert.name);
  }

  // Insert MCQ questions
  let inserted = 0;
  for (const q of questions) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO questions
        (id, question, answer, explanation, difficulty, tags, channel, sub_channel, status, is_new, created_at, last_updated)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [q.id, q.question, q.answer, q.explanation, q.difficulty, q.tags, q.channel, q.subChannel, "active", 1, NOW, NOW],
    });
    inserted++;
    console.log(`MCQ inserted [${q.channel}]:`, q.question.slice(0, 60).replace(/\n/g, " ") + "...");
  }

  console.log(`\nDone! ${certifications.length} cert tracks + ${inserted} MCQ questions seeded.`);
  client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
