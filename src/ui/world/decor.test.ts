import { test } from "node:test";
import assert from "node:assert/strict";
import { LAB_MAP } from "../../data/map";
import type { ConsultationDoorMode } from "../../types";
import { buildTileGrid } from "./tilemap";
import { buildDecor, paintDecor, type DecorKind } from "./decor";

const MODES: ConsultationDoorMode[] = ["lab", "samping"];

// Feature: ui-visual-overhaul, Property 14: Dekor hanya pada petak yang aman
// **Validates: Requirements 7.5, 7.6, 7.7, 7.8**
test("Property 14: dekor hanya pada petak aman dan deterministik pada kedua mode pintu", () => {
  for (const mode of MODES) {
    const grid = buildTileGrid(LAB_MAP, mode);
    const items = buildDecor(LAB_MAP, grid);
    assert.deepEqual(items, buildDecor(LAB_MAP, buildTileGrid(LAB_MAP, mode)), mode);

    const furniture = new Set<string>();
    for (const f of LAB_MAP.furniture) {
      for (let y = Math.floor(f.rect.y); y < Math.ceil(f.rect.y + f.rect.h); y++) {
        for (let x = Math.floor(f.rect.x); x < Math.ceil(f.rect.x + f.rect.w); x++) furniture.add(`${x},${y}`);
      }
    }
    const slots = new Set<string>();
    const entrances = new Set<string>();
    for (const z of LAB_MAP.zones) {
      z.standingSlots.forEach((p) => slots.add(`${p.x},${p.y}`));
      z.entrances.forEach((p) => entrances.add(`${p.x},${p.y}`));
    }
    const doors = new Set<string>();
    for (const d of LAB_MAP.doors) d.tiles.forEach((t) => doors.add(`${t.x},${t.y}`));

    for (const it of items) {
      const { x, y } = it.tile;
      const key = `${x},${y}`;
      const cell = grid.cells[y * grid.cols + x];
      if (it.placement === "lantai") {
        assert.ok(!furniture.has(key), `${mode} perabot ${it.kind} ${key}`);
        assert.ok(!slots.has(key), `${mode} slot ${it.kind} ${key}`);
        assert.ok(!entrances.has(key), `${mode} entrance ${it.kind} ${key}`);
        assert.ok(!doors.has(key) && !cell.door, `${mode} pintu ${it.kind} ${key}`);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            assert.ok(!doors.has(`${x + dx},${y + dy}`), `${mode} tetangga pintu ${it.kind} ${key}`);
          }
        }
      } else {
        assert.ok(cell.wall?.hasFaceBelow, `${mode} muka-dinding ${it.kind} ${key}`);
      }
    }
  }
});

test("minimal satu papan pengumuman dan satu tanaman pada kedua mode", () => {
  for (const mode of MODES) {
    const items = buildDecor(LAB_MAP, buildTileGrid(LAB_MAP, mode));
    assert.ok(items.some((i) => i.kind === "papan-pengumuman"), mode);
    assert.ok(items.some((i) => i.kind === "tanaman"), mode);
  }
});

test("paintDecor menghasilkan grid tidak kosong dan deterministik untuk tiap kind", () => {
  const kinds: DecorKind[] = ["tanaman", "papan-pengumuman", "poster", "jam", "papan-tulis", "tong-sampah", "lampu-lantai"];
  for (const k of kinds) {
    const a = paintDecor(k);
    assert.ok(a.cells.some((c) => c !== null), k);
    assert.deepEqual(a, paintDecor(k), k);
  }
});
