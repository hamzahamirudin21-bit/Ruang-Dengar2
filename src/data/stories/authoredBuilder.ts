/**
 * Pembangun Story_Graph penuh (15 giliran, 2 adegan Lab -> Ruang Konsultasi,
 * gerbang kedalaman L2/L3, perbaikan ketegangan, dan reaction unik pada setiap pilihan).
 */
import type { CounselorSkillId, EmotionReflectionNuance } from '../../types';
import type {
  StoryChoice,
  StoryExpression,
  StoryGraph,
  StoryLine,
  StoryNode,
} from '../../engine/story/storyTypes';
import { buildOpeningNode } from '../storyStages';

export interface AuthoredChoiceSpec {
  id: string;
  skillId: CounselorSkillId;
  text: string;
  best?: boolean;
  options?: StoryChoice['options'];
  setFlags?: string[];
  toTension?: boolean;
  reaction?: StoryLine;
}

export interface AuthoredFullStorySpec {
  studentId: string;
  prefix: string;
  firstName: string;
  title: string;
  labTitle: string;
  labCaption: string;
  bkCaption: string;
  primaryNuance: EmotionReflectionNuance;
  openingReply: StoryLine;
  openingReactions: Record<'sapaan-hangat' | 'pertanyaan-terbuka' | 'pertanyaan-tertutup' | 'nasihat-dini', StoryLine>;
  steps: {
    n1: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n2: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n3: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n4: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n5: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n6: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n7: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n8: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n8alt: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n9: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n10: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n10alt: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n11: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n12: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n13: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
    n14: { reply: StoryLine; choices: readonly [AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec, AuthoredChoiceSpec] };
  };
  tension: {
    awalReply: StoryLine;
    perbaikanReply: StoryLine;
  };
  endings: {
    terbantu: StoryLine;
    kemajuan: StoryLine;
    menarik: StoryLine;
  };
}

export function mkLine(
  text: string,
  expression: StoryExpression,
  cue: string,
  aside?: string,
): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

export function buildAuthoredFullStory(spec: AuthoredFullStorySpec): StoryGraph {
  const p = spec.prefix;
  const id = {
    n0: `${p}-buka`,
    n1: `${p}-l1`,
    n2: `${p}-l2`,
    n3: `${p}-l3`,
    n4: `${p}-b1`,
    n5: `${p}-b2`,
    n6: `${p}-e1`,
    n7: `${p}-e2`,
    n8: `${p}-e3`,
    n8alt: `${p}-e3-alt`,
    n9: `${p}-e4`,
    n10: `${p}-p1`,
    n10alt: `${p}-p1-alt`,
    n11: `${p}-p2`,
    n12: `${p}-r1`,
    n13: `${p}-r2`,
    n14: `${p}-r3`,
    tegang: `${p}-tegang`,
    hub: `${p}-perbaikan`,
    endT: `${p}-akhir-terbantu`,
    endK: `${p}-akhir-kemajuan`,
    endM: `${p}-akhir-menarik`,
  };

  const mapChoices = (
    list: readonly AuthoredChoiceSpec[],
    defaultNext: string,
  ): StoryChoice[] =>
    list.map((c) => ({
      id: c.id,
      skillId: c.skillId,
      text: c.text,
      next: c.toTension ? id.tegang : defaultNext,
      ...(c.best ? { best: true } : {}),
      ...(c.options ? { options: c.options } : {}),
      ...(c.setFlags ? { setFlags: c.setFlags } : {}),
      ...(c.reaction ? { reaction: c.reaction } : {}),
    }));

  const openingBase = buildOpeningNode({
    id: id.n0,
    studentId: spec.studentId,
    sceneId: 'lab',
    name: spec.firstName,
    reply: spec.openingReply,
    next: {
      'sapaan-hangat': id.n1,
      'pertanyaan-terbuka': id.n1,
      'pertanyaan-tertutup': id.n1,
      'nasihat-dini': id.n1,
    },
  });
  const opening: StoryNode = {
    ...openingBase,
    choices: openingBase.choices.map((c) => ({
      ...c,
      reaction: spec.openingReactions[c.skillId as keyof typeof spec.openingReactions],
    })),
  };

  const repairRoute = [{ when: [{ type: 'tension' as const, active: false }], next: '@resume' }];

  const nodes: StoryNode[] = [
    opening,
    {
      id: id.n1, sceneId: 'lab', stage: 'hubungan', depth: 0,
      reply: spec.steps.n1.reply,
      choices: mapChoices(spec.steps.n1.choices, id.n2),
    },
    {
      id: id.n2, sceneId: 'lab', stage: 'hubungan', depth: 1,
      marks: ['kejutan'],
      reply: spec.steps.n2.reply,
      choices: mapChoices(spec.steps.n2.choices, id.n3),
    },
    {
      id: id.n3, sceneId: 'lab', stage: 'hubungan', depth: 1,
      reply: spec.steps.n3.reply,
      choices: mapChoices(spec.steps.n3.choices, id.n4),
    },
    {
      id: id.n4, sceneId: 'bk', stage: 'hubungan', depth: 0,
      reply: spec.steps.n4.reply,
      choices: mapChoices(spec.steps.n4.choices, id.n5),
    },
    {
      id: id.n5, sceneId: 'bk', stage: 'hubungan', depth: 1,
      reply: spec.steps.n5.reply,
      choices: mapChoices(spec.steps.n5.choices, id.n6),
    },
    {
      id: id.n6, sceneId: 'bk', stage: 'eksplorasi', depth: 1,
      reply: spec.steps.n6.reply,
      choices: mapChoices(spec.steps.n6.choices, id.n7),
    },
    {
      id: id.n7, sceneId: 'bk', stage: 'eksplorasi', depth: 1,
      reply: spec.steps.n7.reply,
      choices: mapChoices(spec.steps.n7.choices, id.n8),
    },
    {
      id: id.n8, sceneId: 'bk', stage: 'eksplorasi', depth: 2,
      marks: ['isyarat-nonverbal'],
      gate: { conditions: [{ type: 'level-min', value: 1 }], otherwise: id.n8alt },
      reply: spec.steps.n8.reply,
      choices: mapChoices(spec.steps.n8.choices, id.n9),
    },
    {
      id: id.n8alt, sceneId: 'bk', stage: 'eksplorasi', depth: 1,
      reply: spec.steps.n8alt.reply,
      choices: mapChoices(spec.steps.n8alt.choices, id.n9),
    },
    {
      id: id.n9, sceneId: 'bk', stage: 'eksplorasi', depth: 1,
      reply: spec.steps.n9.reply,
      choices: mapChoices(spec.steps.n9.choices, id.n10),
    },
    {
      id: id.n10, sceneId: 'bk', stage: 'pemahaman', depth: 3,
      marks: ['momen-terbuka'],
      onEnter: { setFlags: ['momen-terbuka'] },
      gate: { conditions: [{ type: 'level-min', value: 2 }], otherwise: id.n10alt },
      reply: spec.steps.n10.reply,
      choices: mapChoices(spec.steps.n10.choices, id.n11),
    },
    {
      id: id.n10alt, sceneId: 'bk', stage: 'pemahaman', depth: 1,
      reply: spec.steps.n10alt.reply,
      choices: mapChoices(spec.steps.n10alt.choices, id.n11),
    },
    {
      id: id.n11, sceneId: 'bk', stage: 'pemahaman', depth: 1,
      reply: spec.steps.n11.reply,
      choices: mapChoices(spec.steps.n11.choices, id.n12),
    },
    {
      id: id.n12, sceneId: 'bk', stage: 'rencana', depth: 1,
      reply: spec.steps.n12.reply,
      choices: mapChoices(spec.steps.n12.choices, id.n13),
    },
    {
      id: id.n13, sceneId: 'bk', stage: 'rencana', depth: 1,
      reply: spec.steps.n13.reply,
      choices: mapChoices(spec.steps.n13.choices, id.n14),
    },
    {
      id: id.n14, sceneId: 'bk', stage: 'rencana', depth: 1,
      reply: spec.steps.n14.reply,
      choices: mapChoices(spec.steps.n14.choices, '@ending'),
    },
    {
      id: id.tegang, sceneId: 'bk', stage: 'eksplorasi', depth: 0,
      tension: { phase: 'awal' },
      reply: spec.tension.awalReply,
      choices: [
        {
          id: 'akui',
          skillId: 'sampaikan-pengamatan',
          text: 'Saya melihat suasananya mendadak tegang setelah kalimat saya barusan.',
          next: id.hub,
          best: true,
          action: { kind: 'akui-ketegangan' },
          options: { observationTone: 'faktual' },
        },
        {
          id: 'diam',
          skillId: 'jeda-hening',
          text: 'Kita tarik napas sebentar lalu lanjut pelan-pelan ya.',
          next: id.n12,
          reaction: mkLine(`Ya sudah Bu, kita langsung bahas langkah selanjutnya saja.`, 'waspada', `${spec.firstName} menghela napas pendek.`),
        },
        {
          id: 'alihkan',
          skillId: 'pertanyaan-terbuka',
          text: 'Kalau begitu, rencana kegiatanmu minggu ini bagaimana?',
          next: id.n12,
          reaction: mkLine(`Rencanaku masih biasa saja kok Bu, belum berubah.`, 'netral', `${spec.firstName} menjawab datar.`),
        },
        {
          id: 'salahkan',
          skillId: 'nasihat-dini',
          text: 'Jangan terlalu cepat tersinggung, maksud saya kan baik.',
          next: id.n12,
          reaction: mkLine(`Iya Bu, mungkin aku saja yang kurang siap mendengar itu.`, 'menutup-diri', `${spec.firstName} melipat tangannya.`),
        },
      ],
    },
    {
      id: id.hub, sceneId: 'bk', stage: 'eksplorasi', depth: 0,
      tension: { phase: 'perbaikan' },
      reply: spec.tension.perbaikanReply,
      choices: [
        {
          id: 'dampak',
          skillId: 'validasi-normalisasi',
          text: 'Maaf, ucapan saya tadi menyudutkanmu. Dampaknya nyata dan saya mengakuinya.',
          next: id.hub,
          best: true,
          action: { kind: 'perbaikan', step: 'akui-dampak' },
          routes: repairRoute,
        },
        {
          id: 'eksplor',
          skillId: 'pertanyaan-terbuka',
          text: 'Bagian mana dari kalimat saya tadi yang paling terasa mengganjal?',
          next: id.hub,
          action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
          routes: repairRoute,
        },
        {
          id: 'pilihan',
          skillId: 'jeda-hening',
          text: 'Kamu bebas memilih: kita lanjut pelan atau berhenti sejenak.',
          next: id.hub,
          action: { kind: 'perbaikan', step: 'beri-pilihan' },
          routes: repairRoute,
        },
        {
          id: 'lupakan',
          skillId: 'nasihat-dini',
          text: 'Sudah, lupakan saja kejadian barusan supaya cepat selesai.',
          next: id.n12,
          reaction: mkLine(`Oke Bu, kita langsung ke bagian akhirnya saja.`, 'waspada', `${spec.firstName} menunduk singkat.`),
        },
      ],
    },
    {
      id: id.endT, sceneId: 'bk', stage: 'rencana', depth: 1,
      ending: { kind: 'terbantu' },
      reply: spec.endings.terbantu,
      choices: [],
    },
    {
      id: id.endK, sceneId: 'bk', stage: 'rencana', depth: 1,
      ending: { kind: 'kemajuan-kecil' },
      reply: spec.endings.kemajuan,
      choices: [],
    },
    {
      id: id.endM, sceneId: 'bk', stage: 'rencana', depth: 0,
      ending: { kind: 'menarik-diri-sementara' },
      reply: spec.endings.menarik,
      choices: [],
    },
  ];

  return {
    version: 1,
    studentId: spec.studentId,
    kind: 'penuh',
    placeholder: false,
    title: spec.title,
    scenes: [
      {
        id: 'lab',
        setting: 'lab',
        title: spec.labTitle,
        caption: spec.labCaption,
        witnessCount: 2,
        maxDialogueLevel: 1,
        entryTransition: 'potong-adegan',
        entryNodeId: id.n0,
      },
      {
        id: 'bk',
        setting: 'ruang-konsultasi',
        title: 'Ruang Konsultasi',
        caption: spec.bkCaption,
        witnessCount: 0,
        maxDialogueLevel: 3,
        entryTransition: 'jalan-berdua',
        entryNodeId: id.n4,
      },
    ],
    startNodeId: id.n0,
    closingNodeId: id.n14,
    tensionFallbackNodeId: id.tegang,
    endings: {
      terbantu: id.endT,
      'kemajuan-kecil': id.endK,
      'menarik-diri-sementara': id.endM,
    },
    outcomeRules: {
      helpedMinQuality: 66,
      helpedMinLevel: 2,
      requiredFlags: ['batas-dijelaskan', 'langkah-kecil'],
      planFlag: 'langkah-kecil',
    },
    nodes,
  };
}
