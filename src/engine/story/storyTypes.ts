import type {
  CounselorSkillId, DisclosureLevel, RepairStepId, RuptureKind,
  SessionTurnOption, StudentAgent,
} from '../../types';

export type StoryStage = 'hubungan' | 'eksplorasi' | 'pemahaman' | 'rencana';
export const STORY_STAGE_ORDER: readonly StoryStage[] =
  ['hubungan', 'eksplorasi', 'pemahaman', 'rencana'];

export type StoryOutcomeKind = 'terbantu' | 'kemajuan-kecil' | 'menarik-diri-sementara';

export type StoryExpression =
  | 'netral' | 'waspada' | 'menunduk' | 'cemas' | 'lega' | 'tersenyum'
  | 'lelah' | 'kesal' | 'terkejut' | 'tertegun' | 'menutup-diri';

/** Satu ucapan mahasiswa beserta isyarat nonverbal. */
export interface StoryLine {
  text: string;            // ucapan mahasiswa
  expression: StoryExpression;
  cue: string;             // deskripsi isyarat nonverbal (selalu tampil di teks)
  aside?: string;          // selingan: narasi atau ucapan pihak lain sebelum balasan
}

export type StoryCondition =
  | { type: 'trust-min'; value: number }
  | { type: 'trust-max'; value: number }
  | { type: 'level-min'; value: DisclosureLevel }
  | { type: 'level-max'; value: DisclosureLevel }
  | { type: 'tension'; active: boolean }          // session.rupture.active
  | { type: 'flag'; flag: string; set?: boolean }; // set default true

export interface StoryRoute { when: StoryCondition[]; next: string }

export type StoryAction =
  | { kind: 'skill' }                               // default: applyCounselorSkillTurn
  | { kind: 'akui-ketegangan' }                     // recognizeSessionTension
  | { kind: 'perbaikan'; step: RepairStepId }       // applyRepairStepTurn
  | { kind: 'janji'; dueDayOffset: number };        // createFollowUpPromiseInSession

export interface StoryChoice {
  id: string;                        // unik dalam simpul
  skillId: CounselorSkillId;         // tepat satu dari 14; untuk aksi non-skill = skill terdekat secara pedagogis
  text: string;                      // ucapan Dosen (menjadi counselorText di transkrip)
  next: string;                      // id simpul, '@ending', atau '@resume'
  action?: StoryAction;
  options?: SessionTurnOption;       // reflectionNuance, reflectionCorrectOverride, observationTone
  best?: boolean;                    // tepat satu per simpul non-akhir
  reaction?: StoryLine;              // menggantikan reply simpul tujuan untuk kedatangan ini
  routes?: StoryRoute[];             // dievaluasi berurutan setelah giliran; pertama yang cocok menang
  setFlags?: string[];
}

export type StoryMark = 'kejutan' | 'momen-terbuka' | 'isyarat-nonverbal';

export interface StoryNode {
  id: string;
  sceneId: string;
  stage: StoryStage;
  depth: DisclosureLevel;            // kedalaman isi ucapan; depth >= 2 wajib bergerbang
  reply: StoryLine;
  choices: StoryChoice[];            // kosong hanya pada simpul akhir
  gate?: { conditions: StoryCondition[]; otherwise: string };
  tension?: { phase: 'awal' | 'perbaikan'; expectedKind?: RuptureKind };
  marks?: StoryMark[];
  onEnter?: { setFlags?: string[] };
  ending?: { kind: StoryOutcomeKind };
}

export interface StoryScene {
  id: string;
  setting: 'lab' | 'ruang-konsultasi';
  title: string;
  caption: string;                   // narasi pembuka adegan
  witnessCount: number;              // masuk ke channelContext.witnessCount
  maxDialogueLevel: DisclosureLevel; // masuk ke session.maxAllowedLevel
  entryTransition: 'jalan-berdua' | 'potong-adegan';
  entryNodeId: string;
}

export interface StoryOutcomeRules {
  helpedMinQuality: number;          // default 70
  helpedMinLevel: DisclosureLevel;   // default 2
  requiredFlags: string[];           // semua wajib ada untuk 'terbantu'
  planFlag?: string;                 // flag langkah kecil (bonus kualitas)
  maxKind?: 'kemajuan-kecil';        // membatasi hasil (Cerita_Tahap_Awal)
}

export interface StoryGraph {
  version: number;
  studentId: string;
  kind: 'penuh' | 'tahap-awal';
  placeholder: boolean;              // true => penanda "cerita segera hadir"
  title: string;
  scenes: StoryScene[];
  startNodeId: string;
  followUpNodeId?: string;           // titik masuk sesi lanjutan
  closingNodeId: string;             // simpul bersama sebelum akhir
  tensionFallbackNodeId: string;     // simpul 'awal' generik untuk keretakan tak terduga
  endings: Record<StoryOutcomeKind, string>;
  outcomeRules: StoryOutcomeRules;
  nodes: StoryNode[];
}

/** Identitas aturan validator Story_Graph (design: bagian Validator). */
export type StoryRuleId =
  | 'id-ganda'
  | 'adegan-jumlah'
  | 'pilihan-kurang'
  | 'pilihan-kelebihan'
  | 'pilihan-teks-panjang'
  | 'jalur-terlalu-panjang'
  | 'tujuan-tidak-ada'
  | 'simpul-tak-terjangkau'
  | 'jalan-buntu'
  | 'jalur-terlalu-pendek'
  | 'istilah-diagnosis'
  | 'skill-tidak-valid'
  | 'tahap-tanpa-keterampilan'
  | 'tanpa-opsi-keliru'
  | 'opsi-terbaik-tidak-tepat-satu'
  | 'terbaik-tidak-bervariasi'
  | 'opsi-tidak-eksplisit'
  | 'tahap-mundur-tanpa-ketegangan'
  | 'pembukaan-tidak-baku'
  | 'cabang-tidak-menyatu'
  | 'kedalaman-tanpa-gerbang'
  | 'gerbang-tanpa-alternatif'
  | 'ketegangan-tidak-ada'
  | 'ketegangan-jenis-salah'
  | 'kejutan-isyarat-momen-tidak-ada'
  | 'transisi-adegan-tidak-ada'
  | 'flag-tak-pernah-diset'
  | 'teks-kosong-atau-panjang'
  | 'balasan-sama-antar-mahasiswa';

export interface StoryValidationError {
  studentId: string;
  nodeId: string | null;      // null untuk aturan tingkat graf
  rule: StoryRuleId;
  message: string;
}

export interface StoryValidationOptions {
  minShortestPath?: number;   // default 15 (penuh) atau 8 (tahap-awal)
  maxShortestPath?: number;   // default 17 (hanya graf penuh); tahap-awal tanpa batas atas
  agent?: StudentAgent;       // untuk memeriksa expectedKind keretakan
}
