/**
 * Property 1 (Bug Condition): balasan mahasiswa menjawab ucapan Dosen.
 * Validates: Requirements 1.4, 1.5, 2.4, 2.5, 2.6
 * Uji ini GAGAL pada konten asli (membuktikan bug) dan lulus setelah perbaikan.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { StoryChoice, StoryGraph, StoryNode } from '../../engine/story/storyTypes';
import { AUTHORED_STORIES } from './index';
import { findNode, isBugCondition, scanBugChoices } from './replyCoherence';

const GRAPHS = Object.values(AUTHORED_STORIES).sort((a, b) => a.studentId.localeCompare(b.studentId));

function choice(over: Partial<StoryChoice> & { id: string; next: string }): StoryChoice {
  return { skillId: 'pertanyaan-terbuka', text: 't', ...over } as StoryChoice;
}
function node(id: string, choices: StoryChoice[], extra: Partial<StoryNode> = {}): StoryNode {
  return {
    id, sceneId: 's', stage: 'hubungan', depth: 0,
    reply: { text: `reply-${id}`, expression: 'netral', cue: 'c' }, choices, ...extra,
  } as StoryNode;
}
function graph(nodes: StoryNode[]): StoryGraph {
  return { studentId: 'x', nodes } as unknown as StoryGraph;
}

describe('isBugCondition (graf buatan)', () => {
  const line = { text: 'r', expression: 'netral', cue: 'c' } as const;

  it('menandai pilihan pertanyaan tanpa reaction', () => {
    const q = choice({ id: 'q', next: 'b' });
    const g = graph([node('a', [q]), node('b', [choice({ id: 'z', next: '@ending', skillId: 'empati' as never })])]);
    assert.equal(isBugCondition(q, g.nodes[0], g), true);
  });

  it('menandai pilihan non-pertanyaan yang tujuannya dipakai bersama skill lain', () => {
    const c1 = choice({ id: 'c1', next: 'b', skillId: 'validasi-emosi' as never });
    const c2 = choice({ id: 'c2', next: 'b', skillId: 'nasihat' as never });
    const g = graph([node('a', [c1, c2]), node('b', [])]);
    assert.equal(isBugCondition(c1, g.nodes[0], g), true);
  });

  it('tidak menandai pilihan yang sudah punya reaction', () => {
    const q = choice({ id: 'q', next: 'b', reaction: line });
    const g = graph([node('a', [q]), node('b', [])]);
    assert.equal(isBugCondition(q, g.nodes[0], g), false);
  });

  it('tidak menandai pilihan perbaikan, target bertension, atau @ending/@resume', () => {
    const rep = choice({ id: 'r', next: 'b', action: { kind: 'akui-ketegangan' } });
    const toTension = choice({ id: 't', next: 'tn' });
    const end = choice({ id: 'e', next: '@ending' });
    const res = choice({ id: 's', next: '@resume' });
    const g = graph([
      node('a', [rep, toTension, end, res]),
      node('b', []),
      node('tn', [], { tension: { phase: 'awal' } }),
    ]);
    for (const c of [rep, toTension, end, res]) assert.equal(isBugCondition(c, g.nodes[0], g), false);
  });
});

describe('Property 1: setiap pilihan berkondisi bug punya reaction khusus (konten asli)', () => {
  it('memuat 18 graf', () => {
    assert.equal(GRAPHS.length, 18);
  });

  it('tiap pilihan berkondisi bug punya reaction.text dan reaction.cue tidak kosong', () => {
    const missing: string[] = [];
    const perStudent: Record<string, number> = {};
    for (const g of GRAPHS) {
      const refs = scanBugChoices(g);
      perStudent[g.studentId] = refs.length;
      for (const r of refs) missing.push(`${r.studentId} / ${r.nodeId} / ${r.choiceId}`);
    }
    const summary = Object.entries(perStudent).map(([k, v]) => `${k}=${v}`).join(', ');
    assert.deepEqual(
      missing, [],
      `${missing.length} pilihan berkondisi bug tanpa reaction. Per mahasiswa: ${summary}\n${missing.join('\n')}`,
    );
  });

  it('reaction pilihan berkondisi bug berbeda dari reply simpul tujuan dan unik per simpul', () => {
    const problems: string[] = [];
    for (const g of GRAPHS) {
      for (const n of g.nodes) {
        const seen = new Set<string>();
        for (const c of n.choices) {
          const r = c.reaction;
          if (r) {
            const t = r.text.trim();
            if (seen.has(t)) problems.push(`${g.studentId} / ${n.id} / ${c.id}: reaction duplikat dalam simpul`);
            seen.add(t);
          }
          if (r && isBugCondition({ ...c, reaction: undefined }, n, g)) {
            const target = findNode(g, c.next);
            if (target && r.text.trim() === target.reply.text.trim()) {
              problems.push(`${g.studentId} / ${n.id} / ${c.id}: reaction sama dengan reply tujuan`);
            }
            if (!r.cue.trim() || !r.text.trim()) problems.push(`${g.studentId} / ${n.id} / ${c.id}: teks/cue kosong`);
          }
        }
      }
    }
    assert.deepEqual(problems, []);
  });

  it('kasus konkret mhs-15 / na-l3 / terbuka punya reaction', () => {
    const g = AUTHORED_STORIES['mhs-15'];
    const n = findNode(g, 'na-l3');
    assert.ok(n, 'simpul na-l3 ada');
    const c = n.choices.find((x) => x.id === 'terbuka');
    assert.ok(c, 'pilihan terbuka ada');
    assert.ok(
      c.reaction && c.reaction.text.trim() && c.reaction.cue.trim(),
      'mhs-15 / na-l3 / terbuka tanpa reaction: mahasiswa menjawab reply simpul tujuan ' +
        `"${findNode(g, c.next)?.reply.text}"`,
    );
  });
});
