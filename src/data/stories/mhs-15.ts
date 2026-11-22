/**
 * Story_Graph penuh Naufal Hakim (mhs-15), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { NAUFAL_LAB_NODES } from './mhs-15.lab';
import { MHS15_BK_EKSPLORASI_NODES } from './mhs-15.bk-eksplorasi';
import { MHS_15_BK_PEMAHAMAN_NODES } from './mhs-15.bk-pemahaman';
import { NA_BK_RENCANA_NODES, NA_TENSION_FALLBACK_NODE_ID } from './mhs-15.bk-rencana';
import { MHS_15_LANJUTAN_NODES } from './mhs-15.lanjutan';

export const STORY_MHS_15: StoryGraph = {
  version: 1,
  studentId: 'mhs-15',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Naufal',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Di sudut lab dekat printer 3D, Naufal duduk memeluk laptop sambil menggulung filamen.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'na-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang sunyi, dengan dua kursi berhadapan dan sebuah meja rendah.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'na-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, Naufal duduk di meja printer 3D dengan dokumen kelompok terbuka di layarnya.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'na-f0',
    },
  ],
  startNodeId: 'na-buka',
  closingNodeId: 'na-f1',
  tensionFallbackNodeId: NA_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'na-akhir-terbantu',
    'kemajuan-kecil': 'na-akhir-kemajuan',
    'menarik-diri-sementara': 'na-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...NAUFAL_LAB_NODES,
    ...MHS15_BK_EKSPLORASI_NODES,
    ...MHS_15_BK_PEMAHAMAN_NODES,
    ...NA_BK_RENCANA_NODES,
    ...MHS_15_LANJUTAN_NODES,
  ],
};
