import { ConsultationDoorMode, GridPoint, LabMapData } from '../types';
import { SeededRng, randomInt } from './rng';

export interface NavigationGrid {
  width: number;
  height: number;
  /** 0 = dapat dilalui, 1 = terhalang dinding/perabot/pintu tertutup */
  cells: Uint8Array;
}

function setRectBlocked(
  cells: Uint8Array,
  width: number,
  height: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
  blockedValue: 0 | 1
): void {
  for (let y = ry; y < ry + rh; y += 1) {
    if (y < 0 || y >= height) continue;
    for (let x = rx; x < rx + rw; x += 1) {
      if (x < 0 || x >= width) continue;
      cells[y * width + x] = blockedValue;
    }
  }
}

export function buildNavigationGrid(
  map: LabMapData,
  doorMode: ConsultationDoorMode
): NavigationGrid {
  const cells = new Uint8Array(map.width * map.height);

  for (const wall of map.walls) {
    setRectBlocked(cells, map.width, map.height, wall.x, wall.y, wall.w, wall.h, 1);
  }

  for (const divider of map.lowDividers) {
    setRectBlocked(
      cells,
      map.width,
      map.height,
      divider.x,
      divider.y,
      divider.w,
      divider.h,
      1
    );
  }

  for (const item of map.furniture) {
    if (!item.walkable) {
      setRectBlocked(
        cells,
        map.width,
        map.height,
        item.rect.x,
        item.rect.y,
        item.rect.w,
        item.rect.h,
        1
      );
    }
  }

  // Terapkan mode pintu Ruang Konsultasi (dan pastikan pintu lain terbuka)
  for (const door of map.doors) {
    const isBlocked = door.mode !== undefined && door.mode !== doorMode;
    for (const tile of door.tiles) {
      if (tile.x >= 0 && tile.x < map.width && tile.y >= 0 && tile.y < map.height) {
        cells[tile.y * map.width + tile.x] = isBlocked ? 1 : 0;
      }
    }
  }

  return {
    width: map.width,
    height: map.height,
    cells,
  };
}

export function isPointWalkable(grid: NavigationGrid, point: GridPoint): boolean {
  if (
    point.x < 0 ||
    point.x >= grid.width ||
    point.y < 0 ||
    point.y >= grid.height
  ) {
    return false;
  }
  return grid.cells[point.y * grid.width + point.x] === 0;
}

const ORTHOGONAL_DIRS: readonly GridPoint[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

function manhattan(a: GridPoint, b: GridPoint): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Pencarian jalur A* ortogonal 4-arah yang menjamin tidak menabrak atau memotong sudut dinding.
 */
export function findPath(
  grid: NavigationGrid,
  start: GridPoint,
  goal: GridPoint
): GridPoint[] | null {
  if (!isPointWalkable(grid, start) || !isPointWalkable(grid, goal)) {
    return null;
  }

  if (start.x === goal.x && start.y === goal.y) {
    return [{ x: start.x, y: start.y }];
  }

  const total = grid.width * grid.height;
  const gScore = new Float64Array(total).fill(Infinity);
  const fScore = new Float64Array(total).fill(Infinity);
  const cameFrom = new Int32Array(total).fill(-1);
  const inOpen = new Uint8Array(total);
  const closed = new Uint8Array(total);

  const startIdx = start.y * grid.width + start.x;
  const goalIdx = goal.y * grid.width + goal.x;

  gScore[startIdx] = 0;
  fScore[startIdx] = manhattan(start, goal);
  const openList: number[] = [startIdx];
  inOpen[startIdx] = 1;

  while (openList.length > 0) {
    let bestPos = 0;
    let currentIdx = openList[0];
    let bestF = fScore[currentIdx];

    for (let i = 1; i < openList.length; i += 1) {
      const idx = openList[i];
      if (fScore[idx] < bestF) {
        bestF = fScore[idx];
        currentIdx = idx;
        bestPos = i;
      }
    }

    if (currentIdx === goalIdx) {
      const path: GridPoint[] = [];
      let trace = currentIdx;
      while (trace !== -1) {
        path.push({
          x: trace % grid.width,
          y: Math.floor(trace / grid.width),
        });
        trace = cameFrom[trace];
      }
      path.reverse();
      return path;
    }

    openList.splice(bestPos, 1);
    inOpen[currentIdx] = 0;
    closed[currentIdx] = 1;

    const cx = currentIdx % grid.width;
    const cy = Math.floor(currentIdx / grid.width);

    for (const dir of ORTHOGONAL_DIRS) {
      const nx = cx + dir.x;
      const ny = cy + dir.y;
      if (nx < 0 || nx >= grid.width || ny < 0 || ny >= grid.height) {
        continue;
      }
      const neighborIdx = ny * grid.width + nx;
      if (closed[neighborIdx] === 1 || grid.cells[neighborIdx] === 1) {
        continue;
      }

      const tentativeG = gScore[currentIdx] + 1;
      if (tentativeG < gScore[neighborIdx]) {
        cameFrom[neighborIdx] = currentIdx;
        gScore[neighborIdx] = tentativeG;
        fScore[neighborIdx] = tentativeG + manhattan({ x: nx, y: ny }, goal);
        if (inOpen[neighborIdx] === 0) {
          openList.push(neighborIdx);
          inOpen[neighborIdx] = 1;
        }
      }
    }
  }

  return null;
}

export function pickRandomWalkablePoint(
  grid: NavigationGrid,
  rng: SeededRng
): GridPoint {
  const walkable: GridPoint[] = [];
  for (let y = 1; y < grid.height - 1; y += 1) {
    for (let x = 1; x < grid.width - 1; x += 1) {
      if (grid.cells[y * grid.width + x] === 0) {
        walkable.push({ x, y });
      }
    }
  }
  if (walkable.length === 0) {
    return { x: 1, y: 1 };
  }
  const index = randomInt(rng, 0, walkable.length - 1);
  return walkable[index];
}
