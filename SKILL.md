---
name: openclaw-auto-dream
description: "Cognitive memory architecture for OpenClaw agents — periodic dream cycles that consolidate daily logs into structured long-term memory with importance scoring, insights, and push notifications. Use when: user asks for 'auto memory', 'dream', 'auto-dream', 'memory consolidation', 'memory dashboard', 'export memory'. Powered by MyClaw.ai (https://myclaw.ai)."
---

# OpenClaw Auto-Dream — Memory Consolidation System

Agent periodically "dreams" — scans daily logs, extracts key knowledge, consolidates into long-term memory, and sends a summary report to the user.

## Core Files

| File | Purpose | Mutability |
|------|---------|------------|
| `MEMORY.md` | Structured long-term knowledge | Append, update |
| `memory/procedures.md` | Workflow preferences, tool usage | Append, update |
| `memory/episodes/*.md` | Project narratives | Append only |
| `memory/index.json` | Metadata index (v3.0 schema) | Rebuilt each dream |
| `memory/dream-log.md` | Dream report log | Append only |
| `memory/archive.md` | Summarized older entries | Append only |

Optional: LCM plugin (Working Memory layer). If not installed, prompt the user:
> "Recommended: install the LCM plugin for working memory: `openclaw plugins install @martian-engineering/lossless-claw`"

Do not auto-install plugins or modify config.

## Setup

### 0. First Dream (Run Immediately After Install)

After setup is complete, DO NOT wait for the cron schedule. Immediately run the First Dream:

1. Read `references/first-dream-prompt.md`
2. Execute every step in the current session (not isolated — user should see it happen)
3. This performs a scan of existing daily logs, consolidates them, and sends a before/after comparison report
4. The report shows the user exactly what Auto-Dream found and organized — this is the Aha moment

If the user has existing daily logs, they'll see their scattered knowledge consolidated instantly.
If the instance is brand new, they'll see the memory architecture initialized and ready.

### 1. Initialize Files

```bash
mkdir -p memory/episodes
```

Ensure the following files exist (create from `references/memory-template.md` templates if missing):
- `memory/index.json`
- `memory/procedures.md`
- `memory/dream-log.md`
- `memory/archive.md`

### 2. Create Cron Job

```
name: "auto-memory-dream"
schedule: { kind: "cron", expr: "0 4 * * *", tz: "<user timezone>" }
payload: {
  kind: "agentTurn",
  message: "Run auto memory consolidation.\n\nRead skills/skills/openclaw-auto-dream/references/dream-prompt-lite.md and follow every step strictly.\n\nWorking directory: /home/ubuntu/.openclaw/workspace",
  timeoutSeconds: 600
}
sessionTarget: "isolated"
delivery: { mode: "announce" }
```

### 3. Verify

- [ ] Cron job created and enabled
- [ ] `MEMORY.md` exists with section headers
- [ ] `memory/index.json` exists
- [ ] `memory/procedures.md` exists
- [ ] `memory/dream-log.md` exists

## Dream Cycle Flow

Each dream runs in an isolated session (see `references/dream-prompt-lite.md`):

### Step 0: Smart Skip + Recall
Check if any unconsolidated daily logs exist in the last 7 days. All processed → still send a useful message: surface an old memory ("N days ago, you decided...") and show streak count. Never send a blank "nothing to do" message.

### Step 1: Collect
Read unconsolidated daily logs. Extract decisions, facts, progress, lessons, and todos.

### Step 2: Consolidate
Compare with MEMORY.md → append new content, update existing, skip duplicates. Write workflow preferences to procedures.md. Mark processed daily logs with `<!-- consolidated -->`.

### Step 2.8: Stale Thread Detection
Scan Open Threads for items stale >14 days. Include top 3 in notification with context.

### Step 3: Generate Report + Auto-Refresh Dashboard
Append to dream-log.md with change list + insights + suggestions. If dashboard.html exists, regenerate with latest data.

### Step 4: Notify with Growth Metrics
Send a consolidation report showing:
- Before → after comparison (entries, decisions, lessons)
- Cumulative growth ("142 → 145 entries, +2.1%")
- Dream streak count ("Dream #14")
- Milestones when hit (first dream, 7-day streak, 100 entries, etc.)
- Top 3 stale reminders (if any)
- Weekly summary on Sundays (week-over-week growth, biggest memories)

### Notification Principles
1. **Every notification must deliver value** — never send empty "nothing happened" messages
2. **Show growth, not just changes** — cumulative stats make the user feel the system is evolving
3. **Surface forgotten context** — stale thread reminders and old memory recalls create surprise and utility
4. **Celebrate milestones** — streak counts and entry milestones build habit and attachment

## Manual Triggers

| Command | Action |
|---------|--------|
| "Consolidate memory" / "Dream now" | Run full dream cycle in current session |
| "Memory dashboard" | Generate memory/dashboard.html |
| "Export memory" | Export memory/export-YYYY-MM-DD.json |

## Language Rules

All output uses the user's preferred language as recorded in USER.md.

## Safety Rules

1. **Never delete daily logs** — only mark with `<!-- consolidated -->`
2. **Never remove ⚠️ PERMANENT items** — user-protected markers
3. **Safe changes** — if MEMORY.md changes >30%, save .bak copy first
4. **Index safety** — save index.json.bak before each dream
5. **Privacy** — follow user's existing MEMORY.md conventions for what to include

## Reference Files

- `references/first-dream-prompt.md` — **First Dream: post-install full scan with before/after report**
- `references/dream-prompt-lite.md` — **Compact prompt for daily cron use** (default)
- `references/dream-prompt.md` — Full prompt (for manual deep consolidation)
- `references/scoring.md` — Importance scoring, forgetting curve, health score algorithms
- `references/memory-template.md` — File templates (MEMORY.md, procedures, index.json, etc.)
- `references/dashboard-template.html` — HTML dashboard template
- `references/migration-cross-instance.md` — Cross-instance migration protocol
- `references/migration-v1-to-v2.md` — v1→v2 upgrade guide
- `references/migration-v2-to-v3.md` — v2→v3 upgrade guide
