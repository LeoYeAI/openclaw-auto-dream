# Scoring & Forgetting — Memory Evaluation Algorithms

## Importance Score

Every memory entry receives an importance score on each dream cycle.

### Formula

```
importance = clamp(base_weight × recency_factor × reference_boost, 0.0, 1.0)
```

### Components

#### base_weight

Default weight determined by user markers:

| Marker | base_weight | Notes |
|--------|-------------|-------|
| (none) | 1.0 | Default |
| `🔥 HIGH` | 2.0 | Doubles importance |
| `📌 PIN` | 1.0 | Normal weight but exempt from archival |
| `⚠️ PERMANENT` | — | Always 1.0 final score, skip formula |

#### recency_factor

How recently the entry was referenced or updated:

```
days_elapsed = today - lastReferenced
recency_factor = max(0.1, 1.0 - (days_elapsed / 180))
```

Characteristics:
- Referenced today: `1.0`
- Referenced 30 days ago: `0.83`
- Referenced 90 days ago: `0.5`
- Referenced 180+ days ago: `0.1` (floor)

#### reference_boost

How many other entries or sessions have referenced this entry:

```
reference_boost = log2(referenceCount + 1)
```

Examples:
- `referenceCount = 0` → `log2(1) = 0.0` ... but we use `max(1.0, ...)` to avoid zeroing out
- `referenceCount = 1` → `log2(2) = 1.0`
- `referenceCount = 7` → `log2(8) = 3.0`
- `referenceCount = 15` → `log2(16) = 4.0`

Corrected formula with floor:

```
reference_boost = max(1.0, log2(referenceCount + 1))
```

### Full pseudocode

```python
def compute_importance(entry, today):
    # Permanent entries always score 1.0
    if "⚠️ PERMANENT" in entry.markers:
        return 1.0
    
    # Base weight from markers
    base = 2.0 if "🔥 HIGH" in entry.markers else 1.0
    
    # Recency decay
    days = (today - entry.lastReferenced).days
    recency = max(0.1, 1.0 - (days / 180))
    
    # Reference boost (logarithmic)
    ref_boost = max(1.0, log2(entry.referenceCount + 1))
    
    # Combine and clamp
    raw = base * recency * ref_boost
    # Normalize: divide by theoretical max to keep in 0-1 range
    # Max realistic: 2.0 * 1.0 * 4.0 = 8.0
    normalized = raw / 8.0
    return min(1.0, max(0.0, normalized))
```

## Forgetting Curve

Entries that are no longer relevant should be gracefully archived, not deleted.

### Archival conditions

An entry is eligible for archival when **ALL** of these are true:

```
1. days_since_last_referenced > 90
2. importance < 0.3
3. NOT marked ⚠️ PERMANENT
4. NOT marked 📌 PIN
5. NOT in an episode file (episodes are append-only)
```

### Archival process

```
1. Compress entry to one-line summary
2. Append to memory/archive.md:
   - [mem_NNN] (YYYY-MM-DD) One-line summary
3. Remove full entry from source file (MEMORY.md or procedures.md)
4. Set entry.archived = true in index.json
5. Keep the index entry (for relation tracking)
```

### Decay visualization

```
Importance
1.0 │ ████
    │ ████████
    │ ████████████
0.5 │ ████████████████
    │ ████████████████████
0.3 │─────────────────────────── archival threshold
    │ ████████████████████████████
0.1 │ ████████████████████████████████
0.0 └──────────────────────────────────→ Days
    0    30    60    90    120   150   180
```

## Health Score

The health score measures overall memory system quality on a 0–100 scale.

### Formula

```
health = (freshness×0.3 + coverage×0.3 + coherence×0.2 + efficiency×0.2) × 100
```

### Components

#### Freshness (weight: 0.3)

What proportion of entries have been recently referenced?

```
freshness = entries_referenced_in_last_30_days / total_entries
```

- 1.0 = all entries referenced within 30 days
- 0.0 = no entries referenced recently (stale memory)

#### Coverage (weight: 0.3)

Are all knowledge categories being maintained?

```
categories = [
    "Core Identity", "User", "Projects", "Business",
    "People & Team", "Strategy", "Key Decisions",
    "Lessons Learned", "Environment", "Open Threads"
]
coverage = categories_with_updates_in_last_14_days / len(categories)
```

- 1.0 = all MEMORY.md sections updated recently
- 0.0 = no sections updated (abandoned memory)

#### Coherence (weight: 0.2)

How well-connected is the memory graph?

```
coherence = entries_with_at_least_one_relation / total_entries
```

- 1.0 = every entry links to at least one other
- 0.0 = completely isolated entries (no knowledge graph)

#### Size Efficiency (weight: 0.2)

Is MEMORY.md staying concise?

```
efficiency = max(0.0, 1.0 - (memory_md_line_count / 500))
```

- 1.0 = empty MEMORY.md (not useful but efficient)
- 0.5 = 250 lines (good balance)
- 0.0 = 500+ lines (needs pruning)

### Interpreting scores

| Score | Rating | Action |
|-------|--------|--------|
| 80–100 | Excellent | Maintain current cycle |
| 60–79 | Good | Minor suggestions |
| 40–59 | Fair | Review pruning and coverage |
| 20–39 | Poor | Aggressive maintenance needed |
| 0–19 | Critical | Manual intervention recommended |

### Suggestion triggers

Generate suggestions in the dream report when:

| Condition | Suggestion |
|-----------|------------|
| `freshness < 0.5` | "Many entries are stale — review for relevance" |
| `coverage < 0.5` | "Several MEMORY.md sections haven't been updated — check for gaps" |
| `coherence < 0.3` | "Low entry connectivity — consider linking related memories" |
| `efficiency < 0.3` | "MEMORY.md is large (N lines) — review for pruning or archival" |
| `no episodes exist` | "Consider grouping project-related entries into episode files" |
| `procedures.md empty` | "No procedural memory recorded — extract workflow patterns from logs" |
