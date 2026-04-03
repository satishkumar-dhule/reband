// Certification channels - lazy loaded
import type { ChannelConfig } from './channels-types';

export const certificationChannels: ChannelConfig[] = [
  // AWS
  { id: 'aws-saa', name: 'AWS Solutions Architect Associate', description: 'SAA-C03 exam prep', icon: 'cloud', color: 'text-orange-500', category: 'certification', roles: ['architect', 'backend', 'devops', 'sre'], isCertification: true },
  { id: 'aws-sap', name: 'AWS Solutions Architect Professional', description: 'SAP-C02 exam prep', icon: 'cloud', color: 'text-orange-600', category: 'certification', roles: ['architect', 'backend', 'devops', 'sre'], isCertification: true },
  { id: 'aws-dva', name: 'AWS Developer Associate', description: 'DVA-C02 exam prep', icon: 'cloud', color: 'text-orange-400', category: 'certification', roles: ['backend', 'fullstack', 'devops'], isCertification: true },
  { id: 'aws-sysops', name: 'AWS SysOps Administrator', description: 'SOA-C02 exam prep', icon: 'cloud', color: 'text-orange-500', category: 'certification', roles: ['devops', 'sre', 'platform'], isCertification: true },
  { id: 'aws-devops-pro', name: 'AWS DevOps Engineer Professional', description: 'DOP-C02 exam prep', icon: 'cloud', color: 'text-orange-600', category: 'certification', roles: ['devops', 'sre', 'platform'], isCertification: true },
  { id: 'aws-data-engineer', name: 'AWS Data Engineer Associate', description: 'DEA-C01 exam prep', icon: 'cloud', color: 'text-orange-500', category: 'certification', roles: ['data-engineer', 'backend'], isCertification: true },
  { id: 'aws-ml-specialty', name: 'AWS Machine Learning Specialty', description: 'MLS-C01 exam prep', icon: 'cloud', color: 'text-orange-600', category: 'certification', roles: ['ml-engineer', 'data-scientist', 'ai-engineer'], isCertification: true },
  { id: 'aws-security-specialty', name: 'AWS Security Specialty', description: 'SCS-C02 exam prep', icon: 'cloud', color: 'text-orange-600', category: 'certification', roles: ['security', 'devops', 'sre'], isCertification: true },
  { id: 'aws-database-specialty', name: 'AWS Database Specialty', description: 'DBS-C01 exam prep', icon: 'cloud', color: 'text-orange-600', category: 'certification', roles: ['backend', 'data-engineer', 'dba'], isCertification: true },
  { id: 'aws-networking-specialty', name: 'AWS Networking Specialty', description: 'ANS-C01 exam prep', icon: 'cloud', color: 'text-orange-600', category: 'certification', roles: ['sre', 'devops', 'security'], isCertification: true },
  { id: 'aws-ai-practitioner', name: 'AWS AI Practitioner', description: 'AIF-C01 exam prep', icon: 'cloud', color: 'text-orange-400', category: 'certification', roles: ['ai-engineer', 'ml-engineer', 'backend', 'fullstack'], isCertification: true },
  // Kubernetes
  { id: 'cka', name: 'CKA - Kubernetes Administrator', description: 'CKA exam prep', icon: 'box', color: 'text-blue-500', category: 'certification', roles: ['devops', 'sre', 'platform'], isCertification: true },
  { id: 'ckad', name: 'CKAD - Kubernetes Developer', description: 'CKAD exam prep', icon: 'box', color: 'text-blue-400', category: 'certification', roles: ['backend', 'fullstack', 'devops'], isCertification: true },
  { id: 'cks', name: 'CKS - Kubernetes Security', description: 'CKS exam prep', icon: 'box', color: 'text-blue-600', category: 'certification', roles: ['security', 'devops', 'sre'], isCertification: true },
  { id: 'kcna', name: 'KCNA - Kubernetes Cloud Native', description: 'KCNA exam prep', icon: 'box', color: 'text-blue-300', category: 'certification', roles: ['backend', 'fullstack', 'devops', 'sre'], isCertification: true },
  // HashiCorp
  { id: 'terraform-associate', name: 'Terraform Associate', description: 'HashiCorp exam prep', icon: 'layers', color: 'text-purple-500', category: 'certification', roles: ['devops', 'sre', 'platform'], isCertification: true },
  { id: 'vault-associate', name: 'Vault Associate', description: 'HashiCorp exam prep', icon: 'lock', color: 'text-purple-500', category: 'certification', roles: ['security', 'devops', 'sre'], isCertification: true },
  { id: 'consul-associate', name: 'Consul Associate', description: 'HashiCorp exam prep', icon: 'network', color: 'text-purple-500', category: 'certification', roles: ['devops', 'sre', 'platform'], isCertification: true },
  // GCP
  { id: 'gcp-cloud-engineer', name: 'GCP Associate Cloud Engineer', description: 'GCP exam prep', icon: 'cloud', color: 'text-blue-500', category: 'certification', roles: ['devops', 'sre', 'backend'], isCertification: true },
  { id: 'gcp-cloud-architect', name: 'GCP Professional Cloud Architect', description: 'GCP exam prep', icon: 'cloud', color: 'text-blue-600', category: 'certification', roles: ['architect', 'backend', 'devops'], isCertification: true },
  { id: 'gcp-data-engineer', name: 'GCP Professional Data Engineer', description: 'GCP exam prep', icon: 'cloud', color: 'text-blue-500', category: 'certification', roles: ['data-engineer', 'backend'], isCertification: true },
  { id: 'gcp-ml-engineer', name: 'GCP Professional ML Engineer', description: 'GCP exam prep', icon: 'cloud', color: 'text-blue-600', category: 'certification', roles: ['ml-engineer', 'data-scientist', 'ai-engineer'], isCertification: true },
  { id: 'gcp-devops-engineer', name: 'GCP Professional DevOps Engineer', description: 'GCP exam prep', icon: 'cloud', color: 'text-blue-500', category: 'certification', roles: ['devops', 'sre', 'platform'], isCertification: true },
  { id: 'gcp-security-engineer', name: 'GCP Professional Security Engineer', description: 'GCP exam prep', icon: 'cloud', color: 'text-blue-600', category: 'certification', roles: ['security', 'devops', 'sre'], isCertification: true },
  // Azure
  { id: 'azure-fundamentals', name: 'Azure Fundamentals (AZ-900)', description: 'Azure exam prep', icon: 'cloud', color: 'text-cyan-500', category: 'certification', roles: ['backend', 'fullstack', 'devops'], isCertification: true },
  { id: 'azure-administrator', name: 'Azure Administrator (AZ-104)', description: 'Azure exam prep', icon: 'cloud', color: 'text-cyan-500', category: 'certification', roles: ['devops', 'sre', 'platform'], isCertification: true },
  { id: 'azure-developer', name: 'Azure Developer (AZ-204)', description: 'Azure exam prep', icon: 'cloud', color: 'text-cyan-500', category: 'certification', roles: ['backend', 'fullstack'], isCertification: true },
  { id: 'azure-solutions-architect', name: 'Azure Solutions Architect (AZ-305)', description: 'Azure exam prep', icon: 'cloud', color: 'text-cyan-600', category: 'certification', roles: ['architect', 'backend', 'devops'], isCertification: true },
  { id: 'azure-devops-engineer', name: 'Azure DevOps Engineer (AZ-400)', description: 'Azure exam prep', icon: 'cloud', color: 'text-cyan-500', category: 'certification', roles: ['devops', 'sre', 'platform'], isCertification: true },
  { id: 'azure-data-engineer', name: 'Azure Data Engineer (DP-203)', description: 'Azure exam prep', icon: 'cloud', color: 'text-cyan-500', category: 'certification', roles: ['data-engineer', 'backend'], isCertification: true },
  { id: 'azure-ai-engineer', name: 'Azure AI Engineer (AI-102)', description: 'Azure exam prep', icon: 'cloud', color: 'text-cyan-600', category: 'certification', roles: ['ai-engineer', 'ml-engineer'], isCertification: true },
  { id: 'azure-security-engineer', name: 'Azure Security Engineer (AZ-500)', description: 'Azure exam prep', icon: 'cloud', color: 'text-cyan-600', category: 'certification', roles: ['security', 'devops', 'sre'], isCertification: true },
  // Linux & DevOps
  { id: 'linux-foundation-sysadmin', name: 'Linux Foundation Sysadmin (LFCS)', description: 'LFCS exam prep', icon: 'terminal', color: 'text-yellow-600', category: 'certification', roles: ['sre', 'devops', 'platform'], isCertification: true },
  { id: 'rhcsa', name: 'Red Hat Certified System Admin', description: 'RHCSA exam prep', icon: 'terminal', color: 'text-red-500', category: 'certification', roles: ['sre', 'devops', 'platform'], isCertification: true },
  { id: 'docker-dca', name: 'Docker Certified Associate', description: 'DCA exam prep', icon: 'box', color: 'text-blue-400', category: 'certification', roles: ['devops', 'sre', 'backend'], isCertification: true },
  // Data & Analytics
  { id: 'databricks-data-engineer', name: 'Databricks Data Engineer Associate', description: 'Databricks exam prep', icon: 'database', color: 'text-red-500', category: 'certification', roles: ['data-engineer', 'backend'], isCertification: true },
  { id: 'snowflake-core', name: 'Snowflake SnowPro Core', description: 'Snowflake exam prep', icon: 'database', color: 'text-cyan-400', category: 'certification', roles: ['data-engineer', 'backend'], isCertification: true },
  { id: 'dbt-analytics-engineer', name: 'dbt Analytics Engineer', description: 'dbt exam prep', icon: 'database', color: 'text-orange-400', category: 'certification', roles: ['data-engineer', 'data-scientist'], isCertification: true },
  // Security
  { id: 'comptia-security-plus', name: 'CompTIA Security+', description: 'Security+ exam prep', icon: 'shield', color: 'text-red-500', category: 'certification', roles: ['security', 'backend', 'devops'], isCertification: true },
  { id: 'cissp', name: 'CISSP', description: 'CISSP exam prep', icon: 'shield', color: 'text-red-600', category: 'certification', roles: ['security', 'architect'], isCertification: true },
  // AI/ML
  { id: 'tensorflow-developer', name: 'TensorFlow Developer Certificate', description: 'TensorFlow exam prep', icon: 'brain', color: 'text-orange-500', category: 'certification', roles: ['ml-engineer', 'ai-engineer', 'data-scientist'], isCertification: true },
];

// Helper functions
export function getCertificationChannels(): ChannelConfig[] {
  return certificationChannels;
}

export function getCertificationsByProvider(provider: 'aws' | 'gcp' | 'azure' | 'kubernetes' | 'hashicorp' | 'linux' | 'data' | 'security' | 'ai'): ChannelConfig[] {
  const prefixes: Record<string, string[]> = {
    aws: ['aws-'],
    gcp: ['gcp-'],
    azure: ['azure-'],
    kubernetes: ['cka', 'ckad', 'cks', 'kcna'],
    hashicorp: ['terraform-', 'vault-', 'consul-'],
    linux: ['linux-', 'rhcsa', 'docker-'],
    data: ['databricks-', 'snowflake-', 'dbt-'],
    security: ['comptia-', 'cissp'],
    ai: ['tensorflow-']
  };
  
  const patterns = prefixes[provider] || [];
  return certificationChannels.filter(channel => 
    patterns.some(p => channel.id.startsWith(p) || channel.id === p)
  );
}
