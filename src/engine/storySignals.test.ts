import test from 'node:test';
import assert from 'node:assert/strict';
import { STUDENT_BLUEPRINTS } from '../data/agents.seed';
import { LAB_MAP } from '../data/map';
import { buildNavigationGrid } from './pathfinding';
import { createInitialAgents } from '../data/agents.seed';
import {
  SHIFT_TARGET_STORIES,
  STUDENT_STORY_SIGNALS,
  computeShiftReport,
  signalForStudent,
} from './storySignals';
import type { MissionRecord } from './story/saveSlot';

test('seluruh 15 mahasiswa memiliki sinyal perilaku unik dan kisah terbuka yang lengkap', () => {
  assert.equal(STUDENT_BLUEPRINTS.length, 15);
  const seenClues = new Set<string>();
  for (const bp of STUDENT_BLUEPRINTS) {
    const sig = STUDENT_STORY_SIGNALS[bp.id];
    assert.ok(sig, `sinyal hilang untuk ${bp.id}`);
    assert.ok(sig.clue.length >= 20, `petunjuk terlalu pendek untuk ${bp.id}`);
    assert.ok(sig.unlockedTitle.length >= 4);
    assert.ok(sig.unlockedExcerpt.length >= 30);
    assert.equal(seenClues.has(sig.clue), false, `petunjuk duplikat pada ${bp.id}`);
    seenClues.add(sig.clue);
    assert.equal(signalForStudent(bp.id).unlockedTitle, sig.unlockedTitle);
  }
});

test('computeShiftReport mendeteksi target shift 3 kisah dan menyusun teks bagikan', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  const agents = createInitialAgents(LAB_MAP, grid, 202601);
  for (const a of agents) a.energy = 0.8;

  const doneRec = (day: number): MissionRecord => ({
    status: 'selesai',
    sessions: 1,
    lastOutcome: 'terbantu',
    lastDay: day,
  });

  const before = computeShiftReport(agents, { 'mhs-14': doneRec(1) });
  assert.equal(before.shiftCompleted, false);
  assert.equal(before.unlockedCount, 1);

  const after = computeShiftReport(agents, {
    'mhs-14': doneRec(1),
    'mhs-15': doneRec(1),
    'mhs-02': doneRec(1),
  });
  assert.equal(after.shiftTarget, SHIFT_TARGET_STORIES);
  assert.equal(after.shiftCompleted, true);
  assert.equal(after.unlockedCount, 3);
  assert.equal(after.archetype.title, 'Penjaga Ruang Aman');
  assert.ok(after.shareText.includes('3/15'));
});
