import {
  CHARACTER_DESIGN_BIBLE,
  getDesignBibleEntry,
  type CharacterDesignBibleEntry,
} from './characterDesignBible';

export type AnimeExpressionId =
  | 'neutral'
  | 'happy'
  | 'laughing'
  | 'excited'
  | 'thinking'
  | 'curious'
  | 'confused'
  | 'surprised'
  | 'worried'
  | 'sad'
  | 'tired'
  | 'frustrated'
  | 'confident'
  | 'serious'
  | 'shy'
  | 'reassuring';

export type AnimeSequenceKind = 'idle' | 'walking' | 'talking' | 'gestures';

export interface AnimeAssetRecord {
  id: string;
  assetPath: string;
  width: number;
  height: number;
  anchor: 'bottom-center';
  available: boolean;
}

export interface AnimeCharacterManifest {
  characterId: string;
  slug: string;
  name: string;
  masterReferencePath: string;
  poses: Record<string, AnimeAssetRecord>;
  expressions: Record<AnimeExpressionId, AnimeAssetRecord>;
  animations: Record<AnimeSequenceKind, readonly AnimeAssetRecord[]>;
}

export interface MasterAnimeManifest {
  version: 1;
  totalCharacters: number;
  characters: Record<string, AnimeCharacterManifest>;
}

const ANIME_MASTER_MANIFEST_URL = '/assets/anime-characters/manifest.json';

/**
 * CharacterAssetManager — Pengelola lazy-loading, caching, dan fallback aman
 * untuk seluruh aset full-body anime di `public/assets/anime-characters/<slug>/`.
 */
export class CharacterAssetManager {
  private manifestPromise: Promise<MasterAnimeManifest | null> | null = null;
  private imageCache = new Map<string, HTMLImageElement>();
  private inflight = new Map<string, Promise<HTMLImageElement | null>>();
  private failedUrls = new Set<string>();
  private listeners = new Set<() => void>();

  public onAssetReady(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notify(): void {
    for (const fn of this.listeners) {
      try {
        fn();
      } catch {
        /* abaikan error listener */
      }
    }
  }

  public async loadManifest(): Promise<MasterAnimeManifest | null> {
    if (this.manifestPromise) return this.manifestPromise;
    if (typeof fetch === 'undefined') return null;

    this.manifestPromise = fetch(ANIME_MASTER_MANIFEST_URL)
      .then((res) => (res.ok ? (res.json() as Promise<MasterAnimeManifest>) : null))
      .catch(() => null);
    return this.manifestPromise;
  }

  public getCachedImage(url: string | null | undefined): HTMLImageElement | null {
    if (!url) return null;
    return this.imageCache.get(url) ?? null;
  }

  public hasFailed(url: string): boolean {
    return this.failedUrls.has(url);
  }

  public loadImage(url: string): Promise<HTMLImageElement | null> {
    if (!url || this.failedUrls.has(url)) return Promise.resolve(null);
    const hit = this.imageCache.get(url);
    if (hit) return Promise.resolve(hit);

    const pending = this.inflight.get(url);
    if (pending) return pending;

    if (typeof Image === 'undefined') return Promise.resolve(null);

    const promise = new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.imageCache.set(url, img);
        this.inflight.delete(url);
        this.notify();
        resolve(img);
      };
      img.onerror = () => {
        this.failedUrls.add(url);
        this.inflight.delete(url);
        resolve(null);
      };
      img.src = url;
    });

    this.inflight.set(url, promise);
    return promise;
  }

  public async preloadCharacterActiveAssets(
    characterId: string,
    poseFiles: readonly string[] = ['01_neutral', '02_smile', '14_explaining', '17_listening']
  ): Promise<void> {
    const entry: CharacterDesignBibleEntry | null = getDesignBibleEntry(characterId);
    if (!entry) return;
    const urls = poseFiles.map(
      (suffix) => `/assets/anime-characters/${entry.slug}/poses/${entry.slug}_pose_${suffix}.png`
    );
    await Promise.all(urls.map((u) => this.loadImage(u)));
  }

  public getAllBibleEntries(): readonly CharacterDesignBibleEntry[] {
    return CHARACTER_DESIGN_BIBLE;
  }
}

export const sharedAnimeAssetManager = new CharacterAssetManager();
