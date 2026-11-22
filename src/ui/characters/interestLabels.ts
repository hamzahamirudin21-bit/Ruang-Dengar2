import type { AgentInterests } from '../../types'

export type InterestKey = 'cetak3d' | 'pemrograman' | 'pengelasan' | 'elektronika'

export interface InterestLabel {
  key: InterestKey
  text: string
  iconId: 'printer3d' | 'kode' | 'api-las' | 'chip'
}

export const INTEREST_DISPLAY: Record<InterestKey, InterestLabel> = {
  elektronika: { key: 'elektronika', text: 'Elektronika', iconId: 'chip' },
  pemrograman: { key: 'pemrograman', text: 'Pemrograman', iconId: 'kode' },
  pengelasan: { key: 'pengelasan', text: 'Pengelasan', iconId: 'api-las' },
  cetak3d: { key: 'cetak3d', text: 'Cetak 3D', iconId: 'printer3d' },
}

/** Urutan seri: elektronika, pemrograman, pengelasan, cetak 3D. */
const TIE_ORDER: readonly InterestKey[] = ['elektronika', 'pemrograman', 'pengelasan', 'cetak3d']

export function topInterests(interests: AgentInterests, count = 2): readonly InterestLabel[] {
  const n = Math.max(0, Math.min(TIE_ORDER.length, Math.floor(count)))
  return TIE_ORDER.map((key, order) => ({ key, order, value: interests[key] }))
    .sort((a, b) => b.value - a.value || a.order - b.order)
    .slice(0, n)
    .map((e) => INTEREST_DISPLAY[e.key])
}
