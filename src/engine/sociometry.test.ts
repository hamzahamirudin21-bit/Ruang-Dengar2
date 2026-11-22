import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDENT_COUNT } from '../data/agents.seed';
import { LAB_MAP } from '../data/map';
import { DailySociometrySnapshot } from '../types';
import { analyzeSociometryNetwork, computeStableForceLayout } from './network';
import {
  detectInterpretiveWordsInFacts,
  extractAgentBehavioralFacts,
  getAgentTileHeatmap,
} from './observationLog';
import { buildNavigationGrid } from './pathfinding';
import { POSITIVE_SOCIOMETRY_QUESTION } from './sociometry';
import { advanceWorldToNextDay, createWorldState } from './world';

test('sosiometri harian hanya memakai pertanyaan positif (maks. 3 pilihan) dan deterministik per seed', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  let w1 = createWorldState(LAB_MAP, 202601, 4, 'lab', false);
  let w2 = createWorldState(LAB_MAP, 202601, 4, 'lab', false);

  w1 = advanceWorldToNextDay(w1, LAB_MAP, grid);
  w2 = advanceWorldToNextDay(w2, LAB_MAP, grid);

  assert.equal(w1.clock.day, 2);
  assert.equal(w1.sociometrySnapshots.length, 1);
  assert.deepEqual(w1.sociometrySnapshots, w2.sociometrySnapshots);

  const snap1 = w1.sociometrySnapshots[0];
  assert.equal(snap1.day, 1);
  assert.equal(snap1.question, POSITIVE_SOCIOMETRY_QUESTION);
  assert.equal(Object.keys(snap1.choicesByAgent).length, STUDENT_COUNT);

  for (const [chooserId, chosen] of Object.entries(snap1.choicesByAgent)) {
    assert.ok(chosen.length <= 3, `${chooserId} memilih lebih dari 3 orang`);
    assert.equal(chosen.includes(chooserId), false, `${chooserId} tidak boleh memilih diri sendiri`);
    assert.equal(new Set(chosen).size, chosen.length, 'Tidak boleh ada pilihan duplikat');
  }
});

test('analisis jaringan menghitung timbal balik, komponen, bintang, terisolasi, terabaikan, dan jembatan secara akurat', () => {
  const world = createWorldState(LAB_MAP, 202601, 1, 'lab', false);
  const agents = world.agents;
  const ids = agents.map((a) => a.id);

  // Bangun graf uji deterministik:
  // Komponen A (mhs-01..mhs-04): mhs-01 bintang (dipilih 4 kali), mhs-04 jembatan ke Komponen B lewat mhs-05
  // Komponen B (mhs-05..mhs-07): saling terhubung
  // Terabaikan: mhs-08 (1 pilihan masuk sepihak dari mhs-09, tanpa pilihan keluar ke mhs-09)
  // Terisolasi: mhs-10..mhs-15 (0 pilihan diterima)
  const choicesByAgent: Record<string, string[]> = {};
  for (const id of ids) choicesByAgent[id] = [];

  choicesByAgent['mhs-01'] = ['mhs-02', 'mhs-03'];
  choicesByAgent['mhs-02'] = ['mhs-01', 'mhs-03'];
  choicesByAgent['mhs-03'] = ['mhs-01', 'mhs-02'];
  choicesByAgent['mhs-04'] = ['mhs-01', 'mhs-05']; // Jembatan antar-subkelompok
  choicesByAgent['mhs-05'] = ['mhs-04', 'mhs-06', 'mhs-07'];
  choicesByAgent['mhs-06'] = ['mhs-05', 'mhs-07'];
  choicesByAgent['mhs-07'] = ['mhs-05', 'mhs-06'];
  choicesByAgent['mhs-09'] = ['mhs-01', 'mhs-08'];
  choicesByAgent['mhs-08'] = []; // menerima 1 dari mhs-09, tidak timbal balik -> terabaikan

  const syntheticSnapshot: DailySociometrySnapshot = {
    day: 1,
    question: POSITIVE_SOCIOMETRY_QUESTION,
    choicesByAgent,
  };

  const stats = analyzeSociometryNetwork(
    syntheticSnapshot,
    agents,
    world.observationLog
  );

  // Hitung manual total pilihan terarah: 2+2+2+2+3+2+2+2+0 = 17
  assert.equal(stats.totalDirectedChoices, 17);
  // Pasangan timbal balik: {01,02}, {01,03}, {02,03}, {04,05}, {05,06}, {05,07}, {06,07} = 7 pasang -> 14 pilihan terarah
  assert.equal(stats.reciprocalPairCount, 7);
  assert.equal(stats.reciprocalDirectedChoices, 14);
  assert.equal(stats.reciprocityChoicePercent, Number(((14 / 17) * 100).toFixed(1)));
  assert.equal(stats.agentsWithReciprocalCount, 7);

  assert.equal(stats.nodeMetrics['mhs-01'].receivedCount, 4);
  assert.equal(stats.nodeMetrics['mhs-01'].isStar, true);

  assert.equal(stats.nodeMetrics['mhs-04'].isBridge, true);
  assert.equal(stats.nodeMetrics['mhs-05'].isBridge, true);

  assert.equal(stats.nodeMetrics['mhs-08'].receivedCount, 1);
  assert.equal(stats.nodeMetrics['mhs-08'].mutualCount, 0);
  assert.equal(stats.nodeMetrics['mhs-08'].isNeglected, true);
  assert.equal(stats.nodeMetrics['mhs-08'].status, 'terabaikan');

  assert.equal(stats.nodeMetrics['mhs-10'].receivedCount, 0);
  assert.equal(stats.nodeMetrics['mhs-10'].isIsolated, true);
  assert.equal(stats.nodeMetrics['mhs-10'].status, 'terisolasi');

  // Komponen: {01..07}, {08,09}? Tidak, 09 memilih 01 & 08 jadi {01..09} menyatu + (STUDENT_COUNT - 9) simpul terpisah
  assert.equal(stats.componentCount, 1 + (STUDENT_COUNT - 9));

  // Tata letak force-directed deterministik & berada di dalam kanvas
  const layoutA = computeStableForceLayout(syntheticSnapshot, agents, stats, 400, 320);
  const layoutB = computeStableForceLayout(syntheticSnapshot, agents, stats, 400, 320);
  assert.deepEqual(layoutA, layoutB);
  for (const pt of Object.values(layoutA)) {
    assert.ok(pt.x >= 20 && pt.x <= 380);
    assert.ok(pt.y >= 20 && pt.y <= 300);
  }
});

test('dua penyendiri (mandiri sehat vs rentan terisolasi) tampak berbeda secara faktual tanpa label bermasalah', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  let world = createWorldState(LAB_MAP, 202601, 4, 'lab', false);
  world = advanceWorldToNextDay(world, LAB_MAP, grid);
  world = advanceWorldToNextDay(world, LAB_MAP, grid);

  const day2Snap = world.sociometrySnapshots[1];
  assert.ok(day2Snap);

  const stats2 = analyzeSociometryNetwork(
    day2Snap,
    world.agents,
    world.observationLog
  );

  // Teguh Santosa (mhs-10, mandiri sehat) vs Rani Safitri (mhs-14, terisolasi-rentan)
  const teguh = world.agents.find((a) => a.id === 'mhs-10')!;
  const rani = world.agents.find((a) => a.id === 'mhs-14')!;

  const teguhFacts = extractAgentBehavioralFacts(
    world.observationLog,
    teguh,
    world.agents,
    LAB_MAP
  );
  const raniFacts = extractAgentBehavioralFacts(
    world.observationLog,
    rani,
    world.agents,
    LAB_MAP
  );

  assert.ok(teguhFacts.length >= 2);
  assert.ok(raniFacts.length >= 2);

  // Pastikan fakta bebas kata penilaian/diagnosis
  for (const line of [...teguhFacts, ...raniFacts]) {
    assert.equal(detectInterpretiveWordsInFacts(line).length, 0);
  }

  // Peta panas 40x24 terisi untuk agen selama simulasi
  const heatmapTeguh = getAgentTileHeatmap(world.observationLog, teguh.id);
  const heatmapRani = getAgentTileHeatmap(world.observationLog, rani.id);
  assert.ok(heatmapTeguh.maxCount > 0);
  assert.ok(heatmapRani.maxCount > 0);

  // Di jaringan sosiometri, mhs-10 (mandiri sehat) berbeda dari mhs-14 (rentan terisolasi)
  const teguhMetrics = stats2.nodeMetrics[teguh.id];
  const raniMetrics = stats2.nodeMetrics[rani.id];
  assert.ok(
    teguhMetrics.receivedCount > raniMetrics.receivedCount ||
      teguhMetrics.dominantZoneId !== raniMetrics.dominantZoneId
  );
});

test('validasi catatan anekdot mendeteksi kata tafsir pada kolom fakta', () => {
  const dirty = detectInterpretiveWordsInFacts(
    'Siswa terlihat malas dan sombong saat kelompok berdiskusi.'
  );
  assert.deepEqual(dirty, ['malas', 'sombong']);

  const flagged = detectInterpretiveWordsInFacts(
    'Ia tampak aneh dan bermasalah di sudut ruangan.'
  );
  assert.deepEqual(flagged, ['aneh', 'bermasalah']);

  const clean = detectInterpretiveWordsInFacts(
    'Duduk menghadap meja solder selama 20 menit tanpa berbicara dengan teman di sebelahnya.'
  );
  assert.deepEqual(clean, []);
});
