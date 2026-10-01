# Host integration guide

How to give any agent platform a durable, portable memory layer with Talewell.

This page is written to be useful even if your platform is not listed. Section 1
is the general method; the rest are per-platform recipes.

---

## 1. The general method

Every agent platform decides *somewhere* what its model sees and *somewhere*
what it can call. Talewell attaches at whichever of those seams a platform
exposes. There are exactly four tiers, ordered by how much the platform gives you:

| Tier | Requires | Gives you | Coverage |
| --- | --- | --- | --- |
| **native** | a plugin/hook API | memory injected before every turn + tools | richest, narrowest |
| **mcp** | an MCP client | tools the model can call | the large common denominator |
| **file** | reads a project instruction file | protocol taught via prompt; host shells out to `talewell` | universal fallback |
| **cli** | can run a shell command | full CLI | universal fallback |

`file` and `cli` need nothing from the platform beyond what every agent already
does. **They cover 100% of hosts.** `mcp` is what you want when it is available.

### Decision procedure

1. **Does the host speak MCP?** → tier `mcp`. Add one server entry (§2). Done.
2. **Otherwise, does it read a project instruction file** (`AGENTS.md`,
   `CLAUDE.md`, …)? → tier `file`. Run `talewell install --host <id> --dir .`.
3. **Otherwise** → tier `cli`. Point the agent's instructions at the CLI
   commands in §3 and let it shell out.

Tiers are additive. A host with MCP should *also* get the file tier if it reads
instruction files — the file block tells the agent *when* to reach for memory,
which is the part MCP alone cannot supply.

### The one thing that must not be skipped

Whichever tier you use, keep the provenance rule intact:

> Only content the user stated (`owner`) or the agent derived from it (`agent`)
> may be written. Web pages, tool output, and other people (`untrusted`) are
> refused structurally.

If your platform can write to memory *around* Talewell — a script that pokes
records into the directory, a fetch-and-store tool — you have bypassed the gate
and the guarantee no longer holds. Write through the CLI or the MCP tools.

---

## 2. The MCP tier (universal recipe)

Talewell's MCP server is a single stdio command with zero dependencies:

```
node /path/to/talewell/bin/talewell.mjs serve-mcp
```

with environment `TALEWELL_REPO=/path/to/talewell-memory`.

It exposes six tools:

| Tool | Purpose |
| --- | --- |
| `memory_recall` | ranked search (deterministic, no model call) |
| `memory_index` | compact catalog — index-first, not top-k-first |
| `memory_get` | full record by ID |
| `memory_remember` | persist a durable fact (subject to the provenance gate) |
| `memory_forget` | remove a record; git keeps the history |
| `memory_graph` | follow `[[links]]` for multi-hop questions |

Each client spells the config differently. Same server, different dialect:

**Claude Code**

```bash
claude mcp add talewell -- node /path/to/talewell/bin/talewell.mjs serve-mcp
```

or commit it for the whole project in `.mcp.json`:

```json
{ "mcpServers": { "talewell": {
  "command": "node",
  "args": ["/path/to/talewell/bin/talewell.mjs", "serve-mcp"],
  "env": { "TALEWELL_REPO": "/path/to/talewell-memory" } } } }
```

> **Verified end to end.** With the `.mcp.json` above committed, Claude Code
> (2.1.62) reports `talewell: node …/serve-mcp - ✓ Connected` from
> `claude mcp list`. That is a live connection to this server, not a config echo.
> It does not by itself prove the tool list — check that with your own
> `tools` view once connected.

**Cursor** — same shape, in `mcp.json`. Cursor supports `stdio`, `SSE`, and
Streamable HTTP; `stdio` is what you want locally.

**OpenCode** — `opencode.json` uses its own schema. Note `command` is an
**array** and env lives under `environment`:

```json
{ "$schema": "https://opencode.ai/config.json",
  "mcp": { "talewell": {
    "type": "local",
    "command": ["node", "/path/to/talewell/bin/talewell.mjs", "serve-mcp"],
    "enabled": true,
    "environment": { "TALEWELL_REPO": "/path/to/talewell-memory" } } } }
```

**Codex** — MCP servers are configured on the Codex host and shared across the
CLI, IDE extension, and desktop app. Stdio servers support environment
variables; streamable-HTTP servers support bearer/OAuth. Codex also reads the
`instructions` field an MCP server returns at initialization, and uses it as
server-wide guidance alongside the tools — keep the first 512 characters
self-contained, because that is what Codex sees when deciding how to use the
server.

**Manus** — supports prebuilt MCP connectors *and* custom MCP servers, which is
the route here: register Talewell as a custom server in the Manus integration
settings.

**Claude Desktop / any other MCP client** — the generic `mcpServers` shape from
Claude Code above is the de-facto convention. If the client has a documented
config path, prefer it.

> **Context cost.** More tools means more tokens on every turn. Talewell's six
> tools are small, but if you are already near the context ceiling, use the
> `file` tier instead — it costs one prompt block, not a tool schema per turn.

---

## 3. The file tier (universal fallback)

```bash
talewell install --host <id> --dir .
talewell install --host <id> --dir . --dry-run   # preview
talewell uninstall --host <id> --dir .           # remove only our block
```

This writes an **idempotent managed block** into the host's instruction file,
delimited by `<!-- amp:begin v1 -->` / `<!-- amp:end -->`. Re-running replaces
the block; it never touches the rest of your file. Uninstalling removes only
the block, and deletes the file if it held nothing else.

The block teaches three things: index-first reading, the CLI commands, and the
provenance rule. Verified host conventions:

| Host | Instruction file |
| --- | --- |
| OpenClaw | `AGENTS.md` |
| Codex | `AGENTS.md` |
| OpenCode | `AGENTS.md` |
| Pi Coding Agent | `AGENTS.md` |
| Claude Code | `CLAUDE.md` (also reads `.claude/CLAUDE.md`) |
| Hermes | `AGENTS.md` *(convention unverified)* |

For any host not listed, `AGENTS.md` is the safest default — it is the
emerging cross-tool convention, and several hosts read it directly.

---

## 4. The CLI tier (universal fallback)

Any agent that can run a shell command can use Talewell. The four commands that
matter:

```bash
talewell --repo ./memory index --markdown      # read: catalog for the prompt
talewell --repo ./memory recall "<query>"      # read: ranked search
talewell --repo ./memory remember --text "..." --alias "a,b" --importance 7
talewell --repo ./memory correct <id> --text "..."   # supersede, keeps history
```

Put those in the host's system prompt or instructions and it becomes the
protocol. `talewell index --markdown` is the one to inject at session start.

---

## 5. Per-platform notes

### OpenClaw — tiers: native, mcp, file, cli

The richest integration. Two shapes:

- **Companion** (default, and what this repo ships): the plugin does **not** take
  `plugins.slots.memory`. It coexists with `memory-core` and adds git audit,
  portability, and the link graph. This mirrors `memory-wiki`'s proven pattern.
- **Slot owner** (opt-in): declare `kind: "memory"` and own retrieval entirely.

Setup:

```bash
openclaw plugins install --link /path/to/talewell/adapters/openclaw/plugin \
  --force --accept-capabilities
openclaw plugins enable talewell --accept-capabilities
```

then grant hook access and set the repo:

```json5
{ plugins: { entries: { talewell: {
  enabled: true,
  hooks: { allowConversationAccess: true },
  config: { repoPath: "/path/to/talewell-memory", inject: "index" } } } } }
```

Restart the gateway. The index is injected via `before_prompt_build`.

OpenClaw's Instruction tier is `AGENTS.md`, so the file tier works here too and
is a good idea — MCP supplies the tools, the file block supplies the judgement.

### Claude Code — tiers: mcp, file, cli

Verified: reads `CLAUDE.md`, `.claude/CLAUDE.md`, and `.mcp.json`; confirmed MCP
client. `talewell install --host claude-code` writes both the managed block and
`.mcp.json` in one step.

### Codex — tiers: mcp, file, cli

Verified MCP client (stdio + streamable HTTP). Reads `AGENTS.md`. Two OpenClaw
routes exist for driving Codex (native app-server and ACP), but for *memory*
you only need the MCP entry.

### OpenCode — tiers: mcp, file, cli

Verified: MCP servers are defined under `mcp` in `opencode.json` (see §2 for the
array-`command` gotcha). Reads `AGENTS.md`.

### Pi Coding Agent — tiers: mcp, file, cli

An agent harness with its own unified LLM API, agent loop, TUI, and coding-agent
CLI. Transport confirmed (it appears in OpenClaw's ACP adapter list), but its
**memory-side config surface is not verified** — treat it as a generic MCP
client and fall back to `AGENTS.md`.

### Hermes — tiers: file, cli

Confirmed to exist with memory as a first-class concept: OpenClaw ships a
`migrate-hermes` provider that imports Hermes memories, skills, and credentials.
Its instruction-file convention is **unverified**; use `AGENTS.md` and the CLI.

### Grok Bot — tiers: file, cli

Verified from xAI's docs: each Bot runs on a **persistent cloud computer** with
a browser, filesystem, and terminal, and "context compounds" across tasks. Bots
use *connectors* where available and computer use otherwise, and can learn
skills from demonstration. That means the `cli` tier is genuinely available —
a Bot can run `talewell` on its own machine. Whether it accepts an MCP server
entry directly is **unverified**; the docs describe connectors, not an MCP
client config.

### Manus — tiers: mcp, file, cli

Verified: supports MCP connectors and **custom MCP servers** for proprietary
systems. Register Talewell as a custom server. Manus also has a persistent file
system, so the `cli` tier works.

### OpenAI Dots / Muse AI / Cue — **unverified**

I could not confirm which products these refer to.

- `cue.dev` is the **CUE configuration language**, not an agent.
- `docs.dots.dev` redirects to a **payments company**.
- "Muse" is heavily overloaded and I found no agent platform matching.

If you meant specific products, point me at their docs and I will add them.
Until then these use the safe defaults: `file` + `cli`, with `AGENTS.md`.

### DeepSeek — tiers: file, cli

DeepSeek publishes a function-calling API but **no MCP client and no agent
harness** that I could verify. If you are building on the raw API, you are the
host: call the CLI or import the kernel directly.

---

## 6. Writing a new adapter

If your platform exposes a hook that runs before the model sees the prompt, you
can do what OpenClaw's adapter does, in about 40 lines:

1. Load the store: `new TalewellStore(repoPath)` imported from `src/store.mjs`.
2. Build the injected block: `store.indexMarkdown({ limit: N })`.
3. Return it from the platform's pre-prompt hook as prepended context.
4. Wrap everything in try/catch. **A memory layer must never eat a turn.**

Optional, for hosts that will not call tools on their own: use `inject: "recall"`
to inject ranked hits for the current prompt instead of a catalog.

Two rules for any adapter:

- **Bound the injection.** Never inject the whole corpus. A cap plus a short TTL
  cache is enough; re-reading the repo every turn is wasted work.
- **Do not curate during conversation.** Write raw observations; let
  consolidation merge and dedupe.

---

## 7. What is verified, and what is not

| Host | Tiers | Instruction file | Verified |
| --- | --- | --- | --- |
| OpenClaw | native, mcp, file, cli | `AGENTS.md` | yes |
| Claude Code | mcp, file, cli | `CLAUDE.md` | yes |
| Codex | mcp, file, cli | `AGENTS.md` | yes |
| OpenCode | mcp, file, cli | `AGENTS.md` | yes |
| Pi Coding Agent | mcp, file, cli | `AGENTS.md` | transport only |
| Hermes | file, cli | `AGENTS.md` | exists; convention unverified |
| Grok Bot | file, cli | `AGENTS.md` | cli yes; mcp unverified |
| Manus | mcp, file, cli | `AGENTS.md` | yes |
| DeepSeek | file, cli | `AGENTS.md` | no MCP/harness found |
| OpenAI Dots / Muse AI / Cue | file, cli | `AGENTS.md` | **unidentified** |

Unverified entries use safe defaults rather than guessed configuration. That is
deliberate: a wrong config path wastes more of your time than an honest blank.
