<p align="center">
  <a href="https://myclaw.ai"><img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-blue?style=for-the-badge" alt="Powered by MyClaw.ai" /></a>
  <a href="https://clawhub.ai/skills/openclaw-auto-dream"><img src="https://img.shields.io/badge/ClawHub-openclaw--auto--dream-orange?style=for-the-badge" alt="ClawHub" /></a>
</p>

<p align="center">
  <a href="README.md">English</a> ·
  <a href="README.zh-CN.md">中文</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.es.md">Español</a>
</p>

# 🌀 OpenClaw Auto-Dream

**Automatic memory consolidation for OpenClaw agents — like sleep for your AI.**

Inspired by how human brains consolidate memories during sleep, Auto-Dream periodically runs a "dream cycle" that reviews your agent's daily logs, extracts valuable insights, and consolidates them into long-term memory.

## ✨ What It Does

```
Daily logs (memory/YYYY-MM-DD.md)  ──► Dream cycle ──► MEMORY.md (curated)
        raw, append-only                  │                 structured, pruned
                                          │
                                          ├─ Extract: pull valuable insights
                                          ├─ Merge: integrate into MEMORY.md
                                          ├─ Deduplicate: remove redundancy
                                          └─ Prune: archive stale entries
```

- **🔍 Scan** — Reviews the last 7 days of daily memory logs
- **🧠 Extract** — Identifies decisions, lessons, people, projects, and open threads
- **🔗 Merge** — Integrates into structured MEMORY.md sections with deduplication
- **✂️ Prune** — Archives stale entries, merges similar ones, keeps memory lean
- **🔒 Safe** — Never deletes source logs, backs up before major changes

## 📦 Installation

### Via ClawHub (recommended)

```bash
clawhub install openclaw-auto-dream
```

### Manual

Clone this repo into your OpenClaw skills directory:

```bash
git clone https://github.com/LeoYeAI/openclaw-auto-dream.git ~/.openclaw/workspace/skills/openclaw-auto-dream
```

## 🚀 Usage

### Automatic (Cron)

The skill sets up a daily cron job that runs in an isolated session:

- Default schedule: **4:00 AM daily** (configurable)
- Runs as an isolated agent session — no interference with your main chat
- Tracks processed files to avoid re-consolidation

### Manual Trigger

Just tell your agent:

- "Run memory maintenance"
- "Consolidate my memories"
- "Dream now"

### Dream Cycle Output

After each cycle, a summary is logged to `memory/dream-log.md`:

```markdown
## 2026-03-28 04:00 UTC
- Files scanned: 7
- New entries added: 3
- Entries updated: 5
- Entries pruned: 2
- MEMORY.md size: 245 lines
```

## 🛡️ Safety

- **Never deletes daily log files** — they are the immutable source of truth
- **Never removes `⚠️ PERMANENT` entries** in MEMORY.md
- **Auto-backup** before changes exceeding 30% of MEMORY.md
- **Diff reporting** when pruning more than 5 entries

## 🏗️ Architecture

Auto-Dream leverages OpenClaw's built-in primitives:

| Primitive | Role |
|-----------|------|
| **Cron** | Schedules recurring dream cycles |
| **Isolated Sessions** | Runs consolidation without polluting main chat |
| **File System** | Reads/writes memory Markdown files |
| **LCM** | Provides context compression for long histories |

## 📄 License

MIT

---

<p align="center">
  <b>Powered by <a href="https://myclaw.ai">MyClaw.ai</a></b> — The AI personal assistant platform that gives every user a full server with complete code control.
</p>
