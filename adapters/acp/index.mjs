/**
 * ACP-aware adapter — context injection for externally-driven coding harnesses.
 *
 * CORRECT FRAMING (this replaced an earlier mistake):
 * ACP (Agent Client Protocol) lets a *host* drive an agent — OpenClaw spawns
 * Claude Code / Codex / OpenCode / Pi and owns the session. ACP carries no
 * memory by itself. What Talewell does here is:
 *
 *   1. at spawn  — produce the context payload to inject into the child session
 *   2. at end    — harvest durable candidates from the child's output
 *
 * When those harnesses run *standalone* (not driven by a host), use the
 * file tier (CLAUDE.md / AGENTS.md) plus MCP instead. This module is only for
 * the driven case.
 *
 * The store is passed in by the caller — this module stays free of kernel
 * imports so an ACP bridge never pays for loading the store implementation.
 */

/** Hosts that OpenClaw can drive over ACP (confirmed aliases). */
export const ACP_DRIVABLE = ['claude', 'codex', 'opencode', 'pi'];

/**
 * Build the context to inject into a child coding session.
 *
 * Index-first, per Instinct's lesson: give the child a compact catalog and
 * the protocol, not a forced top-k. The child pulls what it needs.
 *
 * @returns {{prependContext:string, tools:Array<string>, repoPath:string}}
 */
export function buildSessionContext(store, { query = '', repoPath, maxEntries = 120 } = {}) {
  const parts = [];
  parts.push('<talewell>');
  parts.push(`Long-term memory repo: ${repoPath}`);
  parts.push('Consult it before answering questions about prior decisions, preferences, or people.');
  parts.push('');
  parts.push(store.indexMarkdown({ limit: maxEntries }));
  if (query) {
    const hits = store.recall(query, { limit: 5 });
    if (hits.length) {
      parts.push('');
      parts.push('Relevant to the current task:');
      for (const h of hits) parts.push(`- ${h.id} (${h._score}): ${h.text}`);
    }
  }
  parts.push('');
  parts.push('Read a full record with `talewell --repo <repo> get <id>`; search with `recall "<q>"`.');
  parts.push('</talewell>');
  return { prependContext: parts.join('\n'), tools: ['talewell'], repoPath };
}

/**
 * Harvest durable candidates from a finished child session.
 *
 * Deliberately conservative: the child's transcript is *agent-derived*, so
 * candidates enter as `origin: agent` and still pass through the taint gate
 * and the consolidation dedupe. Nothing is written here — this only proposes.
 *
 * @param {Array<{role:string, text:string}>} transcript
 * @returns {Array<object>} candidates, ready for consolidate()
 */
export function harvestCandidates(transcript, { source } = {}) {
  const out = [];
  const seen = new Set();
  for (const turn of transcript ?? []) {
    if (turn.role !== 'user') continue;               // user turns carry stated intent
    for (const sentence of splitStatements(turn.text)) {
      const s = sentence.trim();
      if (s.length < 8 || s.length > 300) continue;
      if (!LOOKS_DURABLE.test(s)) continue;
      const key = s.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        kind: 'fact',
        text: s,
        aliases: extractKeywords(s),
        origin: 'agent',                              // never 'owner' — we did not hear it from the owner
        source,
        importance: 5,
      });
    }
  }
  return out;
}

const LOOKS_DURABLE = /(always|never|prefer|remember|from now on|以后|记住|不要|别|偏好|习惯|总是|永远)/i;

function splitStatements(text) {
  return String(text ?? '').split(/[。！？\n.!?;；]+/);
}

function extractKeywords(s) {
  const words = String(s).toLowerCase().match(/[a-z0-9_]{3,}/g) ?? [];
  const cjk = String(s).match(/[\u3400-\u9fff]{2,}/g) ?? [];
  return [...new Set([...words, ...cjk])].slice(0, 6);
}
