import type { LabFurniture, StudentAgent } from '../../types';

/** Ukuran sprite di dunia (piksel dunia): 48 lebar, 72 tinggi (rasio 16:24). */
export const SPRITE_WORLD_W = 48;
export const SPRITE_WORLD_H = 72;
/** Kaki sprite berada di (y + 0,5) * tile + SPRITE_FEET_DY. */
export const SPRITE_FEET_DY = 8;

type Pos = { x: number; y: number };

export function spriteFeet(pos: Pos, tileSizePx: number): { x: number; y: number } {
  return {
    x: (pos.x + 0.5) * tileSizePx,
    y: (pos.y + 0.5) * tileSizePx + SPRITE_FEET_DY,
  };
}

export function spriteRect(
  pos: Pos,
  tileSizePx: number,
): { x: number; y: number; w: number; h: number } {
  const feet = spriteFeet(pos, tileSizePx);
  return {
    x: feet.x - SPRITE_WORLD_W / 2,
    y: feet.y - SPRITE_WORLD_H,
    w: SPRITE_WORLD_W,
    h: SPRITE_WORLD_H,
  };
}

export type DrawItemKind = 'perabot' | 'agen' | 'avatar' | 'pendamping';

export interface DrawItem {
  kind: DrawItemKind;
  id: string;
  baseY: number;
}

const KIND_ORDER: Readonly<Record<DrawItemKind, number>> = {
  perabot: 0,
  agen: 1,
  pendamping: 2,
  avatar: 3,
};

function compareStr(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Daftar gambar menurut y dasar menaik; deterministik dan tidak bergantung urutan masukan. */
export function buildDrawList(
  furniture: readonly LabFurniture[],
  agents: readonly Pick<StudentAgent, 'id' | 'position'>[],
  avatar: Pos | null,
  companion: { id: string; x: number; y: number } | null,
  tileSizePx: number,
): readonly DrawItem[] {
  const items: DrawItem[] = [];
  for (const f of furniture) {
    items.push({ kind: 'perabot', id: f.id, baseY: (f.rect.y + f.rect.h) * tileSizePx });
  }
  for (const a of agents) {
    items.push({ kind: 'agen', id: a.id, baseY: spriteFeet(a.position, tileSizePx).y });
  }
  if (avatar) {
    items.push({ kind: 'avatar', id: 'avatar', baseY: spriteFeet(avatar, tileSizePx).y });
  }
  if (companion) {
    items.push({
      kind: 'pendamping',
      id: companion.id,
      baseY: spriteFeet(companion, tileSizePx).y,
    });
  }
  return items.sort(
    (a, b) =>
      a.baseY - b.baseY ||
      KIND_ORDER[a.kind] - KIND_ORDER[b.kind] ||
      compareStr(a.id, b.id),
  );
}

/** Mengembalikan id agen di titik dunia; bila tumpang tindih, yang kakinya paling depan (bawah) menang. */
export function hitTestAgents(
  worldX: number,
  worldY: number,
  agents: readonly Pick<StudentAgent, 'id' | 'position'>[],
  tileSizePx: number,
): string | null {
  let best: { id: string; feetY: number } | null = null;
  for (const a of agents) {
    const r = spriteRect(a.position, tileSizePx);
    if (worldX < r.x || worldX > r.x + r.w || worldY < r.y || worldY > r.y + r.h) continue;
    const feetY = r.y + r.h;
    if (
      best === null ||
      feetY > best.feetY ||
      (feetY === best.feetY && compareStr(a.id, best.id) < 0)
    ) {
      best = { id: a.id, feetY };
    }
  }
  return best ? best.id : null;
}
