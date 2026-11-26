import { CHARACTER_DESIGN_BIBLE } from './characterDesignBible';

export type HandGestureId =
  | 'H01_open_palm'
  | 'H02_pointing_index'
  | 'H03_holding_pen'
  | 'H04_holding_document'
  | 'H05_holding_smartphone'
  | 'H06_typing_keyboard'
  | 'H07_gripping_tool'
  | 'H08_holding_component'
  | 'H09_adjusting_equipment'
  | 'H10_explaining_gesture'
  | 'H11_writing'
  | 'H12_thumbs_up';

export interface HandGestureReferenceSpec {
  characterId: string;
  gestureId: HandGestureId;
  label: string;
  gripType: 'open' | 'point' | 'precision-grip' | 'power-grip' | 'keyboard-pose';
  wristContinuityCheck: boolean;
  fingerCount: 5;
  assetPath: string;
  qcStatus: 'pending-ai-generation' | 'approved';
}

export const HAND_GESTURE_CATALOG: readonly {
  id: HandGestureId;
  label: string;
  gripType: HandGestureReferenceSpec['gripType'];
}[] = [
  { id: 'H01_open_palm', label: 'Open Palm', gripType: 'open' },
  { id: 'H02_pointing_index', label: 'Pointing Index Finger', gripType: 'point' },
  { id: 'H03_holding_pen', label: 'Holding a Pen', gripType: 'precision-grip' },
  { id: 'H04_holding_document', label: 'Holding a Document', gripType: 'open' },
  { id: 'H05_holding_smartphone', label: 'Holding a Smartphone', gripType: 'precision-grip' },
  { id: 'H06_typing_keyboard', label: 'Typing on Keyboard', gripType: 'keyboard-pose' },
  { id: 'H07_gripping_tool', label: 'Gripping a Tool', gripType: 'power-grip' },
  { id: 'H08_holding_component', label: 'Holding Electronic Components', gripType: 'precision-grip' },
  { id: 'H09_adjusting_equipment', label: 'Adjusting Laboratory Equipment', gripType: 'precision-grip' },
  { id: 'H10_explaining_gesture', label: 'Explaining with Hand Gestures', gripType: 'open' },
  { id: 'H11_writing', label: 'Writing', gripType: 'precision-grip' },
  { id: 'H12_thumbs_up', label: 'Giving Thumbs Up', gripType: 'power-grip' },
];

/**
 * HandGestureLibrary — Pustaka referensi 12 gestur tangan × 18 karakter (216 spesifikasi,
 * memenuhi target minimum 10 × 18 = 180) dengan aturan QC anatomi 5 jari & kontinuitas pergelangan.
 */
export class HandGestureLibrary {
  private specs: readonly HandGestureReferenceSpec[];

  constructor() {
    const out: HandGestureReferenceSpec[] = [];
    for (const ch of CHARACTER_DESIGN_BIBLE) {
      for (const g of HAND_GESTURE_CATALOG) {
        out.push({
          characterId: ch.characterId,
          gestureId: g.id,
          label: g.label,
          gripType: g.gripType,
          wristContinuityCheck: true,
          fingerCount: 5,
          assetPath: `/assets/anime-characters/${ch.slug}/hands/${ch.slug}_${g.id}.png`,
          qcStatus: 'pending-ai-generation',
        });
      }
    }
    this.specs = out;
  }

  public listForCharacter(characterId: string): readonly HandGestureReferenceSpec[] {
    return this.specs.filter((s) => s.characterId === characterId);
  }

  public getTotalCount(): number {
    return this.specs.length;
  }
}

export const sharedHandGestureLibrary = new HandGestureLibrary();
