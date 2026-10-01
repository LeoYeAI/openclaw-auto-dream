/**
 * ID generation — short, stable, human-legible IDs.
 *
 * Format: <prefix>-<base36 time>-<rand4>   e.g. "f-m8k2x9a7q3"
 * Prefix follows the record kind so an ID is self-describing on sight,
 * the same way Instinct's `pr-0193` / `p-0412` prefixes read.
 */

import { randomBytes } from 'node:crypto';
import { ID_PREFIX } from './schema.mjs';

const ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';

function randChars(n) {
  const buf = randomBytes(n);
  let out = '';
  for (let i = 0; i < n; i++) out += ALPHABET[buf[i] % ALPHABET.length];
  return out;
}

export function newId(kind) {
  const prefix = ID_PREFIX[kind] ?? 'm';
  const t = Date.now().toString(36);
  return `${prefix}-${t}${randChars(3)}`;
}

/** True if a string looks like an Talewell record ID. */
export function isId(s) {
  return typeof s === 'string' && /^[a-z]{1,3}-[0-9a-z]+$/.test(s);
}
