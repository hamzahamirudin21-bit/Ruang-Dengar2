import test from 'node:test';
import assert from 'node:assert/strict';
import { STORY_GRAPHS, AUTHORED_STORIES, listStoryGraphs, isPlaceholderStory } from './index';
import { STUDENT_BLUEPRINTS } from '../agents.seed';
import { agentFromBlueprint, buildFallbackStory } from './fallback';
import { OPENING_CHOICES, fillOpeningText } from '../storyStages';
import { findForbiddenTerms } from '../storyForbiddenTerms';
import { validateStoryGraph, validateStoryCohort } from '../../engine/story/validator';
import type { StoryGraph, StoryLine } from '../../engine/story/storyTypes';

const graphs = listStoryGraphs();

test('terdapat 15 graf, satu per blueprint', () => {
  assert.equal(graphs.length, 15);
  assert.equal(Object.keys(STORY_GRAPHS).length, 15);
  STUDENT_BLUEPRINTS.forEach((bp, i) => assert.equal(graphs[i].studentId, bp.id));
});

test('setiap graf lolos validateStoryGraph', () => {
  for (const bp of STUDENT_BLUEPRINTS) {
    const g = STORY_GRAPHS[bp.id];
    const errs = validateStoryGraph(g, { agent: agentFromBlueprint(bp) });
    assert.deepEqual(errs.map((e) => `${e.rule}@${e.nodeId}: ${e.message}`), [], bp.id);
  }
});

test('pilihan simpul awal identik OPENING_CHOICES', () => {
  for (const bp of STUDENT_BLUEPRINTS) {
    const g = STORY_GRAPHS[bp.id];
    const start = g.nodes.find((n) => n.id === g.startNodeId);
    assert.ok(start, `${bp.id} punya simpul awal`);
    const name = bp.name.trim().split(/\s+/)[0] || bp.name;
    assert.deepEqual(
      start.choices.map((c) => ({ id: c.id, skillId: c.skillId, text: c.text })),
      OPENING_CHOICES.map((c) => ({ id: c.id, skillId: c.skillId, text: fillOpeningText(c.text, name) })),
      bp.id,
    );
  }
});

test('validateStoryCohort lolos untuk seluruh 15 graf (ambang graf penuh 0,90)', () => {
  const errs = validateStoryCohort(graphs);
  assert.deepEqual(errs.map((e) => e.message), []);
});

test('seluruh 15 id ada di AUTHORED_STORIES, penuh dan bukan placeholder', () => {
  for (const bp of STUDENT_BLUEPRINTS) {
    assert.ok(AUTHORED_STORIES[bp.id], `${bp.id} ada di AUTHORED_STORIES`);
    const g = STORY_GRAPHS[bp.id];
    assert.equal(g, AUTHORED_STORIES[bp.id], bp.id);
    assert.equal(g.kind, 'penuh', bp.id);
    assert.notEqual(g.placeholder, true, bp.id);
    assert.equal(isPlaceholderStory(bp.id), false, bp.id);
  }
});

test('fallback tetap valid sebagai cadangan', () => {
  for (const bp of STUDENT_BLUEPRINTS) {
    const agent = agentFromBlueprint(bp);
    const g = buildFallbackStory(agent);
    const errs = validateStoryGraph(g, { agent });
    assert.deepEqual(errs.map((e) => `${e.rule}@${e.nodeId}: ${e.message}`), [], bp.id);
  }
});

test('tidak ada Istilah_Diagnosis di seluruh teks graf', () => {
  const scan = (g: StoryGraph, label: string, l?: StoryLine): void => {
    if (!l) return;
    for (const t of [l.text, l.aside, l.cue]) {
      assert.deepEqual(findForbiddenTerms(t ?? ''), [], `${g.studentId} ${label}`);
    }
  };
  for (const g of graphs) {
    for (const n of g.nodes) {
      scan(g, n.id, n.reply);
      for (const c of n.choices) {
        assert.deepEqual(findForbiddenTerms(c.text), [], `${g.studentId} ${n.id}/${c.id}`);
        scan(g, `${n.id}/${c.id}`, c.reaction);
      }
    }
  }
});
