---
name: openclaw-auto-dream
description: "Cognitive memory architecture for OpenClaw agents — multi-layered dream cycle with knowledge graphs, importance scoring, forgetting curves, push notifications, interactive health dashboard, and cross-instance migration. Use when: user asks for 'auto memory', 'dream', 'auto-dream', 'memory consolidation', 'memory dashboard', 'memory health', 'export memory', 'import memory'. Powered by MyClaw.ai (https://myclaw.ai)."
---

# OpenClaw Auto-Dream v3.0 — Cognitive Memory Architecture

A multi-layered memory system inspired by human cognition. The agent periodically "dreams" to consolidate, organize, score, and prune its memories across four distinct memory layers. v3.0 adds push notifications, an interactive health dashboard, cross-instance memory migration, non-obvious dream insights, and a reachability graph metric.

## Memory Layers

```
┌─────────────────────────────────────────────────────────────┐
│  Working Memory          (LCM — auto-installed by setup)    │
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
| Working | LCM (auto-installed) | Real-time context compression & recall | Managed by LCM plugin |
| Long-term | `MEMORY.md` | Structured knowledge base | Append, update, prune |
| Episodic | `memory/episodes/*.md` | Project/event narratives | Append-only |
| Procedural | `memory/procedures.md` | Learned workflows & preferences | Append, update |
| Index | `memory/index.json` | Metadata graph for all entries | Rebuilt each dream |
| Archive | `memory/archive.md` | Compressed old entries | Append-only |
| Dream Log | `memory/dream-log.md` | Dream cycle reports | Append-only |

## Setup

### 0. Ensure LCM (Lossless Context Management) is active

Auto-Dream requires LCM for the Working Memory layer. Check and install automatically:

1. **Detect**: Read the OpenClaw config (`openclaw.json`) and check if `plugins.slots.contextEngine` is set to `"lossless-claw"` and `plugins.entries.lossless-claw.enabled` is `true`.

2. **If LCM is already active** → skip to Step 1.

3. **If LCM is not installed** → install and configure it:
   ```bash
   openclaw plugins install @martian-engineering/lossless-claw
   ```
   Then patch the config:
   ```json5
   {
     plugins: {
       slots: {
         contextEngine: "lossless-claw"
       },
       entries: {
         "lossless-claw": {
           enabled: true
         }
       }
     }
   }
   ```
   Restart the gateway after config change.

4. **Verify**: Run `openclaw plugins list` and confirm `lossless-claw` shows as active.

> **Note**: LCM provides the Working Memory layer — real-time context compression, semantic search across conversation history, and DAG-based lossless compaction. Without it, Auto-Dream still works for the other four layers, but the agent loses the ability to recall compressed conversation context.

### 1. Create the cron job

```
Use the cron tool to create:
- schedule: { kind: "cron", expr: "0 4 * * *", tz: "<user timezone>" }
- payload: { kind: "agentTurn", message: "读取 skills/skills/openclaw-auto-dream/references/dream-prompt-lite.md，严格按指令执行。第一步是智能跳过检查。" }
- sessionTarget: "isolated"
- delivery: { mode: "announce" }
- name: "auto-memory-dream"
```

Frequency recommendations:
- `0 4 * * *` — daily at 4 AM (recommended for active agents)
- `0 */12 * * *` — every 12 hours (high-activity)
- `0 4 * * 1` — weekly Monday (low-activity)

### 2. Configure notification level (v3.0)

During setup, ask the user which notification level they prefer and record it in `memory/index.json` under `config.notificationLevel`:

| Level | Behavior |
|-------|----------|
| `silent` | Write to dream-log.md only; no push message |
| `summary` | Push a 3–5 line digest: health score, counts, top insight |
| `full` | Push the complete dream report section as a message |

Default: `summary`

The notification is sent via the `message` tool after each dream cycle completes. The delivery target is inherited from the cron job's delivery config.

### 3. Initialize memory structure

If this is a fresh setup or upgrading from v1/v2, ensure the directory structure exists:

```bash
mkdir -p memory/episodes
```

Then initialize files from templates in `references/memory-template.md`:
- Create `MEMORY.md` if it doesn't exist (use template sections)
- Create `memory/procedures.md` from template
- Create `memory/index.json` with initial empty structure (v3.0 schema)
- Create `memory/dream-log.md` (empty)

If upgrading from v1, read `references/migration-v2-to-v3.md` for the full v1→v2→v3 migration path.
If upgrading from v2, read `references/migration-v2-to-v3.md` § "v2 → v3 Upgrade" for the shorter path.

### 5. Verify

- [ ] LCM plugin installed and active (`plugins.slots.contextEngine: "lossless-claw"`)
- [ ] Cron job created and enabled
- [ ] `MEMORY.md` exists with section headers
- [ ] `memory/procedures.md` exists
- [ ] `memory/episodes/` directory exists
- [ ] `memory/index.json` exists with version `"3.0"`
- [ ] `notificationLevel` set in `index.json` config block
- [ ] (Optional) Test push notification by running a manual dream

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
4. **Calculate health score** — freshness, coverage, coherence, efficiency, **reachability** (new in v3.0)
5. **Generate insights (v3.0)** — 1–3 non-obvious pattern observations across the memory graph
6. **Generate dream report** — append to `memory/dream-log.md`
7. **Send notification (v3.0)** — based on configured `notificationLevel`
8. **Update dashboard data (v3.0)** — append latest health snapshot to `healthHistory` in index.json

## v3.0 New Features

### 🔔 Push Notifications

After each dream cycle, the agent optionally pushes a summary to the user's channel:

- **`silent`** — no push; dream is logged silently
- **`summary`** — compact 3–5 line message:
  ```
  🌀 Dream complete — Health: 82/100 | +5 new, ~3 updated, -1 archived
  💡 Insight: Decision frequency is accelerating — consider a decision journal
  ```
- **`full`** — the complete dream report section (stats, changes, insights, suggestions)

Notification level is set in `memory/index.json` at `config.notificationLevel` and can be changed any time by asking "Set dream notifications to [silent/summary/full]".

**Important:** Notifications work via the cron job's `delivery` config. Set `delivery: { mode: "announce" }` on the cron job so the dream cycle's final reply is automatically pushed to the user's channel. The agent simply replies with the notification text — no explicit `message` tool call needed.

### 📊 Memory Health Dashboard

Trigger phrases: "Show memory dashboard", "Generate memory dashboard", "Memory health report"

When triggered, the agent:
1. Reads `memory/index.json` and `memory/dream-log.md`
2. Builds a data JSON object (schema below)
3. Reads the dashboard template from `references/dashboard-template.html`
4. Replaces `__DREAM_DATA_PLACEHOLDER__` with the JSON
5. Writes the result to `memory/dashboard.html`
6. Informs the user the file is ready (and opens it if possible)

#### Dashboard Data Schema

Build this JSON from `memory/index.json` (idx) and `memory/dream-log.md` (log):

```json
{
  "generatedAt": "<current ISO timestamp>",
  "instanceName": "idx.config.instanceName",
  "health": {
    "score": "idx.stats.healthScore",
    "freshness": "idx.stats.healthMetrics.freshness",
    "coverage": "idx.stats.healthMetrics.coverage",
    "coherence": "idx.stats.healthMetrics.coherence",
    "efficiency": "idx.stats.healthMetrics.efficiency",
    "reachability": "idx.stats.healthMetrics.reachability"
  },
  "layers": {
    "longterm": { "entries": "<count entries where target starts with MEMORY.md>", "lines": "<wc -l MEMORY.md>" },
    "episodic": { "files": "<count files in memory/episodes/>", "totalEntries": "<count entries where target starts with memory/episodes/>" },
    "procedural": { "entries": "<count entries where target starts with memory/procedures>" },
    "archive": { "entries": "<count entries where archived=true>" }
  },
  "importanceDistribution": [
    { "range": "0.0-0.2", "count": "<bucket entries by importance>" },
    { "range": "0.2-0.4", "count": "..." },
    { "range": "0.4-0.6", "count": "..." },
    { "range": "0.6-0.8", "count": "..." },
    { "range": "0.8-1.0", "count": "..." }
  ],
  "healthHistory": "idx.stats.healthHistory (last 30 entries)",
  "recentChanges": "<parse latest dream report from log: extract [New]/[Updated]/[Archived] items>",
  "insights": "idx.stats.insights",
  "suggestions": "<parse latest dream report from log: extract Suggestions section items>",
  "staleEntries": "<filter entries where (today - lastReferenced) > 60 and importance < 0.4, sorted by daysSinceReferenced desc, limit 10>",
  "memoryGraph": {
    "nodes": "<for each non-archived entry: {id, label: summary (truncated), importance, layer: longterm|episodic|procedural}>",
    "edges": "<for each entry.related pair: {from, to}>"
  }
}
```

### 🔄 Cross-Instance Memory Migration

Read `references/migration-cross-instance.md` for the full protocol.

**Export** (triggers: "Export memory bundle", "Pack memories for migration"):
- Bundles all memory layers into a portable JSON file
- Output: `memory/export-YYYY-MM-DD.json`
- Selective: "Export only procedures" — exports a single layer

**Import** (triggers: "Import memory bundle", "Restore memories from [file]"):
- Reads the bundle and merges each layer into the current instance
- Conflict resolution: newer `lastReferenced` wins on ID collisions
- Backup of all current files is taken before any changes
- Selective: "Import episodes from bundle" — imports one layer

### 🧠 Dream Insights

After health scoring (Phase 3.7), the dream cycle generates 1–3 non-obvious insights:

- **Pattern connections** — "Project X's strategy mirrors what worked for Project Y"
- **Temporal patterns** — "Strategic decisions tend to cluster on Mondays"
- **Gap detection** — "No lessons learned recorded for the last 3 projects"
- **Trend alerts** — "Memory health declining for 3 consecutive cycles"

Insights appear in the dream report under `### 🔮 Insights` and are included in push notifications.

### 🎯 Memory Reachability Score

A fifth health metric (see `references/scoring.md` for formula):

```
reachability = avg(connected_component_size / total_entries) for all components
```

- `1.0` = all entries reachable from each other (one connected graph)
- `0.1` = many isolated clusters (fragmented knowledge)

Updated 5-metric health formula:
```
health = (freshness×0.25 + coverage×0.25 + coherence×0.2 + efficiency×0.15 + reachability×0.15) × 100
```

## User Marker System

Users can tag entries in daily logs or MEMORY.md to influence dream behavior:

| Marker | Effect |
|--------|--------|
| `⚠️ PERMANENT` | Never pruned or archived |
| `🔥 HIGH` | 2× importance weight, slower decay |
| `📌 PIN` | Exempt from auto-reorganization |
| `<!-- important -->` | Prioritized during collection |

## Manual Trigger Phrases

| Phrase | Action |
|--------|--------|
| "Run memory maintenance" | Full dream cycle in current session |
| "Consolidate memories" | Full dream cycle in current session |
| "Dream now" | Full dream cycle in current session |
| "Run auto-dream" | Full dream cycle in current session |
| "Show memory dashboard" | Generate `memory/dashboard.html` |
| "Generate memory dashboard" | Generate `memory/dashboard.html` |
| "Memory health report" | Generate `memory/dashboard.html` |
| "Export memory bundle" | Export all layers to JSON bundle |
| "Pack memories for migration" | Export all layers to JSON bundle |
| "Export only [layer]" | Selective layer export |
| "Import memory bundle" | Import from JSON bundle file |
| "Restore memories from [file]" | Import from specified bundle file |
| "Import [layer] from bundle" | Selective layer import |
| "Set dream notifications to [level]" | Update `notificationLevel` in index.json |

## Language Rule

Dream cycle notifications, dream reports, and all user-facing output MUST use the user's preferred language as recorded in `USER.md` (field: `Language`). Do NOT default to English. If `USER.md` specifies Chinese, all dream output is in Chinese. If French, all in French. Etc.

This applies to:
- Push notifications (summary / full)
- Dream report entries in `memory/dream-log.md`
- Dashboard suggestions and insights
- Any message sent to the user's channel after a dream cycle

## Safety Rules

1. **Never delete daily log files** — source of truth, append-only
2. **Never remove `⚠️ PERMANENT` entries** — honor user protection markers
3. **Backup before major changes** — if MEMORY.md changes >30%, create `memory/MEMORY.md.bak`
4. **Backup index** — copy `index.json` → `index.json.bak` before each dream
5. **Episodes are append-only** — never delete episode files
6. **Procedures changes logged** — any modification to `procedures.md` must appear in the dream report
7. **Secrets policy** — only consolidate secrets already present in MEMORY.md; never create new secret entries
8. **Migration backup** — before any import operation, back up all current memory files to `memory/pre-import-backup/`
9. **Dashboard is read-only output** — `memory/dashboard.html` is generated; never treat it as an input source

## Reference Files

- `references/dream-prompt-lite.md` — **Lite prompt for cron-triggered dream cycles** (97 lines, self-contained with inline scoring/templates — used by default)
- `references/dream-prompt.md` — Full verbose prompt (311 lines — for manual deep runs or debugging)
- `references/memory-template.md` — Templates for all memory files (MEMORY.md, procedures.md, episodes, index.json)
- `references/scoring.md` — Importance scoring algorithm, forgetting curve, health score formula (5 metrics)
- `references/dashboard-template.html` — HTML dashboard template (data injected at runtime)
- `references/migration-cross-instance.md` — Cross-instance memory bundle export/import protocol
- `references/migration-v1-to-v2.md` — Legacy v1→v2 upgrade guide (preserved for v1 users)
- `references/migration-v2-to-v3.md` — Upgrade guide covering v1→v2→v3 and v2→v3 paths
