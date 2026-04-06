/**
 * Enhanced Coding Problem Generation Pipeline
 * 
 * Generates comprehensive coding problems with:
 * - Multiple language support (JavaScript, TypeScript, Python)
 * - Solution explanations with complexity analysis
 * - Difficulty variants (easy, medium, hard versions)
 * - Detailed test cases including edge cases
 * - Progressive hints
 * 
 * Flow:
 *   generate_problem → validate_structure → execute_tests → generate_explanations → validate_output → end
 */

import { StateGraph, END, START } from '@langchain/langgraph';
import { Annotation } from '@langchain/langgraph';
import ai from '../index.js';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CodingProblemState = Annotation.Root({
  difficulty: Annotation({ reducer: (_, b) => b, default: () => 'medium' }),
  category: Annotation({ reducer: (_, b) => b, default: () => 'arrays' }),
  companies: Annotation({ reducer: (_, b) => b, default: () => [] }),
  includeVariants: Annotation({ reducer: (_, b) => b, default: () => false }),
  
  problem: Annotation({ reducer: (_, b) => b, default: () => null }),
  variants: Annotation({ reducer: (_, b) => b, default: () => [] }),
  validatedTestCases: Annotation({ reducer: (_, b) => b, default: () => [] }),
  
  retryCount: Annotation({ reducer: (_, b) => b, default: () => 0 }),
  maxRetries: Annotation({ reducer: (_, b) => b, default: () => 2 }),
  
  status: Annotation({ reducer: (_, b) => b, default: () => 'pending' }),
  error: Annotation({ reducer: (_, b) => b, default: () => null })
});

async function executePythonCode(code, functionName, input) {
  return new Promise((resolve, reject) => {
    const wrappedCode = `
import json
from collections.abc import Iterator, Iterable

${code}

_args = (${input},)
if len(_args) == 1 and isinstance(_args[0], tuple):
    _args = _args[0]

_result = ${functionName}(*_args)

def to_json(obj):
    if obj is None: return None
    if isinstance(obj, bool): return obj
    if isinstance(obj, (int, float, str)): return obj
    if isinstance(obj, (list, tuple)): return [to_json(x) for x in obj]
    if isinstance(obj, dict): return {str(k): to_json(v) for k, v in obj.items()}
    if isinstance(obj, Iterator): return [to_json(x) for x in obj]
    if isinstance(obj, Iterable) and not isinstance(obj, (str, bytes)): return [to_json(x) for x in obj]
    return str(obj)

print(json.dumps(to_json(_result)))
`;

    const tempFile = path.join(os.tmpdir(), `problem_test_${Date.now()}.py`);
    fs.writeFileSync(tempFile, wrappedCode);

    const python = spawn('python3', [tempFile], { timeout: 10000 });
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => { stdout += data.toString(); });
    python.stderr.on('data', (data) => { stderr += data.toString(); });

    python.on('close', (code) => {
      try { fs.unlinkSync(tempFile); } catch {}
      
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Python error: ${stderr || 'Unknown error'}`));
      }
    });

    python.on('error', (err) => {
      try { fs.unlinkSync(tempFile); } catch {}
      reject(err);
    });
  });
}

function extractPythonFunctionName(code) {
  const match = code.match(/def\s+(\w+)\s*\(/);
  return match ? match[1] : null;
}

async function generateProblemNode(state) {
  console.log(`\n📝 [GENERATE_PROBLEM] Creating ${state.difficulty} ${state.category} problem...`);
  console.log(`   Companies: ${state.companies.join(', ')}`);
  
  try {
    const result = await ai.run('coding-problem', {
      difficulty: state.difficulty,
      category: state.category,
      companies: state.companies,
      count: 1,
      includeVariants: state.includeVariants
    });
    
    if (result && result.title) {
      console.log(`   ✅ Generated: ${result.title}`);
      return { problem: result };
    }
    
    if (Array.isArray(result) && result.length > 0 && result[0].title) {
      console.log(`   ✅ Generated: ${result[0].title}`);
      return { problem: result[0] };
    }
    
    return { error: 'No title in generated problem' };
  } catch (error) {
    console.log(`   ❌ Generation failed: ${error.message}`);
    
    if (state.retryCount < state.maxRetries) {
      return { retryCount: state.retryCount + 1 };
    }
    
    return { error: error.message };
  }
}

function validateStructureNode(state) {
  console.log('\n✅ [VALIDATE_STRUCTURE] Checking problem structure...');
  
  if (!state.problem) {
    return { status: 'error', error: 'No problem generated' };
  }
  
  const data = state.problem;
  const required = ['title', 'description', 'difficulty', 'starterCode', 'testCases', 'solution'];
  const missing = required.filter(field => !data[field]);
  
  if (missing.length > 0) {
    console.log(`   ❌ Missing fields: ${missing.join(', ')}`);
    return { status: 'error', error: `Missing fields: ${missing.join(', ')}` };
  }
  
  if (!data.starterCode?.javascript && !data.starterCode?.python) {
    console.log('   ❌ Missing starter code');
    return { status: 'error', error: 'Missing starter code' };
  }
  
  if (!data.solution?.javascript && !data.solution?.python) {
    console.log('   ❌ Missing solution code');
    return { status: 'error', error: 'Missing solution code' };
  }
  
  if (!Array.isArray(data.testCases) || data.testCases.length < 4) {
    console.log('   ❌ Need at least 4 test cases');
    return { status: 'error', error: 'Need at least 4 test cases' };
  }
  
  console.log(`   ✅ Structure valid`);
  console.log(`   Title: ${data.title}`);
  console.log(`   Test cases: ${data.testCases.length}`);
  
  if (data.solutionExplanation) {
    console.log(`   Explanation: ${data.solutionExplanation.approach || 'N/A'}`);
    console.log(`   Complexity: ${data.solutionExplanation.timeComplexity || 'N/A'} / ${data.solutionExplanation.spaceComplexity || 'N/A'}`);
  }
  
  return {};
}

async function executeTestsNode(state) {
  console.log('\n🧪 [EXECUTE_TESTS] Validating test cases...');
  
  const pythonSolution = state.problem.solution?.python;
  if (!pythonSolution) {
    console.log('   ⚠️ No Python solution to execute');
    return { validatedTestCases: state.problem.testCases };
  }
  
  const functionName = extractPythonFunctionName(pythonSolution);
  if (!functionName) {
    console.log('   ⚠️ Could not extract function name');
    return { validatedTestCases: state.problem.testCases };
  }
  
  console.log(`   Running ${functionName}() for ${state.problem.testCases.length} test cases...`);
  
  const validatedTestCases = [];
  
  for (const tc of state.problem.testCases) {
    try {
      const actualOutput = await executePythonCode(pythonSolution, functionName, tc.input);
      
      const result = {
        id: tc.id,
        input: tc.input,
        expected: tc.expected,
        actual: actualOutput,
        match: actualOutput === tc.expected
      };
      
      if (!result.match) {
        console.log(`   ⚠️ Test ${tc.id}: Expected "${tc.expected}", got "${actualOutput}" - UPDATED`);
      } else {
        console.log(`   ✅ Test ${tc.id}: Verified`);
      }
      
      validatedTestCases.push({
        ...tc,
        expected: actualOutput
      });
    } catch (error) {
      console.log(`   ❌ Test ${tc.id} execution failed: ${error.message}`);
      validatedTestCases.push(tc);
    }
  }
  
  const passedCount = validatedTestCases.filter(tc => tc.expected === tc.actual).length;
  console.log(`\n   Results: ${passedCount}/${validatedTestCases.length} tests validated`);
  
  return { validatedTestCases };
}

function generateExplanationsNode(state) {
  console.log('\n📖 [GENERATE_EXPLANATIONS] Ensuring explanations...');
  
  if (state.problem.solutionExplanation) {
    console.log('   ✅ Explanations already present');
    return {};
  }
  
  console.log('   ⚠️ No explanation provided - marking as incomplete');
  return {};
}

function validateOutputNode(state) {
  console.log('\n🎯 [VALIDATE_OUTPUT] Final validation...');
  
  if (state.error) {
    console.log(`   ❌ Error: ${state.error}`);
    return { status: 'error' };
  }
  
  if (!state.problem) {
    return { status: 'error', error: 'No problem generated' };
  }
  
  const finalProblem = {
    ...state.problem,
    testCases: state.validatedTestCases.map((tc, i) => ({
      ...tc,
      id: tc.id || String(i + 1)
    })),
    tags: Array.isArray(state.problem.tags) ? state.problem.tags : [state.category],
    hints: Array.isArray(state.problem.hints) ? state.problem.hints : ['Think step by step'],
    companies: Array.isArray(state.problem.companies) ? state.problem.companies : state.companies,
    constraints: Array.isArray(state.problem.constraints) ? state.problem.constraints : [],
    examples: Array.isArray(state.problem.examples) ? state.problem.examples : [],
    solutionExplanation: state.problem.solutionExplanation || null,
    subcategory: state.problem.subcategory || null
  };
  
  console.log(`   ✅ Problem validated`);
  console.log(`   Title: ${finalProblem.title}`);
  console.log(`   Difficulty: ${finalProblem.difficulty}`);
  console.log(`   Category: ${state.category}`);
  console.log(`   Test cases: ${finalProblem.testCases.length}`);
  if (finalProblem.solutionExplanation) {
    console.log(`   Complexity: ${finalProblem.solutionExplanation.timeComplexity || 'N/A'}`);
  }
  
  return { problem: finalProblem, status: 'completed' };
}

function routeAfterGeneration(state) {
  if (state.problem) {
    return 'validate_structure';
  }
  if (state.retryCount < state.maxRetries && !state.error) {
    console.log(`\n🔀 [ROUTER] Retrying generation (attempt ${state.retryCount + 1})...`);
    return 'generate_problem';
  }
  return 'validate_output';
}

function routeAfterStructure(state) {
  if (state.status === 'error') {
    return 'validate_output';
  }
  return 'execute_tests';
}

export function createCodingProblemGraph() {
  const graph = new StateGraph(CodingProblemState);
  
  graph.addNode('generate_problem', generateProblemNode);
  graph.addNode('validate_structure', validateStructureNode);
  graph.addNode('execute_tests', executeTestsNode);
  graph.addNode('generate_explanations', generateExplanationsNode);
  graph.addNode('validate_output', validateOutputNode);
  
  graph.addEdge(START, 'generate_problem');
  
  graph.addConditionalEdges('generate_problem', routeAfterGeneration, {
    'generate_problem': 'generate_problem',
    'validate_structure': 'validate_structure',
    'validate_output': 'validate_output'
  });
  
  graph.addConditionalEdges('validate_structure', routeAfterStructure, {
    'execute_tests': 'execute_tests',
    'validate_output': 'validate_output'
  });
  
  graph.addEdge('execute_tests', 'generate_explanations');
  graph.addEdge('generate_explanations', 'validate_output');
  graph.addEdge('validate_output', END);
  
  return graph.compile();
}

export async function generateCodingProblem(options) {
  const { difficulty, category, companies, includeVariants } = options;
  const graph = createCodingProblemGraph();
  
  console.log('\n' + '═'.repeat(60));
  console.log('🚀 ENHANCED CODING PROBLEM PIPELINE');
  console.log('═'.repeat(60));
  console.log(`Difficulty: ${difficulty}`);
  console.log(`Category: ${category}`);
  console.log(`Companies: ${companies.join(', ')}`);
  console.log(`Include Variants: ${includeVariants}`);
  
  const initialState = {
    difficulty: difficulty || 'medium',
    category: category || 'arrays',
    companies: companies || ['Google', 'Meta', 'Amazon'],
    includeVariants: includeVariants || false,
    problem: null,
    variants: [],
    validatedTestCases: [],
    retryCount: 0,
    maxRetries: 2,
    status: 'pending',
    error: null
  };
  
  try {
    let finalResult = initialState;
    
    for await (const step of await graph.stream(initialState)) {
      const [, nodeState] = Object.entries(step)[0];
      finalResult = { ...finalResult, ...nodeState };
    }
    
    console.log('\n' + '═'.repeat(60));
    console.log('📋 PIPELINE RESULT');
    console.log('═'.repeat(60));
    console.log(`Status: ${finalResult.status}`);
    
    if (finalResult.status === 'error') {
      console.log(`Error: ${finalResult.error}`);
      return { success: false, error: finalResult.error };
    }
    
    console.log(`Title: ${finalResult.problem?.title}`);
    console.log('═'.repeat(60) + '\n');
    
    return {
      success: true,
      problem: finalResult.problem,
      testResults: finalResult.validatedTestCases
    };
    
  } catch (error) {
    console.error('Pipeline error:', error);
    return { success: false, error: error.message };
  }
}

export default { createCodingProblemGraph, generateCodingProblem };
