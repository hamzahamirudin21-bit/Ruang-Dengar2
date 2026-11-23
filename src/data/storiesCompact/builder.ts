import type {
  StoryChoice,
  StoryExpression,
  StoryGraph,
  StoryLine,
  StoryNode,
  StoryScene,
} from '../../engine/story/storyTypes';
import type { CounselorSkillId } from '../../types';

/**
 * Pembangun graf percakapan 7 giliran dengan TEPAT 2 PILIHAN per giliran (Tepat vs Salah).
 *
 * Kurva kesulitan meningkat bertahap:
 * - Giliran 1–2: Kontras jelas (sapaan hangat vs respons ketus/menghakimi).
 * - Giliran 3–5: Makin menantang — kedua pilihan terdengar sopan, tetapi hanya satu yang
 *   selaras dengan latar belakang, tipe kepribadian, dan kebutuhan psikologis mahasiswa.
 * - Giliran 6–7: Langkah kecil & penutup yang menghargai otonomi & minat unik mahasiswa.
 *
 * Setiap pilihan tepat langsung menambah energi (+12%); pilihan salah mengurangi energi (-14%)
 * dan memicu reaksi negatif khas latar belakang masing-masing mahasiswa.
 */

export interface CompactTurnOption {
  id: string;
  skillId: CounselorSkillId;
  text: string;
  /** Reaksi mahasiswa yang langsung menjawab pilihan ini secara khas sesuai latar belakangnya. */
  reply: StoryLine;
  best?: boolean;
  isMisstep?: boolean;
  setFlags?: string[];
  options?: StoryChoice['options'];
}

export type BinaryTurnPair = [CompactTurnOption, CompactTurnOption];

export interface CompactStudentScript {
  studentId: string;
  firstName: string;
  title: string;
  labSceneTitle: string;
  labSceneCaption: string;
  bkSceneTitle?: string;
  bkSceneCaption?: string;
  /** Ucapan pembuka mahasiswa saat dihampiri dosen di lab (sebelum Giliran 1). */
  opening: StoryLine;
  /** Giliran 1: Sapaan awal (kontras jelas). */
  t1: BinaryTurnPair;
  /** Giliran 2: Menanggapi sinyal di lab (kontras cukup jelas). */
  t2: BinaryTurnPair;
  /** Giliran 3: Menjaga privasi & kenyamanan pindah ke Ruang Konsultasi (mulai menantang). */
  t3: BinaryTurnPair;
  /** Giliran 4: Eksplorasi inti beban sesuai latar belakang mahasiswa (menantang). */
  t4: BinaryTurnPair;
  /** Giliran 5: Momen Terbuka — teka-teki empati sesuai tipe karakter (paling menantang). */
  t5: BinaryTurnPair;
  /** Giliran 6: Menyusun satu langkah kecil menghargai otonomi & kesukaan mahasiswa. */
  t6: BinaryTurnPair;
  /** Giliran 7: Penutup hangat & penguatan energi. */
  t7: BinaryTurnPair;
  /** 3 penutup akhir sesuai jumlah jawaban tepat vs salah. */
  endings: {
    terbantu: StoryLine;
    kemajuanKecil: StoryLine;
    menarikDiri: StoryLine;
  };
}

function mapBinaryChoices(
  turnNum: number,
  pair: BinaryTurnPair,
  nextId: string,
  extraRightFlags?: string[],
): StoryChoice[] {
  const [rightOpt, wrongOpt] = pair;
  const rightFlags = [`tepat-t${turnNum}`, ...(rightOpt.setFlags ?? []), ...(extraRightFlags ?? [])];
  const wrongFlags = [`salah-t${turnNum}`, ...(wrongOpt.setFlags ?? [])];

  return [
    {
      id: rightOpt.id,
      skillId: rightOpt.skillId,
      text: rightOpt.text,
      best: true,
      options: rightOpt.options,
      reaction: rightOpt.reply,
      next: nextId,
      setFlags: rightFlags,
    },
    {
      id: wrongOpt.id,
      skillId: wrongOpt.skillId,
      text: wrongOpt.text,
      best: false,
      options: wrongOpt.options,
      reaction: wrongOpt.reply,
      next: nextId,
      setFlags: wrongFlags,
    },
  ];
}

export function buildCompactStoryGraph(spec: CompactStudentScript): StoryGraph {
  const p = spec.studentId;
  const scenes: StoryScene[] = [
    {
      id: 'lab',
      setting: 'lab',
      title: spec.labSceneTitle,
      caption: spec.labSceneCaption,
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: `${p}-t1`,
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: spec.bkSceneTitle ?? 'Ruang Konsultasi BK',
      caption:
        spec.bkSceneCaption ??
        'Ruangan hangat dan privat, dengan dua kursi nyaman serta jendela menghadap taman kampus.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: `${p}-t4`,
    },
  ];

  const nodes: StoryNode[] = [
    {
      id: `${p}-t1`,
      sceneId: 'lab',
      stage: 'hubungan',
      depth: 0,
      reply: spec.opening,
      choices: mapBinaryChoices(1, spec.t1, `${p}-t2`),
    },
    {
      id: `${p}-t2`,
      sceneId: 'lab',
      stage: 'hubungan',
      depth: 0,
      reply: spec.t1[0].reply,
      marks: ['isyarat-nonverbal'],
      choices: mapBinaryChoices(2, spec.t2, `${p}-t3`),
    },
    {
      id: `${p}-t3`,
      sceneId: 'lab',
      stage: 'hubungan',
      depth: 0,
      reply: spec.t2[0].reply,
      choices: mapBinaryChoices(3, spec.t3, `${p}-t4`),
    },
    {
      id: `${p}-t4`,
      sceneId: 'bk',
      stage: 'eksplorasi',
      depth: 1,
      reply: spec.t3[0].reply,
      choices: mapBinaryChoices(4, spec.t4, `${p}-t5`),
    },
    {
      id: `${p}-t5`,
      sceneId: 'bk',
      stage: 'pemahaman',
      depth: 2,
      reply: spec.t4[0].reply,
      marks: ['momen-terbuka'],
      onEnter: { setFlags: ['momen-terbuka'] },
      choices: mapBinaryChoices(5, spec.t5, `${p}-t6`),
    },
    {
      id: `${p}-t6`,
      sceneId: 'bk',
      stage: 'rencana',
      depth: 2,
      reply: spec.t5[0].reply,
      choices: mapBinaryChoices(6, spec.t6, `${p}-t7`, ['langkah-kecil']),
    },
    {
      id: `${p}-t7`,
      sceneId: 'bk',
      stage: 'rencana',
      depth: 2,
      reply: spec.t6[0].reply,
      choices: mapBinaryChoices(7, spec.t7, '@ending', ['tutup-hangat']),
    },
    // 3 Simpul akhir
    {
      id: `${p}-akhir-terbantu`,
      sceneId: 'bk',
      stage: 'rencana',
      depth: 2,
      reply: spec.endings.terbantu,
      choices: [],
      ending: { kind: 'terbantu' },
    },
    {
      id: `${p}-akhir-kemajuan`,
      sceneId: 'bk',
      stage: 'rencana',
      depth: 1,
      reply: spec.endings.kemajuanKecil,
      choices: [],
      ending: { kind: 'kemajuan-kecil' },
    },
    {
      id: `${p}-akhir-menarik`,
      sceneId: 'lab',
      stage: 'hubungan',
      depth: 0,
      reply: spec.endings.menarikDiri,
      choices: [],
      ending: { kind: 'menarik-diri-sementara' },
    },
  ];

  return {
    version: 2,
    studentId: spec.studentId,
    kind: 'penuh',
    placeholder: false,
    title: spec.title,
    scenes,
    startNodeId: `${p}-t1`,
    closingNodeId: `${p}-t7`,
    tensionFallbackNodeId: `${p}-akhir-menarik`,
    endings: {
      terbantu: `${p}-akhir-terbantu`,
      'kemajuan-kecil': `${p}-akhir-kemajuan`,
      'menarik-diri-sementara': `${p}-akhir-menarik`,
    },
    outcomeRules: {
      helpedMinQuality: 25,
      helpedMinLevel: 0,
      requiredFlags: ['momen-terbuka'],
      planFlag: 'langkah-kecil',
    },
    nodes,
  };
}

export function line(
  text: string,
  expression: StoryExpression,
  cue: string,
): StoryLine {
  return { text, expression, cue };
}
