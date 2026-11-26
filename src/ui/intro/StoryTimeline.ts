import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { LAB_MAP } from '../../data/map';
import { STUDENT_BACKGROUNDS } from '../../data/studentBackgrounds';
import { STUDENT_APPEARANCES, type CharacterAppearance } from '../characters/appearance';
import type { Direction } from '../characters/pixelGrid';
import type { PoseId } from '../characters/poseCatalog';
import { IntroSfxKind } from '../motion/sfx';

export type CameraShotType =
  | 'extreme-close-up'
  | 'close-up'
  | 'medium-shot'
  | 'medium-full-shot'
  | 'full-body-shot'
  | 'wide-shot';

export type CameraDirectionType =
  | 'tracking'
  | 'pan'
  | 'dolly-in'
  | 'dolly-out'
  | 'over-the-shoulder'
  | 'reaction-shot'
  | 'focus-transition';

export type ActionStageKind =
  | 'lab-map-wide'
  | 'building-sign-ecu'
  | 'stepping-feet-ecu'
  | 'door-handle-ecu'
  | 'corridor-medium-walk'
  | 'oscilloscope-medium-bench'
  | 'coding-medium-desk'
  | 'printer-3d-ecu'
  | 'welding-k3-medium'
  | 'discussion-medium-table'
  | 'studio-design-medium'
  | 'gudang-calibration-closeup'
  | 'reading-corner-medium'
  | 'robotics-corridor-track'
  | 'community-reaction-strip';

export type MiniSpriteActivity = 'idle' | 'walk' | 'turn' | 'interact' | 'talk' | 'work';

export type LabWorkEffectKind =
  | 'solder'
  | 'oscilloscope'
  | 'code'
  | 'print3d'
  | 'weld'
  | 'inspect'
  | 'design'
  | 'read'
  | 'discuss'
  | 'rover';

export type PanelEnterDirection =
  | 'from-left'
  | 'from-right'
  | 'from-top'
  | 'from-bottom'
  | 'diagonal-wipe'
  | 'impact-zoom';

export type ComicBubbleKind = 'speech' | 'thought' | 'narration';

export interface TileViewport {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ComicCharacterProfile {
  id: string;
  orderNumber: string;
  name: string;
  shortName: string;
  spriteUrl: string;
  typeTag: string;
  originAndCohort: string;
  uniquePotential: string;
  initialZoneId: string;
  fallback: {
    hairStyle: 'pendek' | 'sedang' | 'ikat' | 'kerudung';
    avatarHue: number;
  };
  appearance: CharacterAppearance;
}

export interface PanelMiniActorSpec {
  characterId: string;
  activity: MiniSpriteActivity;
  /** Pose P01..P20 spesifik untuk framing Close-Up / Medium Shot / Medium Full Shot */
  poseId?: PoseId;
  /** Posisi horizontal normalisasi (0.1..0.9) saat dirender pada medium/close-up stage */
  stageXNorm?: number;
  startTile: { x: number; y: number };
  waypoints?: readonly { x: number; y: number }[];
  facing: Direction;
  turnToFacing?: Direction;
  workEffect?: LabWorkEffectKind;
  stationTag?: string;
}

export interface PanelSfxTypographySpec {
  id: string;
  text: string;
  xNorm: number;
  yNorm: number;
  rotationDeg: number;
  color: string;
  strokeColor: string;
  revealAtMs: number;
  scale?: number;
}

export interface PanelDialogueSpec {
  id: string;
  kind: ComicBubbleKind;
  speakerId?: string;
  speakerName?: string;
  text: string;
  bubbleXNorm: number;
  bubbleYNorm: number;
  startOffsetMs: number;
  durationMs: number;
}

export interface ComicPanelBlueprint {
  id: string;
  title: string;
  /** Jenis framing kamera fleksibel sesuai kebutuhan adegan */
  shotType: CameraShotType;
  /** Arah gerak kamera sinematik */
  cameraDirection: CameraDirectionType;
  /** Jenis panggung aksi 2D yang dirender pada panel ini */
  actionStage: ActionStageKind;
  focusZoneIds: readonly string[];
  startViewport: TileViewport;
  endViewport: TileViewport;
  ambientTheme: 'morning-exterior' | 'corridor-entry' | 'lab-interior' | 'title-climax';
  gridClass: string;
  revealAtMs: number;
  enterDirection: PanelEnterDirection;
  sfxCue?: IntroSfxKind;
  actors: readonly PanelMiniActorSpec[];
  sfxTexts: readonly PanelSfxTypographySpec[];
  dialogues: readonly PanelDialogueSpec[];
  narrationText?: string;
  narrationDock?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface ComicPageBlueprint {
  pageNumber: 1 | 2 | 3 | 4 | 5 | 6;
  id: string;
  code: string;
  title: string;
  subtitle: string;
  startTimeMs: number;
  durationMs: number;
  pageGridClass: string;
  ambientSfx?: IntroSfxKind;
  panels: readonly ComicPanelBlueprint[];
}

const DOSEN_APPEARANCE: CharacterAppearance = {
  studentId: 'dosen',
  styleName: 'Blazer Batik Dosen BK',
  body: { type: 'sedang', skinId: 'kulit-1' },
  outfit: {
    top: 'jaket',
    topColor: 'navy',
    topAccent: 'mustard',
    bottom: 'rok',
    bottomColor: 'navy',
    shoe: 'sepatu',
    shoeColor: 'navy',
  },
  hair: { kind: 'sedang', colorId: 'rambut-hitam' },
  accessories: ['kacamata', 'id-card', 'buku'],
  sceneHint: 'meja-diskusi',
};

export const COMIC_CHARACTER_PROFILES: readonly ComicCharacterProfile[] = STUDENT_BLUEPRINTS.map(
  (bp, idx) => {
    const bg = STUDENT_BACKGROUNDS[bp.id];
    const appearance = STUDENT_APPEARANCES[bp.id];
    const orderNumber = `#${String(idx + 1).padStart(2, '0')}`;
    return {
      id: bp.id,
      orderNumber,
      name: bp.name,
      shortName: bp.name.split(' ')[0],
      spriteUrl: `/assets/characters/${bp.id}-sprite.png`,
      typeTag: bg?.typeTag ?? 'Mahasiswa Vokasi',
      originAndCohort: bg?.originAndCohort ?? `Angkatan ${bp.cohort}`,
      uniquePotential: bp.uniquePotential,
      initialZoneId: bp.initialZoneId,
      fallback: {
        hairStyle: bp.demographicLabel.hairStyle,
        avatarHue: bp.demographicLabel.avatarHue,
      },
      appearance,
    };
  }
);

export const DOSEN_CHARACTER_PROFILE: ComicCharacterProfile = {
  id: 'dosen',
  orderNumber: 'BK',
  name: 'Ibu Dosen Pembimbing',
  shortName: 'Ibu Dosen',
  spriteUrl: '/assets/characters/dosen-sprite.png',
  typeTag: 'Dosen Pembimbing & Konselor Laboratorium',
  originAndCohort: 'Kampus Vokasi · Elektronika & IoT',
  uniquePotential: 'Mendampingi perkembangan akademik dan psikologis 18 mahasiswa.',
  initialZoneId: 'konsultasi',
  fallback: {
    hairStyle: 'sedang',
    avatarHue: 210,
  },
  appearance: DOSEN_APPEARANCE,
};

const PROFILE_MAP: Readonly<Record<string, ComicCharacterProfile>> = Object.fromEntries([
  [DOSEN_CHARACTER_PROFILE.id, DOSEN_CHARACTER_PROFILE],
  ...COMIC_CHARACTER_PROFILES.map((p) => [p.id, p]),
]);

export function getCharacterProfile(id: string): ComicCharacterProfile {
  return PROFILE_MAP[id] ?? DOSEN_CHARACTER_PROFILE;
}

export const OFFICIAL_LAB_ZONE_IDS: readonly string[] = LAB_MAP.zones.map((z) => z.id);

/**
 * 6 Babak Action-Driven Cinematic Anime Motion Comic (59.0 detik)
 * Memadukan Extreme Close-Up, Close-Up, Medium Shot, Medium Full Shot,
 * Full-Body Shot, dan Wide Establishing Shot secara sinematik.
 */
export const COMIC_STORY_PAGES: readonly ComicPageBlueprint[] = [
  // ==========================================================================
  // SCENE 01 — MORNING AT CAMPUS (0.0s – 9.0s)
  // 1. Wide shot gedung + dolly-in
  // 2. Extreme close-up papan nama gedung + sinar pagi
  // 3. Full-body shot mahasiswa berjalan menuju pintu masuk
  // ==========================================================================
  {
    pageNumber: 1,
    id: 'scene-01-morning-at-campus',
    code: 'SCENE 01 / 06',
    title: 'MORNING AT CAMPUS — FAJAR DI GEDUNG LABORATORIUM',
    subtitle: 'Wide Establishing Shot Gedung · Close-Up Papan Nama · Transisi Pintu Masuk',
    startTimeMs: 0,
    durationMs: 9000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'ambient-chime',
    panels: [
      {
        id: 'p1-wide-campus',
        title: 'WIDE SHOT · GEDUNG LABORATORIUM ELEKTRONIKA & IoT',
        shotType: 'wide-shot',
        cameraDirection: 'dolly-in',
        actionStage: 'lab-map-wide',
        focusZoneIds: OFFICIAL_LAB_ZONE_IDS,
        startViewport: { x: -1.5, y: -1.0, w: 55.0, h: 26.2 },
        endViewport: { x: 4.0, y: 2.0, w: 44.0, h: 21.0 },
        ambientTheme: 'morning-exterior',
        gridClass: 'col-span-12 md:col-span-8 row-span-6',
        revealAtMs: 0,
        enterDirection: 'from-left',
        sfxCue: 'light-sweep',
        narrationText: 'Setiap perjalanan besar selalu dimulai dari sebuah tempat.',
        narrationDock: 'top-left',
        actors: [
          {
            characterId: 'dosen',
            activity: 'walk',
            poseId: 'P02',
            startTile: { x: 21.5, y: 23.2 },
            waypoints: [{ x: 21.5, y: 19.2 }],
            facing: 'atas',
          },
          {
            characterId: 'mhs-01',
            activity: 'walk',
            poseId: 'P13',
            startTile: { x: 23.4, y: 22.8 },
            waypoints: [{ x: 23.4, y: 18.8 }],
            facing: 'atas',
          },
          {
            characterId: 'mhs-03',
            activity: 'walk',
            poseId: 'P02',
            startTile: { x: 16.5, y: 21.0 },
            waypoints: [{ x: 20.5, y: 21.0 }],
            facing: 'kanan',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s01-raka',
            kind: 'speech',
            speakerId: 'mhs-01',
            speakerName: 'Raka',
            text: 'Lampu lantai laboratorium sudah menyala semua! Ayo kita mulai eksperimen pagi ini.',
            bubbleXNorm: 0.56,
            bubbleYNorm: 0.84,
            startOffsetMs: 1400,
            durationMs: 7000,
          },
        ],
      },
      {
        id: 'p1-ecu-sign',
        title: 'EXTREME CLOSE-UP · PAPAN NAMA GEDUNG',
        shotType: 'extreme-close-up',
        cameraDirection: 'focus-transition',
        actionStage: 'building-sign-ecu',
        focusZoneIds: ['elektronik-iot', 'cetak-3d'],
        startViewport: { x: 0, y: 0, w: 20, h: 10 },
        endViewport: { x: 1, y: 0, w: 18, h: 9 },
        ambientTheme: 'morning-exterior',
        gridClass: 'col-span-6 md:col-span-4 row-span-3',
        revealAtMs: 650,
        enterDirection: 'from-top',
        sfxCue: 'panel-whoosh',
        narrationText: 'Pukul 07.15 WIB · Sinar pagi menerangi papan nama laboratorium.',
        narrationDock: 'bottom-left',
        actors: [],
        sfxTexts: [
          {
            id: 'sfx-s01-shine',
            text: 'SHING~ ☀',
            xNorm: 0.78,
            yNorm: 0.24,
            rotationDeg: 6,
            color: '#fef08a',
            strokeColor: '#0f172a',
            revealAtMs: 1050,
            scale: 0.9,
          },
        ],
        dialogues: [],
      },
      {
        id: 'p1-fullbody-approach',
        title: 'FULL-BODY · MENUJU PINTU MASUK UTAMA',
        shotType: 'full-body-shot',
        cameraDirection: 'tracking',
        actionStage: 'lab-map-wide',
        focusZoneIds: ['diskusi', 'istirahat'],
        startViewport: { x: 15.0, y: 17.0, w: 15.0, h: 7.5 },
        endViewport: { x: 16.0, y: 16.0, w: 14.0, h: 7.0 },
        ambientTheme: 'morning-exterior',
        gridClass: 'col-span-6 md:col-span-4 row-span-3',
        revealAtMs: 1300,
        enterDirection: 'from-right',
        sfxCue: 'footstep',
        narrationText: 'Transisi menuju pintu masuk utama laboratorium.',
        narrationDock: 'bottom-right',
        actors: [
          {
            characterId: 'mhs-02',
            activity: 'walk',
            poseId: 'P01',
            startTile: { x: 21.0, y: 23.4 },
            waypoints: [{ x: 21.0, y: 19.6 }],
            facing: 'atas',
          },
          {
            characterId: 'mhs-12',
            activity: 'walk',
            poseId: 'P02',
            startTile: { x: 23.4, y: 23.4 },
            waypoints: [{ x: 23.4, y: 19.6 }],
            facing: 'atas',
          },
        ],
        sfxTexts: [],
        dialogues: [],
      },
    ],
  },

  // ==========================================================================
  // SCENE 02 — ENTER THE LAB (9.0s – 18.5s)
  // 1. Medium shot mahasiswa berjalan di koridor
  // 2. Extreme close-up langkah kaki (TAP... TAP...)
  // 3. Extreme close-up tangan membuka pintu (KLIK!)
  // 4. Pintu terbuka & Wide shot interior laboratorium (SWOOSH!)
  // ==========================================================================
  {
    pageNumber: 2,
    id: 'scene-02-enter-the-lab',
    code: 'SCENE 02 / 06',
    title: 'ENTER THE LAB — MELANGKAH MASUK KE DALAM RUANG DENGAR',
    subtitle: 'Medium Tracking Koridor · Close-Up Langkah Kaki · Close-Up Gagang Pintu · Wide Interior',
    startTimeMs: 9000,
    durationMs: 9500,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'footstep',
    panels: [
      {
        id: 'p2-medium-corridor',
        title: 'MEDIUM SHOT · MELANGKAH DI KORIDOR',
        shotType: 'medium-shot',
        cameraDirection: 'tracking',
        actionStage: 'corridor-medium-walk',
        focusZoneIds: ['diskusi'],
        startViewport: { x: 14, y: 8, w: 16, h: 8 },
        endViewport: { x: 16, y: 8, w: 16, h: 8 },
        ambientTheme: 'corridor-entry',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 0,
        enterDirection: 'from-left',
        sfxCue: 'footstep',
        narrationText: 'Ibu Dosen & Raka menyusuri koridor kaca menuju ruang praktikum.',
        narrationDock: 'top-left',
        actors: [
          {
            characterId: 'dosen',
            activity: 'walk',
            poseId: 'P02',
            stageXNorm: 0.34,
            startTile: { x: 18, y: 10 },
            facing: 'kanan',
          },
          {
            characterId: 'mhs-01',
            activity: 'walk',
            poseId: 'P14',
            stageXNorm: 0.68,
            startTile: { x: 21, y: 10 },
            facing: 'kiri',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s02-dosen',
            kind: 'speech',
            speakerId: 'dosen',
            speakerName: 'Ibu Dosen',
            text: 'Selamat pagi Raka! Mari kita lihat progres semua divisi di dalam lab.',
            bubbleXNorm: 0.44,
            bubbleYNorm: 0.24,
            startOffsetMs: 550,
            durationMs: 8200,
          },
        ],
      },
      {
        id: 'p2-ecu-feet',
        title: 'EXTREME CLOSE-UP · LANGKAH KAKI',
        shotType: 'extreme-close-up',
        cameraDirection: 'dolly-in',
        actionStage: 'stepping-feet-ecu',
        focusZoneIds: ['diskusi'],
        startViewport: { x: 0, y: 0, w: 10, h: 6 },
        endViewport: { x: 0, y: 0, w: 9, h: 5 },
        ambientTheme: 'corridor-entry',
        gridClass: 'col-span-6 md:col-span-3 row-span-3',
        revealAtMs: 650,
        enterDirection: 'from-top',
        sfxCue: 'footstep',
        actors: [],
        sfxTexts: [
          {
            id: 'sfx-s02-tap',
            text: 'TAP... TAP...',
            xNorm: 0.52,
            yNorm: 0.24,
            rotationDeg: -7,
            color: '#fef08a',
            strokeColor: '#0f172a',
            revealAtMs: 850,
            scale: 1.05,
          },
        ],
        dialogues: [],
      },
      {
        id: 'p2-ecu-hand-door',
        title: 'EXTREME CLOSE-UP · TANGAN MEMBUKA PINTU',
        shotType: 'extreme-close-up',
        cameraDirection: 'focus-transition',
        actionStage: 'door-handle-ecu',
        focusZoneIds: ['elektronik-iot'],
        startViewport: { x: 0, y: 0, w: 10, h: 6 },
        endViewport: { x: 0, y: 0, w: 9, h: 5 },
        ambientTheme: 'corridor-entry',
        gridClass: 'col-span-6 md:col-span-3 row-span-3',
        revealAtMs: 1300,
        enterDirection: 'from-right',
        sfxCue: 'door-click',
        actors: [],
        sfxTexts: [
          {
            id: 'sfx-s02-klik',
            text: 'KLIK!',
            xNorm: 0.68,
            yNorm: 0.24,
            rotationDeg: 9,
            color: '#fb923c',
            strokeColor: '#0f172a',
            revealAtMs: 1550,
            scale: 1.15,
          },
        ],
        dialogues: [],
      },
      {
        id: 'p2-wide-interior',
        title: 'WIDE SHOT · PINTU TERBUKA & INTERIOR LABORATORIUM',
        shotType: 'wide-shot',
        cameraDirection: 'dolly-in',
        actionStage: 'lab-map-wide',
        focusZoneIds: ['elektronik-iot', 'cetak-3d', 'diskusi', 'pemrograman', 'konsultasi'],
        startViewport: { x: 6.0, y: 2.0, w: 40.0, h: 19.0 },
        endViewport: { x: 10.0, y: 4.0, w: 32.0, h: 16.0 },
        ambientTheme: 'corridor-entry',
        gridClass: 'col-span-12 row-span-3',
        revealAtMs: 1950,
        enterDirection: 'from-bottom',
        sfxCue: 'door-open',
        narrationText:
          'Di tempat ini, rasa ingin tahu berubah menjadi eksperimen. Ide sederhana berkembang menjadi teknologi.',
        narrationDock: 'bottom-left',
        actors: [
          {
            characterId: 'dosen',
            activity: 'walk',
            startTile: { x: 21.5, y: 18.0 },
            waypoints: [{ x: 21.5, y: 13.5 }],
            facing: 'atas',
          },
          {
            characterId: 'mhs-01',
            activity: 'walk',
            startTile: { x: 25.0, y: 10.0 },
            waypoints: [{ x: 25.0, y: 5.5 }],
            facing: 'atas',
          },
          {
            characterId: 'mhs-03',
            activity: 'work',
            startTile: { x: 27.6, y: 4.2 },
            facing: 'atas',
            workEffect: 'oscilloscope',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-s02-swoosh',
            text: 'SWOOSH!!',
            xNorm: 0.50,
            yNorm: 0.22,
            rotationDeg: -4,
            color: '#38bdf8',
            strokeColor: '#0f172a',
            revealAtMs: 2150,
            scale: 1.15,
          },
        ],
        dialogues: [],
      },
    ],
  },

  // ==========================================================================
  // SCENE 03 — LABORATORY IN ACTION (18.5s – 29.0s)
  // 5 Area Aktivitas dengan Kombinasi Close-Up, Medium Shot & Medium-Full Shot
  // ==========================================================================
  {
    pageNumber: 3,
    id: 'scene-03-laboratory-in-action',
    code: 'SCENE 03 / 06',
    title: 'LABORATORY IN ACTION — LIMA DIVISI BEKERJA AKTIF',
    subtitle: 'Elektronika & Osiloskop · Pemrograman MCU · Cetak 3D · Bengkel Las K3 · Meja Diskusi',
    startTimeMs: 18500,
    durationMs: 10500,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'solder-sizzle',
    panels: [
      {
        id: 'p3-elektronika',
        title: 'MEDIUM SHOT · ELEKTRONIKA & OSILOSKOP',
        shotType: 'medium-shot',
        cameraDirection: 'dolly-in',
        actionStage: 'oscilloscope-medium-bench',
        focusZoneIds: ['elektronik-iot'],
        startViewport: { x: 21.5, y: 0.6, w: 10.0, h: 7.8 },
        endViewport: { x: 22.0, y: 1.0, w: 9.0, h: 7.0 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 0,
        enterDirection: 'from-left',
        sfxCue: 'solder-sizzle',
        narrationText: 'Mengukur gelombang sinyal PCB menggunakan osiloskop.',
        narrationDock: 'bottom-left',
        actors: [
          { characterId: 'mhs-01', activity: 'work', poseId: 'P20', stageXNorm: 0.34, startTile: { x: 24.5, y: 4.1 }, facing: 'kanan', workEffect: 'oscilloscope' },
          { characterId: 'mhs-02', activity: 'work', poseId: 'P14', stageXNorm: 0.70, startTile: { x: 26.5, y: 4.1 }, facing: 'kiri', workEffect: 'solder' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s03-raka',
            kind: 'speech',
            speakerId: 'mhs-01',
            speakerName: 'Raka',
            text: 'Gelombang output 3.3V bersih! Dimas, solderan regulatornya sangat presisi.',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.22,
            startOffsetMs: 500,
            durationMs: 9400,
          },
        ],
      },
      {
        id: 'p3-pemrograman',
        title: 'OVER-THE-SHOULDER · PEMROGRAMAN & MCU',
        shotType: 'medium-shot',
        cameraDirection: 'over-the-shoulder',
        actionStage: 'coding-medium-desk',
        focusZoneIds: ['pemrograman'],
        startViewport: { x: 0.6, y: 10.4, w: 12.8, h: 6.8 },
        endViewport: { x: 1.0, y: 10.6, w: 12.0, h: 6.4 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 550,
        enterDirection: 'from-top',
        sfxCue: 'keyboard-clack',
        narrationText: 'Mengetik kode firmware RTOS dan memeriksa log mikrokontroler.',
        narrationDock: 'bottom-left',
        actors: [
          { characterId: 'mhs-04', activity: 'work', poseId: 'P13', stageXNorm: 0.34, startTile: { x: 3.5, y: 15.0 }, facing: 'kanan', workEffect: 'code' },
          { characterId: 'mhs-06', activity: 'work', poseId: 'P17', stageXNorm: 0.70, startTile: { x: 5.5, y: 15.0 }, facing: 'kiri', workEffect: 'code' },
        ],
        sfxTexts: [
          {
            id: 'sfx-s03-clack',
            text: 'CLACK! OK!',
            xNorm: 0.78,
            yNorm: 0.32,
            rotationDeg: 5,
            color: '#38bdf8',
            strokeColor: '#0f172a',
            revealAtMs: 900,
            scale: 0.88,
          },
        ],
        dialogues: [
          {
            id: 'dlg-s03-kevin',
            kind: 'speech',
            speakerId: 'mhs-04',
            speakerName: 'Kevin',
            text: 'Build selesai 0 galat. Paket telemetri MCU langsung terbaca di layar!',
            bubbleXNorm: 0.46,
            bubbleYNorm: 0.22,
            startOffsetMs: 1150,
            durationMs: 8800,
          },
        ],
      },
      {
        id: 'p3-cetak3d',
        title: 'EXTREME CLOSE-UP · PRINTER 3D MENCETAK',
        shotType: 'extreme-close-up',
        cameraDirection: 'dolly-in',
        actionStage: 'printer-3d-ecu',
        focusZoneIds: ['cetak-3d'],
        startViewport: { x: 10.6, y: 0.6, w: 10.8, h: 7.8 },
        endViewport: { x: 11.2, y: 1.0, w: 9.6, h: 7.0 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 1100,
        enterDirection: 'from-right',
        sfxCue: 'panel-whoosh',
        narrationText: 'Memeriksa presisi lapisan filamen pada hasil cetakan 3D.',
        narrationDock: 'bottom-right',
        actors: [
          { characterId: 'mhs-08', activity: 'work', poseId: 'P06', stageXNorm: 0.76, startTile: { x: 14.5, y: 4.1 }, facing: 'kiri', workEffect: 'print3d' },
        ],
        sfxTexts: [
          {
            id: 'sfx-s03-whirr',
            text: 'WHIRR~ 210°C',
            xNorm: 0.34,
            yNorm: 0.26,
            rotationDeg: -6,
            color: '#c084fc',
            strokeColor: '#0f172a',
            revealAtMs: 1450,
            scale: 0.92,
          },
        ],
        dialogues: [],
      },
      {
        id: 'p3-las',
        title: 'MEDIUM FULL SHOT · BENGKEL LAS (K3)',
        shotType: 'medium-full-shot',
        cameraDirection: 'reaction-shot',
        actionStage: 'welding-k3-medium',
        focusZoneIds: ['las'],
        startViewport: { x: 0.6, y: 0.6, w: 9.8, h: 7.8 },
        endViewport: { x: 1.0, y: 1.0, w: 9.0, h: 7.0 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 1650,
        enterDirection: 'from-bottom',
        sfxCue: 'weld-spark',
        narrationText: 'Pengelasan rangka robot dengan perlengkapan keselamatan K3 lengkap.',
        narrationDock: 'bottom-left',
        actors: [
          { characterId: 'mhs-07', activity: 'work', poseId: 'P20', stageXNorm: 0.34, startTile: { x: 3.4, y: 4.2 }, facing: 'kanan', workEffect: 'weld' },
          { characterId: 'mhs-09', activity: 'work', poseId: 'P13', stageXNorm: 0.72, startTile: { x: 6.8, y: 4.2 }, facing: 'kiri', workEffect: 'inspect' },
        ],
        sfxTexts: [
          {
            id: 'sfx-s03-kzrrt',
            text: 'KZRRT! SPARK!',
            xNorm: 0.52,
            yNorm: 0.30,
            rotationDeg: 6,
            color: '#fb923c',
            strokeColor: '#0f172a',
            revealAtMs: 1950,
            scale: 1.05,
          },
        ],
        dialogues: [
          {
            id: 'dlg-s03-bima',
            kind: 'speech',
            speakerId: 'mhs-07',
            speakerName: 'Bima',
            text: 'Standar K3 aman! Gilang, rangka ini siap diuji torsi.',
            bubbleXNorm: 0.36,
            bubbleYNorm: 0.22,
            startOffsetMs: 2200,
            durationMs: 7800,
          },
        ],
      },
      {
        id: 'p3-diskusi',
        title: 'MEDIUM SHOT · DISKUSI PROYEK DI MEJA UTAMA',
        shotType: 'medium-shot',
        cameraDirection: 'pan',
        actionStage: 'discussion-medium-table',
        focusZoneIds: ['diskusi'],
        startViewport: { x: 14.6, y: 10.6, w: 12.8, h: 8.6 },
        endViewport: { x: 15.2, y: 11.0, w: 11.8, h: 7.8 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 2200,
        enterDirection: 'from-right',
        sfxCue: 'comic-pop',
        narrationText: 'Berdiskusi menunjuk dokumen skema & menyelaraskan target tim.',
        narrationDock: 'bottom-right',
        actors: [
          { characterId: 'mhs-12', activity: 'talk', poseId: 'P14', stageXNorm: 0.32, startTile: { x: 19.2, y: 13.4 }, facing: 'kanan', workEffect: 'discuss' },
          { characterId: 'mhs-03', activity: 'interact', poseId: 'P17', stageXNorm: 0.70, startTile: { x: 22.4, y: 13.4 }, facing: 'kiri', workEffect: 'read' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s03-sari',
            kind: 'speech',
            speakerId: 'mhs-12',
            speakerName: 'Sari',
            text: 'Menurutku kita bisa menggabungkan modul sensor dan sasis 3D sore ini!',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.22,
            startOffsetMs: 2650,
            durationMs: 7400,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // SCENE 04 — MEET THE STUDENTS (29.0s – 41.0s)
  // Memperkenalkan seluruh 18 mahasiswa menyatu dalam 5 kegiatan nyata
  // ==========================================================================
  {
    pageNumber: 4,
    id: 'scene-04-meet-the-students',
    code: 'SCENE 04 / 06',
    title: 'MEET THE STUDENTS — 18 MAHASISWA DALAM AKSI NYATA',
    subtitle: 'Elektronika · Studio Desain & Koding · Kalibrasi Alat · Pojok Baca · Komunitas Robotika',
    startTimeMs: 29000,
    durationMs: 12000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'panel-whoosh',
    panels: [
      {
        id: 'p4-act-elektronika',
        title: 'MEDIUM SHOT · TANIA, MAYA, RANI, RAKA & DIMAS',
        shotType: 'medium-shot',
        cameraDirection: 'focus-transition',
        actionStage: 'oscilloscope-medium-bench',
        focusZoneIds: ['elektronik-iot'],
        startViewport: { x: 22.0, y: 0.6, w: 10.0, h: 7.8 },
        endViewport: { x: 22.4, y: 0.8, w: 9.2, h: 7.4 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 0,
        enterDirection: 'from-left',
        sfxCue: 'panel-whoosh',
        narrationText: 'Tania membimbing Rani & Maya membaca skema bersama Raka & Dimas.',
        narrationDock: 'bottom-left',
        actors: [
          { characterId: 'mhs-03', activity: 'talk', poseId: 'P14', stageXNorm: 0.16, startTile: { x: 23.0, y: 4.1 }, facing: 'kanan' },
          { characterId: 'mhs-11', activity: 'interact', poseId: 'P05', stageXNorm: 0.34, startTile: { x: 24.5, y: 4.1 }, facing: 'kanan' },
          { characterId: 'mhs-14', activity: 'interact', poseId: 'P06', stageXNorm: 0.52, startTile: { x: 26.0, y: 4.1 }, facing: 'kiri' },
          { characterId: 'mhs-01', activity: 'work', poseId: 'P13', stageXNorm: 0.70, startTile: { x: 27.5, y: 4.1 }, facing: 'kiri' },
          { characterId: 'mhs-02', activity: 'work', poseId: 'P20', stageXNorm: 0.86, startTile: { x: 29.0, y: 4.1 }, facing: 'kiri' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s04-rani',
            kind: 'speech',
            speakerId: 'mhs-14',
            speakerName: 'Rani',
            text: 'Skema filter Kak Tania dan analisis data Kak Maya bikin semuanya langsung jelas!',
            bubbleXNorm: 0.52,
            bubbleYNorm: 0.22,
            startOffsetMs: 450,
            durationMs: 10800,
          },
        ],
      },
      {
        id: 'p4-act-studio-koding',
        title: 'MEDIUM SHOT · FARHAN, AYU, KEVIN & MITA',
        shotType: 'medium-shot',
        cameraDirection: 'pan',
        actionStage: 'studio-design-medium',
        focusZoneIds: ['studio-desain', 'pemrograman'],
        startViewport: { x: 39.4, y: 0.6, w: 12.0, h: 8.0 },
        endViewport: { x: 39.8, y: 0.8, w: 11.4, h: 7.6 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 550,
        enterDirection: 'from-top',
        sfxCue: 'keyboard-clack',
        narrationText: 'Farhan & Ayu memadukan antarmuka UI dengan firmware Kevin & Mita.',
        narrationDock: 'bottom-left',
        actors: [
          { characterId: 'mhs-16', activity: 'talk', poseId: 'P15', stageXNorm: 0.18, startTile: { x: 42.0, y: 4.2 }, facing: 'kanan' },
          { characterId: 'mhs-05', activity: 'work', poseId: 'P04', stageXNorm: 0.40, startTile: { x: 44.0, y: 4.2 }, facing: 'kanan' },
          { characterId: 'mhs-04', activity: 'work', poseId: 'P20', stageXNorm: 0.64, startTile: { x: 46.5, y: 4.2 }, facing: 'kiri' },
          { characterId: 'mhs-06', activity: 'interact', poseId: 'P17', stageXNorm: 0.84, startTile: { x: 48.5, y: 4.2 }, facing: 'kiri' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s04-ayu',
            kind: 'speech',
            speakerId: 'mhs-05',
            speakerName: 'Ayu',
            text: 'Desain dashboard visual ini sudah terhubung real-time ke kode Kevin & Mita!',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.22,
            startOffsetMs: 1100,
            durationMs: 10200,
          },
        ],
      },
      {
        id: 'p4-act-gudang-3d',
        title: 'CLOSE-UP · TEGUH, NAUFAL & HENDRA',
        shotType: 'close-up',
        cameraDirection: 'reaction-shot',
        actionStage: 'gudang-calibration-closeup',
        focusZoneIds: ['gudang-alat', 'cetak-3d'],
        startViewport: { x: 32.0, y: 0.6, w: 7.5, h: 7.8 },
        endViewport: { x: 32.4, y: 0.8, w: 7.0, h: 7.4 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 1100,
        enterDirection: 'from-right',
        sfxCue: 'comic-pop',
        narrationText: 'Teguh mengkalibrasi alat ukur untuk purwarupa eksperimen Naufal & Hendra.',
        narrationDock: 'bottom-right',
        actors: [
          { characterId: 'mhs-10', activity: 'work', poseId: 'P20', stageXNorm: 0.22, startTile: { x: 33.5, y: 4.0 }, facing: 'kanan' },
          { characterId: 'mhs-15', activity: 'talk', poseId: 'P04', stageXNorm: 0.52, startTile: { x: 35.2, y: 4.0 }, facing: 'kanan' },
          { characterId: 'mhs-08', activity: 'interact', poseId: 'P02', stageXNorm: 0.80, startTile: { x: 37.0, y: 4.0 }, facing: 'kiri' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s04-naufal',
            kind: 'speech',
            speakerId: 'mhs-15',
            speakerName: 'Naufal',
            text: 'Generator mikro daur ulangku lolos uji multimeter Teguh dan pas di braket Hendra!',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.22,
            startOffsetMs: 1650,
            durationMs: 9600,
          },
        ],
      },
      {
        id: 'p4-act-baca-konsultasi',
        title: 'MEDIUM SHOT · SARI, NISA, SEKAR & IBU DOSEN',
        shotType: 'medium-shot',
        cameraDirection: 'over-the-shoulder',
        actionStage: 'reading-corner-medium',
        focusZoneIds: ['pojok-baca', 'konsultasi', 'ruang-dosen'],
        startViewport: { x: 39.4, y: 11.2, w: 12.0, h: 12.0 },
        endViewport: { x: 39.8, y: 11.6, w: 11.4, h: 11.4 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 1650,
        enterDirection: 'from-bottom',
        sfxCue: 'panel-whoosh',
        narrationText: 'Bertukar catatan riset & saling mendengarkan di Pojok Baca dan Ruang Konsultasi.',
        narrationDock: 'bottom-left',
        actors: [
          { characterId: 'dosen', activity: 'talk', poseId: 'P18', stageXNorm: 0.18, startTile: { x: 33.8, y: 13.5 }, facing: 'kanan' },
          { characterId: 'mhs-12', activity: 'talk', poseId: 'P16', stageXNorm: 0.42, startTile: { x: 42.0, y: 14.2 }, facing: 'kanan' },
          { characterId: 'mhs-13', activity: 'interact', poseId: 'P17', stageXNorm: 0.64, startTile: { x: 44.0, y: 14.2 }, facing: 'kiri' },
          { characterId: 'mhs-17', activity: 'work', poseId: 'P05', stageXNorm: 0.84, startTile: { x: 46.0, y: 14.2 }, facing: 'kiri' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s04-sekar',
            kind: 'speech',
            speakerId: 'mhs-17',
            speakerName: 'Sekar',
            text: 'Arsip literatur dan catatan empati dari Nisa & Sari sudah rapi untuk semua tim.',
            bubbleXNorm: 0.56,
            bubbleYNorm: 0.22,
            startOffsetMs: 2200,
            durationMs: 9100,
          },
        ],
      },
      {
        id: 'p4-act-robotika',
        title: 'MEDIUM FULL SHOT · BAGAS, BIMA & GILANG UJI ROVER',
        shotType: 'medium-full-shot',
        cameraDirection: 'tracking',
        actionStage: 'robotics-corridor-track',
        focusZoneIds: ['las', 'istirahat', 'diskusi'],
        startViewport: { x: 14.0, y: 10.5, w: 14.0, h: 9.0 },
        endViewport: { x: 15.5, y: 11.0, w: 13.0, h: 8.5 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 2200,
        enterDirection: 'from-right',
        sfxCue: 'light-sweep',
        narrationText: 'Bagas menguji rover robotika lintas-lab bersama Bima & Gilang.',
        narrationDock: 'bottom-right',
        actors: [
          { characterId: 'mhs-18', activity: 'work', poseId: 'P04', stageXNorm: 0.26, startTile: { x: 20.0, y: 15.0 }, facing: 'kanan', workEffect: 'rover' },
          { characterId: 'mhs-09', activity: 'talk', poseId: 'P03', stageXNorm: 0.60, startTile: { x: 22.0, y: 15.0 }, facing: 'kiri' },
          { characterId: 'mhs-07', activity: 'interact', poseId: 'P13', stageXNorm: 0.84, startTile: { x: 24.0, y: 15.0 }, facing: 'kiri' },
        ],
        sfxTexts: [
          {
            id: 'sfx-s04-vroom',
            text: 'VROOM~ SERVO OK!',
            xNorm: 0.44,
            yNorm: 0.68,
            rotationDeg: -4,
            color: '#4ade80',
            strokeColor: '#0f172a',
            revealAtMs: 2500,
            scale: 0.92,
          },
        ],
        dialogues: [
          {
            id: 'dlg-s04-bagas',
            kind: 'speech',
            speakerId: 'mhs-18',
            speakerName: 'Bagas',
            text: 'Aku sudah berhasil menyelesaikan integrasi rover robotika lintas-divisi!',
            bubbleXNorm: 0.48,
            bubbleYNorm: 0.22,
            startOffsetMs: 2700,
            durationMs: 8800,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // SCENE 05 — ONE COMMUNITY (41.0s – 51.0s)
  // 1. Wide Establishing Collaboration Shot (Seluruh 18 mahasiswa + Ibu Dosen)
  // 2. Close-Up Reaction Strip (Menjelaskan, Mendengarkan, Bertukar Dokumen)
  // ==========================================================================
  {
    pageNumber: 5,
    id: 'scene-05-one-community',
    code: 'SCENE 05 / 06',
    title: 'ONE COMMUNITY — KOLABORASI NYATA DI LABORATORIUM',
    subtitle: 'Wide Shot 18 Mahasiswa Berkolaborasi · Close-Up Reaksi & Kebersamaan Tim',
    startTimeMs: 41000,
    durationMs: 10000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'light-sweep',
    panels: [
      {
        id: 'p5-wide-collab',
        title: 'WIDE SHOT · 18 MAHASISWA & IBU DOSEN BERKOLABORASI',
        shotType: 'wide-shot',
        cameraDirection: 'dolly-out',
        actionStage: 'lab-map-wide',
        focusZoneIds: OFFICIAL_LAB_ZONE_IDS,
        startViewport: { x: 8.0, y: 3.5, w: 36.0, h: 17.5 },
        endViewport: { x: 1.5, y: 0.8, w: 49.0, h: 22.6 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 row-span-4',
        revealAtMs: 0,
        enterDirection: 'impact-zoom',
        sfxCue: 'light-sweep',
        narrationText: 'Berbeda keahlian, berbeda karakter. Namun satu tujuan menyatukan kita.',
        narrationDock: 'bottom-left',
        actors: [
          { characterId: 'dosen', activity: 'talk', poseId: 'P18', startTile: { x: 21.0, y: 12.4 }, facing: 'bawah', workEffect: 'discuss' },
          { characterId: 'mhs-01', activity: 'talk', poseId: 'P14', startTile: { x: 18.4, y: 13.2 }, facing: 'bawah', workEffect: 'discuss' },
          { characterId: 'mhs-03', activity: 'talk', poseId: 'P17', startTile: { x: 23.6, y: 13.2 }, facing: 'bawah', workEffect: 'discuss' },
          { characterId: 'mhs-12', activity: 'talk', poseId: 'P16', startTile: { x: 16.8, y: 15.0 }, facing: 'kanan', workEffect: 'discuss' },
          { characterId: 'mhs-13', activity: 'talk', poseId: 'P02', startTile: { x: 25.2, y: 15.0 }, facing: 'kiri', workEffect: 'discuss' },
          { characterId: 'mhs-14', activity: 'interact', poseId: 'P06', startTile: { x: 18.8, y: 17.2 }, facing: 'atas', workEffect: 'read' },
          { characterId: 'mhs-18', activity: 'work', poseId: 'P04', startTile: { x: 23.2, y: 17.2 }, facing: 'atas', workEffect: 'rover' },
          { characterId: 'mhs-02', activity: 'work', poseId: 'P20', startTile: { x: 24.0, y: 5.2 }, facing: 'bawah', workEffect: 'solder' },
          { characterId: 'mhs-10', activity: 'work', poseId: 'P20', startTile: { x: 34.8, y: 5.5 }, facing: 'bawah', workEffect: 'inspect' },
          { characterId: 'mhs-07', activity: 'work', poseId: 'P13', startTile: { x: 5.5, y: 5.5 }, facing: 'bawah', workEffect: 'weld' },
          { characterId: 'mhs-09', activity: 'talk', poseId: 'P03', startTile: { x: 7.5, y: 5.8 }, facing: 'kiri', workEffect: 'discuss' },
          { characterId: 'mhs-08', activity: 'work', poseId: 'P02', startTile: { x: 14.5, y: 5.5 }, facing: 'bawah', workEffect: 'print3d' },
          { characterId: 'mhs-15', activity: 'talk', poseId: 'P04', startTile: { x: 17.5, y: 5.8 }, facing: 'kiri', workEffect: 'inspect' },
          { characterId: 'mhs-04', activity: 'work', poseId: 'P13', startTile: { x: 4.5, y: 14.8 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-06', activity: 'work', poseId: 'P17', startTile: { x: 7.0, y: 14.8 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-11', activity: 'work', poseId: 'P05', startTile: { x: 9.8, y: 14.8 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-05', activity: 'work', poseId: 'P04', startTile: { x: 43.0, y: 5.2 }, facing: 'bawah', workEffect: 'design' },
          { characterId: 'mhs-16', activity: 'work', poseId: 'P15', startTile: { x: 46.5, y: 5.2 }, facing: 'bawah', workEffect: 'design' },
          { characterId: 'mhs-17', activity: 'work', poseId: 'P02', startTile: { x: 44.0, y: 14.8 }, facing: 'atas', workEffect: 'read' },
        ],
        sfxTexts: [],
        dialogues: [],
      },
      {
        id: 'p5-closeup-reactions',
        title: 'CLOSE-UP REACTION · MENJELASKAN, MENDENGARKAN & SALING MENGUATKAN',
        shotType: 'close-up',
        cameraDirection: 'reaction-shot',
        actionStage: 'community-reaction-strip',
        focusZoneIds: ['diskusi', 'konsultasi'],
        startViewport: { x: 15, y: 11, w: 12, h: 8 },
        endViewport: { x: 15, y: 11, w: 12, h: 8 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 row-span-2',
        revealAtMs: 700,
        enterDirection: 'from-bottom',
        sfxCue: 'comic-pop',
        actors: [
          { characterId: 'dosen', activity: 'talk', poseId: 'P18', stageXNorm: 0.16, startTile: { x: 20, y: 13 }, facing: 'kanan' },
          { characterId: 'mhs-01', activity: 'talk', poseId: 'P14', stageXNorm: 0.38, startTile: { x: 21, y: 13 }, facing: 'kanan' },
          { characterId: 'mhs-05', activity: 'talk', poseId: 'P04', stageXNorm: 0.62, startTile: { x: 22, y: 13 }, facing: 'kiri' },
          { characterId: 'mhs-18', activity: 'talk', poseId: 'P03', stageXNorm: 0.84, startTile: { x: 23, y: 13 }, facing: 'kiri' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s05-dosen',
            kind: 'speech',
            speakerId: 'dosen',
            speakerName: 'Ibu Dosen Pembimbing',
            text: 'Ketika karya teknis dan empati berjalan berdampingan, laboratorium ini benar-benar hidup!',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.24,
            startOffsetMs: 1100,
            durationMs: 8400,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // SCENE 06 — TITLE REVEAL (51.0s – 59.0s)
  // ==========================================================================
  {
    pageNumber: 6,
    id: 'scene-06-title-reveal',
    code: 'SCENE 06 / 06',
    title: 'RUANG DENGAR — SIMULASI LABORATORIUM ELEKTRONIKA & IoT',
    subtitle: 'Mulai Perjalananmu Mendampingi 18 Mahasiswa di Laboratorium',
    startTimeMs: 51000,
    durationMs: 8000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'title-climax',
    panels: [
      {
        id: 'p6-splash-title-reveal',
        title: 'RUANG DENGAR — SIMULASI LABORATORIUM ELEKTRONIKA & IoT',
        shotType: 'wide-shot',
        cameraDirection: 'dolly-in',
        actionStage: 'lab-map-wide',
        focusZoneIds: OFFICIAL_LAB_ZONE_IDS,
        startViewport: { x: -0.5, y: -0.4, w: 53.0, h: 24.8 },
        endViewport: { x: 1.5, y: 0.5, w: 49.0, h: 23.0 },
        ambientTheme: 'title-climax',
        gridClass: 'col-span-12 row-span-6',
        revealAtMs: 0,
        enterDirection: 'impact-zoom',
        sfxCue: 'title-climax',
        actors: [
          { characterId: 'dosen', activity: 'idle', poseId: 'P02', startTile: { x: 21.0, y: 12.6 }, facing: 'bawah' },
          { characterId: 'mhs-01', activity: 'work', startTile: { x: 25.0, y: 4.2 }, facing: 'atas', workEffect: 'oscilloscope' },
          { characterId: 'mhs-02', activity: 'work', startTile: { x: 23.4, y: 4.2 }, facing: 'atas', workEffect: 'solder' },
          { characterId: 'mhs-03', activity: 'work', startTile: { x: 27.6, y: 4.2 }, facing: 'atas', workEffect: 'oscilloscope' },
          { characterId: 'mhs-04', activity: 'work', startTile: { x: 3.5, y: 14.8 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-05', activity: 'work', startTile: { x: 17.5, y: 4.2 }, facing: 'atas', workEffect: 'print3d' },
          { characterId: 'mhs-06', activity: 'work', startTile: { x: 6.0, y: 14.8 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-07', activity: 'work', startTile: { x: 3.5, y: 4.2 }, facing: 'atas', workEffect: 'weld' },
          { characterId: 'mhs-08', activity: 'work', startTile: { x: 14.5, y: 4.2 }, facing: 'atas', workEffect: 'print3d' },
          { characterId: 'mhs-09', activity: 'work', startTile: { x: 7.0, y: 4.2 }, facing: 'atas', workEffect: 'inspect' },
          { characterId: 'mhs-10', activity: 'work', startTile: { x: 35.0, y: 4.2 }, facing: 'atas', workEffect: 'inspect' },
          { characterId: 'mhs-11', activity: 'work', startTile: { x: 9.0, y: 14.8 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-12', activity: 'talk', startTile: { x: 19.0, y: 13.4 }, facing: 'bawah', workEffect: 'discuss' },
          { characterId: 'mhs-13', activity: 'talk', startTile: { x: 22.5, y: 13.4 }, facing: 'bawah', workEffect: 'discuss' },
          { characterId: 'mhs-14', activity: 'interact', startTile: { x: 19.0, y: 16.6 }, facing: 'atas', workEffect: 'read' },
          { characterId: 'mhs-15', activity: 'interact', startTile: { x: 16.0, y: 5.8 }, facing: 'atas', workEffect: 'inspect' },
          { characterId: 'mhs-16', activity: 'work', startTile: { x: 43.0, y: 4.2 }, facing: 'atas', workEffect: 'design' },
          { characterId: 'mhs-17', activity: 'work', startTile: { x: 44.0, y: 14.2 }, facing: 'bawah', workEffect: 'read' },
          { characterId: 'mhs-18', activity: 'work', startTile: { x: 22.8, y: 16.6 }, facing: 'atas', workEffect: 'rover' },
        ],
        sfxTexts: [],
        dialogues: [],
      },
    ],
  },
];

export const COMIC_STORY_TOTAL_DURATION_MS = COMIC_STORY_PAGES.reduce(
  (maxEnd, page) => Math.max(maxEnd, page.startTimeMs + page.durationMs),
  0
);

export interface StoryTimelineState {
  elapsedMs: number;
  totalDurationMs: number;
  overallProgress01: number;
  activePageIndex: number;
  activePage: ComicPageBlueprint;
  pageElapsedMs: number;
  pageProgress01: number;
  isFinished: boolean;
}

export function clampStoryTimeMs(ms: number, totalDurationMs = COMIC_STORY_TOTAL_DURATION_MS): number {
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.min(totalDurationMs, ms));
}

export function computeStoryTimelineState(
  rawElapsedMs: number,
  pages: readonly ComicPageBlueprint[] = COMIC_STORY_PAGES
): StoryTimelineState {
  const totalDurationMs = pages.reduce(
    (maxEnd, p) => Math.max(maxEnd, p.startTimeMs + p.durationMs),
    0
  );
  const elapsedMs = clampStoryTimeMs(rawElapsedMs, totalDurationMs);

  let activePageIndex = pages.length - 1;
  for (let i = 0; i < pages.length; i += 1) {
    const p = pages[i];
    if (elapsedMs >= p.startTimeMs && elapsedMs < p.startTimeMs + p.durationMs) {
      activePageIndex = i;
      break;
    }
  }

  const activePage = pages[activePageIndex];
  const pageElapsedMs = Math.max(0, elapsedMs - activePage.startTimeMs);
  const pageProgress01 = Math.max(0, Math.min(1, pageElapsedMs / Math.max(1, activePage.durationMs)));

  return {
    elapsedMs,
    totalDurationMs,
    overallProgress01: totalDurationMs > 0 ? elapsedMs / totalDurationMs : 1,
    activePageIndex,
    activePage,
    pageElapsedMs,
    pageProgress01,
    isFinished: elapsedMs >= totalDurationMs,
  };
}

export function getNextPageStartMs(
  elapsedMs: number,
  pages: readonly ComicPageBlueprint[] = COMIC_STORY_PAGES
): number {
  const st = computeStoryTimelineState(elapsedMs, pages);
  const nextIdx = st.activePageIndex + 1;
  if (nextIdx >= pages.length) return st.totalDurationMs;
  return pages[nextIdx].startTimeMs;
}

export function getPrevPageStartMs(
  elapsedMs: number,
  pages: readonly ComicPageBlueprint[] = COMIC_STORY_PAGES
): number {
  const st = computeStoryTimelineState(elapsedMs, pages);
  if (st.pageElapsedMs > 1400) {
    return st.activePage.startTimeMs;
  }
  const prevIdx = Math.max(0, st.activePageIndex - 1);
  return pages[prevIdx].startTimeMs;
}
