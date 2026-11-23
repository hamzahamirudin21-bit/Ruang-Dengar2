import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mulberry32, randomRange } from '../../engine/rng';
import { LAB_MAP } from '../../data/map';
import { computeFitCamera } from '../canvas/labRenderer';
import {
  MAX_SCALE,
  MIN_SCALE,
  clampCamera,
  coverFillScale,
  defaultScale,
  followCamera,
  zoomScale,
} from './cameraFollow';

const ITER = 200;
const worldW = LAB_MAP.width * LAB_MAP.tileSizePx;
const worldH = LAB_MAP.height * LAB_MAP.tileSizePx;

// Feature: ui-visual-overhaul, Property 20: Skala kamera bawaan dalam rentang
test('Property 20: defaultScale >= skala muat dan <= max(skala muat, 2.2)', () => {
  const rng = mulberry32(2020);
  for (let i = 0; i < ITER; i += 1) {
    const viewport = { width: randomRange(rng, 1, 3000), height: randomRange(rng, 1, 2000) };
    const fit = computeFitCamera(viewport.width, viewport.height, LAB_MAP).scale;
    const s = defaultScale(viewport, LAB_MAP);
    assert.ok(s >= fit - 1e-9, `s=${s} fit=${fit}`);
    assert.ok(s <= Math.max(fit, 2.2) + 1e-9, `s=${s} fit=${fit}`);
    assert.ok(s >= MIN_SCALE && s <= MAX_SCALE);
  }
});

test('defaultScale lebih besar daripada skala muat pada 1280x720 dan 1920x1080', () => {
  for (const [width, height] of [
    [1280, 720],
    [1920, 1080],
  ]) {
    const fit = computeFitCamera(width, height, LAB_MAP).scale;
    assert.ok(defaultScale({ width, height }, LAB_MAP) > fit);
  }
});

// Feature: ui-visual-overhaul, Property 21: Kamera ikuti aman, tidak mengubah skala, dan mendekat
test('Property 21: followCamera aman, skala tetap, dan mendekat', () => {
  const rng = mulberry32(2121);
  for (let i = 0; i < ITER; i += 1) {
    const viewport = {
      width: randomRange(rng, -100, 1600),
      height: randomRange(rng, -100, 1000),
    };
    const cam = {
      scale: randomRange(rng, MIN_SCALE, MAX_SCALE),
      offsetX: randomRange(rng, -3000, 500),
      offsetY: randomRange(rng, -2000, 500),
    };
    const target = { x: randomRange(rng, 0, worldW), y: randomRange(rng, 0, worldH) };
    const dt = randomRange(rng, 0, 0.5);

    for (const reduced of [false, true]) {
      const out = followCamera(cam, target, viewport, LAB_MAP, dt, reduced);
      assert.ok(Number.isFinite(out.offsetX) && Number.isFinite(out.offsetY));
      assert.ok(Number.isFinite(out.scale));
      assert.equal(out.scale, cam.scale);
    }

    // dt = 0 tanpa reducedMotion: offset tidak berubah (setelah pembatasan batas peta).
    const still = followCamera(cam, target, viewport, LAB_MAP, 0, false);
    const clampedSame = clampCamera(cam, viewport, LAB_MAP);
    assert.ok(Math.abs(still.offsetX - clampedSame.offsetX) < 1e-9);
    assert.ok(Math.abs(still.offsetY - clampedSame.offsetY) < 1e-9);

    // Viewport positif: tengah viewport = target bila tidak terkunci batas peta.
    const vp = { width: Math.abs(viewport.width) + 1, height: Math.abs(viewport.height) + 1 };
    const desired = {
      scale: cam.scale,
      offsetX: vp.width / 2 - target.x * cam.scale,
      offsetY: vp.height / 2 - target.y * cam.scale,
    };
    const clamped = clampCamera(desired, vp, LAB_MAP);
    const locked =
      Math.abs(clamped.offsetX - desired.offsetX) > 1e-6 ||
      Math.abs(clamped.offsetY - desired.offsetY) > 1e-6;
    if (!locked) {
      const jump = followCamera(cam, target, vp, LAB_MAP, dt, true);
      assert.ok(Math.abs(jump.offsetX - desired.offsetX) < 1e-6);
      assert.ok(Math.abs(jump.offsetY - desired.offsetY) < 1e-6);

      const centerDist = (c: { offsetX: number; offsetY: number }) =>
        Math.hypot(
          (vp.width / 2 - c.offsetX) / cam.scale - target.x,
          (vp.height / 2 - c.offsetY) / cam.scale - target.y
        );
      // Kamera awal dibatasi dahulu agar jarak dibandingkan pada keadaan sah.
      const start = clampCamera(cam, vp, LAB_MAP);
      const step = followCamera(start, target, vp, LAB_MAP, dt, false);
      assert.ok(centerDist(step) <= centerDist(start) + 1e-6);
    }
  }
});

// Feature: ui-visual-overhaul, Property 22: Zoom selalu dalam rentang
test('Property 22: zoomScale selalu dalam [0.5, 3.2]', () => {
  const rng = mulberry32(2222);
  for (let i = 0; i < ITER; i += 1) {
    const start = randomRange(rng, MIN_SCALE, MAX_SCALE);
    const factor = Math.exp(randomRange(rng, -4, 4));
    const out = zoomScale(start, factor);
    assert.ok(out >= MIN_SCALE && out <= MAX_SCALE, `out=${out}`);
  }
});

test('coverFillScale selalu memenuhi 100% lebar & tinggi panggung peta tanpa tepi kosong', () => {
  for (const [width, height] of [
    [640, 400],
    [820, 480],
    [960, 540],
    [1280, 720],
    [1366, 768],
    [1920, 1080],
  ]) {
    const scale = coverFillScale({ width, height }, LAB_MAP);
    assert.ok(scale >= MIN_SCALE && scale <= MAX_SCALE);
    assert.ok(worldW * scale >= width, `lebar kurang di ${width}x${height}`);
    assert.ok(worldH * scale >= height, `tinggi kurang di ${width}x${height}`);
    const clamped = clampCamera({ scale, offsetX: 500, offsetY: 500 }, { width, height }, LAB_MAP);
    assert.ok(clamped.offsetX <= 0 && clamped.offsetY <= 0);
  }
});
