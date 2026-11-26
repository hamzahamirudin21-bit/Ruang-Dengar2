import { sharedEnvironmentAssetManager, type EnvironmentPropAsset } from './EnvironmentAssetManager';

export type SceneCompositionLayerId =
  | 'background'
  | 'midground'
  | 'characters'
  | 'foreground'
  | 'props'
  | 'lighting'
  | 'particles'
  | 'motion-effects'
  | 'dialogue-ui'
  | 'comic-effects';

export const SCENE_COMPOSITION_LAYERS: readonly SceneCompositionLayerId[] = [
  'background',
  'midground',
  'characters',
  'foreground',
  'props',
  'lighting',
  'particles',
  'motion-effects',
  'dialogue-ui',
  'comic-effects',
];

export type CharacterRigLayerId =
  | 'head'
  | 'hair-front'
  | 'hair-back'
  | 'torso'
  | 'upper-arm-left'
  | 'forearm-left'
  | 'hand-left'
  | 'upper-arm-right'
  | 'forearm-right'
  | 'hand-right'
  | 'pelvis'
  | 'thigh-left'
  | 'lower-leg-left'
  | 'foot-left'
  | 'thigh-right'
  | 'lower-leg-right'
  | 'foot-right'
  | 'accessories';

export const CHARACTER_RIG_LAYERS: readonly CharacterRigLayerId[] = [
  'hair-back',
  'pelvis',
  'thigh-left',
  'lower-leg-left',
  'foot-left',
  'thigh-right',
  'lower-leg-right',
  'foot-right',
  'upper-arm-left',
  'forearm-left',
  'hand-left',
  'torso',
  'head',
  'hair-front',
  'upper-arm-right',
  'forearm-right',
  'hand-right',
  'accessories',
];

export class SceneAssetManager {
  public getPropsForZone(zoneId: string): readonly EnvironmentPropAsset[] {
    return sharedEnvironmentAssetManager.listByZone(zoneId);
  }

  public getLayerOrder(): readonly SceneCompositionLayerId[] {
    return SCENE_COMPOSITION_LAYERS;
  }
}

export class CharacterRigController {
  /**
   * Memilih mode animasi aman berdasarkan hasil QC:
   * - Hanya mengizinkan skeletal rig bila layer sambungan anatomi lulus QC.
   * - Selain itu, gunakan aset utuh (frame-by-frame / approved portrait / sprite) tanpa memotong anggota tubuh.
   */
  public resolveSafeAnimationMode(hasApprovedRigLayers: boolean): 'skeletal-rig' | 'whole-asset-sequence' {
    return hasApprovedRigLayers ? 'skeletal-rig' : 'whole-asset-sequence';
  }

  public getRequiredRigLayers(): readonly CharacterRigLayerId[] {
    return CHARACTER_RIG_LAYERS;
  }
}

export interface CameraKeyframeSpec {
  timeMs: number;
  zoom: number;
  panX: number;
  panY: number;
}

export class CameraTimeline {
  private keys: readonly CameraKeyframeSpec[];

  constructor(keys: readonly CameraKeyframeSpec[]) {
    this.keys = [...keys].sort((a, b) => a.timeMs - b.timeMs);
  }

  public evaluate(timeMs: number): CameraKeyframeSpec {
    if (this.keys.length === 0) return { timeMs, zoom: 1, panX: 0, panY: 0 };
    if (timeMs <= this.keys[0].timeMs) return this.keys[0];
    const last = this.keys[this.keys.length - 1];
    if (timeMs >= last.timeMs) return last;

    for (let i = 0; i < this.keys.length - 1; i += 1) {
      const a = this.keys[i];
      const b = this.keys[i + 1];
      if (timeMs >= a.timeMs && timeMs <= b.timeMs) {
        const span = Math.max(1, b.timeMs - a.timeMs);
        const u = (timeMs - a.timeMs) / span;
        return {
          timeMs,
          zoom: a.zoom + (b.zoom - a.zoom) * u,
          panX: a.panX + (b.panX - a.panX) * u,
          panY: a.panY + (b.panY - a.panY) * u,
        };
      }
    }
    return last;
  }
}

export class MotionGraphicEngine {
  public readonly sceneAssets = new SceneAssetManager();
  public readonly rigController = new CharacterRigController();
}

export const sharedMotionGraphicEngine = new MotionGraphicEngine();
