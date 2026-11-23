import type { StoryGraph } from '../../engine/story/storyTypes';
import { buildCompactStoryGraph } from './builder';
import { COMPACT_SCRIPTS_A } from './dataA';
import { COMPACT_SCRIPTS_B } from './dataB';

/**
 * Registri 15 graf cerita ringkas (tepat 7 giliran, 100% koheren per pilihan)
 * yang dipakai pada gameplay interaktif RUANG DENGAR.
 */
const ALL_SCRIPTS = [...COMPACT_SCRIPTS_A, ...COMPACT_SCRIPTS_B];

export const COMPACT_STORY_GRAPHS: Readonly<Record<string, StoryGraph>> = Object.fromEntries(
  ALL_SCRIPTS.map((script) => [script.studentId, buildCompactStoryGraph(script)]),
);

export function getCompactStoryGraph(studentId: string): StoryGraph | undefined {
  return COMPACT_STORY_GRAPHS[studentId];
}
