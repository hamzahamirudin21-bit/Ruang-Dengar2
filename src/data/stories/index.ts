/**
 * Registri Story_Graph per mahasiswa (Requirement 4.2, 4.7, 11.3).
 * Graf penuh (authored) dipakai bila ada; selain itu Cerita_Tahap_Awal dari ./fallback.
 * Murni dan deterministik; hasil di-cache agar identitas objek stabil.
 */
import type { StoryGraph } from '../../engine/story/storyTypes';
import { STUDENT_BLUEPRINTS } from '../agents.seed';
import { agentFromBlueprint, buildFallbackStory } from './fallback';
import { STORY_MHS_01 } from './mhs-01';
import { STORY_MHS_02 } from './mhs-02';
import { STORY_MHS_03 } from './mhs-03';
import { STORY_MHS_04 } from './mhs-04';
import { STORY_MHS_05 } from './mhs-05';
import { STORY_MHS_06 } from './mhs-06';
import { STORY_MHS_07 } from './mhs-07';
import { STORY_MHS_08 } from './mhs-08';
import { STORY_MHS_09 } from './mhs-09';
import { STORY_MHS_10 } from './mhs-10';
import { STORY_MHS_11 } from './mhs-11';
import { STORY_MHS_13 } from './mhs-13';
import { STORY_MHS_15 } from './mhs-15';
import { STORY_MHS_12 } from './mhs-12';
import { STORY_MHS_14 } from './mhs-14';

/** Graf cerita penuh per studentId (pilot: mhs-14 dan mhs-12). */
export const AUTHORED_STORIES: Record<string, StoryGraph> = {
  'mhs-01': STORY_MHS_01,
  'mhs-02': STORY_MHS_02,
  'mhs-03': STORY_MHS_03,
  'mhs-04': STORY_MHS_04,
  'mhs-05': STORY_MHS_05,
  'mhs-06': STORY_MHS_06,
  'mhs-07': STORY_MHS_07,
  'mhs-08': STORY_MHS_08,
  'mhs-09': STORY_MHS_09,
  'mhs-10': STORY_MHS_10,
  'mhs-11': STORY_MHS_11,
  'mhs-13': STORY_MHS_13,
  'mhs-15': STORY_MHS_15,
  'mhs-14': STORY_MHS_14,
  'mhs-12': STORY_MHS_12,
};

const cache = new Map<string, StoryGraph>();

function resolveStory(studentId: string): StoryGraph | undefined {
  const authored = Object.prototype.hasOwnProperty.call(AUTHORED_STORIES, studentId)
    ? AUTHORED_STORIES[studentId]
    : undefined;
  if (authored) return authored;
  const bp = STUDENT_BLUEPRINTS.find((b) => b.id === studentId);
  return bp ? buildFallbackStory(agentFromBlueprint(bp)) : undefined;
}

/** Graf cerita untuk satu mahasiswa; undefined bila id tidak dikenal. */
export function getStoryGraph(studentId: string): StoryGraph | undefined {
  const hit = cache.get(studentId);
  if (hit) return hit;
  const graph = resolveStory(studentId);
  if (graph) cache.set(studentId, graph);
  return graph;
}

/** Satu graf untuk setiap STUDENT_BLUEPRINTS, berurutan sesuai blueprint. */
export const STORY_GRAPHS: Record<string, StoryGraph> = Object.fromEntries(
  STUDENT_BLUEPRINTS.map((bp) => [bp.id, getStoryGraph(bp.id) as StoryGraph]),
);

/** Seluruh graf sesuai urutan blueprint. */
export function listStoryGraphs(): StoryGraph[] {
  return STUDENT_BLUEPRINTS.map((bp) => getStoryGraph(bp.id) as StoryGraph);
}

/** True bila mahasiswa memakai Cerita_Tahap_Awal (bukan graf penuh). */
export function isPlaceholderStory(studentId: string): boolean {
  return getStoryGraph(studentId)?.placeholder === true;
}
