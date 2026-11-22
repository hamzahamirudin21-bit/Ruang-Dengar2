import { test } from "node:test";
import assert from "node:assert/strict";
import { LAB_MAP } from "../../data/map";
import { mulberry32 } from "../../engine/rng";
import type { ConsultationDoorMode, LabMapData, ZoneType } from "../../types";
import { ART_TILE, WORLD_PER_ART, buildTileGrid } from "./tilemap";

const ZONES: ZoneType[] = [
  "cetak-3d", "pemrograman", "las", "elektronik-iot", "diskusi",
  "gudang-alat", "istirahat", "konsultasi", "ruang-dosen",
];
const MODES: ConsultationDoorMode[] = ["lab", "samping"];

function randomMap(rng: () => number): LabMapData {
  const int = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
  const width = int(5, 24);
  const height = int(5, 16);
  const walls = [];
  for (let i = int(1, 8); i > 0; i--) {
    const x = int(0, width - 1);
    const y = int(0, height - 1);
    walls.push({ x, y, w: int(1, width - x), h: int(1, Math.min(3, height - y)) });
  }
  const used = new Set<string>();
  const doors = [];
  for (let i = int(0, 4); i > 0; i--) {
    const tiles = [];
    for (let k = int(1, 3); k > 0; k--) {
      const t = { x: int(0, width - 1), y: int(0, height - 1) };
      if (used.has(`${t.x},${t.y}`)) continue;
      used.add(`${t.x},${t.y}`);
      tiles.push(t);
    }
    doors.push({
      id: `d${i}`,
      zoneId: ZONES[int(0, ZONES.length - 1)],
      tiles,
      orientation: (rng() < 0.5 ? "horizontal" : "vertical") as "horizontal" | "vertical",
      mode: rng() < 0.5 ? undefined : MODES[int(0, 1)],
      label: "d",
    });
  }
  return { width, height, tileSizePx: 28, zones: [], walls, lowDividers: [], doors, furniture: [] };
}

// Feature: ui-visual-overhaul, Property 11: Struktur TileGrid konsisten dengan peta
// **Validates: Requirements 6.3, 6.4, 6.5, 6.10**
test("Property 11: struktur TileGrid konsisten dengan peta acak", () => {
  const rng = mulberry32(20240611);
  for (let iter = 0; iter < 150; iter++) {
    const map = randomMap(rng);
    for (const mode of MODES) {
      const g = buildTileGrid(map, mode);
      assert.equal(g.cols, map.width);
      assert.equal(g.rows, map.height);
      assert.equal(g.cells.length, map.width * map.height);

      const covered = new Set<string>();
      for (const w of map.walls)
        for (let y = w.y; y < w.y + w.h; y++)
          for (let x = w.x; x < w.x + w.w; x++) covered.add(`${x},${y}`);
      const activeDoor = new Set<string>();
      for (const d of map.doors) {
        if (d.mode === undefined || d.mode === mode)
          for (const t of d.tiles) activeDoor.add(`${t.x},${t.y}`);
      }

      for (let y = 0; y < g.rows; y++) {
        for (let x = 0; x < g.cols; x++) {
          const c = g.cells[y * g.cols + x];
          const key = `${x},${y}`;
          assert.ok(!(c.wall && c.door), "wall dan door tidak boleh bersamaan");
          if (covered.has(key) && !activeDoor.has(key)) assert.ok(c.wall, `wall ${key}`);
          if (activeDoor.has(key)) {
            assert.ok(c.door && !c.wall, `door ${key}`);
          }
          if (c.wall) {
            const s = y + 1 < g.rows ? g.cells[(y + 1) * g.cols + x] : undefined;
            assert.equal(c.wall.hasFaceBelow, s !== undefined && s.wall === null);
          }
          if (c.window) assert.ok(c.wall?.hasFaceBelow, `window ${key}`);
        }
      }
    }
  }
});

test("LAB_MAP: pintu konsultasi mode lab aktif, mode samping menjadi dinding", () => {
  const lab = LAB_MAP.doors.find((d) => d.mode === "lab")!;
  const samping = LAB_MAP.doors.find((d) => d.mode === "samping")!;
  const gLab = buildTileGrid(LAB_MAP, "lab");
  const gSide = buildTileGrid(LAB_MAP, "samping");
  const cell = (g: typeof gLab, t: { x: number; y: number }) => g.cells[t.y * g.cols + t.x];

  for (const t of lab.tiles) {
    assert.ok(cell(gLab, t).door?.active);
    assert.equal(cell(gLab, t).wall, null);
    assert.ok(cell(gSide, t).wall);
    assert.equal(cell(gSide, t).door, null);
  }
  for (const t of samping.tiles) {
    assert.ok(cell(gSide, t).door?.active);
    assert.equal(cell(gSide, t).wall, null);
    assert.ok(cell(gLab, t).wall);
    assert.equal(cell(gLab, t).door, null);
  }
});

test("ART_TILE * WORLD_PER_ART sama dengan LAB_MAP.tileSizePx", () => {
  assert.equal(ART_TILE * WORLD_PER_ART, LAB_MAP.tileSizePx);
});
