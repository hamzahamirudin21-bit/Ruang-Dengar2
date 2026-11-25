import { COMIC_INTRO_BEATS, ComicIntroBeat } from './comicIntroData';
import { IntroSfxKind, isSfxEnabled, playIntroSfx, setSfxEnabled, startCozyBgm } from '../motion/sfx';

/**
 * Pengelola sinkronisasi audio pembuka komik.
 * Memastikan setiap efek suara beat, panel, dan balon dialog hanya dipicu satu kali per siklus,
 * serta dapat di-reset bersih saat tombol Replay ditekan (tanpa duplikasi audio).
 */
export class IntroAudioManager {
  private firedKeys = new Set<string>();

  public syncAt(elapsedMs: number, beats: readonly ComicIntroBeat[] = COMIC_INTRO_BEATS): void {
    for (const beat of beats) {
      const beatEnd = beat.startTimeMs + beat.durationMs;
      if (elapsedMs < beat.startTimeMs || elapsedMs > beatEnd) continue;

      if (beat.ambientSfx) {
        this.triggerOnce(`beat:${beat.id}`, beat.ambientSfx);
      }

      const beatElapsed = elapsedMs - beat.startTimeMs;
      for (const panel of beat.panels) {
        if (panel.sfxOnReveal && beatElapsed >= panel.revealOffsetMs) {
          this.triggerOnce(`panel:${panel.id}`, panel.sfxOnReveal);
        }
      }

      for (const dlg of beat.dialogues) {
        if (elapsedMs >= dlg.startTime) {
          this.triggerOnce(`dlg:${dlg.id}`, 'comic-pop');
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
