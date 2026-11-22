import type { StoryExpression } from '../../engine/story/storyTypes';

export type EmoteId = 'hati' | 'tanya' | 'keringat' | 'awan' | 'kilau' | 'seru';

/** Total atas 11 ekspresi; null = tanpa emote. Hanya bergantung pada ekspresi yang tampil. */
export const EMOTE_FOR: Record<StoryExpression, EmoteId | null> = {
  netral: null,
  'menutup-diri': null,
  lega: 'hati',
  tersenyum: 'kilau',
  tertegun: 'tanya',
  cemas: 'keringat',
  lelah: 'awan',
  menunduk: 'awan',
  waspada: 'seru',
  terkejut: 'seru',
  kesal: 'seru',
};

export function emoteFor(expression: StoryExpression): EmoteId | null {
  return EMOTE_FOR[expression] ?? null;
}

/** Emote muncul hanya saat ekspresi berubah dan ekspresi baru punya emote. */
export function shouldPopEmote(prev: StoryExpression | null, next: StoryExpression): boolean {
  if (prev === next) return false;
  return emoteFor(next) !== null;
}
