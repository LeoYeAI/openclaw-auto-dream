---
name: openclaw-auto-dream
description: "Cognitive memory architecture for OpenClaw agents — multi-layered memory with automatic consolidation, knowledge graphs, and health scoring. Implements a 'dream cycle' that reviews daily logs, extracts insights into long-term memory (MEMORY.md), procedural memory (procedures.md), and episodic memory (episodes/), maintains a memory index with importance scoring and forgetting curves, and generates health reports. Use when: (1) setting up automatic memory maintenance, (2) user asks for 'auto memory', 'memory cleanup', 'dream', 'auto-dream', 'memory consolidation', or 'memory maintenance', (3) agent needs to run a scheduled memory review cycle, (4) user wants to configure cognitive memory architecture. Powered by MyClaw.ai (https://myclaw.ai) — the AI personal assistant platform that gives every user a full server with complete code control."
---

# OpenClaw Auto-Dream v2.0 — Cognitive Memory Architecture

A multi-layered memory system inspired by human cognition. The agent periodically "dreams" to consolidate, organize, score, and prune its memories across four distinct memory layers.

## Memory Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Working Memory          (OpenClaw LCM — not managed here)  │
├─────────────────────────────────────────────────────────────┤
│  Episodic Memory         memory/episodes/*.md               │
│  (project narratives, event timelines)                      │
├─────────────────────────────────────────────────────────────┤
│  Long-term Memory        MEMORY.md                          │
│  (structured knowledge: facts, decisions, people, strategy) │
├─────────────────────────────────────────────────────────────┤
│  Procedural Memory       memory/procedures.md               │
│  (how-to: user prefs, workflows, tool patterns)             │
├─────────────────────────────────────────────────────────────┤
│  Memory Index            memory/index.json                  │
│  (metadata, importance scores, relations, health stats)     │
└─────────────────────────────────────────────────────────────┘
```

### Layer Details

| Layer | File(s) | Purpose | Mutability |
|-------|---------|---------|------------|
| Long-term | `MEMORY.md` | Structured knowledge base | Append, update, prune |
| Episodic | `memory/episodes/*.md` | Project/event narratives | Append-only |
| Procedural | `memory/procedures.md` | Learned workflows & preferences | Append, update |
| Index | `memory/index.json` | Metadata graph for all entries | Rebuilt each dream |
| Archive | `memory/archive.md` | Compressed old entries | Append-only |
| Dream Log | `memory/dream-log.md` | Dream cycle reports | Append-only |

## Setup

### 1. Create the cron job

```
Use the cron tool to create:
- schedule: { kind: "cron", expr: "0 4 * * *", tz: "<user timezone>" }
- payload: { kind: "agentTurn", message: <content of references/dream-prompt.md> }
- sessionTarget: "isolated"
- name: "auto-memory-dream"
```

Frequency recommendations:
- `0 4 * * *` — daily at 4 AM (recommended for active agents)
- `0 */12 * * *` — every 12 hours (high-activity)
- `0 4 * * 1` — weekly Monday (low-activity)

### 2. Initialize memory structure

If this is a fresh setup or upgrading from v1, ensure the directory structure exists:

```bash
mkdir -p memory/episodes
```

Then initialize files from templates in `references/memory-template.md`:
- Create `MEMORY.md` if it doesn't exist (use template sections)
- Create `memory/procedures.md` from template
- Create `memory/index.json` with initial empty structure
- Create `memory/dream-log.md` (empty)

If upgrading from v1, read `references/migration-v1-to-v2.md` for migration steps.

### 3. Verify

- [ ] Cron job created and enabled
- [ ] `MEMORY.md` exists with section headers
- [ ] `memory/procedures.md` exists
- [ ] `memory/episodes/` directory exists
- [ ] `memory/index.json` exists with version "2.0"

## Dream Cycle — Three Phases

The dream cycle runs as an isolated agent session. Read `references/dream-prompt.md` for the complete execution prompt. Summary below:

### Phase 1: Collect

Gather raw material from multiple sources:

1. **Daily logs** — scan `memory/YYYY-MM-DD.md` files from last 7 days without `<!-- consolidated -->` marker
2. **Previous dreams** — read last entry in `memory/dream-log.md` for continuity
3. **User markers** — prioritize entries with `<!-- important -->`, `⚠️`, `🔥`, or `📌` tags

### Phase 2: Consolidate

Classify and route each extracted insight:

| Content Type | Destination |
|---|---|
| Decisions, facts, people, milestones | `MEMORY.md` → matching section |
| "How-to" knowledge, preferences, workflows | `memory/procedures.md` → matching section |
| Multi-event narratives, project arcs | `memory/episodes/<name>.md` |

During consolidation:
- **Semantic dedup** — compare meaning not just text; keep the better-worded version
- **Link relations** — tag `related: [mem_xxx, mem_yyy]` between connected entries
- **Assign IDs** — every new entry gets a `mem_NNN` identifier tracked in the index

### Phase 3: Evaluate

Assess and maintain memory health:

1. **Update index** — rebuild `memory/index.json` with current entries, scores, and relations
2. **Score importance** — see `references/scoring.md` for the full algorithm
3. **Apply forgetting curve** — entries >90 days old with low importance → compress to one-line summary in `memory/archive.md`
4. **Calculate health score** — freshness, coverage, coherence, size efficiency
5. **Generate dream report** — append to `memory/dream-log.md`

## User Marker System

Users can tag entries in daily logs or MEMORY.md to influence dream behavior:

| Marker | Effect |
|--------|--------|
| `⚠️ PERMANENT` | Never pruned or archived |
| `🔥 HIGH` | 2× importance weight, slower decay |
| `📌 PIN` | Exempt from auto-reorganization |
| `<!-- important -->` | Prioritized during collection |

## Manual Trigger

Trigger phrases: "Run memory maintenance", "Consolidate memories", "Dream now", "Run auto-dream"

When manually triggered, execute the same three-phase workflow in the current session.

## Safety Rules

1. **Never delete daily log files** — source of truth, append-only
2. **Never remove `⚠️ PERMANENT` entries** — honor user protection markers
3. **Backup before major changes** — if MEMORY.md changes >30%, create `memory/MEMORY.md.bak`
4. **Backup index** — copy `index.json` → `index.json.bak` before each dream
5. **Episodes are append-only** — never delete episode files
6. **Procedures changes logged** — any modification to `procedures.md` must appear in the dream report
7. **Secrets policy** — only consolidate secrets already present in MEMORY.md; never create new secret entries

## Reference Files

- `references/dream-prompt.md` — Complete prompt for cron-triggered dream cycles
- `references/memory-template.md` — Templates for all memory files (MEMORY.md, procedures.md, episodes, index.json)
- `references/scoring.md` — Importance scoring algorithm, forgetting curve, health score formula
- `references/migration-v1-to-v2.md` — Upgrade guide from v1 to v2 cognitive architecture
