# Memory Templates

Templates for initializing the v2.0 cognitive memory architecture.

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
<!-- Technical setup, tools, credentials (only if already stored) -->

## 🌊 Open Threads
<!-- Pending tasks, unresolved items -->
```

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

## memory/index.json

```json
{
  "version": "2.0",
  "lastDream": null,
  "entries": [],
  "stats": {
    "totalEntries": 0,
    "avgImportance": 0,
    "lastPruned": null,
    "healthScore": 0
  }
}
```

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
  "related": ["mem_002"]
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
| `related` | string[] | IDs of related entries |
| `archived` | boolean | (optional) True if moved to archive |

## memory/archive.md

```markdown
# Memory Archive

_Compressed entries that fell below importance threshold._

---

<!-- Format: [id] (created) summary -->
```

## memory/dream-log.md

Starts as an empty file. Dream reports are appended after each cycle. See `dream-prompt.md` for the report format.

## Directory structure summary

```
workspace/
├── MEMORY.md                    # Long-term structured knowledge
└── memory/
    ├── YYYY-MM-DD.md            # Daily logs (raw, append-only)
    ├── procedures.md            # Procedural memory
    ├── index.json               # Memory index + metadata
    ├── archive.md               # Compressed old entries
    ├── dream-log.md             # Dream cycle reports
    └── episodes/
        ├── project-alpha.md     # Episodic memory files
        └── product-launch.md
```
