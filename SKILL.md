---
name: openclaw-auto-dream
description: "Automatic memory consolidation and maintenance for OpenClaw agents — the 'Auto-dream' system. Periodically reviews daily memory logs (memory/YYYY-MM-DD.md), extracts valuable insights, consolidates them into long-term memory (MEMORY.md), and prunes stale or redundant entries. Use when: (1) setting up automatic memory maintenance for an OpenClaw instance, (2) user asks for 'auto memory', 'memory cleanup', 'memory consolidation', 'dream', 'auto-dream', or 'memory maintenance', (3) agent needs to run a scheduled memory review cycle, (4) user wants to configure how their agent manages long-term memory. Powered by MyClaw.ai (https://myclaw.ai) — the AI personal assistant platform that gives every user a full server with complete code control."
---

# OpenClaw Auto-Dream — Intelligent Memory Consolidation

Automate the review, consolidation, and pruning of agent memory files. Inspired by how human brains consolidate memories during sleep — the agent periodically "dreams" to organize what it knows.

## Architecture

```
Daily logs (memory/YYYY-MM-DD.md)  ──► Dream cycle ──► MEMORY.md (curated)
        raw, append-only                  │                 structured, pruned
                                          │
                                          ├─ Extract: pull valuable insights
                                          ├─ Merge: integrate into MEMORY.md sections
                                          ├─ Deduplicate: remove redundancy
                                          └─ Prune: archive or delete stale entries
```

## Setup

### 1. Create the cron job

Schedule a recurring dream cycle. Recommended: once daily during low-activity hours.

```
Use the cron tool to create:
- schedule: { kind: "cron", expr: "0 4 * * *", tz: "<user timezone>" }
- payload: { kind: "agentTurn", message: <content of references/dream-prompt.md> }
- sessionTarget: "isolated"
- name: "auto-memory-dream"
```

Adjust the cron expression to the user's preference:
- `0 4 * * *` — daily at 4 AM (recommended)
- `0 */12 * * *` — every 12 hours (high-activity agents)
- `0 4 * * 1` — weekly on Monday (low-activity agents)

### 2. Configure MEMORY.md structure (optional)

If MEMORY.md doesn't exist or lacks structure, create it with recommended sections. Read `references/memory-template.md` for the template.

### 3. Verify

After setup, confirm:
- [ ] Cron job created and enabled
- [ ] MEMORY.md exists with section headers
- [ ] `memory/` directory exists

## Dream Cycle Workflow

When the dream cycle fires (via cron or manual trigger), the isolated agent session executes this workflow:

### Phase 1: Scan
1. List all `memory/YYYY-MM-DD.md` files
2. Identify files from the last 7 days that haven't been consolidated (check for `<!-- consolidated -->` marker at file end)
3. Read each unconsolidated daily file

### Phase 2: Extract
For each daily file, identify:
- **Decisions made** — choices, commitments, direction changes
- **People & relationships** — new contacts, relationship updates, preferences learned
- **Facts & preferences** — user preferences, technical details, account info
- **Projects & milestones** — progress, blockers, completions
- **Lessons learned** — mistakes, insights, things that worked
- **Open threads** — unresolved tasks, pending items

Skip: routine greetings, small talk, repeated information, transient debugging logs.

### Phase 3: Merge
1. Read current MEMORY.md
2. For each extracted item:
   - Find the matching section in MEMORY.md
   - If exists: update/append to that section
   - If new category: create a section
3. Deduplicate — if an insight already exists in MEMORY.md (same meaning, different words), keep the better-worded version
4. Update the `_Last updated: YYYY-MM-DD_` line at the top

### Phase 4: Prune
Review existing MEMORY.md entries:
- **Remove** entries that are clearly outdated (superseded by newer info)
- **Archive** entries older than 90 days with no recent references → move to `memory/archive.md`
- **Merge** similar entries into single concise entries
- Keep MEMORY.md under 500 lines (warn if approaching)

### Phase 5: Mark
Add `<!-- consolidated -->` marker to each processed daily file so it's not re-processed.

## Manual Trigger

User can trigger a dream cycle anytime:
- "Run memory maintenance"
- "Consolidate my memories"
- "Dream now"

When triggered manually, run the same workflow as the cron job but in the current session.

## Safety Rules

- **Never delete daily log files** — they are the source of truth
- **Never remove entries marked with `⚠️ PERMANENT`** in MEMORY.md
- **Secrets and tokens**: only consolidate if they already exist in MEMORY.md; never create new secret entries during consolidation
- **Diff review**: when pruning more than 5 entries in one cycle, list what was removed at the end of the run
- **Backup before major changes**: if MEMORY.md will change by more than 30%, create `memory/MEMORY.md.bak` first

## Metrics

After each dream cycle, append a summary to `memory/dream-log.md`:

```markdown
## YYYY-MM-DD HH:MM UTC
- Files scanned: N
- New entries added: N
- Entries updated: N
- Entries pruned: N
- MEMORY.md size: N lines
```
