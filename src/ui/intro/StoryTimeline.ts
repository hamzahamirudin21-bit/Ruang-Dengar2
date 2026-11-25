import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { STUDENT_BACKGROUNDS } from '../../data/studentBackgrounds';
import { STUDENT_APPEARANCES, type CharacterAppearance } from '../characters/appearance';
import { IntroSfxKind } from '../motion/sfx';

export type ComicActionState =
  | 'walk-campus'
  | 'walk-corridor'
  | 'solder-pcb'
  | 'probe-oscilloscope'
  | 'typing-firmware'
  | 'operate-3d-printer'
  | 'weld-k3'
  | 'inspect-instrument'
  | 'discuss-point'
  | 'read-schematic'
  | 'drive-rover'
  | 'mentor-guide'
  | 'community-wave';

export type PanelSceneType =
  | 'page1-splash-campus-morning'
  | 'page1-detail-sunlight-sign'
  | 'page1-detail-sensor-morning'
  | 'page2-wide-veranda-walk'
  | 'page2-closeup-feet-stepping'
  | 'page2-closeup-hand-door'
  | 'page2-wide-doors-open-lab'
  | 'page3-panelA-soldering'
  | 'page3-panelB-coding'
  | 'page3-panelC-3dprinter'
  | 'page3-panelD-welding'
  | 'page4-groupA-elektronika'
  | 'page4-groupB-firmware-ui'
  | 'page4-groupC-instrument-3d'
  | 'page4-groupD-diskusi-riset'
  | 'page4-groupE-robotika'
  | 'page5-splash-one-laboratory'
  | 'page6-splash-title-reveal';

export type PanelEnterDirection =
  | 'from-left'
  | 'from-right'
  | 'from-top'
  | 'from-bottom'
  | 'diagonal-wipe'
  | 'impact-zoom';

export type ComicCameraPreset =
  | 'pan-exterior-to-building'
  | 'zoom-foliage-sign'
  | 'track-walking-student'
  | 'snap-zoom-feet'
  | 'snap-zoom-hand-handle'
  | 'push-through-open-doors'
  | 'focus-solder-tip'
  | 'focus-coding-monitors'
  | 'focus-3d-nozzle'
  | 'focus-welding-arc'
  | 'pan-group-discussion'
  | 'pullback-community-panorama'
  | 'dramatic-title-zoom';

export type ComicBubbleKind = 'speech' | 'thought' | 'narration';

export interface ComicCharacterProfile {
  id: string;
  orderNumber: string;
  name: string;
  shortName: string;
  portraitUrl: string;
  spriteUrl: string;
  typeTag: string;
  originAndCohort: string;
  uniquePotential: string;
  initialZoneId: string;
  appearance: CharacterAppearance;
}

export interface PanelActorSpec {
  characterId: string;
  action: ComicActionState;
  /** Posisi X normalisasi di dalam kanvas panel (0.08 .. 0.92) */
  xNorm: number;
  /** Posisi Y kaki/lantai normalisasi di dalam kanvas panel (0.55 .. 0.96) */
  yNorm: number;
  /** Target X saat berjalan (untuk walk-campus / walk-corridor) */
  walkToXNorm?: number;
  scale: number;
  facing: 'left' | 'right';
  toolProp?: 'soldering-iron' | 'oscilloscope-probe' | 'keyboard' | '3d-caliper' | 'welding-torch' | 'multimeter' | 'tablet-cad' | 'schematic-book' | 'rover-remote' | 'clipboard';
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
  /** Posisi balon di dalam panel (normalisasi 0..1) yang dijamin bebas dari wajah karakter */
  bubbleXNorm: number;
  bubbleYNorm: number;
  /** Waktu muncul relatif terhadap awal halaman (ms) */
  startOffsetMs: number;
  durationMs: number;
}

export interface ComicPanelBlueprint {
  id: string;
  sceneType: PanelSceneType;
  /** Kelas CSS Grid untuk variasi ukuran panel asimetris (splash, wide, vertical, closeup) */
  gridClass: string;
  /** Urutan waktu muncul panel relatif dari awal halaman (ms) */
  revealAtMs: number;
  enterDirection: PanelEnterDirection;
  cameraPreset: ComicCameraPreset;
  sfxCue?: IntroSfxKind;
  actors: readonly PanelActorSpec[];
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
      portraitUrl: `/assets/characters/${bp.id}-portrait.png`,
      spriteUrl: `/assets/characters/${bp.id}-sprite.png`,
      typeTag: bg?.typeTag ?? 'Mahasiswa Vokasi',
      originAndCohort: bg?.originAndCohort ?? `Angkatan ${bp.cohort}`,
      uniquePotential: bp.uniquePotential,
      initialZoneId: bp.initialZoneId,
      appearance,
    };
  }
);

export const DOSEN_CHARACTER_PROFILE: ComicCharacterProfile = {
  id: 'dosen',
  orderNumber: 'BK',
  name: 'Ibu Dosen Pembimbing',
  shortName: 'Ibu Dosen',
  portraitUrl: '/assets/characters/dosen-portrait.png',
  spriteUrl: '/assets/characters/dosen-sprite.png',
  typeTag: 'Dosen Pembimbing & Konselor Laboratorium',
  originAndCohort: 'Kampus Vokasi · Elektronika & IoT',
  uniquePotential: 'Mendampingi perkembangan akademik dan psikologis 18 mahasiswa.',
  initialZoneId: 'konsultasi',
  appearance: DOSEN_APPEARANCE,
};

const PROFILE_MAP: Readonly<Record<string, ComicCharacterProfile>> = Object.fromEntries([
  [DOSEN_CHARACTER_PROFILE.id, DOSEN_CHARACTER_PROFILE],
  ...COMIC_CHARACTER_PROFILES.map((p) => [p.id, p]),
]);

export function getCharacterProfile(id: string): ComicCharacterProfile {
  return PROFILE_MAP[id] ?? DOSEN_CHARACTER_PROFILE;
}

/**
 * 6 Halaman Komik Sinematik Asimetris (Total 58 Detik)
 * Mengikuti spesifikasi CRITICAL REBUILD — RUANG DENGAR CINEMATIC COMIC INTRO.
 */
export const COMIC_STORY_PAGES: readonly ComicPageBlueprint[] = [
  // ==========================================================================
  // PAGE 1 — MORNING AT CAMPUS (0.0s – 9.0s)
  // 1 Splash Panel Besar (Kiri 8 kolom) + 2 Panel Detail (Kanan 4 kolom)
  // ==========================================================================
  {
    pageNumber: 1,
    id: 'page-1-morning-campus',
    code: 'PAGE 01 / 06',
    title: 'MORNING AT CAMPUS — FAJAR DI GEDUNG LABORATORIUM',
    subtitle: 'Sinar Matahari Pagi, Pepohonan Kampus & Langkah Awal Menuju Gedung',
    startTimeMs: 0,
    durationMs: 9000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'ambient-chime',
    panels: [
      {
        id: 'p1-splash-building',
        sceneType: 'page1-splash-campus-morning',
        gridClass: 'col-span-12 md:col-span-8 row-span-6',
        revealAtMs: 0,
        enterDirection: 'from-left',
        cameraPreset: 'pan-exterior-to-building',
        sfxCue: 'light-sweep',
        narrationText: 'Setiap perjalanan besar selalu dimulai dari sebuah tempat.',
        narrationDock: 'top-left',
        actors: [
          {
            characterId: 'dosen',
            action: 'walk-campus',
            xNorm: 0.22,
            walkToXNorm: 0.44,
            yNorm: 0.88,
            scale: 0.92,
            facing: 'right',
            toolProp: 'clipboard',
          },
          {
            characterId: 'mhs-01',
            action: 'walk-campus',
            xNorm: 0.56,
            walkToXNorm: 0.72,
            yNorm: 0.85,
            scale: 0.86,
            facing: 'right',
          },
          {
            characterId: 'mhs-03',
            action: 'walk-campus',
            xNorm: 0.12,
            walkToXNorm: 0.30,
            yNorm: 0.91,
            scale: 0.88,
            facing: 'right',
            toolProp: 'schematic-book',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-p1-breeze',
            text: 'SWissh~',
            xNorm: 0.16,
            yNorm: 0.24,
            rotationDeg: -8,
            color: '#fef08a',
            strokeColor: '#0f172a',
            revealAtMs: 700,
            scale: 0.95,
          },
        ],
        dialogues: [
          {
            id: 'dlg-p1-raka',
            kind: 'speech',
            speakerId: 'mhs-01',
            speakerName: 'Raka',
            text: 'Lampu lantai satu sudah menyala! Hari ini jadwal uji coba purwarupa lintas-divisi.',
            bubbleXNorm: 0.72,
            bubbleYNorm: 0.22,
            startOffsetMs: 1800,
            durationMs: 6500,
          },
        ],
      },
      {
        id: 'p1-detail-sunlight',
        sceneType: 'page1-detail-sunlight-sign',
        gridClass: 'col-span-6 md:col-span-4 row-span-3',
        revealAtMs: 650,
        enterDirection: 'from-top',
        cameraPreset: 'zoom-foliage-sign',
        sfxCue: 'panel-whoosh',
        actors: [],
        sfxTexts: [
          {
            id: 'sfx-p1-chirp',
            text: 'CHIRP! ☀',
            xNorm: 0.72,
            yNorm: 0.25,
            rotationDeg: 6,
            color: '#fde047',
            strokeColor: '#0f172a',
            revealAtMs: 1100,
            scale: 0.9,
          },
        ],
        dialogues: [],
        narrationText: 'Pukul 07.15 WIB · Kampus Vokasi Elektronika & IoT.',
        narrationDock: 'bottom-left',
      },
      {
        id: 'p1-detail-sensor',
        sceneType: 'page1-detail-sensor-morning',
        gridClass: 'col-span-6 md:col-span-4 row-span-3',
        revealAtMs: 1300,
        enterDirection: 'from-right',
        cameraPreset: 'focus-solder-tip',
        sfxCue: 'comic-pop',
        actors: [],
        sfxTexts: [
          {
            id: 'sfx-p1-beep',
            text: 'BEEP! 24.5°C',
            xNorm: 0.65,
            yNorm: 0.26,
            rotationDeg: -6,
            color: '#67e8f9',
            strokeColor: '#0f172a',
            revealAtMs: 1700,
            scale: 0.95,
          },
        ],
        dialogues: [],
        narrationText: 'Node telemetri cuaca di beranda lab mulai mengirimkan paket data pagi.',
        narrationDock: 'bottom-right',
      },
    ],
  },

  // ==========================================================================
  // PAGE 2 — ARRIVAL (9.0s – 18.0s)
  // 4 Panel Aksi:
  // - Atas Horizontal Lebar: Karakter berjalan menuju pintu (walk cycle penuh)
  // - Tengah Kiri Close-up: Sepatu melangkah (TAP... TAP...)
  // - Tengah Kanan Close-up: Tangan meraih & menekan gagang pintu (KLIK!)
  // - Bawah Lebar: Pintu laboratorium terbuka & kamera masuk ke dalam (SWOOSH!)
  // ==========================================================================
  {
    pageNumber: 2,
    id: 'page-2-arrival',
    code: 'PAGE 02 / 06',
    title: 'ARRIVAL — MELANGKAH MASUK KE LABORATORIUM',
    subtitle: 'Derap Langkah, Gagang Pintu Terbuka & Semangat Eksperimen Pagi',
    startTimeMs: 9000,
    durationMs: 9000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'footstep',
    panels: [
      {
        id: 'p2-wide-walk',
        sceneType: 'page2-wide-veranda-walk',
        gridClass: 'col-span-12 md:col-span-7 row-span-3',
        revealAtMs: 0,
        enterDirection: 'from-left',
        cameraPreset: 'track-walking-student',
        sfxCue: 'footstep',
        narrationText: 'Di koridor utama, langkah-langkah penuh rasa ingin tahu bertemu.',
        narrationDock: 'top-left',
        actors: [
          {
            characterId: 'dosen',
            action: 'walk-corridor',
            xNorm: 0.18,
            walkToXNorm: 0.46,
            yNorm: 0.88,
            scale: 0.95,
            facing: 'right',
            toolProp: 'clipboard',
          },
          {
            characterId: 'mhs-01',
            action: 'walk-corridor',
            xNorm: 0.48,
            walkToXNorm: 0.78,
            yNorm: 0.86,
            scale: 0.92,
            facing: 'right',
          },
          {
            characterId: 'mhs-02',
            action: 'walk-corridor',
            xNorm: 0.32,
            walkToXNorm: 0.62,
            yNorm: 0.90,
            scale: 0.90,
            facing: 'right',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-p2-dosen',
            kind: 'speech',
            speakerId: 'dosen',
            speakerName: 'Ibu Dosen',
            text: 'Selamat pagi Raka, Dimas! Siap memulai sesi laboratorium kita?',
            bubbleXNorm: 0.25,
            bubbleYNorm: 0.24,
            startOffsetMs: 600,
            durationMs: 7500,
          },
        ],
      },
      {
        id: 'p2-closeup-feet',
        sceneType: 'page2-closeup-feet-stepping',
        gridClass: 'col-span-6 md:col-span-5 row-span-3',
        revealAtMs: 700,
        enterDirection: 'from-top',
        cameraPreset: 'snap-zoom-feet',
        sfxCue: 'footstep',
        actors: [],
        sfxTexts: [
          {
            id: 'sfx-p2-tap',
            text: 'TAP... TAP...',
            xNorm: 0.52,
            yNorm: 0.24,
            rotationDeg: -7,
            color: '#fef08a',
            strokeColor: '#0f172a',
            revealAtMs: 850,
            scale: 1.15,
          },
        ],
        dialogues: [],
        narrationText: 'Derap langkah di atas lantai keramik laboratorium.',
        narrationDock: 'bottom-right',
      },
      {
        id: 'p2-closeup-hand-handle',
        sceneType: 'page2-closeup-hand-door',
        gridClass: 'col-span-6 md:col-span-4 row-span-3',
        revealAtMs: 1450,
        enterDirection: 'from-left',
        cameraPreset: 'snap-zoom-hand-handle',
        sfxCue: 'door-click',
        actors: [],
        sfxTexts: [
          {
            id: 'sfx-p2-klik',
            text: 'KLIK!',
            xNorm: 0.68,
            yNorm: 0.25,
            rotationDeg: 9,
            color: '#fb923c',
            strokeColor: '#0f172a',
            revealAtMs: 1650,
            scale: 1.25,
          },
        ],
        dialogues: [],
        narrationText: 'Tangan menekan tuas pintu akses utama.',
        narrationDock: 'bottom-left',
      },
      {
        id: 'p2-wide-doors-open',
        sceneType: 'page2-wide-doors-open-lab',
        gridClass: 'col-span-12 md:col-span-8 row-span-3',
        revealAtMs: 2150,
        enterDirection: 'from-right',
        cameraPreset: 'push-through-open-doors',
        sfxCue: 'door-open',
        narrationText:
          'Di tempat ini, rasa ingin tahu berubah menjadi eksperimen. Ide sederhana berkembang menjadi teknologi.',
        narrationDock: 'bottom-right',
        actors: [
          {
            characterId: 'mhs-01',
            action: 'discuss-point',
            xNorm: 0.34,
            yNorm: 0.88,
            scale: 0.92,
            facing: 'right',
          },
          {
            characterId: 'mhs-03',
            action: 'probe-oscilloscope',
            xNorm: 0.72,
            yNorm: 0.84,
            scale: 0.88,
            facing: 'left',
            toolProp: 'oscilloscope-probe',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-p2-swoosh',
            text: 'SWOOSH!!',
            xNorm: 0.50,
            yNorm: 0.22,
            rotationDeg: -6,
            color: '#38bdf8',
            strokeColor: '#0f172a',
            revealAtMs: 2350,
            scale: 1.2,
          },
        ],
        dialogues: [
          {
            id: 'dlg-p2-tania',
            kind: 'speech',
            speakerId: 'mhs-03',
            speakerName: 'Tania',
            text: 'Pintu sudah dibuka! Ayo masuk, osiloskop dan catu daya meja utama sudah siap.',
            bubbleXNorm: 0.74,
            bubbleYNorm: 0.24,
            startOffsetMs: 2600,
            durationMs: 5800,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PAGE 3 — INSIDE THE LAB (18.0s – 28.0s)
  // 4 Panel Aktivitas Laboratorium dengan Perspektif & Animasi Alat Berbeda:
  // - PANEL A: Menyolder rangkaian elektronika (Dimas & Raka)
  // - PANEL B: Mengoperasikan komputer & mengembangkan program (Kevin & Mita)
  // - PANEL C: Printer 3D sedang mencetak objek (Hendra, Ayu & Naufal)
  // - PANEL D: Pengelasan di bengkel dengan perlengkapan K3 (Bima & Gilang)
  // ==========================================================================
  {
    pageNumber: 3,
    id: 'page-3-inside-lab',
    code: 'PAGE 03 / 06',
    title: 'INSIDE THE LAB — EMPAT DIVISI PRAKTIKUM BERGERAK SERENTAK',
    subtitle: 'Penyolderan SMD, Pemrograman Firmware, Cetak 3D & Bengkel Las K3',
    startTimeMs: 18000,
    durationMs: 10000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'solder-sizzle',
    panels: [
      {
        id: 'p3-panelA-solder',
        sceneType: 'page3-panelA-soldering',
        gridClass: 'col-span-12 md:col-span-7 row-span-3',
        revealAtMs: 0,
        enterDirection: 'from-left',
        cameraPreset: 'focus-solder-tip',
        sfxCue: 'solder-sizzle',
        narrationText: 'PANEL A · Meja Praktikum Elektronika & Perakitan SMD',
        narrationDock: 'top-left',
        actors: [
          {
            characterId: 'mhs-02',
            action: 'solder-pcb',
            xNorm: 0.36,
            yNorm: 0.88,
            scale: 0.98,
            facing: 'right',
            toolProp: 'soldering-iron',
          },
          {
            characterId: 'mhs-01',
            action: 'probe-oscilloscope',
            xNorm: 0.72,
            yNorm: 0.86,
            scale: 0.94,
            facing: 'left',
            toolProp: 'oscilloscope-probe',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-p3-tzzt',
            text: 'TZZT! 350°C',
            xNorm: 0.48,
            yNorm: 0.34,
            rotationDeg: -8,
            color: '#fde047',
            strokeColor: '#0f172a',
            revealAtMs: 400,
            scale: 1.05,
          },
        ],
        dialogues: [
          {
            id: 'dlg-p3-dimas',
            kind: 'speech',
            speakerId: 'mhs-02',
            speakerName: 'Dimas',
            text: 'Timah solder pada pin sensor sudah mengilap sempurna. Tegangan 3.3V stabil!',
            bubbleXNorm: 0.25,
            bubbleYNorm: 0.23,
            startOffsetMs: 700,
            durationMs: 8500,
          },
        ],
      },
      {
        id: 'p3-panelB-coding',
        sceneType: 'page3-panelB-coding',
        gridClass: 'col-span-12 md:col-span-5 row-span-3',
        revealAtMs: 650,
        enterDirection: 'from-right',
        cameraPreset: 'focus-coding-monitors',
        sfxCue: 'keyboard-clack',
        narrationText: 'PANEL B · Workstation Pemrograman & MCU',
        narrationDock: 'top-right',
        actors: [
          {
            characterId: 'mhs-04',
            action: 'typing-firmware',
            xNorm: 0.34,
            yNorm: 0.88,
            scale: 0.96,
            facing: 'right',
            toolProp: 'keyboard',
          },
          {
            characterId: 'mhs-06',
            action: 'typing-firmware',
            xNorm: 0.74,
            yNorm: 0.88,
            scale: 0.92,
            facing: 'left',
            toolProp: 'keyboard',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-p3-clack',
            text: 'CLACK! CLACK!',
            xNorm: 0.54,
            yNorm: 0.26,
            rotationDeg: 6,
            color: '#38bdf8',
            strokeColor: '#0f172a',
            revealAtMs: 1100,
            scale: 1.0,
          },
        ],
        dialogues: [
          {
            id: 'dlg-p3-kevin',
            kind: 'speech',
            speakerId: 'mhs-04',
            speakerName: 'Kevin',
            text: 'Kompilasi RTOS sukses 0 galat. Mita, unggah firmware-nya ke papan ESP32!',
            bubbleXNorm: 0.52,
            bubbleYNorm: 0.22,
            startOffsetMs: 1350,
            durationMs: 8000,
          },
        ],
      },
      {
        id: 'p3-panelC-3dprint',
        sceneType: 'page3-panelC-3dprinter',
        gridClass: 'col-span-12 md:col-span-5 row-span-3',
        revealAtMs: 1350,
        enterDirection: 'from-bottom',
        cameraPreset: 'focus-3d-nozzle',
        sfxCue: 'panel-whoosh',
        narrationText: 'PANEL C · Laboratorium Cetak 3D & Prototipe',
        narrationDock: 'bottom-left',
        actors: [
          {
            characterId: 'mhs-08',
            action: 'operate-3d-printer',
            xNorm: 0.28,
            yNorm: 0.88,
            scale: 0.94,
            facing: 'right',
            toolProp: '3d-caliper',
          },
          {
            characterId: 'mhs-05',
            action: 'discuss-point',
            xNorm: 0.76,
            yNorm: 0.88,
            scale: 0.92,
            facing: 'left',
            toolProp: 'tablet-cad',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-p3-whirr',
            text: 'WHIRR~ 210°C',
            xNorm: 0.52,
            yNorm: 0.28,
            rotationDeg: -5,
            color: '#c084fc',
            strokeColor: '#0f172a',
            revealAtMs: 1750,
            scale: 1.0,
          },
        ],
        dialogues: [
          {
            id: 'dlg-p3-hendra',
            kind: 'speech',
            speakerId: 'mhs-08',
            speakerName: 'Hendra',
            text: 'Lapisan filamen sasis robot tercetak mulus! Tinggal 12 menit lagi selesai.',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.22,
            startOffsetMs: 2000,
            durationMs: 7400,
          },
        ],
      },
      {
        id: 'p3-panelD-welding',
        sceneType: 'page3-panelD-welding',
        gridClass: 'col-span-12 md:col-span-7 row-span-3',
        revealAtMs: 2000,
        enterDirection: 'from-right',
        cameraPreset: 'focus-welding-arc',
        sfxCue: 'weld-spark',
        narrationText: 'PANEL D · Bengkel Las & Fabrikasi berstandar K3',
        narrationDock: 'bottom-right',
        actors: [
          {
            characterId: 'mhs-07',
            action: 'weld-k3',
            xNorm: 0.38,
            yNorm: 0.88,
            scale: 0.98,
            facing: 'right',
            toolProp: 'welding-torch',
          },
          {
            characterId: 'mhs-09',
            action: 'inspect-instrument',
            xNorm: 0.76,
            yNorm: 0.88,
            scale: 0.95,
            facing: 'left',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-p3-kzrrt',
            text: 'KZRRT!! SPARK!',
            xNorm: 0.54,
            yNorm: 0.30,
            rotationDeg: 8,
            color: '#fb923c',
            strokeColor: '#0f172a',
            revealAtMs: 2300,
            scale: 1.15,
          },
        ],
        dialogues: [
          {
            id: 'dlg-p3-bima',
            kind: 'speech',
            speakerId: 'mhs-07',
            speakerName: 'Bima',
            text: 'Helm las turun, sarung tangan K3 rapat! Sambungan baja ini siap menahan beban torsi.',
            bubbleXNorm: 0.26,
            bubbleYNorm: 0.22,
            startOffsetMs: 2550,
            durationMs: 7000,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PAGE 4 — MEET THE COMMUNITY (28.0s – 40.0s)
  // 5 Panel Adegan Kelompok Asimetris yang menampilkan SELURUH 18 MAHASISWA
  // dalam aktivitas nyata sesuai database (0% kartu karakter!)
  // ==========================================================================
  {
    pageNumber: 4,
    id: 'page-4-meet-community',
    code: 'PAGE 04 / 06',
    title: 'MEET THE COMMUNITY — 18 MAHASISWA DALAM KOLABORASI NYATA',
    subtitle: 'Diskusi Skema, Kalibrasi Alat, UI/UX Telemetri, Riset Literatur & Robotika',
    startTimeMs: 28000,
    durationMs: 12000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'panel-whoosh',
    panels: [
      // Panel 4A: Tania (#03), Maya (#11), Rani (#14), Raka (#01), Dimas (#02)
      {
        id: 'p4-groupA-elektronika',
        sceneType: 'page4-groupA-elektronika',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 0,
        enterDirection: 'from-left',
        cameraPreset: 'pan-group-discussion',
        sfxCue: 'panel-whoosh',
        narrationText: 'Tania, Maya, Rani, Raka & Dimas · Analisis Sinyal & Skema',
        narrationDock: 'top-left',
        actors: [
          {
            characterId: 'mhs-03',
            action: 'probe-oscilloscope',
            xNorm: 0.20,
            yNorm: 0.88,
            scale: 0.86,
            facing: 'right',
            toolProp: 'oscilloscope-probe',
          },
          {
            characterId: 'mhs-11',
            action: 'inspect-instrument',
            xNorm: 0.42,
            yNorm: 0.86,
            scale: 0.84,
            facing: 'right',
          },
          {
            characterId: 'mhs-14',
            action: 'read-schematic',
            xNorm: 0.62,
            yNorm: 0.89,
            scale: 0.84,
            facing: 'left',
            toolProp: 'schematic-book',
          },
          {
            characterId: 'mhs-01',
            action: 'discuss-point',
            xNorm: 0.78,
            yNorm: 0.84,
            scale: 0.82,
            facing: 'left',
          },
          {
            characterId: 'mhs-02',
            action: 'solder-pcb',
            xNorm: 0.90,
            yNorm: 0.87,
            scale: 0.80,
            facing: 'left',
            toolProp: 'soldering-iron',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-p4-rani',
            kind: 'speech',
            speakerId: 'mhs-14',
            speakerName: 'Rani',
            text: 'Skema filter Kak Tania dan pola data Kak Maya sudah kucatat lengkap!',
            bubbleXNorm: 0.52,
            bubbleYNorm: 0.24,
            startOffsetMs: 400,
            durationMs: 10500,
          },
        ],
      },
      // Panel 4B: Farhan (#16), Ayu (#05), Kevin (#04), Mita (#06)
      {
        id: 'p4-groupB-firmware-ui',
        sceneType: 'page4-groupB-firmware-ui',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 550,
        enterDirection: 'from-top',
        cameraPreset: 'focus-coding-monitors',
        sfxCue: 'keyboard-clack',
        narrationText: 'Farhan, Ayu, Kevin & Mita · Studio UI/UX & Firmware',
        narrationDock: 'top-left',
        actors: [
          {
            characterId: 'mhs-16',
            action: 'discuss-point',
            xNorm: 0.20,
            yNorm: 0.88,
            scale: 0.86,
            facing: 'right',
            toolProp: 'tablet-cad',
          },
          {
            characterId: 'mhs-05',
            action: 'discuss-point',
            xNorm: 0.44,
            yNorm: 0.87,
            scale: 0.86,
            facing: 'right',
          },
          {
            characterId: 'mhs-04',
            action: 'typing-firmware',
            xNorm: 0.68,
            yNorm: 0.88,
            scale: 0.86,
            facing: 'left',
            toolProp: 'keyboard',
          },
          {
            characterId: 'mhs-06',
            action: 'read-schematic',
            xNorm: 0.86,
            yNorm: 0.89,
            scale: 0.84,
            facing: 'left',
            toolProp: 'schematic-book',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-p4-farhan',
            kind: 'speech',
            speakerId: 'mhs-16',
            speakerName: 'Farhan',
            text: 'Antarmuka OLED yang kurancang bersama Ayu sudah tersambung ke API Kevin & Mita.',
            bubbleXNorm: 0.50,
            bubbleYNorm: 0.24,
            startOffsetMs: 1100,
            durationMs: 10000,
          },
        ],
      },
      // Panel 4C: Teguh (#10), Naufal (#15), Hendra (#08)
      {
        id: 'p4-groupC-instrument-3d',
        sceneType: 'page4-groupC-instrument-3d',
        gridClass: 'col-span-12 md:col-span-4 row-span-3',
        revealAtMs: 1100,
        enterDirection: 'from-right',
        cameraPreset: 'focus-3d-nozzle',
        sfxCue: 'comic-pop',
        narrationText: 'Teguh, Naufal & Hendra · Kalibrasi Alat & Inovasi 3D',
        narrationDock: 'top-right',
        actors: [
          {
            characterId: 'mhs-10',
            action: 'inspect-instrument',
            xNorm: 0.24,
            yNorm: 0.88,
            scale: 0.88,
            facing: 'right',
            toolProp: 'multimeter',
          },
          {
            characterId: 'mhs-15',
            action: 'operate-3d-printer',
            xNorm: 0.54,
            yNorm: 0.88,
            scale: 0.88,
            facing: 'right',
          },
          {
            characterId: 'mhs-08',
            action: 'operate-3d-printer',
            xNorm: 0.80,
            yNorm: 0.88,
            scale: 0.88,
            facing: 'left',
            toolProp: '3d-caliper',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-p4-teguh',
            kind: 'speech',
            speakerId: 'mhs-10',
            speakerName: 'Teguh',
            text: 'Multimeter presisi sudah kukalibrasi untuk menguji kumparan eksperimen Naufal.',
            bubbleXNorm: 0.48,
            bubbleYNorm: 0.24,
            startOffsetMs: 1700,
            durationMs: 9500,
          },
        ],
      },
      // Panel 4D: Sari (#12), Nisa (#13), Sekar (#17) & Ibu Dosen
      {
        id: 'p4-groupD-diskusi-riset',
        sceneType: 'page4-groupD-diskusi-riset',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 1650,
        enterDirection: 'from-bottom',
        cameraPreset: 'pan-group-discussion',
        sfxCue: 'panel-whoosh',
        narrationText: 'Sari, Nisa, Sekar & Ibu Dosen · Meja Diskusi & Pojok Baca',
        narrationDock: 'bottom-left',
        actors: [
          {
            characterId: 'dosen',
            action: 'mentor-guide',
            xNorm: 0.18,
            yNorm: 0.88,
            scale: 0.90,
            facing: 'right',
            toolProp: 'clipboard',
          },
          {
            characterId: 'mhs-12',
            action: 'discuss-point',
            xNorm: 0.42,
            yNorm: 0.88,
            scale: 0.88,
            facing: 'right',
          },
          {
            characterId: 'mhs-13',
            action: 'read-schematic',
            xNorm: 0.64,
            yNorm: 0.88,
            scale: 0.88,
            facing: 'left',
            toolProp: 'schematic-book',
          },
          {
            characterId: 'mhs-17',
            action: 'read-schematic',
            xNorm: 0.84,
            yNorm: 0.88,
            scale: 0.88,
            facing: 'left',
            toolProp: 'schematic-book',
          },
        ],
        sfxTexts: [],
        dialogues: [
          {
            id: 'dlg-p4-sari-sekar',
            kind: 'speech',
            speakerId: 'mhs-12',
            speakerName: 'Sari',
            text: 'Catatan empati Nisa dan arsip literatur Sekar menyatukan komunikasi semua tim!',
            bubbleXNorm: 0.52,
            bubbleYNorm: 0.22,
            startOffsetMs: 2200,
            durationMs: 9000,
          },
        ],
      },
      // Panel 4E: Bagas (#18), Bima (#07), Gilang (#09) — Komunitas Robotika
      {
        id: 'p4-groupE-robotika',
        sceneType: 'page4-groupE-robotika',
        gridClass: 'col-span-12 md:col-span-6 row-span-3',
        revealAtMs: 2200,
        enterDirection: 'from-right',
        cameraPreset: 'track-walking-student',
        sfxCue: 'light-sweep',
        narrationText: 'Bagas, Gilang & Bima · Uji Jalan Rover Robotika Lintas-Lab',
        narrationDock: 'bottom-right',
        actors: [
          {
            characterId: 'mhs-18',
            action: 'drive-rover',
            xNorm: 0.24,
            yNorm: 0.88,
            scale: 0.94,
            facing: 'right',
            toolProp: 'rover-remote',
          },
          {
            characterId: 'mhs-09',
            action: 'discuss-point',
            xNorm: 0.66,
            yNorm: 0.88,
            scale: 0.90,
            facing: 'left',
          },
          {
            characterId: 'mhs-07',
            action: 'inspect-instrument',
            xNorm: 0.84,
            yNorm: 0.88,
            scale: 0.90,
            facing: 'left',
          },
        ],
        sfxTexts: [
          {
            id: 'sfx-p4-rover',
            text: 'VROOM~ SERVO OK!',
            xNorm: 0.46,
            yNorm: 0.58,
            rotationDeg: -6,
            color: '#4ade80',
            strokeColor: '#0f172a',
            revealAtMs: 2500,
            scale: 1.0,
          },
        ],
        dialogues: [
          {
            id: 'dlg-p4-bagas',
            kind: 'speech',
            speakerId: 'mhs-18',
            speakerName: 'Bagas',
            text: 'Rover robotika bergerak mulus! Rangka las Bima, suspensi Gilang, dan sensor IoT bekerja serempak!',
            bubbleXNorm: 0.46,
            bubbleYNorm: 0.22,
            startOffsetMs: 2650,
            durationMs: 8800,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PAGE 5 — ONE LABORATORY (40.0s – 50.0s)
  // Satu Splash Panel Panorama Besar: Seluruh 18 Mahasiswa + Ibu Dosen
  // disusun secara alami di dalam lingkungan laboratorium (duduk, berdiri,
  // berdiskusi, mengoperasikan alat — bukan foto kelas berlatar polos!)
  // ==========================================================================
  {
    pageNumber: 5,
    id: 'page-5-one-laboratory',
    code: 'PAGE 05 / 06',
    title: 'ONE LABORATORY — SATU KOMUNITAS LABORATORIUM YANG HIDUP',
    subtitle: '18 Mahasiswa & Ibu Dosen Pembimbing Berkarya Bersama di Ruang Dengar',
    startTimeMs: 40000,
    durationMs: 10000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'light-sweep',
    panels: [
      {
        id: 'p5-splash-community',
        sceneType: 'page5-splash-one-laboratory',
        gridClass: 'col-span-12 row-span-6',
        revealAtMs: 0,
        enterDirection: 'impact-zoom',
        cameraPreset: 'pullback-community-panorama',
        sfxCue: 'light-sweep',
        narrationText:
          'Berbeda keahlian, berbeda karakter. Namun satu tujuan menyatukan kita.',
        narrationDock: 'bottom-left',
        actors: [
          // Baris belakang stasiun kerja (Meja Elektronika, Koding, Las, 3D)
          { characterId: 'mhs-07', action: 'inspect-instrument', xNorm: 0.07, yNorm: 0.72, scale: 0.74, facing: 'right' },
          { characterId: 'mhs-09', action: 'discuss-point', xNorm: 0.14, yNorm: 0.73, scale: 0.74, facing: 'right' },
          { characterId: 'mhs-08', action: 'operate-3d-printer', xNorm: 0.22, yNorm: 0.72, scale: 0.74, facing: 'right', toolProp: '3d-caliper' },
          { characterId: 'mhs-15', action: 'discuss-point', xNorm: 0.29, yNorm: 0.73, scale: 0.74, facing: 'right' },
          { characterId: 'mhs-10', action: 'inspect-instrument', xNorm: 0.36, yNorm: 0.72, scale: 0.74, facing: 'right', toolProp: 'multimeter' },
          { characterId: 'mhs-04', action: 'typing-firmware', xNorm: 0.64, yNorm: 0.72, scale: 0.74, facing: 'left', toolProp: 'keyboard' },
          { characterId: 'mhs-06', action: 'read-schematic', xNorm: 0.71, yNorm: 0.73, scale: 0.74, facing: 'left', toolProp: 'schematic-book' },
          { characterId: 'mhs-16', action: 'discuss-point', xNorm: 0.78, yNorm: 0.72, scale: 0.74, facing: 'left', toolProp: 'tablet-cad' },
          { characterId: 'mhs-11', action: 'read-schematic', xNorm: 0.86, yNorm: 0.73, scale: 0.74, facing: 'left' },
          { characterId: 'mhs-17', action: 'read-schematic', xNorm: 0.93, yNorm: 0.72, scale: 0.74, facing: 'left', toolProp: 'schematic-book' },

          // Baris depan mengelilingi meja praktikum utama & rover robotika
          { characterId: 'mhs-02', action: 'solder-pcb', xNorm: 0.12, yNorm: 0.90, scale: 0.84, facing: 'right', toolProp: 'soldering-iron' },
          { characterId: 'mhs-03', action: 'probe-oscilloscope', xNorm: 0.23, yNorm: 0.89, scale: 0.84, facing: 'right', toolProp: 'oscilloscope-probe' },
          { characterId: 'mhs-14', action: 'read-schematic', xNorm: 0.33, yNorm: 0.90, scale: 0.84, facing: 'right', toolProp: 'schematic-book' },
          { characterId: 'mhs-01', action: 'community-wave', xNorm: 0.43, yNorm: 0.91, scale: 0.88, facing: 'right' },
          { characterId: 'dosen', action: 'mentor-guide', xNorm: 0.52, yNorm: 0.91, scale: 0.92, facing: 'left', toolProp: 'clipboard' },
          { characterId: 'mhs-18', action: 'drive-rover', xNorm: 0.62, yNorm: 0.90, scale: 0.86, facing: 'left', toolProp: 'rover-remote' },
          { characterId: 'mhs-05', action: 'community-wave', xNorm: 0.73, yNorm: 0.89, scale: 0.84, facing: 'left', toolProp: 'tablet-cad' },
          { characterId: 'mhs-12', action: 'discuss-point', xNorm: 0.82, yNorm: 0.90, scale: 0.84, facing: 'left' },
          { characterId: 'mhs-13', action: 'community-wave', xNorm: 0.91, yNorm: 0.89, scale: 0.84, facing: 'left' },
        ],
        sfxTexts: [
          {
            id: 'sfx-p5-together',
            text: 'SATU RUANG DENGAR!',
            xNorm: 0.50,
            yNorm: 0.14,
            rotationDeg: -2,
            color: '#fde047',
            strokeColor: '#0f172a',
            revealAtMs: 600,
            scale: 1.15,
          },
        ],
        dialogues: [
          {
            id: 'dlg-p5-dosen',
            kind: 'speech',
            speakerId: 'dosen',
            speakerName: 'Ibu Dosen Pembimbing',
            text: 'Di laboratorium ini, setiap karya teknis dan setiap cerita di hati kalian selalu punya tempat untuk didengarkan.',
            bubbleXNorm: 0.52,
            bubbleYNorm: 0.24,
            startOffsetMs: 900,
            durationMs: 8500,
          },
        ],
      },
    ],
  },

  // ==========================================================================
  // PAGE 6 — TITLE REVEAL (50.0s – 58.0s)
  // Komposisi Visual Dramatis Penyingkapan Judul + 3 Tombol Utama
  // ==========================================================================
  {
    pageNumber: 6,
    id: 'page-6-title-reveal',
    code: 'PAGE 06 / 06',
    title: 'RUANG DENGAR — SIMULASI LABORATORIUM ELEKTRONIKA & IoT',
    subtitle: 'Kisah Pembuka Selesai · Saatnya Memulai Peranmu di Laboratorium',
    startTimeMs: 50000,
    durationMs: 8000,
    pageGridClass: 'grid-cols-12 grid-rows-6',
    ambientSfx: 'title-climax',
    panels: [
      {
        id: 'p6-splash-title',
        sceneType: 'page6-splash-title-reveal',
        gridClass: 'col-span-12 row-span-6',
        revealAtMs: 0,
        enterDirection: 'impact-zoom',
        cameraPreset: 'dramatic-title-zoom',
        sfxCue: 'title-climax',
        actors: [
          { characterId: 'dosen', action: 'mentor-guide', xNorm: 0.16, yNorm: 0.90, scale: 0.95, facing: 'right', toolProp: 'clipboard' },
          { characterId: 'mhs-01', action: 'community-wave', xNorm: 0.28, yNorm: 0.91, scale: 0.90, facing: 'right' },
          { characterId: 'mhs-03', action: 'probe-oscilloscope', xNorm: 0.72, yNorm: 0.91, scale: 0.90, facing: 'left', toolProp: 'oscilloscope-probe' },
          { characterId: 'mhs-18', action: 'drive-rover', xNorm: 0.84, yNorm: 0.90, scale: 0.92, facing: 'left', toolProp: 'rover-remote' },
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
