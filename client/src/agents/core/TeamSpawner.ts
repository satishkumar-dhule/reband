// Team Spawner - ULTRA PRO MAX Performance
// Spawns teams of agents with parallel execution and smart queuing

import { messageBus, createMessage, type AgentMessage, type AgentMessageType } from './AgentMessageBus';

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  priority?: 'low' | 'normal' | 'high' | 'critical' | 'medium';
}

export interface TeamConfig {
  id: string;
  name: string;
  agents: AgentConfig[];
  maxConcurrent?: number;
  timeout?: number;
}

export interface SpawnResult {
  agentId: string;
  success: boolean;
  result?: unknown;
  error?: string;
  duration: number;
}

export interface TeamSpawnResult {
  teamId: string;
  success: boolean;
  results: SpawnResult[];
  totalDuration: number;
  failedCount: number;
  succeededCount: number;
}

type SpawnHandler = (agentId: string, config: AgentConfig) => Promise<unknown>;

class TeamSpawner {
  private activeTeams: Map<string, { config: TeamConfig; startTime: number }> = new Map();
  private spawnHandlers: Map<string, SpawnHandler> = new Map();
  private teamQueue: Array<{ config: TeamConfig; resolve: (r: TeamSpawnResult) => void }> = [];
  private activeCount = 0;
  private maxConcurrent: number;
  
  private metrics = {
    teamsSpawned: 0,
    totalAgents: 0,
    avgSpawnTime: 0,
    failures: 0,
  };

  constructor(maxConcurrent = 10) {
    this.maxConcurrent = maxConcurrent;
  }

  registerSpawnHandler(agentType: string, handler: SpawnHandler): void {
    this.spawnHandlers.set(agentType, handler);
  }

  async spawnTeam(config: TeamConfig): Promise<TeamSpawnResult> {
    const startTime = performance.now();
    const { id: teamId, agents, maxConcurrent = this.maxConcurrent, timeout = 30000 } = config;
    
    this.activeTeams.set(teamId, { config, startTime: Date.now() });
    this.metrics.teamsSpawned++;
    this.metrics.totalAgents += agents.length;

    const limitedConcurrency = Math.min(maxConcurrent, agents.length);
    const results: SpawnResult[] = [];
    
    const chunks: AgentConfig[][] = [];
    for (let i = 0; i < agents.length; i += limitedConcurrency) {
      chunks.push(agents.slice(i, i + limitedConcurrency));
    }

    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (agentConfig) => {
        const agentStartTime = performance.now();
        
        try {
          const handler = this.spawnHandlers.get(agentConfig.id);
          
          let result: unknown;
          if (handler) {
            result = await this.withTimeout(
              handler(agentConfig.id, agentConfig),
              timeout / agents.length
            );
          } else {
            const message = createMessage(
              'team-spawner',
              agentConfig.id,
              'REQUEST',
              { config: agentConfig, action: 'init' },
              `${teamId}-${agentConfig.id}`
            );
            
            const response = await messageBus.sendAndWait(message, timeout / agents.length);
            result = response?.payload?.result;
          }
          
          const duration = performance.now() - agentStartTime;
          this.metrics.avgSpawnTime = this.metrics.avgSpawnTime * 0.9 + duration * 0.1;
          
          return {
            agentId: agentConfig.id,
            success: true,
            result,
            duration,
          } as SpawnResult;
        } catch (error) {
          const duration = performance.now() - agentStartTime;
          this.metrics.failures++;
          
          return {
            agentId: agentConfig.id,
            success: false,
            error: String(error),
            duration,
          } as SpawnResult;
        }
      });
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    const totalDuration = performance.now() - startTime;
    const failedCount = results.filter(r => !r.success).length;
    const succeededCount = results.filter(r => r.success).length;

    this.activeTeams.delete(teamId);

    return {
      teamId,
      success: failedCount === 0,
      results,
      totalDuration,
      failedCount,
      succeededCount,
    };
  }

  async spawnTeamBatched(config: TeamConfig): Promise<TeamSpawnResult> {
    const startTime = performance.now();
    const { id: teamId, agents, maxConcurrent = this.maxConcurrent } = config;
    
    this.activeTeams.set(teamId, { config, startTime: Date.now() });

    const results: SpawnResult[] = [];
    let activePromises: Promise<SpawnResult>[] = [];
    let agentIndex = 0;

    const spawnAgent = async (agentConfig: AgentConfig): Promise<SpawnResult> => {
      const agentStartTime = performance.now();
      
      try {
        const handler = this.spawnHandlers.get(agentConfig.id);
        let result: unknown;
        
        if (handler) {
          result = await handler(agentConfig.id, agentConfig);
        } else {
          const message = createMessage(
            'team-spawner',
            agentConfig.id,
            'REQUEST',
            { config: agentConfig, action: 'init' }
          );
          const response = await messageBus.sendAndWait(message, 5000);
          result = response?.payload?.result;
        }
        
        return {
          agentId: agentConfig.id,
          success: true,
          result,
          duration: performance.now() - agentStartTime,
        };
      } catch (error) {
        return {
          agentId: agentConfig.id,
          success: false,
          error: String(error),
          duration: performance.now() - agentStartTime,
        };
      }
    };

    while (agentIndex < agents.length || activePromises.length > 0) {
      while (activePromises.length < maxConcurrent && agentIndex < agents.length) {
        const agent = agents[agentIndex++];
        activePromises.push(spawnAgent(agent));
      }

      if (activePromises.length > 0) {
        const completed = await Promise.race(activePromises);
        results.push(completed);
        activePromises = activePromises.filter(p => p !== Promise.resolve(completed));
      }
    }

    const totalDuration = performance.now() - startTime;
    const failedCount = results.filter(r => !r.success).length;

    this.activeTeams.delete(teamId);
    this.metrics.teamsSpawned++;
    this.metrics.totalAgents += agents.length;

    return {
      teamId,
      success: failedCount === 0,
      results,
      totalDuration,
      failedCount,
      succeededCount: results.length - failedCount,
    };
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
      ),
    ]) as Promise<T>;
  }

  getActiveTeams(): Array<{ teamId: string; config: TeamConfig; elapsed: number }> {
    const now = Date.now();
    return Array.from(this.activeTeams.entries()).map(([teamId, { config, startTime }]) => ({
      teamId,
      config,
      elapsed: now - startTime,
    }));
  }

  getMetrics() {
    return { ...this.metrics };
  }

  setMaxConcurrent(max: number): void {
    this.maxConcurrent = Math.max(1, Math.min(max, 50));
  }
}

export const teamSpawner = new TeamSpawner();

export function createTeamConfig(
  id: string,
  name: string,
  agents: AgentConfig[],
  options?: { maxConcurrent?: number; timeout?: number }
): TeamConfig {
  return {
    id,
    name,
    agents,
    maxConcurrent: options?.maxConcurrent,
    timeout: options?.timeout,
  };
}
