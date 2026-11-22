import test from 'node:test';
import assert from 'node:assert/strict';
import { validateGraphStructure } from './validatorGraph';
import { validateStoryContent } from './validatorContent';
import { validateStoryGraph } from './validator';
import { createTestGraph, createTestAgent } from './testGraph';
import type { StoryGraph, StoryNode, StoryRuleId } from './storyTypes';

const rulesOf = (g: StoryGraph): StoryRuleId[] => validateStoryGraph(g).map((e) => e.rule);
const has = (g: StoryGraph, rule: StoryRuleId): boolean => rulesOf(g).includes(rule);
const node = (g: StoryGraph, id: string): StoryNode => g.nodes.find((n) => n.id === id) as StoryNode;

/** Graf penuh dengan jalur terpendek tepat `len` giliran (simpul pengisi disisipkan setelah t-lab2). */
function graphWithPath(len: number): StoryGraph {
  const g = createTestGraph();
  g.kind = 'penuh';
  const base = (): number => {
    const e = validateGraphStructure(g, { minShortestPath: 1000 }).find((x) => x.rule === 'jalur-terlalu-pendek');
    return Number(/hanya (\d+)/.exec(e?.message ?? '')?.[1]);
  };
  const d0 = base();
  const extra = len - d0;
  assert.ok(extra >= 0, `jalur dasar ${d0} lebih panjang dari ${len}`);
  const lab2 = node(g, 't-lab2');
  const template = lab2.choices.map((c) => ({ ...c }));
  const firstTargets = lab2.choices.map((c) => c.next);
  for (let i = 0; i < extra; i++) {
    const id = `fill-${i}`;
    const next = i === extra - 1 ? null : `fill-${i + 1}`;
    g.nodes.push({
      ...lab2,
      id,
      marks: undefined,
      choices: template.map((c, k) => ({ ...c, next: next ?? firstTargets[k] })),
    });
  }
  if (extra > 0) for (const c of lab2.choices) c.next = 'fill-0';
  assert.equal(base(), len);
  return g;
}

test('graf sintetis lolos aturan pilihan dan teks pilihan', () => {
  const r = rulesOf(createTestGraph());
  for (const rule of ['pilihan-kurang', 'pilihan-kelebihan', 'pilihan-teks-panjang'] as const) {
    assert.ok(!r.includes(rule), rule);
  }
});

test('pilihan-kurang: 3 pilihan gagal', () => {
  const g = createTestGraph();
  node(g, 't-lab2').choices.pop();
  assert.ok(has(g, 'pilihan-kurang'));
  assert.ok(!has(g, 'pilihan-kelebihan'));
});

test('pilihan-kelebihan: 5 pilihan gagal', () => {
  const g = createTestGraph();
  const n = node(g, 't-lab2');
  n.choices.push({ ...n.choices[3], id: 'e' });
  assert.ok(has(g, 'pilihan-kelebihan'));
  assert.ok(!has(g, 'pilihan-kurang'));
});

test('pilihan-teks-panjang: 120 lolos, 121 gagal', () => {
  const g = createTestGraph();
  const c = node(g, 't-lab2').choices[0];
  c.text = 'a'.repeat(120);
  assert.ok(!has(g, 'pilihan-teks-panjang'));
  c.text = 'a'.repeat(121);
  assert.ok(has(g, 'pilihan-teks-panjang'));
});

test('pilihan-teks-panjang: dua kalimat lolos, tiga kalimat gagal, kosong gagal', () => {
  const g = createTestGraph();
  const c = node(g, 't-lab2').choices[0];
  c.text = 'Satu kalimat. Dua kalimat.';
  assert.ok(!validateStoryContent(g).some((e) => e.rule === 'pilihan-teks-panjang'));
  c.text = 'Satu. Dua. Tiga.';
  assert.ok(validateStoryContent(g).some((e) => e.rule === 'pilihan-teks-panjang'));
  c.text = '   ';
  assert.ok(validateStoryContent(g).some((e) => e.rule === 'pilihan-teks-panjang'));
});

test('jalur-terlalu-pendek: 14 gagal, 15 lolos', () => {
  assert.ok(has(graphWithPath(14), 'jalur-terlalu-pendek'));
  assert.ok(!has(graphWithPath(15), 'jalur-terlalu-pendek'));
});

test('jalur-terlalu-panjang: 17 lolos, 18 gagal', () => {
  assert.ok(!has(graphWithPath(17), 'jalur-terlalu-panjang'));
  assert.ok(has(graphWithPath(18), 'jalur-terlalu-panjang'));
});

test('opsi maxShortestPath menimpa nilai bawaan', () => {
  const g = graphWithPath(15);
  const r = validateGraphStructure(g, { maxShortestPath: 14, agent: createTestAgent() }).map((e) => e.rule);
  assert.ok(r.includes('jalur-terlalu-panjang'));
});
