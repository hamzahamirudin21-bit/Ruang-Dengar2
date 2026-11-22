import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_MAP } from '../data/map';
import { STUDENT_BLUEPRINTS, STUDENT_COUNT } from '../data/agents.seed';
import { scoreAgentActivityCandidates } from './agent';
import { buildNavigationGrid, isPointWalkable } from './pathfinding';
import { advanceWorld, createWorldState, getWorldSocialSummary } from './world';

test('mahasiswa unik terbentuk dengan profil lengkap tanpa NPC kosong', () => {
  const world = createWorldState(LAB_MAP, 202601, 1, 'lab', false);
  assert.equal(world.agents.length, STUDENT_COUNT);
  assert.equal(STUDENT_BLUEPRINTS.length, STUDENT_COUNT);

  const ids = new Set<string>();
  const names = new Set<string>();
  const grid = buildNavigationGrid(LAB_MAP, 'lab');

  for (const agent of world.agents) {
    ids.add(agent.id);
    names.add(agent.name);
    assert.ok(agent.uniquePotential.trim().length > 10, `${agent.id} harus memiliki potensi unik`);
    assert.equal(Object.keys(agent.affinities).length, STUDENT_COUNT - 1, `${agent.id} harus memiliki ${STUDENT_COUNT - 1} afinitas`);
    assert.equal(isPointWalkable(grid, agent.tilePosition), true, `${agent.id} harus berada di petak walkable`);

    // Pastikan rentang nilai valid
    assert.ok(agent.energy >= 0 && agent.energy <= 1);
    assert.ok(agent.stress >= 0 && agent.stress <= 1);
    assert.ok(agent.taskLoad >= 0 && agent.taskLoad <= 1);

    for (const val of Object.values(agent.affinities)) {
      assert.ok(val >= -1 && val <= 1);
    }
  }

  assert.equal(ids.size, STUDENT_COUNT);
  assert.equal(names.size, STUDENT_COUNT);
});

test('simulasi dunia bersifat deterministik untuk seed yang sama', () => {
  let w1 = createWorldState(LAB_MAP, 55123, 2, 'lab', false);
  let w2 = createWorldState(LAB_MAP, 55123, 2, 'lab', false);

  for (let i = 0; i < 30; i += 1) {
    w1 = advanceWorld(w1, 1, LAB_MAP);
    w2 = advanceWorld(w2, 1, LAB_MAP);
  }

  assert.equal(w1.tickCount, w2.tickCount);
  assert.deepEqual(
    w1.agents.map((a) => ({
      id: a.id,
      pos: a.tilePosition,
      status: a.status,
      energy: a.energy,
      stress: a.stress,
      aff: a.affinities,
    })),
    w2.agents.map((a) => ({
      id: a.id,
      pos: a.tilePosition,
      status: a.status,
      energy: a.energy,
      stress: a.stress,
      aff: a.affinities,
    }))
  );
  assert.deepEqual(w1.recentEvents, w2.recentEvents);
});

test('atribut demografis tidak memengaruhi keputusan mesin (aturan etis #5)', () => {
  const wA = createWorldState(LAB_MAP, 9001, 1, 'lab', false);
  const wB = createWorldState(LAB_MAP, 9001, 1, 'lab', false);

  // Ubah seluruh label demografis di wB secara drastis
  for (const agent of wB.agents) {
    agent.demographicLabel = {
      genderLabel: 'Netral Uji',
      originLabel: 'Kota Uji',
      avatarHue: 99,
      hairStyle: 'pendek',
    };
  }

  for (let i = 0; i < wA.agents.length; i += 1) {
    const scoresA = scoreAgentActivityCandidates(
      wA.agents[i],
      wA.agents,
      LAB_MAP,
      wA.activeEvents,
      wA.clock.minutesOfDay
    );
    const scoresB = scoreAgentActivityCandidates(
      wB.agents[i],
      wB.agents,
      LAB_MAP,
      wB.activeEvents,
      wB.clock.minutesOfDay
    );
    assert.deepEqual(scoresA, scoresB);
  }

  let nextA = wA;
  let nextB = wB;
  for (let step = 0; step < 15; step += 1) {
    nextA = advanceWorld(nextA, 1, LAB_MAP);
    nextB = advanceWorld(nextB, 1, LAB_MAP);
  }

  assert.deepEqual(
    nextA.agents.map((a) => ({ id: a.id, pos: a.position, status: a.status, energy: a.energy, stress: a.stress })),
    nextB.agents.map((a) => ({ id: a.id, pos: a.position, status: a.status, energy: a.energy, stress: a.stress }))
  );
});

test('simulasi satu hari kerja penuh menghasilkan perpindahan valid, interaksi sosial, event, dan pergantian hari', () => {
  let world = createWorldState(LAB_MAP, 202601, 4, 'samping', false);
  const grid = buildNavigationGrid(LAB_MAP, 'samping');

  const seenStatuses = new Set<string>();
  const seenSocialStatuses = new Set<string>();

  let midDayAvgStress = 0;
  // 8 jam kerja di 4x = 24 detik nyata -> jalankan 26 detik (104 langkah 0.25s) untuk melintasi Hari 1 -> Hari 2
  for (let step = 0; step < 104; step += 1) {
    world = advanceWorld(world, 0.25, LAB_MAP, grid);
    if (step === 40) {
      midDayAvgStress = getWorldSocialSummary(world).averageStress;
    }
    for (const agent of world.agents) {
      seenStatuses.add(agent.status);
      seenSocialStatuses.add(agent.socialStatus);
      const rounded = {
        x: Math.round(agent.position.x),
        y: Math.round(agent.position.y),
      };
      assert.equal(
        isPointWalkable(grid, rounded),
        true,
        `Agen ${agent.id} berada di petak tidak walkable (${rounded.x},${rounded.y})`
      );
    }
  }

  assert.equal(world.clock.day, 2, 'Jam harus berganti ke Hari 2 setelah melewati 16:00');
  assert.ok(seenStatuses.has('bekerja'));
  assert.ok(seenStatuses.has('berpindah'));
  assert.ok(seenStatuses.has('istirahat'));
  assert.ok(seenSocialStatuses.has('sendiri'));
  assert.ok(seenSocialStatuses.has('berinteraksi') || seenSocialStatuses.has('berkelompok'));
  assert.ok(midDayAvgStress > 0.08 && midDayAvgStress < 0.85, `Stres rata tengah hari tidak realistis: ${midDayAvgStress}`);
  assert.ok(world.recentEvents.length >= 1, 'Minimal ada 1 event laboratorium yang tercatat');

  const summary = getWorldSocialSummary(world);
  assert.equal(summary.totalAgents, STUDENT_COUNT);
});
