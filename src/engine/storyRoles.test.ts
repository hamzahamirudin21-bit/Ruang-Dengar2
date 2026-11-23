import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDENT_BLUEPRINTS } from '../data/agents.seed';
import { LAB_MAP } from '../data/map';
import { STORY_ROLES } from '../data/storyRoles';
import { buildNavigationGrid } from './pathfinding';
import { advanceWorldToNextDay, createWorldState } from './world';

const SEED_COUNT = 40;
const BASE_SEED = 202601;

/** Pilihan masuk per mahasiswa pada sosiometri hari 1 untuk satu seed. */
function receivedCountsForSeed(seed: number, grid: ReturnType<typeof buildNavigationGrid>): Record<string, number> {
  let world = createWorldState(LAB_MAP, seed, 4, 'lab', false);
  world = advanceWorldToNextDay(world, LAB_MAP, grid);
  const snap = world.sociometrySnapshots[0];
  const received: Record<string, number> = {};
  for (const agent of world.agents) received[agent.id] = 0;
  for (const chosen of Object.values(snap.choicesByAgent)) {
    for (const id of chosen) received[id] = (received[id] ?? 0) + 1;
  }
  return received;
}

function collect() {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  const perSeed: Record<string, number>[] = [];
  for (let i = 0; i < SEED_COUNT; i++) perSeed.push(receivedCountsForSeed(BASE_SEED + i, grid));
  return perSeed;
}

const perSeed = collect();
const ids = Object.keys(perSeed[0]);
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const avgFor = (id: string) => mean(perSeed.map((r) => r[id]));

test('18 mahasiswa punya peran; mhs-14 terisolasi-introver dan mhs-12 populer', () => {
  assert.equal(STUDENT_BLUEPRINTS.length, 18);
  for (const bp of STUDENT_BLUEPRINTS) {
    assert.ok(STORY_ROLES[bp.id], `${bp.id} tidak punya peran`);
  }
  assert.equal(STORY_ROLES['mhs-14'], 'terisolasi-introver');
  assert.equal(STORY_ROLES['mhs-12'], 'populer');
});

test('peran populer menerima rata-rata pilihan minimal 3 di atas rata-rata kelompok', () => {
  const groupAvg = mean(ids.map(avgFor));
  const populer = ids.filter((id) => STORY_ROLES[id] === 'populer');
  assert.ok(populer.length > 0);
  const populerAvg = mean(populer.map(avgFor));
  assert.ok(populerAvg - groupAvg >= 3, `populer ${populerAvg.toFixed(2)} vs kelompok ${groupAvg.toFixed(2)}`);
});

test('peran terisolasi menerima rata-rata pilihan minimal 1 di bawah rata-rata kelompok', () => {
  const groupAvg = mean(ids.map(avgFor));
  const isolated = ids.filter((id) => STORY_ROLES[id] === 'terisolasi-introver');
  assert.ok(isolated.length > 0);
  const isolatedAvg = mean(isolated.map(avgFor));
  assert.ok(groupAvg - isolatedAvg >= 1, `terisolasi ${isolatedAvg.toFixed(2)} vs kelompok ${groupAvg.toFixed(2)}`);
});

test('mhs-14 menerima pilihan pada hampir semua seed', () => {
  const nonZero = perSeed.filter((r) => r['mhs-14'] > 0).length;
  assert.ok(nonZero >= Math.ceil(SEED_COUNT * 0.9), `hanya ${nonZero}/${SEED_COUNT} seed tidak nol`);
});

test('mhs-15 tetap terabaikan pada seed bawaan', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  const received = receivedCountsForSeed(BASE_SEED, grid);
  assert.ok(received['mhs-15'] <= 1, `mhs-15 menerima ${received['mhs-15']} pilihan`);
  const groupAvg = mean(Object.values(received));
  assert.ok(received['mhs-15'] < groupAvg);
});
