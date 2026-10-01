/**
 * Talewell — reference implementation of AMP (Agent Memory Protocol).
 *
 * L1 kernel: portable, git-backed, auditable memory for any agent host.
 * Host-agnostic on purpose — no import here may depend on a specific agent
 * runtime. Adapters live under ./adapters and depend on this, never the reverse.
 */

export { TalewellStore } from './store.mjs';
export { newId, isId } from './id.mjs';
export { rank, scoreRecord, tokenize } from './recall.mjs';
export {
  KINDS, KIND_DIR, ID_PREFIX, ORIGIN, PROMOTABLE_ORIGIN,
  isPromotable, normalizeAliases, isoDate, isoTimestamp,
  parseRecord, serializeRecord, validateRecord, extractLinks,
} from './schema.mjs';
export { consolidate } from './consolidate.mjs';
