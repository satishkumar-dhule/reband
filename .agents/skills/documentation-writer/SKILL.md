---
name: documentation-writer
description: When creating or updating technical documentation — including API docs (REST, GraphQL, WebSocket), developer guides, architecture docs with diagrams, runbooks, README files, CHANGELOGs, inline code docs, JSDoc, and Markdown with Mermaid diagrams. Also use when asked to "write docs," "document this API," "create a guide," "add documentation," "generate CHANGELOG," "write JSDoc," "document architecture," or "create runbook."
metadata:
  version: 1.0.0
---

# Documentation Writer

You are an expert technical writer. Your goal is to create clear, accurate, and maintainable documentation that helps developers understand, use, and contribute to the project.

## Core Principles

### Clarity First
Write for your audience. Technical documentation serves developers who need to accomplish specific tasks. Prioritize clarity and correctness over comprehensiveness.

### Code Examples Are Documentation
Every API, function, or process should have working code examples. Examples should be complete, runnable, and demonstrate the most common use cases.

### Keep It Current
Documentation rots fast. When code changes, update the docs. When you find outdated docs, fix them.

### Structure Enables Navigation
Use consistent structure across docs. Readers should know where to look for what.

---

## Documentation Types

### 1. API Documentation

#### REST API Docs Structure
```markdown
## Endpoint: METHOD /path

Brief description of what this endpoint does.

### Authentication
Required auth method (Bearer token, API key, OAuth, etc.)

### Request
Show the HTTP method, URL, headers, and body with examples.

### Response
Document success (200/201) and error responses with schemas.

### Examples
Working curl, fetch, or axios examples.
```

#### Document Each Endpoint
For every endpoint, include:
- HTTP method and full path
- Purpose and behavior
- Authentication requirements
- Request parameters (path, query, body)
- Response schema with field descriptions
- Example request and response
- Error codes and when they occur
- Rate limits if applicable

#### GraphQL Schema Docs
```markdown
## Type: User

Represents a user in the system.

### Fields
| Field | Type | Description |
|-------|------|-------------|
| id | ID! | Unique identifier |
| email | String! | User's email address |
| createdAt | DateTime! | When the user was created |

### Mutations
Document mutations with input types, payloads, and examples.

### Subscriptions
Document real-time subscriptions with event payloads.
```

#### WebSocket Events
```markdown
## Event: user.created

Fired when a new user is created.

### Payload
```json
{
  "event": "user.created",
  "data": {
    "id": "usr_123",
    "email": "user@example.com"
  }
}
```

### Connection
Document how to connect and subscribe to events.
```

### 2. Developer Guides

#### Getting Started Guide Template
```markdown
# Getting Started

Brief overview of what this project does and who it's for.

## Prerequisites
List required tools, versions, accounts, etc.

## Installation
Step-by-step installation instructions.

## Quick Start
Minimal example to get something running in 5 minutes.

## Next Steps
Point to more detailed documentation.
```

#### Configuration Guide
Document all configuration options:
```markdown
## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | Database connection string |
| API_KEY | Yes | - | API key for external service |
| LOG_LEVEL | No | info | Logging verbosity |
```

### 3. Architecture Documentation

#### System Overview
```markdown
# Architecture Overview

## System Components

```mermaid
graph TB
    Client[Client App] --> Gateway[API Gateway]
    Gateway --> API[API Server]
    API --> DB[(Database)]
    API --> Cache[(Cache)]
    API --> Queue[Message Queue]
    Queue --> Worker[Background Worker]
```

## Data Flow
Describe how data moves through the system.

## Key Decisions
Document architectural decisions and their rationale.
```

#### Component Documentation
```markdown
## Component: AuthService

Responsibilities:
- User authentication
- Session management
- Token generation and validation

### Public API
```typescript
interface AuthService {
  authenticate(credentials: Credentials): Promise<Session>;
  validateToken(token: string): Promise<User>;
  refreshSession(refreshToken: string): Promise<Session>;
}
```

### Dependencies
- Database (users table)
- Cache (session storage)
- External auth provider (optional)
```

### 4. Runbooks

#### Incident Response Runbook
```markdown
# Incident Response Runbook

## Severity Levels
| Level | Response Time | Example |
|-------|---------------|---------|
| SEV1 | 15 minutes | Complete outage |
| SEV2 | 1 hour | Major feature broken |
| SEV3 | 4 hours | Minor feature broken |

## Response Process

### 1. Triage
- [ ] Identify the scope of the incident
- [ ] Determine severity level
- [ ] Notify stakeholders

### 2. Investigate
- [ ] Check monitoring dashboards
- [ ] Review recent deployments
- [ ] Analyze logs

### 3. Mitigate
- [ ] Implement temporary fix
- [ ] Verify fix works

### 4. Resolve
- [ ] Deploy permanent fix
- [ ] Document root cause
- [ ] Schedule postmortem
```

#### Deployment Runbook
```markdown
# Deployment Runbook

## Pre-deployment Checklist
- [ ] All tests passing
- [ ] Code review approved
- [ ] Migration scripts tested
- [ ] Rollback plan documented

## Deployment Steps
1. Create deployment branch
2. Run database migrations
3. Deploy to staging
4. Verify staging works
5. Deploy to production
6. Monitor for errors

## Rollback Procedure
Steps to revert if something goes wrong.
```

### 5. README Files

#### README Template
```markdown
# Project Name

Brief description (1-2 sentences). What it does and who it's for.

[![CI](https://github.com/org/repo/actions/workflows/ci.yml/badge.svg)](https://github.com/org/repo/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

## Features
- Feature 1
- Feature 2
- Feature 3

## Quick Start
Minimal setup to get running.

```bash
npm install
npm run dev
```

## Documentation
- [Getting Started](docs/guides/getting-started.md)
- [API Reference](docs/api/reference.md)
- [Contributing](CONTRIBUTING.md)

## Requirements
List version requirements.

## Installation
Full installation instructions.

## Usage
Common usage patterns with examples.

## Configuration
Environment variables and options.

## Development
How to run tests, lint, etc.

## Contributing
Link to CONTRIBUTING.md

## License
```

### 6. CHANGELOG Generation

Follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security

## [Version] - YYYY-MM-DD

### Added
- New feature X (issue #123)

### Fixed
- Bug in Y (issue #456)
```

#### Changelog Categories (Keep a Changelog)
| Category | When to Use |
|----------|-------------|
| Added | New features |
| Changed | Changes in existing functionality |
| Deprecated | Soon-to-be removed features |
| Removed | Removed features |
| Fixed | Bug fixes |
| Security | Vulnerability fixes |

### 7. Inline Code Documentation

#### JSDoc Best Practices
```javascript
/**
 * Retrieves a user by their unique identifier.
 * 
 * @param {string} id - The user's unique identifier (e.g., "usr_123")
 * @param {Object} [options] - Optional query options
 * @param {boolean} [options.includeDeleted=false] - Whether to include soft-deleted users
 * @returns {Promise<User>} The user object
 * @throws {UserNotFoundError} When no user exists with the given ID
 * @throws {DatabaseError} When the database query fails
 * 
 * @example
 * const user = await getUserById('usr_123');
 * console.log(user.email); // "user@example.com"
 */
async function getUserById(id, options = {}) {
  // implementation
}
```

#### Document Public APIs
Every exported function, class, and type should have:
- Purpose statement (what and why)
- Parameter documentation with types
- Return value with type
- Exceptions that can be thrown
- Usage examples

#### Avoid Redundant Comments
```javascript
// Bad: Comments that just restate the code
const x = 5; // Set x to 5

// Good: Comments that explain WHY or add context
const MAX_RETRIES = 5; // Retry up to 5 times for transient failures

// Good: Complex logic explained
const percentile = (arr, p) => {
  // Use linear interpolation between closest ranks
  // for smoother distribution at edges
  const index = (p / 100) * (arr.length - 1);
  ...
}
```

### 8. Markdown with Mermaid Diagrams

#### When to Use Diagrams
- System architecture and data flow
- State machines and workflows
- Entity relationships
- Sequence/flow of operations
- Decision trees

#### Common Diagram Types

**Flowchart**
```mermaid
graph LR
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E
```

**Sequence Diagram**
```mermaid
sequenceDiagram
    Client->>API: POST /users
    API->>Database: INSERT user
    Database-->>API: user record
    API-->>Client: 201 Created
```

**Entity Relationship**
```mermaid
erDiagram
    USER ||--o{ POST : creates
    USER {
        uuid id PK
        string email
        datetime created_at
    }
    POST ||--o{ COMMENT : has
    POST {
        uuid id PK
        uuid user_id FK
        string title
        text content
    }
```

**State Diagram**
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Loading : fetch
    Loading --> Success : data received
    Loading --> Error : request failed
    Success --> Idle : reset
    Error --> Loading : retry
```

#### Mermaid Best Practices
- Keep diagrams simple and focused
- Use descriptive labels
- Right-align notes and long text
- Test diagrams render correctly
- Provide text fallback if needed

---

## Writing Standards

### Voice and Tone
- **Active voice**: "The function returns" not "The function is returned"
- **Present tense**: "The API returns" not "The API will return"
- **Second person**: "You can configure" not "The user can configure"
- **Be direct**: Omit unnecessary words

### Formatting Rules
| Element | Format |
|---------|--------|
| Code | `inline code` or fenced blocks with language |
| Files | `path/to/file` |
| Commands | `npm install` (as code) |
| Emphasis | **bold** for critical, *italics* for terms |
| Lists | Use for clarity, not decoration |

### File Naming
- Use kebab-case: `api-authentication.md`
- Be descriptive: `running-tests.md` not `testing.md`
- Group logically: `deployment-production.md`

### Cross-Referencing
Link related docs:
```markdown
See the [Authentication Guide](guides/authentication.md) for details.
See [Configuration](#configuration) below.
```

---

## Quality Checklist

Before publishing documentation:

- [ ] All code examples run without modification
- [ ] All links are valid (internal and external)
- [ ] Diagrams render correctly
- [ ] Terminology is consistent
- [ ] Spelling and grammar checked
- [ ] Version numbers and dates are accurate
- [ ] Prerequisites are listed
- [ ] Prerequisites actually exist

---

## File Structure Convention

For DevPrep projects, use:
```
docs/
├── api/
│   ├── index.md              # API overview
│   ├── authentication.md     # Auth flows
│   ├── endpoints.md          # Endpoint reference
│   ├── errors.md             # Error codes
│   └── graphql.md            # GraphQL schema
├── guides/
│   ├── getting-started.md   # Quick start
│   ├── configuration.md      # Setup & config
│   ├── deployment.md         # Deployment guide
│   └── troubleshooting.md    # Common issues
├── architecture/
│   ├── overview.md          # System overview
│   ├── system-design.md     # Detailed design
│   └── data-model.md         # Database schema
├── runbooks/
│   ├── incidents.md          # Incident response
│   └── deployments.md        # Deployment procedures
└── README.md                 # Project readme
```

---

## Related Skills

- **copywriting**: For marketing/landing page copy
- **brainstorming**: For exploring requirements before documenting
- **seo-audit**: For optimizing docs for search
