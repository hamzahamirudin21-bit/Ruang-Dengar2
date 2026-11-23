import test from 'node:test';
import assert from 'node:assert/strict';
import { LAB_MAP } from '../data/map';
import { mulberry32 } from './rng';
import {
  buildNavigationGrid,
  findPath,
  isPointWalkable,
  pickRandomWalkablePoint,
} from './pathfinding';

test('semua 11 zona dan slot berdiri dapat dicapai oleh A* tanpa menabrak dinding pada kedua mode pintu', () => {
  const modes = ['lab', 'samping'] as const;
  const startPoints = [
    { x: 15, y: 9 }, // koridor utara
    { x: 3, y: 15 }, // pemrograman
    { x: 35, y: 5 }, // gudang alat
    { x: 34, y: 20 }, // ruang dosen
    { x: 45, y: 5 }, // studio desain
    { x: 45, y: 18 }, // pojok baca
  ];

  for (const mode of modes) {
    const grid = buildNavigationGrid(LAB_MAP, mode);
    assert.equal(LAB_MAP.zones.length, 11);

    for (const start of startPoints) {
      assert.equal(
        isPointWalkable(grid, start),
        true,
        `Titik awal (${start.x},${start.y}) harus dapat dilalui pada mode ${mode}`
      );

      for (const zone of LAB_MAP.zones) {
        assert.ok(
          zone.standingSlots.length >= 4 && zone.standingSlots.length <= 6,
          `Zona ${zone.id} harus memiliki 4-6 slot berdiri`
        );

        for (const slot of zone.standingSlots) {
          const path = findPath(grid, start, slot);
          assert.ok(
            path !== null && path.length >= 1,
            `Jalur A* dari (${start.x},${start.y}) ke ${zone.id} slot (${slot.x},${slot.y}) gagal pada mode ${mode}`
          );
          if (!path) continue;

          for (let i = 0; i < path.length; i += 1) {
            assert.equal(
              isPointWalkable(grid, path[i]),
              true,
              `Langkah jalur (${path[i].x},${path[i].y}) menabrak dinding/objek`
            );
            if (i > 0) {
              const dist: number =
                Math.abs(path[i].x - path[i - 1].x) +
                Math.abs(path[i].y - path[i - 1].y);
              assert.equal(dist, 1, 'Langkah A* harus ortogonal tepat 1 petak');
            }
          }
        }
      }
    }
  }
});

test('mode pintu Ruang Konsultasi benar-benar mengubah jalur A* melalui pintu yang dipilih', () => {
  const gridLab = buildNavigationGrid(LAB_MAP, 'lab');
  const gridSamping = buildNavigationGrid(LAB_MAP, 'samping');

  // Pada mode 'lab', titik (30,13) terbuka dan (35,15) tertutup
  assert.equal(isPointWalkable(gridLab, { x: 30, y: 13 }), true);
  assert.equal(isPointWalkable(gridLab, { x: 35, y: 15 }), false);

  // Pada mode 'samping', titik (30,13) tertutup dan (35,15) terbuka
  assert.equal(isPointWalkable(gridSamping, { x: 30, y: 13 }), false);
  assert.equal(isPointWalkable(gridSamping, { x: 35, y: 15 }), true);

  const pathLab = findPath(gridLab, { x: 29, y: 13 }, { x: 32, y: 13 });
  assert.ok(pathLab !== null);
  assert.ok(pathLab.some((p) => p.x === 30 && p.y === 13));

  const pathSide = findPath(gridSamping, { x: 29, y: 13 }, { x: 32, y: 13 });
  assert.ok(pathSide !== null);
  assert.ok(pathSide.some((p) => (p.x === 35 || p.x === 36) && p.y === 15));
});

test('pickRandomWalkablePoint mengembalikan titik yang selalu dapat dilalui secara deterministik', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  const rng1 = mulberry32(12345);
  const rng2 = mulberry32(12345);

  for (let i = 0; i < 10; i += 1) {
    const p1 = pickRandomWalkablePoint(grid, rng1);
    const p2 = pickRandomWalkablePoint(grid, rng2);
    assert.deepEqual(p1, p2);
    assert.equal(isPointWalkable(grid, p1), true);
  }
});

test('findPath mengembalikan null jika tujuan berada di dalam dinding', () => {
  const grid = buildNavigationGrid(LAB_MAP, 'lab');
  assert.equal(findPath(grid, { x: 15, y: 9 }, { x: 0, y: 0 }), null);
});
