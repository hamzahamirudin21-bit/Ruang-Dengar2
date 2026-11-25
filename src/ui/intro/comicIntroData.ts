import { STUDENT_BLUEPRINTS } from '../../data/agents.seed';
import { STUDENT_BACKGROUNDS } from '../../data/studentBackgrounds';
import { IntroSfxKind } from '../motion/sfx';

export type ComicCharacterPose =
  | 'idle'
  | 'walking'
  | 'looking-around'
  | 'talking'
  | 'working-electronics'
  | 'working-code'
  | 'working-weld'
  | 'working-3d'
  | 'discussing';

export type ComicBubblePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type ComicEmotion = 'calm' | 'focused' | 'enthusiastic' | 'thoughtful' | 'determined' | 'warm';

export type ComicPanelTransition = 'slide-left' | 'slide-right' | 'slide-up' | 'zoom-pop' | 'split-reveal' | 'fade-zoom';

export type ComicCameraMotion =
  | 'slow-zoom-in'
  | 'slow-zoom-out'
  | 'pan-left-to-right'
  | 'pan-right-to-left'
  | 'track-forward'
  | 'dynamic-tilt';

export type ComicSceneBackdropKind =
  | 'campus-morning-exterior'
  | 'lab-entrance-corridor'
  | 'zone-elektronik'
  | 'zone-pemrograman'
  | 'zone-las'
  | 'zone-cetak3d'
  | 'zone-studio-desain'
  | 'zone-gudang'
  | 'zone-diskusi'
  | 'zone-baca'
  | 'zone-konsultasi'
  | 'community-panorama'
  | 'title-reveal-stage';

export interface ComicStudentIdentity {
  id: string;
  orderNumber: string;
  name: string;
  portraitUrl: string;
  spriteUrl: string;
  typeTag: string;
  cohort: string;
  origin: string;
  specialtyGroup: 'Elektronika & IoT' | 'Pemrograman & Firmware' | 'Pengelasan & Manufaktur K3' | 'Cetak 3D & Desain UI/UX' | 'Riset, Diskusi & Robotika';
  activityTitle: string;
  uniquePotential: string;
  initialZoneId: string;
  accentColor: string;
}

export interface ComicDialogueEntry {
  id: string;
  speakerId: string;
  speakerName: string;
  dialogue: string;
  panelId: string;
  startTime: number;
  duration: number;
  emotion: ComicEmotion;
  bubblePosition: ComicBubblePosition;
}

export interface ComicPanelCharacterPlacement {
  characterId: string;
  pose: ComicCharacterPose;
  /** Posisi horizontal persentase di dalam panel (12..88) agar wajah tidak pernah bertumpuk */
  xPercent: number;
  /** Skala relatif potret (0.85..1.12) */
  scale?: number;
  flipX?: boolean;
  activityBadge?: string;
}

export interface ComicPanelSpec {
  id: string;
  title: string;
  subtitle: string;
  backdropKind: ComicSceneBackdropKind;
  transition: ComicPanelTransition;
  cameraMotion: ComicCameraMotion;
  /** Delay relatif dari awal beat (ms) untuk efek stagger antar-panel komik */
  revealOffsetMs: number;
  /** Proporsi grid panel pada layar */
  layoutSpan: 'full' | 'half' | 'wide-left' | 'wide-right' | 'third';
  characters: readonly ComicPanelCharacterPlacement[];
  sfxOnReveal?: IntroSfxKind;
  onomatopoeia?: string;
}

export interface ComicIntroBeat {
  id: string;
  sceneNumber: 1 | 2 | 3 | 4 | 5 | 6;
  sceneCode: string;
  sceneTitle: string;
  beatLabel: string;
  startTimeMs: number;
  durationMs: number;
  narrativeCaption?: string;
  narrativePosition?: 'top' | 'bottom';
  panels: readonly ComicPanelSpec[];
  dialogues: readonly ComicDialogueEntry[];
  ambientSfx?: IntroSfxKind;
}

const SPECIALTY_GROUP_BY_ID: Readonly<Record<string, ComicStudentIdentity['specialtyGroup']>> = {
  'mhs-01': 'Elektronika & IoT',
  'mhs-02': 'Elektronika & IoT',
  'mhs-03': 'Elektronika & IoT',
  'mhs-04': 'Pemrograman & Firmware',
  'mhs-05': 'Cetak 3D & Desain UI/UX',
  'mhs-06': 'Pemrograman & Firmware',
  'mhs-07': 'Pengelasan & Manufaktur K3',
  'mhs-08': 'Cetak 3D & Desain UI/UX',
  'mhs-09': 'Pengelasan & Manufaktur K3',
  'mhs-10': 'Elektronika & IoT',
  'mhs-11': 'Elektronika & IoT',
  'mhs-12': 'Riset, Diskusi & Robotika',
  'mhs-13': 'Riset, Diskusi & Robotika',
  'mhs-14': 'Elektronika & IoT',
  'mhs-15': 'Cetak 3D & Desain UI/UX',
  'mhs-16': 'Cetak 3D & Desain UI/UX',
  'mhs-17': 'Riset, Diskusi & Robotika',
  'mhs-18': 'Riset, Diskusi & Robotika',
};

const ACTIVITY_TITLE_BY_ID: Readonly<Record<string, string>> = {
  'mhs-01': 'Arsitektur Sensor IoT Daya Rendah',
  'mhs-02': 'Perakitan PCB & Penyolderan SMD Presisi',
  'mhs-03': 'Kalibrasi Osiloskop & Asistensi Praktikum',
  'mhs-04': 'Optimasi Kode Real-Time & Arsitektur Firmware',
  'mhs-05': 'Antarmuka Visual Telemetri & Cetak 3D',
  'mhs-06': 'Dokumentasi Teknis & Pengujian Modul MCU',
  'mhs-07': 'Fabrikasi Rangka Besi & Standar Las K3',
  'mhs-08': 'Kalibrasi Extruder & Perawatan Printer 3D',
  'mhs-09': 'Uji Torsi & Ketahanan Prototipe Mekanik',
  'mhs-10': 'Instrumentasi & Kalibrasi Alat Ukur Presisi',
  'mhs-11': 'Analisis Pola Data Sensor & Anomali Sinyal',
  'mhs-12': 'Fasilitator Diskusi & Sinkronisasi Lintas-Tim',
  'mhs-13': 'Pengujian Kenyamanan Pengguna & Observasi Tim',
  'mhs-14': 'Pencatatan Skema Rangkaian & Eksperimen Dasar',
  'mhs-15': 'Purwarupa Eksperimental & Daur Ulang Komponen',
  'mhs-16': 'Tata Letak Antarmuka & Ergonomi Display IoT',
  'mhs-17': 'Riset Literatur & Arsip Skema Laboratorium',
  'mhs-18': 'Integrasi Robotika Lintas-Lab (Las, 3D & Kontrol)',
};

const TONE_COLOR_MAP: Readonly<Record<'teal' | 'amber' | 'rose' | 'indigo' | 'emerald', string>> = {
  teal: '#2dd4bf',
  amber: '#fbbf24',
  rose: '#fb7185',
  indigo: '#818cf8',
  emerald: '#34d399',
};

/**
 * Mengambil identitas resmi ke-18 mahasiswa langsung dari STUDENT_BLUEPRINTS & STUDENT_BACKGROUNDS
 * sehingga nama, warna, pakaian, potret, sprite, kepribadian, dan spesialisasi 100% konsisten.
 */
export const COMIC_STUDENT_IDENTITIES: readonly ComicStudentIdentity[] = STUDENT_BLUEPRINTS.map((bp, idx) => {
  const bg = STUDENT_BACKGROUNDS[bp.id];
  const orderNumber = String(idx + 1).padStart(2, '0');
  const originAndCohort = bg?.originAndCohort ?? `Indonesia · Angkatan ${bp.cohort}`;
  const [originPart] = originAndCohort.split('·').map((s) => s.trim());
  return {
    id: bp.id,
    orderNumber: `#${orderNumber}`,
    name: bp.name,
    portraitUrl: `/assets/characters/${bp.id}-portrait.png`,
    spriteUrl: `/assets/characters/${bp.id}-sprite.png`,
    typeTag: bg?.typeTag ?? 'Mahasiswa Vokasi',
    cohort: `Angkatan ${bp.cohort}`,
    origin: originPart || originAndCohort,
    specialtyGroup: SPECIALTY_GROUP_BY_ID[bp.id] ?? 'Elektronika & IoT',
    activityTitle: ACTIVITY_TITLE_BY_ID[bp.id] ?? bp.uniquePotential,
    uniquePotential: bp.uniquePotential,
    initialZoneId: bp.initialZoneId,
    accentColor: bg ? TONE_COLOR_MAP[bg.typeTone] : '#38bdf8',
  };
});

export const DOSEN_IDENTITY: ComicStudentIdentity = {
  id: 'dosen',
  orderNumber: 'BK',
  name: 'Ibu Dosen Pembimbing',
  portraitUrl: '/assets/characters/dosen-portrait.png',
  spriteUrl: '/assets/characters/dosen-sprite.png',
  typeTag: 'Dosen Pembimbing & Konselor Akademik',
  cohort: 'Laboratorium Elektronika & IoT',
  origin: 'Kampus Vokasi',
  specialtyGroup: 'Riset, Diskusi & Robotika',
  activityTitle: 'Pendampingan Akademik & Konseling Empatik',
  uniquePotential: 'Mendengarkan dengan empati dan membuka ruang aman bagi setiap mahasiswa.',
  initialZoneId: 'konsultasi',
  accentColor: '#38bdf8',
};

const IDENTITY_MAP: Readonly<Record<string, ComicStudentIdentity>> = Object.fromEntries([
  [DOSEN_IDENTITY.id, DOSEN_IDENTITY],
  ...COMIC_STUDENT_IDENTITIES.map((item) => [item.id, item]),
]);

export function getComicCharacterIdentity(characterId: string): ComicStudentIdentity {
  return IDENTITY_MAP[characterId] ?? DOSEN_IDENTITY;
}

/**
 * Rangkaian 6 Babak Sinematik (Total 13 Beat Komik = 60.0 detik)
 * Dirancang mengikuti struktur storyboard Master Prompt secara presisi.
 */
export const COMIC_INTRO_BEATS: readonly ComicIntroBeat[] = [
  // ============================================================================
  // SCENE 01 — THE BEGINNING (0.0s – 6.0s)
  // ============================================================================
  {
    id: 'scene-01-beginning',
    sceneNumber: 1,
    sceneCode: 'SCENE 01',
    sceneTitle: 'THE BEGINNING — FAJAR DI KAMPUS VOKASI',
    beatLabel: 'Suasana Pagi Gedung Laboratorium',
    startTimeMs: 0,
    durationMs: 6000,
    narrativeCaption: 'Setiap perjalanan besar selalu dimulai dari sebuah tempat.',
    narrativePosition: 'bottom',
    ambientSfx: 'ambient-chime',
    panels: [
      {
        id: 'p-s01-campus-dawn',
        title: 'GEDUNG LABORATORIUM ELEKTRONIKA & IoT',
        subtitle: 'Pukul 07.15 WIB · Sinar Pagi Menembus Pepohonan Kampus',
        backdropKind: 'campus-morning-exterior',
        transition: 'fade-zoom',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 0,
        layoutSpan: 'full',
        characters: [],
        sfxOnReveal: 'light-sweep',
        onomatopoeia: 'FAJAR PAGI...',
      },
    ],
    dialogues: [],
  },

  // ============================================================================
  // SCENE 02 — ENTER THE LABORATORY (6.0s – 12.0s)
  // ============================================================================
  {
    id: 'scene-02-enter-lab',
    sceneNumber: 2,
    sceneCode: 'SCENE 02',
    sceneTitle: 'ENTER THE LABORATORY — MELANGKAH KE RUANG DENGAR',
    beatLabel: 'Pintu Kaca Terbuka Menuju Area Praktikum',
    startTimeMs: 6000,
    durationMs: 6000,
    narrativeCaption:
      'Di tempat ini, rasa ingin tahu berubah menjadi eksperimen. Ide sederhana berkembang menjadi teknologi.',
    narrativePosition: 'top',
    ambientSfx: 'door-open',
    panels: [
      {
        id: 'p-s02-walk-entrance',
        title: 'KORIDOR PINTU UTAMA',
        subtitle: 'Langkah Pagi Menuju Pintu Kaca Geser',
        backdropKind: 'lab-entrance-corridor',
        transition: 'slide-left',
        cameraMotion: 'track-forward',
        revealOffsetMs: 0,
        layoutSpan: 'half',
        sfxOnReveal: 'footstep',
        onomatopoeia: 'TAP... TAP...',
        characters: [
          {
            characterId: 'dosen',
            pose: 'walking',
            xPercent: 48,
            scale: 1.04,
            activityBadge: 'Memasuki Laboratorium',
          },
        ],
      },
      {
        id: 'p-s02-doors-open',
        title: 'PINTU LABORATORIUM TERBUKA',
        subtitle: 'Mahasiswa Mulai Menghidupkan Stasiun Kerja',
        backdropKind: 'zone-diskusi',
        transition: 'slide-right',
        cameraMotion: 'pan-left-to-right',
        revealOffsetMs: 450,
        layoutSpan: 'half',
        sfxOnReveal: 'door-open',
        onomatopoeia: 'SWOOSH!',
        characters: [
          {
            characterId: 'dosen',
            pose: 'looking-around',
            xPercent: 30,
            scale: 1.0,
            activityBadge: 'Mengamati Suasana Pagi',
          },
          {
            characterId: 'mhs-01',
            pose: 'working-electronics',
            xPercent: 72,
            scale: 0.98,
            flipX: true,
            activityBadge: 'Menyalakan Modul IoT',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s02-dosen',
        speakerId: 'dosen',
        speakerName: 'Ibu Dosen Pembimbing',
        dialogue: 'Pagi yang cerah. Mari kita lihat perkembangan proyek dan kabar rekan-rekan mahasiswa hari ini.',
        panelId: 'p-s02-doors-open',
        startTime: 6900,
        duration: 4600,
        emotion: 'warm',
        bubblePosition: 'bottom-left',
      },
    ],
  },

  // ============================================================================
  // SCENE 03 — MEET THE STUDENTS (8 Multi-Panel Comic Beats = 12.0s – 40.0s)
  // Memperkenalkan seluruh 18 mahasiswa berdasarkan data asli mereka!
  // ============================================================================

  // Beat 3.1 (Panel 1): Raka (#01) & Dimas (#02) — Tim Elektronika & Perakitan SMD
  {
    id: 'scene-03-beat-1-elektronika',
    sceneNumber: 3,
    sceneCode: 'SCENE 03 · PANEL 1/8',
    sceneTitle: 'MEET THE STUDENTS — DIVISI ELEKTRONIKA & PERAKITAN PCB',
    beatLabel: 'Raka Pratama & Dimas Aditya di Meja Praktikum Elektronika',
    startTimeMs: 12000,
    durationMs: 3500,
    narrativeCaption: 'Di Zona Elektronika & IoT, presisi rangkaian dan ketekunan tangan menjadi fondasi utama.',
    narrativePosition: 'top',
    ambientSfx: 'panel-whoosh',
    panels: [
      {
        id: 'p-s03-raka',
        title: '#01 RAKA PRATAMA',
        subtitle: 'Koordinator Perfeksionis · Arsitektur Sensor Daya Rendah',
        backdropKind: 'zone-elektronik',
        transition: 'slide-left',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 0,
        layoutSpan: 'half',
        sfxOnReveal: 'panel-whoosh',
        onomatopoeia: 'BEEP! 3.3V',
        characters: [
          {
            characterId: 'mhs-01',
            pose: 'working-electronics',
            xPercent: 52,
            scale: 1.04,
            activityBadge: 'Kalibrasi Sensor IoT',
          },
        ],
      },
      {
        id: 'p-s03-dimas',
        title: '#02 DIMAS ADITYA',
        subtitle: 'Pendiam & Penjaga Harga Diri · Spesialis Solder SMD',
        backdropKind: 'zone-elektronik',
        transition: 'slide-right',
        cameraMotion: 'pan-left-to-right',
        revealOffsetMs: 280,
        layoutSpan: 'half',
        sfxOnReveal: 'comic-pop',
        onomatopoeia: 'TZZT... SOLDER!',
        characters: [
          {
            characterId: 'mhs-02',
            pose: 'working-electronics',
            xPercent: 50,
            scale: 1.04,
            activityBadge: 'Merakit Jalur PCB SMD',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s03-raka',
        speakerId: 'mhs-01',
        speakerName: 'Raka Pratama',
        dialogue: 'Konsumsi arus sleep-mode sudah turun ke 18 mikroampere. Jadwal integrasi harus tepat waktu!',
        panelId: 'p-s03-raka',
        startTime: 12350,
        duration: 2900,
        emotion: 'determined',
        bubblePosition: 'bottom-left',
      },
      {
        id: 'dlg-s03-dimas',
        speakerId: 'mhs-02',
        speakerName: 'Dimas Aditya',
        dialogue: 'Jalur regulator daya dan solderan pin IC sudah kurapikan. Siap diuji beban.',
        panelId: 'p-s03-dimas',
        startTime: 12650,
        duration: 2650,
        emotion: 'focused',
        bubblePosition: 'bottom-right',
      },
    ],
  },

  // Beat 3.2 (Panel 2): Tania (#03) & Maya (#11) — Osiloskop & Analisis Sinyal Sensor
  {
    id: 'scene-03-beat-2-sensor',
    sceneNumber: 3,
    sceneCode: 'SCENE 03 · PANEL 2/8',
    sceneTitle: 'MEET THE STUDENTS — MENTOR PRAKTIKUM & ANALISIS SINYAL',
    beatLabel: 'Tania Wijaya & Maya Puspita Memeriksa Gelombang Sensor',
    startTimeMs: 15500,
    durationMs: 3500,
    ambientSfx: 'panel-whoosh',
    panels: [
      {
        id: 'p-s03-tania',
        title: '#03 TANIA WIJAYA',
        subtitle: 'Mentor Sabar · Bimbang Arah · Asisten Osiloskop',
        backdropKind: 'zone-elektronik',
        transition: 'slide-up',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 0,
        layoutSpan: 'half',
        sfxOnReveal: 'panel-whoosh',
        onomatopoeia: 'WAVE ~ 50Hz',
        characters: [
          {
            characterId: 'mhs-03',
            pose: 'working-electronics',
            xPercent: 48,
            scale: 1.04,
            activityBadge: 'Menguji Osiloskop Digital',
          },
        ],
      },
      {
        id: 'p-s03-maya',
        title: '#11 MAYA PUSPITA',
        subtitle: 'Reflektif & Teliti · Analisis Pola Data Sensor',
        backdropKind: 'zone-pemrograman',
        transition: 'slide-right',
        cameraMotion: 'pan-right-to-left',
        revealOffsetMs: 280,
        layoutSpan: 'half',
        sfxOnReveal: 'comic-pop',
        onomatopoeia: 'LOG: CLEAN',
        characters: [
          {
            characterId: 'mhs-11',
            pose: 'working-code',
            xPercent: 52,
            scale: 1.04,
            activityBadge: 'Memetakan Anomali Data',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s03-tania',
        speakerId: 'mhs-03',
        speakerName: 'Tania Wijaya',
        dialogue: 'Lihat gelombang kanal dua ini—kalau kapasitor filternya pas, riak tegangannya langsung bersih.',
        panelId: 'p-s03-tania',
        startTime: 15800,
        duration: 2950,
        emotion: 'warm',
        bubblePosition: 'bottom-left',
      },
      {
        id: 'dlg-s03-maya',
        speakerId: 'mhs-11',
        speakerName: 'Maya Puspita',
        dialogue: 'Tepat sekali, Kak Tania. Di grafik telemetriku, simpangan datanya sekarang di bawah 0,4 persen.',
        panelId: 'p-s03-maya',
        startTime: 16100,
        duration: 2700,
        emotion: 'thoughtful',
        bubblePosition: 'bottom-right',
      },
    ],
  },

  // Beat 3.3 (Panel 3): Kevin (#04) & Mita (#06) — Kelompok Pemrograman & Firmware MCU
  {
    id: 'scene-03-beat-3-coding',
    sceneNumber: 3,
    sceneCode: 'SCENE 03 · PANEL 3/8',
    sceneTitle: 'MEET THE STUDENTS — WORKSTATION PEMROGRAMAN & FIRMWARE',
    beatLabel: 'Kevin Gunawan & Mita Rahmawati di Depan Multi-Monitor MCU',
    startTimeMs: 19000,
    durationMs: 3500,
    narrativeCaption: 'Di Zona Pemrograman & MCU, baris kode real-time menggerakkan setiap perangkat keras.',
    narrativePosition: 'top',
    ambientSfx: 'panel-whoosh',
    panels: [
      {
        id: 'p-s03-kevin',
        title: '#04 KEVIN GUNAWAN',
        subtitle: 'Analitis & Standar Tinggi · Arsitek Firmware Real-Time',
        backdropKind: 'zone-pemrograman',
        transition: 'slide-left',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 0,
        layoutSpan: 'half',
        sfxOnReveal: 'panel-whoosh',
        onomatopoeia: 'CLACK! COMPILE!',
        characters: [
          {
            characterId: 'mhs-04',
            pose: 'working-code',
            xPercent: 48,
            scale: 1.04,
            activityBadge: 'Optimasi Interrupt RTOS',
          },
        ],
      },
      {
        id: 'p-s03-mita',
        title: '#06 MITA RAHMAWATI',
        subtitle: 'Pemalu & Teliti · Dokumentasi Teknis & Uji Modul',
        backdropKind: 'zone-pemrograman',
        transition: 'slide-right',
        cameraMotion: 'pan-left-to-right',
        revealOffsetMs: 280,
        layoutSpan: 'half',
        sfxOnReveal: 'comic-pop',
        onomatopoeia: 'CHECKLIST OK!',
        characters: [
          {
            characterId: 'mhs-06',
            pose: 'working-code',
            xPercent: 52,
            scale: 1.03,
            activityBadge: 'Menyusun Dokumentasi API',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s03-kevin',
        speakerId: 'mhs-04',
        speakerName: 'Kevin Gunawan',
        dialogue: 'Latensi paket MQTT berhasil kupangkas ke 4 milidetik. Tidak ada ruang untuk kode yang boros memori.',
        panelId: 'p-s03-kevin',
        startTime: 19300,
        duration: 2950,
        emotion: 'focused',
        bubblePosition: 'bottom-left',
      },
      {
        id: 'dlg-s03-mita',
        speakerId: 'mhs-06',
        speakerName: 'Mita Rahmawati',
        dialogue: 'Diagram alir protokol dan catatan pinout-nya sudah kutulis rapi supaya teman-teman mudah membacanya...',
        panelId: 'p-s03-mita',
        startTime: 19600,
        duration: 2700,
        emotion: 'calm',
        bubblePosition: 'bottom-right',
      },
    ],
  },

  // Beat 3.4 (Panel 4): Ayu (#05) & Farhan (#16) — Kelompok Desain Visual, UI/UX & Cetak 3D
  {
    id: 'scene-03-beat-4-desain-3d',
    sceneNumber: 3,
    sceneCode: 'SCENE 03 · PANEL 4/8',
    sceneTitle: 'MEET THE STUDENTS — STUDIO DESAIN & ANTARMUKA VISUAL',
    beatLabel: 'Ayu Permata & Farhan Pratama Merancang Enclosure & UI Telemetri',
    startTimeMs: 22500,
    durationMs: 3500,
    ambientSfx: 'panel-whoosh',
    panels: [
      {
        id: 'p-s03-ayu',
        title: '#05 AYU PERMATA',
        subtitle: 'Kreatif & Berjiwa Visual · Desain Casing 3D & Dashboard',
        backdropKind: 'zone-cetak3d',
        transition: 'zoom-pop',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 0,
        layoutSpan: 'half',
        sfxOnReveal: 'panel-whoosh',
        onomatopoeia: '3D MESH!',
        characters: [
          {
            characterId: 'mhs-05',
            pose: 'working-3d',
            xPercent: 48,
            scale: 1.04,
            activityBadge: 'Pemodelan Enclosure CAD',
          },
        ],
      },
      {
        id: 'p-s03-farhan',
        title: '#16 FARHAN PRATAMA',
        subtitle: 'Desainer UI/UX · Perfeksionis Visual · Studio Desain',
        backdropKind: 'zone-studio-desain',
        transition: 'slide-right',
        cameraMotion: 'pan-left-to-right',
        revealOffsetMs: 280,
        layoutSpan: 'half',
        sfxOnReveal: 'comic-pop',
        onomatopoeia: 'PIXEL PERFECT!',
        characters: [
          {
            characterId: 'mhs-16',
            pose: 'working-3d',
            xPercent: 52,
            scale: 1.04,
            activityBadge: 'Kalibrasi Kontras Layar OLED',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s03-ayu',
        speakerId: 'mhs-05',
        speakerName: 'Ayu Permata',
        dialogue: 'Teknologi yang hebat juga harus nyaman disentuh dan mudah dipahami lewat bahasa visual!',
        panelId: 'p-s03-ayu',
        startTime: 22800,
        duration: 2950,
        emotion: 'enthusiastic',
        bubblePosition: 'bottom-left',
      },
      {
        id: 'dlg-s03-farhan',
        speakerId: 'mhs-16',
        speakerName: 'Farhan Pratama',
        dialogue: 'Hierarki tipografi dan kontras panel telemetri ini sudah kuselaraskan hingga ke satuan piksel.',
        panelId: 'p-s03-farhan',
        startTime: 23100,
        duration: 2700,
        emotion: 'focused',
        bubblePosition: 'bottom-right',
      },
    ],
  },

  // Beat 3.5 (Panel 5): Bima (#07), Hendra (#08), & Gilang (#09) — Bengkel Las K3 & Fabrikasi
  {
    id: 'scene-03-beat-5-las-fabrikasi',
    sceneNumber: 3,
    sceneCode: 'SCENE 03 · PANEL 5/8',
    sceneTitle: 'MEET THE STUDENTS — BENGKEL LAS K3 & MANUFAKTUR',
    beatLabel: 'Bima Mahendra, Hendra Wijaya & Gilang Ramadhan di Zona Fabrikasi',
    startTimeMs: 26000,
    durationMs: 3500,
    narrativeCaption: 'Di Bengkel Las K3 dan Cetak 3D, keselamatan kerja berpadu dengan ketangguhan mekanik.',
    narrativePosition: 'top',
    ambientSfx: 'panel-whoosh',
    panels: [
      {
        id: 'p-s03-bima-gilang',
        title: '#07 BIMA MAHENDRA & #09 GILANG RAMADHAN',
        subtitle: 'Disiplin Las K3 & Uji Ketahanan Prototipe Mekanik',
        backdropKind: 'zone-las',
        transition: 'slide-left',
        cameraMotion: 'dynamic-tilt',
        revealOffsetMs: 0,
        layoutSpan: 'wide-left',
        sfxOnReveal: 'panel-whoosh',
        onomatopoeia: 'SPARK! K3 AMAN!',
        characters: [
          {
            characterId: 'mhs-07',
            pose: 'working-weld',
            xPercent: 32,
            scale: 1.03,
            activityBadge: 'Pengelasan Rangka K3',
          },
          {
            characterId: 'mhs-09',
            pose: 'working-weld',
            xPercent: 72,
            scale: 1.02,
            flipX: true,
            activityBadge: 'Uji Torsi Lengan Aktuator',
          },
        ],
      },
      {
        id: 'p-s03-hendra',
        title: '#08 HENDRA WIJAYA',
        subtitle: 'Ramah & Penolong · Kalibrasi Printer 3D',
        backdropKind: 'zone-cetak3d',
        transition: 'slide-right',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 280,
        layoutSpan: 'third',
        sfxOnReveal: 'comic-pop',
        onomatopoeia: 'WHIRR... 210°C',
        characters: [
          {
            characterId: 'mhs-08',
            pose: 'working-3d',
            xPercent: 50,
            scale: 1.02,
            activityBadge: 'Menjaga Nozzle Printer 3D',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s03-bima',
        speakerId: 'mhs-07',
        speakerName: 'Bima Mahendra',
        dialogue: 'APD lengkap, ventilasi aktif! Sambungan rangka baja ini harus presisi dan memenuhi standar K3.',
        panelId: 'p-s03-bima-gilang',
        startTime: 26300,
        duration: 2950,
        emotion: 'determined',
        bubblePosition: 'bottom-left',
      },
      {
        id: 'dlg-s03-hendra',
        speakerId: 'mhs-08',
        speakerName: 'Hendra Wijaya',
        dialogue: 'Dudukan braket untuk Gilang dan Raka sedang kucetak. Kalau butuh bantuan, panggil saja aku!',
        panelId: 'p-s03-hendra',
        startTime: 26600,
        duration: 2700,
        emotion: 'warm',
        bubblePosition: 'bottom-right',
      },
    ],
  },

  // Beat 3.6 (Panel 6): Teguh (#10) & Naufal (#15) — Instrumentasi Gudang Alat & Inovator Purwarupa
  {
    id: 'scene-03-beat-6-instrumentasi',
    sceneNumber: 3,
    sceneCode: 'SCENE 03 · PANEL 6/8',
    sceneTitle: 'MEET THE STUDENTS — INSTRUMENTASI & EKSPERIMEN PURWARUPA',
    beatLabel: 'Teguh Santosa & Naufal Hakim Menguji Perangkat Presisi',
    startTimeMs: 29500,
    durationMs: 3500,
    ambientSfx: 'panel-whoosh',
    panels: [
      {
        id: 'p-s03-teguh',
        title: '#10 TEGUH SANTOSA',
        subtitle: 'Mandiri & Fokus Sunyi · Kalibrasi Alat Ukur di Gudang Alat',
        backdropKind: 'zone-gudang',
        transition: 'slide-left',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 0,
        layoutSpan: 'half',
        sfxOnReveal: 'panel-whoosh',
        onomatopoeia: '0.001 OHM',
        characters: [
          {
            characterId: 'mhs-10',
            pose: 'working-electronics',
            xPercent: 48,
            scale: 1.04,
            activityBadge: 'Kalibrasi Multimeter Presisi',
          },
        ],
      },
      {
        id: 'p-s03-naufal',
        title: '#15 NAUFAL HAKIM',
        subtitle: 'Inovator Eksperimental · Purwarupa Komponen Daur Ulang',
        backdropKind: 'zone-cetak3d',
        transition: 'slide-right',
        cameraMotion: 'pan-left-to-right',
        revealOffsetMs: 280,
        layoutSpan: 'half',
        sfxOnReveal: 'comic-pop',
        onomatopoeia: 'EUREKA!',
        characters: [
          {
            characterId: 'mhs-15',
            pose: 'working-3d',
            xPercent: 52,
            scale: 1.04,
            activityBadge: 'Modifikasi Motor Stepper',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s03-teguh',
        speakerId: 'mhs-10',
        speakerName: 'Teguh Santosa',
        dialogue: 'Semua probe dan catu daya laboratorium sudah kukalibrasi ulang. Akurasi tidak boleh meleset.',
        panelId: 'p-s03-teguh',
        startTime: 29800,
        duration: 2950,
        emotion: 'calm',
        bubblePosition: 'bottom-left',
      },
      {
        id: 'dlg-s03-naufal',
        speakerId: 'mhs-15',
        speakerName: 'Naufal Hakim',
        dialogue: 'Lihat! Kumparan bekas printer tua ini berhasil kuubah jadi generator mikro untuk sensor nirkabel!',
        panelId: 'p-s03-naufal',
        startTime: 30100,
        duration: 2700,
        emotion: 'enthusiastic',
        bubblePosition: 'bottom-right',
      },
    ],
  },

  // Beat 3.7 (Panel 7): Sari (#12), Nisa (#13), Rani (#14), & Sekar (#17) — Kolaborasi, Skema & Riset
  {
    id: 'scene-03-beat-7-kolaborasi-riset',
    sceneNumber: 3,
    sceneCode: 'SCENE 03 · PANEL 7/8',
    sceneTitle: 'MEET THE STUDENTS — KOLABORASI, SKEMA & RISET LITERATUR',
    beatLabel: 'Sari Melati, Nisa Nurhaliza, Rani Safitri & Sekar Wulandari',
    startTimeMs: 33000,
    durationMs: 3500,
    ambientSfx: 'panel-whoosh',
    panels: [
      {
        id: 'p-s03-sari-nisa',
        title: '#12 SARI MELATI & #13 NISA NURHALIZA',
        subtitle: 'Penengah Hangat & Pengamat Empatik di Meja Diskusi',
        backdropKind: 'zone-diskusi',
        transition: 'slide-up',
        cameraMotion: 'pan-left-to-right',
        revealOffsetMs: 0,
        layoutSpan: 'half',
        sfxOnReveal: 'panel-whoosh',
        onomatopoeia: 'SINERGI TIM!',
        characters: [
          {
            characterId: 'mhs-12',
            pose: 'discussing',
            xPercent: 32,
            scale: 1.0,
            activityBadge: 'Menjembatani Diskusi Tim',
          },
          {
            characterId: 'mhs-13',
            pose: 'discussing',
            xPercent: 70,
            scale: 1.0,
            flipX: true,
            activityBadge: 'Mencatat Umpan Balik Tim',
          },
        ],
      },
      {
        id: 'p-s03-rani-sekar',
        title: '#14 RANI SAFITRI & #17 SEKAR WULANDARI',
        subtitle: 'Pencatat Skema Rangkaian & Peneliti Dokumentasi di Pojok Baca',
        backdropKind: 'zone-baca',
        transition: 'slide-right',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 280,
        layoutSpan: 'half',
        sfxOnReveal: 'comic-pop',
        onomatopoeia: 'DATASHEET REF!',
        characters: [
          {
            characterId: 'mhs-14',
            pose: 'working-electronics',
            xPercent: 32,
            scale: 1.0,
            activityBadge: 'Menggambar Skema Dasar',
          },
          {
            characterId: 'mhs-17',
            pose: 'discussing',
            xPercent: 70,
            scale: 1.0,
            flipX: true,
            activityBadge: 'Arsip Referensi IEEE & IoT',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s03-sari',
        speakerId: 'mhs-12',
        speakerName: 'Sari Melati',
        dialogue: 'Aku dan Nisa siap menghubungkan kebutuhan tim perangkat keras dengan tim antarmuka!',
        panelId: 'p-s03-sari-nisa',
        startTime: 33300,
        duration: 2950,
        emotion: 'warm',
        bubblePosition: 'bottom-left',
      },
      {
        id: 'dlg-s03-sekar',
        speakerId: 'mhs-17',
        speakerName: 'Sekar Wulandari',
        dialogue: 'Referensi datasheet dan catatan skema Rani sudah kami indeks di Pojok Baca untuk seluruh tim.',
        panelId: 'p-s03-rani-sekar',
        startTime: 33600,
        duration: 2700,
        emotion: 'calm',
        bubblePosition: 'bottom-right',
      },
    ],
  },

  // Beat 3.8 (Panel 8): Bagas (#18) — Koordinator Komunitas Robotika Lintas-Lab
  {
    id: 'scene-03-beat-8-robotika',
    sceneNumber: 3,
    sceneCode: 'SCENE 03 · PANEL 8/8',
    sceneTitle: 'MEET THE STUDENTS — KOMUNITAS ROBOTIKA LINTAS-LAB',
    beatLabel: 'Bagas Saputra Memadukan Mekanik, Cetak 3D, dan Kendali IoT',
    startTimeMs: 36500,
    durationMs: 3500,
    narrativeCaption: 'Dan di titik temu seluruh divisi, komunitas Robotika menyatukan rangka, sensor, dan kecerdasan buatan.',
    narrativePosition: 'top',
    ambientSfx: 'light-sweep',
    panels: [
      {
        id: 'p-s03-bagas',
        title: '#18 BAGAS SAPUTRA — KOORDINATOR ROBOTIKA LINTAS-LAB',
        subtitle: 'Menyatukan Rangka Las K3, Aktuator Cetak 3D, PCB Sensor, dan Firmware MCU',
        backdropKind: 'zone-diskusi',
        transition: 'zoom-pop',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 0,
        layoutSpan: 'full',
        sfxOnReveal: 'light-sweep',
        onomatopoeia: 'ROBO-SYNC ONLINE!',
        characters: [
          {
            characterId: 'mhs-18',
            pose: 'working-electronics',
            xPercent: 36,
            scale: 1.08,
            activityBadge: 'Integrasi Rover Robotika IoT',
          },
          {
            characterId: 'mhs-09',
            pose: 'discussing',
            xPercent: 68,
            scale: 0.96,
            flipX: true,
            activityBadge: 'Kalibrasi Servo & Roda',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s03-bagas',
        speakerId: 'mhs-18',
        speakerName: 'Bagas Saputra',
        dialogue: 'Rangka las dari Bima, bodi 3D dari Ayu & Hendra, serta papan kendali Raka & Kevin—semuanya menyatu di robot ini!',
        panelId: 'p-s03-bagas',
        startTime: 36800,
        duration: 2950,
        emotion: 'enthusiastic',
        bubblePosition: 'bottom-left',
      },
    ],
  },

  // ============================================================================
  // SCENE 04 — THE LAB IN ACTION (2 Montage Beats = 40.0s – 48.0s)
  // ============================================================================
  {
    id: 'scene-04-action-part1',
    sceneNumber: 4,
    sceneCode: 'SCENE 04 · MONTAGE A',
    sceneTitle: 'THE LAB IN ACTION — EKSPERIMEN & FABRIKASI SERENTAK',
    beatLabel: 'Rangkaian Elektronika, Mikrokontroler, Printer 3D & Bengkel Las',
    startTimeMs: 40000,
    durationMs: 4000,
    narrativeCaption: 'Setiap sudut laboratorium bergerak serentak: merakit, memprogram, mencetak, dan mengelas.',
    narrativePosition: 'top',
    ambientSfx: 'panel-whoosh',
    panels: [
      {
        id: 'p-s04-pcb-mcu',
        title: '1. PERAKITAN PCB & 2. PEMROGRAMAN MIKROKONTROLER',
        subtitle: 'Sinyal Osiloskop & Kompilasi Firmware Berjalan Real-Time',
        backdropKind: 'zone-elektronik',
        transition: 'slide-left',
        cameraMotion: 'dynamic-tilt',
        revealOffsetMs: 0,
        layoutSpan: 'half',
        sfxOnReveal: 'panel-whoosh',
        onomatopoeia: 'FLASH! 115200 BAUD',
        characters: [
          {
            characterId: 'mhs-01',
            pose: 'working-electronics',
            xPercent: 28,
            scale: 0.96,
            activityBadge: 'Merakit Rangkaian',
          },
          {
            characterId: 'mhs-04',
            pose: 'working-code',
            xPercent: 72,
            scale: 0.96,
            flipX: true,
            activityBadge: 'Flashing Mikrokontroler',
          },
        ],
      },
      {
        id: 'p-s04-3d-weld',
        title: '3. PRINTER 3D BEKERJA & 4. BENGKEL LAS K3',
        subtitle: 'Lapisan Filamen Presisi & Percikan Las Rangka Robot',
        backdropKind: 'zone-las',
        transition: 'slide-right',
        cameraMotion: 'pan-left-to-right',
        revealOffsetMs: 260,
        layoutSpan: 'half',
        sfxOnReveal: 'comic-pop',
        onomatopoeia: 'WELD & PRINT!',
        characters: [
          {
            characterId: 'mhs-08',
            pose: 'working-3d',
            xPercent: 30,
            scale: 0.96,
            activityBadge: 'Printer 3D Aktif',
          },
          {
            characterId: 'mhs-07',
            pose: 'working-weld',
            xPercent: 72,
            scale: 0.96,
            flipX: true,
            activityBadge: 'Aktivitas Las K3',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s04-action1',
        speakerId: 'mhs-04',
        speakerName: 'Kevin Gunawan',
        dialogue: 'Firmware v2.4 terunggah! Semua aktuator dan sensor telemetri merespons tanpa jeda!',
        panelId: 'p-s04-pcb-mcu',
        startTime: 40350,
        duration: 3300,
        emotion: 'enthusiastic',
        bubblePosition: 'bottom-left',
      },
    ],
  },

  {
    id: 'scene-04-action-part2',
    sceneNumber: 4,
    sceneCode: 'SCENE 04 · MONTAGE B',
    sceneTitle: 'THE LAB IN ACTION — DISKUSI, ARAHAN DOSEN & GOTONG ROYONG',
    beatLabel: 'Mahasiswa Berdiskusi, Arahan Ibu Dosen & Saling Membantu',
    startTimeMs: 44000,
    durationMs: 4000,
    narrativeCaption: 'Ketika hambatan teknis maupun beban pikiran muncul, Ruang Dengar menjadi tempat bertumbuh bersama.',
    narrativePosition: 'bottom',
    ambientSfx: 'light-sweep',
    panels: [
      {
        id: 'p-s04-diskusi-dosen',
        title: '5. DISKUSI TIM & 6. ARAHAN IBU DOSEN PEMBIMBING',
        subtitle: 'Mendengarkan Kendala Teknis Sekaligus Menjaga Kesejahteraan Psikologis',
        backdropKind: 'zone-konsultasi',
        transition: 'slide-up',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 0,
        layoutSpan: 'half',
        sfxOnReveal: 'panel-whoosh',
        onomatopoeia: 'EMPATI & ARAHAN',
        characters: [
          {
            characterId: 'dosen',
            pose: 'talking',
            xPercent: 30,
            scale: 1.0,
            activityBadge: 'Memberikan Arahan',
          },
          {
            characterId: 'mhs-03',
            pose: 'discussing',
            xPercent: 72,
            scale: 0.98,
            flipX: true,
            activityBadge: 'Berdiskusi Terbuka',
          },
        ],
      },
      {
        id: 'p-s04-helping',
        title: '7. SALING MEMBANTU MENYELESAIKAN PROYEK',
        subtitle: 'Kolaborasi Lintas-Angkatan Menuntaskan Purwarupa Bersama',
        backdropKind: 'zone-diskusi',
        transition: 'slide-right',
        cameraMotion: 'pan-left-to-right',
        revealOffsetMs: 260,
        layoutSpan: 'half',
        sfxOnReveal: 'comic-pop',
        onomatopoeia: 'TEAMWORK!',
        characters: [
          {
            characterId: 'mhs-12',
            pose: 'discussing',
            xPercent: 28,
            scale: 0.96,
            activityBadge: 'Menyelaraskan Tim',
          },
          {
            characterId: 'mhs-14',
            pose: 'working-electronics',
            xPercent: 52,
            scale: 0.95,
            activityBadge: 'Uji Skema Bersama',
          },
          {
            characterId: 'mhs-18',
            pose: 'working-electronics',
            xPercent: 76,
            scale: 0.96,
            flipX: true,
            activityBadge: 'Integrasi Akhir',
          },
        ],
      },
    ],
    dialogues: [
      {
        id: 'dlg-s04-dosen',
        speakerId: 'dosen',
        speakerName: 'Ibu Dosen Pembimbing',
        dialogue: 'Keberhasilan laboratorium bukan hanya soal alat yang menyala, tetapi juga bagaimana kalian saling menguatkan.',
        panelId: 'p-s04-diskusi-dosen',
        startTime: 44350,
        duration: 3300,
        emotion: 'warm',
        bubblePosition: 'bottom-left',
      },
    ],
  },

  // ============================================================================
  // SCENE 05 — ONE COMMUNITY (48.0s – 54.0s)
  // Panel komik besar yang memperlihatkan seluruh 18 mahasiswa + Ibu Dosen
  // ============================================================================
  {
    id: 'scene-05-one-community',
    sceneNumber: 5,
    sceneCode: 'SCENE 05',
    sceneTitle: 'ONE COMMUNITY — KELUARGA BESAR LABORATORIUM ELEKTRONIKA & IoT',
    beatLabel: '18 Mahasiswa & Ibu Dosen Pembimbing dalam Satu Komunitas Utuh',
    startTimeMs: 48000,
    durationMs: 6000,
    narrativeCaption:
      'Berbeda keahlian, berbeda karakter, tetapi memiliki satu tujuan: belajar, berkarya, dan menciptakan sesuatu yang bermakna.',
    narrativePosition: 'bottom',
    ambientSfx: 'light-sweep',
    panels: [
      {
        id: 'p-s05-panorama-18',
        title: '18 MAHASISWA · 5 DIVISI KEAHLIAN · 1 RUANG DENGAR',
        subtitle: 'Potret Lengkap Kohort Laboratorium Elektronika & IoT bersama Ibu Dosen Pembimbing',
        backdropKind: 'community-panorama',
        transition: 'zoom-pop',
        cameraMotion: 'slow-zoom-out',
        revealOffsetMs: 0,
        layoutSpan: 'full',
        sfxOnReveal: 'light-sweep',
        onomatopoeia: 'BERSAMA KITA BERKARYA!',
        characters: COMIC_STUDENT_IDENTITIES.map((student, idx) => ({
          characterId: student.id,
          pose: 'idle',
          xPercent: 5 + idx * 5,
          scale: 1,
          activityBadge: student.specialtyGroup,
        })),
      },
    ],
    dialogues: [],
  },

  // ============================================================================
  // SCENE 06 — TITLE REVEAL (54.0s – 60.0s)
  // ============================================================================
  {
    id: 'scene-06-title-reveal',
    sceneNumber: 6,
    sceneCode: 'SCENE 06',
    sceneTitle: 'TITLE REVEAL — RUANG DENGAR',
    beatLabel: 'Simulasi Laboratorium Elektronika & IoT Siap Dimulai',
    startTimeMs: 54000,
    durationMs: 6000,
    narrativeCaption: 'Selamat datang di Ruang Dengar. Langkahmu sebagai Dosen Pembimbing dimulai sekarang.',
    narrativePosition: 'bottom',
    ambientSfx: 'title-climax',
    panels: [
      {
        id: 'p-s06-title-stage',
        title: 'RUANG DENGAR',
        subtitle: 'SIMULASI LABORATORIUM ELEKTRONIKA & IoT',
        backdropKind: 'title-reveal-stage',
        transition: 'fade-zoom',
        cameraMotion: 'slow-zoom-in',
        revealOffsetMs: 0,
        layoutSpan: 'full',
        sfxOnReveal: 'title-climax',
        characters: [],
      },
    ],
    dialogues: [],
  },
];

export const COMIC_INTRO_TOTAL_DURATION_MS = COMIC_INTRO_BEATS.reduce(
  (maxEnd, beat) => Math.max(maxEnd, beat.startTimeMs + beat.durationMs),
  0
);
