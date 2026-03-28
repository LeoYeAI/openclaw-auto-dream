# openclaw-auto-dream

[![Powered by MyClaw.ai](https://img.shields.io/badge/Powered%20by-MyClaw.ai-gold?style=flat-square)](https://myclaw.ai)
[![OpenClaw Skill](https://img.shields.io/badge/OpenClaw-Skill-blue?style=flat-square)](https://github.com/openclaw/openclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **[MyClaw.ai](https://myclaw.ai)** — Your AI personal assistant with full server control. Every MyClaw instance runs on a dedicated server with complete code access, networking, and tool capabilities. This skill is part of the [MyClaw open skills ecosystem](https://clawhub.com).

**Automatic memory consolidation for OpenClaw agents — like sleep for your AI.**

An OpenClaw agent skill that automatically reviews daily memory logs, extracts valuable insights, and consolidates them into structured long-term memory. Inspired by how the human brain consolidates memories during sleep — your agent periodically "dreams" to organize what it knows.

---

🌐 **Languages:** [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

---

Inspired by how human brains consolidate memories during sleep, Auto-Dream periodically runs a "dream cycle" that reviews your agent's daily logs, extracts valuable insights, and consolidates them into long-term memory.

## ✨ Features

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
