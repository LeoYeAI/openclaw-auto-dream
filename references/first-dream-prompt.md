# First Dream — Post-Install Memory Scan

Run this ONCE immediately after installing openclaw-auto-dream.
Detect the user's preferred language from workspace context. All output in that language.
Working directory: the workspace root.

## ⚠️ Tool Rules

- **Never run shell commands** (`ls`, `dir`, `grep`, `wc`, `cat`, `python -c`, `python3`) — they fail on Windows
- Use OpenClaw native tools only: `read` to inspect files, `edit`/`write` to mutate
- Counting: use `read` tool to get file content, then count in your reasoning

## Phase 1: Snapshot BEFORE

Count and record these numbers BEFORE making any changes:

Use the `read` tool to inspect each file and count in your reasoning:

- MEMORY_LINES = count lines in MEMORY.md (0 if missing)
- MEMORY_SECTIONS = count `## ` headings in MEMORY.md (0 if missing)
- DECISIONS = count `- ` bullet items under the "Key Decisions" section (0 if missing)
- LESSONS = count `- ` bullet items under the "Lessons Learned" section (0 if missing)
- PROCEDURES = count lines in memory/procedures.md (0 if missing)
- OPEN_THREADS = count `- [` items under the "Open Threads" section (0 if missing)
- DAILY_LOGS = use `read` tool to open each `memory/YYYY-MM-DD.md` file to count them
- UNCONSOLIDATED = count files that do NOT contain `<!-- consolidated -->` at the end
- EPISODES = use `read` tool to check `memory/episodes/` — try to open each file

Save all these values — you will need them for the before/after comparison.

If DAILY_LOGS == 0 AND MEMORY_LINES < 10:
  → This is a FRESH instance. Skip to Phase 5 (Fresh Instance Report).

## Phase 2: Collect

Use the `read` tool on all unconsolidated daily logs (not just last 3 days — this is the first run).
Extract:
- Decisions (choices made, direction changes)
- Key facts (data, metrics, technical details)
- Project progress (milestones, blockers, completions)
- Lessons (failures, wins, things that worked)
- Todos (unfinished items, pending follow-ups)
- Workflow preferences (communication style, format preferences, tool patterns)

Skip small talk. Skip content already in MEMORY.md that hasn't changed.

## Phase 3: Consolidate

Read MEMORY.md with the `read` tool. Compare with extracted content:

- **New** → use `edit` tool to append to appropriate MEMORY.md section
- **Updated** → use `edit` tool to update in place (e.g., newer metrics)
- **Duplicate** → skip
- **Procedures/preferences** → use `edit`/`write` tool to append to memory/procedures.md

Semantic dedup (compare meaning, not exact text).
Update `_Last updated:` date in MEMORY.md.
Use `edit` tool to mark each processed daily log with `<!-- consolidated -->` at end of file.

## Phase 4: Snapshot AFTER + Report

Use the `read` tool again on the same files to count the same metrics:

- MEMORY_LINES_AFTER = count lines in MEMORY.md
- MEMORY_SECTIONS_AFTER = count `## ` headings
- DECISIONS_AFTER = count items in Key Decisions
- LESSONS_AFTER = count items in Lessons Learned
- PROCEDURES_AFTER = count lines in procedures.md
- OPEN_THREADS_AFTER = count Open Threads items

Calculate: NEW_ENTRIES = total new items added, UPDATED_ENTRIES = total items updated.

Find STALE items: entries in Open Threads or other sections not referenced in last 30 days.

Use `edit` tool to write dream report to `memory/dream-log.md`.

Then compose and reply with the First Dream Report (this is your final reply):

```
🧠 Auto-Dream — First Memory Scan Complete!

📦 Your memory assets:
   • {DAILY_LOGS} daily logs ({earliest_date} ~ {latest_date}, spanning {days} days)
   • {MEMORY_LINES} lines of long-term memory (MEMORY.md)
   • {PROCEDURES} lines of workflow preferences
   • {EPISODES} project narratives

🔍 Scan results:
   • Extracted {NEW_ENTRIES} new entries from {UNCONSOLIDATED} logs
   • Updated {UPDATED_ENTRIES} existing entries
   • Found {STALE_COUNT} items stale for 30+ days

📊 Before → After:
   ┌─────────────────┬────────┬────────┐
   │                 │ Before │ After  │
   ├─────────────────┼────────┼────────┤
   │ Long-term memory│ {B}    │ {A}    │
   │ Key decisions   │ {B}    │ {A}    │
   │ Lessons learned │ {B}    │ {A}    │
   │ Procedures      │ {B}    │ {A}    │
   │ Open threads    │ {B}    │ {A}    │
   └─────────────────┴────────┴────────┘

🔮 Insights:
   1. {insight_1}
   2. {insight_2}
   3. {insight_3}

⏰ Daily auto-consolidation is now set up.
   You'll receive a report like this every morning.

💬 Let me know if anything was missed.
```

Then add a personalized reflection based on what you actually found in the logs:

```
💭 After reading through {days} days of your history:
   {2-3 sentence personalized summary of what you observed — mention
   specific projects by name, growth numbers, patterns you noticed.
   End with one sentence about what Auto-Dream will do for them going forward.
   Make it feel like the AI truly read and understood their journey,
   not just counted files.}
```

This reflection is the emotional anchor — it makes users feel "this AI gets me."
Write it naturally, not templated. Reference real content from their logs.

IMPORTANT: Translate the entire report to the user's language before sending.

## Phase 5: Fresh Instance Report

If this is a brand new instance with no daily logs and minimal MEMORY.md:

```
🧠 Auto-Dream Initialized!

✅ Memory architecture is ready:
   • 📝 Long-term memory (MEMORY.md)
   • 🔧 Workflow preferences (procedures.md)
   • 📁 Project narratives (episodes/)
   • 📊 Dream reports (dream-log.md)
   • 📦 Archive (archive.md)

🌱 Starting from zero — and that's fine.
   From now on, every conversation is remembered.
   Every few days, I'll consolidate your daily logs
   into structured long-term memory.

⏰ Daily auto-consolidation scheduled.
   Your first real report will come after a few days of use.

💬 Just chat naturally — I'll handle the rest.
```

Translate to user's language before sending.

## Safety Rules
- Never delete daily log originals — only mark `<!-- consolidated -->`
- Never remove ⚠️ PERMANENT entries
- If MEMORY.md changes >30%, save .bak copy first (use `write` tool with `.bak` path)
