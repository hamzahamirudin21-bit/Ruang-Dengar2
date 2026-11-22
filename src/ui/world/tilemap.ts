import type { ConsultationDoorMode, GridRect, LabMapData, ZoneType } from '../../types';
import type { PixelGrid } from '../characters/pixelGrid';
import { buildDecor, paintDecor } from './decor';
import { CORRIDOR_THEME, ZONE_THEMES, type FloorKind, type TileTheme } from './tileTheme';

/** Piksel seni per petak. */
export const ART_TILE = 14;
/** Piksel dunia per piksel seni (28 / 14). */
export const WORLD_PER_ART = 2;

export interface TileCell {
  floor: FloorKind;
  /** null = koridor. */
  zoneId: ZoneType | null;
  wall: null | {
    hasFaceBelow: boolean;
    neighbors: { n: boolean; e: boolean; s: boolean; w: boolean };
  };
  door: null | {
    orientation: 'horizontal' | 'vertical';
    active: boolean;
    zoneId: ZoneType;
  };
  /** Muka dinding berjendela (deterministik). */
  window: boolean;
}

export interface TileGrid {
  cols: number;
  rows: number;
  /** Indeks y * cols + x. */
  cells: readonly TileCell[];
}

function hashWindow(x: number, y: number): boolean {
  let h = (Math.imul(x + 1, 374761393) + Math.imul(y + 1, 668265263)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h & 3) !== 0;
}

function forEachTile(r: GridRect, cols: number, rows: number, fn: (x: number, y: number) => void): void {
  const x0 = Math.max(0, Math.floor(r.x));
  const y0 = Math.max(0, Math.floor(r.y));
  const x1 = Math.min(cols, Math.ceil(r.x + r.w));
  const y1 = Math.min(rows, Math.ceil(r.y + r.h));
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) fn(x, y);
  }
}

const NO_NEIGHBORS = { n: false, e: false, s: false, w: false };

export function buildTileGrid(map: LabMapData, doorMode: ConsultationDoorMode): TileGrid {
  const cols = Math.max(0, map.width);
  const rows = Math.max(0, map.height);
  const cells: TileCell[] = [];
  for (let i = 0; i < cols * rows; i++) {
    cells.push({ floor: 'koridor', zoneId: null, wall: null, door: null, window: false });
  }
  const at = (x: number, y: number): TileCell | undefined =>
    x < 0 || y < 0 || x >= cols || y >= rows ? undefined : cells[y * cols + x];

  for (const zone of map.zones) {
    const floor = ZONE_THEMES[zone.id]?.floor ?? 'koridor';
    forEachTile(zone.bounds, cols, rows, (x, y) => {
      const c = cells[y * cols + x];
      c.floor = floor;
      c.zoneId = zone.id;
    });
  }

  for (const w of map.walls) {
    forEachTile(w, cols, rows, (x, y) => {
      cells[y * cols + x].wall = { hasFaceBelow: false, neighbors: { ...NO_NEIGHBORS } };
    });
  }

  for (const door of map.doors) {
    const active = door.mode === undefined || door.mode === doorMode;
    for (const t of door.tiles) {
      const c = at(t.x, t.y);
      if (!c) continue;
      if (active) {
        c.wall = null;
        c.door = { orientation: door.orientation, active: true, zoneId: door.zoneId };
      } else {
        c.door = null;
        c.wall = { hasFaceBelow: false, neighbors: { ...NO_NEIGHBORS } };
      }
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = cells[y * cols + x];
      if (!c.wall) continue;
      const n = at(x, y - 1);
      const e = at(x + 1, y);
      const s = at(x, y + 1);
      const w = at(x - 1, y);
      c.wall.neighbors = { n: !!n?.wall, e: !!e?.wall, s: !!s?.wall, w: !!w?.wall };
      c.wall.hasFaceBelow = s !== undefined && s.wall === null;
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = cells[y * cols + x];
      if (!c.wall || !c.wall.hasFaceBelow) continue;
      // Jendela hanya pada bentang dinding lurus (tetangga timur dan barat dinding).
      if (c.wall.neighbors.e && c.wall.neighbors.w && x % 3 === 1 && hashWindow(x, y)) {
        c.window = true;
      }
    }
  }

  return { cols, rows, cells };
}

// ===================================================================== komposisi

const T = ART_TILE;

function hash3(a: number, b: number, salt = 0): number {
  let h = (Math.imul(a + 1, 374761393) + Math.imul(b + 1, 668265263) + Math.imul(salt + 1, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

const shadeCache = new Map<string, string>();
/** Menerangkan (f > 0) atau menggelapkan (f < 0) warna #rrggbb. */
function shade(hex: string, f: number): string {
  const key = `${hex}|${f}`;
  const hit = shadeCache.get(key);
  if (hit) return hit;
  const ch = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  const target = f >= 0 ? 255 : 0;
  const a = Math.abs(f);
  const h = (v: number) => Math.round(v + (target - v) * a).toString(16).padStart(2, '0');
  const out = `#${h(ch(1))}${h(ch(3))}${h(ch(5))}`;
  shadeCache.set(key, out);
  return out;
}

const OUTLINE = '#3a3550';
const CAP_BASE = '#b9c3d6';
const WOOD = '#8a5a34';
const BRICK_ZONES: ReadonlySet<ZoneType | null> = new Set<ZoneType | null>(['las', 'gudang-alat', 'istirahat']);

// ------------------------------------------------------------------ lantai

function floorColor(kind: FloorKind, th: TileTheme, gx: number, gy: number): string {
  switch (kind) {
    case 'kayu': {
      const row = Math.floor(gy / 7);
      const ly = gy % 7;
      const px = gx + ((row * 17) % 42);
      const plank = Math.floor(px / 42);
      const lx = px % 42;
      const tone = hash3(plank, row, 1) % 3;
      const col = tone === 0 ? th.base : tone === 1 ? th.alt : shade(th.base, 0.05);
      if (ly === 6) return shade(th.accent, -0.1);
      if (lx === 41) return shade(col, -0.3);
      if (ly === 0) return shade(col, 0.14);
      if ((lx === 2 || lx === 39) && ly === 3) return shade(col, -0.32); // paku
      if ((ly === 2 || ly === 4) && hash3(plank * 8 + row, ly, gx >> 2) % 4 === 0 && (gx & 3) < 3) {
        return shade(col, -0.1); // serat
      }
      if (ly === 3 && hash3(plank, row, gx >> 3) % 7 === 0 && (gx & 7) < 2) return shade(col, 0.08);
      return col;
    }
    case 'keramik':
    case 'koridor': {
      const size = kind === 'koridor' ? 14 : 7;
      const tx = Math.floor(gx / size);
      const ty = Math.floor(gy / size);
      const lx = gx % size;
      const ly = gy % size;
      const col = (tx + ty) % 2 === 0 ? th.base : th.alt;
      if (lx === size - 1 || ly === size - 1) return th.accent; // nat
      if (ly === 0 || lx === 0) return shade(col, 0.1); // tepi terang
      if (lx === ly && lx >= 2 && lx <= (kind === 'koridor' ? 6 : 3) && hash3(tx, ty, 2) % 3 === 0) {
        return shade(col, 0.28); // kilau
      }
      if (hash3(gx, gy, 9) % 53 === 0) return shade(col, -0.05);
      return col;
    }
    case 'beton': {
      const sx = Math.floor(gx / 28);
      const sy = Math.floor(gy / 28);
      const lx = gx % 28;
      const ly = gy % 28;
      if (lx === 0 || ly === 0) return shade(th.base, -0.16); // sambungan pelat
      if (lx === 1 || ly === 1) return shade(th.base, 0.04);
      // retak halus pada sebagian pelat
      if (hash3(sx, sy, 4) % 4 === 0) {
        const cx = 5 + (hash3(sx, sy, 5) % 10);
        const cy = 4 + (hash3(sx, sy, 6) % 14);
        const dx = lx - cx;
        if (dx >= 0 && dx < 10 && ly === cy + (dx >> 1) + (dx === 5 ? 1 : 0)) return shade(th.base, -0.28);
      }
      if (hash3(gx >> 2, gy >> 2, 4) % 6 === 0) return shade(th.base, -0.05); // bercak
      const h = hash3(gx, gy, 3) % 100;
      if (h < 6) return shade(th.base, -0.08);
      if (h < 10) return shade(th.base, 0.07);
      return th.base;
    }
    case 'karpet': {
      const dx = Math.abs((gx % 14) - 6.5);
      const dy = Math.abs((gy % 14) - 6.5);
      if (dx + dy > 5.9 && dx + dy < 7.1) return shade(th.accent, 0.08); // motif belah ketupat
      if (dx + dy < 1.1) return shade(th.alt, 0.12);
      const weave = ((gx >> 1) + gy) % 2 === 0 ? th.base : th.alt;
      if (hash3(gx, gy, 7) % 11 === 0) return shade(weave, 0.1);
      return weave;
    }
  }
}

// ------------------------------------------------------------------ pelukisan

export function composeTilemapGrid(map: LabMapData, doorMode: ConsultationDoorMode): PixelGrid {
  const tg = buildTileGrid(map, doorMode);
  const { cols, rows, cells: tiles } = tg;
  const width = cols * T;
  const height = rows * T;
  const out: string[] = new Array(width * height).fill(CORRIDOR_THEME.base);
  const put = (gx: number, gy: number, c: string) => {
    if (gx >= 0 && gy >= 0 && gx < width && gy < height) out[gy * width + gx] = c;
  };
  const get = (gx: number, gy: number): string => out[gy * width + gx];
  const tileAt = (x: number, y: number): TileCell | undefined =>
    x < 0 || y < 0 || x >= cols || y >= rows ? undefined : tiles[y * cols + x];
  const themeOf = (c: TileCell | undefined): TileTheme =>
    c && c.zoneId ? (ZONE_THEMES[c.zoneId] ?? CORRIDOR_THEME) : CORRIDOR_THEME;

  const paintFloor = (x: number, y: number, c: TileCell) => {
    const th = themeOf(c);
    const kind = c.zoneId ? c.floor : 'koridor';
    const n = tileAt(x, y - 1);
    const s = tileAt(x, y + 1);
    const w = tileAt(x - 1, y);
    const e = tileAt(x + 1, y);
    for (let ly = 0; ly < T; ly++) {
      for (let lx = 0; lx < T; lx++) {
        const gx = x * T + lx;
        const gy = y * T + ly;
        let col = floorColor(kind, th, gx, gy);
        // bayangan jatuh dari muka dinding di utara dan dari dinding di barat
        if (n?.wall) col = shade(col, ly === 0 ? -0.34 : ly === 1 ? -0.22 : ly === 2 ? -0.12 : ly === 3 ? -0.05 : 0);
        if (w?.wall && lx < 2) col = shade(col, lx === 0 ? -0.24 : -0.12);
        // bingkai tepi zona
        if (c.zoneId) {
          const diff = (o: TileCell | undefined) => !!o && !o.wall && !o.door && o.zoneId !== c.zoneId;
          if (
            (ly === T - 1 && diff(s)) ||
            (ly === 0 && diff(n) && !n?.wall) ||
            (lx === 0 && diff(w) && !w?.wall) ||
            (lx === T - 1 && diff(e))
          ) {
            col = shade(col, -0.22);
          }
        }
        // garis penanda K3 kuning di depan dinding selatan Stasiun Las
        if (c.zoneId === 'las' && s?.wall && ly >= 10 && ly <= 11 && (gx % 8) < 5) col = '#d9a21b';
        put(gx, gy, col);
      }
    }
  };

  const capColor = (gx: number, gy: number): string =>
    hash3(gx, gy, 12) % 17 === 0 ? shade(CAP_BASE, -0.06) : CAP_BASE;

  const paintWall = (x: number, y: number, c: TileCell) => {
    const wall = c.wall!;
    const nb = wall.neighbors;
    const capH = wall.hasFaceBelow ? 4 : T;
    const south = tileAt(x, y + 1);
    const zone = south?.zoneId ?? null;
    const th = themeOf(south);
    const brick = BRICK_ZONES.has(zone);
    for (let ly = 0; ly < T; ly++) {
      for (let lx = 0; lx < T; lx++) {
        const gx = x * T + lx;
        const gy = y * T + ly;
        let col: string;
        if (ly < capH) {
          col = capColor(gx, gy);
          if (ly === 0 && !nb.n) col = shade(CAP_BASE, 0.35);
          if (lx === 0 && !nb.w) col = shade(CAP_BASE, 0.28);
          if (lx === T - 1 && !nb.e) col = shade(CAP_BASE, -0.3);
          if (ly === capH - 1) col = wall.hasFaceBelow ? shade(CAP_BASE, -0.38) : !nb.s ? shade(CAP_BASE, -0.34) : col;
        } else {
          const fy = ly - 4;
          const face = th.wallFace;
          if (brick) {
            const course = Math.floor(fy / 3);
            const off = course % 2 === 1 ? 3 : 0;
            const bx = Math.floor((gx + off) / 6);
            col = shade(face, ((hash3(bx, course + y * 4, 21) % 5) - 2) * 0.03);
            if (fy % 3 === 2 || (gx + off) % 6 === 5) col = shade(face, -0.3);
            else if (fy % 3 === 0) col = shade(col, 0.1);
          } else {
            col = face;
            if (fy >= 6) {
              col = shade(face, -0.14);
              if (fy === 6) col = shade(face, 0.2); // pelipit wainscot
            } else if (gx % 7 === 0) col = shade(face, -0.12);
            else if (gx % 7 === 1) col = shade(face, 0.07);
            if (fy === 0) col = shade(face, -0.22); // bayangan bawah tepi atas
          }
          if (fy === 9) col = shade(face, -0.42); // plint
          if (lx === 0 && !nb.w) col = shade(col, 0.12);
          if (lx === T - 1 && !nb.e) col = shade(col, -0.3);
          if (c.window && lx >= 2 && lx <= 11 && fy >= 1 && fy <= 8) col = windowPixel(lx, fy, col);
        }
        put(gx, gy, col);
      }
    }
  };

  const windowPixel = (lx: number, fy: number, fallback: string): string => {
    const FRAME = '#efe8d4';
    const FRAME_D = '#a79b80';
    if (fy === 8) return lx >= 2 && lx <= 11 ? '#f6f0de' : fallback; // ambang
    // bingkai lx 2..11, fy 1..7; kaca lx 3..10, fy 2..6
    if (lx < 2 || lx > 11 || fy > 7) return fallback;
    if (lx === 2 || fy === 1) return OUTLINE;
    if (lx === 11 || fy === 7) return FRAME_D;
    if (lx === 6 || fy === 4) return FRAME;
    const sky = fy <= 3 ? '#5fb4e8' : '#a8dcf6';
    if ((lx === 3 && fy === 2) || (lx === 4 && fy === 3) || (lx === 7 && fy === 5) || (lx === 8 && fy === 6)) {
      return '#ffffff';
    }
    if (lx >= 8 && fy === 3) return '#e8f8ff'; // awan
    return sky;
  };

  const paintDoor = (x: number, y: number, c: TileCell) => {
    const door = c.door!;
    const horizontal = door.orientation === 'horizontal';
    const sameDoor = (o: TileCell | undefined) => !!o?.door && o.door.orientation === door.orientation;
    const first = horizontal ? !sameDoor(tileAt(x - 1, y)) : !sameDoor(tileAt(x, y - 1));
    const last = horizontal ? !sameDoor(tileAt(x + 1, y)) : !sameDoor(tileAt(x, y + 1));
    const th = themeOf(c);
    for (let ly = 0; ly < T; ly++) {
      for (let lx = 0; lx < T; lx++) {
        const gx = x * T + lx;
        const gy = y * T + ly;
        let col = floorColor('koridor', th, gx, gy);
        if (horizontal) {
          if (ly <= 2) col = ly === 0 ? '#c68d56' : ly === 1 ? WOOD : '#5f3d22'; // ambang atas
          else if (ly === 3) col = shade(col, -0.45);
          else if (ly === 4) col = shade(col, -0.28);
          else if (ly === 5) col = shade(col, -0.12);
          if (ly >= 11 && ly <= 12) col = ly === 11 ? '#f1e3b4' : '#d9c58c'; // ambang lantai
          if (first && lx <= 1) col = lx === 0 ? OUTLINE : '#c68d56';
          if (last && lx >= T - 2) col = lx === T - 1 ? OUTLINE : '#5f3d22';
          if (first && lx >= 2 && lx <= 3 && ly >= 3 && ly <= 10) {
            // daun pintu terbuka (tampak tipis)
            col = lx === 2 ? '#d19a5e' : '#8a5a34';
            if (ly === 3) col = OUTLINE;
            if (lx === 3 && ly === 7) col = '#ffd45a'; // gagang
          }
        } else {
          if (lx === 0) col = shade(col, -0.2);
          if (ly <= 1) col = ly === 0 ? '#c68d56' : WOOD; // kusen atas
          else if (ly === 2) col = shade(col, -0.4);
          else if (ly === 3) col = shade(col, -0.2);
          if (ly >= T - 2) col = ly === T - 2 ? WOOD : '#5f3d22'; // kusen bawah
          if (ly === T - 3) col = shade(col, -0.2);
          if (lx >= 5 && lx <= 6 && ly >= 4 && ly <= 11) col = lx === 5 ? '#f1e3b4' : '#d9c58c'; // ambang lantai
          if (first && ly >= 2 && ly <= 3 && lx >= 1 && lx <= 9) {
            col = ly === 2 ? '#d19a5e' : '#8a5a34';
            if (lx === 9 && ly === 3) col = '#ffd45a';
          }
        }
        put(gx, gy, col);
      }
    }
  };

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = tiles[y * cols + x];
      if (c.wall || c.door) continue;
      paintFloor(x, y, c);
    }
  }
  // lantai di bawah dinding (untuk petak dinding yang tidak melukis seluruh petak)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = tiles[y * cols + x];
      if (c.wall) paintWall(x, y, c);
      else if (c.door) paintDoor(x, y, c);
    }
  }

  // ---- pembatas rendah
  const divCells = new Set<number>();
  const divHorizontal = new Map<number, boolean>();
  for (const d of map.lowDividers) {
    const horiz = d.w >= d.h;
    forEachTile(d, cols, rows, (x, y) => {
      divCells.add(y * cols + x);
      divHorizontal.set(y * cols + x, horiz);
    });
  }
  const darken = (gx: number, gy: number, f: number) => {
    if (gx >= 0 && gy >= 0 && gx < width && gy < height) put(gx, gy, shade(get(gx, gy), f));
  };
  for (const key of divCells) {
    const x = key % cols;
    const y = Math.floor(key / cols);
    const horiz = divHorizontal.get(key)!;
    const hasD = (dx: number, dy: number) => divCells.has((y + dy) * cols + (x + dx));
    for (let ly = 0; ly < T; ly++) {
      for (let lx = 0; lx < T; lx++) {
        const gx = x * T + lx;
        const gy = y * T + ly;
        if (horiz) {
          const endL = !hasD(-1, 0) && lx === 0;
          const endR = !hasD(1, 0) && lx === T - 1;
          if (ly >= 12 && ly <= 13) {
            darken(gx, gy, ly === 12 ? -0.32 : -0.16);
            continue;
          }
          if (ly < 3 || ly > 11) continue;
          let col: string;
          if (ly === 3) col = OUTLINE;
          else if (ly === 4) col = '#f0f3f9';
          else if (ly === 5) col = '#cfd6e4';
          else if (ly === 6) col = '#8f9ab0';
          else if (ly === 11) col = OUTLINE;
          else col = lx % 4 === 0 ? '#8294bb' : '#6f7fa3';
          if (ly === 7) col = shade(col, -0.2);
          if (endL || endR) col = OUTLINE;
          put(gx, gy, col);
        } else {
          if (lx >= 10 && lx <= 11 && ly >= 3) {
            darken(gx, gy, lx === 10 ? -0.3 : -0.14);
            continue;
          }
          if (lx < 3 || lx > 9) continue;
          const top = !hasD(0, -1);
          const bottom = !hasD(0, 1);
          if (top && ly < 2) continue;
          if (ly > 12 && bottom) continue;
          let col: string;
          if (lx === 3 || lx === 9) col = OUTLINE;
          else if (top && ly === 2) col = OUTLINE;
          else if (top && ly <= 4) col = ly === 3 ? '#f0f3f9' : '#cfd6e4';
          else if (top && ly === 5) col = '#8f9ab0';
          else if (bottom && ly === 12) col = OUTLINE;
          else col = ly % 4 === 0 ? '#8294bb' : lx === 4 ? '#8294bb' : '#6f7fa3';
          put(gx, gy, col);
        }
      }
    }
  }

  // ---- dekor muka-dinding
  for (const item of buildDecor(map, tg)) {
    if (item.placement !== 'muka-dinding') continue;
    const art = paintDecor(item.kind);
    let minX = art.width;
    let maxX = -1;
    let minY = art.height;
    let maxY = -1;
    for (let ay = 0; ay < art.height; ay++) {
      for (let ax = 0; ax < art.width; ax++) {
        if (!art.cells[ay * art.width + ax]) continue;
        minX = Math.min(minX, ax);
        maxX = Math.max(maxX, ax);
        minY = Math.min(minY, ay);
        maxY = Math.max(maxY, ay);
      }
    }
    if (maxX < 0) continue;
    const h = maxY - minY + 1;
    // muka dinding menempati baris 4..13 petak; pusatkan vertikal bila muat
    const top = 4 + Math.max(0, Math.floor((10 - h) / 2));
    const baseX = item.tile.x * T;
    const baseY = item.tile.y * T;
    const inFace = (gx: number, gy: number) =>
      gx >= baseX && gx < baseX + T && gy >= baseY + 4 && gy < baseY + T - 1;
    for (let ay = minY; ay <= maxY; ay++) {
      for (let ax = minX; ax <= maxX; ax++) {
        if (!art.cells[ay * art.width + ax]) continue;
        const gx = baseX + ax;
        const gy = baseY + top + (ay - minY);
        if (inFace(gx + 1, gy + 1) && !art.cells[(ay + 1) * art.width + ax + 1]) darken(gx + 1, gy + 1, -0.3);
      }
    }
    for (let ay = minY; ay <= maxY; ay++) {
      for (let ax = minX; ax <= maxX; ax++) {
        const c = art.cells[ay * art.width + ax];
        if (!c) continue;
        const gx = baseX + ax;
        const gy = baseY + top + (ay - minY);
        if (inFace(gx, gy)) put(gx, gy, c);
      }
    }
  }

  return { width, height, cells: out };
}
