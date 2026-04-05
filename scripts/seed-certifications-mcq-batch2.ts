/**
 * Issue #64 — More Certification MCQ questions (AWS, CKA, Terraform, Security+)
 * Inserts into the `questions` table with channel="certifications" (same pattern as seed-certifications.ts)
 * Run: npx tsx scripts/seed-certifications-mcq-batch2.ts
 */
import { createClient } from "@libsql/client";
import crypto from "crypto";

const client = createClient({ url: "file:local.db" });
const NOW = new Date().toISOString();
const id = () => crypto.randomUUID();

const questions = [
  // ── AWS SAA ──────────────────────────────────────────────────────────────
  {
    id: id(), channel: "certifications", subChannel: "aws-saa", difficulty: "intermediate",
    question: "Which AWS service provides a fully managed in-memory caching solution to reduce database load?\nA) Amazon RDS\nB) Amazon ElastiCache\nC) Amazon DynamoDB Accelerator (DAX)\nD) Amazon Redshift",
    answer: "B) Amazon ElastiCache",
    explanation: `## Correct Answer: B\n\n### Amazon ElastiCache\nProvides managed **Redis** or **Memcached** clusters for in-memory caching. Use cases:\n- Caching database query results\n- Session storage\n- Leaderboards (Redis Sorted Sets)\n- Pub/Sub messaging (Redis)\n\n### Why C is wrong\n**DAX (DynamoDB Accelerator)** is DynamoDB-specific — it only works with DynamoDB tables. ElastiCache works with any data source.\n\n### Why A is wrong\nRDS is a relational database, not a cache.\n\n### Why D is wrong\nRedshift is a data warehouse for analytics queries on petabytes of data — not a cache.\n\n### When to Use\n| Service | Use Case |\n|---------|----------|\n| ElastiCache Redis | General caching, sessions, pub/sub |\n| ElastiCache Memcached | Simple key-value caching, multi-threaded |\n| DAX | DynamoDB-specific microsecond reads |`,
    tags: JSON.stringify(["aws-saa", "caching", "elasticache", "amazon"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "aws-saa", difficulty: "intermediate",
    question: "A company wants to decouple its microservices so the order service can send messages to the inventory service without the inventory service needing to be available at the same time. Which service should they use?\nA) Amazon SNS\nB) Amazon SQS\nC) Amazon EventBridge\nD) Amazon API Gateway",
    answer: "B) Amazon SQS",
    explanation: `## Correct Answer: B\n\n### Amazon SQS (Simple Queue Service)\nDesigned for **point-to-point decoupling** with message queuing:\n- Producer (order service) sends messages that persist in the queue\n- Consumer (inventory service) polls when ready — no need to run simultaneously\n- Messages retained for up to 14 days\n- **FIFO queues**: exactly-once delivery, ordered\n- **Standard queues**: at-least-once delivery, best-effort ordering\n\n### Why A is wrong\n**SNS** (Simple Notification Service) is pub/sub — one message goes to **multiple subscribers** simultaneously. Good for fan-out, not point-to-point. SNS + SQS is a common combo.\n\n### Why C is wrong\n**EventBridge** is an event router/bus with pattern matching rules. Better for event-driven architectures with multiple consumers and filtering. Higher complexity than SQS for simple point-to-point.\n\n### Why D is wrong\n**API Gateway** creates synchronous HTTP APIs — the caller waits for a response. Not decoupling.\n\n### Decoupling Patterns\n- Point-to-point queue: SQS\n- Fan-out: SNS → multiple SQS queues\n- Complex event routing: EventBridge`,
    tags: JSON.stringify(["aws-saa", "sqs", "decoupling", "messaging", "amazon"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "aws-saa", difficulty: "intermediate",
    question: "An application stores user profile images accessed globally. Read performance is critical. Which combination provides the best global performance?\nA) S3 + EC2 in one region\nB) S3 + CloudFront CDN\nC) EBS + EC2 Multi-AZ\nD) EFS + Auto Scaling",
    answer: "B) S3 + CloudFront CDN",
    explanation: `## Correct Answer: B\n\n### S3 + CloudFront Architecture\n- **S3**: Stores images durably (11 9s durability), cheaply, at any scale\n- **CloudFront**: AWS's CDN with 400+ edge locations worldwide\n  - First request: fetches from S3 origin, caches at edge\n  - Subsequent requests: served from nearest edge location (< 10ms)\n  - Users in Tokyo get images from Tokyo edge, not us-east-1\n\n### Why A is wrong\nUS users on EC2 in us-east-1 get fast responses, but users in Asia/Europe make round trips across the Atlantic/Pacific (100-300ms latency).\n\n### Why C is wrong\nEBS is block storage for a single EC2 instance — not shared storage. Multi-AZ refers to RDS HA, not EBS. EBS can't serve global images.\n\n### Why D is wrong\nEFS is a shared filesystem (NFS) for EC2 — used for shared application data, not global image delivery. Still has geographic latency issues.\n\n### Performance Numbers\n- S3 origin in us-east-1 → Tokyo user: ~200ms\n- CloudFront edge in Tokyo → Tokyo user: ~5ms\n- **40x faster** with CloudFront`,
    tags: JSON.stringify(["aws-saa", "cloudfront", "s3", "cdn", "performance", "amazon"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "aws-saa", difficulty: "advanced",
    question: "A company's security policy requires S3 encryption at rest where they manage their own encryption keys outside of AWS. Which solution meets this?\nA) SSE-S3 (S3-managed keys)\nB) SSE-KMS with AWS-managed key\nC) SSE-C (Customer-provided keys)\nD) Client-side encryption with keys stored in S3",
    answer: "C) SSE-C (Customer-provided keys)",
    explanation: `## Correct Answer: C\n\n### SSE-C (Server-Side Encryption with Customer-Provided Keys)\n- Customer provides the encryption key in each API request header\n- AWS uses the key to encrypt/decrypt\n- AWS does **NOT** store the key — only the HMAC of the key for validation\n- Customer must manage and store the key themselves\n- Works with HTTPS only (key in header must be secure)\n\n### Why A is wrong\n**SSE-S3**: AWS generates and manages the keys entirely. Customer has zero control over key material.\n\n### Why B is wrong\n**SSE-KMS**: Even with a Customer Managed Key (CMK), the key metadata is stored in AWS KMS. AWS technically has access to the key material within the AWS boundary.\n\n### Why D is wrong\nStoring encryption keys in S3 contradicts the requirement of "outside of AWS." Both the data and keys would be in AWS.\n\n### Encryption Options Summary\n| Option | Who Manages Keys | Keys Stored |\n|--------|-----------------|------------|\n| SSE-S3 | AWS | AWS |\n| SSE-KMS (AWS key) | AWS | KMS |\n| SSE-KMS (CMK) | Customer + AWS | KMS |\n| SSE-C | Customer | Customer (outside AWS) |\n| Client-side | Customer | Customer |`,
    tags: JSON.stringify(["aws-saa", "encryption", "s3", "security", "sse-c", "amazon"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "aws-saa", difficulty: "intermediate",
    question: "S3 objects are frequently accessed in the first 30 days, rarely for 90 days, then deletable. Most cost-effective solution?\nA) Keep all objects in S3 Standard\nB) Lifecycle policy: Standard → Standard-IA after 30 days → delete after 120 days\nC) Manually move objects with Lambda cron\nD) S3 Intelligent-Tiering for all objects",
    answer: "B) Lifecycle policy: Standard → Standard-IA after 30 days → delete after 120 days",
    explanation: `## Correct Answer: B\n\n### S3 Lifecycle Policy\nAutomates storage class transitions at no extra cost. Configure in S3 console or via JSON:\n\`\`\`json\n{\n  "Rules": [{\n    "Transitions": [\n      {"Days": 30, "StorageClass": "STANDARD_IA"}\n    ],\n    "Expiration": {"Days": 120}\n  }]\n}\n\`\`\`\n\n**S3 Standard-IA** (Infrequent Access): ~40% less storage cost than Standard, but charges per retrieval. Perfect for rarely-accessed data with occasional reads.\n\n**Expiration at day 120** (30 + 90): eliminates ongoing storage costs entirely.\n\n### Why A is wrong\nPaying Standard prices (~$0.023/GB) for 90 days of cold data when Standard-IA (~$0.0125/GB) is available wastes ~46% on storage cost.\n\n### Why C is wrong\nLambda cron job adds: Lambda execution costs, S3 API costs per object, operational complexity, error handling — when built-in lifecycle policies do this for free.\n\n### Why D is wrong\n**S3 Intelligent-Tiering** charges a monitoring fee per object (~$0.0025/1000 objects/month). For PREDICTABLE access patterns (frequent → infrequent → delete), lifecycle policies cost less. Intelligent-Tiering shines for UNPREDICTABLE patterns.`,
    tags: JSON.stringify(["aws-saa", "s3", "cost-optimization", "lifecycle", "amazon"]),
  },

  // ── CKA ──────────────────────────────────────────────────────────────────
  {
    id: id(), channel: "certifications", subChannel: "cka", difficulty: "intermediate",
    question: "A node needs maintenance. Which command safely evicts all pods and prevents new scheduling?\nA) kubectl delete node <node>\nB) kubectl cordon <node>\nC) kubectl drain <node> --ignore-daemonsets\nD) kubectl taint nodes <node> NoSchedule",
    answer: "C) kubectl drain <node> --ignore-daemonsets",
    explanation: `## Correct Answer: C\n\n### kubectl drain\nCombines TWO operations:\n1. **Cordons** the node: marks it unschedulable (no new pods)\n2. **Evicts** all eligible pods: pods get gracefully terminated and rescheduled on other nodes\n\n\`\`\`bash\nkubectl drain node01 --ignore-daemonsets --delete-emptydir-data\n# After maintenance:\nkubectl uncordon node01\n\`\`\`\n\n\`--ignore-daemonsets\`: DaemonSet pods can't be evicted to other nodes (they run on every node by design)\n\`--delete-emptydir-data\`: needed if pods use emptyDir volumes (data will be lost)\n\n### Why B is wrong\n\`kubectl cordon\` only marks the node unschedulable — it does NOT evict existing pods. Running pods continue running.\n\n### Why A is wrong\n\`kubectl delete node\` removes the node OBJECT from the API — the actual machine still runs, but Kubernetes no longer manages it. Very destructive.\n\n### Why D is wrong\nTaints prevent pods without matching tolerations from scheduling but don't evict existing pods.`,
    tags: JSON.stringify(["cka", "kubernetes", "node-maintenance", "drain", "cordon"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "cka", difficulty: "intermediate",
    question: "You need to ensure a pod always runs on nodes labeled 'hardware=gpu'. Which scheduling mechanism should you use?\nA) nodeSelector: hardware: gpu\nB) Pod affinity\nC) Taints and tolerations\nD) Resource requests: nvidia.com/gpu: 1",
    answer: "A) nodeSelector: hardware: gpu",
    explanation: `## Correct Answer: A\n\n### nodeSelector\nSimplest way to constrain pods to nodes with specific labels:\n\`\`\`yaml\nspec:\n  nodeSelector:\n    hardware: gpu\n  containers:\n  - name: ml-trainer\n    image: pytorch:latest\n\`\`\`\nKubernetes scheduler only places this pod on nodes where \`hardware=gpu\` label exists.\n\n### nodeAffinity (Advanced Alternative)\n\`\`\`yaml\naffinity:\n  nodeAffinity:\n    requiredDuringSchedulingIgnoredDuringExecution:\n      nodeSelectorTerms:\n      - matchExpressions:\n        - key: hardware\n          operator: In\n          values: [gpu]\n\`\`\`\nMore expressive: supports operators (In, NotIn, Exists, Gt, Lt)\n\n### Why B is wrong\n**Pod affinity** is for pod-to-pod relationships: "schedule near pods with label app=cache" — nothing to do with node hardware labels.\n\n### Why C is wrong\n**Taints/Tolerations** work in reverse: taints REPEL pods unless they tolerate. GPU nodes would be tainted, and GPU pods would have tolerations. Separate mechanism, different use case.\n\n### Why D is wrong\nnvidia.com/gpu resource request requires the NVIDIA device plugin to be installed and configured — it's complementary to but not a replacement for label-based scheduling.`,
    tags: JSON.stringify(["cka", "kubernetes", "scheduling", "nodeselector", "affinity"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "cka", difficulty: "advanced",
    question: "A NetworkPolicy selects all pods and has an empty ingress list (ingress: []). What is the effect?\nA) Allow all ingress traffic\nB) Deny all ingress traffic to selected pods\nC) No change — empty rules are ignored\nD) Deny all egress traffic",
    answer: "B) Deny all ingress traffic to selected pods",
    explanation: `## Correct Answer: B\n\n### NetworkPolicy — Ingress Rules\nKey rule: once a NetworkPolicy selects a pod, **all traffic not explicitly allowed is denied**.\n\n\`\`\`yaml\napiVersion: networking.k8s.io/v1\nkind: NetworkPolicy\nmetadata:\n  name: deny-all-ingress\nspec:\n  podSelector: {}        # selects ALL pods in namespace\n  policyTypes:\n  - Ingress\n  ingress: []            # empty list = NO ingress allowed\n\`\`\`\n\n### Why C is wrong\nEmpty ingress list is NOT ignored. The \`policyTypes: [Ingress]\` declaration means ingress IS being controlled. With no rules, nothing is allowed.\n\n### Comparison\n\`\`\`yaml\n# This IGNORES ingress (no policyTypes for ingress)\npolicyTypes: [Egress]\n# vs\n# This DENIES all ingress\npolicyTypes: [Ingress]\ningress: []\n\`\`\`\n\n### Why D is wrong\nThis policy only specifies Ingress in policyTypes — egress is unaffected.\n\n### Common Patterns\n- **Deny all ingress**: \`policyTypes: [Ingress], ingress: []\`\n- **Allow only from same namespace**: \`from: [{podSelector: {}}]\`\n- **Allow from specific namespace**: \`from: [{namespaceSelector: {matchLabels: {env: prod}}}]\``,
    tags: JSON.stringify(["cka", "kubernetes", "networkpolicy", "security", "ingress"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "cka", difficulty: "intermediate",
    question: "Which PersistentVolume access mode allows multiple nodes to mount the volume simultaneously with read-write access?\nA) ReadWriteOnce (RWO)\nB) ReadOnlyMany (ROX)\nC) ReadWriteMany (RWX)\nD) ReadWriteOncePod (RWOP)",
    answer: "C) ReadWriteMany (RWX)",
    explanation: `## Correct Answer: C\n\n### PV Access Modes\n| Mode | Abbr | Description | Example Storage |\n|------|------|-------------|----------------|\n| ReadWriteOnce | RWO | One node, read-write | EBS, local disk |\n| ReadOnlyMany | ROX | Many nodes, read-only | NFS, S3 FUSE |\n| ReadWriteMany | RWX | Many nodes, read-write | NFS, CephFS, EFS, GlusterFS |\n| ReadWriteOncePod | RWOP | ONE pod, read-write | Local, EBS (K8s 1.22+) |\n\n### RWX Use Cases\n- Shared web content across multiple pods\n- Machine learning training data shared between workers\n- Shared configuration files\n\n### Storage Support\n- NFS: RWO, ROX, RWX ✓\n- AWS EBS: RWO only ✗ (RWX not supported)\n- AWS EFS: RWO, ROX, RWX ✓\n- Azure Files: RWO, ROX, RWX ✓\n- GCP Filestore (NFS): RWO, ROX, RWX ✓\n\n### Key Point\nThe access mode is a REQUEST — the volume plugin must SUPPORT it. EBS claims it supports RWO only. Requesting RWX on EBS will fail scheduling.`,
    tags: JSON.stringify(["cka", "kubernetes", "persistent-volumes", "storage", "access-modes"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "cka", difficulty: "intermediate",
    question: "A pod is in 'CrashLoopBackOff' state. Which sequence of commands best diagnoses the issue?\nA) kubectl delete pod <pod> then kubectl apply -f pod.yaml\nB) kubectl describe pod <pod> then kubectl logs <pod> --previous\nC) kubectl exec -it <pod> -- /bin/sh\nD) kubectl get events --all-namespaces",
    answer: "B) kubectl describe pod <pod> then kubectl logs <pod> --previous",
    explanation: `## Correct Answer: B\n\n### CrashLoopBackOff Diagnosis\n**CrashLoopBackOff** = container starts, crashes immediately, Kubernetes restarts with exponential backoff (10s, 20s, 40s, 80s, 160s, 5min cap).\n\n#### Step 1: kubectl describe pod <pod>\nShows Events section with:\n- Container exit code (1=app error, 137=OOM killed, 127=command not found, 1=config error)\n- Image pull errors\n- Liveness probe failures\n- Volume mount errors\n- Resource limits (OOMKilled)\n\n#### Step 2: kubectl logs <pod> --previous\nThe \`--previous\` flag is CRITICAL — it shows logs from the **terminated** (crashed) container instance, not the currently-starting one.\n\n\`\`\`bash\nkubectl logs my-pod --previous\n# Shows the actual crash output: stack trace, error message, etc.\n\`\`\`\n\n### Why A is wrong\nDelete + recreate destroys crash evidence and doesn't diagnose anything. The pod will just crash again.\n\n### Why C is wrong\nCan't exec into a crashing container — it's not running long enough. You'll get "error: unable to upgrade connection".\n\n### Why D is wrong\nEvents are useful but less targeted. describe pod already shows relevant events for that specific pod.`,
    tags: JSON.stringify(["cka", "kubernetes", "troubleshooting", "crashloopbackoff", "debugging"]),
  },

  // ── TERRAFORM ────────────────────────────────────────────────────────────
  {
    id: id(), channel: "certifications", subChannel: "terraform-associate", difficulty: "basic",
    question: "What does 'terraform init' do?\nA) Creates infrastructure resources in the cloud\nB) Initializes the working directory, downloads provider plugins, configures backend\nC) Shows a preview of changes without applying them\nD) Imports existing infrastructure into Terraform state",
    answer: "B) Initializes the working directory, downloads provider plugins, configures backend",
    explanation: `## Correct Answer: B\n\n### terraform init\nMust run first in any new Terraform directory. It:\n1. **Downloads provider plugins** from the Terraform Registry (or configured mirror)\n   - e.g., hashicorp/aws provider at specified version\n   - Stored in .terraform/providers/\n2. **Initializes the backend** (where state is stored)\n   - local (default): terraform.tfstate\n   - remote: S3, Terraform Cloud, Azure Storage\n3. **Downloads modules** referenced in configuration\n4. Generates **.terraform.lock.hcl** — locks provider versions for reproducibility\n\n### Commands Overview\n| Command | What it does |\n|---------|-------------|\n| \`terraform init\` | Initialize workspace, download providers/modules |\n| \`terraform plan\` | Preview changes (no actual changes) |\n| \`terraform apply\` | Create/update/delete resources |\n| \`terraform destroy\` | Delete all managed resources |\n| \`terraform import\` | Import existing resource into state |\n| \`terraform output\` | Show output values |`,
    tags: JSON.stringify(["terraform-associate", "terraform", "init", "providers", "hashicorp"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "terraform-associate", difficulty: "intermediate",
    question: "Your team collaborates on Terraform. What is the recommended approach to prevent state corruption?\nA) Each developer keeps their own local terraform.tfstate\nB) Commit terraform.tfstate to Git\nC) Use remote state storage (S3 + DynamoDB or Terraform Cloud) with state locking\nD) Use a shared network drive for the state file",
    answer: "C) Use remote state storage (S3 + DynamoDB or Terraform Cloud) with state locking",
    explanation: `## Correct Answer: C\n\n### Remote State with Locking\nStandard team collaboration pattern:\n\n\`\`\`hcl\nterraform {\n  backend "s3" {\n    bucket         = "my-terraform-state"\n    key            = "prod/terraform.tfstate"\n    region         = "us-east-1"\n    dynamodb_table = "terraform-locks"\n    encrypt        = true\n  }\n}\n\`\`\`\n\n**S3**: Stores state file, versioned (rollback capability), encrypted\n**DynamoDB**: State locking — prevents TWO developers from running apply simultaneously\n\nLocking mechanism:\n1. Dev A runs \`terraform apply\` → DynamoDB lock item created\n2. Dev B runs \`terraform apply\` → sees lock → errors out with lock ID\n3. Dev A finishes → lock released\n\n### Alternatives\n- **Terraform Cloud**: Built-in state storage + locking + collaboration features\n- **Azure**: Azure Storage + Azure Blob lease for locking\n- **GCP**: GCS bucket + GCS object lock\n\n### Why Others Fail\n- Local state: no sharing possible\n- Git: merge conflicts destroy state; exposes secrets in plaintext; no locking\n- Network drive: file locking unreliable; single point of failure`,
    tags: JSON.stringify(["terraform-associate", "terraform", "remote-state", "state-locking", "hashicorp"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "terraform-associate", difficulty: "intermediate",
    question: "What is the purpose of a Terraform data source?\nA) Stores sensitive values like passwords and API keys\nB) Reads data from external sources or existing infrastructure for use in configuration\nC) Defines the desired state of infrastructure to be created\nD) Stores output values to share with other Terraform configurations",
    answer: "B) Reads data from external sources or existing infrastructure for use in configuration",
    explanation: `## Correct Answer: B\n\n### Terraform Data Sources\nData sources fetch information from **existing** infrastructure or external APIs:\n\n\`\`\`hcl\n# Fetch latest Ubuntu AMI (changes over time)\ndata "aws_ami" "ubuntu" {\n  most_recent = true\n  filter {\n    name   = "name"\n    values = ["ubuntu/images/hvm-ssd/ubuntu-*-22.04-amd64-server-*"]\n  }\n  owners = ["099720109477"]  # Canonical\n}\n\n# Reference it\nresource "aws_instance" "web" {\n  ami           = data.aws_ami.ubuntu.id  # <- use data source\n  instance_type = "t3.micro"\n}\n\`\`\`\n\n### Key Characteristics\n- **Read-only**: Terraform does NOT create, update, or delete data sources\n- **External dependency**: data reflects current state of external system\n- **Refreshed on each plan**: gets current value, not cached\n\n### Common Data Sources\n| Data Source | What it fetches |\n|------------|----------------|\n| aws_ami | Latest AMI ID |\n| aws_vpc | VPC ID by tags |\n| aws_subnet_ids | Subnet IDs in a VPC |\n| terraform_remote_state | Outputs from another TF workspace |\n| http | Content from an HTTP endpoint |`,
    tags: JSON.stringify(["terraform-associate", "terraform", "data-sources", "hashicorp"]),
  },

  // ── Security+ ────────────────────────────────────────────────────────────
  {
    id: id(), channel: "certifications", subChannel: "security-plus", difficulty: "intermediate",
    question: "What type of attack involves an attacker positioning themselves between two communicating parties to intercept or alter communications?\nA) Denial of Service (DoS)\nB) Man-in-the-Middle (MitM)\nC) SQL Injection\nD) Phishing",
    answer: "B) Man-in-the-Middle (MitM)",
    explanation: `## Correct Answer: B\n\n### Man-in-the-Middle (MitM) Attacks\nAttacker intercepts communications between two parties who believe they're communicating directly:\n\n#### Attack Methods\n| Method | How It Works |\n|--------|-------------|\n| ARP Poisoning | Attacker sends fake ARP replies, associating their MAC with victim's IP |\n| SSL Stripping | Downgrade HTTPS to HTTP, intercept cleartext |\n| Evil Twin AP | Fake WiFi hotspot with same SSID as legitimate AP |\n| BGP Hijacking | Malicious route announcements redirect internet traffic |\n| DNS Spoofing | Return false IP addresses for domain lookups |\n\n#### Impact\n- Credential theft (passwords, session tokens)\n- Data manipulation in transit\n- Account takeover\n\n#### Mitigations\n- **TLS/HTTPS everywhere**: Encrypt traffic so interception yields only ciphertext\n- **Certificate pinning**: App refuses to connect if cert doesn't match expected value\n- **HSTS**: Browser forces HTTPS, prevents SSL stripping\n- **mTLS**: Both parties authenticate with certificates\n- **VPN**: Encrypted tunnel prevents eavesdropping on untrusted networks\n\n### Other Attack Types\n- DoS: overwhelm with traffic\n- SQL Injection: malicious database queries\n- Phishing: social engineering via fake emails/sites`,
    tags: JSON.stringify(["security-plus", "security", "mitm", "attacks", "network-security"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "security-plus", difficulty: "basic",
    question: "Which authentication factor type does a fingerprint scanner represent?\nA) Something you know\nB) Something you have\nC) Something you are\nD) Somewhere you are",
    answer: "C) Something you are",
    explanation: `## Correct Answer: C\n\n### Authentication Factors\n\n| Factor Type | Description | Examples |\n|------------|-------------|----------|\n| Something you **know** | Knowledge-based | Password, PIN, security question |\n| Something you **have** | Possession-based | Smart card, YubiKey, phone (OTP app), token |\n| Something you **are** | Inherence (biometric) | Fingerprint, retina scan, face ID, voice |\n| Somewhere you **are** | Location-based | GPS location, network/IP address |\n| Something you **do** | Behavioral | Typing pattern (cadence), signature dynamics |\n\n### Why Biometrics = "Something You Are"\nBiometrics measure PHYSICAL characteristics of the person — inherent to them, not something they carry or know.\n\n### Multi-Factor Authentication (MFA)\nRequires **2+ DIFFERENT factor types** (not 2 things from the same category):\n- ✅ Password (know) + phone OTP (have) = 2FA\n- ❌ Password + security question = NOT 2FA (both are "something you know")\n- ✅ Fingerprint (are) + PIN (know) = 2FA\n\n### Common MFA Implementations\n- TOTP (Time-based OTP): Google Authenticator, Authy — "something you have"\n- SMS OTP: weaker (SIM swapping attacks)\n- Hardware keys: FIDO2/WebAuthn — phishing resistant`,
    tags: JSON.stringify(["security-plus", "security", "authentication", "mfa", "biometrics"]),
  },
  {
    id: id(), channel: "certifications", subChannel: "security-plus", difficulty: "intermediate",
    question: "What is the primary difference between symmetric and asymmetric encryption?\nA) Symmetric is more secure; asymmetric is faster\nB) Symmetric uses one shared key; asymmetric uses a key pair (public + private)\nC) Symmetric is used for hashing; asymmetric is used for encryption\nD) Symmetric requires a certificate authority; asymmetric does not",
    answer: "B) Symmetric uses one shared key; asymmetric uses a key pair (public + private)",
    explanation: `## Correct Answer: B\n\n### Symmetric Encryption\n- Same key to encrypt AND decrypt\n- **Fast**: ~1000x faster than asymmetric\n- Good for bulk data (large files, streams)\n- Challenge: securely distributing the shared key\n- Examples: **AES-128/256**, 3DES, ChaCha20\n\n### Asymmetric Encryption\n- **Public key**: anyone can encrypt; share freely\n- **Private key**: only owner can decrypt; keep secret\n- Solves key distribution problem\n- **Slow**: computationally expensive\n- Only for small data or key exchange\n- Examples: **RSA-2048/4096**, ECC (Elliptic Curve), Diffie-Hellman\n\n### How TLS Uses Both (Best of Both Worlds)\n1. **Handshake** (asymmetric): client uses server's public key to securely send/agree on a symmetric session key\n2. **Data transfer** (symmetric): bulk encrypted data with fast AES session key\n\n### Other Asymmetric Uses\n- **Digital signatures**: sign with private key, verify with public key\n- **Certificate validation**: CA signs cert with private key; browser verifies with CA's public key\n\n### Hashing (Not Encryption)\nHashing is one-way (no key, no decryption). Examples: SHA-256, bcrypt. Used for password storage, integrity verification.`,
    tags: JSON.stringify(["security-plus", "security", "cryptography", "symmetric", "asymmetric", "encryption"]),
  },
];

async function main() {
  console.log(`Seeding ${questions.length} certification MCQ questions into questions table...`);
  let count = 0;
  for (const q of questions) {
    await client.execute({
      sql: `INSERT OR IGNORE INTO questions
        (id, question, answer, explanation, difficulty, tags, channel, sub_channel, status, is_new, created_at, last_updated)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [q.id, q.question, q.answer, q.explanation, q.difficulty, q.tags, q.channel, q.subChannel, "active", 1, NOW, NOW],
    });
    count++;
    console.log(`[certifications/${q.subChannel}] ${q.question.slice(0, 55).replace(/\n/g, " ")}...`);
  }
  console.log(`\nDone! ${count} certification MCQ questions inserted.`);
  client.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
