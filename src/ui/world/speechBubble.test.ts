import test from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from '../../engine/rng';
import type { AgentActivityStatus, AgentSocialStatus } from '../../types';
import {
  BUBBLE_NEAR_TILES,
  MAX_BUBBLES,
  bubbleFor,
  paintBubble,
  selectBubbles,
  type BubbleGlyph,
  type BubbleInput,
  type BubbleSpec,
} from './speechBubble';

const ITERATIONS = 150;
const STATUSES: AgentActivityStatus[] = ['bekerja', 'berpindah', 'mengobrol', 'istirahat', 'menunggu'];
const SOCIALS: AgentSocialStatus[] = ['sendiri', 'berkelompok', 'berinteraksi', 'konflik-ringan', 'menghindar'];
const CHAT_GLYPHS: BubbleGlyph[] = ['titik', 'tanya', 'seru', 'nada'];
const ALL_GLYPHS: BubbleGlyph[] = ['hi', ...CHAT_GLYPHS];

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function genInput(rng: () => number): BubbleInput {
  const r = rng();
  return {
    agentId: `mhs-${Math.floor(rng() * 30)}`,
    status: pick(rng, STATUSES),
    socialStatus: pick(rng, SOCIALS),
    hasInteractionPartner: rng() < 0.5,
    distanceToAvatarTiles: r < 0.2 ? null : rng() * 6,
    timeSeconds: rng() * 1000,
    reducedMotion: rng() < 0.5,
  };
}

// Feature: ui-visual-overhaul, Property 18: Balon ucapan mengikuti aturan status dan jarak
// **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.7**
test('Property 18: balon mengikuti aturan status dan jarak', () => {
  const rng = mulberry32(1801);
  for (let i = 0; i < ITERATIONS; i++) {
    const input = genInput(rng);
    const out = bubbleFor(input);
    assert.deepEqual(bubbleFor({ ...input }), out);
    const chatting = input.status === 'mengobrol' && input.hasInteractionPartner;
    const near = input.distanceToAvatarTiles !== null && input.distanceToAvatarTiles <= BUBBLE_NEAR_TILES;
    if (input.status === 'berpindah') {
      assert.equal(out, null);
    } else if (chatting) {
      assert.ok(out);
      assert.ok(CHAT_GLYPHS.includes(out.glyph));
    } else if (near) {
      assert.ok(out);
      assert.equal(out.glyph, 'hi');
    } else {
      assert.equal(out, null);
    }
    if (out) {
      if (input.reducedMotion) assert.equal(out.hopPx, 0);
      assert.ok(out.hopPx >= 0);
      assert.ok(out.text.length > 0);
    }
  }
});

// Feature: ui-visual-overhaul, Property 19: Pemilihan balon dibatasi dan mengutamakan yang terdekat
// **Validates: Requirements 9.6**
test('Property 19: selectBubbles dibatasi dan mengutamakan yang terdekat', () => {
  const rng = mulberry32(1901);
  const spec: BubbleSpec = { glyph: 'hi', text: 'Hi!', hopPx: 0 };
  for (let i = 0; i < ITERATIONS; i++) {
    const n = Math.floor(rng() * 12);
    const cands = Array.from({ length: n }, (_, k) => ({
      agentId: `a${k}`,
      spec,
      distance: Math.floor(rng() * 8) + rng() * 0.5,
    }));
    const chosen = selectBubbles(cands);
    assert.ok(chosen.length <= MAX_BUBBLES);
    assert.equal(chosen.length, Math.min(n, MAX_BUBBLES));
    assert.equal(new Set(chosen).size, chosen.length);
    const byId = new Map(cands.map((c) => [c.agentId, c.distance]));
    for (const id of chosen) assert.ok(byId.has(id));
    const maxChosen = Math.max(...chosen.map((id) => byId.get(id)!), -Infinity);
    for (const c of cands) {
      if (!chosen.includes(c.agentId)) assert.ok(c.distance >= maxChosen);
    }
  }
});

test('paintBubble tidak kosong untuk semua glif', () => {
  const texts: Record<BubbleGlyph, string> = { hi: 'Hi!', titik: '...', tanya: '?', seru: '!', nada: '♪' };
  for (const glyph of ALL_GLYPHS) {
    const g = paintBubble({ glyph, text: texts[glyph], hopPx: 0 });
    assert.equal(g.cells.length, g.width * g.height);
    assert.ok(g.cells.some((c) => c !== null));
    assert.ok(g.cells.some((c) => c === '#1b2a49'));
    assert.ok(g.cells.some((c) => c === '#ffffff'));
  }
});
