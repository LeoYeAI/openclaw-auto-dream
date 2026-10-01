import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { HOSTS, getHost, fleetSummary, hostsMarkdown, FALLBACK_INSTRUCTION_FILES } from '../src/hosts.mjs';
import {
  instructionBlock, installInstructionBlock, uninstallInstructionBlock,
  resolveInstructionFile, mcpConfigSnippet, installMcpConfig,
} from '../adapters/file/index.mjs';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'talewell-file-'));
}

test('all nine target hosts are registered', () => {
  const ids = HOSTS.map((h) => h.id);
  for (const want of ['openclaw', 'claude-code', 'codex', 'opencode', 'pi', 'cursor',
    'manus', 'hermes', 'grok-bot', 'deepseek', 'muse-ai', 'openai-dots', 'cue']) {
    assert.ok(ids.includes(want), `missing host: ${want}`);
  }
  assert.equal(HOSTS.length, 13);
});

test('every host has file+cli tiers as the universal fallback', () => {
  for (const h of HOSTS) {
    assert.ok(h.tiers.includes('file'), `${h.id} lacks file tier`);
    assert.ok(h.tiers.includes('cli'), `${h.id} lacks cli tier`);
    assert.ok(h.instructionFile, `${h.id} lacks instructionFile`);
  }
});

test('unverified hosts are marked and explain themselves', () => {
  const unverified = HOSTS.filter((h) => !h.verified).map((h) => h.id).sort();
  assert.deepEqual(unverified, ['cue', 'deepseek', 'muse-ai', 'openai-dots', 'pi']);
  // An unverified host must say why we could not confirm it — never a silent gap.
  for (const h of HOSTS.filter((x) => !x.verified)) {
    assert.ok(h.evidence, `${h.id} lacks evidence pointer`);
    assert.ok(h.note && h.note.length > 20, `${h.id} lacks an explanatory note`);
  }
});

test('fleet summary counts tiers', () => {
  const s = fleetSummary();
  assert.equal(s.total, HOSTS.length);
  assert.equal(s.verified + s.unverified, s.total);
  // file + cli are the universal tiers: every host must have both.
  assert.equal(s.byTier.file, s.total);
  assert.equal(s.byTier.cli, s.total);
  assert.ok(s.byTier.mcp >= 5, 'mcp should cover the majority');
  assert.ok(s.byTier.native >= 1, 'at least one host has a native plugin tier');
});

test('instruction block install is idempotent', () => {
  const dir = tmpDir();
  const a = installInstructionBlock(dir, { hostId: 'codex', repoPath: '/m/talewell' });
  assert.equal(a.action, 'created');
  assert.equal(a.file, 'AGENTS.md');

  // second install replaces, does not duplicate
  const b = installInstructionBlock(dir, { hostId: 'codex', repoPath: '/m/talewell' });
  assert.equal(b.action, 'replaced');
  const content = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.equal(content.match(/<!-- amp:begin v1 -->/g).length, 1);
  assert.equal(content.match(/<!-- amp:end -->/g).length, 1);
});

test('install preserves existing user content', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# My Project\n\nImportant user notes.\n');
  const r = installInstructionBlock(dir, { hostId: 'openclaw', repoPath: '/m/talewell' });
  assert.equal(r.action, 'appended');
  const content = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.ok(content.includes('Important user notes.'));
  assert.ok(content.includes('<!-- amp:begin v1 -->'));
  assert.ok(content.indexOf('My Project') < content.indexOf('<!-- amp:begin v1 -->'));
});

test('uninstall removes only our block', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), '# Keep me\n');
  installInstructionBlock(dir, { hostId: 'codex', repoPath: '/m/talewell' });
  const u = uninstallInstructionBlock(dir, { hostId: 'codex' });
  assert.equal(u.removed, true);
  const content = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.ok(content.includes('Keep me'));
  assert.ok(!content.includes('<!-- amp:begin'));
});

test('uninstall deletes the file if it only held our block', () => {
  const dir = tmpDir();
  installInstructionBlock(dir, { hostId: 'codex', repoPath: '/m/talewell' });
  uninstallInstructionBlock(dir, { hostId: 'codex' });
  assert.equal(fs.existsSync(path.join(dir, 'AGENTS.md')), false);
});

test('instruction file resolution prefers host convention', () => {
  const dir = tmpDir();
  assert.equal(resolveInstructionFile(dir, 'claude-code'), 'CLAUDE.md');
  assert.equal(resolveInstructionFile(dir, 'codex'), 'AGENTS.md');
  // if the host file already exists, keep using it
  fs.writeFileSync(path.join(dir, 'AGENTS.md'), 'x');
  assert.equal(resolveInstructionFile(dir, 'claude-code'), 'AGENTS.md');
  assert.deepEqual(FALLBACK_INSTRUCTION_FILES, ['AGENTS.md', 'CLAUDE.md']);
});

test('instruction block carries the provenance rule', () => {
  const block = instructionBlock({ repoPath: './r' });
  assert.ok(block.includes('Provenance is enforced'));
  assert.ok(block.includes('untrusted'));
  assert.ok(block.includes('correct'));
});

test('mcp config is auto-written only for verified hosts', () => {
  const dir = tmpDir();
  const cc = installMcpConfig(dir, { hostId: 'claude-code', repoPath: '/m/talewell', talewellDir: '/opt/talewell' });
  assert.equal(cc.written, true);
  assert.equal(cc.file, '.mcp.json');
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, '.mcp.json'), 'utf8'));
  assert.ok(cfg.mcpServers.talewell);

  const unknown = installMcpConfig(dir, { hostId: 'grok-bot', repoPath: '/m/talewell' });
  assert.equal(unknown.written, false);
  assert.ok(unknown.snippet.json.mcpServers.talewell);
});

test('mcp config merges rather than clobbers', () => {
  const dir = tmpDir();
  fs.writeFileSync(path.join(dir, '.mcp.json'), JSON.stringify({ mcpServers: { other: { command: 'x' } } }));
  installMcpConfig(dir, { hostId: 'claude-code', repoPath: '/m/talewell', talewellDir: '/opt/talewell' });
  const cfg = JSON.parse(fs.readFileSync(path.join(dir, '.mcp.json'), 'utf8'));
  assert.ok(cfg.mcpServers.other);
  assert.ok(cfg.mcpServers.talewell);
});

test('hostsMarkdown renders every host', () => {
  const md = hostsMarkdown();
  for (const h of HOSTS) assert.ok(md.includes(`\`${h.id}\``), h.id);
  assert.ok(md.includes('**no**'));  // unverified marker
});
