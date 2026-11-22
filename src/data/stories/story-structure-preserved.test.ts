/**
 * Uji preservasi (story-reply-coherence, Property 2; vn-lean-upgrade, Property 7).
 * Membandingkan sidik struktur graf (tanpa `reply`, `reaction`, dan `text` pilihan)
 * dan hasil permainan berbenih dengan snapshot yang diambil pada konten asli.
 * Buat ulang snapshot HANYA dengan: UPDATE_STRUCTURE_SNAPSHOT=1.
 *
 * Feature: vn-lean-upgrade, Property 7: Struktur cerita terjaga
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5 (story-reply-coherence); 5.3 (vn-lean-upgrade)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { AUTHORED_STORIES, listStoryGraphs } from './index';
import { validateStoryCohort, validateStoryGraph } from '../../engine/story/validator';
import { chooseStoryChoice, startStory } from '../../engine/story/runner';
import { createTestAgent, createTestMemory } from '../../engine/story/testGraph';
import type { StoryGraph } from '../../engine/story/storyTypes';

const SNAPSHOT_PATH = fileURLToPath(new URL('./story-structure.snapshot.json', import.meta.url));
const RUNS_PER_GRAPH = 100;
const MAX_STEPS = 120;

interface Snapshot {
  version: 1;
  graphs: Record<string, {
    meta: string;
    nodes: Record<string, string>;
    plays: string[];
  }>;
}

const sha = (v: unknown) => createHash('sha1').update(JSON.stringify(v)).digest('hex').slice(0, 16);

/** Serialisasi stabil: kunci terurut, undefined dibuang. */
function canon(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(o).sort().filter((k) => o[k] !== undefined).map((k) => [k, canon(o[k])]),
    );
  }
  return v;
}

/** Simpul tanpa `reply`, tanpa `reaction` pilihan, dan tanpa `text` pilihan; semua bidang lain ikut. */
function nodeFingerprint(node: StoryGraph['nodes'][number]): string {
  const { reply: _reply, choices, ...rest } = node;
  void _reply;
  const stripped = choices.map(({ reaction: _r, text: _t, ...c }) => { void _r; void _t; return c; });
  return sha(canon({ ...rest, choices: stripped }));
}

function metaFingerprint(g: StoryGraph): string {
  const { nodes: _n, ...rest } = g;
  void _n;
  return sha(canon(rest));
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function playOnce(graph: StoryGraph, runSeed: number): string {
  const agent = createTestAgent(graph.studentId);
  const rnd = mulberry32(runSeed * 7919 + 13);
  let state = startStory({
    graph, agent, memory: createTestMemory(graph.studentId),
    exposure: 0, seed: runSeed, day: 1, timeFormatted: '08:00',
  });
  const path: string[] = [state.nodeId];
  for (let i = 0; i < MAX_STEPS && !state.ended; i += 1) {
    const node = graph.nodes.find((n) => n.id === state.nodeId);
    if (!node || node.choices.length === 0) break;
    const choice = node.choices[Math.floor(rnd() * node.choices.length)];
    const res = chooseStoryChoice(graph, agent, state, choice.id);
    if (!res.ok) { path.push(`!${choice.id}:${res.error.code}`); break; }
    state = res.state;
    path.push(`${choice.id}>${state.nodeId}`);
  }
  return sha(canon({
    path,
    trust: state.session.vars.trust,
    unlocked: state.session.unlockedLevel,
    highest: state.session.highestLevelReached,
    ruptureActive: state.session.rupture.active,
    flags: state.flags,
    ended: state.ended,
    outcome: state.outcome ? { kind: state.outcome.kind, quality: state.outcome.quality } : null,
  }));
}

function capture(): Snapshot {
  const graphs: Snapshot['graphs'] = {};
  for (const id of Object.keys(AUTHORED_STORIES).sort()) {
    const g = AUTHORED_STORIES[id];
    graphs[id] = {
      meta: metaFingerprint(g),
      nodes: Object.fromEntries(g.nodes.map((n) => [n.id, nodeFingerprint(n)])),
      plays: Array.from({ length: RUNS_PER_GRAPH }, (_, i) => playOnce(g, i + 1)),
    };
  }
  return { version: 1, graphs };
}

if (process.env.UPDATE_STRUCTURE_SNAPSHOT === '1') {
  writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(capture(), null, 1)}\n`);
}

const snapshot: Snapshot | null = existsSync(SNAPSHOT_PATH)
  ? (JSON.parse(readFileSync(SNAPSHOT_PATH, 'utf8')) as Snapshot)
  : null;

test('snapshot struktur ada (buat dengan UPDATE_STRUCTURE_SNAPSHOT=1 pada konten asli)', () => {
  assert.ok(snapshot, 'story-structure.snapshot.json tidak ditemukan');
  assert.equal(Object.keys(snapshot.graphs).length, Object.keys(AUTHORED_STORIES).length);
});

for (const id of Object.keys(AUTHORED_STORIES).sort()) {
  const g = AUTHORED_STORIES[id];

  test(`${id}: sidik struktur graf sama dengan snapshot`, () => {
    const snap = snapshot?.graphs[id];
    assert.ok(snap, `snapshot ${id} ada`);
    assert.equal(metaFingerprint(g), snap.meta, `${id}: metadata graf berubah`);
    assert.deepEqual(g.nodes.map((n) => n.id), Object.keys(snap.nodes), `${id}: daftar simpul berubah`);
    for (const n of g.nodes) {
      assert.equal(nodeFingerprint(n), snap.nodes[n.id], `${id} / ${n.id}: struktur simpul berubah`);
    }
  });

  // Uji "reaction lama tetap sama persis" (beserta bidang `reactions` di snapshot) dihapus
  // pada vn-lean-upgrade: tugas 4.x sengaja menulis ulang teks agar alur percakapan nyambung.
  // Struktur dan hasil permainan tetap dijaga oleh sidik struktur dan sidik permainan.

  test(`${id}: ${RUNS_PER_GRAPH} permainan acak berbenih berhasil sama`, () => {
    const snap = snapshot?.graphs[id];
    assert.ok(snap, `snapshot ${id} ada`);
    assert.equal(snap.plays.length, RUNS_PER_GRAPH);
    for (let i = 0; i < RUNS_PER_GRAPH; i += 1) {
      assert.equal(playOnce(g, i + 1), snap.plays[i], `${id}: permainan seed ${i + 1} berbeda`);
    }
  });
}

test('validateStoryGraph tanpa galat untuk semua graf dan validateStoryCohort kosong', () => {
  for (const g of listStoryGraphs()) {
    assert.deepEqual(validateStoryGraph(g), [], g.studentId);
  }
  assert.deepEqual(validateStoryCohort(listStoryGraphs()), []);
});
