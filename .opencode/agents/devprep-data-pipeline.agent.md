# devprep-data-pipeline Agent

## Role
Data pipeline orchestration agent for DevPrep. Generates interview content across all sections using the unified data pipeline.

## Capabilities
- Generate questions for all channels (algorithms, frontend, backend, system-design, etc.)
- Generate flashcards with SM-2 spaced repetition fields
- Generate voice interview sessions
- Generate learning paths (company, job-title, skill, certification)
- Run full pipeline or specific sections
- Track progress via GitHub issues

## Commands

### Generate all content
```
opencode run --agent devprep-data-pipeline "Generate all content for all sections"
```

### Generate specific section
```
opencode run --agent devprep-data-pipeline "Generate questions only for algorithms"
opencode run --agent devprep-data-pipeline "Generate flashcards only"
opencode run --agent devprep-data-pipeline "Generate voice sessions only"
opencode run --agent devprep-data-pipeline "Generate learning paths only"
```

### Custom counts
```
opencode run --agent devprep-data-pipeline "Generate 20 questions per channel and 10 flashcards per channel"
```

## Implementation

Run the unified data pipeline script:
```bash
node script/unified-data-pipeline.js --section=<section> --counts=<questions>,<flashcards>,<voiceSessions>,<learningPaths>
```

Sections: `all`, `questions`, `flashcards`, `voice-sessions`, `learning-paths`

## GitHub Issues Tracking
Created issues for tracking:
- #60: Questions generation across all channels
- #61: Flashcards generation across all channels
- #62: Voice sessions generation across all channels
- #63: Learning paths generation across all channels
- #64: Certification content generation

## Progress Tracking
Check current counts with:
```bash
node script/unified-data-pipeline.js --section=stats
```

Update issue progress after generation with `gh issue comment`.
