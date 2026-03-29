---
name: claw-multi-agent
description: "Multi-agent parallel orchestration for OpenClaw. Spawn AI agents as a team — parallel research, multi-model comparison, code pipelines. Proven 50-65% time savings. Trigger words: multi-agent, parallel agents, swarm, spawn multiple agents, parallel research, compare models, deep research, comprehensive research, detailed investigation, thorough analysis, research multiple topics."
---

# claw-multi-agent 🐝

> **Replace one AI with a team of AIs. Turn serial into parallel. Turn hours into minutes.**

---

## What can it do?

| Scenario | Example | Speedup |
|----------|---------|---------|
| **Parallel research** | Search 5 frameworks simultaneously, each writes a report | ~65% ⚡ |
| **Multi-model compare** | Ask Claude, Gemini, Kimi the same question at the same time | ~50% ⚡ |
| **Code pipeline** | Plan → Code → Review, auto hand-off in sequence | Quality ↑ |
| **Batch processing** | Translate / analyze / summarize multiple docs in parallel | Scales linearly |

---

## ⚡ Get started in 30 seconds

Just say something like:

- "Research LangChain, CrewAI, and AutoGen in parallel"
- "Have multiple agents search these topics and write a combined report"
- "Compare how Claude and Gemini answer this question"
- "Use multi-agent mode to do this research"

---

## 🎭 Interaction Style — How to Talk to the User

This is the recommended pattern. Every multi-agent run must follow this interaction pattern.

### Step 0 — Announce skill activation FIRST

**⚠️ Iron rule: The activation announcement must be your FIRST reply after receiving the task — before reading any files, before investigating, before spawning.**

**Why this matters**: Reading files, researching background, and spawning all take time. If you do those first, users see long silence. Worse: context compression can happen during that time, and the announcement will never be sent.

**Correct order**: Receive task → Send announcement immediately → Then read files / spawn / wait

The very first thing to say when this skill is triggered — before any planning or spawning:

```
🐝 **claw-multi-agent activated**
Multi-agent parallel mode initiated. I'll assemble an Agent team to handle this task.
```

This tells the user the skill is active and sets expectations for what's about to happen.

### Before spawning — announce the plan

Right after the activation announcement, present the plan BEFORE calling sessions_spawn:

```
🚀 [N] directions simultaneously, comprehensive coverage of your question.

📋 Task Plan:
🔍 Researcher A (GLM) — [one-sentence task description]
🔍 Researcher B (GLM) — [one-sentence task description]
📊 Analyst (Kimi) — Waiting for first [N] results, summoned separately (note when sequential)

Mode: 🎯 Orchestrator Mode (web search)
Estimated time: ~[X]s ([N] Agents parallel[, analyst follows sequentially])
Deploying Agent team...
```

**Role emoji reference:**
| Role | Emoji | Example |
|------|-------|---------|
| Researcher | 🔍 | 🔍 Researcher A (GLM) — Research XX |
| Analyst | 📊 | 📊 Analyst (Kimi) — Deep comparison |
| Writer | ✍️ | ✍️ Writer (Gemini) — Draft the report |
| Coder | 💻 | 💻 Coder (Kimi) — Implement the logic |
| Reviewer | 🔎 | 🔎 Reviewer (GLM) — Quality check |
| Planner | 📋 | 📋 Planner (Sonnet) — Break down tasks |

**Key rules:**
- ✅ Always list each agent with: emoji + role + **model name** + one-line task
- ✅ State the mode (Orchestrator/Pipeline/Hybrid) and estimated time
- ✅ End announcement with: `Deploying Agent team...`
- ✅ Note sequential agents as: "Waiting for first N results, summoned separately"
- ❌ Never silently call sessions_spawn without announcing

### While waiting — brief note

After spawning, say one line:
```
⏳ All sub-agents deployed, waiting for results...
```

### After results — structured output (not raw dump)

**Never paste sub-agent raw output directly.** Always digest and restructure by content logic — NOT by agent order.

**Recommended output order:**

```
1. Execution Stats Card ← Let user know what ran first
2. Core Conclusions (3-5 key findings) ← Most valuable first
3. Detailed breakdown by topic (organized by content logic, not sub-agent order) ← Reads like a complete article
4. Next Steps Recommendations ← Actionable ending
```

**Stats Card Format:**
```
## 📊 Execution Stats
| Agent | Model | Duration | Status |
|-------|------|------|------|
| 🔍 Researcher A | GLM | 58s | ✅ |
| 🔍 Researcher B | GLM | 62s | ✅ |
| 📊 Analyst  | Kimi | 45s | ✅ |
Serial would take ~165s → Parallel actual 62s, saved **62%** ⚡
```

**❌ Wrong — agent order:**
```
Sub-agent 1 results...
Sub-agent 2 results...
Sub-agent 3 results...  ← Readers have to piece it together themselves, poor experience
```

**✅ Right — content logic:**
```
## Key Conclusions
1. Most important finding A (synthesized from multiple agents)
2. Most important finding B
...

## Detailed Analysis: [Topic 1]
...(integrating content from all relevant agents)

## Detailed Analysis: [Topic 2]
...

## Next Steps Recommendations
...
```

**The main agent rewrites everything in its own words.** Sub-agent outputs are raw material, not the final answer.

### After results — deliver the report (channel-aware)

**Always save to file first. Then deliver based on the current channel.**

```python
# Step 1: Always save to file first
write("/workspace/projects/{topic-slug}/report.md", content)
```

**Then choose delivery method by channel:**

| Channel | Delivery method |
|---------|----------------|
| **feishu** + has `feishu-all-operations` skill | Create Feishu doc → send link (best UX) |
| **feishu** + no Feishu skill | `message(filePath=..., filename="report.md")` — send as attachment |
| **Discord / Telegram / Slack** | `message(message=...)` — Markdown renders normally |
| **Other / unknown** | Save file + tell the user the path |

**Why this matters:** Feishu chat does NOT render Markdown. Sending raw Markdown text shows `##`, `|---|` symbols. Always use attachment or doc link on Feishu.

```python
# Feishu (no Feishu doc skill): send as attachment
message(action="send", filePath="/workspace/projects/{topic-slug}/report.md", filename="report.md")

# Discord/Telegram: send markdown directly
message(action="send", message=report_content)
```

**End with one line:**
```
Need to adjust any direction, or push to a document?
```

**Rules:**
- ✅ Always save `.md` file first — regardless of channel
- ✅ Check current channel before deciding how to send
- ❌ Never paste >300 words of Markdown text on Feishu — it won't render
- ❌ Never just say "Report saved to /path/xxx" — user can't open server paths
- ❌ Never ask "Do you want me to organize this into a document?" — just do it

### Sequential vs parallel — analyst must wait for researchers

**Critical:** Agents spawned in the same round run in parallel and share NO context with each other.

```
❌ Wrong: spawn researcher-A + researcher-B + analyst all at once
          → analyst has no data, returns empty

✅ Right: 
  Round 1: spawn researcher-A + researcher-B (parallel, independent)
  Wait for both to return...
  Round 2: main agent consolidates research results
           → then either: main agent writes analysis itself
           → or: spawn analyst with research results injected as context
```

**Best practice: Any agent that depends on another agent's output should be spawned in a later round, after collecting the dependency.**

---

## 🤖 Model Selection Guide — Which Model for Which Role

Always pick the right model for each agent. State the model explicitly in the announcement.

### Model Roster

| Model | Alias | Characteristics | Best for |
|-------|-------|-----------------|----------|
| `glm` | GLM | Cheap, fast, good Chinese | Search, simple research, status checks |
| `kimi` | Kimi | Long context (128k), strong code | Deep analysis, code, long-form integration |
| `gemini` | Gemini | Great creativity, multimodal | Writing, copy, image understanding |
| `sonnet` | Claude Sonnet | Balanced, stable tool calling | Complex reasoning, planning, review |
| `opus` | Claude Opus | Strongest reasoning | Very complex analysis, architecture design |

### Role → Model mapping (default)

| Role | Default Model | Reason |
|------|---------------|--------|
| 🔍 Researcher | **GLM** | Lightweight search, sufficient and cheap |
| 📊 Analyst | **Kimi** | Long context, handles large amounts of data |
| ✍️ Writer | **Gemini** | Best results for creative writing |
| 💻 Coder | **Kimi** | Long context for code understanding |
| 🔎 Reviewer | **GLM** | Simple judgment, doesn't need heavy artillery |
| 📋 Planner | **Sonnet** | Strong structured planning ability |
| 🧐 Critic | **Sonnet** | Rigorous logic, challenges assumptions |

### When to override defaults

- Task is very simple → Downgrade to GLM (save cost)
- Need highest quality → Upgrade to Opus
- User explicitly specifies a model → Follow user's preference
- Multi-model comparison → Each agent uses different model, specify in announcement

### Always announce the model

In the pre-spawn announcement, every agent line must include the model:
```
✅ Correct: 🔍 Researcher A (GLM) — Research LangChain
❌ Wrong: 🔍 Researcher A — Research LangChain
```

---

## Step 0: Always plan first (dynamic agent count)

**Never hardcode how many agents to spawn.** The right number depends on the task complexity. Always start with a planning step:

```
1. Analyze the task → identify subtopics / dimensions
2. Decide: how many agents? which roles? which mode?
3. Spawn accordingly (could be 2, could be 10)
4. Consolidate results
```

**Example planning output:**
```
Task: "Research the top AI agent frameworks"
→ Plan: 5 researchers (one per framework) + 1 analyst for comparison
→ Mode: Orchestrator (needs web search)
→ Spawn: 5 parallel sub-agents
```

**The number of agents should match the task, not a template.**

---

## Three modes — auto-routed by intent

**You don't need to say which mode.** Just describe the task. The skill reads these two signals:

1. **Need web search / real-time info?** → use sessions_spawn (has tools)
2. **Want multiple draft versions to compare?** → spawn parallel writers

```
User says anything
        ↓
  Wants multiple versions / drafts / angles?
        YES ──→ Also needs web search?
        │              YES → 🔀 Hybrid Mode   (search first, then N drafts)
        │              NO  → 🔄 Pipeline Mode (N drafts in parallel, pure text)
        │
        NO  ──→ Needs web search / file ops?
                       YES → 🎯 Orchestrator Mode (sessions_spawn, parallel)
                       NO  → 🔄 Pipeline Mode     (pure text, faster)
```

**Trigger signals the skill listens for:**

| Signal | Examples | Mode triggered |
|--------|---------|---------------|
| Multi-draft intent | "several versions", "multiple angles", "let me pick", "each write", "different styles" | Pipeline or Hybrid |
| Search intent | "search", "latest", "research", "web lookup", "lookup" | Orchestrator or Hybrid |
| Both | "search and give me several versions", "research then write multiple drafts" | **Hybrid** |
| Neither | "translate", "analyze", "write", plain text tasks | Pipeline |

You can also check with the router directly:
```bash
python scripts/router.py mode "research competitors, write 3 versions of analysis"
# → 🔀 HYBRID
python scripts/router.py mode "research LangChain and write a report"
# → 🎯 ORCHESTRATOR
python scripts/router.py mode "analyze this plan from three angles"
# → 🔄 PIPELINE
```

---

## 🎯 Orchestrator Mode (with tools, truly parallel)

Sub-agents launched via `sessions_spawn`. Each has full OpenClaw tools: web search, file read/write, code execution.

**⚡ How parallelism works:**
Call multiple `sessions_spawn` in the **same tool-call round** — OpenClaw executes them simultaneously. All sub-agents run at once; the main agent collects all results when they finish.

```
Same round → parallel execution:

sessions_spawn(task="Search LangChain...") ──┐
sessions_spawn(task="Search CrewAI...")    ──┤→ all run simultaneously
sessions_spawn(task="Search AutoGen...")   ──┘
sessions_spawn(task="Search LangGraph...") ─┘

↓  (all finish, main agent receives all 4 results)

Main agent consolidates → writes full report
```

**Sequential = spawn one, wait for result, then spawn next.** Use this only when a later task depends on an earlier result (e.g. write report AFTER research is done).

**How to spawn — always include role, model hint, and what to return:**

```python
# Parallel research: spawn all 4 in the same round → they run simultaneously
sessions_spawn({
    "task": "[CONTEXT] Comparing AI agent frameworks for a tech team report.\n\n[YOUR TASK] Search LangChain: architecture, pros/cons, GitHub stars, latest version. Return 5 bullet points ≤100 words each. Do NOT write a full report.",
    "label": "🔍 researcher-langchain [model: default]"
})
sessions_spawn({
    "task": "[CONTEXT] Same report.\n\n[YOUR TASK] Search CrewAI: architecture, pros/cons, GitHub stars, latest version. Return 5 bullet points ≤100 words each.",
    "label": "🔍 researcher-crewai [model: default]"
})
sessions_spawn({
    "task": "[CONTEXT] Same report.\n\n[YOUR TASK] Search AutoGen: architecture, pros/cons, GitHub stars, latest version. Return 5 bullet points ≤100 words each.",
    "label": "🔍 researcher-autogen [model: default]"
})
sessions_spawn({
    "task": "[CONTEXT] Same report.\n\n[YOUR TASK] Search LangGraph: architecture, pros/cons, GitHub stars, latest version. Return 5 bullet points ≤100 words each.",
    "label": "🔍 researcher-langgraph [model: default]"
})
# All 4 run in parallel → when all return, main agent consolidates and writes report
```

**Mixed: parallel then sequential** (most common pattern):
```python
# Phase 1: parallel research (spawn all at once)
sessions_spawn({"task": "[CONTEXT] ...\n\n[TASK] Search LangChain. 5 bullets ≤100 words.", "label": "🔍 researcher-langchain"})
sessions_spawn({"task": "[CONTEXT] ...\n\n[TASK] Search CrewAI. 5 bullets ≤100 words.", "label": "🔍 researcher-crewai"})
sessions_spawn({"task": "[CONTEXT] ...\n\n[TASK] Search AutoGen. 5 bullets ≤100 words.", "label": "🔍 researcher-autogen"})

# Phase 2: after all 3 return → main agent writes report (sequential, depends on research)
# (main agent does this directly, no need to spawn a writer)
```

**Key rules:**
- ✅ **Same round = parallel**: spawn multiple agents at once for independent tasks
- ✅ **Sequential**: spawn one, wait for result, then spawn next — only when tasks depend on each other
- ✅ Sub-agents return **summaries only** (≤100 words per point)
- ✅ Main agent **writes the full report** (avoids token limit failures)
- ✅ Label each agent clearly: role + what model it's using
- ❌ Don't ask a sub-agent to both search AND write a long report

---

## 🔄 Pipeline Mode (pure text, any task)

Runs agents via Python CLI. **No web search, but works for any pure-text task**: writing, analysis, translation, multi-model comparison, brainstorming, code generation.

```bash
cd ~/.openclaw/skills/claw-multi-agent

# Parallel: multiple agents tackle different angles simultaneously
python run.py --mode parallel \
  --agents "fast:🔍 researcher:summarize the pros of microservice architecture" \
           "fast:🔍 researcher:summarize the cons of microservice architecture" \
           "fast:🔍 researcher:list real-world companies using microservices and outcomes" \
           "smart:📊 analyst:compare microservices vs monolith for a 10-person startup" \
  --aggregation synthesize

# Sequential: chain agents, each builds on the previous output
python run.py --mode sequential \
  --agents "fast:📋 planner:break down how to build a REST API in Python" \
           "smart:💻 coder:implement the API based on the plan above" \
           "fast:🔎 reviewer:review the code for bugs and security issues" \
  --aggregation last

# Auto-route: router classifies task and picks tiers automatically
python run.py --auto-route --task "write a technical blog post about GRPO vs PPO"

# Dry-run: preview the plan without executing
python run.py --dry-run \
  --agents "fast:researcher:research X" "smart:writer:write report"
```

**Pipeline mode works great for:**
- Multi-angle analysis (spawn one agent per dimension)
- Multi-model comparison (same task, different models)
- Code pipeline (plan → code → review)
- Batch writing (translate/summarize N documents in parallel)

---

## 🔀 Hybrid Mode (search + multi-draft)

Best of both worlds: sub-agents search the web (with tools), then multiple writers generate parallel drafts from the research.

**When it kicks in:** user wants both real-time research AND multiple versions to compare.

```
Phase 1 (Orchestrator — with tools, parallel):
  sessions_spawn(search topic A) ──┐
  sessions_spawn(search topic B) ──┤ → all run simultaneously
  sessions_spawn(search topic C) ──┘
  ↓ research summaries collected

Phase 2 (Pipeline — pure text, parallel):
  openclaw agent (writer style 1) ──┐
  openclaw agent (writer style 2) ──┤ → all run simultaneously
  openclaw agent (writer style 3) ──┘
  ↓ 3 draft versions returned

Main agent: compare drafts → pick best or synthesize
```

**CLI usage:**
```bash
# Auto: router detects hybrid intent and runs both phases
python run.py --mode hybrid --task "research major AI frameworks, give me 3 comparison reports in different styles" --num-drafts 3

# Auto-mode: let router decide the mode automatically
python run.py --auto-mode --task "search competitor info then write several versions of analysis"
```

**In conversation (sessions_spawn approach):**
```python
# Phase 1: parallel research (spawn all at once)
sessions_spawn({"task": "[CONTEXT] ...\n\n[TASK] Search LangChain. 5 bullets.", "label": "🔍 research-langchain"})
sessions_spawn({"task": "[CONTEXT] ...\n\n[TASK] Search CrewAI. 5 bullets.", "label": "🔍 research-crewai"})
sessions_spawn({"task": "[CONTEXT] ...\n\n[TASK] Search AutoGen. 5 bullets.", "label": "🔍 research-autogen"})

# After all 3 return → Phase 2: main agent writes 3 draft versions itself
# (or spawn 3 pipeline agents with research as context)
```

---

## Smart Router

Built-in task classifier. Auto-picks the right tier based on keywords:

```bash
python scripts/router.py classify "write a Python web scraper"
# → Tier: CODE  (routes to smart model)

python scripts/router.py classify "research the latest LLM papers"
# → Tier: RESEARCH  (routes to fast model)

python scripts/router.py spawn --json --multi "research X and write a report"
# → splits into 2 tasks: RESEARCH + CREATIVE
```

| Tier | Model | Used for |
|------|-------|----------|
| `FAST` | default (light) | Simple queries, status, translation, search |
| `CODE` | default (smart) | Programming, debugging, implementation |
| `RESEARCH` | default (light) | Research, search, compare, survey |
| `CREATIVE` | default (smart) | Writing, articles, documentation |
| `REASONING` | default (best) | Architecture, logic, complex analysis |

---

## contextSharing: Give sub-agents background

Sub-agents start as fresh sessions — they don't know your goal. Add a `[CONTEXT]` block.

**Pattern 1: recent** (recommended — works for 95% of cases)
```
[CONTEXT] User is comparing AI agent frameworks for a team report. Audience: engineers.

[YOUR TASK] Search LangChain pros and cons. Return 5 bullet points ≤100 words each.
```

**Pattern 2: summary** (sequential tasks — pass prior results forward)
```
[PRIOR FINDINGS]
- LangChain: richest ecosystem, steep curve
- CrewAI: clean role separation...

[YOUR TASK] Based on above, search AutoGen. Return 3 unique points not covered above.
```

**Pattern 3: full** (complex background — let agent read a file)
```
[CONTEXT FILE] Read /workspace/research/context.md for full background.

[YOUR TASK] Search latest Test-Time Compute Scaling advances. Return 3 summaries.
```

**Reuse context across parallel agents:**
```python
BG = "Researching RL post-training for ML engineers. Topics: GRPO/DAPO/PPO, veRL."

sessions_spawn({"task": f"[CONTEXT] {BG}\n\n[TASK] Search GRPO vs PPO benchmarks. 5 bullets ≤100 words.", "label": "🔍 researcher-grpo [model: default]"})
sessions_spawn({"task": f"[CONTEXT] {BG}\n\n[TASK] Search DAPO design. 5 bullets ≤100 words.", "label": "🔍 researcher-dapo [model: default]"})
sessions_spawn({"task": f"[CONTEXT] {BG}\n\n[TASK] Search veRL architecture. 5 bullets ≤100 words.", "label": "🔍 researcher-verl [model: default]"})
```

---

## Execution summary — always output this

After every multi-agent run, print a standard card:

```
## 📊 Execution Summary

Mode: 🎯 Orchestrator Mode (sessions_spawn, with tools)

| Agent | Role | Model | Time | Status |
|-------|------|-------|------|--------|
| 🔍 researcher-langchain | Researcher | default | 22s | ✅ |
| 🔍 researcher-crewai    | Researcher | default | 19s | ✅ |
| 🔍 researcher-autogen   | Researcher | default | 24s | ✅ |
| 🔍 researcher-langgraph | Researcher | default | 21s | ✅ |
| ✍️ main (consolidate)   | Writer     | default | 38s | ✅ |

Agents spawned: 4  |  Parallel time: ~24s  |  Serial equivalent: ~86s  |  Saved: ~62s (72%)
```

**Always include:**
- Mode (Orchestrator / Pipeline + Sequential/Parallel)
- Each agent's role emoji + name + model used
- Actual elapsed time per agent
- Total parallel time vs serial equivalent

---

## Preset roles

| Role | Emoji | Best for |
|------|-------|----------|
| `researcher` | 🔍 | Web search, info gathering |
| `writer` | ✍️ | Reports, documentation, articles |
| `coder` | 💻 | Code writing, debugging, implementation |
| `analyst` | 📊 | Data analysis, comparison, statistics |
| `reviewer` | 🔎 | Code / content review, QA |
| `planner` | 📋 | Task planning, decomposition |
| `critic` | 🧐 | Risk analysis, devil's advocate |

---

## ⚠️ Gotchas

### Gotcha 0: Reading files before announcing (most common mistake)
Investigating context before sending the activation announcement causes long silence and risks losing the announcement entirely due to context compression.

- ❌ Receive task → read operators.py → read README → announce → spawn
- ✅ Receive task → **announce immediately** (can say "analyzing task...") → read files → spawn

### Gotcha 1: Sub-agent output token limit
Sub-agents have a ~4096 token output cap. Exceeded → tool args truncated → file writes silently fail.

- ❌ "search AND write a 2000-word report"
- ✅ Sub-agent returns summaries; **main agent writes the report**

### Gotcha 2: Orchestrator Mode has no tools in Pipeline Mode
`python run.py` processes have no `web_search`, `exec`, etc.

- ❌ Pipeline mode: "search the latest news on X"
- ✅ Anything needing real web access → Orchestrator Mode

### Gotcha 3: Parallel agents can't depend on each other
Agents spawned in the same round run simultaneously.

- ❌ Agent-2: "based on Agent-1's results..."
- ✅ Parallel = independent; sequential = chained

### Gotcha 4: Don't hardcode agent count
Match agents to the task, not to a template.

- ❌ Always spawn exactly 3 agents
- ✅ Plan first, then decide: simple task → 2 agents, complex → 8+ agents

---

## Pipeline mode quick reference

```bash
python run.py
  --mode parallel|sequential
  --agents "tier_or_model:🎭role:task description"   # repeatable, any number
  --aggregation synthesize|compare|concatenate|last
  --timeout 300
  --dry-run          # preview without executing
  --auto-route       # router picks tiers automatically
  --list-models      # show current model config
```

| Aggregation | Effect |
|-------------|--------|
| `synthesize` | Main agent summarizes all outputs (default) |
| `compare` | Side-by-side of each agent's output |
| `concatenate` | Outputs joined in order |
| `last` | Final agent's output only (sequential) |

Base directory for this skill: file:///home/runner/workspace/.agents/skills/claw-multi-agent
Relative paths in this skill (e.g., scripts/, reference/) are relative to this base directory.
Note: file list is sampled.
