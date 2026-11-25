/**
 * Pelukis Dunia Kampus 2D Top-Down Realistis Berdetail Tinggi (High-Detail Hand-Painted 2D Top-Down Game Art).
 * Dirancang untuk RUANG DENGAR — Simulasi Laboratorium Elektronika & IoT:
 * - Taman tanaman rimbun mengelilingi fasad dinding batu-baja gedung + tangga masuk utama di selatan
 * - Koridor keramik abu-hangat realistis dengan tanaman pot sudut, lampu dinding amber, & pintu kaca geser ganda
 * - 11 ruangan laboratorium & konseling dengan dinding belakang (interior north wall elevation) penuh instrumen,
 *   monitor kode/skematik PCB, printer 3D, lemari gudang, sofa, rak buku, mesin minuman, dan perabot modular 2D
 * - Plakat nama ruangan dark-slate berbingkai emas-aksen yang tajam dan bersih
 */
import type { ConsultationDoorMode, LabFurniture, LabMapData, LabZone, ZoneType } from '../../types';
import type { RoomDecorId } from '../../engine/roomDecor';
import { computeSunLighting, type CampusWeatherMode } from '../gpu/sunLighting';

const INK = '#16202e';
const CACHE_SCALE = 2.5; // Render latar gedung statis di 2.5x HD untuk ketajaman Retina tanpa blur

interface FloorPalette {
  style: 'kayu' | 'keramik' | 'beton' | 'karpet' | 'rumput-indoor';
  base: string;
  alt: string;
  grout: string;
  wallTop: string;
  wallFace: string;
  accent: string;
  neonBorder?: string;
  rug?: string;
  rugTrim?: string;
}

const FLOOR_STYLE: Record<ZoneType, FloorPalette> = {
  las: {
    style: 'beton',
    base: '#838c99',
    alt: '#79828f',
    grout: 'rgba(30, 41, 59, 0.24)',
    wallTop: '#475569',
    wallFace: '#94a3b8',
    accent: '#f59e0b',
    neonBorder: 'rgba(245, 158, 11, 0.55)',
  },
  'cetak-3d': {
    style: 'keramik',
    base: '#387da3',
    alt: '#307094',
    grout: 'rgba(12, 42, 64, 0.28)',
    wallTop: '#1e3a5f',
    wallFace: '#5b9bd5',
    accent: '#38bdf8',
    neonBorder: 'rgba(56, 189, 248, 0.65)',
  },
  'elektronik-iot': {
    style: 'keramik',
    base: '#3b9c88',
    alt: '#328c79',
    grout: 'rgba(10, 48, 40, 0.26)',
    wallTop: '#1b4d44',
    wallFace: '#68b8a4',
    accent: '#10b981',
    neonBorder: 'rgba(52, 211, 153, 0.65)',
  },
  'gudang-alat': {
    style: 'beton',
    base: '#8c929c',
    alt: '#818791',
    grout: 'rgba(30, 41, 59, 0.22)',
    wallTop: '#4b5563',
    wallFace: '#9ca3af',
    accent: '#f59e0b',
    neonBorder: 'rgba(245, 158, 11, 0.45)',
  },
  'studio-desain': {
    style: 'keramik',
    base: '#764ba8',
    alt: '#694099',
    grout: 'rgba(38, 16, 68, 0.28)',
    wallTop: '#44266e',
    wallFace: '#986ec9',
    accent: '#d946ef',
    neonBorder: 'rgba(217, 70, 239, 0.65)',
  },
  pemrograman: {
    style: 'keramik',
    base: '#28628c',
    alt: '#22567d',
    grout: 'rgba(10, 32, 54, 0.30)',
    wallTop: '#173754',
    wallFace: '#4882ad',
    accent: '#38bdf8',
    neonBorder: 'rgba(56, 189, 248, 0.68)',
  },
  diskusi: {
    style: 'rumput-indoor',
    base: '#6ca135',
    alt: '#60922c',
    grout: 'rgba(34, 62, 14, 0.22)',
    wallTop: '#3f6212',
    wallFace: '#84cc16',
    accent: '#84cc16',
    neonBorder: 'rgba(234, 224, 192, 0.85)',
  },
  istirahat: {
    style: 'kayu',
    base: '#a37e58',
    alt: '#94704c',
    grout: 'rgba(62, 37, 20, 0.24)',
    wallTop: '#5c4028',
    wallFace: '#c8a986',
    accent: '#f59e0b',
    neonBorder: 'rgba(245, 158, 11, 0.45)',
  },
  konsultasi: {
    style: 'kayu',
    base: '#8d7a66',
    alt: '#7f6d5a',
    grout: 'rgba(44, 32, 22, 0.24)',
    wallTop: '#4a3d33',
    wallFace: '#b5a391',
    accent: '#fbbf24',
    neonBorder: 'rgba(251, 191, 36, 0.5)',
    rug: '#9e9081',
    rugTrim: '#d6c7b6',
  },
  'ruang-dosen': {
    style: 'keramik',
    base: '#6f4285',
    alt: '#623877',
    grout: 'rgba(34, 14, 48, 0.28)',
    wallTop: '#3e204f',
    wallFace: '#8e5ea6',
    accent: '#c084fc',
    neonBorder: 'rgba(192, 132, 252, 0.58)',
  },
  'pojok-baca': {
    style: 'kayu',
    base: '#b88d5c',
    alt: '#a87f4f',
    grout: 'rgba(68, 40, 18, 0.24)',
    wallTop: '#5c3d22',
    wallFace: '#d4b48c',
    accent: '#f59e0b',
    neonBorder: 'rgba(251, 191, 36, 0.52)',
  },
};

export const ZONE_BADGE_META: Record<
  ZoneType,
  { icon: string; displayLabel: string; accent: string; bg: string }
> = {
  las: { icon: '⚙️', displayLabel: 'B. Las (K3)', accent: '#f59e0b', bg: '#152030' },
  'cetak-3d': { icon: '🧊', displayLabel: 'Cetak 3D', accent: '#38bdf8', bg: '#132436' },
  'elektronik-iot': { icon: '⚡', displayLabel: 'Elektronika & IoT', accent: '#10b981', bg: '#122926' },
  'gudang-alat': { icon: '🔧', displayLabel: 'Gudang Alat', accent: '#f59e0b', bg: '#1b222d' },
  'studio-desain': { icon: '🎨', displayLabel: 'Studio Desain', accent: '#d946ef', bg: '#221833' },
  pemrograman: { icon: '💻', displayLabel: 'Pemrograman & MCU', accent: '#38bdf8', bg: '#122438' },
  diskusi: { icon: '👥', displayLabel: 'Meja Diskusi', accent: '#84cc16', bg: '#1a2b18' },
  istirahat: { icon: '☕', displayLabel: 'Ruang Istirahat', accent: '#fbbf24', bg: '#221f1d' },
  konsultasi: { icon: '💬', displayLabel: 'Ruang Konsultasi', accent: '#fbbf24', bg: '#1f232b' },
  'ruang-dosen': { icon: '🎓', displayLabel: 'Ruang Dosen', accent: '#c084fc', bg: '#211830' },
  'pojok-baca': { icon: '📖', displayLabel: 'Pojok Baca', accent: '#fbbf24', bg: '#241e18' },
};

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  if (w <= 0 || h <= 0) return;
  const rad = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, rad);
}

// ---------------------------------------------------------------------------
// Helper Visual Modular 2D (Semak Tanaman, Tanaman Pot, Kursi, Monitor, Buku)
// ---------------------------------------------------------------------------

function drawLushBushCluster(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: number
): void {
  ctx.save();
  // Bayangan bawah semak
  ctx.fillStyle = 'rgba(10, 22, 16, 0.42)';
  ctx.beginPath();
  ctx.ellipse(cx + 1.5, cy + 3, rx * 1.05, ry * 0.95, 0, 0, Math.PI * 2);
  ctx.fill();

  // Lapisan daun dasar gelap (#1f4e24)
  ctx.fillStyle = '#1f4e24';
  ctx.strokeStyle = '#102a14';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Gumpalan daun menengah (#3a8438 & #52a847)
  const blobs: ReadonlyArray<readonly [number, number, number, string]> = [
    [-0.42, -0.18, 0.58, '#347833'],
    [0.38, -0.15, 0.56, '#3e8c3b'],
    [-0.18, 0.24, 0.54, '#2d6b2d'],
    [0.24, 0.22, 0.52, '#499e43'],
    [0.0, -0.25, 0.6, '#58b34c'],
  ];
  for (let i = 0; i < blobs.length; i += 1) {
    const [ox, oy, sr, col] = blobs[(i + seed) % blobs.length];
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.ellipse(cx + ox * rx, cy + oy * ry, rx * sr, ry * sr, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // Pucuk daun terkena sinar matahari (#82d462 & #aee87c)
  ctx.fillStyle = '#82d462';
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.22, cy - ry * 0.28, rx * 0.34, ry * 0.3, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#aee87c';
  ctx.beginPath();
  ctx.ellipse(cx + rx * 0.16, cy - ry * 0.32, rx * 0.24, ry * 0.2, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPottedIndoorPlant(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale = 1,
  squarePot = false
): void {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);

  // Bayangan lantai
  ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.beginPath();
  ctx.ellipse(1, 9, 11, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pot terakota / batu hangat
  if (squarePot) {
    rrect(ctx, -8.5, 1, 17, 10, 2.5);
    ctx.fillStyle = '#c89d6c';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    rrect(ctx, -9.5, -0.5, 19, 3.5, 1.5);
    ctx.fillStyle = '#dfc09a';
    ctx.fill();
    ctx.stroke();
  } else {
    rrect(ctx, -7, 1, 14, 9.5, 3);
    ctx.fillStyle = '#c87144';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    rrect(ctx, -8.2, -0.5, 16.4, 3, 1.5);
    ctx.fillStyle = '#e08b5c';
    ctx.fill();
    ctx.stroke();
  }

  // Rumpun daun rimbun berlapis
  const leaves: ReadonlyArray<readonly [number, number, number, number, number, string]> = [
    [-7, -3, 6.5, 3.8, -0.45, '#2b6e34'],
    [7, -3, 6.5, 3.8, 0.45, '#2b6e34'],
    [-5, -7, 6.2, 3.8, -0.75, '#419443'],
    [5, -7, 6.2, 3.8, 0.75, '#419443'],
    [0, -9, 6.8, 4.5, 0, '#62b856'],
    [-2.5, -5, 5.2, 3.2, -0.2, '#84d66c'],
    [2.5, -5, 5.2, 3.2, 0.2, '#9ae67e'],
  ];
  for (const [lx, ly, rx, ry, rot, col] of leaves) {
    ctx.fillStyle = col;
    ctx.strokeStyle = '#143319';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(lx, ly, rx, ry, rot, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function drawTopDownChair(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  color: string,
  darkColor: string,
  facing: 'atas' | 'bawah' | 'kiri' | 'kanan' = 'atas',
  w = 15,
  h = 12
): void {
  ctx.save();
  // Bayangan kursi
  rrect(ctx, cx - w / 2 + 1, cy - h / 2 + 2.5, w, h, 4);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.fill();

  // Dudukan kursi
  rrect(ctx, cx - w / 2, cy - h / 2, w, h, 4);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.25;
  ctx.stroke();

  // Sandaran kursi sesuai arah hadap
  ctx.fillStyle = darkColor;
  if (facing === 'atas') {
    rrect(ctx, cx - w / 2 + 1.5, cy + h / 2 - 4, w - 3, 3.8, 2);
  } else if (facing === 'bawah') {
    rrect(ctx, cx - w / 2 + 1.5, cy - h / 2 + 0.5, w - 3, 3.8, 2);
  } else if (facing === 'kiri') {
    rrect(ctx, cx + w / 2 - 4, cy - h / 2 + 1.5, 3.8, h - 3, 2);
  } else {
    rrect(ctx, cx - w / 2 + 0.5, cy - h / 2 + 1.5, 3.8, h - 3, 2);
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawWallSconceLight(ctx: CanvasRenderingContext2D, lx: number, ly: number, radius = 34): void {
  ctx.save();
  const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, radius);
  glow.addColorStop(0, 'rgba(255, 230, 148, 0.55)');
  glow.addColorStop(0.45, 'rgba(251, 191, 36, 0.22)');
  glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(lx, ly, radius, 0, Math.PI * 2);
  ctx.fill();

  // Lampu fisik mungil di dinding
  rrect(ctx, lx - 5, ly - 2.5, 10, 5, 2);
  ctx.fillStyle = '#fef08a';
  ctx.fill();
  ctx.strokeStyle = '#92400e';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 1. Lingkungan Luar Gedung, Sabuk Tanaman Rimbun, & Tangga Masuk Selatan
// ---------------------------------------------------------------------------

export function drawOutdoorCampusCourtyard(
  ctx: CanvasRenderingContext2D,
  widthCss: number,
  heightCss: number,
  camera: { offsetX: number; offsetY: number; scale: number },
  map: LabMapData,
  _timeSeconds: number,
  _reducedMotion: boolean,
  clockMinutesOfDay = 540,
  weatherMode: CampusWeatherMode = 'otomatis'
): void {
  const sun = computeSunLighting(clockMinutesOfDay, weatherMode);
  const isRain = weatherMode === 'hujan';
  const isAfternoon = sun.phase === 'sore' && !isRain;

  ctx.save();

  // 1. Latar Luar: Deep Architectural Slate-Navy (#142536 -> #0c1824)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, heightCss);
  if (isRain) {
    bgGrad.addColorStop(0, '#0c1926');
    bgGrad.addColorStop(0.5, '#132638');
    bgGrad.addColorStop(1, '#0b1520');
  } else if (isAfternoon) {
    bgGrad.addColorStop(0, '#17293b');
    bgGrad.addColorStop(0.5, '#1e3448');
    bgGrad.addColorStop(1, '#101e2b');
  } else {
    bgGrad.addColorStop(0, '#132435');
    bgGrad.addColorStop(0.5, '#1b3145');
    bgGrad.addColorStop(1, '#0e1c2a');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, widthCss, heightCss);

  // Pelat dek lantai bawah & bingkai teknikal luar seperti pada gambar referensi
  const deckY = Math.max(heightCss - 54, camera.offsetY + map.height * map.tileSizePx * camera.scale + 16);
  if (deckY < heightCss) {
    ctx.fillStyle = '#182b3d';
    ctx.fillRect(0, deckY, widthCss, heightCss - deckY);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, deckY);
    ctx.lineTo(widthCss, deckY);
    ctx.stroke();
  }

  // Koordinat Presisi Kotak Denah Utama
  const worldW = map.width * map.tileSizePx;
  const worldH = map.height * map.tileSizePx;
  const bx = camera.offsetX;
  const by = camera.offsetY;
  const bw = worldW * camera.scale;
  const bh = worldH * camera.scale;
  const s = camera.scale;

  // 2. Pelat Dasar Batu Taman Perimeter (Garden Planter Stone Plinth)
  const plinthPad = 17 * s;
  const wallPad = 6 * s;
  ctx.save();
  ctx.shadowColor = 'rgba(4, 10, 18, 0.65)';
  ctx.shadowBlur = 22 * s;
  ctx.shadowOffsetY = 6 * s;
  rrect(
    ctx,
    bx - plinthPad,
    by - plinthPad,
    bw + plinthPad * 2,
    bh + plinthPad * 2,
    14 * s
  );
  ctx.fillStyle = '#334155';
  ctx.fill();
  ctx.restore();

  rrect(
    ctx,
    bx - plinthPad,
    by - plinthPad,
    bw + plinthPad * 2,
    bh + plinthPad * 2,
    14 * s
  );
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = Math.max(1.5, 2 * s);
  ctx.stroke();

  // Tanah subur planter di sekeliling gedung
  rrect(
    ctx,
    bx - plinthPad + 3 * s,
    by - plinthPad + 3 * s,
    bw + (plinthPad - 3 * s) * 2,
    bh + (plinthPad - 3 * s) * 2,
    12 * s
  );
  ctx.fillStyle = '#1b2e1e';
  ctx.fill();

  // 3. Sabuk Tanaman Hias & Semak Rimbun Mengelilingi Gedung (sesuai gambar referensi!)
  const bushStep = Math.max(14, 24 * s);
  const stairLeftX = bx + bw * 0.415;
  const stairRightX = bx + bw * 0.585;

  // Deret semak utara & selatan
  let seedIdx = 0;
  for (let gx = bx - 6 * s; gx <= bx + bw + 6 * s; gx += bushStep) {
    // Utara
    drawLushBushCluster(ctx, gx, by - 10 * s, 14 * s, 9 * s, seedIdx);
    // Selatan (dikosongkan di area tangga masuk tengah)
    if (gx < stairLeftX - 8 * s || gx > stairRightX + 8 * s) {
      drawLushBushCluster(ctx, gx, by + bh + 10 * s, 14 * s, 9 * s, seedIdx + 3);
    }
    seedIdx += 1;
  }

  // Deret semak barat & timur
  for (let gy = by - 4 * s; gy <= by + bh + 4 * s; gy += bushStep) {
    drawLushBushCluster(ctx, bx - 10 * s, gy, 9.5 * s, 13.5 * s, seedIdx + 1);
    drawLushBushCluster(ctx, bx + bw + 10 * s, gy, 9.5 * s, 13.5 * s, seedIdx + 4);
    seedIdx += 1;
  }

  // Rumpun pohon sudut yang lebih besar di ke-4 penjuru gedung
  for (const [cx, cy, st] of [
    [bx - 8 * s, by - 8 * s, 0],
    [bx + bw + 8 * s, by - 8 * s, 2],
    [bx - 8 * s, by + bh + 8 * s, 1],
    [bx + bw + 8 * s, by + bh + 8 * s, 3],
  ] as const) {
    drawLushBushCluster(ctx, cx, cy, 16 * s, 14 * s, st);
  }

  // 4. Bingkai Fasad Beton-Baja Gedung Utama (Architectural Outer Wall Shell)
  rrect(ctx, bx - wallPad, by - wallPad, bw + wallPad * 2, bh + wallPad * 2, 8 * s);
  ctx.fillStyle = '#475569';
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = Math.max(1.5, 2.2 * s);
  ctx.stroke();

  // 5. Tangga Masuk Utama di Selatan Gedung (Grand Entrance Staircase sesuai referensi)
  const stairW = stairRightX - stairLeftX;
  const stairTopY = by + bh - 12 * s;
  const stairH = 28 * s;

  // Pelat dasar tangga
  ctx.fillStyle = '#475569';
  ctx.fillRect(stairLeftX - 6 * s, stairTopY, stairW + 12 * s, stairH);

  // 5 Anak tangga batu terang dengan garis bayangan & lampu pijakan hangat
  const steps = 5;
  const stepH = stairH / steps;
  for (let si = 0; si < steps; si += 1) {
    const sy = stairTopY + si * stepH;
    ctx.fillStyle = si % 2 === 0 ? '#cbd5e1' : '#94a3b8';
    ctx.fillRect(stairLeftX, sy, stairW, stepH - 1 * s);
    ctx.fillStyle = '#334155';
    ctx.fillRect(stairLeftX, sy + stepH - 1.5 * s, stairW, 1.5 * s);

    // Pendaran lampu tangga kuning hangat di sisi kiri & kanan anak tangga
    ctx.fillStyle = 'rgba(251, 191, 36, 0.75)';
    ctx.fillRect(stairLeftX + 4 * s, sy + 1.5 * s, 8 * s, Math.max(1.5, 2.2 * s));
    ctx.fillRect(stairRightX - 12 * s, sy + 1.5 * s, 8 * s, Math.max(1.5, 2.2 * s));
  }

  // Balustrade / Dinding Sayap Kiri & Kanan Tangga
  for (const bxSide of [stairLeftX - 7 * s, stairRightX]) {
    rrect(ctx, bxSide, stairTopY - 2 * s, 7 * s, stairH + 3 * s, 2 * s);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    rrect(ctx, bxSide + 1.5 * s, stairTopY, 4 * s, stairH - 1 * s, 1 * s);
    ctx.fillStyle = '#64748b';
    ctx.fill();
  }

  // Dua tanaman pot penyambut di kiri dan kanan tangga masuk utama
  drawLushBushCluster(ctx, stairLeftX - 18 * s, stairTopY + 8 * s, 13 * s, 10 * s, 1);
  drawLushBushCluster(ctx, stairRightX + 18 * s, stairTopY + 8 * s, 13 * s, 10 * s, 2);

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 2. Kanvas Gedung Statis 2D Top-Down HD (Koridor, 11 Ruangan, Dinding, Pintu Kaca)
// ---------------------------------------------------------------------------

const backdropCache = new WeakMap<LabMapData, Map<ConsultationDoorMode, HTMLCanvasElement>>();

function paintRoomBackWall(ctx: CanvasRenderingContext2D, zone: LabZone, t: number): void {
  const { x, y, w } = zone.bounds;
  const px = x * t;
  const py = y * t;
  const pw = w * t;
  const pal = FLOOR_STYLE[zone.id];
  const wallH = zone.id === 'konsultasi' ? t * 0.92 : t * 1.38;

  if (zone.id === 'diskusi') return; // Meja Diskusi adalah area terbuka hijau di tengah koridor

  ctx.save();
  // Panel fasad dinding belakang dalam ruangan (interior north wall elevation)
  const wallGrad = ctx.createLinearGradient(px, py, px, py + wallH);
  wallGrad.addColorStop(0, pal.wallTop);
  wallGrad.addColorStop(0.28, pal.wallFace);
  wallGrad.addColorStop(1, pal.base);
  ctx.fillStyle = wallGrad;
  ctx.fillRect(px, py, pw, wallH);

  // Lis bawah dinding (baseboard) & bayangan kontak ke lantai
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.fillRect(px, py + wallH - 2.5, pw, 4.5);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.fillRect(px, py + wallH - 3.5, pw, 1.2);

  // Sambungan panel vertikal dinding
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.16)';
  ctx.lineWidth = 1;
  for (let gx = t * 2; gx < pw; gx += t * 2) {
    ctx.beginPath();
    ctx.moveTo(px + gx, py);
    ctx.lineTo(px + gx, py + wallH - 3);
    ctx.stroke();
  }

  // Peralatan & layar dinding spesifik ruangan sesuai gambar referensi
  if (zone.id === 'las') {
    // 1. Kotak panel listrik industri di kiri
    rrect(ctx, px + 14, py + 7, 32, 24, 2.5);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.fillStyle = '#64748b';
    ctx.fillRect(px + 20, py + 13, 20, 4);
    ctx.fillRect(px + 20, py + 20, 14, 4);

    // 2. Rambu Peringatan Segitiga K3 Besar di Tengah Dinding
    rrect(ctx, px + pw * 0.26, py + 6, 54, 28, 3);
    ctx.fillStyle = '#fef3c7';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    const tx = px + pw * 0.26 + 27;
    const ty = py + 10;
    ctx.fillStyle = '#f59e0b';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + 11, ty + 18);
    ctx.lineTo(tx - 11, ty + 18);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(tx - 1, ty + 6, 2, 6);
    ctx.fillRect(tx - 1, ty + 14, 2, 2);

    // 3. Tudung ventilasi baja & monitor sensor gas K3 hijau di kanan
    rrect(ctx, px + pw * 0.54, py + 6, 48, 22, 2.5);
    ctx.fillStyle = '#94a3b8';
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.fillStyle = '#475569';
    ctx.fillRect(px + pw * 0.54 + 5, py + 21, 38, 4);

    // Monitor gas digital hijau
    const gx = px + pw - 36;
    rrect(ctx, gx, py + 7, 24, 20, 2.5);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.stroke();
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(gx + 3, py + 10, 18, 11);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(gx + 5, py + 13, 14, 2);
    ctx.fillRect(gx + 5, py + 17, 10, 2);
  } else if (zone.id === 'cetak-3d') {
    // Poster blueprint 3D menyala biru di dinding kiri
    rrect(ctx, px + 10, py + 6, 28, 30, 3);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.1;
    ctx.strokeRect(px + 15, py + 11, 18, 13);
    ctx.beginPath();
    ctx.arc(px + 24, py + 17.5, 4.5, 0, Math.PI * 2);
    ctx.stroke();
  } else if (zone.id === 'elektronik-iot') {
    // 1. Papan skematik kecil kiri
    rrect(ctx, px + 26, py + 7, 36, 24, 2.5);
    ctx.fillStyle = '#064e3b';
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.strokeStyle = '#6ee7b7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + 31, py + 18);
    ctx.lineTo(px + 42, py + 12);
    ctx.lineTo(px + 50, py + 21);
    ctx.lineTo(px + 58, py + 15);
    ctx.stroke();

    // 2. Layar Besar Skematik Rangkaian PCB Hijau di Tengah Dinding
    const pcbX = px + 70;
    rrect(ctx, pcbX, py + 5, 76, 32, 3);
    ctx.fillStyle = '#042f2e';
    ctx.fill();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(pcbX + 8, py + 14);
    ctx.lineTo(pcbX + 28, py + 14);
    ctx.lineTo(pcbX + 34, py + 20);
    ctx.lineTo(pcbX + 66, py + 20);
    ctx.moveTo(pcbX + 12, py + 26);
    ctx.lineTo(pcbX + 44, py + 26);
    ctx.lineTo(pcbX + 50, py + 12);
    ctx.lineTo(pcbX + 68, py + 12);
    ctx.stroke();
    for (const [nx, ny] of [
      [pcbX + 28, py + 14],
      [pcbX + 44, py + 26],
      [pcbX + 56, py + 20],
    ]) {
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(nx - 2, ny - 2, 4, 4);
    }

    // 3. Layar Telemetri IoT Biru di Kanan Dinding
    const iotX = px + 154;
    rrect(ctx, iotX, py + 6, 62, 30, 3);
    ctx.fillStyle = '#0c4a6e';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#7dd3fc';
    ctx.fillRect(iotX + 7, py + 12, 24, 3);
    ctx.fillRect(iotX + 7, py + 18, 18, 3);
    ctx.strokeStyle = '#00E5FF';
    ctx.beginPath();
    ctx.arc(iotX + 46, py + 21, 7, 0, Math.PI * 2);
    ctx.stroke();
  } else if (zone.id === 'studio-desain') {
    // Layar Besar 3D Wireframe Cube CAD Ungu-Sian di Dinding Kanan Studio Desain
    const cadX = px + pw - 110;
    rrect(ctx, cadX, py + 6, 86, 34, 3.5);
    ctx.fillStyle = '#2e1065';
    ctx.fill();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // Kubus isometrik wireframe di dalam layar CAD
    const cx = cadX + 43;
    const cy = py + 23;
    ctx.strokeStyle = '#e879f9';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx + 11, cy - 4);
    ctx.lineTo(cx, cy + 2);
    ctx.lineTo(cx - 11, cy - 4);
    ctx.closePath();
    ctx.moveTo(cx - 11, cy - 4);
    ctx.lineTo(cx - 11, cy + 6);
    ctx.lineTo(cx, cy + 12);
    ctx.lineTo(cx + 11, cy + 6);
    ctx.lineTo(cx + 11, cy - 4);
    ctx.moveTo(cx, cy + 2);
    ctx.lineTo(cx, cy + 12);
    ctx.stroke();
  } else if (zone.id === 'pemrograman') {
    // 3 Layar Lebar IDE Kode Pemrograman di Dinding Utara Pemrograman & MCU
    for (let i = 0; i < 3; i += 1) {
      const mx = px + 24 + i * 94;
      const mw = 84;
      const mh = 32;
      rrect(ctx, mx, py + 5, mw, mh, 3);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Baris syntax kode warna-warni
      const codeColors = ['#38bdf8', '#fbbf24', '#34d399', '#f87171', '#a78bfa'];
      for (let line = 0; line < 5; line += 1) {
        const indent = (line % 3) * 6;
        const len = 24 + ((line * 17 + i * 11) % 36);
        ctx.fillStyle = codeColors[(line + i) % codeColors.length];
        ctx.fillRect(mx + 8 + indent, py + 10 + line * 4.5, len, 2.3);
      }
    }
  } else if (zone.id === 'istirahat' || zone.id === 'konsultasi') {
    // Bingkai lukisan/poster hangat & lampu dinding nyaman
    for (const fx of [px + 28, px + 56]) {
      rrect(ctx, fx, py + 6, 20, 14, 2);
      ctx.fillStyle = '#fef3c7';
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  ctx.restore();
}

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

  // 1. Warna dasar lantai
  ctx.fillStyle = pal.base;
  ctx.fillRect(px, py, pw, ph);

  // 2. Tekstur Material Spesifik (Keramik, Kayu, Beton, Karpet, atau Rumput Indoor)
  if (pal.style === 'kayu') {
    const plankH = t * 0.45;
    for (let row = 0; row * plankH < ph; row += 1) {
      const ry = py + row * plankH;
      if (row % 2 === 1) {
        ctx.fillStyle = pal.alt;
        ctx.fillRect(px, ry, pw, plankH);
      }
      ctx.strokeStyle = pal.grout;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, ry);
      ctx.lineTo(px + pw, ry);
      ctx.stroke();
      const offset = (row % 3) * t * 0.95;
      for (let sx = px + offset; sx < px + pw; sx += t * 2.6) {
        ctx.beginPath();
        ctx.moveTo(sx, ry);
        ctx.lineTo(sx, ry + plankH);
        ctx.stroke();
      }
    }
  } else if (pal.style === 'keramik') {
    const tile = t * 0.75;
    for (let gy = 0; gy * tile < ph; gy += 1) {
      for (let gx = 0; gx * tile < pw; gx += 1) {
        if ((gx + gy) % 2 === 1) {
          ctx.fillStyle = pal.alt;
          ctx.fillRect(px + gx * tile, py + gy * tile, tile, tile);
        }
      }
    }
    ctx.strokeStyle = pal.grout;
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    for (let gx = 0; gx * tile <= pw; gx += 1) {
      ctx.moveTo(px + gx * tile, py);
      ctx.lineTo(px + gx * tile, py + ph);
    }
    for (let gy = 0; gy * tile <= ph; gy += 1) {
      ctx.moveTo(px, py + gy * tile);
      ctx.lineTo(px + pw, py + gy * tile);
    }
    ctx.stroke();
  } else if (pal.style === 'rumput-indoor') {
    // Karpet Rumput Taman Kolaborasi Hijau Segar dengan Bingkai Anyaman Krem-Emas (Meja Diskusi)
    rrect(ctx, px + 2, py + 2, pw - 4, ph - 4, 12);
    ctx.fillStyle = '#d9c89e';
    ctx.fill();
    rrect(ctx, px + 7, py + 7, pw - 14, ph - 14, 9);
    ctx.fillStyle = pal.base;
    ctx.fill();
    ctx.strokeStyle = '#84cc16';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Detail tekstur helai rumput halus
    ctx.fillStyle = pal.alt;
    for (let gy = 12; gy < ph - 12; gy += 11) {
      for (let gx = (gy % 22 === 12 ? 12 : 18); gx < pw - 12; gx += 13) {
        ctx.fillRect(px + gx, py + gy, 3, 1.8);
      }
    }
    ctx.fillStyle = '#84cc16';
    for (let gy = 16; gy < ph - 14; gy += 15) {
      for (let gx = 16; gx < pw - 14; gx += 17) {
        ctx.fillRect(px + gx, py + gy, 2.2, 1.5);
      }
    }
  } else {
    // Lantai Beton Halus Industrial (Bengkel Las & Gudang Alat)
    const slab = t * 1.5;
    ctx.strokeStyle = pal.grout;
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

    // Marka Garis Keselamatan K3 Kuning-Hitam Mengelilingi Area Kerja Bengkel Las
    if (zone.id === 'las') {
      const m = 8;
      const band = 5.5;
      ctx.fillStyle = '#eab308';
      // Bawah, Kiri, Kanan
      ctx.fillRect(px + m, py + ph - m - band, pw - m * 2, band);
      ctx.fillRect(px + m, py + t * 1.4, band, ph - t * 1.4 - m);
      ctx.fillRect(px + pw - m - band, py + t * 1.4, band, ph - t * 1.4 - m);

      ctx.fillStyle = '#1e293b';
      for (let sx = px + m; sx < px + pw - m; sx += 12) {
        ctx.fillRect(sx, py + ph - m - band, 5, band);
      }
      for (let sy = py + t * 1.4; sy < py + ph - m; sy += 12) {
        ctx.fillRect(px + m, sy, band, 5);
        ctx.fillRect(px + pw - m - band, sy, band, 5);
      }
    }
  }

  // 3. Dinding Belakang Interior (Back-Wall Elevation & Wall Monitors)
  paintRoomBackWall(ctx, zone, t);

  // 4. Karpet Tengah (Ruang Konsultasi)
  if (pal.rug && pal.rugTrim) {
    const insetX = t * 1.4;
    const insetY = t * 0.9;
    rrect(ctx, px + insetX, py + insetY, pw - insetX * 2, ph - insetY * 1.4, 6);
    ctx.fillStyle = pal.rug;
    ctx.fill();
    ctx.strokeStyle = pal.rugTrim;
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  // 5. Peralatan & Furnitur Sekunder Terintegrasi di Setiap Ruangan (100% Sesuai Referensi!)
  ctx.save();
  if (zone.id === 'las') {
    // Tabung APAR Merah Menyala di Sisi Kiri Bengkel Las
    const ax = px + 18;
    const ay = py + t * 2.2;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.beginPath();
    ctx.ellipse(ax, ay + 15, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    rrect(ctx, ax - 5.5, ay, 11, 16, 4);
    ctx.fillStyle = '#dc2626';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    // Sabuk putih & kepala katup kuningan APAR
    ctx.fillStyle = '#fef2f2';
    ctx.fillRect(ax - 4.5, ay + 5, 9, 3);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(ax - 2, ay - 3, 4, 3);

    // Meja Kerja Utama Bengkel Las di Tengah (dilengkapi solder station biru, multimeter kuning, & ragum)
    const wx = px + t * 2.1;
    const wy = py + t * 2.75;
    const ww = t * 4.8;
    const wh = t * 1.85;
    drawTableBase(ctx, wx, wy, ww, wh, '#d1d5db', '#6b7280', 4, 'rgba(255, 255, 255, 0.65)');
    // Laci bawah meja kerja las
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(wx + 8, wy + wh - 7, 26, 5);
    ctx.fillRect(wx + ww - 34, wy + wh - 7, 26, 5);
    // Unit Power Station Las Biru di atas meja
    rrect(ctx, wx + 12, wy + 5, 22, 14, 2.5);
    ctx.fillStyle = '#2563eb';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#93c5fd';
    ctx.fillRect(wx + 15, wy + 8, 8, 5);
    // Multimeter kuning & benda kerja PCB
    rrect(ctx, wx + 44, wy + 7, 14, 11, 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.stroke();
    rrect(ctx, wx + 68, wy + 8, 24, 12, 2);
    ctx.fillStyle = '#475569';
    ctx.fill();
    ctx.stroke();
  } else if (zone.id === 'cetak-3d') {
    // Proyeksi Hologram Kubus 3D Wireframe Cyan Bercahaya di Lantai Kiri Bawah
    const holoX = px + t * 3.8;
    const holoY = py + ph * 0.72;
    const holoGlow = ctx.createRadialGradient(holoX, holoY, 2, holoX, holoY, 28);
    holoGlow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
    holoGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = holoGlow;
    ctx.beginPath();
    ctx.arc(holoX, holoY, 28, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.4;
    const r = 13;
    ctx.beginPath();
    ctx.moveTo(holoX, holoY - r);
    ctx.lineTo(holoX + r, holoY - r * 0.45);
    ctx.lineTo(holoX, holoY + r * 0.1);
    ctx.lineTo(holoX - r, holoY - r * 0.45);
    ctx.closePath();
    ctx.moveTo(holoX - r, holoY - r * 0.45);
    ctx.lineTo(holoX - r, holoY + r * 0.55);
    ctx.lineTo(holoX, holoY + r * 1.1);
    ctx.lineTo(holoX + r, holoY + r * 0.55);
    ctx.lineTo(holoX + r, holoY - r * 0.45);
    ctx.moveTo(holoX, holoY + r * 0.1);
    ctx.lineTo(holoX, holoY + r * 1.1);
    ctx.stroke();

    // Tanaman pot sudut bawah Ruang Cetak 3D
    drawPottedIndoorPlant(ctx, px + 18, py + ph - 18, 0.9);
    drawPottedIndoorPlant(ctx, px + pw - 18, py + ph - 18, 0.9);
  } else if (zone.id === 'elektronik-iot') {
    // Rak Komponen di Kiri & Tanaman Pot di Sudut Bawah
    rrect(ctx, px + 8, py + t * 1.5, 20, 42, 3);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    for (let r = 0; r < 4; r += 1) {
      ctx.fillStyle = r % 2 === 0 ? '#38bdf8' : '#34d399';
      ctx.fillRect(px + 11, py + t * 1.5 + 5 + r * 9, 14, 5);
    }
    drawPottedIndoorPlant(ctx, px + 18, py + ph - 18, 0.9);
    drawPottedIndoorPlant(ctx, px + pw - 18, py + ph - 18, 0.9);
  } else if (zone.id === 'gudang-alat') {
    // Lemari Perkakas Tinggi di Kiri & Dua Rak Besi-Kayu Besar Penuh Kotak Komponen Biru
    rrect(ctx, px + 8, py + t * 1.2, 24, 56, 3);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(px + 11, py + t * 1.2 + 5, 18, 22);
    ctx.fillRect(px + 11, py + t * 1.2 + 30, 18, 20);

    // Rak Kotak Penyimpanan Biru Kedua di Sisi Kanan
    const rx = px + 38;
    const ry = py + t * 2.1;
    const rw = pw - 48;
    const rh = 44;
    drawTableBase(ctx, rx, ry, rw, rh, '#b4834e', '#7c5329', 4);
    for (let row = 0; row < 3; row += 1) {
      for (let col = 0; col < 5; col += 1) {
        const bx = rx + 6 + col * ((rw - 12) / 5);
        const by = ry + 5 + row * 12;
        rrect(ctx, bx, by, (rw - 24) / 5, 9, 2);
        ctx.fillStyle = (row + col) % 2 === 0 ? '#0284c7' : '#0d9488';
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 0.9;
        ctx.stroke();
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(bx + 3, by + 3, 6, 2);
      }
    }
  } else if (zone.id === 'studio-desain') {
    // Kursi kerja desainer menghadap workstation + tanaman pot di kedua sudut bawah
    drawTopDownChair(ctx, px + t * 3.0, py + t * 3.55, '#475569', '#1e293b', 'atas', 18, 14);
    drawTopDownChair(ctx, px + t * 8.0, py + t * 3.55, '#b45309', '#78350f', 'atas', 18, 14);
    drawPottedIndoorPlant(ctx, px + 20, py + ph - 18, 0.95);
    drawPottedIndoorPlant(ctx, px + pw - 20, py + ph - 18, 0.95);
  } else if (zone.id === 'pemrograman') {
    // Kursi kerja mahasiswa pemrograman + tanaman pot sudut kiri bawah
    drawTopDownChair(ctx, px + t * 3.2, py + t * 3.35, '#1e3a8a', '#172554', 'atas', 17, 13);
    drawTopDownChair(ctx, px + t * 5.2, py + t * 3.35, '#1e3a8a', '#172554', 'atas', 17, 13);
    drawTopDownChair(ctx, px + t * 8.0, py + t * 3.35, '#1e3a8a', '#172554', 'atas', 17, 13);
    drawTopDownChair(ctx, px + t * 10.0, py + t * 3.35, '#1e3a8a', '#172554', 'atas', 17, 13);
    drawPottedIndoorPlant(ctx, px + 22, py + ph - 20, 1.0);
  } else if (zone.id === 'diskusi') {
    // 4 Pohon Pot Rimbun di Keempat Sudut Taman Diskusi + Layar Presentasi Grafik di Kanan Atas
    drawPottedIndoorPlant(ctx, px + 24, py + 26, 1.15);
    drawPottedIndoorPlant(ctx, px + 24, py + ph - 24, 1.15);
    drawPottedIndoorPlant(ctx, px + pw - 24, py + ph - 24, 1.15);

    // Layar Presentasi Berdiri di Sudut Kanan Atas Meja Diskusi
    const sx = px + pw - 74;
    const sy = py + 14;
    // Kaki tripod layar
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(sx + 28, sy + 30);
    ctx.lineTo(sx + 16, sy + 44);
    ctx.moveTo(sx + 28, sy + 30);
    ctx.lineTo(sx + 40, sy + 44);
    ctx.moveTo(sx + 28, sy + 30);
    ctx.lineTo(sx + 28, sy + 46);
    ctx.stroke();
    rrect(ctx, sx, sy, 56, 32, 3.5);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    // Grafik garis cyan & emerald di layar presentasi
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sx + 7, sy + 24);
    ctx.lineTo(sx + 18, sy + 16);
    ctx.lineTo(sx + 28, sy + 20);
    ctx.lineTo(sx + 40, sy + 10);
    ctx.lineTo(sx + 49, sy + 13);
    ctx.stroke();
  } else if (zone.id === 'konsultasi') {
    // Sofa Konseling Abu-Terang Nyaman di Dinding Utara + 2 Meja Lampu Samping
    const sx = px + pw * 0.34;
    const sy = py + 12;
    const sw = t * 2.8;
    const sh = t * 1.15;
    rrect(ctx, sx, sy, sw, sh, 6);
    ctx.fillStyle = '#e2e8f0';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // Sandaran & bantal sofa
    rrect(ctx, sx + 3, sy + 2, sw - 6, 9, 3);
    ctx.fillStyle = '#cbd5e1';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(sx + sw / 2, sy + 11);
    ctx.lineTo(sx + sw / 2, sy + sh - 2);
    ctx.stroke();

    // Meja samping kiri & kanan sofa dengan lampu hangat
    for (const lx of [sx - 20, sx + sw + 4]) {
      drawTableBase(ctx, lx, sy + 4, 16, 18, '#b4834e', '#7c5329', 3);
      drawWallSconceLight(ctx, lx + 8, sy + 10, 22);
    }
    drawPottedIndoorPlant(ctx, px + 18, py + ph - 16, 0.85);
  } else if (zone.id === 'istirahat') {
    // Mesin Minuman (Vending Machine) Merah-Biru Bercahaya di Kanan Ruang Istirahat
    const vx = px + pw - 56;
    const vy = py + 16;
    const vw = 38;
    const vh = 54;
    drawTableBase(ctx, vx, vy, vw, vh, '#dc2626', '#991b1b', 4);
    rrect(ctx, vx + 4, vy + 5, vw - 12, vh - 16, 2.5);
    ctx.fillStyle = '#0c4a6e';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Deretan kaleng/botol minuman warna-warni di dalam etalase kaca
    const canCols = ['#38bdf8', '#fbbf24', '#4ade80', '#f87171'];
    for (let r = 0; r < 4; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        ctx.fillStyle = canCols[(r + c) % canCols.length];
        ctx.fillRect(vx + 7 + c * 5, vy + 8 + r * 8, 3.5, 5.5);
      }
    }
    drawPottedIndoorPlant(ctx, px + 18, py + 24, 0.9);
  } else if (zone.id === 'ruang-dosen') {
    // Lemari Arsip di Kiri + Rak Buku Tinggi Penuh Buku di Kanan Ruang Dosen
    drawTableBase(ctx, px + 12, py + 22, 26, 32, '#6b4c7a', '#4a3256', 3);
    drawWallSconceLight(ctx, px + 25, py + 32, 24);

    // Rak buku besar di dinding kanan Ruang Dosen
    const bx = px + pw - 44;
    const by = py + 12;
    const bw = 32;
    const bh = 64;
    drawTableBase(ctx, bx, by, bw, bh, '#b4834e', '#7c5329', 3);
    const bCols = ['#ef4444', '#3b82f6', '#fbbf24', '#10b981', '#a855f7'];
    for (let row = 0; row < 4; row += 1) {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(bx + 3, by + 6 + row * 14, bw - 6, 11);
      for (let b = 0; b < 5; b += 1) {
        ctx.fillStyle = bCols[(row + b) % bCols.length];
        ctx.fillRect(bx + 4 + b * 5, by + 7 + row * 14, 4, 9.5);
      }
    }
  } else if (zone.id === 'pojok-baca') {
    // Dua Lemari Buku Kayu Besar Penuh Buku Warna-Warni di Dinding Utara Pojok Baca
    const bookColors = ['#ef4444', '#38bdf8', '#fbbf24', '#34d399', '#fb923c', '#a78bfa'];
    for (const bx of [px + 16, px + pw - 108]) {
      const by = py + 8;
      const bw = 92;
      const bh = 46;
      drawTableBase(ctx, bx, by, bw, bh, '#b4834e', '#784c20', 4);
      for (let row = 0; row < 3; row += 1) {
        const sy = by + 5 + row * 13;
        ctx.fillStyle = '#3b210d';
        ctx.fillRect(bx + 4, sy, bw - 8, 10);
        for (let b = 0; b < 14; b += 1) {
          ctx.fillStyle = bookColors[(row * 3 + b) % bookColors.length];
          ctx.fillRect(bx + 6 + b * 5.8, sy + 1, 4.5, 8.5);
        }
      }
    }
    // Lampu Gantung Baca Hangat di Antara Kedua Rak Buku
    drawWallSconceLight(ctx, px + pw * 0.5, py + 44, 52);
    drawPottedIndoorPlant(ctx, px + 18, py + ph - 22, 1.0);
  }
  ctx.restore();

  // 6. Ambient Occlusion Halus di Tepi Ruangan (Tanpa Menggelapkan Warna Material!)
  const aoTop = ctx.createLinearGradient(px, py, px, py + t * 0.7);
  aoTop.addColorStop(0, 'rgba(15, 23, 42, 0.22)');
  aoTop.addColorStop(1, 'rgba(15, 23, 42, 0)');
  ctx.fillStyle = aoTop;
  ctx.fillRect(px, py, pw, t * 0.7);

  ctx.restore();
}

function paintCorridorFloor(ctx: CanvasRenderingContext2D, map: LabMapData, t: number): void {
  const worldW = map.width * t;
  const worldH = map.height * t;

  // Lantai Keramik Koridor Abu-Batu Hangat Realistis (Warm Architectural Slate-Gray Tiles)
  ctx.fillStyle = '#838d9d';
  ctx.fillRect(0, 0, worldW, worldH);

  const subTile = t * 0.5;
  for (let gy = 0; gy * subTile < worldH; gy += 1) {
    for (let gx = 0; gx * subTile < worldW; gx += 1) {
      if ((gx + gy) % 2 === 1) {
        ctx.fillStyle = '#7b8595';
        ctx.fillRect(gx * subTile, gy * subTile, subTile, subTile);
      }
    }
  }

  // Garis sambungan ubin (mortar lines) tajam dan halus
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.22)';
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  for (let x = 0; x <= worldW; x += subTile) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, worldH);
  }
  for (let y = 0; y <= worldH; y += subTile) {
    ctx.moveTo(0, y);
    ctx.lineTo(worldW, y);
  }
  ctx.stroke();

  // Panah Penunjuk Koridor Kuning-Emas Halus (>>> dan <<<)
  ctx.save();
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.82)';
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const cxTile of [11.2, 22.0, 32.5]) {
    for (let i = 0; i < 3; i += 1) {
      const cx = (cxTile + i * 0.42) * t;
      const cy = 9.8 * t;
      ctx.beginPath();
      ctx.moveTo(cx - 3.5, cy - 4.5);
      ctx.lineTo(cx + 2, cy);
      ctx.lineTo(cx - 3.5, cy + 4.5);
      ctx.stroke();
    }
  }

  // Chevron Vertikal di Lorong Penghubung
  for (const [vxTile, vyTile] of [
    [14.0, 15.2],
    [28.5, 15.2],
  ] as const) {
    for (let i = 0; i < 3; i += 1) {
      const cx = vxTile * t;
      const cy = (vyTile - i * 0.36) * t;
      ctx.beginPath();
      ctx.moveTo(cx - 4.5, cy + 2.5);
      ctx.lineTo(cx, cy - 2);
      ctx.lineTo(cx + 4.5, cy + 2.5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function paintWall25D(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, t: number): void {
  const px = x * t;
  const py = y * t;
  const pw = w * t;
  const ph = h * t;

  // 1. Bayangan kontak lembut di bawah dinding
  ctx.fillStyle = 'rgba(15, 23, 42, 0.32)';
  ctx.fillRect(px, py + ph, pw, 5);

  // 2. Fasad bawah dinding (Architectural Light Stone-Steel Face)
  const faceH = Math.min(ph * 0.46, 12);
  const faceGrad = ctx.createLinearGradient(px, py + ph - faceH, px, py + ph);
  faceGrad.addColorStop(0, '#94a3b8');
  faceGrad.addColorStop(1, '#64748b');
  ctx.fillStyle = faceGrad;
  ctx.fillRect(px, py + ph - faceH, pw, faceH);

  // Lis dasar dinding gelap
  ctx.fillStyle = '#334155';
  ctx.fillRect(px, py + ph - 2.2, pw, 2.2);

  // 3. Puncak Dinding (Dark Slate Top Cap #3b4659 -> #273244)
  const capH = Math.max(4, ph - faceH);
  const capGrad = ctx.createLinearGradient(px, py, px, py + capH);
  capGrad.addColorStop(0, '#475569');
  capGrad.addColorStop(1, '#2b3648');
  ctx.fillStyle = capGrad;
  ctx.fillRect(px, py, pw, capH);

  // 4. Bevel Highlight Putih-Perak Tipis di Antara Top Cap & Fasad Dinding
  ctx.fillStyle = 'rgba(241, 245, 249, 0.45)';
  ctx.fillRect(px + 1, py + capH - 1, Math.max(0, pw - 2), 1.4);

  // 5. Sambungan Pilar Struktural pada Dinding Panjang
  ctx.fillStyle = '#1e293b';
  if (w >= 4) {
    for (let gx = 3; gx < w; gx += 4) {
      ctx.fillRect(px + gx * t - 1.5, py, 3, ph);
    }
  }

  ctx.strokeStyle = '#16202e';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
}

/** Menggambar pintu kaca geser ganda (Double Sliding Glass Door) realistis dengan refleksi diagonal. */
function paintSlidingGlassDoorSpan(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  spanPx: number,
  t: number,
  orientation: 'horizontal' | 'vertical',
  isGoldDoor = false
): void {
  ctx.save();

  if (orientation === 'horizontal') {
    const doorH = 14;
    const dy = py + (t - doorH) * 0.5;

    // Ambang lantai aluminium di bawah pintu kaca
    rrect(ctx, px + 1, dy + 2, spanPx - 2, doorH, 2.5);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.28)';
    ctx.fill();

    const leafW = (spanPx - 6) / 2;
    for (let side = 0; side < 2; side += 1) {
      const lx = px + 3 + side * leafW;
      rrect(ctx, lx, dy, leafW - 0.5, doorH, 2);
      const glassGrad = ctx.createLinearGradient(lx, dy, lx, dy + doorH);
      if (isGoldDoor) {
        glassGrad.addColorStop(0, 'rgba(253, 224, 71, 0.72)');
        glassGrad.addColorStop(1, 'rgba(245, 158, 11, 0.62)');
      } else {
        glassGrad.addColorStop(0, 'rgba(186, 230, 253, 0.75)');
        glassGrad.addColorStop(1, 'rgba(56, 189, 248, 0.58)');
      }
      ctx.fillStyle = glassGrad;
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Pantulan kaca miring putih bersih
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(lx + 5, dy + doorH - 3);
      ctx.lineTo(lx + 11, dy + 3);
      ctx.moveTo(lx + 10, dy + doorH - 3);
      ctx.lineTo(lx + 14, dy + 5);
      ctx.stroke();
    }

    // Kusen samping kiri/kanan & handel tengah
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(px, dy - 1, 3.5, doorH + 2);
    ctx.fillRect(px + spanPx - 3.5, dy - 1, 3.5, doorH + 2);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(px + spanPx / 2 - 2.5, dy + 3, 1.8, doorH - 6);
    ctx.fillRect(px + spanPx / 2 + 0.7, dy + 3, 1.8, doorH - 6);
  } else {
    const doorW = 14;
    const dx = px + (t - doorW) * 0.5;
    rrect(ctx, dx, py + 2, doorW, spanPx - 4, 2);
    const glassGrad = ctx.createLinearGradient(dx, py, dx + doorW, py);
    if (isGoldDoor) {
      glassGrad.addColorStop(0, 'rgba(253, 224, 71, 0.78)');
      glassGrad.addColorStop(1, 'rgba(245, 158, 11, 0.65)');
    } else {
      glassGrad.addColorStop(0, 'rgba(186, 230, 253, 0.75)');
      glassGrad.addColorStop(1, 'rgba(56, 189, 248, 0.58)');
    }
    ctx.fillStyle = glassGrad;
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Pantulan kaca
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(dx + 3, py + 7);
    ctx.lineTo(dx + doorW - 3, py + 13);
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
  canvas.width = Math.round(worldW * CACHE_SCALE);
  canvas.height = Math.round(worldH * CACHE_SCALE);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.scale(CACHE_SCALE, CACHE_SCALE);

  // 1. Koridor keramik abu-batu hangat
  paintCorridorFloor(ctx, map, t);

  // 2. Lantai, dinding belakang, & peralatan dinding untuk setiap dari 11 ruangan
  for (const zone of map.zones) {
    paintZoneFloor(ctx, zone, t);
  }

  // 3. Partisi Kaca & Dinding Pembatas Rendah (lowDividers)
  for (const div of map.lowDividers) {
    paintWall25D(ctx, div.x, div.y, div.w, div.h, t);
  }

  // 4. Seluruh Dinding Arsitektural 2D
  for (const wall of map.walls) {
    paintWall25D(ctx, wall.x, wall.y, wall.w, wall.h, t);
  }

  // 5. Pintu Geser Kaca Ganda pada Doors Resmi + Bukaan Ruangan ke Koridor
  for (const door of map.doors) {
    if (door.mode !== undefined && door.mode !== doorMode) {
      for (const tile of door.tiles) {
        paintWall25D(ctx, tile.x, tile.y, 1, 1, t);
      }
      continue;
    }
    const first = door.tiles[0];
    const span = door.tiles.length * t;
    const isConsultLab = door.zoneId === 'konsultasi' && doorMode === 'lab';
    paintSlidingGlassDoorSpan(ctx, first.x * t, first.y * t, span, t, door.orientation, isConsultLab);

    // Lencana kuning "Pintu Lab" di samping pintu barat Ruang Konsultasi (sesuai gambar referensi!)
    if (isConsultLab) {
      const bx = first.x * t - 48;
      const by = first.y * t + 4;
      rrect(ctx, bx, by, 44, 17, 4);
      ctx.fillStyle = '#facc15';
      ctx.fill();
      ctx.strokeStyle = '#422006';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.font = '800 8px Plus Jakarta Sans, Fredoka, sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Pintu Lab', bx + 22, by + 9);
    }
  }

  // Pintu Kaca Geser Ganda Visual pada Bukaan Koridor Ruangan Terbuka (tidak menghalangi pathfinding!)
  const visualGlassThresholds: ReadonlyArray<readonly [number, number, number]> = [
    [15, 8, 3], // Cetak 3D
    [25, 8, 3], // Elektronika & IoT
    [43, 8, 3], // Studio Desain
    [5, 11, 3], // Pemrograman & MCU
    [43, 11, 3], // Pojok Baca
  ];
  for (const [tx, ty, spanTiles] of visualGlassThresholds) {
    paintSlidingGlassDoorSpan(ctx, tx * t, ty * t, spanTiles * t, t, 'horizontal', false);
  }

  // 6. Lampu Sconce Dinding Hangat di Sepanjang Dinding Koridor & Ruangan
  const sconceCoords: ReadonlyArray<readonly [number, number]> = [
    [10.5, 8.8],
    [21.5, 8.8],
    [31.5, 8.8],
    [39.5, 8.8],
    [30.5, 11.4],
    [38.5, 11.4],
    [30.5, 18.4],
    [38.5, 18.4],
    [1.3, 10.0],
    [50.6, 10.0],
  ];
  for (const [sx, sy] of sconceCoords) {
    drawWallSconceLight(ctx, sx * t, sy * t, 28);
  }

  // 7. Tanaman Pot Rimbun di Persimpangan Koridor & Sudut Gedung (sesuai gambar referensi!)
  const corridorPlants: ReadonlyArray<readonly [number, number, boolean]> = [
    [14.2, 21.8, true],
    [28.5, 21.8, true],
    [31.6, 13.5, false],
    [39.5, 22.0, true],
  ];
  for (const [pxTile, pyTile, sq] of corridorPlants) {
    drawPottedIndoorPlant(ctx, pxTile * t, pyTile * t, 1.0, sq);
  }

  // 8. Bingkai luar gedung
  ctx.strokeStyle = '#0f172a';
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
// 3. Perabot Modular 2D Top-Down Berdetail Tinggi (14 Jenis Perabot)
// ---------------------------------------------------------------------------

function drawTableBase(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  topCol: string,
  sideCol: string,
  radius = 5,
  rimHighlight = 'rgba(255, 255, 255, 0.35)'
): void {
  // 1. Soft Cast Shadow di lantai
  rrect(ctx, x + 1.5, y + 4.5, w, h, radius);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
  ctx.fill();

  // 2. Ketebalan Depan Meja (Front Apron / Side Bevel)
  rrect(ctx, x, y + 2.5, w, h, radius);
  ctx.fillStyle = sideCol;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // 3. Permukaan Atas Meja
  const topH = Math.max(5, h - 3.5);
  rrect(ctx, x, y, w, topH, radius);
  ctx.fillStyle = topCol;
  ctx.fill();
  ctx.stroke();

  // 4. Highlight Tepi Atas
  ctx.fillStyle = rimHighlight;
  rrect(ctx, x + 2.5, y + 1.4, Math.max(0, w - 5), 2, 1.5);
  ctx.fill();
}

export function drawIllustratedFurniture(
  ctx: CanvasRenderingContext2D,
  item: LabFurniture,
  t: number,
  _timeSeconds: number,
  _reducedMotion: boolean
): void {
  const x = item.rect.x * t + 2;
  const y = item.rect.y * t + 2;
  const w = item.rect.w * t - 4;
  const h = item.rect.h * t - 4;

  ctx.save();
  switch (item.kind) {
    case 'printer-3d': {
      // Kabinet Dasar Abu-Baja + Unit Printer 3D Tertutup Oranye-Gelap + Gulungan Filamen Atas (sesuai referensi!)
      const cabW = w + 10;
      const cabX = x - 5;
      drawTableBase(ctx, cabX, y + 4, cabW, h + 6, '#64748b', '#475569', 3.5);
      // Pintu kabinet bawah printer
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(cabX + 3, y + 10, cabW - 6, h - 2);

      // Sasis Printer 3D Oranye-Emas Industrial
      const pW = cabW - 4;
      const pX = cabX + 2;
      const pY = y - 16;
      const pH = 23;
      rrect(ctx, pX, pY, pW, pH, 3.5);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.35;
      ctx.stroke();

      // Jendela Ruang Cetak Gelap dengan Pelat Cetak Bercahaya
      rrect(ctx, pX + 3.5, pY + 4, pW - 7, pH - 8, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      // Objek cetakan 3D cyan/amber di atas bed
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(pX + pW / 2 - 4, pY + pH - 11, 8, 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(pX + 5, pY + pH - 6, pW - 10, 2);

      // Gulungan Filamen (Spool) di atas printer
      ctx.fillStyle = '#38bdf8';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(pX + pW * 0.5, pY - 2.5, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'meja-komputer': {
      // Meja Kerja Pemrograman Kayu-Baja Panjang dengan Monitor Kode, Keyboard, & Papan MCU
      drawTableBase(ctx, x, y, w, h + 6, '#d6a168', '#966533', 5, 'rgba(255, 245, 225, 0.5)');
      const count = 2;
      const step = w / count;
      for (let i = 0; i < count; i += 1) {
        const mx = x + i * step + step / 2 - 15;
        // Stand & Monitor Desktop
        ctx.fillStyle = '#334155';
        ctx.fillRect(mx + 11, y + 6, 8, 4);
        rrect(ctx, mx, y - 9, 30, 17, 2.5);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.25;
        ctx.stroke();
        // Baris kode di layar
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(mx + 4, y - 5, 12, 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(mx + 4, y - 1.5, 19, 2);
        ctx.fillStyle = '#34d399';
        ctx.fillRect(mx + 4, y + 2, 14, 2);

        // Keyboard & Mouse
        rrect(ctx, mx + 4, y + 11, 18, 5.5, 1.5);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(mx + 24, y + 12, 3.5, 4.5);
      }
      break;
    }
    case 'bilik-las': {
      // Kabinet & Mesin Kontrol Bengkel Las di Dinding Utara
      drawTableBase(ctx, x, y, w, h - 6, '#94a3b8', '#64748b', 4);
      rrect(ctx, x + 5, y + 4, w - 10, h - 16, 2.5);
      ctx.fillStyle = '#475569';
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Indikator LED
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(x + 11, y + 10, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(x + 18, y + 10, 2.2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'meja-elektronik': {
      // Meja Laboratorium Elektronika Putih-Abu dengan Laci, Osiloskop, Power Supply, & Breadboard
      drawTableBase(ctx, x, y + 4, w, h + 10, '#e2e8f0', '#94a3b8', 4, 'rgba(255, 255, 255, 0.8)');
      // Laci-laci komponen putih di bagian depan meja
      ctx.fillStyle = '#cbd5e1';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      for (let d = 0; d < 3; d += 1) {
        const dx = x + 6 + d * ((w - 12) / 3);
        ctx.fillRect(dx, y + h + 4, (w - 18) / 3, 7);
        ctx.strokeRect(dx, y + h + 4, (w - 18) / 3, 7);
      }

      // Osiloskop / Monitor Lab di atas meja
      rrect(ctx, x + 7, y - 5, 28, 17, 2.5);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = '#064e3b';
      ctx.fillRect(x + 10, y - 2, 16, 11);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 11, y + 4);
      ctx.lineTo(x + 15, y + 1);
      ctx.lineTo(x + 19, y + 7);
      ctx.lineTo(x + 24, y + 3);
      ctx.stroke();

      // Matras Solder Hijau & Breadboard di sisi kanan meja
      rrect(ctx, x + 40, y + 6, w - 46, 14, 2);
      ctx.fillStyle = '#0d9488';
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + 45, y + 9, 14, 8);
      break;
    }
    case 'meja-diskusi': {
      // 6 Kursi Kolaborasi (Biru & Kuning-Oranye) + Meja Kayu Ek Besar + Laptop & Buku Catatan Terbuka
      const chairColors = ['#2563eb', '#f59e0b', '#2563eb'];
      for (let i = 0; i < 3; i += 1) {
        const cx = x + (i + 0.5) * (w / 3);
        const col = chairColors[i];
        const dark = col === '#2563eb' ? '#1d4ed8' : '#d97706';
        drawTopDownChair(ctx, cx, y - 5, col, dark, 'bawah', 20, 12);
        drawTopDownChair(ctx, cx, y + h + 5, col, dark, 'atas', 20, 12);
      }

      drawTableBase(ctx, x, y, w, h, '#d49553', '#96612b', 8, 'rgba(255, 238, 204, 0.55)');
      // Serat kayu halus pada meja diskusi
      ctx.strokeStyle = 'rgba(120, 72, 28, 0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + h * 0.32);
      ctx.lineTo(x + w - 10, y + h * 0.32);
      ctx.moveTo(x + 14, y + h * 0.64);
      ctx.lineTo(x + w - 14, y + h * 0.64);
      ctx.stroke();

      // 1. Laptop Terbuka di Tengah-Kiri Meja
      const lx = x + w * 0.32;
      const ly = y + h * 0.26;
      rrect(ctx, lx, ly, 24, 16, 2.5);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(lx + 3, ly + 3, 18, 9);

      // 2. Buku Catatan / Dokumen Putih Terbuka di Tengah-Kanan Meja
      const bx = x + w * 0.62;
      const by = y + h * 0.32;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(-0.18);
      rrect(ctx, -11, -8, 22, 16, 2);
      ctx.fillStyle = '#fffbeb';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(0, 8);
      ctx.stroke();
      ctx.restore();

      // 3. Cangkir Kopi & Termos Kecil di Kiri Meja
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(x + 22, y + h * 0.52, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'meja-desain': {
      // Meja Workstation Studio Desain Kayu-Baja + Dual Monitor + Pen Tablet
      drawTableBase(ctx, x, y + 6, w, h + 6, '#d49a62', '#8f5e2e', 5);
      const count = Math.max(1, Math.floor(w / 46));
      const step = w / count;
      for (let i = 0; i < count; i += 1) {
        const mx = x + i * step + step / 2 - 15;
        rrect(ctx, mx, y - 6, 30, 17, 2.5);
        ctx.fillStyle = '#1e1b4b';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(mx + 3, y - 3, 24, 11);
        ctx.fillStyle = '#e0f2fe';
        ctx.fillRect(mx + 5, y - 1, 10, 7);
        // Tablet Gambar Digital
        rrect(ctx, mx + 6, y + 13, 18, 6, 1.5);
        ctx.fillStyle = '#312e81';
        ctx.fill();
      }
      break;
    }
    case 'meja-baca': {
      // 4 Kursi Baca Oranye + Meja Baca Kayu Ek Besar + Buku Terbuka & Lampu Meja Hangat
      for (const cx of [x + w * 0.26, x + w * 0.74]) {
        drawTopDownChair(ctx, cx, y - 4, '#ea580c', '#9a3412', 'bawah', 18, 11);
        drawTopDownChair(ctx, cx, y + h + 4, '#ea580c', '#9a3412', 'atas', 18, 11);
      }
      drawTableBase(ctx, x, y, w, h, '#d69e5c', '#94622b', 7, 'rgba(255, 245, 220, 0.55)');

      // Buku terbuka di sisi kiri meja baca
      rrect(ctx, x + 14, y + 12, 22, 15, 2);
      ctx.fillStyle = '#fffbeb';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 25, y + 12);
      ctx.lineTo(x + 25, y + 27);
      ctx.stroke();

      // Lampu baca meja bercahaya hangat di sisi kanan
      drawWallSconceLight(ctx, x + w - 22, y + 18, 32);
      break;
    }
    case 'sofa': {
      // Sofa Hijau-Zamrud Empuk Berdetail Sandaran & Bantalan (Ruang Istirahat & Pojok Baca)
      const isHorizontal = w >= h;
      rrect(ctx, x + 2, y + 5, w, h + 4, 6);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.fill();

      rrect(ctx, x, y, w, h + 4, 6);
      ctx.fillStyle = '#2e8b57';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      if (isHorizontal) {
        // Sandaran belakang & 2 lengan sofa
        rrect(ctx, x + 3, y + 2, w - 6, 8, 3);
        ctx.fillStyle = '#1f633d';
        ctx.fill();
        ctx.stroke();
        rrect(ctx, x + 2, y + 4, 8, h - 2, 3);
        rrect(ctx, x + w - 10, y + 4, 8, h - 2, 3);
        ctx.fillStyle = '#247347';
        ctx.fill();
        // Garis belahan bantalan dudukan
        ctx.beginPath();
        ctx.moveTo(x + w / 2, y + 10);
        ctx.lineTo(x + w / 2, y + h + 2);
        ctx.stroke();
      } else {
        rrect(ctx, x + 2, y + 3, 8, h - 2, 3);
        ctx.fillStyle = '#1f633d';
        ctx.fill();
        ctx.stroke();
      }
      break;
    }
    case 'rak-buku':
    case 'rak-gudang': {
      const isBook = item.kind === 'rak-buku';
      drawTableBase(
        ctx,
        x,
        y - 2,
        w,
        h + 4,
        isBook ? '#b4834e' : '#94a3b8',
        isBook ? '#784c20' : '#475569',
        4
      );
      const colors = isBook
        ? ['#ef4444', '#38bdf8', '#fbbf24', '#10b981', '#a855f7']
        : ['#0284c7', '#0d9488', '#38bdf8', '#0369a1'];

      if (w >= h) {
        // Rak memanjang horizontal (Gudang Alat)
        const cols = Math.max(3, Math.floor((w - 8) / 18));
        const cellW = (w - 10) / cols;
        for (let c = 0; c < cols; c += 1) {
          rrect(ctx, x + 5 + c * cellW, y + 2, cellW - 3, h - 4, 2);
          ctx.fillStyle = colors[c % colors.length];
          ctx.fill();
          ctx.strokeStyle = INK;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      } else {
        // Rak vertikal di sisi dinding
        const rows = Math.max(3, Math.floor((h - 6) / 14));
        const cellH = (h - 6) / rows;
        for (let r = 0; r < rows; r += 1) {
          rrect(ctx, x + 3, y + 2 + r * cellH, w - 6, cellH - 3, 2);
          ctx.fillStyle = colors[r % colors.length];
          ctx.fill();
          ctx.strokeStyle = INK;
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      }
      break;
    }
    case 'meja-konsultasi': {
      // Meja Konsultasi Kayu Hangat + Kursi Konselor + Teh Hangat
      drawTopDownChair(ctx, x - 6, y + h / 2, '#d97706', '#92400e', 'kanan', 13, 14);
      drawTopDownChair(ctx, x + w + 6, y + h / 2, '#d97706', '#92400e', 'kiri', 13, 14);
      drawTableBase(ctx, x + 4, y + 1, Math.max(16, w - 8), Math.max(14, h - 2), '#e2be89', '#a67b44', 6);
      ctx.fillStyle = '#fffbeb';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(x + w / 2 - 4, y + h / 2, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'meja-dosen': {
      // Meja Kerja Dosen Kayu Ek + Kursi Dosen + Monitor Komputer & Dokumen
      drawTopDownChair(ctx, x + w / 2, y + h + 6, '#334155', '#0f172a', 'atas', 18, 12);
      drawTableBase(ctx, x, y, w, h + 4, '#c89258', '#8a5a2b', 5);
      // Monitor di atas meja dosen
      rrect(ctx, x + w / 2 - 13, y - 7, 26, 15, 2.5);
      ctx.fillStyle = '#0f172a';
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + w / 2 - 10, y - 4, 20, 9);
      // Berkas dokumen putih di kanan
      ctx.fillStyle = '#fffbeb';
      ctx.fillRect(x + w - 18, y + 5, 12, 9);
      break;
    }
    case 'meja-kopi': {
      // Meja Kopi Kayu Rendah di Depan Sofa Ruang Istirahat
      drawTableBase(ctx, x, y + 2, w, h - 2, '#d49a5a', '#8f5d28', 5);
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + w * 0.35, y + h * 0.45, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'penanda-k3': {
      // Sudah terintegrasi secara proporsional pada meja kerja utama Bengkel Las & Rambu Dinding K3
      break;
    }
    default: {
      // Meja Bundar Kafe + Dispenser Air Minum & 2 Kursi Bundar di Ruang Istirahat
      const cx = x + w / 2;
      const cy = y + h / 2;
      drawTopDownChair(ctx, cx - 18, cy + 2, '#b4834e', '#784c20', 'kanan', 12, 12);
      drawTopDownChair(ctx, cx + 18, cy + 2, '#b4834e', '#784c20', 'kiri', 12, 12);
      // Meja bundar kayu
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.ellipse(cx + 1, cy + 5, 15, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#c89258';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 1, 15, 11, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Unit Dispenser Air & Galon Biru Jernih di Atas Meja Bundar
      rrect(ctx, cx - 6, cy - 11, 12, 13, 3);
      ctx.fillStyle = '#f1f5f9';
      ctx.fill();
      ctx.stroke();
      rrect(ctx, cx - 5, cy - 18, 10, 9, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// 4. Plakat Nama Ruangan Bersih (Dark-Slate Capsule Berbingkai Emas/Aksen)
// ---------------------------------------------------------------------------

export function drawIllustratedZoneLabel(
  ctx: CanvasRenderingContext2D,
  zone: LabZone,
  t: number,
  selected: boolean
): void {
  const meta = ZONE_BADGE_META[zone.id];
  const label = `${meta.icon} ${meta.displayLabel}`;
  const cx = (zone.bounds.x + zone.bounds.w / 2) * t;
  const cy = (zone.bounds.y + 0.12) * t;

  ctx.save();
  ctx.font = selected
    ? '800 10.5px "Plus Jakarta Sans", Fredoka, ui-sans-serif, sans-serif'
    : '800 9.8px "Plus Jakarta Sans", Fredoka, ui-sans-serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const tw = ctx.measureText(label).width;
  const pw = Math.min(zone.bounds.w * t - 6, tw + 22);
  const ph = 19.5;
  const px = cx - pw / 2;
  const py = cy - ph / 2;

  // Bayangan kontak plakat
  rrect(ctx, px, py + 2, pw, ph, 9.75);
  ctx.fillStyle = 'rgba(4, 10, 18, 0.68)';
  ctx.fill();

  // Kapsul Plakat Dark-Slate Berbingkai Emas/Aksen (sesuai gambar referensi!)
  rrect(ctx, px, py, pw, ph, 9.75);
  ctx.fillStyle = selected ? meta.accent : meta.bg;
  ctx.fill();
  ctx.strokeStyle = selected ? '#ffffff' : meta.accent;
  ctx.lineWidth = selected ? 2.2 : 1.55;
  ctx.stroke();

  ctx.fillStyle = selected ? '#061522' : '#f8fafc';
  ctx.fillText(label, cx, cy + 0.5, pw - 12);
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

  if (has('lampu-senja')) {
    const lx = zx + zw - 22;
    const ly = zy + 20;
    const glow = ctx.createRadialGradient(lx, ly, 4, lx, ly, 84);
    glow.addColorStop(0, 'rgba(255, 224, 130, 0.38)');
    glow.addColorStop(0.55, 'rgba(255, 198, 108, 0.14)');
    glow.addColorStop(1, 'rgba(255, 198, 108, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(zx + 2, zy + 2, zw - 4, zh - 4);
  }

  if (has('poster-hangat')) {
    const px = zx + zw * 0.32;
    const py = zy + 4;
    rrect(ctx, px, py, 28, 13, 2.5);
    ctx.fillStyle = '#fff8e2';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  if (has('tanaman-monstera')) {
    drawPottedIndoorPlant(ctx, zx + 18, zy + 22, 0.85);
  }

  if (has('pemutar-vinyl')) {
    const vx = zx + 18;
    const vy = zy + zh - 16;
    rrect(ctx, vx - 10, vy - 7, 20, 14, 3.5);
    ctx.fillStyle = '#b47142';
    ctx.fill();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.fillStyle = '#25232b';
    ctx.beginPath();
    ctx.arc(vx - 1, vy, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  if (has('kucing-penenang')) {
    const kx = zx + zw - 18;
    const ky = zy + zh - 15;
    ctx.fillStyle = '#fffaf0';
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(kx, ky + 1, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  if (has('set-teh-hangat') && !reducedMotion) {
    const tx = zx + zw * 0.66;
    const ty = zy + zh * 0.48;
    const rise = (timeSeconds * 6) % 10;
    const alpha = Math.max(0, 0.7 - rise / 12);
    ctx.strokeStyle = `rgba(255, 251, 232, ${alpha.toFixed(2)})`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(tx, ty - 5 - rise);
    ctx.lineTo(tx + 1, ty - 10 - rise);
    ctx.stroke();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 5b. Efek Hologram Halus & Stabil per Ruangan
// ---------------------------------------------------------------------------

export function drawAnimatedLabHolograms(
  ctx: CanvasRenderingContext2D,
  map: LabMapData,
  _timeSeconds: number,
  _reducedMotion: boolean
): void {
  const t = map.tileSizePx;
  ctx.save();

  // Cincin proyektor halus di bawah kubus hologram Ruang Cetak 3D
  const z3d = map.zones.find((z) => z.id === 'cetak-3d');
  if (z3d) {
    const hcx = (z3d.bounds.x + 3.8) * t;
    const hcy = (z3d.bounds.y + z3d.bounds.h * 0.72) * t;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(hcx, hcy + 10, 17, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

// ---------------------------------------------------------------------------
// 6. Efek Cuaca Luar Gedung (Hujan Rintik Saat Mode Cuaca Hujan Aktif)
// ---------------------------------------------------------------------------

export function drawOutdoorAmbientParticles(
  ctx: CanvasRenderingContext2D,
  widthCss: number,
  heightCss: number,
  camera: { offsetX: number; offsetY: number; scale: number },
  map: LabMapData,
  timeSeconds: number,
  reducedMotion: boolean,
  weatherMode: CampusWeatherMode = 'otomatis'
): void {
  if (weatherMode !== 'hujan' || widthCss < 200 || heightCss < 200) return;
  const worldW = map.width * map.tileSizePx * camera.scale;
  const worldH = map.height * map.tileSizePx * camera.scale;
  const bx = camera.offsetX;
  const by = camera.offsetY;
  const animT = reducedMotion ? 1.0 : timeSeconds;

  ctx.save();
  const dropCount = reducedMotion ? 24 : 48;
  for (let di = 0; di < dropCount; di += 1) {
    const layer = (di % 3) + 1;
    const speed = reducedMotion ? 0 : 320 + layer * 110;
    const x = ((di * 97.7 + animT * speed * 0.22) % (widthCss + 80)) - 40;
    const y = ((di * 151.3 + animT * speed) % (heightCss + 80)) - 40;
    if (x > bx && x < bx + worldW && y > by && y < by + worldH) continue;
    const len = 9 + layer * 4;
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.32)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * 0.22, y + len);
    ctx.stroke();
  }
  ctx.restore();
}
