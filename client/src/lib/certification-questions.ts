/**
 * Certification-Specific Questions
 * Curated MCQ questions aligned with actual certification exam objectives
 */

export interface CertificationQuestion {
  id: string;
  certificationId: string;
  domain: string; // Exam domain/objective
  domainWeight: number; // % weight in actual exam
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface CertificationDomain {
  id: string;
  name: string;
  weight: number; // percentage in exam
  description: string;
}

export interface CertificationExamConfig {
  certificationId: string;
  domains: CertificationDomain[];
  totalQuestions: number;
  passingScore: number;
  timeLimit: number; // minutes
}

// AWS Solutions Architect Associate Domains (SAA-C03)
export const awsSaaDomains: CertificationDomain[] = [
  { id: 'design-secure', name: 'Design Secure Architectures', weight: 30, description: 'IAM, encryption, network security' },
  { id: 'design-resilient', name: 'Design Resilient Architectures', weight: 26, description: 'High availability, fault tolerance, disaster recovery' },
  { id: 'design-performant', name: 'Design High-Performing Architectures', weight: 24, description: 'Compute, storage, database optimization' },
  { id: 'design-cost', name: 'Design Cost-Optimized Architectures', weight: 20, description: 'Cost-effective solutions, pricing models' },
];

// CKA Domains
export const ckaDomains: CertificationDomain[] = [
  { id: 'cluster-arch', name: 'Cluster Architecture', weight: 25, description: 'Installation, configuration, RBAC' },
  { id: 'workloads', name: 'Workloads & Scheduling', weight: 15, description: 'Deployments, pods, scheduling' },
  { id: 'services', name: 'Services & Networking', weight: 20, description: 'Services, ingress, network policies' },
  { id: 'storage', name: 'Storage', weight: 10, description: 'Volumes, PV, PVC, storage classes' },
  { id: 'troubleshoot', name: 'Troubleshooting', weight: 30, description: 'Cluster and application debugging' },
];

// Terraform Associate Domains
export const terraformDomains: CertificationDomain[] = [
  { id: 'iac-concepts', name: 'IaC Concepts', weight: 15, description: 'Infrastructure as Code fundamentals' },
  { id: 'terraform-purpose', name: 'Terraform Purpose', weight: 10, description: 'Use cases and benefits' },
  { id: 'terraform-basics', name: 'Terraform Basics', weight: 20, description: 'CLI, providers, resources' },
  { id: 'terraform-state', name: 'Terraform State', weight: 15, description: 'State management, backends' },
  { id: 'modules', name: 'Modules', weight: 15, description: 'Module creation and usage' },
  { id: 'workflow', name: 'Core Workflow', weight: 15, description: 'Write, plan, apply' },
  { id: 'cloud', name: 'Terraform Cloud', weight: 10, description: 'Remote operations, workspaces' },
];

// AWS SAP Domains
export const awsSapDomains: CertificationDomain[] = [
  { id: 'org-complex', name: 'Design for Organizational Complexity', weight: 26, description: 'Multi-account, governance, migration' },
  { id: 'new-solutions', name: 'Design for New Solutions', weight: 29, description: 'Security, strategy, deployment' },
  { id: 'migration', name: 'Migration Planning', weight: 15, description: 'Workload migration strategies' },
  { id: 'cost-control', name: 'Cost Control', weight: 10, description: 'Cost optimization at scale' },
  { id: 'continuous-improvement', name: 'Continuous Improvement', weight: 20, description: 'Operational excellence, performance' },
];

// AWS DVA Domains
export const awsDvaDomains: CertificationDomain[] = [
  { id: 'development', name: 'Development with AWS Services', weight: 32, description: 'Lambda, API Gateway, SDKs' },
  { id: 'security', name: 'Security', weight: 26, description: 'Authentication, authorization, encryption' },
  { id: 'deployment', name: 'Deployment', weight: 24, description: 'CI/CD, deployment strategies' },
  { id: 'troubleshooting', name: 'Troubleshooting and Optimization', weight: 18, description: 'Debugging, performance tuning' },
];

// AWS SysOps Domains
export const awsSysopsDomains: CertificationDomain[] = [
  { id: 'monitoring', name: 'Monitoring, Logging and Remediation', weight: 20, description: 'CloudWatch, X-Ray, alerting' },
  { id: 'reliability', name: 'Reliability and Business Continuity', weight: 16, description: 'High availability, backup, recovery' },
  { id: 'deployment', name: 'Deployment, Provisioning and Automation', weight: 18, description: 'CloudFormation, Elastic Beanstalk' },
  { id: 'security', name: 'Security and Compliance', weight: 16, description: 'IAM, compliance, encryption' },
  { id: 'networking', name: 'Networking and Content Delivery', weight: 18, description: 'VPC, Route 53, CloudFront' },
  { id: 'cost', name: 'Cost and Performance Optimization', weight: 12, description: 'Rightsizing, cost explorer' },
];

// CKAD Domains
export const ckadDomains: CertificationDomain[] = [
  { id: 'app-design', name: 'Application Design and Build', weight: 20, description: 'Container images, Jobs, CronJobs' },
  { id: 'app-deployment', name: 'Application Deployment', weight: 20, description: 'Deployments, rolling updates, Helm' },
  { id: 'app-observability', name: 'Application Observability and Maintenance', weight: 15, description: 'Probes, logging, debugging' },
  { id: 'app-env', name: 'Application Environment, Configuration and Security', weight: 25, description: 'ConfigMaps, Secrets, RBAC' },
  { id: 'services-networking', name: 'Services and Networking', weight: 20, description: 'Services, Ingress, NetworkPolicies' },
];

// CKS Domains
export const cksDomains: CertificationDomain[] = [
  { id: 'cluster-setup', name: 'Cluster Setup', weight: 10, description: 'Network policies, CIS benchmarks, TLS' },
  { id: 'cluster-hardening', name: 'Cluster Hardening', weight: 15, description: 'RBAC, service accounts, updates' },
  { id: 'system-hardening', name: 'System Hardening', weight: 15, description: 'OS footprint, kernel, AppArmor' },
  { id: 'supply-chain', name: 'Minimize Microservice Vulnerabilities', weight: 20, description: 'Pod security, OPA, secrets' },
  { id: 'supply-chain-security', name: 'Supply Chain Security', weight: 20, description: 'Image scanning, allowlist, signing' },
  { id: 'monitoring', name: 'Monitoring, Logging and Runtime Security', weight: 20, description: 'Falco, audit logs, immutability' },
];

// GCP ACE Domains
export const gcpAceDomains: CertificationDomain[] = [
  { id: 'cloud-solution', name: 'Setting Up a Cloud Solution Environment', weight: 17, description: 'Projects, billing, IAM' },
  { id: 'cloud-planning', name: 'Planning and Configuring a Cloud Solution', weight: 17, description: 'Compute, storage, network planning' },
  { id: 'cloud-deploying', name: 'Deploying and Implementing a Cloud Solution', weight: 22, description: 'GKE, GCE, Cloud Run' },
  { id: 'cloud-ensuring', name: 'Ensuring Successful Operation', weight: 22, description: 'Monitoring, logging, managing resources' },
  { id: 'cloud-configuring', name: 'Configuring Access and Security', weight: 22, description: 'IAM, service accounts, auditing' },
];

// GCP PCA Domains
export const gcpPcaDomains: CertificationDomain[] = [
  { id: 'designing', name: 'Designing and Planning', weight: 24, description: 'Solution design, data model, network' },
  { id: 'managing-infra', name: 'Managing and Provisioning Infrastructure', weight: 15, description: 'Compute, storage, networking resources' },
  { id: 'security', name: 'Designing for Security and Compliance', weight: 18, description: 'IAM, encryption, compliance' },
  { id: 'analyzing', name: 'Analyzing and Optimizing Processes', weight: 18, description: 'Business continuity, performance' },
  { id: 'managing-migration', name: 'Managing Implementation', weight: 11, description: 'Development, APIs, testing' },
  { id: 'reliability', name: 'Ensuring Solution and Operations Reliability', weight: 14, description: 'Monitoring, SLOs, incident response' },
];

// AZ-900 Domains
export const az900Domains: CertificationDomain[] = [
  { id: 'cloud-concepts', name: 'Cloud Concepts', weight: 25, description: 'Cloud models, benefits, service types' },
  { id: 'azure-architecture', name: 'Azure Architecture and Services', weight: 35, description: 'Compute, storage, networking, databases' },
  { id: 'azure-management', name: 'Azure Management and Governance', weight: 30, description: 'Cost management, governance, compliance' },
];

// AZ-104 Domains
export const az104Domains: CertificationDomain[] = [
  { id: 'identity', name: 'Manage Azure Identities and Governance', weight: 20, description: 'Azure AD, RBAC, subscriptions' },
  { id: 'storage', name: 'Implement and Manage Storage', weight: 15, description: 'Storage accounts, blob, file, access' },
  { id: 'compute', name: 'Deploy and Manage Azure Compute Resources', weight: 20, description: 'VMs, containers, App Service' },
  { id: 'networking', name: 'Implement and Manage Virtual Networking', weight: 25, description: 'VNets, NSGs, load balancers' },
  { id: 'monitoring', name: 'Monitor and Maintain Azure Resources', weight: 10, description: 'Azure Monitor, backup, disaster recovery' },
];

// AZ-305 Domains
export const az305Domains: CertificationDomain[] = [
  { id: 'identity-governance', name: 'Design Identity, Governance, and Monitoring', weight: 25, description: 'Identity, RBAC, monitoring solutions' },
  { id: 'data-storage', name: 'Design Data Storage Solutions', weight: 25, description: 'Relational, non-relational, data integration' },
  { id: 'business-continuity', name: 'Design Business Continuity Solutions', weight: 15, description: 'Backup, disaster recovery, HA' },
  { id: 'infrastructure', name: 'Design Infrastructure Solutions', weight: 35, description: 'Compute, network, migrations' },
];

// CompTIA Security+ Domains
export const securityPlusDomains: CertificationDomain[] = [
  { id: 'general-security', name: 'General Security Concepts', weight: 12, description: 'Security controls, cryptography basics' },
  { id: 'threats', name: 'Threats, Vulnerabilities and Mitigations', weight: 22, description: 'Attack types, threat intelligence' },
  { id: 'architecture', name: 'Security Architecture', weight: 18, description: 'Network security, cloud, zero trust' },
  { id: 'operations', name: 'Security Operations', weight: 28, description: 'Identity, endpoint security, incident response' },
  { id: 'program-management', name: 'Security Program Management', weight: 20, description: 'Governance, risk, compliance' },
];

// AWS Security Specialty Domains
export const awsSecurityDomains: CertificationDomain[] = [
  { id: 'threat-detection', name: 'Threat Detection and Incident Response', weight: 14, description: 'GuardDuty, Security Hub, incident response' },
  { id: 'security-logging', name: 'Security Logging and Monitoring', weight: 18, description: 'CloudTrail, Config, Macie' },
  { id: 'infra-security', name: 'Infrastructure Security', weight: 20, description: 'VPC, WAF, Shield, Network Firewall' },
  { id: 'iam', name: 'Identity and Access Management', weight: 16, description: 'IAM policies, SCPs, Cognito' },
  { id: 'data-protection', name: 'Data Protection', weight: 18, description: 'KMS, ACM, Secrets Manager' },
  { id: 'management-governance', name: 'Management and Security Governance', weight: 14, description: 'Organizations, Control Tower, Config' },
];

// AWS Data Engineer Domains
export const awsDataEngineerDomains: CertificationDomain[] = [
  { id: 'data-ingestion', name: 'Data Ingestion and Transformation', weight: 34, description: 'Kinesis, Glue, DMS, streaming' },
  { id: 'data-store', name: 'Data Store Management', weight: 26, description: 'S3, Redshift, DynamoDB, Lake Formation' },
  { id: 'data-operations', name: 'Data Operations and Support', weight: 22, description: 'Monitoring, optimization, automation' },
  { id: 'data-security', name: 'Data Security and Governance', weight: 18, description: 'Encryption, access control, compliance' },
];

// AWS ML Specialty Domains
export const awsMlDomains: CertificationDomain[] = [
  { id: 'data-engineering', name: 'Data Engineering', weight: 20, description: 'Data collection, storage, feature engineering' },
  { id: 'exploratory-analysis', name: 'Exploratory Data Analysis', weight: 24, description: 'Sanitize, prepare, analyze data' },
  { id: 'modeling', name: 'Modeling', weight: 36, description: 'Algorithms, training, evaluation, SageMaker' },
  { id: 'ml-implementation', name: 'ML Implementation and Operations', weight: 20, description: 'Deployment, monitoring, optimization' },
];

// Linux+ Domains
export const linuxPlusDomains: CertificationDomain[] = [
  { id: 'system-management', name: 'System Management', weight: 32, description: 'Storage, processes, user management' },
  { id: 'security', name: 'Security', weight: 21, description: 'Permissions, encryption, hardening' },
  { id: 'scripting', name: 'Scripting, Containers and Automation', weight: 19, description: 'Bash scripting, containers, orchestration' },
  { id: 'troubleshooting', name: 'Troubleshooting', weight: 28, description: 'Networking, application, storage issues' },
];

// RHCSA Domains
export const rhcsaDomains: CertificationDomain[] = [
  { id: 'essential-tools', name: 'Understand and Use Essential Tools', weight: 20, description: 'Shell, files, grep, tar, ssh' },
  { id: 'operate-systems', name: 'Operate Running Systems', weight: 20, description: 'Boot, processes, services, logs' },
  { id: 'storage', name: 'Configure Local Storage', weight: 15, description: 'Partitions, LVM, filesystems' },
  { id: 'file-systems', name: 'Create and Configure File Systems', weight: 15, description: 'Mount, NFS, permissions, ACLs' },
  { id: 'deploy-configure', name: 'Deploy, Configure and Maintain Systems', weight: 15, description: 'Install packages, subscriptions, cron' },
  { id: 'manage-users', name: 'Manage Users and Groups', weight: 15, description: 'User accounts, sudo, SELinux' },
];

// PSD Domains
export const psdDomains: CertificationDomain[] = [
  { id: 'agile-tdd', name: 'Agile and TDD', weight: 40, description: 'Test-driven development, agile practices' },
  { id: 'software-engineering', name: 'Software Engineering', weight: 35, description: 'Clean code, refactoring, design patterns' },
  { id: 'devops-practices', name: 'DevOps Practices', weight: 25, description: 'CI/CD, automation, continuous delivery' },
];

// AWS Database Specialty Domains
export const awsDatabaseDomains: CertificationDomain[] = [
  { id: 'workload-specific', name: 'Workload-Specific Database Design', weight: 26, description: 'Choose the right database for workloads' },
  { id: 'deployment', name: 'Deployment and Migration', weight: 20, description: 'Database deployment, DMS migrations' },
  { id: 'management', name: 'Management and Operations', weight: 18, description: 'Maintenance, monitoring, automation' },
  { id: 'monitoring', name: 'Monitoring and Troubleshooting', weight: 18, description: 'Performance, diagnostics, optimization' },
  { id: 'database-security', name: 'Database Security', weight: 18, description: 'Encryption, access control, auditing' },
];

// CCNA Domains
export const ccnaDomains: CertificationDomain[] = [
  { id: 'network-fundamentals', name: 'Network Fundamentals', weight: 20, description: 'OSI model, Ethernet, TCP/IP' },
  { id: 'network-access', name: 'Network Access', weight: 20, description: 'VLANs, spanning tree, wireless' },
  { id: 'ip-connectivity', name: 'IP Connectivity', weight: 25, description: 'Routing protocols, OSPF, static routes' },
  { id: 'ip-services', name: 'IP Services', weight: 10, description: 'DHCP, DNS, NAT, NTP, QoS' },
  { id: 'security-fundamentals', name: 'Security Fundamentals', weight: 15, description: 'ACLs, AAA, VPN, threat defense' },
  { id: 'automation', name: 'Automation and Programmability', weight: 10, description: 'Ansible, REST APIs, JSON' },
];

// AWS Networking Specialty Domains
export const awsNetworkingDomains: CertificationDomain[] = [
  { id: 'network-design', name: 'Network Design', weight: 30, description: 'VPC design, hybrid connectivity, HA' },
  { id: 'network-implementation', name: 'Network Implementation', weight: 26, description: 'Routing, direct connect, transit gateway' },
  { id: 'network-management', name: 'Network Management, Operations and Optimization', weight: 20, description: 'Monitoring, automation, optimization' },
  { id: 'network-security', name: 'Network Security, Compliance and Governance', weight: 24, description: 'WAF, Shield, security groups, firewalls' },
];

// Exam configurations
export const examConfigs: Record<string, CertificationExamConfig> = {
  'aws-saa': {
    certificationId: 'aws-saa',
    domains: awsSaaDomains,
    totalQuestions: 65,
    passingScore: 72,
    timeLimit: 130,
  },
  'cka': {
    certificationId: 'cka',
    domains: ckaDomains,
    totalQuestions: 17,
    passingScore: 66,
    timeLimit: 120,
  },
  'terraform-associate': {
    certificationId: 'terraform-associate',
    domains: terraformDomains,
    totalQuestions: 57,
    passingScore: 70,
    timeLimit: 60,
  },
  'aws-sap': {
    certificationId: 'aws-sap',
    domains: awsSapDomains,
    totalQuestions: 75,
    passingScore: 75,
    timeLimit: 180,
  },
  'aws-dva': {
    certificationId: 'aws-dva',
    domains: awsDvaDomains,
    totalQuestions: 65,
    passingScore: 72,
    timeLimit: 130,
  },
  'aws-sysops': {
    certificationId: 'aws-sysops',
    domains: awsSysopsDomains,
    totalQuestions: 65,
    passingScore: 72,
    timeLimit: 130,
  },
  'ckad': {
    certificationId: 'ckad',
    domains: ckadDomains,
    totalQuestions: 15,
    passingScore: 66,
    timeLimit: 120,
  },
  'cks': {
    certificationId: 'cks',
    domains: cksDomains,
    totalQuestions: 15,
    passingScore: 67,
    timeLimit: 120,
  },
  'gcp-ace': {
    certificationId: 'gcp-ace',
    domains: gcpAceDomains,
    totalQuestions: 50,
    passingScore: 70,
    timeLimit: 120,
  },
  'gcp-pca': {
    certificationId: 'gcp-pca',
    domains: gcpPcaDomains,
    totalQuestions: 50,
    passingScore: 70,
    timeLimit: 120,
  },
  'az-900': {
    certificationId: 'az-900',
    domains: az900Domains,
    totalQuestions: 40,
    passingScore: 70,
    timeLimit: 45,
  },
  'az-104': {
    certificationId: 'az-104',
    domains: az104Domains,
    totalQuestions: 60,
    passingScore: 70,
    timeLimit: 120,
  },
  'az-305': {
    certificationId: 'az-305',
    domains: az305Domains,
    totalQuestions: 60,
    passingScore: 70,
    timeLimit: 120,
  },
  'comptia-security-plus': {
    certificationId: 'comptia-security-plus',
    domains: securityPlusDomains,
    totalQuestions: 90,
    passingScore: 75,
    timeLimit: 90,
  },
  'aws-security': {
    certificationId: 'aws-security',
    domains: awsSecurityDomains,
    totalQuestions: 65,
    passingScore: 75,
    timeLimit: 170,
  },
  'aws-data-engineer': {
    certificationId: 'aws-data-engineer',
    domains: awsDataEngineerDomains,
    totalQuestions: 65,
    passingScore: 72,
    timeLimit: 130,
  },
  'aws-ml-specialty': {
    certificationId: 'aws-ml-specialty',
    domains: awsMlDomains,
    totalQuestions: 65,
    passingScore: 75,
    timeLimit: 180,
  },
  'linux-plus': {
    certificationId: 'linux-plus',
    domains: linuxPlusDomains,
    totalQuestions: 90,
    passingScore: 72,
    timeLimit: 90,
  },
  'rhcsa': {
    certificationId: 'rhcsa',
    domains: rhcsaDomains,
    totalQuestions: 20,
    passingScore: 70,
    timeLimit: 150,
  },
  'psd': {
    certificationId: 'psd',
    domains: psdDomains,
    totalQuestions: 80,
    passingScore: 85,
    timeLimit: 60,
  },
  'aws-database': {
    certificationId: 'aws-database',
    domains: awsDatabaseDomains,
    totalQuestions: 65,
    passingScore: 75,
    timeLimit: 180,
  },
  'ccna': {
    certificationId: 'ccna',
    domains: ccnaDomains,
    totalQuestions: 100,
    passingScore: 82,
    timeLimit: 120,
  },
  'aws-networking': {
    certificationId: 'aws-networking',
    domains: awsNetworkingDomains,
    totalQuestions: 65,
    passingScore: 75,
    timeLimit: 170,
  },
};

// Sample certification questions - AWS SAA
export const certificationQuestions: CertificationQuestion[] = [
  // AWS SAA - Design Secure Architectures
  {
    id: 'aws-saa-001',
    certificationId: 'aws-saa',
    domain: 'design-secure',
    domainWeight: 30,
    question: 'A company needs to ensure that all data stored in S3 is encrypted at rest using keys managed by the company. Which encryption option should they use?',
    options: [
      { id: 'a', text: 'SSE-S3', isCorrect: false },
      { id: 'b', text: 'SSE-KMS with customer managed keys', isCorrect: true },
      { id: 'c', text: 'SSE-C', isCorrect: false },
      { id: 'd', text: 'Client-side encryption', isCorrect: false },
    ],
    explanation: 'SSE-KMS with customer managed keys (CMK) allows the company to manage their own encryption keys in AWS KMS while still using server-side encryption. SSE-S3 uses AWS-managed keys, SSE-C requires customers to manage keys outside AWS, and client-side encryption happens before upload.',
    difficulty: 'intermediate',
    tags: ['s3', 'encryption', 'kms', 'security'],
  },
  {
    id: 'aws-saa-002',
    certificationId: 'aws-saa',
    domain: 'design-secure',
    domainWeight: 30,
    question: 'Which IAM policy element is used to specify the resources that the policy applies to?',
    options: [
      { id: 'a', text: 'Action', isCorrect: false },
      { id: 'b', text: 'Effect', isCorrect: false },
      { id: 'c', text: 'Resource', isCorrect: true },
      { id: 'd', text: 'Principal', isCorrect: false },
    ],
    explanation: 'The Resource element specifies the AWS resources to which the policy applies using ARNs. Action specifies allowed/denied actions, Effect specifies Allow/Deny, and Principal specifies who the policy applies to.',
    difficulty: 'beginner',
    tags: ['iam', 'policy', 'security'],
  },
  {
    id: 'aws-saa-003',
    certificationId: 'aws-saa',
    domain: 'design-secure',
    domainWeight: 30,
    question: 'A solutions architect needs to restrict access to an S3 bucket so that objects can only be accessed through CloudFront. What should they configure?',
    options: [
      { id: 'a', text: 'S3 bucket policy with VPC endpoint condition', isCorrect: false },
      { id: 'b', text: 'Origin Access Control (OAC) with S3 bucket policy', isCorrect: true },
      { id: 'c', text: 'IAM role for CloudFront', isCorrect: false },
      { id: 'd', text: 'S3 Access Points', isCorrect: false },
    ],
    explanation: 'Origin Access Control (OAC) is the recommended way to restrict S3 access to CloudFront only. It replaces the legacy Origin Access Identity (OAI). The S3 bucket policy is updated to only allow access from the CloudFront distribution.',
    difficulty: 'intermediate',
    tags: ['s3', 'cloudfront', 'security', 'oac'],
  },

  // AWS SAA - Design Resilient Architectures
  {
    id: 'aws-saa-004',
    certificationId: 'aws-saa',
    domain: 'design-resilient',
    domainWeight: 26,
    question: 'A company requires their application to remain available even if an entire AWS Region fails. Which architecture pattern should they implement?',
    options: [
      { id: 'a', text: 'Multi-AZ deployment', isCorrect: false },
      { id: 'b', text: 'Multi-Region active-passive with Route 53 failover', isCorrect: true },
      { id: 'c', text: 'Auto Scaling across multiple AZs', isCorrect: false },
      { id: 'd', text: 'Elastic Load Balancer with health checks', isCorrect: false },
    ],
    explanation: 'Multi-Region deployment is required for regional failure resilience. Route 53 failover routing can direct traffic to a standby region when the primary fails. Multi-AZ only protects against AZ failures within a single region.',
    difficulty: 'intermediate',
    tags: ['high-availability', 'disaster-recovery', 'route53', 'multi-region'],
  },
  {
    id: 'aws-saa-005',
    certificationId: 'aws-saa',
    domain: 'design-resilient',
    domainWeight: 26,
    question: 'Which RDS feature provides automatic failover to a standby replica in another Availability Zone?',
    options: [
      { id: 'a', text: 'Read Replicas', isCorrect: false },
      { id: 'b', text: 'Multi-AZ deployment', isCorrect: true },
      { id: 'c', text: 'Aurora Global Database', isCorrect: false },
      { id: 'd', text: 'Database snapshots', isCorrect: false },
    ],
    explanation: 'Multi-AZ deployment maintains a synchronous standby replica in a different AZ. AWS automatically fails over to the standby (typically 60-120 seconds) if the primary fails. Read Replicas are for read scaling, not automatic failover.',
    difficulty: 'beginner',
    tags: ['rds', 'high-availability', 'multi-az', 'database'],
  },
  {
    id: 'aws-saa-006',
    certificationId: 'aws-saa',
    domain: 'design-resilient',
    domainWeight: 26,
    question: 'An application uses SQS to decouple components. Messages are being processed multiple times. What should be implemented to prevent duplicate processing?',
    options: [
      { id: 'a', text: 'Increase visibility timeout', isCorrect: false },
      { id: 'b', text: 'Use FIFO queue with deduplication', isCorrect: true },
      { id: 'c', text: 'Enable long polling', isCorrect: false },
      { id: 'd', text: 'Use dead letter queue', isCorrect: false },
    ],
    explanation: 'SQS FIFO queues provide exactly-once processing through message deduplication. Standard queues offer at-least-once delivery which can result in duplicates. Visibility timeout prevents re-processing during processing but doesn\'t prevent duplicates.',
    difficulty: 'intermediate',
    tags: ['sqs', 'messaging', 'fifo', 'deduplication'],
  },

  // AWS SAA - Design High-Performing Architectures
  {
    id: 'aws-saa-007',
    certificationId: 'aws-saa',
    domain: 'design-performant',
    domainWeight: 24,
    question: 'A web application experiences variable traffic with unpredictable spikes. Which EC2 purchasing option provides the best balance of cost and availability?',
    options: [
      { id: 'a', text: 'Reserved Instances only', isCorrect: false },
      { id: 'b', text: 'Spot Instances only', isCorrect: false },
      { id: 'c', text: 'On-Demand with Auto Scaling', isCorrect: true },
      { id: 'd', text: 'Dedicated Hosts', isCorrect: false },
    ],
    explanation: 'On-Demand instances with Auto Scaling provide flexibility for unpredictable workloads. Reserved Instances are cost-effective for steady-state but don\'t handle spikes. Spot Instances can be interrupted and aren\'t suitable for critical web traffic.',
    difficulty: 'intermediate',
    tags: ['ec2', 'auto-scaling', 'cost-optimization', 'compute'],
  },
  {
    id: 'aws-saa-008',
    certificationId: 'aws-saa',
    domain: 'design-performant',
    domainWeight: 24,
    question: 'Which service should be used to cache frequently accessed data to reduce database load?',
    options: [
      { id: 'a', text: 'Amazon S3', isCorrect: false },
      { id: 'b', text: 'Amazon ElastiCache', isCorrect: true },
      { id: 'c', text: 'Amazon EBS', isCorrect: false },
      { id: 'd', text: 'AWS Storage Gateway', isCorrect: false },
    ],
    explanation: 'ElastiCache (Redis or Memcached) is designed for in-memory caching to reduce database load and improve application performance. It provides sub-millisecond latency for frequently accessed data.',
    difficulty: 'beginner',
    tags: ['elasticache', 'caching', 'performance', 'database'],
  },

  // AWS SAA - Design Cost-Optimized Architectures
  {
    id: 'aws-saa-009',
    certificationId: 'aws-saa',
    domain: 'design-cost',
    domainWeight: 20,
    question: 'A company has predictable, steady-state workloads running 24/7. Which EC2 purchasing option offers the most cost savings?',
    options: [
      { id: 'a', text: 'On-Demand Instances', isCorrect: false },
      { id: 'b', text: 'Spot Instances', isCorrect: false },
      { id: 'c', text: 'Reserved Instances (1 or 3 year)', isCorrect: true },
      { id: 'd', text: 'Scheduled Reserved Instances', isCorrect: false },
    ],
    explanation: 'Reserved Instances offer up to 72% discount compared to On-Demand for steady-state workloads with 1 or 3 year commitments. Spot Instances are cheaper but can be interrupted. Savings Plans also offer similar benefits with more flexibility.',
    difficulty: 'beginner',
    tags: ['ec2', 'cost-optimization', 'reserved-instances', 'pricing'],
  },
  {
    id: 'aws-saa-010',
    certificationId: 'aws-saa',
    domain: 'design-cost',
    domainWeight: 20,
    question: 'Which S3 storage class is most cost-effective for data that is accessed once a month and can tolerate retrieval delays?',
    options: [
      { id: 'a', text: 'S3 Standard', isCorrect: false },
      { id: 'b', text: 'S3 Standard-IA', isCorrect: false },
      { id: 'c', text: 'S3 Glacier Flexible Retrieval', isCorrect: true },
      { id: 'd', text: 'S3 One Zone-IA', isCorrect: false },
    ],
    explanation: 'S3 Glacier Flexible Retrieval is ideal for archive data accessed infrequently (monthly or less) where retrieval times of minutes to hours are acceptable. It offers significant cost savings over Standard-IA for this access pattern.',
    difficulty: 'intermediate',
    tags: ['s3', 'storage-classes', 'glacier', 'cost-optimization'],
  },

  // CKA Questions
  {
    id: 'cka-001',
    certificationId: 'cka',
    domain: 'cluster-arch',
    domainWeight: 25,
    question: 'Which component is responsible for scheduling pods to nodes in a Kubernetes cluster?',
    options: [
      { id: 'a', text: 'kubelet', isCorrect: false },
      { id: 'b', text: 'kube-scheduler', isCorrect: true },
      { id: 'c', text: 'kube-controller-manager', isCorrect: false },
      { id: 'd', text: 'etcd', isCorrect: false },
    ],
    explanation: 'kube-scheduler watches for newly created pods with no assigned node and selects a node for them to run on based on resource requirements, constraints, and policies.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'scheduler', 'control-plane', 'architecture'],
  },
  {
    id: 'cka-002',
    certificationId: 'cka',
    domain: 'cluster-arch',
    domainWeight: 25,
    question: 'What is the purpose of etcd in a Kubernetes cluster?',
    options: [
      { id: 'a', text: 'Container runtime', isCorrect: false },
      { id: 'b', text: 'Network proxy', isCorrect: false },
      { id: 'c', text: 'Cluster state storage', isCorrect: true },
      { id: 'd', text: 'Pod scheduling', isCorrect: false },
    ],
    explanation: 'etcd is a distributed key-value store that stores all cluster data including configuration, state, and metadata. It\'s the source of truth for the cluster state.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'etcd', 'storage', 'architecture'],
  },
  {
    id: 'cka-003',
    certificationId: 'cka',
    domain: 'workloads',
    domainWeight: 15,
    question: 'Which kubectl command creates a deployment named "nginx" with 3 replicas?',
    options: [
      { id: 'a', text: 'kubectl run nginx --replicas=3', isCorrect: false },
      { id: 'b', text: 'kubectl create deployment nginx --replicas=3', isCorrect: true },
      { id: 'c', text: 'kubectl apply deployment nginx --replicas=3', isCorrect: false },
      { id: 'd', text: 'kubectl deploy nginx --replicas=3', isCorrect: false },
    ],
    explanation: 'kubectl create deployment creates a new deployment. The --replicas flag sets the desired number of pod replicas. kubectl run creates a pod, not a deployment.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'kubectl', 'deployment', 'workloads'],
  },
  {
    id: 'cka-004',
    certificationId: 'cka',
    domain: 'services',
    domainWeight: 20,
    question: 'Which Service type exposes the service on each node\'s IP at a static port?',
    options: [
      { id: 'a', text: 'ClusterIP', isCorrect: false },
      { id: 'b', text: 'NodePort', isCorrect: true },
      { id: 'c', text: 'LoadBalancer', isCorrect: false },
      { id: 'd', text: 'ExternalName', isCorrect: false },
    ],
    explanation: 'NodePort exposes the service on each node\'s IP at a static port (30000-32767 by default). ClusterIP is internal only, LoadBalancer provisions an external load balancer, ExternalName maps to a DNS name.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'services', 'networking', 'nodeport'],
  },
  {
    id: 'cka-005',
    certificationId: 'cka',
    domain: 'storage',
    domainWeight: 10,
    question: 'What is the correct order of operations when a pod requests persistent storage?',
    options: [
      { id: 'a', text: 'PV → PVC → Pod', isCorrect: false },
      { id: 'b', text: 'PVC → PV → Pod', isCorrect: false },
      { id: 'c', text: 'StorageClass → PVC → PV (dynamic) → Pod', isCorrect: true },
      { id: 'd', text: 'Pod → PVC → PV', isCorrect: false },
    ],
    explanation: 'With dynamic provisioning: StorageClass defines the provisioner, PVC requests storage referencing the StorageClass, PV is dynamically created, then the Pod mounts the PVC.',
    difficulty: 'intermediate',
    tags: ['kubernetes', 'storage', 'pv', 'pvc', 'storageclass'],
  },
  {
    id: 'cka-006',
    certificationId: 'cka',
    domain: 'troubleshoot',
    domainWeight: 30,
    question: 'A pod is stuck in "Pending" state. Which command helps identify the scheduling issue?',
    options: [
      { id: 'a', text: 'kubectl logs <pod>', isCorrect: false },
      { id: 'b', text: 'kubectl describe pod <pod>', isCorrect: true },
      { id: 'c', text: 'kubectl exec <pod> -- sh', isCorrect: false },
      { id: 'd', text: 'kubectl top pod <pod>', isCorrect: false },
    ],
    explanation: 'kubectl describe pod shows events and conditions including scheduling failures. The Events section reveals why the scheduler couldn\'t place the pod (insufficient resources, node selectors, taints, etc.).',
    difficulty: 'beginner',
    tags: ['kubernetes', 'troubleshooting', 'kubectl', 'debugging'],
  },

  // Terraform Questions
  {
    id: 'tf-001',
    certificationId: 'terraform-associate',
    domain: 'iac-concepts',
    domainWeight: 15,
    question: 'What is the primary benefit of Infrastructure as Code?',
    options: [
      { id: 'a', text: 'Faster network speeds', isCorrect: false },
      { id: 'b', text: 'Version control and reproducibility', isCorrect: true },
      { id: 'c', text: 'Lower cloud costs', isCorrect: false },
      { id: 'd', text: 'Automatic security patches', isCorrect: false },
    ],
    explanation: 'IaC enables version control, reproducibility, and consistency. Infrastructure can be reviewed, tested, and rolled back like application code. While it can help optimize costs, that\'s not the primary benefit.',
    difficulty: 'beginner',
    tags: ['terraform', 'iac', 'fundamentals'],
  },
  {
    id: 'tf-002',
    certificationId: 'terraform-associate',
    domain: 'terraform-basics',
    domainWeight: 20,
    question: 'Which command initializes a Terraform working directory?',
    options: [
      { id: 'a', text: 'terraform start', isCorrect: false },
      { id: 'b', text: 'terraform init', isCorrect: true },
      { id: 'c', text: 'terraform begin', isCorrect: false },
      { id: 'd', text: 'terraform setup', isCorrect: false },
    ],
    explanation: 'terraform init initializes the working directory, downloads providers, and sets up the backend. It must be run before other commands like plan or apply.',
    difficulty: 'beginner',
    tags: ['terraform', 'cli', 'init', 'basics'],
  },
  {
    id: 'tf-003',
    certificationId: 'terraform-associate',
    domain: 'terraform-state',
    domainWeight: 15,
    question: 'Where does Terraform store state by default?',
    options: [
      { id: 'a', text: 'In memory only', isCorrect: false },
      { id: 'b', text: 'terraform.tfstate file locally', isCorrect: true },
      { id: 'c', text: 'Terraform Cloud', isCorrect: false },
      { id: 'd', text: 'AWS S3', isCorrect: false },
    ],
    explanation: 'By default, Terraform stores state in a local file named terraform.tfstate. For team collaboration, remote backends like S3 or Terraform Cloud are recommended.',
    difficulty: 'beginner',
    tags: ['terraform', 'state', 'tfstate', 'basics'],
  },
  {
    id: 'tf-004',
    certificationId: 'terraform-associate',
    domain: 'modules',
    domainWeight: 15,
    question: 'How do you reference an output from a child module?',
    options: [
      { id: 'a', text: 'var.module_name.output_name', isCorrect: false },
      { id: 'b', text: 'module.module_name.output_name', isCorrect: true },
      { id: 'c', text: 'output.module_name.output_name', isCorrect: false },
      { id: 'd', text: 'data.module_name.output_name', isCorrect: false },
    ],
    explanation: 'Module outputs are accessed using module.<MODULE_NAME>.<OUTPUT_NAME>. The module block name is used, not the source path.',
    difficulty: 'intermediate',
    tags: ['terraform', 'modules', 'outputs', 'references'],
  },
  {
    id: 'tf-005',
    certificationId: 'terraform-associate',
    domain: 'workflow',
    domainWeight: 15,
    question: 'What is the correct order of the core Terraform workflow?',
    options: [
      { id: 'a', text: 'Apply → Plan → Write', isCorrect: false },
      { id: 'b', text: 'Write → Apply → Plan', isCorrect: false },
      { id: 'c', text: 'Write → Plan → Apply', isCorrect: true },
      { id: 'd', text: 'Plan → Write → Apply', isCorrect: false },
    ],
    explanation: 'The core workflow is Write (author configuration), Plan (preview changes), Apply (execute changes). This ensures changes are reviewed before being applied.',
    difficulty: 'beginner',
    tags: ['terraform', 'workflow', 'plan', 'apply'],
  },

  // Additional AWS SAA Questions
  {
    id: 'aws-saa-011',
    certificationId: 'aws-saa',
    domain: 'design-secure',
    domainWeight: 30,
    question: 'Which AWS service provides a virtual private network connection between your on-premises network and AWS?',
    options: [
      { id: 'a', text: 'AWS Direct Connect', isCorrect: false },
      { id: 'b', text: 'AWS Site-to-Site VPN', isCorrect: true },
      { id: 'c', text: 'AWS Transit Gateway', isCorrect: false },
      { id: 'd', text: 'Amazon VPC Peering', isCorrect: false },
    ],
    explanation: 'AWS Site-to-Site VPN creates an encrypted tunnel over the internet between your on-premises network and AWS VPC. Direct Connect provides a dedicated physical connection, not VPN.',
    difficulty: 'intermediate',
    tags: ['vpn', 'networking', 'hybrid', 'security'],
  },
  {
    id: 'aws-saa-012',
    certificationId: 'aws-saa',
    domain: 'design-resilient',
    domainWeight: 26,
    question: 'An application requires exactly-once message processing. Which SQS queue type should be used?',
    options: [
      { id: 'a', text: 'Standard Queue with visibility timeout', isCorrect: false },
      { id: 'b', text: 'FIFO Queue', isCorrect: true },
      { id: 'c', text: 'Dead Letter Queue', isCorrect: false },
      { id: 'd', text: 'Standard Queue with long polling', isCorrect: false },
    ],
    explanation: 'FIFO (First-In-First-Out) queues provide exactly-once processing and maintain message order. Standard queues offer at-least-once delivery which can result in duplicates.',
    difficulty: 'intermediate',
    tags: ['sqs', 'messaging', 'fifo', 'resilience'],
  },
  {
    id: 'aws-saa-013',
    certificationId: 'aws-saa',
    domain: 'design-performant',
    domainWeight: 24,
    question: 'Which EBS volume type provides the highest IOPS performance for transactional workloads?',
    options: [
      { id: 'a', text: 'gp3 (General Purpose SSD)', isCorrect: false },
      { id: 'b', text: 'io2 Block Express', isCorrect: true },
      { id: 'c', text: 'st1 (Throughput Optimized HDD)', isCorrect: false },
      { id: 'd', text: 'sc1 (Cold HDD)', isCorrect: false },
    ],
    explanation: 'io2 Block Express provides up to 256,000 IOPS and is designed for the most demanding I/O-intensive workloads. gp3 maxes out at 16,000 IOPS.',
    difficulty: 'intermediate',
    tags: ['ebs', 'storage', 'performance', 'iops'],
  },
  {
    id: 'aws-saa-014',
    certificationId: 'aws-saa',
    domain: 'design-cost',
    domainWeight: 20,
    question: 'Which pricing model allows you to bid on unused EC2 capacity at up to 90% discount?',
    options: [
      { id: 'a', text: 'Reserved Instances', isCorrect: false },
      { id: 'b', text: 'Savings Plans', isCorrect: false },
      { id: 'c', text: 'Spot Instances', isCorrect: true },
      { id: 'd', text: 'Dedicated Hosts', isCorrect: false },
    ],
    explanation: 'Spot Instances let you use spare EC2 capacity at up to 90% discount. However, instances can be interrupted with 2-minute notice when AWS needs the capacity back.',
    difficulty: 'beginner',
    tags: ['ec2', 'spot', 'cost', 'pricing'],
  },
  {
    id: 'aws-saa-015',
    certificationId: 'aws-saa',
    domain: 'design-secure',
    domainWeight: 30,
    question: 'Which service should be used to centrally manage SSL/TLS certificates for AWS services?',
    options: [
      { id: 'a', text: 'AWS Secrets Manager', isCorrect: false },
      { id: 'b', text: 'AWS Certificate Manager (ACM)', isCorrect: true },
      { id: 'c', text: 'AWS KMS', isCorrect: false },
      { id: 'd', text: 'AWS IAM', isCorrect: false },
    ],
    explanation: 'AWS Certificate Manager (ACM) handles provisioning, managing, and deploying SSL/TLS certificates. It integrates with ELB, CloudFront, and API Gateway.',
    difficulty: 'beginner',
    tags: ['acm', 'ssl', 'tls', 'certificates', 'security'],
  },

  // Additional CKA Questions
  {
    id: 'cka-007',
    certificationId: 'cka',
    domain: 'workloads',
    domainWeight: 15,
    question: 'Which resource ensures a specified number of pod replicas are running at any time?',
    options: [
      { id: 'a', text: 'Pod', isCorrect: false },
      { id: 'b', text: 'ReplicaSet', isCorrect: true },
      { id: 'c', text: 'Service', isCorrect: false },
      { id: 'd', text: 'ConfigMap', isCorrect: false },
    ],
    explanation: 'ReplicaSet maintains a stable set of replica pods running at any given time. Deployments manage ReplicaSets and provide declarative updates.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'replicaset', 'workloads', 'pods'],
  },
  {
    id: 'cka-008',
    certificationId: 'cka',
    domain: 'services',
    domainWeight: 20,
    question: 'What is the default Service type in Kubernetes?',
    options: [
      { id: 'a', text: 'NodePort', isCorrect: false },
      { id: 'b', text: 'LoadBalancer', isCorrect: false },
      { id: 'c', text: 'ClusterIP', isCorrect: true },
      { id: 'd', text: 'ExternalName', isCorrect: false },
    ],
    explanation: 'ClusterIP is the default Service type. It exposes the service on a cluster-internal IP, making it only reachable from within the cluster.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'services', 'clusterip', 'networking'],
  },
  {
    id: 'cka-009',
    certificationId: 'cka',
    domain: 'troubleshoot',
    domainWeight: 30,
    question: 'Which command shows the logs of a crashed container in a pod?',
    options: [
      { id: 'a', text: 'kubectl logs <pod> --previous', isCorrect: true },
      { id: 'b', text: 'kubectl describe pod <pod>', isCorrect: false },
      { id: 'c', text: 'kubectl get events', isCorrect: false },
      { id: 'd', text: 'kubectl exec <pod> -- cat /var/log/messages', isCorrect: false },
    ],
    explanation: 'The --previous flag retrieves logs from the previous instance of a container, useful for debugging crashes. Without it, you only see current container logs.',
    difficulty: 'intermediate',
    tags: ['kubernetes', 'logs', 'troubleshooting', 'debugging'],
  },
  {
    id: 'cka-010',
    certificationId: 'cka',
    domain: 'cluster-arch',
    domainWeight: 25,
    question: 'Which component runs on every node and maintains network rules?',
    options: [
      { id: 'a', text: 'kubelet', isCorrect: false },
      { id: 'b', text: 'kube-proxy', isCorrect: true },
      { id: 'c', text: 'kube-scheduler', isCorrect: false },
      { id: 'd', text: 'coredns', isCorrect: false },
    ],
    explanation: 'kube-proxy runs on each node and maintains network rules that allow network communication to pods. It implements part of the Kubernetes Service concept.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'kube-proxy', 'networking', 'architecture'],
  },

  // Additional Terraform Questions
  {
    id: 'tf-006',
    certificationId: 'terraform-associate',
    domain: 'terraform-basics',
    domainWeight: 20,
    question: 'Which command shows what Terraform will do without making changes?',
    options: [
      { id: 'a', text: 'terraform show', isCorrect: false },
      { id: 'b', text: 'terraform plan', isCorrect: true },
      { id: 'c', text: 'terraform validate', isCorrect: false },
      { id: 'd', text: 'terraform refresh', isCorrect: false },
    ],
    explanation: 'terraform plan creates an execution plan showing what actions Terraform will take without actually making changes. It\'s a dry-run preview.',
    difficulty: 'beginner',
    tags: ['terraform', 'plan', 'cli', 'basics'],
  },
  {
    id: 'tf-007',
    certificationId: 'terraform-associate',
    domain: 'terraform-state',
    domainWeight: 15,
    question: 'What happens if you lose your Terraform state file?',
    options: [
      { id: 'a', text: 'Nothing, Terraform recreates it automatically', isCorrect: false },
      { id: 'b', text: 'Terraform loses track of managed resources', isCorrect: true },
      { id: 'c', text: 'All resources are automatically destroyed', isCorrect: false },
      { id: 'd', text: 'Terraform imports resources from the cloud', isCorrect: false },
    ],
    explanation: 'Without state, Terraform cannot map configuration to real resources. It would try to create new resources instead of managing existing ones. State backup is critical.',
    difficulty: 'intermediate',
    tags: ['terraform', 'state', 'disaster-recovery', 'best-practices'],
  },
  {
    id: 'tf-008',
    certificationId: 'terraform-associate',
    domain: 'modules',
    domainWeight: 15,
    question: 'What is the purpose of the "source" argument in a module block?',
    options: [
      { id: 'a', text: 'Defines input variables', isCorrect: false },
      { id: 'b', text: 'Specifies where to find the module code', isCorrect: true },
      { id: 'c', text: 'Sets the module version', isCorrect: false },
      { id: 'd', text: 'Configures the provider', isCorrect: false },
    ],
    explanation: 'The source argument tells Terraform where to find the module\'s configuration files. It can be a local path, Git URL, Terraform Registry, or other sources.',
    difficulty: 'beginner',
    tags: ['terraform', 'modules', 'source', 'configuration'],
  },
  {
    id: 'tf-009',
    certificationId: 'terraform-associate',
    domain: 'cloud',
    domainWeight: 10,
    question: 'What is the primary benefit of using Terraform Cloud for team collaboration?',
    options: [
      { id: 'a', text: 'Faster execution speed', isCorrect: false },
      { id: 'b', text: 'Remote state management and locking', isCorrect: true },
      { id: 'c', text: 'Free unlimited resources', isCorrect: false },
      { id: 'd', text: 'Automatic code generation', isCorrect: false },
    ],
    explanation: 'Terraform Cloud provides remote state storage with locking, preventing concurrent modifications. It also offers run history, policy enforcement, and team access controls.',
    difficulty: 'intermediate',
    tags: ['terraform', 'cloud', 'collaboration', 'state'],
  },
  {
    id: 'tf-010',
    certificationId: 'terraform-associate',
    domain: 'iac-concepts',
    domainWeight: 15,
    question: 'What does "idempotent" mean in the context of Infrastructure as Code?',
    options: [
      { id: 'a', text: 'Code runs faster each time', isCorrect: false },
      { id: 'b', text: 'Applying the same config multiple times produces the same result', isCorrect: true },
      { id: 'c', text: 'Resources are created in parallel', isCorrect: false },
      { id: 'd', text: 'Changes are automatically rolled back on failure', isCorrect: false },
    ],
    explanation: 'Idempotency means running the same operation multiple times produces the same result. Terraform achieves this by comparing desired state with actual state.',
    difficulty: 'intermediate',
    tags: ['terraform', 'iac', 'idempotent', 'concepts'],
  },
];

// Helper functions
export function getQuestionsForCertification(certificationId: string): CertificationQuestion[] {
  return certificationQuestions.filter(q => q.certificationId === certificationId);
}

export function getQuestionsByDomain(certificationId: string, domain: string): CertificationQuestion[] {
  return certificationQuestions.filter(q => q.certificationId === certificationId && q.domain === domain);
}

export function getExamConfig(certificationId: string): CertificationExamConfig | undefined {
  return examConfigs[certificationId];
}

export function getDomainProgress(certificationId: string, answeredQuestions: Map<string, boolean>): Record<string, { total: number; correct: number; percentage: number }> {
  const questions = getQuestionsForCertification(certificationId);
  const config = getExamConfig(certificationId);
  if (!config) return {};

  const progress: Record<string, { total: number; correct: number; percentage: number }> = {};
  
  config.domains.forEach(domain => {
    const domainQuestions = questions.filter(q => q.domain === domain.id);
    const answered = domainQuestions.filter(q => answeredQuestions.has(q.id));
    const correct = answered.filter(q => answeredQuestions.get(q.id) === true);
    
    progress[domain.id] = {
      total: domainQuestions.length,
      correct: correct.length,
      percentage: answered.length > 0 ? Math.round((correct.length / answered.length) * 100) : 0,
    };
  });

  return progress;
}

import { generateProgressiveSequence } from './progressive-quiz';

// Generate a practice session with weighted domain distribution and progressive difficulty
export function generatePracticeSession(certificationId: string, questionCount: number = 10): CertificationQuestion[] {
  const questions = getQuestionsForCertification(certificationId);
  const config = getExamConfig(certificationId);
  
  if (!config || questions.length === 0) {
    return generateProgressiveSequence(questions, questionCount);
  }

  const session: CertificationQuestion[] = [];
  
  // Distribute questions by domain weight
  config.domains.forEach(domain => {
    const domainQuestions = questions.filter(q => q.domain === domain.id);
    const count = Math.max(1, Math.round((domain.weight / 100) * questionCount));
    // Use progressive selection within each domain
    const selected = generateProgressiveSequence(domainQuestions, count);
    session.push(...selected);
  });

  // Apply progressive selection to final set (maintains domain distribution but orders progressively)
  return generateProgressiveSequence(session, questionCount);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
