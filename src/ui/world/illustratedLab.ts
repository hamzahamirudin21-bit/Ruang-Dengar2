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
import { computeSunLighting, type CampusWeatherMode } from '../gpu/sunLighting';

const INK = '#071420';
const CACHE_SCALE = 2; // Render latar gedung statis di 2x HD untuk ketajaman Retina

interface FloorPalette {
  style: 'kayu' | 'keramik' | 'beton' | 'karpet';
  base: string;
  alt: string;
  accent: string;
  neonBorder?: string;
  rug?: string;
  rugTrim?: string;
}

const FLOOR_STYLE: Record<ZoneType, FloorPalette> = {
  las: {
    style: 'beton',
    base: '#3a4654',
    alt: '#323d4a',
    accent: '#FFB547',
    neonBorder: 'rgba(255, 181, 71, 0.55)',
  },
  'cetak-3d': {
    style: 'keramik',
    base: '#164c68',
    alt: '#12415a',
    accent: '#00DFFF',
    neonBorder: 'rgba(0, 223, 255, 0.75)',
  },
  'elektronik-iot': {
    style: 'keramik',
    base: '#1b555a',
    alt: '#16494e',
    accent: '#00E5FF',
    neonBorder: 'rgba(0, 229, 255, 0.65)',
  },
  'gudang-alat': {
    style: 'beton',
    base: '#3f4752',
    alt: '#363e48',
    accent: '#FFB547',
    neonBorder: 'rgba(255, 181, 71, 0.45)',
  },
  pemrograman: {
    style: 'keramik',
    base: '#1b3d5c',
    alt: '#16334f',
    accent: '#168BFF',
    neonBorder: 'rgba(22, 139, 255, 0.72)',
    rug: '#152e47',
    rugTrim: '#00DFFF',
  },
  diskusi: {
    style: 'kayu',
    base: '#5c584e',
    alt: '#504c43',
    accent: '#84cc16',
    neonBorder: 'rgba(163, 230, 53, 0.55)',
    rug: '#4e6e48',
    rugTrim: '#a3e635',
  },
  istirahat: {
    style: 'karpet',
    base: '#5c5449',
    alt: '#50483e',
    accent: '#FFC96B',
    neonBorder: 'rgba(255, 201, 107, 0.5)',
    rug: '#6e5a42',
    rugTrim: '#FFB547',
  },
  konsultasi: {
    style: 'kayu',
    base: '#614d3b',
    alt: '#544232',
    accent: '#FFC96B',
    neonBorder: 'rgba(255, 201, 107, 0.65)',
    rug: '#3d5a52',
    rugTrim: '#00DFFF',
  },
  'ruang-dosen': {
    style: 'kayu',
    base: '#3f3d5e',
    alt: '#353352',
    accent: '#a855f7',
    neonBorder: 'rgba(168, 85, 247, 0.65)',
    rug: '#2e2b4a',
    rugTrim: '#c084fc',
  },
  'studio-desain': {
    style: 'keramik',
    base: '#4c3b6e',
    alt: '#413161',
    accent: '#c084fc',
    neonBorder: 'rgba(192, 132, 252, 0.75)',
    rug: '#3b2b59',
    rugTrim: '#e879f9',
  },
  'pojok-baca': {
    style: 'kayu',
    base: '#635647',
    alt: '#574b3d',
    accent: '#FFB547',
    neonBorder: 'rgba(0, 223, 255, 0.45)',
    rug: '#4f4336',
    rugTrim: '#FFC96B',
  },
};

export const ZONE_BADGE_META: Record<ZoneType, { icon: string; accent: string; bg: string }> = {
  las: { icon: '🔥', accent: '#FFB547', bg: '#0c1f2e' },
  'cetak-3d': { icon: '🖨️', accent: '#00DFFF', bg: '#092233' },
  'elektronik-iot': { icon: '⚡', accent: '#00E5FF', bg: '#092430' },
  'gudang-alat': { icon: '🔧', accent: '#FFB547', bg: '#10212e' },
  pemrograman: { icon: '💻', accent: '#168BFF', bg: '#0a2036' },
  diskusi: { icon: '👥', accent: '#a3e635', bg: '#112622' },
  istirahat: { icon: '☕', accent: '#FFC96B', bg: '#18222c' },
  konsultasi: { icon: '💬', accent: '#FFC96B', bg: '#14262e' },
  'ruang-dosen': { icon: '👤', accent: '#c084fc', bg: '#171a33' },
  'studio-desain': { icon: '🎨', accent: '#e879f9', bg: '#1d1836' },
  'pojok-baca': { icon: '📖', accent: '#FFB547', bg: '#16222c' },
};

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, rad);
}

// ---------------------------------------------------------------------------
// 1. Lingkungan Luar Kampus Teknologi Futuristik & Bezel Metalik Utama (Phase 1)
// ---------------------------------------------------------------------------

function drawBeveledRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  cut: number
): void {
  const c = Math.max(2, Math.min(cut, w * 0.25, h * 0.25));
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.lineTo(x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}

export function drawOutdoorCampusCourtyard(
  ctx: CanvasRenderingContext2D,
  widthCss: number,
  heightCss: number,
  camera: { offsetX: number; offsetY: number; scale: number },
  map: LabMapData,
  timeSeconds: number,
  reducedMotion: boolean,
  clockMinutesOfDay = 540,
  weatherMode: CampusWeatherMode = 'otomatis'
): void {
  const sun = computeSunLighting(clockMinutesOfDay, weatherMode);
  const isRain = weatherMode === 'hujan';
  const isAfternoon = sun.phase === 'sore' && !isRain;

  ctx.save();

  // 1. Base Background: Deep Navy (#061522) & Dark Teal (#0A2636) Futuristic Campus Atmosphere
  const bgGrad = ctx.createLinearGradient(0, 0, 0, heightCss);
  if (isRain) {
    bgGrad.addColorStop(0, '#040e18');
    bgGrad.addColorStop(0.5, '#071c2b');
    bgGrad.addColorStop(1, '#04101a');
  } else if (isAfternoon) {
    bgGrad.addColorStop(0, '#081826');
    bgGrad.addColorStop(0.45, '#0b2434');
    bgGrad.addColorStop(1, '#05121d');
  } else {
    bgGrad.addColorStop(0, '#061522');
    bgGrad.addColorStop(0.5, '#0A2636');
    bgGrad.addColorStop(1, '#05121e');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, widthCss, heightCss);

  // 2. Ambient Edge Lighting (Electric Cyan di sisi kiri/kanan & Warm Amber di puncak/bawah)
  const leftGlow = ctx.createRadialGradient(
    widthCss * 0.06,
    heightCss * 0.5,
    10,
    widthCss * 0.06,
    heightCss * 0.5,
    widthCss * 0.42
  );
  leftGlow.addColorStop(0, 'rgba(0, 223, 255, 0.16)');
  leftGlow.addColorStop(0.55, 'rgba(22, 139, 255, 0.05)');
  leftGlow.addColorStop(1, 'rgba(6, 21, 34, 0)');
  ctx.fillStyle = leftGlow;
  ctx.fillRect(0, 0, widthCss, heightCss);

  const rightGlow = ctx.createRadialGradient(
    widthCss * 0.94,
    heightCss * 0.5,
    10,
    widthCss * 0.94,
    heightCss * 0.5,
    widthCss * 0.42
  );
  rightGlow.addColorStop(0, 'rgba(0, 223, 255, 0.15)');
  rightGlow.addColorStop(0.55, 'rgba(22, 139, 255, 0.05)');
  rightGlow.addColorStop(1, 'rgba(6, 21, 34, 0)');
  ctx.fillStyle = rightGlow;
  ctx.fillRect(0, 0, widthCss, heightCss);

  const topAmberGlow = ctx.createRadialGradient(
    widthCss * 0.5,
    0,
    8,
    widthCss * 0.5,
    0,
    widthCss * 0.38
  );
  topAmberGlow.addColorStop(0, isAfternoon ? 'rgba(255, 181, 71, 0.24)' : 'rgba(255, 201, 107, 0.14)');
  topAmberGlow.addColorStop(0.6, 'rgba(0, 223, 255, 0.05)');
  topAmberGlow.addColorStop(1, 'rgba(6, 21, 34, 0)');
  ctx.fillStyle = topAmberGlow;
  ctx.fillRect(0, 0, widthCss, heightCss);

  // 3. Jaring Grid Teknikal Halus di Area Luar Denah
  ctx.strokeStyle = 'rgba(0, 223, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridStep = Math.max(28, Math.round(36 * camera.scale));
  ctx.beginPath();
  for (let gx = 0; gx < widthCss; gx += gridStep) {
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, heightCss);
  }
  for (let gy = 0; gy < heightCss; gy += gridStep) {
    ctx.moveTo(0, gy);
    ctx.lineTo(widthCss, gy);
  }
  ctx.stroke();

  // Koordinat Presisi Kotak Denah Utama
  const worldW = map.width * map.tileSizePx;
  const worldH = map.height * map.tileSizePx;
  const bx = camera.offsetX;
  const by = camera.offsetY;
  const bw = worldW * camera.scale;
  const bh = worldH * camera.scale;
  const s = camera.scale;

  // 4. Panorama Siluet Gedung Kampus Teknologi di Cakrawala Atas (bila tersedia ruang di atas denah)
  if (by >= 38) {
    const vistaW = Math.min(bw * 0.42, 460);
    const vistaH = Math.min(by - 10, 52);
    const vx = bx + (bw - vistaW) / 2;
    const vy = 4;

    ctx.save();
    drawBeveledRectPath(ctx, vx, vy, vistaW, vistaH, 12);
    const skyGrad = ctx.createLinearGradient(vx, vy, vx, vy + vistaH);
    skyGrad.addColorStop(0, '#071d2e');
    skyGrad.addColorStop(0.65, '#113850');
    skyGrad.addColorStop(1, '#1c4d66');
    ctx.fillStyle = skyGrad;
    ctx.fill();
    ctx.clip();

    // Siluet gedung akademik futuristik bertingkat dengan jendela warm gold & cyan
    const bCenter = vx + vistaW / 2;
    ctx.fillStyle = '#0c2336';
    ctx.fillRect(bCenter - 110, vy + vistaH - 26, 220, 26);
    ctx.fillStyle = '#133147';
    ctx.fillRect(bCenter - 64, vy + vistaH - 34, 128, 34);
    // Atap pedimen tengah
    ctx.beginPath();
    ctx.moveTo(bCenter - 42, vy + vistaH - 34);
    ctx.lineTo(bCenter, vy + vistaH - 44);
    ctx.lineTo(bCenter + 42, vy + vistaH - 34);
    ctx.closePath();
    ctx.fillStyle = '#1b435e';
    ctx.fill();

    // Jendela-jendela menyala hangat di fasad kampus
    for (let wx = -92; wx <= 84; wx += 16) {
      if (Math.abs(wx) < 12) continue;
      ctx.fillStyle = Math.abs(wx) % 32 === 0 ? 'rgba(0, 223, 255, 0.65)' : 'rgba(255, 201, 107, 0.78)';
      ctx.fillRect(bCenter + wx, vy + vistaH - 20, 7, 10);
    }
    // Kubah portal tengah bercahaya
    ctx.fillStyle = 'rgba(255, 181, 71, 0.85)';
    ctx.fillRect(bCenter - 5, vy + vistaH - 24, 10, 18);

    ctx.restore();

    // Garis sayap diagonal cyan-amber di kiri & kanan panorama kampus
    drawBeveledRectPath(ctx, vx, vy, vistaW, vistaH, 12);
    ctx.strokeStyle = 'rgba(0, 223, 255, 0.48)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
  }

  // 5. MAIN SIMULATION CONTAINER — Metallic Beveled Outer Chassis & Cyan/Amber Illuminated Frame
  const outerPad = Math.max(12, 18 * s);
  const midPad = Math.max(7, 10 * s);
  const innerPad = Math.max(3, 4 * s);
  const bevelOuter = Math.max(14, 20 * s);
  const bevelMid = Math.max(10, 14 * s);

  // 5a. Deep Drop Shadow & Cyan Outer Halo di bawah sasis utama
  ctx.save();
  ctx.shadowColor = 'rgba(0, 223, 255, 0.28)';
  ctx.shadowBlur = 24 * s;
  drawBeveledRectPath(
    ctx,
    bx - outerPad,
    by - outerPad,
    bw + outerPad * 2,
    bh + outerPad * 2,
    bevelOuter
  );
  const chassisGrad = ctx.createLinearGradient(bx, by - outerPad, bx, by + bh + outerPad);
  chassisGrad.addColorStop(0, '#172D3D');
  chassisGrad.addColorStop(0.5, '#0A2636');
  chassisGrad.addColorStop(1, '#061522');
  ctx.fillStyle = chassisGrad;
  ctx.fill();
  ctx.restore();

  // Garis tepi luar Electric Cyan (#00DFFF)
  drawBeveledRectPath(
    ctx,
    bx - outerPad,
    by - outerPad,
    bw + outerPad * 2,
    bh + outerPad * 2,
    bevelOuter
  );
  ctx.strokeStyle = 'rgba(0, 223, 255, 0.68)';
  ctx.lineWidth = Math.max(1.5, 2.2 * s);
  ctx.stroke();

  // 5b. Lapisan Kedua: Bezel Metalik Gelap (#071926) dengan Pendaran Warm Amber (#FFB547)
  drawBeveledRectPath(
    ctx,
    bx - midPad,
    by - midPad,
    bw + midPad * 2,
    bh + midPad * 2,
    bevelMid
  );
  ctx.fillStyle = '#081b29';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 181, 71, 0.82)';
  ctx.lineWidth = Math.max(1.4, 2 * s);
  ctx.stroke();

  // 5c. Lapisan Ketiga: Lis Dalam Gelap & Rim Pemisah Kanvas Bersih
  rrect(ctx, bx - innerPad, by - innerPad, bw + innerPad * 2, bh + innerPad * 2, 6 * s);
  ctx.fillStyle = '#05111b';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 223, 255, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 5d. Segmen Lampu Indikator Bezel (Warm Amber & Electric Cyan LED Bars di sepanjang bingkai)
  const pulse = reducedMotion ? 0.85 : 0.72 + 0.28 * Math.sin(timeSeconds * 2.4);
  const topLedY = by - (outerPad + midPad) * 0.5 - 1.5 * s;
  const botLedY = by + bh + (outerPad + midPad) * 0.5 - 1.5 * s;
  for (const frac of [0.14, 0.32, 0.5, 0.68, 0.86]) {
    const lx = bx + bw * frac - 18 * s;
    const lw = 36 * s;
    const lh = Math.max(2, 3 * s);
    ctx.fillStyle =
      frac === 0.5
        ? `rgba(0, 223, 255, ${(0.88 * pulse).toFixed(3)})`
        : `rgba(255, 181, 71, ${(0.85 * pulse).toFixed(3)})`;
    rrect(ctx, lx, topLedY, lw, lh, 1.5);
    ctx.fill();
    rrect(ctx, lx, botLedY, lw, lh, 1.5);
    ctx.fill();
  }

  // Indikator vertikal di sisi kiri & kanan bezel
  const leftLedX = bx - (outerPad + midPad) * 0.5 - 1.5 * s;
  const rightLedX = bx + bw + (outerPad + midPad) * 0.5 - 1.5 * s;
  for (const frac of [0.22, 0.5, 0.78]) {
    const ly = by + bh * frac - 16 * s;
    const lw = Math.max(2, 3 * s);
    const lh = 32 * s;
    ctx.fillStyle =
      frac === 0.5
        ? `rgba(0, 223, 255, ${(0.85 * pulse).toFixed(3)})`
        : `rgba(255, 181, 71, ${(0.82 * pulse).toFixed(3)})`;
    rrect(ctx, leftLedX, ly, lw, lh, 1.5);
    ctx.fill();
    rrect(ctx, rightLedX, ly, lw, lh, 1.5);
    ctx.fill();
  }

  // 5e. 4 Braket Perangkat Keras Sudut Beveled (Corner Armor Plates)
  const cornerLen = 28 * s;
  const cornerThick = Math.max(2.2, 3.2 * s);
  ctx.strokeStyle = '#FFC96B';
  ctx.lineWidth = cornerThick;
  ctx.lineCap = 'round';
  const corners: ReadonlyArray<readonly [number, number, number, number]> = [
    [bx - outerPad - 2 * s, by - outerPad - 2 * s, 1, 1],
    [bx + bw + outerPad + 2 * s, by - outerPad - 2 * s, -1, 1],
    [bx - outerPad - 2 * s, by + bh + outerPad + 2 * s, 1, -1],
    [bx + bw + outerPad + 2 * s, by + bh + outerPad + 2 * s, -1, -1],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * cornerLen, cy);
    ctx.lineTo(cx + dx * bevelOuter * 0.85, cy);
    ctx.lineTo(cx, cy + dy * bevelOuter * 0.85);
    ctx.lineTo(cx, cy + dy * cornerLen);
    ctx.stroke();
  }

  // 6. Portal Tangga Masuk Bawah Berpendar Amber & Cyan (sesuai bagian tengah bawah gambar referensi)
  const southStartY = by + bh + outerPad;
  const southH = Math.max(0, heightCss - southStartY);
  if (southH >= 16) {
    const portalW = Math.min(bw * 0.28, 340 * s);
    const portalX = bx + bw * 0.5 - portalW / 2;

    // Trapesium pelataran portal
    ctx.beginPath();
    ctx.moveTo(portalX + 26 * s, southStartY);
    ctx.lineTo(portalX + portalW - 26 * s, southStartY);
    ctx.lineTo(portalX + portalW + 18 * s, heightCss);
    ctx.lineTo(portalX - 18 * s, heightCss);
    ctx.closePath();
    const portalGrad = ctx.createLinearGradient(0, southStartY, 0, heightCss);
    portalGrad.addColorStop(0, '#0e283b');
    portalGrad.addColorStop(1, '#061522');
    ctx.fillStyle = portalGrad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 223, 255, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // 4 Anak tangga bercahaya Warm Amber (#FFB547) di tengah portal
    const stepCount = 4;
    for (let si = 0; si < stepCount; si += 1) {
      const tFrac = (si + 0.45) / (stepCount + 0.5);
      const sy = southStartY + tFrac * Math.min(southH - 4, 46);
      const sw = (54 + si * 10) * s;
      const sx = bx + bw * 0.5 - sw / 2;
      rrect(ctx, sx, sy, sw, Math.max(2.5, 4 * s), 2);
      ctx.fillStyle = `rgba(255, 189, 89, ${(0.88 - si * 0.14).toFixed(2)})`;
      ctx.fill();
    }
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

  // Karpet hias tengah atau matras zona kolaborasi (Diskusi, Istirahat, Konsultasi, Pojok Baca, Studio Desain, Ruang Dosen)
  if (pal.rug && pal.rugTrim && pw >= t * 5 && ph >= t * 4) {
    const insetX = zone.id === 'diskusi' ? t * 0.85 : Math.min(t * 1.15, pw * 0.14);
    const insetY = zone.id === 'diskusi' ? t * 0.85 : Math.min(t * 1.05, ph * 0.16);
    rrect(ctx, px + insetX, py + insetY, pw - insetX * 2, ph - insetY * 2, 10);
    ctx.fillStyle = pal.rug;
    ctx.fill();
    ctx.strokeStyle = pal.rugTrim;
    ctx.lineWidth = zone.id === 'diskusi' ? 2.2 : 1.6;
    ctx.stroke();
  }

  // Garis Perimeter Neon / LED Strip Spesifik Ruangan (sesuai referensi visual AAA)
  if (pal.neonBorder) {
    ctx.save();
    rrect(ctx, px + 3, py + 3, pw - 6, ph - 6, 8);
    ctx.strokeStyle = pal.neonBorder;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // Detail Dekorasi Spesifik Ruangan (Non-Collision Layer, 100% Aman bagi Pathfinding)
  ctx.save();
  if (zone.id === 'las') {
    // Papan gantung alat K3 (pegboard) di dinding utara & pendaran lampu peringatan amber
    const boardX = px + t * 2.2;
    const boardY = py + 5;
    rrect(ctx, boardX, boardY, t * 2.6, 14, 3);
    ctx.fillStyle = '#26303a';
    ctx.fill();
    ctx.strokeStyle = '#FFB547';
    ctx.lineWidth = 1;
    ctx.stroke();
    for (let ti = 0; ti < 5; ti += 1) {
      ctx.fillStyle = '#FFC96B';
      ctx.fillRect(boardX + 6 + ti * 13, boardY + 3, 3, 8);
    }
    const warnGlow = ctx.createRadialGradient(px + pw * 0.5, py + 8, 2, px + pw * 0.5, py + 8, t * 3.5);
    warnGlow.addColorStop(0, 'rgba(255, 181, 71, 0.24)');
    warnGlow.addColorStop(1, 'rgba(255, 181, 71, 0)');
    ctx.fillStyle = warnGlow;
    ctx.fillRect(px, py, pw, ph);
  } else if (zone.id === 'cetak-3d') {
    // Jejak Sirkuit Cyan di Lantai & Proyeksi Kubus Hologram 3D Isometric
    const holoX = px + pw * 0.44;
    const holoY = py + ph * 0.68;
    ctx.strokeStyle = 'rgba(0, 223, 255, 0.42)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(px + 12, holoY + 14);
    ctx.lineTo(holoX - 24, holoY + 14);
    ctx.lineTo(holoX - 14, holoY + 4);
    ctx.moveTo(px + pw - 12, holoY + 14);
    ctx.lineTo(holoX + 24, holoY + 14);
    ctx.stroke();

    // Pendaran dasar proyektor lantai
    const holoGlow = ctx.createRadialGradient(holoX, holoY, 2, holoX, holoY, 32);
    holoGlow.addColorStop(0, 'rgba(0, 223, 255, 0.40)');
    holoGlow.addColorStop(1, 'rgba(0, 223, 255, 0)');
    ctx.fillStyle = holoGlow;
    ctx.beginPath();
    ctx.arc(holoX, holoY, 32, 0, Math.PI * 2);
    ctx.fill();

    // Kubus Wireframe Holografik Isometric
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1.3;
    const r = 14;
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
  } else if (zone.id === 'elektronik-iot') {
    // Papan Skema Sirkuit Hologram Cyan di Dinding Utara & Meja
    const scX = px + pw * 0.36;
    const scY = py + 8;
    rrect(ctx, scX, scY, 44, 20, 3);
    ctx.fillStyle = 'rgba(0, 229, 255, 0.16)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.72)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // Jalur PCB mikro di dalam layar
    ctx.beginPath();
    ctx.moveTo(scX + 6, scY + 10);
    ctx.lineTo(scX + 18, scY + 10);
    ctx.lineTo(scX + 22, scY + 6);
    ctx.lineTo(scX + 36, scY + 6);
    ctx.moveTo(scX + 14, scY + 15);
    ctx.lineTo(scX + 34, scY + 15);
    ctx.stroke();
  } else if (zone.id === 'studio-desain') {
    // Bidang Kanvas Sketsa Hologram Ungu-Sian dengan Ikon Pena Stylus di Lantai Studio Desain
    const padW = t * 2.5;
    const padH = t * 1.5;
    const padX = px + pw * 0.54;
    const padY = py + ph * 0.60;
    rrect(ctx, padX, padY, padW, padH, 5);
    ctx.fillStyle = 'rgba(192, 132, 252, 0.14)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(232, 121, 249, 0.62)';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    // Ikon pena diagonal di tengah bidang desain
    ctx.beginPath();
    ctx.moveTo(padX + padW * 0.35, padY + padH * 0.72);
    ctx.lineTo(padX + padW * 0.68, padY + padH * 0.28);
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  } else if (zone.id === 'diskusi') {
    // Layar Telemetri Gelombang Akustik Hologram di Sudut Kanan Atas Meja Diskusi
    const dispX = px + pw - t * 3.1;
    const dispY = py + t * 1.15;
    rrect(ctx, dispX, dispY, t * 2.4, t * 1.15, 4);
    ctx.fillStyle = 'rgba(6, 21, 34, 0.85)';
    ctx.fill();
    ctx.strokeStyle = '#00DFFF';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath();
    for (let wx = 0; wx <= 36; wx += 3) {
      const wy = dispY + 16 + Math.sin(wx * 0.45) * 6;
      if (wx === 0) ctx.moveTo(dispX + 8 + wx, wy);
      else ctx.lineTo(dispX + 8 + wx, wy);
    }
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  } else if (zone.id === 'istirahat') {
    // Mesin Minuman / Vending Machine Bercahaya di Sisi Kanan Ruang Istirahat (Visual Layer)
    const vmX = px + pw - t * 2.1;
    const vmY = py + t * 1.5;
    const vmW = t * 1.35;
    const vmH = t * 2.2;
    rrect(ctx, vmX, vmY, vmW, vmH, 4);
    ctx.fillStyle = '#1e293b';
    ctx.fill();
    ctx.strokeStyle = '#FFB547';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    rrect(ctx, vmX + 4, vmY + 5, vmW - 8, vmH - 14, 2);
    ctx.fillStyle = '#0c2d42';
    ctx.fill();
    // Baris botol minuman bercahaya
    for (let r = 0; r < 3; r += 1) {
      ctx.fillStyle = r === 0 ? '#38bdf8' : r === 1 ? '#fbbf24' : '#4ade80';
      ctx.fillRect(vmX + 7, vmY + 9 + r * 11, vmW - 14, 5);
    }
  }
  ctx.restore();

  // RTX-Style Ambient Occlusion (RTAO) di ke-4 tepi ruangan untuk kedalaman 2.5D yang kaya & kontras
  const aoTop = ctx.createLinearGradient(px, py, px, py + t * 1.1);
  aoTop.addColorStop(0, 'rgba(48, 28, 16, 0.28)');
  aoTop.addColorStop(0.5, 'rgba(48, 28, 16, 0.08)');
  aoTop.addColorStop(1, 'rgba(48, 28, 16, 0)');
  ctx.fillStyle = aoTop;
  ctx.fillRect(px, py, pw, t * 1.1);

  const aoBottom = ctx.createLinearGradient(px, py + ph - t * 0.55, px, py + ph);
  aoBottom.addColorStop(0, 'rgba(48, 28, 16, 0)');
  aoBottom.addColorStop(1, 'rgba(48, 28, 16, 0.14)');
  ctx.fillStyle = aoBottom;
  ctx.fillRect(px, py + ph - t * 0.55, pw, t * 0.55);

  const aoLeft = ctx.createLinearGradient(px, py, px + t * 0.65, py);
  aoLeft.addColorStop(0, 'rgba(48, 28, 16, 0.18)');
  aoLeft.addColorStop(1, 'rgba(48, 28, 16, 0)');
  ctx.fillStyle = aoLeft;
  ctx.fillRect(px, py, t * 0.65, ph);

  const aoRight = ctx.createLinearGradient(px + pw - t * 0.5, py, px + pw, py);
  aoRight.addColorStop(0, 'rgba(48, 28, 16, 0)');
  aoRight.addColorStop(1, 'rgba(48, 28, 16, 0.12)');
  ctx.fillStyle = aoRight;
  ctx.fillRect(px + pw - t * 0.5, py, t * 0.5, ph);

  // Proyeksi kisi kaca jendela (Window Mullion Lattice) di lantai ruangan deret utara (y <= 1)
  if (y <= 1 && pw >= t * 5) {
    const winW = Math.min(pw * 0.52, t * 4.2);
    const winX = px + (pw - winW) * 0.5;
    const winY = py + t * 0.32;
    const winH = t * 1.15;
    const paneGrad = ctx.createLinearGradient(winX, winY, winX + 8, winY + winH);
    paneGrad.addColorStop(0, 'rgba(255, 246, 212, 0.16)');
    paneGrad.addColorStop(1, 'rgba(255, 246, 212, 0)');
    ctx.fillStyle = paneGrad;
    ctx.beginPath();
    ctx.moveTo(winX, winY);
    ctx.lineTo(winX + winW, winY);
    ctx.lineTo(winX + winW + 10, winY + winH);
    ctx.lineTo(winX + 10, winY + winH);
    ctx.closePath();
    ctx.fill();

    // Garis kisi kusen jendela (mullion) jatuh miring di lantai
    ctx.strokeStyle = 'rgba(62, 37, 23, 0.08)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(winX + winW * 0.5, winY);
    ctx.lineTo(winX + winW * 0.5 + 10, winY + winH);
    ctx.moveTo(winX + 5, winY + winH * 0.48);
    ctx.lineTo(winX + winW + 5, winY + winH * 0.48);
    ctx.stroke();
  }

  ctx.restore();
}

function paintCorridorFloor(ctx: CanvasRenderingContext2D, map: LabMapData, t: number): void {
  const worldW = map.width * t;
  const worldH = map.height * t;
  // Lantai Pelat Metalik Slate Koridor Laboratorium Futuristik
  ctx.fillStyle = '#5c6672';
  ctx.fillRect(0, 0, worldW, worldH);

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      if ((x + y) % 2 === 1) {
        ctx.fillStyle = '#545e6a';
        ctx.fillRect(x * t, y * t, t, t);
      }
    }
  }
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.22)';
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

  // Jalur Koridor Utama dengan Strip Pemandu & Panah Chevron Bercahaya Warm Amber (>>> dan ^^^)
  const runnerX = 1.4 * t;
  const runnerY = 9.25 * t;
  const runnerW = (map.width - 2.8) * t;
  const runnerH = 1.5 * t;
  rrect(ctx, runnerX, runnerY, runnerW, runnerH, 6);
  ctx.fillStyle = 'rgba(23, 45, 61, 0.36)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 223, 255, 0.32)';
  ctx.lineWidth = 1.1;
  ctx.stroke();

  // Chevron Horizontal (>>>) Bercahaya Amber di Sepanjang Koridor Utama
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 201, 107, 0.78)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const cxTile of [10, 21, 33]) {
    for (let i = 0; i < 3; i += 1) {
      const cx = (cxTile + i * 0.45) * t;
      const cy = 10.0 * t;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 5);
      ctx.lineTo(cx + 2, cy);
      ctx.lineTo(cx - 4, cy + 5);
      ctx.stroke();
    }
  }

  // Chevron Vertikal (^^^) Bercahaya Amber di Lorong Penghubung
  for (const [vxTile, vyTile] of [
    [14, 15.5],
    [28.8, 15.5],
    [21, 20.8],
  ] as const) {
    for (let i = 0; i < 3; i += 1) {
      const cx = vxTile * t;
      const cy = (vyTile - i * 0.38) * t;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy + 3);
      ctx.lineTo(cx, cy - 2);
      ctx.lineTo(cx + 5, cy + 3);
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

  // Bayangan jatuh dinding ke lantai bawah
  ctx.fillStyle = 'rgba(6, 15, 26, 0.38)';
  ctx.fillRect(px, py + ph, pw, 7);

  // Sisi depan dinding (Panel Metalik Industri 2.5D)
  const frontH = Math.min(ph * 0.44, 12);
  const frontGrad = ctx.createLinearGradient(px, py + ph - frontH, px, py + ph);
  frontGrad.addColorStop(0, '#33485c');
  frontGrad.addColorStop(1, '#1d2d3d');
  ctx.fillStyle = frontGrad;
  ctx.fillRect(px, py + ph - frontH, pw, frontH);

  // Strip Aksentuasi Lampu Dasar Dinding (Warm Amber & Cyan)
  ctx.fillStyle = (x + y) % 2 === 0 ? 'rgba(255, 181, 71, 0.78)' : 'rgba(0, 223, 255, 0.68)';
  ctx.fillRect(px + 2, py + ph - 2.5, Math.max(0, pw - 4), 2);

  // Permukaan atas dinding (Baja Dark Navy #0c1f30 -> #172D3D)
  const capGrad = ctx.createLinearGradient(px, py, px, py + ph - frontH);
  capGrad.addColorStop(0, '#223b50');
  capGrad.addColorStop(1, '#112233');
  ctx.fillStyle = capGrad;
  ctx.fillRect(px, py, pw, Math.max(4, ph - frontH));

  // Garis bevel metalik terang di puncak dinding
  ctx.fillStyle = 'rgba(0, 223, 255, 0.35)';
  ctx.fillRect(px + 1, py + 1, Math.max(0, pw - 2), 1.8);

  ctx.strokeStyle = '#06131f';
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
  // Ambang lantai metalik dengan pelat sensor bercahaya (Amber untuk Pintu Lab, Cyan untuk Pintu Samping/Umum)
  const glowCol = isConsultDoor
    ? doorMode === 'lab'
      ? 'rgba(255, 181, 71, 0.28)'
      : 'rgba(0, 223, 255, 0.28)'
    : 'rgba(0, 223, 255, 0.18)';
  ctx.fillStyle = glowCol;
  ctx.fillRect(px + 1, py + 1, t - 2, t - 2);

  const frameCol = isConsultDoor
    ? doorMode === 'lab'
      ? '#FFB547'
      : '#00DFFF'
    : '#38bdf8';

  // Rel pemandu pintu geser laboratorium
  ctx.strokeStyle = 'rgba(23, 45, 61, 0.85)';
  ctx.lineWidth = 4;
  if (orientation === 'horizontal') {
    ctx.beginPath();
    ctx.moveTo(px, py + t * 0.5);
    ctx.lineTo(px + t, py + t * 0.5);
    ctx.stroke();

    // Panel daun pintu kaca berbingkai neon
    ctx.strokeStyle = frameCol;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px + 3, py + t * 0.52);
    ctx.lineTo(px + t - 3, py + 5);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(234, 246, 255, 0.38)';
    ctx.lineWidth = 1.1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(px + 3, py + t * 0.52, t - 7, -Math.PI / 3, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(px + t * 0.5, py);
    ctx.lineTo(px + t * 0.5, py + t);
    ctx.stroke();

    ctx.strokeStyle = frameCol;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px + t * 0.52, py + 3);
    ctx.lineTo(px + 5, py + t - 3);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(234, 246, 255, 0.38)';
    ctx.lineWidth = 1.1;
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

  // 3. Partisi Kaca Laboratorium Modern (Glass Laboratory Partitions untuk lowDividers)
  for (const div of map.lowDividers) {
    const dx = div.x * t;
    const dy = div.y * t;
    const dw = div.w * t;
    const dh = div.h * t;
    // Bayangan jatuh partisi kaca
    ctx.fillStyle = 'rgba(4, 12, 22, 0.35)';
    rrect(ctx, dx + 2, dy + dh * 0.5, dw - 4, dh * 0.34, 4);
    ctx.fill();
    // Dasar bingkai metalik
    rrect(ctx, dx + 2, dy + dh * 0.25, dw - 4, dh * 0.42, 4);
    ctx.fillStyle = 'rgba(14, 52, 74, 0.78)';
    ctx.fill();
    ctx.strokeStyle = '#00DFFF';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    // Kilau pantulan kaca tipis di atas partisi
    ctx.fillStyle = 'rgba(234, 246, 255, 0.45)';
    ctx.fillRect(dx + 6, dy + dh * 0.32, Math.max(4, dw - 12), 2);
  }

  // 4. Dinding 2.5D + panel kaca observasi di tepi utara
  for (const wall of map.walls) {
    paintWall25D(ctx, wall.x, wall.y, wall.w, wall.h, t);
  }

  // Jendela Panel Kaca Observasi Berpendar Cyan-Amber di Dinding Utara (y = 0)
  for (const wx of [3, 12, 22, 33, 43]) {
    const px = wx * t;
    rrect(ctx, px, 4, 4 * t, 13, 4);
    const winGrad = ctx.createLinearGradient(px, 4, px, 17);
    winGrad.addColorStop(0, '#0ea5e9');
    winGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = winGrad;
    ctx.fill();
    ctx.strokeStyle = '#00DFFF';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    // Pantulan kaca miring
    ctx.fillStyle = 'rgba(234, 246, 255, 0.55)';
    ctx.fillRect(px + 5, 6, 4 * t - 10, 2.5);
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
  radius = 6,
  rimHighlight = 'rgba(234, 246, 255, 0.32)'
): void {
  // 1. Cast Shadow dalam di lantai
  rrect(ctx, x + 2, y + 6, w, h, radius);
  ctx.fillStyle = 'rgba(4, 10, 18, 0.44)';
  ctx.fill();

  // 2. Sisi ketebalan 2.5D (Bevel Bawah)
  rrect(ctx, x, y + 3, w, h, radius);
  ctx.fillStyle = sideCol;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 3. Permukaan meja atas dengan gradien material halus
  const topH = Math.max(6, h - 4);
  rrect(ctx, x, y, w, topH, radius);
  ctx.fillStyle = topCol;
  ctx.fill();
  ctx.stroke();

  // 4. Edge Lighting & Specular Reflection di tepi atas
  ctx.fillStyle = rimHighlight;
  rrect(ctx, x + 3, y + 1.8, Math.max(0, w - 6), 2.4, 2);
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
      drawTableBase(ctx, x, y, w, h, '#283d52', '#172636', 5, 'rgba(0, 223, 255, 0.45)');
      // Sasis Printer 3D Futuristik Berbingkai Kaca & Ruang Cetak Bercahaya Amber-Cyan
      const bw = Math.min(w - 6, 34);
      const bx = x + (w - bw) / 2;
      rrect(ctx, bx, y - 11, bw, h + 3, 4);
      ctx.fillStyle = '#142434';
      ctx.fill();
      ctx.strokeStyle = '#00DFFF';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      // Ruang cetak bercahaya amber hangat (seperti di gambar referensi Cetak 3D)
      rrect(ctx, bx + 3.5, y - 7, bw - 7, h - 7, 2);
      const chGrad = ctx.createLinearGradient(bx, y - 7, bx, y + h - 14);
      chGrad.addColorStop(0, 'rgba(255, 181, 71, 0.85)');
      chGrad.addColorStop(1, 'rgba(0, 223, 255, 0.45)');
      ctx.fillStyle = chGrad;
      ctx.fill();
      // Nozzle ekstruder bergerak halus
      const headX =
        bx +
        7 +
        (reducedMotion ? 5 : (0.5 + 0.5 * Math.sin(timeSeconds * 2.4 + x)) * Math.max(2, bw - 16));
      ctx.fillStyle = '#061522';
      ctx.fillRect(headX, y - 5, 4.5, 5.5);
      // Objek prototipe holografik di atas pelat cetak
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(bx + bw / 2 - 4, y + h - 19, 8, 5);
      // LED status
      ctx.fillStyle = !reducedMotion && Math.sin(timeSeconds * 4 + x) > 0 ? '#00E5FF' : '#FFB547';
      ctx.beginPath();
      ctx.arc(bx + bw - 5.5, y - 8, 2, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'meja-komputer': {
      drawTableBase(ctx, x, y, w, h, '#25394f', '#152333', 6, 'rgba(22, 139, 255, 0.48)');
      const count = Math.max(1, Math.floor(w / 44));
      const step = w / count;
      for (let i = 0; i < count; i += 1) {
        const mx = x + i * step + step / 2 - 14;
        // Monitor Widescreen Sci-Fi Berbingkai Cyan Tipis
        rrect(ctx, mx, y - 6, 28, 17, 3);
        ctx.fillStyle = '#091929';
        ctx.fill();
        ctx.strokeStyle = '#00DFFF';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        // Layar IDE Bercahaya Neon Blue & Cyan
        ctx.fillStyle = '#0c2742';
        ctx.fillRect(mx + 2, y - 3.5, 24, 12);
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(mx + 4, y - 1, 11, 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(mx + 4, y + 2.5, 17, 2);
        ctx.fillStyle = '#FFB547';
        ctx.fillRect(mx + 4, y + 6, 9, 2);
        // Keyboard Mekanik Backlit Cyan
        rrect(ctx, mx + 3, y + 13.5, 22, 5, 2);
        ctx.fillStyle = '#172D3D';
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 223, 255, 0.45)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
      break;
    }
    case 'bilik-las': {
      drawTableBase(ctx, x, y, w, h, '#465362', '#2b3440', 5, 'rgba(255, 181, 71, 0.45)');
      // Tudung Ventilasi & Panel Pelindung K3 Amber-Metalik
      rrect(ctx, x + 3, y - 8, w - 6, 10, 3);
      ctx.fillStyle = '#d97724';
      ctx.fill();
      ctx.strokeStyle = '#FFB547';
      ctx.lineWidth = 1.3;
      ctx.stroke();
      // Pelat baja benda kerja di atas meja
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 10, y + h / 2);
      ctx.lineTo(x + w - 10, y + h / 2);
      ctx.stroke();
      // Indikator Amber selalu aktif + busur las berkedip
      ctx.fillStyle = '#FFB547';
      ctx.beginPath();
      ctx.arc(x + 8, y - 3, 2.2, 0, Math.PI * 2);
      ctx.fill();
      if (!reducedMotion && Math.sin(timeSeconds * 9 + x) > 0.48) {
        ctx.fillStyle = '#fff3c4';
        ctx.beginPath();
        ctx.arc(x + w * 0.5, y + h / 2, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'meja-elektronik': {
      drawTableBase(ctx, x, y, w, h, '#23474e', '#142d33', 6, 'rgba(0, 229, 255, 0.45)');
      // Matras Solder ESD Hijau-Sian Bercahaya
      rrect(ctx, x + 5, y + 3, w - 10, Math.max(8, h - 10), 3);
      ctx.fillStyle = '#0d6e6e';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();
      // Osiloskop Digital & Layar Telemetri IoT
      const ox = x + 8;
      rrect(ctx, ox, y - 5, 28, 16, 3);
      ctx.fillStyle = '#091e28';
      ctx.fill();
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = '#05151d';
      ctx.fillRect(ox + 2.5, y - 2.5, 18, 11);
      ctx.strokeStyle = '#00E5FF';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      for (let sx = 0; sx <= 15; sx += 2) {
        const sy = y + 3 + Math.sin(sx * 0.75 + (reducedMotion ? 0 : timeSeconds * 4.2)) * 3.2;
        if (sx === 0) ctx.moveTo(ox + 3.5 + sx, sy);
        else ctx.lineTo(ox + 3.5 + sx, sy);
      }
      ctx.stroke();
      break;
    }
    case 'meja-diskusi': {
      // Kursi kolaborasi modern mengelilingi meja diskusi besar
      const chairColors = ['#168BFF', '#FFB547', '#00DFFF', '#38bdf8'];
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
      drawTableBase(ctx, x, y, w, h, '#9e7b56', '#6b4f35', 10);
      // 2 Blueprint Hologram Berlian Cyan di Atas Meja Diskusi (sesuai referensi gambar)
      for (const hx of [x + w * 0.36, x + w * 0.56]) {
        const hy = y + h * 0.5;
        ctx.save();
        ctx.translate(hx, hy);
        ctx.rotate(0.45);
        rrect(ctx, -9, -7, 18, 14, 2);
        ctx.fillStyle = 'rgba(0, 223, 255, 0.28)';
        ctx.fill();
        ctx.strokeStyle = '#00E5FF';
        ctx.lineWidth = 1.2;
        ctx.stroke();
        ctx.restore();
      }
      rrect(ctx, x + 12, y + 6, 16, 11, 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      break;
    }
    case 'meja-desain': {
      drawTableBase(ctx, x, y, w, h, '#b8a9c9', '#7d6b91', 7);
      const count = Math.max(1, Math.floor(w / 52));
      const step = w / count;
      for (let i = 0; i < count; i += 1) {
        const mx = x + i * step + step / 2 - 16;
        // Workstation Dual-Display Studio Desain Berlampu Ungu-Sian
        rrect(ctx, mx, y - 6, 32, 18, 3);
        ctx.fillStyle = '#1e1633';
        ctx.fill();
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.3;
        ctx.stroke();
        ctx.fillStyle = '#2e1d52';
        ctx.fillRect(mx + 2.5, y - 3.5, 27, 13);
        ctx.fillStyle = '#e879f9';
        ctx.fillRect(mx + 4.5, y - 1.5, 8, 8);
        ctx.fillStyle = '#00E5FF';
        ctx.fillRect(mx + 14, y - 1.5, 13, 5);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(mx + 14, y + 5, 10, 3);
        // Pen tablet kreatif
        rrect(ctx, mx + 5, y + 14, 22, 6, 2);
        ctx.fillStyle = '#3b2854';
        ctx.fill();
      }
      break;
    }
    case 'meja-baca': {
      drawTableBase(ctx, x, y, w, h, '#a87e51', '#73512c', 9);
      // Buku referensi terbuka + Globe / Lampu Baca Amber Hangat
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
      // Globe & Lampu Amber Pojok Baca
      const lx = x + w - 18;
      const ly = y + 10;
      ctx.fillStyle = 'rgba(255, 181, 71, 0.42)';
      ctx.beginPath();
      ctx.arc(lx, ly, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFB547';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(lx, ly, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case 'sofa': {
      // Sofa hijau-zamrud modern (Ruang Istirahat & Pojok Baca)
      rrect(ctx, x + 2, y + 4, w, h, 8);
      ctx.fillStyle = 'rgba(6, 15, 26, 0.35)';
      ctx.fill();
      rrect(ctx, x, y, w, h, 8);
      ctx.fillStyle = '#1f7a5c';
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.6;
      ctx.stroke();
      rrect(ctx, x + 4, y + 3, w - 8, Math.max(8, h * 0.36), 5);
      ctx.fillStyle = '#165e46';
      ctx.fill();
      rrect(ctx, x + 8, y + 6, 12, 10, 4);
      ctx.fillStyle = '#FFC96B';
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
  const pw = Math.min(zone.bounds.w * t - 8, tw + 24);
  const ph = 19;
  const px = cx - pw / 2;
  const py = cy - ph / 2;

  // Bayangan kontak plakat
  rrect(ctx, px, py + 2.5, pw, ph, 9.5);
  ctx.fillStyle = 'rgba(4, 12, 22, 0.62)';
  ctx.fill();

  // Kapsul Plakat HUD Dark Glass Berbingkai Neon (sesuai gambar referensi AAA)
  rrect(ctx, px, py, pw, ph, 9.5);
  ctx.fillStyle = selected ? meta.accent : meta.bg;
  ctx.fill();
  ctx.strokeStyle = selected ? '#EAF6FF' : meta.accent;
  ctx.lineWidth = selected ? 2.2 : 1.4;
  ctx.stroke();

  // Dua titik indikator LED di ujung kiri & kanan plakat ruangan
  for (const rx of [px + 5.5, px + pw - 5.5]) {
    ctx.fillStyle = selected ? '#061522' : meta.accent;
    ctx.beginPath();
    ctx.arc(rx, cy, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = selected ? '#061522' : '#EAF6FF';
  ctx.fillText(label, cx, cy + 0.5, pw - 16);
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
  reducedMotion: boolean,
  weatherMode: CampusWeatherMode = 'otomatis'
): void {
  if (widthCss < 200 || heightCss < 200) return;
  const worldW = map.width * map.tileSizePx * camera.scale;
  const worldH = map.height * map.tileSizePx * camera.scale;
  const bx = camera.offsetX;
  const by = camera.offsetY;

  ctx.save();

  // Mode Cuaca Hujan Rintik Kampus (Cozy Rain: 3 lapis garis hujan + riak air di halaman batu)
  if (weatherMode === 'hujan') {
    const animT = reducedMotion ? 1.0 : timeSeconds;
    // Riak cipratan air hujan di teras & jalan batu luar gedung
    ctx.strokeStyle = 'rgba(216, 240, 255, 0.48)';
    ctx.lineWidth = 1.1;
    for (let ri = 0; ri < 14; ri += 1) {
      const cycle = (animT * 1.7 + ri * 0.29) % 1;
      const rx = ((ri * 173.3 + 64) % Math.max(1, widthCss));
      const ry = ((ri * 127.9 + 38) % Math.max(1, heightCss));
      if (rx > bx + 8 && rx < bx + worldW - 8 && ry > by + 8 && ry < by + worldH - 8) continue;
      ctx.globalAlpha = (1 - cycle) * 0.65;
      ctx.beginPath();
      ctx.ellipse(rx, ry, 2 + cycle * 9, 1 + cycle * 3.8, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3 lapis rintik hujan miring sinematik
    ctx.globalAlpha = 1;
    const dropCount = reducedMotion ? 28 : 64;
    for (let di = 0; di < dropCount; di += 1) {
      const layer = (di % 3) + 1;
      const speed = reducedMotion ? 0 : 340 + layer * 130;
      const x = ((di * 97.7 + animT * speed * 0.24) % (widthCss + 80)) - 40;
      const y = ((di * 151.3 + animT * speed) % (heightCss + 80)) - 40;
      const len = 10 + layer * 5;
      ctx.strokeStyle =
        layer === 3
          ? 'rgba(224, 242, 254, 0.42)'
          : layer === 2
            ? 'rgba(186, 230, 253, 0.30)'
            : 'rgba(186, 230, 253, 0.20)';
      ctx.lineWidth = layer === 3 ? 1.35 : 1;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - len * 0.24, y + len);
      ctx.stroke();
    }
    ctx.restore();
    return;
  }

  if (reducedMotion) {
    ctx.restore();
    return;
  }

  // Partikel energi cyan & amber halus melayang di area bezel luar gedung (tidak mengganggu pembacaan dalam ruangan)
  for (let i = 0; i < 10; i += 1) {
    const speedX = 8 + (i % 3) * 4;
    const speedY = 5 + (i % 4) * 2;
    const px = ((i * 187 + timeSeconds * speedX) % (widthCss + 40)) - 20;
    const py = ((i * 109 + timeSeconds * speedY + Math.sin(timeSeconds * 1.2 + i) * 10) % (heightCss + 40)) - 20;
    if (px > bx - 8 && px < bx + worldW + 8 && py > by - 8 && py < by + worldH + 8) continue;
    const alpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(timeSeconds * 2 + i));
    ctx.fillStyle =
      i % 2 === 0
        ? `rgba(0, 223, 255, ${alpha.toFixed(3)})`
        : `rgba(255, 181, 71, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(px, py, i % 3 === 0 ? 2.2 : 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
