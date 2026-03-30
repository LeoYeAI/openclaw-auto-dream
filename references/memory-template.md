# Memory Templates (v3.0)

Templates for initializing the v3.0 cognitive memory architecture. All templates are backward-compatible with v2.0 data.

---

## MEMORY.md

```markdown
# MEMORY.md — Long-Term Memory

_Last updated: YYYY-MM-DD_

---

## 🧠 Core Identity
<!-- Agent identity, name, purpose, personality -->

## 👤 User
<!-- User info, preferences, communication style -->

## 🏗️ Projects
<!-- Active projects, architecture, status -->

## 💰 Business
<!-- Metrics, revenue, unit economics -->

## 👥 People & Team
<!-- Team members, contacts, relationships -->

## 🎯 Strategy
<!-- Goals, plans, strategic decisions -->

## 📌 Key Decisions
<!-- Important decisions with dates -->

## 💡 Lessons Learned
<!-- Mistakes, insights, things that worked -->

## 🔧 Environment
<!-- Technical setup, tools, environment notes -->

## 🌊 Open Threads
<!-- Pending tasks, unresolved items -->
```

---

## memory/procedures.md

```markdown
# Procedures — How I Do Things

_Last updated: YYYY-MM-DD_

---

## 🎨 Communication Preferences
<!-- Language, tone, format preferences the user has expressed -->
<!-- e.g., "Prefers Chinese with English technical terms" -->

## 🔧 Tool Workflows
<!-- Learned sequences for tools and integrations -->
<!-- e.g., "Deploy flow: build → test → push to Netlify via CLI" -->

## 📝 Format Preferences
<!-- How the user likes output structured -->
<!-- e.g., "Tables for comparisons, bullet lists for Discord" -->

## ⚡ Shortcuts & Patterns
<!-- Recurring patterns, aliases, quick references -->
<!-- e.g., "When user says 'ship it' → run deploy workflow" -->
```

---

## memory/episodes/ structure

Each episode is a standalone markdown file tracking a project or significant event:

```markdown
# Episode: [Project/Event Name]

_Period: YYYY-MM-DD ~ YYYY-MM-DD_
_Status: active | completed | paused_
_Related: mem_xxx, mem_yyy_

---

## Timeline
<!-- Chronological entries, each with a date -->
- **YYYY-MM-DD** — What happened

## Key Decisions
<!-- Major choices made during this episode -->
- **YYYY-MM-DD** — Decision and rationale

## Lessons
<!-- What was learned from this episode -->
- Insight or takeaway
```

Naming convention: `memory/episodes/<kebab-case-name>.md`
Examples: `memory/episodes/myclaw-launch.md`, `memory/episodes/series-a-fundraise.md`

---

## memory/index.json (v3.0 Schema)

```json
{
  "version": "3.0",
  "lastDream": null,
  "config": {
    "notificationLevel": "summary",
    "instanceName": "default"
  },
  "entries": [],
  "stats": {
    "totalEntries": 0,
    "avgImportance": 0,
    "lastPruned": null,
    "healthScore": 0,
    "healthMetrics": {
      "freshness": 0,
      "coverage": 0,
      "coherence": 0,
      "efficiency": 0,
      "reachability": 0
    },
    "insights": [],
    "healthHistory": []
  }
}
```

### Schema field reference (top-level)

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | Schema version — `"3.0"` for v3 |
| `lastDream` | string \| null | ISO timestamp of last completed dream cycle |
| `config` | object | Runtime configuration (see below) |
| `entries` | array | All memory entry metadata objects (see entry schema) |
| `stats` | object | Aggregate statistics updated each dream cycle |

### config fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `notificationLevel` | string | `"summary"` | Push notification verbosity: `"silent"`, `"summary"`, or `"full"` |
| `instanceName` | string | `"default"` | Human-readable identifier for this instance (used in cross-instance migration and dashboard header) |

### stats fields

| Field | Type | Description |
|-------|------|-------------|
| `totalEntries` | number | Count of all non-archived entries |
| `avgImportance` | number | Mean importance score across all entries |
| `lastPruned` | string \| null | ISO timestamp of last archival operation |
| `healthScore` | number | Latest health score (0–100) |
| `healthMetrics` | object | Per-metric scores for the latest dream |
| `insights` | string[] | Latest dream insights (plain text, 1–3 items) |
| `healthHistory` | array | Chronological health snapshots for trending |

### healthHistory entry

```json
{ "date": "YYYY-MM-DD", "score": 82 }
```

Capped at **90 entries** (trimmed from the front when exceeded). This provides ~3 months of daily trending data for the dashboard chart.

### Entry schema

Each object in `entries` follows this structure:

```json
{
  "id": "mem_001",
  "summary": "One-line summary of the memory entry",
  "source": "memory/YYYY-MM-DD.md",
  "target": "MEMORY.md#section-name",
  "created": "YYYY-MM-DD",
  "lastReferenced": "YYYY-MM-DD",
  "referenceCount": 1,
  "importance": 0.5,
  "tags": ["tag1", "tag2"],
  "related": ["mem_002"],
  "archived": false
}
```

Field reference:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID: `mem_NNN` (zero-padded to 3+ digits) |
| `summary` | string | One-line plain-text summary |
| `source` | string | File path where the raw info was found |
| `target` | string | File path + section where it was consolidated |
| `created` | string | ISO date when entry was first created |
| `lastReferenced` | string | ISO date when entry was last read/updated |
| `referenceCount` | number | How many times this entry has been referenced |
| `importance` | number | Computed score, 0.0–1.0 |
| `tags` | string[] | Categorization tags |
| `related` | string[] | IDs of related entries (undirected graph edges) |
| `archived` | boolean | True if moved to archive.md; false or absent otherwise |

---

## memory/archive.md

```markdown
# Memory Archive

_Compressed entries that fell below importance threshold._

---

<!-- Format: [id] (created → archived) One-line summary -->
```

---

## memory/dream-log.md

Starts as an empty file. Dream reports are appended after each cycle in the format defined in `dream-prompt.md`. Example of a completed entry:

```markdown
## 🌀 Dream Report — 2026-03-28 04:00 UTC

### 📊 Stats
- Scanned: 7 files | New: 5 | Updated: 3 | Pruned: 1
- MEMORY.md: 142 lines | Episodes: 2 | Procedures: 8 entries

### 🧠 Health: 76/100
- Freshness: 72% | Coverage: 80% | Coherence: 55% | Efficiency: 90% | Reachability: 40%

### 🔮 Insights
- [Gap] No lessons learned recorded for the last 3 projects — consider retrospectives after each milestone
- [Trend] Health improving: 68 → 72 → 76 over last 3 cycles

### 📝 Changes
- [New] mem_089 — Decision to migrate DB to Postgres
- [Updated] mem_042 — MyClaw project status updated to beta
- [Archived] mem_015 — Old API key reference (90+ days, low importance)

### 💡 Suggestions
- Coherence at 55% — link mem_089 to related project entries
- Reachability at 40% — 3 isolated topic clusters detected; add cross-references
```

---

## Directory structure summary

```
workspace/
├── MEMORY.md                    # Long-term structured knowledge
└── memory/
    ├── YYYY-MM-DD.md            # Daily logs (raw, append-only)
    ├── procedures.md            # Procedural memory
    ├── index.json               # Memory index + metadata (v3.0 schema)
    ├── index.json.bak           # Pre-dream backup of index
    ├── archive.md               # Compressed old entries
    ├── dream-log.md             # Dream cycle reports (append-only)
    ├── dashboard.html           # Generated health dashboard (overwritten each run)
    ├── export-YYYY-MM-DD.json   # Cross-instance migration bundles
    └── episodes/
        ├── project-alpha.md     # Episodic memory files (append-only)
        └── product-launch.md
```

---

## v2 → v3 Index Migration

If you have an existing v2.0 `index.json`, apply these changes to upgrade it in-place:

1. Change `"version": "2.0"` → `"version": "3.0"`
2. Add the `config` block:
   ```json
   "config": { "notificationLevel": "summary", "instanceName": "default" }
   ```
3. Expand `stats` to include new fields:
   ```json
   "healthMetrics": { "freshness": 0, "coverage": 0, "coherence": 0, "efficiency": 0, "reachability": 0 },
   "insights": [],
   "healthHistory": []
   ```
4. Seed `healthHistory` with the current `healthScore` entry:
   ```json
   "healthHistory": [{ "date": "<today>", "score": <existing healthScore> }]
   ```
5. Existing `entries` and `stats.totalEntries`, `stats.avgImportance`, `stats.lastPruned`, `stats.healthScore` are fully compatible — no changes needed.

The next dream cycle will populate `healthMetrics`, `insights`, and continue building `healthHistory` automatically.
