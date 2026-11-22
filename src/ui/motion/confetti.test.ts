import test from 'node:test';
import assert from 'node:assert/strict';
import { CONFETTI_LIFETIME_MS, CONFETTI_MAX, confettiPosition, confettiSpecs } from './confetti';

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('Feature: game-juice-upgrade, Property 28: Konfeti terbatas, deterministik, dan hilang', () => {
  const rnd = mulberry32(2801);
  for (let i = 0; i < 200; i++) {
    const seed = Math.floor(rnd() * 2 ** 32);
    const count = Math.floor(rnd() * 100) - 10;
    const a = confettiSpecs(seed, count);
    assert.ok(a.length <= CONFETTI_MAX);
    assert.deepEqual(a, confettiSpecs(seed, count));
    for (const spec of a) {
      for (const t of [0, rnd() * 3000, CONFETTI_LIFETIME_MS, CONFETTI_LIFETIME_MS + rnd() * 1e5]) {
        const p = confettiPosition(spec, t);
        assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.rot) && Number.isFinite(p.alpha));
        if (t >= CONFETTI_LIFETIME_MS) assert.equal(p.alpha, 0);
      }
    }
  }
});

test('Feature: game-juice-upgrade, Property 3: Waktu tidak sah diperlakukan 0 (confettiPosition)', () => {
  const [spec] = confettiSpecs(7, 1);
  for (const bad of [NaN, -Infinity, -1, -999.5]) {
    assert.deepEqual(confettiPosition(spec, bad), confettiPosition(spec, 0));
  }
});
