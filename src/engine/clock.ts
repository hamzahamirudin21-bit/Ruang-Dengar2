import { ClockState, SimulationSpeed } from '../types';

export const WORK_START_MINUTES = 8 * 60; // 08:00 (480)
export const WORK_END_MINUTES = 16 * 60; // 16:00 (960)
export const WORK_DAY_DURATION_MINUTES = WORK_END_MINUTES - WORK_START_MINUTES; // 480 menit
export const SIM_MINUTES_PER_REAL_SECOND_AT_1X = 5;

export function createInitialClock(
  speed: SimulationSpeed = 1,
  paused = false
): ClockState {
  return {
    day: 1,
    minutesOfDay: WORK_START_MINUTES,
    paused,
    speed,
  };
}

export function tickClock(clock: ClockState, realDeltaSeconds: number): ClockState {
  if (clock.paused || !Number.isFinite(realDeltaSeconds) || realDeltaSeconds <= 0) {
    return clock;
  }

  const addedSimMinutes =
    realDeltaSeconds * SIM_MINUTES_PER_REAL_SECOND_AT_1X * clock.speed;
  let nextDay = clock.day;
  let nextMinutes = clock.minutesOfDay + addedSimMinutes;

  while (nextMinutes >= WORK_END_MINUTES) {
    nextDay += 1;
    nextMinutes -= WORK_DAY_DURATION_MINUTES;
  }

  return {
    ...clock,
    day: nextDay,
    minutesOfDay: nextMinutes,
  };
}

export function setClockPaused(clock: ClockState, paused: boolean): ClockState {
  return { ...clock, paused };
}

export function setClockSpeed(clock: ClockState, speed: SimulationSpeed): ClockState {
  return { ...clock, speed };
}

export function formatClockTime(minutesOfDay: number): string {
  const clamped = Math.max(0, Math.floor(minutesOfDay));
  const hours = Math.floor(clamped / 60) % 24;
  const minutes = clamped % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function getDayProgressRatio(minutesOfDay: number): number {
  const ratio = (minutesOfDay - WORK_START_MINUTES) / WORK_DAY_DURATION_MINUTES;
  return Math.max(0, Math.min(1, ratio));
}
