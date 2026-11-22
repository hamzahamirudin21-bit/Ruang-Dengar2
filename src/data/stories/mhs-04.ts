/**
 * Story_Graph penuh Kevin Gunawan (mhs-04), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { KEVIN_LAB_NODES } from './mhs-04.lab';
import { MHS04_BK_EKSPLORASI_NODES } from './mhs-04.bk-eksplorasi';
import { MHS_04_BK_PEMAHAMAN_NODES } from './mhs-04.bk-pemahaman';
import { KE_BK_RENCANA_NODES, KE_TENSION_FALLBACK_NODE_ID } from './mhs-04.bk-rencana';
import { MHS_04_LANJUTAN_NODES } from './mhs-04.lanjutan';

export const STORY_MHS_04: StoryGraph = {
  version: 1,
  studentId: 'mhs-04',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Kevin',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Zona pemrograman sedang ramai. Kevin duduk di depan layar penuh komentar review.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ke-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan sebuah meja rendah.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'ke-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, zona pemrograman terasa lebih lengang. Kevin terlihat di dekat rekan timnya.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ke-f0',
    },
  ],
  startNodeId: 'ke-buka',
  closingNodeId: 'ke-f1',
  tensionFallbackNodeId: KE_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'ke-akhir-terbantu',
    'kemajuan-kecil': 'ke-akhir-kemajuan',
    'menarik-diri-sementara': 'ke-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...KEVIN_LAB_NODES,
    ...MHS04_BK_EKSPLORASI_NODES,
    ...MHS_04_BK_PEMAHAMAN_NODES,
    ...KE_BK_RENCANA_NODES,
    ...MHS_04_LANJUTAN_NODES,
  ],
};
