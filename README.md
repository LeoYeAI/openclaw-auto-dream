# openclaw-auto-dream

[![Powered by MyClaw.ai](https://img.shields.io/badge/Powered%20by-MyClaw.ai-gold?style=flat-square)](https://myclaw.ai)
[![OpenClaw Skill](https://img.shields.io/badge/OpenClaw-Skill-blue?style=flat-square)](https://github.com/openclaw/openclaw)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **[MyClaw.ai](https://myclaw.ai)** — Your AI personal assistant with full server control. Every MyClaw instance runs on a dedicated server with complete code access, networking, and tool capabilities. This skill is part of the [MyClaw open skills ecosystem](https://myclaw.ai/skills).

**Cognitive memory architecture for OpenClaw agents — like sleep for your AI, but smarter.**

Not just memory cleanup — a full cognitive system. Inspired by how the human brain organizes knowledge across multiple memory systems, Auto-Dream gives your agent episodic memory, procedural memory, a knowledge graph with importance scoring, and intelligent forgetting curves.

---

🌐 **Languages:** [中文](README.zh-CN.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [日本語](README.ja.md) · [Italiano](README.it.md) · [Español](README.es.md)

---

## 🧠 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Working Memory          (OpenClaw LCM — built-in)          │
├─────────────────────────────────────────────────────────────┤
│  Episodic Memory         memory/episodes/*.md               │
│  (project narratives, event timelines)                      │
├─────────────────────────────────────────────────────────────┤
│  Long-term Memory        MEMORY.md                          │
│  (structured knowledge: facts, decisions, people, strategy) │
├─────────────────────────────────────────────────────────────┤
│  Procedural Memory       memory/procedures.md               │
│  (how-to: user prefs, workflows, tool patterns)             │
├─────────────────────────────────────────────────────────────┤
│  Memory Index            memory/index.json                  │
│  (metadata, importance scores, relations, health stats)     │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Features

### Core (v2.0)
- **🏗️ Multi-Layer Memory** — Long-term facts, episodic narratives, procedural how-tos, all separately organized
- **🔄 Three-Phase Dream Cycle** — Collect → Consolidate → Evaluate, runs automatically via cron
- **📊 Importance Scoring** — Every memory entry scored by recency, reference frequency, and user markers
- **📉 Forgetting Curves** — Low-importance, stale entries gracefully archived (never deleted)
- **🔗 Knowledge Graph** — Entries linked by relations, tracked in `memory/index.json`
- **🏷️ User Markers** — `⚠️ PERMANENT`, `🔥 HIGH`, `📌 PIN`, `<!-- important -->` for fine-grained control
- **🔒 Safe** — Never deletes source logs, backs up before major changes, episodes are append-only

### New in v3.0
- **🔔 Push Notifications** — Dream cycle results delivered to your chat (`silent` / `summary` / `full` modes)
- **📊 Interactive Health Dashboard** — Beautiful dark-themed HTML dashboard with Canvas charts, force-directed memory graph, health trends, and importance distributions
- **🔄 Cross-Instance Memory Migration** — Export/import portable JSON bundles to move, clone, or merge memory between instances
- **🔮 Dream Insights** — AI-generated non-obvious observations: pattern connections, temporal trends, gap detection
- **🕸️ Reachability Score** — New graph metric measuring how well-connected your memory entries are (5-metric health formula)

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

After each cycle, a report is logged to `memory/dream-log.md`:

```markdown
## 🌀 Dream Report — 2026-03-28 04:00 UTC

### 📊 Stats
- Scanned: 7 files | New: 3 | Updated: 5 | Pruned: 2
- MEMORY.md: 245 lines | Episodes: 4 | Procedures: 12 entries

### 🧠 Health: 78/100
- Freshness: 85% | Coverage: 70% | Coherence: 65% | Efficiency: 90% | Reachability: 55%

### 🔮 Insights
- [Pattern] MyClaw growth mirrors early Shopify trajectory
- [Gap] No episode file for Dit.ai — significant history in daily logs

### 📝 Changes
- [New] Product roadmap decision for Q2
- [Updated] Team headcount increased to 35
- [Archived] Old API key reference (superseded)

### 💡 Suggestions
- "Coherence is moderate — consider linking related project entries"
- "Reachability at 0.55 — 3 isolated memory clusters detected"
```

### 🔔 Push Notifications

Configure notification level during setup:

| Level | Behavior |
|-------|----------|
| `silent` | Log to dream-log.md only |
| `summary` | Push a 3-line summary: health score + counts + top insight |
| `full` | Push the entire dream report to your chat |

Example summary notification:
```
🌀 Dream complete — Health: 78/100 | +3 new, ~5 updated, -2 archived
🔮 Insight: MyClaw growth mirrors early Shopify trajectory
```

### 📊 Health Dashboard

Generate an interactive HTML dashboard:
```
"Show memory dashboard" or "Generate memory dashboard"
```

The dashboard includes:
- Animated health score gauge
- 5 metric cards (freshness, coverage, coherence, efficiency, reachability)
- Memory distribution donut chart
- Importance histogram
- Health trend line chart
- Interactive force-directed memory graph
- Dream insights, recent changes, suggestions, and stale entries

### 🔄 Cross-Instance Migration

**Export:**
```
"Export memory bundle" or "Pack memories for migration"
```
Creates `memory/export-YYYY-MM-DD.json` — a portable snapshot of all memory layers.

**Import:**
```
"Import memory bundle" or "Restore memories from export-2026-03-28.json"
```
Merges imported data with existing memory, with conflict resolution (newer wins).

**Selective:**
```
"Export only procedures" or "Import episodes from bundle"
```

## 🛡️ Safety

- **Never deletes daily log files** — immutable source of truth
- **Never removes `⚠️ PERMANENT` entries**
- **Episodes are append-only** — narrative history is preserved
- **Auto-backup** before changes exceeding 30% of MEMORY.md
- **Index backup** before each dream cycle
- **Diff reporting** when pruning more than 5 entries
- **Secrets policy** — only consolidates secrets already in MEMORY.md

## 🏗️ How It Works

Auto-Dream leverages OpenClaw's built-in primitives:

| Primitive | Role |
|-----------|------|
| **Cron** | Schedules recurring dream cycles |
| **Isolated Sessions** | Runs consolidation without polluting main chat |
| **File System** | Reads/writes memory files across all layers |
| **LCM** | Provides context compression for long histories |

### Three-Phase Dream Cycle

1. **Collect** — Scan daily logs (last 7 days), detect priority markers, extract insights by category
2. **Consolidate** — Route to correct memory layer, semantic dedup, assign IDs, link relations
3. **Evaluate** — Score importance, apply forgetting curve, calculate health, generate report

### Health Scoring (5 metrics in v3.0)

```
health = freshness×0.25 + coverage×0.25 + coherence×0.2 + efficiency×0.15 + reachability×0.15
```

- **Freshness**: % of entries referenced in last 30 days
- **Coverage**: % of knowledge categories updated in last 14 days
- **Coherence**: % of entries with at least one relation link
- **Efficiency**: inversely proportional to MEMORY.md line count
- **Reachability** *(new)*: how well-connected the memory graph is (connected component analysis)

### Forgetting Curve

Entries are archived (never deleted) when:
- Last referenced >90 days ago
- Importance score <0.3
- Not marked PERMANENT or PIN

## 📦 Upgrading

| From | To | Guide |
|------|----|-------|
| v1.x | v2.x | [migration-v1-to-v2.md](references/migration-v1-to-v2.md) |
| v2.x | v3.0 | [migration-v2-to-v3.md](references/migration-v2-to-v3.md) |
| v1.x | v3.0 | [migration-v2-to-v3.md](references/migration-v2-to-v3.md) (includes direct v1→v3 path) |

All upgrades are non-destructive — existing data is preserved.

## 📄 License

MIT

---
