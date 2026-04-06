/**
 * Mock Exam Generation Pipeline
 * 
 * Generates structured mock exams with:
 * - Domain-weighted question pools
 * - Time limits and passing scores
 * - Detailed explanations
 * - Real exam simulation
 * 
 * Flow:
 *   plan_exam → generate_questions → assemble_exam → validate → finalize
 */

import { StateGraph, END, START } from '@langchain/langgraph';
import { Annotation } from '@langchain/langgraph';
import ai from '../index.js';
import { certificationDomains } from '../prompts/templates/certification-question.js';
import { examTypes } from '../prompts/templates/mock-exam.js';

/**
 * State schema for mock exam generation
 */
const MockExamState = Annotation.Root({
  certificationId: Annotation({ reducer: (_, b) => b, default: () => '' }),
  examType: Annotation({ reducer: (_, b) => b, default: () => 'full-length' }),
  difficulty: Annotation({ reducer: (_, b) => b, default: () => 'intermediate' }),
  domain: Annotation({ reducer: (_, b) => b, default: () => '' }),
  targetQuestionCount: Annotation({ reducer: (_, b) => b, default: () => 65 }),
  targetTimeLimit: Annotation({ reducer: (_, b) => b, default: () => 130 }),
  passingScore: Annotation({ reducer: (_, b) => b, default: () => 72 }),
  
  domainPlan: Annotation({ reducer: (_, b) => b, default: () => [] }),
  generatedQuestions: Annotation({ reducer: (_, b) => b, default: () => [] }),
  
  exam: Annotation({ reducer: (_, b) => b, default: () => null }),
  status: Annotation({ reducer: (_, b) => b, default: () => 'pending' }),
  error: Annotation({ reducer: (_, b) => b, default: () => null }),
  retryCount: Annotation({ reducer: (_, b) => b, default: () => 0 }),
  maxRetries: Annotation({ reducer: (_, b) => b, default: () => 2 })
});

/**
 * Node: Plan exam structure based on type and certification
 */
function planExamNode(state) {
  console.log('\n📋 [PLAN_EXAM] Designing exam structure...');
  
  const typeConfig = examTypes[state.examType] || examTypes['full-length'];
  const domains = certificationDomains[state.certificationId] || [];
  
  if (domains.length === 0) {
    return { 
      error: `Unknown certification: ${state.certificationId}`,
      status: 'error'
    };
  }
  
  let questionCount = state.targetQuestionCount || typeConfig.questionCount;
  let timeLimit = state.targetTimeLimit || typeConfig.timeLimit;
  
  // Domain-focused exam
  if (state.examType === 'domain-focused' && state.domain) {
    const targetDomain = domains.find(d => d.id === state.domain);
    if (!targetDomain) {
      return { error: `Domain not found: ${state.domain}`, status: 'error' };
    }
    
    const domainPlan = [{
      id: targetDomain.id,
      name: targetDomain.name,
      weight: 100,
      questionCount: questionCount,
      percentage: 100
    }];
    
    console.log(`   Exam Type: Domain Focus - ${targetDomain.name}`);
    return { domainPlan, targetQuestionCount: questionCount, targetTimeLimit: timeLimit };
  }
  
  // Full-length or mixed exam - distribute questions by domain weight
  const domainPlan = domains.map(d => {
    const qCount = Math.round(questionCount * (d.weight / 100));
    return {
      id: d.id,
      name: d.name,
      weight: d.weight,
      questionCount: qCount,
      percentage: d.weight
    };
  }).filter(d => d.questionCount > 0);
  
  // Recalculate total to match target
  const totalQuestions = domainPlan.reduce((sum, d) => sum + d.questionCount, 0);
  if (domainPlan.length > 0 && domainPlan[0]) {
    domainPlan[0].questionCount += (questionCount - totalQuestions);
  }
  
  console.log(`   Exam Type: ${typeConfig.name}`);
  console.log(`   Questions: ${questionCount}, Time: ${timeLimit} min`);
  console.log('   Domain Distribution:');
  domainPlan.forEach(d => {
    console.log(`     - ${d.name}: ${d.questionCount} questions (${d.weight}%)`);
  });
  
  return { 
    domainPlan,
    targetQuestionCount: questionCount,
    targetTimeLimit: timeLimit,
    passingScore: state.passingScore || typeConfig.passingScore || 72
  };
}

/**
 * Node: Generate questions for each domain
 */
async function generateQuestionsNode(state) {
  console.log('\n📝 [GENERATE_QUESTIONS] Creating exam questions...');
  
  const allQuestions = [];
  const domainCount = state.domainPlan?.length || 1;
  
  // For efficiency, generate all questions in one batch if possible
  const prompt = buildExamQuestionsPrompt(state);
  
  try {
    const questions = await ai.run('certification-question', {
      certificationId: state.certificationId,
      domain: state.domain || 'all',
      difficulty: state.difficulty,
      count: state.targetQuestionCount
    });
    
    if (Array.isArray(questions) && questions.length > 0) {
      // Distribute questions across domains
      const distributed = distributeQuestions(questions, state.domainPlan, state.certificationId);
      allQuestions.push(...distributed);
      console.log(`   ✅ Generated ${allQuestions.length} questions across ${domainCount} domain(s)`);
    } else if (questions && typeof questions === 'object' && questions.question) {
      allQuestions.push({
        ...questions,
        id: `${state.certificationId}-${Date.now()}-0`,
        certificationId: state.certificationId
      });
    }
    
    if (allQuestions.length === 0) {
      throw new Error('No questions generated');
    }
    
    return { generatedQuestions: allQuestions };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    
    if (state.retryCount < state.maxRetries) {
      return { retryCount: state.retryCount + 1 };
    }
    
    return { error: error.message, status: 'error' };
  }
}

/**
 * Build prompt for question generation
 */
function buildExamQuestionsPrompt(state) {
  const typeConfig = examTypes[state.examType] || examTypes['full-length'];
  const domains = certificationDomains[state.certificationId] || [];
  
  let domainContext = '';
  if (state.domainPlan && state.domainPlan.length > 0) {
    domainContext = '\nDomain Distribution:\n';
    state.domainPlan.forEach(d => {
      domainContext += `- ${d.name}: ${d.questionCount} questions\n`;
    });
  }
  
  return `Generate ${state.targetQuestionCount} certification exam questions for ${state.certificationId.toUpperCase()}.

Exam Type: ${typeConfig.name}
Difficulty: ${state.difficulty}
Time Limit: ${state.targetTimeLimit} minutes
Passing Score: ${state.passingScore}%

Requirements:
- Scenario-based questions testing practical knowledge
- Exactly 4 options with ONE correct answer
- Detailed explanations for all options
- Real-world context and business scenarios
- Difficulty distribution: Easy 20%, Medium 50%, Hard 30%
${domainContext}

Return as JSON array matching certification question schema.`;
}

/**
 * Distribute questions across domains
 */
function distributeQuestions(questions, domainPlan, certificationId) {
  if (!domainPlan || domainPlan.length === 0) {
    return questions.map((q, i) => ({
      ...q,
      id: `${certificationId}-exam-${Date.now()}-${i}`,
      certificationId
    }));
  }
  
  let questionIndex = 0;
  const distributed = [];
  
  for (const domain of domainPlan) {
    for (let i = 0; i < domain.questionCount && questionIndex < questions.length; i++) {
      const q = questions[questionIndex];
      distributed.push({
        ...q,
        id: `${certificationId}-${domain.id}-${Date.now()}-${i}`,
        certificationId,
        domain: domain.id,
        domainName: domain.name
      });
      questionIndex++;
    }
  }
  
  return distributed;
}

/**
 * Node: Assemble exam structure
 */
function assembleExamNode(state) {
  console.log('\n🔧 [ASSEMBLE_EXAM] Building exam structure...');
  
  if (!state.generatedQuestions || state.generatedQuestions.length === 0) {
    return { error: 'No questions to assemble', status: 'error' };
  }
  
  const typeConfig = examTypes[state.examType] || examTypes['full-length'];
  const domains = certificationDomains[state.certificationId] || [];
  
  // Build domain breakdown
  const domainBreakdown = {};
  state.generatedQuestions.forEach(q => {
    const domainId = q.domain || 'mixed';
    if (!domainBreakdown[domainId]) {
      const domainInfo = domains.find(d => d.id === domainId);
      domainBreakdown[domainId] = {
        id: domainId,
        name: domainInfo?.name || q.domainName || 'Mixed Topics',
        weight: domainInfo?.weight || 0,
        questionCount: 0,
        questions: []
      };
    }
    domainBreakdown[domainId].questionCount++;
    domainBreakdown[domainId].questions.push(q.id);
  });
  
  const exam = {
    id: `exam-${state.certificationId}-${Date.now()}`,
    title: `${state.certificationId.toUpperCase()} Mock Exam`,
    description: `${typeConfig.name} - ${state.generatedQuestions.length} questions, ${state.targetTimeLimit} minutes`,
    certificationId: state.certificationId,
    examType: state.examType,
    difficulty: state.difficulty,
    questionCount: state.generatedQuestions.length,
    questions: state.generatedQuestions,
    domains: Object.values(domainBreakdown),
    timeLimit: state.targetTimeLimit,
    passingScore: state.passingScore,
    instructions: buildInstructions(state),
    metadata: {
      examType: state.examType,
      typeName: typeConfig.name,
      typeDescription: typeConfig.description,
      createdAt: new Date().toISOString(),
      createdBy: 'mock-exam-generator'
    }
  };
  
  console.log(`   ✅ Exam assembled:`);
  console.log(`     Title: ${exam.title}`);
  console.log(`     Questions: ${exam.questionCount}`);
  console.log(`     Time Limit: ${exam.timeLimit} min`);
  console.log(`     Passing Score: ${exam.passingScore}%`);
  
  return { exam };
}

/**
 * Build exam instructions
 */
function buildInstructions(state) {
  return `## Exam Instructions

1. Read each question carefully before selecting your answer
2. All questions have exactly ONE correct answer
3. You have ${state.targetTimeLimit} minutes to complete this exam
4. Your passing score is ${state.passingScore}%
5. Questions are distributed across ${state.exam.domains?.length || state.domainPlan?.length || 1} domain(s)

## Tips for Success
- Manage your time wisely
- Flag difficult questions and return if time permits
- Read all options before selecting your answer
- Trust your first instinct unless you find a clear reason to change`;
}

/**
 * Node: Finalize exam
 */
function finalizeExamNode(state) {
  console.log('\n🎯 [FINALIZE] Preparing exam output...');
  
  if (state.error) {
    return { status: 'error' };
  }
  
  console.log(`   ✅ Exam finalized successfully`);
  console.log(`   ID: ${state.exam?.id}`);
  console.log(`   Questions: ${state.exam?.questionCount}`);
  
  return { status: 'completed' };
}

/**
 * Router after generation
 */
function routeAfterGeneration(state) {
  if (state.generatedQuestions?.length > 0) return 'assemble_exam';
  if (state.retryCount < state.maxRetries) return 'generate_questions';
  return 'finalize';
}

/**
 * Build the graph
 */
export function createMockExamGraph() {
  const graph = new StateGraph(MockExamState);
  
  graph.addNode('plan_exam', planExamNode);
  graph.addNode('generate_questions', generateQuestionsNode);
  graph.addNode('assemble_exam', assembleExamNode);
  graph.addNode('finalize', finalizeExamNode);
  
  graph.addEdge(START, 'plan_exam');
  graph.addEdge('plan_exam', 'generate_questions');
  
  graph.addConditionalEdges('generate_questions', routeAfterGeneration, {
    'generate_questions': 'generate_questions',
    'assemble_exam': 'assemble_exam',
    'finalize': 'finalize'
  });
  
  graph.addEdge('assemble_exam', 'finalize');
  graph.addEdge('finalize', END);
  
  return graph.compile();
}

/**
 * Run the mock exam generation pipeline
 */
export async function generateMockExam(options) {
  const { certificationId, examType = 'full-length', difficulty, domain, questionCount } = options;
  const graph = createMockExamGraph();
  
  const typeConfig = examTypes[examType] || examTypes['full-length'];
  
  console.log('\n' + '═'.repeat(60));
  console.log('📝 MOCK EXAM GENERATION PIPELINE');
  console.log('═'.repeat(60));
  console.log(`Certification: ${certificationId}`);
  console.log(`Exam Type: ${typeConfig.name}`);
  console.log(`Difficulty: ${difficulty || 'intermediate'}`);
  if (domain) console.log(`Focus Domain: ${domain}`);
  console.log('═'.repeat(60));
  
  const initialState = {
    certificationId,
    examType,
    difficulty: difficulty || 'intermediate',
    domain: domain || '',
    targetQuestionCount: questionCount || typeConfig.questionCount,
    targetTimeLimit: typeConfig.timeLimit,
    passingScore: options.passingScore || 72,
    domainPlan: [],
    generatedQuestions: [],
    exam: null,
    status: 'pending',
    error: null,
    retryCount: 0,
    maxRetries: 2
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
    
    if (finalResult.exam) {
      console.log(`Exam ID: ${finalResult.exam.id}`);
      console.log(`Title: ${finalResult.exam.title}`);
      console.log(`Questions: ${finalResult.exam.questionCount}`);
      console.log(`Domains: ${finalResult.exam.domains?.length || 0}`);
    }
    
    console.log('═'.repeat(60) + '\n');
    
    return {
      success: true,
      exam: finalResult.exam,
      questionCount: finalResult.generatedQuestions?.length || 0
    };
    
  } catch (error) {
    console.error('Pipeline error:', error);
    return { success: false, error: error.message };
  }
}

export default { createMockExamGraph, generateMockExam };
