/**
 * Story_Graph penuh Tania Wijaya (mhs-03), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { TANIA_LAB_NODES } from './mhs-03.lab';
import { MHS03_BK_EKSPLORASI_NODES } from './mhs-03.bk-eksplorasi';
import { MHS_03_BK_PEMAHAMAN_NODES } from './mhs-03.bk-pemahaman';
import { TA_BK_RENCANA_NODES, TA_TENSION_FALLBACK_NODE_ID } from './mhs-03.bk-rencana';
import { MHS_03_LANJUTAN_NODES } from './mhs-03.lanjutan';

export const STORY_MHS_03: StoryGraph = {
  version: 1,
  studentId: 'mhs-03',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Tania',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Lab sedang ramai. Tania duduk di meja tim IoT, dikelilingi kertas jadwal yang penuh coretan.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ta-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan sebuah meja rendah.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'ta-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, lab sore terasa lengang. Tania terlihat di dekat papan pengumuman.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ta-f0',
    },
  ],
  startNodeId: 'ta-buka',
  closingNodeId: 'ta-f1',
  tensionFallbackNodeId: TA_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'ta-akhir-terbantu',
    'kemajuan-kecil': 'ta-akhir-kemajuan',
    'menarik-diri-sementara': 'ta-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...TANIA_LAB_NODES,
    ...MHS03_BK_EKSPLORASI_NODES,
    ...MHS_03_BK_PEMAHAMAN_NODES,
    ...TA_BK_RENCANA_NODES,
    ...MHS_03_LANJUTAN_NODES,
  ],
};
