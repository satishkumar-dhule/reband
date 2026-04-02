#!/usr/bin/env node

import { DevPrepDevAgent } from './index';
import type { TaskInput } from './task-parser';

const devAgent = new DevPrepDevAgent();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    printHelp();
    process.exit(0);
  }

  const command = args[0];
  
  switch (command) {
    case 'run':
      await handleRun(args.slice(1));
      break;
    case 'preview':
      await handlePreview(args.slice(1));
      break;
    case 'fix':
      await handleRun(args.slice(1), 'bugfix');
      break;
    case 'feature':
      await handleRun(args.slice(1), 'feature');
      break;
    case 'refactor':
      await handleRun(args.slice(1), 'refactor');
      break;
    case 'test':
      await handleRun(args.slice(1), 'test');
      break;
    case 'help':
      printHelp();
      break;
    default:
      if (command.startsWith('-')) {
        printHelp();
      } else {
        await handleRun(args);
      }
  }
}

async function handleRun(taskArgs: string[], forceType?: string) {
  const options: string[] = [];
  let taskDescription = '';

  for (const arg of taskArgs) {
    if (arg.startsWith('--')) {
      options.push(arg);
    } else {
      taskDescription = arg;
    }
  }

  if (!taskDescription) {
    console.error('Error: Please provide a task description');
    console.log('Usage: npx tsx cli.ts run "Add dark mode to settings"');
    process.exit(1);
  }

  if (forceType) {
    taskDescription = `[${forceType}] ${taskDescription}`;
  }

  console.log('\n🔧 DevPrep AI Development Agent');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`Task: ${taskDescription}\n`);

  const taskInput: TaskInput = {
    type: 'text',
    content: taskDescription,
  };

  if (options.includes('--dry-run')) {
    const preview = await devAgent.previewTask(taskInput);
    console.log('📋 Task Preview:');
    console.log(`   Type: ${preview.task.type}`);
    console.log(`   Priority: ${preview.task.priority}`);
    console.log(`   Target files: ${preview.targetFiles.length > 0 ? preview.targetFiles.join(', ') : 'Auto-detect'}`);
    console.log(`   Estimated changes: ~${preview.estimatedChanges} files\n`);
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('⚠️  Warning: ANTHROPIC_API_KEY not set');
    console.log('   Set it with: export ANTHROPIC_API_KEY=your-key');
    console.log('   Or add it to your .env file\n');
  }

  console.log('⏳ Generating code...\n');

  const startTime = Date.now();
  const result = await devAgent.executeTask(taskInput);
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  if (result.success) {
    console.log('✅ Code generation successful!\n');
    console.log(`📁 Generated ${result.changes?.length || 0} file(s)`);
    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`🆔 Task ID: ${result.taskId}\n`);

    if (result.changes && result.changes.length > 0) {
      console.log('📝 Changes:');
      for (const change of result.changes) {
        console.log(`   ${change.action === 'create' ? '✨' : '📝'} ${change.path}`);
        if (change.reason) {
          console.log(`      └─ ${change.reason}`);
        }
      }
    }

    if (result.explanations && result.explanations.length > 0) {
      console.log('\n📖 Explanations:');
      for (const explanation of result.explanations) {
        console.log(`   • ${explanation}`);
      }
    }

    if (result.warnings && result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      for (const warning of result.warnings) {
        console.log(`   • ${warning}`);
      }
    }

    console.log('\n💡 To apply changes locally, run:');
    console.log(`   npx tsx src/agents/dev-agent/cli.ts apply ${result.taskId}`);
    console.log('\n🔒 All changes require human review before merging.\n');

  } else {
    console.log('❌ Code generation failed.\n');
    console.log(`⏱️  Duration: ${duration}s\n`);
    console.log('🚫 Errors:');
    for (const error of result.errors) {
      console.log(`   • ${error}`);
    }
    if (result.safetyWarnings && result.safetyWarnings.length > 0) {
      console.log('\n⚠️  Safety Warnings:');
      for (const warning of result.safetyWarnings) {
        console.log(`   • ${warning.message}`);
      }
    }
    process.exit(1);
  }
}

async function handlePreview(taskArgs: string[]) {
  const taskDescription = taskArgs.join(' ');
  
  if (!taskDescription) {
    console.error('Error: Please provide a task description');
    console.log('Usage: npx tsx src/agents/dev-agent/cli.ts preview "Add dark mode"');
    process.exit(1);
  }

  const taskInput: TaskInput = {
    type: 'text',
    content: taskDescription,
  };

  console.log('\n📋 Task Preview\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const preview = await devAgent.previewTask(taskInput);

  console.log(`Task: ${preview.task.title}\n`);
  console.log(`Type: ${preview.task.type}`);
  console.log(`Priority: ${preview.task.priority}`);
  console.log(`Description: ${preview.task.description.substring(0, 100)}...`);
  console.log('\nConstraints:');
  console.log(`   • No breaking changes: ${preview.task.constraints.noBreakingChanges ? '✅' : '❌'}`);
  console.log(`   • Tests required: ${preview.task.constraints.testRequired ? '✅' : '❌'}`);
  console.log(`   • Backward compatible: ${preview.task.constraints.backwardCompatible ? '✅' : '❌'}`);
  console.log('\nTarget Files:');
  if (preview.targetFiles.length > 0) {
    for (const file of preview.targetFiles) {
      console.log(`   • ${file}`);
    }
  } else {
    console.log('   (Auto-detect from codebase)');
  }
  console.log(`\nEstimated Changes: ~${preview.estimatedChanges} files\n`);
}

function printHelp() {
  console.log(`
🔧 DevPrep AI Development Agent CLI

USAGE
  npx tsx src/agents/dev-agent/cli.ts <command> [options]

COMMANDS
  run <description>       Generate code for a task
  fix <description>      Generate a bug fix
  feature <description>  Generate a new feature
  refactor <description> Refactor existing code
  test <description>     Add or update tests
  preview <description>  Preview task analysis
  help                   Show this help message

OPTIONS
  --dry-run              Preview without generating code

EXAMPLES
  # Generate code for a feature
  npx tsx src/agents/dev-agent/cli.ts run "Add dark mode toggle to settings"

  # Preview a bug fix
  npx tsx src/agents/dev-agent/cli.ts preview "Fix login timeout issue"

  # Generate a refactor
  npx tsx src/agents/dev-agent/cli.ts refactor "Extract reusable Button component"

  # Dry run (preview only)
  npx tsx src/agents/dev-agent/cli.ts run "Add user profile page" --dry-run

SAFETY
  • All code is generated via Claude AI
  • Changes require human review before merging
  • Forbidden patterns are automatically blocked
  • No direct main branch modifications

For more information, see:
  docs/superpowers/specs/2026-03-28-ai-development-agent-design.md
`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
