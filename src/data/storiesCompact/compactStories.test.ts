import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDENT_BLUEPRINTS } from '../agents.seed';
import { STUDENT_BACKGROUNDS } from '../studentBackgrounds';
import { COMPACT_STORY_GRAPHS } from './index';
import { chooseStoryChoice, startStory } from '../../engine/story/runner';
import { createTestAgent, createTestMemory } from '../../engine/story/testGraph';

const FORBIDDEN_DIAGNOSIS = /\b(depresi|gangguan jiwa|skizofrenia|bipolar|adhd|autis|psikopat|stres berat|trauma berat)\b/i;

test('semua 15 mahasiswa memiliki latar belakang kartu balik dan graf 7 giliran tepat 2 pilihan tanpa diagnosis', () => {
  assert.equal(STUDENT_BLUEPRINTS.length, 15);
  for (const bp of STUDENT_BLUEPRINTS) {
    // Pastikan latar belakang sisi belakang kartu tersedia lengkap
    const bg = STUDENT_BACKGROUNDS[bp.id];
    assert.ok(bg, `latar belakang kartu hilang untuk ${bp.id}`);
    assert.ok(bg.typeTag.length >= 4);
    assert.ok(bg.likes.length >= 8);
    assert.ok(bg.background.length >= 20);

    const graph = COMPACT_STORY_GRAPHS[bp.id];
    assert.ok(graph, `graf ringkas hilang untuk ${bp.id}`);

    const agent = createTestAgent(bp.id);
    let state = startStory({
      graph,
      agent,
      memory: createTestMemory(bp.id),
      exposure: 0,
      seed: 42,
      day: 1,
      timeFormatted: '09:00',
    });

    let turns = 0;
    while (!state.ended && turns < 20) {
      const node = graph.nodes.find((n) => n.id === state.nodeId);
      assert.ok(node, `simpul ${state.nodeId} ada`);
      // Setiap giliran wajib tepat 2 pilihan (1 tepat vs 1 salah)!
      assert.equal(node.choices.length, 2, `${bp.id}/${node.id} harus tepat 2 pilihan`);
      assert.equal(node.choices.filter((c) => c.best === true).length, 1, `${bp.id}/${node.id} harus ada 1 pilihan tepat`);
      assert.equal(node.choices.filter((c) => c.best === false).length, 1, `${bp.id}/${node.id} harus ada 1 pilihan salah`);

      const best = node.choices.find((c) => c.best === true)!;
      const res = chooseStoryChoice(graph, agent, state, best.id);
      assert.ok(res.ok, `${bp.id}/${node.id}/${best.id} harus diterima`);
      state = res.state;
      turns += 1;
    }

    assert.equal(state.ended, true, `${bp.id} harus selesai`);
    assert.equal(turns, 7, `${bp.id} jalur utama harus tepat 7 giliran (dapat ${turns})`);
    assert.equal(state.outcome?.kind, 'terbantu', `${bp.id} jalur tepat harus menghasilkan terbantu`);

    // Pastikan tidak ada istilah diagnosis pada seluruh teks
    for (const node of graph.nodes) {
      assert.equal(FORBIDDEN_DIAGNOSIS.test(node.reply.text), false, `${bp.id}/${node.id} reply`);
      for (const c of node.choices) {
        assert.equal(FORBIDDEN_DIAGNOSIS.test(c.text), false, `${bp.id}/${node.id}/${c.id} choice`);
        if (c.reaction) {
          assert.equal(FORBIDDEN_DIAGNOSIS.test(c.reaction.text), false, `${bp.id}/${node.id}/${c.id} reaction`);
        }
      }
    }
  }
});

test('memilih jawaban salah terus-menerus pada graf 2-pilihan tetap 7 giliran dan menghasilkan menarik-diri-sementara', () => {
  const graph = COMPACT_STORY_GRAPHS['mhs-14'];
  const agent = createTestAgent('mhs-14');

  let state = startStory({
    graph,
    agent,
    memory: createTestMemory('mhs-14'),
    exposure: 0,
    seed: 7,
    day: 1,
    timeFormatted: '09:00',
  });

  let turns = 0;
  while (!state.ended && turns < 20) {
    const node = graph.nodes.find((n) => n.id === state.nodeId)!;
    const wrong = node.choices.find((c) => c.best === false)!;
    const res = chooseStoryChoice(graph, agent, state, wrong.id);
    assert.ok(res.ok);
    state = res.state;
    turns += 1;
  }

  assert.equal(turns, 7);
  assert.equal(state.ended, true);
  assert.equal(state.outcome?.kind, 'menarik-diri-sementara');
});

test('kombinasi 4 tepat dan 3 salah menghasilkan kemajuan-kecil', () => {
  const graph = COMPACT_STORY_GRAPHS['mhs-01'];
  const agent = createTestAgent('mhs-01');

  let state = startStory({
    graph,
    agent,
    memory: createTestMemory('mhs-01'),
    exposure: 0,
    seed: 12,
    day: 1,
    timeFormatted: '09:00',
  });

  for (let i = 0; i < 7; i += 1) {
    const node = graph.nodes.find((n) => n.id === state.nodeId)!;
    const pickRight = i < 4;
    const choice = node.choices.find((c) => c.best === pickRight)!;
    const res = chooseStoryChoice(graph, agent, state, choice.id);
    assert.ok(res.ok);
    state = res.state;
  }

  assert.equal(state.ended, true);
  assert.equal(state.outcome?.kind, 'kemajuan-kecil');
});
