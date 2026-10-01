/**
 * TalewellStore — a git-backed, plain-Markdown memory repository.
 *
 * Layout:
 *   <root>/
 *     amp.json                  repo manifest (schema version, policy)
 *     memory/
 *       facts/         f-*.md
 *       entities/<type>/  e-*.md
 *       episodes/      ep-*.md
 *       procedures/    pr-*.md
 *       index.json     generated catalog (rebuildable, committed)
 *     .git/                     every write is a commit
 *
 * Invariants:
 *  - Every mutating operation commits. History is the audit log.
 *  - Writes are gated by provenance: untrusted/system never promote.
 *  - `read`/`recall` never mutate the repo.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { newId } from './id.mjs';
import { rank } from './recall.mjs';
import {
  KIND_DIR, KINDS, isPromotable, isoDate, isoTimestamp, normalizeAliases,
  parseRecord, serializeRecord, extractLinks, validateRecord,
} from './schema.mjs';

const SCHEMA_VERSION = 1;

function git(args, cwd, { allowFail = false } = {}) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    if (allowFail) return null;
    throw new Error(`git ${args.join(' ')} failed: ${e.stderr || e.message}`);
  }
}

function walkMarkdown(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkMarkdown(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

export class TalewellStore {
  /**
   * @param {string} root  Repository root.
   * @param {object} [opts]
   * @param {string} [opts.author]  Git author name for Talewell commits.
   */
  constructor(root, opts = {}) {
    this.root = path.resolve(root);
    this.memoryDir = path.join(this.root, 'memory');
    this.author = opts.author ?? 'Talewell';
  }

  // ---------------------------------------------------------------- lifecycle

  static init(root, { author = 'Talewell' } = {}) {
    const store = new TalewellStore(root, { author });
    fs.mkdirSync(store.memoryDir, { recursive: true });
    for (const kind of KINDS) {
      fs.mkdirSync(path.join(store.memoryDir, KIND_DIR[kind]), { recursive: true });
    }
    const manifest = path.join(store.root, 'amp.json');
    if (!fs.existsSync(manifest)) {
      fs.writeFileSync(manifest, JSON.stringify({
        schema: 'talewell',
        version: SCHEMA_VERSION,
        createdAt: isoTimestamp(),
        policy: {
          // The taint gate. Changing this is a security decision, not a tuning knob.
          promotableOrigins: ['owner', 'agent'],
          requireProvenance: true,
        },
      }, null, 2) + '\n');
    }
    if (!fs.existsSync(path.join(store.root, '.git'))) {
      git(['init', '-q'], store.root);
    }
    store._writeGitignore();
    store._commit('chore: initialize Talewell memory repo');
    return store;
  }

  open() {
    if (!fs.existsSync(this.root)) throw new Error(`Talewell repo not found: ${this.root}`);
    return this;
  }

  _writeGitignore() {
    const gi = path.join(this.root, '.gitignore');
    if (!fs.existsSync(gi)) fs.writeFileSync(gi, '*.tmp\n.DS_Store\n');
  }

  // -------------------------------------------------------------------- write

  /** Resolve the on-disk path for a record. */
  _pathFor(rec) {
    const dir = path.join(this.memoryDir, KIND_DIR[rec.kind]);
    if (rec.kind === 'entity' && rec.entityType) {
      const safe = String(rec.entityType).toLowerCase().replace(/[^a-z0-9_-]/g, '');
      return path.join(dir, safe || 'other', `${rec.id}.md`);
    }
    return path.join(dir, `${rec.id}.md`);
  }

  /**
   * Write a new memory. Enforces the provenance gate.
   * @returns {{id:string,file:string,commit:string|null,warnings:string[]}}
   */
  remember(input) {
    const rec = {
      kind: 'fact',
      origin: 'agent',
      observedAt: isoDate(),
      ...input,
    };
    rec.aliases = normalizeAliases(input.aliases);
    if (!rec.id) rec.id = newId(rec.kind);

    // --- taint gate -------------------------------------------------------
    if (!isPromotable(rec.origin)) {
      throw new Error(
        `refusing to persist origin="${rec.origin}": not promotable. ` +
        `Untrusted/system content may be staged but never enters durable memory.`,
      );
    }
    validateRecord(rec);

    rec.links = rec.links ?? extractLinks(`${rec.text} ${rec.body ?? ''}`);
    for (const t of rec.triggers ?? []) void t;

    const file = this._pathFor(rec);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (fs.existsSync(file)) throw new Error(`record already exists: ${rec.id}`);
    fs.writeFileSync(file, serializeRecord(rec));
    this._rebuildIndex();

    const rel = path.relative(this.root, file);
    const commit = this._commit(`remember(${rec.kind}): ${rec.text.slice(0, 60)}`, [rel]);
    return {
      id: rec.id,
      file: rel,
      commit,
      warnings: validateRecord(rec),
    };
  }

  /**
   * Supersede an existing record. The old value stays in file history, and
   * (matching Instinct's correction style) the new record points at the old
   * one via `supersedes`, so the correction is visible in plain text too.
   */
  correct(id, { text, aliases, importance, source, observedAt } = {}) {
    const old = this.get(id);
    if (!old) throw new Error(`no such record: ${id}`);
    const rec = {
      kind: old.kind,
      origin: old.origin,
      aliases: normalizeAliases([...(old.aliases ?? []), ...(aliases ?? [])]),
      text: text ?? old.text,
      source: source ?? old.source,
      importance: importance ?? old.importance,
      project: old.project,
      entityType: old.entityType,
      observedAt: observedAt ?? isoDate(),
      updatedAt: isoTimestamp(),
      supersedes: old.id,
    };
    const { id: _drop, supersedes: _s, ...rest } = rec;
    void _drop; void _s;
    const created = this.remember({ ...rest, supersedes: old.id });
    return created;
  }

  /** Delete a record. History is preserved in git. */
  forget(id, { reason = 'user request' } = {}) {
    const rec = this.get(id);
    if (!rec) throw new Error(`no such record: ${id}`);
    const file = path.join(this.root, rec.file);
    fs.rmSync(file);
    this._rebuildIndex();
    const commit = this._commit(`forget(${rec.kind}): ${id} — ${reason}`, [path.relative(this.root, file)]);
    return { id, commit };
  }

  // --------------------------------------------------------------------- read

  /** Read one record by ID. */
  get(id) {
    const all = this._loadAll();
    return all.find((r) => r.id === id) ?? null;
  }

  /** All records. */
  /**
   * All records.
   * @param {object} [opts]
   * @param {string} [opts.kind]
   * @param {boolean} [opts.includeSuperseded=false]  By default, records that
   *   another record has superseded are omitted: a correction is only useful if
   *   the value it replaced stops surfacing. Pass true for audit/history views.
   */
  list({ kind, includeSuperseded = false } = {}) {
    let all = this._loadAll();
    if (!includeSuperseded) {
      const retired = new Set(all.map((r) => r.supersedes).filter(Boolean));
      all = all.filter((r) => !retired.has(r.id));
    }
    return kind ? all.filter((r) => r.kind === kind) : all;
  }

  /**
   * Ranked recall. Deterministic, no model call.
   * @returns {Array<MemoryRecord & {_score:number}>}
   */
  recall(query, opts = {}) {
    return rank(this.list(), query, opts);
  }

  /** Follow [[links]] from a record, one or more hops. */
  graph(id, { depth = 1 } = {}) {
    const seen = new Set([id]);
    let frontier = [id];
    const edges = [];
    for (let d = 0; d < depth; d++) {
      const next = [];
      for (const cur of frontier) {
        const rec = this.get(cur);
        for (const target of rec?.links ?? []) {
          edges.push({ from: cur, to: target });
          if (!seen.has(target)) { seen.add(target); next.push(target); }
        }
      }
      frontier = next;
    }
    return { ids: [...seen], edges, nodes: [...seen].map((i) => this.get(i)).filter(Boolean) };
  }

  /** Machine-readable catalog the host injects as an index (index-first mode). */
  index() {
    const records = this.list();
    const byKind = {};
    for (const r of records) byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;
    return {
      generatedAt: isoTimestamp(),
      counts: { total: records.length, byKind },
      entries: records.map((r) => ({
        id: r.id, kind: r.kind, text: r.text,
        aliases: r.aliases ?? [], importance: r.importance ?? null,
        observedAt: r.observedAt ?? null, file: r.file,
      })),
    };
  }

  /** Render a compact index block for prompt injection. */
  indexMarkdown({ limit = 200 } = {}) {
    const idx = this.index();
    const lines = [
      `<!-- Talewell index — ${idx.counts.total} memories, generated ${idx.generatedAt} -->`,
      '',
    ];
    for (const e of idx.entries.slice(0, limit)) {
      const alias = e.aliases.length ? ` _(${e.aliases.slice(0, 5).join(', ')})_` : '';
      lines.push(`- \`${e.id}\` **${e.text}**${alias}`);
    }
    return lines.join('\n');
  }

  // ------------------------------------------------------------------- health

  health() {
    const records = this.list({ includeSuperseded: true });
    const issues = [];
    const ids = new Set(records.map((r) => r.id));
    let noAlias = 0, stale = 0, dangling = 0, superseded = new Set();
    const now = Date.now();
    for (const r of records) {
      if (!r.aliases?.length) noAlias++;
      if (r.supersedes) superseded.add(r.supersedes);
      const age = now - Date.parse(r.observedAt ?? 0);
      if (Number.isFinite(age) && age > 180 * 86_400_000) stale++;
      for (const l of r.links ?? []) if (!ids.has(l)) dangling++;
    }
    if (noAlias) issues.push({ level: 'warn', code: 'no-alias', count: noAlias, hint: 'weak lexical recall' });
    if (dangling) issues.push({ level: 'warn', code: 'dangling-link', count: dangling, hint: 'broken [[link]]' });
    if (stale) issues.push({ level: 'info', code: 'stale', count: stale, hint: 'not observed in 180d' });
    const active = records.filter((r) => !superseded.has(r.id)).length;
    return {
      total: records.length,
      active,
      superseded: superseded.size,
      commits: this.log({ limit: 10_000 }).length,
      issues,
    };
  }

  // ---------------------------------------------------------------------- git

  /** Commit history of the memory repo. */
  log({ limit = 20 } = {}) {
    const raw = git(['log', `--max-count=${limit}`, '--pretty=format:%H\t%aI\t%s'], this.root, { allowFail: true });
    if (!raw) return [];
    return raw.split('\n').filter(Boolean).map((l) => {
      const [hash, date, subject] = l.split('\t');
      return { hash, date, subject };
    });
  }

  /** Show the diff a record's history introduced, or of a commit. */
  diff(ref) {
    const rec = ref && !/^[0-9a-f]{7,40}$/.test(ref) ? this.get(ref) : null;
    const args = rec
      ? ['log', '--patch', '--follow', '--', rec.file]
      : ['show', '--stat', '--patch', ref ?? 'HEAD'];
    return git(args, this.root, { allowFail: true }) ?? '';
  }

  /** Roll the memory repo back to a commit. */
  rollback(commit, { confirm = false } = {}) {
    if (!confirm) throw new Error('rollback requires { confirm: true }');
    git(['reset', '--hard', commit], this.root);
    this._rebuildIndex();
    return { at: commit, head: git(['rev-parse', 'HEAD'], this.root) };
  }

  /** Export a git bundle for cross-host transfer. */
  bundle(outFile) {
    const out = path.resolve(outFile);
    git(['bundle', 'create', out, '--all'], this.root);
    return { file: out, bytes: fs.statSync(out).size };
  }

  _commit(message, files = undefined) {
    git(['add', ...(files ?? ['-A'])], this.root);
    const status = git(['status', '--porcelain'], this.root);
    if (!status) return null;
    git([
      '-c', `user.name=${this.author}`,
      '-c', `user.email=talewell@localhost`,
      'commit', '-q', '-m', message,
    ], this.root);
    return git(['rev-parse', 'HEAD'], this.root);
  }

  // ------------------------------------------------------------------ internal

  _loadAll() {
    const out = [];
    for (const file of walkMarkdown(this.memoryDir)) {
      try {
        const rec = parseRecord(fs.readFileSync(file, 'utf8'), path.relative(this.root, file));
        if (rec.id) out.push(rec);
      } catch { /* skip malformed */ }
    }
    return out;
  }

  _rebuildIndex() {
    const file = path.join(this.memoryDir, 'index.json');
    fs.writeFileSync(file, JSON.stringify(this.index(), null, 2) + '\n');
    return file;
  }
}
