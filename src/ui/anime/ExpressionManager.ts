import type { StoryExpression } from '../../engine/story/storyTypes';
import type { AnimeExpressionId } from './CharacterAssetManager';
import { getDesignBibleEntry } from './characterDesignBible';

export const ANIME_EXPRESSION_IDS: readonly AnimeExpressionId[] = [
  'neutral',
  'happy',
  'laughing',
  'excited',
  'thinking',
  'curious',
  'confused',
  'surprised',
  'worried',
  'sad',
  'tired',
  'frustrated',
  'confident',
  'serious',
  'shy',
  'reassuring',
];

export interface ExpressionSpec {
  expressionId: AnimeExpressionId;
  eyeShape: string;
  eyebrowPosition: string;
  mouthShape: string;
  headAngleDeg: number;
  gazeDirection: 'center' | 'up-right' | 'down' | 'aside';
}

export const EXPRESSION_LIBRARY: Readonly<Record<AnimeExpressionId, ExpressionSpec>> = {
  neutral: { expressionId: 'neutral', eyeShape: 'normal', eyebrowPosition: 'relaxed', mouthShape: 'calm', headAngleDeg: 0, gazeDirection: 'center' },
  happy: { expressionId: 'happy', eyeShape: 'soft-smile', eyebrowPosition: 'lifted', mouthShape: 'warm-smile', headAngleDeg: 1.0, gazeDirection: 'center' },
  laughing: { expressionId: 'laughing', eyeShape: 'crescent-closed', eyebrowPosition: 'high', mouthShape: 'open-laugh', headAngleDeg: -1.8, gazeDirection: 'center' },
  excited: { expressionId: 'excited', eyeShape: 'bright-wide', eyebrowPosition: 'high', mouthShape: 'bright-open', headAngleDeg: -1.2, gazeDirection: 'center' },
  thinking: { expressionId: 'thinking', eyeShape: 'narrow-focus', eyebrowPosition: 'asymmetric', mouthShape: 'pursed', headAngleDeg: 2.2, gazeDirection: 'up-right' },
  curious: { expressionId: 'curious', eyeShape: 'attentive', eyebrowPosition: 'raised-one', mouthShape: 'slight-open', headAngleDeg: 3.0, gazeDirection: 'center' },
  confused: { expressionId: 'confused', eyeShape: 'uncertain', eyebrowPosition: 'knitted-up', mouthShape: 'wavy', headAngleDeg: -2.2, gazeDirection: 'aside' },
  surprised: { expressionId: 'surprised', eyeShape: 'wide-open', eyebrowPosition: 'very-high', mouthShape: 'o-shape', headAngleDeg: -1.6, gazeDirection: 'center' },
  worried: { expressionId: 'worried', eyeShape: 'soft-tense', eyebrowPosition: 'slanted-up', mouthShape: 'tight-down', headAngleDeg: 1.8, gazeDirection: 'down' },
  sad: { expressionId: 'sad', eyeShape: 'downcast', eyebrowPosition: 'drooped', mouthShape: 'sad-curve', headAngleDeg: 2.8, gazeDirection: 'down' },
  tired: { expressionId: 'tired', eyeShape: 'half-lidded', eyebrowPosition: 'low', mouthShape: 'sigh', headAngleDeg: 2.0, gazeDirection: 'down' },
  frustrated: { expressionId: 'frustrated', eyeShape: 'sharp-tense', eyebrowPosition: 'furrowed', mouthShape: 'grit', headAngleDeg: -1.8, gazeDirection: 'center' },
  confident: { expressionId: 'confident', eyeShape: 'steady', eyebrowPosition: 'firm', mouthShape: 'confident-smirk', headAngleDeg: -0.8, gazeDirection: 'center' },
  serious: { expressionId: 'serious', eyeShape: 'focused', eyebrowPosition: 'flat-firm', mouthShape: 'straight', headAngleDeg: 0, gazeDirection: 'center' },
  shy: { expressionId: 'shy', eyeShape: 'averted-soft', eyebrowPosition: 'gentle-up', mouthShape: 'shy-smile', headAngleDeg: 3.0, gazeDirection: 'aside' },
  reassuring: { expressionId: 'reassuring', eyeShape: 'warm-gentle', eyebrowPosition: 'soft-lifted', mouthShape: 'gentle-smile', headAngleDeg: 1.0, gazeDirection: 'center' },
};

/**
 * ExpressionManager — Memetakan ekspresi cerita ke 16 ekspresi wajah anime
 * dan menyediakan path aset `public/assets/anime-characters/<slug>/expressions/<slug>_expression_<id>.png`.
 */
export class ExpressionManager {
  public mapStoryExpression(expr: StoryExpression): AnimeExpressionId {
    switch (expr) {
      case 'tersenyum': return 'happy';
      case 'lega': return 'reassuring';
      case 'terkejut': return 'surprised';
      case 'tertegun': return 'thinking';
      case 'cemas': return 'worried';
      case 'menunduk': return 'sad';
      case 'lelah': return 'tired';
      case 'kesal': return 'frustrated';
      case 'menutup-diri': return 'shy';
      case 'waspada': return 'serious';
      case 'netral':
      default:
        return 'neutral';
    }
  }

  public getExpressionAssetPath(characterId: string, expressionId: AnimeExpressionId): string | null {
    const entry = getDesignBibleEntry(characterId);
    if (!entry) return null;
    return `/assets/anime-characters/${entry.slug}/expressions/${entry.slug}_expression_${expressionId}.png`;
  }

  public getSpec(expressionId: AnimeExpressionId): ExpressionSpec {
    return EXPRESSION_LIBRARY[expressionId] ?? EXPRESSION_LIBRARY.neutral;
  }
}

export const sharedExpressionManager = new ExpressionManager();
