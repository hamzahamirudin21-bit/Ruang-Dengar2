import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COUNSELING_STAGE_STEPS,
  describeAppliedTechnique,
  resolveActiveCounselingGuidance,
} from './counselingStageModel';

test('resolveActiveCounselingGuidance memetakan 4 tahap konseling dan mode perbaikan aliansi', () => {
  assert.equal(COUNSELING_STAGE_STEPS.length, 4);

  const g1 = resolveActiveCounselingGuidance({ stage: 'hubungan' }, 'lab');
  assert.equal(g1.stepIndex, 0);
  assert.equal(g1.isRepairMode, false);
  assert.ok(g1.citation.includes('Rogers'));

  const g2 = resolveActiveCounselingGuidance({ stage: 'eksplorasi' }, 'bk');
  assert.equal(g2.stepIndex, 1);
  assert.ok(g2.citation.includes('Hill'));

  const g4 = resolveActiveCounselingGuidance({ stage: 'rencana' }, 'bk');
  assert.equal(g4.stepIndex, 3);
  assert.ok(g4.citation.includes('de Shazer'));

  const repair = resolveActiveCounselingGuidance(
    { stage: 'eksplorasi', tension: { phase: 'perbaikan' } },
    'bk',
  );
  assert.equal(repair.isRepairMode, true);
  assert.ok(repair.citation.includes('Safran'));
});

test('describeAppliedTechnique membedakan teknik konseling tepat, penghambat Gordon, dan perbaikan', () => {
  assert.equal(describeAppliedTechnique({ turn: 0, skillId: null, tension: null }), null);

  const good = describeAppliedTechnique({ turn: 1, skillId: 'refleksi-perasaan', tension: null });
  assert.equal(good?.tone, 'positif');
  assert.ok(good?.citations.includes('Rogers'));

  const bad = describeAppliedTechnique({ turn: 2, skillId: 'nasihat-dini', tension: null });
  assert.equal(bad?.tone, 'penghambat');
  assert.ok(bad?.citations.includes('Gordon'));

  const closedQ = describeAppliedTechnique({ turn: 3, skillId: 'pertanyaan-tertutup', tension: null });
  assert.equal(closedQ?.tone, 'hati-hati');

  const repaired = describeAppliedTechnique({ turn: 4, skillId: 'validasi-normalisasi', tension: 'pulih' });
  assert.equal(repaired?.tone, 'perbaikan');
  assert.ok(repaired?.citations.includes('Safran'));
});
