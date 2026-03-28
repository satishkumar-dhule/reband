/**
 * Skill Agent Base - Foundation for all 20 specialized skill agents
 * Implements async message passing and skill execution
 */

import { messageBus, createMessage, type AgentMessage, type AgentMessageType } from '../core/AgentMessageBus';

export type SkillCategory = 
  | 'learning'
  | 'practice'
  | 'analytics'
  | 'content'
  | 'user';

export interface Skill {
  name: string;
  description: string;
  execute: (context: SkillContext) => Promise<SkillResult>;
  category: SkillCategory;
}

export interface SkillContext {
  userId: string;
  channelId?: string;
  questionId?: string;
  data?: Record<string, unknown>;
  messageBus: typeof messageBus;
}

export interface SkillResult {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

export interface AgentSkillConfig {
  id: string;
  name: string;
  description: string;
  category: SkillCategory;
  capabilities: string[];
}

abstract class BaseSkillAgent {
  protected id: string;
  protected name: string;
  protected description: string;
  protected category: SkillCategory;
  protected capabilities: string[];
  protected status: 'idle' | 'processing' | 'completed' | 'error' = 'idle';
  protected lastResult?: SkillResult;

  constructor(config: AgentSkillConfig) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.category = config.category;
    this.capabilities = config.capabilities;
  }

  abstract execute(context: SkillContext): Promise<SkillResult>;

  async handleMessage(message: AgentMessage): Promise<void> {
    if (message.type === 'REQUEST') {
      this.status = 'processing';
      try {
        const context: SkillContext = {
          userId: message.payload.userId || 'anonymous',
          channelId: message.payload.channelId,
          questionId: message.payload.questionId,
          data: message.payload.data,
          messageBus,
        };
        
        const result = await this.execute(context);
        this.lastResult = result;
        this.status = 'completed';

        const response = createMessage(
          this.id,
          message.from,
          'RESPONSE',
          {
            originalMessageId: message.id,
            result,
          },
          message.id
        );
        
        await messageBus.send(response);
      } catch (error) {
        this.status = 'error';
        const errorResult: SkillResult = {
          success: false,
          error: String(error),
        };
        this.lastResult = errorResult;

        const errorMessage = createMessage(
          this.id,
          message.from,
          'ERROR',
          {
            originalMessageId: message.id,
            error: String(error),
          },
          message.id
        );
        
        await messageBus.send(errorMessage);
      }
    }
  }

  getStatus() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      category: this.category,
      capabilities: this.capabilities,
      status: this.status,
      lastResult: this.lastResult,
    };
  }
}

export { BaseSkillAgent };
