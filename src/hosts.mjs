/**
 * Host registry — how Talewell reaches each agent host.
 *
 * IMPORTANT (architecture correction):
 * ACP is NOT a memory-delivery mechanism. ACP lets a host *drive* an agent;
 * it does not carry memory into one. The real delivery tiers are:
 *
 *   1. native  — an in-process plugin (OpenClaw)
 *   2. mcp     — any MCP-capable host gets Talewell as a tool server
 *   3. file    — host reads a project instruction file; works nearly anywhere
 *   4. cli     — host can shell out to `talewell`
 *
 * Every host gets `file` + `cli` for free. `mcp` is the large common
 * denominator. `native` is the richest but narrowest.
 *
 * `verified` marks whether we have first-hand evidence for the host's config
 * surface. Unverified entries fall back to the safe defaults and say so —
 * we do not guess.
 */

/** @typedef {'native'|'mcp'|'file'|'cli'} Tier */

/**
 * @typedef {object} HostSpec
 * @property {string} id
 * @property {string} name
 * @property {Tier[]} tiers
 * @property {string} [instructionFile]  Preferred project instruction file.
 * @property {boolean} verified
 * @property {string} evidence
 * @property {string} [note]
 */

/** Instruction files, most-preferred first, used when a host is unverified. */
export const FALLBACK_INSTRUCTION_FILES = ['AGENTS.md', 'CLAUDE.md'];

/** @type {HostSpec[]} */
export const HOSTS = [
  {
    id: 'openclaw',
    name: 'OpenClaw',
    tiers: ['native', 'mcp', 'file', 'cli'],
    instructionFile: 'AGENTS.md',
    verified: true,
    evidence: 'docs/concepts/memory-architecture.md — AGENTS.md is the Instruction tier; plugins with kind:"memory"; openclaw mcp serve',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    tiers: ['mcp', 'file', 'cli'],
    instructionFile: 'CLAUDE.md',
    verified: true,
    evidence: 'OpenClaw docs/install/migrating-claude.md — reads CLAUDE.md / .claude/CLAUDE.md / .mcp.json; confirmed MCP client',
  },
  {
    id: 'codex',
    name: 'Codex',
    tiers: ['mcp', 'file', 'cli'],
    instructionFile: 'AGENTS.md',
    verified: true,
    evidence: 'OpenClaw docs/tools/acp-agents-setup.md lists codex alias; docs/tools/mcp.md names Codex an MCP client',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    tiers: ['mcp', 'file', 'cli'],
    instructionFile: 'AGENTS.md',
    verified: true,
    evidence: 'OpenClaw docs/tools/acp-agents-setup.md — opencode alias (opencode.ai)',
  },
  {
    id: 'pi',
    name: 'Pi Coding Agent',
    tiers: ['mcp', 'file', 'cli'],
    instructionFile: 'AGENTS.md',
    verified: true,
    evidence: 'OpenClaw docs/tools/acp-agents-setup.md — pi alias (earendil-works/pi)',
    note: 'Transport confirmed. Memory-side config surface NOT verified — falls back to AGENTS.md.',
  },
  {
    id: 'hermes',
    name: 'Hermes',
    tiers: ['file', 'cli'],
    instructionFile: 'AGENTS.md',
    verified: true,
    evidence: 'OpenClaw docs/plugins/reference/migrate-hermes.md — migration provider imports Hermes memories/skills/credentials',
    note: 'Exists and has memories as a first-class concept. Instruction-file convention NOT verified.',
  },
  {
    id: 'grok-bot',
    name: 'Grok bot',
    tiers: ['file', 'cli'],
    instructionFile: 'AGENTS.md',
    verified: false,
    evidence: 'none found',
    note: 'No reliable public interface information. Uses safe defaults.',
  },
  {
    id: 'muse-ai',
    name: 'Muse AI',
    tiers: ['file', 'cli'],
    instructionFile: 'AGENTS.md',
    verified: false,
    evidence: 'none found',
    note: 'No reliable public interface information. Uses safe defaults.',
  },
  {
    id: 'deepseek-harness',
    name: 'DeepSeek harness',
    tiers: ['file', 'cli'],
    instructionFile: 'AGENTS.md',
    verified: false,
    evidence: 'none found',
    note: 'No reliable public interface information. Uses safe defaults.',
  },
];

export function getHost(id) {
  return HOSTS.find((h) => h.id === id) ?? null;
}

/** Hosts whose instruction-file convention we can state with confidence. */
export function verifiedHosts() {
  return HOSTS.filter((h) => h.verified);
}

/** Capability summary across the fleet. */
export function fleetSummary() {
  const byTier = { native: 0, mcp: 0, file: 0, cli: 0 };
  for (const h of HOSTS) for (const t of h.tiers) byTier[t]++;
  return {
    total: HOSTS.length,
    verified: HOSTS.filter((h) => h.verified).length,
    unverified: HOSTS.filter((h) => !h.verified).length,
    byTier,
  };
}

/** Render the host matrix as Markdown (used in docs and `talewell hosts`). */
export function hostsMarkdown() {
  const lines = [
    '| Host | Tiers | Instruction file | Verified | Evidence |',
    '| --- | --- | --- | --- | --- |',
  ];
  for (const h of HOSTS) {
    lines.push(
      `| ${h.name} (\`${h.id}\`) | ${h.tiers.join(', ')} | \`${h.instructionFile}\` | ` +
      `${h.verified ? 'yes' : '**no**'} | ${h.evidence} |`,
    );
  }
  return lines.join('\n');
}
