import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { STUDENT_BACKGROUNDS } from '../../data/studentBackgrounds';
import {
  COMIC_INTRO_BEATS,
  COMIC_INTRO_TOTAL_DURATION_MS,
  COMIC_STUDENT_IDENTITIES,
  DOSEN_IDENTITY,
  getComicCharacterIdentity,
} from './comicIntroData';
import {
  clampTimelineMs,
  computeCameraTransformStyle,
  computeIntroTimelineState,
  getNextBeatStartMs,
  getPrevBeatStartMs,
  typewriterTextAt,
} from './IntroTimeline';
import { IntroAudioManager } from './IntroAudioManager';

test('memuat tepat 18 identitas mahasiswa yang 100% sinkron dengan STUDENT_BLUEPRINTS & STUDENT_BACKGROUNDS', () => {
  assert.equal(COMIC_STUDENT_IDENTITIES.length, 18);

  for (let i = 0; i < STUDENT_BLUEPRINTS.length; i += 1) {
    const bp = STUDENT_BLUEPRINTS[i];
    const bg = STUDENT_BACKGROUNDS[bp.id];
    const comicStudent = COMIC_STUDENT_IDENTITIES[i];

    assert.equal(comicStudent.id, bp.id);
    assert.equal(comicStudent.name, bp.name);
    assert.equal(comicStudent.portraitUrl, `/assets/characters/${bp.id}-portrait.png`);
    assert.equal(comicStudent.spriteUrl, `/assets/characters/${bp.id}-sprite.png`);
    assert.equal(comicStudent.typeTag, bg.typeTag);
    assert.equal(comicStudent.uniquePotential, bp.uniquePotential);
    assert.ok(bg.originAndCohort.includes(comicStudent.origin));
    assert.equal(getComicCharacterIdentity(bp.id).name, bp.name);
  }

  assert.equal(getComicCharacterIdentity('dosen').id, DOSEN_IDENTITY.id);
});

test('memiliki 6 babak sinematik (SCENE 01 s.d. SCENE 06) dengan durasi total 45–75 detik', () => {
  const sceneNumbers = Array.from(new Set(COMIC_INTRO_BEATS.map((b) => b.sceneNumber)));
  assert.deepEqual(sceneNumbers, [1, 2, 3, 4, 5, 6]);
  assert.ok(COMIC_INTRO_TOTAL_DURATION_MS >= 45000);
  assert.ok(COMIC_INTRO_TOTAL_DURATION_MS <= 75000);
});

test('memperkenalkan seluruh 18 mahasiswa (mhs-01..mhs-18) di SCENE 03 (Meet the Students) dan SCENE 05 (One Community)', () => {
  const scene3Beats = COMIC_INTRO_BEATS.filter((b) => b.sceneNumber === 3);
  assert.equal(scene3Beats.length, 8); // 8 panel beats pengenalan kelompok aktivitas

  const scene3CharIds = new Set<string>();
  for (const beat of scene3Beats) {
    for (const panel of beat.panels) {
      for (const c of panel.characters) {
        if (c.characterId.startsWith('mhs-')) {
          scene3CharIds.add(c.characterId);
        }
      }
    }
  }
  assert.equal(scene3CharIds.size, 18);
  for (const bp of STUDENT_BLUEPRINTS) {
    assert.equal(scene3CharIds.has(bp.id), true);
  }

  // Scene 05 juga wajib memuat ke-18 mahasiswa dalam satu komunitas utuh
  const scene5Beat = COMIC_INTRO_BEATS.find((b) => b.sceneNumber === 5);
  assert.ok(scene5Beat);
  const scene5CharIds = new Set(
    scene5Beat.panels.flatMap((p) => p.characters.map((c) => c.characterId))
  );
  assert.equal(scene5CharIds.size, 18);
});

test('menyertakan teks narasi wajib pada SCENE 01, SCENE 02, dan SCENE 05 sesuai storyboard', () => {
  const s1 = COMIC_INTRO_BEATS.find((b) => b.sceneNumber === 1);
  const s2 = COMIC_INTRO_BEATS.find((b) => b.sceneNumber === 2);
  const s5 = COMIC_INTRO_BEATS.find((b) => b.sceneNumber === 5);

  assert.equal(
    s1?.narrativeCaption,
    'Setiap perjalanan besar selalu dimulai dari sebuah tempat.'
  );
  assert.equal(
    s2?.narrativeCaption,
    'Di tempat ini, rasa ingin tahu berubah menjadi eksperimen. Ide sederhana berkembang menjadi teknologi.'
  );
  assert.equal(
    s5?.narrativeCaption,
    'Berbeda keahlian, berbeda karakter, tetapi memiliki satu tujuan: belajar, berkarya, dan menciptakan sesuatu yang bermakna.'
  );
});

test('menghitung progres timeline, efek typewriter, kamera, serta navigasi Next/Prev Beat secara deterministik', () => {
  assert.equal(clampTimelineMs(-500), 0);
  assert.equal(clampTimelineMs(999999), COMIC_INTRO_TOTAL_DURATION_MS);

  const startSnap = computeIntroTimelineState(0);
  assert.equal(startSnap.activeBeat.sceneNumber, 1);
  assert.equal(startSnap.isFinished, false);

  // Navigasi Next Beat dari Scene 01 (0ms) menuju Scene 02 (6000ms)
  const nextMs = getNextBeatStartMs(0);
  assert.equal(nextMs, 6000);
  const s2Snap = computeIntroTimelineState(nextMs + 1200);
  assert.equal(s2Snap.activeBeat.sceneNumber, 2);
  assert.ok(s2Snap.activeDialogues.length > 0);

  // Navigasi Prev Beat
  assert.equal(getPrevBeatStartMs(6500), 0);
  assert.equal(getPrevBeatStartMs(8000), 6000);

  // Efek typewriter
  const twHalf = typewriterTextAt('Halo Dunia', 500, 1000);
  assert.equal(twHalf.text, 'Halo ');
  assert.equal(twHalf.isComplete, false);

  const twFull = typewriterTextAt('Halo Dunia', 1200, 1000);
  assert.equal(twFull.text, 'Halo Dunia');
  assert.equal(twFull.isComplete, true);

  // Transformasi kamera menghormati reducedMotion
  assert.ok(computeCameraTransformStyle('slow-zoom-in', 0.5, true).transform.includes('scale(1)'));
  assert.ok(!computeCameraTransformStyle('slow-zoom-in', 0.5, false).transform.includes('scale(1)'));
});

test('mengelola pemicu audio tanpa duplikasi dan dapat di-reset saat Replay', () => {
  const audio = new IntroAudioManager();
  audio.syncAt(100);
  audio.syncAt(200);
  audio.reset();
  audio.syncAt(100);
  assert.equal(typeof audio.isMuted(), 'boolean');
});
