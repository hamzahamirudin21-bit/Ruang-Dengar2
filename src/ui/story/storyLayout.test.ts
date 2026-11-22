import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../../engine/rng';
import { STRINGS } from '../../data/strings';
import {
  NARROW_BREAKPOINT,
  STATUS_SHAPES,
  buildListRows,
  dosenPortraitScaleFor,
  portraitScaleFor,
  sidePanelModes,
} from './storyLayout';
import type { AgentActivityStatus } from '../../types';

const ITER = 200;
const STATUSES = Object.keys(STATUS_SHAPES) as AgentActivityStatus[];

test('Property 4: skala potret bulat, terbatas, monoton; skala Dosen <= mahasiswa', () => {
  const rng = mulberry32(4);
  for (let i = 0; i < ITER; i++) {
    const w = 1 + Math.floor(rng() * 3000);
    const h = 1 + Math.floor(rng() * 2000);
    const s = portraitScaleFor({ width: w, height: h });
    assert.ok(Number.isInteger(s) && s >= 2 && s <= 6);
    const taller = portraitScaleFor({ width: w, height: h + Math.floor(rng() * 1000) });
    assert.ok(taller >= s);
    const d = dosenPortraitScaleFor(2 + Math.floor(rng() * 5));
    assert.ok(Number.isInteger(d) && d >= 2);
  }
  for (let st = 2; st <= 6; st++) assert.ok(dosenPortraitScaleFor(st) <= st);
});

test('Property 5: keadaan panel samping menurut lebar dan preferensi', () => {
  const rng = mulberry32(5);
  const pick = (): boolean | undefined => {
    const r = rng();
    return r < 0.34 ? undefined : r < 0.67;
  };
  for (let i = 0; i < ITER; i++) {
    const width = Math.floor(rng() * 2500);
    const pref = { left: pick(), right: pick() };
    const m = sidePanelModes(width, pref);
    for (const side of ['left', 'right'] as const) {
      const p = pref[side];
      if (p === true) assert.equal(m[side], 'terbuka');
      else if (p === false) assert.equal(m[side], 'diciutkan');
      else assert.equal(m[side], width < NARROW_BREAKPOINT ? 'diciutkan' : 'terbuka');
    }
  }
  assert.deepEqual(sidePanelModes(NARROW_BREAKPOINT - 1, {}), { left: 'diciutkan', right: 'diciutkan' });
  assert.deepEqual(sidePanelModes(NARROW_BREAKPOINT, {}), { left: 'terbuka', right: 'terbuka' });
});

test('Property 6: satu baris per agen, hanya id/name/statusShape, pemetaan injektif', () => {
  const rng = mulberry32(6);
  for (let i = 0; i < ITER; i++) {
    const n = Math.floor(rng() * 20);
    const agents = Array.from({ length: n }, (_, k) => ({
      id: `a${k}`,
      name: `Nama ${k}`,
      status: STATUSES[Math.floor(rng() * STATUSES.length)],
    }));
    const rows = buildListRows(agents);
    assert.equal(rows.length, n);
    rows.forEach((r, k) => {
      assert.deepEqual(Object.keys(r).sort(), ['id', 'name', 'statusShape']);
      assert.equal(r.id, agents[k].id);
      assert.equal(r.statusShape, STATUS_SHAPES[agents[k].status]);
    });
  }
  assert.equal(new Set(Object.values(STATUS_SHAPES)).size, STATUSES.length);
});

test('judul Daftar Mahasiswa berisi 15 dan empat tab profil', () => {
  assert.ok(STRINGS.story.studentListTitle(15).includes('15'));
  assert.deepEqual(Object.keys(STRINGS.story.profileTabs).sort(), ['jadwal', 'profil', 'relasi', 'riwayat']);
});
