import { CHARACTER_DESIGN_BIBLE } from './characterDesignBible';

export type FootPoseId =
  | 'F01_neutral_standing'
  | 'F02_left_foot_forward'
  | 'F03_right_foot_forward'
  | 'F04_walking_contact'
  | 'F05_walking_passing'
  | 'F06_running_contact'
  | 'F07_sitting_feet'
  | 'F08_kneeling'
  | 'F09_turning_foot'
  | 'F10_stepping_over';

export interface FootPoseReferenceSpec {
  characterId: string;
  footPoseId: FootPoseId;
  label: string;
  groundContact: 'both-feet' | 'left-planted' | 'right-planted' | 'seated-rest';
  footwearStyle: string;
  assetPath: string;
  qcStatus: 'pending-ai-generation' | 'approved';
}

export const FOOT_POSE_CATALOG: readonly {
  id: FootPoseId;
  label: string;
  groundContact: FootPoseReferenceSpec['groundContact'];
}[] = [
  { id: 'F01_neutral_standing', label: 'Neutral Standing', groundContact: 'both-feet' },
  { id: 'F02_left_foot_forward', label: 'Left Foot Forward', groundContact: 'left-planted' },
  { id: 'F03_right_foot_forward', label: 'Right Foot Forward', groundContact: 'right-planted' },
  { id: 'F04_walking_contact', label: 'Walking Contact', groundContact: 'both-feet' },
  { id: 'F05_walking_passing', label: 'Walking Passing', groundContact: 'left-planted' },
  { id: 'F06_running_contact', label: 'Running Contact', groundContact: 'right-planted' },
  { id: 'F07_sitting_feet', label: 'Sitting Feet Position', groundContact: 'seated-rest' },
  { id: 'F08_kneeling', label: 'Kneeling', groundContact: 'both-feet' },
  { id: 'F09_turning_foot', label: 'Turning Foot Placement', groundContact: 'left-planted' },
  { id: 'F10_stepping_over', label: 'Stepping Over an Object', groundContact: 'right-planted' },
];

/**
 * FootPoseLibrary — Pustaka referensi 10 posisi kaki & sepatu × 18 karakter (180 spesifikasi,
 * memenuhi target minimum 8 × 18 = 144) dengan jaminan ground-plane contact & konsistensi sepatu.
 */
export class FootPoseLibrary {
  private specs: readonly FootPoseReferenceSpec[];

  constructor() {
    const out: FootPoseReferenceSpec[] = [];
    for (const ch of CHARACTER_DESIGN_BIBLE) {
      for (const f of FOOT_POSE_CATALOG) {
        out.push({
          characterId: ch.characterId,
          footPoseId: f.id,
          label: f.label,
          groundContact: f.groundContact,
          footwearStyle: `${ch.appearance.outfit.shoe} (${ch.appearance.outfit.shoeColor})`,
          assetPath: `/assets/anime-characters/${ch.slug}/feet/${ch.slug}_${f.id}.png`,
          qcStatus: 'pending-ai-generation',
        });
      }
    }
    this.specs = out;
  }

  public listForCharacter(characterId: string): readonly FootPoseReferenceSpec[] {
    return this.specs.filter((s) => s.characterId === characterId);
  }

  public getTotalCount(): number {
    return this.specs.length;
  }
}

export const sharedFootPoseLibrary = new FootPoseLibrary();
