/**
 * Story_Graph penuh Teguh Santosa (mhs-10), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { TEGUH_LAB_NODES } from './mhs-10.lab';
import { MHS10_BK_EKSPLORASI_NODES } from './mhs-10.bk-eksplorasi';
import { MHS_10_BK_PEMAHAMAN_NODES } from './mhs-10.bk-pemahaman';
import { TE_BK_RENCANA_NODES, TE_TENSION_FALLBACK_NODE_ID } from './mhs-10.bk-rencana';
import { MHS_10_LANJUTAN_NODES } from './mhs-10.lanjutan';

export const STORY_MHS_10: StoryGraph = {
  version: 1,
  studentId: 'mhs-10',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Teguh',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Gudang Alat',
      caption: 'Gudang alat di sudut lab terasa sunyi. Teguh duduk di antara rak logam, menyetel alat ukur satu per satu.',
      witnessCount: 1,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'te-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan sebuah meja kecil di tengahnya.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'te-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, pintu gudang alat tampak berbeda. Teguh berdiri di ambangnya.',
      witnessCount: 0,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'te-f0',
    },
  ],
  startNodeId: 'te-buka',
  closingNodeId: 'te-f1',
  tensionFallbackNodeId: TE_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'te-akhir-terbantu',
    'kemajuan-kecil': 'te-akhir-kemajuan',
    'menarik-diri-sementara': 'te-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...TEGUH_LAB_NODES,
    ...MHS10_BK_EKSPLORASI_NODES,
    ...MHS_10_BK_PEMAHAMAN_NODES,
    ...TE_BK_RENCANA_NODES,
    ...MHS_10_LANJUTAN_NODES,
  ],
};
