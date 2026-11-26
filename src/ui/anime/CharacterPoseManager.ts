import { getDesignBibleEntry } from './characterDesignBible';
import { POSE_CATALOG, type PoseId } from '../characters/poseCatalog';

const POSE_SUFFIX_BY_ID: Readonly<Record<PoseId, string>> = {
  P01: '01_neutral',
  P02: '02_smile',
  P03: '03_laugh',
  P04: '04_excited',
  P05: '05_thinking',
  P06: '06_curious',
  P07: '07_confused',
  P08: '08_surprised',
  P09: '09_worried',
  P10: '10_sad',
  P11: '11_exhausted',
  P12: '12_frustrated',
  P13: '13_confident',
  P14: '14_explaining',
  P15: '15_pointing',
  P16: '16_open_invitation',
  P17: '17_listening',
  P18: '18_reassuring',
  P19: '19_shy',
  P20: '20_serious_focus',
};

export interface ManagedPoseSelection {
  characterId: string;
  poseId: PoseId;
  assetPath: string;
  fallbackPortraitPath: string;
  title: string;
  emotion: string;
}

/**
 * CharacterPoseManager — Mengelola pemetaan pose P01..P20 ke path aset
 * `public/assets/anime-characters/<slug>/poses/<slug>_pose_XX_name.png`
 * serta menjaga konsistensi state pose aktif tiap karakter.
 */
export class CharacterPoseManager {
  private activePoseByCharacter = new Map<string, PoseId>();

  public getPoseAssetPath(characterId: string, poseId: PoseId): string | null {
    const entry = getDesignBibleEntry(characterId);
    const suffix = POSE_SUFFIX_BY_ID[poseId];
    if (!entry || !suffix) return null;
    return `/assets/anime-characters/${entry.slug}/poses/${entry.slug}_pose_${suffix}.png`;
  }

  public selectPose(characterId: string, poseId: PoseId): ManagedPoseSelection | null {
    const entry = getDesignBibleEntry(characterId);
    const meta = POSE_CATALOG.find((p) => p.poseId === poseId);
    const assetPath = this.getPoseAssetPath(characterId, poseId);
    if (!entry || !meta || !assetPath) return null;

    this.activePoseByCharacter.set(characterId, poseId);
    return {
      characterId,
      poseId,
      assetPath,
      fallbackPortraitPath: entry.sourcePortraitPath,
      title: meta.title,
      emotion: meta.emotion,
    };
  }

  public getCurrentPose(characterId: string): PoseId {
    return this.activePoseByCharacter.get(characterId) ?? 'P01';
  }
}

export const sharedPoseManager = new CharacterPoseManager();
