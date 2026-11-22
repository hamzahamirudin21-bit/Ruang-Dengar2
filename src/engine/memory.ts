import {
  AgentMemoryRecord,
  ContactChannelId,
  DisclosureLevel,
  FollowUpPromise,
  SessionState,
} from '../types';

export function createEmptyAgentMemory(agentId: string): AgentMemoryRecord {
  return {
    agentId,
    pastUtterances: [],
    promises: [],
    wasHumiliated: false,
    confidentialityExplained: false,
    witnessEvents: [],
    totalSessions: 0,
    totalRuptures: 0,
    totalRepairs: 0,
    lastSessionDay: null,
  };
}

export function getOrCreateAgentMemory(
  memoryMap: Readonly<Record<string, AgentMemoryRecord>>,
  agentId: string
): AgentMemoryRecord {
  return memoryMap[agentId] ?? createEmptyAgentMemory(agentId);
}

export interface MemorySessionStartImpact {
  updatedMemory: AgentMemoryRecord;
  trustDelta: number;
  readinessDelta: number;
  notes: string[];
  fulfilledCount: number;
  overdueCount: number;
}

/**
 * Mengevaluasi ingatan lintas sesi saat pertemuan baru dimulai:
 * - Janji tindak lanjut yang sudah melewati batas hari ("terlewat") menurunkan kepercayaan secara tajam (-14 per janji terlewat, maks -28).
 * - Janji tindak lanjut yang masih dalam batas waktu dan ditindaklanjuti ("terpenuhi") menambah kepercayaan (+8).
 * - Riwayat pernah dipermalukan ("wasHumiliated") menyisakan kehati-hatian awal (-6).
 */
export function evaluateMemoryAtSessionStart(
  memory: AgentMemoryRecord,
  currentDay: number,
  channelId: ContactChannelId,
  witnessCount: number
): MemorySessionStartImpact {
  let trustDelta = 0;
  let readinessDelta = 0;
  let fulfilledCount = 0;
  let overdueCount = 0;
  const notes: string[] = [];

  const nextPromises: FollowUpPromise[] = memory.promises.map((p) => {
    if (p.status !== 'menunggu') return p;
    if (currentDay > p.dueDay) {
      overdueCount += 1;
      trustDelta -= 14;
      readinessDelta -= 10;
      notes.push(
        `Janji tindak lanjut dari Hari ${p.createdDay} (batas Hari ${p.dueDay}) terlewat tanpa tindak lanjut.`
      );
      return {
        ...p,
        status: 'terlewat',
        resolvedDay: currentDay,
      };
    }
    // Pertemuan lanjutan terjadi sebelum atau tepat pada dueDay -> janji terpenuhi!
    fulfilledCount += 1;
    trustDelta += 8;
    readinessDelta += 6;
    notes.push(
      `Konselor menepati janji tindak lanjut dari Hari ${p.createdDay} tepat waktu (sebelum Hari ${p.dueDay}).`
    );
    return {
      ...p,
      status: 'terpenuhi',
      resolvedDay: currentDay,
    };
  });

  if (memory.wasHumiliated) {
    trustDelta -= 6;
    readinessDelta -= 5;
    notes.push(
      'Mahasiswa masih mengingat pengalaman tidak nyaman/dipermalukan pada interaksi sebelumnya.'
    );
  }

  if (memory.totalRepairs > 0 && !memory.wasHumiliated) {
    notes.push(
      `Riwayat sebelumnya menunjukkan ${memory.totalRepairs} kali ketegangan yang berhasil diperbaiki bersama.`
    );
  }

  const nextWitnessEvents =
    witnessCount > 0
      ? [
          ...memory.witnessEvents.slice(-9),
          { day: currentDay, channelId, witnessCount },
        ]
      : memory.witnessEvents;

  if (memory.witnessEvents.length >= 2 && witnessCount > 0) {
    trustDelta -= 3;
    notes.push(
      'Mahasiswa sadar pendekatan berulang kali terlihat oleh orang lain di sekitar lab.'
    );
  }

  return {
    updatedMemory: {
      ...memory,
      promises: nextPromises,
      witnessEvents: nextWitnessEvents,
    },
    trustDelta,
    readinessDelta,
    notes,
    fulfilledCount,
    overdueCount,
  };
}

/**
 * Menyimpan ucapan konselor, janji baru, riwayat dipermalukan, dan statistik sesi
 * ke daftar ingatan agen setelah sesi berakhir.
 */
export function commitSessionToAgentMemory(
  baseMemory: AgentMemoryRecord,
  session: SessionState
): AgentMemoryRecord {
  const newUtterances = session.turns
    .filter((t) => t.kind !== 'pembuka' && t.counselorText.trim().length > 0)
    .map((t) => ({
      day: session.channelContext.day,
      channelId: session.channelContext.channelId,
      skillLabel: t.actionLabel,
      text: t.counselorText.trim(),
      disclosureLevel: t.disclosureLevelAfter as DisclosureLevel,
    }));

  const humiliatedInSession =
    session.turns.some(
      (t) =>
        t.actionLabel.toLowerCase().includes('meremehkan') ||
        (t.ruptureTriggered && session.channelContext.witnessCount >= 3)
    ) ||
    session.channelContext.outcomeKind === 'kerahasiaan-bocor';

  const mergedPromises: FollowUpPromise[] = [
    ...baseMemory.promises,
    ...session.promisesCreatedInSession,
  ];

  return {
    ...baseMemory,
    pastUtterances: [...baseMemory.pastUtterances, ...newUtterances].slice(-30),
    promises: mergedPromises.slice(-20),
    wasHumiliated: baseMemory.wasHumiliated || humiliatedInSession,
    confidentialityExplained:
      baseMemory.confidentialityExplained || session.usedConfidentialityOnce,
    totalSessions: baseMemory.totalSessions + 1,
    totalRuptures: baseMemory.totalRuptures + session.rupture.ruptureCountInSession,
    totalRepairs: baseMemory.totalRepairs + session.rupture.repairedCountInSession,
    lastSessionDay: session.channelContext.day,
  };
}

/**
 * Memperbarui status janji yang terlewat saat pergantian hari simulasi berlangsung
 * (berguna untuk pemeriksaan ringkasan dan ingatan meskipun belum ada sesi baru).
 */
export function expireOverduePromisesForDay(
  memoryMap: Readonly<Record<string, AgentMemoryRecord>>,
  newDay: number
): Record<string, AgentMemoryRecord> {
  const nextMap: Record<string, AgentMemoryRecord> = {};
  for (const [agentId, rec] of Object.entries(memoryMap)) {
    let changed = false;
    const updatedPromises = rec.promises.map((p) => {
      if (p.status === 'menunggu' && newDay > p.dueDay) {
        changed = true;
        return {
          ...p,
          status: 'terlewat' as const,
          resolvedDay: newDay,
        };
      }
      return p;
    });
    nextMap[agentId] = changed ? { ...rec, promises: updatedPromises } : rec;
  }
  return nextMap;
}
