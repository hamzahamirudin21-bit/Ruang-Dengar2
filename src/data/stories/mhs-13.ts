/**
 * Story_Graph penuh Nisa Nurhaliza (mhs-13), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { NISA_LAB_NODES } from './mhs-13.lab';
import { MHS13_BK_EKSPLORASI_NODES } from './mhs-13.bk-eksplorasi';
import { MHS_13_BK_PEMAHAMAN_NODES } from './mhs-13.bk-pemahaman';
import { NI_BK_RENCANA_NODES, NI_TENSION_FALLBACK_NODE_ID } from './mhs-13.bk-rencana';
import { MHS_13_LANJUTAN_NODES } from './mhs-13.lanjutan';

export const STORY_MHS_13: StoryGraph = {
  version: 1,
  studentId: 'mhs-13',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Nisa',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Lab ramai. Nisa duduk di meja rangkaian, dan teman-temannya silih berganti menghampirinya.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ni-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan segelas air putih di meja rendah.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'ni-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, meja diskusi lab terasa lebih santai. Nisa duduk di salah satu ujungnya.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ni-f0',
    },
  ],
  startNodeId: 'ni-buka',
  closingNodeId: 'ni-f1',
  tensionFallbackNodeId: NI_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'ni-akhir-terbantu',
    'kemajuan-kecil': 'ni-akhir-kemajuan',
    'menarik-diri-sementara': 'ni-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...NISA_LAB_NODES,
    ...MHS13_BK_EKSPLORASI_NODES,
    ...MHS_13_BK_PEMAHAMAN_NODES,
    ...NI_BK_RENCANA_NODES,
    ...MHS_13_LANJUTAN_NODES,
  ],
};
