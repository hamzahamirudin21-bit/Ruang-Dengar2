import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../../engine/rng';
import { CHAR_POP_MS, charPopScale, typewriterState } from './typewriter';

const ITER = 200;
const ALPHABET = ['a', 'B', ' ', 'é', '字', '😀', '🎓', '\n', '7'];

function randText(rng: () => number): string {
  const n = Math.floor(rng() * 40);
  let s = '';
  for (let i = 0; i < n; i++) s += ALPHABET[Math.floor(rng() * ALPHABET.length)];
  return s;
}

test('Feature: game-juice-upgrade, Property 16: Mesin ketik menampilkan awalan teks asli', () => {
  const rng = mulberry32(1601);
  for (let i = 0; i < ITER; i++) {
    const text = randText(rng);
    const chars = Array.from(text);
    const cps = 1 + rng() * 120;
    let prev = 0;
    for (let t = 0; t <= 4000; t += 97) {
      const s = typewriterState(text, t, cps, false);
      assert.ok(s.visibleCount >= prev);
      prev = s.visibleCount;
      assert.equal(chars.slice(0, s.visibleCount).join(''), text.slice(0, chars.slice(0, s.visibleCount).join('').length));
      assert.ok(text.startsWith(chars.slice(0, s.visibleCount).join('')));
      assert.equal(s.done, s.visibleCount === chars.length);
    }
    const full = typewriterState(text, 1e9, cps, false);
    assert.equal(chars.slice(0, full.visibleCount).join(''), text);
    assert.ok(full.done);
    const red = typewriterState(text, 0, cps, true);
    assert.equal(red.visibleCount, chars.length);
    assert.ok(red.done);
  }
});

test('typewriter: waktu Infinity menampilkan seluruh teks', () => {
  const text = 'Halo 😀 dunia';
  const s = typewriterState(text, Infinity, 40, false);
  assert.equal(s.visibleCount, Array.from(text).length);
  assert.ok(s.done);
});

test('Feature: game-juice-upgrade, Property 17: Skala pop huruf terbatas', () => {
  const rng = mulberry32(1701);
  for (let i = 0; i < ITER; i++) {
    const ms = (rng() - 0.2) * CHAR_POP_MS * 3;
    const v = charPopScale(ms, false);
    assert.ok(v >= 1 && v <= 1.25 + 1e-9);
    if (ms >= CHAR_POP_MS || ms <= 0) assert.equal(v, 1);
    assert.equal(charPopScale(ms, true), 1);
  }
  assert.equal(charPopScale(Infinity, false), 1);
  assert.equal(charPopScale(NaN, false), 1);
});
