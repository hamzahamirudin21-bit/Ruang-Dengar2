import { test } from "node:test";
import assert from "node:assert/strict";
import { LAB_MAP } from "../../data/map";
import type { ZoneType } from "../../types";
import { ZONE_THEMES, CORRIDOR_THEME, themeForZone, type TileTheme } from "./tileTheme";

const ALL_ZONES: ZoneType[] = [
  "cetak-3d", "pemrograman", "las", "elektronik-iot", "diskusi",
  "gudang-alat", "istirahat", "konsultasi", "ruang-dosen",
  "studio-desain", "pojok-baca",
];
const FLOORS = ["kayu", "keramik", "beton", "karpet", "koridor"];
const HEX = /^#[0-9a-fA-F]{6}$/;

function assertValid(t: TileTheme): void {
  assert.ok(FLOORS.includes(t.floor));
  for (const k of ["base", "alt", "accent", "wallFace", "wallCap"] as const) {
    assert.match(t[k], HEX, k);
  }
}

// Feature: ui-visual-overhaul, Property 10: Setiap zona memiliki tema tile yang valid
// **Validates: Requirements 6.1, 6.2**
test("Property 10: semua ZoneType bertema valid dan koridor bertipe koridor", () => {
  assert.deepEqual(Object.keys(ZONE_THEMES).sort(), [...ALL_ZONES].sort());
  for (const z of ALL_ZONES) {
    const t = themeForZone(z);
    assertValid(t);
    assert.equal(t, ZONE_THEMES[z]);
    assert.notEqual(t.floor, "koridor");
  }
  assertValid(CORRIDOR_THEME);
  assert.equal(CORRIDOR_THEME.floor, "koridor");
});

test("pemetaan zona ke jenis lantai", () => {
  const expected: Record<ZoneType, string> = {
    las: "beton",
    "cetak-3d": "keramik",
    "elektronik-iot": "keramik",
    "gudang-alat": "beton",
    pemrograman: "karpet",
    diskusi: "kayu",
    istirahat: "karpet",
    konsultasi: "kayu",
    "ruang-dosen": "kayu",
    "studio-desain": "kayu",
    "pojok-baca": "karpet",
  };
  for (const z of ALL_ZONES) assert.equal(themeForZone(z).floor, expected[z]);
});

test("setiap zona LAB_MAP punya tema", () => {
  assert.equal(LAB_MAP.zones.length, 11);
  for (const zone of LAB_MAP.zones) {
    assert.ok(ZONE_THEMES[zone.id], zone.id);
    assertValid(themeForZone(zone.id));
  }
});
