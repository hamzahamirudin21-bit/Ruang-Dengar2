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
 * Pembangun graf percakapan ringkas & 100% koheren (tepat 7 giliran pada jalur normal).
 *
 * Setiap pilihan langsung memicu reaksi mahasiswa yang MENJAWAB ucapan konselor
 * secara natural sekaligus membuka konteks mulus untuk giliran berikutnya—tanpa
 * lompatan topik mendadak, tanpa pengulangan, dan tanpa durasi bertele-tele.
 */

export interface CompactTurnOption {
  id: string;
  skillId: CounselorSkillId;
  text: string;
  /** Reaksi mahasiswa yang langsung menyambung dengan pilihan ini & mengantar ke giliran berikutnya. */
  reply: StoryLine;
  best?: boolean;
  isMisstep?: boolean;
  setFlags?: string[];
  options?: StoryChoice['options'];
}

export interface CompactStudentScript {
  studentId: string;
  firstName: string;
  title: string;
  labSceneTitle: string;
  labSceneCaption: string;
  bkSceneTitle?: string;
  bkSceneCaption?: string;
  /** Ucapan pembuka mahasiswa saat dihampiri di lab (sebelum Giliran 1). */
  opening: StoryLine;
  /** Giliran 1: Sapaan awal di lab. */
  t1: [CompactTurnOption, CompactTurnOption, CompactTurnOption];
  /** Giliran 2: Menanggapi sinyal perilaku di lab. */
  t2: [CompactTurnOption, CompactTurnOption, CompactTurnOption];
  /** Giliran 3: Menjaga privasi & pindah ke Ruang Konsultasi. */
  t3: [CompactTurnOption, CompactTurnOption, CompactTurnOption];
  /** Giliran 4: Eksplorasi hangat di Ruang Konsultasi. */
  t4: [CompactTurnOption, CompactTurnOption, CompactTurnOption];
  /** Giliran 5: Momen Terbuka (inti beban / perasaan sebenarnya). */
  t5: [CompactTurnOption, CompactTurnOption, CompactTurnOption];
  /** Giliran 6: Afirmasi kekuatan & menyusun satu langkah kecil pilihan mahasiswa. */
  t6: [CompactTurnOption, CompactTurnOption, CompactTurnOption];
  /** Giliran 7: Penutup hangat & pemulihan energi. */
  t7: [CompactTurnOption, CompactTurnOption, CompactTurnOption];
  /** Garis ketegangan bila pemain memilih opsi yang menekan/menghakimi. */
  tensionOpening: StoryLine;
  /** Garis saat ketegangan diakui dengan lembut. */
  tensionRecognized: StoryLine;
  /** 3 penutup akhir sesuai kualitas pendampingan. */
  endings: {
    terbantu: StoryLine;
    kemajuanKecil: StoryLine;
    menarikDiri: StoryLine;
  };
}

function mapChoices(
  opts: [CompactTurnOption, CompactTurnOption, CompactTurnOption],
  nextId: string,
  tensionId: string,
  extraFlags?: string[],
): StoryChoice[] {
  return opts.map((opt) => ({
    id: opt.id,
    skillId: opt.skillId,
    text: opt.text,
    best: opt.best,
    options: opt.options,
    reaction: opt.reply,
    next: opt.isMisstep ? tensionId : nextId,
    setFlags: opt.isMisstep
      ? opt.setFlags
      : extraFlags
        ? [...(opt.setFlags ?? []), ...extraFlags]
        : opt.setFlags,
  }));
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

  const tensionAwalId = `${p}-tegang-awal`;
  const tensionRepairId = `${p}-tegang-perbaikan`;

  const nodes: StoryNode[] = [
    {
      id: `${p}-t1`,
      sceneId: 'lab',
      stage: 'hubungan',
      depth: 0,
      reply: spec.opening,
      choices: mapChoices(spec.t1, `${p}-t2`, tensionAwalId),
    },
    {
      id: `${p}-t2`,
      sceneId: 'lab',
      stage: 'hubungan',
      depth: 0,
      reply: spec.t1[0].reply,
      marks: ['isyarat-nonverbal'],
      choices: mapChoices(spec.t2, `${p}-t3`, tensionAwalId),
    },
    {
      id: `${p}-t3`,
      sceneId: 'lab',
      stage: 'hubungan',
      depth: 0,
      reply: spec.t2[0].reply,
      choices: mapChoices(spec.t3, `${p}-t4`, tensionAwalId),
    },
    {
      id: `${p}-t4`,
      sceneId: 'bk',
      stage: 'eksplorasi',
      depth: 1,
      reply: spec.t3[0].reply,
      choices: mapChoices(spec.t4, `${p}-t5`, tensionAwalId),
    },
    {
      id: `${p}-t5`,
      sceneId: 'bk',
      stage: 'pemahaman',
      depth: 2,
      reply: spec.t4[0].reply,
      marks: ['momen-terbuka'],
      onEnter: { setFlags: ['momen-terbuka'] },
      choices: mapChoices(spec.t5, `${p}-t6`, tensionAwalId),
    },
    {
      id: `${p}-t6`,
      sceneId: 'bk',
      stage: 'rencana',
      depth: 2,
      reply: spec.t5[0].reply,
      choices: mapChoices(spec.t6, `${p}-t7`, tensionAwalId, ['langkah-kecil']),
    },
    {
      id: `${p}-t7`,
      sceneId: 'bk',
      stage: 'rencana',
      depth: 2,
      reply: spec.t6[0].reply,
      choices: spec.t7.map((opt) => ({
        id: opt.id,
        skillId: opt.skillId,
        text: opt.text,
        best: opt.best,
        options: opt.options,
        reaction: opt.reply,
        next: '@ending',
        setFlags: opt.isMisstep ? opt.setFlags : [...(opt.setFlags ?? []), 'tutup-hangat'],
      })),
    },

    // Simpul ketegangan awal (1 klik mengakui -> masuk perbaikan)
    {
      id: tensionAwalId,
      sceneId: 'bk',
      stage: 'hubungan',
      depth: 0,
      reply: spec.tensionOpening,
      tension: { phase: 'awal' },
      choices: [
        {
          id: 'akui',
          skillId: 'sampaikan-pengamatan',
          text: 'Sebentar, sepertinya ucapanku barusan membuatmu kurang nyaman. Aku ingin mendengarmu dengan benar.',
          options: { observationTone: 'faktual' },
          action: { kind: 'akui-ketegangan' },
          reaction: spec.tensionRecognized,
          next: tensionRepairId,
          best: true,
        },
        {
          id: 'tunggu',
          skillId: 'jeda-hening',
          text: 'Tarik napas dulu saja, tidak usah terburu-buru.',
          reaction: line(
            'Hm... aku masih agak kaku saja dengan kalimat tadi, Bu.',
            'menutup-diri',
            `${spec.firstName} tetap menunduk dengan bahu yang belum mengendur.`,
          ),
          next: tensionAwalId,
        },
        {
          id: 'desak',
          skillId: 'pertanyaan-tertutup',
          text: 'Sudahlah, tidak usah dibesar-besarkan. Langsung jawab pertanyaan saya tadi saja.',
          reaction: line(
            'Bu, kalau terus seperti ini aku benar-benar makin nggak nyaman...',
            'kesal',
            `${spec.firstName} menggeser kursinya menjauh dan menatap lantai dengan tegang.`,
          ),
          next: tensionAwalId,
        },
      ],
    },

    // Simpul perbaikan singkat: akui dampak + beri pilihan -> kembali lancar (@resume)!
    {
      id: tensionRepairId,
      sceneId: 'bk',
      stage: 'eksplorasi',
      depth: 1,
      reply: spec.tensionRecognized,
      tension: { phase: 'perbaikan' },
      choices: [
        {
          id: 'akui-dampak',
          skillId: 'validasi-normalisasi',
          text: 'Maaf ya, tadi aku terlalu cepat menyimpulkan. Perasaanmu jauh lebih penting untuk kudengar dulu.',
          action: { kind: 'perbaikan', step: 'akui-dampak' },
          reaction: line(
            'Makasih sudah bilang begitu, Bu... itu membuatku sedikit lebih lega.',
            'netral',
            `Bahu ${spec.firstName} turun pelan dan tatapannya kembali melunak.`,
          ),
          next: tensionRepairId,
          routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
          best: true,
        },
        {
          id: 'beri-pilihan',
          skillId: 'jeda-hening',
          text: 'Kita bisa lanjut pelan-pelan sesuai ritmemu, atau cukup dulu kalau belum nyaman. Kamu yang pilih.',
          action: { kind: 'perbaikan', step: 'beri-pilihan' },
          reaction: line(
            'Kalau pelan-pelan seperti ini, aku mau lanjut cerita kok, Bu.',
            'lega',
            `${spec.firstName} mengangguk tenang dan kembali menghadap konselor.`,
          ),
          next: tensionRepairId,
          routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
        },
        {
          id: 'desak',
          skillId: 'meremehkan',
          text: 'Sudahlah, tidak usah dibesar-besarkan. Langsung ke intinya saja.',
          reaction: spec.endings.menarikDiri,
          next: '@ending',
        },
      ],
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
    tensionFallbackNodeId: tensionAwalId,
    endings: {
      terbantu: `${p}-akhir-terbantu`,
      'kemajuan-kecil': `${p}-akhir-kemajuan`,
      'menarik-diri-sementara': `${p}-akhir-menarik`,
    },
    outcomeRules: {
      helpedMinQuality: 32,
      helpedMinLevel: 0,
      requiredFlags: ['momen-terbuka', 'langkah-kecil', 'tutup-hangat'],
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
