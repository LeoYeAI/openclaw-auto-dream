# Auto-Dream Cycle — Execution Prompt (v3.0)

You are running an automatic memory consolidation cycle ("dream"). Execute all phases below precisely and in order.

## Pre-flight

1. Back up `memory/index.json` to `memory/index.json.bak` (if it exists)
2. Read the last entry of `memory/dream-log.md` (if it exists) for context on what was done last time
3. Note the current UTC timestamp for this dream cycle
4. Read `config.notificationLevel` from `memory/index.json` (default: `"summary"` if absent)

---

## Phase 1: Collect

### 1.1 Scan daily logs

List all `memory/YYYY-MM-DD.md` files. Identify files from the **last 7 days** that do NOT end with `<!-- consolidated -->`.

### 1.2 Read unconsolidated files

Read each unconsolidated daily file in full.

### 1.3 Identify priority markers

While reading, flag entries containing any of these markers for priority processing:
- `<!-- important -->` — user-flagged important entries
- `⚠️` — permanent or high-priority content
- `🔥 HIGH` — high-importance entries
- `📌 PIN` — pinned entries

### 1.4 Extract insights

From each file, extract items in these categories:

| Category | Examples |
|----------|---------|
| **Decisions** | Choices made, commitments, direction changes |
| **People** | New contacts, relationship updates, preferences learned about others |
| **Facts** | User preferences, technical details, account info |
| **Projects** | Progress, blockers, completions, milestones |
| **Lessons** | Mistakes, insights, things that worked or failed |
| **Procedures** | Workflows learned, tool usage patterns, communication preferences |
| **Open threads** | Unresolved tasks, pending items |

**Skip**: routine greetings, small talk, transient debug output, information that already exists unchanged in MEMORY.md.

---

## Phase 2: Consolidate

### 2.1 Read current memory files

Read these files:
- `MEMORY.md`
- `memory/procedures.md` (create from template if missing)
- `memory/index.json` (create from template if missing)
- List `memory/episodes/` directory

### 2.2 Route each extracted item

For each insight extracted in Phase 1, decide its destination:

```
IF item is a "how-to", preference, workflow, or tool pattern:
    → append/update in memory/procedures.md under matching section

ELIF item is part of a multi-event project narrative or significant event arc:
    → append to memory/episodes/<project-name>.md
    → create the episode file if it doesn't exist (use episode template)

ELSE (decisions, facts, people, milestones, lessons, open threads):
    → append/update in MEMORY.md under matching section
```

### 2.3 Semantic deduplication

Before writing any item, check if a semantically equivalent entry already exists:
- Compare **meaning**, not exact text
- If duplicate found: keep the better-worded, more complete version
- If existing entry needs updating (e.g., status changed): update in-place

### 2.4 Assign entry IDs

Every new entry gets a unique ID in format `mem_NNN`:
- Read current max ID from `memory/index.json` entries
- Increment for each new entry
- Record the ID as a comment next to the entry: `<!-- mem_NNN -->`

### 2.5 Link relations

When entries are related to each other:
- Record `related: [mem_xxx, mem_yyy]` in the index entry
- Examples: a decision that affects a project, a lesson learned from a mistake

### 2.6 Write changes

1. Write updated `MEMORY.md` (update `_Last updated:_` line)
2. Write updated `memory/procedures.md` (update `_Last updated:_` line)
3. Write any new/updated episode files
4. **Safety check**: if MEMORY.md changes by more than 30% in size, create `memory/MEMORY.md.bak` before writing

### 2.7 Mark processed files

Append `<!-- consolidated -->` to each daily file that was processed.

---

## Phase 3: Evaluate

### 3.1 Build index entries

For each memory entry (in MEMORY.md, procedures.md, and episodes), ensure an entry exists in `memory/index.json`:

```json
{
  "id": "mem_NNN",
  "summary": "Brief one-line summary",
  "source": "memory/YYYY-MM-DD.md",
  "target": "MEMORY.md#section-name",
  "created": "YYYY-MM-DD",
  "lastReferenced": "YYYY-MM-DD",
  "referenceCount": 1,
  "importance": 0.5,
  "tags": ["tag1", "tag2"],
  "related": ["mem_xxx"]
}
```

### 3.2 Score importance

For each entry, calculate importance using the algorithm in `references/scoring.md`:

```
importance = clamp(base_weight × recency_factor × reference_boost, 0.0, 1.0)
```

Where:
- `base_weight` = 1.0 (default), 2.0 (🔥 HIGH), always 1.0 (⚠️ PERMANENT)
- `recency_factor` = max(0.1, 1.0 - (days_since_last_reference / 180))
- `reference_boost` = max(1.0, log2(referenceCount + 1))

Clamp final importance to [0.0, 1.0] range (⚠️ PERMANENT is always 1.0).

### 3.3 Apply forgetting curve

For entries where ALL conditions are true:
- `lastReferenced` is >90 days ago
- `importance` < 0.3
- NOT marked `⚠️ PERMANENT` or `📌 PIN`

Action:
1. Compress the entry to a one-line summary
2. Append the summary to `memory/archive.md` with original ID and date
3. Remove the full entry from its source file (MEMORY.md or procedures.md)
4. Mark the index entry with `"archived": true`

**Never archive entries from episode files** — episodes are append-only.

### 3.4 Calculate health score

Using the 5-metric formula (see `references/scoring.md` for full details):

```
health = (freshness×0.25 + coverage×0.25 + coherence×0.2 + efficiency×0.15 + reachability×0.15) × 100

freshness    = entries_referenced_in_last_30_days / total_entries
coverage     = categories_with_updates_in_last_14_days / total_categories
coherence    = entries_with_at_least_one_relation / total_entries
efficiency   = max(0, 1.0 - (memory_md_line_count / 500))
reachability = avg(connected_component_size / total_entries) across all components
```

Scale to 0–100 and round to integer.

### 3.5 Update index stats

```json
{
  "stats": {
    "totalEntries": "<count>",
    "avgImportance": "<mean of all importance scores>",
    "lastPruned": "<ISO timestamp or null>",
    "healthScore": "<0-100>",
    "healthMetrics": {
      "freshness": "<0.0-1.0>",
      "coverage": "<0.0-1.0>",
      "coherence": "<0.0-1.0>",
      "efficiency": "<0.0-1.0>",
      "reachability": "<0.0-1.0>"
    },
    "insights": ["<insight text>", "..."]
  }
}
```

Also append a health history snapshot to `stats.healthHistory`:

```json
{ "date": "YYYY-MM-DD", "score": 82 }
```

Trim `healthHistory` to the most recent 90 entries to keep the index compact.

### 3.6 Generate dream report

Append to `memory/dream-log.md`:

```markdown
## 🌀 Dream Report — YYYY-MM-DD HH:MM UTC

### 📊 Stats
- Scanned: N files | New: N | Updated: N | Pruned: N
- MEMORY.md: N lines | Episodes: N | Procedures: N entries

### 🧠 Health: XX/100
- Freshness: XX% | Coverage: XX% | Coherence: XX% | Efficiency: XX% | Reachability: XX%

### 🔮 Insights
- [Pattern] <non-obvious observation with supporting evidence>
- [Trend] <pattern detected across time or multiple entries>
- [Gap] <missing knowledge area worth addressing>

### 📝 Changes
- [New] <brief description of each new entry>
- [Updated] <brief description of each updated entry>
- [Archived] <brief description of each archived entry>

### 💡 Suggestions
- <actionable suggestions based on health scores and insights>
- e.g., "Coherence is low (20%) — consider linking related entries"
- e.g., "MEMORY.md approaching 500 lines — review for pruning opportunities"
- e.g., "Reachability at 0.3 — many isolated memory clusters; add cross-references"
```

### 3.7 Generate Insights

Review the full memory graph, recent changes, health history, and cross-layer patterns. Generate **1–3 non-obvious insights** that a simple health score wouldn't surface:

**Types of insights to look for:**

- **Pattern connections**: Compare entries across different projects or time periods.
  *"Project X's growth strategy mirrors what worked for Project Y — consider applying the same playbook."*

- **Temporal patterns**: Look at `created` and `lastReferenced` dates across entries.
  *"Strategic decisions cluster heavily on Mondays — the user may be doing weekly planning."*

- **Gap detection**: Identify knowledge domains that are conspicuously absent.
  *"No lessons learned have been recorded for the last 4 projects — retrospectives may be overdue."*

- **Trend alerts**: Compare against `healthHistory` for multi-cycle degradation signals.
  *"Memory health has declined for 3 consecutive cycles (85 → 79 → 72) — stale entries are accumulating."*

- **Relationship density**: Entries with many relations vs. isolated entries.
  *"mem_042 is referenced by 8 other entries but has no outbound relations — consider documenting its connections."*

Format each insight as:
```markdown
- [Type] <insight statement with at least one piece of supporting evidence from the memory data>
```

Populate `stats.insights` in index.json with the plain-text insight strings (without the `[Type]` prefix) for dashboard and notification use.

---

## Post-flight: Notification

Based on the `config.notificationLevel` read during Pre-flight:

### If `silent`:
Skip. The dream report has been written to `memory/dream-log.md`. No push message sent.

### If `summary`:
Format a compact 3–5 line message and send it using the `message` tool:

```
🌀 Dream complete — Health: XX/100 | +N new, ~N updated, -N archived
📊 Freshness: XX% | Coverage: XX% | Coherence: XX% | Efficiency: XX% | Reach: XX%
🔮 Insight: [top insight from Phase 3.7]
💡 Tip: [top suggestion from the dream report]
```

Call:
```
message(action="send", message=<formatted text above>)
```

The delivery target is inherited from the cron job's delivery config (the channel that triggered or was configured at setup time).

### If `full`:
Send the complete dream report section as a message. This includes the Stats block, Health block, Insights block, Changes block, and Suggestions block from the dream report. Break into multiple messages if the content exceeds platform limits (e.g., Telegram 4096 char limit).

Call:
```
message(action="send", message=<full dream report markdown>)
```

---

## Post-flight: Dashboard Data Update

Append the latest health snapshot to `stats.healthHistory` in `memory/index.json` (already done in 3.5). This ensures the dashboard always has up-to-date trend data without requiring a separate step.

If `memory/dashboard.html` already exists (was previously generated), note in the dream reply that it should be regenerated to reflect the new data: *"Run 'Generate memory dashboard' to refresh the dashboard with this cycle's data."*

---

## Post-flight: Final Reply

Reply with a brief summary appropriate to the session context:
- What was collected and consolidated
- Current health score and component breakdown
- Top insight (1 sentence)
- Any blocking suggestions
- If nothing needed consolidation, say so clearly
