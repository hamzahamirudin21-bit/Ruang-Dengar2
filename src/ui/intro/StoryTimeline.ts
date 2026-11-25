import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { LAB_MAP } from '../../data/map';
import { STUDENT_BACKGROUNDS } from '../../data/studentBackgrounds';
import { STUDENT_APPEARANCES, type CharacterAppearance } from '../characters/appearance';
import type { Direction } from '../characters/pixelGrid';
import { IntroSfxKind } from '../motion/sfx';

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
  /** Koordinat tile kiri-atas pada LAB_MAP (52x24) */
  x: number;
  y: number;
  /** Lebar & tinggi area pandang dalam satuan tile LAB_MAP */
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
  /** Posisi tile awal pada LAB_MAP (koordinat kaki karakter) */
  startTile: { x: number; y: number };
  /** Titik-titik jalur jalan dalam koordinat tile LAB_MAP (bila activity === 'walk') */
  waypoints?: readonly { x: number; y: number }[];
  /** Arah hadap sprite 4 arah asli ('down' | 'left' | 'right' | 'up') */
  facing: Direction;
  /** Arah hadap kedua saat activity === 'turn' */
  turnToFacing?: Direction;
  /** Efek interaksi peralatan laboratorium di depan sprite */
  workEffect?: LabWorkEffectKind;
  /** Label status mikro opsional di bawah/atas peralatan */
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
  /** Posisi balon di dalam panel (normalisasi 0..1) di area aman bebas karakter */
  bubbleXNorm: number;
  bubbleYNorm: number;
  startOffsetMs: number;
  durationMs: number;
}

export interface ComicPanelBlueprint {
  id: string;
  title: string;
  /** Daftar ID zona ruangan dari LAB_MAP.zones yang ditampilkan pada panel ini */
  focusZoneIds: readonly string[];
  /** Viewport awal kamera pada koordinat tile LAB_MAP (52x24) */
  startViewport: TileViewport;
  /** Viewport akhir kamera pada koordinat tile LAB_MAP untuk pan/zoom kamera halus */
  endViewport: TileViewport;
  /** Mode pencahayaan ekstra panel */
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

/**
 * Registry karakter komik yang terhubung langsung dengan STUDENT_BLUEPRINTS,
 * STUDENT_BACKGROUNDS, dan STUDENT_APPEARANCES pada simulasi utama.
 */
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

/** Memastikan seluruh ID zona pada panel komik merujuk pada LAB_MAP.zones resmi simulasi utama */
export const OFFICIAL_LAB_ZONE_IDS: readonly string[] = LAB_MAP.zones.map((z) => z.id);

/**
 * 6 Halaman Komik Sinematik Berbasis Peta Simulasi LAB_MAP & Mini Character Sprites
 */
export const COMIC_STORY_PAGES: readonly ComicPageBlueprint[] = [
  // ==========================================================================
  // SCENE 01 / PAGE 1 — MORNING AT CAMPUS (0.0s – 9.0s)
  // Lingkungan Gedung Laboratorium, Pepohonan Rimbun, Tangga Masuk Selatan,
  // Papan Nama, Lampu Bangunan, Pot Tanaman & Mahasiswa Miniatur Berjalan
  // ==========================================================================
  {
    pageNumber: 1,
    id: 'scene-01-morning-at-campus',
    code: 'SCENE 01 / 06',
    title: 'MORNING AT CAMPUS — FAJAR DI GEDUNG LABORATORIUM',
    subtitle: 'Gedung Laboratorium Elektronika & IoT, Taman Kampus & Mahasiswa Miniatur Tiba',
    startTimeMs: 0,
    durationMs: 9000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'ambient-chime',
    panels: [
      {
        id: 'p1-splash-lab-building',
        title: 'GEDUNG LABORATORIUM ELEKTRONIKA & IoT',
        focusZoneIds: OFFICIAL_LAB_ZONE_IDS,
        startViewport: { x: -1.2, y: -1.0, w: 54.4, h: 26.2 },
        endViewport: { x: 2.0, y: 0.5, w: 48.0, h: 23.2 },
        ambientTheme: 'morning-exterior',
        gridClass: 'col-span-12 md:col-span-8 row-span-6',
        revealAtMs: 0,
        enterDirection: 'from-left',
        sfxCue: 'light-sweep',
        narrationText: 'Setiap perjalanan besar selalu dimulai dari sebuah tempat.',
        narrationDock: 'top-left',
        actors: [
          // Mahasiswa miniatur & Ibu Dosen berjalan menuju pintu tangga selatan gedung
          {
            characterId: 'dosen',
            activity: 'walk',
            startTile: { x: 21.5, y: 23.2 },
            waypoints: [
              { x: 21.5, y: 20.2 },
              { x: 21.5, y: 18.5 },
            ],
            facing: 'atas',
          },
          {
            characterId: 'mhs-01',
            activity: 'walk',
            startTile: { x: 23.2, y: 22.8 },
            waypoints: [
              { x: 23.2, y: 19.5 },
              { x: 25.0, y: 18.0 },
            ],
            facing: 'atas',
          },
          {
            characterId: 'mhs-03',
            activity: 'walk',
            startTile: { x: 16.5, y: 21.0 },
            waypoints: [{ x: 20.5, y: 21.0 }],
            facing: 'kanan',
          },
          {
            characterId: 'mhs-04',
            activity: 'walk',
            startTile: { x: 14.0, y: 9.5 },
            waypoints: [{ x: 8.5, y: 9.5 }],
            facing: 'kiri',
          },
          {
            characterId: 'mhs-05',
            activity: 'walk',
            startTile: { x: 35.0, y: 9.5 },
            waypoints: [{ x: 42.0, y: 9.5 }],
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
            text: 'Pagi yang cerah! Seluruh 11 ruang laboratorium sudah menyala untuk sesi praktikum hari ini.',
            bubbleXNorm: 0.56,
            bubbleYNorm: 0.84,
            startOffsetMs: 1400,
            durationMs: 7000,
          },
        ],
      },
      {
        id: 'p1-detail-west-wing',
        title: 'SAYAP BARAT · BENGKEL LAS K3 & CETAK 3D',
        focusZoneIds: ['las', 'cetak-3d'],
        startViewport: { x: -0.6, y: -0.6, w: 22.0, h: 10.2 },
        endViewport: { x: 0.2, y: 0.0, w: 20.5, h: 9.5 },
        ambientTheme: 'morning-exterior',
        gridClass: 'col-span-6 md:col-span-4 row-span-3',
        revealAtMs: 600,
        enterDirection: 'from-top',
        sfxCue: 'panel-whoosh',
        narrationText: 'Cahaya pagi menyinari deretan pepohonan & jendela ruang praktikum.',
        narrationDock: 'bottom-left',
        actors: [
          {
            characterId: 'mhs-07',
            activity: 'walk',
            startTile: { x: 5.5, y: 9.2 },
            waypoints: [{ x: 5.5, y: 5.5 }],
            facing: 'atas',
          },
          {
            characterId: 'mhs-08',
            activity: 'walk',
            startTile: { x: 16.0, y: 9.2 },
            waypoints: [{ x: 16.0, y: 5.5 }],
            facing: 'atas',
          },
        ],
        sfxTexts: [],
        dialogues: [],
      },
      {
        id: 'p1-detail-south-entrance',
        title: 'GERBANG SELATAN & TANGGA UTAMA LAB',
        focusZoneIds: ['diskusi', 'istirahat', 'ruang-dosen'],
        startViewport: { x: 12.5, y: 16.0, w: 20.0, h: 9.2 },
        endViewport: { x: 13.5, y: 16.5, w: 18.0, h: 8.5 },
        ambientTheme: 'morning-exterior',
        gridClass: 'col-span-6 md:col-span-4 row-span-3',
        revealAtMs: 1200,
        enterDirection: 'from-right',
        sfxCue: 'footstep',
        narrationText: 'Mahasiswa melangkah menaiki tangga pintu utama gedung.',
        narrationDock: 'top-right',
        actors: [
          {
            characterId: 'mhs-02',
            activity: 'walk',
            startTile: { x: 21.0, y: 23.4 },
            waypoints: [{ x: 21.0, y: 19.8 }],
            facing: 'atas',
          },
          {
            characterId: 'mhs-12',
            activity: 'walk',
            startTile: { x: 23.5, y: 23.4 },
            waypoints: [{ x: 23.5, y: 19.6 }],
            facing: 'atas',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-s01-tap',
            text: 'TAP... TAP...',
            xNorm: 0.72,
            yNorm: 0.76,
            rotationDeg: -6,
            color: '#fef08a',
            strokeColor: '#0f172a',
            revealAtMs: 1500,
            scale: 0.9,
          },
        ],
        dialogues: [],
      },
    ],
  },

  // ==========================================================================
  // SCENE 02 / PAGE 2 — ENTER THE LAB (9.0s – 18.0s)
  // Pintu Masuk, Koridor Ubin Keramik, Pintu Kaca Geser, Kusen, Plakat Ruangan,
  // Lampu Koridor, Tanaman Pot & Furnitur Terlihat dari Dalam Ruangan
  // ==========================================================================
  {
    pageNumber: 2,
    id: 'scene-02-enter-the-lab',
    code: 'SCENE 02 / 06',
    title: 'ENTER THE LAB — MELINTASI KORIDOR & PINTU KACA LABORATORIUM',
    subtitle: 'Lantai Ubin Koridor, Pintu Kaca Geser, Plakat Identitas Ruangan & Lampu Dinding',
    startTimeMs: 9000,
    durationMs: 9000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'door-open',
    panels: [
      {
        id: 'p2-entrance-foyer',
        title: 'FOYER PINTU MASUK UTAMA & TAMAN DALAM',
        focusZoneIds: ['diskusi', 'istirahat'],
        startViewport: { x: 13.0, y: 14.5, w: 17.0, h: 9.5 },
        endViewport: { x: 13.5, y: 12.5, w: 16.5, h: 9.5 },
        ambientTheme: 'corridor-entry',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 0,
        enterDirection: 'from-left',
        sfxCue: 'footstep',
        narrationText: 'Melangkah melewati pintu masuk utama menuju area tengah laboratorium.',
        narrationDock: 'top-left',
        actors: [
          {
            characterId: 'dosen',
            activity: 'walk',
            startTile: { x: 21.5, y: 21.5 },
            waypoints: [
              { x: 21.5, y: 19.5 },
              { x: 16.0, y: 19.5 },
            ],
            facing: 'atas',
          },
          {
            characterId: 'mhs-01',
            activity: 'walk',
            startTile: { x: 23.0, y: 21.0 },
            waypoints: [
              { x: 28.0, y: 21.0 },
              { x: 28.0, y: 16.5 },
            ],
            facing: 'kanan',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-s02-step',
            text: 'TAP... TAP...',
            xNorm: 0.36,
            yNorm: 0.78,
            rotationDeg: -5,
            color: '#fef08a',
            strokeColor: '#0f172a',
            revealAtMs: 400,
            scale: 0.92,
          },
        ],
        dialogues: [
          {
            id: 'dlg-s02-dosen',
            kind: 'speech',
            speakerId: 'dosen',
            speakerName: 'Ibu Dosen',
            text: 'Pintu utama sudah terbuka. Mari kita sapa rekan-rekan mahasiswa di setiap stasiun kerja.',
            bubbleXNorm: 0.52,
            bubbleYNorm: 0.24,
            startOffsetMs: 700,
            durationMs: 7800,
          },
        ],
      },
      {
        id: 'p2-glass-doors-corridor',
        title: 'KORIDOR TENGAH & PINTU KACA GESER LABORATORIUM',
        focusZoneIds: ['elektronik-iot', 'gudang-alat', 'diskusi'],
        startViewport: { x: 20.5, y: 4.5, w: 18.5, h: 8.5 },
        endViewport: { x: 21.0, y: 3.5, w: 17.5, h: 8.5 },
        ambientTheme: 'corridor-entry',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 650,
        enterDirection: 'from-right',
        sfxCue: 'door-open',
        narrationText: 'Pintu kaca geser menghubungkan koridor keramik dengan ruang praktikum.',
        narrationDock: 'top-right',
        actors: [
          {
            characterId: 'mhs-03',
            activity: 'walk',
            startTile: { x: 26.0, y: 9.8 },
            waypoints: [{ x: 26.0, y: 5.5 }],
            facing: 'atas',
          },
          {
            characterId: 'mhs-10',
            activity: 'walk',
            startTile: { x: 34.5, y: 9.8 },
            waypoints: [{ x: 34.5, y: 5.5 }],
            facing: 'atas',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-s02-swoosh',
            text: 'KLIK! SWOOSH!',
            xNorm: 0.48,
            yNorm: 0.62,
            rotationDeg: -4,
            color: '#67e8f9',
            strokeColor: '#0f172a',
            revealAtMs: 950,
            scale: 0.95,
          },
        ],
        dialogues: [],
      },
      {
        id: 'p2-east-corridor-consultation',
        title: 'PERSIMPANGAN TIMUR · RUANG KONSULTASI, DOSEN & POJOK BACA',
        focusZoneIds: ['konsultasi', 'ruang-dosen', 'pojok-baca', 'diskusi'],
        startViewport: { x: 26.0, y: 9.5, w: 25.0, h: 13.5 },
        endViewport: { x: 27.5, y: 10.0, w: 23.5, h: 13.0 },
        ambientTheme: 'corridor-entry',
        gridClass: 'col-span-12 row-span-3',
        revealAtMs: 1300,
        enterDirection: 'from-bottom',
        sfxCue: 'panel-whoosh',
        narrationText:
          'Di tempat ini, rasa ingin tahu berubah menjadi eksperimen. Ide sederhana berkembang menjadi teknologi.',
        narrationDock: 'bottom-left',
        actors: [
          {
            characterId: 'dosen',
            activity: 'walk',
            startTile: { x: 28.5, y: 16.5 },
            waypoints: [
              { x: 28.5, y: 13.2 },
              { x: 32.5, y: 13.2 },
            ],
            facing: 'kanan',
          },
          {
            characterId: 'mhs-17',
            activity: 'walk',
            startTile: { x: 39.2, y: 10.0 },
            waypoints: [
              { x: 44.0, y: 10.0 },
              { x: 44.0, y: 13.8 },
            ],
            facing: 'bawah',
          },
          {
            characterId: 'mhs-16',
            activity: 'walk',
            startTile: { x: 38.0, y: 9.4 },
            waypoints: [
              { x: 44.0, y: 9.4 },
              { x: 44.0, y: 5.5 },
            ],
            facing: 'atas',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s02-sekar',
            kind: 'speech',
            speakerId: 'mhs-17',
            speakerName: 'Sekar',
            text: 'Lampu baca dan rak jurnal di Pojok Baca sudah siap dipakai untuk riset pagi ini, Bu!',
            bubbleXNorm: 0.76,
            bubbleYNorm: 0.25,
            startOffsetMs: 1850,
            durationMs: 6600,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // SCENE 03 / PAGE 3 — ACTIVITY IN LABORATORY (18.0s – 28.0s)
  // 5 Panel Kegiatan Praktikum di 5 Ruangan Berbeda Sesuai Peta Simulasi:
  // 1. Elektronika & IoT (Meja praktikum, osiloskop, power supply, breadboard, PCB)
  // 2. Pemrograman & MCU (Meja komputer, monitor kode, keyboard, dev board)
  // 3. Ruang Cetak 3D (4 Printer 3D, filament spool, rak material, objek 3D)
  // 4. Bengkel Las K3 (Meja kerja industrial, mesin las, tabung gas, APAR, marka K3)
  // 5. Meja Diskusi (Meja kayu besar, 6 kursi, laptop, dokumen, whiteboard)
  // ==========================================================================
  {
    pageNumber: 3,
    id: 'scene-03-activity-in-laboratory',
    code: 'SCENE 03 / 06',
    title: 'ACTIVITY IN LABORATORY — LIMA STASIUN KERJA BERGERAK SERENTAK',
    subtitle: 'Elektronika & IoT, Pemrograman MCU, Cetak 3D, Bengkel Las K3 & Meja Diskusi',
    startTimeMs: 18000,
    durationMs: 10000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'solder-sizzle',
    panels: [
      // Panel 1: Elektronika & IoT
      {
        id: 'p3-room-elektronika',
        title: '1. STASIUN ELEKTRONIKA & IoT',
        focusZoneIds: ['elektronik-iot'],
        startViewport: { x: 21.5, y: 0.6, w: 10.0, h: 7.8 },
        endViewport: { x: 21.8, y: 0.8, w: 9.4, h: 7.4 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 0,
        enterDirection: 'from-left',
        sfxCue: 'solder-sizzle',
        narrationText: 'Elektronika & IoT · Osiloskop, Power Supply, PCB & Sensor',
        narrationDock: 'bottom-left',
        actors: [
          {
            characterId: 'mhs-02',
            activity: 'work',
            startTile: { x: 23.6, y: 4.1 },
            facing: 'atas',
            workEffect: 'solder',
            stationTag: 'Solder SMD',
          },
          {
            characterId: 'mhs-01',
            activity: 'work',
            startTile: { x: 25.4, y: 4.1 },
            facing: 'atas',
            workEffect: 'oscilloscope',
            stationTag: 'Sensor IoT',
          },
          {
            characterId: 'mhs-03',
            activity: 'work',
            startTile: { x: 28.0, y: 4.1 },
            facing: 'atas',
            workEffect: 'oscilloscope',
            stationTag: 'Osiloskop',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s03-dimas',
            kind: 'speech',
            speakerId: 'mhs-02',
            speakerName: 'Dimas',
            text: 'Rangkaian regulator 3.3V dan breadboard sensor sudah tersolder rapi.',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.74,
            startOffsetMs: 500,
            durationMs: 9000,
          },
        ],
      },

      // Panel 2: Pemrograman & MCU
      {
        id: 'p3-room-pemrograman',
        title: '2. STASIUN PEMROGRAMAN & MCU',
        focusZoneIds: ['pemrograman'],
        startViewport: { x: 0.6, y: 10.4, w: 12.8, h: 6.8 },
        endViewport: { x: 1.0, y: 10.6, w: 12.0, h: 6.4 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 500,
        enterDirection: 'from-top',
        sfxCue: 'keyboard-clack',
        narrationText: 'Pemrograman & MCU · Multi-Monitor Kode & Dev Board',
        narrationDock: 'bottom-left',
        actors: [
          {
            characterId: 'mhs-04',
            activity: 'work',
            startTile: { x: 3.2, y: 15.0 },
            facing: 'atas',
            workEffect: 'code',
            stationTag: 'RTOS Code',
          },
          {
            characterId: 'mhs-06',
            activity: 'work',
            startTile: { x: 5.0, y: 15.0 },
            facing: 'atas',
            workEffect: 'code',
            stationTag: 'API Docs',
          },
          {
            characterId: 'mhs-11',
            activity: 'work',
            startTile: { x: 8.5, y: 15.0 },
            facing: 'atas',
            workEffect: 'code',
            stationTag: 'Data Log',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s03-kevin',
            kind: 'speech',
            speakerId: 'mhs-04',
            speakerName: 'Kevin',
            text: 'Firmware mikrokontroler sudah terunggah lewat USB tanpa galat!',
            bubbleXNorm: 0.52,
            bubbleYNorm: 0.24,
            startOffsetMs: 1100,
            durationMs: 8400,
          },
        ],
      },

      // Panel 3: Ruang Cetak 3D
      {
        id: 'p3-room-cetak3d',
        title: '3. STASIUN CETAK 3D',
        focusZoneIds: ['cetak-3d'],
        startViewport: { x: 10.6, y: 0.6, w: 10.8, h: 7.8 },
        endViewport: { x: 10.9, y: 0.8, w: 10.2, h: 7.4 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 1000,
        enterDirection: 'from-right',
        sfxCue: 'panel-whoosh',
        narrationText: 'Cetak 3D · 4 Unit Printer 3D, Spool Filamen & Meja Kerja',
        narrationDock: 'bottom-right',
        actors: [
          {
            characterId: 'mhs-08',
            activity: 'work',
            startTile: { x: 14.5, y: 4.1 },
            facing: 'atas',
            workEffect: 'print3d',
            stationTag: 'Nozzle 210°C',
          },
          {
            characterId: 'mhs-05',
            activity: 'work',
            startTile: { x: 17.5, y: 4.1 },
            facing: 'atas',
            workEffect: 'print3d',
            stationTag: 'Casing 3D',
          },
          {
            characterId: 'mhs-15',
            activity: 'interact',
            startTile: { x: 16.0, y: 5.9 },
            facing: 'kiri',
            workEffect: 'inspect',
            stationTag: 'Purwarupa',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s03-hendra',
            kind: 'speech',
            speakerId: 'mhs-08',
            speakerName: 'Hendra',
            text: 'Keempat printer 3D dan gulungan filamen PLA berjalan stabil.',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.74,
            startOffsetMs: 1600,
            durationMs: 7900,
          },
        ],
      },

      // Panel 4: Bengkel Las (K3)
      {
        id: 'p3-room-las',
        title: '4. BENGKEL LAS (ZONA K3)',
        focusZoneIds: ['las'],
        startViewport: { x: 0.6, y: 0.6, w: 9.8, h: 7.8 },
        endViewport: { x: 0.8, y: 0.8, w: 9.4, h: 7.4 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 1500,
        enterDirection: 'from-bottom',
        sfxCue: 'weld-spark',
        narrationText: 'Bengkel Las K3 · Mesin Las, Tabung Gas, APAR & Marka Keselamatan',
        narrationDock: 'bottom-left',
        actors: [
          {
            characterId: 'mhs-07',
            activity: 'work',
            startTile: { x: 3.4, y: 4.2 },
            facing: 'atas',
            workEffect: 'weld',
            stationTag: 'Las K3',
          },
          {
            characterId: 'mhs-09',
            activity: 'work',
            startTile: { x: 6.8, y: 4.2 },
            facing: 'atas',
            workEffect: 'inspect',
            stationTag: 'Uji Rangka',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-s03-spark',
            text: 'KZRRT! K3 AMAN',
            xNorm: 0.36,
            yNorm: 0.34,
            rotationDeg: -5,
            color: '#fb923c',
            strokeColor: '#0f172a',
            revealAtMs: 1850,
            scale: 0.92,
          },
        ],
        dialogues: [
          {
            id: 'dlg-s03-bima',
            kind: 'speech',
            speakerId: 'mhs-07',
            speakerName: 'Bima',
            text: 'APAR siaga, marka kuning-hitam bersih, dan sambungan rangka las presisi!',
            bubbleXNorm: 0.56,
            bubbleYNorm: 0.72,
            startOffsetMs: 2100,
            durationMs: 7400,
          },
        ],
      },

      // Panel 5: Meja Diskusi
      {
        id: 'p3-room-diskusi',
        title: '5. MEJA DISKUSI UTAMA',
        focusZoneIds: ['diskusi'],
        startViewport: { x: 14.6, y: 10.6, w: 12.8, h: 8.6 },
        endViewport: { x: 15.0, y: 10.9, w: 12.0, h: 8.0 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 2000,
        enterDirection: 'from-right',
        sfxCue: 'comic-pop',
        narrationText: 'Meja Diskusi · Laptop, Dokumen, Papan Presentasi & Koordinasi Tim',
        narrationDock: 'bottom-right',
        actors: [
          {
            characterId: 'mhs-12',
            activity: 'talk',
            startTile: { x: 19.2, y: 13.4 },
            facing: 'bawah',
            workEffect: 'discuss',
          },
          {
            characterId: 'mhs-13',
            activity: 'talk',
            startTile: { x: 22.4, y: 13.4 },
            facing: 'bawah',
            workEffect: 'discuss',
          },
          {
            characterId: 'mhs-14',
            activity: 'interact',
            startTile: { x: 19.2, y: 16.6 },
            facing: 'atas',
            workEffect: 'read',
          },
          {
            characterId: 'mhs-18',
            activity: 'talk',
            startTile: { x: 22.6, y: 16.6 },
            facing: 'atas',
            workEffect: 'rover',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s03-sari',
            kind: 'speech',
            speakerId: 'mhs-12',
            speakerName: 'Sari',
            text: 'Semua jadwal integrasi sensor, 3D casing, dan rangka robot kita bahas bersama di meja ini.',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.22,
            startOffsetMs: 2500,
            durationMs: 7000,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // SCENE 04 / PAGE 4 — THE LAB COMMUNITY (28.0s – 40.0s)
  // Memperkenalkan seluruh 18 Mahasiswa melalui miniatur sprite di ruangan
  // lainnya pada peta simulasi: Gudang Alat, Studio Desain, Pojok Baca,
  // Ruang Istirahat, Ruang Konsultasi & Ruang Dosen!
  // ==========================================================================
  {
    pageNumber: 4,
    id: 'scene-04-the-lab-community',
    code: 'SCENE 04 / 06',
    title: 'THE LAB COMMUNITY — 18 MAHASISWA DI 11 RUANGAN LABORATORIUM',
    subtitle: 'Gudang Alat, Studio Desain, Pojok Baca, Ruang Istirahat, Ruang Konsultasi & Ruang Dosen',
    startTimeMs: 28000,
    durationMs: 12000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'panel-whoosh',
    panels: [
      // Panel 4A: Gudang Alat & Elektronika (Teguh #10, Raka #01, Dimas #02, Tania #03, Rani #14)
      {
        id: 'p4-gudang-elektronika',
        title: 'GUDANG ALAT & STASIUN ELEKTRONIKA',
        focusZoneIds: ['gudang-alat', 'elektronik-iot'],
        startViewport: { x: 22.0, y: 0.6, w: 17.5, h: 8.2 },
        endViewport: { x: 22.5, y: 0.8, w: 16.8, h: 7.8 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 0,
        enterDirection: 'from-left',
        sfxCue: 'panel-whoosh',
        narrationText: 'Teguh (#10) memeriksa inventaris Gudang Alat bersama tim Elektronika.',
        narrationDock: 'bottom-left',
        actors: [
          { characterId: 'mhs-02', activity: 'work', startTile: { x: 23.6, y: 4.1 }, facing: 'atas', workEffect: 'solder' },
          { characterId: 'mhs-01', activity: 'work', startTile: { x: 25.5, y: 4.1 }, facing: 'atas', workEffect: 'oscilloscope' },
          { characterId: 'mhs-03', activity: 'talk', startTile: { x: 27.6, y: 4.2 }, facing: 'bawah', workEffect: 'discuss' },
          { characterId: 'mhs-14', activity: 'interact', startTile: { x: 27.6, y: 5.8 }, facing: 'atas', workEffect: 'read' },
          { characterId: 'mhs-10', activity: 'work', startTile: { x: 35.2, y: 4.0 }, facing: 'atas', workEffect: 'inspect', stationTag: 'Kalibrasi' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s04-teguh',
            kind: 'speech',
            speakerId: 'mhs-10',
            speakerName: 'Teguh',
            text: 'Kotak komponen, multimeter, dan label inventaris di Gudang Alat sudah lengkap.',
            bubbleXNorm: 0.64,
            bubbleYNorm: 0.72,
            startOffsetMs: 400,
            durationMs: 11000,
          },
        ],
      },

      // Panel 4B: Studio Desain & Cetak 3D (Farhan #16, Ayu #05, Hendra #08, Naufal #15)
      {
        id: 'p4-studio-desain',
        title: 'STUDIO DESAIN & MULTIMEDIA',
        focusZoneIds: ['studio-desain'],
        startViewport: { x: 39.4, y: 0.6, w: 12.0, h: 8.0 },
        endViewport: { x: 39.8, y: 0.8, w: 11.4, h: 7.6 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 550,
        enterDirection: 'from-top',
        sfxCue: 'keyboard-clack',
        narrationText: 'Farhan (#16) & Ayu (#05) merancang UI/UX di workstation tablet gambar.',
        narrationDock: 'bottom-left',
        actors: [
          { characterId: 'mhs-16', activity: 'work', startTile: { x: 42.8, y: 4.2 }, facing: 'atas', workEffect: 'design', stationTag: 'Tablet UI' },
          { characterId: 'mhs-05', activity: 'work', startTile: { x: 47.6, y: 4.2 }, facing: 'atas', workEffect: 'design', stationTag: '3D Visual' },
          { characterId: 'mhs-08', activity: 'talk', startTile: { x: 44.2, y: 6.0 }, facing: 'kanan', workEffect: 'discuss' },
          { characterId: 'mhs-15', activity: 'talk', startTile: { x: 46.2, y: 6.0 }, facing: 'kiri', workEffect: 'inspect' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s04-farhan',
            kind: 'speech',
            speakerId: 'mhs-16',
            speakerName: 'Farhan',
            text: 'Desain antarmuka di tablet gambar ini langsung sinkron dengan purwarupa Naufal & Hendra.',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.72,
            startOffsetMs: 1100,
            durationMs: 10300,
          },
        ],
      },

      // Panel 4C: Pojok Baca & Riset (Sekar #17, Nisa #13, Sari #12)
      {
        id: 'p4-pojok-baca',
        title: 'POJOK BACA & RISET LITERATUR',
        focusZoneIds: ['pojok-baca'],
        startViewport: { x: 39.4, y: 11.2, w: 12.0, h: 12.2 },
        endViewport: { x: 39.8, y: 11.6, w: 11.4, h: 11.5 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 1100,
        enterDirection: 'from-right',
        sfxCue: 'comic-pop',
        narrationText: 'Sekar (#17), Nisa (#13) & Sari (#12) di meja baca, lampu hangat & rak buku.',
        narrationDock: 'bottom-right',
        actors: [
          { characterId: 'mhs-17', activity: 'work', startTile: { x: 43.2, y: 14.2 }, facing: 'bawah', workEffect: 'read', stationTag: 'Arsip Jurnal' },
          { characterId: 'mhs-13', activity: 'work', startTile: { x: 45.2, y: 14.2 }, facing: 'bawah', workEffect: 'read', stationTag: 'Catatan Tim' },
          { characterId: 'mhs-12', activity: 'interact', startTile: { x: 44.0, y: 18.0 }, facing: 'atas', workEffect: 'discuss' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s04-sekar',
            kind: 'speech',
            speakerId: 'mhs-17',
            speakerName: 'Sekar',
            text: 'Seluruh referensi jurnal IEEE dan skema dasar sudah tersusun rapi di Pojok Baca.',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.22,
            startOffsetMs: 1650,
            durationMs: 9700,
          },
        ],
      },

      // Panel 4D: Ruang Istirahat & Pemrograman (Kevin #04, Mita #06, Maya #11, Bima #07, Gilang #09)
      {
        id: 'p4-istirahat-pemrograman',
        title: 'RUANG ISTIRAHAT & STASIUN PEMROGRAMAN',
        focusZoneIds: ['istirahat', 'pemrograman'],
        startViewport: { x: 0.5, y: 11.0, w: 13.5, h: 12.5 },
        endViewport: { x: 0.8, y: 11.5, w: 12.8, h: 11.8 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 1650,
        enterDirection: 'from-bottom',
        sfxCue: 'panel-whoosh',
        narrationText: 'Sofa hijau, meja kecil & dispenser di Ruang Istirahat tepat di selatan Pemrograman.',
        narrationDock: 'bottom-left',
        actors: [
          { characterId: 'mhs-04', activity: 'work', startTile: { x: 3.2, y: 15.0 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-06', activity: 'work', startTile: { x: 5.2, y: 15.0 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-11', activity: 'work', startTile: { x: 8.6, y: 15.0 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-07', activity: 'talk', startTile: { x: 4.5, y: 20.2 }, facing: 'kanan', workEffect: 'discuss' },
          { characterId: 'mhs-09', activity: 'talk', startTile: { x: 7.2, y: 20.2 }, facing: 'kiri', workEffect: 'discuss' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s04-gilang',
            kind: 'speech',
            speakerId: 'mhs-09',
            speakerName: 'Gilang',
            text: 'Rehat sebentar minum air di sofa Ruang Istirahat sebelum lanjut uji torsi bareng Bima!',
            bubbleXNorm: 0.54,
            bubbleYNorm: 0.56,
            startOffsetMs: 2200,
            durationMs: 9200,
          },
        ],
      },

      // Panel 4E: Ruang Konsultasi, Ruang Dosen & Koridor Robotika (Ibu Dosen, Bagas #18)
      {
        id: 'p4-konsultasi-dosen-robotika',
        title: 'RUANG KONSULTASI BK, RUANG DOSEN & UJI ROVER ROBOTIKA',
        focusZoneIds: ['konsultasi', 'ruang-dosen', 'diskusi'],
        startViewport: { x: 25.5, y: 10.8, w: 14.2, h: 12.6 },
        endViewport: { x: 26.0, y: 11.2, w: 13.6, h: 12.0 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 2200,
        enterDirection: 'from-right',
        sfxCue: 'light-sweep',
        narrationText: 'Ruang Konsultasi & Ruang Dosen mendampingi Bagas (#18) menguji rover robotika.',
        narrationDock: 'bottom-right',
        actors: [
          {
            characterId: 'dosen',
            activity: 'talk',
            startTile: { x: 33.8, y: 13.5 },
            facing: 'kiri',
            workEffect: 'discuss',
            stationTag: 'Ruang Konsultasi',
          },
          {
            characterId: 'mhs-18',
            activity: 'work',
            startTile: { x: 28.2, y: 14.5 },
            facing: 'kanan',
            workEffect: 'rover',
            stationTag: 'Rover Robotika',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s04-bagas',
            kind: 'speech',
            speakerId: 'mhs-18',
            speakerName: 'Bagas',
            text: 'Bu Dosen, rover komunitas robotika sudah siap berkeliling menghubungkan ke-11 ruangan lab!',
            bubbleXNorm: 0.48,
            bubbleYNorm: 0.24,
            startOffsetMs: 2650,
            durationMs: 8800,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // SCENE 05 / PAGE 5 — ONE COMMUNITY (40.0s – 50.0s)
  // Satu Splash Panel Besar yang memperlihatkan seluruh 18 Mahasiswa + Ibu Dosen
  // dengan sprite miniatur berkumpul secara alami di area Meja Diskusi &
  // stasiun utama laboratorium (bukan foto kelas berlatar polos!)
  // ==========================================================================
  {
    pageNumber: 5,
    id: 'scene-05-one-community',
    code: 'SCENE 05 / 06',
    title: 'ONE COMMUNITY — KELUARGA BESAR LABORATORIUM RUANG DENGAR',
    subtitle: 'Seluruh 18 Mahasiswa & Ibu Dosen Pembimbing Berkumpul di Jantung Laboratorium',
    startTimeMs: 40000,
    durationMs: 10000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'light-sweep',
    panels: [
      {
        id: 'p5-splash-one-community',
        title: '18 MAHASISWA · 11 RUANGAN · SATU KOMUNITAS LABORATORIUM',
        focusZoneIds: OFFICIAL_LAB_ZONE_IDS,
        startViewport: { x: 6.0, y: 3.0, w: 38.0, h: 18.5 },
        endViewport: { x: 1.5, y: 0.8, w: 49.0, h: 22.6 },
        ambientTheme: 'lab-interior',
        gridClass: 'col-span-12 row-span-6',
        revealAtMs: 0,
        enterDirection: 'impact-zoom',
        sfxCue: 'light-sweep',
        narrationText:
          'Berbeda keahlian, berbeda karakter. Namun satu tujuan menyatukan kita.',
        narrationDock: 'bottom-left',
        actors: [
          // Ibu Dosen & lingkaran utama di sekitar Meja Diskusi
          { characterId: 'dosen', activity: 'talk', startTile: { x: 21.0, y: 12.4 }, facing: 'bawah', workEffect: 'discuss' },
          { characterId: 'mhs-01', activity: 'talk', startTile: { x: 18.4, y: 13.2 }, facing: 'bawah', workEffect: 'discuss' },
          { characterId: 'mhs-03', activity: 'talk', startTile: { x: 23.6, y: 13.2 }, facing: 'bawah', workEffect: 'discuss' },
          { characterId: 'mhs-12', activity: 'talk', startTile: { x: 16.8, y: 15.0 }, facing: 'kanan', workEffect: 'discuss' },
          { characterId: 'mhs-13', activity: 'talk', startTile: { x: 25.2, y: 15.0 }, facing: 'kiri', workEffect: 'discuss' },
          { characterId: 'mhs-14', activity: 'talk', startTile: { x: 18.8, y: 17.2 }, facing: 'atas', workEffect: 'read' },
          { characterId: 'mhs-18', activity: 'work', startTile: { x: 23.2, y: 17.2 }, facing: 'atas', workEffect: 'rover' },

          // Kelompok Elektronika & Gudang Alat di koridor utara-tengah
          { characterId: 'mhs-02', activity: 'work', startTile: { x: 24.0, y: 5.2 }, facing: 'bawah', workEffect: 'solder' },
          { characterId: 'mhs-10', activity: 'work', startTile: { x: 34.8, y: 5.5 }, facing: 'bawah', workEffect: 'inspect' },

          // Kelompok Cetak 3D & Bengkel Las di utara-barat
          { characterId: 'mhs-07', activity: 'work', startTile: { x: 5.5, y: 5.5 }, facing: 'bawah', workEffect: 'weld' },
          { characterId: 'mhs-09', activity: 'talk', startTile: { x: 7.5, y: 5.8 }, facing: 'kiri', workEffect: 'discuss' },
          { characterId: 'mhs-08', activity: 'work', startTile: { x: 14.5, y: 5.5 }, facing: 'bawah', workEffect: 'print3d' },
          { characterId: 'mhs-15', activity: 'talk', startTile: { x: 17.5, y: 5.8 }, facing: 'kiri', workEffect: 'inspect' },

          // Kelompok Pemrograman di sayap barat-tengah
          { characterId: 'mhs-04', activity: 'work', startTile: { x: 4.5, y: 14.8 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-06', activity: 'work', startTile: { x: 7.0, y: 14.8 }, facing: 'atas', workEffect: 'code' },
          { characterId: 'mhs-11', activity: 'work', startTile: { x: 9.8, y: 14.8 }, facing: 'atas', workEffect: 'code' },

          // Kelompok Studio Desain & Pojok Baca di sayap timur
          { characterId: 'mhs-05', activity: 'work', startTile: { x: 43.0, y: 5.2 }, facing: 'bawah', workEffect: 'design' },
          { characterId: 'mhs-16', activity: 'work', startTile: { x: 46.5, y: 5.2 }, facing: 'bawah', workEffect: 'design' },
          { characterId: 'mhs-17', activity: 'work', startTile: { x: 44.0, y: 14.8 }, facing: 'atas', workEffect: 'read' },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-s05-community',
            kind: 'speech',
            speakerId: 'dosen',
            speakerName: 'Ibu Dosen Pembimbing',
            text: 'Inilah Ruang Dengar kita—18 mahasiswa di 11 ruangan laboratorium yang saling mendukung dan berkarya bersama!',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.16,
            startOffsetMs: 800,
            durationMs: 8600,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // SCENE 06 / PAGE 6 — TITLE REVEAL (50.0s – 58.0s)
  // Penyingkapan Judul Sinematik di atas Panorama Laboratorium Hidup
  // ==========================================================================
  {
    pageNumber: 6,
    id: 'scene-06-title-reveal',
    code: 'SCENE 06 / 06',
    title: 'RUANG DENGAR — SIMULASI LABORATORIUM ELEKTRONIKA & IoT',
    subtitle: 'Mulai Perjalananmu Mendampingi 18 Mahasiswa di Laboratorium',
    startTimeMs: 50000,
    durationMs: 8000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'title-climax',
    panels: [
      {
        id: 'p6-splash-title-reveal',
        title: 'RUANG DENGAR — SIMULASI LABORATORIUM ELEKTRONIKA & IoT',
        focusZoneIds: OFFICIAL_LAB_ZONE_IDS,
        startViewport: { x: 0.0, y: 0.0, w: 52.0, h: 24.0 },
        endViewport: { x: -0.5, y: -0.4, w: 53.0, h: 24.8 },
        ambientTheme: 'title-climax',
        gridClass: 'col-span-12 row-span-6',
        revealAtMs: 0,
        enterDirection: 'impact-zoom',
        sfxCue: 'title-climax',
        actors: [
          { characterId: 'dosen', activity: 'idle', startTile: { x: 21.0, y: 12.6 }, facing: 'bawah' },
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
