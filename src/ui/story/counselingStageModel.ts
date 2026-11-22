import {
  CONCEPT_THEORY,
  SKILL_THEORY,
  STAGE_THEORY,
  referenceByKey,
  type TheoryStageId,
} from '../../data/counselingTheory';
import type { StoryHistoryEntry } from '../../engine/story/runner';
import type { StoryNode, StoryStage } from '../../engine/story/storyTypes';

/**
 * Model pedagogis panggung konseling (modul murni, tanpa React/DOM).
 * Menjembatani simpul cerita aktif ke tahapan & kaidah teori konseling buku ajar
 * tanpa menampilkan variabel internal tersembunyi.
 */

export interface CounselingStageStep {
  id: StoryStage;
  stepNumber: 1 | 2 | 3 | 4;
  shortLabel: string;
  title: string;
  theoryRef: string;
  guidance: string;
}

export const COUNSELING_STAGE_STEPS: readonly CounselingStageStep[] = [
  {
    id: 'hubungan',
    stepNumber: 1,
    shortLabel: 'Rapport',
    title: 'Tahap 1 · Membangun Hubungan',
    theoryRef: 'Rogers (1957); Ivey dkk. (2023)',
    guidance:
      'Mulai dengan sapaan hangat (attending), terima tanpa menilai, sampaikan pengamatan faktual, dan jelaskan batas kerahasiaan.',
  },
  {
    id: 'eksplorasi',
    stepNumber: 2,
    shortLabel: 'Eksplorasi',
    title: 'Tahap 2 · Eksplorasi Masalah',
    theoryRef: 'Hill dkk. (2024); Miller & Rollnick (2023)',
    guidance:
      'Gunakan pertanyaan terbuka (OARS), refleksi, dan jeda hening agar mahasiswa leluasa bercerita tanpa merasa diinterogasi.',
  },
  {
    id: 'pemahaman',
    stepNumber: 3,
    shortLabel: 'Pemahaman',
    title: 'Tahap 3 · Pemahaman (Insight)',
    theoryRef: 'Hill dkk. (2024); Rogers (1957)',
    guidance:
      'Bantu mahasiswa memaknai perasaan dan pola bebannya lewat refleksi empatik, parafrase, serta validasi—hindari nasihat dini.',
  },
  {
    id: 'rencana',
    stepNumber: 4,
    shortLabel: 'Tindakan',
    title: 'Tahap 4 · Rencana Tindakan',
    theoryRef: 'Hill dkk. (2024); de Shazer dkk. (2007)',
    guidance:
      'Susun satu langkah kecil yang dipilih mahasiswa sendiri, beri afirmasi kekuatan, dan sepakati tindak lanjut yang realistis.',
  },
];

export interface ActiveCounselingGuidance {
  stage: StoryStage;
  stepIndex: number;
  theoryStageId: TheoryStageId;
  stageTitle: string;
  theoryLabel: string;
  citation: string;
  guidance: string;
  isRepairMode: boolean;
  isFollowUpScene: boolean;
}

export interface AppliedTechniqueFeedback {
  badge: string;
  title: string;
  theory: string;
  explanation: string;
  citations: string;
  tone: 'positif' | 'hati-hati' | 'penghambat' | 'perbaikan';
}

function formatCitations(keys: readonly string[]): string {
  return keys
    .map((k) => referenceByKey(k)?.cite ?? k)
    .filter(Boolean)
    .join('; ');
}

export function resolveActiveCounselingGuidance(
  node: Pick<StoryNode, 'stage' | 'tension'> | undefined,
  sceneId: string,
): ActiveCounselingGuidance {
  const stage: StoryStage = node?.stage ?? 'hubungan';
  const isRepairMode = Boolean(node?.tension);
  const isFollowUpScene = sceneId === 'lanjutan';

  const theoryStageId: TheoryStageId = isFollowUpScene
    ? 'lanjutan'
    : stage === 'hubungan'
      ? 'lab'
      : stage === 'eksplorasi'
        ? 'bk-eksplorasi'
        : stage === 'pemahaman'
          ? 'bk-pemahaman'
          : 'bk-rencana';

  const step =
    COUNSELING_STAGE_STEPS.find((s) => s.id === stage) ?? COUNSELING_STAGE_STEPS[0];

  if (isRepairMode) {
    const repairConcept = CONCEPT_THEORY['keretakan-perbaikan'];
    return {
      stage,
      stepIndex: step.stepNumber - 1,
      theoryStageId,
      stageTitle: 'Perbaikan Aliansi Konseling',
      theoryLabel: repairConcept.theory,
      citation: formatCitations(repairConcept.refs),
      guidance:
        'Terjadi ketegangan relasi. Akui dampak ucapanmu secara terbuka, minta maaf tulus, gali perasaan mahasiswa, lalu kembalikan kendali pilihan kepadanya.',
      isRepairMode: true,
      isFollowUpScene,
    };
  }

  const stageNote = STAGE_THEORY[theoryStageId];
  return {
    stage,
    stepIndex: step.stepNumber - 1,
    theoryStageId,
    stageTitle: isFollowUpScene ? 'Tahap 5 · Evaluasi & Tindak Lanjut' : step.title,
    theoryLabel: stageNote.theory,
    citation: formatCitations(stageNote.refs),
    guidance: isFollowUpScene ? stageNote.explanation : step.guidance,
    isRepairMode: false,
    isFollowUpScene,
  };
}

/**
 * Mengubah giliran konselor terakhir menjadi umpan balik kaidah teori konseling.
 * Mengembalikan null pada pembuka sesi (turn 0 / belum ada pilihan konselor).
 */
export function describeAppliedTechnique(
  entry: Pick<StoryHistoryEntry, 'turn' | 'skillId' | 'tension'> | undefined,
): AppliedTechniqueFeedback | null {
  if (!entry || entry.turn === 0) return null;

  if (entry.tension === 'diakui' || entry.tension === 'pulih') {
    const c = CONCEPT_THEORY['keretakan-perbaikan'];
    return {
      badge: entry.tension === 'pulih' ? 'Aliansi Pulih' : 'Ketegangan Diakui',
      title: c.title,
      theory: c.theory,
      explanation: c.explanation,
      citations: formatCitations(c.refs),
      tone: 'perbaikan',
    };
  }

  if (!entry.skillId) return null;
  const note = SKILL_THEORY[entry.skillId];
  if (!note) return null;

  const citations = formatCitations(note.refs);
  if (note.hindering) {
    return {
      badge: 'Penghambat Komunikasi',
      title: note.title,
      theory: note.theory,
      explanation: note.explanation,
      citations,
      tone: 'penghambat',
    };
  }

  if (entry.skillId === 'pertanyaan-tertutup') {
    return {
      badge: 'Perlu Hati-hati',
      title: note.title,
      theory: note.theory,
      explanation: note.explanation,
      citations,
      tone: 'hati-hati',
    };
  }

  return {
    badge: 'Teknik Konseling Tepat',
    title: note.title,
    theory: note.theory,
    explanation: note.explanation,
    citations,
    tone: 'positif',
  };
}
