# Scoring & Forgetting — Memory Evaluation Algorithms (v3.0)

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
reference_boost = max(1.0, log2(referenceCount + 1))
```

Examples:
- `referenceCount = 0` → `max(1.0, log2(1)) = 1.0`
- `referenceCount = 1` → `max(1.0, log2(2)) = 1.0`
- `referenceCount = 7` → `log2(8) = 3.0`
- `referenceCount = 15` → `log2(16) = 4.0`

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

    # Reference boost (logarithmic, floored at 1.0)
    ref_boost = max(1.0, log2(entry.referenceCount + 1))

    # Combine and normalize
    # Max realistic: 2.0 * 1.0 * 4.0 = 8.0
    raw = base * recency * ref_boost
    normalized = raw / 8.0
    return min(1.0, max(0.0, normalized))
```

---

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
3. Move entry from source file to archive.md (original preserved in archive)
4. Set entry.archived = true in index.json
5. Keep the index entry (for relation tracking and reachability graph)
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

---

## Health Score (v3.0 — Five Metrics)

The health score measures overall memory system quality on a 0–100 scale. v3.0 adds a fifth metric: **Reachability**.

### Formula

```
health = (freshness×0.25 + coverage×0.25 + coherence×0.2 + efficiency×0.15 + reachability×0.15) × 100
```

### Metric 1: Freshness (weight: 0.25)

What proportion of entries have been recently referenced?

```
freshness = entries_referenced_in_last_30_days / total_entries
```

- `1.0` = all entries referenced within 30 days (highly active memory)
- `0.0` = no entries referenced recently (abandoned memory)

### Metric 2: Coverage (weight: 0.25)

Are all knowledge categories being actively maintained?

```
categories = [
    "Core Identity", "User", "Projects", "Business",
    "People & Team", "Strategy", "Key Decisions",
    "Lessons Learned", "Environment", "Open Threads"
]
coverage = categories_with_updates_in_last_14_days / len(categories)
```

- `1.0` = all MEMORY.md sections updated recently
- `0.0` = no sections updated (knowledge becoming stale)

### Metric 3: Coherence (weight: 0.2)

How well-connected is the memory graph?

```
coherence = entries_with_at_least_one_relation / total_entries
```

- `1.0` = every entry links to at least one other (rich knowledge graph)
- `0.0` = completely isolated entries (no cross-referencing)

### Metric 4: Size Efficiency (weight: 0.15)

Is MEMORY.md staying concise and well-pruned?

```
efficiency = max(0.0, 1.0 - (memory_md_line_count / 500))
```

- `1.0` = under threshold (concise)
- `0.5` = 250 lines (healthy balance)
- `0.0` = 500+ lines (needs aggressive pruning)

### Metric 5: Reachability (weight: 0.15) — NEW in v3.0

What fraction of the memory graph is mutually reachable via relation links?

#### Definition

The memory graph is a directed graph where nodes are entries (`mem_NNN`) and edges are `related` links. Reachability measures how well-connected this graph is at the level of connected components.

#### Algorithm

```python
def compute_reachability(entries):
    """
    Build undirected adjacency from the 'related' field of all entries.
    Find connected components using union-find or BFS.
    Return the weighted average of (component_size / total_entries)
    for each entry's component.
    """
    if not entries:
        return 0.0

    # Build undirected adjacency list
    adj = defaultdict(set)
    ids = {e["id"] for e in entries if not e.get("archived")}

    for entry in entries:
        if entry.get("archived"):
            continue
        for related_id in entry.get("related", []):
            if related_id in ids:
                adj[entry["id"]].add(related_id)
                adj[related_id].add(entry["id"])

    # BFS to find connected components
    visited = set()
    components = []
    for node in ids:
        if node not in visited:
            component = set()
            queue = [node]
            while queue:
                current = queue.pop()
                if current in visited:
                    continue
                visited.add(current)
                component.add(current)
                queue.extend(adj[current] - visited)
            components.append(len(component))

    total = len(ids)
    if total == 0:
        return 0.0

    # Weighted average: each node contributes its component_size / total
    weighted_sum = sum(size * size for size in components)
    reachability = weighted_sum / (total * total)
    return min(1.0, reachability)
```

#### Interpretation

| Value | Meaning |
|-------|---------|
| `1.0` | All entries in one connected component — perfect graph |
| `0.7–0.9` | Most entries connected, a few isolated clusters |
| `0.4–0.6` | Significant fragmentation — many topics not linked |
| `0.1–0.3` | Heavily fragmented — knowledge silos |
| `0.0–0.1` | Almost no connections — a flat list, not a graph |

#### Notes on archived entries

Archived entries (those with `"archived": true`) are **excluded** from reachability calculations. The metric reflects the quality of active, live memory only. This prevents artificially inflated scores from legacy relation links.

#### Manual improvement

To improve reachability:
- After running a dream, review the `### 💡 Suggestions` block for entries with no relations
- Add `related: [mem_xxx]` links between thematically connected entries
- Use the insight "Reachability at X.XX — Y isolated clusters detected" as a guide

---

## Combined Health Score Formula

For reference, the complete formula with all five metrics:

```
health_raw = (
    freshness    × 0.25 +
    coverage     × 0.25 +
    coherence    × 0.20 +
    efficiency   × 0.15 +
    reachability × 0.15
)
health_score = round(health_raw × 100)  # 0–100 integer
```

### Version history

| Version | Formula |
|---------|---------|
| v1.0 | No health score |
| v2.0 | `freshness×0.3 + coverage×0.3 + coherence×0.2 + efficiency×0.2` |
| v3.0 | `freshness×0.25 + coverage×0.25 + coherence×0.2 + efficiency×0.15 + reachability×0.15` |

---

## Interpreting Scores

| Score | Rating | Action |
|-------|--------|--------|
| 80–100 | Excellent | Maintain current cycle |
| 60–79 | Good | Minor suggestions |
| 40–59 | Fair | Review pruning and coverage |
| 20–39 | Poor | Aggressive maintenance needed |
| 0–19 | Critical | Manual intervention recommended |

---

## Suggestion Triggers

Generate suggestions in the dream report when:

| Condition | Suggestion |
|-----------|------------|
| `freshness < 0.5` | "Many entries are stale — review for relevance or increase cross-referencing" |
| `coverage < 0.5` | "Several MEMORY.md sections haven't been updated — check for knowledge gaps" |
| `coherence < 0.3` | "Low entry connectivity — consider linking related memories manually" |
| `efficiency < 0.3` | "MEMORY.md is large (N lines) — review for pruning or archival opportunities" |
| `reachability < 0.4` | "Memory graph is fragmented (N isolated clusters) — add cross-references between related entries" |
| `no episodes exist` | "Consider grouping project-related entries into episode files" |
| `procedures.md empty` | "No procedural memory recorded — extract workflow patterns from recent logs" |
| `health declining 3+ cycles` | "Health trending down for N cycles — investigate which metric is deteriorating" |
