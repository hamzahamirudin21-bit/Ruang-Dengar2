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
  las: { style: 'beton', base: '#c4ccd5', alt: '#b8c1cc', accent: '#e8ae2d' },
  'cetak-3d': { style: 'keramik', base: '#d2e4ee', alt: '#c4d9e6', accent: '#3c9ab6' },
  'elektronik-iot': { style: 'keramik', base: '#d3e5db', alt: '#c5dacf', accent: '#2f9574' },
  'gudang-alat': { style: 'beton', base: '#cfc7b8', alt: '#c3baa9', accent: '#9c7240' },
  pemrograman: { style: 'karpet', base: '#cad8ea', alt: '#bdcde2', accent: '#4e6fb5', rug: '#b7c9e2', rugTrim: '#7b97ca' },
  diskusi: { style: 'kayu', base: '#DFBE88', alt: '#d3b077', accent: '#ad7d42', rug: '#c4d9b8', rugTrim: '#7aa36d' },
  istirahat: { style: 'karpet', base: '#eacbb6', alt: '#e0bfa8', accent: '#c9744b', rug: '#f0dcc2', rugTrim: '#d18c64' },
  konsultasi: { style: 'kayu', base: '#e2c494', alt: '#d6b582', accent: '#be7c3e', rug: '#c9e0d3', rugTrim: '#56997f' },
  'ruang-dosen': { style: 'kayu', base: '#cca97c', alt: '#c09a6b', accent: '#83542f', rug: '#d3cce3', rugTrim: '#8b7cb0' },
  'studio-desain': { style: 'kayu', base: '#dfd2ee', alt: '#d3c4e6', accent: '#8b67b8', rug: '#ece0fa', rugTrim: '#a583d1' },
  'pojok-baca': { style: 'karpet', base: '#c5ded0', alt: '#b7d3c3', accent: '#348060', rug: '#e5d7b7', rugTrim: '#b8945a' },
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
  // Lantai ubin krem-hangat koridor kampus (kontras nyaman, tidak silau)
  ctx.fillStyle = '#eadbc0';
  ctx.fillRect(0, 0, worldW, worldH);

  for (let y = 0; y < map.height; y += 1) {
    for (let x = 0; x < map.width; x += 1) {
      if ((x + y) % 2 === 1) {
        ctx.fillStyle = '#e1cfb0';
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

  // Karpet Jalur Koridor Utama Beraksen Kuningan Nusantara & 3 Medali Kompas Vokasi
  const runnerX = 1.4 * t;
  const runnerY = 9.32 * t;
  const runnerW = (map.width - 2.8) * t;
  const runnerH = 1.36 * t;
  rrect(ctx, runnerX, runnerY, runnerW, runnerH, 6);
  ctx.fillStyle = 'rgba(182, 134, 76, 0.24)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(140, 94, 42, 0.35)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // Garis bordir dalam karpet koridor
  ctx.strokeStyle = 'rgba(242, 198, 108, 0.42)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(runnerX + 4, runnerY + 3.5, runnerW - 8, runnerH - 7);
  ctx.setLineDash([]);

  // 3 Medali Kompas Kuningan di Persimpangan Koridor
  for (const mxTile of [13, 25, 37]) {
    const mx = mxTile * t;
    const my = 10.0 * t;
    ctx.save();
    ctx.fillStyle = 'rgba(218, 168, 78, 0.32)';
    ctx.strokeStyle = 'rgba(122, 78, 32, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(mx, my, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bintang belah ketupat Nusantara di tengah medali
    ctx.fillStyle = 'rgba(46, 130, 116, 0.38)';
    ctx.beginPath();
    ctx.moveTo(mx, my - 6);
    ctx.lineTo(mx + 6, my);
    ctx.lineTo(mx, my + 6);
    ctx.lineTo(mx - 6, my);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
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
  const pw = Math.min(zone.bounds.w * t - 8, tw + 24);
  const ph = 19;
  const px = cx - pw / 2;
  const py = cy - ph / 2;

  // Bayangan kontak plakat
  rrect(ctx, px, py + 2.2, pw, ph, 9.5);
  ctx.fillStyle = 'rgba(48, 28, 16, 0.28)';
  ctx.fill();

  // Kapsul Plakat Atelier Berpaku Kuningan (Brass-Rivet Nameplate)
  rrect(ctx, px, py, pw, ph, 9.5);
  ctx.fillStyle = selected ? meta.accent : meta.bg;
  ctx.fill();
  ctx.strokeStyle = selected ? '#ffe694' : INK;
  ctx.lineWidth = selected ? 2.2 : 1.6;
  ctx.stroke();

  // Garis aksen warna zona di tepi bawah plakat (saat tidak sedang dipilih)
  if (!selected) {
    ctx.save();
    rrect(ctx, px, py, pw, ph, 9.5);
    ctx.clip();
    ctx.fillStyle = meta.accent;
    ctx.globalAlpha = 0.22;
    ctx.fillRect(px, py + ph - 3, pw, 3);
    ctx.restore();
  }

  // Dua paku keling kuningan mungil di ujung kiri & kanan plakat
  for (const rx of [px + 5.5, px + pw - 5.5]) {
    ctx.fillStyle = selected ? '#ffe694' : '#d89e3a';
    ctx.beginPath();
    ctx.arc(rx, cy, 1.7, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = selected ? '#fffdf6' : INK;
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
