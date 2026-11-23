import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_MAP } from '../data/map';
import { buildNavigationGrid } from './pathfinding';
import { createInitialAgents } from '../data/agents.seed';
import { updateAgentsNeedsAndSocialTick } from './agent';
import { mulberry32 } from './rng';
import {
  MAX_LOST_STUDENTS,
  applyLiveChoiceEnergy,
  detectNewlyLostAgentIds,
  evaluateSurvivalStatus,
} from './survivalMission';

test('algoritma bertahan: energi mahasiswa terisolasi bertahan minimal ~60-90 detik (bukan 15 detik)', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  const agents = createInitialAgents(LAB_MAP, grid, 202601);
  const solo = agents[0];
  solo.energy = 1.0;
  solo.status = 'bekerja';
  solo.currentZoneId = 'gudang-alat';
  solo.position = { x: 35, y: 3 };

  let ticks = 0;
  const rng = mulberry32(99);
  while (solo.energy > 0.001 && ticks < 200) {
    solo.status = 'bekerja';
    updateAgentsNeedsAndSocialTick([solo], [], rng);
    ticks += 1;
  }

  // Di kecepatan 1x (1 tick = 1 detik nyata), energi penuh harus bertahan 60..130 detik!
  assert.ok(
    ticks >= 60 && ticks <= 130,
    `energi penuh seharusnya bertahan ~60-130 detik, bukan ${ticks} detik`,
  );
});

test('pilihan tepat menambah energi (+12%) dan pilihan salah mengurangi energi (-14%)', () => {
  assert.equal(applyLiveChoiceEnergy(0.5, true), 0.62);
  assert.equal(applyLiveChoiceEnergy(0.5, false), 0.36);
  assert.equal(applyLiveChoiceEnergy(0.95, true), 1);
  assert.equal(applyLiveChoiceEnergy(0.08, false), 0);
});

test('deteksi mahasiswa hilang (0%) mengecualikan mahasiswa stabil & yang sedang dalam sesi', () => {
  const agents = [
    { id: 'mhs-01', energy: 0 },
    { id: 'mhs-02', energy: 0 },
    { id: 'mhs-03', energy: 0 },
    { id: 'mhs-04', energy: 0.2 },
  ];
  const newlyLost = detectNewlyLostAgentIds(
    agents,
    new Set(['mhs-01']),
    new Set(['mhs-02']),
    new Set(['mhs-03']),
  );
  assert.deepEqual(newlyLost, []);

  const newlyLost2 = detectNewlyLostAgentIds(agents, new Set(), new Set(), new Set());
  assert.deepEqual(newlyLost2, ['mhs-01', 'mhs-02', 'mhs-03']);
});

test('evaluasi kalah terjadi tepat saat 3 mahasiswa hilang dan menang saat semua tersisa stabil', () => {
  assert.equal(MAX_LOST_STUDENTS, 3);
  const running = evaluateSurvivalStatus(15, 2, 10);
  assert.equal(running.status, 'berjalan');
  assert.equal(running.remainingLives, 1);

  const lost = evaluateSurvivalStatus(15, 3, 10);
  assert.equal(lost.status, 'kalah');
  assert.equal(lost.endingTier, 'gagal');
  assert.equal(lost.remainingLives, 0);

  const winPerfect = evaluateSurvivalStatus(15, 0, 15);
  assert.equal(winPerfect.status, 'menang');
  assert.equal(winPerfect.endingTier, 'sempurna');

  const winWithTwoLost = evaluateSurvivalStatus(15, 2, 13);
  assert.equal(winWithTwoLost.status, 'menang');
  assert.equal(winWithTwoLost.endingTier, 'bertahan');
});
