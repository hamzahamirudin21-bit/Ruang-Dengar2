/**
 * Pemindai murni untuk kondisi bug "balasan mahasiswa tidak nyambung"
 * (spec story-reply-coherence). Tidak mengimpor apa pun dari src/engine selain tipe.
 */
import type { StoryChoice, StoryGraph, StoryNode } from '../../engine/story/storyTypes';

/** Keterampilan yang menuntut jawaban langsung dari mahasiswa. */
export const QUESTION_SKILLS: ReadonlySet<string> = new Set([
  'pertanyaan-terbuka',
  'pertanyaan-tertutup',
  'parafrase-ringkasan',
  'refleksi-perasaan',
  'sampaikan-pengamatan',
]);

export function findNode(graph: StoryGraph, id: string): StoryNode | undefined {
  return graph.nodes.find((n) => n.id === id);
}

/** Spesifikasi formal isBugCondition dari design.md. */
export function isBugCondition(choice: StoryChoice, _node: StoryNode, graph: StoryGraph): boolean {
  const target = findNode(graph, choice.next);
  const kind = choice.action?.kind;
  const isRepair = kind === 'akui-ketegangan' || kind === 'perbaikan' || target?.tension !== undefined;
  const isTerminal = choice.next === '@ending' || choice.next === '@resume' || target === undefined;
  if (isRepair || isTerminal) return false;
  if (choice.reaction) return false;

  const isQuestion = QUESTION_SKILLS.has(choice.skillId);
  const isShared = graph.nodes.some((n) =>
    n.choices.some((c2) => c2 !== choice && c2.next === choice.next && c2.skillId !== choice.skillId),
  );
  return isQuestion || isShared;
}

export interface BugChoiceRef {
  studentId: string;
  nodeId: string;
  choiceId: string;
}

/** Semua pilihan berkondisi bug dalam satu graf. */
export function scanBugChoices(graph: StoryGraph): BugChoiceRef[] {
  const out: BugChoiceRef[] = [];
  for (const node of graph.nodes) {
    for (const choice of node.choices) {
      if (isBugCondition(choice, node, graph)) {
        out.push({ studentId: graph.studentId, nodeId: node.id, choiceId: choice.id });
      }
    }
  }
  return out;
}
