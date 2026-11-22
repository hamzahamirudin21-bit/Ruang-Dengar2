import { LabEvent, StudentAgent } from '../types';
import { SeededRng, clamp01, clampAffinity, pickOne } from './rng';

export interface EventStepResult {
  activeEvents: LabEvent[];
  newlyTriggered: LabEvent[];
}

function hasActiveKind(events: readonly LabEvent[], kind: LabEvent['kind']): boolean {
  return events.some((ev) => ev.kind === kind && ev.remainingTicks > 0);
}

/**
 * Mengevaluasi dan memperbarui event laboratorium pada setiap tick 5-menitan secara deterministik.
 */
export function stepLabEvents(
  currentEvents: readonly LabEvent[],
  agents: StudentAgent[],
  day: number,
  minutesOfDay: number,
  tickCount: number,
  rng: SeededRng
): EventStepResult {
  // 1. Kurangi sisa durasi event yang sedang aktif
  const activeEvents: LabEvent[] = [];
  for (const ev of currentEvents) {
    const nextTicks = ev.remainingTicks - 1;
    if (nextTicks > 0) {
      activeEvents.push({ ...ev, remainingTicks: nextTicks });
    }
  }

  const newlyTriggered: LabEvent[] = [];

  // 2. Event terjadwal harian: Jeda siang sekitar 11:45 - 12:45 (705..765 menit)
  if (minutesOfDay >= 705 && minutesOfDay < 720 && !hasActiveKind(activeEvents, 'jeda-siang')) {
    const lunchEvent: LabEvent = {
      id: `ev-${day}-${tickCount}-jeda`,
      kind: 'jeda-siang',
      title: 'Jeda Istirahat Siang',
      description: 'Mahasiswa mulai beristirahat sejenak, mengambil minum, dan mengobrol santai.',
      targetZoneId: 'istirahat',
      involvedAgentIds: [],
      startDay: day,
      startMinute: Math.floor(minutesOfDay),
      remainingTicks: 10, // ~50 menit
    };
    activeEvents.push(lunchEvent);
    newlyTriggered.push(lunchEvent);
  }

  // 3. Event terjadwal: Diskusi koordinasi proyek pagi/sore (sekitar 09:30 atau 14:00)
  if (
    ((minutesOfDay >= 570 && minutesOfDay < 580) ||
      (minutesOfDay >= 840 && minutesOfDay < 850)) &&
    !hasActiveKind(activeEvents, 'diskusi-proyek')
  ) {
    const discussEvent: LabEvent = {
      id: `ev-${day}-${tickCount}-diskusi`,
      kind: 'diskusi-proyek',
      title: 'Koordinasi Proyek Lintas Tim',
      description: 'Beberapa kelompok berkumpul di Meja Diskusi Bersama untuk menyinkronkan progres.',
      targetZoneId: 'diskusi',
      involvedAgentIds: [],
      startDay: day,
      startMinute: Math.floor(minutesOfDay),
      remainingTicks: 8,
    };
    activeEvents.push(discussEvent);
    newlyTriggered.push(discussEvent);
  }

  // 4. Event acak ber-seed agar dinamika harian bervariasi alami
  const roll = rng();

  if (roll < 0.055 && !hasActiveKind(activeEvents, 'printer-macet')) {
    const affected = agents
      .filter((a) => a.interests.cetak3d >= 0.65)
      .slice(0, 4)
      .map((a) => a.id);
    const printerEvent: LabEvent = {
      id: `ev-${day}-${tickCount}-printer`,
      kind: 'printer-macet',
      title: 'Kalibrasi Printer 3D',
      description: 'Salah satu printer 3D perlu pengecekan filamen sehingga antrean cetak sedikit melambat.',
      targetZoneId: 'cetak-3d',
      involvedAgentIds: affected,
      startDay: day,
      startMinute: Math.floor(minutesOfDay),
      remainingTicks: 6,
    };
    activeEvents.push(printerEvent);
    newlyTriggered.push(printerEvent);

    for (const agent of agents) {
      if (affected.includes(agent.id)) {
        agent.stress = clamp01(agent.stress + 0.05 * agent.personality.stressSensitivity);
      }
    }
  } else if (roll >= 0.055 && roll < 0.1 && !hasActiveKind(activeEvents, 'tenggat-praktikum')) {
    const targetZones = ['pemrograman', 'elektronik-iot', 'cetak-3d', 'las'] as const;
    const zone = pickOne(rng, targetZones);
    const deadlineEvent: LabEvent = {
      id: `ev-${day}-${tickCount}-tenggat`,
      kind: 'tenggat-praktikum',
      title: 'Pengingat Tenggat Praktikum',
      description: 'Asisten lab mengingatkan pengumpulan modul uji sebelum sesi sore berakhir.',
      targetZoneId: zone,
      involvedAgentIds: [],
      startDay: day,
      startMinute: Math.floor(minutesOfDay),
      remainingTicks: 9,
    };
    activeEvents.push(deadlineEvent);
    newlyTriggered.push(deadlineEvent);

    for (const agent of agents) {
      agent.taskLoad = clamp01(agent.taskLoad + 0.07);
    }
  } else if (roll >= 0.1 && roll < 0.135 && !hasActiveKind(activeEvents, 'inspeksi-k3')) {
    const k3Event: LabEvent = {
      id: `ev-${day}-${tickCount}-k3`,
      kind: 'inspeksi-k3',
      title: 'Pengecekan Keselamatan K3',
      description: 'Peninjauan rutin alat pelindung diri dan kerapian area Stasiun Las.',
      targetZoneId: 'las',
      involvedAgentIds: [],
      startDay: day,
      startMinute: Math.floor(minutesOfDay),
      remainingTicks: 5,
    };
    activeEvents.push(k3Event);
    newlyTriggered.push(k3Event);
  } else if (roll >= 0.135 && roll < 0.165 && !hasActiveKind(activeEvents, 'gesekan-tugas')) {
    // Cari pasangan agen yang berada dekat atau memiliki afinitas rendah untuk gesekan tugas ringan
    const lowAffinityCandidates = agents.filter((a) => a.personality.agreeableness < 0.55);
    if (lowAffinityCandidates.length > 0) {
      const initiator = pickOne(rng, lowAffinityCandidates);
      const others = agents.filter(
        (other) =>
          other.id !== initiator.id &&
          (initiator.affinities[other.id] ?? 0) < 0.1
      );
      if (others.length > 0) {
        const partner = pickOne(rng, others);
        initiator.affinities[partner.id] = clampAffinity(
          (initiator.affinities[partner.id] ?? 0) - 0.06
        );
        partner.affinities[initiator.id] = clampAffinity(
          (partner.affinities[initiator.id] ?? 0) - 0.06
        );
        initiator.stress = clamp01(initiator.stress + 0.06);
        partner.stress = clamp01(partner.stress + 0.06);
        initiator.socialStatus = 'konflik-ringan';
        partner.socialStatus = 'konflik-ringan';

        const frictionEvent: LabEvent = {
          id: `ev-${day}-${tickCount}-gesekan`,
          kind: 'gesekan-tugas',
          title: 'Perbedaan Pendapat Tugas',
          description: `${initiator.name} dan ${partner.name} mengalami ketegangan ringan soal pembagian teknis.`,
          targetZoneId: initiator.currentZoneId,
          involvedAgentIds: [initiator.id, partner.id],
          startDay: day,
          startMinute: Math.floor(minutesOfDay),
          remainingTicks: 4,
        };
        activeEvents.push(frictionEvent);
        newlyTriggered.push(frictionEvent);
      }
    }
  }

  return { activeEvents, newlyTriggered };
}
