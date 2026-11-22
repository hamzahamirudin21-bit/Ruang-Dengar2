import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../../engine/rng';
import {
  blinkSchedule,
  portraitPose,
  speakerBrightness,
  speakerScale,
  type PoseInput,
} from './portraitAnimation';

const ITER = 200;

function randSeed(rng: () => number): string {
  const n = 1 + Math.floor(rng() * 12);
  let s = '';
  for (let i = 0; i < n; i++) s += String.fromCharCode(33 + Math.floor(rng() * 90));
  return s;
}

function randInput(rng: () => number, over: Partial<PoseInput> = {}): PoseInput {
  return {
    timeMs: rng() * 60000,
    seedId: randSeed(rng),
    isSpeaker: rng() < 0.5,
    isTyping: rng() < 0.5,
    msSinceSpeakerChange: rng() * 600,
    reduced: false,
    ...over,
  };
}

test('Feature: game-juice-upgrade, Property 3: Waktu tidak sah diperlakukan 0 (pose)', () => {
  const rng = mulberry32(203);
  const bad = [NaN, Infinity, -Infinity, -1, -12345.5, -0.001];
  for (let i = 0; i < ITER; i++) {
    const base = randInput(rng);
    const b = bad[Math.floor(rng() * bad.length)];
    assert.deepEqual(
      portraitPose({ ...base, timeMs: b }),
      portraitPose({ ...base, timeMs: 0 }),
    );
    assert.deepEqual(
      portraitPose({ ...base, msSinceSpeakerChange: b }),
      portraitPose({ ...base, msSinceSpeakerChange: 0 }),
    );
  }
});

test('Feature: game-juice-upgrade, Property 4: Napas terbatas dan periodik', () => {
  const rng = mulberry32(204);
  for (let i = 0; i < ITER; i++) {
    const input = randInput(rng);
    const a = portraitPose(input);
    const b = portraitPose({ ...input, timeMs: input.timeMs + 3200 });
    assert.ok(Math.abs(a.breathDy) <= 2);
    assert.ok(Math.abs(a.breathDy - b.breathDy) < 1e-6);
  }
});

test('Feature: game-juice-upgrade, Property 5: Jadwal kedip deterministik dan beraturan', () => {
  const rng = mulberry32(205);
  for (let i = 0; i < ITER; i++) {
    const seed = randSeed(rng);
    const from = rng() * 20000;
    const to = from + rng() * 40000;
    const s1 = blinkSchedule(seed, from, to);
    const s2 = blinkSchedule(seed, from, to);
    assert.deepEqual(s1, s2);
    for (let k = 0; k < s1.length; k++) {
      assert.equal(s1[k].endMs - s1[k].startMs, 140);
      if (k > 0) {
        const gap = s1[k].startMs - s1[k - 1].endMs;
        assert.ok(gap >= 2400 && gap <= 5199, `gap ${gap}`);
      }
    }
    if (s1.length > 0) assert.ok(s1[0].startMs - 0 >= 2400);
  }
});

test('Feature: game-juice-upgrade, Property 6: Bentuk mulut mengikuti keadaan bicara', () => {
  const rng = mulberry32(206);
  const cycle = ['tutup', 'setengah', 'buka'];
  for (let i = 0; i < ITER; i++) {
    const input = randInput(rng);
    const pose = portraitPose(input);
    if (input.isSpeaker && input.isTyping) {
      assert.equal(pose.mouth, cycle[Math.floor(input.timeMs / 110) % 3]);
    } else {
      assert.equal(pose.mouth, 'tutup');
    }
  }
});

test('Feature: game-juice-upgrade, Property 7: Squash pembicara terbatas', () => {
  const rng = mulberry32(207);
  for (let i = 0; i < ITER; i++) {
    const since = rng() * 700;
    const pose = portraitPose(randInput(rng, { isSpeaker: true, msSinceSpeakerChange: since }));
    if (since < 280) {
      assert.ok(pose.scaleY >= 0.94 - 1e-9 && pose.scaleY <= 1.04 + 1e-9);
    } else {
      assert.equal(pose.scaleY, 1);
    }
  }
});

test('Feature: game-juice-upgrade, Property 8: Sorotan pembicara tetap terlihat', () => {
  const rng = mulberry32(208);
  for (let i = 0; i < ITER; i++) {
    const input = randInput(rng, { msSinceSpeakerChange: 280 + rng() * 5000 });
    const pose = portraitPose(input);
    if (input.isSpeaker) {
      assert.equal(speakerScale(true), 1);
      assert.equal(speakerBrightness(true), 1);
      assert.equal(pose.brightness, 1);
      assert.equal(pose.scaleY, 1);
    } else {
      assert.equal(speakerScale(false), 0.94);
      assert.equal(speakerBrightness(false), 0.82);
      assert.equal(pose.brightness, 0.82);
    }
    assert.ok(pose.brightness >= 0.75);
  }
});

test('Feature: game-juice-upgrade, Property 9: Gerak-dikurangi memberi pose statis', () => {
  const rng = mulberry32(209);
  for (let i = 0; i < ITER; i++) {
    const input = randInput(rng, { reduced: true });
    const pose = portraitPose(input);
    assert.equal(pose.breathDy, 0);
    assert.equal(pose.scaleX, 1);
    assert.equal(pose.scaleY, 1);
    assert.equal(pose.eyesClosed, false);
    assert.equal(pose.mouth, 'tutup');
    assert.equal(pose.brightness, input.isSpeaker ? 1 : 0.82);
  }
});
