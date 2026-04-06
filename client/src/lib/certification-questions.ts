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

  // AWS Solutions Architect Professional (aws-sap)
  {
    id: 'aws-sap-001',
    certificationId: 'aws-sap',
    domain: 'org-complex',
    domainWeight: 26,
    question: 'An enterprise needs to enforce a policy that prevents all member accounts in an AWS Organization from disabling CloudTrail. Which service should be used?',
    options: [
      { id: 'a', text: 'IAM Permission Boundaries', isCorrect: false },
      { id: 'b', text: 'Service Control Policies (SCPs)', isCorrect: true },
      { id: 'c', text: 'AWS Config Rules', isCorrect: false },
      { id: 'd', text: 'Resource-based policies', isCorrect: false },
    ],
    explanation: 'Service Control Policies (SCPs) in AWS Organizations define the maximum permissions for all accounts in an OU or organization. They can deny actions like disabling CloudTrail across all member accounts, even for root users.',
    difficulty: 'intermediate',
    tags: ['organizations', 'scp', 'governance', 'cloudtrail'],
  },
  {
    id: 'aws-sap-002',
    certificationId: 'aws-sap',
    domain: 'new-solutions',
    domainWeight: 29,
    question: 'A company wants to implement a blue/green deployment strategy for their ECS service with zero downtime. What is the recommended approach?',
    options: [
      { id: 'a', text: 'Manually swap DNS records', isCorrect: false },
      { id: 'b', text: 'Use CodeDeploy with ECS and an Application Load Balancer', isCorrect: true },
      { id: 'c', text: 'Deploy new containers to existing tasks', isCorrect: false },
      { id: 'd', text: 'Use Auto Scaling to replace instances', isCorrect: false },
    ],
    explanation: 'AWS CodeDeploy integrates with ECS to perform blue/green deployments by creating a new task set (green), shifting traffic gradually via the ALB, and decommissioning the old task set (blue) after validation.',
    difficulty: 'advanced',
    tags: ['ecs', 'codedeploy', 'blue-green', 'deployment'],
  },
  {
    id: 'aws-sap-003',
    certificationId: 'aws-sap',
    domain: 'migration',
    domainWeight: 15,
    question: 'Which AWS service is specifically designed to accelerate the migration of large amounts of data (petabyte-scale) to AWS when network transfer is too slow?',
    options: [
      { id: 'a', text: 'AWS DataSync', isCorrect: false },
      { id: 'b', text: 'AWS Snowball Edge', isCorrect: true },
      { id: 'c', text: 'AWS Storage Gateway', isCorrect: false },
      { id: 'd', text: 'AWS Direct Connect', isCorrect: false },
    ],
    explanation: 'AWS Snowball Edge is a physical device that physically ships data to AWS, bypassing network limitations. It is ideal for petabyte-scale migrations where network transfer would take too long or cost too much.',
    difficulty: 'intermediate',
    tags: ['migration', 'snowball', 'data-transfer', 'hybrid'],
  },
  {
    id: 'aws-sap-004',
    certificationId: 'aws-sap',
    domain: 'cost-control',
    domainWeight: 10,
    question: 'A company has several development accounts with EC2 instances running 24/7. Which strategy provides the most cost savings for non-production workloads?',
    options: [
      { id: 'a', text: 'Use Spot Instances for all workloads', isCorrect: false },
      { id: 'b', text: 'Schedule instances to stop outside business hours using EventBridge', isCorrect: true },
      { id: 'c', text: 'Purchase Reserved Instances for dev environments', isCorrect: false },
      { id: 'd', text: 'Use Savings Plans for all accounts', isCorrect: false },
    ],
    explanation: 'Scheduling dev instances to stop outside business hours (evenings, weekends) can reduce EC2 costs by 60-70% without impacting productivity. EventBridge (formerly CloudWatch Events) triggers Lambda functions to start/stop instances on a schedule.',
    difficulty: 'intermediate',
    tags: ['cost-optimization', 'ec2', 'scheduling', 'development'],
  },
  {
    id: 'aws-sap-005',
    certificationId: 'aws-sap',
    domain: 'continuous-improvement',
    domainWeight: 20,
    question: 'Which AWS service provides a comprehensive view of operational health and automates remediation actions across AWS accounts?',
    options: [
      { id: 'a', text: 'Amazon CloudWatch', isCorrect: false },
      { id: 'b', text: 'AWS Systems Manager', isCorrect: true },
      { id: 'c', text: 'AWS Config', isCorrect: false },
      { id: 'd', text: 'AWS Trusted Advisor', isCorrect: false },
    ],
    explanation: 'AWS Systems Manager provides an operational hub for your AWS infrastructure. It enables automation, patch management, configuration compliance, and runbook execution across accounts and regions from a single console.',
    difficulty: 'intermediate',
    tags: ['systems-manager', 'operations', 'automation', 'patch-management'],
  },

  // AWS Developer Associate (aws-dva)
  {
    id: 'aws-dva-001',
    certificationId: 'aws-dva',
    domain: 'development',
    domainWeight: 32,
    question: 'A Lambda function needs to access an RDS database without storing credentials in environment variables. What is the best practice?',
    options: [
      { id: 'a', text: 'Hard-code credentials in the function code', isCorrect: false },
      { id: 'b', text: 'Use AWS Secrets Manager with automatic rotation', isCorrect: true },
      { id: 'c', text: 'Store credentials in S3 and fetch at runtime', isCorrect: false },
      { id: 'd', text: 'Pass credentials via API Gateway headers', isCorrect: false },
    ],
    explanation: 'AWS Secrets Manager securely stores, rotates, and retrieves credentials. Lambda can call the Secrets Manager API at runtime using its IAM role, avoiding hardcoded credentials. RDS Proxy also integrates with Secrets Manager for managed credential rotation.',
    difficulty: 'intermediate',
    tags: ['lambda', 'secrets-manager', 'rds', 'security', 'best-practices'],
  },
  {
    id: 'aws-dva-002',
    certificationId: 'aws-dva',
    domain: 'development',
    domainWeight: 32,
    question: 'Which DynamoDB feature allows you to read a consistent view of data immediately after a write?',
    options: [
      { id: 'a', text: 'Eventually consistent reads', isCorrect: false },
      { id: 'b', text: 'Strongly consistent reads', isCorrect: true },
      { id: 'c', text: 'Transactional reads', isCorrect: false },
      { id: 'd', text: 'Global secondary index reads', isCorrect: false },
    ],
    explanation: 'Strongly consistent reads return a result that reflects all writes that received a successful response prior to the read. They consume twice the read capacity units (RCUs) compared to eventually consistent reads.',
    difficulty: 'beginner',
    tags: ['dynamodb', 'consistency', 'reads', 'database'],
  },
  {
    id: 'aws-dva-003',
    certificationId: 'aws-dva',
    domain: 'security',
    domainWeight: 26,
    question: 'A web application needs to allow users to upload files directly to S3 without routing through the backend. Which approach should be used?',
    options: [
      { id: 'a', text: 'Give users direct AWS credentials', isCorrect: false },
      { id: 'b', text: 'Use pre-signed S3 URLs generated by the backend', isCorrect: true },
      { id: 'c', text: 'Make the S3 bucket public', isCorrect: false },
      { id: 'd', text: 'Use Cognito Identity Pool with admin access', isCorrect: false },
    ],
    explanation: 'Pre-signed URLs grant time-limited permission to upload or download a specific S3 object. The backend generates the URL using its IAM credentials, and the client uses the URL to upload directly to S3 without exposing AWS credentials.',
    difficulty: 'intermediate',
    tags: ['s3', 'presigned-url', 'security', 'upload'],
  },
  {
    id: 'aws-dva-004',
    certificationId: 'aws-dva',
    domain: 'deployment',
    domainWeight: 24,
    question: 'Which CodeDeploy deployment configuration routes traffic to a small percentage of instances first before deploying everywhere?',
    options: [
      { id: 'a', text: 'AllAtOnce', isCorrect: false },
      { id: 'b', text: 'HalfAtATime', isCorrect: false },
      { id: 'c', text: 'Canary', isCorrect: true },
      { id: 'd', text: 'Linear', isCorrect: false },
    ],
    explanation: 'Canary deployments shift a small percentage of traffic to the new version first, monitor for errors, then shift all remaining traffic. This minimizes blast radius if the new version has issues.',
    difficulty: 'intermediate',
    tags: ['codedeploy', 'deployment', 'canary', 'ci-cd'],
  },
  {
    id: 'aws-dva-005',
    certificationId: 'aws-dva',
    domain: 'troubleshooting',
    domainWeight: 18,
    question: 'A Lambda function is timing out. Which X-Ray feature helps identify the slowest component in the request chain?',
    options: [
      { id: 'a', text: 'CloudWatch Logs Insights', isCorrect: false },
      { id: 'b', text: 'X-Ray Service Map', isCorrect: true },
      { id: 'c', text: 'CloudWatch Metrics', isCorrect: false },
      { id: 'd', text: 'AWS Config', isCorrect: false },
    ],
    explanation: 'X-Ray Service Map provides an end-to-end view of requests as they travel through your application, visually identifying bottlenecks, errors, and latency in each service (Lambda, DynamoDB, API Gateway, etc.).',
    difficulty: 'intermediate',
    tags: ['x-ray', 'lambda', 'debugging', 'performance', 'tracing'],
  },

  // AWS SysOps Administrator (aws-sysops)
  {
    id: 'aws-sysops-001',
    certificationId: 'aws-sysops',
    domain: 'monitoring',
    domainWeight: 20,
    question: 'Which CloudWatch feature automatically detects anomalous behavior in metrics using machine learning?',
    options: [
      { id: 'a', text: 'CloudWatch Alarms', isCorrect: false },
      { id: 'b', text: 'CloudWatch Anomaly Detection', isCorrect: true },
      { id: 'c', text: 'CloudWatch Dashboards', isCorrect: false },
      { id: 'd', text: 'CloudWatch Composite Alarms', isCorrect: false },
    ],
    explanation: 'CloudWatch Anomaly Detection applies machine learning algorithms to historical metric data to detect unexpected behavior. It creates a band of expected values and triggers alarms when metrics fall outside this band.',
    difficulty: 'intermediate',
    tags: ['cloudwatch', 'anomaly-detection', 'monitoring', 'ml'],
  },
  {
    id: 'aws-sysops-002',
    certificationId: 'aws-sysops',
    domain: 'reliability',
    domainWeight: 16,
    question: 'Which AWS service creates application-consistent snapshots of EBS volumes for EC2 instances with no performance impact?',
    options: [
      { id: 'a', text: 'AWS Backup', isCorrect: false },
      { id: 'b', text: 'Amazon Data Lifecycle Manager', isCorrect: false },
      { id: 'c', text: 'AWS Systems Manager (VSS-enabled snapshots)', isCorrect: true },
      { id: 'd', text: 'Amazon EBS direct APIs', isCorrect: false },
    ],
    explanation: 'AWS Systems Manager with VSS (Volume Shadow Copy Service) creates application-consistent snapshots of Windows EC2 instances. For Linux, Systems Manager automation documents coordinate with the OS to flush buffers before snapshotting.',
    difficulty: 'advanced',
    tags: ['ebs', 'snapshot', 'backup', 'systems-manager'],
  },
  {
    id: 'aws-sysops-003',
    certificationId: 'aws-sysops',
    domain: 'deployment',
    domainWeight: 18,
    question: 'Which CloudFormation feature allows you to preview the changes that will be made to your stack before executing an update?',
    options: [
      { id: 'a', text: 'Stack Policies', isCorrect: false },
      { id: 'b', text: 'Change Sets', isCorrect: true },
      { id: 'c', text: 'Drift Detection', isCorrect: false },
      { id: 'd', text: 'Stack Outputs', isCorrect: false },
    ],
    explanation: 'CloudFormation Change Sets show a summary of the proposed changes to your stack without executing them. You can review which resources will be added, modified, or deleted before applying the update.',
    difficulty: 'beginner',
    tags: ['cloudformation', 'change-sets', 'deployment', 'preview'],
  },
  {
    id: 'aws-sysops-004',
    certificationId: 'aws-sysops',
    domain: 'networking',
    domainWeight: 18,
    question: 'A company needs to filter and inspect traffic entering their VPC from the internet. Which service provides stateful inspection at the VPC level?',
    options: [
      { id: 'a', text: 'Security Groups', isCorrect: false },
      { id: 'b', text: 'AWS Network Firewall', isCorrect: true },
      { id: 'c', text: 'Network ACLs', isCorrect: false },
      { id: 'd', text: 'AWS WAF', isCorrect: false },
    ],
    explanation: 'AWS Network Firewall provides stateful, managed network firewall and intrusion detection/prevention for VPCs. It supports Suricata-compatible rules and can inspect traffic flowing in, out, and across VPCs.',
    difficulty: 'advanced',
    tags: ['network-firewall', 'security', 'vpc', 'stateful'],
  },
  {
    id: 'aws-sysops-005',
    certificationId: 'aws-sysops',
    domain: 'cost',
    domainWeight: 12,
    question: 'Which AWS tool provides recommendations for rightsizing EC2 instances based on actual utilization metrics?',
    options: [
      { id: 'a', text: 'AWS Cost Explorer', isCorrect: false },
      { id: 'b', text: 'AWS Compute Optimizer', isCorrect: true },
      { id: 'c', text: 'AWS Trusted Advisor', isCorrect: false },
      { id: 'd', text: 'AWS Budgets', isCorrect: false },
    ],
    explanation: 'AWS Compute Optimizer analyzes CloudWatch metrics and machine learning to recommend optimal EC2 instance types, EBS volumes, Lambda memory sizes, and Auto Scaling groups based on actual usage patterns.',
    difficulty: 'intermediate',
    tags: ['compute-optimizer', 'cost', 'rightsizing', 'ec2'],
  },

  // CKAD Questions
  {
    id: 'ckad-001',
    certificationId: 'ckad',
    domain: 'app-env',
    domainWeight: 25,
    question: 'How do you make a Kubernetes Secret available as environment variables in a pod?',
    options: [
      { id: 'a', text: 'Mount the secret as a volume', isCorrect: false },
      { id: 'b', text: 'Use envFrom with secretRef in the pod spec', isCorrect: true },
      { id: 'c', text: 'Use kubectl inject', isCorrect: false },
      { id: 'd', text: 'Base64 decode the secret in a ConfigMap', isCorrect: false },
    ],
    explanation: 'Using envFrom with secretRef injects all key-value pairs from a Secret as environment variables. You can also use env with valueFrom.secretKeyRef for individual keys.',
    difficulty: 'intermediate',
    tags: ['kubernetes', 'secrets', 'env-vars', 'ckad'],
  },
  {
    id: 'ckad-002',
    certificationId: 'ckad',
    domain: 'app-deployment',
    domainWeight: 20,
    question: 'A Deployment update is causing issues. How do you roll back to the previous version?',
    options: [
      { id: 'a', text: 'kubectl delete deployment', isCorrect: false },
      { id: 'b', text: 'kubectl rollout undo deployment/<name>', isCorrect: true },
      { id: 'c', text: 'kubectl apply -f previous-version.yaml', isCorrect: false },
      { id: 'd', text: 'kubectl rollout restart deployment/<name>', isCorrect: false },
    ],
    explanation: 'kubectl rollout undo rolls back a deployment to the previous revision. You can also specify a revision with --to-revision=<number>. Kubernetes retains rollout history by default.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'deployment', 'rollback', 'rollout'],
  },
  {
    id: 'ckad-003',
    certificationId: 'ckad',
    domain: 'app-observability',
    domainWeight: 15,
    question: 'Which probe type checks if a container is ready to accept traffic?',
    options: [
      { id: 'a', text: 'livenessProbe', isCorrect: false },
      { id: 'b', text: 'readinessProbe', isCorrect: true },
      { id: 'c', text: 'startupProbe', isCorrect: false },
      { id: 'd', text: 'healthProbe', isCorrect: false },
    ],
    explanation: 'readinessProbe determines if a container is ready to receive traffic. If it fails, the pod is removed from Service endpoints. livenessProbe restarts containers that are unhealthy. startupProbe handles slow-starting applications.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'probes', 'readiness', 'health'],
  },
  {
    id: 'ckad-004',
    certificationId: 'ckad',
    domain: 'services-networking',
    domainWeight: 20,
    question: 'What does a Kubernetes NetworkPolicy with an empty podSelector in spec do?',
    options: [
      { id: 'a', text: 'Selects no pods', isCorrect: false },
      { id: 'b', text: 'Selects all pods in the namespace', isCorrect: true },
      { id: 'c', text: 'Applies to all namespaces', isCorrect: false },
      { id: 'd', text: 'Creates an error', isCorrect: false },
    ],
    explanation: 'An empty podSelector ({}) selects all pods in the namespace, making the NetworkPolicy apply to every pod. This is commonly used to create default-deny or default-allow policies for an entire namespace.',
    difficulty: 'intermediate',
    tags: ['kubernetes', 'networkpolicy', 'networking', 'security'],
  },
  {
    id: 'ckad-005',
    certificationId: 'ckad',
    domain: 'app-design',
    domainWeight: 20,
    question: 'Which Kubernetes resource runs a pod to completion and retries on failure?',
    options: [
      { id: 'a', text: 'Deployment', isCorrect: false },
      { id: 'b', text: 'DaemonSet', isCorrect: false },
      { id: 'c', text: 'Job', isCorrect: true },
      { id: 'd', text: 'StatefulSet', isCorrect: false },
    ],
    explanation: 'A Job creates one or more pods and ensures a specified number of them successfully terminate. It retries failed pods up to backoffLimit times. CronJob schedules Jobs on a cron schedule.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'job', 'batch', 'workloads'],
  },

  // CKS Questions
  {
    id: 'cks-001',
    certificationId: 'cks',
    domain: 'cluster-hardening',
    domainWeight: 15,
    question: 'Which RBAC resource grants permissions at the cluster level, not just a namespace?',
    options: [
      { id: 'a', text: 'Role', isCorrect: false },
      { id: 'b', text: 'ClusterRole', isCorrect: true },
      { id: 'c', text: 'RoleBinding', isCorrect: false },
      { id: 'd', text: 'ServiceAccount', isCorrect: false },
    ],
    explanation: 'ClusterRole grants permissions cluster-wide, including non-namespaced resources like nodes and PersistentVolumes. Role is namespace-scoped. ClusterRoleBinding binds a ClusterRole to subjects across the whole cluster.',
    difficulty: 'beginner',
    tags: ['kubernetes', 'rbac', 'clusterrole', 'security'],
  },
  {
    id: 'cks-002',
    certificationId: 'cks',
    domain: 'supply-chain',
    domainWeight: 20,
    question: 'Which Kubernetes security mechanism restricts what syscalls a container can make to the host kernel?',
    options: [
      { id: 'a', text: 'Network Policy', isCorrect: false },
      { id: 'b', text: 'Seccomp profile', isCorrect: true },
      { id: 'c', text: 'Resource Quota', isCorrect: false },
      { id: 'd', text: 'Pod Disruption Budget', isCorrect: false },
    ],
    explanation: 'Seccomp (Secure Computing Mode) profiles restrict the system calls a container can make. The RuntimeDefault profile provides a safe default. Custom profiles can be applied via pod spec securityContext.seccompProfile.',
    difficulty: 'advanced',
    tags: ['kubernetes', 'seccomp', 'security', 'syscalls'],
  },
  {
    id: 'cks-003',
    certificationId: 'cks',
    domain: 'supply-chain-security',
    domainWeight: 20,
    question: 'Which tool is commonly used to scan container images for known vulnerabilities (CVEs)?',
    options: [
      { id: 'a', text: 'Falco', isCorrect: false },
      { id: 'b', text: 'Trivy', isCorrect: true },
      { id: 'c', text: 'OPA Gatekeeper', isCorrect: false },
      { id: 'd', text: 'kube-bench', isCorrect: false },
    ],
    explanation: 'Trivy is a comprehensive open-source vulnerability scanner for container images, file systems, and git repositories. It is widely used in CI/CD pipelines to catch CVEs before images are deployed.',
    difficulty: 'intermediate',
    tags: ['kubernetes', 'trivy', 'image-scanning', 'vulnerability', 'supply-chain'],
  },
  {
    id: 'cks-004',
    certificationId: 'cks',
    domain: 'monitoring',
    domainWeight: 20,
    question: 'Which open-source runtime security tool detects suspicious activity in containers using rules against system calls?',
    options: [
      { id: 'a', text: 'kube-bench', isCorrect: false },
      { id: 'b', text: 'Falco', isCorrect: true },
      { id: 'c', text: 'Trivy', isCorrect: false },
      { id: 'd', text: 'OPA', isCorrect: false },
    ],
    explanation: 'Falco is a CNCF runtime security project that monitors Linux system calls and generates alerts based on configurable rules. It can detect shell spawned in a container, privilege escalations, and other suspicious behavior.',
    difficulty: 'intermediate',
    tags: ['kubernetes', 'falco', 'runtime-security', 'monitoring'],
  },
  {
    id: 'cks-005',
    certificationId: 'cks',
    domain: 'cluster-setup',
    domainWeight: 10,
    question: 'What does kube-bench check in a Kubernetes cluster?',
    options: [
      { id: 'a', text: 'Container image vulnerabilities', isCorrect: false },
      { id: 'b', text: 'CIS Kubernetes Benchmark compliance', isCorrect: true },
      { id: 'c', text: 'Network policy effectiveness', isCorrect: false },
      { id: 'd', text: 'Pod resource usage', isCorrect: false },
    ],
    explanation: 'kube-bench checks whether a Kubernetes cluster is configured according to the CIS (Center for Internet Security) Kubernetes Benchmark, which provides security configuration recommendations for cluster components.',
    difficulty: 'intermediate',
    tags: ['kubernetes', 'kube-bench', 'cis', 'benchmark', 'security'],
  },

  // GCP ACE Questions
  {
    id: 'gcp-ace-001',
    certificationId: 'gcp-ace',
    domain: 'cloud-deploying',
    domainWeight: 22,
    question: 'Which GCP service is the managed Kubernetes service for running containerized workloads?',
    options: [
      { id: 'a', text: 'Google Cloud Run', isCorrect: false },
      { id: 'b', text: 'Google Kubernetes Engine (GKE)', isCorrect: true },
      { id: 'c', text: 'Google App Engine', isCorrect: false },
      { id: 'd', text: 'Google Cloud Functions', isCorrect: false },
    ],
    explanation: 'Google Kubernetes Engine (GKE) is the managed Kubernetes service on GCP. It handles the control plane and node management. Cloud Run runs containers without managing clusters. App Engine is a PaaS for applications.',
    difficulty: 'beginner',
    tags: ['gcp', 'gke', 'kubernetes', 'containers'],
  },
  {
    id: 'gcp-ace-002',
    certificationId: 'gcp-ace',
    domain: 'cloud-configuring',
    domainWeight: 22,
    question: 'At what level does a GCP IAM policy on a project take effect?',
    options: [
      { id: 'a', text: 'Only on the project itself', isCorrect: false },
      { id: 'b', text: 'On the project and all resources within it', isCorrect: true },
      { id: 'c', text: 'Only on resources explicitly specified', isCorrect: false },
      { id: 'd', text: 'On all projects in the organization', isCorrect: false },
    ],
    explanation: 'GCP IAM policies are inherited hierarchically. A policy set at the project level applies to all resources within that project. Policies set at the organization or folder level cascade down through the hierarchy.',
    difficulty: 'beginner',
    tags: ['gcp', 'iam', 'policy', 'hierarchy'],
  },
  {
    id: 'gcp-ace-003',
    certificationId: 'gcp-ace',
    domain: 'cloud-ensuring',
    domainWeight: 22,
    question: 'Which GCP service provides fully managed logging, monitoring, and observability for GCP and AWS resources?',
    options: [
      { id: 'a', text: 'Cloud Logging', isCorrect: false },
      { id: 'b', text: 'Google Cloud Observability (Cloud Operations suite)', isCorrect: true },
      { id: 'c', text: 'BigQuery', isCorrect: false },
      { id: 'd', text: 'Cloud Pub/Sub', isCorrect: false },
    ],
    explanation: 'Google Cloud Observability (formerly Stackdriver) includes Cloud Logging, Cloud Monitoring, Cloud Trace, Cloud Profiler, and Cloud Debugger. It provides unified observability for GCP and hybrid/multi-cloud environments.',
    difficulty: 'intermediate',
    tags: ['gcp', 'monitoring', 'logging', 'observability', 'stackdriver'],
  },
  {
    id: 'gcp-ace-004',
    certificationId: 'gcp-ace',
    domain: 'cloud-solution',
    domainWeight: 17,
    question: 'Which GCP storage service is best for storing unstructured data like images, videos, and backups?',
    options: [
      { id: 'a', text: 'Cloud SQL', isCorrect: false },
      { id: 'b', text: 'Cloud Storage', isCorrect: true },
      { id: 'c', text: 'Cloud Spanner', isCorrect: false },
      { id: 'd', text: 'Persistent Disk', isCorrect: false },
    ],
    explanation: 'Cloud Storage is GCP\'s object storage service for unstructured data. It offers multiple storage classes (Standard, Nearline, Coldline, Archive) with global availability, strong consistency, and unlimited capacity.',
    difficulty: 'beginner',
    tags: ['gcp', 'cloud-storage', 'object-storage', 'storage'],
  },
  {
    id: 'gcp-ace-005',
    certificationId: 'gcp-ace',
    domain: 'cloud-planning',
    domainWeight: 17,
    question: 'A company wants to run a stateless web application on GCP without managing servers. Which service is most appropriate?',
    options: [
      { id: 'a', text: 'Compute Engine', isCorrect: false },
      { id: 'b', text: 'Cloud Run', isCorrect: true },
      { id: 'c', text: 'GKE with managed node pools', isCorrect: false },
      { id: 'd', text: 'App Engine Flexible', isCorrect: false },
    ],
    explanation: 'Cloud Run is a fully managed serverless platform that automatically scales containerized stateless applications. It charges only for the resources used during request processing, making it ideal for variable-traffic web apps.',
    difficulty: 'intermediate',
    tags: ['gcp', 'cloud-run', 'serverless', 'containers'],
  },

  // GCP PCA Questions
  {
    id: 'gcp-pca-001',
    certificationId: 'gcp-pca',
    domain: 'designing',
    domainWeight: 24,
    question: 'Which GCP service provides a globally distributed, strongly consistent relational database?',
    options: [
      { id: 'a', text: 'Cloud SQL', isCorrect: false },
      { id: 'b', text: 'Cloud Spanner', isCorrect: true },
      { id: 'c', text: 'Bigtable', isCorrect: false },
      { id: 'd', text: 'Firestore', isCorrect: false },
    ],
    explanation: 'Cloud Spanner is a fully managed, globally distributed relational database with strong consistency and 99.999% SLA. It scales horizontally while maintaining ACID transactions, combining the benefits of relational and NoSQL databases.',
    difficulty: 'intermediate',
    tags: ['gcp', 'spanner', 'database', 'distributed', 'relational'],
  },
  {
    id: 'gcp-pca-002',
    certificationId: 'gcp-pca',
    domain: 'security',
    domainWeight: 18,
    question: 'Which GCP feature allows you to define a perimeter around GCP services to restrict data access based on context?',
    options: [
      { id: 'a', text: 'VPC Service Controls', isCorrect: true },
      { id: 'b', text: 'Cloud Armor', isCorrect: false },
      { id: 'c', text: 'Identity-Aware Proxy', isCorrect: false },
      { id: 'd', text: 'Cloud Firewall', isCorrect: false },
    ],
    explanation: 'VPC Service Controls create security perimeters around GCP APIs and services to prevent data exfiltration. They enforce context-aware access policies based on identity, device, and network attributes.',
    difficulty: 'advanced',
    tags: ['gcp', 'vpc-service-controls', 'security', 'data-exfiltration'],
  },
  {
    id: 'gcp-pca-003',
    certificationId: 'gcp-pca',
    domain: 'reliability',
    domainWeight: 14,
    question: 'What GCP tool helps define and track Service Level Objectives (SLOs) for reliability engineering?',
    options: [
      { id: 'a', text: 'Cloud Trace', isCorrect: false },
      { id: 'b', text: 'Cloud Monitoring with SLO monitoring', isCorrect: true },
      { id: 'c', text: 'Cloud Profiler', isCorrect: false },
      { id: 'd', text: 'Cloud Debugger', isCorrect: false },
    ],
    explanation: 'Cloud Monitoring provides SLO monitoring that allows teams to define SLOs based on availability or latency, track error budgets, and get alerts when error budgets are at risk — essential for SRE practices.',
    difficulty: 'intermediate',
    tags: ['gcp', 'slo', 'monitoring', 'sre', 'reliability'],
  },
  {
    id: 'gcp-pca-004',
    certificationId: 'gcp-pca',
    domain: 'managing-infra',
    domainWeight: 15,
    question: 'Which tool is the GCP-native Infrastructure as Code solution for managing GCP resources declaratively?',
    options: [
      { id: 'a', text: 'Cloud Build', isCorrect: false },
      { id: 'b', text: 'Deployment Manager', isCorrect: true },
      { id: 'c', text: 'Cloud Scheduler', isCorrect: false },
      { id: 'd', text: 'Config Connector', isCorrect: false },
    ],
    explanation: 'Deployment Manager is GCP\'s native Infrastructure as Code service. You define resources in YAML or Python templates and Deployment Manager handles provisioning and updating them. Config Connector manages GCP resources via Kubernetes.',
    difficulty: 'intermediate',
    tags: ['gcp', 'deployment-manager', 'iac', 'infrastructure'],
  },
  {
    id: 'gcp-pca-005',
    certificationId: 'gcp-pca',
    domain: 'analyzing',
    domainWeight: 18,
    question: 'A company needs a fully managed real-time stream processing pipeline on GCP. Which service should they use?',
    options: [
      { id: 'a', text: 'BigQuery', isCorrect: false },
      { id: 'b', text: 'Dataflow', isCorrect: true },
      { id: 'c', text: 'Pub/Sub', isCorrect: false },
      { id: 'd', text: 'Dataproc', isCorrect: false },
    ],
    explanation: 'Dataflow is GCP\'s fully managed stream and batch processing service based on Apache Beam. It auto-scales and handles windowing, late data, and exactly-once processing. Pub/Sub is for messaging, Dataproc for Spark/Hadoop clusters.',
    difficulty: 'intermediate',
    tags: ['gcp', 'dataflow', 'streaming', 'real-time', 'apache-beam'],
  },

  // Azure Fundamentals (az-900)
  {
    id: 'az900-001',
    certificationId: 'az-900',
    domain: 'cloud-concepts',
    domainWeight: 25,
    question: 'Which cloud service model gives you the most control over the operating system and middleware?',
    options: [
      { id: 'a', text: 'SaaS', isCorrect: false },
      { id: 'b', text: 'PaaS', isCorrect: false },
      { id: 'c', text: 'IaaS', isCorrect: true },
      { id: 'd', text: 'FaaS', isCorrect: false },
    ],
    explanation: 'IaaS (Infrastructure as a Service) provides virtualized computing resources, giving you control over the OS, middleware, and runtime. PaaS manages the platform, SaaS delivers complete applications. IaaS offers the most control but requires more management.',
    difficulty: 'beginner',
    tags: ['azure', 'cloud-models', 'iaas', 'fundamentals'],
  },
  {
    id: 'az900-002',
    certificationId: 'az-900',
    domain: 'azure-architecture',
    domainWeight: 35,
    question: 'What is an Azure Region?',
    options: [
      { id: 'a', text: 'A single data center', isCorrect: false },
      { id: 'b', text: 'A geographic area containing one or more data centers', isCorrect: true },
      { id: 'c', text: 'A logical grouping of Azure subscriptions', isCorrect: false },
      { id: 'd', text: 'A collection of Azure services', isCorrect: false },
    ],
    explanation: 'An Azure Region is a geographic area containing at least one data center (usually multiple). Regions are paired for disaster recovery and provide low-latency access for nearby users. Examples include East US, West Europe, and Southeast Asia.',
    difficulty: 'beginner',
    tags: ['azure', 'regions', 'geography', 'architecture'],
  },
  {
    id: 'az900-003',
    certificationId: 'az-900',
    domain: 'azure-management',
    domainWeight: 30,
    question: 'Which Azure service provides a unified view of estimated and actual cloud spending with budget alerts?',
    options: [
      { id: 'a', text: 'Azure Advisor', isCorrect: false },
      { id: 'b', text: 'Azure Cost Management and Billing', isCorrect: true },
      { id: 'c', text: 'Azure Monitor', isCorrect: false },
      { id: 'd', text: 'Azure Policy', isCorrect: false },
    ],
    explanation: 'Azure Cost Management and Billing provides detailed cost analysis, budgets, cost alerts, and recommendations for optimizing spending. It shows actual and forecasted costs by resource, subscription, and time period.',
    difficulty: 'beginner',
    tags: ['azure', 'cost-management', 'billing', 'governance'],
  },
  {
    id: 'az900-004',
    certificationId: 'az-900',
    domain: 'azure-architecture',
    domainWeight: 35,
    question: 'Which Azure service provides managed relational database for SQL Server workloads?',
    options: [
      { id: 'a', text: 'Azure Cosmos DB', isCorrect: false },
      { id: 'b', text: 'Azure SQL Database', isCorrect: true },
      { id: 'c', text: 'Azure Table Storage', isCorrect: false },
      { id: 'd', text: 'Azure Cache for Redis', isCorrect: false },
    ],
    explanation: 'Azure SQL Database is a fully managed PaaS relational database based on SQL Server. It handles patching, backups, and high availability. Cosmos DB is a multi-model NoSQL database; Table Storage is a NoSQL key-value store.',
    difficulty: 'beginner',
    tags: ['azure', 'sql-database', 'relational', 'paas'],
  },
  {
    id: 'az900-005',
    certificationId: 'az-900',
    domain: 'cloud-concepts',
    domainWeight: 25,
    question: 'Which cloud deployment model uses a combination of on-premises infrastructure and public cloud services?',
    options: [
      { id: 'a', text: 'Public Cloud', isCorrect: false },
      { id: 'b', text: 'Private Cloud', isCorrect: false },
      { id: 'c', text: 'Hybrid Cloud', isCorrect: true },
      { id: 'd', text: 'Community Cloud', isCorrect: false },
    ],
    explanation: 'Hybrid Cloud integrates on-premises (private) infrastructure with public cloud services. Organizations use hybrid cloud to keep sensitive workloads on-premises while leveraging cloud scalability and services for other workloads.',
    difficulty: 'beginner',
    tags: ['azure', 'hybrid-cloud', 'deployment-model', 'fundamentals'],
  },

  // Azure Administrator (az-104)
  {
    id: 'az104-001',
    certificationId: 'az-104',
    domain: 'identity',
    domainWeight: 20,
    question: 'Which Azure AD feature enforces additional verification steps based on user risk and sign-in conditions?',
    options: [
      { id: 'a', text: 'Azure AD B2B', isCorrect: false },
      { id: 'b', text: 'Conditional Access', isCorrect: true },
      { id: 'c', text: 'Azure AD Domain Services', isCorrect: false },
      { id: 'd', text: 'Azure AD Connect', isCorrect: false },
    ],
    explanation: 'Conditional Access policies evaluate signals (user, device, location, application) and enforce access controls like MFA, device compliance, or blocking. It implements a Zero Trust approach to identity and access.',
    difficulty: 'intermediate',
    tags: ['azure', 'conditional-access', 'azure-ad', 'identity', 'zero-trust'],
  },
  {
    id: 'az104-002',
    certificationId: 'az-104',
    domain: 'networking',
    domainWeight: 25,
    question: 'Which Azure networking component controls inbound and outbound traffic at the subnet or network interface level?',
    options: [
      { id: 'a', text: 'Azure Firewall', isCorrect: false },
      { id: 'b', text: 'Network Security Group (NSG)', isCorrect: true },
      { id: 'c', text: 'Azure DDoS Protection', isCorrect: false },
      { id: 'd', text: 'Azure Front Door', isCorrect: false },
    ],
    explanation: 'Network Security Groups filter traffic using inbound and outbound security rules based on source/destination IP, port, and protocol. NSGs can be applied to subnets or individual network interfaces of VMs.',
    difficulty: 'beginner',
    tags: ['azure', 'nsg', 'networking', 'security-groups'],
  },
  {
    id: 'az104-003',
    certificationId: 'az-104',
    domain: 'compute',
    domainWeight: 20,
    question: 'Which Azure service provides managed virtual machines that scale automatically based on demand?',
    options: [
      { id: 'a', text: 'Azure App Service', isCorrect: false },
      { id: 'b', text: 'Azure Virtual Machine Scale Sets', isCorrect: true },
      { id: 'c', text: 'Azure Container Instances', isCorrect: false },
      { id: 'd', text: 'Azure Kubernetes Service', isCorrect: false },
    ],
    explanation: 'Virtual Machine Scale Sets automatically increase or decrease the number of VM instances based on demand or a schedule. They support both Windows and Linux and integrate with Azure Load Balancer and Application Gateway.',
    difficulty: 'intermediate',
    tags: ['azure', 'vmss', 'scale-sets', 'auto-scaling'],
  },
  {
    id: 'az104-004',
    certificationId: 'az-104',
    domain: 'storage',
    domainWeight: 15,
    question: 'Which Azure Blob Storage access tier is optimized for data accessed frequently?',
    options: [
      { id: 'a', text: 'Cool', isCorrect: false },
      { id: 'b', text: 'Archive', isCorrect: false },
      { id: 'c', text: 'Hot', isCorrect: true },
      { id: 'd', text: 'Cold', isCorrect: false },
    ],
    explanation: 'The Hot tier is optimized for frequently accessed data. It has higher storage costs but lower access costs. Cool is for infrequently accessed data stored for at least 30 days. Archive is for rarely accessed data with high retrieval latency.',
    difficulty: 'beginner',
    tags: ['azure', 'blob-storage', 'access-tier', 'storage'],
  },
  {
    id: 'az104-005',
    certificationId: 'az-104',
    domain: 'monitoring',
    domainWeight: 10,
    question: 'Which Azure service collects, analyzes, and acts on telemetry from Azure and on-premises environments?',
    options: [
      { id: 'a', text: 'Azure Security Center', isCorrect: false },
      { id: 'b', text: 'Azure Monitor', isCorrect: true },
      { id: 'c', text: 'Azure Service Health', isCorrect: false },
      { id: 'd', text: 'Azure Resource Graph', isCorrect: false },
    ],
    explanation: 'Azure Monitor collects metrics and logs from Azure resources, on-premises servers, and other clouds. It powers features like Log Analytics, Application Insights, and alerts, providing a comprehensive monitoring solution.',
    difficulty: 'beginner',
    tags: ['azure', 'monitor', 'monitoring', 'logs', 'metrics'],
  },

  // Azure Solutions Architect Expert (az-305)
  {
    id: 'az305-001',
    certificationId: 'az-305',
    domain: 'infrastructure',
    domainWeight: 35,
    question: 'A company needs to connect two Azure VNets in different regions for low-latency private communication. What should be configured?',
    options: [
      { id: 'a', text: 'VNet-to-VNet VPN Gateway', isCorrect: false },
      { id: 'b', text: 'Global VNet Peering', isCorrect: true },
      { id: 'c', text: 'Azure ExpressRoute', isCorrect: false },
      { id: 'd', text: 'Azure Virtual WAN', isCorrect: false },
    ],
    explanation: 'Global VNet Peering connects VNets in different Azure regions using Microsoft\'s backbone network, providing low-latency, high-bandwidth private connectivity without gateways. Traffic never traverses the public internet.',
    difficulty: 'intermediate',
    tags: ['azure', 'vnet-peering', 'networking', 'global'],
  },
  {
    id: 'az305-002',
    certificationId: 'az-305',
    domain: 'data-storage',
    domainWeight: 25,
    question: 'Which Azure database service provides globally distributed, multi-model, NoSQL database with single-digit millisecond latency?',
    options: [
      { id: 'a', text: 'Azure SQL Database', isCorrect: false },
      { id: 'b', text: 'Azure Cosmos DB', isCorrect: true },
      { id: 'c', text: 'Azure Table Storage', isCorrect: false },
      { id: 'd', text: 'Azure Database for PostgreSQL', isCorrect: false },
    ],
    explanation: 'Azure Cosmos DB is a globally distributed, multi-model database service supporting document, key-value, graph, and column-family data models. It offers five consistency levels and SLA-backed single-digit millisecond read/write latencies.',
    difficulty: 'intermediate',
    tags: ['azure', 'cosmos-db', 'nosql', 'distributed', 'database'],
  },
  {
    id: 'az305-003',
    certificationId: 'az-305',
    domain: 'business-continuity',
    domainWeight: 15,
    question: 'Which Azure service provides automated backups and point-in-time restore for Azure VMs and SQL databases from a central location?',
    options: [
      { id: 'a', text: 'Azure Site Recovery', isCorrect: false },
      { id: 'b', text: 'Azure Backup', isCorrect: true },
      { id: 'c', text: 'Azure Storage Snapshots', isCorrect: false },
      { id: 'd', text: 'Azure Disk Encryption', isCorrect: false },
    ],
    explanation: 'Azure Backup provides centralized backup management with the Recovery Services vault. It supports VMs, SQL in Azure VMs, Azure Files, blobs, and on-premises workloads with long-term retention and point-in-time restore.',
    difficulty: 'beginner',
    tags: ['azure', 'backup', 'recovery', 'business-continuity'],
  },
  {
    id: 'az305-004',
    certificationId: 'az-305',
    domain: 'identity-governance',
    domainWeight: 25,
    question: 'Which Azure service enables time-limited, just-in-time privileged access to Azure resources?',
    options: [
      { id: 'a', text: 'Azure AD Conditional Access', isCorrect: false },
      { id: 'b', text: 'Azure AD Privileged Identity Management (PIM)', isCorrect: true },
      { id: 'c', text: 'Azure Key Vault', isCorrect: false },
      { id: 'd', text: 'Microsoft Defender for Cloud', isCorrect: false },
    ],
    explanation: 'Azure AD PIM provides just-in-time privileged access to Azure AD and Azure resources. Users activate elevated roles for a limited time with MFA and approval workflows, reducing risk from standing admin privileges.',
    difficulty: 'intermediate',
    tags: ['azure', 'pim', 'privileged-identity', 'jit', 'governance'],
  },
  {
    id: 'az305-005',
    certificationId: 'az-305',
    domain: 'infrastructure',
    domainWeight: 35,
    question: 'Which Azure service allows you to run Linux and Windows containers without managing any server infrastructure?',
    options: [
      { id: 'a', text: 'Azure Kubernetes Service', isCorrect: false },
      { id: 'b', text: 'Azure Container Instances (ACI)', isCorrect: true },
      { id: 'c', text: 'Azure App Service', isCorrect: false },
      { id: 'd', text: 'Azure Batch', isCorrect: false },
    ],
    explanation: 'Azure Container Instances is the fastest and simplest way to run a container in Azure without managing VMs or adopting Kubernetes. ACI is billed per second and suitable for isolated containers, simple apps, and batch jobs.',
    difficulty: 'beginner',
    tags: ['azure', 'aci', 'containers', 'serverless'],
  },

  // CompTIA Security+
  {
    id: 'secplus-001',
    certificationId: 'comptia-security-plus',
    domain: 'threats',
    domainWeight: 22,
    question: 'An attacker sends emails pretending to be from a bank to steal login credentials. What type of attack is this?',
    options: [
      { id: 'a', text: 'Vishing', isCorrect: false },
      { id: 'b', text: 'Phishing', isCorrect: true },
      { id: 'c', text: 'Smishing', isCorrect: false },
      { id: 'd', text: 'Whaling', isCorrect: false },
    ],
    explanation: 'Phishing uses fraudulent emails impersonating legitimate organizations to steal credentials or install malware. Vishing uses voice calls, smishing uses SMS, and whaling targets high-level executives specifically.',
    difficulty: 'beginner',
    tags: ['security', 'phishing', 'social-engineering', 'threats'],
  },
  {
    id: 'secplus-002',
    certificationId: 'comptia-security-plus',
    domain: 'architecture',
    domainWeight: 18,
    question: 'Which security framework assumes no user or device is trusted by default, even inside the corporate network?',
    options: [
      { id: 'a', text: 'Defense in Depth', isCorrect: false },
      { id: 'b', text: 'Zero Trust', isCorrect: true },
      { id: 'c', text: 'Least Privilege', isCorrect: false },
      { id: 'd', text: 'Need to Know', isCorrect: false },
    ],
    explanation: 'Zero Trust operates on the principle of "never trust, always verify." Every request must be authenticated, authorized, and continuously validated regardless of where it originates — inside or outside the network perimeter.',
    difficulty: 'intermediate',
    tags: ['security', 'zero-trust', 'architecture', 'framework'],
  },
  {
    id: 'secplus-003',
    certificationId: 'comptia-security-plus',
    domain: 'general-security',
    domainWeight: 12,
    question: 'Which cryptographic algorithm is an asymmetric encryption algorithm used for secure key exchange?',
    options: [
      { id: 'a', text: 'AES', isCorrect: false },
      { id: 'b', text: 'RSA', isCorrect: true },
      { id: 'c', text: 'MD5', isCorrect: false },
      { id: 'd', text: 'SHA-256', isCorrect: false },
    ],
    explanation: 'RSA is an asymmetric algorithm using public/private key pairs for encryption, decryption, and digital signatures. AES is symmetric encryption. MD5 and SHA-256 are hashing algorithms, not encryption.',
    difficulty: 'beginner',
    tags: ['cryptography', 'rsa', 'asymmetric', 'encryption'],
  },
  {
    id: 'secplus-004',
    certificationId: 'comptia-security-plus',
    domain: 'operations',
    domainWeight: 28,
    question: 'Which incident response phase involves removing malware and closing vulnerabilities after a breach?',
    options: [
      { id: 'a', text: 'Identification', isCorrect: false },
      { id: 'b', text: 'Containment', isCorrect: false },
      { id: 'c', text: 'Eradication', isCorrect: true },
      { id: 'd', text: 'Recovery', isCorrect: false },
    ],
    explanation: 'The NIST incident response lifecycle includes Preparation, Detection/Analysis, Containment, Eradication, Recovery, and Post-Incident Activity. Eradication removes the root cause (malware, compromised accounts) after containment.',
    difficulty: 'intermediate',
    tags: ['incident-response', 'security-operations', 'eradication', 'nist'],
  },
  {
    id: 'secplus-005',
    certificationId: 'comptia-security-plus',
    domain: 'program-management',
    domainWeight: 20,
    question: 'What is the purpose of a Business Impact Analysis (BIA)?',
    options: [
      { id: 'a', text: 'To assess employee performance', isCorrect: false },
      { id: 'b', text: 'To identify critical systems and quantify the impact of disruptions', isCorrect: true },
      { id: 'c', text: 'To evaluate software development practices', isCorrect: false },
      { id: 'd', text: 'To measure network performance', isCorrect: false },
    ],
    explanation: 'A BIA identifies critical business processes and the impact of disruptions in terms of revenue, reputation, and compliance. It establishes Recovery Time Objectives (RTO) and Recovery Point Objectives (RPO) for disaster recovery planning.',
    difficulty: 'intermediate',
    tags: ['security', 'bia', 'risk-management', 'business-continuity'],
  },

  // AWS Security Specialty
  {
    id: 'aws-sec-001',
    certificationId: 'aws-security',
    domain: 'threat-detection',
    domainWeight: 14,
    question: 'Which AWS service uses machine learning to continuously monitor AWS accounts for malicious activity and unauthorized behavior?',
    options: [
      { id: 'a', text: 'AWS Inspector', isCorrect: false },
      { id: 'b', text: 'Amazon GuardDuty', isCorrect: true },
      { id: 'c', text: 'AWS Config', isCorrect: false },
      { id: 'd', text: 'AWS Security Hub', isCorrect: false },
    ],
    explanation: 'Amazon GuardDuty is a threat detection service that analyzes CloudTrail, VPC Flow Logs, and DNS logs using ML to identify threats like compromised instances, credential theft, and crypto mining.',
    difficulty: 'beginner',
    tags: ['aws', 'guardduty', 'threat-detection', 'security'],
  },
  {
    id: 'aws-sec-002',
    certificationId: 'aws-security',
    domain: 'data-protection',
    domainWeight: 18,
    question: 'Which KMS key type gives you full control over key material and enables BYOK (Bring Your Own Key)?',
    options: [
      { id: 'a', text: 'AWS managed keys', isCorrect: false },
      { id: 'b', text: 'Customer managed keys with custom key material', isCorrect: true },
      { id: 'c', text: 'AWS owned keys', isCorrect: false },
      { id: 'd', text: 'Data keys', isCorrect: false },
    ],
    explanation: 'Customer managed keys with imported key material (BYOK) let you bring your own key material to KMS. You control key creation, rotation, deletion, and can revoke access by deleting the key material.',
    difficulty: 'advanced',
    tags: ['kms', 'encryption', 'byok', 'key-management'],
  },
  {
    id: 'aws-sec-003',
    certificationId: 'aws-security',
    domain: 'infra-security',
    domainWeight: 20,
    question: 'Which AWS WAF rule type blocks requests based on IP reputation lists maintained by AWS threat intelligence?',
    options: [
      { id: 'a', text: 'Rate-based rules', isCorrect: false },
      { id: 'b', text: 'AWS Managed Rules - Amazon IP reputation list', isCorrect: true },
      { id: 'c', text: 'Geographic match rules', isCorrect: false },
      { id: 'd', text: 'SQL injection match rules', isCorrect: false },
    ],
    explanation: 'AWS Managed Rules include the Amazon IP Reputation List which blocks IP addresses associated with bots and other threats identified by AWS threat intelligence. These are pre-built rules maintained by AWS.',
    difficulty: 'intermediate',
    tags: ['waf', 'security', 'managed-rules', 'ip-reputation'],
  },
  {
    id: 'aws-sec-004',
    certificationId: 'aws-security',
    domain: 'security-logging',
    domainWeight: 18,
    question: 'Which service provides a comprehensive view of compliance status across AWS services and aggregates findings from GuardDuty, Inspector, and Macie?',
    options: [
      { id: 'a', text: 'AWS CloudTrail', isCorrect: false },
      { id: 'b', text: 'AWS Security Hub', isCorrect: true },
      { id: 'c', text: 'Amazon Detective', isCorrect: false },
      { id: 'd', text: 'AWS Trusted Advisor', isCorrect: false },
    ],
    explanation: 'AWS Security Hub aggregates, organizes, and prioritizes security findings from AWS services (GuardDuty, Inspector, Macie, IAM Access Analyzer) and third-party tools. It also assesses compliance against security standards.',
    difficulty: 'intermediate',
    tags: ['security-hub', 'compliance', 'aggregation', 'findings'],
  },
  {
    id: 'aws-sec-005',
    certificationId: 'aws-security',
    domain: 'iam',
    domainWeight: 16,
    question: 'What is the purpose of IAM Access Analyzer?',
    options: [
      { id: 'a', text: 'Rotate IAM credentials automatically', isCorrect: false },
      { id: 'b', text: 'Identify resources shared with external principals outside your AWS organization', isCorrect: true },
      { id: 'c', text: 'Enforce MFA for all users', isCorrect: false },
      { id: 'd', text: 'Generate least-privilege policies', isCorrect: false },
    ],
    explanation: 'IAM Access Analyzer identifies resources (S3 buckets, IAM roles, KMS keys, Lambda functions, SQS queues) that are accessible from outside your AWS account or organization, helping detect unintended data exposure.',
    difficulty: 'intermediate',
    tags: ['iam', 'access-analyzer', 'security', 'external-access'],
  },

  // AWS Data Engineer Associate
  {
    id: 'aws-de-001',
    certificationId: 'aws-data-engineer',
    domain: 'data-ingestion',
    domainWeight: 34,
    question: 'Which AWS service provides real-time data streaming and is designed to ingest large amounts of data from multiple sources?',
    options: [
      { id: 'a', text: 'Amazon SQS', isCorrect: false },
      { id: 'b', text: 'Amazon Kinesis Data Streams', isCorrect: true },
      { id: 'c', text: 'AWS Glue', isCorrect: false },
      { id: 'd', text: 'Amazon EMR', isCorrect: false },
    ],
    explanation: 'Amazon Kinesis Data Streams enables real-time collection, processing, and analysis of streaming data at scale. It can handle millions of records per second from thousands of producers with sub-second latency.',
    difficulty: 'beginner',
    tags: ['kinesis', 'streaming', 'data-ingestion', 'real-time'],
  },
  {
    id: 'aws-de-002',
    certificationId: 'aws-data-engineer',
    domain: 'data-store',
    domainWeight: 26,
    question: 'Which AWS service is a fully managed, serverless data warehouse optimized for analytics at scale?',
    options: [
      { id: 'a', text: 'Amazon Aurora', isCorrect: false },
      { id: 'b', text: 'Amazon Redshift', isCorrect: true },
      { id: 'c', text: 'Amazon DynamoDB', isCorrect: false },
      { id: 'd', text: 'Amazon Neptune', isCorrect: false },
    ],
    explanation: 'Amazon Redshift is a fully managed, petabyte-scale cloud data warehouse. It uses columnar storage and massively parallel processing (MPP) for complex analytical queries. Redshift Serverless automatically scales capacity.',
    difficulty: 'beginner',
    tags: ['redshift', 'data-warehouse', 'analytics', 'sql'],
  },
  {
    id: 'aws-de-003',
    certificationId: 'aws-data-engineer',
    domain: 'data-ingestion',
    domainWeight: 34,
    question: 'Which AWS Glue feature automatically discovers and catalogs metadata from various data sources?',
    options: [
      { id: 'a', text: 'Glue Studio', isCorrect: false },
      { id: 'b', text: 'Glue Crawler', isCorrect: true },
      { id: 'c', text: 'Glue DataBrew', isCorrect: false },
      { id: 'd', text: 'Glue Elastic Views', isCorrect: false },
    ],
    explanation: 'AWS Glue Crawlers scan data stores (S3, RDS, DynamoDB) and populate the AWS Glue Data Catalog with metadata tables. They automatically infer schema, data types, and partitioning structure.',
    difficulty: 'intermediate',
    tags: ['glue', 'crawler', 'data-catalog', 'metadata'],
  },
  {
    id: 'aws-de-004',
    certificationId: 'aws-data-engineer',
    domain: 'data-security',
    domainWeight: 18,
    question: 'Which AWS service provides fine-grained access control for data in S3 and manages permissions at the database, table, and column level?',
    options: [
      { id: 'a', text: 'AWS IAM', isCorrect: false },
      { id: 'b', text: 'AWS Lake Formation', isCorrect: true },
      { id: 'c', text: 'Amazon Macie', isCorrect: false },
      { id: 'd', text: 'AWS Glue', isCorrect: false },
    ],
    explanation: 'AWS Lake Formation simplifies building, securing, and managing data lakes. It provides fine-grained access control at the database, table, column, and row level for data cataloged in the Glue Data Catalog.',
    difficulty: 'intermediate',
    tags: ['lake-formation', 'data-governance', 'access-control', 'data-lake'],
  },
  {
    id: 'aws-de-005',
    certificationId: 'aws-data-engineer',
    domain: 'data-operations',
    domainWeight: 22,
    question: 'Which AWS service orchestrates complex data workflows as directed acyclic graphs (DAGs)?',
    options: [
      { id: 'a', text: 'AWS Step Functions', isCorrect: false },
      { id: 'b', text: 'Amazon Managed Workflows for Apache Airflow (MWAA)', isCorrect: true },
      { id: 'c', text: 'AWS Glue Triggers', isCorrect: false },
      { id: 'd', text: 'Amazon EventBridge', isCorrect: false },
    ],
    explanation: 'Amazon MWAA is a managed service for Apache Airflow that orchestrates data workflows using DAGs. It is ideal for complex ETL pipelines, ML workflows, and data processing tasks requiring dependencies between steps.',
    difficulty: 'intermediate',
    tags: ['airflow', 'mwaa', 'orchestration', 'dag', 'workflow'],
  },

  // AWS ML Specialty
  {
    id: 'aws-ml-001',
    certificationId: 'aws-ml-specialty',
    domain: 'modeling',
    domainWeight: 36,
    question: 'Which SageMaker feature automatically finds the best hyperparameters for your ML model?',
    options: [
      { id: 'a', text: 'SageMaker Feature Store', isCorrect: false },
      { id: 'b', text: 'SageMaker Automatic Model Tuning (Hyperparameter Optimization)', isCorrect: true },
      { id: 'c', text: 'SageMaker Experiments', isCorrect: false },
      { id: 'd', text: 'SageMaker Clarify', isCorrect: false },
    ],
    explanation: 'SageMaker Automatic Model Tuning (AMT) uses Bayesian optimization to search for the best hyperparameter combination. It runs multiple training jobs and identifies the values that produce the best model performance.',
    difficulty: 'intermediate',
    tags: ['sagemaker', 'hyperparameter-tuning', 'ml', 'optimization'],
  },
  {
    id: 'aws-ml-002',
    certificationId: 'aws-ml-specialty',
    domain: 'data-engineering',
    domainWeight: 20,
    question: 'Which technique addresses class imbalance in a training dataset where one class has significantly fewer samples?',
    options: [
      { id: 'a', text: 'Feature scaling', isCorrect: false },
      { id: 'b', text: 'SMOTE (Synthetic Minority Oversampling Technique)', isCorrect: true },
      { id: 'c', text: 'Principal Component Analysis', isCorrect: false },
      { id: 'd', text: 'Batch normalization', isCorrect: false },
    ],
    explanation: 'SMOTE generates synthetic samples for the minority class by interpolating between existing minority samples. This balances the dataset and helps the model learn from both classes equally.',
    difficulty: 'advanced',
    tags: ['machine-learning', 'class-imbalance', 'smote', 'data-preprocessing'],
  },
  {
    id: 'aws-ml-003',
    certificationId: 'aws-ml-specialty',
    domain: 'ml-implementation',
    domainWeight: 20,
    question: 'A deployed SageMaker model is making predictions on live data. Which feature monitors model quality and detects data drift?',
    options: [
      { id: 'a', text: 'SageMaker Debugger', isCorrect: false },
      { id: 'b', text: 'SageMaker Model Monitor', isCorrect: true },
      { id: 'c', text: 'SageMaker Clarify', isCorrect: false },
      { id: 'd', text: 'SageMaker Ground Truth', isCorrect: false },
    ],
    explanation: 'SageMaker Model Monitor automatically detects concept drift and data quality issues in deployed models. It compares live inference data to a baseline and alerts when distributions deviate, ensuring models remain accurate over time.',
    difficulty: 'intermediate',
    tags: ['sagemaker', 'model-monitor', 'drift-detection', 'mlops'],
  },
  {
    id: 'aws-ml-004',
    certificationId: 'aws-ml-specialty',
    domain: 'exploratory-analysis',
    domainWeight: 24,
    question: 'Which metric is most appropriate for evaluating a binary classification model on an imbalanced dataset?',
    options: [
      { id: 'a', text: 'Accuracy', isCorrect: false },
      { id: 'b', text: 'AUC-ROC', isCorrect: true },
      { id: 'c', text: 'Mean Squared Error', isCorrect: false },
      { id: 'd', text: 'R-squared', isCorrect: false },
    ],
    explanation: 'AUC-ROC measures the model\'s ability to distinguish between classes regardless of the decision threshold. On imbalanced datasets, accuracy is misleading (a model predicting all majority class gets high accuracy). MSE and R-squared are for regression.',
    difficulty: 'intermediate',
    tags: ['machine-learning', 'evaluation', 'auc-roc', 'imbalanced-data'],
  },
  {
    id: 'aws-ml-005',
    certificationId: 'aws-ml-specialty',
    domain: 'modeling',
    domainWeight: 36,
    question: 'Which SageMaker built-in algorithm is best suited for detecting anomalies in a dataset?',
    options: [
      { id: 'a', text: 'XGBoost', isCorrect: false },
      { id: 'b', text: 'Random Cut Forest (RCF)', isCorrect: true },
      { id: 'c', text: 'BlazingText', isCorrect: false },
      { id: 'd', text: 'DeepAR', isCorrect: false },
    ],
    explanation: 'Random Cut Forest (RCF) is SageMaker\'s anomaly detection algorithm. It assigns an anomaly score to each data point based on how different it is from the rest of the data. XGBoost is for classification/regression, BlazingText for NLP.',
    difficulty: 'advanced',
    tags: ['sagemaker', 'anomaly-detection', 'random-cut-forest', 'ml-algorithms'],
  },

  // CompTIA Linux+
  {
    id: 'linux-001',
    certificationId: 'linux-plus',
    domain: 'system-management',
    domainWeight: 32,
    question: 'Which command displays disk usage for each directory starting from a specific path?',
    options: [
      { id: 'a', text: 'df -h', isCorrect: false },
      { id: 'b', text: 'du -sh *', isCorrect: true },
      { id: 'c', text: 'ls -la', isCorrect: false },
      { id: 'd', text: 'fdisk -l', isCorrect: false },
    ],
    explanation: 'du -sh * shows disk usage summary (-s) in human-readable format (-h) for each item in the current directory. df -h shows filesystem disk space usage, not per-directory.',
    difficulty: 'beginner',
    tags: ['linux', 'disk-usage', 'du', 'commands'],
  },
  {
    id: 'linux-002',
    certificationId: 'linux-plus',
    domain: 'security',
    domainWeight: 21,
    question: 'What does the sticky bit do on a directory like /tmp?',
    options: [
      { id: 'a', text: 'Prevents the directory from being deleted', isCorrect: false },
      { id: 'b', text: 'Allows only the file owner or root to delete files within it', isCorrect: true },
      { id: 'c', text: 'Makes files in the directory execute as root', isCorrect: false },
      { id: 'd', text: 'Prevents modifications to files', isCorrect: false },
    ],
    explanation: 'The sticky bit on a directory (e.g., /tmp with permissions drwxrwxrwt) allows any user to create files but only the file owner, directory owner, or root can delete or rename files. This prevents users from deleting each other\'s files.',
    difficulty: 'intermediate',
    tags: ['linux', 'permissions', 'sticky-bit', 'security'],
  },
  {
    id: 'linux-003',
    certificationId: 'linux-plus',
    domain: 'scripting',
    domainWeight: 19,
    question: 'Which bash command runs all background jobs sequentially and waits for them to complete?',
    options: [
      { id: 'a', text: 'fg', isCorrect: false },
      { id: 'b', text: 'wait', isCorrect: true },
      { id: 'c', text: 'jobs', isCorrect: false },
      { id: 'd', text: 'bg', isCorrect: false },
    ],
    explanation: 'The "wait" command waits for all background jobs to complete before proceeding. In scripts, "wait" is used after launching background tasks with & to ensure all tasks finish before continuing.',
    difficulty: 'intermediate',
    tags: ['linux', 'bash', 'scripting', 'background-jobs'],
  },
  {
    id: 'linux-004',
    certificationId: 'linux-plus',
    domain: 'troubleshooting',
    domainWeight: 28,
    question: 'Which command shows active network connections and listening ports on a Linux system?',
    options: [
      { id: 'a', text: 'ifconfig', isCorrect: false },
      { id: 'b', text: 'ss -tuln', isCorrect: true },
      { id: 'c', text: 'traceroute', isCorrect: false },
      { id: 'd', text: 'ping', isCorrect: false },
    ],
    explanation: 'ss -tuln shows TCP (-t) and UDP (-u) sockets in listening (-l) state with numeric addresses (-n). It replaces the older netstat command. ifconfig shows interface configuration, not connections.',
    difficulty: 'intermediate',
    tags: ['linux', 'networking', 'ss', 'ports', 'troubleshooting'],
  },
  {
    id: 'linux-005',
    certificationId: 'linux-plus',
    domain: 'system-management',
    domainWeight: 32,
    question: 'Which systemd command enables a service to start automatically at boot?',
    options: [
      { id: 'a', text: 'systemctl start nginx', isCorrect: false },
      { id: 'b', text: 'systemctl enable nginx', isCorrect: true },
      { id: 'c', text: 'systemctl restart nginx', isCorrect: false },
      { id: 'd', text: 'systemctl activate nginx', isCorrect: false },
    ],
    explanation: 'systemctl enable creates symlinks so the service starts at boot. systemctl start only starts the service for the current session. You often combine both: systemctl enable --now nginx.',
    difficulty: 'beginner',
    tags: ['linux', 'systemd', 'services', 'boot'],
  },

  // RHCSA
  {
    id: 'rhcsa-001',
    certificationId: 'rhcsa',
    domain: 'essential-tools',
    domainWeight: 20,
    question: 'Which command searches for text patterns within files using regular expressions?',
    options: [
      { id: 'a', text: 'find', isCorrect: false },
      { id: 'b', text: 'grep', isCorrect: true },
      { id: 'c', text: 'sed', isCorrect: false },
      { id: 'd', text: 'awk', isCorrect: false },
    ],
    explanation: 'grep (Global Regular Expression Print) searches files for lines matching a pattern. Common options: -i (case-insensitive), -r (recursive), -n (line numbers), -v (invert match). find locates files, sed edits streams, awk processes text fields.',
    difficulty: 'beginner',
    tags: ['linux', 'grep', 'regex', 'text-processing'],
  },
  {
    id: 'rhcsa-002',
    certificationId: 'rhcsa',
    domain: 'storage',
    domainWeight: 15,
    question: 'Which command creates a physical volume for use with LVM?',
    options: [
      { id: 'a', text: 'vgcreate', isCorrect: false },
      { id: 'b', text: 'pvcreate', isCorrect: true },
      { id: 'c', text: 'lvcreate', isCorrect: false },
      { id: 'd', text: 'mkfs', isCorrect: false },
    ],
    explanation: 'pvcreate initializes a disk or partition as a physical volume (PV) for use in LVM. The LVM setup order is: pvcreate (PV) → vgcreate (VG) → lvcreate (LV) → mkfs (format) → mount.',
    difficulty: 'intermediate',
    tags: ['linux', 'lvm', 'pvcreate', 'storage'],
  },
  {
    id: 'rhcsa-003',
    certificationId: 'rhcsa',
    domain: 'manage-users',
    domainWeight: 15,
    question: 'Which command modifies an existing user account to add them to a supplementary group?',
    options: [
      { id: 'a', text: 'groupadd', isCorrect: false },
      { id: 'b', text: 'usermod -aG groupname username', isCorrect: true },
      { id: 'c', text: 'adduser username groupname', isCorrect: false },
      { id: 'd', text: 'chgrp username groupname', isCorrect: false },
    ],
    explanation: 'usermod -aG appends (-a) the user to the supplementary group (-G). Without -a, -G replaces all supplementary groups. The user must log out and back in for group membership changes to take effect.',
    difficulty: 'beginner',
    tags: ['linux', 'usermod', 'groups', 'user-management'],
  },
  {
    id: 'rhcsa-004',
    certificationId: 'rhcsa',
    domain: 'deploy-configure',
    domainWeight: 15,
    question: 'Which command schedules a one-time task to run at a specific time on a Linux system?',
    options: [
      { id: 'a', text: 'cron', isCorrect: false },
      { id: 'b', text: 'at', isCorrect: true },
      { id: 'c', text: 'batch', isCorrect: false },
      { id: 'd', text: 'schedule', isCorrect: false },
    ],
    explanation: 'The "at" command schedules a one-time job to run at a specified time. Example: "at 14:30" then enter commands and Ctrl+D. For recurring tasks, use cron/crontab. "batch" runs when system load allows.',
    difficulty: 'beginner',
    tags: ['linux', 'at', 'scheduling', 'cron'],
  },
  {
    id: 'rhcsa-005',
    certificationId: 'rhcsa',
    domain: 'operate-systems',
    domainWeight: 20,
    question: 'Which command changes the default runlevel (systemd target) to multi-user mode without a GUI?',
    options: [
      { id: 'a', text: 'systemctl set-default graphical.target', isCorrect: false },
      { id: 'b', text: 'systemctl set-default multi-user.target', isCorrect: true },
      { id: 'c', text: 'init 3', isCorrect: false },
      { id: 'd', text: 'runlevel multi-user', isCorrect: false },
    ],
    explanation: 'systemctl set-default multi-user.target sets the default boot target to multi-user (text mode, no GUI). graphical.target includes the desktop environment. This replaces the legacy init runlevel system.',
    difficulty: 'intermediate',
    tags: ['linux', 'systemd', 'targets', 'runlevel'],
  },

  // Professional Scrum Developer (psd)
  {
    id: 'psd-001',
    certificationId: 'psd',
    domain: 'agile-tdd',
    domainWeight: 40,
    question: 'In Test-Driven Development (TDD), what is the correct order of steps?',
    options: [
      { id: 'a', text: 'Write code → Write test → Refactor', isCorrect: false },
      { id: 'b', text: 'Write failing test → Write code to pass → Refactor', isCorrect: true },
      { id: 'c', text: 'Write test → Refactor → Write code', isCorrect: false },
      { id: 'd', text: 'Write code → Refactor → Write test', isCorrect: false },
    ],
    explanation: 'TDD follows the Red-Green-Refactor cycle: Write a failing test (Red), write the minimum code to make it pass (Green), then clean up the code (Refactor). This ensures all code is tested from the start.',
    difficulty: 'beginner',
    tags: ['tdd', 'testing', 'agile', 'red-green-refactor'],
  },
  {
    id: 'psd-002',
    certificationId: 'psd',
    domain: 'software-engineering',
    domainWeight: 35,
    question: 'Which SOLID principle states that a class should have only one reason to change?',
    options: [
      { id: 'a', text: 'Open/Closed Principle', isCorrect: false },
      { id: 'b', text: 'Single Responsibility Principle', isCorrect: true },
      { id: 'c', text: 'Liskov Substitution Principle', isCorrect: false },
      { id: 'd', text: 'Interface Segregation Principle', isCorrect: false },
    ],
    explanation: 'The Single Responsibility Principle (SRP) states that a class should have only one reason to change, meaning it should have only one job or responsibility. This makes code more maintainable, testable, and understandable.',
    difficulty: 'beginner',
    tags: ['solid', 'srp', 'design-principles', 'clean-code'],
  },
  {
    id: 'psd-003',
    certificationId: 'psd',
    domain: 'devops-practices',
    domainWeight: 25,
    question: 'What is the main goal of Continuous Integration (CI)?',
    options: [
      { id: 'a', text: 'Deploy to production automatically', isCorrect: false },
      { id: 'b', text: 'Detect integration issues early by frequently merging and building code', isCorrect: true },
      { id: 'c', text: 'Replace manual testing completely', isCorrect: false },
      { id: 'd', text: 'Monitor application performance', isCorrect: false },
    ],
    explanation: 'CI involves frequently merging code changes into a shared repository (multiple times per day), automatically building and running tests. This detects integration conflicts early when they are easier and cheaper to fix.',
    difficulty: 'beginner',
    tags: ['ci', 'continuous-integration', 'devops', 'agile'],
  },
  {
    id: 'psd-004',
    certificationId: 'psd',
    domain: 'agile-tdd',
    domainWeight: 40,
    question: 'What does "refactoring" mean in agile software development?',
    options: [
      { id: 'a', text: 'Rewriting the code from scratch', isCorrect: false },
      { id: 'b', text: 'Improving the internal structure of code without changing its external behavior', isCorrect: true },
      { id: 'c', text: 'Adding new features to existing code', isCorrect: false },
      { id: 'd', text: 'Fixing bugs in production code', isCorrect: false },
    ],
    explanation: 'Refactoring is the process of restructuring existing code without changing what it does. It improves readability, reduces complexity, and removes duplication (DRY principle) while keeping all tests passing.',
    difficulty: 'beginner',
    tags: ['refactoring', 'clean-code', 'agile', 'software-design'],
  },
  {
    id: 'psd-005',
    certificationId: 'psd',
    domain: 'software-engineering',
    domainWeight: 35,
    question: 'Which design pattern allows behavior to be selected at runtime by encapsulating algorithms in separate classes?',
    options: [
      { id: 'a', text: 'Singleton pattern', isCorrect: false },
      { id: 'b', text: 'Strategy pattern', isCorrect: true },
      { id: 'c', text: 'Observer pattern', isCorrect: false },
      { id: 'd', text: 'Factory pattern', isCorrect: false },
    ],
    explanation: 'The Strategy pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable. It lets the algorithm vary independently from clients that use it, following the Open/Closed Principle.',
    difficulty: 'intermediate',
    tags: ['design-patterns', 'strategy', 'software-design', 'oop'],
  },

  // AWS Database Specialty
  {
    id: 'aws-db-001',
    certificationId: 'aws-database',
    domain: 'workload-specific',
    domainWeight: 26,
    question: 'Which AWS database service is best for storing and querying graph relationships like social networks?',
    options: [
      { id: 'a', text: 'Amazon DynamoDB', isCorrect: false },
      { id: 'b', text: 'Amazon Neptune', isCorrect: true },
      { id: 'c', text: 'Amazon DocumentDB', isCorrect: false },
      { id: 'd', text: 'Amazon ElastiCache', isCorrect: false },
    ],
    explanation: 'Amazon Neptune is a fully managed graph database supporting Property Graph (Gremlin) and RDF (SPARQL) models. It is ideal for social networks, recommendation engines, knowledge graphs, and fraud detection.',
    difficulty: 'intermediate',
    tags: ['neptune', 'graph-database', 'aws', 'workload-selection'],
  },
  {
    id: 'aws-db-002',
    certificationId: 'aws-database',
    domain: 'deployment',
    domainWeight: 20,
    question: 'Which feature of Aurora provides up to 15 low-latency read replicas that automatically receive updates from the primary?',
    options: [
      { id: 'a', text: 'RDS Read Replicas', isCorrect: false },
      { id: 'b', text: 'Aurora Replicas', isCorrect: true },
      { id: 'c', text: 'Aurora Global Database', isCorrect: false },
      { id: 'd', text: 'Aurora Multi-Master', isCorrect: false },
    ],
    explanation: 'Aurora Replicas (up to 15) share the same underlying distributed storage as the primary, providing low-latency reads with replication lag typically under 100ms. They can also serve as failover targets for automatic recovery.',
    difficulty: 'intermediate',
    tags: ['aurora', 'replicas', 'read-scaling', 'high-availability'],
  },
  {
    id: 'aws-db-003',
    certificationId: 'aws-database',
    domain: 'database-security',
    domainWeight: 18,
    question: 'Which RDS feature encrypts data at rest using AWS KMS and applies to all storage, backups, and snapshots?',
    options: [
      { id: 'a', text: 'SSL/TLS encryption', isCorrect: false },
      { id: 'b', text: 'RDS Encryption at Rest', isCorrect: true },
      { id: 'c', text: 'IAM Database Authentication', isCorrect: false },
      { id: 'd', text: 'Parameter Groups', isCorrect: false },
    ],
    explanation: 'RDS Encryption at Rest (enabled at creation) uses AES-256 encryption via KMS. All data on the underlying storage, automated backups, read replicas, and snapshots are encrypted. Encryption cannot be added to an existing unencrypted instance.',
    difficulty: 'beginner',
    tags: ['rds', 'encryption', 'kms', 'security'],
  },
  {
    id: 'aws-db-004',
    certificationId: 'aws-database',
    domain: 'monitoring',
    domainWeight: 18,
    question: 'Which RDS feature provides OS-level metrics like CPU, memory, and I/O for deeper performance analysis?',
    options: [
      { id: 'a', text: 'CloudWatch Basic Monitoring', isCorrect: false },
      { id: 'b', text: 'RDS Enhanced Monitoring', isCorrect: true },
      { id: 'c', text: 'Performance Insights', isCorrect: false },
      { id: 'd', text: 'RDS Event Notifications', isCorrect: false },
    ],
    explanation: 'RDS Enhanced Monitoring collects OS-level metrics at up to 1-second granularity using an agent running on the DB instance. CloudWatch provides basic hypervisor-level metrics. Performance Insights focuses on database load and SQL-level analysis.',
    difficulty: 'intermediate',
    tags: ['rds', 'enhanced-monitoring', 'performance', 'metrics'],
  },
  {
    id: 'aws-db-005',
    certificationId: 'aws-database',
    domain: 'management',
    domainWeight: 18,
    question: 'Which DynamoDB feature allows you to read data as it appeared at any point in time within the last 35 days?',
    options: [
      { id: 'a', text: 'DynamoDB Streams', isCorrect: false },
      { id: 'b', text: 'Point-in-Time Recovery (PITR)', isCorrect: true },
      { id: 'c', text: 'Global Tables', isCorrect: false },
      { id: 'd', text: 'On-Demand Capacity Mode', isCorrect: false },
    ],
    explanation: 'DynamoDB Point-in-Time Recovery (PITR) provides continuous backups of your table and allows you to restore to any second within the last 35 days. It protects against accidental data loss from operations like DeleteItem or PutItem.',
    difficulty: 'intermediate',
    tags: ['dynamodb', 'pitr', 'backup', 'recovery'],
  },

  // Cisco CCNA
  {
    id: 'ccna-001',
    certificationId: 'ccna',
    domain: 'network-fundamentals',
    domainWeight: 20,
    question: 'Which OSI layer is responsible for end-to-end communication, error recovery, and flow control?',
    options: [
      { id: 'a', text: 'Network (Layer 3)', isCorrect: false },
      { id: 'b', text: 'Transport (Layer 4)', isCorrect: true },
      { id: 'c', text: 'Session (Layer 5)', isCorrect: false },
      { id: 'd', text: 'Data Link (Layer 2)', isCorrect: false },
    ],
    explanation: 'The Transport layer (Layer 4) provides end-to-end communication between hosts, including segmentation, flow control, and error recovery. TCP provides reliable delivery, UDP provides best-effort delivery.',
    difficulty: 'beginner',
    tags: ['networking', 'osi', 'transport-layer', 'tcp-udp'],
  },
  {
    id: 'ccna-002',
    certificationId: 'ccna',
    domain: 'ip-connectivity',
    domainWeight: 25,
    question: 'What is the purpose of OSPF DR/BDR election on a broadcast network?',
    options: [
      { id: 'a', text: 'To reduce IP addressing complexity', isCorrect: false },
      { id: 'b', text: 'To reduce the number of adjacencies and LSA flooding', isCorrect: true },
      { id: 'c', text: 'To enable load balancing between routers', isCorrect: false },
      { id: 'd', text: 'To provide redundant default gateways', isCorrect: false },
    ],
    explanation: 'On broadcast networks (Ethernet), OSPF elects a Designated Router (DR) and Backup DR (BDR). All other routers form adjacencies only with DR/BDR, reducing from O(n²) to O(n) adjacencies and minimizing LSA flooding.',
    difficulty: 'advanced',
    tags: ['ospf', 'routing', 'dr-bdr', 'networking'],
  },
  {
    id: 'ccna-003',
    certificationId: 'ccna',
    domain: 'network-access',
    domainWeight: 20,
    question: 'Which Spanning Tree Protocol feature allows a port to move directly from blocking to forwarding state?',
    options: [
      { id: 'a', text: 'PortFast', isCorrect: true },
      { id: 'b', text: 'BPDU Guard', isCorrect: false },
      { id: 'c', text: 'Root Guard', isCorrect: false },
      { id: 'd', text: 'UplinkFast', isCorrect: false },
    ],
    explanation: 'PortFast skips the STP listening and learning states, immediately transitioning to forwarding. It should only be used on access ports connected to end devices (not switches), as it bypasses loop prevention.',
    difficulty: 'intermediate',
    tags: ['networking', 'stp', 'portfast', 'switching'],
  },
  {
    id: 'ccna-004',
    certificationId: 'ccna',
    domain: 'ip-services',
    domainWeight: 10,
    question: 'Which NAT type maps one internal IP address to one external IP address (1-to-1 mapping)?',
    options: [
      { id: 'a', text: 'Dynamic NAT', isCorrect: false },
      { id: 'b', text: 'PAT (NAT Overload)', isCorrect: false },
      { id: 'c', text: 'Static NAT', isCorrect: true },
      { id: 'd', text: 'Policy NAT', isCorrect: false },
    ],
    explanation: 'Static NAT provides a permanent, one-to-one mapping between an inside local address and an inside global address. It is commonly used for servers that must be reachable from the internet on a specific public IP.',
    difficulty: 'beginner',
    tags: ['networking', 'nat', 'static-nat', 'ip-services'],
  },
  {
    id: 'ccna-005',
    certificationId: 'ccna',
    domain: 'security-fundamentals',
    domainWeight: 15,
    question: 'Which Cisco feature protects against rogue DHCP servers on a switch port?',
    options: [
      { id: 'a', text: 'Port Security', isCorrect: false },
      { id: 'b', text: 'DHCP Snooping', isCorrect: true },
      { id: 'c', text: 'Dynamic ARP Inspection', isCorrect: false },
      { id: 'd', text: 'IP Source Guard', isCorrect: false },
    ],
    explanation: 'DHCP Snooping classifies ports as trusted (legitimate DHCP servers) or untrusted (client ports). DHCP server messages received on untrusted ports are dropped, preventing rogue DHCP servers from assigning invalid IP addresses.',
    difficulty: 'intermediate',
    tags: ['networking', 'dhcp-snooping', 'security', 'switching'],
  },

  // AWS Advanced Networking Specialty
  {
    id: 'aws-net-001',
    certificationId: 'aws-networking',
    domain: 'network-design',
    domainWeight: 30,
    question: 'Which AWS service acts as a cloud router to connect multiple VPCs and on-premises networks through a central hub?',
    options: [
      { id: 'a', text: 'VPC Peering', isCorrect: false },
      { id: 'b', text: 'AWS Transit Gateway', isCorrect: true },
      { id: 'c', text: 'AWS Direct Connect', isCorrect: false },
      { id: 'd', text: 'AWS PrivateLink', isCorrect: false },
    ],
    explanation: 'AWS Transit Gateway acts as a regional router connecting thousands of VPCs and on-premises networks through a single hub. It simplifies network topology by eliminating full-mesh peering and supports multicast and inter-region peering.',
    difficulty: 'intermediate',
    tags: ['transit-gateway', 'networking', 'vpc', 'hub-and-spoke'],
  },
  {
    id: 'aws-net-002',
    certificationId: 'aws-networking',
    domain: 'network-implementation',
    domainWeight: 26,
    question: 'Which AWS Direct Connect feature provides redundancy by aggregating multiple Direct Connect connections?',
    options: [
      { id: 'a', text: 'Direct Connect Gateway', isCorrect: false },
      { id: 'b', text: 'Link Aggregation Group (LAG)', isCorrect: true },
      { id: 'c', text: 'Virtual Private Gateway', isCorrect: false },
      { id: 'd', text: 'Hosted Connection', isCorrect: false },
    ],
    explanation: 'Link Aggregation Group (LAG) combines multiple Direct Connect connections into a single managed connection, providing higher bandwidth and redundancy. All connections in a LAG must use the same speed and terminate at the same Direct Connect location.',
    difficulty: 'advanced',
    tags: ['direct-connect', 'lag', 'networking', 'redundancy'],
  },
  {
    id: 'aws-net-003',
    certificationId: 'aws-networking',
    domain: 'network-security',
    domainWeight: 24,
    question: 'Which service provides a private connection from your VPC to AWS services without traversing the internet?',
    options: [
      { id: 'a', text: 'NAT Gateway', isCorrect: false },
      { id: 'b', text: 'AWS PrivateLink (VPC Endpoints)', isCorrect: true },
      { id: 'c', text: 'Internet Gateway', isCorrect: false },
      { id: 'd', text: 'AWS VPN', isCorrect: false },
    ],
    explanation: 'AWS PrivateLink enables private connectivity between VPCs and AWS services using VPC endpoints. Traffic stays on the AWS network and never traverses the public internet, reducing exposure and data transfer costs.',
    difficulty: 'intermediate',
    tags: ['privatelink', 'vpc-endpoints', 'networking', 'private-connectivity'],
  },
  {
    id: 'aws-net-004',
    certificationId: 'aws-networking',
    domain: 'network-management',
    domainWeight: 20,
    question: 'Which VPC feature provides network-level logging of IP traffic going to and from network interfaces?',
    options: [
      { id: 'a', text: 'CloudTrail', isCorrect: false },
      { id: 'b', text: 'VPC Flow Logs', isCorrect: true },
      { id: 'c', text: 'AWS Config', isCorrect: false },
      { id: 'd', text: 'Reachability Analyzer', isCorrect: false },
    ],
    explanation: 'VPC Flow Logs capture information about IP traffic going to/from network interfaces in a VPC. They can be published to CloudWatch Logs or S3 and are essential for network troubleshooting, security analysis, and compliance.',
    difficulty: 'beginner',
    tags: ['vpc', 'flow-logs', 'networking', 'logging', 'monitoring'],
  },
  {
    id: 'aws-net-005',
    certificationId: 'aws-networking',
    domain: 'network-design',
    domainWeight: 30,
    question: 'A company needs to expose an internal service to other VPCs without making it publicly accessible. Which solution provides this privately?',
    options: [
      { id: 'a', text: 'Public Application Load Balancer', isCorrect: false },
      { id: 'b', text: 'AWS PrivateLink with Network Load Balancer', isCorrect: true },
      { id: 'c', text: 'VPC Peering with public subnets', isCorrect: false },
      { id: 'd', text: 'Internet Gateway with security groups', isCorrect: false },
    ],
    explanation: 'PrivateLink with an NLB creates a private endpoint service. Other VPCs create interface endpoints to connect privately without VPC peering or internet exposure. The service provider controls who can connect.',
    difficulty: 'advanced',
    tags: ['privatelink', 'nlb', 'endpoint-service', 'networking'],
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
