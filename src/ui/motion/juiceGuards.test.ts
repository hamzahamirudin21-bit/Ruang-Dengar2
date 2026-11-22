import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const SRC = join(process.cwd(), 'src');

const PURE_MODULES = [
  'ui/motion/motionTokens.ts',
  'ui/motion/frameClock.ts',
  'ui/motion/countUp.ts',
  'ui/motion/confetti.ts',
  'ui/motion/sceneDepth.ts',
  'ui/motion/sceneTransition.ts',
  'ui/motion/sfxPlan.ts',
  'ui/story/portraitAnimation.ts',
  'ui/story/typewriter.ts',
  'ui/story/bubbleLayout.ts',
  'ui/story/emoteModel.ts',
  'ui/story/choiceStyle.ts',
  'ui/characters/portraitDetail.ts',
  'ui/characters/portraitFrameCache.ts',
  'ui/screens/titleMotion.ts',
];

const NEW_COMPONENTS = [
  'ui/story/LivingPortrait.tsx',
  'ui/story/SpeechBubble.tsx',
  'ui/story/EmoteBubble.tsx',
  'ui/story/SceneBackdrop.tsx',
];

const read = (rel: string): string => readFileSync(join(SRC, ...rel.split('/')), 'utf8');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

// Hapus komentar agar kata di komentar tidak dihitung.
const stripComments = (s: string): string =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');

test('(a) kelas fx-* di .tsx terdefinisi di index.css dan punya aturan gerak-dikurangi', () => {
  const css = readFileSync(join(SRC, 'index.css'), 'utf8');
  const used = new Set<string>();
  for (const file of walk(SRC).filter((f) => f.endsWith('.tsx'))) {
    for (const m of readFileSync(file, 'utf8').matchAll(/\bfx-[a-z0-9]+(?:-[a-z0-9]+)*/g)) {
      used.add(m[0]);
    }
  }
  assert.ok(used.size > 0, 'tidak ada kelas fx-* yang ditemukan');
  const markerIdx = css.indexOf('Gerak-dikurangi: semua fx-*');
  assert.ok(markerIdx >= 0, 'blok gerak-dikurangi fx-* tidak ditemukan');
  const reducedBlock = css.slice(markerIdx);
  for (const cls of used) {
    assert.ok(new RegExp(`\\.${cls}(?![\\w-])\\s*[{,:]`).test(css), `${cls} tidak terdefinisi di index.css`);
    assert.ok(
      new RegExp(`\\.${cls}(?![\\w-])`).test(reducedBlock),
      `${cls} tidak punya aturan gerak-dikurangi`,
    );
  }
});

test('(b) modul murni tidak mengimpor react dan tidak menyebut document/window', () => {
  for (const rel of PURE_MODULES) {
    const src = stripComments(read(rel));
    assert.ok(!/from\s+['"]react['"]/.test(src), `${rel} mengimpor react`);
    assert.ok(!/\bdocument\b/.test(src), `${rel} menyebut document`);
    assert.ok(!/\bwindow\b/.test(src), `${rel} menyebut window`);
  }
});

test('(c) modul murni dan komponen baru tidak memuat kata variabel tersembunyi', () => {
  const banned = /\b(trust|readiness|stigma|rupture|exposure)\b/i;
  for (const rel of [...PURE_MODULES, ...NEW_COMPONENTS]) {
    assert.ok(!banned.test(read(rel)), `${rel} memuat kata terlarang`);
  }
});

test('(d) komponen baru tidak memuat warna literal', () => {
  for (const rel of NEW_COMPONENTS) {
    const src = read(rel);
    assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(src), `${rel} memuat #hex`);
    assert.ok(!/\brgba?\(/i.test(src), `${rel} memuat rgb(`);
    assert.ok(!/\bhsla?\(/i.test(src), `${rel} memuat hsl(`);
  }
});

test('(e) VnChoices.tsx tidak merujuk category atau skor', () => {
  const src = read('ui/story/VnChoices.tsx');
  assert.ok(!/\bcategory\b/i.test(src), 'VnChoices merujuk category');
  assert.ok(!/\bskor\b/i.test(src), 'VnChoices merujuk skor');
});

test('(f) tidak ada berkas aset biner baru di src/', () => {
  const bad = walk(SRC).filter((f) => /\.(mp3|wav|ogg|png|jpe?g)$/i.test(f));
  assert.deepEqual(bad.map((f) => relative(SRC, f).split(sep).join('/')), []);
});

test('(g) AudioContext hanya dibuat di sfx.ts', () => {
  const offenders = walk(SRC)
    .filter((f) => /\.(ts|tsx)$/.test(f) && !/\.test\.tsx?$/.test(f))
    .filter((f) => !f.endsWith(`${sep}sfx.ts`))
    .filter((f) => /new\s+(?:\w+\.)?(?:webkit)?AudioContext\b/i.test(stripComments(readFileSync(f, 'utf8'))))
    .map((f) => relative(SRC, f));
  assert.deepEqual(offenders, []);
});

test('(h) EmoteBubble.tsx memuat aria-hidden', () => {
  assert.ok(read('ui/story/EmoteBubble.tsx').includes('aria-hidden'));
});
