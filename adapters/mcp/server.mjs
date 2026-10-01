/**
 * Talewell MCP adapter — exposes the Talewell repo as a Model Context Protocol server
 * over stdio.
 *
 * This is the "MCP tier" of the architecture: any MCP-capable host
 * (Claude Code, Codex, Cursor, OpenCode, …) gets Talewell memory by adding one
 * server entry. Zero npm dependencies on purpose — the whole point of L1 is
 * that it runs anywhere without a supply chain.
 *
 * Protocol: JSON-RPC 2.0, newline-delimited, over stdin/stdout.
 * Reference: MCP specification (tools capability).
 */

import readline from 'node:readline';
import path from 'node:path';
import fs from 'node:fs';
import { TalewellStore } from '../../src/store.mjs';
import { consolidate } from '../../src/consolidate.mjs';

const PROTOCOL_VERSION = '2024-11-05';
const SERVER_INFO = { name: 'talewell', version: '0.1.0' };

/** Tool definitions exposed to the host. */
const TOOLS = [
  {
    name: 'memory_recall',
    description:
      'Search durable agent memory. Deterministic ranked recall over a git-backed ' +
      'Markdown store. Use when the user references the past, prior decisions, ' +
      'preferences, people, or facts stated in earlier sessions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What to recall. Natural language.' },
        limit: { type: 'integer', description: 'Max results (default 8).', minimum: 1, maximum: 50 },
        kind: { type: 'string', enum: ['fact', 'entity', 'episode', 'procedure'] },
      },
      required: ['query'],
    },
  },
  {
    name: 'memory_index',
    description:
      'Return a compact catalog of all memories (id, text, aliases). Prefer this ' +
      'over recall when you want an overview and will then fetch specific records ' +
      'yourself — index-first, not top-k-first.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'memory_get',
    description: 'Fetch one memory record by its stable ID.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'memory_remember',
    description:
      'Persist a durable fact. Only owner-stated or agent-derived content may be ' +
      'stored; externally-sourced (untrusted) content is refused by policy.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'The assertion. One line preferred.' },
        kind: { type: 'string', enum: ['fact', 'entity', 'episode', 'procedure'] },
        aliases: { type: 'array', items: { type: 'string' }, description: 'Alternate phrasings for lexical recall.' },
        importance: { type: 'integer', minimum: 1, maximum: 10 },
        source: { type: 'string', description: 'Where this came from (session key, file, URL).' },
        project: { type: 'string', description: 'Repo scope key, e.g. github.com/o/r.' },
        origin: { type: 'string', enum: ['owner', 'agent'] },
      },
      required: ['text'],
    },
  },
  {
    name: 'memory_forget',
    description: 'Remove a memory by ID. History is preserved in git; the removal is auditable.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' }, reason: { type: 'string' } },
      required: ['id'],
    },
  },
  {
    name: 'memory_graph',
    description: 'Follow [[links]] between memory records to answer multi-hop questions.',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string' }, depth: { type: 'integer', minimum: 1, maximum: 3 } },
      required: ['id'],
    },
  },
];

function textResult(obj) {
  return { content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }] };
}

async function callTool(store, name, args) {
  switch (name) {
    case 'memory_recall': {
      const hits = store.recall(args.query, {
        limit: args.limit ?? 8,
        ...(args.kind ? {} : {}),
      });
      const filtered = args.kind ? hits.filter((h) => h.kind === args.kind) : hits;
      if (!filtered.length) return textResult({ results: [], note: 'no matching memories' });
      return textResult({
        results: filtered.map((h) => ({
          id: h.id, kind: h.kind, text: h.text, aliases: h.aliases ?? [],
          importance: h.importance ?? null, observedAt: h.observedAt ?? null,
          source: h.source ?? null, score: h._score,
        })),
      });
    }
    case 'memory_index': {
      const idx = store.index();
      return textResult({
        counts: idx.counts,
        entries: idx.entries.map((e) => ({ id: e.id, kind: e.kind, text: e.text, aliases: e.aliases })),
      });
    }
    case 'memory_get': {
      const rec = store.get(args.id);
      if (!rec) throw new Error(`no such memory: ${args.id}`);
      const file = path.join(store.root, rec.file);
      return textResult({ ...rec, content: fs.readFileSync(file, 'utf8') });
    }
    case 'memory_remember': {
      const res = store.remember({
        text: args.text,
        kind: args.kind ?? 'fact',
        aliases: args.aliases ?? [],
        importance: args.importance,
        source: args.source,
        project: args.project,
        origin: args.origin ?? 'agent',
      });
      return textResult({ stored: true, ...res });
    }
    case 'memory_forget': {
      const res = store.forget(args.id, { reason: args.reason ?? 'agent request' });
      return textResult({ forgotten: true, ...res });
    }
    case 'memory_graph': {
      return textResult(store.graph(args.id, { depth: args.depth ?? 1 }));
    }
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

/** Start the stdio MCP server. Resolves when stdin closes. */
export async function runMcpServer({ root = process.cwd(), input = process.stdin, output = process.stdout } = {}) {
  const store = new TalewellStore(root);
  if (!fs.existsSync(path.join(root, 'amp.json'))) {
    fs.mkdirSync(root, { recursive: true });
    TalewellStore.init(root);
  }

  const send = (msg) => output.write(JSON.stringify(msg) + '\n');

  const rl = readline.createInterface({ input, crlfDelay: Infinity });
  rl.on('line', async (line) => {
    const raw = line.trim();
    if (!raw) return;
    let req;
    try { req = JSON.parse(raw); } catch { return; }
    const { id, method, params } = req;

    try {
      let result;
      switch (method) {
        case 'initialize':
          result = {
            protocolVersion: PROTOCOL_VERSION,
            capabilities: { tools: {} },
            serverInfo: SERVER_INFO,
          };
          break;
        case 'notifications/initialized':
          return;
        case 'tools/list':
          result = { tools: TOOLS };
          break;
        case 'tools/call':
          result = await callTool(store, params?.name, params?.arguments ?? {});
          break;
        case 'ping':
          result = {};
          break;
        default:
          send({ jsonrpc: '2.0', id, error: { code: -32601, message: `method not found: ${method}` } });
          return;
      }
      send({ jsonrpc: '2.0', id, result });
    } catch (e) {
      send({ jsonrpc: '2.0', id, error: { code: -32000, message: String(e?.message ?? e) } });
    }
  });

  await new Promise((resolve) => rl.on('close', resolve));
}

// Allow `node adapters/mcp/server.mjs` as a direct entry point.
if (import.meta.url === `file://${process.argv[1]}`) {
  runMcpServer({ root: process.env.TALEWELL_REPO ?? process.cwd() }).catch((e) => {
    process.stderr.write(String(e?.stack ?? e) + '\n');
    process.exit(1);
  });
}

export { TOOLS, callTool, consolidate };
