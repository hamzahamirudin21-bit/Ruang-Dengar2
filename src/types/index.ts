export type AppScreen = 'start' | 'roster' | 'simulation';

export type TextSizeOption = 'normal' | 'large' | 'xlarge';

export type SimulationSpeed = 1 | 2 | 4;

export type ConsultationDoorMode = 'lab' | 'samping';

export type CounselorTabId = 'pengamatan' | 'sosiogram' | 'catatan' | 'misi';

export type ZoneType =
  | 'cetak-3d'
  | 'pemrograman'
  | 'las'
  | 'elektronik-iot'
  | 'diskusi'
  | 'gudang-alat'
  | 'istirahat'
  | 'konsultasi'
  | 'ruang-dosen';

export type ZoneVisibility = 'terbuka' | 'semi-privat' | 'privat' | 'dapat-diatur';

export interface GridPoint {
  x: number;
  y: number;
}

export interface GridRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LabFurniture {
  id: string;
  kind:
    | 'printer-3d'
    | 'meja-komputer'
    | 'bilik-las'
    | 'meja-elektronik'
    | 'meja-diskusi'
    | 'rak-gudang'
    | 'sofa'
    | 'meja-kopi'
    | 'dispenser'
    | 'meja-konsultasi'
    | 'meja-dosen'
    | 'rak-buku'
    | 'penanda-k3';
  rect: GridRect;
  walkable: boolean;
  label?: string;
}

export interface LabZone {
  id: ZoneType;
  type: ZoneType;
  label: string;
  shortLabel: string;
  description: string;
  bounds: GridRect;
  capacity: number;
  standingSlots: GridPoint[];
  entrances: GridPoint[];
  visibility: ZoneVisibility;
  privacy: number;
  colorVar: string;
}

export interface DoorSpec {
  id: string;
  zoneId: ZoneType;
  tiles: GridPoint[];
  orientation: 'horizontal' | 'vertical';
  mode?: ConsultationDoorMode;
  label: string;
}

export interface LabMapData {
  width: number;
  height: number;
  tileSizePx: number;
  zones: LabZone[];
  walls: GridRect[];
  lowDividers: GridRect[];
  doors: DoorSpec[];
  furniture: LabFurniture[];
}

export interface ClockState {
  day: number;
  /** Menit sejak 00:00 (08:00 = 480, 16:00 = 960) */
  minutesOfDay: number;
  paused: boolean;
  speed: SimulationSpeed;
}

export interface AppSettings {
  textSize: TextSizeOption;
  reducedMotion: boolean;
  seed: number;
  defaultSpeed: SimulationSpeed;
  soundEnabled?: boolean;
}

export interface DevPathTestState {
  active: boolean;
  start: GridPoint;
  currentPos: { x: number; y: number };
  targetZoneId: ZoneType;
  targetSlot: GridPoint;
  path: GridPoint[];
  stepIndex: number;
  stepProgress: number;
  reachable: boolean;
  wallCollisions: number;
}

export interface CanvasViewOptions {
  showGrid: boolean;
  showZoneLabels: boolean;
  consultationDoorMode: ConsultationDoorMode;
}

/* =========================================================
 * TAHAP 2 — MODEL DATA MAHASISWA, EVENT, & DUNIA HARIAN
 * ========================================================= */

export type CounselingDomain = 'pribadi' | 'belajar' | 'sosial' | 'karier';

export type AgentActivityStatus =
  | 'bekerja'
  | 'berpindah'
  | 'mengobrol'
  | 'istirahat'
  | 'menunggu';

export type AgentSocialStatus =
  | 'sendiri'
  | 'berkelompok'
  | 'berinteraksi'
  | 'konflik-ringan'
  | 'menghindar';

export interface AgentDemographicLabel {
  /** Hanya untuk tampilan visualisasi & identitas permukaan, tidak memengaruhi mesin */
  genderLabel: string;
  originLabel: string;
  avatarHue: number;
  hairStyle: 'pendek' | 'sedang' | 'kerudung' | 'ikat';
}

export interface AgentInterests {
  cetak3d: number;
  pemrograman: number;
  pengelasan: number;
  elektronika: number;
}

export interface AgentSkills {
  cetak3d: number;
  pemrograman: number;
  pengelasan: number;
  elektronika: number;
  kolaborasi: number;
}

export interface AgentPersonality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  stressSensitivity: number;
}

/** Variabel BK tersembunyi (disiapkan bertipe untuk Tahap 5) */
export interface AgentHiddenCounselingVars {
  trustInCounselor: number;
  disclosureReadiness: number;
  socialComfort: number;
  stigmaSensitivity: number;
  ruptureLevel: number;
  primaryConcernSummary: string;
}

export interface StudentAgent {
  id: string;
  name: string;
  cohort: number;
  demographicLabel: AgentDemographicLabel;
  uniquePotential: string;
  socialCircleHint: string;
  counselingDomain: CounselingDomain;
  interests: AgentInterests;
  skills: AgentSkills;
  personality: AgentPersonality;
  /** Preferensi kenyamanan menyendiri secara sehat (0-1) */
  solitudePreference: number;
  /** Afinitas sosial terhadap seluruh agen lain (-1 sampai 1) */
  affinities: Record<string, number>;

  /* Kondisi dinamis */
  position: { x: number; y: number };
  tilePosition: GridPoint;
  targetPosition: GridPoint | null;
  path: GridPoint[];
  pathStepIndex: number;
  currentZoneId: ZoneType;
  targetZoneId: ZoneType;
  activityGoal: string;
  status: AgentActivityStatus;
  energy: number;
  stress: number;
  taskLoad: number;
  activityDurationTicks: number;
  socialStatus: AgentSocialStatus;
  interactingWithIds: string[];

  /* Variabel psikologis BK (disiapkan untuk Tahap 5) */
  hiddenVars: AgentHiddenCounselingVars;

  /** Adaptasi sementara akibat hasil cerita (mode cerita) */
  storyAdaptation?: StoryAdaptation;
}

export interface StoryAdaptation {
  /** Penyesuaian skor kandidat zona (positif menarik, negatif menjauhkan) */
  zoneBonuses: Partial<Record<ZoneType, number>>;
  daysRemaining: number;
  reason: 'terbantu' | 'kemajuan-kecil' | 'menarik-diri-sementara';
}

export type LabEventKind =
  | 'tenggat-praktikum'
  | 'printer-macet'
  | 'diskusi-proyek'
  | 'jeda-siang'
  | 'inspeksi-k3'
  | 'gesekan-tugas';

export interface LabEvent {
  id: string;
  kind: LabEventKind;
  title: string;
  description: string;
  targetZoneId?: ZoneType;
  involvedAgentIds: string[];
  startDay: number;
  startMinute: number;
  remainingTicks: number;
}

export interface WorldSocialSummary {
  totalAgents: number;
  byActivity: Record<AgentActivityStatus, number>;
  bySocialStatus: Record<AgentSocialStatus, number>;
  averageEnergy: number;
  averageStress: number;
  activeInteractions: number;
  mildConflicts: number;
}

export interface WorldState {
  seed: number;
  tickCount: number;
  lastProcessedMinuteKey: number;
  clock: ClockState;
  consultationDoorMode: ConsultationDoorMode;
  agents: StudentAgent[];
  activeEvents: LabEvent[];
  recentEvents: LabEvent[];
  rngStepCount: number;
  observationLog: ObservationLogState;
  sociometrySnapshots: DailySociometrySnapshot[];
}

/* =========================================================
 * TAHAP 3 — LOG PENGAMATAN, SOSIOMETRI, & CATATAN ANEKDOT
 * ========================================================= */

export interface AgentDayObservationSummary {
  totalTicks: number;
  zoneTicks: Partial<Record<ZoneType, number>>;
  aloneTicks: number;
  groupTicks: number;
  avoidTicks: number;
  conflictTicks: number;
}

export interface ObservationLogState {
  /** Ringkasan harian per agen: day -> agentId -> ringkasan */
  byDay: Record<number, Record<string, AgentDayObservationSummary>>;
  /** Peta panas petak 40x24 terakumulasi: agentId -> ("x,y" -> jumlah tick) */
  tileHeatmapByAgent: Record<string, Record<string, number>>;
  /** Durasi kebersamaan antar-pasangan: "idA|idB" -> skor kebersamaan */
  coPresenceScores: Record<string, number>;
  /** Riwayat pasangan pernah berinteraksi langsung per hari: day -> "idA|idB" -> count */
  coPresenceByDay: Record<number, Record<string, number>>;
}

export interface SociometryChoice {
  fromId: string;
  toIds: string[];
}

export interface DailySociometrySnapshot {
  day: number;
  question: string;
  choicesByAgent: Record<string, string[]>;
  isLivePreview?: boolean;
}

export type SociometryStatus =
  | 'bintang'
  | 'terisolasi'
  | 'terabaikan'
  | 'jembatan'
  | 'umum';

export interface SociometryNodeMetrics {
  agentId: string;
  name: string;
  receivedCount: number;
  sentCount: number;
  mutualCount: number;
  incomingFromIds: string[];
  outgoingToIds: string[];
  mutualIds: string[];
  dominantZoneId: ZoneType;
  isStar: boolean;
  isIsolated: boolean;
  isNeglected: boolean;
  isBridge: boolean;
  status: SociometryStatus;
}

export interface SociometryNetworkStats {
  day: number;
  totalAgents: number;
  totalDirectedChoices: number;
  reciprocalDirectedChoices: number;
  reciprocalPairCount: number;
  reciprocityChoicePercent: number;
  agentsWithReciprocalCount: number;
  agentsWithReciprocalPercent: number;
  starThreshold: number;
  componentCount: number;
  components: string[][];
  nodeMetrics: Record<string, SociometryNodeMetrics>;
  orderedMetrics: SociometryNodeMetrics[];
}

export interface SociogramNodePosition {
  x: number;
  y: number;
}

export type HypothesisConfidence = 'rendah' | 'sedang' | 'tinggi';

export interface CounselorHypothesis {
  id: string;
  agentId: string;
  agentName: string;
  day: number;
  timeFormatted: string;
  hypothesisText: string;
  confidence: HypothesisConfidence;
  sociometryStatusAtCreation: SociometryStatus;
}

export interface AnecdotalRecord {
  id: string;
  agentId: string;
  agentName: string;
  dateLabel: string;
  timeLabel: string;
  locationZoneId: ZoneType;
  observedFact: string;
  counselorInterpretation: string;
  detectedInterpretiveWords: string[];
  createdAtDay: number;
}

/* =========================================================
 * TAHAP 4 — PERAN KONSELOR, JALUR KONTAK, & VISIBILITAS
 * ========================================================= */

export type ContactChannelId =
  | 'sapa-di-tempat'
  | 'ajak-aktivitas'
  | 'pintu-akademik'
  | 'panggilan-resmi'
  | 'lewat-perantara'
  | 'pesan-tertulis';

export type PrivacyTier = 'rendah' | 'sedang' | 'tinggi';
export type StigmaCostTier = 'sangat-rendah' | 'rendah' | 'rendah-sedang' | 'sedang' | 'tinggi';
export type RapportGainTier = 'kecil' | 'kecil-sedang' | 'sedang';
export type IntermediaryKind = 'teman' | 'teknisi' | 'dosen';

export interface ContactChannelConfig {
  id: ContactChannelId;
  order: number;
  name: string;
  shortName: string;
  description: string;
  energyCost: number;
  durationMinutes: number;
  privacyTier: PrivacyTier;
  privacyScore: number;
  stigmaTier: StigmaCostTier;
  stigmaBaseCost: number;
  rapportTier: RapportGainTier;
  rapportBaseGain: number;
  maxDialogueLevel: number;
  witnessRadius: number;
  exposurePerWitness: number;
  requiresEmptyConsultationRoom: boolean;
  requiresIntermediaryChoice: boolean;
  requiresTimeSlotChoice: boolean;
}

export interface ChannelAvailability {
  channelId: ContactChannelId;
  available: boolean;
  unavailableReason: string | null;
}

export interface VisibilityAssessment {
  channelId: ContactChannelId;
  witnessCount: number;
  witnessIds: string[];
  witnessNames: string[];
  exposureDelta: number;
  doorPrivacyBonusApplied: boolean;
  summaryText: string;
}

export type ContactOutcomeKind =
  | 'terbuka-ringan'
  | 'berhasil'
  | 'gagal-tenggat'
  | 'tidak-hadir'
  | 'menolak'
  | 'terpaksa'
  | 'terhubung-perantara'
  | 'kerahasiaan-bocor'
  | 'respons-tertulis';

export interface ContactActionOptions {
  scheduledTimeLabel?: string;
  intermediaryKind?: IntermediaryKind;
  shareDetailsToIntermediary?: boolean;
}

export interface PlaceholderConversationContext {
  channelId: ContactChannelId;
  channelName: string;
  targetAgentId: string;
  targetAgentName: string;
  targetZoneLabel: string;
  day: number;
  timeFormatted: string;
  scheduledTimeLabel?: string;
  intermediaryKind?: IntermediaryKind;
  shareDetailsToIntermediary?: boolean;
  witnessCount: number;
  witnessNames: string[];
  visibilitySummary: string;
  /** True bila sesi berjalan dalam mode cerita */
  storyMode?: boolean;
  outcomeKind: ContactOutcomeKind;
  outcomeHeadline: string;
  outcomeDescription: string;
  maxDialogueLevel: number;
  energyCost: number;
  durationMinutes: number;
  endsDayAfterClose: boolean;
}

export interface CounselorActionLogEntry {
  id: string;
  day: number;
  timeFormatted: string;
  kind: 'amati-sudut' | 'jalur-kontak';
  channelId?: ContactChannelId;
  actionLabel: string;
  targetAgentId: string;
  targetAgentName: string;
  energyCost: number;
  durationMinutes: number;
  witnessCount: number;
  outcomeSummary: string;
}

export interface CounselorDaySummary {
  day: number;
  endedReason: 'energi-habis' | 'jam-selesai';
  remainingEnergy: number;
  actions: CounselorActionLogEntry[];
  contactedAgents: { agentId: string; agentName: string; channelsUsed: string[] }[];
  observedAgents: { agentId: string; agentName: string }[];
}

export interface CounselorState {
  energy: number;
  maxEnergy: number;
  actionCounter: number;
  actionLogs: CounselorActionLogEntry[];
  exposureByAgent: Record<string, number>;
  daySummaries: CounselorDaySummary[];
}

/* =========================================================
 * TAHAP 5 — MESIN KEPERCAYAAN, KETERBUKAAN, KERETAKAN, & INGATAN
 * ========================================================= */

export type CounselorSkillId =
  | 'sapaan-hangat'
  | 'pertanyaan-terbuka'
  | 'refleksi-perasaan'
  | 'parafrase-ringkasan'
  | 'validasi-normalisasi'
  | 'sampaikan-pengamatan'
  | 'afirmasi-kekuatan'
  | 'jeda-hening'
  | 'batas-kerahasiaan'
  | 'pertanyaan-tertutup'
  | 'interogasi'
  | 'nasihat-dini'
  | 'meremehkan'
  | 'janji-mutlak';

export type SkillCategory = 'rapport' | 'eksplorasi-etik' | 'penghambat';

export type EmotionReflectionNuance =
  | 'tertekan-cemas'
  | 'lelah-kewalahan'
  | 'kecewa-kesal'
  | 'ragu-kurang-percaya';

export type ObservationTone = 'faktual' | 'menilai';

export type HiddenProblemCategory =
  | 'konflik-alat'
  | 'tekanan-akademik'
  | 'kecemasan-karier'
  | 'kalah-terampil'
  | 'kelelahan-praktikum';

export interface AgentTieredProblem {
  category: HiddenProblemCategory;
  categoryLabel: string;
  primaryEmotion: EmotionReflectionNuance;
  l1Fact: string;
  l2Feeling: string;
  l3CoreNeed: string;
}

export type DisclosureLevel = 0 | 1 | 2 | 3;

export type RuptureKind = 'menarik-diri' | 'konfrontasi';

export type RepairStepId =
  | 'akui-dampak'
  | 'minta-maaf'
  | 'eksplorasi-perasaan'
  | 'beri-pilihan';

export interface RuptureState {
  active: boolean;
  kind: RuptureKind | null;
  recognized: boolean;
  ignoredTurns: number;
  completedRepairSteps: RepairStepId[];
  ruptureCountInSession: number;
  repairedCountInSession: number;
  endedEarlyByRupture: boolean;
  reasonSummary: string | null;
}

export interface SkillEffectSpec {
  id: CounselorSkillId;
  label: string;
  category: SkillCategory;
  shortDescription: string;
  baseEffect: number;
  canRaiseDisclosure: boolean;
  triggersRuptureAlways?: boolean;
  triggersRuptureBeforeL2?: boolean;
  onceOnlyConfidentiality?: boolean;
  ethicsViolation?: boolean;
  samplePrompts: string[];
}

export interface AgentSessionVars {
  trust: number; // 0-100
  readiness: number; // 0-100
  selfReliance: number; // 0-1 (swakemandirian)
  selfStigma: number; // 0-1 (stigma diri)
  socialAnxiety: number; // 0-1 (kecemasan sosial)
  gossipSensitivity: number; // 0-1 (kepekaan gosip)
  exposure: number; // 0-1 (paparan dari Tahap 4)
}

export interface FollowUpPromise {
  id: string;
  createdDay: number;
  dueDay: number;
  note: string;
  status: 'menunggu' | 'terpenuhi' | 'terlewat';
  resolvedDay?: number;
}

export interface StoredUtterance {
  day: number;
  channelId: ContactChannelId;
  skillLabel: string;
  text: string;
  disclosureLevel: DisclosureLevel;
}

export interface AgentMemoryRecord {
  agentId: string;
  pastUtterances: StoredUtterance[];
  promises: FollowUpPromise[];
  wasHumiliated: boolean;
  confidentialityExplained: boolean;
  witnessEvents: { day: number; channelId: ContactChannelId; witnessCount: number }[];
  totalSessions: number;
  totalRuptures: number;
  totalRepairs: number;
  lastSessionDay: number | null;
}

export type SessionPracticeMode = 'latihan' | 'ujian';

export interface SessionTurnOption {
  reflectionNuance?: EmotionReflectionNuance;
  observationTone?: ObservationTone;
  reflectionCorrectOverride?: boolean;
}

export interface SessionTurnEntry {
  turnNumber: number;
  kind: 'keterampilan' | 'akui-ketegangan' | 'perbaikan' | 'janji-tindak-lanjut' | 'pembuka';
  actionLabel: string;
  counselorText: string;
  agentReply: string;
  nonverbalCue: string;
  disclosureLevelAfter: DisclosureLevel;
  trustDelta: number;
  ruptureTriggered: boolean;
  ruptureRepaired: boolean;
  ethicsFlag?: boolean;
}

export interface SessionState {
  agentId: string;
  agentName: string;
  channelContext: PlaceholderConversationContext;
  vars: AgentSessionVars;
  initialTrust: number;
  problem: AgentTieredProblem;
  thresholds: { l1: number; l2: number; l3: number };
  unlockedLevel: DisclosureLevel;
  highestLevelReached: DisclosureLevel;
  maxAllowedLevel: DisclosureLevel;
  rupture: RuptureState;
  usedConfidentialityOnce: boolean;
  consecutiveClosedQuestions: number;
  lastTurnDisclosedSomething: boolean;
  ethicsViolationsCount: number;
  memoryNotesAtStart: string[];
  promisesCreatedInSession: FollowUpPromise[];
  fulfilledPromiseInSession: boolean;
  turns: SessionTurnEntry[];
  turnCounter: number;
  rngState: number;
  closed: boolean;
  cannotStartReason: string | null;
}

export interface RandomSessionsAuditResult {
  seed: number;
  sessionCount: number;
  totalTurns: number;
  trustOutOfBoundsCount: number;
  levelJumpGtOneCount: number;
  harmfulRaisedLevelCount: number;
  withdrawalRuptureCount: number;
  confrontationRuptureCount: number;
  repairedRuptureCount: number;
  earlyEndedRuptureCount: number;
  allInvariantsPassed: boolean;
}

/* =========================================================
 * TAHAP 6 — LAPISAN DIALOG GEMINI (HIBRIDA) & MODE OFFLINE
 * ========================================================= */

export type DialogueEngineMode = 'gemini' | 'cadangan-aturan';

export type AgentSpeakingStyle =
  | 'ringkas-hati-hati'
  | 'ekspresif-langsung'
  | 'reflektif-tenang';

export type AgentDialogueTone = 'terbuka' | 'menarik-diri' | 'defensif';

export type CounselorInputTone = 'hangat' | 'netral' | 'menghakimi';

export interface CounselorInputClassification {
  keterampilan: CounselorSkillId;
  kualitas: number; // 0-1
  nada: CounselorInputTone;
  menyentuh_topik_terlarang: boolean;
  alasan_singkat: string;
  source: 'gemini' | 'cache' | 'cadangan-aturan';
  ambiguousOffline?: boolean;
  forbiddenTopicCategory?: 'bunuh-diri' | 'menyakiti-diri' | 'kekerasan' | null;
}

export interface AgentLimitedStateCard {
  nama: string;
  gayaBicara: AgentSpeakingStyle;
  levelMaksimal: DisclosureLevel;
  faktaBolehDisebut: string[];
  nada: AgentDialogueTone;
  isyaratNonverbal: string;
  duaGiliranTerakhir: {
    konselor: string;
    agen: string;
  }[];
  masukanKonselorTerakhir: string;
}

export interface GeneratedUtterancePayload {
  ucapan: string;
  nonverbal: string;
}

export interface UtteranceValidationResult {
  valid: boolean;
  reasons: string[];
  leakedKeywords: string[];
}

export interface LlmAuditLogEntry {
  id: string;
  timestampIso: string;
  callKind: 'klasifikasi-masukan' | 'ucapan-agen';
  modeUsed: 'gemini' | 'cache' | 'cadangan-aturan';
  sanitizedInputCard: Record<string, unknown>;
  rawOutput: unknown;
  validatorPassed: boolean;
  validatorReasons: string[];
  retried: boolean;
  latencyMs: number;
}



/* =========================================================
 * DEBRIEF — DASBOR SUPERVISOR, RUBRIK, & REPLAY (penambahan saja)
 * ========================================================= */

export type RubricItemId =
  | 'sasaran'
  | 'jalur-kontak'
  | 'kualitas-pertanyaan'
  | 'kesalahan-fatal'
  | 'keretakan-perbaikan'
  | 'kerahasiaan-peran'
  | 'ritme'
  | 'catatan-pengamatan';

export type RubricDescriptor = 'Pemula' | 'Berkembang' | 'Cakap' | 'Mahir';

export interface RubricDetailLine {
  label: string;
  value: string | number;
  /** 0 = pembuka sesi */
  turnNumbers?: number[];
}

export interface RubricItemResult {
  id: RubricItemId;
  /** Bilangan bulat 0..100 */
  score: number;
  descriptor: RubricDescriptor;
  neutral: boolean;
  neutralNote: string | null;
  details: RubricDetailLine[];
}

export interface RubricResult {
  /** Tepat 8 butir, urutan RUBRIC_ITEM_IDS */
  items: RubricItemResult[];
  total: number;
  totalDescriptor: RubricDescriptor;
  neutralCount: number;
}

export type KeyPointKind =
  | 'trust-turun-tajam'
  | 'trust-naik-tajam'
  | 'keretakan'
  | 'perbaikan';

export interface KeyPoint {
  kind: KeyPointKind;
  /** 0 = pembuka sesi (hanya keretakan awal) */
  turnNumber: number;
  trustDelta: number;
}

export interface DebriefTurn {
  /** 1..n, tanpa giliran pembuka */
  turnNumber: number;
  kind: SessionTurnEntry['kind'];
  skillId: CounselorSkillId | null;
  actionLabel: string;
  counselorText: string;
  agentReply: string;
  trustBefore: number;
  trustAfter: number;
  levelBefore: DisclosureLevel;
  levelAfter: DisclosureLevel;
  ruptureTriggered: boolean;
  ruptureRepaired: boolean;
}

export interface RuptureEpisode {
  /** 0 untuk keretakan awal sesi */
  startTurn: number;
  recognizedAtTurn: number | null;
  repairedAtTurn: number | null;
}

export interface ContactFitResult {
  chosen: ContactChannelId;
  best: ContactChannelId;
  fits: Record<ContactChannelId, number>;
  score: number;
  explanation: string;
}

export interface HypothesisVerdict {
  hypothesisId: string;
  verdict: 'terbukti' | 'false positive';
  claim: 'perlu-didekati' | 'tidak-perlu-didekati';
}

/** Persis argumen createCounselingSession (dipakai replay dan hash keadaan awal) */
export interface DebriefSessionInit {
  seed: number;
  agent: StudentAgent;
  context: PlaceholderConversationContext;
  exposure: number;
  memory: AgentMemoryRecord;
}

export interface DebriefSessionRecord {
  init: DebriefSessionInit;
  initialStateHash: string;
  session: SessionState;
  finishedByUser: boolean;
  hypotheses: CounselorHypothesis[];
  anecdotalRecords: AnecdotalRecord[];
  actionLogs: CounselorActionLogEntry[];
  sociometry: {
    snapshots: DailySociometrySnapshot[];
    livePreview: DailySociometrySnapshot | null;
    agents: StudentAgent[];
    observationLog: ObservationLogState;
  };
  replayable: boolean;
  replayBlockedReason: string | null;
}

export interface RubricConfig {
  weights: Record<RubricItemId, number>;
  descriptors: { id: RubricDescriptor; min: number; max: number }[];
  keyPointTrustThreshold: number;
  sasaran: {
    healthySolitaryMinSolitude: number;
    healthySolitaryMinComfort: number;
    needsSupportMaxComfort: number;
    forcedSkills: CounselorSkillId[];
    forcedChannelOutcomes: ContactOutcomeKind[];
    forcedActionPenalty: number;
    hypothesisFalsePositivePenalty: number;
    supportClaimKeywords: string[];
    supportClaimStatuses: SociometryStatus[];
  };
  jalur: { tierLow: number; tierHigh: number };
  pertanyaan: { openRatioWeight: number; depthWeight: number; depthTarget: number };
  fatal: {
    penalty: Partial<Record<CounselorSkillId, number>>;
    nasihatPrematureBelowLevel: number;
  };
  keretakan: {
    recognizedPoints: number;
    repairedPoints: number;
    speedPoints: number;
    fastGapTurns: number;
    slowGapTurns: number;
    slowFactor: number;
  };
  kerahasiaan: {
    sensitiveLevel: number;
    lateExplainPenalty: number;
    leakPenalty: number;
    absolutePromisePenalty: number;
    brokenPromisePenalty: number;
  };
  ritme: {
    spaceSkills: CounselorSkillId[];
    targetSpaceRatio: number;
    pushPenalty: number;
  };
  maxTurns: number;
}

export type ScriptStep =
  | {
      type: 'skill';
      skillId: CounselorSkillId;
      reflection?: 'tepat' | 'meleset';
      tone?: 'faktual' | 'menilai';
    }
  | { type: 'janji'; dueDayOffset: number };

export interface StrategyPreset {
  id: string;
  label: string;
  description: string;
  ruptureHandling: 'perbaiki' | 'abaikan';
  steps: ScriptStep[];
}

export interface FeedbackItem {
  kind: 'kekuatan' | 'peluang';
  /** Selalu 1..n */
  turnNumber: number;
  /** Memuat "Giliran {n}" */
  text: string;
  /** Wajib untuk 'peluang' */
  alternative?: string;
  source: 'kandidat' | 'templat-umum';
}

export interface FocusDrill {
  itemId: RubricItemId;
  title: string;
  instruction: string;
  turnNumber: number | null;
}

export interface SupervisorFeedback {
  /** true hanya bila transkrip kosong */
  insufficient: boolean;
  message: string | null;
  strengths: FeedbackItem[];
  opportunities: FeedbackItem[];
  drill: FocusDrill | null;
}

export interface SessionAnalysis {
  transcript: DebriefTurn[];
  /** Indeks = nomor giliran; panjang n+1 (indeks 0 = kepercayaan awal) */
  trustSeries: number[];
  keyPoints: KeyPoint[];
  episodes: RuptureEpisode[];
  rubric: RubricResult;
  contactFit: ContactFitResult;
  hypothesisVerdicts: HypothesisVerdict[];
  highestLevel: DisclosureLevel;
  feedback: SupervisorFeedback;
}

/** Ego-network sosiogram agen sasaran untuk satu snapshot (tanpa objek agen) */
export interface DebriefSociogramPanel {
  day: number;
  isLivePreview: boolean;
  nodes: { id: string; name: string }[];
  choicesByAgent: Record<string, string[]>;
  stats: {
    receivedCount: number;
    sentCount: number;
    mutualCount: number;
    status: SociometryStatus;
  } | null;
}

/** Bagian publik Debrief setelah sesi selesai (tanpa variabel tersembunyi) */
export interface DebriefView {
  agentId: string;
  agentName: string;
  day: number;
  channelId: ContactChannelId;
  transcript: DebriefTurn[];
  trustSeries: number[];
  keyPoints: KeyPoint[];
  episodes: RuptureEpisode[];
  highestLevel: DisclosureLevel;
  contactChannel: {
    chosen: ContactChannelId;
    best: ContactChannelId;
    explanation: string;
  };
  rubric: RubricResult;
  feedback: SupervisorFeedback;
  sociogramDay1: DebriefSociogramPanel | null;
  sociogramDayN: DebriefSociogramPanel | null;
  hypotheses: CounselorHypothesis[];
  hypothesisVerdicts: HypothesisVerdict[];
  replayPresets: { id: string; label: string; description: string }[];
  replayable: boolean;
  replayBlockedReason: string | null;
  /** True bila Debrief berasal dari sesi mode cerita */
  storyMode?: boolean;
  /** Ringkasan hasil cerita (mode cerita saja) */
  storyOutcome?: StoryOutcomeSummary;
}

/** Ringkasan hasil cerita yang berdiri sendiri (tanpa impor dari engine/story) */
export interface StoryOutcomeSummary {
  kind: 'terbantu' | 'kemajuan-kecil' | 'menarik-diri-sementara';
  quality: number;
  summaryTitle: string;
  summaryBody: string;
}

/** Variabel tersembunyi; hanya dirender setelah pengguna menekan tombol ungkap */
export interface HiddenReveal {
  selfStigma: number;
  socialAnxiety: number;
  selfReliance: number;
  gossipSensitivity: number;
  problem: {
    categoryLabel: string;
    l1Fact: string;
    l2Feeling: string;
    l3CoreNeed: string;
  };
  primaryConcernSummary: string;
  hesitationReasons: string[];
}

export interface ExportPayload {
  transcript: DebriefTurn[];
  keyPoints: KeyPoint[];
  rubric: { items: RubricItemResult[]; total: number; descriptor: RubricDescriptor };
  feedback: SupervisorFeedback;
  contactChannel: { chosen: ContactChannelId; best: ContactChannelId; explanation: string };
  hidden?: HiddenReveal;
}

export type ReplayErrorCode =
  | 'initial-state-mismatch'
  | 'preset-tidak-ditemukan'
  | 'preset-sama-dengan-asli'
  | 'tidak-dapat-diputar-ulang';

export type ReplayOutcome =
  | { ok: true; presetId: string; record: DebriefSessionRecord; analysis: SessionAnalysis }
  | { ok: false; error: { code: ReplayErrorCode; message: string } };

export interface ReplayComparison {
  presetId: string;
  original: {
    trustSeries: number[];
    highestLevel: DisclosureLevel;
    itemScores: Record<RubricItemId, number>;
    total: number;
  };
  replay: {
    trustSeries: number[];
    highestLevel: DisclosureLevel;
    itemScores: Record<RubricItemId, number>;
    total: number;
  };
  itemDeltas: Record<RubricItemId, number>;
  totalDelta: number;
  highestLevelDelta: number;
}
