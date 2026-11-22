/**
 * Peran cerita tetap per mahasiswa dan bias sosiometri awal.
 * Nilai bias dikalibrasi pada tugas 3.2 (uji penerimaan di storyRoles.test.ts).
 * Bias terisolasi-introver positif (+0.2) karena skor dasar mhs-14 sangat rendah:
 * nilai negatif membuatnya nol pilihan pada sebagian besar seed, sedangkan
 * dengan +0.2 rata-rata pilihan masuknya tetap sekitar 1 di bawah rata-rata kelompok.
 */

export type StoryRoleId =
  | 'populer'
  | 'penghubung'
  | 'pemimpin'
  | 'andal-tekun'
  | 'mandiri-sehat'
  | 'tegas-kritis'
  | 'terabaikan'
  | 'terisolasi-introver';

export interface StoryRoleDef {
  label: string;
  sociometryBias: number;
  hasMission: boolean;
}

export const STORY_ROLE_DEFS: Record<StoryRoleId, StoryRoleDef> = {
  populer: { label: 'Populer', sociometryBias: 0.08, hasMission: true },
  penghubung: { label: 'Penghubung', sociometryBias: 0.03, hasMission: true },
  pemimpin: { label: 'Pemimpin', sociometryBias: 0.03, hasMission: true },
  'andal-tekun': { label: 'Andal dan tekun', sociometryBias: 0.01, hasMission: true },
  'mandiri-sehat': { label: 'Mandiri dan sehat', sociometryBias: 0, hasMission: false },
  'tegas-kritis': { label: 'Tegas dan kritis', sociometryBias: -0.02, hasMission: true },
  terabaikan: { label: 'Terabaikan', sociometryBias: -0.02, hasMission: true },
  'terisolasi-introver': { label: 'Terisolasi dan introver', sociometryBias: 0.23, hasMission: true },
};

export const STORY_ROLES: Record<string, StoryRoleId> = {
  'mhs-01': 'pemimpin',
  'mhs-02': 'andal-tekun',
  'mhs-03': 'pemimpin',
  'mhs-04': 'tegas-kritis',
  'mhs-05': 'penghubung',
  'mhs-06': 'andal-tekun',
  'mhs-07': 'andal-tekun',
  'mhs-08': 'andal-tekun',
  'mhs-09': 'tegas-kritis',
  'mhs-10': 'mandiri-sehat',
  'mhs-11': 'mandiri-sehat',
  'mhs-12': 'populer',
  'mhs-13': 'penghubung',
  'mhs-14': 'terisolasi-introver',
  'mhs-15': 'terabaikan',
};

/** Bias sosiometri untuk id mahasiswa; 0 bila id tidak punya peran. */
export function getStoryRoleBias(agentId: string): number {
  const role = STORY_ROLES[agentId];
  return role ? STORY_ROLE_DEFS[role].sociometryBias : 0;
}
