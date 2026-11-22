import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HUD_ICON_FOR, hudIconFor, type HudBadgeKey, type HudIconId } from './hudIcons.ts';

const BADGE_KEYS: HudBadgeKey[] = [
  'hari', 'jam-lab', 'misi-selesai', 'mahasiswa-aktif',
  'energi', 'stres', 'jeda', 'putar', 'kecepatan',
];

const ICON_IDS: HudIconId[] = [
  'bintang', 'jam', 'kalender', 'orang', 'energi',
  'jeda', 'putar', 'kecepatan', 'telinga', 'obrolan', 'stres',
];

// Feature: game-ui-polish, Property 2: Pemetaan ikon HUD total dan khas
// **Validates: Requirements 2.1, 2.2**
test('Property 2: setiap kunci lencana HUD punya ikon yang sah', () => {
  assert.deepEqual(Object.keys(HUD_ICON_FOR).sort(), [...BADGE_KEYS].sort());
  for (const key of BADGE_KEYS) {
    const id = hudIconFor(key);
    assert.ok(ICON_IDS.includes(id), `${key} -> ${id} bukan HudIconId`);
  }
});

test('Property 2: kunci dengan makna berbeda memakai ikon berbeda', () => {
  const ids = BADGE_KEYS.map(hudIconFor);
  assert.equal(new Set(ids).size, BADGE_KEYS.length);
});

// **Validates: Requirements 2.1, 2.2, 2.4**
test('setiap HudIconId punya komponen terekspor di GameIcons.tsx', () => {
  const src = readFileSync(new URL('../GameIcons.tsx', import.meta.url), 'utf8');
  for (const id of ICON_IDS) {
    const name = 'Icon' + id[0].toUpperCase() + id.slice(1);
    assert.match(src, new RegExp(`export const ${name}\\b`), `komponen ${name} tidak ditemukan`);
  }
});
