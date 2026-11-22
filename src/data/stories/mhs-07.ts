/**
 * Story_Graph penuh Bima Mahendra (mhs-07), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { BIMA_LAB_NODES } from './mhs-07.lab';
import { BIMA_BK_EKSPLORASI_NODES } from './mhs-07.bk-eksplorasi';
import { BIMA_BK_PEMAHAMAN_NODES } from './mhs-07.bk-pemahaman';
import { BI_BK_RENCANA_NODES, BI_TENSION_FALLBACK_NODE_ID } from './mhs-07.bk-rencana';
import { BIMA_LANJUTAN_NODES } from './mhs-07.lanjutan';

export const STORY_MHS_07: StoryGraph = {
  version: 1,
  studentId: 'mhs-07',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Bima',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Bengkel Las',
      caption: 'Bau logam hangat dan percikan las memenuhi area kerja. Bima duduk di bangku, memutar helmnya.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'bi-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan rak buku di sudut.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'bi-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, helm las Bima tergantung di paku dinding, dan di sebelahnya ada sehelai surat yang ditempel.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'bi-f0',
    },
  ],
  startNodeId: 'bi-buka',
  closingNodeId: 'bi-f1',
  tensionFallbackNodeId: BI_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'bi-akhir-terbantu',
    'kemajuan-kecil': 'bi-akhir-kemajuan',
    'menarik-diri-sementara': 'bi-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...BIMA_LAB_NODES,
    ...BIMA_BK_EKSPLORASI_NODES,
    ...BIMA_BK_PEMAHAMAN_NODES,
    ...BI_BK_RENCANA_NODES,
    ...BIMA_LANJUTAN_NODES,
  ],
};
