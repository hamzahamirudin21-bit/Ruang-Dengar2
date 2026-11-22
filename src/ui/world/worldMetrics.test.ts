import test from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32, shuffleDeterministic } from '../../engine/rng';
import type { LabFurniture, StudentAgent } from '../../types';
import {
  SPRITE_WORLD_H,
  SPRITE_WORLD_W,
  buildDrawList,
  hitTestAgents,
  spriteFeet,
  spriteRect,
} from './worldMetrics';

const T = 28;
const ITERATIONS = 150;

type AgentLite = Pick<StudentAgent, 'id' | 'position'>;

function genFurniture(rng: () => number, n: number): LabFurniture[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `f${i}`,
    rect: { x: Math.floor(rng() * 20), y: Math.floor(rng() * 10), w: 1 + Math.floor(rng() * 3), h: 1 + Math.floor(rng() * 3) },
  })) as unknown as LabFurniture[];
}

function genAgents(rng: () => number, n: number, gridy = false): AgentLite[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `a${i}`,
    position: gridy
      ? { x: Math.floor(rng() * 8), y: Math.floor(rng() * 4) }
      : { x: rng() * 20, y: rng() * 12 },
  }));
}

test('ukuran sprite 48×72 dan kaki berada di (y+0,5)*t+8', () => {
  assert.equal(SPRITE_WORLD_W, 48);
  assert.equal(SPRITE_WORLD_H, 72);
  const r = spriteRect({ x: 3, y: 2 }, T);
  assert.equal(r.w, 48);
  assert.equal(r.h, 72);
  const feet = spriteFeet({ x: 3, y: 2 }, T);
  assert.equal(feet.y, 2.5 * T + 8);
  assert.equal(r.y + r.h, feet.y);
  assert.equal(r.x + r.w / 2, feet.x);
});

// Feature: ui-visual-overhaul, Property 16: Urutan gambar menaik menurut y dasar secara deterministik
// **Validates: Requirements 8.2, 8.3**
test('Property 16: baseY tidak menurun dan urutan identik untuk permutasi masukan', () => {
  for (let seed = 1; seed <= ITERATIONS; seed += 1) {
    const rng = mulberry32(seed);
    const furniture = genFurniture(rng, Math.floor(rng() * 8));
    const agents = genAgents(rng, Math.floor(rng() * 10), seed % 2 === 0);
    const avatar = rng() < 0.8 ? { x: rng() * 20, y: rng() * 12 } : null;
    const companion = rng() < 0.5 ? { id: 'pend', x: rng() * 20, y: rng() * 12 } : null;

    const base = buildDrawList(furniture, agents, avatar, companion, T);
    for (let i = 1; i < base.length; i += 1) {
      assert.ok(base[i - 1].baseY <= base[i].baseY, `seed ${seed}: urutan menurun`);
    }
    assert.equal(
      base.length,
      furniture.length + agents.length + (avatar ? 1 : 0) + (companion ? 1 : 0),
    );

    const permuted = buildDrawList(
      shuffleDeterministic(rng, furniture),
      shuffleDeterministic(rng, agents),
      avatar,
      companion,
      T,
    );
    assert.deepEqual(permuted, base, `seed ${seed}: hasil bergantung urutan masukan`);
  }
});

// Feature: ui-visual-overhaul, Property 17: Hit-test sprite
// **Validates: Requirements 8.6, 8.7, 8.8**
test('Property 17: hit-test mengembalikan agen terdepan atau null di luar semua persegi', () => {
  let hits = 0;
  let misses = 0;
  let overlaps = 0;
  for (let seed = 1; seed <= ITERATIONS; seed += 1) {
    const rng = mulberry32(seed * 7919);
    const agents = genAgents(rng, 1 + Math.floor(rng() * 8));
    for (let k = 0; k < 10; k += 1) {
      let wx: number;
      let wy: number;
      if (k % 2 === 0) {
        // titik di sekitar agen acak agar sering mengenai persegi
        const a = agents[Math.floor(rng() * agents.length)];
        const r = spriteRect(a.position, T);
        wx = r.x + rng() * r.w;
        wy = r.y + rng() * r.h;
      } else {
        wx = rng() * 700 - 50;
        wy = rng() * 450 - 50;
      }
      const containing = agents.filter((a) => {
        const r = spriteRect(a.position, T);
        return wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h;
      });
      const result = hitTestAgents(wx, wy, agents, T);
      if (containing.length === 0) {
        misses += 1;
        assert.equal(result, null);
      } else {
        hits += 1;
        if (containing.length > 1) overlaps += 1;
        const maxFeet = Math.max(...containing.map((a) => spriteFeet(a.position, T).y));
        const winners = containing
          .filter((a) => spriteFeet(a.position, T).y === maxFeet)
          .map((a) => a.id);
        assert.ok(result !== null && winners.includes(result), `seed ${seed}: bukan agen terdepan`);
      }
    }
  }
  assert.ok(hits > 0 && misses > 0 && overlaps > 0, 'generator harus mencakup kena, luput, dan tumpang tindih');
});

test('hit-test: agen depan menang pada dua agen bertumpuk', () => {
  const agents: AgentLite[] = [
    { id: 'belakang', position: { x: 5, y: 5 } },
    { id: 'depan', position: { x: 5, y: 5.5 } },
  ];
  const f = spriteFeet({ x: 5, y: 5.5 }, T);
  assert.equal(hitTestAgents(f.x, f.y - 10, agents, T), 'depan');
  assert.equal(hitTestAgents(-100, -100, agents, T), null);
});
