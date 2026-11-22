import type { GridRect, LabMapData, ZoneType } from '../../types';
import type { PixelGrid } from '../characters/pixelGrid';
import { ART_TILE, type TileGrid } from './tilemap';

export type DecorKind =
  | 'tanaman'
  | 'papan-pengumuman'
  | 'poster'
  | 'jam'
  | 'papan-tulis'
  | 'tong-sampah'
  | 'lampu-lantai';

export interface DecorItem {
  kind: DecorKind;
  tile: { x: number; y: number };
  placement: 'muka-dinding' | 'lantai';
}

// ---------------------------------------------------------------- penempatan

function hash(a: number, b: number, salt = 0): number {
  let h = (Math.imul(a + 1, 374761393) + Math.imul(b + 1, 668265263) + Math.imul(salt + 1, 2246822519)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

function zoneSalt(id: string): number {
  let s = 7;
  for (let i = 0; i < id.length; i++) s = (Math.imul(s, 31) + id.charCodeAt(i)) | 0;
  return s >>> 0;
}

function inRect(r: GridRect, x: number, y: number): boolean {
  return x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
}

/** Tata letak dekor muka-dinding per zona (zona = lantai di bawah dinding). */
const WALL_PLAN: Readonly<Record<ZoneType, readonly DecorKind[]>> = {
  las: ['poster'],
  'cetak-3d': ['poster'],
  'elektronik-iot': ['papan-tulis'],
  'gudang-alat': [],
  pemrograman: ['papan-tulis'],
  diskusi: ['papan-tulis', 'jam'],
  istirahat: ['poster', 'jam'],
  konsultasi: ['poster'],
  'ruang-dosen': ['jam'],
};
const CORRIDOR_WALL_PLAN: readonly DecorKind[] = ['papan-pengumuman', 'jam'];

/** Dekor lantai per zona; tanaman di sudut zona yang nyaman. */
const FLOOR_PLAN: Readonly<Partial<Record<ZoneType, readonly DecorKind[]>>> = {
  istirahat: ['tanaman', 'tong-sampah'],
  diskusi: ['tanaman'],
  konsultasi: ['tanaman'],
  'ruang-dosen': ['tanaman', 'lampu-lantai'],
};

export function buildDecor(map: LabMapData, grid: TileGrid): readonly DecorItem[] {
  const { cols, rows, cells } = grid;
  const cellAt = (x: number, y: number) => (x < 0 || y < 0 || x >= cols || y >= rows ? undefined : cells[y * cols + x]);

  // Petak terlarang untuk dekor: perabot, slot, jalur masuk, pintu (semua mode), dan tetangga pintu.
  const blocked = new Set<number>();
  const block = (x: number, y: number) => {
    if (x >= 0 && y >= 0 && x < cols && y < rows) blocked.add(y * cols + x);
  };
  for (const f of map.furniture) {
    for (let y = Math.floor(f.rect.y); y < Math.ceil(f.rect.y + f.rect.h); y++) {
      for (let x = Math.floor(f.rect.x); x < Math.ceil(f.rect.x + f.rect.w); x++) block(x, y);
    }
  }
  for (const d of map.lowDividers) {
    for (let y = Math.floor(d.y); y < Math.ceil(d.y + d.h); y++) {
      for (let x = Math.floor(d.x); x < Math.ceil(d.x + d.w); x++) block(x, y);
    }
  }
  for (const z of map.zones) {
    for (const p of [...z.standingSlots, ...z.entrances]) block(p.x, p.y);
  }
  for (const door of map.doors) {
    for (const t of door.tiles) {
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) block(t.x + dx, t.y + dy);
    }
  }
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) if (cells[y * cols + x].door) block(x, y);
  }

  const items: DecorItem[] = [];
  const taken = new Set<number>();
  const place = (kind: DecorKind, x: number, y: number, placement: DecorItem['placement']) => {
    items.push({ kind, tile: { x, y }, placement });
    taken.add(y * cols + x);
  };

  // ---- muka-dinding
  interface WallSpot {
    x: number;
    y: number;
    zone: ZoneType | null;
  }
  const spots: WallSpot[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = cells[y * cols + x];
      if (!c.wall || !c.wall.hasFaceBelow || c.window) continue;
      if (blocked.has(y * cols + x)) continue;
      if (!c.wall.neighbors.e || !c.wall.neighbors.w) continue;
      spots.push({ x, y, zone: cellAt(x, y + 1)?.zoneId ?? null });
    }
  }
  const tooClose = (s: WallSpot) =>
    items.some((it) => it.placement === 'muka-dinding' && it.tile.y === s.y && Math.abs(it.tile.x - s.x) < 4);

  const placeWall = (kind: DecorKind, pool: readonly WallSpot[], salt: number): boolean => {
    const free = pool.filter((s) => !taken.has(s.y * cols + s.x) && !tooClose(s));
    if (free.length === 0) return false;
    const s = free[hash(free.length, salt, 11) % free.length];
    place(kind, s.x, s.y, 'muka-dinding');
    return true;
  };

  for (const zone of map.zones) {
    const salt = zoneSalt(zone.id);
    const pool = spots.filter((s) => s.zone === zone.id);
    WALL_PLAN[zone.id].forEach((kind, i) => placeWall(kind, pool, salt + i));
  }
  const corridor = spots.filter((s) => s.zone === null);
  CORRIDOR_WALL_PLAN.forEach((kind, i) => placeWall(kind, corridor, 101 + i));
  if (!items.some((it) => it.kind === 'papan-pengumuman')) placeWall('papan-pengumuman', spots, 211);

  // ---- lantai
  const freeFloor = (x: number, y: number): boolean => {
    const c = cellAt(x, y);
    return !!c && !c.wall && !c.door && !blocked.has(y * cols + x) && !taken.has(y * cols + x);
  };
  const placeFloor = (kind: DecorKind, zone: { bounds: GridRect; id: string }, salt: number): boolean => {
    const b = zone.bounds;
    const x0 = Math.floor(b.x);
    const y0 = Math.floor(b.y);
    const x1 = Math.ceil(b.x + b.w) - 1;
    const y1 = Math.ceil(b.y + b.h) - 1;
    const corners: [number, number][] = [
      [x0, y0],
      [x1, y0],
      [x0, y1],
      [x1, y1],
    ];
    const start = hash(salt, 3, 5) % 4;
    let best: [number, number] | null = null;
    let bestD = Infinity;
    for (let k = 0; k < 4; k++) {
      const [cx, cy] = corners[(start + k) % 4];
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          if (!inRect(b, x, y) || !freeFloor(x, y) || cellAt(x, y)?.zoneId !== zone.id) continue;
          const d = Math.abs(x - cx) + Math.abs(y - cy);
          if (d < bestD) {
            bestD = d;
            best = [x, y];
          }
        }
      }
      if (best) break;
    }
    if (!best) return false;
    place(kind, best[0], best[1], 'lantai');
    return true;
  };

  for (const zone of map.zones) {
    const plan = FLOOR_PLAN[zone.id];
    if (!plan) continue;
    const salt = zoneSalt(zone.id);
    plan.forEach((kind, i) => placeFloor(kind, zone, salt + i * 17));
  }
  if (!items.some((it) => it.kind === 'tanaman')) {
    for (const zone of map.zones) {
      if (placeFloor('tanaman', zone, 997)) break;
    }
  }

  return items;
}

// ---------------------------------------------------------------- pelukis

const OUT = '#2b2433';

function shade(hex: string, f: number): string {
  const ch = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  const t = f >= 0 ? 255 : 0;
  const a = Math.abs(f);
  const h = (v: number) => Math.round(v + (t - v) * a).toString(16).padStart(2, '0');
  return `#${h(ch(1))}${h(ch(3))}${h(ch(5))}`;
}

class Canvas {
  readonly cells: (string | null)[];
  constructor(
    readonly w: number,
    readonly h: number,
  ) {
    this.cells = new Array(w * h).fill(null);
  }
  px(x: number, y: number, c: string): void {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y * this.w + x] = c;
  }
  rect(x: number, y: number, w: number, h: number, c: string): void {
    for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) this.px(xx, yy, c);
  }
  /** Kotak berkontur gelap dengan isi dan sorot tepi atas. */
  framed(x: number, y: number, w: number, h: number, fill: string): void {
    this.rect(x, y, w, h, OUT);
    this.rect(x + 1, y + 1, w - 2, h - 2, fill);
    this.rect(x + 1, y + 1, w - 2, 1, shade(fill, 0.3));
  }
  grid(): PixelGrid {
    return { width: this.w, height: this.h, cells: this.cells };
  }
}

function paintPlant(): PixelGrid {
  const c = new Canvas(ART_TILE, 22);
  c.rect(3, 21, 8, 1, '#3d3342'); // bayangan kontak
  // pot terakota
  c.rect(3, 14, 8, 7, OUT);
  c.rect(4, 15, 6, 5, '#c8693f');
  c.rect(4, 15, 6, 1, '#e6925f');
  c.rect(4, 19, 6, 1, '#9a4b2b');
  c.rect(2, 13, 10, 2, OUT);
  c.rect(3, 13, 8, 1, '#de8350');
  c.rect(5, 14, 4, 1, '#4a3322'); // tanah
  // daun berlapis
  const dark = '#2f7d43';
  const mid = '#44a35a';
  const light = '#7ad98a';
  c.rect(6, 3, 2, 10, OUT);
  c.rect(2, 8, 4, 4, OUT);
  c.rect(8, 8, 4, 4, OUT);
  c.rect(4, 4, 6, 6, OUT);
  c.rect(3, 9, 2, 2, dark);
  c.rect(9, 9, 2, 2, dark);
  c.rect(5, 5, 4, 5, mid);
  c.rect(6, 4, 2, 1, mid);
  c.rect(6, 4, 1, 4, light);
  c.px(5, 6, light);
  c.px(3, 9, mid);
  c.px(10, 9, mid);
  c.rect(7, 8, 2, 4, dark);
  c.rect(6, 12, 2, 1, dark);
  return c.grid();
}

function paintBulletin(): PixelGrid {
  const c = new Canvas(ART_TILE, ART_TILE);
  c.framed(1, 2, 12, 10, '#c9955b'); // gabus
  c.rect(1, 2, 12, 1, '#7a4d28');
  for (const [x, y] of [[3, 7], [8, 9], [10, 5]] as const) c.px(x, y, '#b07a44'); // bintik gabus
  // kertas dan pin
  c.rect(2, 4, 4, 5, '#fdfdfd');
  c.rect(3, 6, 2, 1, '#94a3b8');
  c.rect(3, 8, 2, 1, '#94a3b8');
  c.px(3, 4, '#e0463d');
  c.rect(7, 4, 4, 3, '#fdf0a8');
  c.px(8, 4, '#2f83d8');
  c.rect(8, 6, 2, 1, '#c9a93a');
  c.rect(7, 8, 5, 3, '#bfe6fa');
  c.px(11, 8, '#e0463d');
  return c.grid();
}

function paintPoster(): PixelGrid {
  const c = new Canvas(ART_TILE, ART_TILE);
  c.framed(3, 1, 8, 12, '#f5ecd6');
  c.rect(4, 3, 6, 5, '#3f7fa8');
  c.rect(4, 3, 6, 1, '#7cb8d9');
  c.rect(5, 6, 2, 2, '#f2a03d');
  c.rect(8, 5, 2, 3, '#44a35a');
  c.rect(4, 9, 6, 1, '#2b2433');
  c.rect(4, 11, 4, 1, '#94a3b8');
  return c.grid();
}

function paintClock(): PixelGrid {
  const c = new Canvas(ART_TILE, ART_TILE);
  c.rect(4, 2, 6, 10, OUT);
  c.rect(3, 3, 8, 8, OUT);
  c.rect(4, 3, 6, 8, '#fdfdfd');
  c.rect(5, 2, 4, 10, '#fdfdfd');
  c.rect(5, 2, 4, 1, '#d9dde6');
  c.px(7, 3, OUT); // tanda 12
  c.px(10, 7, OUT); // tanda 3
  c.px(7, 10, OUT); // tanda 6
  c.px(4, 7, OUT); // tanda 9
  c.rect(7, 5, 1, 3, '#2b2433'); // jarum menit
  c.rect(7, 7, 2, 1, '#e0463d'); // jarum jam
  return c.grid();
}

function paintWhiteboard(): PixelGrid {
  const c = new Canvas(ART_TILE, ART_TILE);
  c.rect(0, 2, 14, 10, OUT);
  c.rect(1, 3, 12, 7, '#f4f7fb');
  c.rect(1, 3, 12, 1, '#ffffff');
  c.rect(1, 10, 12, 1, '#aab4c0'); // bingkai bawah
  c.rect(2, 5, 5, 1, '#2f83d8');
  c.rect(2, 7, 7, 1, '#2b2433');
  c.rect(8, 4, 3, 3, '#e0463d');
  c.px(9, 5, '#f4f7fb');
  c.rect(3, 11, 3, 1, '#2f83d8'); // spidol di rak
  c.rect(8, 11, 2, 1, '#e0463d');
  return c.grid();
}

function paintBin(): PixelGrid {
  const c = new Canvas(ART_TILE, 16);
  c.rect(3, 15, 8, 1, '#3d3342');
  c.rect(3, 4, 8, 11, OUT);
  c.rect(4, 5, 6, 9, '#7d8ea3');
  c.rect(4, 5, 2, 9, '#a9b8c9');
  c.rect(9, 5, 1, 9, '#5f6b7c');
  for (const x of [6, 8]) c.rect(x, 7, 1, 5, '#5f6b7c');
  c.rect(2, 3, 10, 2, OUT);
  c.rect(3, 3, 8, 1, '#c3ccd8');
  c.rect(6, 2, 3, 1, OUT);
  return c.grid();
}

function paintFloorLamp(): PixelGrid {
  const c = new Canvas(ART_TILE, 28);
  c.rect(4, 27, 6, 1, '#3d3342');
  c.rect(4, 25, 6, 3, OUT);
  c.rect(5, 25, 4, 2, '#575246');
  c.rect(6, 12, 2, 13, OUT);
  c.rect(6, 12, 1, 13, '#9aa6b8');
  // kap lampu
  c.rect(2, 3, 10, 9, OUT);
  c.rect(3, 4, 8, 7, '#f6d77a');
  c.rect(3, 4, 8, 1, '#fff2b8');
  c.rect(3, 6, 2, 5, '#fff2b8');
  c.rect(9, 6, 2, 5, '#d9b24a');
  c.rect(4, 2, 6, 1, OUT);
  return c.grid();
}

const PAINTERS: Readonly<Record<DecorKind, () => PixelGrid>> = {
  tanaman: paintPlant,
  'papan-pengumuman': paintBulletin,
  poster: paintPoster,
  jam: paintClock,
  'papan-tulis': paintWhiteboard,
  'tong-sampah': paintBin,
  'lampu-lantai': paintFloorLamp,
};

/**
 * Menggambar satu dekor; deterministik. Lebar 14 piksel seni. Dekor `lantai`
 * disejajarkan pada tepi bawah petak (tinggi dapat melebihi 14); dekor
 * `muka-dinding` berukuran 14×14 dan diletakkan pada muka dinding petak.
 */
export function paintDecor(kind: DecorKind): PixelGrid {
  return PAINTERS[kind]();
}
