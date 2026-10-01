/**
 * AMP record schema — the portable on-disk contract.
 *
 * Every memory is one Markdown file with YAML-ish frontmatter.
 * The format is deliberately dependency-free so ANY host can read it
 * with `read`, `grep`, or a text editor.
 *
 * Adapted from Instinct's model (4 file classes + stable IDs + aliases +
 * [[links]]) and OpenClaw's annotation conventions (importance / trigger).
 */

/** @typedef {'fact'|'entity'|'episode'|'procedure'} RecordKind */

export const KINDS = /** @type {const} */ (['fact', 'entity', 'episode', 'procedure']);

/** Directory per kind. `entity` is split by entityType at write time. */
export const KIND_DIR = {
  fact: 'facts',
  entity: 'entities',
  episode: 'episodes',
  procedure: 'procedures',
};

/** ID prefixes, kept human-readable. */
export const ID_PREFIX = {
  fact: 'f',
  entity: 'e',
  episode: 'ep',
  procedure: 'pr',
};

/**
 * Provenance origin classes. Mirrors OpenClaw's closed set so memories
 * remain portable into and out of OpenClaw without reclassification.
 */
export const ORIGIN = /** @type {const} */ (['owner', 'agent', 'untrusted', 'system']);

/**
 * Origins eligible for durable promotion. `untrusted` and `system` are
 * structurally barred — this is the taint gate, and it is not optional:
 * any host that writes through Talewell inherits it.
 */
export const PROMOTABLE_ORIGIN = new Set(['owner', 'agent']);

export function isPromotable(origin) {
  return PROMOTABLE_ORIGIN.has(origin);
}

/** Normalize a list of aliases: trim, drop blanks, dedupe case-insensitively. */
export function normalizeAliases(input) {
  const out = [];
  const seen = new Set();
  for (const raw of input ?? []) {
    const a = String(raw).trim();
    if (!a) continue;
    const key = a.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

/** ISO date (YYYY-MM-DD) for a Date or timestamp. */
export function isoDate(d = new Date()) {
  return new Date(d).toISOString().slice(0, 10);
}

/** Full ISO timestamp. */
export function isoTimestamp(d = new Date()) {
  return new Date(d).toISOString();
}

/**
 * A memory record.
 * @typedef {object} MemoryRecord
 * @property {string} id            Stable ID, e.g. "f-7k2m9q".
 * @property {RecordKind} kind
 * @property {string[]} aliases     Grep/fuzzy hit surface. Also the lexical recall surface.
 * @property {string} text          The assertion itself (one line preferred).
 * @property {string} origin        One of ORIGIN.
 * @property {string} [source]      Provenance pointer: session key / file / URL.
 * @property {number} [importance]  1..10, assigned at write time.
 * @property {string} [project]     Repo scope key, e.g. "github.com/o/r".
 * @property {string} observedAt    ISO date the fact was observed.
 * @property {string} [updatedAt]   ISO date of last correction.
 * @property {string} [supersedes]  ID of the record this one replaces.
 * @property {string} [validFrom]
 * @property {string} [validTo]
 * @property {string[]} links       IDs referenced via [[...]].
 * @property {string[]} [triggers]  OpenClaw-compatible trigger phrases.
 * @property {string} [body]        Optional longer prose below frontmatter.
 * @property {string} [file]        Repo-relative path (filled on read).
 */

/** Validate a record; throws on hard errors, returns warnings array otherwise. */
export function validateRecord(rec) {
  const errs = [];
  if (!rec || typeof rec !== 'object') errs.push('record must be an object');
  else {
    if (!rec.id) errs.push('missing id');
    if (!KINDS.includes(rec.kind)) errs.push(`invalid kind: ${rec.kind}`);
    if (!rec.origin || !ORIGIN.includes(rec.origin)) errs.push(`invalid origin: ${rec.origin}`);
    if (typeof rec.text !== 'string' || !rec.text.trim()) errs.push('empty text');
    if (!rec.observedAt) errs.push('missing observedAt');
  }
  if (errs.length) throw new Error(`invalid record: ${errs.join('; ')}`);
  const warnings = [];
  if (!rec.aliases || rec.aliases.length === 0) warnings.push('no aliases: lexical recall will be weak');
  if (rec.importance != null && (rec.importance < 1 || rec.importance > 10)) {
    warnings.push(`importance out of range: ${rec.importance}`);
  }
  return warnings;
}

function yamlValue(v) {
  if (Array.isArray(v)) return `[${v.map(yamlValue).join(', ')}]`;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  const s = String(v);
  // Quote when the value could be misparsed.
  return /^[A-Za-z0-9_\-./:@<>=+ ]*$/.test(s) && s.trim() === s && s !== ''
    ? s
    : JSON.stringify(s);
}

const FM_ORDER = [
  'id', 'kind', 'aliases', 'text', 'origin', 'source', 'importance', 'project',
  'observedAt', 'updatedAt', 'supersedes', 'validFrom', 'validTo', 'links', 'triggers',
];

/** Serialize a record to file content (frontmatter + optional body). */
export function serializeRecord(rec) {
  validateRecord(rec);
  const lines = ['---'];
  for (const k of FM_ORDER) {
    const v = rec[k];
    if (v == null || (Array.isArray(v) && v.length === 0)) continue;
    lines.push(`${k}: ${yamlValue(v)}`);
  }
  lines.push('---', '');
  if (rec.body) lines.push(rec.body.trim(), '');
  return lines.join('\n');
}

/** Parse a scalar frontmatter value. */
function parseValue(raw) {
  const s = raw.trim();
  if (s.startsWith('[') && s.endsWith(']')) {
    const inner = s.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map((x) => parseValue(x));
  }
  if (/^-?\d+$/.test(s)) return Number(s);
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s.startsWith('"')) { try { return JSON.parse(s); } catch { return s; } }
  return s;
}

/** Parse file content into a record. Tolerates missing frontmatter keys. */
export function parseRecord(content, file = undefined) {
  const rec = {};
  let body = '';
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(content);
  if (m) {
    for (const line of m[1].split(/\r?\n/)) {
      const idx = line.indexOf(':');
      if (idx <= 0) continue;
      const key = line.slice(0, idx).trim();
      const val = parseValue(line.slice(idx + 1));
      if (key) rec[key] = val;
    }
    body = (m[2] ?? '').trim();
  }
  if (body) rec.body = body;
  if (file) rec.file = file;
  return rec;
}

/** Extract [[ID]] links from any text. */
export function extractLinks(text) {
  const out = new Set();
  if (!text) return [];
  for (const m of String(text).matchAll(/\[\[([^\]]+)\]\]/g)) {
    out.add(m[1].trim());
  }
  return [...out];
}
