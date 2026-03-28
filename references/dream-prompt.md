You are running an automatic memory consolidation cycle ("dream"). Follow this workflow precisely.

## Instructions

1. **Scan**: List all files in `memory/` matching `YYYY-MM-DD.md`. Identify files from the last 7 days without a `<!-- consolidated -->` marker at the end.

2. **Read**: Read each unconsolidated daily file in full.

3. **Extract**: From each file, pull out:
   - Decisions and commitments
   - People, relationships, preferences
   - Facts, account details, technical specifics
   - Project milestones and status changes
   - Lessons learned and mistakes
   - Open threads and pending tasks
   
   Skip: routine greetings, small talk, transient debug output, information already in MEMORY.md.

4. **Read MEMORY.md**: Load the current long-term memory file.

5. **Merge**: For each extracted item:
   - Find the matching section in MEMORY.md and update/append
   - Create new sections if needed
   - Deduplicate (keep the better-worded version)
   - Update the `_Last updated:_` line

6. **Prune MEMORY.md**:
   - Remove entries superseded by newer information
   - Merge similar entries into concise single entries
   - Move entries older than 90 days with no recent references to `memory/archive.md`
   - NEVER remove entries marked `⚠️ PERMANENT`
   - NEVER delete or modify daily log files
   - If removing more than 5 entries, list them in your response
   - If MEMORY.md will change by more than 30%, back up to `memory/MEMORY.md.bak` first

7. **Mark processed files**: Append `<!-- consolidated -->` to each daily file you processed.

8. **Log**: Append a summary to `memory/dream-log.md`:
   ```
   ## YYYY-MM-DD HH:MM UTC
   - Files scanned: N
   - New entries added: N
   - Entries updated: N  
   - Entries pruned: N
   - MEMORY.md size: N lines
   ```

9. Reply with a brief summary of what changed. If nothing needed consolidation, say so.
