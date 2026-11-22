// Penyusun profil hanya-permukaan (daftar putih). Hanya membaca: id, name, cohort,
// interests, status, currentZoneId, interactingWithIds, dan MissionRecord.
// Jangan menambah bidang tanpa memperbarui PROFILE_ALLOWED_KEYS dan ujinya.
import { LAB_MAP } from '../../data/map';
import { STRINGS } from '../../data/strings';
import type { MissionRecord } from '../../engine/story/saveSlot';
import type { StudentAgent } from '../../types';
import { getAppearance } from '../characters/appearance';
import { topInterests } from '../characters/interestLabels';

export interface StudentProfile {
  id: string;
  number: string;
  name: string;
  cohort: number;
  styleName: string;
  interests: readonly string[];
  currentActivity: string;
  currentZoneLabel: string;
  withNames: readonly string[];
  missionHistory: {
    status: 'belum' | 'berlangsung' | 'selesai' | 'lanjutan';
    sessions: number;
    lastOutcomeLabel: string | null;
  };
}

export type ProfileTabId = 'profil' | 'jadwal' | 'riwayat' | 'relasi';

export const PROFILE_ALLOWED_KEYS: readonly (keyof StudentProfile)[] = [
  'id',
  'number',
  'name',
  'cohort',
  'styleName',
  'interests',
  'currentActivity',
  'currentZoneLabel',
  'withNames',
  'missionHistory',
];

function numberFromId(id: string): string {
  const m = /(\d+)\s*$/.exec(id);
  return m ? m[1].padStart(2, '0') : id;
}

export function buildStudentProfile(
  agent: StudentAgent,
  all: readonly StudentAgent[],
  mission: MissionRecord | undefined,
): StudentProfile {
  const zone = LAB_MAP.zones.find((z) => z.type === agent.currentZoneId);
  const withNames: string[] = [];
  for (const otherId of agent.interactingWithIds) {
    const other = all.find((a) => a.id === otherId);
    if (other) withNames.push(other.name);
  }
  const outcome = mission?.lastOutcome ?? null;
  return {
    id: agent.id,
    number: numberFromId(agent.id),
    name: agent.name,
    cohort: agent.cohort,
    styleName: getAppearance(agent.id).styleName,
    interests: topInterests(agent.interests).map((i) => i.text),
    currentActivity: STRINGS.story.activityStatusLabels[agent.status],
    currentZoneLabel: zone ? zone.label : String(agent.currentZoneId),
    withNames,
    missionHistory: {
      status: mission?.status ?? 'belum',
      sessions: mission?.sessions ?? 0,
      lastOutcomeLabel: outcome ? STRINGS.story.outcomeLabels[outcome] : null,
    },
  };
}
