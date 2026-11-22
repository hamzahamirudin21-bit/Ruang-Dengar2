/**
 * Story_Graph pilot Sari Melati (mhs-12): perakitan adegan Lab, Ruang BK, dan lanjutan
 * (Requirement 4.2, 4.6, 11.1). Data murni; kalibrasi gerbang dan ambang ada di tugas 13.7.
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { SARI_LAB_NODES } from './mhs-12.lab';
import { MHS12_BK_EKSPLORASI_NODES } from './mhs-12.bk-eksplorasi';
import { MHS_12_BK_PEMAHAMAN_NODES } from './mhs-12.bk-pemahaman';
import { S_BK_RENCANA_NODES, S_TENSION_FALLBACK_NODE_ID } from './mhs-12.bk-rencana';
import { MHS_12_LANJUTAN_NODES } from './mhs-12.lanjutan';

export const STORY_MHS_12: StoryGraph = {
  version: 1,
  studentId: 'mhs-12',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Sari',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Meja Diskusi',
      caption: 'Meja Diskusi sedang ramai. Sari duduk di tengah, memutar pulpen sambil menengahi dua temannya.',
      witnessCount: 3,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 's-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang BK',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan jendela yang menghadap taman.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 's-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Seminggu Kemudian',
      caption: 'Seminggu kemudian, Meja Diskusi masih ramai, tetapi ritmenya terasa sedikit berbeda.',
      witnessCount: 2,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 's-f0',
    },
  ],
  startNodeId: 's-buka',
  followUpNodeId: 's-f0',
  closingNodeId: 's-f1',
  tensionFallbackNodeId: S_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 's-akhir-terbantu',
    'kemajuan-kecil': 's-akhir-kemajuan',
    'menarik-diri-sementara': 's-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 70,
    helpedMinLevel: 2,
    requiredFlags: ['pengamatan-peran', 'momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...SARI_LAB_NODES,
    ...MHS12_BK_EKSPLORASI_NODES,
    ...MHS_12_BK_PEMAHAMAN_NODES,
    ...S_BK_RENCANA_NODES,
    ...MHS_12_LANJUTAN_NODES,
  ],
};
