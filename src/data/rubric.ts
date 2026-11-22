import type { RubricConfig, RubricItemId, StrategyPreset } from '../types';

export const RUBRIC_ITEM_IDS = [
  'sasaran',
  'jalur-kontak',
  'kualitas-pertanyaan',
  'kesalahan-fatal',
  'keretakan-perbaikan',
  'kerahasiaan-peran',
  'ritme',
  'catatan-pengamatan',
] as const satisfies readonly RubricItemId[];

/** Selaras dengan STRINGS.debrief.rubric.itemLabels. */
export const RUBRIC_ITEM_LABELS: Record<RubricItemId, string> = {
  sasaran: 'Pemilihan Sasaran',
  'jalur-kontak': 'Pemilihan Jalur Kontak',
  'kualitas-pertanyaan': 'Kualitas Pertanyaan',
  'kesalahan-fatal': 'Kesalahan Fatal',
  'keretakan-perbaikan': 'Deteksi dan Perbaikan Keretakan',
  'kerahasiaan-peran': 'Kerahasiaan dan Batas Peran',
  ritme: 'Ritme Sesi',
  'catatan-pengamatan': 'Ketepatan Catatan Pengamatan',
};

export const RUBRIC_CONFIG: RubricConfig = {
  weights: {
    sasaran: 1,
    'jalur-kontak': 1,
    'kualitas-pertanyaan': 1,
    'kesalahan-fatal': 1,
    'keretakan-perbaikan': 1,
    'kerahasiaan-peran': 1,
    ritme: 1,
    'catatan-pengamatan': 1,
  },
  descriptors: [
    { id: 'Pemula', min: 0, max: 39 },
    { id: 'Berkembang', min: 40, max: 64 },
    { id: 'Cakap', min: 65, max: 84 },
    { id: 'Mahir', min: 85, max: 100 },
  ],
  keyPointTrustThreshold: 7,
  sasaran: {
    healthySolitaryMinSolitude: 0.5,
    healthySolitaryMinComfort: 0.6,
    needsSupportMaxComfort: 0.5,
    forcedSkills: ['interogasi', 'nasihat-dini', 'meremehkan'],
    forcedChannelOutcomes: ['terpaksa', 'kerahasiaan-bocor'],
    forcedActionPenalty: 20,
    hypothesisFalsePositivePenalty: 15,
    supportClaimKeywords: [
      'menyendiri',
      'terisolasi',
      'menghindar',
      'kesepian',
      'tertekan',
      'butuh bantuan',
      'perlu didekati',
    ],
    supportClaimStatuses: ['terisolasi', 'terabaikan'],
  },
  jalur: { tierLow: 0.4, tierHigh: 0.65 },
  pertanyaan: { openRatioWeight: 0.5, depthWeight: 0.5, depthTarget: 3 },
  fatal: {
    penalty: { interogasi: 25, 'nasihat-dini': 15, meremehkan: 30 },
    nasihatPrematureBelowLevel: 2,
  },
  keretakan: {
    recognizedPoints: 40,
    repairedPoints: 40,
    speedPoints: 20,
    fastGapTurns: 5,
    slowGapTurns: 8,
    slowFactor: 0.5,
  },
  kerahasiaan: {
    sensitiveLevel: 2,
    lateExplainPenalty: 30,
    leakPenalty: 40,
    absolutePromisePenalty: 25,
    brokenPromisePenalty: 20,
  },
  ritme: {
    spaceSkills: [
      'jeda-hening',
      'validasi-normalisasi',
      'afirmasi-kekuatan',
      'refleksi-perasaan',
      'parafrase-ringkasan',
      'batas-kerahasiaan',
    ],
    targetSpaceRatio: 0.4,
    pushPenalty: 20,
  },
  maxTurns: 50,
};

export const STRATEGY_PRESETS: StrategyPreset[] = [
  {
    id: 'hangat-bertahap',
    label: 'Hangat dan bertahap',
    description:
      'Membangun hubungan lebih dulu: sapaan, penjelasan batas kerahasiaan, pertanyaan terbuka, lalu refleksi, parafrase, validasi, afirmasi, dan janji tindak lanjut.',
    ruptureHandling: 'perbaiki',
    steps: [
      { type: 'skill', skillId: 'sapaan-hangat' },
      { type: 'skill', skillId: 'batas-kerahasiaan' },
      { type: 'skill', skillId: 'pertanyaan-terbuka' },
      { type: 'skill', skillId: 'refleksi-perasaan', reflection: 'tepat' },
      { type: 'skill', skillId: 'parafrase-ringkasan' },
      { type: 'skill', skillId: 'validasi-normalisasi' },
      { type: 'skill', skillId: 'afirmasi-kekuatan' },
      { type: 'janji', dueDayOffset: 1 },
    ],
  },
  {
    id: 'sabar-memberi-ruang',
    label: 'Sabar memberi ruang',
    description:
      'Memberi jeda dan ruang bicara: sapaan, hening, batas kerahasiaan, validasi, pertanyaan terbuka, hening lagi, lalu refleksi perasaan.',
    ruptureHandling: 'perbaiki',
    steps: [
      { type: 'skill', skillId: 'sapaan-hangat' },
      { type: 'skill', skillId: 'jeda-hening' },
      { type: 'skill', skillId: 'batas-kerahasiaan' },
      { type: 'skill', skillId: 'validasi-normalisasi' },
      { type: 'skill', skillId: 'pertanyaan-terbuka' },
      { type: 'skill', skillId: 'jeda-hening' },
      { type: 'skill', skillId: 'refleksi-perasaan', reflection: 'tepat' },
    ],
  },
  {
    id: 'langsung-ke-inti',
    label: 'Langsung ke inti',
    description:
      'Langsung menggali masalah dengan pertanyaan tertutup berulang, memberi nasihat sebelum waktunya, lalu menginterogasi. Keretakan yang muncul diabaikan.',
    ruptureHandling: 'abaikan',
    steps: [
      { type: 'skill', skillId: 'pertanyaan-tertutup' },
      { type: 'skill', skillId: 'pertanyaan-tertutup' },
      { type: 'skill', skillId: 'pertanyaan-tertutup' },
      { type: 'skill', skillId: 'nasihat-dini' },
      { type: 'skill', skillId: 'interogasi' },
      { type: 'skill', skillId: 'pertanyaan-tertutup' },
    ],
  },
  {
    id: 'cepat-memberi-solusi',
    label: 'Cepat memberi solusi',
    description:
      'Segera menawarkan solusi lewat nasihat dini dan pertanyaan tertutup, lalu meremehkan perasaan siswa. Keretakan yang muncul diperbaiki.',
    ruptureHandling: 'perbaiki',
    steps: [
      { type: 'skill', skillId: 'nasihat-dini' },
      { type: 'skill', skillId: 'pertanyaan-tertutup' },
      { type: 'skill', skillId: 'meremehkan' },
      { type: 'skill', skillId: 'pertanyaan-tertutup' },
      { type: 'skill', skillId: 'nasihat-dini' },
      { type: 'skill', skillId: 'validasi-normalisasi' },
    ],
  },
];
