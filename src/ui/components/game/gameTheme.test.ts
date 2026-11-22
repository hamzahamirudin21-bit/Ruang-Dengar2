import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import {
  frameClass, buttonClass, badgeValueText, badgeFractionText,
  meterFraction, meterTone,
  type FrameVariant, type ButtonVariant, type ButtonSize,
} from './gameTheme.ts';

const CSS = readFileSync(new URL('../../../index.css', import.meta.url), 'utf8');
const FRAMES: FrameVariant[] = ['kayu', 'krem', 'navy'];
const BUTTONS: ButtonVariant[] = ['primer', 'sekunder', 'bulat-ikon'];
const SIZES: Array<ButtonSize | undefined> = ['sm', 'md', 'lg', undefined];

// PRNG deterministik agar uji dapat diulang.
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function classDefined(name: string): boolean {
  return new RegExp(`\\.${name.replace(/-/g, '\\-')}(?![\\w-])`).test(CSS);
}

// Feature: game-ui-polish, Property 1: Nama kelas komponen selalu sah
// **Validates: Requirements 1.7**
test('Property 1: kelas frame dan tombol berawalan game- dan terdefinisi di index.css', () => {
  for (const v of FRAMES) {
    for (const nails of [true, false, undefined]) {
      const cls = frameClass(v, nails === undefined ? undefined : { nails });
      for (const name of cls.split(' ')) {
        assert.ok(name.startsWith('game-'), name);
        assert.ok(classDefined(name), `${name} tidak terdefinisi`);
      }
    }
  }
  for (const v of BUTTONS) {
    for (const size of SIZES) {
      const cls = buttonClass(v, size ? { size } : undefined);
      for (const name of cls.split(' ')) {
        assert.ok(name.startsWith('game-'), name);
        assert.ok(classDefined(name), `${name} tidak terdefinisi`);
      }
    }
  }
});

// Feature: game-ui-polish, Property 14: Pecahan meter terjepit
// **Validates: Requirements 8.4**
test('Property 14: meterFraction selalu dalam [0, 1] dan 0 untuk masukan tidak sah', () => {
  const rand = rng(14);
  const special = [NaN, Infinity, -Infinity, 0, -1, 1, 100];
  const pick = () => (rand() < 0.3 ? special[Math.floor(rand() * special.length)] : (rand() - 0.5) * 400);
  for (let i = 0; i < 500; i++) {
    const value = pick();
    const max = pick();
    const f = meterFraction(value, max);
    assert.ok(f >= 0 && f <= 1, `${value}/${max} -> ${f}`);
    if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) assert.equal(f, 0);
  }
  assert.equal(meterFraction(50, 100), 0.5);
});

// Feature: game-ui-polish, Property 15: Nada meter
// **Validates: Requirements 8.5**
test('Property 15: meterTone memetakan ambang 0,33 dan 0,66 serta terbalik bila higherIsBetter salah', () => {
  const rand = rng(15);
  const flip = { rendah: 'tinggi', sedang: 'sedang', tinggi: 'rendah' } as const;
  for (let i = 0; i < 500; i++) {
    const f = rand();
    const expected = f < 0.33 ? 'rendah' : f < 0.66 ? 'sedang' : 'tinggi';
    assert.equal(meterTone(f, true), expected);
    assert.equal(meterTone(f, false), flip[expected]);
  }
  assert.equal(meterTone(0.33, true), 'sedang');
  assert.equal(meterTone(0.66, true), 'tinggi');
  assert.equal(meterTone(0, true), 'rendah');
  assert.equal(meterTone(1, true), 'tinggi');
});

test('badgeValueText: bulat tak negatif dan 999+', () => {
  assert.equal(badgeValueText(0), '0');
  assert.equal(badgeValueText(7), '7');
  assert.equal(badgeValueText(7.9), '7');
  assert.equal(badgeValueText(-5), '0');
  assert.equal(badgeValueText(NaN), '0');
  assert.equal(badgeValueText(999), '999');
  assert.equal(badgeValueText(1000), '999+');
  assert.equal(badgeValueText(Infinity), '0');
});

test('badgeFractionText: selesai/total', () => {
  assert.equal(badgeFractionText(2, 5), '2/5');
  assert.equal(badgeFractionText(0, 0), '0/0');
  assert.equal(badgeFractionText(1200, 3), '999+/3');
});

// **Validates: Requirements 1.6**
test('berkas komponen game tidak memuat warna literal di luar komentar', () => {
  const dir = new URL('./', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.tsx') || f === 'gameTheme.ts');
  assert.ok(files.includes('gameTheme.ts') && files.length > 1);
  for (const f of files) {
    const src = readFileSync(new URL(f, dir), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/(^|[^:])\/\/.*$/gm, '$1');
    assert.doesNotMatch(src, /#[0-9a-fA-F]{3,8}\b/, `${f} memuat #hex`);
    assert.doesNotMatch(src, /\brgba?\(/, `${f} memuat rgb(`);
    assert.doesNotMatch(src, /\bhsla?\(/, `${f} memuat hsl(`);
  }
});
