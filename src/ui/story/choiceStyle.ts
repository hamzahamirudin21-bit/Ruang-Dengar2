import type { CounselorSkillId } from '../../types';

export type ChoiceIconId = 'tanya' | 'ruang' | 'hangat' | 'saran';

/** Ikon dipilih dari gaya ucapan saja; tiap keluarga memuat ragam kualitas pilihan. */
export const CHOICE_ICON_FOR: Record<CounselorSkillId, ChoiceIconId> = {
  'pertanyaan-terbuka': 'tanya',
  'pertanyaan-tertutup': 'tanya',
  interogasi: 'tanya',
  'refleksi-perasaan': 'ruang',
  'parafrase-ringkasan': 'ruang',
  'jeda-hening': 'ruang',
  'janji-mutlak': 'ruang',
  'sapaan-hangat': 'hangat',
  'validasi-normalisasi': 'hangat',
  'afirmasi-kekuatan': 'hangat',
  meremehkan: 'hangat',
  'nasihat-dini': 'saran',
  'sampaikan-pengamatan': 'saran',
  'batas-kerahasiaan': 'saran',
};

export function choiceIconFor(skillId: CounselorSkillId): ChoiceIconId {
  return CHOICE_ICON_FOR[skillId];
}

export type CardPhase = 'diam' | 'dipilih' | 'selesai';

export interface CardState {
  phase: CardPhase;
  chosenIndex: number | null;
}

export type CardEvent =
  | { type: 'aktifkan'; index: number }
  | { type: 'tunda-selesai' }
  | { type: 'reset' };

export interface CardResult extends CardState {
  commit: boolean;
}

export const INITIAL_CARD_STATE: CardState = { phase: 'diam', chosenIndex: null };

/** Reducer kartu: aktivasi ganda diabaikan; commit true paling banyak sekali per reset. */
export function cardReduce(state: CardState, event: CardEvent): CardResult {
  if (event.type === 'reset') {
    return { phase: 'diam', chosenIndex: null, commit: false };
  }
  if (state.phase === 'diam' && event.type === 'aktifkan') {
    return { phase: 'dipilih', chosenIndex: event.index, commit: false };
  }
  if (state.phase === 'dipilih' && event.type === 'tunda-selesai') {
    return { phase: 'selesai', chosenIndex: state.chosenIndex, commit: true };
  }
  return { ...state, commit: false };
}

export const CHOICE_COMMIT_DELAY_MS = 240;

export function commitDelayMs(reduced: boolean): number {
  return reduced ? 0 : CHOICE_COMMIT_DELAY_MS;
}
