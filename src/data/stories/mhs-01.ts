/**
 * Story_Graph penuh Raka Pratama (mhs-01), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { RAKA_LAB_NODES } from './mhs-01.lab';
import { MHS01_BK_EKSPLORASI_NODES } from './mhs-01.bk-eksplorasi';
import { MHS_01_BK_PEMAHAMAN_NODES } from './mhs-01.bk-pemahaman';
import { RA_BK_RENCANA_NODES, RA_TENSION_FALLBACK_NODE_ID } from './mhs-01.bk-rencana';
import { MHS_01_LANJUTAN_NODES } from './mhs-01.lanjutan';

export const STORY_MHS_01: StoryGraph = {
  version: 1,
  studentId: 'mhs-01',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Raka',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Lab sedang sibuk. Raka duduk di meja tim IoT, dikelilingi kertas daftar dan papan sirkuit.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ra-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan sebuah jam dinding di sudut.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'ra-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, papan jadwal tim di dinding lab tampak berbeda. Raka berdiri di depannya.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ra-f0',
    },
  ],
  startNodeId: 'ra-buka',
  closingNodeId: 'ra-f1',
  tensionFallbackNodeId: RA_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'ra-akhir-terbantu',
    'kemajuan-kecil': 'ra-akhir-kemajuan',
    'menarik-diri-sementara': 'ra-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...RAKA_LAB_NODES,
    ...MHS01_BK_EKSPLORASI_NODES,
    ...MHS_01_BK_PEMAHAMAN_NODES,
    ...RA_BK_RENCANA_NODES,
    ...MHS_01_LANJUTAN_NODES,
  ],
};
