import { test } from "node:test";
import assert from "node:assert/strict";
import { LAB_MAP } from "../../data/map";
import { drawTilemap, getTilemapCanvas, type TilemapSurface } from "./tilemapCache";

// **Validates: Requirements 11.1, 11.2, 11.3, 11.4**
function fakeFactory(counter?: { n: number }) {
  return (w: number, h: number): TilemapSurface => {
    if (counter) counter.n++;
    const ctx = { fillStyle: "", fillRect() {} };
    return { width: w, height: h, getContext: () => ctx } as unknown as TilemapSurface;
  };
}

test("objek sama untuk mode sama, berbeda untuk mode berbeda", () => {
  const counter = { n: 0 };
  const f = fakeFactory(counter);
  const a = getTilemapCanvas(LAB_MAP, "lab", f);
  const b = getTilemapCanvas(LAB_MAP, "lab", f);
  const c = getTilemapCanvas(LAB_MAP, "samping", f);
  assert.ok(a);
  assert.equal(a, b);
  assert.notEqual(a, c);
  assert.equal(counter.n, 2);
});

test("drawTilemap mematikan imageSmoothingEnabled", () => {
  const calls: unknown[][] = [];
  const ctx = {
    imageSmoothingEnabled: true,
    drawImage(...args: unknown[]) {
      calls.push([ctx.imageSmoothingEnabled, ...args]);
    },
  };
  const surface = getTilemapCanvas(LAB_MAP, "lab", fakeFactory())!;
  drawTilemap(ctx as unknown as CanvasRenderingContext2D, surface, LAB_MAP);
  assert.equal(ctx.imageSmoothingEnabled, false);
  assert.equal(calls[0][0], false);
});

test("null bila factory gagal atau konteks tak tersedia", () => {
  // Peta baru agar tak terkena cache.
  const map = { ...LAB_MAP };
  assert.equal(getTilemapCanvas(map, "lab", () => null), null);
  assert.equal(
    getTilemapCanvas(map, "lab", () => ({ getContext: () => null }) as unknown as TilemapSurface),
    null,
  );
  assert.equal(
    getTilemapCanvas(map, "lab", () => {
      throw new Error("x");
    }),
    null,
  );
});
