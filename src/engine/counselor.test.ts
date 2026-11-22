import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTACT_CHANNELS } from '../data/contactChannels';
import { LAB_MAP } from '../data/map';
import { buildNavigationGrid } from './pathfinding';
import {
  createInitialCounselorState,
  executeContactChannelAction,
  executeCornerObservation,
  finalizeEndOfDayTransition,
} from './counselor';
import { evaluateChannelAvailability } from './contactChannels';
import { assessChannelVisibility } from './visibility';
import { createWorldState } from './world';

test('enam jalur kontak tersedia dengan biaya energi awal sesuai spesifikasi', () => {
  assert.equal(CONTACT_CHANNELS.length, 6);
  const byId = new Map(CONTACT_CHANNELS.map((c) => [c.id, c]));
  assert.equal(byId.get('sapa-di-tempat')?.energyCost, 5);
  assert.equal(byId.get('ajak-aktivitas')?.energyCost, 15);
  assert.equal(byId.get('pintu-akademik')?.energyCost, 20);
  assert.equal(byId.get('panggilan-resmi')?.energyCost, 10);
  assert.equal(byId.get('lewat-perantara')?.energyCost, 15);
  assert.equal(byId.get('pesan-tertulis')?.energyCost, 10);
});

test('jalur 4 pada agen yang dikelilingi teman menghasilkan saksi lebih banyak daripada jalur 3 dan menaikkan paparan', () => {
  const world = createWorldState(LAB_MAP, 202601, 1, 'lab', true);

  // Tempatkan 1 agen sasaran dan 4 teman di sekitar Meja Diskusi
  const target = {
    ...world.agents[0],
    currentZoneId: 'diskusi' as const,
    position: { x: 20, y: 14 },
    tilePosition: { x: 20, y: 14 },
  };
  const modifiedAgents = world.agents.map((a, idx) => {
    if (idx === 0) return target;
    if (idx >= 1 && idx <= 4) {
      return {
        ...a,
        currentZoneId: 'diskusi' as const,
        position: { x: 20 + (idx % 2 === 0 ? 3 : -3), y: 14 + (idx <= 2 ? 1 : -1) },
        tilePosition: { x: 20 + (idx % 2 === 0 ? 3 : -3), y: 14 + (idx <= 2 ? 1 : -1) },
      };
    }
    return a;
  });

  const v3 = assessChannelVisibility(
    'pintu-akademik',
    target,
    modifiedAgents,
    'lab',
    LAB_MAP
  );
  const v4 = assessChannelVisibility(
    'panggilan-resmi',
    target,
    modifiedAgents,
    'lab',
    LAB_MAP
  );
  const v6 = assessChannelVisibility(
    'pesan-tertulis',
    target,
    modifiedAgents,
    'lab',
    LAB_MAP
  );

  assert.ok(
    v4.witnessCount > v3.witnessCount,
    `Saksi jalur 4 (${v4.witnessCount}) harus lebih banyak dari jalur 3 (${v3.witnessCount})`
  );
  assert.ok(
    v4.exposureDelta > v3.exposureDelta,
    `Paparan jalur 4 (${v4.exposureDelta}) harus lebih tinggi dari jalur 3 (${v3.exposureDelta})`
  );
  assert.equal(v6.witnessCount, 0);
  assert.equal(v6.exposureDelta, 0);
});

test('jalur 3 tidak tersedia jika Ruang Konsultasi sedang ditempati mahasiswa lain', () => {
  const world = createWorldState(LAB_MAP, 202601, 1, 'lab', true);
  const occupiedWorld = {
    ...world,
    agents: world.agents.map((a, idx) =>
      idx === 1
        ? { ...a, currentZoneId: 'konsultasi' as const, status: 'bekerja' as const }
        : a
    ),
  };

  const ch3 = CONTACT_CHANNELS.find((c) => c.id === 'pintu-akademik')!;
  const avail = evaluateChannelAvailability(
    ch3,
    occupiedWorld.agents[0],
    occupiedWorld,
    100
  );
  assert.equal(avail.available, false);
  assert.match(avail.unavailableReason ?? '', /Ruang Konsultasi/);
});

test('energi dan waktu berkurang tepat, hari berganti saat energi habis, dan hasil deterministik', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  const worldA = createWorldState(LAB_MAP, 778899, 1, 'lab', true);
  const worldB = createWorldState(LAB_MAP, 778899, 1, 'lab', true);

  let counselorA = createInitialCounselorState();
  let counselorB = createInitialCounselorState();

  const targetId = worldA.agents[3].id;

  // Amati dari sudut: -5 energi, +30 menit
  const obsA = executeCornerObservation(counselorA, worldA, targetId, LAB_MAP, grid);
  const obsB = executeCornerObservation(counselorB, worldB, targetId, LAB_MAP, grid);

  assert.equal(obsA.ok, true);
  assert.equal(obsA.nextCounselor.energy, 95);
  assert.equal(obsA.nextWorld.clock.minutesOfDay, worldA.clock.minutesOfDay + 30);
  assert.deepEqual(obsA.logEntry, obsB.logEntry);

  counselorA = obsA.nextCounselor;
  let curWorldA = obsA.nextWorld;

  // Habiskan sisa 95 energi dengan kombinasi jalur kontak (15 + 15 + 15 + 15 + 15 + 10 + 10 = 95)
  const seq: Array<Parameters<typeof executeContactChannelAction>[3]> = [
    'ajak-aktivitas',
    'lewat-perantara',
    'ajak-aktivitas',
    'lewat-perantara',
    'ajak-aktivitas',
    'pesan-tertulis',
    'pesan-tertulis',
  ];

  let lastRes = executeContactChannelAction(
    counselorA,
    curWorldA,
    targetId,
    seq[0],
    {},
    LAB_MAP,
    grid
  );
  counselorA = lastRes.nextCounselor;
  curWorldA = lastRes.nextWorld;

  for (let i = 1; i < seq.length; i += 1) {
    lastRes = executeContactChannelAction(
      counselorA,
      curWorldA,
      targetId,
      seq[i],
      seq[i] === 'lewat-perantara'
        ? { intermediaryKind: 'teknisi', shareDetailsToIntermediary: false }
        : {},
      LAB_MAP,
      grid
    );
    assert.equal(lastRes.ok, true);
    counselorA = lastRes.nextCounselor;
    curWorldA = lastRes.nextWorld;
  }

  assert.equal(counselorA.energy, 0);
  assert.equal(lastRes.dayEnded, true);
  assert.equal(lastRes.conversationContext?.endsDayAfterClose, true);
  assert.equal(lastRes.completedDaySummary?.remainingEnergy, 0);
  assert.equal(lastRes.completedDaySummary?.actions.length, 8);
  assert.equal(lastRes.completedDaySummary?.contactedAgents.length, 1);

  const rolled = finalizeEndOfDayTransition(
    counselorA,
    curWorldA,
    lastRes.completedDaySummary!,
    LAB_MAP,
    grid
  );
  assert.equal(rolled.nextWorld.clock.day, 2);
  assert.equal(rolled.nextCounselor.energy, 100);
});

test('jalur 5 membuka detail ke perantara menurunkan kepercayaan tajam dan jalur 2 gagal saat tenggat penuh', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  const baseWorld = createWorldState(LAB_MAP, 112233, 1, 'lab', true);
  const busyWorld = {
    ...baseWorld,
    agents: baseWorld.agents.map((a, idx) =>
      idx === 0 ? { ...a, taskLoad: 0.92 } : a
    ),
  };

  const counselor = createInitialCounselorState();
  const target = busyWorld.agents[0];

  const j2 = executeContactChannelAction(
    counselor,
    busyWorld,
    target.id,
    'ajak-aktivitas',
    {},
    LAB_MAP,
    grid
  );
  assert.equal(j2.conversationContext?.outcomeKind, 'gagal-tenggat');

  const j5Leak = executeContactChannelAction(
    counselor,
    busyWorld,
    target.id,
    'lewat-perantara',
    { intermediaryKind: 'teman', shareDetailsToIntermediary: true },
    LAB_MAP,
    grid
  );
  assert.equal(j5Leak.conversationContext?.outcomeKind, 'kerahasiaan-bocor');
  const afterTarget = j5Leak.nextWorld.agents.find((a) => a.id === target.id)!;
  assert.ok(
    afterTarget.hiddenVars.trustInCounselor < target.hiddenVars.trustInCounselor - 0.15,
    'Membuka detail kepada perantara harus menurunkan kepercayaan agen secara tajam'
  );
});
