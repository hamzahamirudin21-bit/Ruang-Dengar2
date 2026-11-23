import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDENT_BLUEPRINTS } from '../agents.seed';
import { COMPACT_STORY_GRAPHS } from './index';
import { chooseStoryChoice, startStory } from '../../engine/story/runner';
import { createTestAgent, createTestMemory } from '../../engine/story/testGraph';

const FORBIDDEN_DIAGNOSIS = /\b(depresi|gangguan jiwa|skizofrenia|bipolar|adhd|autis|psikopat|stres berat|trauma berat)\b/i;

test('semua 15 mahasiswa memiliki graf cerita ringkas tepat 7 giliran tanpa istilah diagnosis', () => {
  assert.equal(STUDENT_BLUEPRINTS.length, 15);
  for (const bp of STUDENT_BLUEPRINTS) {
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
      const best = node.choices.find((c) => c.best) ?? node.choices[0];
      assert.ok(best, `pilihan tersedia pada ${node.id}`);
      const res = chooseStoryChoice(graph, agent, state, best.id);
      assert.ok(res.ok, `${bp.id}/${node.id}/${best.id} harus diterima`);
      state = res.state;
      turns += 1;
    }

    assert.equal(state.ended, true, `${bp.id} harus selesai`);
    assert.equal(turns, 7, `${bp.id} jalur utama harus tepat 7 giliran (dapat ${turns})`);
    assert.equal(state.outcome?.kind, 'terbantu', `${bp.id} jalur empatik harus menghasilkan terbantu`);

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

test('jalur menekan/menghakimi di graf ringkas memicu ketegangan dan dapat pulih atau menarik diri', () => {
  const graph = COMPACT_STORY_GRAPHS['mhs-14'];
  const agent = createTestAgent('mhs-14');

  // Skenario A: memicu ketegangan lalu terus mendesak -> menarik diri sementara
  let stateA = startStory({
    graph,
    agent,
    memory: createTestMemory('mhs-14'),
    exposure: 0,
    seed: 7,
    day: 1,
    timeFormatted: '09:00',
  });
  const a1 = chooseStoryChoice(graph, agent, stateA, 'nasihat');
  assert.ok(a1.ok);
  stateA = a1.state;
  assert.equal(stateA.nodeId, 'mhs-14-tegang-awal');

  const a2 = chooseStoryChoice(graph, agent, stateA, 'desak');
  assert.ok(a2.ok);
  stateA = a2.state;
  const a3 = chooseStoryChoice(graph, agent, stateA, 'desak');
  assert.ok(a3.ok);
  assert.equal(a3.state.ended, true);
  assert.equal(a3.state.outcome?.kind, 'menarik-diri-sementara');

  // Skenario B: memicu ketegangan lalu diakui & diperbaiki -> kembali ke alur utama
  let stateB = startStory({
    graph,
    agent,
    memory: createTestMemory('mhs-14'),
    exposure: 0,
    seed: 7,
    day: 1,
    timeFormatted: '09:00',
  });
  const b1 = chooseStoryChoice(graph, agent, stateB, 'nasihat');
  assert.ok(b1.ok);
  stateB = b1.state;
  const b2 = chooseStoryChoice(graph, agent, stateB, 'akui');
  assert.ok(b2.ok);
  stateB = b2.state;
  assert.equal(stateB.nodeId, 'mhs-14-tegang-perbaikan');
  const b3 = chooseStoryChoice(graph, agent, stateB, 'akui-dampak');
  assert.ok(b3.ok);
  stateB = b3.state;
  const b4 = chooseStoryChoice(graph, agent, stateB, 'beri-pilihan');
  assert.ok(b4.ok);
  stateB = b4.state;
  assert.equal(stateB.session.rupture.active, false);
  assert.equal(stateB.nodeId, 'mhs-14-t1');
});
