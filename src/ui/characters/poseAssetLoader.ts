import {
  CHARACTER_POSE_PROFILES,
  POSE_CATALOG,
  getPoseAssetPath,
  type PoseId,
} from './poseCatalog';

export interface PoseAssetMetadata {
  characterId: string;
  poseId: PoseId;
  expression: string;
  emotion: string;
  assetPath: string;
  anchor: 'bottom-center';
  width: number;
  height: number;
  availability: boolean;
}

export interface CharacterPoseManifest {
  characterId: string;
  slug: string;
  name: string;
  poses: Record<PoseId, PoseAssetMetadata>;
}

export interface MasterPoseManifest {
  version: 1;
  totalCharacters: number;
  posesPerCharacter: number;
  totalAssets: number;
  characters: Record<string, CharacterPoseManifest>;
}

const MASTER_MANIFEST_URL = '/assets/characters/poses-manifest.json';

let masterManifestPromise: Promise<MasterPoseManifest | null> | null = null;
const loadedPoseImages = new Map<string, HTMLImageElement>();
const inflightPoseLoads = new Map<string, Promise<boolean>>();
const poseReadyListeners = new Set<() => void>();

export function onPoseAssetLoaded(cb: () => void): () => void {
  poseReadyListeners.add(cb);
  return () => {
    poseReadyListeners.delete(cb);
  };
}

function notifyPoseLoaded(): void {
  for (const fn of poseReadyListeners) {
    try {
      fn();
    } catch {
      /* abaikan error listener */
    }
  }
}

export async function loadMasterPoseManifest(): Promise<MasterPoseManifest | null> {
  if (masterManifestPromise) return masterManifestPromise;
  if (typeof fetch === 'undefined') return null;

  masterManifestPromise = fetch(MASTER_MANIFEST_URL)
    .then((res) => (res.ok ? (res.json() as Promise<MasterPoseManifest>) : null))
    .catch(() => null);

  return masterManifestPromise;
}

/** Memuat satu aset pose secara lazy dengan cache di memori (tidak memuat seluruh 360 sekaligus). */
export function loadPoseImage(assetPath: string): Promise<boolean> {
  if (loadedPoseImages.has(assetPath)) {
    return Promise.resolve(true);
  }
  const pending = inflightPoseLoads.get(assetPath);
  if (pending) return pending;

  if (typeof Image === 'undefined') {
    return Promise.resolve(false);
  }

  const p = new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => {
      loadedPoseImages.set(assetPath, img);
      inflightPoseLoads.delete(assetPath);
      notifyPoseLoaded();
      resolve(true);
    };
    img.onerror = () => {
      inflightPoseLoads.delete(assetPath);
      resolve(false);
    };
    img.src = assetPath;
  });

  inflightPoseLoads.set(assetPath, p);
  return p;
}

export function isPoseImageCached(assetPath: string | null): boolean {
  if (!assetPath) return false;
  return loadedPoseImages.has(assetPath);
}

/** Preload pose-pose prioritas hanya untuk karakter yang sedang aktif dalam sesi percakapan. */
export async function preloadActiveCharacterPoses(
  studentId: string,
  priorityPoses: readonly PoseId[] = ['P01', 'P02', 'P05', 'P14', 'P17', 'P18', 'P20']
): Promise<void> {
  const urls = priorityPoses
    .map((pid) => getPoseAssetPath(studentId, pid))
    .filter((u): u is string => Boolean(u));
  await Promise.all(urls.map((u) => loadPoseImage(u)));
}

/** Menghasilkan daftar seluruh 360 entri path aset untuk validasi/QC tanpa memuat gambarnya sekaligus. */
export function listAllExpectedPoseEntries(): PoseAssetMetadata[] {
  const out: PoseAssetMetadata[] = [];
  for (const prof of CHARACTER_POSE_PROFILES) {
    for (const pose of POSE_CATALOG) {
      const assetPath = getPoseAssetPath(prof.studentId, pose.poseId) ?? '';
      out.push({
        characterId: prof.studentId,
        poseId: pose.poseId,
        expression: pose.expression,
        emotion: pose.emotion,
        assetPath,
        anchor: 'bottom-center',
        width: 480,
        height: 600,
        availability: true,
      });
    }
  }
  return out;
}
