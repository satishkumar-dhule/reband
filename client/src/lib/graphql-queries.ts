// ============================================
// FRAGMENTS
// ============================================

export const QUESTION_FIELDS = /* GraphQL */ `
  fragment QuestionFields on Question {
    id
    question
    answer
    explanation
    diagram
    difficulty
    tags
    channel
    subChannel
    sourceUrl
    videos
    companies
    eli5
    lastUpdated
    options {
      id
      text
      isCorrect
    }
  }
`;

// ============================================
// QUERIES — CHANNELS
// ============================================

export const GET_CHANNELS = /* GraphQL */ `
  query GetChannels {
    channels {
      id
      questionCount
    }
  }
`;

export const GET_STATS = /* GraphQL */ `
  query GetStats {
    stats {
      id
      total
      beginner
      intermediate
      advanced
    }
  }
`;

export const GET_SUBCHANNELS = /* GraphQL */ `
  query GetSubchannels($channelId: String!) {
    subchannels(channelId: $channelId)
  }
`;

export const GET_COMPANIES = /* GraphQL */ `
  query GetCompanies($channelId: String!) {
    companies(channelId: $channelId)
  }
`;

// ============================================
// QUERIES — QUESTIONS
// ============================================

export const GET_QUESTIONS = /* GraphQL */ `
  ${QUESTION_FIELDS}
  query GetQuestions($channelId: String!, $subChannel: String, $difficulty: String) {
    questions(channelId: $channelId, subChannel: $subChannel, difficulty: $difficulty) {
      ...QuestionFields
    }
  }
`;

export const GET_QUESTION = /* GraphQL */ `
  ${QUESTION_FIELDS}
  query GetQuestion($id: String!) {
    question(id: $id) {
      ...QuestionFields
    }
  }
`;

export const GET_RANDOM_QUESTION = /* GraphQL */ `
  ${QUESTION_FIELDS}
  query GetRandomQuestion($channel: String, $difficulty: String) {
    randomQuestion(channel: $channel, difficulty: $difficulty) {
      ...QuestionFields
    }
  }
`;

export const SEARCH_QUESTIONS = /* GraphQL */ `
  query SearchQuestions($query: String!, $limit: Int) {
    search(query: $query, limit: $limit) {
      total
      results {
        id
        question
        answer
        difficulty
        channel
        subChannel
        tags
        companies
        hasVideo
        hasDiagram
      }
    }
  }
`;

export const GET_SIMILAR_QUESTIONS = /* GraphQL */ `
  query GetSimilarQuestions($questionId: String!) {
    similarQuestions(questionId: $questionId) {
      id
      question
      channel
      similarity
    }
  }
`;

// ============================================
// QUERIES — CODING CHALLENGES
// ============================================

export const GET_CODING_CHALLENGES = /* GraphQL */ `
  query GetCodingChallenges($difficulty: String, $category: String) {
    codingChallenges(difficulty: $difficulty, category: $category) {
      id
      title
      description
      difficulty
      category
      tags
      companies
      starterCode { javascript python }
      testCases
      hints
      sampleSolution { javascript python }
      complexity { time space explanation }
      timeLimit
    }
  }
`;

export const GET_CODING_CHALLENGE = /* GraphQL */ `
  query GetCodingChallenge($id: String!) {
    codingChallenge(id: $id) {
      id
      title
      description
      difficulty
      category
      tags
      companies
      starterCode { javascript python }
      testCases
      hints
      sampleSolution { javascript python }
      complexity { time space explanation }
      timeLimit
    }
  }
`;

export const GET_RANDOM_CODING_CHALLENGE = /* GraphQL */ `
  query GetRandomCodingChallenge($difficulty: String) {
    randomCodingChallenge(difficulty: $difficulty) {
      id
      title
      description
      difficulty
      category
      tags
      companies
      starterCode { javascript python }
      testCases
      hints
      sampleSolution { javascript python }
      complexity { time space explanation }
      timeLimit
    }
  }
`;

export const GET_CODING_STATS = /* GraphQL */ `
  query GetCodingStats {
    codingStats {
      total
      byDifficulty { easy medium }
      byCategory
    }
  }
`;

// ============================================
// QUERIES — CERTIFICATIONS
// ============================================

export const GET_CERTIFICATIONS = /* GraphQL */ `
  query GetCertifications($category: String, $difficulty: String, $provider: String, $status: String) {
    certifications(category: $category, difficulty: $difficulty, provider: $provider, status: $status) {
      id
      name
      provider
      description
      icon
      color
      difficulty
      category
      estimatedHours
      examCode
      officialUrl
      domains
      channelMappings
      tags
      prerequisites
      status
      questionCount
      passingScore
      examDuration
      createdAt
      lastUpdated
    }
  }
`;

export const GET_CERTIFICATION = /* GraphQL */ `
  query GetCertification($id: String!) {
    certification(id: $id) {
      id
      name
      provider
      description
      icon
      color
      difficulty
      category
      estimatedHours
      examCode
      officialUrl
      domains
      channelMappings
      tags
      prerequisites
      status
      questionCount
      passingScore
      examDuration
      createdAt
      lastUpdated
    }
  }
`;

export const GET_CERTIFICATION_STATS = /* GraphQL */ `
  query GetCertificationStats {
    certificationStats {
      total
      totalQuestions
      byCategory
      byDifficulty
    }
  }
`;

export const GET_CERTIFICATION_QUESTIONS = /* GraphQL */ `
  ${QUESTION_FIELDS}
  query GetCertificationQuestions($id: String!, $domain: String, $difficulty: String, $limit: Int) {
    certificationQuestions(id: $id, domain: $domain, difficulty: $difficulty, limit: $limit) {
      ...QuestionFields
    }
  }
`;

// ============================================
// QUERIES — LEARNING PATHS
// ============================================

export const GET_LEARNING_PATHS = /* GraphQL */ `
  query GetLearningPaths($pathType: String, $difficulty: String, $company: String, $jobTitle: String, $search: String, $limit: Int, $offset: Int) {
    learningPaths(pathType: $pathType, difficulty: $difficulty, company: $company, jobTitle: $jobTitle, search: $search, limit: $limit, offset: $offset) {
      id
      title
      description
      pathType
      targetCompany
      targetJobTitle
      difficulty
      estimatedHours
      questionIds
      channels
      tags
      prerequisites
      learningObjectives
      milestones
      popularity
      completionRate
      averageRating
      metadata
      status
      createdAt
      lastUpdated
      lastGenerated
    }
  }
`;

export const GET_LEARNING_PATH = /* GraphQL */ `
  query GetLearningPath($id: String!) {
    learningPath(id: $id) {
      id
      title
      description
      pathType
      targetCompany
      targetJobTitle
      difficulty
      estimatedHours
      questionIds
      channels
      tags
      prerequisites
      learningObjectives
      milestones
      popularity
      completionRate
      averageRating
      metadata
      status
      createdAt
      lastUpdated
    }
  }
`;

export const GET_LEARNING_PATH_STATS = /* GraphQL */ `
  query GetLearningPathStats {
    learningPathStats {
      total
      byType
      byDifficulty
    }
  }
`;

export const GET_LEARNING_PATH_FILTER_COMPANIES = /* GraphQL */ `
  query GetLearningPathFilterCompanies {
    learningPathFilterCompanies
  }
`;

export const GET_LEARNING_PATH_FILTER_JOB_TITLES = /* GraphQL */ `
  query GetLearningPathFilterJobTitles {
    learningPathFilterJobTitles
  }
`;

// ============================================
// QUERIES — USER SESSIONS
// ============================================

export const GET_USER_SESSIONS = /* GraphQL */ `
  query GetUserSessions {
    userSessions {
      id
      sessionType
      sessionKey
      title
      subtitle
      channelId
      certificationId
      progress
      totalItems
      completedItems
      sessionData
      startedAt
      lastAccessedAt
      completedAt
      status
    }
  }
`;

export const GET_USER_SESSION = /* GraphQL */ `
  query GetUserSession($id: String!) {
    userSession(id: $id) {
      id
      sessionType
      sessionKey
      title
      subtitle
      channelId
      certificationId
      progress
      totalItems
      completedItems
      sessionData
      startedAt
      lastAccessedAt
      completedAt
      status
    }
  }
`;

// ============================================
// QUERIES — FLASHCARDS & VOICE
// ============================================

export const GET_FLASHCARDS = /* GraphQL */ `
  query GetFlashcards($channelId: String!) {
    flashcards(channelId: $channelId) {
      id
      channel
      front
      back
      hint
      codeExample
      mnemonic
      difficulty
      tags
      category
    }
  }
`;

export const GET_VOICE_SESSIONS = /* GraphQL */ `
  query GetVoiceSessions($channel: String) {
    voiceSessions(channel: $channel) {
      sessions {
        id
        topic
        description
        channel
        difficulty
        questionIds
        totalQuestions
        estimatedMinutes
      }
    }
  }
`;

// ============================================
// QUERIES — HISTORY
// ============================================

export const GET_HISTORY = /* GraphQL */ `
  query GetHistory($questionId: String!, $type: String, $limit: Int) {
    history(questionId: $questionId, type: $type, limit: $limit) {
      id
      questionId
      questionType
      eventType
      eventSource
      sourceName
      changesSummary
      changedFields
      beforeSnapshot
      afterSnapshot
      reason
      metadata
      createdAt
    }
  }
`;

export const GET_HISTORY_FULL = /* GraphQL */ `
  query GetHistoryFull($questionId: String!, $type: String) {
    historyFull(questionId: $questionId, type: $type) {
      questionId
      questionType
      totalEvents
      latestEvent { eventType createdAt }
      eventTypes
      history {
        id
        questionId
        questionType
        eventType
        eventSource
        sourceName
        changesSummary
        changedFields
        reason
        createdAt
      }
    }
  }
`;

export const GET_HISTORY_INDEX = /* GraphQL */ `
  query GetHistoryIndex {
    historyIndex {
      questions
      totalEvents
      totalQuestions
      generatedAt
    }
  }
`;

export const GET_HISTORY_SUMMARY = /* GraphQL */ `
  query GetHistorySummary($questionId: String!, $type: String) {
    historySummary(questionId: $questionId, type: $type) {
      total
      byType
      latest {
        id
        questionId
        eventType
        eventSource
        createdAt
      }
    }
  }
`;

export const GET_HISTORY_ALL = /* GraphQL */ `
  query GetHistoryAll($limit: Int, $type: String, $eventType: String, $source: String) {
    historyAll(limit: $limit, type: $type, eventType: $eventType, source: $source) {
      id
      questionId
      questionType
      eventType
      eventSource
      sourceName
      changesSummary
      reason
      createdAt
    }
  }
`;

// ============================================
// QUERIES — MISC
// ============================================

export const GET_CHANGELOG = /* GraphQL */ `
  query GetChangelog {
    changelog {
      entries
      stats
    }
  }
`;

export const GET_BOT_ACTIVITY = /* GraphQL */ `
  query GetBotActivity {
    botActivity {
      stats { botName totalRuns successfulRuns totalCreated totalUpdated totalDeleted lastRun }
      runs { id botName startedAt completedAt status }
      queue { id itemType itemId action priority status reason createdBy assignedTo createdAt }
      ledger { id botName action itemType itemId reason createdAt }
    }
  }
`;

export const GET_GITHUB_ANALYTICS = /* GraphQL */ `
  query GetGithubAnalytics {
    githubAnalytics
  }
`;

export const GET_TESTS = /* GraphQL */ `
  query GetTests {
    tests
  }
`;

export const GET_TEST = /* GraphQL */ `
  query GetTest($channelId: String!) {
    test(channelId: $channelId)
  }
`;

export const GET_PROGRESS = /* GraphQL */ `
  query GetProgress($userId: String!) {
    progress(userId: $userId) {
      channelId
      completedQuestions
      markedQuestions
      lastVisitedIndex
    }
  }
`;

export const GET_HEALTH = /* GraphQL */ `
  query GetHealth {
    health {
      status
      timestamp
      mode
    }
  }
`;

// ============================================
// MUTATIONS
// ============================================

export const SYNC = /* GraphQL */ `
  mutation Sync($entity: String!, $entityId: String!, $action: String!, $data: JSON) {
    sync(entity: $entity, entityId: $entityId, action: $action, data: $data) {
      ok
      entity
      entityId
      action
    }
  }
`;

export const ADD_HISTORY = /* GraphQL */ `
  mutation AddHistory(
    $questionId: String!
    $questionType: String
    $eventType: String!
    $eventSource: String!
    $sourceName: String
    $changesSummary: String
    $changedFields: JSON
    $beforeSnapshot: JSON
    $afterSnapshot: JSON
    $reason: String
    $metadata: JSON
  ) {
    addHistory(
      questionId: $questionId
      questionType: $questionType
      eventType: $eventType
      eventSource: $eventSource
      sourceName: $sourceName
      changesSummary: $changesSummary
      changedFields: $changedFields
      beforeSnapshot: $beforeSnapshot
      afterSnapshot: $afterSnapshot
      reason: $reason
      metadata: $metadata
    ) {
      success
      id
    }
  }
`;

export const CREATE_LEARNING_PATH = /* GraphQL */ `
  mutation CreateLearningPath(
    $title: String!
    $description: String
    $channels: [String!]!
    $difficulty: String
    $estimatedHours: Int
    $pathType: String
  ) {
    createLearningPath(
      title: $title
      description: $description
      channels: $channels
      difficulty: $difficulty
      estimatedHours: $estimatedHours
      pathType: $pathType
    ) {
      id
      title
      description
      pathType
      difficulty
      channels
      status
    }
  }
`;

export const START_LEARNING_PATH = /* GraphQL */ `
  mutation StartLearningPath($id: String!) {
    startLearningPath(id: $id) {
      success
    }
  }
`;

export const CREATE_OR_UPDATE_USER_SESSION = /* GraphQL */ `
  mutation CreateOrUpdateUserSession(
    $sessionKey: String!
    $sessionType: String!
    $title: String!
    $subtitle: String
    $channelId: String
    $certificationId: String
    $progress: Int
    $totalItems: Int
    $completedItems: Int
    $sessionData: JSON
  ) {
    createOrUpdateUserSession(
      sessionKey: $sessionKey
      sessionType: $sessionType
      title: $title
      subtitle: $subtitle
      channelId: $channelId
      certificationId: $certificationId
      progress: $progress
      totalItems: $totalItems
      completedItems: $completedItems
      sessionData: $sessionData
    ) {
      id
      created
      updated
    }
  }
`;

export const UPDATE_USER_SESSION = /* GraphQL */ `
  mutation UpdateUserSession($id: String!, $progress: Int, $completedItems: Int, $sessionData: JSON) {
    updateUserSession(id: $id, progress: $progress, completedItems: $completedItems, sessionData: $sessionData) {
      success
    }
  }
`;

export const DELETE_USER_SESSION = /* GraphQL */ `
  mutation DeleteUserSession($id: String!) {
    deleteUserSession(id: $id) {
      success
    }
  }
`;

export const COMPLETE_USER_SESSION = /* GraphQL */ `
  mutation CompleteUserSession($id: String!) {
    completeUserSession(id: $id) {
      success
    }
  }
`;

export const UPDATE_CERTIFICATION_COUNT = /* GraphQL */ `
  mutation UpdateCertificationCount($id: String!) {
    updateCertificationCount(id: $id) {
      success
      questionCount
    }
  }
`;
