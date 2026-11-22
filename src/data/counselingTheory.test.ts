import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { mulberry32 } from '../engine/rng';
import type { CounselorSkillId, DebriefTurn } from '../types';
import { COUNSELOR_SKILLS } from './skillEffects';
import {
  CONCEPT_THEORY,
  REFERENCES,
  SKILL_THEORY,
  STAGE_THEORY,
  referenceByKey,
  theoryForTurn,
  type TheoryConceptId,
  type TheoryNote,
  type TheoryStageId,
} from './counselingTheory';

const ITERATIONS = 200;
const STAGES: readonly TheoryStageId[] = ['lab', 'bk-eksplorasi', 'bk-pemahaman', 'bk-rencana', 'lanjutan'];
const CONCEPTS: readonly TheoryConceptId[] = ['keterbukaan', 'aliansi', 'keretakan-perbaikan', 'etika'];
const KINDS: readonly DebriefTurn['kind'][] = [
  'keterampilan', 'akui-ketegangan', 'perbaikan', 'janji-tindak-lanjut', 'pembuka',
];

const pick = <T>(rng: () => number, xs: readonly T[]): T => xs[Math.floor(rng() * xs.length)];

function sentenceCount(text: string): number {
  return text.split(/[.!?]+(?=\s|$)/).filter((s) => s.trim().length > 0).length;
}

function assertNote(note: TheoryNote | undefined, label: string): void {
  assert.ok(note, `${label}: entri ada`);
  assert.ok(note.title.trim().length > 0, `${label}: judul tidak kosong`);
  assert.ok(note.theory.trim().length > 0, `${label}: teori tidak kosong`);
  const n = sentenceCount(note.explanation);
  assert.ok(n >= 1 && n <= 2, `${label}: penjelasan 1-2 kalimat (dapat ${n})`);
  assert.ok(note.refs.length >= 1, `${label}: minimal satu rujukan`);
  for (const key of note.refs) assert.ok(referenceByKey(key), `${label}: kunci ${key} ada di REFERENCES`);
}

// Feature: vn-lean-upgrade, Property 5: Katalog total dan rujukan sah
// **Validates: Requirements 4.1, 4.2, 4.5**
test('Property 5: katalog lengkap untuk 5 tahap, 14 skill, dan 4 konsep dengan rujukan sah', () => {
  assert.equal(COUNSELOR_SKILLS.length, 14);
  assert.deepEqual(Object.keys(STAGE_THEORY), [...STAGES]);
  assert.deepEqual(Object.keys(SKILL_THEORY).sort(), COUNSELOR_SKILLS.map((s) => s.id).sort());
  assert.deepEqual(Object.keys(CONCEPT_THEORY).sort(), [...CONCEPTS].sort());

  const rng = mulberry32(5050);
  const seen = { stages: new Set<string>(), skills: new Set<string>(), concepts: new Set<string>() };
  for (let i = 0; i < ITERATIONS; i++) {
    const stage = pick(rng, STAGES);
    assertNote(STAGE_THEORY[stage], `tahap ${stage}`);
    seen.stages.add(stage);

    const skill = pick(rng, COUNSELOR_SKILLS);
    const entry = SKILL_THEORY[skill.id];
    assertNote(entry, `skill ${skill.id}`);
    assert.equal(entry.hindering, skill.category === 'penghambat', `skill ${skill.id}: hindering`);
    if (skill.category === 'penghambat') {
      assert.ok(entry.refs.includes('gordon'), `skill ${skill.id}: penghambat merujuk gordon`);
    }
    seen.skills.add(skill.id);

    const concept = pick(rng, CONCEPTS);
    assertNote(CONCEPT_THEORY[concept], `konsep ${concept}`);
    seen.concepts.add(concept);
  }
  assert.equal(seen.stages.size, STAGES.length);
  assert.equal(seen.skills.size, COUNSELOR_SKILLS.length);
  assert.equal(seen.concepts.size, CONCEPTS.length);
});

// Feature: vn-lean-upgrade, Property 6: Teori per giliran
// **Validates: Requirements 4.8**
test('Property 6: theoryForTurn memetakan ketegangan/perbaikan, skill, janji, dan lainnya', () => {
  const skills: readonly (CounselorSkillId | null)[] = [null, ...COUNSELOR_SKILLS.map((s) => s.id)];
  const rng = mulberry32(6060);
  for (let i = 0; i < ITERATIONS; i++) {
    const kind = pick(rng, KINDS);
    const skillId = pick(rng, skills);
    let expected: TheoryNote | null = null;
    if (kind === 'akui-ketegangan' || kind === 'perbaikan') expected = CONCEPT_THEORY['keretakan-perbaikan'];
    else if (skillId !== null) expected = SKILL_THEORY[skillId];
    else if (kind === 'janji-tindak-lanjut') expected = STAGE_THEORY.lanjutan;
    assert.equal(theoryForTurn({ kind, skillId }), expected, `${kind} / ${skillId ?? 'null'}`);
  }
});

test('REFERENCES: kunci unik, urut alfabet, apa memuat (tahun), dan semuanya dipakai', () => {
  const keys = REFERENCES.map((r) => r.key);
  assert.equal(new Set(keys).size, keys.length, 'kunci referensi unik');
  for (const r of REFERENCES) {
    const year = /\((\d{4})\)/.exec(r.apa)?.[1];
    assert.ok(year, `${r.key}: apa memuat tahun dalam kurung`);
    assert.ok(r.cite.endsWith(`, ${year}`), `${r.key}: tahun cite sama dengan apa`);
    assert.match(r.sourceUrl, /^https:\/\//, `${r.key}: sourceUrl https`);
    assert.equal(referenceByKey(r.key), r);
  }
  assert.equal(referenceByKey('tidak-ada'), undefined);

  const sorted = [...REFERENCES].sort((a, b) => a.apa.localeCompare(b.apa, 'en', { sensitivity: 'base' }));
  assert.deepEqual(keys, sorted.map((r) => r.key), 'urut alfabet penulis pertama');

  const notes = [...Object.values(STAGE_THEORY), ...Object.values(SKILL_THEORY), ...Object.values(CONCEPT_THEORY)];
  const used = new Set(notes.flatMap((n) => n.refs));
  assert.deepEqual([...keys].sort(), [...used].sort(), 'setiap referensi dipakai minimal sekali');
});

test('docs/LANDASAN-TEORI.md memuat isi katalog', () => {
  const doc = readFileSync(new URL('../../docs/LANDASAN-TEORI.md', import.meta.url), 'utf8');
  const notes = [...Object.values(STAGE_THEORY), ...Object.values(SKILL_THEORY), ...Object.values(CONCEPT_THEORY)];
  for (const n of notes) {
    for (const text of [n.title, n.theory, n.explanation]) {
      assert.ok(doc.includes(text), `dokumen memuat: ${text}`);
    }
  }
  for (const r of REFERENCES) {
    assert.ok(doc.includes(r.cite), `dokumen memuat rujukan ${r.cite}`);
    assert.ok(doc.includes(r.sourceUrl), `dokumen memuat tautan ${r.sourceUrl}`);
  }
});
