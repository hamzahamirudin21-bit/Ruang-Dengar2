import test from 'node:test';
import assert from 'node:assert/strict';
import {
  WORK_START_MINUTES,
  createInitialClock,
  formatClockTime,
  setClockPaused,
  setClockSpeed,
  tickClock,
} from './clock';

test('jam awal mulai Hari 1 pukul 08:00 dan melaju 5 menit per detik nyata pada 1x', () => {
  const c0 = createInitialClock(1, false);
  assert.equal(c0.day, 1);
  assert.equal(formatClockTime(c0.minutesOfDay), '08:00');

  const c1 = tickClock(c0, 1);
  assert.equal(c1.minutesOfDay, WORK_START_MINUTES + 5);
  assert.equal(formatClockTime(c1.minutesOfDay), '08:05');

  const c2 = tickClock(c0, 12);
  assert.equal(formatClockTime(c2.minutesOfDay), '09:00');
});

test('kecepatan 2x dan 4x menggandakan laju jam dengan tepat', () => {
  const c2x = setClockSpeed(createInitialClock(1, false), 2);
  const after2x = tickClock(c2x, 3); // 3 * 5 * 2 = 30 menit
  assert.equal(formatClockTime(after2x.minutesOfDay), '08:30');

  const c4x = setClockSpeed(createInitialClock(1, false), 4);
  const after4x = tickClock(c4x, 3); // 3 * 5 * 4 = 60 menit
  assert.equal(formatClockTime(after4x.minutesOfDay), '09:00');
});

test('mode jeda menghentikan laju waktu simulasi', () => {
  const pausedClock = setClockPaused(createInitialClock(4, false), true);
  const ticked = tickClock(pausedClock, 10);
  assert.equal(ticked.day, 1);
  assert.equal(ticked.minutesOfDay, WORK_START_MINUTES);
});

test('melewati pukul 16:00 mengganti hari dan mengembalikan jam ke 08:00', () => {
  const c0 = createInitialClock(1, false);
  // 8 jam kerja = 480 menit = 96 detik pada 1x
  const nextDay = tickClock(c0, 96);
  assert.equal(nextDay.day, 2);
  assert.equal(formatClockTime(nextDay.minutesOfDay), '08:00');

  // 97 detik = Hari 2 pukul 08:05
  const nextDayPlus = tickClock(c0, 97);
  assert.equal(nextDayPlus.day, 2);
  assert.equal(formatClockTime(nextDayPlus.minutesOfDay), '08:05');
});
