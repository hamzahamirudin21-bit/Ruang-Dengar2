import type { StoryScene } from '../../engine/story/storyTypes';
import type { ZoneType } from '../../types';
import type { SceneArtId } from '../scene/sceneArt';

/**
 * PHASE 1 — UNIVERSAL CONVERSATION ARCHITECTURE: ROOM VISUAL CONFIGURATION
 * Memisahkan logika dialog (Conversation Core) dari identitas visual ruangan (Room Visual Config).
 * Mendukung seluruh 11 ZoneType resmi di LAB_MAP tanpa mengubah kontrak resolveSceneArt lama.
 */

export type ConversationRoomId = ZoneType;

export type RoomWallDisplayKind =
  | 'firmware-telemetry'
  | 'iot-oscilloscope'
  | 'fabrication-3d-layers'
  | 'k3-safety-protocol'
  | 'inventory-matrix'
  | 'creative-color-canvas'
  | 'collab-sprint-board'
  | 'counseling-harmony'
  | 'digital-library-index'
  | 'lounge-ambient-wave'
  | 'academic-research-archive';

export type RoomDeskPropKind =
  | 'holo-terminal'
  | 'pcb-multimeter'
  | 'caliper-prototype'
  | 'k3-checklist-gloves'
  | 'barcode-scanner-log'
  | 'stylus-pen-tablet'
  | 'collab-notes-tablet'
  | 'counselor-journal-tea'
  | 'open-tome-bookmark'
  | 'warm-mug-coaster'
  | 'academic-dossier-pen';

export interface RoomColorTheme {
  /** Warna latar dasar ruangan (deep navy / graphite / warm walnut). */
  bgPrimary: string;
  /** Warna sekunder gradasi atmosfer ruangan. */
  bgSecondary: string;
  /** Aksen utama bingkai & HUD (mis. Electric Cyan #00E5FF, Amber #FFB547, Violet #C084FC). */
  accentPrimary: string;
  /** Aksen sekunder untuk lencana, pembicara, dan indikator penting (mis. Warm Gold #FFC96B). */
  accentSecondary: string;
  /** Warna pendaran cahaya (rgba) untuk box-shadow dan lampu ambient ruangan. */
  glowColor: string;
  /** Warna permukaan panel dialog kaca. */
  dialogGlassBg: string;
  /** Warna permukaan meja depan (foreground tabletop). */
  tabletopSurface: string;
  /** Warna partikel atmosfer kanvas VFX (r, g, b). */
  particleRgb: string;
}

export interface RoomVisualConfig {
  roomId: ConversationRoomId;
  sceneArtId: SceneArtId;
  /** Judul lokasi huruf kapital untuk Mission Objective Panel. */
  headerTitle: string;
  /** Sub-label identitas laboratorium/ruangan. */
  departmentTag: string;
  /** Suasana atmosferik ruangan. */
  moodCategory: 'high-tech' | 'industrial' | 'creative' | 'collaborative' | 'calm-warm';
  /** Jenis panel visualisasi di dinding latar ruangan. */
  wallDisplayKind: RoomWallDisplayKind;
  /** Judul panel visualisasi teknis/akademik di dinding latar. */
  wallDisplayTitle: string;
  /** Simpul diagram/indikator pada panel dinding latar. */
  wallDisplayNodes: readonly [string, string, string];
  /** Jenis properti meja depan (foreground tabletop). */
  deskPropKind: RoomDeskPropKind;
  /** Palet tema visual spesifik ruangan. */
  theme: RoomColorTheme;
}

export const ROOM_VISUAL_CONFIGS: Readonly<Record<ConversationRoomId, RoomVisualConfig>> = {
  pemrograman: {
    roomId: 'pemrograman',
    sceneArtId: 'pemrograman',
    headerTitle: 'STASIUN PEMROGRAMAN DAN MIKROKONTROLER',
    departmentTag: 'ADVANCED PROGRAMMING & MCU LAB',
    moodCategory: 'high-tech',
    wallDisplayKind: 'firmware-telemetry',
    wallDisplayTitle: 'ALUR FIRMWARE & TELEMETRI',
    wallDisplayNodes: ['sensor()', 'filter()', 'sendMQTT()'],
    deskPropKind: 'holo-terminal',
    theme: {
      bgPrimary: '#061522',
      bgSecondary: '#0A2638',
      accentPrimary: '#00E5FF',
      accentSecondary: '#FFBD59',
      glowColor: 'rgba(0, 229, 255, 0.42)',
      dialogGlassBg: 'rgba(218, 236, 248, 0.88)',
      tabletopSurface: '#0d2233',
      particleRgb: '0, 229, 255',
    },
  },
  'elektronik-iot': {
    roomId: 'elektronik-iot',
    sceneArtId: 'elektronik',
    headerTitle: 'MEJA ELEKTRONIKA DAN IoT',
    departmentTag: 'ELECTRONICS RESEARCH & IoT WORKBENCH',
    moodCategory: 'high-tech',
    wallDisplayKind: 'iot-oscilloscope',
    wallDisplayTitle: 'ANALISIS SINYAL & SENSOR IoT',
    wallDisplayNodes: ['ADC_IN', 'PWM_2.4GHz', 'TELEMETRY_OK'],
    deskPropKind: 'pcb-multimeter',
    theme: {
      bgPrimary: '#051821',
      bgSecondary: '#092e3a',
      accentPrimary: '#00DFFF',
      accentSecondary: '#FFB547',
      glowColor: 'rgba(0, 223, 255, 0.40)',
      dialogGlassBg: 'rgba(216, 240, 245, 0.88)',
      tabletopSurface: '#0b262e',
      particleRgb: '56, 238, 255',
    },
  },
  'cetak-3d': {
    roomId: 'cetak-3d',
    sceneArtId: 'cetak-3d',
    headerTitle: 'AREA CETAK 3D & FABRIKASI DIGITAL',
    departmentTag: 'DIGITAL FABRICATION & PROTOTYPING LAB',
    moodCategory: 'high-tech',
    wallDisplayKind: 'fabrication-3d-layers',
    wallDisplayTitle: 'MONITOR LAPISAN CETAK 3D & CAD',
    wallDisplayNodes: ['MESH_CAD', 'SLICE_0.12mm', 'EXTRUDE_210°C'],
    deskPropKind: 'caliper-prototype',
    theme: {
      bgPrimary: '#071929',
      bgSecondary: '#0e324a',
      accentPrimary: '#22D3EE',
      accentSecondary: '#FFC96B',
      glowColor: 'rgba(34, 211, 238, 0.42)',
      dialogGlassBg: 'rgba(220, 238, 250, 0.88)',
      tabletopSurface: '#102638',
      particleRgb: '34, 211, 238',
    },
  },
  las: {
    roomId: 'las',
    sceneArtId: 'las',
    headerTitle: 'STASIUN LAS (ZONA K3)',
    departmentTag: 'INDUSTRIAL SAFETY & METALWORK WORKSHOP',
    moodCategory: 'industrial',
    wallDisplayKind: 'k3-safety-protocol',
    wallDisplayTitle: 'STANDAR KESELAMATAN KERJA (K3)',
    wallDisplayNodes: ['APD_LENGKAP', 'VENTILASI_AKTIF', 'AREA_AMAN'],
    deskPropKind: 'k3-checklist-gloves',
    theme: {
      bgPrimary: '#161920',
      bgSecondary: '#262b36',
      accentPrimary: '#FFB547',
      accentSecondary: '#38BDF8',
      glowColor: 'rgba(255, 181, 71, 0.42)',
      dialogGlassBg: 'rgba(236, 238, 242, 0.89)',
      tabletopSurface: '#222630',
      particleRgb: '255, 181, 71',
    },
  },
  'gudang-alat': {
    roomId: 'gudang-alat',
    sceneArtId: 'gudang',
    headerTitle: 'GUDANG ALAT DAN KOMPONEN',
    departmentTag: 'EQUIPMENT INVENTORY & LOGISTICS BAY',
    moodCategory: 'industrial',
    wallDisplayKind: 'inventory-matrix',
    wallDisplayTitle: 'MANAJEMEN INVENTARIS & LOGISTIK LAB',
    wallDisplayNodes: ['KATALOG_ALAT', 'KALIBRASI_OK', 'SIAP_PAKAI'],
    deskPropKind: 'barcode-scanner-log',
    theme: {
      bgPrimary: '#17191f',
      bgSecondary: '#2a2e38',
      accentPrimary: '#F59E0B',
      accentSecondary: '#38BDF8',
      glowColor: 'rgba(245, 158, 11, 0.38)',
      dialogGlassBg: 'rgba(240, 238, 232, 0.89)',
      tabletopSurface: '#252320',
      particleRgb: '251, 191, 36',
    },
  },
  'studio-desain': {
    roomId: 'studio-desain',
    sceneArtId: 'studio-desain',
    headerTitle: 'STUDIO DESAIN PRODUK & UI/UX',
    departmentTag: 'CREATIVE DIGITAL & CONCEPT STUDIO',
    moodCategory: 'creative',
    wallDisplayKind: 'creative-color-canvas',
    wallDisplayTitle: 'KANVAS KONSEP & SISTEM VISUAL',
    wallDisplayNodes: ['SKETSA_IDE', 'PROTOTIPE_3D', 'UJI_ANTARMUKA'],
    deskPropKind: 'stylus-pen-tablet',
    theme: {
      bgPrimary: '#141026',
      bgSecondary: '#281d46',
      accentPrimary: '#C084FC',
      accentSecondary: '#00E5FF',
      glowColor: 'rgba(192, 132, 252, 0.42)',
      dialogGlassBg: 'rgba(238, 232, 252, 0.89)',
      tabletopSurface: '#1d1635',
      particleRgb: '192, 132, 252',
    },
  },
  diskusi: {
    roomId: 'diskusi',
    sceneArtId: 'diskusi',
    headerTitle: 'MEJA DISKUSI KELOMPOK',
    departmentTag: 'COLLABORATIVE INNOVATION HUB',
    moodCategory: 'collaborative',
    wallDisplayKind: 'collab-sprint-board',
    wallDisplayTitle: 'PAPAN KOLABORASI & SINERGI TIM',
    wallDisplayNodes: ['GAGASAN_TIM', 'PEMBAGIAN_PERAN', 'EVALUASI'],
    deskPropKind: 'collab-notes-tablet',
    theme: {
      bgPrimary: '#081f24',
      bgSecondary: '#113a40',
      accentPrimary: '#34D399',
      accentSecondary: '#FFC96B',
      glowColor: 'rgba(52, 211, 153, 0.38)',
      dialogGlassBg: 'rgba(226, 245, 238, 0.89)',
      tabletopSurface: '#122e33',
      particleRgb: '52, 211, 153',
    },
  },
  konsultasi: {
    roomId: 'konsultasi',
    sceneArtId: 'ruang-bk',
    headerTitle: 'RUANG KONSULTASI',
    departmentTag: 'PROFESSIONAL COUNSELING & GUIDANCE SUITE',
    moodCategory: 'calm-warm',
    wallDisplayKind: 'counseling-harmony',
    wallDisplayTitle: 'RUANG DENGAR & PENDAMPINGAN AKADEMIK',
    wallDisplayNodes: ['HADIR_PENUH', 'RUANG_AMAN', 'SOLUSI_BERSAMA'],
    deskPropKind: 'counselor-journal-tea',
    theme: {
      bgPrimary: '#0b1c2c',
      bgSecondary: '#18344a',
      accentPrimary: '#FFC96B',
      accentSecondary: '#00E5FF',
      glowColor: 'rgba(255, 201, 107, 0.40)',
      dialogGlassBg: 'rgba(245, 242, 234, 0.90)',
      tabletopSurface: '#261e18',
      particleRgb: '255, 209, 122',
    },
  },
  'pojok-baca': {
    roomId: 'pojok-baca',
    sceneArtId: 'pojok-baca',
    headerTitle: 'POJOK BACA & RISET PUSTAKA',
    departmentTag: 'DIGITAL READING & LITERATURE LOUNGE',
    moodCategory: 'calm-warm',
    wallDisplayKind: 'digital-library-index',
    wallDisplayTitle: 'KATALOG LITERATUR & JURNAL RISET',
    wallDisplayNodes: ['REFERENSI', 'TINJAUAN_PUSTAKA', 'CATATAN_RISET'],
    deskPropKind: 'open-tome-bookmark',
    theme: {
      bgPrimary: '#1c1510',
      bgSecondary: '#33261d',
      accentPrimary: '#FBBF24',
      accentSecondary: '#34D399',
      glowColor: 'rgba(251, 191, 36, 0.38)',
      dialogGlassBg: 'rgba(248, 242, 230, 0.90)',
      tabletopSurface: '#2b2017',
      particleRgb: '251, 191, 36',
    },
  },
  istirahat: {
    roomId: 'istirahat',
    sceneArtId: 'istirahat',
    headerTitle: 'RUANG ISTIRAHAT MAHASISWA',
    departmentTag: 'RESTORATIVE STUDENT LOUNGE',
    moodCategory: 'calm-warm',
    wallDisplayKind: 'lounge-ambient-wave',
    wallDisplayTitle: 'ZONA PEMULIHAN ENERGI & RELAKSASI',
    wallDisplayNodes: ['JEDA_SEJENAK', 'HIDRASI', 'ENERGI_PULIH'],
    deskPropKind: 'warm-mug-coaster',
    theme: {
      bgPrimary: '#082022',
      bgSecondary: '#123b3e',
      accentPrimary: '#2DD4BF',
      accentSecondary: '#FFC96B',
      glowColor: 'rgba(45, 212, 191, 0.38)',
      dialogGlassBg: 'rgba(230, 246, 242, 0.89)',
      tabletopSurface: '#142c2e',
      particleRgb: '45, 212, 191',
    },
  },
  'ruang-dosen': {
    roomId: 'ruang-dosen',
    sceneArtId: 'ruang-dosen',
    headerTitle: 'RUANG DOSEN PEMBIMBING',
    departmentTag: 'ACADEMIC FACULTY & MENTORSHIP OFFICE',
    moodCategory: 'calm-warm',
    wallDisplayKind: 'academic-research-archive',
    wallDisplayTitle: 'ARSIP BIMBINGAN & KURIKULUM VOKASI',
    wallDisplayNodes: ['EVALUASI_STUDI', 'MENTORING', 'PENGEMBANGAN'],
    deskPropKind: 'academic-dossier-pen',
    theme: {
      bgPrimary: '#0c192c',
      bgSecondary: '#1a2f4c',
      accentPrimary: '#FFC96B',
      accentSecondary: '#38BDF8',
      glowColor: 'rgba(255, 201, 107, 0.38)',
      dialogGlassBg: 'rgba(238, 242, 248, 0.90)',
      tabletopSurface: '#231c18',
      particleRgb: '255, 201, 107',
    },
  },
};

/**
 * Menentukan konfigurasi visual ruangan aktif berdasarkan setting adegan ('lab' | 'ruang-konsultasi')
 * dan zona tempat mahasiswa berada (zoneId).
 * - Jika adegan berpindah ke 'ruang-konsultasi' (mis. setelah Walk Together), gunakan konfigurasi 'konsultasi'.
 * - Jika adegan di 'lab' dan zoneId valid, gunakan konfigurasi spesifik ke-11 ruangan tersebut.
 */
export function resolveRoomVisualConfig(input: {
  setting: StoryScene['setting'];
  zoneId: ZoneType | null | undefined;
}): RoomVisualConfig {
  if (input.setting === 'ruang-konsultasi') {
    return ROOM_VISUAL_CONFIGS.konsultasi;
  }
  if (input.zoneId && input.zoneId in ROOM_VISUAL_CONFIGS) {
    return ROOM_VISUAL_CONFIGS[input.zoneId];
  }
  return ROOM_VISUAL_CONFIGS.pemrograman;
}
