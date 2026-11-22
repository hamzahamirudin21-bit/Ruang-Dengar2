import type { AgentActivityStatus, StudentAgent } from '../../types';

export interface StageSize {
  width: number;
  height: number;
}

export const PORTRAIT_SCALE_MIN = 2;
export const PORTRAIT_SCALE_MAX = 6;
export const NARROW_BREAKPOINT = 1024;

const PORTRAIT_W = 80;
const PORTRAIT_H = 96;

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Skala potret mahasiswa: bilangan bulat dalam [2, 6]. */
export function portraitScaleFor(stage: StageSize): number {
  const raw = Math.floor(
    Math.min((stage.height * 0.62) / PORTRAIT_H, (stage.width * 0.42) / PORTRAIT_W),
  );
  if (!Number.isFinite(raw)) return PORTRAIT_SCALE_MIN;
  return clampInt(raw, PORTRAIT_SCALE_MIN, PORTRAIT_SCALE_MAX);
}

/** Skala potret Dosen: tidak lebih besar dari skala mahasiswa, minimal 2. */
export function dosenPortraitScaleFor(studentScale: number): number {
  const base = Number.isFinite(studentScale) ? Math.floor(studentScale) : PORTRAIT_SCALE_MIN;
  const target = Math.min(base, Math.max(PORTRAIT_SCALE_MIN, base - 1));
  return clampInt(target, PORTRAIT_SCALE_MIN, PORTRAIT_SCALE_MAX);
}

export type StatusShape = 'lingkaran' | 'persegi' | 'belah-ketupat' | 'segitiga' | 'garis';

export interface StudentListRow {
  id: string;
  name: string;
  statusShape: StatusShape;
}

/** Pemetaan injektif: status aktivitas yang terlihat ke bentuk titik. */
export const STATUS_SHAPES: Readonly<Record<AgentActivityStatus, StatusShape>> = {
  bekerja: 'persegi',
  berpindah: 'segitiga',
  mengobrol: 'lingkaran',
  istirahat: 'belah-ketupat',
  menunggu: 'garis',
};

export function buildListRows(
  agents: readonly Pick<StudentAgent, 'id' | 'name' | 'status'>[],
): readonly StudentListRow[] {
  return agents.map((a) => ({ id: a.id, name: a.name, statusShape: STATUS_SHAPES[a.status] }));
}

export type PanelMode = 'terbuka' | 'diciutkan';

/** Preferensi eksplisit pengguna per panel; undefined = bawaan menurut lebar. */
export interface PanelPreference {
  left?: boolean;
  right?: boolean;
}

/**
 * Bawaan: diciutkan di bawah NARROW_BREAKPOINT, terbuka di layar lebar.
 * Preferensi pengguna (true = buka, false = ciutkan) selalu menang.
 */
export function sidePanelModes(
  viewportWidth: number,
  userPref: PanelPreference = {},
): { left: PanelMode; right: PanelMode } {
  const wide = viewportWidth >= NARROW_BREAKPOINT;
  const resolve = (pref: boolean | undefined): PanelMode => ((pref ?? wide) ? 'terbuka' : 'diciutkan');
  return { left: resolve(userPref.left), right: resolve(userPref.right) };
}
