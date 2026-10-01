/**
 * Consolidation — background pass that turns raw observations into durable
 * memory. Deterministic; the optional `judge` callback is where a model may
 * be injected by a host, always inside bounds this module enforces.
 *
 * This mirrors OpenClaw's proven shape: gate first, model second.
 *   collect → gate (deterministic) → merge/compact → commit
 */

import { isoDate } from './schema.mjs';
import { tokenize } from './recall.mjs';

function jaccard(a, b) {
  const A = tokenize(a), B = tokenize(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return inter / (A.size + B.size - inter);
}

/**
 * Consolidate a batch of candidate observations into the store.
 *
 * @param {import('./store.mjs').TalewellStore} store
 * @param {Array<object>} candidates  raw observations {kind,text,aliases,origin,source,importance,observedAt}
 * @param {object} [opts]
 * @param {number} [opts.dedupeThreshold=0.8]
 * @param {boolean} [opts.dryRun=false]
 * @returns {{added:number,merged:number,skipped:number,rejected:number,details:object[]}}
 */
export function consolidate(store, candidates, opts = {}) {
  const { dedupeThreshold = 0.8, dryRun = false } = opts;
  const existing = store.list();
  const result = { added: 0, merged: 0, skipped: 0, rejected: 0, details: [] };
  const addedThisRun = [];

  for (const cand of candidates) {
    const text = String(cand.text ?? '').trim();
    if (!text) { result.skipped++; continue; }

    // 1. structural gate — untrusted/system never promote.
    if (!['owner', 'agent'].includes(cand.origin ?? 'agent')) {
      result.rejected++;
      result.details.push({ text, action: 'rejected', reason: `origin=${cand.origin}` });
      continue;
    }

    // 2. semantic dedupe against existing + same-run additions.
    const pool = [...existing, ...addedThisRun];
    let best = null, bestScore = 0;
    for (const rec of pool) {
      const s = Math.max(
        jaccard(text, rec.text ?? ''),
        ...(rec.aliases ?? []).map((a) => jaccard(text, a)),
      );
      if (s > bestScore) { bestScore = s; best = rec; }
    }
    if (best && bestScore >= dedupeThreshold) {
      result.merged++;
      result.details.push({ text, action: 'merged', into: best.id ?? '(new)', score: +bestScore.toFixed(3) });
      continue;
    }

    // 3. stage the durable write.
    const rec = {
      kind: cand.kind ?? 'fact',
      text,
      aliases: cand.aliases ?? [],
      origin: cand.origin ?? 'agent',
      source: cand.source,
      importance: cand.importance,
      project: cand.project,
      observedAt: cand.observedAt ?? isoDate(),
      entityType: cand.entityType,
    };
    if (dryRun) {
      result.added++;
      result.details.push({ text, action: 'would-add' });
      addedThisRun.push(rec);
      continue;
    }
    const written = store.remember(rec);
    result.added++;
    result.details.push({ text, action: 'added', id: written.id, commit: written.commit });
    addedThisRun.push(store.get(written.id) ?? rec);
  }

  return result;
}
