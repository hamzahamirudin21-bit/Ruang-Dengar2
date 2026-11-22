/**
 * Story_Graph penuh Hendra Wijaya (mhs-08), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { HENDRA_LAB_NODES } from './mhs-08.lab';
import { HENDRA_BK_EKSPLORASI_NODES } from './mhs-08.bk-eksplorasi';
import { HENDRA_BK_PEMAHAMAN_NODES } from './mhs-08.bk-pemahaman';
import { HE_BK_RENCANA_NODES, HE_TENSION_FALLBACK_NODE_ID } from './mhs-08.bk-rencana';
import { HENDRA_LANJUTAN_NODES } from './mhs-08.lanjutan';

export const STORY_MHS_08: StoryGraph = {
  version: 1,
  studentId: 'mhs-08',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Hendra',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Di sudut cetak 3D, Hendra dikelilingi printer yang berdengung dan temannya yang bergantian memanggil.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'he-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan sebuah jam dinding di sudut.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'he-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, meja printer 3D terlihat lebih lapang. Hendra berdiri di dekatnya.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'he-f0',
    },
  ],
  startNodeId: 'he-buka',
  closingNodeId: 'he-f1',
  tensionFallbackNodeId: HE_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'he-akhir-terbantu',
    'kemajuan-kecil': 'he-akhir-kemajuan',
    'menarik-diri-sementara': 'he-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...HENDRA_LAB_NODES,
    ...HENDRA_BK_EKSPLORASI_NODES,
    ...HENDRA_BK_PEMAHAMAN_NODES,
    ...HE_BK_RENCANA_NODES,
    ...HENDRA_LANJUTAN_NODES,
  ],
};
