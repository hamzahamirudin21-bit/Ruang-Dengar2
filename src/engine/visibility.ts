import { getContactChannelConfig } from '../data/contactChannels';
import { LAB_MAP } from '../data/map';
import {
  ConsultationDoorMode,
  ContactChannelId,
  IntermediaryKind,
  LabMapData,
  StudentAgent,
  VisibilityAssessment,
} from '../types';

const PRIVATE_WALLED_ZONES = new Set(['konsultasi', 'ruang-dosen', 'las', 'gudang-alat']);

function isSameVisibilityRoomOrOpenArea(
  a: StudentAgent,
  b: StudentAgent
): boolean {
  if (a.currentZoneId === b.currentZoneId) {
    return true;
  }
  // Ruang bersekat dinding penuh tidak saling terlihat dengan area luar kecuali sama zona
  if (
    PRIVATE_WALLED_ZONES.has(a.currentZoneId) ||
    PRIVATE_WALLED_ZONES.has(b.currentZoneId)
  ) {
    return false;
  }
  return true;
}

/**
 * Menghitung saksi di sekitar agen sasaran saat konselor melakukan pendekatan
 * serta kenaikan variabel paparan gosip (exposure) untuk dipakai pada perhitungan kepercayaan sesi konseling.
 */
export function assessChannelVisibility(
  channelId: ContactChannelId,
  targetAgent: StudentAgent,
  allAgents: readonly StudentAgent[],
  consultationDoorMode: ConsultationDoorMode,
  map: LabMapData = LAB_MAP,
  intermediaryKind?: IntermediaryKind
): VisibilityAssessment {
  const channel = getContactChannelConfig(channelId);
  const doorPrivacyBonusApplied =
    (channelId === 'pintu-akademik' || channelId === 'panggilan-resmi') &&
    consultationDoorMode === 'samping';

  if (channel.witnessRadius <= 0 || channelId === 'pesan-tertulis') {
    return {
      channelId,
      witnessCount: 0,
      witnessIds: [],
      witnessNames: [],
      exposureDelta: 0,
      doorPrivacyBonusApplied: true,
      summaryText: 'Pendekatan privat melalui pesan tertulis (0 saksi sekitar).',
    };
  }

  const consultDoorPos =
    consultationDoorMode === 'lab' ? { x: 30, y: 13 } : { x: 35.5, y: 15 };

  const witnesses: StudentAgent[] = [];

  for (const other of allAgents) {
    if (other.id === targetAgent.id) continue;

    const dx = other.position.x - targetAgent.position.x;
    const dy = other.position.y - targetAgent.position.y;
    const distToTarget = Math.hypot(dx, dy);

    let seesApproach = false;

    if (channelId === 'panggilan-resmi') {
      // Panggilan resmi di depan rekan membuat seluruh rekan satu zona atau dalam radius lebar menyaksikannya
      if (
        other.currentZoneId === targetAgent.currentZoneId ||
        (distToTarget <= channel.witnessRadius &&
          isSameVisibilityRoomOrOpenArea(targetAgent, other))
      ) {
        seesApproach = true;
      } else if (consultationDoorMode === 'lab') {
        const distToDoor = Math.hypot(
          other.position.x - consultDoorPos.x,
          other.position.y - consultDoorPos.y
        );
        if (distToDoor <= 4.5) {
          seesApproach = true;
        }
      }
    } else if (channelId === 'pintu-akademik') {
      // Pintu akademik bersifat wajar; hanya rekan sangat dekat (<= 1.8 petak) yang kebetulan mendengar
      if (
        other.currentZoneId === targetAgent.currentZoneId &&
        distToTarget <= channel.witnessRadius
      ) {
        seesApproach = true;
      } else if (consultationDoorMode === 'lab') {
        const distToDoor = Math.hypot(
          other.position.x - consultDoorPos.x,
          other.position.y - consultDoorPos.y
        );
        if (distToDoor <= 2.2) {
          seesApproach = true;
        }
      }
    } else {
      if (
        distToTarget <= channel.witnessRadius &&
        isSameVisibilityRoomOrOpenArea(targetAgent, other)
      ) {
        seesApproach = true;
      }
    }

    if (seesApproach) {
      witnesses.push(other);
    }
  }

  const witnessIds = witnesses.map((w) => w.id);
  const witnessNames = witnesses.map((w) => w.name);

  // Kepekaan gosip target (dipakai secara internal, tidak ditampilkan pada Kartu Agen)
  const gossipSensitivity =
    targetAgent.hiddenVars.stigmaSensitivity * 0.65 +
    targetAgent.personality.stressSensitivity * 0.35;

  let doorFactor = 1;
  if (channelId === 'pintu-akademik' || channelId === 'panggilan-resmi') {
    doorFactor = consultationDoorMode === 'lab' ? 1.2 : 0.72;
  }

  // Jalur 5 (lewat perantara) menambah faktor pengetahuan sosial pihak perantara
  const intermediaryExtra = channelId === 'lewat-perantara' ? 0.04 : 0;

  const rawExposure =
    witnesses.length *
      channel.exposurePerWitness *
      (0.5 + gossipSensitivity) *
      doorFactor +
    intermediaryExtra;

  const exposureDelta = Number(Math.min(0.65, rawExposure).toFixed(4));

  const zoneLabel =
    map.zones.find((z) => z.id === targetAgent.currentZoneId)?.shortLabel ??
    targetAgent.currentZoneId;

  let summaryText = `${witnesses.length} saksi sekitar melihat pendekatan di ${zoneLabel}.`;
  if (witnesses.length === 0) {
    summaryText = `Tidak ada saksi langsung di sekitar ${zoneLabel} (0 saksi).`;
  }
  if (channelId === 'lewat-perantara' && intermediaryKind) {
    const labelMap: Record<IntermediaryKind, string> = {
      teman: 'teman dekat lab',
      teknisi: 'teknisi laboratorium',
      dosen: 'dosen pengampu',
    };
    summaryText += ` Perantara (${labelMap[intermediaryKind]}) turut mengetahui permohonan pertemuan.`;
  }

  return {
    channelId,
    witnessCount: witnesses.length,
    witnessIds,
    witnessNames,
    exposureDelta,
    doorPrivacyBonusApplied,
    summaryText,
  };
}
