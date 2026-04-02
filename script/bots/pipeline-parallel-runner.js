#!/usr/bin/env node
/**
 * Parallel Pipeline Runner
 * 
 * Executes content generation in parallel across all content types.
 * Uses the AgentMessageBus for async communication.
 * 
 * Usage:
 *   node script/bots/pipeline-parallel-runner.js --types=question,challenge --count=5
 *   node script/bots/pipeline-parallel-runner.js --all --count=10
 */

import 'dotenv/config';
import { getDb, initBotTables } from './shared/db.js';
import { logAction } from './shared/ledger.js';
import { addToQueue } from './shared/queue.js';
import { startRun, completeRun, failRun } from './shared/runs.js';

const BOT_NAME = 'pipeline-parallel';

const CONTENT_TYPES = {
  question: {
    skill: 'content-question-expert',
    channels: ['system-design', 'algorithms', 'frontend', 'backend', 'devops', 'sre', 'database', 'security', 'ml-ai']
  },
  challenge: {
    skill: 'content-challenge-expert', 
    categories: ['arrays', 'strings', 'trees', 'graphs', 'dp', 'sorting', 'searching']
  },
  certification: {
    skill: 'content-certification-expert',
    certs: ['aws-saa', 'aws-sap', 'cka', 'ckad', 'terraform-associate']
  },
  flashcard: {
    skill: 'content-flashcard-expert',
    channels: ['javascript', 'react', 'typescript', 'python', 'aws', 'docker', 'kubernetes']
  },
  voice: {
    skill: 'content-voice-expert',
    channels: ['system-design', 'behavioral', 'technical']
  },
  blog: {
    skill: 'content-blog-expert',
    topics: ['tutorials', 'guides', 'explanations', 'comparisons']
  }
};

class ParallelPipelineRunner {
  constructor() {
    this.results = new Map();
    this.errors = new Map();
    this.activeTasks = new Map();
  }

  async runParallelGeneration(types, count, options = {}) {
    console.log(`\n${'='.repeat(60)}`);
    console.log('🚀 PARALLEL CONTENT GENERATION');
    console.log(`${'='.repeat(60)}`);
    console.log(`Types: ${types.join(', ')}`);
    console.log(`Count per type: ${count}`);
    console.log(`Parallel workers: ${types.length}`);
    console.log('');

    const startTime = Date.now();
    const tasks = types.map(type => this.generateForType(type, count, options));
    const results = await Promise.allSettled(tasks);

    const duration = Date.now() - startTime;
    
    let totalGenerated = 0;
    let totalFailed = 0;
    
    for (let i = 0; i < types.length; i++) {
      const type = types[i];
      const result = results[i];
      if (result.status === 'fulfilled') {
        totalGenerated += result.value.success;
        totalFailed += result.value.failed;
        console.log(`✅ ${type}: ${result.value.success} generated, ${result.value.failed} failed`);
      } else {
        console.log(`❌ ${type}: ${result.reason.message}`);
        totalFailed += count;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 Summary`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total generated: ${totalGenerated}`);
    console.log(`Total failed: ${totalFailed}`);
    console.log(`Duration: ${(duration / 1000).toFixed(1)}s`);
    console.log(`Throughput: ${(totalGenerated / (duration / 1000)).toFixed(2)} items/sec`);

    return { totalGenerated, totalFailed, duration };
  }

  async generateForType(type, count, options) {
    const config = CONTENT_TYPES[type];
    if (!config) {
      throw new Error(`Unknown content type: ${type}`);
    }

    const results = { success: 0, failed: 0, items: [] };
    
    const generatePromises = [];
    
    for (let i = 0; i < count; i++) {
      generatePromises.push(
        this.generateSingleItem(type, config, options).then(item => {
          results.success++;
          results.items.push(item);
        }).catch(err => {
          results.failed++;
          console.error(`Error generating ${type}: ${err.message}`);
        })
      );
    }

    await Promise.all(generatePromises);

    for (const item of results.items) {
      await this.queueForVerification(type, item);
    }

    return results;
  }

  async generateSingleItem(type, config, options) {
    let prompt;
    let params;

    switch (type) {
      case 'question':
        const channel = options.channel || config.channels[Math.floor(Math.random() * config.channels.length)];
        const difficulty = options.difficulty || ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)];
        prompt = this.buildQuestionPrompt(channel, difficulty, options.topic);
        params = { type: 'question', channel, difficulty };
        break;

      case 'challenge':
        const category = options.category || config.categories[Math.floor(Math.random() * config.categories.length)];
        const challengeDifficulty = options.difficulty || ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)];
        prompt = this.buildChallengePrompt(category, challengeDifficulty);
        params = { type: 'challenge', category, difficulty: challengeDifficulty };
        break;

      case 'certification':
        const cert = options.cert || config.certs[Math.floor(Math.random() * config.certs.length)];
        const certDifficulty = options.difficulty || 'intermediate';
        prompt = this.buildCertificationPrompt(cert, certDifficulty);
        params = { type: 'certification', certification: cert, difficulty: certDifficulty };
        break;

      case 'flashcard':
        const fcChannel = options.channel || config.channels[Math.floor(Math.random() * config.channels.length)];
        const fcDifficulty = options.difficulty || ['beginner', 'intermediate', 'advanced'][Math.floor(Math.random() * 3)];
        prompt = this.buildFlashcardPrompt(fcChannel, fcDifficulty);
        params = { type: 'flashcard', channel: fcChannel, difficulty: fcDifficulty };
        break;

      case 'voice':
        const vChannel = options.channel || config.channels[Math.floor(Math.random() * config.channels.length)];
        prompt = this.buildVoicePrompt(vChannel);
        params = { type: 'voice', channel: vChannel };
        break;

      case 'blog':
        const topic = options.topic || 'programming';
        prompt = this.buildBlogPrompt(topic);
        params = { type: 'blog', topic };
        break;

      default:
        throw new Error(`Unsupported type: ${type}`);
    }

    const { runWithRetries, parseJson } = await import('../utils.js');
    const response = await runWithRetries(prompt);
    const result = parseJson(response);

    await logAction({
      botName: BOT_NAME,
      action: 'generate',
      itemType: type,
      itemId: result?.id || `${type}-${Date.now()}`,
      afterState: params,
      reason: `Generated ${type} via parallel pipeline`
    });

    return { id: result?.id, type, data: result, params };
  }

  buildQuestionPrompt(channel, difficulty, topic) {
    return `Create 1 interview question for ${channel} at ${difficulty} level.
${topic ? `Topic: ${topic}` : ''}

Return as JSON:
{
  "id": "question-${Date.now()}",
  "channelId": "${channel}",
  "title": "6-20 words, ends with ?",
  "difficulty": "${difficulty}",
  "tags": ["${channel}"],
  "short": {
    "lead": "1 sentence hook",
    "points": ["3-6 bold key points"]
  }
}`;
  }

  buildChallengePrompt(category, difficulty) {
    return `Create 1 coding challenge at ${difficulty} level in ${category}.

Return as JSON:
{
  "id": "challenge-${Date.now()}",
  "title": "Problem title",
  "difficulty": "${difficulty}",
  "category": "${category}",
  "description": "Problem statement",
  "starterCode": {
    "javascript": "function solution() {}",
    "typescript": "function solution(): void {}",
    "python": "def solution(): pass"
  },
  "solution": {
    "javascript": "complete solution",
    "typescript": "complete solution", 
    "python": "complete solution"
  },
  "testCases": [
    { "input": "test input", "expected": "expected output" }
  ]
}`;
  }

  buildCertificationPrompt(cert, difficulty) {
    return `Create 1 ${cert} certification question at ${difficulty} level.

Return as JSON:
{
  "id": "cert-${Date.now()}",
  "certificationId": "${cert}",
  "domain": "relevant domain",
  "question": "Scenario-based question",
  "options": [
    { "id": "a", "text": "Option A", "isCorrect": false },
    { "id": "b", "text": "Option B", "isCorrect": true },
    { "id": "c", "text": "Option C", "isCorrect": false },
    { "id": "d", "text": "Option D", "isCorrect": false }
  ],
  "explanation": "Why the correct answer",
  "difficulty": "${difficulty}"
}`;
  }

  buildFlashcardPrompt(channel, difficulty) {
    return `Create 1 flashcard for ${channel} at ${difficulty} level.

Return as JSON:
{
  "id": "fc-${Date.now()}",
  "channelId": "${channel}",
  "front": "Question under 15 words?",
  "back": "Answer 40-120 words with explanation",
  "difficulty": "${difficulty}",
  "tags": ["${channel}"]
}`;
  }

  buildVoicePrompt(channel) {
    return `Create 1 voice practice prompt for ${channel} interviews.

Return as JSON:
{
  "id": "voice-${Date.now()}",
  "channelId": "${channel}",
  "title": "Practice topic",
  "type": "technical",
  "prompt": "Question to answer verbally",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "followUpQuestions": ["follow up 1", "follow up 2"]
}`;
  }

  buildBlogPrompt(topic) {
    return `Create 1 blog post about ${topic}.

Return as JSON:
{
  "id": "blog-${Date.now()}",
  "title": "Compelling title",
  "slug": "url-friendly-slug",
  "excerpt": "150-160 character excerpt",
  "content": "Full content",
  "type": "explanation",
  "tags": ["${topic}"],
  "seo": {
    "metaTitle": "50-60 char title",
    "metaDescription": "150-160 char description",
    "keywords": ["keyword1", "keyword2"]
  }
}`;
  }

  async queueForVerification(type, item) {
    await addToQueue({
      itemType: type,
      itemId: item.id,
      action: 'verify',
      priority: 3,
      createdBy: BOT_NAME,
      assignedTo: 'verifier'
    });
  }
}

async function main() {
  console.log('=== 🤖 Parallel Pipeline Runner ===\n');
  
  await initBotTables();
  
  const run = await startRun(BOT_NAME);

  try {
    const args = process.argv.slice(2);
    const getArg = (name) => {
      const arg = args.find(a => a.startsWith(`--${name}=`));
      return arg ? arg.split('=')[1] : null;
    };

    let types = getArg('types')?.split(',') || ['question'];
    const count = parseInt(getArg('count') || '1');
    const allTypes = getArg('all');

    if (allTypes) {
      types = Object.keys(CONTENT_TYPES);
    }

    const options = {
      channel: getArg('channel'),
      category: getArg('category'),
      cert: getArg('cert'),
      topic: getArg('topic'),
      difficulty: getArg('difficulty')
    };

    const runner = new ParallelPipelineRunner();
    const { totalGenerated, totalFailed, duration } = await runner.runParallelGeneration(types, count, options);

    await completeRun(run.id, { 
      processed: totalGenerated + totalFailed,
      created: totalGenerated,
      failed: totalFailed 
    }, { duration, types });

    console.log('\n✅ Pipeline completed successfully');
    process.exit(0);

  } catch (error) {
    console.error('Fatal error:', error);
    await failRun(run.id, error);
    process.exit(1);
  }
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  main().catch(console.error);
}

export { ParallelPipelineRunner };
export default { ParallelPipelineRunner };
