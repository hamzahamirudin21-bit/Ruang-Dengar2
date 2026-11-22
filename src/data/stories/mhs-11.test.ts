import test from 'node:test';
import assert from 'node:assert/strict';
import { STORY_MHS_11 } from './mhs-11';
import { validateStoryGraph } from '../../engine/story/validator';
import { chooseStoryChoice, startStory } from '../../engine/story/runner';
import type { StoryRunnerState } from '../../engine/story/runner';
import type { StoryChoice, StoryNode } from '../../engine/story/storyTypes';
import { determineRuptureKind } from '../../engine/rupture';
import { buildAgentSessionVars } from '../../engine/trust';
import { createTestAgent, createTestMemory } from '../../engine/story/testGraph';

const agent = createTestAgent('mhs-11');
const MISTAKE_SKILLS = new Set([
  'meremehkan', 'nasihat-dini', 'interogasi', 'janji-mutlak',
]);
const nodeOf = (id: string): StoryNode => {
  const n = STORY_MHS_11.nodes.find((x) => x.id === id);
  assert.ok(n, `simpul ${id} ada`);
  return n;
};

type Policy = (node: StoryNode, state: StoryRunnerState) => StoryChoice;

interface RunResult {
  state: StoryRunnerState;
  visited: string[];
  trustAtNode: Record<string, number>;
}

function play(policy: Policy, seed = 1): RunResult {
  let state = startStory({
    graph: STORY_MHS_11, agent, memory: createTestMemory('mhs-11'),
    exposure: 0, seed, day: 1, timeFormatted: '08:00',
  });
  const visited = [state.nodeId];
  const trustAtNode: Record<string, number> = { [state.nodeId]: state.session.vars.trust };
  for (let i = 0; i < 80 && !state.ended; i++) {
    const node = nodeOf(state.nodeId);
    const choice = policy(node, state);
    const res = chooseStoryChoice(STORY_MHS_11, agent, state, choice.id);
    assert.ok(res.ok, `pilihan ${node.id}/${choice.id} diterima`);
    state = res.state;
    visited.push(state.nodeId);
    trustAtNode[state.nodeId] = state.session.vars.trust;
  }
  assert.ok(state.ended, 'cerita berakhir');
  return { state, visited, trustAtNode };
}

const bestPolicy: Policy = (node) => {
  const c = node.choices.find((x) => x.best) ?? node.choices[0];
  return c;
};

/** Hangat tetapi dangkal: tidak pernah memilih opsi terbaik; hindari opsi keliru bila bisa. */
const NEUTRAL_ORDER = ['jeda-hening', 'sapaan-hangat', 'afirmasi-kekuatan', 'sampaikan-pengamatan'];
const shallowPolicy: Policy = (node) => {
  const safe = node.choices.filter((c) => !c.best && !MISTAKE_SKILLS.has(c.skillId) &&
    c.skillId !== 'pertanyaan-tertutup');
  for (const s of NEUTRAL_ORDER) {
    const hit = safe.find((c) => c.skillId === s);
    if (hit) return hit;
  }
  return safe[0] ?? node.choices[0];
};
/** Selalu Opsi_Keliru_Pemula; pada hub perbaikan memilih opsi keliru juga. */
const mistakePolicy: Policy = (node) =>
  node.choices.find((c) => MISTAKE_SKILLS.has(c.skillId)) ?? node.choices[node.choices.length - 1];

test('mhs-11: validateStoryGraph kosong', () => {
  assert.deepEqual(validateStoryGraph(STORY_MHS_11, { agent }), []);
});

test('mhs-11: setiap simpul tepat 4 pilihan, teks pilihan <= 120 karakter', () => {
  for (const n of STORY_MHS_11.nodes) {
    if (n.ending) continue;
    assert.equal(n.choices.length, 4, `${n.id} punya 4 pilihan`);
    for (const c of n.choices) assert.ok(c.text.length <= 120, `${n.id}/${c.id} ${c.text.length}`);
  }
});

test('mhs-11: jalur terpendek menuju akhir 15 sampai 17 simpul', () => {
  const byId = new Map(STORY_MHS_11.nodes.map((n) => [n.id, n]));
  const dist = new Map<string, number>([[STORY_MHS_11.startNodeId, 1]]);
  const queue = [STORY_MHS_11.startNodeId];
  let shortest = Infinity;
  while (queue.length) {
    const id = queue.shift() as string;
    const d = dist.get(id) as number;
    const node = byId.get(id);
    if (!node) continue;
    if (node.ending) { shortest = Math.min(shortest, d); continue; }
    for (const c of node.choices) {
      const targets = [c.next, ...(c.routes ?? []).map((r) => r.next)];
      if (node.gate) targets.push(node.gate.otherwise);
      for (const t of targets) {
        const dest = t === '@ending' ? STORY_MHS_11.endings.terbantu : t;
        if (t === '@resume' || dist.has(dest)) continue;
        dist.set(dest, d + 1);
        queue.push(dest);
      }
    }
  }
  assert.ok(shortest >= 15 && shortest <= 17, `jalur terpendek ${shortest} di 15..17`);
});


const SEEDS = [1, 2, 3, 7, 11, 42, 99, 123, 2024, 31337];

test('mhs-11: jalur terbaik menghasilkan terbantu lewat Momen_Terbuka dan inti', () => {
  for (const seed of SEEDS) {
    const { state, visited, trustAtNode } = play(bestPolicy, seed);
    assert.equal(state.outcome?.kind, 'terbantu', `seed ${seed}`);
    assert.ok(visited.includes('ma-b8'), `ma-b8 dikunjungi (seed ${seed})`);
    assert.ok(visited.includes('ma-b12'), `ma-b12 dikunjungi (seed ${seed})`);
    assert.ok(state.flags.includes('momen-terbuka'));
    assert.ok(state.flags.includes('langkah-kecil'));
    assert.ok(visited.includes('ma-b9'), `ma-b9 dikunjungi (seed ${seed})`);
    assert.ok(state.session.highestLevelReached >= STORY_MHS_11.outcomeRules.helpedMinLevel);
    // Margin >= 4 poin di setiap gerbang trust-min (ajak ke ruang BK: 55, ma-b9: 65, ma-b8: 69).
    assert.ok(trustAtNode['ma-b0'] >= 55 + 4, `margin ajak ke ruang BK ${trustAtNode['ma-b0']} (seed ${seed})`);
    assert.ok(trustAtNode['ma-b9'] >= 65 + 4, `margin ma-b9 ${trustAtNode['ma-b9']} (seed ${seed})`);
    assert.ok(trustAtNode['ma-b8'] >= 69 + 4, `margin ma-b8 ${trustAtNode['ma-b8']} (seed ${seed})`);
    assert.ok(visited.length >= 15 && visited.length <= 17, `panjang jalur terbaik ${visited.length} (seed ${seed})`);
    assert.ok(
      (state.outcome?.quality ?? 0) >= STORY_MHS_11.outcomeRules.helpedMinQuality + 4,
      `margin kualitas ${state.outcome?.quality} (seed ${seed})`,
    );
  }
});

test('mhs-11: jalur netral tanpa ma-b8 menghasilkan kemajuan-kecil', () => {
  for (const seed of SEEDS) {
    const { state, visited } = play(shallowPolicy, seed);
    assert.ok(!visited.includes('ma-b8'), `ma-b8 dilewati (seed ${seed})`);
    assert.equal(state.outcome?.kind, 'kemajuan-kecil', `seed ${seed}`);
  }
});

test('mhs-11: jalur semua opsi keliru pemula menarik-diri-sementara tanpa galat', () => {
  for (const seed of SEEDS) {
    const { state } = play(mistakePolicy, seed);
    assert.equal(state.outcome?.kind, 'menarik-diri-sementara', `seed ${seed}`);
  }
});

test('mhs-11: jenis simpul Ketegangan sama dengan determineRuptureKind', () => {
  const actual = determineRuptureKind(agent, buildAgentSessionVars(agent, 0));
  for (const n of STORY_MHS_11.nodes) {
    if (n.tension?.expectedKind) assert.equal(n.tension.expectedKind, actual, n.id);
  }
});



