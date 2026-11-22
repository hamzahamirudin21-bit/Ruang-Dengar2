/** Tabel murni: kunci HUD -> id ikon. */
export type HudIconId =
  | 'bintang' | 'jam' | 'kalender' | 'orang' | 'energi'
  | 'jeda' | 'putar' | 'kecepatan' | 'telinga' | 'obrolan' | 'stres';

export type HudBadgeKey =
  | 'hari' | 'jam-lab' | 'misi-selesai' | 'mahasiswa-aktif'
  | 'energi' | 'stres' | 'jeda' | 'putar' | 'kecepatan';

export const HUD_ICON_FOR: Readonly<Record<HudBadgeKey, HudIconId>> = {
  hari: 'kalender',
  'jam-lab': 'jam',
  'misi-selesai': 'bintang',
  'mahasiswa-aktif': 'orang',
  energi: 'energi',
  stres: 'stres',
  jeda: 'jeda',
  putar: 'putar',
  kecepatan: 'kecepatan',
};

export function hudIconFor(key: HudBadgeKey): HudIconId {
  return HUD_ICON_FOR[key];
}
