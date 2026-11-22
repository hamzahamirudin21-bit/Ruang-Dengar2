/**
 * Tugas 33.3: kalibrasi MAX_STORY_TURNS dengan jalan acak deterministik pada 15 graf.
 * **Validates: Requirements 6.2, 9.3, 11.8**
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDENT_BLUEPRINTS } from '../agents.seed';
import { createEmptyAgentMemory } from '../../engine/memory';
import { mulberry32 } from '../../engine/rng';
import {
  chooseStoryChoice, MAX_STORY_TURNS, presentChoices, startStory,
} from '../../engine/story/runner';
import { createTestAgent } from '../../engine/story/testGraph';
import { getStoryGraph } from './index';

const WALKS = 100;
const KINDS = ['terbantu', 'kemajuan-kecil', 'menarik-diri-sementara'];

test('jalan acak pada 15 graf berakhir dalam MAX_STORY_TURNS dengan state valid', () => {
  assert.equal(STUDENT_BLUEPRINTS.length, 15);
  let longest = 0;
  let forcedByLimit = 0;
  for (const bp of STUDENT_BLUEPRINTS) {
    const graph = getStoryGraph(bp.id);
    assert.ok(graph, `graf ${bp.id} ada`);
    const agent = createTestAgent(bp.id);
    for (let w = 0; w < WALKS; w += 1) {
      const rng = mulberry32(1000 + w * 7919);
      let state = startStory({
        graph, agent, memory: createEmptyAgentMemory(agent.id), exposure: 0,
        seed: 1000 + w, day: 1, timeFormatted: '09:00',
      });
      let guard = 0;
      while (!state.ended) {
        guard += 1;
        assert.ok(guard <= MAX_STORY_TURNS, `${bp.id} jalan ${w} melewati batas giliran`);
        const choices = presentChoices(graph, state);
        assert.ok(choices.length > 0, `${bp.id} jalan ${w}: simpul ${state.nodeId} tanpa pilihan`);
        const pick = choices[Math.floor(rng() * choices.length)];
        const res = chooseStoryChoice(graph, agent, state, pick.id);
        assert.ok(res.ok, `${bp.id} jalan ${w}: ${res.ok ? '' : res.error.message}`);
        state = res.state;
        assert.ok(state.session.vars.trust >= 0 && state.session.vars.trust <= 100);
        assert.equal(state.history.length, state.turn + 1);
      }
      longest = Math.max(longest, state.turn);
      if (state.turn >= MAX_STORY_TURNS) forcedByLimit += 1;
      assert.ok(state.turn <= MAX_STORY_TURNS);
      assert.ok(KINDS.includes(state.outcome?.kind ?? ''), `${bp.id} jalan ${w}: hasil sah`);
    }
  }
  console.log(`walk-all: terpanjang=${longest} kena-batas=${forcedByLimit} MAX=${MAX_STORY_TURNS}`);
});
