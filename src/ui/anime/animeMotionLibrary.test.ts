import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CHARACTER_DESIGN_BIBLE, getDesignBibleEntry } from './characterDesignBible';
import {
  type MasterAnimeManifest,
  sharedAnimeAssetManager,
} from './CharacterAssetManager';
import { sharedPoseManager } from './CharacterPoseManager';
import { ANIME_EXPRESSION_IDS, sharedExpressionManager } from './ExpressionManager';
import { SEQUENCE_FRAME_COUNTS, sharedAnimationController } from './AnimationController';
import { MotionTimeline } from './MotionTimeline';
import { sharedDialogueMotionAdapter } from './DialogueMotionAdapter';
import { sharedHandGestureLibrary } from './HandGestureLibrary';
import { sharedFootPoseLibrary } from './FootPoseLibrary';
import { sharedEnvironmentAssetManager } from './EnvironmentAssetManager';
import {
  CameraTimeline,
  CHARACTER_RIG_LAYERS,
  SCENE_COMPOSITION_LAYERS,
  sharedMotionGraphicEngine,
} from './MotionGraphicEngine';

const PUBLIC_ROOT = join(process.cwd(), 'public');

test('Character Design Bible mengunci identitas lengkap seluruh 18 mahasiswa', () => {
  assert.equal(CHARACTER_DESIGN_BIBLE.length, 18);
  assert.equal(sharedAnimeAssetManager.getAllBibleEntries().length, 18);

  const raka = getDesignBibleEntry('mhs-01');
  assert.ok(raka);
  assert.equal(raka.slug, 'raka');
  assert.equal(raka.name, 'Raka Pratama');
  assert.equal(
    raka.masterReferencePath,
    '/assets/anime-characters/raka/reference/raka_master_model_sheet.png'
  );
});

test('memvalidasi seluruh struktur direktori public/assets/anime-characters/ (18 karakter × 20 pose, 16 ekspresi, & 4 sequence animasi)', () => {
  const masterPath = join(PUBLIC_ROOT, 'assets', 'anime-characters', 'manifest.json');
  assert.equal(existsSync(masterPath), true, 'Master anime-characters/manifest.json harus ada');

  const master = JSON.parse(readFileSync(masterPath, 'utf8')) as MasterAnimeManifest;
  assert.equal(master.totalCharacters, 18);

  let totalVerified = 0;
  for (const entry of CHARACTER_DESIGN_BIBLE) {
    const cm = master.characters[entry.characterId];
    assert.ok(cm, `Manifest untuk ${entry.characterId} harus ada`);
    assert.equal(existsSync(join(PUBLIC_ROOT, cm.masterReferencePath.replace(/^\//, ''))), true);

    // 20 Pose
    const poseIds = Object.keys(cm.poses);
    assert.equal(poseIds.length, 20);
    for (const pid of poseIds) {
      const p = cm.poses[pid];
      assert.equal(existsSync(join(PUBLIC_ROOT, p.assetPath.replace(/^\//, ''))), true);
      totalVerified += 1;
    }

    // 16 Ekspresi
    assert.equal(Object.keys(cm.expressions).length, 16);
    for (const ex of ANIME_EXPRESSION_IDS) {
      assert.equal(
        existsSync(join(PUBLIC_ROOT, cm.expressions[ex].assetPath.replace(/^\//, ''))),
        true
      );
      totalVerified += 1;
    }

    // Sequence animasi (idle 6, walking 8, talking 4, gestures 4)
    assert.equal(cm.animations.idle.length, SEQUENCE_FRAME_COUNTS.idle);
    assert.equal(cm.animations.walking.length, SEQUENCE_FRAME_COUNTS.walking);
    assert.equal(cm.animations.talking.length, SEQUENCE_FRAME_COUNTS.talking);
    assert.equal(cm.animations.gestures.length, SEQUENCE_FRAME_COUNTS.gestures);
    totalVerified += 22;
  }

  // 18 × (20 pose + 16 ekspresi + 22 frame animasi) = 1.044 aset (+ 18 master sheets = 1.062)
  assert.equal(totalVerified, 1044);
});

test('CharacterPoseManager, ExpressionManager, AnimationController, MotionTimeline & DialogueMotionAdapter bekerja terpadu', () => {
  const sel = sharedPoseManager.selectPose('mhs-01', 'P04');
  assert.ok(sel);
  assert.equal(sel.assetPath, '/assets/anime-characters/raka/poses/raka_pose_04_excited.png');
  assert.equal(sharedPoseManager.getCurrentPose('mhs-01'), 'P04');

  const exprPath = sharedExpressionManager.getExpressionAssetPath('mhs-01', 'surprised');
  assert.equal(exprPath, '/assets/anime-characters/raka/expressions/raka_expression_surprised.png');

  const walkF0 = sharedAnimationController.sampleSequenceFrame('mhs-01', 'walking', 0, false);
  const walkF3 = sharedAnimationController.sampleSequenceFrame('mhs-01', 'walking', 380, false);
  assert.ok(walkF0 && walkF3);
  assert.notEqual(walkF0.frameIndex, walkF3.frameIndex);

  const kf = sharedDialogueMotionAdapter.adapt({
    characterId: 'mhs-01',
    storyExpression: 'tersenyum',
    dialogueText: 'Aku sudah berhasil menyelesaikan proyek robotika!',
    isSpeaker: true,
  });
  assert.equal(kf.poseId, 'P04');
  assert.equal(kf.expressionId, 'excited');
  assert.equal(kf.animationSequence, 'gestures');

  const timeline = new MotionTimeline([kf]);
  const sample = timeline.sampleAt(50);
  assert.equal(sample.active?.poseId, 'P04');
  assert.ok(sample.transitionAlpha01 > 0 && sample.transitionAlpha01 <= 1);
});

test('Phase 4–11: HandGestureLibrary (>=180), FootPoseLibrary (>=144), EnvironmentAssetManager, & MotionGraphicEngine lengkap', () => {
  assert.ok(sharedHandGestureLibrary.getTotalCount() >= 180);
  assert.equal(sharedHandGestureLibrary.listForCharacter('mhs-01').length, 12);

  assert.ok(sharedFootPoseLibrary.getTotalCount() >= 144);
  assert.equal(sharedFootPoseLibrary.listForCharacter('mhs-01').length, 10);

  assert.ok(sharedEnvironmentAssetManager.listByCategory('electronics-lab').length >= 5);
  assert.ok(sharedEnvironmentAssetManager.listByCategory('programming-lab').length >= 3);
  assert.ok(sharedEnvironmentAssetManager.listByCategory('3d-printing-lab').length >= 3);
  assert.ok(sharedEnvironmentAssetManager.listByCategory('welding-workshop').length >= 3);
  assert.ok(sharedEnvironmentAssetManager.listByCategory('discussion-room').length >= 3);

  assert.equal(SCENE_COMPOSITION_LAYERS.length, 10);
  assert.equal(CHARACTER_RIG_LAYERS.length, 18);
  assert.equal(sharedMotionGraphicEngine.rigController.resolveSafeAnimationMode(false), 'whole-asset-sequence');
  assert.equal(sharedMotionGraphicEngine.rigController.resolveSafeAnimationMode(true), 'skeletal-rig');

  const camTl = new CameraTimeline([
    { timeMs: 0, zoom: 1.0, panX: 0, panY: 0 },
    { timeMs: 1000, zoom: 1.2, panX: 40, panY: -20 },
  ]);
  const mid = camTl.evaluate(500);
  assert.equal(mid.zoom, 1.1);
  assert.equal(mid.panX, 20);
});
