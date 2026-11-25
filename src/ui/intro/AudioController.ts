import { COMIC_STORY_PAGES, ComicPageBlueprint } from './StoryTimeline';
import {
  IntroSfxKind,
  isSfxEnabled,
  playIntroSfx,
  setSfxEnabled,
  startCozyBgm,
} from '../motion/sfx';

/**
 * Pengendali foley sinematik & musik latar untuk sistem komik animasi 6 halaman.
 */
export class AudioController {
  private firedKeys = new Set<string>();

  public syncAt(
    elapsedMs: number,
    pages: readonly ComicPageBlueprint[] = COMIC_STORY_PAGES
  ): void {
    for (const page of pages) {
      const pageEnd = page.startTimeMs + page.durationMs;
      if (elapsedMs < page.startTimeMs || elapsedMs > pageEnd) continue;

      if (page.ambientSfx) {
        this.triggerOnce(`page:${page.id}`, page.ambientSfx);
      }

      const pageElapsed = elapsedMs - page.startTimeMs;
      for (const panel of page.panels) {
        if (panel.sfxCue && pageElapsed >= panel.revealAtMs) {
          this.triggerOnce(`panel:${panel.id}`, panel.sfxCue);
        }
        for (const dlg of panel.dialogues) {
          if (pageElapsed >= dlg.startOffsetMs) {
            this.triggerOnce(`dlg:${dlg.id}`, 'comic-pop');
          }
        }
      }
    }
  }

  public triggerOnce(key: string, kind: IntroSfxKind): void {
    if (this.firedKeys.has(key)) return;
    this.firedKeys.add(key);
    playIntroSfx(kind);
  }

  public reset(): void {
    this.firedKeys.clear();
  }

  public isMuted(): boolean {
    return !isSfxEnabled();
  }

  public setMuted(muted: boolean): void {
    setSfxEnabled(!muted);
    if (!muted) {
      startCozyBgm();
    }
  }
}
