import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../../engine/rng';
import { bubbleTail, TAIL_INSET_PX } from './bubbleLayout';

const ITER = 200;

test('Feature: game-juice-upgrade, Property 15: Geometri ekor gelembung', () => {
  const rng = mulberry32(1501);
  for (let i = 0; i < ITER; i++) {
    const inset = TAIL_INSET_PX;
    const width = 2 * inset + 1 + rng() * 800;
    const left = rng() * 1000 - 200;
    const speaker = rng() * 1800 - 400;
    const t = bubbleTail(width, speaker, left);
    assert.ok(t.visible);
    assert.ok(t.xPx >= inset && t.xPx <= width - inset);
    const bubbleCenter = left + width / 2;
    if (speaker < bubbleCenter) assert.ok(t.xPx <= width / 2);
    if (speaker > bubbleCenter) assert.ok(t.xPx >= width / 2);
  }
});

test('bubbleTail: gelembung terlalu sempit menyembunyikan ekor', () => {
  const t = bubbleTail(2 * TAIL_INSET_PX, 100, 0);
  assert.equal(t.visible, false);
  assert.equal(t.xPx, TAIL_INSET_PX);
});
