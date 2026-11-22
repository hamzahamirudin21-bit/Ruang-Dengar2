/**
 * Story_Graph penuh Rani Safitri (mhs-14), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { RANI_LAB_NODES } from './mhs-14.lab';
import { MHS14_BK_EKSPLORASI_NODES } from './mhs-14.bk-eksplorasi';
import { MHS_14_BK_PEMAHAMAN_NODES } from './mhs-14.bk-pemahaman';
import { R_BK_RENCANA_NODES, R_TENSION_FALLBACK_NODE_ID } from './mhs-14.bk-rencana';
import { MHS_14_LANJUTAN_NODES } from './mhs-14.lanjutan';

export const STORY_MHS_14: StoryGraph = {
  version: 1,
  studentId: 'mhs-14',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Rani',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Lab sedang ramai. Rani duduk di meja pojok, mencatat sesuatu di bukunya.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'r-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan sebuah meja rendah.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'r-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, lab terasa lebih lengang. Rani terlihat di dekat Meja Diskusi.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'r-f0',
    },
  ],
  startNodeId: 'r-buka',
  closingNodeId: 'r-f1',
  tensionFallbackNodeId: R_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'r-akhir-terbantu',
    'kemajuan-kecil': 'r-akhir-kemajuan',
    'menarik-diri-sementara': 'r-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...RANI_LAB_NODES,
    ...MHS14_BK_EKSPLORASI_NODES,
    ...MHS_14_BK_PEMAHAMAN_NODES,
    ...R_BK_RENCANA_NODES,
    ...MHS_14_LANJUTAN_NODES,
  ],
};
