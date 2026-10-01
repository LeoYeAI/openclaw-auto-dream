import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TalewellStore } from '../src/store.mjs';
import { parseRecord, serializeRecord, normalizeAliases, extractLinks } from '../src/schema.mjs';
import { rank, tokenize } from '../src/recall.mjs';
import { consolidate } from '../src/consolidate.mjs';

function tmpRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'talewell-test-'));
  return TalewellStore.init(dir);
}

test('init creates layout and commits', () => {
  const store = tmpRepo();
  assert.ok(fs.existsSync(path.join(store.root, 'amp.json')));
  assert.ok(fs.existsSync(path.join(store.root, 'memory', 'facts')));
  assert.ok(fs.existsSync(path.join(store.root, 'memory', 'procedures')));
  assert.ok(store.log().length >= 1);
});

test('serialize/parse round-trip', () => {
  const rec = {
    id: 'f-abc', kind: 'fact', aliases: ['吃饭', 'dining'],
    text: 'Leo 不吃辣', origin: 'owner', importance: 7,
    observedAt: '2026-10-01', links: ['e-1'],
  };
  const parsed = parseRecord(serializeRecord(rec));
  assert.equal(parsed.id, 'f-abc');
  assert.equal(parsed.text, 'Leo 不吃辣');
  assert.deepEqual(parsed.aliases, ['吃饭', 'dining']);
  assert.equal(parsed.importance, 7);
});

test('remember writes file and commits', () => {
  const store = tmpRepo();
  const before = store.log().length;
  const res = store.remember({ text: 'Leo 不吃辣', aliases: ['辣', 'diet'] });
  assert.ok(res.id.startsWith('f-'));
  assert.ok(fs.existsSync(path.join(store.root, res.file)));
  assert.equal(store.log().length, before + 1);
  assert.equal(store.get(res.id).text, 'Leo 不吃辣');
});

test('taint gate refuses untrusted origin', () => {
  const store = tmpRepo();
  assert.throws(
    () => store.remember({ text: 'from a web page', origin: 'untrusted' }),
    /not promotable/,
  );
  assert.throws(
    () => store.remember({ text: 'scaffolding', origin: 'system' }),
    /not promotable/,
  );
});

test('recall is deterministic and CJK-capable', () => {
  const store = tmpRepo();
  store.remember({ text: 'Leo 不吃辣', aliases: ['饮食', '辣', 'diet'], importance: 7 });
  store.remember({ text: 'Leo 偏好安静的餐厅', aliases: ['餐厅', '安静'] });
  const zh = store.recall('订餐厅要注意什么');
  assert.ok(zh.length >= 1);
  const en = store.recall('diet preference');
  assert.equal(en[0].text, 'Leo 不吃辣');
  // deterministic: same query twice, same order
  assert.deepEqual(store.recall('diet').map((r) => r.id), store.recall('diet').map((r) => r.id));
});

test('correct supersedes and keeps history', () => {
  const store = tmpRepo();
  const { id } = store.remember({ text: 'Leo 喜欢日料', aliases: ['日料'] });
  const c = store.correct(id, { text: 'Leo 吃腻日料了' });
  assert.notEqual(c.id, id);
  assert.equal(store.get(c.id).supersedes, id);
  assert.equal(store.get(id).text, 'Leo 喜欢日料'); // old version still readable
  assert.ok(store.diff(c.id).includes('日料')); // history preserved in git
});

test('forget removes from working tree but keeps git history', () => {
  const store = tmpRepo();
  const { id } = store.remember({ text: 'temporary fact' });
  store.forget(id, { reason: 'test' });
  assert.equal(store.get(id), null);
  assert.ok(store.log().some((c) => c.subject.includes('forget')));
});

test('graph follows [[links]]', () => {
  const store = tmpRepo();
  const a = store.remember({ text: 'Leo works with [[Sam]]', kind: 'fact' });
  const b = store.remember({ text: 'Sam leads [[ProjectX]]', kind: 'fact' });
  const g = store.graph(a.id, { depth: 2 });
  assert.ok(g.edges.length >= 1);
});

test('rollback restores previous state', () => {
  const store = tmpRepo();
  const first = store.remember({ text: 'fact one' });
  const head = store.log()[0].hash;
  store.remember({ text: 'fact two' });
  assert.equal(store.list().length, 2);
  store.rollback(head, { confirm: true });
  assert.equal(store.list().length, 1);
  assert.ok(store.get(first.id));
});

test('rollback requires explicit confirmation', () => {
  const store = tmpRepo();
  const head = store.log()[0].hash;
  assert.throws(() => store.rollback(head), /confirm/);
});

test('consolidate dedupes and rejects untrusted', () => {
  const store = tmpRepo();
  const res = consolidate(store, [
    { text: 'Leo 不吃辣', origin: 'owner', aliases: ['辣'] },
    { text: 'Leo 不吃辣', origin: 'owner', aliases: ['辣'] }, // duplicate
    { text: 'poisoned instruction', origin: 'untrusted' },
  ]);
  assert.equal(res.added, 1);
  assert.equal(res.merged, 1);
  assert.equal(res.rejected, 1);
});

test('consolidate dryRun writes nothing', () => {
  const store = tmpRepo();
  const before = store.list().length;
  const res = consolidate(store, [{ text: 'candidate', origin: 'agent' }], { dryRun: true });
  assert.equal(res.added, 1);
  assert.equal(store.list().length, before);
});

test('index and health', () => {
  const store = tmpRepo();
  store.remember({ text: 'a', aliases: ['x'] });
  const idx = store.index();
  assert.equal(idx.counts.total, 1);
  const h = store.health();
  assert.equal(h.total, 1);
  assert.ok(store.indexMarkdown().includes('<!-- Talewell index'));
});

test('superseded records drop out of list and recall by default', () => {
  const store = tmpRepo();
  const { id: oldId } = store.remember({ text: 'Leo 喜欢日料', aliases: ['日料', 'sushi'], importance: 5 });
  const c = store.correct(oldId, { text: 'Leo 吃腻日料了', aliases: ['日料'] });

  // default views exclude the retired value
  assert.equal(store.list().some((r) => r.id === oldId), false);
  assert.equal(store.recall('日料').some((r) => r.id === oldId), false);
  assert.ok(store.recall('日料').some((r) => r.id === c.id));

  // audit view can still see it, and get() always works
  assert.equal(store.list({ includeSuperseded: true }).some((r) => r.id === oldId), true);
  assert.equal(store.get(oldId).text, 'Leo 喜欢日料');

  // index (what gets injected) must not carry the stale value
  assert.equal(store.indexMarkdown().includes('喜欢日料'), false);

  // health still counts both sides
  const h = store.health();
  assert.equal(h.total, 2);
  assert.equal(h.active, 1);
  assert.equal(h.superseded, 1);
});

test('helpers', () => {
  assert.deepEqual(normalizeAliases([' a ', 'A', '', 'b']), ['a', 'b']);
  assert.deepEqual(extractLinks('see [[f-1]] and [[e-2]]'), ['f-1', 'e-2']);
  assert.ok(tokenize('餐厅').has('餐厅'));
});
