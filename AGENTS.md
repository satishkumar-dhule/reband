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

## GitHub Theme Migration (20+ Specialized Agents)

The DevPrep GitHub-like theme migration has been completed with **20+ specialized agents** working in parallel.

### GitHub Theme Migration Skills (`.agents/skills/`)
| Skill | Used By | Description |
|-------|---------|-------------|
| github-theme-migration | All theme agents | GitHub design language and migration |
| github-theme-components | All theme agents | GitHub-style component library |

### GitHub Theme Migration Agents (`.opencode/agents/`)

#### UI/UX Expert Agents (10)
| Agent | Skills | Description |
|-------|--------|-------------|
| `devprep-github-colors-expert` | github-theme-migration, ui-ux-pro-max | GitHub color palette migration |
| `devprep-github-typography-expert` | github-theme-migration, ui-ux-pro-max | GitHub typography system |
| `devprep-github-layout-expert` | github-theme-migration, ui-ux-pro-max | GitHub layout patterns |
| `devprep-github-nav-expert` | github-theme-migration, ui-ux-pro-max | GitHub navigation components |
| `devprep-github-cards-expert` | github-theme-migration, ui-ux-pro-max | GitHub card components |
| `devprep-github-darkmode-expert` | github-theme-migration, ui-ux-pro-max | Dark mode implementation |
| `devprep-github-badges-expert` | github-theme-migration, ui-ux-pro-max | GitHub labels/badges |
| `devprep-github-modals-expert` | github-theme-migration, ui-ux-pro-max | GitHub dialogs/modals |
| `devprep-github-tables-expert` | github-theme-migration, ui-ux-pro-max | GitHub table components |
| `devprep-github-forms-expert` | github-theme-migration, ui-ux-pro-max | GitHub form components |

#### Frontend Designer Agents (10)
| Agent | Skills | Description |
|-------|--------|-------------|
| `devprep-github-buttons-expert` | github-theme-migration, frontend-design | GitHub button styles |
| `devprep-github-inputs-expert` | github-theme-migration, frontend-design | GitHub input components |
| `devprep-github-icons-expert` | github-theme-migration, frontend-design | GitHub iconography |
| `devprep-github-alerts-expert` | github-theme-migration, frontend-design | GitHub alert notices |
| `devprep-github-avatar-expert` | github-theme-migration, frontend-design | GitHub avatar components |
| `devprep-github-progress-expert` | github-theme-migration, frontend-design | GitHub progress indicators |
| `devprep-github-tooltip-expert` | github-theme-migration, frontend-design | GitHub tooltips |
| `devprep-github-dropdown-expert` | github-theme-migration, frontend-design | GitHub dropdown menus |
| `devprep-github-tabs-expert` | github-theme-migration, frontend-design | GitHub tab navigation |
| `devprep-github-utilities-expert` | github-theme-migration, frontend-design | GitHub utility classes |

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

### GitHub Theme Skills (2)
| Skill | Used By | Description |
|-------|---------|-------------|
| github-theme-migration | All theme agents | GitHub design language migration |
| github-theme-components | All theme agents | GitHub-style component library |

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

- ✅ **50+** autonomous specialized agents
- ✅ **29** integrated skills (content, pipeline, frontend, SEO, GitHub theme, etc.)
- ✅ **20+** GitHub theme migration agents
- ✅ Async message passing coordination
- ✅ Google services integration
- ✅ Complete database redesign
- ✅ **10+** fully redesigned pages
- ✅ GitHub-style UI with dark mode
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
| frontend-design | frontend-designer | ui-ux-expert, github theme agents |
| ui-ux-pro-max | ui-ux-expert | frontend-designer, github theme agents |
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
| github-theme-migration | github theme agents (20+) | frontend-designer |
| github-theme-components | github theme agents (20+) | ui-ux-expert |

---

Last Updated: 2026-03-27
