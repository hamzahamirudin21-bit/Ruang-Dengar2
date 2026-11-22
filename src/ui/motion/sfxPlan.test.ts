import test from 'node:test';
import assert from 'node:assert/strict';
import { sfxPlan, shouldPlaySfx, SFX_GAIN_MAX, SFX_TOTAL_MAX_MS, type SfxName } from './sfxPlan';

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES: SfxName[] = ['klik', 'pilih', 'ketik', 'emote', 'misi-selesai', 'ganti-adegan'];

test('Feature: game-juice-upgrade, Property 29: Rencana suara terbatas', () => {
  const rnd = mulberry32(2929);
  for (let i = 0; i < 150; i++) {
    const name = NAMES[Math.floor(rnd() * NAMES.length)];
    const plan = sfxPlan(name);
    assert.ok(plan.length > 0, name);
    for (const s of plan) {
      assert.ok(s.gain > 0 && s.gain <= SFX_GAIN_MAX, `${name} gain`);
      assert.ok(s.freqHz > 0, `${name} freq`);
      assert.ok(s.delayMs + s.durationMs <= SFX_TOTAL_MAX_MS, `${name} total`);
    }
  }
});

test('Feature: game-juice-upgrade, Property 30: Gerbang pemutaran suara', () => {
  const rnd = mulberry32(3030);
  for (let i = 0; i < 300; i++) {
    const name = NAMES[Math.floor(rnd() * NAMES.length)];
    const last = Math.floor(rnd() * 10000);
    const now = last + Math.floor(rnd() * 200) - 20;
    assert.equal(shouldPlaySfx(false, name, last, now), false);
    assert.equal(shouldPlaySfx(false, name, null, now), false);
    assert.equal(shouldPlaySfx(true, 'ketik', last, now), now - last >= 60);
    assert.equal(shouldPlaySfx(true, 'ketik', null, now), true);
  }
  assert.equal(shouldPlaySfx(true, 'ketik', 1000, 1059), false);
  assert.equal(shouldPlaySfx(true, 'ketik', 1000, 1060), true);
});
