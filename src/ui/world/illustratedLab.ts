/**
 * Pelukis Dunia Kampus 2.5D Ilustrasi Tangan (Cozy Hand-Inked HD) untuk kanvas utama.
 * Menggantikan tampilan tilemap piksel kasar dengan grafis vektor-ilustrasi halus:
 * - Halaman kampus hidup di sekeliling gedung (rumput sunlit, jalan batu, pohon bergoyang, bangku taman)
 * - Lantai kayu berserat, keramik lab mengilap, karpet tenun, dan beton K3 halus
 * - Dinding 2.5D berketebalan nyata dengan bayangan ambient occlusion lembut
 * - 14 jenis perabot HD ber-outline tinta espresso (#3e2517) + animasi hidup (uap teh, LED, gelombang osiloskop, percikan las)
 * - Plakat nama ruangan bersih berikon & font Fredoka tajam (nol teks piksel buram!)
 */
import type { ConsultationDoorMode, LabFurniture, LabMapData, LabZone, ZoneType } from '../../types';
import type { RoomDecorId } from '../../engine/roomDecor';

const INK = '#3e2517';
const CACHE_SCALE = 2; // Render latar gedung statis di 2x HD untuk ketajaman Retina

interface FloorPalette {
  style: 'kayu' | 'keramik' | 'beton' | 'karpet';
  base: string;
  alt: string;
  accent: string;
  rug?: string;
  rugTrim?: string;
}

const FLOOR_STYLE: Record<ZoneType, FloorPalette> = {
  las: { style: 'beton', base: '#cfd5dc', alt: '#c4cbd4', accent: '#f0b835' },
  'cetak-3d': { style: 'keramik', base: '#e2eff5', alt: '#d5e6ef', accent: '#48a9c5' },
  'elektronik-iot': { style: 'keramik', base: '#e4f0e8', alt: '#d7e7dd', accent: '#36a382' },
  'gudang-alat': { style: 'beton', base: '#d9d3c7', alt: '#cfc8ba', accent: '#a87d4b' },
  pemrograman: { style: 'karpet', base: '#d8e4f2', alt: '#ccd9eb', accent: '#5a7cc2', rug: '#c4d4ea', rugTrim: '#8ca6d6' },
  diskusi: { style: 'kayu', base: '#e6c896', alt: '#dcb982', accent: '#b9894e', rug: '#d2e2c8', rugTrim: '#88b07b' },
  istirahat: { style: 'karpet', base: '#f3d8c6', alt: '#ebd0bc', accent: '#d68259', rug: '#f7e6cf', rugTrim: '#de9a72' },
  konsultasi: { style: 'kayu', base: '#e9cfa4', alt: '#dfbf8e', accent: '#c9884a', rug: '#d8eadf', rugTrim: '#63a68c' },
  'ruang-dosen': { style: 'kayu', base: '#d4b388', alt: '#c9a476', accent: '#8e5e38', rug: '#dfd9ec', rugTrim: '#9889bd' },
  'studio-desain': { style: 'kayu', base: '#eadff5', alt: '#e0d2ef', accent: '#9975c7', rug: '#f6ecff', rugTrim: '#b392de' },
  'pojok-baca': { style: 'karpet', base: '#d3e8da', alt: '#c5dfce', accent: '#3e8e6e', rug: '#efe3c6', rugTrim: '#c5a268' },
};

export const ZONE_BADGE_META: Record<ZoneType, { icon: string; accent: string; bg: string }> = {
  las: { icon: '🔥', accent: '#b8531c', bg: '#fff3e2' },
  'cetak-3d': { icon: '🖨️', accent: '#1d7694', bg: '#e8f7fc' },
  'elektronik-iot': { icon: '⚡', accent: '#1f7a5c', bg: '#e6f9f1' },
  'gudang-alat': { icon: '🧰', accent: '#7c5a32', bg: '#f6efe2' },
  pemrograman: { icon: '💻', accent: '#3c5aa6', bg: '#ebf1ff' },
  diskusi: { icon: '💬', accent: '#3a7a4b', bg: '#ecf8ee' },
  istirahat: { icon: '☕', accent: '#b55635', bg: '#fff0e8' },
  konsultasi: { icon: '💛', accent: '#237563', bg: '#e5faf4' },
  'ruang-dosen': { icon: '📋', accent: '#5c4b8a', bg: '#f1ecfc' },
  'studio-desain': { icon: '🎨', accent: '#764ba2', bg: '#f6ecff' },
  'pojok-baca': { icon: '📚', accent: '#256e52', bg: '#e6f7ee' },
};

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, rad);
}

// ---------------------------------------------------------------------------
// 1. Halaman Kampus Hidup di Luar Gedung (Rumput, Jalan Batu, Pohon Bergoyang)
// ---------------------------------------------------------------------------

export function drawOutdoorCampusCourtyard(
  ctx: CanvasRenderingContext2D,
  widthCss: number,
  heightCss: number,
  camera: { offsetX: number; offsetY: number; scale: number },
  map: LabMapData,
  timeSeconds: number,
  reducedMotion: boolean,
  clockMinutesOfDay = 540
): void {
  // Gradien rumput taman kampus yang ikut menyesuaikan cahaya Pagi / Siang / Sore
  const isAfternoon = clockMinutesOfDay >= 870;
  const isMorning = clockMinutesOfDay < 660;
  const lawn = ctx.createLinearGradient(0, 0, 0, heightCss);
  if (isAfternoon) {
    lawn.addColorStop(0, '#a6bf6d');
    lawn.addColorStop(0.5, '#91ad5f');
    lawn.addColorStop(1, '#799952');
  } else if (isMorning) {
    lawn.addColorStop(0, '#99cd80');
    lawn.addColorStop(0.5, '#87bd70');
    lawn.addColorStop(1, '#75ac60');
  } else {
    lawn.addColorStop(0, '#96c77c');
    lawn.addColorStop(0.5, '#86ba6d');
    lawn.addColorStop(1, '#75a95e');
  }
  ctx.fillStyle = lawn;
  ctx.fillRect(0, 0, widthCss, heightCss);

  // Tekstur padang rumput lembut bergaris matahari diagonal
  ctx.save();
  ctx.fillStyle = 'rgba(255, 252, 224, 0.08)';
  for (let i = -heightCss; i < widthCss + heightCss; i += 96) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 42, 0);
    ctx.lineTo(i - heightCss * 0.45 + 42, heightCss);
    ctx.lineTo(i - heightCss * 0.45, heightCss);
    ctx.closePath();
    ctx.fill();
  }

  // Detail helai rumput & bunga mungil deterministik di seluruh halaman
  for (let i = 0; i < 65; i += 1) {
    const gx = ((i * 197.3 + 41) % Math.max(1, widthCss));
    const gy = ((i * 113.7 + 29) % Math.max(1, heightCss));
    ctx.fillStyle = i % 3 === 0 ? 'rgba(65, 114, 52, 0.28)' : 'rgba(182, 224, 144, 0.34)';
    ctx.beginPath();
    ctx.ellipse(gx, gy, 5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    if (i % 7 === 0) {
      ctx.fillStyle = i % 14 === 0 ? '#fff5c4' : '#ffdbe4';
      ctx.beginPath();
      ctx.arc(gx + 2, gy - 2, 2.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Teras batu krem & tanaman hias mengelilingi gedung laboratorium
  const worldW = map.width * map.tileSizePx;
  const worldH = map.height * map.tileSizePx;
  const bx = camera.offsetX;
  const by = camera.offsetY;
  const bw = worldW * camera.scale;
  const bh = worldH * camera.scale;
  const pad = Math.max(12, 18 * camera.scale);

  // Pelataran batu krem mengelilingi gedung
  rrect(ctx, bx - pad, by - pad, bw + pad * 2, bh + pad * 2, 18 * camera.scale);
  ctx.fillStyle = '#e7d7b9';
  ctx.fill();
  ctx.strokeStyle = '#b4986d';
  ctx.lineWidth = Math.max(1.5, 2.5 * camera.scale);
  ctx.stroke();

  // Jalan setapak masuk selatan menuju gerbang kampus + batu pijakan & bangku taman cozy
  const pathW = 92 * camera.scale;
  const pathX = bx + bw * 0.48 - pathW / 2;
  const southStartY = by + bh + pad - 2;
  const southH = Math.max(0, heightCss - southStartY + 4);
  ctx.fillStyle = '#decba8';
  ctx.fillRect(pathX, southStartY, pathW, southH);
  // Tepian batu setapak
  ctx.fillStyle = '#bda57d';
  ctx.fillRect(pathX - 3, southStartY, 3, southH);
  ctx.fillRect(pathX + pathW, southStartY, 3, southH);
  // Batu pijakan krem hangat
  for (let sy = southStartY + 10 * camera.scale; sy < heightCss - 6; sy += 22 * camera.scale) {
    rrect(ctx, pathX + 12 * camera.scale, sy, pathW - 24 * camera.scale, 13 * camera.scale, 5 * camera.scale);
    ctx.fillStyle = '#efe2c6';
    ctx.fill();
    ctx.strokeStyle = '#c4ab82';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // Dua bangku taman kayu di kiri & kanan jalan masuk selatan bila ada ruang halaman bawah
  if (southH >= 38 * camera.scale) {
    for (const benchX of [pathX - 78 * camera.scale, pathX + pathW + 24 * camera.scale]) {
      const benchY = southStartY + 14 * camera.scale;
      const bwBench = 52 * camera.scale;
      const bhBench = 14 * camera.scale;
      rrect(ctx, benchX + 2, benchY + 4, bwBench, bhBench, 4);
      ctx.fillStyle = 'rgba(38, 72, 32, 0.24)';
      ctx.fill();
      rrect(ctx, benchX, benchY, bwBench, bhBench, 4);
      ctx.fillStyle = '#b97b45';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.fillStyle = '#8b5528';
      ctx.fillRect(benchX + 4, benchY + bhBench * 0.48, bwBench - 8, 2);
    }
  }

  // Bayangan gedung yang hangat & membumi
  rrect(ctx, bx + 6 * camera.scale, by + 9 * camera.scale, bw, bh, 10 * camera.scale);
  ctx.fillStyle = 'rgba(42, 64, 30, 0.28)';
  ctx.fill();

  // Pohon-pohon kampus bergoyang halus di sudut-sudut halaman
  const sway = reducedMotion ? 0 : Math.sin(timeSeconds * 1.15) * 2.4;
  const trees: Array<{ x: number; y: number; r: number; hue: number }> = [
    { x: bx - pad - 26 * camera.scale, y: by - 4 * camera.scale, r: 28 * camera.scale, hue: 0 },
    { x: bx + bw + pad + 26 * camera.scale, y: by + 10 * camera.scale, r: 30 * camera.scale, hue: 1 },
    { x: bx - pad - 22 * camera.scale, y: by + bh - 12 * camera.scale, r: 26 * camera.scale, hue: 1 },
    { x: bx + bw + pad + 24 * camera.scale, y: by + bh - 22 * camera.scale, r: 29 * camera.scale, hue: 0 },
    { x: bx + bw * 0.22, y: by - pad - 22 * camera.scale, r: 24 * camera.scale, hue: 0 },
    { x: bx + bw * 0.78, y: by - pad - 20 * camera.scale, r: 25 * camera.scale, hue: 1 },
  ];

  for (let idx = 0; idx < trees.length; idx += 1) {
    const tr = trees[idx];
    if (tr.r < 6) continue;
    const dx = sway * (idx % 2 === 0 ? 1 : -0.8);
    // Bayangan tajuk di rumput
    ctx.fillStyle = 'rgba(38, 72, 32, 0.24)';
    ctx.beginPath();
    ctx.ellipse(tr.x + 5, tr.y + tr.r * 0.55, tr.r * 0.92, tr.r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tajuk gelap bawah
    ctx.fillStyle = tr.hue === 0 ? '#4d8c4d' : '#3f7f56';
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1.4, 2 * camera.scale);
    ctx.beginPath();
    ctx.arc(tr.x + dx, tr.y, tr.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Lapisan daun terang atas
    ctx.fillStyle = tr.hue === 0 ? '#74b862' : '#65ad74';
    ctx.beginPath();
    ctx.arc(tr.x - tr.r * 0.22 + dx, tr.y - tr.r * 0.2, tr.r * 0.68, 0, Math.PI * 2);
    ctx.fill();
    // Sorotan sinar matahari hangat
    ctx.fillStyle = 'rgba(255, 248, 198, 0.42)';
    ctx.beginPath();
    ctx.arc(tr.x - tr.r * 0.34 + dx, tr.y - tr.r * 0.34, tr.r * 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 2. Kanvas Gedung Statis 2.5D HD (Lantai, Karpet, Dinding Berbayangan, Pintu)
// ---------------------------------------------------------------------------

const backdropCache = new WeakMap<LabMapData, Map<ConsultationDoorMode, HTMLCanvasElement>>();

function paintZoneFloor(ctx: CanvasRenderingContext2D, zone: LabZone, t: number): void {
  const { x, y, w, h } = zone.bounds;
  const px = x * t;
  const py = y * t;
  const pw = w * t;
  const ph = h * t;
  const pal = FLOOR_STYLE[zone.id];

  ctx.save();
  ctx.beginPath();
  ctx.rect(px, py, pw, ph);
  ctx.clip();

  ctx.fillStyle = pal.base;
  ctx.fillRect(px, py, pw, ph);

  if (pal.style === 'kayu') {
    const plankH = t * 0.5;
    for (let row = 0; row * plankH < ph; row += 1) {
      const ry = py + row * plankH;
      if (row % 2 === 1) {
        ctx.fillStyle = pal.alt;
        ctx.fillRect(px, ry, pw, plankH);
      }
      ctx.strokeStyle = 'rgba(92, 58, 30, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, ry);
      ctx.lineTo(px + pw, ry);
      ctx.stroke();
      const offset = (row % 3) * t * 1.1;
      for (let sx = px + offset; sx < px + pw; sx += t * 3.2) {
        ctx.beginPath();
        ctx.moveTo(sx, ry);
        ctx.lineTo(sx, ry + plankH);
        ctx.stroke();
      }
    }
  } else if (pal.style === 'keramik') {
    const tile = t;
    for (let gy = 0; gy < h; gy += 1) {
      for (let gx = 0; gx < w; gx += 1) {
        if ((gx + gy) % 2 === 1) {
          ctx.fillStyle = pal.alt;
          ctx.fillRect(px + gx * tile, py + gy * tile, tile, tile);
        }
      }
    }
    ctx.strokeStyle = 'rgba(72, 102, 122, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = 0; gx <= w; gx += 1) {
      ctx.moveTo(px + gx * tile, py);
      ctx.lineTo(px + gx * tile, py + ph);
    }
    for (let gy = 0; gy <= h; gy += 1) {
      ctx.moveTo(px, py + gy * tile);
      ctx.lineTo(px + pw, py + gy * tile);
    }
    ctx.stroke();
  } else if (pal.style === 'beton') {
    const slab = t * 2;
    ctx.strokeStyle = 'rgba(62, 72, 84, 0.13)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= pw; gx += slab) {
      ctx.beginPath();
      ctx.moveTo(px + gx, py);
      ctx.lineTo(px + gx, py + ph);
      ctx.stroke();
    }
    for (let gy = 0; gy <= ph; gy += slab) {
      ctx.beginPath();
      ctx.moveTo(px, py + gy);
      ctx.lineTo(px + pw, py + gy);
      ctx.stroke();
    }
    // Garis K3 kuning-hitam bersih khusus Stasiun Las
    if (zone.id === 'las') {
      const stripY = py + ph - 7;
      ctx.fillStyle = '#f2be35';
      ctx.fillRect(px + 2, stripY, pw - 4, 5);
      ctx.fillStyle = '#363b42';
      for (let sx = px; sx < px + pw; sx += 16) {
        ctx.beginPath();
        ctx.moveTo(sx, stripY);
        ctx.lineTo(sx + 7, stripY);
        ctx.lineTo(sx + 4, stripY + 5);
        ctx.lineTo(sx - 3, stripY + 5);
        ctx.closePath();
        ctx.fill();
      }
    }
  } else {
    // Karpet tenun lembut dengan titik serat halus
    ctx.fillStyle = pal.alt;
    for (let gy = 4; gy < ph; gy += 10) {
      for (let gx = (gy % 20 === 4 ? 4 : 9); gx < pw; gx += 10) {
        ctx.fillRect(px + gx, py + gy, 2.2, 2.2);
      }
    }
  }

  // Karpet hias tengah untuk zona nyaman (Diskusi, Istirahat, Konsultasi, Pojok Baca, Studio Desain, Ruang Dosen)
  if (pal.rug && pal.rugTrim && pw >= t * 5 && ph >= t * 4) {
    const insetX = Math.min(t * 1.15, pw * 0.14);
    const insetY = Math.min(t * 1.05, ph * 0.16);
    rrect(ctx, px + insetX, py + insetY, pw - insetX * 2, ph - insetY * 2, 10);
    ctx.fillStyle = pal.rug;
    ctx.fill();
    ctx.strokeStyle = pal.rugTrim;
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Ambient occlusion lembut di sisi atas & kiri ruangan (kedalaman 2.5D!)
  const aoTop = ctx.createLinearGradient(px, py, px, py + t * 0.85);
  aoTop.addColorStop(0, 'rgba(62, 37, 23, 0.22)');
  aoTop.addColorStop(1, 'rgba(62, 37, 23, 0)');
  ctx.fillStyle = aoTop;
  ctx.fillRect(px, py, pw, t * 0.85);

  const aoLeft = ctx.createLinearGradient(px, py, px + t * 0.45, py);
  aoLeft.addColorStop(0, 'rgba(62, 37, 23, 0.12)');
  aoLeft.addColorStop(1, 'rgba(62, 37, 23, 0)');
  ctx.fillStyle = aoLeft;
  ctx.fillRect(px, py, t * 0.45, ph);

  ctx.restore();
}

function paintCorridorFloor(ctx: CanvasRenderingContext2D, map: LabMapData, t: number): void {
  const worldW = map.width * t;
  const worldH = map.height * t;
  // Lantai ubin krem koridor kampus hangat
  ctx.fillStyle = '#f5ebd6';
  ctx.fillRect(0, 0, worldW, worldH);

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      if ((x + y) % 2 === 1) {
        ctx.fillStyle = '#eee1c6';
        ctx.fillRect(x * t, y * t, t, t);
      }
    }
  }
  ctx.strokeStyle = 'rgba(130, 96, 62, 0.11)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  for (let x = 0; x <= map.width; x += 1) {
    ctx.moveTo(x * t, 0);
    ctx.lineTo(x * t, worldH);
  }
  for (let y = 0; y <= map.height; y += 1) {
    ctx.moveTo(0, y * t);
    ctx.lineTo(worldW, y * t);
  }
  ctx.stroke();

  // Garis pemandu koridor utama lembut
  ctx.fillStyle = 'rgba(218, 179, 118, 0.25)';
  ctx.fillRect(1 * t, 9.45 * t, (map.width - 2) * t, 1.1 * t);
}

function paintWall25D(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number): void {
  const px = x * t;
  const py = y * t;
  const pw = w * t;
  const ph = h * t;

  // Bayangan jatuh dinding ke lantai bawah
  ctx.fillStyle = 'rgba(62, 37, 23, 0.16)';
  ctx.fillRect(px, py + ph, pw, 6);

  // Sisi depan dinding (plaster hangat 2.5D)
  const frontH = Math.min(ph * 0.42, 11);
  ctx.fillStyle = '#d9c5a3';
  ctx.fillRect(px, py + ph - frontH, pw, frontH);
  ctx.fillStyle = '#b99b72';
  ctx.fillRect(px, py + ph - 3, pw, 3);

  // Permukaan atas dinding (kayu espresso hangat bergaya blueprint diorama)
  const capGrad = ctx.createLinearGradient(px, py, px, py + ph - frontH);
  capGrad.addColorStop(0, '#784c31');
  capGrad.addColorStop(1, '#5a3620');
  ctx.fillStyle = capGrad;
  ctx.fillRect(px, py, pw, Math.max(4, ph - frontH));

  // Garis sorotan tipis atas & outline espresso tajam
  ctx.fillStyle = 'rgba(255, 232, 192, 0.25)';
  ctx.fillRect(px + 1, py + 1, Math.max(0, pw - 2), 2.2);

  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
}

function paintIllustratedDoor(
  ctx: CanvasRenderingContext2D,
  tx: number,
  ty: number,
  t: number,
  orientation: 'horizontal' | 'vertical',
  isConsultDoor: boolean,
  doorMode: ConsultationDoorMode
): void {
  const px = tx * t;
  const py = ty * t;
  ctx.save();
  // Ambang lantai kayu hangat
  ctx.fillStyle = isConsultDoor
    ? doorMode === 'lab'
      ? 'rgba(232, 167, 48, 0.26)'
      : 'rgba(46, 130, 116, 0.25)'
    : 'rgba(180, 140, 96, 0.22)';
  ctx.fillRect(px, py, t, t);

  const woodCol = isConsultDoor ? (doorMode === 'lab' ? '#c97828' : '#258070') : '#9c683e';
  ctx.strokeStyle = woodCol;
  ctx.lineWidth = 3.2;
  ctx.lineCap = 'round';

  if (orientation === 'horizontal') {
    ctx.beginPath();
    ctx.moveTo(px + 3, py + t * 0.52);
    ctx.lineTo(px + t - 3, py + 5);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(62, 37, 23, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(px + 3, py + t * 0.52, t - 7, -Math.PI / 3, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(px + t * 0.52, py + 3);
    ctx.lineTo(px + 5, py + t - 3);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(62, 37, 23, 0.35)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(px + t * 0.52, py + 3, t - 7, Math.PI / 2, (Math.PI * 5) / 6);
    ctx.stroke();
  }
  ctx.restore();
}

function buildIllustratedBackdrop(map: LabMapData, doorMode: ConsultationDoorMode): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  const t = map.tileSizePx;
  const worldW = map.width * t;
  const worldH = map.height * t;
  const canvas = document.createElement('canvas');
  canvas.width = worldW * CACHE_SCALE;
  canvas.height = worldH * CACHE_SCALE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(CACHE_SCALE, CACHE_SCALE);

  // 1. Koridor dasar
  paintCorridorFloor(ctx, map, t);

  // 2. Lantai & karpet unik untuk setiap dari 11 ruangan
  for (const zone of map.zones) {
    paintZoneFloor(ctx, zone, t);
  }

  // 3. Pembatas rendah (sekat ruang modern berkayu tipis)
  for (const div of map.lowDividers) {
    const dx = div.x * t;
    const dy = div.y * t;
    const dw = div.w * t;
    const dh = div.h * t;
    ctx.fillStyle = 'rgba(62, 37, 23, 0.14)';
    rrect(ctx, dx + 2, dy + dh * 0.45, dw - 4, dh * 0.36, 4);
    ctx.fill();
    ctx.fillStyle = '#c49a6c';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    rrect(ctx, dx + 2, dy + dh * 0.3, dw - 4, dh * 0.34, 4);
    ctx.fill();
    ctx.stroke();
  }

  // 4. Dinding 2.5D + kusen jendela eksterior di tepi utara
  for (const wall of map.walls) {
    paintWall25D(ctx, wall.x, wall.y, wall.w, wall.h, t);
  }

  // Jendela kaca biru muda menghadap taman di dinding utara (y = 0)
  for (const wx of [3, 12, 22, 33, 43]) {
    const px = wx * t;
    rrect(ctx, px, 5, 4 * t, 12, 4);
    ctx.fillStyle = '#bae6fd';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillRect(px + 4, 7, 4 * t - 8, 3);
  }

  // 5. Pintu aktif / tertutup (sesuai mode Pintu Konsultasi)
  for (const door of map.doors) {
    if (door.mode !== undefined && door.mode !== doorMode) {
      for (const tile of door.tiles) {
        paintWall25D(ctx, tile.x, tile.y, 1, 1, t);
      }
      continue;
    }
    const isConsult = door.zoneId === 'konsultasi';
    for (const tile of door.tiles) {
      paintIllustratedDoor(ctx, tile.x, tile.y, t, door.orientation, isConsult, doorMode);
    }
  }

  // 6. Tanaman pot hias sudut ruangan agar terasa hangat dan hidup
  const cornerPlants: Array<[number, number]> = [
    [1.35, 1.35],
    [18.4, 12.4],
    [25.5, 12.4],
    [31.35, 11.35],
    [40.45, 1.45],
    [40.45, 21.35],
    [1.35, 21.35],
  ];
  for (const [pxTile, pyTile] of cornerPlants) {
    const cx = pxTile * t;
    const cy = pyTile * t;
    ctx.fillStyle = 'rgba(62, 37, 23, 0.18)';
    ctx.beginPath();
    ctx.ellipse(cx + 1, cy + 8, 9, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pot terakota
    rrect(ctx, cx - 6, cy + 1, 12, 8, 3);
    ctx.fillStyle = '#d1784d';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    // Daun hijau segar
    for (const [ox, oy, r, col] of [
      [-5, -2, 5.2, '#438c57'],
      [5, -2, 5.2, '#4ea364'],
      [0, -5, 5.8, '#62b875'],
    ] as const) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  // Bingkai luar gedung espresso rapi
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(1.5, 1.5, worldW - 3, worldH - 3);

  return canvas;
}

export function getIllustratedLabBackdrop(
  map: LabMapData,
  doorMode: ConsultationDoorMode
): HTMLCanvasElement | null {
  let byMode = backdropCache.get(map);
  if (!byMode) {
    byMode = new Map();
    backdropCache.set(map, byMode);
  }
  let hit = byMode.get(doorMode);
  if (!hit) {
    const made = buildIllustratedBackdrop(map, doorMode);
    if (made) {
      byMode.set(doorMode, made);
      hit = made;
    }
  }
  return hit ?? null;
}

// ---------------------------------------------------------------------------
// 3. Perabot Ilustrasi 2.5D HD (Semua 14 Jenis Perabot + Animasi Mikro!)
// ---------------------------------------------------------------------------

function drawTableBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  topCol: string,
  sideCol: string,
  radius = 6
): void {
  // Bayangan lembut di lantai
  rrect(ctx, x + 2, y + 5, w, h, radius);
  ctx.fillStyle = 'rgba(62, 37, 23, 0.2)';
  ctx.fill();

  // Sisi ketebalan 2.5D
  rrect(ctx, x, y + 3, w, h, radius);
  ctx.fillStyle = sideCol;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Permukaan meja atas
  rrect(ctx, x, y, w, Math.max(6, h - 4), radius);
  ctx.fillStyle = topCol;
  ctx.fill();
  ctx.stroke();

  // Kilau atas lembut
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  rrect(ctx, x + 3, y + 2, Math.max(0, w - 6), 3, 2);
  ctx.fill();
}

export function drawIllustratedFurniture(
  ctx: CanvasRenderingContext2D,
  item: LabFurniture,
  t: number,
  timeSeconds: number,
  reducedMotion: boolean
): void {
  const x = item.rect.x * t + 2;
  const y = item.rect.y * t + 2;
  const w = item.rect.w * t - 4;
  const h = item.rect.h * t - 4;

  ctx.save();
  switch (item.kind) {
    case 'printer-3d': {
      drawTableBase(ctx, x, y, w, h, '#e8eef2', '#a8b7c4', 5);
      // Bingkai kaca printer 3D
      const bw = Math.min(w - 8, 34);
      const bx = x + (w - bw) / 2;
      rrect(ctx, bx, y - 10, bw, h + 2, 4);
      ctx.fillStyle = '#334657';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Ruang cetak transparan
      rrect(ctx, bx + 4, y - 6, bw - 8, h - 8, 2);
      ctx.fillStyle = '#d4eef7';
      ctx.fill();
      // Nozzle bergerak halus
      const headX = bx + 8 + (reducedMotion ? 6 : (0.5 + 0.5 * Math.sin(timeSeconds * 2.2 + x)) * Math.max(2, bw - 18));
      ctx.fillStyle = '#f28b29';
      ctx.fillRect(headX, y - 4, 5, 6);
      // Objek cetakan mini
      ctx.fillStyle = '#2fa899';
      ctx.fillRect(bx + bw / 2 - 4, y + h - 20, 8, 5);
      // LED indikator hidup
      ctx.fillStyle = !reducedMotion && Math.sin(timeSeconds * 4 + x) > 0 ? '#4ade80' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(bx + bw - 6, y - 7, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'meja-komputer': {
      drawTableBase(ctx, x, y, w, h, '#e5c494', '#b88c58', 6);
      const count = Math.max(1, Math.floor(w / 44));
      const step = w / count;
      for (let i = 0; i < count; i += 1) {
        const mx = x + i * step + step / 2 - 14;
        // Monitor gelap modern
        rrect(ctx, mx, y - 5, 28, 17, 3);
        ctx.fillStyle = '#243044';
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        // Layar kode berwarna
        ctx.fillStyle = '#1b263b';
        ctx.fillRect(mx + 2.5, y - 2.5, 23, 12);
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(mx + 4.5, y, 11, 2);
        ctx.fillStyle = '#86efac';
        ctx.fillRect(mx + 4.5, y + 3.5, 16, 2);
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(mx + 4.5, y + 7, 9, 2);
        // Keyboard mini
        rrect(ctx, mx + 3, y + 14, 22, 5, 2);
        ctx.fillStyle = '#475569';
        ctx.fill();
      }
      break;
    }
    case 'bilik-las': {
      drawTableBase(ctx, x, y, w, h, '#7b8794', '#4e5964', 5);
      // Tirai pelindung oranye K3
      rrect(ctx, x + 4, y - 8, w - 8, 10, 3);
      ctx.fillStyle = '#e07a32';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      ctx.stroke();
      // Rangka baja di atas meja
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 12, y + h / 2);
      ctx.lineTo(x + w - 12, y + h / 2);
      ctx.stroke();
      // Percikan las hangat berkedip lembut
      if (!reducedMotion && Math.sin(timeSeconds * 9 + x) > 0.55) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(x + w * 0.5, y + h / 2, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'meja-elektronik': {
      drawTableBase(ctx, x, y, w, h, '#d6cfc2', '#a89f91', 6);
      // Alas ESD hijau toska
      rrect(ctx, x + 5, y + 3, w - 10, Math.max(8, h - 10), 3);
      ctx.fillStyle = '#368a73';
      ctx.fill();
      // Osiloskop mini dengan gelombang sinus hidup
      const ox = x + 10;
      rrect(ctx, ox, y - 4, 26, 15, 3);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.fillStyle = '#0f2933';
      ctx.fillRect(ox + 3, y - 1.5, 16, 10);
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let sx = 0; sx <= 14; sx += 2) {
        const sy = y + 3.5 + Math.sin(sx * 0.7 + (reducedMotion ? 0 : timeSeconds * 4)) * 3;
        if (sx === 0) ctx.moveTo(ox + 4 + sx, sy);
        else ctx.lineTo(ox + 4 + sx, sy);
      }
      ctx.stroke();
      break;
    }
    case 'meja-diskusi': {
      // Kursi warna-warni mengelilingi meja diskusi besar
      const chairColors = ['#e57368', '#4ba894', '#f2b844', '#6d8be0'];
      const chairCount = Math.max(2, Math.floor(w / 34));
      for (let i = 0; i < chairCount; i += 1) {
        const cx = x + (i + 0.5) * (w / chairCount);
        const col = chairColors[i % chairColors.length];
        for (const cy of [y - 6, y + h + 3]) {
          rrect(ctx, cx - 9, cy - 4, 18, 9, 4);
          ctx.fillStyle = col;
          ctx.fill();
          ctx.strokeStyle = INK;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      }
      drawTableBase(ctx, x, y, w, h, '#e8c589', '#bd9254', 10);
      // Kertas sketsa, sticky notes & laptop kecil di meja diskusi
      rrect(ctx, x + 14, y + 6, 18, 12, 2);
      ctx.fillStyle = '#3b4a66';
      ctx.fill();
      ctx.fillStyle = '#fffdf6';
      ctx.fillRect(x + w * 0.45, y + 7, 16, 11);
      ctx.fillStyle = '#ffe58f';
      ctx.fillRect(x + w * 0.68, y + 9, 8, 8);
      ctx.fillStyle = '#fbcfe8';
      ctx.fillRect(x + w * 0.77, y + 6, 8, 8);
      break;
    }
    case 'meja-desain': {
      drawTableBase(ctx, x, y, w, h, '#f2e8fa', '#b79cd4', 7);
      const count = Math.max(1, Math.floor(w / 52));
      const step = w / count;
      for (let i = 0; i < count; i += 1) {
        const mx = x + i * step + step / 2 - 16;
        // Layar desain lebar + palet warna ceria
        rrect(ctx, mx, y - 5, 32, 17, 3);
        ctx.fillStyle = '#2d2645';
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4;
        ctx.stroke();
        ctx.fillStyle = '#f8f2ff';
        ctx.fillRect(mx + 3, y - 2, 26, 11);
        ctx.fillStyle = '#e56256';
        ctx.fillRect(mx + 5, y, 7, 7);
        ctx.fillStyle = '#f5be42';
        ctx.fillRect(mx + 13, y, 6, 7);
        ctx.fillStyle = '#3aa08e';
        ctx.fillRect(mx + 20, y, 7, 7);
        // Pen tablet tipis
        rrect(ctx, mx + 5, y + 14, 22, 6, 2);
        ctx.fillStyle = '#3b3259';
        ctx.fill();
      }
      break;
    }
    case 'meja-baca': {
      drawTableBase(ctx, x, y, w, h, '#d7aa74', '#9e703f', 9);
      // Buku terbuka + lampu baca kuningan menyala lembut
      rrect(ctx, x + 12, y + 7, 18, 12, 2);
      ctx.fillStyle = '#fffdf5';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 21, y + 7);
      ctx.lineTo(x + 21, y + 19);
      ctx.stroke();
      // Lampu baca hangat
      const lx = x + w - 16;
      const ly = y + 10;
      ctx.fillStyle = 'rgba(255, 224, 130, 0.36)';
      ctx.beginPath();
      ctx.arc(lx, ly, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f5c249';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(lx, ly, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'sofa': {
      // Sofa empuk bergaya kafe/ruang istirahat
      rrect(ctx, x + 2, y + 4, w, h, 9);
      ctx.fillStyle = 'rgba(62, 37, 23, 0.18)';
      ctx.fill();
      rrect(ctx, x, y, w, h, 9);
      ctx.fillStyle = '#4f9687';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      // Sandaran & bantal empuk
      rrect(ctx, x + 4, y + 3, w - 8, Math.max(8, h * 0.36), 5);
      ctx.fillStyle = '#3c7a6d';
      ctx.fill();
      // Bantal hias krem-mustard
      rrect(ctx, x + 8, y + 6, 12, 10, 4);
      ctx.fillStyle = '#ffe294';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      break;
    }
    case 'rak-buku':
    case 'rak-gudang': {
      const isBook = item.kind === 'rak-buku';
      drawTableBase(ctx, x, y - 4, w, h + 4, isBook ? '#9b673c' : '#6c7a89', isBook ? '#6d4423' : '#4a5562', 5);
      const colors = isBook
        ? ['#e56256', '#3aa08e', '#f5be42', '#5b72d6', '#d98a4a']
        : ['#f2b844', '#4d8fc4', '#e56256', '#94a3b8'];
      const slotW = 8;
      let cx = x + 5;
      let ci = 0;
      while (cx + slotW < x + w - 4) {
        rrect(ctx, cx, y - 1, slotW - 1.5, Math.max(8, h - 6), 2);
        ctx.fillStyle = colors[ci % colors.length];
        ctx.fill();
        cx += slotW;
        ci += 1;
      }
      break;
    }
    case 'meja-konsultasi': {
      // Dua kursi nyaman di kiri & kanan + meja bundar teh hangat
      for (const cx of [x - 5, x + w - 9]) {
        rrect(ctx, cx, y + h * 0.2, 14, h * 0.6, 5);
        ctx.fillStyle = '#e89d5a';
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      drawTableBase(ctx, x + 6, y + 2, Math.max(14, w - 12), Math.max(14, h - 4), '#f3dfb6', '#c9a66f', 10);
      // Teko teh & uap hangat mengepul
      const tx = x + w / 2;
      const ty = y + h / 2;
      ctx.fillStyle = '#fffdf6';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(tx - 4, ty, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#5bb8a6';
      ctx.beginPath();
      ctx.arc(tx + 5, ty + 1, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      if (!reducedMotion) {
        const rise = (timeSeconds * 8) % 6;
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.75 - rise / 8).toFixed(2)})`;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(tx - 4, ty - 4 - rise);
        ctx.lineTo(tx - 2.5, ty - 8 - rise);
        ctx.stroke();
      }
      break;
    }
    case 'meja-dosen': {
      drawTableBase(ctx, x, y, w, h, '#b88352', '#7e522d', 6);
      rrect(ctx, x + 8, y + 5, 16, 11, 2);
      ctx.fillStyle = '#2d3a54';
      ctx.fill();
      ctx.fillStyle = '#fff7e0';
      ctx.fillRect(x + w - 20, y + 5, 13, 10);
      break;
    }
    case 'meja-kopi': {
      drawTableBase(ctx, x + 2, y + 2, Math.max(12, w - 4), Math.max(12, h - 4), '#e2be89', '#b5884f', 9);
      // Cangkir kopi + piring kecil hangat di meja kopi
      const cx = x + w / 2;
      const cy = y + h / 2;
      ctx.fillStyle = '#fffdf6';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx - 4, cy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#8b522c';
      ctx.beginPath();
      ctx.arc(cx - 4, cy, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffe58f';
      rrect(ctx, cx + 3, cy - 3.5, 8, 7, 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'penanda-k3': {
      // Papan rambu K3 kuning-hitam jelas di bengkel las
      rrect(ctx, x + 2, y + 2, Math.max(12, w - 4), Math.max(12, h - 4), 5);
      ctx.fillStyle = '#f5be42';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.moveTo(x + w / 2, y + 5);
      ctx.lineTo(x + w - 6, y + h - 5);
      ctx.lineTo(x + 6, y + h - 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.fillRect(x + w / 2 - 1, y + 9, 2, Math.max(3, h - 18));
      break;
    }
    default: {
      // Dispenser air minum dingin & panas dengan galon biru bening
      drawTableBase(ctx, x, y - 3, w, h + 3, '#f1f7fa', '#a9bfcc', 6);
      ctx.fillStyle = '#7dd3fc';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.2;
      rrect(ctx, x + 4, y - 1, Math.max(6, w - 8), Math.max(6, h * 0.45), 4);
      ctx.fill();
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 4. Plakat Nama Ruangan Bersih (Tipografi Fredoka + Ikon, Nol Pixel Kasar!)
// ---------------------------------------------------------------------------

export function drawIllustratedZoneLabel(
  ctx: CanvasRenderingContext2D,
  zone: LabZone,
  t: number,
  selected: boolean
): void {
  const meta = ZONE_BADGE_META[zone.id];
  const label = `${meta.icon} ${zone.shortLabel}`;
  const cx = (zone.bounds.x + zone.bounds.w / 2) * t;
  const cy = (zone.bounds.y + 0.58) * t;

  ctx.save();
  ctx.font = selected
    ? '700 10.5px Fredoka, Plus Jakarta Sans, ui-sans-serif, sans-serif'
    : '700 9.5px Fredoka, Plus Jakarta Sans, ui-sans-serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const tw = ctx.measureText(label).width;
  const pw = Math.min(zone.bounds.w * t - 8, tw + 16);
  const ph = 18;
  const px = cx - pw / 2;
  const py = cy - ph / 2;

  // Bayangan lembut
  rrect(ctx, px, py + 2, pw, ph, 9);
  ctx.fillStyle = 'rgba(62, 37, 23, 0.24)';
  ctx.fill();

  // Kapsul pill bersih semi-solid
  rrect(ctx, px, py, pw, ph, 9);
  ctx.fillStyle = selected ? meta.accent : meta.bg;
  ctx.fill();
  ctx.strokeStyle = selected ? '#ffe694' : INK;
  ctx.lineWidth = selected ? 2 : 1.5;
  ctx.stroke();

  ctx.fillStyle = selected ? '#fffdf6' : INK;
  ctx.fillText(label, cx, cy + 0.5, pw - 8);
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 5. Hiasan Ruang BK Hidup di Peta 2D (muncul nyata saat dibeli & dipasang!)
// ---------------------------------------------------------------------------

export function drawEquippedBkDecorOnMap(
  ctx: CanvasRenderingContext2D,
  map: LabMapData,
  equippedDecor: readonly RoomDecorId[] | undefined,
  timeSeconds: number,
  reducedMotion: boolean
): void {
  if (!equippedDecor || equippedDecor.length === 0) return;
  const zone = map.zones.find((z) => z.id === 'konsultasi');
  if (!zone) return;
  const t = map.tileSizePx;
  const zx = zone.bounds.x * t;
  const zy = zone.bounds.y * t;
  const zw = zone.bounds.w * t;
  const zh = zone.bounds.h * t;
  const has = (id: RoomDecorId) => equippedDecor.includes(id);

  ctx.save();

  // 1. Lampu Senja: pendar cahaya amber hangat melingkupi Ruang Konsultasi + kap lampu kuningan
  if (has('lampu-senja')) {
    const lx = zx + zw - 22;
    const ly = zy + 20;
    const pulse = reducedMotion ? 1 : 0.92 + 0.08 * Math.sin(timeSeconds * 2.4);
    const glow = ctx.createRadialGradient(lx, ly, 4, lx, ly, 92 * pulse);
    glow.addColorStop(0, 'rgba(255, 224, 130, 0.42)');
    glow.addColorStop(0.55, 'rgba(255, 198, 108, 0.16)');
    glow.addColorStop(1, 'rgba(255, 198, 108, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(zx + 2, zy + 2, zw - 4, zh - 4);

    // Kap lampu kuningan mungil
    ctx.fillStyle = '#ffe58f';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(lx, ly, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fffdf6';
    ctx.beginPath();
    ctx.arc(lx - 1.5, ly - 1.5, 2.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Poster Hangat: bingkai ilustrasi pastel di dinding utara Ruang Konsultasi
  if (has('poster-hangat')) {
    const px = zx + zw * 0.32;
    const py = zy + 4;
    rrect(ctx, px, py, 30, 14, 3);
    ctx.fillStyle = '#fff8e2';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.fillStyle = '#7fc29b';
    ctx.beginPath();
    ctx.arc(px + 10, py + 9, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5be42';
    ctx.beginPath();
    ctx.arc(px + 21, py + 6.5, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Tanaman Monstera: pot terakota rimbun di sudut kiri atas Ruang Konsultasi
  if (has('tanaman-monstera')) {
    const mx = zx + 18;
    const my = zy + 22;
    const sway = reducedMotion ? 0 : Math.sin(timeSeconds * 1.8) * 1.2;
    ctx.fillStyle = '#d47c48';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(mx, my + 2, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 5; i += 1) {
      const ang = (i * Math.PI * 2) / 5 - 0.5;
      ctx.fillStyle = i % 2 === 0 ? '#2e825a' : '#43a675';
      ctx.beginPath();
      ctx.ellipse(
        mx + Math.cos(ang) * 7 + sway * 0.4,
        my - 2 + Math.sin(ang) * 5.5,
        5.5,
        3.2,
        ang,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.stroke();
    }
  }

  // 4. Pemutar Vinyl: meja piringan hitam kayu + not musik melayang lembut di sudut kiri bawah
  if (has('pemutar-vinyl')) {
    const vx = zx + 18;
    const vy = zy + zh - 16;
    rrect(ctx, vx - 11, vy - 8, 22, 16, 4);
    ctx.fillStyle = '#b47142';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    // Piringan hitam berputar
    ctx.fillStyle = '#25232b';
    ctx.beginPath();
    ctx.arc(vx - 1, vy, 5.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e56256';
    ctx.beginPath();
    ctx.arc(vx - 1, vy, 2.2, 0, Math.PI * 2);
    ctx.fill();
    if (!reducedMotion) {
      const lift = (timeSeconds * 10) % 14;
      const alpha = Math.max(0, 1 - lift / 14);
      ctx.font = '700 9px Fredoka, sans-serif';
      ctx.fillStyle = `rgba(46, 130, 116, ${alpha.toFixed(2)})`;
      ctx.fillText('♪', vx + 8 + Math.sin(timeSeconds * 3) * 2, vy - 6 - lift);
    }
  }

  // 5. Kucing Penenang (Maneki-Neko): figurin kucing krem dengan kerah merah di sisi kanan bawah
  if (has('kucing-penenang')) {
    const kx = zx + zw - 18;
    const ky = zy + zh - 15;
    const bob = reducedMotion ? 0 : Math.sin(timeSeconds * 3.4) * 1.1;
    // Badan & kepala krem
    ctx.fillStyle = '#fffaf0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.arc(kx, ky + 1, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Telinga kucing
    ctx.beginPath();
    ctx.moveTo(kx - 5, ky - 3);
    ctx.lineTo(kx - 3.5, ky - 8.5);
    ctx.lineTo(kx - 0.5, ky - 4.5);
    ctx.moveTo(kx + 5, ky - 3);
    ctx.lineTo(kx + 3.5, ky - 8.5);
    ctx.lineTo(kx + 0.5, ky - 4.5);
    ctx.fill();
    ctx.stroke();
    // Kerah merah & lonceng emas
    ctx.fillStyle = '#e5534b';
    ctx.fillRect(kx - 4.5, ky + 3, 9, 2.2);
    ctx.fillStyle = '#f5be42';
    ctx.beginPath();
    ctx.arc(kx, ky + 4.5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // Tangan kecil melambai
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.arc(kx + 5.5, ky - 1 - bob, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // 6. Set Teh Hangat: kilau emas & uap ekstra lembut di atas meja konsultasi
  if (has('set-teh-hangat')) {
    const tx = zx + zw * 0.66;
    const ty = zy + zh * 0.48;
    if (!reducedMotion) {
      for (let i = 0; i < 2; i += 1) {
        const rise = (timeSeconds * 9 + i * 5) % 12;
        const alpha = Math.max(0, 0.85 - rise / 14);
        ctx.strokeStyle = `rgba(255, 251, 232, ${alpha.toFixed(2)})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx - 4 + i * 7, ty - 6 - rise);
        ctx.quadraticCurveTo(tx - 2 + i * 7, ty - 10 - rise, tx - 5 + i * 7, ty - 14 - rise);
        ctx.stroke();
      }
    }
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 6. Partikel Hidup Taman Luar (Daun/Kelopak Melayang & 2 Kupu-Kupu Kampus)
// ---------------------------------------------------------------------------

export function drawOutdoorAmbientParticles(
  ctx: CanvasRenderingContext2D,
  widthCss: number,
  heightCss: number,
  camera: { offsetX: number; offsetY: number; scale: number },
  map: LabMapData,
  timeSeconds: number,
  reducedMotion: boolean
): void {
  if (reducedMotion || widthCss < 200 || heightCss < 200) return;
  const worldW = map.width * map.tileSizePx * camera.scale;
  const worldH = map.height * map.tileSizePx * camera.scale;
  const bx = camera.offsetX;
  const by = camera.offsetY;

  ctx.save();
  // 8 kelopak/daun halus melayang di luar gedung (hanya di area halaman rumput)
  for (let i = 0; i < 8; i += 1) {
    const speedX = 12 + (i % 3) * 5;
    const speedY = 6 + (i % 4) * 2.5;
    const px = ((i * 187 + timeSeconds * speedX) % (widthCss + 40)) - 20;
    const py = ((i * 109 + timeSeconds * speedY + Math.sin(timeSeconds * 1.4 + i) * 14) % (heightCss + 40)) - 20;
    // Skip bila di atas bagian tengah dalam gedung agar tak mengganggu pembacaan ruangan
    if (px > bx + 14 && px < bx + worldW - 14 && py > by + 14 && py < by + worldH - 14) continue;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(timeSeconds * 0.9 + i * 1.2);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 224, 232, 0.82)' : 'rgba(232, 245, 178, 0.78)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 4.2, 2.1, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 2 kupu-kupu kampus mungil menari di taman bagian bawah & kiri luar gedung
  const butterflies = [
    {
      cx: Math.max(40, bx + worldW * 0.28),
      cy: Math.min(heightCss - 26, by + worldH + 34),
      col: '#ffe58f',
      phase: 0,
    },
    {
      cx: Math.min(widthCss - 50, bx + worldW * 0.72),
      cy: Math.max(26, by - 26),
      col: '#bae6fd',
      phase: 2.3,
    },
  ];
  for (const b of butterflies) {
    const x = b.cx + Math.sin(timeSeconds * 0.9 + b.phase) * 34;
    const y = b.cy + Math.cos(timeSeconds * 1.6 + b.phase) * 8;
    const flap = Math.abs(Math.sin(timeSeconds * 11 + b.phase));
    const wingW = 1.6 + flap * 3.4;
    ctx.fillStyle = b.col;
    ctx.strokeStyle = 'rgba(62, 37, 23, 0.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.ellipse(x - wingW * 0.6, y, wingW, 2.8, -0.3, 0, Math.PI * 2);
    ctx.ellipse(x + wingW * 0.6, y, wingW, 2.8, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
