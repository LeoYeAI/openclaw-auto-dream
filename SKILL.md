---
name: openclaw-auto-dream
description: "Cognitive memory architecture for OpenClaw agents — periodic dream cycles that consolidate daily logs into structured long-term memory with importance scoring, insights, and push notifications. Use when: user asks for 'auto memory', 'dream', 'auto-dream', 'memory consolidation', 'memory dashboard', 'export memory'. Powered by MyClaw.ai (https://myclaw.ai)."
---

# OpenClaw Auto-Dream — Memory Consolidation System

Agent periodically "dreams" — scans daily logs, extracts key knowledge, consolidates into long-term memory, and sends a summary report to the user.

## Core Files

| File | Purpose | Mutability |
|------|---------|------------|
| `MEMORY.md` | Structured long-term knowledge | Append, update, archive |
| `memory/procedures.md` | Workflow preferences, tool usage | Append, update |
| `memory/episodes/*.md` | Project narratives | Append only |
| `memory/index.json` | Metadata index (v3.0 schema) | Rebuilt each dream |
| `memory/dream-log.md` | Dream report log | Append only |
| `memory/archive.md` | Low-importance compressed archive | Append only |

Optional: LCM plugin (Working Memory layer). If not installed, prompt the user:
> "Recommended: install the LCM plugin for working memory: `openclaw plugins install @martian-engineering/lossless-claw`"

Do not auto-install plugins or modify config.

## Setup

### 0. First Dream (Run Immediately After Install)

After setup is complete, DO NOT wait for the cron schedule. Immediately run the First Dream:

1. Read `references/first-dream-prompt.md`
2. Execute every step in the current session (not isolated — user should see it happen)
3. This performs a full scan of ALL existing daily logs, consolidates them, and sends a before/after comparison report
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

### Step 0: Smart Skip
Check if any unconsolidated daily logs exist in the last 7 days. All processed → skip and exit.

### Step 1: Collect
Read unconsolidated daily logs. Extract decisions, facts, progress, lessons, and todos.

### Step 2: Consolidate
Compare with MEMORY.md → append new content, update existing, skip duplicates. Write workflow preferences to procedures.md. Mark processed daily logs with `<!-- consolidated -->`.

### Step 3: Generate Report
Append to dream-log.md with change list + insights + suggestions.

### Step 4: Notify
Send a consolidation report in the user's preferred language (read from USER.md). Example format:

```
🌙 Memory consolidation complete

📥 Scanned 3 days of logs (3/26-3/28)
   └ Extracted 5 new entries, updated 2

🧠 Changes:
   • 💡 New decision: Auto-Dream switched to detect+prompt mode
   • 🔄 Updated: MyClaw instances 14,504 (+289)
   • 📦 Archived: Early API test records from February

🔮 Insight: Recent decisions cluster around "developer ecosystem",
   but the 3/23 roadmap discussion was interrupted — suggest following up

💬 Let me know if anything was missed
```

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
3. **Backup before major changes** — if MEMORY.md changes >30%, save .bak first
4. **Index backup** — backup index.json → index.json.bak before each dream
5. **Sensitive data policy** — only consolidate sensitive info already present in MEMORY.md

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
