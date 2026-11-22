import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mulberry32 } from '../../engine/rng';
import type { StoryExpression } from '../../engine/story/storyTypes';
import { EMOTE_FOR, emoteFor, shouldPopEmote } from './emoteModel';

const ITER = 200;
const EXPRESSIONS = Object.keys(EMOTE_FOR) as StoryExpression[];
const EMOTES = ['hati', 'tanya', 'keringat', 'awan', 'kilau', 'seru'];

test('Feature: game-juice-upgrade, Property 21: Pemetaan emote total', () => {
  assert.equal(EXPRESSIONS.length, 11);
  const rng = mulberry32(2101);
  for (let i = 0; i < ITER; i++) {
    const e = EXPRESSIONS[Math.floor(rng() * EXPRESSIONS.length)];
    const m = emoteFor(e);
    if (e === 'netral' || e === 'menutup-diri') assert.equal(m, null);
    else assert.ok(m !== null && EMOTES.includes(m));
  }
  const used = new Set(EXPRESSIONS.map(emoteFor));
  for (const id of EMOTES) assert.ok(used.has(id as never), `emote ${id} tak terpakai`);
});

test('Feature: game-juice-upgrade, Property 22: Emote hanya muncul saat ekspresi berubah', () => {
  const rng = mulberry32(2201);
  for (let i = 0; i < ITER; i++) {
    const prev = EXPRESSIONS[Math.floor(rng() * EXPRESSIONS.length)];
    const next = EXPRESSIONS[Math.floor(rng() * EXPRESSIONS.length)];
    assert.equal(shouldPopEmote(prev, next), prev !== next && emoteFor(next) !== null);
  }
  for (const e of EXPRESSIONS) assert.equal(shouldPopEmote(null, e), emoteFor(e) !== null);
});

test('Sumber emoteModel.ts tidak memuat kata terlarang', () => {
  const src = readFileSync(new URL('./emoteModel.ts', import.meta.url), 'utf8').toLowerCase();
  for (const w of ['category', 'score', 'skor', 'trust', 'readiness', 'stigma', 'rupture', 'exposure', 'best', 'terbaik']) {
    assert.ok(!src.includes(w), `kata terlarang: ${w}`);
  }
});
