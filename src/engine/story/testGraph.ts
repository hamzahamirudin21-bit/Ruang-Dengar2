/**
 * Graf sintetis kecil yang VALID untuk menguji runner dan validator.
 * Bukan konten cerita sungguhan: teks dibuat singkat tetapi wajar.
 *
 * Struktur: dua adegan (lab, ruang-konsultasi), pembukaan baku, simpul bergerbang
 * dengan alternatif, simpul Ketegangan fase awal, hub perbaikan, tiga akhir.
 */
import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { buildOpeningNode } from '../../data/storyStages';
import type {
  AgentMemoryRecord, CounselorSkillId, RuptureKind, StudentAgent,
} from '../../types';
import { createEmptyAgentMemory } from '../memory';
import { determineRuptureKind } from '../rupture';
import { buildAgentSessionVars } from '../trust';
import type {
  StoryChoice, StoryExpression, StoryGraph, StoryLine, StoryNode,
} from './storyTypes';

export const TEST_STUDENT_ID = 'mhs-14';
export const TEST_STUDENT_NICKNAME = 'Rani';

/** Id simpul penting, diekspor agar uji dapat merujuknya. */
export const TEST_NODE = {
  start: 't-buka',
  labTolak: 't-lab-tolak',
  konsultasiMasuk: 't-k1',
  gated: 't-k4',
  gatedAlt: 't-k4-alt',
  plan: 't-k6',
  closing: 't-tutup',
  tension: 't-tegang',
  repairHub: 't-perbaikan',
  endTerbantu: 't-akhir-terbantu',
  endKemajuan: 't-akhir-kemajuan',
  endMenarik: 't-akhir-menarik',
} as const;

export const TEST_FLAGS = {
  boundary: 'batas-dijelaskan',
  observation: 'pengamatan-faktual',
  plan: 'langkah-kecil',
} as const;

/* ------------------------------------------------------------------ */
/* Pembantu agen dan memori                                            */
/* ------------------------------------------------------------------ */

/** Agen uji dari blueprint (default mhs-14), sama bentuknya dengan agen dunia awal. */
export function createTestAgent(studentId: string = TEST_STUDENT_ID): StudentAgent {
  const bp = STUDENT_BLUEPRINTS.find((b) => b.id === studentId);
  if (!bp) throw new Error(`Blueprint tidak ditemukan: ${studentId}`);
  return {
    id: bp.id,
    name: bp.name,
    cohort: bp.cohort,
    demographicLabel: bp.demographicLabel,
    uniquePotential: bp.uniquePotential,
    socialCircleHint: bp.socialCircleHint,
    counselingDomain: bp.counselingDomain,
    interests: { ...bp.interests },
    skills: { ...bp.skills },
    personality: { ...bp.personality },
    solitudePreference: bp.solitudePreference,
    affinities: {},
    position: { x: 5, y: 5 },
    tilePosition: { x: 5, y: 5 },
    targetPosition: null,
    path: [],
    pathStepIndex: 0,
    currentZoneId: bp.initialZoneId,
    targetZoneId: bp.initialZoneId,
    activityGoal: 'Praktikum',
    status: 'bekerja',
    energy: 0.8,
    stress: 0.4,
    taskLoad: 0.5,
    activityDurationTicks: 0,
    socialStatus: 'sendiri',
    interactingWithIds: [],
    hiddenVars: { ...bp.hiddenVars },
  };
}

/** Konteks memori kosong untuk agen uji. */
export function createTestMemory(agentId: string = TEST_STUDENT_ID): AgentMemoryRecord {
  return createEmptyAgentMemory(agentId);
}

/** Jenis keretakan yang diharapkan validator untuk agen uji (paparan 0). */
export function expectedTestRuptureKind(agent: StudentAgent = createTestAgent()): RuptureKind {
  return determineRuptureKind(agent, buildAgentSessionVars(agent, 0));
}

/* ------------------------------------------------------------------ */
/* Pembantu penulisan                                                  */
/* ------------------------------------------------------------------ */

function line(text: string, expression: StoryExpression, cue: string, aside?: string): StoryLine {
  return { text, expression, cue, ...(aside ? { aside } : {}) };
}

function choice(
  id: string,
  skillId: CounselorSkillId,
  text: string,
  next: string,
  extra: Partial<StoryChoice> = {},
): StoryChoice {
  return { id, skillId, text, next, ...extra };
}

const N = TEST_NODE;

/* ------------------------------------------------------------------ */
/* Simpul                                                              */
/* ------------------------------------------------------------------ */

function buildNodes(): StoryNode[] {
  const opening = buildOpeningNode({
    id: N.start,
    studentId: TEST_STUDENT_ID,
    sceneId: 'lab',
    name: TEST_STUDENT_NICKNAME,
    reply: line(
      'Oh, halo, Pak atau Bu. Saya lagi merapikan kabel di sini.',
      'waspada',
      'Rani menoleh sebentar lalu kembali menatap meja.',
    ),
    next: {
      'sapaan-hangat': 't-lab2',
      'pertanyaan-terbuka': 't-lab2',
      'pertanyaan-tertutup': 't-lab2',
      'nasihat-dini': 't-lab2',
    },
  });

  const nodes: StoryNode[] = [
    opening,
    {
      id: 't-lab2',
      sceneId: 'lab',
      stage: 'hubungan',
      depth: 0,
      reply: line(
        'Iya, lumayan. Hari ini tugasnya agak banyak.',
        'netral',
        'Tangannya terus merapikan kabel.',
        'Beberapa teman di meja sebelah tertawa keras tiba-tiba.',
      ),
      marks: ['kejutan'],
      choices: [
        choice('a', 'afirmasi-kekuatan',
          'Kabelmu rapi sekali. Kelihatan kamu teliti.', 't-lab3', { best: true }),
        choice('b', 'jeda-hening',
          'Silakan lanjutkan, saya duduk di sini saja dulu.', 't-lab3'),
        choice('c', 'validasi-normalisasi',
          'Wajar kalau hari seperti ini terasa penuh.', 't-lab3'),
        choice('d', 'pertanyaan-tertutup',
          'Tugasnya sudah selesai, kan?', 't-lab3'),
      ],
    },
    {
      id: 't-lab3',
      sceneId: 'lab',
      stage: 'hubungan',
      depth: 1,
      reply: line(
        'Di sini agak ramai ya. Saya jadi susah fokus.',
        'menunduk',
        'Suaranya mengecil, matanya melirik ke sekitar.',
      ),
      choices: [
        choice('a', 'validasi-normalisasi',
          'Ramai begini memang bikin sulit fokus. Mau kita ngobrol di ruang konsultasi yang lebih tenang?',
          N.konsultasiMasuk, {
            best: true,
            routes: [{ when: [{ type: 'trust-max', value: 29 }], next: N.labTolak }],
          }),
        choice('b', 'pertanyaan-terbuka',
          'Apa yang paling bikin kamu susah fokus di sini?', N.konsultasiMasuk),
        choice('c', 'jeda-hening',
          'Kita diam sebentar saja kalau kamu mau.', N.konsultasiMasuk),
        choice('d', 'pertanyaan-tertutup',
          'Kamu cuma kurang tidur, ya?', N.labTolak),
      ],
    },
    {
      id: N.labTolak,
      sceneId: 'lab',
      stage: 'hubungan',
      depth: 0,
      reply: line(
        'Nanti saja, saya masih mau beres-beres di sini.',
        'menutup-diri',
        'Rani menggeser kursinya sedikit menjauh.',
      ),
      choices: [
        choice('a', 'jeda-hening',
          'Tidak apa-apa. Kalau nanti kamu mau, saya tunggu di ruang konsultasi.',
          N.konsultasiMasuk, { best: true }),
        choice('b', 'validasi-normalisasi',
          'Wajar kalau kamu belum nyaman. Pelan-pelan saja.', N.konsultasiMasuk),
        choice('c', 'sapaan-hangat',
          'Terima kasih sudah mau ngobrol sebentar tadi.', N.konsultasiMasuk),
        choice('d', 'nasihat-dini',
          'Sebaiknya kamu jangan menghindar terus.', N.konsultasiMasuk),
      ],
    },
    {
      id: N.konsultasiMasuk,
      sceneId: 'ruang-konsultasi',
      stage: 'hubungan',
      depth: 0,
      reply: line(
        'Di sini lebih sepi. Jadi, bagaimana ini berjalan?',
        'waspada',
        'Rani duduk di tepi kursi, tangan di pangkuan.',
      ),
      choices: [
        choice('a', 'batas-kerahasiaan',
          'Yang kamu ceritakan di sini tetap di antara kita, kecuali ada hal yang membahayakan.',
          't-k2', { best: true, setFlags: [TEST_FLAGS.boundary] }),
        choice('b', 'sapaan-hangat',
          'Terima kasih sudah mau datang ke sini.', 't-k2'),
        choice('c', 'jeda-hening',
          'Ambil waktu yang kamu perlukan.', 't-k2'),
        choice('d', 'pertanyaan-tertutup',
          'Kamu tidak keberatan cerita, kan?', 't-k2'),
      ],
    },
    {
      id: 't-k2',
      sceneId: 'ruang-konsultasi',
      stage: 'eksplorasi',
      depth: 1,
      reply: line(
        'Akhir-akhir ini saya sering kewalahan sama tugas kelompok.',
        'lelah',
        'Ia menghela napas pendek.',
      ),
      choices: [
        choice('a', 'pertanyaan-terbuka',
          'Ceritakan, bagian mana dari tugas kelompok yang paling terasa berat?', 't-k3', { best: true }),
        choice('b', 'jeda-hening',
          'Saya dengarkan, silakan lanjut.', 't-k3'),
        choice('c', 'validasi-normalisasi',
          'Banyak mahasiswa mengalami hal serupa.', 't-k3'),
        choice('d', 'interogasi',
          'Kenapa tugasmu selalu telat? Jawab dengan jelas.', N.tension),
      ],
    },
    {
      id: 't-k3',
      sceneId: 'ruang-konsultasi',
      stage: 'eksplorasi',
      depth: 1,
      reply: line(
        'Kadang saya merasa lebih baik diam saja daripada salah bicara.',
        'menunduk',
        'Jarinya memainkan ujung lengan baju.',
      ),
      marks: ['isyarat-nonverbal'],
      choices: [
        choice('a', 'sampaikan-pengamatan',
          'Saya perhatikan kamu cukup pendiam di lab tadi, dan sekarang kamu sering menunduk.',
          N.gated, { best: true, options: { observationTone: 'faktual' }, setFlags: [TEST_FLAGS.observation] }),
        choice('b', 'sampaikan-pengamatan',
          'Kamu memang tipe yang kurang percaya diri.',
          N.gated, { options: { observationTone: 'menilai' } }),
        choice('c', 'pertanyaan-terbuka',
          'Apa yang biasanya kamu pikirkan sebelum memilih diam?', N.gated),
        choice('d', 'jeda-hening',
          'Tidak perlu buru-buru menjawab.', N.gated),
      ],
    },
    {
      id: N.gated,
      sceneId: 'ruang-konsultasi',
      stage: 'pemahaman',
      depth: 2,
      reply: line(
        'Sebenarnya saya takut idenya dianggap salah, jadi saya tidak berani bilang.',
        'tertegun',
        'Matanya berkaca, suaranya hampir tak terdengar.',
      ),
      marks: ['momen-terbuka'],
      gate: { conditions: [{ type: 'level-min', value: 1 }], otherwise: N.gatedAlt },
      choices: [
        choice('a', 'refleksi-perasaan',
          'Kedengarannya kamu ragu dengan ide sendiri, dan itu bikin berat.',
          't-k5', { best: true, options: { reflectionNuance: 'ragu-kurang-percaya' } }),
        choice('b', 'refleksi-perasaan',
          'Kamu pasti marah sama teman-temanmu.',
          't-k5', { options: { reflectionCorrectOverride: false } }),
        choice('c', 'parafrase-ringkasan',
          'Jadi kamu menahan ide karena khawatir dinilai salah.', 't-k5'),
        choice('d', 'validasi-normalisasi',
          'Perasaan seperti itu bisa dimengerti.', 't-k5'),
      ],
    },
    {
      id: N.gatedAlt,
      sceneId: 'ruang-konsultasi',
      stage: 'pemahaman',
      depth: 1,
      reply: line(
        'Ya, kadang saya memang ragu mau ngomong apa.',
        'netral',
        'Ia mengangkat bahu pelan.',
      ),
      choices: [
        choice('a', 'pertanyaan-terbuka',
          'Bisa ceritakan lebih banyak tentang rasa ragu itu?', 't-k5', { best: true }),
        choice('b', 'validasi-normalisasi',
          'Ragu itu hal yang manusiawi.', 't-k5'),
        choice('c', 'parafrase-ringkasan',
          'Jadi ada saat-saat kamu bingung harus berkata apa.', 't-k5'),
        choice('d', 'meremehkan',
          'Ah, itu hal kecil, nanti juga biasa.', 't-k5'),
      ],
    },
    {
      id: 't-k5',
      sceneId: 'ruang-konsultasi',
      stage: 'pemahaman',
      depth: 1,
      reply: line(
        'Iya, kira-kira begitu. Rasanya agak lega bisa bilang.',
        'lega',
        'Bahunya sedikit turun.',
      ),
      choices: [
        choice('a', 'parafrase-ringkasan',
          'Jadi kamu punya ide, tetapi takut salah, dan kamu memilih diam. Begitu?', N.plan, { best: true }),
        choice('b', 'validasi-normalisasi',
          'Terima kasih sudah mau terbuka soal ini.', N.plan),
        choice('c', 'pertanyaan-terbuka',
          'Apa yang paling kamu butuhkan sekarang?', N.plan),
        choice('d', 'nasihat-dini',
          'Pokoknya kamu harus lebih berani bicara.', N.plan),
      ],
    },
    {
      id: N.plan,
      sceneId: 'ruang-konsultasi',
      stage: 'rencana',
      depth: 1,
      reply: line(
        'Mungkin saya bisa coba sampaikan satu ide kecil di pertemuan kelompok berikutnya.',
        'tersenyum',
        'Ia tersenyum tipis untuk pertama kali.',
      ),
      choices: [
        choice('a', 'afirmasi-kekuatan',
          'Satu ide kecil itu langkah yang bagus, dan kamu sudah menunjukkan keberanian hari ini.',
          N.closing, { best: true, setFlags: [TEST_FLAGS.plan] }),
        choice('b', 'parafrase-ringkasan',
          'Jadi langkah berikutnya, menyampaikan satu ide di kelompok.', N.closing),
        choice('c', 'batas-kerahasiaan',
          'Kalau kamu mau, kita bisa bahas lagi dan tetap rahasia.', N.closing),
        choice('d', 'janji-mutlak',
          'Saya jamin semuanya pasti beres setelah ini.', N.closing),
      ],
    },
    {
      id: N.closing,
      sceneId: 'ruang-konsultasi',
      stage: 'rencana',
      depth: 1,
      reply: line(
        'Terima kasih sudah mendengarkan. Saya jadi punya bayangan mau mulai dari mana.',
        'netral',
        'Rani berdiri dan merapikan tasnya.',
      ),
      choices: [
        choice('a', 'parafrase-ringkasan',
          'Hari ini kita sudah membahas rasa ragu dan satu langkah kecil. Sampai bertemu lagi.',
          '@ending', { best: true }),
        choice('b', 'validasi-normalisasi',
          'Terima kasih sudah jujur hari ini.', '@ending'),
        choice('c', 'afirmasi-kekuatan',
          'Kamu lebih kuat dari yang kamu kira.', '@ending'),
        choice('d', 'nasihat-dini',
          'Ingat, jangan diam lagi mulai besok.', '@ending'),
      ],
    },
    {
      id: N.tension,
      sceneId: 'ruang-konsultasi',
      stage: 'eksplorasi',
      depth: 0,
      reply: line(
        'Saya merasa seperti sedang diinterogasi.',
        'menutup-diri',
        'Rani menyilangkan tangan dan memalingkan wajah.',
      ),
      tension: { phase: 'awal', expectedKind: expectedTestRuptureKind() },
      choices: [
        choice('a', 'sampaikan-pengamatan',
          'Saya lihat suasananya berubah tegang setelah pertanyaan saya tadi.',
          N.repairHub, {
            best: true,
            action: { kind: 'akui-ketegangan' },
            options: { observationTone: 'faktual' },
          }),
        choice('b', 'jeda-hening',
          'Kita lanjutkan saja, ya.', N.closing),
        choice('c', 'pertanyaan-terbuka',
          'Jadi, bagaimana tugas kelompokmu?', N.closing),
        choice('d', 'nasihat-dini',
          'Jangan terlalu sensitif begitu.', N.closing),
      ],
    },
    {
      id: N.repairHub,
      sceneId: 'ruang-konsultasi',
      stage: 'eksplorasi',
      depth: 0,
      reply: line(
        'Hmm... iya, tadi memang tidak enak.',
        'waspada',
        'Ia melirik sebentar, belum sepenuhnya rileks.',
      ),
      tension: { phase: 'perbaikan', expectedKind: expectedTestRuptureKind() },
      choices: [
        choice('a', 'validasi-normalisasi',
          'Pertanyaan saya tadi terasa menekanmu. Itu berdampak, dan saya mengakuinya.',
          N.repairHub, {
            best: true,
            action: { kind: 'perbaikan', step: 'akui-dampak' },
            routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
          }),
        choice('b', 'pertanyaan-terbuka',
          'Boleh ceritakan, apa yang kamu rasakan tadi?',
          N.repairHub, {
            action: { kind: 'perbaikan', step: 'eksplorasi-perasaan' },
            routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
          }),
        choice('c', 'jeda-hening',
          'Kamu boleh memilih, lanjut ngobrol atau istirahat dulu.',
          N.repairHub, {
            action: { kind: 'perbaikan', step: 'beri-pilihan' },
            routes: [{ when: [{ type: 'tension', active: false }], next: '@resume' }],
          }),
        choice('d', 'nasihat-dini',
          'Sudahlah, lupakan saja yang tadi.', N.closing),
      ],
    },
    {
      id: N.endTerbantu,
      sceneId: 'ruang-konsultasi',
      stage: 'rencana',
      depth: 1,
      reply: line(
        'Saya akan coba. Terima kasih ya.',
        'tersenyum',
        'Rani mengangguk mantap sebelum keluar.',
      ),
      ending: { kind: 'terbantu' },
      choices: [],
    },
    {
      id: N.endKemajuan,
      sceneId: 'ruang-konsultasi',
      stage: 'rencana',
      depth: 1,
      reply: line(
        'Oke. Saya pikirkan dulu.',
        'netral',
        'Ia mengangguk pelan lalu pergi.',
      ),
      ending: { kind: 'kemajuan-kecil' },
      choices: [],
    },
    {
      id: N.endMenarik,
      sceneId: 'ruang-konsultasi',
      stage: 'rencana',
      depth: 0,
      reply: line(
        'Saya mau pergi dulu.',
        'menutup-diri',
        'Rani berdiri dan keluar tanpa menoleh.',
      ),
      ending: { kind: 'menarik-diri-sementara' },
      choices: [],
    },
  ];

  return nodes;
}

/* ------------------------------------------------------------------ */
/* Graf                                                                */
/* ------------------------------------------------------------------ */

/** Membuat graf sintetis baru (salinan segar tiap panggilan, aman dimutasi oleh uji). */
export function createTestGraph(): StoryGraph {
  return {
    version: 1,
    studentId: TEST_STUDENT_ID,
    kind: 'tahap-awal',
    placeholder: false,
    title: 'Graf Uji Sintetis',
    scenes: [
      {
        id: 'lab',
        setting: 'lab',
        title: 'Di Lab',
        caption: 'Lab sedang ramai. Rani sibuk merapikan kabel di mejanya.',
        witnessCount: 3,
        maxDialogueLevel: 1,
        entryTransition: 'potong-adegan',
        entryNodeId: N.start,
      },
      {
        id: 'ruang-konsultasi',
        setting: 'ruang-konsultasi',
        title: 'Ruang Konsultasi',
        caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan.',
        witnessCount: 0,
        maxDialogueLevel: 3,
        entryTransition: 'jalan-berdua',
        entryNodeId: N.konsultasiMasuk,
      },
    ],
    startNodeId: N.start,
    closingNodeId: N.closing,
    tensionFallbackNodeId: N.tension,
    endings: {
      'terbantu': N.endTerbantu,
      'kemajuan-kecil': N.endKemajuan,
      'menarik-diri-sementara': N.endMenarik,
    },
    outcomeRules: {
      helpedMinQuality: 70,
      helpedMinLevel: 2,
      requiredFlags: [TEST_FLAGS.boundary, TEST_FLAGS.observation],
      planFlag: TEST_FLAGS.plan,
    },
    nodes: buildNodes(),
  };
}

/** Graf sintetis bersama (jangan dimutasi; pakai `createTestGraph()` untuk mutasi). */
export const TEST_GRAPH: StoryGraph = createTestGraph();
