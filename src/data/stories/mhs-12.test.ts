/**
 * Kalibrasi dan uji jalur terbaik Sari Melati (mhs-12), tugas 13.7.
 * Validates: Requirements 5.4, 6.3, 6.9, 6.10, 11.1, 11.2
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { chooseStoryChoice, startStory } from '../../engine/story/runner';
import type { StoryRunnerState } from '../../engine/story/runner';
import { createTestAgent, createTestMemory } from '../../engine/story/testGraph';
import type { StoryChoice, StoryNode } from '../../engine/story/storyTypes';
import { validateStoryGraph } from '../../engine/story/validator';
import { STORY_MHS_12 as GRAPH } from './mhs-12';

const AGENT = createTestAgent('mhs-12');
const MAX_STEPS = 80;
const WRONG_SKILLS = new Set([
  'meremehkan', 'interogasi', 'nasihat-dini', 'janji-mutlak', 'pertanyaan-tertutup',
]);

type Picker = (node: StoryNode, state: StoryRunnerState) => StoryChoice;

interface Trace {
  final: StoryRunnerState;
  visited: string[];
  /** Kepercayaan sesudah giliran yang tiba di simpul (nodeId -> trust). */
  trustAt: Record<string, number>;
  levelAt: Record<string, number>;
  steps: number;
}

function walk(pick: Picker): Trace {
  let state = startStory({
    graph: GRAPH, agent: AGENT, memory: createTestMemory('mhs-12'),
    exposure: 0, seed: 1, day: 1, timeFormatted: '08:00',
  });
  const visited = [state.nodeId];
  const trustAt: Record<string, number> = {};
  const levelAt: Record<string, number> = {};
  let steps = 0;
  while (!state.ended && steps < MAX_STEPS) {
    const node = GRAPH.nodes.find((n) => n.id === state.nodeId)!;
    const choice = pick(node, state);
    const res = chooseStoryChoice(GRAPH, AGENT, state, choice.id);
    assert.ok(res.ok, res.ok ? '' : `${res.error.code}: ${res.error.message} @${node.id}/${choice.id}`);
    state = res.state;
    steps += 1;
    visited.push(state.nodeId);
    trustAt[state.nodeId] = state.session.vars.trust;
    levelAt[state.nodeId] = state.session.highestLevelReached;
  }
  return { final: state, visited, trustAt, levelAt, steps };
}

const best: Picker = (node) => node.choices.find((c) => c.best) ?? node.choices[0];

/** Ramah dan memuji: tidak pernah menyampaikan pengamatan faktual peran. */
const friendly: Picker = (node) => {
  const c = node.choices;
  if (node.id === 's-l1' || node.id === 's-l2') return c.find((x) => x.id === 'afirmasi-bintang')!;
  if (node.id === 's-l3-tolak') return c.find((x) => x.id === 'privasi')!;
  if (node.id === 's-b3') return c.find((x) => x.id === 'c')!;
  if (node.id === 's-b4') return c.find((x) => x.id === 'b')!;
  if (node.id === 's-l3') return c.find((x) => x.id === 'ajak-ruang-bk')!;
  return c.find((x) => x.best) ?? c[0];
};

const allWrong: Picker = (node) =>
  node.choices.find((c) => WRONG_SKILLS.has(c.skillId)) ?? node.choices[node.choices.length - 1];

test('mhs-12: validator kosong', () => {
  assert.deepEqual(validateStoryGraph(GRAPH, { agent: AGENT }), []);
});

test('mhs-12: jalur terpendek 15-17 simpul pilihan', () => {
  const byId = new Map(GRAPH.nodes.map((n) => [n.id, n]));
  const dist = new Map<string, number>([[GRAPH.startNodeId, 0]]);
  const queue = [GRAPH.startNodeId];
  let shortest = Infinity;
  while (queue.length > 0) {
    const id = queue.shift()!;
    const d = dist.get(id)!;
    for (const c of byId.get(id)!.choices) {
      const targets = [c.next, ...(c.routes ?? []).map((r) => r.next)];
      for (const t of targets) {
        if (t === '@ending') { shortest = Math.min(shortest, d + 1); continue; }
        if (t.startsWith('@') || dist.has(t)) continue;
        dist.set(t, d + 1);
        queue.push(t);
      }
    }
  }
  console.log(`[mhs-12] panjang jalur terpendek (graf) = ${shortest}`);
  assert.ok(shortest >= 15 && shortest <= 17, `jalur terpendek ${shortest} di luar 15-17`);
});

test('mhs-12: jalur best menghasilkan terbantu lewat Momen_Terbuka dengan margin >= 4', () => {
  const t = walk(best);
  console.log(`[mhs-12] best: langkah=${t.steps} kualitas=${t.final.outcome?.quality} trust@s-b8=${t.trustAt['s-b8']} level@s-b12=${t.levelAt['s-b12']}`);
  assert.equal(t.final.outcome?.kind, 'terbantu');
  assert.ok(t.visited.includes('s-b8'), 'Momen_Terbuka s-b8 dikunjungi');
  assert.ok(t.visited.includes('s-b12'), 'inti kebutuhan s-b12 dikunjungi');
  assert.ok(!t.visited.includes('s-b8-alt'));
  assert.ok(t.final.flags.includes('pengamatan-peran'));
  assert.ok(t.trustAt['s-b8'] >= 70 + 4, `trust di gerbang s-b8 = ${t.trustAt['s-b8']}`);
  assert.ok(t.levelAt['s-b12'] >= 2 + 0);
  assert.ok(t.final.outcome!.quality >= GRAPH.outcomeRules.helpedMinQuality + 4,
    `kualitas ${t.final.outcome!.quality} kurang margin 4`);
  assert.ok(t.steps >= 15 && t.steps <= 17, `langkah ${t.steps}`);
});

test('mhs-12: jalur ramah tanpa pengamatan peran berakhir kemajuan-kecil', () => {
  const t = walk(friendly);
  const maxTrust = Math.max(...Object.values(t.trustAt));
  console.log(`[mhs-12] ramah: hasil=${t.final.outcome?.kind} kualitas=${t.final.outcome?.quality} trust maks=${maxTrust}`);
  assert.ok(!t.final.flags.includes('pengamatan-peran'));
  assert.ok(maxTrust >= 70, `trust maks ${maxTrust}`);
  assert.equal(t.final.outcome?.kind, 'kemajuan-kecil');
});

test('mhs-12: tepat 4 pilihan per simpul dan teks pilihan <= 90 karakter', () => {
  for (const n of GRAPH.nodes) {
    if (n.choices.length === 0) continue; // simpul akhir
    assert.equal(n.choices.length, 4, n.id);
    for (const ch of n.choices) assert.ok(ch.text.length <= 90, `${n.id}/${ch.id} ${ch.text.length}`);
  }
});

test('mhs-12: jalur semua keliru menghasilkan menarik-diri-sementara tanpa galat', () => {
  const t = walk(allWrong);
  assert.ok(t.final.ended);
  assert.equal(t.final.outcome?.kind, 'menarik-diri-sementara');
});
