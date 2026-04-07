export const typeDefs = /* GraphQL */ `
  type Query {
    health: HealthStatus!
    channels: [Channel!]!
    stats: [ChannelStat!]!
    questions(channelId: String!, subChannel: String, difficulty: String): [Question!]!
    question(id: String!): Question
    randomQuestion(channel: String, difficulty: String): Question
    search(query: String!, limit: Int): SearchResult!
    subchannels(channelId: String!): [String!]!
    companies(channelId: String!): [String!]!

    codingChallenges(difficulty: String, category: String): [CodingChallenge!]!
    codingChallenge(id: String!): CodingChallenge
    randomCodingChallenge(difficulty: String): CodingChallenge
    codingStats: CodingStats!

    certifications(category: String, difficulty: String, provider: String, status: String): [Certification!]!
    certification(id: String!): Certification
    certificationStats: CertificationStats!
    certificationQuestions(id: String!, domain: String, difficulty: String, limit: Int): [Question!]!

    learningPaths(pathType: String, difficulty: String, company: String, jobTitle: String, search: String, limit: Int, offset: Int): [LearningPath!]!
    learningPath(id: String!): LearningPath
    learningPathStats: LearningPathStats!
    learningPathFilterCompanies: [String!]!
    learningPathFilterJobTitles: [String!]!

    userSessions: [UserSession!]!
    userSession(id: String!): UserSession

    flashcards(channelId: String!): [Flashcard!]!
    voiceSessions(channel: String): VoiceSessionList!
    similarQuestions(questionId: String!): [SimilarQuestion!]!

    changelog: Changelog!
    botActivity: BotActivity!
    githubAnalytics: JSON
    intelligence: Intelligence!
    interviewerComments: JSON!

    history(questionId: String!, type: String, limit: Int): [HistoryRecord!]!
    historyFull(questionId: String!, type: String): HistoryFull!
    historyIndex: HistoryIndex!
    historySummary(questionId: String!, type: String): HistorySummary!
    historyAll(limit: Int, type: String, eventType: String, source: String): [HistoryRecord!]!

    tests: JSON
    test(channelId: String!): JSON
    progress(userId: String!): [UserProgress!]!
  }

  type Mutation {
    sync(entity: String!, entityId: String!, action: String!, data: JSON): SyncResult!

    addHistory(
      questionId: String!
      questionType: String
      eventType: String!
      eventSource: String!
      sourceName: String
      changesSummary: String
      changedFields: JSON
      beforeSnapshot: JSON
      afterSnapshot: JSON
      reason: String
      metadata: JSON
    ): AddHistoryResult!

    createLearningPath(
      title: String!
      description: String
      channels: [String!]!
      difficulty: String
      estimatedHours: Int
      pathType: String
    ): LearningPath!

    startLearningPath(id: String!): SimpleResult!

    createOrUpdateUserSession(
      sessionKey: String!
      sessionType: String!
      title: String!
      subtitle: String
      channelId: String
      certificationId: String
      progress: Int
      totalItems: Int
      completedItems: Int
      sessionData: JSON
    ): UserSessionUpsertResult!

    updateUserSession(
      id: String!
      progress: Int
      completedItems: Int
      sessionData: JSON
    ): SimpleResult!

    deleteUserSession(id: String!): SimpleResult!
    completeUserSession(id: String!): SimpleResult!
    updateCertificationCount(id: String!): UpdateCountResult!
  }

  scalar JSON

  type HealthStatus {
    status: String!
    timestamp: Float!
    mode: String!
  }

  type Channel {
    id: String!
    questionCount: Int!
  }

  type ChannelStat {
    id: String!
    total: Int!
    beginner: Int!
    intermediate: Int!
    advanced: Int!
  }

  type MCQOption {
    id: String!
    text: String!
    isCorrect: Boolean!
  }

  type Question {
    id: String!
    question: String!
    answer: String!
    explanation: String!
    diagram: String
    difficulty: String!
    tags: JSON
    channel: String!
    subChannel: String
    sourceUrl: String
    videos: JSON
    companies: JSON
    eli5: String
    lastUpdated: String
    options: [MCQOption!]
  }

  type SearchItem {
    id: String!
    question: String!
    answer: String
    difficulty: String!
    channel: String!
    subChannel: String
    tags: JSON
    companies: JSON
    hasVideo: Boolean!
    hasDiagram: Boolean!
  }

  type SearchResult {
    results: [SearchItem!]!
    total: Int!
  }

  type StarterCode {
    javascript: String!
    python: String!
  }

  type SampleSolution {
    javascript: String!
    python: String!
  }

  type Complexity {
    time: String!
    space: String!
    explanation: String
  }

  type CodingChallenge {
    id: String!
    title: String!
    description: String!
    difficulty: String!
    category: String!
    tags: JSON
    companies: JSON
    starterCode: StarterCode!
    testCases: JSON
    hints: JSON
    sampleSolution: SampleSolution!
    complexity: Complexity!
    timeLimit: Int!
  }

  type CodingDifficultyStat {
    easy: Int!
    medium: Int!
  }

  type CodingStats {
    total: Int!
    byDifficulty: CodingDifficultyStat!
    byCategory: JSON!
  }

  type Certification {
    id: String!
    name: String!
    provider: String!
    description: String!
    icon: String
    color: String
    difficulty: String!
    category: String!
    estimatedHours: Int
    examCode: String
    officialUrl: String
    domains: JSON
    channelMappings: JSON
    tags: JSON
    prerequisites: JSON
    status: String
    questionCount: Int
    passingScore: Int
    examDuration: Int
    createdAt: String
    lastUpdated: String
  }

  type CertificationStats {
    total: Int!
    totalQuestions: Int!
    byCategory: JSON!
    byDifficulty: JSON!
  }

  type LearningPath {
    id: String!
    title: String!
    description: String!
    pathType: String!
    targetCompany: String
    targetJobTitle: String
    difficulty: String!
    estimatedHours: Int
    questionIds: JSON
    channels: JSON
    tags: JSON
    prerequisites: JSON
    learningObjectives: JSON
    milestones: JSON
    popularity: Int
    completionRate: Int
    averageRating: Int
    metadata: JSON
    status: String
    createdAt: String
    lastUpdated: String
    lastGenerated: String
  }

  type LearningPathStats {
    total: Int!
    byType: JSON!
    byDifficulty: JSON!
  }

  type UserSession {
    id: String!
    userId: String
    sessionType: String!
    sessionKey: String!
    title: String!
    subtitle: String
    channelId: String
    certificationId: String
    progress: Int
    totalItems: Int!
    completedItems: Int
    sessionData: JSON
    startedAt: String
    lastAccessedAt: String
    completedAt: String
    status: String
  }

  type UserSessionUpsertResult {
    id: String!
    created: Boolean
    updated: Boolean
  }

  type Flashcard {
    id: String!
    channel: String!
    front: String!
    back: String!
    hint: String
    codeExample: String
    mnemonic: String
    difficulty: String!
    tags: JSON
    category: String
  }

  type VoiceSession {
    id: String!
    topic: String!
    description: String
    channel: String!
    difficulty: String!
    questionIds: JSON
    totalQuestions: Int!
    estimatedMinutes: Int
  }

  type VoiceSessionList {
    sessions: [VoiceSession!]!
  }

  type SimilarQuestion {
    id: String!
    question: String!
    channel: String!
    similarity: Float!
  }

  type Changelog {
    entries: JSON
    stats: JSON
  }

  type BotStat {
    botName: String!
    totalRuns: Int!
    successfulRuns: Int!
    totalCreated: Int
    totalUpdated: Int
    totalDeleted: Int
    lastRun: String
  }

  type BotRun {
    id: Int!
    botName: String!
    startedAt: String!
    completedAt: String
    status: String!
  }

  type WorkQueueItem {
    id: Int!
    itemType: String!
    itemId: String!
    action: String!
    priority: Int
    status: String!
    reason: String
    createdBy: String
    assignedTo: String
    createdAt: String!
  }

  type LedgerEntry {
    id: Int!
    botName: String!
    action: String!
    itemType: String!
    itemId: String!
    reason: String
    createdAt: String!
  }

  type BotActivity {
    stats: [BotStat!]!
    runs: [BotRun!]!
    queue: [WorkQueueItem!]!
    ledger: [LedgerEntry!]!
  }

  type Intelligence {
    cognitiveMap: JSON
    companyWeights: JSON
    companyProfiles: JSON
    knowledgeDNA: JSON
    mockInterviews: JSON
  }

  type HistoryRecord {
    id: Int!
    questionId: String!
    questionType: String!
    eventType: String!
    eventSource: String!
    sourceName: String
    changesSummary: String
    changedFields: JSON
    beforeSnapshot: JSON
    afterSnapshot: JSON
    reason: String
    metadata: JSON
    createdAt: String!
  }

  type HistoryFull {
    questionId: String!
    questionType: String
    totalEvents: Int!
    latestEvent: LatestEvent
    eventTypes: JSON!
    history: [HistoryRecord!]!
  }

  type LatestEvent {
    eventType: String!
    createdAt: String!
  }

  type HistoryIndex {
    questions: JSON!
    totalEvents: Int!
    totalQuestions: Int!
    generatedAt: String!
  }

  type HistorySummary {
    total: Int!
    byType: JSON!
    latest: HistoryRecord
  }

  type AddHistoryResult {
    success: Boolean!
    id: Int!
  }

  type SyncResult {
    ok: Boolean!
    entity: String!
    entityId: String!
    action: String!
  }

  type SimpleResult {
    success: Boolean!
  }

  type UpdateCountResult {
    success: Boolean!
    questionCount: Int!
  }

  type UserProgress {
    channelId: String
    completedQuestions: JSON
    markedQuestions: JSON
    lastVisitedIndex: Int
  }
`;
