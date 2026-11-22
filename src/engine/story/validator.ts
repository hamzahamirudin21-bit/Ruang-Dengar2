import type {
  StoryGraph, StoryLine, StoryValidationError, StoryValidationOptions,
} from './storyTypes';
import { validateGraphStructure } from './validatorGraph';
import { validateStoryContent } from './validatorContent';

/**
 * Story_Validator (fungsi murni). Menggabungkan aturan struktur (validatorGraph)
 * dan aturan konten (validatorContent), serta aturan lintas graf (kohort).
 */

/** Gabungan aturan struktur lalu konten; urutan deterministik. */
export function validateStoryGraph(
  graph: StoryGraph,
  opts: StoryValidationOptions = {},
): StoryValidationError[] {
  return [...validateGraphStructure(graph, opts), ...validateStoryContent(graph)];
}

const MIN_UNIQUE_FULL = 0.9;
const MIN_UNIQUE_EARLY = 0.25;

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Himpunan balasan mahasiswa ternormalisasi (reply.text, reply.aside,
 * reaction.text, reaction.aside), tanpa adegan pembuka: simpul awal dan
 * reaksi pada pilihan simpul awal dilewati.
 */
export function collectStudentReplies(graph: StoryGraph): Set<string> {
  const out = new Set<string>();
  const add = (line: StoryLine | undefined): void => {
    if (!line) return;
    for (const t of [line.text, line.aside]) {
      if (typeof t !== 'string') continue;
      const n = normalize(t);
      if (n) out.add(n);
    }
  };
  for (const node of graph.nodes) {
    if (node.id !== graph.startNodeId) add(node.reply);
    const isStart = node.id === graph.startNodeId;
    for (const c of node.choices) {
      if (!isStart) add(c.reaction);
    }
  }
  return out;
}

/** Aturan balasan-sama-antar-mahasiswa untuk seluruh pasangan graf. */
export function validateStoryCohort(graphs: readonly StoryGraph[]): StoryValidationError[] {
  const errors: StoryValidationError[] = [];
  const sets = graphs.map(collectStudentReplies);
  for (let i = 0; i < graphs.length; i++) {
    for (let j = i + 1; j < graphs.length; j++) {
      const a = graphs[i];
      const b = graphs[j];
      const sa = sets[i];
      const sb = sets[j];
      const denom = Math.min(sa.size, sb.size);
      if (denom === 0) continue;
      let shared = 0;
      for (const t of sa) if (sb.has(t)) shared++;
      const ratio = 1 - shared / denom;
      const min = a.kind === 'penuh' && b.kind === 'penuh' ? MIN_UNIQUE_FULL : MIN_UNIQUE_EARLY;
      if (ratio < min) {
        errors.push({
          studentId: a.studentId,
          nodeId: null,
          rule: 'balasan-sama-antar-mahasiswa',
          message:
            `Balasan "${a.studentId}" dan "${b.studentId}" terlalu mirip: rasio unik ` +
            `${ratio.toFixed(2)} < ${min.toFixed(2)} (${shared} dari ${denom} balasan sama).`,
        });
      }
    }
  }
  return errors;
}
