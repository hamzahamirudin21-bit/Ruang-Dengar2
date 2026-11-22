import { test } from "node:test";
import assert from "node:assert/strict";
import { LAB_MAP } from "../../data/map";
import {
  FURNITURE_PAINTERS,
  paintFurniture,
  printerLedColor,
  FURNITURE_ART_TILE,
} from "./furnitureArt";

// Feature: ui-visual-overhaul, Property 13: Perabot digambar sesuai ukuran, deterministik
// **Validates: Requirements 7.1, 7.2, 7.4**
test("Property 13: semua perabot LAB_MAP berlebar rect.w*14, >1 warna, deterministik", () => {
  assert.ok(LAB_MAP.furniture.length > 0);
  for (const item of LAB_MAP.furniture) {
    const a = paintFurniture(item);
    const b = paintFurniture(item);
    assert.equal(a.grid.width, item.rect.w * FURNITURE_ART_TILE, item.id);
    assert.equal(a.grid.height, item.rect.h * FURNITURE_ART_TILE + a.extraHeight, item.id);
    assert.equal(a.grid.cells.length, a.grid.width * a.grid.height, item.id);
    assert.ok(new Set(a.grid.cells.filter((c) => c !== null)).size > 1, item.id);
    assert.deepEqual(a.grid, b.grid, item.id);
  }
});

test("setiap kind perabot di LAB_MAP punya pelukis", () => {
  for (const item of LAB_MAP.furniture) {
    assert.equal(typeof FURNITURE_PAINTERS[item.kind], "function", item.kind);
  }
});

// Feature: ui-visual-overhaul, Property 15: Warna LED printer sama dengan aturan lama
// **Validates: Requirements 7.10**
test("Property 15: printerLedColor sama dengan aturan lama untuk semua menit dan unit", () => {
  const colors = ["#16a34a", "#0284c7", "#d97706", "#64748b"];
  for (let m = 0; m < 1440; m++) {
    for (let u = 0; u <= 12; u++) {
      assert.equal(printerLedColor(m, u), colors[(Math.floor(m / 15) + u) % 4], `${m}/${u}`);
    }
  }
});
