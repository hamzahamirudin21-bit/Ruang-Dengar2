import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import {
  CHARACTER_POSE_PROFILES,
  POSE_CATALOG,
  getPoseAssetPath,
  resolveDialoguePose,
} from './poseCatalog';
import { listAllExpectedPoseEntries, type MasterPoseManifest } from './poseAssetLoader';

const PUBLIC_ROOT = join(process.cwd(), 'public');

test('memiliki tepat 18 profil karakter dan 20 katalog pose (P01..P20) = 360 pose unik', () => {
  assert.equal(CHARACTER_POSE_PROFILES.length, 18);
  assert.equal(POSE_CATALOG.length, 20);
  assert.equal(listAllExpectedPoseEntries().length, 360);

  const ids = POSE_CATALOG.map((p) => p.poseId);
  assert.equal(new Set(ids).size, 20);
  assert.equal(ids[0], 'P01');
  assert.equal(ids[19], 'P20');

  for (const bp of STUDENT_BLUEPRINTS) {
    const prof = CHARACTER_POSE_PROFILES.find((p) => p.studentId === bp.id);
    assert.ok(prof, `Profil pose harus tersedia untuk ${bp.id}`);
  }
});

test('memvalidasi seluruh 360 berkas PNG transparan (480x600), 18 manifest karakter, dan poses-manifest.json di disk', () => {
  const masterPath = join(PUBLIC_ROOT, 'assets', 'characters', 'poses-manifest.json');
  assert.equal(existsSync(masterPath), true, 'Master poses-manifest.json harus ada');

  const master = JSON.parse(readFileSync(masterPath, 'utf8')) as MasterPoseManifest;
  assert.equal(master.totalCharacters, 18);
  assert.equal(master.posesPerCharacter, 20);
  assert.equal(master.totalAssets, 360);

  let verifiedCount = 0;
  for (const prof of CHARACTER_POSE_PROFILES) {
    const charManifestPath = join(
      PUBLIC_ROOT,
      'assets',
      'characters',
      prof.slug,
      'manifest.json'
    );
    assert.equal(existsSync(charManifestPath), true, `Manifest ${prof.slug} harus ada`);

    const sizesForCharacter = new Set<number>();
    for (const pose of POSE_CATALOG) {
      const rel = getPoseAssetPath(prof.studentId, pose.poseId);
      assert.ok(rel);
      const abs = join(PUBLIC_ROOT, rel.replace(/^\//, ''));
      assert.equal(existsSync(abs), true, `Berkas pose tidak ditemukan: ${rel}`);

      const stat = statSync(abs);
      assert.ok(stat.size > 10000, `Berkas pose terlalu kecil/rusak: ${rel}`);
      sizesForCharacter.add(stat.size);

      // Verifikasi header PNG (dimensi 480x600 & colorType 6 = RGBA transparan)
      const header = readFileSync(abs).subarray(0, 26);
      assert.equal(header.readUInt32BE(16), 480);
      assert.equal(header.readUInt32BE(20), 600);
      assert.equal(header[25], 6, `${rel} wajib bertipe RGBA (transparan)`);

      verifiedCount += 1;
    }

    // Pastikan pose-pose memiliki variasi visual nyata (tidak identik biner)
    assert.ok(
      sizesForCharacter.size >= 10,
      `Pose untuk ${prof.slug} harus bervariasi secara visual`
    );
  }

  assert.equal(verifiedCount, 360);
});

test('resolveDialoguePose memilih pose P01..P20 berdasarkan emosi dialog, status menyimak, reaksi, dan kepribadian', () => {
  // Excited saat berhasil menyelesaikan proyek IoT
  const excited = resolveDialoguePose({
    speakerId: 'mhs-01',
    expression: 'tersenyum',
    dialogueText: 'Aku berhasil menyelesaikan proyek IoT kemarin!',
    isSpeaker: true,
  });
  assert.equal(excited.poseId, 'P04');
  assert.equal(excited.emotion, 'excited');

  // Exhausted saat mengaku kelelahan
  const exhausted = resolveDialoguePose({
    speakerId: 'mhs-02',
    expression: 'lelah',
    dialogueText: 'Jujur Bu, aku akhir-akhir ini cukup kelelahan.',
    isSpeaker: true,
  });
  assert.equal(exhausted.poseId, 'P11');
  assert.equal(exhausted.emotion, 'exhausted');

  // Confident / Explaining saat memberi solusi
  const confident = resolveDialoguePose({
    speakerId: 'mhs-01',
    expression: 'netral',
    dialogueText: 'Menurutku kita harus membagi pekerjaan menjadi dua tim.',
    isSpeaker: true,
  });
  assert.equal(confident.poseId, 'P13');

  // Surprised
  const surprised = resolveDialoguePose({
    speakerId: 'mhs-05',
    expression: 'terkejut',
    dialogueText: 'Benarkah? Aku baru tahu!',
    isSpeaker: true,
  });
  assert.equal(surprised.poseId, 'P08');

  // Listening saat lawan bicara berbicara
  const listening = resolveDialoguePose({
    speakerId: 'mhs-03',
    expression: 'netral',
    isSpeaker: false,
    isListening: true,
  });
  assert.equal(listening.poseId, 'P17');

  // Intensitas gerak berbeda antara karakter pendiam (Dimas) dan ekspresif (Ayu)
  const quiet = resolveDialoguePose({
    speakerId: 'mhs-02',
    expression: 'netral',
    dialogueText: 'Begini cara kerjanya.',
    isSpeaker: true,
  });
  const expressive = resolveDialoguePose({
    speakerId: 'mhs-05',
    expression: 'netral',
    dialogueText: 'Begini cara kerjanya.',
    isSpeaker: true,
  });
  assert.ok(expressive.intensity > quiet.intensity);
});
