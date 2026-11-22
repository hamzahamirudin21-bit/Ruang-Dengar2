import { CONTACT_CHANNELS } from '../data/contactChannels';
import {
  ChannelAvailability,
  ContactActionOptions,
  ContactChannelConfig,
  ContactOutcomeKind,
  StudentAgent,
  VisibilityAssessment,
  WorldState,
} from '../types';
import { WORK_END_MINUTES, formatClockTime } from './clock';
import { clamp01, mulberry32 } from './rng';

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function isConsultationRoomOccupied(world: WorldState): boolean {
  return world.agents.some(
    (agent) =>
      agent.currentZoneId === 'konsultasi' && agent.status !== 'berpindah'
  );
}

export function getConsultationScheduleOptions(minutesOfDay: number): string[] {
  const slots: string[] = [];
  const offsets = [30, 60, 90];
  for (const offset of offsets) {
    const candidate = minutesOfDay + offset;
    if (candidate <= WORK_END_MINUTES) {
      const formatted = formatClockTime(candidate);
      slots.push(
        offset === 30
          ? `${formatted} (Segera +30 mnt)`
          : `${formatted} (+${offset} mnt)`
      );
    }
  }
  if (slots.length === 0) {
    slots.push(`${formatClockTime(Math.min(WORK_END_MINUTES, minutesOfDay + 15))} (Sesi penutup)`);
  }
  return slots;
}

export function evaluateChannelAvailability(
  channel: ContactChannelConfig,
  _targetAgent: StudentAgent,
  world: WorldState,
  remainingEnergy: number
): ChannelAvailability {
  if (remainingEnergy < channel.energyCost) {
    return {
      channelId: channel.id,
      available: false,
      unavailableReason: `Energi tersisa tidak cukup (butuh ${channel.energyCost})`,
    };
  }

  if (channel.requiresEmptyConsultationRoom && isConsultationRoomOccupied(world)) {
    return {
      channelId: channel.id,
      available: false,
      unavailableReason: 'Ruang Konsultasi sedang terisi',
    };
  }

  return {
    channelId: channel.id,
    available: true,
    unavailableReason: null,
  };
}

export function listChannelAvailabilities(
  targetAgent: StudentAgent,
  world: WorldState,
  remainingEnergy: number
): { channel: ContactChannelConfig; availability: ChannelAvailability }[] {
  return CONTACT_CHANNELS.map((channel) => ({
    channel,
    availability: evaluateChannelAvailability(
      channel,
      targetAgent,
      world,
      remainingEnergy
    ),
  }));
}

export interface ContactResolutionResult {
  outcomeKind: ContactOutcomeKind;
  outcomeHeadline: string;
  outcomeDescription: string;
  outcomeSummary: string;
  trustDelta: number;
  readinessDelta: number;
  ruptureDelta: number;
  socialComfortDelta: number;
}

/**
 * Menyelesaikan hasil awal penggunaan jalur kontak secara deterministik
 * berdasarkan profil agen, beban tugas, visibilitas saksi, serta pilihan etis konselor.
 */
export function resolveContactChannel(
  channel: ContactChannelConfig,
  targetAgent: StudentAgent,
  world: WorldState,
  visibility: VisibilityAssessment,
  options: ContactActionOptions,
  actionCounter: number
): ContactResolutionResult {
  const seed =
    world.seed +
    world.clock.day * 977 +
    world.tickCount * 131 +
    actionCounter * 43 +
    channel.order * 19 +
    hashString(targetAgent.id);
  const rng = mulberry32(seed);
  const roll = rng();

  const hasFullDeadline =
    targetAgent.taskLoad >= 0.85 ||
    world.activeEvents.some(
      (ev) =>
        ev.kind === 'tenggat-praktikum' &&
        (ev.involvedAgentIds.includes(targetAgent.id) ||
          ev.targetZoneId === targetAgent.currentZoneId)
    );

  if (channel.id === 'sapa-di-tempat') {
    return {
      outcomeKind: 'terbuka-ringan',
      outcomeHeadline: `${targetAgent.name} membalas sapaan dengan obrolan ringan`,
      outcomeDescription:
        'Pendekatan informal di area lab membuka percakapan ringan (level 0) seputar aktivitas praktikum tanpa memaksa topik pribadi.',
      outcomeSummary: 'Obrolan ringan (level 0) terbuka',
      trustDelta: 0.03,
      readinessDelta: 0.03,
      ruptureDelta: 0,
      socialComfortDelta: 0.02,
    };
  }

  if (channel.id === 'ajak-aktivitas') {
    if (hasFullDeadline) {
      return {
        outcomeKind: 'gagal-tenggat',
        outcomeHeadline: `${targetAgent.name} menolak halus karena diburu tenggat penuh`,
        outcomeDescription:
          'Mahasiswa tampak fokus menyelesaikan target praktikum yang mendesak sehingga ajakan aktivitas bersama belum dapat dilakukan saat ini.',
        outcomeSummary: 'Gagal: mahasiswa diburu tenggat penuh',
        trustDelta: 0,
        readinessDelta: -0.01,
        ruptureDelta: 0,
        socialComfortDelta: 0,
      };
    }

    return {
      outcomeKind: 'berhasil',
      outcomeHeadline: `${targetAgent.name} bersedia berjalan & beraktivitas bersama`,
      outcomeDescription:
        'Suasana netral saat berpindah ke area santai/gudang atau membantu di stasiunnya membuat percakapan mengalir lebih wajar dan minim stigma.',
      outcomeSummary: 'Bersedia beraktivitas bersama (rapport sedang)',
      trustDelta: 0.09,
      readinessDelta: 0.08,
      ruptureDelta: 0,
      socialComfortDelta: 0.05,
    };
  }

  if (channel.id === 'pintu-akademik') {
    const veryLowTrust = targetAgent.hiddenVars.trustInCounselor < 0.25;
    const noShowThreshold =
      (0.26 - targetAgent.hiddenVars.trustInCounselor) * 2.2 +
      (1 - targetAgent.personality.conscientiousness) * 0.25;

    if (veryLowTrust && roll < clamp01(noShowThreshold)) {
      return {
        outcomeKind: 'tidak-hadir',
        outcomeHeadline: `${targetAgent.name} tidak hadir pada jadwal konsultasi praktikum`,
        outcomeDescription:
          'Meskipun alasan akademik terasa sah, kepercayaan terhadap konselor masih sangat rendah sehingga mahasiswa memilih tidak menghadiri jadwal.',
        outcomeSummary: 'Tidak hadir (kepercayaan masih sangat rendah)',
        trustDelta: -0.02,
        readinessDelta: -0.02,
        ruptureDelta: 0.04,
        socialComfortDelta: 0,
      };
    }

    const scheduledNote = options.scheduledTimeLabel
      ? ` pada ${options.scheduledTimeLabel}`
      : '';
    return {
      outcomeKind: 'berhasil',
      outcomeHeadline: `${targetAgent.name} hadir untuk sesi konsultasi praktikum${scheduledNote}`,
      outcomeDescription:
        'Bingkai akademik membantu menjaga privasi di Ruang Konsultasi dengan stigma rendah-sedang sehingga relasi dapat dibangun bertahap.',
      outcomeSummary: `Hadir konsultasi praktikum${scheduledNote}`,
      trustDelta: 0.11,
      readinessDelta: 0.1,
      ruptureDelta: 0,
      socialComfortDelta: 0.04,
    };
  }

  if (channel.id === 'panggilan-resmi') {
    const highAutonomyOrStigma =
      targetAgent.solitudePreference >= 0.62 ||
      targetAgent.hiddenVars.stigmaSensitivity >= 0.56;
    const witnessedHeavily = visibility.witnessCount >= 2;

    if (highAutonomyOrStigma && (witnessedHeavily || roll < 0.65)) {
      const hardRefusal =
        targetAgent.hiddenVars.trustInCounselor < 0.35 && roll < 0.45;
      if (hardRefusal) {
        return {
          outcomeKind: 'menolak',
          outcomeHeadline: `${targetAgent.name} menolak panggilan resmi di depan rekan lab`,
          outcomeDescription:
            'Panggilan formal di hadapan rekan sekitar memicu rasa malu dan penolakan. Risiko keretakan menarik diri meningkat.',
          outcomeSummary: 'Menolak panggilan resmi (risiko menarik diri)',
          trustDelta: -0.14,
          readinessDelta: -0.15,
          ruptureDelta: 0.22,
          socialComfortDelta: -0.08,
        };
      }

      return {
        outcomeKind: 'terpaksa',
        outcomeHeadline: `${targetAgent.name} datang dengan sikap defensif dan terpaksa`,
        outcomeDescription:
          'Mahasiswa hadir ke Ruang Konsultasi karena panggilan resmi, namun tatapan teman-teman membuatnya tegang dan menjaga jarak (rapport menurun).',
        outcomeSummary: 'Datang terpaksa (rapport turun, risiko menarik diri)',
        trustDelta: -0.09,
        readinessDelta: -0.1,
        ruptureDelta: 0.16,
        socialComfortDelta: -0.05,
      };
    }

    return {
      outcomeKind: 'berhasil',
      outcomeHeadline: `${targetAgent.name} memenuhi panggilan ke Ruang Konsultasi`,
      outcomeDescription:
        'Mahasiswa hadir ke Ruang Konsultasi, meski tetap perlu kehati-hatian menjaga rasa aman karena proses pemanggilan sempat terlihat di area lab.',
      outcomeSummary: 'Memenuhi panggilan ke Ruang Konsultasi',
      trustDelta: 0.03,
      readinessDelta: 0.02,
      ruptureDelta: visibility.witnessCount >= 3 ? 0.05 : 0,
      socialComfortDelta: 0,
    };
  }

  if (channel.id === 'lewat-perantara') {
    const intermediaryLabel =
      options.intermediaryKind === 'dosen'
        ? 'dosen pengampu'
        : options.intermediaryKind === 'teknisi'
          ? 'teknisi lab'
          : 'teman dekat lab';

    if (options.shareDetailsToIntermediary) {
      return {
        outcomeKind: 'kerahasiaan-bocor',
        outcomeHeadline: `Kepercayaan ${targetAgent.name} turun tajam akibat kebocoran detail`,
        outcomeDescription: `Konselor membuka detail persoalan kepada ${intermediaryLabel}. Mahasiswa merasa batas kerahasiaannya dilanggar dan menarik diri.`,
        outcomeSummary: `Detail dibuka ke ${intermediaryLabel} (kepercayaan turun tajam)`,
        trustDelta: -0.26,
        readinessDelta: -0.2,
        ruptureDelta: 0.28,
        socialComfortDelta: -0.09,
      };
    }

    return {
      outcomeKind: 'terhubung-perantara',
      outcomeHeadline: `${targetAgent.name} bersedia merespons lewat bantuan ${intermediaryLabel}`,
      outcomeDescription: `Perantara menyampaikan ajakan dengan tetap menjaga kerahasiaan detail. Dorongan sosial dari ${intermediaryLabel} menaikkan kesediaan mahasiswa.`,
      outcomeSummary: `Terhubung lewat ${intermediaryLabel} (kerahasiaan terjaga)`,
      trustDelta: 0.05,
      readinessDelta: 0.12,
      ruptureDelta: 0,
      socialComfortDelta: 0.04,
    };
  }

  // Jalur 6: pesan-tertulis
  const highSocialAnxiety =
    targetAgent.hiddenVars.socialComfort < 0.5 ||
    targetAgent.personality.extraversion < 0.45;
  return {
    outcomeKind: 'respons-tertulis',
    outcomeHeadline: `${targetAgent.name} membaca pesan pribadi Anda dengan tenang`,
    outcomeDescription: highSocialAnxiety
      ? 'Pesan tertulis tanpa sorotan publik memberi ruang aman yang cocok bagi mahasiswa yang kurang nyaman berinteraksi mendadak di keramaian.'
      : 'Catatan pribadi diterima secara rahasia tanpa menimbulkan stigma atau paparan sosial.',
    outcomeSummary: 'Pesan pribadi diterima tanpa saksi',
    trustDelta: highSocialAnxiety ? 0.1 : 0.06,
    readinessDelta: highSocialAnxiety ? 0.11 : 0.06,
    ruptureDelta: 0,
    socialComfortDelta: highSocialAnxiety ? 0.06 : 0.03,
  };
}
