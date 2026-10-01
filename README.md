<p align="center">
  <img src="https://img.shields.io/badge/Powered%20by-MyClaw.ai-D4AF37?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiAyMmgyMEwxMiAyeiIgZmlsbD0iI0Q0QUYzNyIvPjwvc3ZnPg==" alt="Powered by MyClaw.ai" />
  <img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge" alt="MIT License" />
  <img src="https://img.shields.io/badge/Version-0.1-8B5CF6?style=for-the-badge" alt="v0.1" />
</p>

<h1 align="center">Talewell</h1>

<p align="center">
  <strong>Every story has its well.</strong>
</p>

<p align="center">
  Plugin-first long-term memory for every agent platform.<br/>
  Git-backed. Auditable. Portable. No vector database required.
</p>

<p align="center">
  <a href="#install">Install</a> ·
  <a href="#hosts">Hosts</a> ·
  <a href="#the-protocol">Protocol</a> ·
  <a href="#cli">CLI</a> ·
  <a href="docs/HOSTS.md">Host guide</a> ·
  <a href="docs/ARCHITECTURE.md">Architecture</a>
</p>

---

## Why Talewell

Two systems shaped this design:

- A **$2.5B AI assistant** whose memory layer is nothing but git-tracked Markdown plus `grep` — crude, but inspectable, auditable, and rollback-able.
- **OpenClaw's memory architecture** — proven on the hard half: provenance tainting, recall-driven promotion, deterministic gates around bounded model consolidation.

Talewell keeps both rigours and adds the thing neither had: **one memory layer that every agent platform can speak.**

It is plugin-first by design. Every major agent platform is plugin-shaped now; Talewell meets them there instead of asking them to change.

## What it does

- **Plain Markdown, real git history.** One memory record = one file. Every write is a commit. Every fact is diff-able, rollback-able, and readable with `cat`.
- **Deterministic recall.** Relevance × recency decay × importance, computed locally. No model call, no network, no API key required to search your own memory.
- **Provenance enforced.** Content the user stated (`owner`) or you derived from it (`agent`) may be stored. Web pages, tool output, and other people (`untrusted`) are refused structurally — this is a security property, not a tuning knob.
- **Corrections that stick.** Superseding a record retires the old value from recall and from prompt injection, while git keeps the history.
- **A link graph in plain files.** Records reference each other with `[[id]]`; stable IDs and aliases make the corpus both navigable and greppable.
- **Prompt injection built in.** On OpenClaw, a companion plugin injects a compact index before every turn, so the agent starts already knowing what it knows.

## Install

### As an MCP server — works with anything that speaks MCP

```json
{
  "mcpServers": {
    "talewell": {
      "command": "node",
      "args": ["/path/to/talewell/bin/talewell.mjs", "serve-mcp"],
      "env": { "TALEWELL_REPO": "/path/to/talewell-memory" }
    }
  }
}
```

Exposes six tools: `memory_recall`, `memory_index`, `memory_get`, `memory_remember`, `memory_forget`, `memory_graph`.

### As an OpenClaw plugin — ambient memory

```bash
openclaw plugins install --link /path/to/talewell/adapters/openclaw/plugin --force --accept-capabilities
openclaw plugins enable talewell --accept-capabilities
```

Then grant conversation-hook access so the index can be injected:

```json5
{
  plugins: {
    entries: {
      talewell: {
        enabled: true,
        hooks: { allowConversationAccess: true },
        config: { repoPath: "/path/to/talewell-memory", inject: "index" },
      },
    },
  },
}
```

Restart the gateway. The agent's prompt now carries a memory index every turn.

### As a file convention — the universal fallback

```bash
talewell install --host codex --dir .        # writes a managed block into AGENTS.md
talewell install --host claude-code --dir .  # CLAUDE.md + .mcp.json
```

Any host that reads a project instruction file can use Talewell with no plugin and no protocol support.

## Hosts

| Host | Tiers | Instruction file | Verified |
| --- | --- | --- | --- |
| OpenClaw | native, mcp, file, cli | `AGENTS.md` | yes |
| Claude Code | mcp, file, cli | `CLAUDE.md` | yes |
| Codex | mcp, file, cli | `AGENTS.md` | yes |
| OpenCode | mcp, file, cli | `AGENTS.md` | yes |
| Pi Coding Agent | mcp, file, cli | `AGENTS.md` | yes |
| Hermes | file, cli | `AGENTS.md` | yes |
| Grok bot | file, cli | `AGENTS.md` | **no** |
| Muse AI | file, cli | `AGENTS.md` | **no** |
| DeepSeek harness | file, cli | `AGENTS.md` | **no** |

Run `talewell hosts` for the registry with evidence pointers. Unverified hosts use safe defaults rather than guessed config paths.

Per-platform setup recipes — including the general method for any host not listed — are in **[docs/HOSTS.md](docs/HOSTS.md)**.

## CLI

```bash
talewell init ./talewell-repo                                     # create a memory repo

talewell remember --text "Leo 不吃辣" --alias "饮食,辣,diet" --importance 7
talewell recall "订餐厅要注意什么"                                  # deterministic, no model
talewell get <id>
talewell correct <id> --text "updated value"                      # supersede, keeps history
talewell forget <id> --reason "user request"                      # removes, keeps git history
talewell graph <id> --depth 2                                     # follow [[links]]
talewell index --markdown                                         # compact catalog for injection
talewell health
talewell log --limit 20
talewell diff <id>
talewell rollback <commit> --yes
talewell bundle ./transfer.bundle                                 # cross-host transfer
talewell consolidate candidates.json                              # bulk, gated
talewell serve-mcp

talewell hosts
talewell install --host claude-code --dir .
talewell uninstall --host claude-code --dir .
```

All commands accept `--repo <dir>` (or `$TALEWELL_REPO`) and `--json`.

## The protocol

**AMP — Agent Memory Protocol** — is the portable contract Talewell implements. Product and protocol are deliberately separate names: speak of AMP when you mean the format, Talewell when you mean this implementation.

A memory repo is a directory with an `amp.json` manifest and a `memory/` tree:

```
repo/
  amp.json                    manifest: schema version + policy
  memory/
    facts/          f-*.md
    entities/<type>/ e-*.md
    episodes/       ep-*.md
    procedures/     pr-*.md
    index.json      generated catalog (rebuildable)
```

One record, one file:

```markdown
---
id: f-m8k2x9a7q3
kind: fact
aliases: [吃饭, dining, 餐厅, 口味]
text: Leo 不吃辣
origin: owner
importance: 7
observedAt: 2026-09-15
links: [e-3n8k2, f-9x1m4]
---

Optional longer prose.
```

### Non-negotiables

- **No vector search in the kernel.** The baseline runs offline with no API key. Embeddings are an optional layer.
- **No silent writes.** `untrusted` and `system` origins are structurally refused.
- **No chat-time curation.** Writes go through consolidation, not the reply path.

## Architecture

```
L1 kernel   TalewellStore — git-backed Markdown repo (zero npm dependencies)
L2 protocol remember · recall · search · forget · consolidate · graph
L3 adapters OpenClaw · MCP · file convention · ACP
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full design, the on-disk contract, and a decision table showing which idea came from where.

## Tests

```bash
node --test "tests/*.test.mjs"
```

28 tests: round-trip serialisation, commit-per-write, the taint gate, deterministic CJK recall, supersession, git-backed forget, graph traversal, rollback, gated consolidation, and the host-file adapter.

## Legacy

This repository was previously **OpenClaw Auto-Dream**, a prompt-based memory skill for OpenClaw. The original skill and its references are preserved under [`legacy-skill/`](legacy-skill/) — it still installs and works on OpenClaw. Talewell is its successor: the same idea, rebuilt as a portable plugin framework.

## About MyClaw.ai

**[MyClaw.ai](https://myclaw.ai)** — the best way to run your OpenClaw. A dedicated server running 24/7 with full code control, cron jobs, persistent memory, and one-click skill install.

## License

MIT
