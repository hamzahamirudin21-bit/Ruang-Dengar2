import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_MAP } from '../data/map';
import { buildNavigationGrid } from './pathfinding';
import { createInitialAgents } from '../data/agents.seed';
import { updateAgentsNeedsAndSocialTick } from './agent';
import { mulberry32 } from './rng';
import {
  classifyAgentWellbeing,
  computeCampusMissionSummary,
  energyTrendOf,
  sortAgentsByUrgency,
} from './isolationMission';

test('interaksi sosial meningkatkan energi sementara keterisolasian menurunkan energi', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  const agents = createInitialAgents(LAB_MAP, grid, 202601);
  // Tempatkan dua agen berdekatan dengan afinitas tinggi agar pasti berinteraksi, dan satu agen menyendiri jauh
  const a = agents[0];
  const b = agents[1];
  const solo = agents[13]; // Rani (terisolasi-rentan)

  a.currentZoneId = 'diskusi';
  b.currentZoneId = 'diskusi';
  a.position = { x: 16, y: 14 };
  b.position = { x: 17, y: 14 };
  a.status = 'mengobrol';
  b.status = 'mengobrol';
  a.energy = 0.5;
  b.energy = 0.5;
  a.affinities[b.id] = 0.9;
  b.affinities[a.id] = 0.9;

  solo.currentZoneId = 'gudang-alat';
  solo.position = { x: 35, y: 3 };
  solo.status = 'bekerja';
  solo.energy = 0.5;

  // Jauhkan agen lain dari gudang-alat dan diskusi agar tidak mengganggu
  for (let i = 2; i < agents.length; i += 1) {
    if (agents[i].id === solo.id) continue;
    agents[i].currentZoneId = 'las';
    agents[i].position = { x: 3, y: 3 };
  }

  updateAgentsNeedsAndSocialTick([a, b, solo], [], mulberry32(42));

  assert.ok(a.interactingWithIds.includes(b.id), 'a dan b harus berinteraksi');
  assert.ok(a.energy > 0.5, `energi agen yang berinteraksi harus bertambah (dapat ${a.energy})`);
  assert.ok(b.energy > 0.5, `energi rekan yang berinteraksi harus bertambah (dapat ${b.energy})`);
  assert.equal(solo.interactingWithIds.length, 0);
  assert.ok(solo.energy < 0.5, `energi agen terisolasi harus berkurang (dapat ${solo.energy})`);
});

test('classifyAgentWellbeing dan sortAgentsByUrgency mendahulukan mahasiswa energi kritis & waspada', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  const agents = createInitialAgents(LAB_MAP, grid, 202601);
  agents[0].energy = 0.85;
  agents[0].socialStatus = 'berinteraksi';
  agents[0].interactingWithIds = [agents[1].id];

  agents[1].energy = 0.48;
  agents[1].socialStatus = 'sendiri';
  agents[1].interactingWithIds = [];

  agents[2].energy = 0.24;
  agents[2].socialStatus = 'sendiri';
  agents[2].interactingWithIds = [];

  const w0 = classifyAgentWellbeing(agents[0]);
  const w1 = classifyAgentWellbeing(agents[1]);
  const w2 = classifyAgentWellbeing(agents[2]);

  assert.equal(w0.tier, 'terhubung');
  assert.equal(energyTrendOf(agents[0]), 'naik');
  assert.equal(w1.tier, 'waspada');
  assert.equal(energyTrendOf(agents[1]), 'turun');
  assert.equal(w2.tier, 'kritis');

  const sorted = sortAgentsByUrgency([agents[0], agents[1], agents[2]], {});
  assert.deepEqual(
    sorted.map((a) => a.id),
    [agents[2].id, agents[1].id, agents[0].id],
  );

  const summary = computeCampusMissionSummary([agents[0], agents[1], agents[2]], {});
  assert.equal(summary.campusStatus, 'darurat');
  assert.equal(summary.topPriorityAgent?.id, agents[2].id);
  assert.equal(summary.criticalAgents.length, 1);
  assert.equal(summary.warningAgents.length, 1);
  assert.equal(summary.communicatingCount, 1);
});
