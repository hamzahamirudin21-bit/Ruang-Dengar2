/**
 * Story_Graph penuh Ayu Permata (mhs-05), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { AYU_LAB_NODES } from './mhs-05.lab';
import { AYU_BK_EKSPLORASI_NODES } from './mhs-05.bk-eksplorasi';
import { AYU_BK_PEMAHAMAN_NODES } from './mhs-05.bk-pemahaman';
import { AYU_BK_RENCANA_NODES, AY_TENSION_FALLBACK_NODE_ID } from './mhs-05.bk-rencana';
import { AYU_LANJUTAN_NODES } from './mhs-05.lanjutan';

export const STORY_MHS_05: StoryGraph = {
  version: 1,
  studentId: 'mhs-05',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Ayu',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Lab firmware terdengar ramai. Ayu duduk di depan monitor telemetri dengan buku catatan penuh coretan.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ay-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan sebuah jam dinding di sudut.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'ay-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, Ayu menunggu di meja firmware dengan laptop terbuka dan senyum yang ditahan.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ay-f0',
    },
  ],
  startNodeId: 'ay-buka',
  closingNodeId: 'ay-f1',
  tensionFallbackNodeId: AY_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'ay-akhir-terbantu',
    'kemajuan-kecil': 'ay-akhir-kemajuan',
    'menarik-diri-sementara': 'ay-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...AYU_LAB_NODES,
    ...AYU_BK_EKSPLORASI_NODES,
    ...AYU_BK_PEMAHAMAN_NODES,
    ...AYU_BK_RENCANA_NODES,
    ...AYU_LANJUTAN_NODES,
  ],
};
