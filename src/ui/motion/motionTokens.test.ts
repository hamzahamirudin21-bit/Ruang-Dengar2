import test from 'node:test';
import assert from 'node:assert/strict';
import { MOTION_MS, effectiveMs, type MotionToken } from './motionTokens';
import { shouldAdvanceFrame } from './frameClock';

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const TOKENS = Object.keys(MOTION_MS) as MotionToken[];

test('setiap durasi MOTION_MS adalah bilangan bulat positif', () => {
  for (const t of TOKENS) {
    assert.ok(Number.isInteger(MOTION_MS[t]) && MOTION_MS[t] > 0, t);
  }
});

test('Feature: game-juice-upgrade, Property 1: Gerak-dikurangi menghasilkan durasi 0', () => {
  const rnd = mulberry32(20240101);
  for (let i = 0; i < 200; i++) {
    const t = TOKENS[Math.floor(rnd() * TOKENS.length)];
    assert.equal(effectiveMs(t, true), 0);
    assert.equal(effectiveMs(t, false), MOTION_MS[t]);
  }
});

test('Feature: game-juice-upgrade, Property 2: Laju bingkai dibatasi', () => {
  const rnd = mulberry32(777);
  for (let i = 0; i < 200; i++) {
    const times: number[] = [];
    let now = rnd() * 100;
    const n = 50 + Math.floor(rnd() * 400);
    for (let k = 0; k < n; k++) {
      now += rnd() * 60; // langkah naik, bisa 0
      times.push(now);
    }
    const advanced: number[] = [];
    let prev = Number.NaN;
    for (const t of times) {
      if (shouldAdvanceFrame(prev, t)) {
        advanced.push(t);
        prev = t;
      }
    }
    for (let a = 0; a < advanced.length; a++) {
      let count = 0;
      for (let b = a; b < advanced.length && advanced[b] - advanced[a] <= 1000; b++) count++;
      assert.ok(count <= 31, `iterasi ${i}: ${count} bingkai`);
    }
  }
});
