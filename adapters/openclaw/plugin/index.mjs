/**
 * talewell — OpenClaw plugin: Talewell memory auto-injection.
 *
 * Companion to the `talewell` MCP server. The MCP server makes memory *callable*;
 * this plugin makes memory *ambient*: before every prompt is built, it injects
 * a compact catalog of durable memories so the model starts the turn already
 * knowing what it knows.
 *
 * Design rules (learned the hard way):
 *  - Never block or fail a turn. Every path is wrapped; on error we inject
 *    nothing and log.
 *  - Never inject unbounded text. The index is capped.
 *  - Index-first, not top-k-first. We hand over a catalog and let the model
 *    decide what to pull via the talewell__memory_* tools.
 *  - Cached with a TTL so we do not re-read the repo on every single turn.
 */

import fs from 'node:fs';
import path from 'node:path';

const DEFAULTS = {
  repoPath: path.join(process.env.HOME ?? '/root', '.openclaw', 'talewell-memory'),
  talewellDir: path.join(process.env.HOME ?? '/root', '.openclaw', 'workspace', 'projects', 'talewell'),
  inject: 'index',
  maxIndexEntries: 60,
  recallLimit: 5,
  cacheTtlMs: 15_000,
};

// ── state ────────────────────────────────────────────────────────────────────

let storePromise = null;
let cache = { at: 0, block: '' };
let loggedLoadFailure = false;

function resolveConfig(raw) {
  const o = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return {
    repoPath: typeof o.repoPath === 'string' ? o.repoPath : DEFAULTS.repoPath,
    talewellDir: typeof o.talewellDir === 'string' ? o.talewellDir : DEFAULTS.talewellDir,
    inject: ['index', 'recall', 'both', 'off'].includes(o.inject) ? o.inject : DEFAULTS.inject,
    maxIndexEntries: Number.isFinite(o.maxIndexEntries) ? o.maxIndexEntries : DEFAULTS.maxIndexEntries,
    recallLimit: Number.isFinite(o.recallLimit) ? o.recallLimit : DEFAULTS.recallLimit,
    cacheTtlMs: Number.isFinite(o.cacheTtlMs) ? o.cacheTtlMs : DEFAULTS.cacheTtlMs,
  };
}

/** Lazily import the Talewell kernel. Resolves to null if unavailable. */
async function loadStore(config, logger) {
  if (!storePromise) {
    storePromise = (async () => {
      const entry = path.join(config.talewellDir, 'src', 'store.mjs');
      if (!fs.existsSync(entry)) throw new Error(`Talewell kernel not found at ${entry}`);
      const mod = await import(entry);
      if (!fs.existsSync(path.join(config.repoPath, 'amp.json'))) {
        throw new Error(`Talewell repo not found at ${config.repoPath}`);
      }
      return new mod.TalewellStore(config.repoPath);
    })().catch((e) => {
      if (!loggedLoadFailure) {
        loggedLoadFailure = true;
        logger?.warn?.(`[talewell] disabled: ${e.message}`);
      }
      return null;
    });
  }
  return storePromise;
}

/** Build the injected block, cached for cacheTtlMs. */
async function buildBlock(config, logger, prompt = '') {
  const now = Date.now();
  if (now - cache.at < config.cacheTtlMs && cache.block) return cache.block;

  const store = await loadStore(config, logger);
  if (!store) return '';

  const parts = ['<talewell>'];
  parts.push(
    'Durable long-term memory (git-backed). These are summaries — use the ' +
    'talewell__memory_get / talewell__memory_recall / talewell__memory_graph tools to read a full ' +
    'record or search when relevant to the request.',
  );

  if (config.inject === 'index' || config.inject === 'both') {
    const idx = store.index();
    parts.push('');
    parts.push(`Index — ${idx.counts.total} memories:`);
    for (const e of idx.entries.slice(0, config.maxIndexEntries)) {
      const alias = e.aliases?.length ? ` _(${e.aliases.slice(0, 4).join(', ')})_` : '';
      parts.push(`- \`${e.id}\` **${e.text}**${alias}`);
    }
  }

  if ((config.inject === 'recall' || config.inject === 'both') && prompt) {
    const hits = store.recall(prompt, { limit: config.recallLimit });
    if (hits.length) {
      parts.push('');
      parts.push('Possibly relevant to this turn:');
      for (const h of hits) parts.push(`- \`${h.id}\` (${h._score}) ${h.text}`);
    }
  }

  parts.push('</talewell>');
  const block = parts.join('\n');
  cache = { at: now, block };
  return block;
}

/** Invalidate the cache (used when the repo changes). */
export function invalidate() {
  cache = { at: 0, block: '' };
}

// ── plugin entry ─────────────────────────────────────────────────────────────

const ampPlugin = {
  id: 'talewell',
  name: 'Talewell Memory',
  description: 'Injects the Talewell long-term memory index into the prompt.',

  register(api) {
    const config = resolveConfig(api.pluginConfig);

    api.on(
      'before_prompt_build',
      async (event) => {
        try {
          if (config.inject === 'off') return;
          const prompt = typeof event?.prompt === 'string' ? event.prompt : '';
          const block = await buildBlock(config, api.logger, prompt);
          if (!block) return;
          return { prependContext: block };
        } catch (e) {
          // A memory layer must never eat a turn.
          api.logger?.warn?.(`[talewell] inject skipped: ${String(e?.message ?? e)}`);
          return;
        }
      },
      { priority: 20 },
    );

    api.logger?.info?.(`[talewell] registered (inject=${config.inject}, repo=${config.repoPath})`);
  },
};

export default ampPlugin;
