/**
 * Uji pemilih 3 pilihan (vn-lean-upgrade, design.md bagian B).
 * Uji properti memakai RNG berbenih sendiri (mulberry32), minimal 100 iterasi.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, type SeededRng } from '../../engine/rng';
import { COUNSELOR_SKILLS } from '../../data/skillEffects';
import { getStoryGraph, listStoryGraphs } from '../../data/stories/index';
import {
  chooseStoryChoice, MAX_STORY_TURNS, presentChoices, startStory,
} from '../../engine/story/runner';
import { createTestAgent, createTestMemory } from '../../engine/story/testGraph';
import type { StoryChoice, StoryNode } from '../../engine/story/storyTypes';
import type { RepairStepId } from '../../types';
import { MAX_PRESENTED, pickPresentedChoices } from './presentedChoices';

const ITERATIONS = 300;
const PLAYS_PER_GRAPH = 100;
const SKILL_IDS = COUNSELOR_SKILLS.map((s) => s.id);
const HINDERING = new Set(COUNSELOR_SKILLS.filter((s) => s.category === 'penghambat').map((s) => s.id));
const STEPS: RepairStepId[] = ['akui-dampak', 'minta-maaf', 'eksplorasi-perasaan', 'beri-pilihan'];
const CORE = new Set<RepairStepId>(['akui-dampak', 'minta-maaf', 'eksplorasi-perasaan']);

const pickOne = <T>(rnd: SeededRng, xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)];
const stepOf = (c: StoryChoice) => (c.action?.kind === 'perbaikan' ? c.action.step : null);
const isCore = (c: StoryChoice) => {
  const step = stepOf(c);
  return step !== null && CORE.has(step);
};
const handlesTension = (c: StoryChoice) =>
  c.action?.kind === 'akui-ketegangan' || c.action?.kind === 'perbaikan';
/** Hindering_Choice menurut glosarium. */
const isHindering = (c: StoryChoice, node: StoryNode) =>
  HINDERING.has(c.skillId) || (node.tension !== undefined && c.best !== true && !handlesTension(c));
const isRepairHub = (node: StoryNode) => node.tension?.phase === 'perbaikan';

function shuffle<T>(rnd: SeededRng, xs: readonly T[]): T[] {
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Simpul acak: 1..7 pilihan ber-id unik, umumnya tepat satu best, kadang tension. */
function genNode(rnd: SeededRng, phase?: 'awal' | 'perbaikan'): StoryNode {
  const tensionPhase = phase ?? pickOne(rnd, [undefined, undefined, 'awal', 'perbaikan'] as const);
  const n = 1 + Math.floor(rnd() * 7);
  const bestIndex = rnd() < 0.9 ? Math.floor(rnd() * n) : -1;
  const choices: StoryChoice[] = Array.from({ length: n }, (_, i) => {
    const c: StoryChoice = { id: `c${i}`, skillId: pickOne(rnd, SKILL_IDS), text: `t${i}`, next: 'x' };
    if (tensionPhase === 'perbaikan' && rnd() < 0.6) c.action = { kind: 'perbaikan', step: pickOne(rnd, STEPS) };
    if (tensionPhase === 'awal' && rnd() < 0.3) c.action = { kind: 'akui-ketegangan' };
    if (i === bestIndex) c.best = true;
    return c;
  });
  return {
    id: 'n', sceneId: 's', stage: 'hubungan', depth: 0,
    reply: { text: 'r', expression: 'netral', cue: 'c' },
    choices,
    ...(tensionPhase ? { tension: { phase: tensionPhase } } : {}),
  };
}

/** Komposisi yang diharapkan Property 1 untuk simpul bukan Repair_Hub dengan n > 3. */
function expectedNonRepair(node: StoryNode): Set<string> {
  const order = node.choices;
  const ids = new Set<string>();
  const best = order.find((c) => c.best === true);
  if (best) ids.add(best.id);
  const hindering = order.find((c) => !ids.has(c.id) && HINDERING.has(c.skillId))
    ?? (node.tension ? order.find((c) => !ids.has(c.id) && c.best !== true && !handlesTension(c)) : undefined);
  if (hindering) ids.add(hindering.id);
  for (const c of order) if (ids.size < MAX_PRESENTED) ids.add(c.id);
  return ids;
}

/** Property 1 dan 3 untuk satu masukan. */
function checkSelection(node: StoryNode, input: readonly StoryChoice[], label: string): void {
  const out = pickPresentedChoices(input, node);
  const n = input.length;
  const ids = out.map((c) => c.id);
  assert.equal(out.length, Math.min(MAX_PRESENTED, n), `${label}: jumlah`);
  assert.equal(new Set(ids).size, ids.length, `${label}: unik`);
  for (const c of out) assert.ok(input.includes(c), `${label}: ${c.id} dari masukan`);
  if (n <= MAX_PRESENTED) return;

  const best = node.choices.find((c) => c.best === true);
  if (best) assert.ok(ids.includes(best.id), `${label}: memuat Best_Choice`);
  if (isRepairHub(node)) {
    if (node.choices.some(isCore)) assert.ok(out.some(isCore), `${label}: langkah inti`);
    if (node.choices.some((c) => stepOf(c) === 'beri-pilihan')) {
      assert.ok(out.some((c) => stepOf(c) === 'beri-pilihan'), `${label}: beri-pilihan`);
    }
    return;
  }
  if (node.choices.some((c) => isHindering(c, node))) {
    assert.ok(out.some((c) => isHindering(c, node)), `${label}: memuat Hindering_Choice`);
  }
  assert.deepEqual(new Set(ids), expectedNonRepair(node), `${label}: slot sisa urut penulisan`);
}

// Feature: vn-lean-upgrade, Property 1: Seleksi tiga pilihan
// **Validates: Requirements 3.1, 3.2**
test('Property 1: Seleksi tiga pilihan (simpul acak)', () => {
  const rnd = mulberry32(20240501);
  for (let i = 0; i < ITERATIONS; i += 1) {
    const node = genNode(rnd);
    checkSelection(node, shuffle(rnd, node.choices), `iterasi ${i}`);
  }
});

test('contoh: ≤3 pilihan dikembalikan semua, daftar kosong menjadi []', () => {
  const node = genNode(mulberry32(7));
  const three = node.choices.slice(0, 3);
  assert.deepEqual(pickPresentedChoices(three, node), three);
  assert.notEqual(pickPresentedChoices(three, node), three);
  assert.deepEqual(pickPresentedChoices([], undefined), []);
});

test('contoh: tanpa simpul, aturan berjalan pada masukan', () => {
  const input = ['a', 'b', 'c', 'd', 'e']
    .map((id): StoryChoice => ({ id, skillId: 'refleksi-perasaan', text: id, next: 'x' }));
  input[4] = { ...input[4], best: true };
  assert.deepEqual(pickPresentedChoices(input, undefined).map((c) => c.id), ['a', 'b', 'e']);
});

test('contoh: Repair_Hub nyata menampilkan akui-dampak, beri-pilihan, dan opsi keliru', () => {
  const node = getStoryGraph('mhs-01')?.nodes.find((n) => n.id === 'ra-perbaikan-lab');
  assert.ok(node);
  assert.deepEqual(
    pickPresentedChoices(node.choices, node).map((c) => c.id),
    ['akui-dampak', 'beri-pilihan', 'remehkan'],
  );
});

// Feature: vn-lean-upgrade, Property 2: Urutan relatif dan determinisme
// **Validates: Requirements 3.3, 3.4**
test('Property 2: Urutan relatif dan determinisme', () => {
  const rnd = mulberry32(99173);
  for (let i = 0; i < ITERATIONS; i += 1) {
    const node = genNode(rnd);
    const a = shuffle(rnd, node.choices);
    const b = shuffle(rnd, node.choices);
    const outA = pickPresentedChoices(a, node);
    const outB = pickPresentedChoices(b, node);
    for (const [input, out] of [[a, outA], [b, outB]] as const) {
      const positions = out.map((c) => input.indexOf(c));
      assert.ok(positions.every((p, k) => p >= 0 && (k === 0 || p > positions[k - 1])), `iterasi ${i}: subbarisan`);
    }
    assert.deepEqual(new Set(outA.map((c) => c.id)), new Set(outB.map((c) => c.id)), `iterasi ${i}: himpunan sama`);
  }
});

// Feature: vn-lean-upgrade, Property 3: Repair_Hub tetap dapat pulih
// **Validates: Requirements 3.5**
test('Property 3: Repair_Hub tetap dapat pulih (simpul acak)', () => {
  const rnd = mulberry32(31337);
  for (let i = 0; i < ITERATIONS; i += 1) {
    const node = genNode(rnd, 'perbaikan');
    checkSelection(node, shuffle(rnd, node.choices), `repair ${i}`);
  }
});

// Pemindaian 18 graf: Property 1 dan 3 pada data cerita nyata.
// **Validates: Requirements 3.1, 3.2, 3.5**
test('pemindaian 18 graf: setiap simpul berpilihan menampilkan 3 pilihan yang sah', () => {
  const graphs = listStoryGraphs();
  assert.equal(graphs.length, 18);
  const rnd = mulberry32(4242);
  let repairHubs = 0;
  for (const g of graphs) {
    for (const node of g.nodes) {
      if (node.choices.length === 0) continue;
      if (isRepairHub(node)) repairHubs += 1;
      checkSelection(node, shuffle(rnd, node.choices), `${g.studentId}/${node.id}`);
    }
  }
  assert.ok(repairHubs > 0, 'ada Repair_Hub pada graf');
});

// Feature: vn-lean-upgrade, Property 4: Tanpa jalan buntu
// **Validates: Requirements 3.7**
for (const graph of listStoryGraphs()) {
  test(`Property 4: ${graph.studentId} tanpa jalan buntu (${PLAYS_PER_GRAPH} permainan berbenih)`, () => {
    const agent = createTestAgent(graph.studentId);
    for (let seed = 1; seed <= PLAYS_PER_GRAPH; seed += 1) {
      const rnd = mulberry32(seed * 7919 + 17);
      let state = startStory({
        graph, agent, memory: createTestMemory(graph.studentId),
        exposure: 0, seed, day: 1, timeFormatted: '08:00',
      });
      while (!state.ended && state.turn < MAX_STORY_TURNS) {
        const node = graph.nodes.find((n) => n.id === state.nodeId);
        const shown = pickPresentedChoices(presentChoices(graph, state), node);
        assert.ok(shown.length > 0 && shown.length <= MAX_PRESENTED, `seed ${seed}: ${state.nodeId} tanpa pilihan`);
        const res = chooseStoryChoice(graph, agent, state, shown[Math.floor(rnd() * shown.length)].id);
        assert.ok(res.ok, `seed ${seed}: ${res.ok ? '' : res.error.message}`);
        state = res.state;
      }
      assert.ok(state.ended, `seed ${seed}: cerita berakhir`);
      assert.ok(state.turn < MAX_STORY_TURNS, `seed ${seed}: berakhir sebelum MAX_STORY_TURNS (${state.turn})`);
    }
  });
}
