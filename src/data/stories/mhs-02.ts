/**
 * Story_Graph penuh Dimas Aditya (mhs-02), dirakit dari modul per adegan
 * (Requirement 4.2, 4.6, 11.1).
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { DIMAS_LAB_NODES } from './mhs-02.lab';
import { MHS02_BK_EKSPLORASI_NODES } from './mhs-02.bk-eksplorasi';
import { MHS_02_BK_PEMAHAMAN_NODES } from './mhs-02.bk-pemahaman';
import { DI_BK_RENCANA_NODES, DI_TENSION_FALLBACK_NODE_ID } from './mhs-02.bk-rencana';
import { MHS_02_LANJUTAN_NODES } from './mhs-02.lanjutan';

export const STORY_MHS_02: StoryGraph = {
  version: 1,
  studentId: 'mhs-02',
  kind: 'penuh',
  placeholder: false,
  title: 'Percakapan dengan Dimas',
  scenes: [
    {
      id: 'lab',
      setting: 'lab',
      title: 'Di Lab',
      caption: 'Lab elektronika sedang ramai. Dimas membungkuk di meja solder, matanya menempel pada mikroskop.',
      witnessCount: 2,
      maxDialogueLevel: 1,
      entryTransition: 'potong-adegan',
      entryNodeId: 'di-buka',
    },
    {
      id: 'bk',
      setting: 'ruang-konsultasi',
      title: 'Ruang Konsultasi',
      caption: 'Ruangan kecil yang tenang, dengan dua kursi berhadapan dan sebuah meja rendah.',
      witnessCount: 0,
      maxDialogueLevel: 3,
      entryTransition: 'jalan-berdua',
      entryNodeId: 'di-b0',
    },
    {
      id: 'lanjutan',
      setting: 'lab',
      title: 'Beberapa Hari Kemudian',
      caption: 'Beberapa hari kemudian, lab sore terasa lengang. Dimas kembali di meja solder yang sama.',
      witnessCount: 1,
      maxDialogueLevel: 2,
      entryTransition: 'potong-adegan',
      entryNodeId: 'di-f0',
    },
  ],
  startNodeId: 'di-buka',
  closingNodeId: 'di-f1',
  tensionFallbackNodeId: DI_TENSION_FALLBACK_NODE_ID,
  endings: {
    'terbantu': 'di-akhir-terbantu',
    'kemajuan-kecil': 'di-akhir-kemajuan',
    'menarik-diri-sementara': 'di-akhir-menarik',
  },
  outcomeRules: {
    helpedMinQuality: 66,
    helpedMinLevel: 2,
    requiredFlags: ['momen-terbuka', 'langkah-kecil'],
    planFlag: 'langkah-kecil',
  },
  nodes: [
    ...DIMAS_LAB_NODES,
    ...MHS02_BK_EKSPLORASI_NODES,
    ...MHS_02_BK_PEMAHAMAN_NODES,
    ...DI_BK_RENCANA_NODES,
    ...MHS_02_LANJUTAN_NODES,
  ],
};
