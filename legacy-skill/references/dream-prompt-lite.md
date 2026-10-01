# Auto-Dream Lite — Quick Memory Consolidation

Detect the user's preferred language from workspace context. All output in that language.
Working directory: the workspace root.

## ⚠️ Tool Rules

- **Never run shell commands** (`ls`, `dir`, `grep`, `wc`, `cat`, `python -c`, `python3`) — they fail on Windows
- Use OpenClaw native tools only: `read` to inspect files, `edit`/`write` to mutate
- Counting entries: use `read` tool to get file content, then count in your reasoning — no shell scripts needed

## Step 0: Smart Skip

```
Use `read` tool to open `memory/????-??-??.md` files from the last 3 days.
Check the end of each file for `<!-- consolidated -->`.
If all processed or no files exist → go to Step 0-B (Skip With Recall).
```

## Step 0-B: Skip With Recall

Even when skipping, send a useful message. Use `read` tool to inspect `memory/dream-log.md` — count past dream entries in your reasoning (this is the dream streak count). Then use `read` to scan `MEMORY.md` for Open Threads not marked `[x]` — find the oldest one with context.

Also check: are there any daily logs from 14+ days ago that mention topics matching current Open Threads? If so, pick one as a "memory from N days ago".

Reply with this format, then END:

```
🌙 No new content today — skipped consolidation

💭 From your memory:
   {N} days ago ({date}), {one-line context of an old event or decision}.
   {Follow-up question or status check if relevant}

📈 Memory: {total_entries} entries · Health {score}/100 · Streak: {N} dreams
```

If no interesting memory to surface, simplify to:
```
🌙 No new content — skipped · {total_entries} entries · Streak: {N} dreams
```

END here. Do not proceed to Step 1.

## Step 0.5: Snapshot BEFORE

Before making any changes, read `MEMORY.md` with the `read` tool and count in your reasoning:

- MEMORY_LINES = count lines in MEMORY.md
- DECISIONS = count items in Key Decisions section
- LESSONS = count items in Lessons Learned section
- OPEN_THREADS = count items in Open Threads section
- TOTAL_ENTRIES = count all bullet items across MEMORY.md

Also read `memory/dream-log.md` with the `read` tool and count past dream entries → DREAM_COUNT.

## Step 1: Collect

Read all unconsolidated daily logs with the `read` tool. Extract:
- Decisions (choices, direction changes)
- Key facts (data, metrics, technical details)
- Project progress (milestones, blockers, completions)
- Lessons (failures, wins)
- Todos (unfinished items)

Skip small talk and content already in MEMORY.md that hasn't changed.

## Step 2: Consolidate

Read MEMORY.md with the `read` tool, compare with extracted content:

- **New** → use `edit` tool to append to MEMORY.md in the right section
- **Updated** → use `edit` tool to update in place (e.g., newer data)
- **Duplicate** → skip
- **Procedures/preferences** → use `edit`/`write` tool to append to memory/procedures.md

Semantic dedup (compare meaning, not exact text).
Update `_Last updated:` date in MEMORY.md.
Use `edit` tool to mark each processed daily log with `<!-- consolidated -->` at end of file.

## Step 2.5: Snapshot AFTER

Read MEMORY.md again with the `read` tool and count the same metrics. Calculate deltas in your reasoning.

## Step 2.8: Stale Thread Detection

Scan MEMORY.md Open Threads section (use `read` tool). For each uncompleted item (not marked [x]):
- Estimate when it was last mentioned (from daily logs or MEMORY.md dates)
- If stale >14 days, flag it

Collect top 3 oldest stale items for the notification.

## Step 3: Generate Report

Use `edit` tool (or `write` if starting fresh) to append to `memory/dream-log.md`:

```markdown
## 🌙 Dream #{DREAM_COUNT+1} — YYYY-MM-DD

**Scanned**: N files | **New**: N | **Updated**: N | **Total**: {TOTAL_AFTER} entries

### Changes
- [New/Updated] Describe each change

### Insights
- 1-2 non-obvious cross-memory observations (patterns, trends, gaps)

### Stale Threads
- {item} — stale for {N} days

### Suggestions
- Actionable suggestions based on current memory state
```

## Step 3.5: Auto-Refresh Dashboard

If `memory/dashboard.html` exists, regenerate it with latest data from MEMORY.md and dream-log.md. Use `read` tool to get `references/dashboard-template.html`, inject real data replacing `__DREAM_DATA_PLACEHOLDER__`, and use `write` tool to write the result to `memory/dashboard.html`.

If dashboard.html does not exist, skip this step.

## Step 4: Notify

Your final reply (cron delivery will push to user). Use user's language.

### Check for milestones first:

- DREAM_COUNT+1 == 1 → add "🎉 First dream complete!"
- DREAM_COUNT+1 == 7 → add "🏅 One week streak!"
- DREAM_COUNT+1 == 30 → add "🏆 One month streak!"
- TOTAL_AFTER crosses 100/200/500 → add "📊 Memory milestone: {N} entries!"

### Is today Sunday? → Add weekly summary

If today is Sunday (or DREAM_COUNT+1 is a multiple of 7), prepend a weekly summary section:

```
📊 Weekly Report ({date_range})

🧠 This week: +{weekly_new} new · {weekly_updated} updated · {weekly_archived} archived
   {TOTAL_BEFORE_WEEK} → {TOTAL_AFTER} entries ({percent}% growth)

📌 Biggest memories this week:
   1. {most significant new entry}
   2. {second}
   3. {third}

---
```

### Daily notification format:

```
🌙 Dream #{N} complete

📥 Today: +{NEW} new, ~{UPDATED} updated
📈 Total: {BEFORE} → {AFTER} entries ({percent}% growth)
   Running for {DREAM_COUNT} days

🧠 Highlights:
   • 💡/🔄/📦 {change_1}
   • 💡/🔄/📦 {change_2}
   (max 3-5, summarize if more)

🔮 Insight:
   {One most valuable cross-memory observation}

⏳ Stale reminders:
   • {item_1} — {N} days, last context: {one-line}
   • {item_2} — {N} days
   (top 3, omit section if none)

{milestone line if any}

💬 Let me know if anything was missed
```

This reply is your ONLY output. Concise and high-value.

## Safety Rules
- Never delete daily log originals
- Never remove ⚠️ PERMANENT entries
- If MEMORY.md changes >30% → save .bak copy first (use `write` tool with a new `.bak` path)
