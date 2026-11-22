/**
 * Pemilih 3 pilihan tampil (vn-lean-upgrade, design.md bagian B).
 * Murni: tanpa react, document, atau window. Tidak pernah melempar galat.
 *
 * Himpunan hasil hanya bergantung pada simpul (urutan penulisan), sedangkan
 * urutan tampil mengikuti daftar masukan (hasil `presentChoices`).
 */
import type { StoryChoice, StoryNode } from '../../engine/story/storyTypes';
import type { CounselorSkillId, RepairStepId } from '../../types';
import { COUNSELOR_SKILLS } from '../../data/skillEffects';

export const MAX_PRESENTED = 3;

const HINDERING_SKILLS: ReadonlySet<CounselorSkillId> = new Set(
  COUNSELOR_SKILLS.filter((s) => s.category === 'penghambat').map((s) => s.id),
);

/** Langkah perbaikan inti; `beri-pilihan` memulihkan keretakan bila diterapkan setelah salah satunya. */
const CORE_REPAIR_STEPS: ReadonlySet<RepairStepId> = new Set<RepairStepId>([
  'akui-dampak', 'minta-maaf', 'eksplorasi-perasaan',
]);

function repairStep(choice: StoryChoice): RepairStepId | null {
  return choice.action?.kind === 'perbaikan' ? choice.action.step : null;
}

/** Pilihan yang mengurus ketegangan (akui atau langkah perbaikan). */
function handlesTension(choice: StoryChoice): boolean {
  const kind = choice.action?.kind;
  return kind === 'akui-ketegangan' || kind === 'perbaikan';
}

export function pickPresentedChoices(
  presented: readonly StoryChoice[],
  node: StoryNode | undefined,
): StoryChoice[] {
  if (presented.length <= MAX_PRESENTED) return presented.slice();

  // Kumpulan kandidat dalam urutan penulisan simpul; objek lengkap dari simpul menurut id.
  const shownIds = new Set(presented.map((c) => c.id));
  const fromNode = node ? node.choices.filter((c) => shownIds.has(c.id)) : [];
  const nodeIds = new Set(fromNode.map((c) => c.id));
  const pool = [...fromNode, ...presented.filter((c) => !nodeIds.has(c.id))];

  const picked = new Set<string>();
  const take = (c: StoryChoice | undefined) => {
    if (c && picked.size < MAX_PRESENTED) picked.add(c.id);
  };
  const firstFree = (pred: (c: StoryChoice) => boolean) =>
    pool.find((c) => !picked.has(c.id) && pred(c));

  // 3. Best_Choice
  take(pool.find((c) => c.best === true));

  // 4. Repair_Hub: satu langkah inti dan `beri-pilihan` bila simpul memilikinya.
  if (node?.tension?.phase === 'perbaikan') {
    const isCore = (c: StoryChoice) => {
      const step = repairStep(c);
      return step !== null && CORE_REPAIR_STEPS.has(step);
    };
    if (!pool.some((c) => picked.has(c.id) && isCore(c))) take(firstFree(isCore));
    if (!pool.some((c) => picked.has(c.id) && repairStep(c) === 'beri-pilihan')) {
      take(firstFree((c) => repairStep(c) === 'beri-pilihan'));
    }
  }

  // 5. Satu Hindering_Choice bila slot masih ada.
  const hindering = firstFree((c) => HINDERING_SKILLS.has(c.skillId))
    ?? (node?.tension ? firstFree((c) => c.best !== true && !handlesTension(c)) : undefined);
  take(hindering);

  // 6. Sisa slot: pilihan pertama menurut urutan penulisan.
  for (const c of pool) take(c);

  // 7. Urutan relatif masukan dipertahankan.
  return presented.filter((c) => picked.has(c.id));
}
