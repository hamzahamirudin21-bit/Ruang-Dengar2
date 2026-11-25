import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { STUDENT_BACKGROUNDS } from '../../data/studentBackgrounds';
import {
  COMIC_CHARACTER_PROFILES,
  COMIC_STORY_PAGES,
  COMIC_STORY_TOTAL_DURATION_MS,
  DOSEN_CHARACTER_PROFILE,
  clampStoryTimeMs,
  computeStoryTimelineState,
  getCharacterProfile,
  getNextPageStartMs,
  getPrevPageStartMs,
} from './StoryTimeline';
import {
  computeCharacterSkeletalPose,
  computeCloseupFeetPose,
  computeCloseupHandDoorPose,
} from './CharacterAnimationEngine';
import { computePanelCameraMatrix } from './ComicCameraController';
import { computePanelTransitionState } from './ComicTransitionEngine';
import { AudioController } from './AudioController';

test('memuat seluruh 18 karakter asli dari database (Raka s.d. Bagas) lengkap dengan appearance & latar belakang', () => {
  assert.equal(COMIC_CHARACTER_PROFILES.length, 18);

  for (let i = 0; i < STUDENT_BLUEPRINTS.length; i += 1) {
    const bp = STUDENT_BLUEPRINTS[i];
    const bg = STUDENT_BACKGROUNDS[bp.id];
    const prof = COMIC_CHARACTER_PROFILES[i];

    assert.equal(prof.id, bp.id);
    assert.equal(prof.name, bp.name);
    assert.equal(prof.typeTag, bg.typeTag);
    assert.equal(prof.uniquePotential, bp.uniquePotential);
    assert.ok(prof.appearance, `Appearance wajib tersedia untuk ${bp.id}`);
    assert.equal(getCharacterProfile(bp.id).name, bp.name);
  }

  assert.equal(getCharacterProfile('dosen').id, DOSEN_CHARACTER_PROFILE.id);
});

test('memiliki 6 halaman komik asimetris (PAGE 1 s.d. PAGE 6) dengan variasi komposisi panel', () => {
  assert.equal(COMIC_STORY_PAGES.length, 6);
  const pageNumbers = COMIC_STORY_PAGES.map((p) => p.pageNumber);
  assert.deepEqual(pageNumbers, [1, 2, 3, 4, 5, 6]);
  assert.ok(COMIC_STORY_TOTAL_DURATION_MS >= 45000);
  assert.ok(COMIC_STORY_TOTAL_DURATION_MS <= 75000);

  // Page 1 memiliki 1 splash panel + 2 panel detail
  assert.equal(COMIC_STORY_PAGES[0].panels.length, 3);
  // Page 2 memiliki 4 panel (walk, close-up feet TAP... TAP..., close-up hand KLIK!, open doors SWOOSH!!)
  assert.equal(COMIC_STORY_PAGES[1].panels.length, 4);
  // Page 3 memiliki 4 panel aktivitas laboratorium (solder, coding, 3D print, las K3)
  assert.equal(COMIC_STORY_PAGES[2].panels.length, 4);
  // Page 4 memiliki 5 panel kelompok aktivitas
  assert.equal(COMIC_STORY_PAGES[3].panels.length, 5);
  // Page 5 memiliki 1 splash panel besar One Laboratory
  assert.equal(COMIC_STORY_PAGES[4].panels.length, 1);
  // Page 6 memiliki 1 splash panel Title Reveal
  assert.equal(COMIC_STORY_PAGES[5].panels.length, 1);
});

test('seluruh 18 karakter muncul sebagai aktor full-body di PAGE 4 (Meet the Community) dan PAGE 5 (One Laboratory)', () => {
  const page4 = COMIC_STORY_PAGES[3];
  const page4StudentIds = new Set<string>();
  for (const panel of page4.panels) {
    for (const actor of panel.actors) {
      if (actor.characterId.startsWith('mhs-')) {
        page4StudentIds.add(actor.characterId);
      }
    }
  }
  assert.equal(page4StudentIds.size, 18);

  const page5 = COMIC_STORY_PAGES[4];
  const page5StudentIds = new Set<string>();
  for (const panel of page5.panels) {
    for (const actor of panel.actors) {
      if (actor.characterId.startsWith('mhs-')) {
        page5StudentIds.add(actor.characterId);
      }
    }
  }
  assert.equal(page5StudentIds.size, 18);
});

test('CharacterAnimationEngine menghasilkan animasi rangka nyata (jalan, solder, koding, las, close-up kaki & tangan)', () => {
  const walkActor = COMIC_STORY_PAGES[0].panels[0].actors[0];
  const pose0 = computeCharacterSkeletalPose(walkActor, 100, 9000, false, false);
  const pose1 = computeCharacterSkeletalPose(walkActor, 600, 9000, true, false);

  // Saat berjalan, posisi X berubah dan sudut kaki/lengan berayun
  assert.notEqual(pose0.xNorm, pose1.xNorm);
  assert.notEqual(pose0.leftThighRad, pose1.leftThighRad);
  assert.notEqual(pose0.rightUpperArmRad, pose1.rightUpperArmRad);
  // Saat berbicara, mulut terbuka
  assert.equal(pose0.mouthOpen01, 0);
  assert.ok(pose1.mouthOpen01 > 0);

  // Close-up langkah kaki & tangan membuka pintu
  const feet0 = computeCloseupFeetPose(100, false);
  const feet1 = computeCloseupFeetPose(450, false);
  assert.notEqual(feet0.leftShoeXNorm, feet1.leftShoeXNorm);

  const hand0 = computeCloseupHandDoorPose(100, false);
  const hand1 = computeCloseupHandDoorPose(1100, false);
  assert.equal(hand0.latchClicked, false);
  assert.equal(hand1.latchClicked, true);
  assert.ok(hand1.handlePressRad > hand0.handlePressRad);
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

  const cam = computePanelCameraMatrix('pan-exterior-to-building', 2000, 9000, false);
  assert.ok(cam.zoom > 1);

  const trHidden = computePanelTransitionState('from-left', 100, 650, false);
  assert.equal(trHidden.isVisible, false);
  const trShown = computePanelTransitionState('from-left', 950, 650, false);
  assert.equal(trShown.isVisible, true);
  assert.ok(trShown.revealProgress01 > 0);

  const audio = new AudioController();
  audio.syncAt(200);
  audio.reset();
  assert.equal(typeof audio.isMuted(), 'boolean');
});
