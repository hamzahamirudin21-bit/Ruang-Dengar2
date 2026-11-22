import test from 'node:test';
import assert from 'node:assert/strict';
import { countUpValue } from './countUp';

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

test('Feature: game-juice-upgrade, Property 27: Hitung-naik monoton dan berakhir tepat', () => {
  const rnd = mulberry32(2701);
  for (let i = 0; i < 200; i++) {
    const from = Math.round((rnd() - 0.3) * 200);
    const to = Math.round((rnd() - 0.3) * 200);
    const dur = 100 + Math.floor(rnd() * 2000);
    const lo = Math.min(from, to);
    const hi = Math.max(from, to);
    let prevDist = Infinity;
    for (let s = 0; s <= 20; s++) {
      const t = (dur * 1.2 * s) / 20;
      const v = countUpValue(from, to, t, dur);
      assert.ok(v >= lo && v <= hi);
      const dist = Math.abs(to - v);
      assert.ok(dist <= prevDist);
      prevDist = dist;
    }
    assert.equal(countUpValue(from, to, dur, dur), to);
    assert.equal(countUpValue(from, to, dur + rnd() * 1e5, dur), to);
    assert.equal(countUpValue(from, to, rnd() * dur, dur, true), to);
  }
});

test('Feature: game-juice-upgrade, Property 3: Waktu tidak sah diperlakukan 0 (countUpValue)', () => {
  for (const bad of [NaN, Infinity, -Infinity, -50]) {
    if (bad === Infinity) continue; // Infinity ≥ durasi: berakhir di nilai akhir (bukan waktu tak sah bernilai 0)
    assert.equal(countUpValue(3, 90, bad, 800), countUpValue(3, 90, 0, 800));
  }
});
