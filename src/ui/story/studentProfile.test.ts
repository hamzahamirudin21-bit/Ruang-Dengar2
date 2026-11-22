import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, pickOne } from '../../engine/rng';
import type { SeededRng } from '../../engine/rng';
import type { MissionRecord } from '../../engine/story/saveSlot';
import type {
  AgentActivityStatus,
  CounselingDomain,
  StudentAgent,
  ZoneType,
} from '../../types';
import { PROFILE_ALLOWED_KEYS, buildStudentProfile } from './studentProfile';

const ITER = 200;
const STATUSES: AgentActivityStatus[] = ['bekerja', 'berpindah', 'mengobrol', 'istirahat', 'menunggu'];
const ZONES: ZoneType[] = [
  'cetak-3d', 'pemrograman', 'las', 'elektronik-iot', 'diskusi',
  'gudang-alat', 'istirahat', 'konsultasi', 'ruang-dosen',
];
const DOMAINS: CounselingDomain[] = ['pribadi', 'belajar', 'sosial', 'karier'];

const HIDDEN_KEYS = [
  'hiddenVars', 'stress', 'energy', 'taskLoad', 'affinities', 'personality', 'skills',
  'counselingDomain', 'uniquePotential', 'socialCircleHint', 'storyAdaptation',
  'trustInCounselor', 'disclosureReadiness', 'socialComfort', 'stigmaSensitivity',
  'ruptureLevel', 'primaryConcernSummary', 'zoneBonuses', 'stressSensitivity',
];

function makeAgent(rng: SeededRng, idx: number): StudentAgent {
  const n = (): number => rng();
  return {
    id: `mhs-${String(1 + (idx % 15)).padStart(2, '0')}`,
    name: `Nama${idx}`,
    cohort: 2020 + Math.floor(n() * 6),
    demographicLabel: { genderLabel: 'x', originLabel: 'y', avatarHue: 10, hairStyle: 'pendek' },
    uniquePotential: 'potensi',
    socialCircleHint: 'lingkar',
    counselingDomain: pickOne(rng, DOMAINS),
    interests: { cetak3d: n(), pemrograman: n(), pengelasan: n(), elektronika: n() },
    skills: { cetak3d: n(), pemrograman: n(), pengelasan: n(), elektronika: n(), kolaborasi: n() },
    personality: {
      openness: n(), conscientiousness: n(), extraversion: n(),
      agreeableness: n(), stressSensitivity: n(),
    },
    solitudePreference: n(),
    affinities: {},
    position: { x: 0, y: 0 },
    tilePosition: { x: 0, y: 0 },
    targetPosition: null,
    path: [],
    pathStepIndex: 0,
    currentZoneId: pickOne(rng, ZONES),
    targetZoneId: pickOne(rng, ZONES),
    activityGoal: 'tujuan',
    status: pickOne(rng, STATUSES),
    energy: n(),
    stress: n(),
    taskLoad: n(),
    activityDurationTicks: 0,
    socialStatus: 'sendiri',
    interactingWithIds: [],
    hiddenVars: {
      trustInCounselor: n(), disclosureReadiness: n(), socialComfort: n(),
      stigmaSensitivity: n(), ruptureLevel: n(), primaryConcernSummary: 'ringkasan',
    },
  };
}

function makeCrowd(rng: SeededRng, idx: number): StudentAgent[] {
  const count = 2 + Math.floor(rng() * 6);
  const all: StudentAgent[] = [];
  for (let k = 0; k < count; k++) {
    const a = makeAgent(rng, idx * 10 + k);
    a.id = `mhs-${String(k + 1).padStart(2, '0')}`;
    a.name = `Rekan ${k + 1}`;
    all.push(a);
  }
  const first = all[0];
  first.interactingWithIds = all.slice(1).filter(() => rng() < 0.6).map((a) => a.id);
  return all;
}

/** Isi semua variabel tersembunyi dengan nilai sentinel; kembalikan sentinel string dan angka. */
function applySentinels(agent: StudentAgent, tag: string, base: number): { strs: string[]; nums: number[] } {
  const strs = [`SENT_${tag}_unique`, `SENT_${tag}_circle`, `SENT_${tag}_concern`];
  const nums = [base + 1, base + 2, base + 3, base + 4, base + 5, base + 6, base + 7, base + 8];
  agent.uniquePotential = strs[0];
  agent.socialCircleHint = strs[1];
  agent.hiddenVars = {
    trustInCounselor: nums[0], disclosureReadiness: nums[1], socialComfort: nums[2],
    stigmaSensitivity: nums[3], ruptureLevel: nums[4], primaryConcernSummary: strs[2],
  };
  agent.stress = nums[5];
  agent.energy = nums[6];
  agent.taskLoad = nums[7];
  agent.affinities = { [`SENT_${tag}_other`]: base + 9 };
  strs.push(`SENT_${tag}_other`);
  nums.push(base + 9);
  agent.personality = {
    openness: base + 10, conscientiousness: base + 11, extraversion: base + 12,
    agreeableness: base + 13, stressSensitivity: base + 14,
  };
  agent.skills = {
    cetak3d: base + 15, pemrograman: base + 16, pengelasan: base + 17,
    elektronika: base + 18, kolaborasi: base + 19,
  };
  nums.push(...[10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((d) => base + d));
  agent.storyAdaptation = {
    zoneBonuses: { las: base + 20 },
    daysRemaining: base + 21,
    reason: 'terbantu',
  };
  nums.push(base + 20, base + 21);
  return { strs, nums };
}

function randomMission(rng: SeededRng): MissionRecord | undefined {
  if (rng() < 0.2) return undefined;
  return {
    status: pickOne(rng, ['belum', 'berlangsung', 'selesai', 'lanjutan'] as const),
    sessions: Math.floor(rng() * 5),
    lastOutcome: null,
    lastDay: Math.floor(rng() * 10),
  };
}

test('Property 7: kunci profil sama dengan PROFILE_ALLOWED_KEYS', () => {
  const rng = mulberry32(7);
  for (let i = 0; i < ITER; i++) {
    const all = makeCrowd(rng, i);
    const profile = buildStudentProfile(all[0], all, randomMission(rng));
    assert.deepEqual([...Object.keys(profile)].sort(), [...PROFILE_ALLOWED_KEYS].sort());
  }
});

test('Property 8: profil tidak bergantung pada variabel tersembunyi', () => {
  const rng = mulberry32(8);
  for (let i = 0; i < ITER; i++) {
    const all = makeCrowd(rng, i);
    const mission = randomMission(rng);
    const a = structuredClone(all[0]);
    const b = structuredClone(all[0]);
    applySentinels(a, 'A', 1_000_000 + i * 100);
    applySentinels(b, 'B', 5_000_000 + i * 100);
    a.counselingDomain = 'pribadi';
    b.counselingDomain = 'karier';
    const pa = buildStudentProfile(a, [a, ...all.slice(1)], mission);
    const pb = buildStudentProfile(b, [b, ...all.slice(1)], mission);
    assert.deepEqual(pa, pb);
  }
});

test('Property 9: JSON profil tidak memuat nama kunci atau nilai tersembunyi', () => {
  const rng = mulberry32(9);
  for (let i = 0; i < ITER; i++) {
    const all = makeCrowd(rng, i);
    const { strs, nums } = applySentinels(all[0], `P${i}`, 9_000_000 + i * 100);
    const json = JSON.stringify(buildStudentProfile(all[0], all, randomMission(rng)));
    for (const k of HIDDEN_KEYS) assert.ok(!json.includes(k), `kunci bocor: ${k}`);
    for (const s of strs) assert.ok(!json.includes(s), `sentinel bocor: ${s}`);
    for (const v of nums) assert.ok(!json.includes(String(v)), `sentinel angka bocor: ${v}`);
  }
});

function oneAgent(): StudentAgent[] {
  const a = makeAgent(mulberry32(1), 0);
  a.interactingWithIds = [];
  return [a];
}

test('Riwayat: empat status misi dan tanpa rekaman', () => {
  const all = oneAgent();
  const none = buildStudentProfile(all[0], all, undefined);
  assert.deepEqual(none.missionHistory, { status: 'belum', sessions: 0, lastOutcomeLabel: null });
  for (const status of ['belum', 'berlangsung', 'selesai', 'lanjutan'] as const) {
    const p = buildStudentProfile(all[0], all, { status, sessions: 2, lastOutcome: null, lastDay: 3 });
    assert.equal(p.missionHistory.status, status);
    assert.equal(p.missionHistory.sessions, 2);
    assert.equal(p.missionHistory.lastOutcomeLabel, null);
  }
});

test('Relasi kosong: tanpa interaksi withNames kosong', () => {
  const all = oneAgent();
  assert.deepEqual(buildStudentProfile(all[0], all, undefined).withNames, []);
});
