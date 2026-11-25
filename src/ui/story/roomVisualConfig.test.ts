import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LAB_MAP } from '../../data/map';
import { COMPACT_STORY_GRAPHS } from '../../data/storiesCompact';
import { STRINGS } from '../../data/strings';
import type { ZoneType } from '../../types';
import {
  ROOM_VISUAL_CONFIGS,
  resolveRoomVisualConfig,
} from './roomVisualConfig';

const ALL_ZONES: readonly ZoneType[] = [
  'pemrograman',
  'elektronik-iot',
  'cetak-3d',
  'las',
  'gudang-alat',
  'studio-desain',
  'diskusi',
  'konsultasi',
  'pojok-baca',
  'istirahat',
  'ruang-dosen',
];

test('Phase 1 Architecture: semua 11 zona LAB_MAP memiliki RoomVisualConfig unik dan lengkap', () => {
  assert.equal(LAB_MAP.zones.length, 11);
  const titles = new Set<string>();
  const wallDisplays = new Set<string>();
  const deskProps = new Set<string>();

  for (const zone of LAB_MAP.zones) {
    const cfg = ROOM_VISUAL_CONFIGS[zone.id];
    assert.ok(cfg, `Konfigurasi visual untuk zona ${zone.id} tidak ditemukan`);
    assert.equal(cfg.roomId, zone.id);
    assert.ok(cfg.headerTitle.length > 3);
    assert.ok(cfg.departmentTag.length > 3);
    assert.equal(cfg.wallDisplayNodes.length, 3);
    assert.match(cfg.theme.bgPrimary, /^#[0-9a-fA-F]{6}$/);
    assert.match(cfg.theme.accentPrimary, /^#[0-9a-fA-F]{6}$/);
    assert.match(cfg.theme.accentSecondary, /^#[0-9a-fA-F]{6}$/);

    titles.add(cfg.headerTitle);
    wallDisplays.add(cfg.wallDisplayKind);
    deskProps.add(cfg.deskPropKind);
  }

  // Setiap ruangan wajib memiliki identitas judul, display dinding, dan prop meja tersendiri
  assert.equal(titles.size, 11);
  assert.equal(wallDisplays.size, 11);
  assert.equal(deskProps.size, 11);
});

test('Phase 1 Architecture: resolveRoomVisualConfig memetakan setting lab dan ruang-konsultasi secara akurat', () => {
  for (const zoneId of ALL_ZONES) {
    const labCfg = resolveRoomVisualConfig({ setting: 'lab', zoneId });
    assert.equal(labCfg.roomId, zoneId);

    const bkCfg = resolveRoomVisualConfig({ setting: 'ruang-konsultasi', zoneId });
    assert.equal(bkCfg.roomId, 'konsultasi');
  }

  // Fallback aman bila zoneId null pada setting lab
  const fallback = resolveRoomVisualConfig({ setting: 'lab', zoneId: null });
  assert.equal(fallback.roomId, 'pemrograman');
});

test('Phase 1 Architecture: Pemrograman & MCU memiliki alur firmware sensor() -> filter() -> sendMQTT()', () => {
  const mcu = resolveRoomVisualConfig({ setting: 'lab', zoneId: 'pemrograman' });
  assert.equal(mcu.headerTitle, 'STASIUN PEMROGRAMAN DAN MIKROKONTROLER');
  assert.deepEqual(mcu.wallDisplayNodes, ['sensor()', 'filter()', 'sendMQTT()']);
});

test('Phase 3 Multi-Room Personalization: perpindahan antar-11 ruangan mengubah wallDisplayTitle, wallDisplayNodes, dan palet warna secara dinamis', () => {
  const seenPalettes = new Set<string>();
  for (const zoneId of ALL_ZONES) {
    const cfg = resolveRoomVisualConfig({ setting: 'lab', zoneId });
    assert.equal(cfg.roomId, zoneId);
    assert.ok(cfg.wallDisplayTitle.length > 5);
    assert.equal(cfg.wallDisplayNodes.length, 3);
    const paletteSignature = `${cfg.theme.bgPrimary}|${cfg.theme.accentPrimary}|${cfg.theme.tabletopSurface}`;
    seenPalettes.add(paletteSignature);
  }
  // Seluruh 11 ruangan memiliki kombinasi palet warna latar/aksen/meja yang berbeda
  assert.equal(seenPalettes.size, 11);

  // Saat berpindah dari lab (mis. las) ke ruang-konsultasi (Walk Together), tema berubah ke konsultasi
  const beforeWalk = resolveRoomVisualConfig({ setting: 'lab', zoneId: 'las' });
  const afterWalk = resolveRoomVisualConfig({ setting: 'ruang-konsultasi', zoneId: 'las' });
  assert.equal(beforeWalk.roomId, 'las');
  assert.equal(afterWalk.roomId, 'konsultasi');
  assert.notEqual(beforeWalk.theme.accentPrimary, afterWalk.theme.accentPrimary);
  assert.notEqual(beforeWalk.wallDisplayKind, afterWalk.wallDisplayKind);
});

test('Phase 8 & 9 Regression: seluruh 6 tombol kontrol dialog, ghost full-text reservation, stage nameplates, dan 18 graf mahasiswa utuh', () => {
  // 1. Verifikasi 18 graf mahasiswa tetap utuh
  assert.equal(Object.keys(COMPACT_STORY_GRAPHS).length, 18);

  // 2. Verifikasi 6 tombol kontrol wajib di VnDialogBox.tsx (History, Auto, Skip, Simpan, Muat, Akhiri Sesi)
  const dialogSrc = readFileSync(resolve(process.cwd(), 'src/ui/story/VnDialogBox.tsx'), 'utf8');
  for (const handler of [
    'onOpenHistory',
    'onToggleAuto',
    'onSkip',
    'onSave',
    'onLoad',
    'onEndSession',
  ]) {
    assert.ok(dialogSrc.includes(handler), `Handler ${handler} hilang dari VnDialogBox.tsx`);
  }
  assert.ok(dialogSrc.includes('vn-text--ghost'), 'Ghost full-text layout reservation hilang dari VnDialogBox.tsx');
  assert.ok(dialogSrc.includes('vn-box-soundwave'), 'Soundwave emblem hilang dari VnDialogBox.tsx');

  // 3. Verifikasi label 6 tombol di STRINGS.story
  assert.ok(STRINGS.story.historyBtn.length > 0);
  assert.ok(STRINGS.story.autoBtn.length > 0);
  assert.ok(STRINGS.story.skipBtn.length > 0);
  assert.ok(STRINGS.story.saveBtn.length > 0);
  assert.ok(STRINGS.story.loadBtn.length > 0);
  assert.ok(STRINGS.story.endSessionBtn.length > 0);

  // 4. Verifikasi StoryScreen.tsx memuat RoomEnvironmentLayer, Stage Nameplates, dan Zero-Rerender CSS Parallax
  const screenSrc = readFileSync(resolve(process.cwd(), 'src/ui/story/StoryScreen.tsx'), 'utf8');
  assert.ok(screenSrc.includes('RoomEnvironmentLayer'), 'RoomEnvironmentLayer belum terpasang di StoryScreen.tsx');
  assert.ok(screenSrc.includes('vn-stage-nameplate--left'), 'Left stage nameplate hilang');
  assert.ok(screenSrc.includes('vn-stage-nameplate--right'), 'Right stage nameplate hilang');
  assert.ok(screenSrc.includes("'--vn-px'"), 'Variabel CSS panggung --vn-px hilang');
  assert.ok(!screenSrc.includes('key={`cloud-'), 'VnDialogBox tidak boleh remount dengan key per beat');
});


