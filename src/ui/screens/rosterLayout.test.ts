import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../../engine/rng';
import { ROSTER_CHROME_HEIGHT, computeRosterLayout } from './rosterLayout';

const ITER = 300;

// Feature: ui-visual-overhaul, Property 23: Tata letak Daftar Karakter
// **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7**
test('Property 23: tata letak Daftar Karakter terhingga, kolom 2..6, muat satu layar bila diklaim', () => {
  const rng = mulberry32(23);
  for (let i = 0; i < ITER; i++) {
    const width = Math.floor(rng() * 4200) - 400;
    const height = Math.floor(rng() * 2600) - 300;
    const l = computeRosterLayout({ width, height }, 18);
    for (const v of [l.columns, l.rows, l.cardWidth, l.cardHeight, l.gap]) {
      assert.ok(Number.isFinite(v));
    }
    assert.ok(l.columns >= 2 && l.columns <= 6);
    if (l.fitsOneScreen) {
      assert.ok(l.rows * l.cardHeight + (l.rows - 1) * l.gap <= height - ROSTER_CHROME_HEIGHT);
      assert.ok(l.cardHeight >= 144);
      assert.ok(l.cardWidth >= 178);
    }
  }
  for (const vp of [{ width: 0, height: 0 }, { width: -5, height: -5 }, { width: NaN, height: Infinity }]) {
    const l = computeRosterLayout(vp, 18);
    assert.ok(l.columns >= 2 && l.columns <= 6);
    assert.ok(Number.isFinite(l.cardWidth) && Number.isFinite(l.cardHeight));
  }
});

test('laptop 1366×768 dan 1280×720 memuat 18 kartu dalam satu layar (6×3)', () => {
  for (const vp of [{ width: 1366, height: 768 }, { width: 1280, height: 720 }]) {
    const l = computeRosterLayout(vp, 18);
    assert.equal(l.fitsOneScreen, true);
    assert.equal(l.columns, 6);
    assert.equal(l.rows, 3);
    assert.ok(l.rows * l.cardHeight + (l.rows - 1) * l.gap <= vp.height - ROSTER_CHROME_HEIGHT);
  }
});

test('viewport kecil menghasilkan dua kolom dan tidak muat satu layar', () => {
  const l = computeRosterLayout({ width: 360, height: 640 }, 18);
  assert.equal(l.columns, 2);
  assert.equal(l.fitsOneScreen, false);
});
