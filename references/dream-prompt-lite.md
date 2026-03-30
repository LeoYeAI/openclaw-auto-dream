# Auto-Dream Lite — Quick Memory Consolidation

Read USER.md to determine user's language. All output in that language.
Working directory: the workspace root.

## Step 0: Smart Skip

```
ls memory/????-??-??.md → find files from last 3 days
Check each file's end for <!-- consolidated -->
If all processed or no files → reply "🌙 No new content, skipping" → END
```

## Step 0.5: Snapshot BEFORE

Before making any changes, count:
```
MEMORY_LINES = wc -l MEMORY.md
DECISIONS = count items in Key Decisions section
LESSONS = count items in Lessons Learned section
OPEN_THREADS = count items in Open Threads section
```

## Step 1: Collect

Read all unconsolidated daily logs. Extract:
- Decisions (choices, direction changes)
- Key facts (data updates, account info, technical details)
- Project progress (milestones, blockers, completions)
- Lessons (failures, wins)
- Todos (unfinished items)

Skip small talk and content already in MEMORY.md that hasn't changed.

## Step 2: Consolidate

Read MEMORY.md, compare with extracted content:

- **New** → append to MEMORY.md in the right section
- **Updated** → update in place (e.g., newer data)
- **Duplicate** → skip
- **Procedures/preferences** → append to memory/procedures.md

Semantic dedup (compare meaning, not exact text).
Update `_Last updated:` date in MEMORY.md.
Mark each processed daily log with `<!-- consolidated -->` at end of file.

## Step 2.5: Snapshot AFTER

Count the same metrics again after changes.

## Step 3: Generate Report

Append to memory/dream-log.md:

```markdown
## 🌙 Memory Consolidation — YYYY-MM-DD

**Scanned**: N files | **New**: N | **Updated**: N

### Changes
- [New/Updated] Describe each change

### Insights
- 1-2 non-obvious cross-memory observations (patterns, trends, gaps)

### Suggestions
- Actionable suggestions based on current memory state
```

## Step 4: Notify

Your final reply (cron delivery will push to user). Use user's language:

```
🌙 Memory consolidation complete

📥 Scanned N days of logs ({date_range})
   └ Extracted N new, updated N

📊 Before → After:
   Memory: {B} → {A} lines
   Decisions: {B} → {A}
   Lessons: {B} → {A}

🧠 Changes:
   • 💡/🔄/📦 Describe each change (max 5, summarize if more)

🔮 Insight:
   One most valuable cross-memory observation

💬 Let me know if anything was missed
```

This reply is your ONLY output. Concise and high-value.

## Safety Rules
- Never delete daily log originals
- Never remove ⚠️ PERMANENT entries
- Backup: MEMORY.md changes >30% → save MEMORY.md.bak first
