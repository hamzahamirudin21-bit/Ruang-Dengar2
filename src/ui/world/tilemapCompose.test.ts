import { test } from "node:test";
import assert from "node:assert/strict";
import { LAB_MAP } from "../../data/map";
import type { ConsultationDoorMode } from "../../types";
import { ART_TILE, composeTilemapGrid } from "./tilemap";

const MODES: ConsultationDoorMode[] = ["lab", "samping"];

// **Validates: Requirements 6.8, 6.9**
// Feature: ui-visual-overhaul, Property 12: Tilemap lengkap dan deterministik
for (const mode of MODES) {
  test(`Property 12: komposisi mode ${mode} berukuran 728x336, lengkap, deterministik`, () => {
    const a = composeTilemapGrid(LAB_MAP, mode);
    const b = composeTilemapGrid(LAB_MAP, mode);
    assert.equal(a.width, 728);
    assert.equal(a.height, 336);
    assert.equal(a.cells.length, 728 * 336);
    for (let i = 0; i < a.cells.length; i++) {
      assert.ok(typeof a.cells[i] === "string" && a.cells[i] !== null, `sel null di ${i}`);
    }
    assert.deepEqual(a.cells, b.cells);
  });
}

test("kedua mode pintu hanya berbeda pada petak pintu Konsultasi", () => {
  const doorTiles = new Set<string>();
  for (const d of LAB_MAP.doors) {
    if (d.zoneId !== "konsultasi") continue;
    for (const t of d.tiles) doorTiles.add(`${t.x},${t.y}`);
  }
  assert.ok(doorTiles.size > 0);
  // Petak tetangga (dinding/lantai bersebelahan) ikut berubah karena tepi dan bayangan
  // bergantung pada tetangga; perbedaan dibatasi pada petak pintu dan tetangga 4-arahnya.
  for (const key of [...doorTiles]) {
    const [x, y] = key.split(",").map(Number);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) doorTiles.add(`${x + dx},${y + dy}`);
  }
  const a = composeTilemapGrid(LAB_MAP, "lab");
  const b = composeTilemapGrid(LAB_MAP, "samping");
  assert.equal(a.width, b.width);
  let diff = 0;
  for (let i = 0; i < a.cells.length; i++) {
    if (a.cells[i] === b.cells[i]) continue;
    diff++;
    const gx = i % a.width;
    const gy = Math.floor(i / a.width);
    const key = `${Math.floor(gx / ART_TILE)},${Math.floor(gy / ART_TILE)}`;
    assert.ok(doorTiles.has(key), `perbedaan di luar petak pintu: petak ${key}`);
  }
  assert.ok(diff > 0, "kedua mode harus berbeda");
});
