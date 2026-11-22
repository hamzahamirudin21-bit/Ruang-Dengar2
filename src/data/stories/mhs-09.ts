/**
 * Story_Graph penuh Gilang Ramadhan (mhs-09), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { GILANG_LAB_NODES } from './mhs-09.lab';
import { MHS09_BK_EKSPLORASI_NODES } from './mhs-09.bk-eksplorasi';
import { MHS_09_BK_PEMAHAMAN_NODES } from './mhs-09.bk-pemahaman';
import { GI_BK_RENCANA_NODES, GI_TENSION_FALLBACK_NODE_ID } from './mhs-09.bk-rencana';
import { MHS_09_LANJUTAN_NODES } from './mhs-09.lanjutan';

export const STORY_MHS_09: StoryGraph = {
  version: 1,
  studentId: 'mhs-09',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Gilang',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Bengkel Fabrikasi',
      caption: 'Bengkel berbau logam hangat. Gilang berdiri di meja las, mengikir sambungan di benda kerjanya.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'gi-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan sebuah jendela sempit ke arah lorong.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'gi-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, meja las di sudut bengkel tampak lebih rapi. Gilang berdiri di sebelahnya.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'gi-f0',
    },
  ],
  startNodeId: 'gi-buka',
  closingNodeId: 'gi-f1',
  tensionFallbackNodeId: GI_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'gi-akhir-terbantu',
    'kemajuan-kecil': 'gi-akhir-kemajuan',
    'menarik-diri-sementara': 'gi-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...GILANG_LAB_NODES,
    ...MHS09_BK_EKSPLORASI_NODES,
    ...MHS_09_BK_PEMAHAMAN_NODES,
    ...GI_BK_RENCANA_NODES,
    ...MHS_09_LANJUTAN_NODES,
  ],
};
