/**
 * Recall scoring — deterministic, no model call, no network.
 *
 * Design notes:
 *  - We keep OpenClaw's proven shape (hybrid relevance × recency decay ×
 *    importance multiplier) but we do NOT require embeddings. Vector search
 *    is an optional add-on via an injected `embed` function; the baseline
 *    must work on a plain filesystem with no API key (the Instinct lesson).
 *  - Alias hits are weighted above body hits: aliases exist precisely to
 *    widen the hit surface, so a match there is a strong signal.
 */

const HALF_LIFE_DAYS = 30;
const DAY_MS = 86_400_000;

/** Tokenize into lowercase word/n-gram pieces; CJK-safe via bigrams. */
export function tokenize(text) {
  const s = String(text ?? '').toLowerCase();
  const out = new Set();
  for (const w of s.match(/[a-z0-9_]+/g) ?? []) out.add(w);
  // CJK: emit character bigrams so Chinese queries match without a segmenter.
  const cjk = s.match(/[\u3400-\u9fff]+/g) ?? [];
  for (const run of cjk) {
    if (run.length === 1) out.add(run);
    for (let i = 0; i + 1 < run.length; i++) out.add(run.slice(i, i + 2));
  }
  return out;
}

function overlapScore(queryTokens, targetTokens, weight) {
  if (queryTokens.size === 0) return 0;
  let hits = 0;
  for (const t of queryTokens) if (targetTokens.has(t)) hits++;
  return (hits / queryTokens.size) * weight;
}

function recencyDecay(observedAt, now = Date.now()) {
  const t = Date.parse(observedAt);
  if (Number.isNaN(t)) return 1;
  const days = Math.max(0, (now - t) / DAY_MS);
  return Math.pow(0.5, days / HALF_LIFE_DAYS);
}

/**
 * Score one record against a query.
 * @returns {number} 0..~1.6
 */
export function scoreRecord(rec, query, now = Date.now()) {
  const q = tokenize(query);
  const aliasTokens = new Set();
  for (const a of rec.aliases ?? []) for (const t of tokenize(a)) aliasTokens.add(t);
  const triggerTokens = new Set();
  for (const t of rec.triggers ?? []) for (const x of tokenize(t)) triggerTokens.add(x);
  const textTokens = tokenize(`${rec.text ?? ''} ${rec.body ?? ''}`);

  const relevance =
    overlapScore(q, aliasTokens, 1.0) +
    overlapScore(q, triggerTokens, 0.6) +
    overlapScore(q, textTokens, 0.45);

  if (relevance <= 0) return 0;

  const importance = rec.importance == null ? 5 : Number(rec.importance);
  const impMult = 0.5 + importance / 10; // 0.6 .. 1.5, neutral at 5 → 1.0
  const decay = recencyDecay(rec.observedAt ?? rec.updatedAt, now);

  return relevance * impMult * (0.6 + 0.4 * decay);
}

/** Rank records; returns records with `_score` attached, descending. */
export function rank(records, query, { limit = 10, minScore = 0.05, now = Date.now() } = {}) {
  const scored = [];
  for (const rec of records) {
    const s = scoreRecord(rec, query, now);
    if (s >= minScore) scored.push({ ...rec, _score: Number(s.toFixed(4)) });
  }
  scored.sort((a, b) => b._score - a._score);
  return scored.slice(0, limit);
}
