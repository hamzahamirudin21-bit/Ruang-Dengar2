import { MAX_FPS } from './motionTokens';

/** True bila sudah cukup waktu sejak bingkai sebelumnya untuk maju satu bingkai. */
export function shouldAdvanceFrame(prevMs: number, nowMs: number, maxFps: number = MAX_FPS): boolean {
  if (!Number.isFinite(nowMs)) return false;
  if (!Number.isFinite(prevMs)) return true;
  if (!(maxFps > 0)) return false;
  return nowMs - prevMs >= 1000 / maxFps;
}
