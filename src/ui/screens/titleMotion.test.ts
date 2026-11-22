import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../../engine/rng';
import { MAX_SPARKLES, letterBounceDelays, sparkleSpecs } from './titleMotion';

const ITER = 200;
const ALPHABET = ['a', 'B', ' ', 'é', '学', '😀', '7'];

function randText(rng: () => number): string {
  const n = Math.floor(rng() * 30);
  let s = '';
  for (let i = 0; i < n; i++) s += ALPHABET[Math.floor(rng() * ALPHABET.length)];
  return s;
}

test('Feature: game-juice-upgrade, Property 31: Jeda pantul huruf logo tak menurun', () => {
  // **Validates: Requirements 10.1**
  const rng = mulberry32(3101);
  for (let i = 0; i < ITER; i++) {
    const text = randText(rng);
    const step = rng() * 200 - 20;
    const d = letterBounceDelays(text, step);
    assert.equal(d.length, Array.from(text).length);
    for (let j = 0; j < d.length; j++) {
      assert.ok(d[j] >= 0);
      if (j > 0) assert.ok(d[j] >= d[j - 1]);
    }
  }
  assert.deepEqual(letterBounceDelays('abc', NaN), [0, 0, 0]);
});

test('Feature: game-juice-upgrade, Property 32: Kilau Layar Awal terbatas dan deterministik', () => {
  // **Validates: Requirements 10.2**
  const rng = mulberry32(3201);
  for (let i = 0; i < ITER; i++) {
    const seed = Math.floor(rng() * 1e9);
    const count = Math.floor(rng() * 40) - 5;
    const a = sparkleSpecs(seed, count);
    const b = sparkleSpecs(seed, count);
    assert.deepEqual(a, b);
    assert.ok(a.length <= MAX_SPARKLES);
    for (const s of a) {
      for (const v of Object.values(s)) assert.ok(Number.isFinite(v));
    }
  }
});
