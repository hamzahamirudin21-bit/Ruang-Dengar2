import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mulberry32 } from '../../engine/rng';
import { COUNSELOR_SKILLS } from '../../data/skillEffects';
import {
  CHOICE_ICON_FOR,
  INITIAL_CARD_STATE,
  cardReduce,
  choiceIconFor,
  commitDelayMs,
  type CardEvent,
  type CardState,
} from './choiceStyle';

const ITER = 200;
const ICONS = ['tanya', 'ruang', 'hangat', 'saran'];

test('Feature: game-juice-upgrade, Property 18: Pemetaan ikon pilihan total', () => {
  assert.equal(COUNSELOR_SKILLS.length, 14);
  const rng = mulberry32(1801);
  for (let i = 0; i < ITER; i++) {
    const skill = COUNSELOR_SKILLS[Math.floor(rng() * COUNSELOR_SKILLS.length)];
    assert.ok(ICONS.includes(choiceIconFor(skill.id)));
  }
  for (const s of COUNSELOR_SKILLS) assert.ok(ICONS.includes(choiceIconFor(s.id)));
});

test('Feature: game-juice-upgrade, Property 19: Ikon pilihan tidak membocorkan kualitas', () => {
  const rng = mulberry32(1901);
  for (let i = 0; i < ITER; i++) {
    const icon = ICONS[Math.floor(rng() * ICONS.length)];
    const skills = COUNSELOR_SKILLS.filter((s) => CHOICE_ICON_FOR[s.id] === icon);
    assert.ok(skills.some((s) => s.category === 'penghambat'), `${icon} tanpa penghambat`);
    assert.ok(skills.some((s) => s.category !== 'penghambat'), `${icon} tanpa non-penghambat`);
  }
});

test('Feature: game-juice-upgrade, Property 20: Pilihan dikirim tepat sekali', () => {
  const rng = mulberry32(2001);
  for (let i = 0; i < ITER; i++) {
    let state: CardState = INITIAL_CARD_STATE;
    let commits = 0;
    let sawAktifkan = false;
    let sawTunda = false;
    let firstIndex: number | null = null;
    const n = 1 + Math.floor(rng() * 20);
    for (let k = 0; k < n; k++) {
      const r = rng();
      const ev: CardEvent =
        r < 0.5
          ? { type: 'aktifkan', index: Math.floor(rng() * 5) }
          : { type: 'tunda-selesai' };
      const before = state;
      const res = cardReduce(state, ev);
      if (ev.type === 'aktifkan' && before.phase === 'diam') {
        sawAktifkan = true;
        firstIndex = ev.index;
      }
      if (ev.type === 'tunda-selesai' && sawAktifkan) sawTunda = true;
      if (res.commit) {
        commits++;
        assert.ok(sawAktifkan && sawTunda);
      }
      if (ev.type === 'aktifkan' && before.phase !== 'diam') {
        assert.equal(res.chosenIndex, before.chosenIndex);
      }
      if (sawAktifkan) assert.equal(res.chosenIndex, firstIndex);
      state = { phase: res.phase, chosenIndex: res.chosenIndex };
    }
    assert.ok(commits <= 1);
    assert.equal(cardReduce(state, { type: 'reset' }).commit, false);
  }
});

test('commitDelayMs: 240 normal, 0 reduced motion', () => {
  assert.equal(commitDelayMs(false), 240);
  assert.equal(commitDelayMs(true), 0);
});

test('Sumber choiceStyle.ts tidak memuat kata terlarang', () => {
  const src = readFileSync(new URL('./choiceStyle.ts', import.meta.url), 'utf8').toLowerCase();
  for (const w of ['category', 'score', 'skor', 'trust', 'readiness', 'stigma', 'rupture', 'exposure', 'best', 'terbaik']) {
    assert.ok(!src.includes(w), `kata terlarang: ${w}`);
  }
});
