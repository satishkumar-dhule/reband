// Agent Message Bus - ULTRA PRO MAX Performance Version
// Coordinates 30 specialized agents through optimized asynchronous message passing

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
  priority?: 'low' | 'normal' | 'high' | 'critical' | 'medium';
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

interface PendingResponse {
  resolve: (msg: AgentMessage | null) => void;
  reject: (error: Error) => void;
  timeoutId: number;
}

interface PerformanceMetrics {
  messagesProcessed: number;
  messagesSent: number;
  averageProcessingTime: number;
  queueDepth: number;
  lastProcessTime: number;
}

class AgentMessageBus {
  private agents: Map<string, Agent> = new Map();
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private messageQueue: AgentMessage[] = [];
  private processing = false;
  private messageHistory: AgentMessage[] = [];
  private maxHistory = 1000;
  
  private pendingResponses: Map<string, PendingResponse> = new Map();
  private messageIndex: Map<string, number> = new Map();
  
  private metrics: PerformanceMetrics = {
    messagesProcessed: 0,
    messagesSent: 0,
    averageProcessingTime: 0,
    queueDepth: 0,
    lastProcessTime: 0,
  };
  
  private processInterval: number | null = null;
  private batchSize = 50;
  private processDelay = 50;

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
    this.messageQueue.push(message);
    this.messageIndex.set(message.id, this.messageHistory.length);
    this.messageHistory.push(message);
    
    if (this.messageHistory.length > this.maxHistory) {
      const removed = this.messageHistory.shift();
      if (removed) {
        this.messageIndex.delete(removed.id);
      }
    }
    
    this.metrics.messagesSent++;
    this.metrics.queueDepth = this.messageQueue.length;
  }

  async sendAndWait(message: AgentMessage, timeout = 5000): Promise<AgentMessage | null> {
    await this.send(message);
    
    const correlationKey = `${message.id}-${message.to}`;
    
    return new Promise((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.pendingResponses.delete(correlationKey);
        resolve(null);
      }, timeout);
      
      this.pendingResponses.set(correlationKey, { resolve, reject, timeoutId });
      
      this.resolvePendingResponse(message);
    });
  }
  
  private resolvePendingResponse(message: AgentMessage): void {
    if (!message.correlationId) return;
    
    const correlationKey = `${message.correlationId}-${message.to}`;
    const pending = this.pendingResponses.get(correlationKey);
    
    if (pending) {
      clearTimeout(pending.timeoutId);
      this.pendingResponses.delete(correlationKey);
      pending.resolve(message);
    }
  }

  async broadcast(from: string, payload: any, type: AgentMessageType = 'BROADCAST'): Promise<void> {
    const agent = this.agents.get(from);
    if (!agent) return;

    const subscribers = Array.from(agent.subscriptions);
    const messages: AgentMessage[] = [];
    
    const now = Date.now();
    for (const subscriberId of subscribers) {
      messages.push({
        id: `${from}-${now}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        from,
        to: subscriberId,
        payload,
        timestamp: now,
        correlationId: `${from}-broadcast`,
      });
    }
    
    for (const msg of messages) {
      this.messageQueue.push(msg);
      this.messageHistory.push(msg);
    }
    
    if (this.messageHistory.length > this.maxHistory) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistory);
    }
    
    this.metrics.messagesSent += messages.length;
  }

  onMessage(agentId: string, handler: MessageHandler): void {
    let handlers = this.handlers.get(agentId);
    if (!handlers) {
      handlers = new Set();
      this.handlers.set(agentId, handlers);
    }
    handlers.add(handler);
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
  
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.messageQueue.length === 0) return;
    
    this.processing = true;
    const startTime = performance.now();
    
    const batch = this.messageQueue.splice(0, this.batchSize);
    
    const deliveryPromises: Promise<void>[] = [];
    
    for (const message of batch) {
      deliveryPromises.push(
        this.deliverMessage(message).catch(error => {
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
          return this.deliverMessage(errorMessage);
        })
      );
      
      this.resolvePendingResponse(message);
    }
    
    await Promise.all(deliveryPromises);
    
    const processTime = performance.now() - startTime;
    this.metrics.messagesProcessed += batch.length;
    this.metrics.lastProcessTime = processTime;
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * 0.9) + (processTime * 0.1);
    this.metrics.queueDepth = this.messageQueue.length;
    
    this.processing = false;
  }

  private async deliverMessage(message: AgentMessage): Promise<void> {
    const handlers = this.handlers.get(message.to);
    if (handlers && handlers.size > 0) {
      const handlerArray = Array.from(handlers);
      const handlerPromises: Promise<void>[] = handlerArray.map(handler => 
        Promise.resolve(handler(message))
      );
      await Promise.all(handlerPromises);
    }
  }

  private startProcessing(): void {
    if (this.processInterval) return;
    
    const runLoop = () => {
      this.processQueue();
      this.processInterval = window.setTimeout(runLoop, this.processDelay);
    };
    
    runLoop();
  }
  
  stopProcessing(): void {
    if (this.processInterval) {
      clearTimeout(this.processInterval);
      this.processInterval = null;
    }
  }
  
  setBatchSize(size: number): void {
    this.batchSize = Math.max(1, Math.min(size, 100));
  }
  
  setProcessDelay(delay: number): void {
    this.processDelay = Math.max(10, Math.min(delay, 500));
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
