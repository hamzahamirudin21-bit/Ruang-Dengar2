import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../../engine/rng';
import {
  choiceColumns,
  choiceGrid,
  choicePlacement,
  coverCrop,
  dialogPanelHeight,
  stageHeight,
  stagePortraitScale,
} from './dialogLayout';

const ITER = 200;

test('Feature: game-ui-polish, Property 3: Tinggi panel percakapan', () => {
  const rng = mulberry32(103);
  for (let i = 0; i < ITER; i++) {
    const h = 1 + rng() * 3000;
    const p = dialogPanelHeight(h);
    assert.ok(Number.isInteger(p));
    assert.equal(p, Math.round(h * (h >= 600 ? 0.47 : 0.5)));
    assert.equal(stageHeight(h), h - p);
  }
  for (const bad of [0, -5, NaN, Infinity, -Infinity]) {
    assert.equal(dialogPanelHeight(bad), 0);
    assert.equal(stageHeight(bad), 0);
  }
  assert.equal(dialogPanelHeight(720), 338);
});

test('Feature: game-ui-polish, Property 4: Kolom grid pilihan', () => {
  const rng = mulberry32(104);
  for (let i = 0; i < ITER; i++) {
    const w = rng() * 1500;
    const n = Math.floor(rng() * 5);
    const cols = choiceColumns(w, n);
    assert.equal(cols === 2, w >= 640 && n >= 2);
    const grid = choiceGrid(w, n);
    assert.equal(grid.columns, cols);
    assert.equal(grid.rows, Math.ceil(n / cols));
  }
  assert.equal(choiceColumns(640, 2), 2);
  assert.equal(choiceColumns(639, 4), 1);
  assert.equal(choiceColumns(NaN, 4), 1);
});

test('Feature: game-ui-polish, Property 5: Penempatan pilihan baris-ke-baris', () => {
  for (const cols of [1, 2] as const) {
    for (let n = 1; n <= 4; n++) {
      const seen = new Set<string>();
      for (let i = 0; i < n; i++) {
        const { row, col } = choicePlacement(i, cols);
        assert.equal(row, Math.floor(i / cols));
        assert.equal(col, i % cols);
        assert.ok(!seen.has(`${row},${col}`));
        seen.add(`${row},${col}`);
        assert.equal(row * cols + col, i);
      }
    }
  }
});

test('Feature: game-ui-polish, Property 6: Potongan cover', () => {
  const rng = mulberry32(106);
  for (let i = 0; i < ITER; i++) {
    const sw = 1 + rng() * 2000;
    const sh = 1 + rng() * 2000;
    const dw = 1 + rng() * 2000;
    const dh = 1 + rng() * 2000;
    const c = coverCrop(sw, sh, dw, dh);
    const eps = 1e-6;
    assert.ok(c.sx >= -eps && c.sy >= -eps);
    assert.ok(c.sx + c.sw <= sw + eps && c.sy + c.sh <= sh + eps);
    assert.ok(Math.abs(c.sx - (sw - c.sw) / 2) < eps);
    assert.ok(Math.abs(c.sy - (sh - c.sh) / 2) < eps);
    // rasio sama dengan tujuan (toleransi satu piksel pada sisi potongan)
    assert.ok(Math.abs(c.sw - c.sh * (dw / dh)) <= 1);
  }
  for (const bad of [0, -1, NaN]) {
    assert.deepEqual(coverCrop(384, 216, bad, 100), { sx: 0, sy: 0, sw: 384, sh: 216 });
    assert.deepEqual(coverCrop(bad, 216, 100, 100).sx, 0);
  }
});

test('Feature: game-ui-polish, Property 7: Skala potret', () => {
  const rng = mulberry32(107);
  for (let i = 0; i < ITER; i++) {
    const width = 1 + Math.floor(rng() * 3000);
    const height = 1 + Math.floor(rng() * 2000);
    const s = stagePortraitScale({ width, height });
    assert.ok(Number.isInteger(s) && s >= 2 && s <= 7);
    const taller = stagePortraitScale({ width, height: height + Math.floor(rng() * 1500) });
    assert.ok(taller >= s);
  }
});
