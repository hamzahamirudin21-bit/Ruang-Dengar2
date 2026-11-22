/**
 * Story_Graph penuh Mita Rahmawati (mhs-06), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { MITA_LAB_NODES } from './mhs-06.lab';
import { MITA_BK_EKSPLORASI_NODES } from './mhs-06.bk-eksplorasi';
import { MITA_BK_PEMAHAMAN_NODES } from './mhs-06.bk-pemahaman';
import { MITA_BK_RENCANA_NODES, MI_TENSION_FALLBACK_NODE_ID } from './mhs-06.bk-rencana';
import { MITA_LANJUTAN_NODES } from './mhs-06.lanjutan';

export const STORY_MHS_06: StoryGraph = {
  version: 1,
  studentId: 'mhs-06',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Mita',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Lab praktikum mikrokontroler terdengar ramai. Mita duduk di ujung meja dengan papan rangkaian dan buku catatan kecil.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'mi-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan sebuah jam dinding di sudut.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'mi-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, Mita menunggu di meja praktikum dengan bundel catatan terbuka di depannya.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'mi-f0',
    },
  ],
  startNodeId: 'mi-buka',
  closingNodeId: 'mi-f1',
  tensionFallbackNodeId: MI_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'mi-akhir-terbantu',
    'kemajuan-kecil': 'mi-akhir-kemajuan',
    'menarik-diri-sementara': 'mi-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...MITA_LAB_NODES,
    ...MITA_BK_EKSPLORASI_NODES,
    ...MITA_BK_PEMAHAMAN_NODES,
    ...MITA_BK_RENCANA_NODES,
    ...MITA_LANJUTAN_NODES,
  ],
};
