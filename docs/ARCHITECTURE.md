# Talewell — Architecture

**Talewell is a reference implementation of AMP (Agent Memory Protocol):
a portable, git-backed, auditable long-term memory layer for any agent host.**

Talewell is the L1 kernel + L2 adapters behind `openclaw-auto-dream`'s successor. It is
host-agnostic by construction: the kernel depends on nothing but Node builtins and
`git`, and every host integration lives in an adapter that depends on the kernel,
never the reverse.

---

## Why this exists

Two independent findings drove the design:

1. **Instinct** (a 25B-valuation AI assistant) ships a memory layer that is *just*
   git-tracked Markdown plus `grep`, with a strict read/write split. It is crude but
   **auditable, inspectable, and rollback-able** — and its author's own conclusion is
   that the moat is not the technique, it is the polish.
2. **OpenClaw's memory architecture** already proves the harder half: provenance
   tainting, recall-driven promotion, deterministic gates around bounded model
   consolidation, and prospective memory (standing intents).

Talewell takes OpenClaw's rigour and adds Instinct's auditability, then makes both
portable across hosts.

---

## Architecture

```
                     ┌──────────────────────────────────────────┐
   L3 adapters  →    │  OpenClaw │ MCP │ ACP │ file-convention │
                     └──────────────────────────────────────────┘
                                        │  (all depend downward)
                     ┌──────────────────────────────────────────┐
   L2 protocol  →    │  remember · recall · search · forget ·   │
                     │  consolidate · graph                     │
                     └──────────────────────────────────────────┘
                                        │
                     ┌──────────────────────────────────────────┐
   L1 kernel    →    │  TalewellStore — git-backed Markdown repo     │
                     │  schema · id · recall · consolidate      │
                     └──────────────────────────────────────────┘
```

**L1 kernel** — pure Node, zero npm dependencies. This is the thing that must run
anywhere, including offline and with no API key.

**Host coverage.** Nine target hosts, by tier:

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

Run `talewell hosts` for the registry with evidence pointers. Unverified hosts are
marked and use safe defaults rather than guessed config paths.

**L2 protocol** — the operation contract. Every adapter must implement the same
semantics; only the transport differs.

**L3 adapters** — capability-tiered, because hosts differ:

| Tier | Hosts | Mechanism |
| --- | --- | --- |
| Native plugin | OpenClaw | hooks + tools; companion *or* slot owner |
| MCP | Claude Code, Codex, OpenCode, Pi, any MCP client | `talewell serve-mcp` |
| File convention | **all 9 hosts** | managed block in `AGENTS.md` / `CLAUDE.md` |
| CLI | **all 9 hosts** | shell out to `talewell` |

MCP is the largest common denominator, but the **file convention is the universal
fallback** — every host reads a project instruction file, so it covers all nine
target hosts including the three we cannot verify.

> **Correction on ACP.** An earlier draft listed ACP as a memory-delivery tier.
> That was wrong: ACP lets a host *drive* an agent (OpenClaw spawning Claude Code,
> Codex, OpenCode, Pi) — it carries no memory itself. The ACP module only covers
> the *driven* case: context injection at spawn, candidate harvest at end. For
> standalone use of those harnesses, use the file + MCP tiers.

---

## The on-disk contract

A memory repo is a git repository. Every mutation is a commit.

```
repo/
  amp.json                     manifest: schema version + policy
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
triggers: [dining, restaurant]
---

Optional longer prose.
```

### Design decisions, and where they came from

| Decision | Source | Why |
| --- | --- | --- |
| git as the memory substrate | Instinct | every memory is diff-able and rollback-able; history *is* the audit log |
| stable IDs + aliases | Instinct | aliases widen the lexical hit surface; IDs make records referenceable |
| `[[links]]` between records | Instinct | a lightweight knowledge graph inside plain files |
| index-first injection | Instinct | hand the model a catalog, let it decide what to pull — less context pollution than forced top-k |
| dated in-place correction | Instinct | the correction is visible in the file, not buried in an index |
| provenance / taint gate | OpenClaw | `untrusted` and `system` are structurally barred from durable memory |
| ranked recall: relevance × recency × importance | OpenClaw | proven shape; keeps recall useful without a model call |
| deterministic gate before model consolidation | OpenClaw | a model never gets to decide what is true, only how to merge |
| CJK bigram tokenisation | both | Chinese/Japanese recall without a segmenter dependency |

### What Talewell deliberately does **not** do

- **No vector search in L1.** Embeddings are an optional adapter. The baseline must
  work with no API key and no network — that is the whole point.
- **No silent writes.** The taint gate is not a tuning knob.
- **No chat-time knowledge management.** Writes go through consolidation, not the
  reply path. The chat agent may write, but it does not *curate*.

---

## CLI

```bash
talewell init ./talewell-repo
talewell remember --text "Leo 不吃辣" --alias "饮食,辣,diet" --importance 7
talewell recall "订餐厅要注意什么"
talewell get f-m8k2x9a7q3
talewell correct f-m8k2x9a7q3 --text "Leo 现在能吃微辣了"
talewell forget f-m8k2x9a7q3 --reason "user request"
talewell graph f-m8k2x9a7q3 --depth 2
talewell index --markdown
talewell health
talewell log --limit 20
talewell diff f-m8k2x9a7q3
talewell rollback <commit> --yes
talewell bundle ./transfer.bundle          # cross-host transfer
talewell consolidate candidates.json       # bulk, gated
talewell serve-mcp                         # MCP stdio server

# host integration
talewell hosts                             # registry: tiers, verified status, evidence
talewell hosts --host claude-code           # one host in detail
talewell install --host codex --dir .       # install managed block (+ MCP where verified)
talewell install --dir . --dry-run          # preview, writes nothing
talewell uninstall --host codex --dir .     # remove only Talewell's block
```

All commands accept `--repo <dir>` (or `$TALEWELL_REPO`) and `--json`.

`talewell install` auto-detects the host by scanning for known instruction files
when `--host` is omitted.

---

## MCP adapter

Exposes six tools over JSON-RPC/stdio: `memory_recall`, `memory_index`, `memory_get`,
`memory_remember`, `memory_forget`, `memory_graph`. Zero dependencies — the server is
~200 lines of Node.

## OpenClaw adapter

Two modes:

- **companion** (default) — Talewell does *not* take `plugins.slots.memory`. It coexists
  with `memory-core` and adds git audit, portability, the link graph, and cross-host
  transfer. This mirrors the proven `memory-wiki` bridge pattern.
- **slot** (opt-in) — Talewell declares `kind: "memory"` and becomes the active memory
  plugin. Take this only when the host wants Talewell's retrieval to *be* the retrieval.

---

## Open questions (deliberately unresolved)

1. **Compaction ownership.** Codex and Claude Code have native compaction. Layering
   Talewell on top can double token cost. Who owns what must be defined per host.
2. **Trust boundary per host.** OpenClaw's taint gate is a security property. Any
   host that writes through Talewell inherits it — but hosts that write *around* Talewell do
   not. This needs an explicit contract.
3. **Naming.** "openclaw-auto-dream" no longer describes this. Pending.
4. **Unverified hosts.** Grok bot, Muse AI, DeepSeek harness: no reliable public
   interface information yet. Pi / OpenCode / Codex memory formats also unverified —
   only the ACP transport layer is confirmed.

---

## Tests

```bash
node --test "tests/*.test.mjs"
```

14 tests covering round-trip serialisation, commit-per-write, the taint gate,
deterministic CJK recall, supersession, git-backed forget, graph traversal,
rollback, and gated consolidation.

---

## License

MIT
