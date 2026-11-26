import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { LAB_MAP } from '../../data/map';
import { STUDENT_BACKGROUNDS } from '../../data/studentBackgrounds';
import { STORY_GRAPHS } from '../../data/stories';
import { assetUrl, parseManifest, resolvePortraitSource } from '../characters/assetSlots';
import {
  COMIC_CHARACTER_PROFILES,
  COMIC_STORY_PAGES,
  COMIC_STORY_TOTAL_DURATION_MS,
  DOSEN_CHARACTER_PROFILE,
  OFFICIAL_LAB_ZONE_IDS,
  clampStoryTimeMs,
  computeStoryTimelineState,
  getCharacterProfile,
  getNextPageStartMs,
  getPrevPageStartMs,
} from './StoryTimeline';
import { computeMiniSpriteAnimationState } from './CharacterAnimationEngine';
import {
  computePanelWorldCamera,
  interpolateTileViewport,
  worldTileToPanelNorm,
} from './ComicCameraController';
import { computePanelTransitionState } from './ComicTransitionEngine';
import { AudioController } from './AudioController';

test('memuat seluruh 18 karakter miniatur dari dataset simulasi utama (Raka s.d. Bagas) dengan spriteUrl & fallback identik', () => {
  assert.equal(COMIC_CHARACTER_PROFILES.length, 18);

  for (let i = 0; i < STUDENT_BLUEPRINTS.length; i += 1) {
    const bp = STUDENT_BLUEPRINTS[i];
    const bg = STUDENT_BACKGROUNDS[bp.id];
    const prof = COMIC_CHARACTER_PROFILES[i];

    assert.equal(prof.id, bp.id);
    assert.equal(prof.name, bp.name);
    assert.equal(prof.spriteUrl, `/assets/characters/${bp.id}-sprite.png`);
    assert.equal(prof.typeTag, bg.typeTag);
    assert.equal(prof.uniquePotential, bp.uniquePotential);
    assert.equal(prof.fallback.hairStyle, bp.demographicLabel.hairStyle);
    assert.equal(prof.fallback.avatarHue, bp.demographicLabel.avatarHue);
    assert.ok(prof.appearance, `Appearance wajib tersedia untuk ${bp.id}`);
    assert.equal(getCharacterProfile(bp.id).name, bp.name);
  }

  assert.equal(getCharacterProfile('dosen').id, DOSEN_CHARACTER_PROFILE.id);
  assert.equal(DOSEN_CHARACTER_PROFILE.spriteUrl, '/assets/characters/dosen-sprite.png');
});

test('conversation, comic speakers, and portrait assets stay bound to the same character ID', () => {
  const rawManifest: unknown = JSON.parse(
    readFileSync(new URL('../../../public/assets/characters/manifest.json', import.meta.url), 'utf8'),
  );
  const manifest = parseManifest(rawManifest);
  assert.ok(manifest, 'Manifest aset karakter harus valid');

  const blueprintsById = new Map(STUDENT_BLUEPRINTS.map((blueprint) => [blueprint.id, blueprint]));
  const knownIds = new Set(['dosen', ...blueprintsById.keys()]);

  assert.deepEqual(Object.keys(STORY_GRAPHS).sort(), [...blueprintsById.keys()].sort());
  for (const [characterId, graph] of Object.entries(STORY_GRAPHS)) {
    assert.equal(graph.studentId, characterId, `Graf percakapan ${characterId} harus memakai ID yang sama`);
  }

  for (const characterId of knownIds) {
    const profile = getCharacterProfile(characterId);
    assert.equal(profile.id, characterId);

    const asset = manifest.characters[characterId];
    assert.ok(asset?.portrait, `Portrait asli harus terdaftar untuk ${characterId}`);
    const portraitUrl = assetUrl(asset.portrait);
    assert.equal(portraitUrl, assetUrl(`${characterId}-portrait.png`));
    assert.deepEqual(
      resolvePortraitSource(characterId, 'netral', manifest, new Set([portraitUrl])),
      { kind: 'aset', url: portraitUrl, specificExpression: false },
    );
  }

  for (const page of COMIC_STORY_PAGES) {
    for (const panel of page.panels) {
      for (const actor of panel.actors) {
        assert.ok(knownIds.has(actor.characterId), `Karakter panel ${actor.characterId} harus terdaftar`);
        assert.equal(getCharacterProfile(actor.characterId).id, actor.characterId);
      }
      for (const dialogue of panel.dialogues) {
        assert.ok(dialogue.speakerId, `Dialog ${dialogue.id} harus memiliki speakerId eksplisit`);
        assert.ok(knownIds.has(dialogue.speakerId), `Speaker ${dialogue.speakerId} harus terdaftar`);
        const blueprint = blueprintsById.get(dialogue.speakerId);
        if (blueprint && dialogue.speakerName) {
          assert.equal(
            dialogue.speakerName,
            blueprint.name.split(' ')[0],
            `Nama dialog ${dialogue.id} harus cocok dengan ${dialogue.speakerId}`,
          );
        }
      }
    }
  }

  const sari = blueprintsById.get('mhs-12');
  assert.ok(sari);
  assert.equal(sari.name, 'Sari Melati');
  assert.equal(STORY_GRAPHS['mhs-12'].studentId, 'mhs-12');
  assert.equal(getCharacterProfile('mhs-12').name, sari.name);
  assert.equal(manifest.characters['mhs-12']?.portrait, 'mhs-12-portrait.png');
  assert.throws(() => getCharacterProfile('unknown-character'), /Unknown comic characterId/);
});

test('menghubungkan seluruh 11 ruangan resmi pada LAB_MAP.zones ke dalam panel-panel komik', () => {
  assert.equal(OFFICIAL_LAB_ZONE_IDS.length, 11);

  const coveredZones = new Set<string>();
  for (const page of COMIC_STORY_PAGES) {
    for (const panel of page.panels) {
      for (const zId of panel.focusZoneIds) {
        assert.ok(
          OFFICIAL_LAB_ZONE_IDS.includes(zId),
          `Zona ${zId} harus terdaftar resmi di LAB_MAP.zones`
        );
        coveredZones.add(zId);
      }
    }
  }

  // Seluruh 11 ruangan (Bengkel Las, Cetak 3D, Elektronika & IoT, Gudang Alat, Pemrograman,
  // Meja Diskusi, Ruang Istirahat, Ruang Konsultasi, Ruang Dosen, Studio Desain, Pojok Baca) wajib tampil
  for (const zone of LAB_MAP.zones) {
    assert.equal(
      coveredZones.has(zone.id),
      true,
      `Ruangan ${zone.id} (${zone.label}) wajib direpresentasikan di dalam komik`
    );
  }
});

test('memiliki 6 babak sinematik (SCENE 01 s.d. SCENE 06) dengan seluruh 18 karakter miniatur hadir utuh', () => {
  assert.equal(COMIC_STORY_PAGES.length, 6);
  const pageNumbers = COMIC_STORY_PAGES.map((p) => p.pageNumber);
  assert.deepEqual(pageNumbers, [1, 2, 3, 4, 5, 6]);
  assert.ok(COMIC_STORY_TOTAL_DURATION_MS >= 45000);
  assert.ok(COMIC_STORY_TOTAL_DURATION_MS <= 75000);

  // Scene 03 memperlihatkan 5 ruangan praktikum berbeda (Elektronika, Pemrograman, Cetak 3D, Bengkel Las, Meja Diskusi)
  assert.equal(COMIC_STORY_PAGES[2].panels.length, 5);

  // Memastikan seluruh 6 jenis Flexible Character Framing (Extreme Close-Up s.d. Wide Shot) terpakai secara bervariasi
  const usedShotTypes = new Set(
    COMIC_STORY_PAGES.flatMap((page) => page.panels.map((panel) => panel.shotType))
  );
  assert.ok(usedShotTypes.has('extreme-close-up'));
  assert.ok(usedShotTypes.has('close-up'));
  assert.ok(usedShotTypes.has('medium-shot'));
  assert.ok(usedShotTypes.has('medium-full-shot'));
  assert.ok(usedShotTypes.has('full-body-shot'));
  assert.ok(usedShotTypes.has('wide-shot'));

  // Seluruh 18 mahasiswa hadir di Scene 04, Scene 05, dan Scene 06
  for (const pageIdx of [3, 4, 5]) {
    const page = COMIC_STORY_PAGES[pageIdx];
    const studentIds = new Set<string>();
    for (const panel of page.panels) {
      for (const actor of panel.actors) {
        // Pastikan koordinat tile berada di dalam area peta simulasi LAB_MAP (52x24)
        assert.ok(actor.startTile.x >= 0 && actor.startTile.x <= LAB_MAP.width);
        assert.ok(actor.startTile.y >= 0 && actor.startTile.y <= LAB_MAP.height);
        if (actor.characterId.startsWith('mhs-')) {
          studentIds.add(actor.characterId);
        }
      }
    }
    assert.equal(studentIds.size, 18, `Halaman ${page.pageNumber} harus memuat ke-18 mahasiswa`);
  }
});

test('CharacterAnimationEngine menggerakkan Mini Character Sprite secara halus tanpa distorsi anggota tubuh', () => {
  const walkActor = COMIC_STORY_PAGES[0].panels[0].actors[0];
  const state0 = computeMiniSpriteAnimationState(walkActor, 0, 9000, false, false);
  const stateMid = computeMiniSpriteAnimationState(walkActor, 3200, 9000, true, false);
  const stateEnd = computeMiniSpriteAnimationState(walkActor, 8800, 9000, false, false);

  assert.equal(state0.isMoving, true);
  assert.equal(state0.anim, 'jalan');
  assert.equal(stateMid.isSpeaking, true);
  assert.notEqual(state0.tileY, stateMid.tileY);
  // Di akhir jalur jalan, karakter berhenti dengan stabil (idle, frame 0)
  assert.equal(stateEnd.isMoving, false);
  assert.equal(stateEnd.anim, 'idle');
  assert.equal(stateEnd.frame, 0);
});

test('ComicCameraController, ComicTransitionEngine, StoryTimeline & AudioController bekerja deterministik', () => {
  assert.equal(clampStoryTimeMs(-200), 0);
  assert.equal(clampStoryTimeMs(999999), COMIC_STORY_TOTAL_DURATION_MS);

  const st1 = computeStoryTimelineState(0);
  assert.equal(st1.activePage.pageNumber, 1);

  const nextMs = getNextPageStartMs(0);
  assert.equal(nextMs, 9000);
  assert.equal(computeStoryTimelineState(nextMs).activePage.pageNumber, 2);
  assert.equal(getPrevPageStartMs(9500), 0);

  const vp = interpolateTileViewport(
    { x: 0, y: 0, w: 52, h: 24 },
    { x: 10, y: 5, w: 26, h: 12 },
    0.5,
    false
  );
  assert.equal(vp.x, 5);
  assert.equal(vp.w, 39);

  const cam = computePanelWorldCamera(
    { x: 22, y: 1, w: 9, h: 7 },
    { x: 22, y: 1, w: 9, h: 7 },
    1000,
    9000,
    640,
    360,
    28,
    false
  );
  assert.ok(cam.scale > 1);
  const norm = worldTileToPanelNorm(25, 4, cam, 640, 360, 28);
  assert.ok(norm.xNorm >= 0.06 && norm.xNorm <= 0.94);
  assert.ok(norm.yNorm >= 0.08 && norm.yNorm <= 0.92);

  const trHidden = computePanelTransitionState('from-left', 100, 650, false);
  assert.equal(trHidden.isVisible, false);
  const trShown = computePanelTransitionState('from-left', 950, 650, false);
  assert.equal(trShown.isVisible, true);

  const audio = new AudioController();
  audio.syncAt(200);
  audio.reset();
  assert.equal(typeof audio.isMuted(), 'boolean');
});
