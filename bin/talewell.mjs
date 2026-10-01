#!/usr/bin/env node
/**
 * talewell — CLI for the Talewell memory repo.
 *
 * Host-agnostic: this binary is the lowest-common-denominator interface.
 * Any host that can run a shell command can use Talewell through this, and the
 * MCP adapter exposes the same operations over the protocol.
 */

import fs from 'node:fs';
import path from 'node:path';
import { TalewellStore } from '../src/store.mjs';
import { consolidate } from '../src/consolidate.mjs';
import { HOSTS } from '../src/hosts.mjs';

const USAGE = `talewell — Agent Memory Protocol

Usage: talewell <command> [options]

Commands:
  init <dir>                 Create a new Talewell memory repo
  remember [options]         Add a memory
  recall <query>             Ranked recall (deterministic, no model)
  list [--kind K]            List memories
  get <id>                   Print one memory
  correct <id> [options]     Supersede a memory with a corrected value
  forget <id>                Remove a memory (history kept in git)
  graph <id> [--depth N]     Follow [[links]]
  index [--markdown]         Machine/human index for prompt injection
  health                     Repo health report
  log [--limit N]            Commit history
  diff [ref|id]              Show patch for a commit or a record's history
  rollback <commit> --yes    Reset the repo to a commit
  bundle <outfile>           Export a git bundle for cross-host transfer
  consolidate <file.json>    Bulk-merge candidates from a JSON array
  serve-mcp                  Run the MCP stdio server

Host integration:
  hosts [--host H]           Show the host registry and capability tiers
  install [--host H]         Install Talewell into a host (instruction file + MCP)
  uninstall [--host H]       Remove Talewell's managed block from a host

Global:
  --repo <dir>               Repo root (default: $TALEWELL_REPO or ./talewell-repo)
  --json                     Machine-readable output

install options:
  --host <id>   Host to install into (see: talewell hosts)
                default: auto-detect by scanning for known instruction files
  --dir <path>  Target project directory (default: cwd)
  --dry-run     Show what would change without writing

remember options:
  --text <s>  --kind fact|entity|episode|procedure
  --alias a,b  --origin owner|agent  --importance 1..10
  --source <s>  --project <s>  --trigger a,b  --body <s>
`;

function parseArgs(argv) {
  const out = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out.flags[key] = true;
      else { out.flags[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

function repoRoot(flags) {
  return path.resolve(flags.repo ?? process.env.TALEWELL_REPO ?? './talewell-repo');
}

function openStore(flags) {
  const root = repoRoot(flags);
  if (!fs.existsSync(path.join(root, 'amp.json'))) {
    throw new Error(`not an Talewell repo: ${root} (run: talewell init ${root})`);
  }
  return new TalewellStore(root);
}

function csv(v) {
  if (v === undefined || v === true) return undefined;
  return String(v).split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Pick a host when the user did not name one: prefer a known instruction file
 * already present in the directory, else fall back to the vendor-neutral default.
 */
function detectHost(dir) {
  for (const h of HOSTS) {
    if (h.instructionFile && fs.existsSync(path.join(dir, h.instructionFile))) return h.id;
  }
  return 'generic';
}

const fmt = (rec) => {
  const score = rec._score != null ? ` (${rec._score})` : '';
  const alias = rec.aliases?.length ? ` [${rec.aliases.join(', ')}]` : '';
  return `${rec.id}  ${rec.text}${alias}${score}`;
};

async function main() {
  const { _, flags } = parseArgs(process.argv.slice(2));
  const cmd = _[0];
  const json = Boolean(flags.json);

  switch (cmd) {
    case 'init': {
      const dir = path.resolve(_[1] ?? './talewell-repo');
      const store = TalewellStore.init(dir);
      console.log(json ? JSON.stringify({ repo: store.root }) : `initialized Talewell repo at ${store.root}`);
      return;
    }

    case 'remember': {
      const store = openStore(flags);
      const res = store.remember({
        kind: flags.kind ?? 'fact',
        text: flags.text,
        aliases: csv(flags.alias) ?? [],
        origin: flags.origin ?? 'agent',
        importance: flags.importance ? Number(flags.importance) : undefined,
        source: flags.source === true ? undefined : flags.source,
        project: flags.project === true ? undefined : flags.project,
        triggers: csv(flags.trigger),
        body: flags.body === true ? undefined : flags.body,
      });
      console.log(json ? JSON.stringify(res) : `remembered ${res.id} -> ${res.file} (${res.commit?.slice(0, 8)})`);
      for (const w of res.warnings ?? []) console.error(`warning: ${w}`);
      return;
    }

    case 'recall': {
      const store = openStore(flags);
      const q = _.slice(1).join(' ');
      const hits = store.recall(q, { limit: Number(flags.limit ?? 8) });
      console.log(json ? JSON.stringify(hits, null, 2) : hits.map(fmt).join('\n') || '(no matches)');
      return;
    }

    case 'list': {
      const store = openStore(flags);
      const recs = store.list({ kind: flags.kind });
      console.log(json ? JSON.stringify(recs, null, 2) : recs.map(fmt).join('\n') || '(empty)');
      return;
    }

    case 'get': {
      const store = openStore(flags);
      const rec = store.get(_[1]);
      if (!rec) { console.error(`not found: ${_[1]}`); process.exit(1); }
      console.log(json ? JSON.stringify(rec, null, 2) : fs.readFileSync(path.join(store.root, rec.file), 'utf8'));
      return;
    }

    case 'correct': {
      const store = openStore(flags);
      const res = store.correct(_[1], {
        text: flags.text,
        aliases: csv(flags.alias),
        importance: flags.importance ? Number(flags.importance) : undefined,
        source: flags.source === true ? undefined : flags.source,
      });
      console.log(json ? JSON.stringify(res) : `corrected -> ${res.id} (${res.commit?.slice(0, 8)})`);
      return;
    }

    case 'forget': {
      const store = openStore(flags);
      const res = store.forget(_[1], { reason: flags.reason === true ? undefined : flags.reason });
      console.log(json ? JSON.stringify(res) : `forgot ${res.id} (${res.commit?.slice(0, 8)})`);
      return;
    }

    case 'graph': {
      const store = openStore(flags);
      const g = store.graph(_[1], { depth: Number(flags.depth ?? 1) });
      if (json) console.log(JSON.stringify(g, null, 2));
      else {
        console.log(`nodes: ${g.ids.join(', ')}`);
        for (const e of g.edges) console.log(`  ${e.from} -> ${e.to}`);
      }
      return;
    }

    case 'index': {
      const store = openStore(flags);
      console.log(flags.markdown ? store.indexMarkdown() : JSON.stringify(store.index(), null, 2));
      return;
    }

    case 'health': {
      const store = openStore(flags);
      const h = store.health();
      if (json) console.log(JSON.stringify(h, null, 2));
      else {
        console.log(`total ${h.total} | active ${h.active} | superseded ${h.superseded} | commits ${h.commits}`);
        for (const i of h.issues) console.log(`  [${i.level}] ${i.code}: ${i.count} — ${i.hint}`);
        if (!h.issues.length) console.log('  no issues');
      }
      return;
    }

    case 'log': {
      const store = openStore(flags);
      const entries = store.log({ limit: Number(flags.limit ?? 20) });
      console.log(json ? JSON.stringify(entries, null, 2)
        : entries.map((e) => `${e.hash.slice(0, 8)}  ${e.date}  ${e.subject}`).join('\n') || '(no commits)');
      return;
    }

    case 'diff': {
      const store = openStore(flags);
      console.log(store.diff(_[1]));
      return;
    }

    case 'rollback': {
      const store = openStore(flags);
      const res = store.rollback(_[1], { confirm: Boolean(flags.yes) });
      console.log(json ? JSON.stringify(res) : `rolled back to ${res.at} (HEAD ${res.head.slice(0, 8)})`);
      return;
    }

    case 'bundle': {
      const store = openStore(flags);
      const res = store.bundle(_[1]);
      console.log(json ? JSON.stringify(res) : `bundle -> ${res.file} (${res.bytes} bytes)`);
      return;
    }

    case 'consolidate': {
      const store = openStore(flags);
      const parsed = JSON.parse(fs.readFileSync(path.resolve(_[1]), 'utf8'));
      // Accept both a bare array and a { candidates: [...] } envelope.
      const candidates = Array.isArray(parsed) ? parsed : parsed?.candidates;
      if (!Array.isArray(candidates)) {
        throw new Error('candidates file must be a JSON array, or an object with a `candidates` array');
      }
      const res = consolidate(store, candidates, { dryRun: Boolean(flags.dryRun) });
      console.log(json ? JSON.stringify(res, null, 2)
        : `added ${res.added} | merged ${res.merged} | skipped ${res.skipped} | rejected ${res.rejected}`);
      return;
    }

    case 'hosts': {
      const { HOSTS, fleetSummary, hostsMarkdown } = await import('../src/hosts.mjs');
      if (flags.host && flags.host !== true) {
        const h = HOSTS.find((x) => x.id === flags.host);
        if (!h) { console.error(`unknown host: ${flags.host}`); process.exit(1); }
        console.log(json ? JSON.stringify(h, null, 2)
          : `${h.name} (${h.id})\n  tiers: ${h.tiers.join(', ')}\n  instruction file: ${h.instructionFile}\n  verified: ${h.verified}\n  evidence: ${h.evidence}` +
            (h.note ? `\n  note: ${h.note}` : ''));
        return;
      }
      if (json) console.log(JSON.stringify({ summary: fleetSummary(), hosts: HOSTS }, null, 2));
      else {
        const s = fleetSummary();
        console.log(`hosts: ${s.total} | verified: ${s.verified} | unverified: ${s.unverified}`);
        console.log(`tiers: native ${s.byTier.native} | mcp ${s.byTier.mcp} | file ${s.byTier.file} | cli ${s.byTier.cli}\n`);
        console.log(hostsMarkdown());
      }
      return;
    }

    case 'install': {
      const dir = path.resolve(flags.dir && flags.dir !== true ? flags.dir : process.cwd());
      const hostId = flags.host && flags.host !== true ? flags.host : detectHost(dir);
      const { getHost } = await import('../src/hosts.mjs');
      if (hostId !== 'generic' && !getHost(hostId)) {
        console.error(`unknown host: ${hostId} (see: talewell hosts)`);
        process.exit(1);
      }
      const fileAdapter = await import('../adapters/file/index.mjs');
      const rel = repoRoot(flags);
      const dryRun = Boolean(flags['dry-run']);

      const block = fileAdapter.installInstructionBlock(dir, { hostId, repoPath: rel, dryRun });
      const mcp = fileAdapter.installMcpConfig(dir, {
        hostId, repoPath: rel, dryRun,
        talewellDir: path.resolve(path.dirname(new URL(import.meta.url).pathname), '..'),
      });

      if (json) console.log(JSON.stringify({ host: hostId, dir, dryRun, block, mcp }, null, 2));
      else {
        console.log(`host: ${hostId}${hostId === detectHost(dir) ? ' (auto-detected)' : ''}`);
        console.log(`  instruction file: ${block.action} ${block.file} (${block.bytes} bytes)${dryRun ? ' [dry-run]' : ''}`);
        if (mcp.written) console.log(`  mcp config: wrote ${mcp.file}${dryRun ? ' [dry-run]' : ''}`);
        else console.log(`  mcp config: snippet only (config path unverified for this host)`);
        if (hostId === 'generic') console.log('  tip: pass --host <id> to target a specific host (see: talewell hosts)');
      }
      return;
    }

    case 'uninstall': {
      const dir = path.resolve(flags.dir && flags.dir !== true ? flags.dir : process.cwd());
      const hostId = flags.host && flags.host !== true ? flags.host : detectHost(dir);
      const fileAdapter = await import('../adapters/file/index.mjs');
      const res = fileAdapter.uninstallInstructionBlock(dir, { hostId, dryRun: Boolean(flags['dry-run']) });
      console.log(json ? JSON.stringify(res) : `uninstall ${hostId}: ${res.removed ? `removed block from ${res.file}` : 'no Talewell block found'}`);
      return;
    }

    case 'serve-mcp': {
      const { runMcpServer } = await import('../adapters/mcp/server.mjs');
      await runMcpServer({ root: repoRoot(flags) });
      return;
    }

    case 'help': case undefined: case '--help':
      console.log(USAGE);
      return;

    default:
      console.error(`unknown command: ${cmd}\n`);
      console.log(USAGE);
      process.exit(1);
  }
}

main().catch((e) => {
  console.error(String(e?.message ?? e));
  process.exit(1);
});
