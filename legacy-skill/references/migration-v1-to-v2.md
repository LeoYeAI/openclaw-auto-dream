# Migration Guide: v1 → v2

Upgrade from Auto-Dream v1 (simple consolidation) to v2 (cognitive memory architecture).

## What changes

| Component | v1 | v2 |
|-----------|----|----|
| Memory layers | 1 (MEMORY.md) | 4 (MEMORY.md + procedures + episodes + index) |
| Dream phases | 5 (scan/extract/merge/prune/mark) | 3 (collect/consolidate/evaluate) |
| Scoring | None | Importance scoring with forgetting curve |
| Health tracking | None | 0–100 health score |
| Entry IDs | None | `mem_NNN` with cross-references |
| User markers | `⚠️ PERMANENT` only | `⚠️ PERMANENT`, `🔥 HIGH`, `📌 PIN`, `<!-- important -->` |
| Dream report | Simple stats | Full report with health, changes, suggestions |

## Migration steps

### Step 1: Create new directory structure

```bash
mkdir -p memory/episodes
```

### Step 2: Initialize procedures.md

Create `memory/procedures.md` from the template in `references/memory-template.md`.

Then scan existing MEMORY.md for procedural content:
- Communication preferences → move to `procedures.md` § Communication Preferences
- Tool workflows → move to `procedures.md` § Tool Workflows
- Format preferences → move to `procedures.md` § Format Preferences
- Recurring patterns → move to `procedures.md` § Shortcuts & Patterns

### Step 3: Extract episodes from MEMORY.md

Look at the Projects section of MEMORY.md. For each project with substantial history:

1. Create `memory/episodes/<project-name>.md`
2. Move the project's timeline, decisions, and lessons into the episode
3. Leave a brief summary + reference in MEMORY.md § Projects

Example:
```markdown
<!-- In MEMORY.md § Projects -->
- **MyClaw** — AI personal assistant platform. See episode: memory/episodes/myclaw.md <!-- mem_042 -->
```

### Step 4: Generate index.json

Build the initial index by scanning all memory files:

```
For each section entry in MEMORY.md:
  1. Assign ID: mem_001, mem_002, ...
  2. Add <!-- mem_NNN --> comment next to the entry
  3. Create index entry:
     - summary: first sentence of the entry
     - source: "migration"
     - target: "MEMORY.md#section-name"
     - created: best guess from entry content or today
     - lastReferenced: today
     - referenceCount: 1
     - importance: 0.5 (will be recalculated on first dream)
     - tags: infer from section name
     - related: link entries that reference each other

For each entry in procedures.md:
  Same process, target = "memory/procedures.md#section-name"

For each episode file:
  Create one index entry per episode (not per line)
  target = "memory/episodes/<name>.md"
```

Write result to `memory/index.json`.

### Step 5: Update cron job

The cron payload should use the new `references/dream-prompt.md` content. If you have an existing `auto-memory-dream` cron job:

1. Delete the old cron job
2. Create a new one with the v2 dream prompt

### Step 6: Preserve existing dream-log.md

If `memory/dream-log.md` exists from v1, keep it. The v2 format is backward-compatible — new reports will use the enhanced format and old entries remain readable.

### Step 7: Verify

Run a manual dream cycle to validate:
- [ ] All MEMORY.md entries have `<!-- mem_NNN -->` IDs
- [ ] `memory/index.json` has correct entry count
- [ ] `memory/procedures.md` has migrated content
- [ ] Episode files created for major projects
- [ ] Health score calculated and reported

## Rollback

If you need to revert to v1:
1. The new files (`procedures.md`, `episodes/`, `index.json`) don't interfere with v1
2. Simply switch the cron payload back to the v1 dream prompt
3. MEMORY.md is unchanged in format — v1 can still read it
4. Remove `<!-- mem_NNN -->` comments if desired (cosmetic only)

## Compatibility notes

- v2 reads the same `<!-- consolidated -->` markers as v1
- Daily log files are untouched — no migration needed
- `memory/archive.md` format is unchanged
- `⚠️ PERMANENT` markers are respected by both versions
