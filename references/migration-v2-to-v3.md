# Migration Guide: v1 → v2 → v3

This document covers upgrades across all major versions of the OpenClaw Auto-Dream cognitive memory architecture.

**Jump to your upgrade path:**
- [v1 → v2](#v1--v2-upgrade) — simple consolidation to cognitive architecture
- [v2 → v3](#v2--v3-upgrade) — add notifications, dashboard, reachability, insights
- [v1 → v3 direct](#v1--v3-direct) — skip v2, go straight to v3

---

## v1 → v2 Upgrade

### What changes

| Component | v1 | v2 |
|-----------|----|----|
| Memory layers | 1 (MEMORY.md) | 4 (MEMORY.md + procedures + episodes + index) |
| Dream phases | 5 (scan/extract/merge/prune/mark) | 3 (collect/consolidate/evaluate) |
| Scoring | None | Importance scoring with forgetting curve |
| Health tracking | None | 0–100 health score (4 metrics) |
| Entry IDs | None | `mem_NNN` with cross-references |
| User markers | `⚠️ PERMANENT` only | `⚠️ PERMANENT`, `🔥 HIGH`, `📌 PIN`, `<!-- important -->` |
| Dream report | Simple stats | Full report with health, changes, suggestions |

### Migration steps

#### Step 1: Create new directory structure

```bash
mkdir -p memory/episodes
```

#### Step 2: Initialize procedures.md

Create `memory/procedures.md` from the template in `references/memory-template.md`.

Then scan existing MEMORY.md for procedural content:
- Communication preferences → move to `procedures.md` § Communication Preferences
- Tool workflows → move to `procedures.md` § Tool Workflows
- Format preferences → move to `procedures.md` § Format Preferences
- Recurring patterns → move to `procedures.md` § Shortcuts & Patterns

#### Step 3: Extract episodes from MEMORY.md

Look at the Projects section of MEMORY.md. For each project with substantial history:

1. Create `memory/episodes/<project-name>.md`
2. Move the project's timeline, decisions, and lessons into the episode
3. Leave a brief summary + reference in MEMORY.md § Projects

Example:
```markdown
<!-- In MEMORY.md § Projects -->
- **MyClaw** — AI personal assistant platform. See episode: memory/episodes/myclaw.md <!-- mem_042 -->
```

#### Step 4: Generate index.json (v2.0 schema)

Build the initial index by scanning all memory files:

```
For each section entry in MEMORY.md:
  1. Assign ID: mem_001, mem_002, ...
  2. Add <!-- mem_NNN --> comment next to the entry
  3. Create index entry with:
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
  Create one index entry per episode
  target = "memory/episodes/<name>.md"
```

Write result to `memory/index.json` with `"version": "2.0"`.

#### Step 5: Update cron job

The cron payload should use the new `references/dream-prompt.md` content. If you have an existing `auto-memory-dream` cron job:

1. Delete the old cron job
2. Create a new one with the v2 dream prompt

#### Step 6: Preserve existing dream-log.md

If `memory/dream-log.md` exists from v1, keep it. The v2 format is backward-compatible — new reports will use the enhanced format and old entries remain readable.

#### Step 7: Verify

Run a manual dream cycle to validate:
- [ ] All MEMORY.md entries have `<!-- mem_NNN -->` IDs
- [ ] `memory/index.json` has correct entry count with version `"2.0"`
- [ ] `memory/procedures.md` has migrated content
- [ ] Episode files created for major projects
- [ ] Health score calculated and reported

### Rollback from v2 to v1

If you need to revert:
1. The new files (`procedures.md`, `episodes/`, `index.json`) don't interfere with v1
2. Simply switch the cron payload back to the v1 dream prompt
3. MEMORY.md is unchanged in format — v1 can still read it
4. Remove `<!-- mem_NNN -->` comments if desired (cosmetic only)

### Compatibility notes (v1/v2)

- v2 reads the same `<!-- consolidated -->` markers as v1
- Daily log files are untouched — no migration needed
- `memory/archive.md` format is unchanged
- `⚠️ PERMANENT` markers are respected by both versions

---

## v2 → v3 Upgrade

### What changes

| Component | v2 | v3 |
|-----------|----|----|
| Health metrics | 4 (freshness, coverage, coherence, efficiency) | 5 (+reachability) |
| Health formula weights | `×0.3, 0.3, 0.2, 0.2` | `×0.25, 0.25, 0.2, 0.15, 0.15` |
| Dream insights | None | Phase 3.7 — 1–3 non-obvious insights per cycle |
| Push notifications | None | `silent` / `summary` / `full` notification levels |
| Health dashboard | None | `references/dashboard-template.html` → `memory/dashboard.html` |
| Cross-instance migration | None | `references/migration-cross-instance.md` |
| index.json schema | v2.0 | v3.0 — adds `config`, `healthMetrics`, `insights`, `healthHistory` |
| index.json version field | `"2.0"` | `"3.0"` |

### Migration steps

#### Step 1: Update index.json schema

Edit `memory/index.json` in place:

1. Change `"version": "2.0"` → `"version": "3.0"`

2. Add the `config` block after `"lastDream"`:
   ```json
   "config": {
     "notificationLevel": "summary",
     "instanceName": "default"
   }
   ```
   Set `instanceName` to something meaningful (e.g., your server hostname or `"main"`).

3. Expand the `stats` block with new fields:
   ```json
   "healthMetrics": {
     "freshness": 0,
     "coverage": 0,
     "coherence": 0,
     "efficiency": 0,
     "reachability": 0
   },
   "insights": [],
   "healthHistory": []
   ```

4. Seed `healthHistory` from the current health score:
   ```json
   "healthHistory": [
     { "date": "<today's date>", "score": <current healthScore value> }
   ]
   ```

5. All existing `entries` are fully compatible with v3 — **no changes needed to the entries array**.

#### Step 2: Update cron payload

Replace the cron job payload with the v3.0 `references/dream-prompt.md` content.

The v3 dream prompt adds:
- Phase 3.5: Updated stats block (healthMetrics, insights, healthHistory)
- Phase 3.7: Generate Insights
- Post-flight: Notification
- Post-flight: Dashboard data update

If you have an existing `auto-memory-dream` cron job:
1. Delete or update the existing job
2. Create or update with the v3 dream prompt content
3. Confirm the cron job is still set to `sessionTarget: "isolated"`

#### Step 3: Configure notification level

Decide on a notification level and update `config.notificationLevel` in `memory/index.json`:

| Choice | When to use |
|--------|-------------|
| `"silent"` | No interruptions; only update dream-log.md |
| `"summary"` | Quick digest after each cycle (recommended) |
| `"full"` | Full dream report pushed to your channel |

The notification is sent via the `message` tool at the end of each dream cycle. The delivery target is the cron job's configured channel.

#### Step 4: Set instance name (optional but recommended)

Update `config.instanceName` in `memory/index.json` to a human-readable name for this instance. This name appears in:
- The memory health dashboard header
- Cross-instance migration bundle `sourceInstance` field
- Dream notifications (full mode)

#### Step 5: Verify

Run a manual dream cycle to validate the v3 upgrade:
- [ ] `memory/index.json` version is `"3.0"`
- [ ] `config.notificationLevel` is set
- [ ] Dream report includes `### 🔮 Insights` section
- [ ] Health score now shows 5 metrics including Reachability
- [ ] If not `silent`: notification was pushed to your channel
- [ ] `stats.healthHistory` has at least one entry after the dream

---

## v1 → v3 Direct

If you are on v1 and want to skip v2, follow the v1→v2 steps first (to create procedures.md, episodes, and index.json), then immediately follow the v2→v3 steps (to upgrade the schema and cron payload).

The total migration is:
1. `mkdir -p memory/episodes`
2. Create `memory/procedures.md` from template (migrate procedural content from MEMORY.md)
3. Extract episodes for major projects
4. Build `memory/index.json` with v2 schema (`"version": "2.0"`)
5. Immediately upgrade index to v3 schema (add `config`, `healthMetrics`, `insights`, `healthHistory`)
6. Change version field to `"3.0"`
7. Replace cron job payload with v3 dream-prompt.md
8. Run a manual dream cycle to validate

---

## Rollback from v3 to v2

If you need to revert:

1. In `memory/index.json`:
   - Remove the `config` block
   - Remove `healthMetrics`, `insights`, `healthHistory` from `stats`
   - Change `"version": "3.0"` → `"version": "2.0"`
2. Replace the cron payload with the v2 dream-prompt.md content (retrieve from `references/migration-v2-to-v3.md` § Archived v2 Prompt, or re-install the v2 skill)
3. Delete `memory/dashboard.html` (optional, cosmetic)

The `entries` array, MEMORY.md, procedures.md, episodes, and archive are all unchanged — no data loss from rolling back.

---

## Version Compatibility Matrix

| Feature | v1 | v2 | v3 |
|---------|----|----|-----|
| MEMORY.md | ✅ | ✅ | ✅ |
| procedures.md | ❌ | ✅ | ✅ |
| episodes/ | ❌ | ✅ | ✅ |
| index.json | ❌ | ✅ | ✅ (expanded) |
| archive.md | ✅ | ✅ | ✅ |
| dream-log.md | ✅ | ✅ | ✅ (enhanced) |
| Importance scoring | ❌ | ✅ | ✅ |
| Health score (4 metrics) | ❌ | ✅ | — (see below) |
| Health score (5 metrics) | ❌ | ❌ | ✅ |
| Dream insights | ❌ | ❌ | ✅ |
| Push notifications | ❌ | ❌ | ✅ |
| Health dashboard | ❌ | ❌ | ✅ |
| Cross-instance migration | ❌ | ❌ | ✅ |
| `<!-- consolidated -->` markers | ✅ | ✅ | ✅ |
| `⚠️ PERMANENT` marker | ✅ | ✅ | ✅ |
| `🔥 HIGH` / `📌 PIN` markers | ❌ | ✅ | ✅ |
