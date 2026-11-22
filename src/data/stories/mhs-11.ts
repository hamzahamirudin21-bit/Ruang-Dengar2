/**
 * Story_Graph penuh Maya Puspita (mhs-11), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.3).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { MAYA_LAB_NODES } from './mhs-11.lab';
import { MAYA_BK_EKSPLORASI_NODES } from './mhs-11.bk-eksplorasi';
import { MAYA_BK_PEMAHAMAN_NODES } from './mhs-11.bk-pemahaman';
import { MA_BK_RENCANA_NODES, MA_TENSION_FALLBACK_NODE_ID } from './mhs-11.bk-rencana';
import { MAYA_LANJUTAN_NODES } from './mhs-11.lanjutan';

export const STORY_MHS_11: StoryGraph = {
  version: 1,
  studentId: 'mhs-11',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Maya',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Lab elektronik dan IoT terdengar ramai oleh bor dan solder. Maya duduk di pojok, memakai penutup telinga di depan grafik sensor.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ma-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang sunyi, dengan jendela tertutup tirai tipis dan dua kursi yang tidak saling berhadapan langsung.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'ma-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, di pojok lab dekat meja Maya, sebuah papan kecil berdiri dan jadwal baru tertempel di bawahnya.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'ma-f0',
    },
  ],
  startNodeId: 'ma-buka',
  closingNodeId: 'ma-f1',
  tensionFallbackNodeId: MA_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'ma-akhir-terbantu',
    'kemajuan-kecil': 'ma-akhir-kemajuan',
    'menarik-diri-sementara': 'ma-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...MAYA_LAB_NODES,
    ...MAYA_BK_EKSPLORASI_NODES,
    ...MAYA_BK_PEMAHAMAN_NODES,
    ...MA_BK_RENCANA_NODES,
    ...MAYA_LANJUTAN_NODES,
  ],
};
