import test from 'node:test';
import assert from 'node:assert/strict';
import { irisRadiusFraction, sceneTransitionKind } from './sceneTransition';
import type { SceneArtId } from '../scene/sceneArt';

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IDS: SceneArtId[] = [
  'lab-umum', 'cetak-3d', 'elektronik', 'pemrograman', 'las',
  'gudang', 'diskusi', 'istirahat', 'ruang-bk', 'ruang-dosen',
];
const LABS: SceneArtId[] = IDS.filter((i) => i !== 'ruang-bk' && i !== 'ruang-dosen');

test('Feature: game-juice-upgrade, Property 25: Jenis transisi adegan', () => {
  const rnd = mulberry32(2501);
  for (let i = 0; i < 300; i++) {
    const a = IDS[Math.floor(rnd() * IDS.length)];
    const b = IDS[Math.floor(rnd() * IDS.length)];
    const reduced = rnd() < 0.5;
    const k = sceneTransitionKind(a, b, reduced);
    if (reduced || a === b) assert.equal(k, 'none');
    else if ((LABS.includes(a) && b === 'ruang-bk') || (a === 'ruang-bk' && LABS.includes(b)))
      assert.equal(k, 'iris');
    else assert.equal(k, 'fade');
  }
  for (const l of LABS) {
    assert.equal(sceneTransitionKind(l, 'ruang-bk', false), 'iris');
    assert.equal(sceneTransitionKind('ruang-bk', l, false), 'iris');
  }
});

test('Feature: game-juice-upgrade, Property 26: Jari-jari iris terjepit', () => {
  const rnd = mulberry32(2601);
  for (let i = 0; i < 200; i++) {
    const p = (rnd() - 0.5) * 6;
    for (const opening of [true, false]) {
      const r = irisRadiusFraction(p, opening);
      assert.ok(r >= 0 && r <= 1);
    }
  }
  for (const bad of [NaN, Infinity, -Infinity]) {
    const r = irisRadiusFraction(bad, true);
    assert.ok(r >= 0 && r <= 1);
  }
});

test('Feature: game-juice-upgrade, Property 3: Waktu tidak sah diperlakukan 0 (irisRadiusFraction)', () => {
  for (const bad of [NaN, Infinity, -Infinity, -5]) {
    for (const opening of [true, false]) {
      assert.equal(irisRadiusFraction(bad, opening), irisRadiusFraction(0, opening));
    }
  }
});
