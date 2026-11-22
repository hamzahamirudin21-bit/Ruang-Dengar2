/**
 * Model HUD halaman simulasi (murni, tanpa DOM).
 * Hanya memakai nilai yang sudah tampil sekarang; tidak menyentuh src/engine/**.
 */
import { badgeFractionText, badgeValueText, meterFraction, meterTone, meterPercentText } from '../components/game/gameTheme';
import type { MeterTone } from '../components/game/gameTheme';
import { hudIconFor } from '../components/game/hudIcons';
import type { HudBadgeKey, HudIconId } from '../components/game/hudIcons';

export interface HudLabels {
  day: string;
  labTime: string;
  missionsDone: string;
  activeStudents: string;
}

export interface SpeedLabels {
  pause: string;
  resume: string;
  speedLabel: (speed: number) => string;
}

export interface MeterLabels {
  energy: string;
  stress: string;
}

export interface HudBadgeModel {
  key: HudBadgeKey;
  icon: HudIconId;
  value: string;
  label: string;
}

export interface HudInput {
  day: number;
  /** Teks jam yang sudah diformat oleh pemanggil. */
  clockText: string;
  missionsDone: number;
  missionsTotal: number;
  activeStudents: number;
}

export function buildHudBadges(input: HudInput, labels: HudLabels): readonly HudBadgeModel[] {
  const make = (key: HudBadgeKey, value: string, label: string): HudBadgeModel => ({
    key,
    icon: hudIconFor(key),
    value,
    label,
  });
  return [
    make('hari', badgeValueText(input.day), labels.day),
    make('jam-lab', input.clockText, labels.labTime),
    make('misi-selesai', badgeFractionText(input.missionsDone, input.missionsTotal), labels.missionsDone),
    make('mahasiswa-aktif', badgeValueText(input.activeStudents), labels.activeStudents),
  ];
}

export interface SpeedControlModel {
  id: 'jeda' | 'putar' | `kecepatan-${number}`;
  icon: HudIconId;
  label: string;
  pressed: boolean;
  value: number | null;
}

/**
 * Satu kontrol jeda/lanjut (id 'jeda' saat berjalan, 'putar' saat dijeda) diikuti kontrol kecepatan.
 * Saat dijeda hanya kontrol jeda yang `pressed`; saat berjalan hanya kecepatan aktif yang `pressed`.
 */
export function buildSpeedControls(
  speeds: readonly number[],
  clock: { paused: boolean; speed: number },
  labels: SpeedLabels,
): readonly SpeedControlModel[] {
  const pauseControl: SpeedControlModel = clock.paused
    ? { id: 'putar', icon: hudIconFor('putar'), label: labels.resume, pressed: true, value: null }
    : { id: 'jeda', icon: hudIconFor('jeda'), label: labels.pause, pressed: false, value: null };
  const speedControls = speeds.map<SpeedControlModel>((speed) => ({
    id: `kecepatan-${speed}`,
    icon: hudIconFor('kecepatan'),
    label: labels.speedLabel(speed),
    pressed: !clock.paused && clock.speed === speed,
    value: speed,
  }));
  return [pauseControl, ...speedControls];
}

export interface MeterModel {
  key: 'energi' | 'stres';
  icon: HudIconId;
  label: string;
  value: number;
  max: number;
  fraction: number;
  tone: MeterTone;
  percentText: string;
  /** Energi: makin tinggi makin baik; stres: sebaliknya. */
  higherIsBetter: boolean;
}

export interface SelectedMeters {
  energy: MeterModel | null;
  stress: MeterModel | null;
}

function makeMeter(
  key: 'energi' | 'stres',
  value: number | undefined,
  max: number,
  label: string,
  higherIsBetter: boolean,
): MeterModel | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  const fraction = meterFraction(value, max);
  return {
    key,
    icon: hudIconFor(key),
    label,
    value,
    max,
    fraction,
    tone: meterTone(fraction, higherIsBetter),
    percentText: meterPercentText(fraction),
    higherIsBetter,
  };
}

/** Nilai yang tidak diberikan menghasilkan `null`, bukan angka bawaan. */
export function buildSelectedMeters(
  input: { energy?: number; stress?: number; max: number },
  labels: MeterLabels,
): SelectedMeters {
  return {
    energy: makeMeter('energi', input.energy, input.max, labels.energy, true),
    stress: makeMeter('stres', input.stress, input.max, labels.stress, false),
  };
}
