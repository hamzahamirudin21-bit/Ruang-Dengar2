import type { CounselorSkillId, DisclosureLevel } from '../types';
import type {
  StoryAction, StoryChoice, StoryLine, StoryNode, StoryStage,
} from '../engine/story/storyTypes';

/** Keterampilan yang sesuai untuk tiap Tahap_Konseling (Requirement 8.3). */
export const STAGE_SKILLS: Record<StoryStage, readonly CounselorSkillId[]> = {
  hubungan: ['sapaan-hangat', 'jeda-hening', 'validasi-normalisasi', 'batas-kerahasiaan', 'afirmasi-kekuatan'],
  eksplorasi: ['pertanyaan-terbuka', 'sampaikan-pengamatan', 'jeda-hening', 'validasi-normalisasi'],
  pemahaman: ['refleksi-perasaan', 'parafrase-ringkasan', 'validasi-normalisasi', 'pertanyaan-terbuka'],
  rencana: ['afirmasi-kekuatan', 'parafrase-ringkasan', 'batas-kerahasiaan', 'validasi-normalisasi'],
};

/** Skill pedagogis terdekat untuk aksi non-skill (Requirement 8.1). */
export const ACTION_SKILL_MAP = {
  'akui-ketegangan': 'sampaikan-pengamatan',
  'akui-dampak': 'validasi-normalisasi',
  'minta-maaf': 'validasi-normalisasi',
  'eksplorasi-perasaan': 'pertanyaan-terbuka',
  'beri-pilihan': 'jeda-hening',
  'janji': 'afirmasi-kekuatan',
} as const satisfies Record<string, CounselorSkillId>;

export type NonSkillActionKey = keyof typeof ACTION_SKILL_MAP;

/** Kunci pemetaan untuk sebuah aksi; null untuk aksi skill biasa. */
export function actionKeyOf(action: StoryAction | undefined): NonSkillActionKey | null {
  if (!action || action.kind === 'skill') return null;
  if (action.kind === 'akui-ketegangan') return 'akui-ketegangan';
  if (action.kind === 'janji') return 'janji';
  return action.step;
}

export function skillForAction(action: StoryAction | undefined): CounselorSkillId | null {
  const key = actionKeyOf(action);
  return key ? ACTION_SKILL_MAP[key] : null;
}

const BEGINNER_MISTAKE_SKILLS: readonly CounselorSkillId[] = [
  'pertanyaan-tertutup', 'interogasi', 'nasihat-dini', 'meremehkan', 'janji-mutlak',
];

/** Opsi_Keliru_Pemula (Requirement 8.4, 8.5). */
export function isBeginnerMistake(choice: Pick<StoryChoice, 'skillId' | 'options'>): boolean {
  if (BEGINNER_MISTAKE_SKILLS.includes(choice.skillId)) return true;
  if (choice.skillId === 'sampaikan-pengamatan' && choice.options?.observationTone === 'menilai') return true;
  if (choice.skillId === 'refleksi-perasaan' && choice.options?.reflectionCorrectOverride === false) return true;
  return false;
}

export type OpeningChoiceId =
  'sapaan-hangat' | 'pertanyaan-terbuka' | 'pertanyaan-tertutup' | 'nasihat-dini';

export interface OpeningChoiceDef {
  id: OpeningChoiceId;
  skillId: CounselorSkillId;
  /** Ucapan Dosen; token {nama} diganti nama panggilan mahasiswa. */
  text: string;
}

/** Empat pilihan pembuka baku, identik untuk semua mahasiswa (Requirement 6.4). */
export const OPENING_CHOICES: readonly OpeningChoiceDef[] = [
  {
    id: 'sapaan-hangat',
    skillId: 'sapaan-hangat',
    text: 'Halo, {nama}, senang bisa ngobrol sama kamu. Gimana kabarmu hari ini?',
  },
  {
    id: 'pertanyaan-terbuka',
    skillId: 'pertanyaan-terbuka',
    text: '{nama}, boleh banget cerita, apa yang lagi ada di pikiranmu belakangan ini?',
  },
  {
    id: 'pertanyaan-tertutup',
    skillId: 'pertanyaan-tertutup',
    text: '{nama}, kamu baik-baik aja, kan? Nggak ada masalah apa-apa?',
  },
  {
    id: 'nasihat-dini',
    skillId: 'nasihat-dini',
    text: '{nama}, coba lebih berani dan banyak gaul aja. Itu pasti beresin semuanya.',
  },
];

export function fillOpeningText(text: string, name: string): string {
  return text.split('{nama}').join(name);
}

export interface BuildOpeningNodeParams {
  /** Id simpul awal. Default `${studentId}-buka`. */
  id?: string;
  studentId: string;
  sceneId: string;
  /** Nama panggilan untuk token {nama}. */
  name: string;
  /** Balasan pembuka khas mahasiswa. */
  reply: StoryLine;
  /** Simpul tujuan tiap pilihan pembuka. */
  next: Record<OpeningChoiceId, string>;
  /** Pilihan yang ditandai best (tepat satu). Default 'sapaan-hangat'. */
  best?: OpeningChoiceId;
  /** Reaksi khas mahasiswa per pilihan (opsional). */
  reactions?: Partial<Record<OpeningChoiceId, StoryLine>>;
  depth?: DisclosureLevel;
}

/** Membangun simpul pembuka: pilihan dan teks Dosen baku, isi mahasiswa dari penulis. */
export function buildOpeningNode(p: BuildOpeningNodeParams): StoryNode {
  const best = p.best ?? 'sapaan-hangat';
  return {
    id: p.id ?? `${p.studentId}-buka`,
    sceneId: p.sceneId,
    stage: 'hubungan',
    depth: p.depth ?? 0,
    reply: p.reply,
    choices: OPENING_CHOICES.map((c): StoryChoice => ({
      id: c.id,
      skillId: c.skillId,
      text: fillOpeningText(c.text, p.name),
      next: p.next[c.id],
      ...(c.id === best ? { best: true } : {}),
      ...(p.reactions?.[c.id] ? { reaction: p.reactions[c.id] } : {}),
    })),
  };
}
