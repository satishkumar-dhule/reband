# DevPrep Ultra Pro Max - 30+ Autonomous Agents System

## Overview

DevPrep has been completely redesigned with **30+ specialized autonomous agents** that coordinate through **asynchronous message passing** to handle all operations. The system integrates Google services and features a comprehensive redesign with full skill integration.

## Architecture

### Core Message Passing System

The Agent Message Bus (`src/agents/core/AgentMessageBus.ts`) provides:
- **Async message passing** between all agents
- **Pub/Sub pattern** for agent communication  
- **Message queues** for reliable delivery
- **Request/Response** pattern for queries
- **Broadcast** for system-wide notifications

---

## OpenCode Agents (`.opencode/agents/`)

### Coordinator Agents (1)
| Agent | Skill Reference | Description |
|-------|-----------------|-------------|
| `devprep-coordinator` | pipeline-generator, pipeline-verifier, pipeline-processor | Orchestrates parallel content generation across all channels |

### Content Expert Agents (5)
| Agent | Skill Reference | Description |
|-------|-----------------|-------------|
| `devprep-question-expert` | content-question-expert | Technical interview Q&A questions |
| `devprep-flashcard-expert` | content-flashcard-expert | Spaced-repetition flashcards |
| `devprep-exam-expert` | content-certification-expert | Certification exam questions |
| `devprep-voice-expert` | content-voice-expert | Verbal practice prompts |
| `devprep-coding-expert` | content-challenge-expert | Coding challenges |

### Content Generator Agents (3)
| Agent | Skill Reference | Description |
|-------|-----------------|-------------|
| `devprep-blog-generator` | content-blog-expert | Educational blog posts with SEO |
| `devprep-study-guide-generator` | pdf | PDF study materials |
| `devprep-presentation-generator` | pptx | PowerPoint slides |

### Quality & Testing Agents (3)
| Agent | Skill Reference | Description |
|-------|-----------------|-------------|
| `devprep-testing-agent` | browser-use | Automated UI testing |
| `devprep-seo-audit` | seo-audit, audit-website | SEO and website audits |
| `devprep-site-auditor` | audit-website | Comprehensive site auditing |

### Specialist Agents (8)
| Agent | Skill Reference | Description |
|-------|-----------------|-------------|
| `devprep-frontend-designer` | frontend-design, ui-ux-pro-max | UI/UX design |
| `devprep-react-optimizer` | vercel-react-best-practices | React performance |
| `devprep-ui-ux-expert` | ui-ux-pro-max | UI/UX review |
| `devprep-web-reviewer` | web-design-guidelines | Web interface guidelines |
| `devprep-db-optimizer` | supabase-postgres-best-practices | Database optimization |
| `devprep-auth-specialist` | better-auth-best-practices | Authentication |
| `devprep-copywriter` | copywriting | Marketing copy |
| `devprep-brainstormer` | brainstorming | Feature design |
| `devprep-ai-tools` | agent-tools | AI/ML tools integration |

---

## Skills (`.agents/skills/`)

### Content Generation Skills (6)
| Skill | Used By | Description |
|-------|---------|-------------|
| content-question-expert | question-expert | Interview Q&A generation |
| content-flashcard-expert | flashcard-expert | Spaced repetition cards |
| content-certification-expert | exam-expert | Exam questions |
| content-voice-expert | voice-expert | Practice prompts |
| content-challenge-expert | coding-expert | Coding challenges |
| content-blog-expert | blog-generator | Blog posts |

### Pipeline Skills (3)
| Skill | Used By | Description |
|-------|---------|-------------|
| pipeline-generator | coordinator | Parallel orchestration |
| pipeline-verifier | coordinator | Quality validation |
| pipeline-processor | coordinator | Post-processing |

### Frontend/React Skills (5)
| Skill | Used By | Description |
|-------|---------|-------------|
| frontend-design | frontend-designer | UI design |
| ui-ux-pro-max | ui-ux-expert, frontend-designer | UI/UX patterns |
| web-design-guidelines | web-reviewer | Web interface guidelines |
| vercel-react-best-practices | react-optimizer | React performance |
| next-best-practices | react-optimizer | Next.js optimization |

### Database Skills (1)
| Skill | Used By | Description |
|-------|---------|-------------|
| supabase-postgres-best-practices | db-optimizer | Postgres optimization |

### Auth Skills (1)
| Skill | Used By | Description |
|-------|---------|-------------|
| better-auth-best-practices | auth-specialist | Auth configuration |

### SEO/Audit Skills (2)
| Skill | Used By | Description |
|-------|---------|-------------|
| seo-audit | seo-audit | SEO analysis |
| audit-website | site-auditor | Website auditing |

### Media Skills (3)
| Skill | Used By | Description |
|-------|---------|-------------|
| pdf | study-guide-generator | PDF generation |
| pptx | presentation-generator | PowerPoint creation |
| remotion-best-practices | future | Video content |

### Automation Skills (2)
| Skill | Used By | Description |
|-------|---------|-------------|
| browser-use | testing-agent | Browser automation |
| agent-tools | ai-tools | AI/ML tools |

### Creative/Strategy Skills (3)
| Skill | Used By | Description |
|-------|---------|-------------|
| copywriting | copywriter | Marketing copy |
| brainstorming | brainstormer | Feature design |
| find-skills | future | Skill discovery |

---

## Client Skill Agents (21 in `client/src/agents/skills/`)

| Category | Agents |
|----------|--------|
| **Learning** | LearningPathAgent, SpacedRepetitionAgent, CertificationAgent, RecommendationAgent |
| **Content** | QuestionBankAgent, SearchAgent, ChannelAgent, ContentAgent, CodingChallengeAgent |
| **User** | UserProgressAgent, NotificationAgent, BookmarkAgent, ThemeAgent, PreferencesAgent, OnboardingAgent, ExportAgent |
| **Practice** | VoicePracticeAgent, TimerAgent |
| **Analytics** | AnalyticsAgent, SyncAgent, BadgeAgent, CacheAgent |

---

## Content Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                     devprep-coordinator                     │
│  Orchestrates parallel generation using pipeline-generator   │
└─────────────────────────────────────────────────────────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Questions   │     │  Flashcards  │     │  Coding Challenges│
│   (5)        │     │   (5)        │     │    (5)            │
└──────────────┘     └──────────────┘     └──────────────────┘
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  Exam Q's    │     │  Voice       │     │   Blogs          │
│   (5)        │     │  (5)         │     │   (3)            │
└──────────────┘     └──────────────┘     └──────────────────┘
       │                      │                      │
       └──────────────────────┼──────────────────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │ pipeline-verifier│
                   │  Quality Gates  │
                   └──────────────────┘
                              │
                              ▼
                   ┌──────────────────┐
                   │pipeline-processor│
                   │  Save & Publish │
                   └──────────────────┘
```

---

## Database Schema

Complete redesign with SQLite database (`src/database/schema.ts`):

### Core Tables
- **users** - User accounts and preferences
- **channels** - Learning channels/categories
- **content** - Questions, flashcards, exams, voice, coding
- **user_progress** - Progress tracking per user
- **learning_paths** - Structured learning journeys
- **achievements** - Gamification badges
- **user_achievements** - Earned achievements
- **discussions** - Community discussions
- **comments** - Discussion replies
- **job_applications** - Job tracking
- **analytics_events** - User analytics tracking

### Agent Coordination

Each database operation coordinates with multiple agents:
- **db-architect** - Schema design and migrations
- **query-optimizer** - Query optimization
- **cache** - Caching layer management
- **backup** - Automated backups

---

## Google Services Integration

Complete integration in `src/services/google/index.ts`:

- **Google Analytics 4** - User tracking and events
- **Google Auth** - OAuth/SSO authentication
- **Google Cloud** - Deployment and infrastructure
- **Google Maps** - Location services
- **Google Sheets** - Data export/import

---

## Pages Redesigned

New UI components in `src/pages/index.ts`:

1. **Dashboard** - Progress overview, stats, learning paths
2. **Learning Paths** - Guided learning journeys
3. **Code Practice** - Coding challenges with difficulty
4. **Interview Simulator** - Technical, system design, behavioral
5. **Voice Practice** - AI-powered speech analysis
6. **Flashcards** - Spaced repetition system
7. **Analytics** - Performance metrics and insights
8. **Community** - Discussions and social features
9. **Job Tracker** - Application management
10. **Settings** - Profile and preferences

---

## Key Features

- ✅ **30+** autonomous specialized agents
- ✅ **27** integrated skills (content, pipeline, frontend, SEO, etc.)
- ✅ Async message passing coordination
- ✅ Google services integration
- ✅ Complete database redesign
- ✅ **10+** fully redesigned pages
- ✅ Material Design UI (MUI)
- ✅ Responsive layouts
- ✅ Real-time agent status
- ✅ Agent category grouping
- ✅ Content pipeline with quality gates
- ✅ Automated testing with browser-use
- ✅ SEO auditing capabilities
- ✅ PDF/PPTX generation

---

## Skill → Agent Mapping

| Skill | Primary Agent(s) | Secondary Usage |
|-------|-----------------|-----------------|
| content-question-expert | question-expert | blog-generator |
| content-flashcard-expert | flashcard-expert | study-guide-generator |
| content-certification-expert | exam-expert | presentation-generator |
| content-voice-expert | voice-expert | - |
| content-challenge-expert | coding-expert | study-guide-generator |
| content-blog-expert | blog-generator | presentation-generator |
| pipeline-generator | coordinator | - |
| pipeline-verifier | coordinator | - |
| pipeline-processor | coordinator | - |
| frontend-design | frontend-designer | ui-ux-expert |
| ui-ux-pro-max | ui-ux-expert | frontend-designer |
| web-design-guidelines | web-reviewer | - |
| vercel-react-best-practices | react-optimizer | frontend-designer |
| next-best-practices | react-optimizer | frontend-designer |
| supabase-postgres-best-practices | db-optimizer | - |
| better-auth-best-practices | auth-specialist | - |
| seo-audit | seo-audit | coordinator |
| audit-website | site-auditor | seo-audit |
| pdf | study-guide-generator | - |
| pptx | presentation-generator | - |
| browser-use | testing-agent | - |
| agent-tools | ai-tools | coordinator |
| copywriting | copywriter | blog-generator |
| brainstorming | brainstormer | coordinator |

---

Last Updated: 2026-03-27
