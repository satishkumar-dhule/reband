// Agent Message Bus - Core of the multi-agent system
// Coordinates 30 specialized agents through asynchronous message passing

export type AgentMessageType = 
  | 'REQUEST' 
  | 'RESPONSE' 
  | 'BROADCAST' 
  | 'SUBSCRIBE' 
  | 'UNSUBSCRIBE' 
  | 'ERROR'
  | 'HEARTBEAT'
  | 'SYNC';

export interface AgentMessage {
  id: string;
  type: AgentMessageType;
  from: string;
  to: string | '*';
  payload: any;
  timestamp: number;
  correlationId?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'error' | 'offline';
  subscriptions: Set<string>;
}

type MessageHandler = (message: AgentMessage) => Promise<void> | void;

class AgentMessageBus {
  private agents: Map<string, Agent> = new Map();
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private messageQueue: AgentMessage[] = [];
  private processing = false;
  private messageHistory: AgentMessage[] = [];
  private maxHistory = 1000;

  constructor() {
    this.startProcessing();
  }

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
    this.handlers.set(agent.id, new Set());
    console.log(`[AgentMessageBus] Registered agent: ${agent.name} (${agent.id})`);
  }

  subscribe(subscriberId: string, publisherId: string): void {
    const agent = this.agents.get(subscriberId);
    if (agent) {
      agent.subscriptions.add(publisherId);
    }
  }

  unsubscribe(subscriberId: string, publisherId: string): void {
    const agent = this.agents.get(subscriberId);
    if (agent) {
      agent.subscriptions.delete(publisherId);
    }
  }

  async send(message: AgentMessage): Promise<void> {
    return new Promise((resolve) => {
      this.messageQueue.push(message);
      this.messageHistory.push(message);
      if (this.messageHistory.length > this.maxHistory) {
        this.messageHistory.shift();
      }
      resolve();
    });
  }

  async sendAndWait(message: AgentMessage, timeout = 5000): Promise<AgentMessage | null> {
    await this.send(message);
    
    return new Promise((resolve) => {
      const checkResponse = () => {
        const response = this.messageHistory.find(
          m => m.correlationId === message.id && m.from === message.to
        );
        if (response) {
          resolve(response);
        }
      };
      
      setTimeout(() => {
        checkResponse();
        resolve(null);
      }, timeout);
    });
  }

  async broadcast(from: string, payload: any, type: AgentMessageType = 'BROADCAST'): Promise<void> {
    const agent = this.agents.get(from);
    if (!agent) return;

    for (const subscriberId of agent.subscriptions) {
      const message: AgentMessage = {
        id: `${from}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        from,
        to: subscriberId,
        payload,
        timestamp: Date.now(),
        correlationId: `${from}-broadcast`,
      };
      await this.send(message);
    }
  }

  onMessage(agentId: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(agentId);
    if (handlers) {
      handlers.add(handler);
    }
  }

  offMessage(agentId: string, handler: MessageHandler): void {
    const handlers = this.handlers.get(agentId);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  getAgentStatus(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getMessageHistory(agentId?: string, limit = 100): AgentMessage[] {
    if (agentId) {
      return this.messageHistory
        .filter(m => m.from === agentId || m.to === agentId || m.to === '*')
        .slice(-limit);
    }
    return this.messageHistory.slice(-limit);
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.messageQueue.length === 0) return;
    
    this.processing = true;
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (!message) continue;

      try {
        await this.deliverMessage(message);
      } catch (error) {
        console.error('[AgentMessageBus] Error processing message:', error);
        
        const errorMessage: AgentMessage = {
          id: `error-${Date.now()}`,
          type: 'ERROR',
          from: 'system',
          to: message.from,
          payload: { error: String(error), originalMessage: message },
          timestamp: Date.now(),
          correlationId: message.id,
        };
        await this.deliverMessage(errorMessage);
      }
    }
    
    this.processing = false;
  }

  private async deliverMessage(message: AgentMessage): Promise<void> {
    const handlers = this.handlers.get(message.to);
    if (handlers) {
      for (const handler of handlers) {
        await handler(message);
      }
    }
  }

  private startProcessing(): void {
    setInterval(() => this.processQueue(), 10);
  }
}

export const messageBus = new AgentMessageBus();

export function createMessage(
  from: string,
  to: string | '*',
  type: AgentMessageType,
  payload: any,
  correlationId?: string
): AgentMessage {
  return {
    id: `${from}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    from,
    to,
    payload,
    timestamp: Date.now(),
    correlationId,
    priority: 'normal',
  };
}
