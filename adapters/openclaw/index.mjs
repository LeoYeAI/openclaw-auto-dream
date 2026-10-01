/**
 * Talewell ↔ OpenClaw adapter.
 *
 * Two integration shapes, chosen by capability tier:
 *
 *  A. Companion (default, matches memory-wiki's proven pattern)
 *     Talewell does NOT take `plugins.slots.memory`. It coexists with memory-core
 *     and adds what memory-core lacks: git audit trail, portable repo,
 *     [[link]] graph, and cross-host transfer.
 *
 *  B. Slot owner (opt-in)
 *     Talewell registers `kind: "memory"` and becomes the active memory plugin.
 *     Only take this when the host wants Talewell's retrieval to be THE retrieval.
 *
 * This module is the *contract description* for the OpenClaw plugin to
 * implement. It is deliberately plain data + thin functions so the plugin
 * entry can stay small (see adapters/openclaw/index.js).
 */

import { TalewellStore } from '../../src/store.mjs';

/** Manifest fields the OpenClaw plugin must declare. */
export const OPENCLAW_MANIFEST = {
  // Companion mode: no `kind` — Talewell does not occupy plugins.slots.memory.
  // Slot mode: uncomment the next line.
  // kind: 'memory',
  contracts: {
    tools: [
      'amp_recall',
      'amp_index',
      'amp_get',
      'amp_remember',
      'amp_forget',
      'amp_graph',
      'amp_health',
    ],
  },
  activation: { onStartup: true },
  configSchema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      repoPath: { type: 'string', description: 'Path to the Talewell memory repo.' },
      mode: { type: 'string', enum: ['companion', 'slot'], default: 'companion' },
      inject: { type: 'string', enum: ['index', 'recall', 'both', 'off'], default: 'index' },
      autoRemember: { type: 'boolean', default: false },
      maxIndexEntries: { type: 'integer', default: 200 },
    },
  },
};

/** Tool declarations, mirroring the MCP surface so both tiers behave identically. */
export const OPENCLAW_TOOLS = [
  { name: 'amp_recall', mcpEquivalent: 'memory_recall', optional: false },
  { name: 'amp_index', mcpEquivalent: 'memory_index', optional: false },
  { name: 'amp_get', mcpEquivalent: 'memory_get', optional: false },
  { name: 'amp_remember', mcpEquivalent: 'memory_remember', optional: false },
  { name: 'amp_forget', mcpEquivalent: 'memory_forget', optional: true },
  { name: 'amp_graph', mcpEquivalent: 'memory_graph', optional: false },
  { name: 'amp_health', mcpEquivalent: null, optional: false },
];

/**
 * Build the hidden context block injected before a prompt.
 *
 * Index-first (Instinct's lesson): inject a compact catalog and let the model
 * decide whether to pull. `recall` mode injects ranked hits instead, for hosts
 * or models that will not call tools on their own.
 */
export function buildPromptContext(store, config = {}) {
  const mode = config.inject ?? 'index';
  if (mode === 'off') return '';
  const parts = [];

  if (mode === 'index' || mode === 'both') {
    parts.push('<talewell-index>');
    parts.push(store.indexMarkdown({ limit: config.maxIndexEntries ?? 200 }));
    parts.push('</talewell-index>');
    parts.push('These are summaries of durable memories. Use `amp_get` or `amp_recall` to read a full record when relevant.');
  }
  if (mode === 'recall') {
    const hits = store.recall(config.recallQuery ?? '', { limit: config.recallLimit ?? 6 });
    if (hits.length) {
      parts.push('<talewell-recall>');
      for (const h of hits) parts.push(`- ${h.id} (${h._score}): ${h.text}`);
      parts.push('</talewell-recall>');
    }
  }
  return parts.join('\n');
}

/** Open a store for the adapter. */
export function openStore(repoPath) {
  return new TalewellStore(repoPath);
}

/** Wrap the store's operations as OpenClaw tool handlers. */
export function makeToolHandlers(store) {
  return {
    amp_recall: ({ query, limit, kind }) => {
      const hits = store.recall(query, { limit: limit ?? 8 });
      const out = kind ? hits.filter((h) => h.kind === kind) : hits;
      return { results: out.map((h) => ({ id: h.id, kind: h.kind, text: h.text, score: h._score })) };
    },
    amp_index: () => store.index().counts,
    amp_get: ({ id }) => store.get(id) ?? { error: `not found: ${id}` },
    amp_remember: (args) => store.remember(args),
    amp_forget: ({ id, reason }) => store.forget(id, { reason }),
    amp_graph: ({ id, depth }) => store.graph(id, { depth: depth ?? 1 }),
    amp_health: () => store.health(),
  };
}
