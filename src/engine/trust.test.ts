import assert from 'node:assert/strict';
import test from 'node:test';
import { STUDENT_BLUEPRINTS, STUDENT_COUNT } from '../data/agents.seed';
import { getAgentHiddenProblemProfile } from '../data/skillEffects';
import {
  PlaceholderConversationContext,
  StudentAgent,
} from '../types';
import {
  createEmptyAgentMemory,
  evaluateMemoryAtSessionStart,
} from './memory';
import {
  applyCounselorSkillTurn,
  applyRepairStepTurn,
  createCounselingSession,
  createFollowUpPromiseInSession,
  finalizeCounselingSession,
  recognizeSessionTension,
  runRandomSessionsSimulation,
} from './trust';

function makeAgentFromBlueprint(index: number): StudentAgent {
  const bp = STUDENT_BLUEPRINTS[index];
  return {
    id: bp.id,
    name: bp.name,
    cohort: bp.cohort,
    demographicLabel: bp.demographicLabel,
    uniquePotential: bp.uniquePotential,
    socialCircleHint: bp.socialCircleHint,
    counselingDomain: bp.counselingDomain,
    interests: bp.interests,
    skills: bp.skills,
    personality: bp.personality,
    solitudePreference: bp.solitudePreference,
    affinities: {},
    position: { x: 5, y: 5 },
    tilePosition: { x: 5, y: 5 },
    targetPosition: null,
    path: [],
    pathStepIndex: 0,
    currentZoneId: bp.initialZoneId,
    targetZoneId: bp.initialZoneId,
    activityGoal: 'Praktikum',
    status: 'bekerja',
    energy: 0.8,
    stress: 0.4,
    taskLoad: 0.5,
    activityDurationTicks: 0,
    socialStatus: 'sendiri',
    interactingWithIds: [],
    hiddenVars: { ...bp.hiddenVars },
  };
}

function makeContext(
  agent: StudentAgent,
  overrides: Partial<PlaceholderConversationContext> = {}
): PlaceholderConversationContext {
  return {
    channelId: 'pintu-akademik',
    channelName: 'Pintu Akademik / Teknis',
    targetAgentId: agent.id,
    targetAgentName: agent.name,
    targetZoneLabel: 'Ruang Konsultasi Praktikum',
    day: 1,
    timeFormatted: '10:00',
    witnessCount: 0,
    witnessNames: [],
    visibilitySummary: 'Pendekatan privat tanpa saksi.',
    outcomeKind: 'berhasil',
    outcomeHeadline: 'Mahasiswa datang sesuai jadwal',
    outcomeDescription: 'Mahasiswa hadir ke ruang konsultasi untuk membahas kendala teknis.',
    maxDialogueLevel: 3,
    energyCost: 12,
    durationMinutes: 20,
    endsDayAfterClose: false,
    ...overrides,
  };
}

test('Simulasi 100 sesi acak mempertahankan seluruh invariant mesin kepercayaan, keterbukaan, dan keretakan', () => {
  const audit = runRandomSessionsSimulation(202601, 100);
  assert.equal(audit.sessionCount, 100);
  assert.ok(audit.totalTurns > 500, 'Total giliran simulasi harus memadai');
  assert.equal(audit.trustOutOfBoundsCount, 0, 'Kepercayaan tidak boleh keluar dari 0-100');
  assert.equal(audit.levelJumpGtOneCount, 0, 'Level keterbukaan tidak boleh melompat > 1 per giliran');
  assert.equal(
    audit.harmfulRaisedLevelCount,
    0,
    'Interogasi, nasihat dini, dan meremehkan tidak boleh pernah menaikkan level'
  );
  assert.ok(audit.withdrawalRuptureCount > 0, 'Keretakan menarik diri harus bisa terpicu');
  assert.ok(audit.confrontationRuptureCount > 0, 'Keretakan konfrontasi harus bisa terpicu');
  assert.ok(audit.repairedRuptureCount > 0, 'Keretakan harus dapat diperbaiki');
  assert.equal(audit.allInvariantsPassed, true);
});

test('Dua agen berwatak berbeda merespons keterampilan yang sama secara berbeda', () => {
  const allAgents = STUDENT_BLUEPRINTS.map((_, idx) => makeAgentFromBlueprint(idx));
  // Pilih agen kecemasan sosial rendah vs tinggi untuk jeda-hening
  const lowAnxiety =
    allAgents.find((a) => a.hiddenVars.socialComfort >= 0.82) ?? allAgents[3];
  const highAnxiety =
    allAgents.find(
      (a) =>
        a.hiddenVars.socialComfort <= 0.42 &&
        a.personality.stressSensitivity >= 0.65
    ) ?? allAgents[2];

  const sLow = createCounselingSession({
    agent: lowAnxiety,
    context: makeContext(lowAnxiety),
    exposure: 0,
    memory: createEmptyAgentMemory(lowAnxiety.id),
    seed: 202601,
  });
  const sHigh = createCounselingSession({
    agent: highAnxiety,
    context: makeContext(highAnxiety),
    exposure: 0,
    memory: createEmptyAgentMemory(highAnxiety.id),
    seed: 202601,
  });

  const afterLow = applyCounselorSkillTurn(sLow, lowAnxiety, 'jeda-hening', '');
  const afterHigh = applyCounselorSkillTurn(sHigh, highAnxiety, 'jeda-hening', '');

  assert.ok(afterLow.turns[1].trustDelta > 0, 'Jeda hening membantu agen kecemasan rendah');
  assert.ok(afterHigh.turns[1].trustDelta < 0, 'Jeda hening menekan agen kecemasan sosial tinggi');
});

test('Kedua tipe keretakan (menarik-diri & konfrontasi) dapat dipicu, mengunci level, dan diperbaiki', () => {
  const allAgents = STUDENT_BLUEPRINTS.map((_, idx) => makeAgentFromBlueprint(idx));
  // Agen menarik diri: kecemasan sosial tinggi / ekstroversi rendah
  const withdrawingAgent =
    allAgents.find(
      (a) =>
        a.personality.extraversion <= 0.36 &&
        a.solitudePreference >= 0.55
    ) ?? allAgents[2];
  // Agen konfrontatif: ekstroversi tinggi & keramahan relatif rendah
  const confrontationalAgent =
    allAgents.reduce((best, curr) => {
      const bestScore = best.personality.extraversion - best.personality.agreeableness;
      const currScore = curr.personality.extraversion - curr.personality.agreeableness;
      return currScore > bestScore ? curr : best;
    }, allAgents[0]);

  // 1. Uji menarik-diri: bangun ke L1 dulu lalu picu interogasi -> turun level & retak -> perbaiki
  let s1 = createCounselingSession({
    agent: withdrawingAgent,
    context: makeContext(withdrawingAgent),
    exposure: 0,
    memory: createEmptyAgentMemory(withdrawingAgent.id),
    seed: 100,
  });
  s1 = applyCounselorSkillTurn(s1, withdrawingAgent, 'sapaan-hangat', 'Halo.');
  s1 = applyCounselorSkillTurn(s1, withdrawingAgent, 'batas-kerahasiaan', 'Rahasia terjaga.');
  s1 = applyCounselorSkillTurn(s1, withdrawingAgent, 'pertanyaan-terbuka', 'Bagaimana kondisimu?');
  const trustBeforeRupture1 = s1.vars.trust;
  const levelBeforeRupture1 = s1.unlockedLevel;

  s1 = applyCounselorSkillTurn(s1, withdrawingAgent, 'interogasi', 'Kenapa tidak bilang dari awal?');
  assert.equal(s1.rupture.active, true);
  assert.equal(s1.rupture.kind, 'menarik-diri');
  assert.ok(s1.vars.trust < trustBeforeRupture1);
  assert.ok(s1.unlockedLevel <= levelBeforeRupture1);

  s1 = recognizeSessionTension(s1, withdrawingAgent, 'Aku merasa ada ketegangan.');
  assert.equal(s1.rupture.recognized, true);
  s1 = applyRepairStepTurn(s1, withdrawingAgent, 'akui-dampak', '');
  s1 = applyRepairStepTurn(s1, withdrawingAgent, 'minta-maaf', '');
  s1 = applyRepairStepTurn(s1, withdrawingAgent, 'eksplorasi-perasaan', '');
  const trustBeforeFinalRepair = s1.vars.trust;
  s1 = applyRepairStepTurn(s1, withdrawingAgent, 'beri-pilihan', '');
  assert.equal(s1.rupture.active, false);
  assert.equal(s1.rupture.repairedCountInSession, 1);
  assert.ok(s1.vars.trust > trustBeforeFinalRepair, 'Perbaikan memulihkan kepercayaan');

  // 2. Uji konfrontasi lewat meremehkan
  let s2 = createCounselingSession({
    agent: confrontationalAgent,
    context: makeContext(confrontationalAgent),
    exposure: 0,
    memory: createEmptyAgentMemory(confrontationalAgent.id),
    seed: 200,
  });
  s2 = applyCounselorSkillTurn(s2, confrontationalAgent, 'meremehkan', 'Teman lain juga sama saja.');
  assert.equal(s2.rupture.active, true);
  assert.equal(s2.rupture.kind, 'konfrontasi');
  s2 = recognizeSessionTension(s2, confrontationalAgent, 'Aku melihat nadaku barusan kurang tepat.');
  s2 = applyRepairStepTurn(s2, confrontationalAgent, 'akui-dampak', '');
  s2 = applyRepairStepTurn(s2, confrontationalAgent, 'minta-maaf', '');
  s2 = applyRepairStepTurn(s2, confrontationalAgent, 'beri-pilihan', '');
  assert.equal(s2.rupture.active, false);
  assert.equal(s2.rupture.repairedCountInSession, 1);
});

test('Mengabaikan keretakan selama 2 giliran berturut-turut mengakhiri sesi lebih awal', () => {
  const agent = makeAgentFromBlueprint(4);
  let s = createCounselingSession({
    agent,
    context: makeContext(agent),
    exposure: 0,
    memory: createEmptyAgentMemory(agent.id),
    seed: 303,
  });

  s = applyCounselorSkillTurn(s, agent, 'interogasi', 'Jawab saja langsung.');
  assert.equal(s.rupture.active, true);
  assert.equal(s.closed, false);

  // Giliran diabaikan #1
  s = applyCounselorSkillTurn(s, agent, 'pertanyaan-tertutup', 'Jadi kapan?');
  assert.equal(s.rupture.ignoredTurns, 1);
  assert.equal(s.closed, false);

  // Giliran diabaikan #2 -> sesi berakhir lebih awal
  s = applyCounselorSkillTurn(s, agent, 'parafrase-ringkasan', 'Jadi intinya begitu.');
  assert.equal(s.rupture.ignoredTurns, 2);
  assert.equal(s.rupture.endedEarlyByRupture, true);
  assert.equal(s.closed, true);
});

test('Ingatan lintas sesi: janji terlewat menjatuhkan kepercayaan, janji ditepati menaikkan kepercayaan', () => {
  const agent = makeAgentFromBlueprint(0);
  let session1 = createCounselingSession({
    agent,
    context: makeContext(agent, { day: 1 }),
    exposure: 0,
    memory: createEmptyAgentMemory(agent.id),
    seed: 555,
  });
  session1 = createFollowUpPromiseInSession(session1, agent, 2, 'Cek ulang jadwal printer hari ke-2');
  const fin1 = finalizeCounselingSession(session1, [agent], {});
  const memoryAfterS1 = fin1.nextMemoryMap[agent.id];

  // Kasus A: Bertemu tepat waktu pada Hari 2 -> +8 trust
  const onTimeImpact = evaluateMemoryAtSessionStart(memoryAfterS1, 2, 'ajak-aktivitas', 0);
  assert.equal(onTimeImpact.fulfilledCount, 1);
  assert.equal(onTimeImpact.overdueCount, 0);
  assert.ok(onTimeImpact.trustDelta >= 8);

  // Kasus B: Terlambat hingga Hari 4 (melewati batas Hari 2) -> turun tajam (-14)
  const overdueImpact = evaluateMemoryAtSessionStart(memoryAfterS1, 4, 'ajak-aktivitas', 0);
  assert.equal(overdueImpact.overdueCount, 1);
  assert.ok(overdueImpact.trustDelta <= -14);
});

test('Aturan khusus keterampilan dan determinisme seed + urutan giliran identik', () => {
  const agent = makeAgentFromBlueprint(1);
  const problem = getAgentHiddenProblemProfile(agent);

  const runSequence = (seed: number) => {
    let s = createCounselingSession({
      agent,
      context: makeContext(agent),
      exposure: 0.1,
      memory: createEmptyAgentMemory(agent.id),
      seed,
    });
    // batas-kerahasiaan hanya + pada penggunaan pertama
    s = applyCounselorSkillTurn(s, agent, 'batas-kerahasiaan', 'Terjaga aman.');
    const firstConfDelta = s.turns[s.turns.length - 1].trustDelta;
    s = applyCounselorSkillTurn(s, agent, 'batas-kerahasiaan', 'Terjaga lagi.');
    const secondConfDelta = s.turns[s.turns.length - 1].trustDelta;
    assert.ok(firstConfDelta > 0);
    assert.equal(secondConfDelta, 0);

    // refleksi-perasaan benar vs salah
    s = applyCounselorSkillTurn(s, agent, 'refleksi-perasaan', 'Kamu terlihat ragu.', {
      reflectionNuance: problem.primaryEmotion,
    });
    const correctReflDelta = s.turns[s.turns.length - 1].trustDelta;
    s = applyCounselorSkillTurn(s, agent, 'refleksi-perasaan', 'Kamu marah sekali ya?', {
      reflectionCorrectOverride: false,
    });
    const wrongReflDelta = s.turns[s.turns.length - 1].trustDelta;
    assert.ok(correctReflDelta > 0);
    assert.ok(wrongReflDelta < 0);

    // pertanyaan-tertutup berulang
    s = applyCounselorSkillTurn(s, agent, 'pertanyaan-tertutup', 'Jam 9 ya?');
    const closed1 = s.turns[s.turns.length - 1].trustDelta;
    s = applyCounselorSkillTurn(s, agent, 'pertanyaan-tertutup', 'Selesai sore?');
    const closed2 = s.turns[s.turns.length - 1].trustDelta;
    assert.equal(closed1, 0);
    assert.ok(closed2 < 0);

    return s;
  };

  const runA = runSequence(202601);
  const runB = runSequence(202601);
  assert.deepEqual(runA, runB);

  // Seluruh agen mahasiswa memiliki profil masalah L1, L2, L3 yang tidak kosong
  for (let i = 0; i < STUDENT_COUNT; i += 1) {
    const a = makeAgentFromBlueprint(i);
    const p = getAgentHiddenProblemProfile(a);
    assert.ok(p.l1Fact.length > 10);
    assert.ok(p.l2Feeling.length > 10);
    assert.ok(p.l3CoreNeed.length > 10);
  }
});
