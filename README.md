<p align="center">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-D4AF37?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiAyMmgyMEwxMiAyeiIgZmlsbD0iI0Q0QUYzNyIvPjwvc3ZnPg==" alt="Powered by MyClaw.ai" />
  <img src="https://img.shields.io/badge/OpenClaw-Skill-2563EB?style=for-the-badge" alt="OpenClaw Skill" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/Version-3.2-8B5CF6?style=for-the-badge" alt="v3.2" />
</p>

<h1 align="center">🌀 OpenClaw Auto-Dream</h1>

<p align="center">
  <strong>Your AI doesn't just remember. It dreams.</strong>
</p>

<p align="center">
  A cognitive memory architecture that gives OpenClaw agents the ability to sleep, dream, and wake up smarter.<br/>
  Five memory layers. Importance scoring. Forgetting curves. Knowledge graphs. Health dashboards.<br/>
  <em>Not file management — neuroscience.</em>
</p>

<p align="center">
  <a href="https://myclaw.ai">MyClaw.ai</a> · <a href="https://clawhub.ai/skills/openclaw-auto-dream">ClawHub</a> · <a href="https://github.com/openclaw/openclaw">OpenClaw</a>
</p>

---

<p align="center">
  🌐 <a href="README.zh-CN.md">中文</a> · <a href="README.fr.md">Français</a> · <a href="README.de.md">Deutsch</a> · <a href="README.ru.md">Русский</a> · <a href="README.ja.md">日本語</a> · <a href="README.it.md">Italiano</a> · <a href="README.es.md">Español</a>
</p>

---

## 🦞 Part of the MyClaw.ai Ecosystem

<table>
<tr>
<td width="140" align="center">
  <a href="https://myclaw.ai"><img src="https://img.shields.io/badge/🦞-MyClaw.ai-D4AF37?style=for-the-badge" alt="MyClaw.ai" /></a>
</td>
<td>

**[MyClaw.ai](https://myclaw.ai)** is the AI personal assistant platform everyone's obsessed with — a fully-featured OpenClaw Agent running 24/7 on your own dedicated server. Not a chatbot. Not a wrapper. A real agent with full code control, internet access, cron jobs, file systems, databases, and tool integrations. Think of it as hiring a brilliant assistant who never sleeps, never forgets*, and can actually *do things*.

<sub>*With Auto-Dream installed, they literally never forget.</sub>

</td>
</tr>
</table>

### Why MyClaw Changes Everything

Most AI tools give you a chat window. MyClaw gives you a **server**.

Every MyClaw instance runs [OpenClaw](https://github.com/openclaw/openclaw) — the open-source AI agent runtime — on dedicated infrastructure. Your agent has:

- 🖥️ **A full Linux server** — not a sandbox, not a container, a real machine
- 🌐 **Unrestricted internet** — browse, scrape, call APIs, send messages
- ⏰ **Cron & background tasks** — your agent works while you sleep
- 📁 **Persistent file system** — workspace, memory, configs, all yours
- 🧩 **Skill ecosystem** — install new abilities from [ClawHub](https://myclaw.ai/skills) in one command
- 🔌 **Channel integrations** — Telegram, Discord, Slack, WhatsApp, and more
- 🔒 **Your data, your server** — no shared infrastructure, no data mining

This is why Auto-Dream exists. Because when your AI agent has a persistent server, persistent files, and persistent relationships with you — **memory isn't a nice-to-have. It's the foundation of intelligence.**

---

## The Problem

Every AI agent forgets. Session ends, context gone. Files pile up. What was that decision from two weeks ago? Which workflow worked last time? Your agent has amnesia — functional, but forgetting everything the moment it sleeps.

**Auto-Dream fixes this.** Like the human brain consolidating memories during sleep, Auto-Dream runs periodic "dream cycles" that scan, extract, organize, score, link, and prune your agent's knowledge — automatically, safely, and intelligently.

### Why This Matters for MyClaw Users

Your MyClaw agent runs 24/7. It handles your projects, tracks your decisions, remembers your preferences, manages your workflows. Over weeks and months, it accumulates thousands of daily log entries. Without Auto-Dream, that knowledge sits in raw files — unsorted, unscored, disconnected. Your agent has the data but can't *think* about it.

Auto-Dream transforms your agent from a tool that executes commands into a partner that **understands context, learns from history, and connects the dots you didn't see**.

## Why This Is Different

| Feature | Claude Code CLAUDE.md | Typical Memory Plugins | **Auto-Dream** |
|---------|----------------------|----------------------|----------------|
| Memory layers | 1 flat file | 1 file or key-value | **5 cognitive layers** |
| Scoring | ❌ | ❌ | **Importance × Recency × References** |
| Forgetting | Manual cleanup | Delete or nothing | **Gradual decay + archival** |
| Knowledge graph | ❌ | ❌ | **Linked entries + reachability** |
| Health monitoring | ❌ | ❌ | **5-metric score + trend tracking** |
| Cross-instance | ❌ | ❌ | **Export/import/merge bundles** |
| Dashboard | ❌ | ❌ | **Interactive HTML with charts** |

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   ┌─────────────┐   ┌──────────────┐   ┌───────────────────┐   │
│   │   COLLECT    │──▶│ CONSOLIDATE  │──▶│     EVALUATE      │   │
│   │             │   │              │   │                   │   │
│   │ Scan 7 days │   │ Route layers │   │ Score importance  │   │
│   │ Flag markers│   │ Semantic dedup│   │ Forgetting curve  │   │
│   │ Extract     │   │ Assign IDs   │   │ Health metrics    │   │
│   │  insights   │   │ Link relations│  │ Generate insights │   │
│   └─────────────┘   └──────────────┘   └───────────────────┘   │
│                                                                  │
│                      ☽ Dream Cycle ☾                             │
└──────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌──────────────┐ ┌─────────────┐ ┌──────────────┐
     │  📊 Dashboard │ │ 🔔 Notify   │ │ 📝 Dream Log │
     │  HTML + Charts│ │ Push to chat│ │ Append report│
     └──────────────┘ └─────────────┘ └──────────────┘
```

### Five Memory Layers

| Layer | Storage | What Goes Here |
|-------|---------|---------------|
| **Working** | LCM plugin (optional, detected at setup) | Real-time context compression & semantic recall |
| **Episodic** | `memory/episodes/*.md` | Project narratives, event timelines, story arcs |
| **Long-term** | `MEMORY.md` | Facts, decisions, people, milestones, strategy |
| **Procedural** | `memory/procedures.md` | Workflows, preferences, tool patterns, shortcuts |
| **Index** | `memory/index.json` | Metadata, importance scores, relations, health stats |

## Features

### 🧠 Cognitive Dream Cycle

Runs automatically via cron (default: 4 AM daily). Three phases:

1. **Collect** — Scans unconsolidated daily logs (last 7 days), detects priority markers (`⚠️ PERMANENT`, `🔥 HIGH`, `📌 PIN`, `<!-- important -->`), extracts decisions / people / facts / projects / lessons / procedures / open threads

2. **Consolidate** — Routes each insight to the correct memory layer, performs semantic deduplication, assigns unique IDs (`mem_NNN`), creates relation links between connected entries

3. **Evaluate** — Scores importance using `base_weight × recency × reference_boost / 8.0`, applies forgetting curves (>90 days + low importance → archived, never deleted), calculates 5-metric health score, generates 1–3 non-obvious insights, writes dream report, sends notification

### 📊 Importance Scoring

Every entry gets a score on every dream cycle:

```
importance = (base_weight × recency_factor × reference_boost) / 8.0
```

- **Recency**: `max(0.1, 1.0 - days/180)` — gradual decay over 6 months
- **References**: `log₂(count + 1)` — logarithmic boost for frequently-referenced entries
- **Markers**: `🔥 HIGH` doubles base weight; `⚠️ PERMANENT` always scores 1.0

### 📉 Intelligent Forgetting

Memories aren't deleted — they're gracefully archived:
- Entry must be >90 days unreferenced AND importance < 0.3
- Compressed to a one-line summary in `memory/archive.md`
- Original ID preserved for relation tracking
- `⚠️ PERMANENT` and `📌 PIN` entries are immune

### 🕸️ Knowledge Graph

Entries are linked by semantic relations. The reachability metric measures graph connectivity:
- Union-find algorithm across all entry relations
- Detects isolated knowledge clusters
- Suggests cross-references to improve coherence

### 🩺 Health Score (5 Metrics)

```
health = (freshness×0.25 + coverage×0.25 + coherence×0.2 + efficiency×0.15 + reachability×0.15) × 100
```

| Metric | What It Measures |
|--------|-----------------|
| **Freshness** | % of entries referenced in last 30 days |
| **Coverage** | % of knowledge categories updated in last 14 days |
| **Coherence** | % of entries with at least one relation link |
| **Efficiency** | How concise MEMORY.md stays (inversely proportional to line count) |
| **Reachability** | How well-connected the memory graph is |

### 🔔 Push Notifications

Dream results delivered to your chat automatically:

| Level | What You Get |
|-------|-------------|
| `silent` | Nothing — logged to dream-log.md only |
| `summary` | `🌀 Health: 82/100 \| +5 new, ~3 updated, -1 archived \| 💡 Top insight` |
| `full` | Complete dream report with all sections |

### 📊 Interactive Dashboard

A zero-dependency HTML dashboard with:
- Animated health gauge (0–100)
- 5 metric cards with color-coded status
- Memory distribution donut chart
- Importance histogram
- Health trend line chart (last 30 cycles)
- Force-directed knowledge graph visualization
- Recent changes, insights, suggestions, stale entries

Generate it: *"Show memory dashboard"*

### 🔄 Cross-Instance Migration

Move memories between MyClaw instances:

```
"Export memory bundle"    →  memory/export-2026-03-28.json
"Import memory bundle"    →  merges with existing (newer wins)
"Export only procedures"  →  selective layer export
```

Portable JSON bundle format with full metadata, conflict resolution, and pre-import backup. Perfect for users managing multiple MyClaw instances or upgrading to a new server.

### 🔮 Dream Insights

After each cycle, 1–3 non-obvious observations:
- **Pattern connections** — *"Project X's strategy mirrors what worked for Project Y"*
- **Temporal trends** — *"Strategic decisions cluster on Mondays — weekly planning detected"*
- **Gap detection** — *"No lessons recorded for last 4 projects — retrospectives overdue"*
- **Trend alerts** — *"Health declining 3 cycles: 85→79→72 — stale entries accumulating"*
- **Density analysis** — *"mem_042 referenced by 8 entries but has no outbound links"*

## Quick Start

### Install

**Via ClawHub (recommended):**
```bash
clawhub install openclaw-auto-dream
```

**Via your MyClaw agent (easiest):**
> Just tell your agent: *"Install Auto-Dream"* — it handles everything.

**Manual:**
```bash
git clone https://github.com/LeoYeAI/openclaw-auto-dream.git \
  ~/.openclaw/workspace/skills/openclaw-auto-dream
```

### Setup

Tell your agent: **"Set up Auto-Dream"**

The agent will:
1. Create a cron job (default: daily at 4 AM in your timezone)
2. Initialize `memory/index.json` with v3.0 schema
3. Ask your preferred notification level
4. Run the first dream cycle

### Manual Trigger

- *"Run memory maintenance"*
- *"Consolidate my memories"*
- *"Dream now"*

### Dashboard

- *"Show memory dashboard"*
- *"Generate memory dashboard"*

## Dream Report Example

```markdown
## 🌀 Dream Report — 2026-03-28 04:00 UTC

### 📊 Stats
- Scanned: 7 files | New: 5 | Updated: 3 | Pruned: 1
- MEMORY.md: 142 lines | Episodes: 2 | Procedures: 8 entries

### 🧠 Health: 76/100
- Freshness: 72% | Coverage: 80% | Coherence: 55% | Efficiency: 90% | Reachability: 40%

### 🔮 Insights
- [Pattern] MyClaw growth trajectory mirrors early Shopify — consider their Series A playbook
- [Gap] No episode file for infrastructure migration — 12 related entries scattered across daily logs

### 📝 Changes
- [New] mem_089 — Product roadmap decision: prioritize mobile SDK
- [Updated] mem_042 — Team headcount updated: 30 → 35
- [Archived] mem_015 — Old staging API endpoint (superseded 95 days ago)

### 💡 Suggestions
- Coherence at 55% — link mem_089 to related project entries
- Reachability at 0.40 — 3 isolated memory clusters detected; add cross-references
```

## Safety

| Rule | Why |
|------|-----|
| Never delete daily logs | Immutable source of truth |
| Never remove `⚠️ PERMANENT` | User protection is absolute |
| Episodes are append-only | Narrative history preserved forever |
| Auto-backup on >30% change | Prevents accidental corruption |
| Index backup every cycle | Always recoverable |
| Secrets policy | Only consolidates secrets already present |

## Release Notes

### v3.2.0 — Performance Optimization (2026-03-29)

⚡ **~90% token savings on idle days**

- **Smart Skip**: Dream cycle now checks for unconsolidated daily logs first. If nothing new in 7 days → instant exit (~2K tokens vs ~150K)
- **Lite Prompt**: Self-contained 97-line prompt replaces 928 lines across 3 files. Scoring formulas, templates, and all rules inlined
- **Faster Execution**: Cron reads 1 file instead of 3. Timeout reduced 600s → 300s
- **Full prompt preserved**: `dream-prompt.md` (311 lines) kept for manual deep runs and debugging

### v3.1.1 — Language & Stability (2026-03-28)

- **User language support**: Dream notifications/reports auto-detect language from `USER.md`
- **Notification redesign**: Uses cron `delivery:announce` instead of direct message tool calls
- **7 bug fixes**: Scoring normalization, health formula, dashboard compatibility, reference integrity

### v3.0.0 — Cognitive Architecture (2026-03-28)

🧠 **Major release — full cognitive memory system**

- **Push Notifications**: 3 levels (silent/summary/full) auto-sent after dream cycle
- **Memory Health Dashboard**: 18KB single-file HTML with Canvas charts and force-directed knowledge graph
- **Cross-Instance Migration**: JSON bundle export/import with conflict resolution
- **Dream Insights**: 1-3 non-obvious pattern observations per cycle
- **Reachability Graph**: Union-find algorithm measuring memory connectivity
- **5-metric health formula**: freshness × coverage × coherence × efficiency × reachability

### v2.0.0 — Multi-Layer Memory (2026-03-28)

- **Five memory layers**: Working (LCM) → Episodic → Long-term → Procedural → Index
- **Three-phase dream cycle**: Collect → Consolidate → Evaluate
- **Importance scoring**: base_weight × recency × reference_boost with forgetting curve
- **Memory index**: `index.json` with IDs, timestamps, relations, reference counts
- **User markers**: ⚠️ PERMANENT, 🔥 HIGH, 📌 PIN, `<!-- important -->`

### v1.0.0 — Initial Release (2026-03-28)

- Basic daily log scanning and MEMORY.md consolidation
- Semantic deduplication
- 90-day archival for unreferenced entries
- Cron-triggered isolated session execution

## Upgrading

| From | To | Guide |
|------|----|-------|
| v1.x | v2.x | [migration-v1-to-v2.md](references/migration-v1-to-v2.md) |
| v2.x | v3.0 | [migration-v2-to-v3.md](references/migration-v2-to-v3.md) |
| v1.x | v3.0 | [migration-v2-to-v3.md](references/migration-v2-to-v3.md) (includes direct path) |

All upgrades are non-destructive. Your data is always preserved.

## How It Works Under the Hood

Auto-Dream leverages OpenClaw's native primitives — the same infrastructure that powers every MyClaw instance:

| Primitive | Role |
|-----------|------|
| **Cron** | Schedules dream cycles at configurable intervals |
| **Isolated Sessions** | Runs consolidation without polluting main chat history |
| **File System** | Reads/writes memory files across all five layers |
| **LCM** | Provides working memory compression for long conversations |

No external dependencies. No API keys. No databases. Just files and intelligence.

---

## About MyClaw.ai

<table>
<tr>
<td>

**[MyClaw.ai](https://myclaw.ai)** is the AI personal assistant platform that gives every user a dedicated server running [OpenClaw](https://github.com/openclaw/openclaw) — with full code control, unrestricted internet, cron jobs, and a growing ecosystem of installable skills.

The fastest-growing AI agent platform.

Your OpenClaw, ready for you. Run instantly. Cancel anytime.

🌐 **[myclaw.ai](https://myclaw.ai)** · 🐦 **[@MyClaw_Official](https://x.com/MyClaw_Official)** · 💬 **[r/myclaw](https://reddit.com/r/myclaw)**

</td>
</tr>
</table>

## License

[MIT](LICENSE) © [MyClaw.ai](https://myclaw.ai)

---

<p align="center">
  <em>"The brain doesn't stop working when you sleep. It starts its most important work."</em>
</p>
