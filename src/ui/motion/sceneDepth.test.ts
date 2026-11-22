import test from 'node:test';
import assert from 'node:assert/strict';
import { BACKDROP_BLUR_PX, DUST_MAX, PARALLAX_PERIOD_MS, dustSpecs, parallaxOffsetPx } from './sceneDepth';

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BAD_TIMES = [NaN, Infinity, -Infinity, -1, -12345.5];

test('BACKDROP_BLUR_PX tidak lebih dari 1.5', () => {
  assert.ok(BACKDROP_BLUR_PX <= 1.5);
});

test('Feature: game-juice-upgrade, Property 23: Parallax terbatas dan periodik', () => {
  const rnd = mulberry32(2301);
  for (let i = 0; i < 200; i++) {
    const t = rnd() * 1e6;
    const v = parallaxOffsetPx(t, false);
    assert.ok(Number.isFinite(v) && Math.abs(v) <= 4);
    assert.ok(Math.abs(v - parallaxOffsetPx(t + PARALLAX_PERIOD_MS, false)) < 1e-6);
    assert.equal(parallaxOffsetPx(t, true), 0);
  }
});

test('Feature: game-juice-upgrade, Property 24: Debu terbatas dan deterministik', () => {
  const rnd = mulberry32(2401);
  for (let i = 0; i < 200; i++) {
    const seed = Math.floor(rnd() * 2 ** 32);
    const count = Math.floor(rnd() * 60) - 10;
    const a = dustSpecs(seed, count, false);
    assert.ok(a.length <= DUST_MAX);
    assert.deepEqual(a, dustSpecs(seed, count, false));
    for (const d of a) for (const v of Object.values(d)) assert.ok(Number.isFinite(v));
    assert.deepEqual(dustSpecs(seed, count, true), []);
  }
});

test('Feature: game-juice-upgrade, Property 3: Waktu tidak sah diperlakukan 0 (parallaxOffsetPx)', () => {
  for (const bad of BAD_TIMES) {
    assert.equal(parallaxOffsetPx(bad, false), parallaxOffsetPx(0, false));
  }
});
