/**
 * Sistem Sumber Cahaya Titik 2D Dinamis (Dynamic Point Lights & Additive Emissive Glow)
 * untuk seluruh 11 ruangan kampus: monitor, percikan las, osiloskop, printer 3D,
 * lampu baca, lampu Ruang BK, dan limpahan cahaya jendela utara.
 */
import type { LabMapData } from '../../types';
import type { RoomDecorId } from '../../engine/roomDecor';
import { computeSunLighting, type CampusWeatherMode } from './sunLighting';

export type PointLightKind =
  | 'monitor'
  | 'weld'
  | 'oscilloscope'
  | 'printer'
  | 'lamp'
  | 'design'
  | 'sun-window';

export interface PointLight2D {
  id: string;
  x: number;
  y: number;
  radius: number;
  r: number;
  g: number;
  b: number;
  intensity: number;
  kind: PointLightKind;
}

export function collectMapPointLights(
  map: LabMapData,
  equippedDecor: readonly RoomDecorId[] | undefined,
  clockMinutesOfDay: number,
  timeSeconds: number,
  reducedMotion: boolean,
  weatherMode: CampusWeatherMode = 'otomatis'
): PointLight2D[] {
  const t = map.tileSizePx;
  const sun = computeSunLighting(clockMinutesOfDay, weatherMode);
  const lampBoost = sun.indoorLampBoost;
  const lights: PointLight2D[] = [];
  const hasDecor = (id: RoomDecorId) => Boolean(equippedDecor?.includes(id));

  // 1. Pencahayaan Ambien Jendela & Langit-Langit Berwarna Spesifik Ruangan (Room-Specific Colored Lighting)
  const zoneLightSpec: Partial<
    Record<
      string,
      { r: number; g: number; b: number; intensity: number; radiusScale: number }
    >
  > = {
    las: { r: 255, g: 181, b: 71, intensity: 0.14, radiusScale: 0.42 },
    'cetak-3d': { r: 0, g: 223, b: 255, intensity: 0.16, radiusScale: 0.46 },
    'elektronik-iot': { r: 0, g: 229, b: 255, intensity: 0.15, radiusScale: 0.45 },
    'gudang-alat': { r: 255, g: 181, b: 71, intensity: 0.12, radiusScale: 0.40 },
    'studio-desain': { r: 192, g: 132, b: 252, intensity: 0.16, radiusScale: 0.46 },
    pemrograman: { r: 22, g: 139, b: 255, intensity: 0.15, radiusScale: 0.44 },
    diskusi: { r: 132, g: 204, b: 22, intensity: 0.12, radiusScale: 0.42 },
    konsultasi: { r: 255, g: 201, b: 107, intensity: 0.14, radiusScale: 0.44 },
    'pojok-baca': { r: 255, g: 181, b: 71, intensity: 0.14, radiusScale: 0.42 },
    istirahat: { r: 255, g: 201, b: 107, intensity: 0.13, radiusScale: 0.40 },
    'ruang-dosen': { r: 168, g: 85, b: 247, intensity: 0.14, radiusScale: 0.42 },
  };

  for (const z of map.zones) {
    const spec = zoneLightSpec[z.id];
    if (!spec) continue;
    const cx = (z.bounds.x + z.bounds.w * 0.5) * t;
    const cy = (z.bounds.y + z.bounds.h * 0.42) * t;
    lights.push({
      id: `win-${z.id}`,
      x: cx + sun.shadowDirX * 10,
      y: cy,
      radius: Math.max(z.bounds.w, z.bounds.h) * t * spec.radiusScale,
      r: spec.r,
      g: spec.g,
      b: spec.b,
      intensity: spec.intensity,
      kind: 'sun-window',
    });
  }

  // 2. Sumber cahaya nyata dari setiap perabot aktif di 11 ruangan (fokus lokal ala RTX specular, bebas overexposure)
  for (let i = 0; i < map.furniture.length; i += 1) {
    const f = map.furniture[i];
    const cx = (f.rect.x + f.rect.w * 0.5) * t;
    const cy = (f.rect.y + f.rect.h * 0.5) * t;

    switch (f.kind) {
      case 'meja-komputer': {
        const flicker = reducedMotion ? 1 : 0.92 + 0.08 * Math.sin(timeSeconds * 3.1 + i * 1.7);
        lights.push({
          id: `light-${f.id}`,
          x: cx,
          y: cy - 4,
          radius: Math.max(42, f.rect.w * t * 0.42),
          r: 72,
          g: 198,
          b: 248,
          intensity: 0.13 * lampBoost * flicker,
          kind: 'monitor',
        });
        break;
      }
      case 'meja-desain': {
        const hueShift = reducedMotion ? 0 : Math.sin(timeSeconds * 1.4 + i) * 24;
        lights.push({
          id: `light-${f.id}`,
          x: cx,
          y: cy - 3,
          radius: Math.max(46, f.rect.w * t * 0.45),
          r: Math.min(255, Math.round(198 + hueShift)),
          g: 138,
          b: 246,
          intensity: 0.14 * lampBoost,
          kind: 'design',
        });
        break;
      }
      case 'bilik-las': {
        // Percikan busur listrik las dinamis: pendar oranye pilot + kilatan biru-emas terfokus saat menyala
        const sparkWave = reducedMotion ? 0.35 : Math.sin(timeSeconds * 8.6 + i * 2.9);
        const sparking = sparkWave > 0.52;
        lights.push({
          id: `light-${f.id}`,
          x: cx,
          y: cy,
          radius: sparking ? 76 : 42,
          r: sparking ? 255 : 255,
          g: sparking ? 204 : 142,
          b: sparking ? 118 : 64,
          intensity: sparking ? 0.28 : 0.10 * lampBoost,
          kind: 'weld',
        });
        break;
      }
      case 'meja-elektronik': {
        const wave = reducedMotion ? 1 : 0.9 + 0.1 * Math.sin(timeSeconds * 4.2 + i);
        lights.push({
          id: `light-${f.id}`,
          x: cx - f.rect.w * t * 0.18,
          y: cy - 2,
          radius: 44,
          r: 62,
          g: 224,
          b: 138,
          intensity: 0.13 * lampBoost * wave,
          kind: 'oscilloscope',
        });
        break;
      }
      case 'printer-3d': {
        const pulse = reducedMotion ? 1 : 0.86 + 0.14 * Math.sin(timeSeconds * 2.5 + i * 1.3);
        lights.push({
          id: `light-${f.id}`,
          x: cx,
          y: cy - 4,
          radius: 36,
          r: i % 2 === 0 ? 64 : 252,
          g: i % 2 === 0 ? 214 : 184,
          b: i % 2 === 0 ? 206 : 82,
          intensity: 0.12 * lampBoost * pulse,
          kind: 'printer',
        });
        break;
      }
      case 'meja-baca': {
        const glow = reducedMotion ? 1 : 0.95 + 0.05 * Math.sin(timeSeconds * 1.9 + i);
        lights.push({
          id: `light-${f.id}`,
          x: f.rect.x * t + f.rect.w * t - 16,
          y: f.rect.y * t + 10,
          radius: 58,
          r: 255,
          g: 204,
          b: 108,
          intensity: 0.20 * lampBoost * glow,
          kind: 'lamp',
        });
        break;
      }
      case 'meja-konsultasi': {
        const hasLamp = hasDecor('lampu-senja');
        const glow = reducedMotion ? 1 : 0.94 + 0.06 * Math.sin(timeSeconds * 2.1);
        lights.push({
          id: `light-${f.id}`,
          x: cx,
          y: cy,
          radius: hasLamp ? 96 : 62,
          r: 255,
          g: hasLamp ? 202 : 216,
          b: hasLamp ? 104 : 142,
          intensity: (hasLamp ? 0.28 : 0.15) * lampBoost * glow,
          kind: 'lamp',
        });
        break;
      }
      case 'meja-dosen': {
        lights.push({
          id: `light-${f.id}`,
          x: cx + 10,
          y: cy - 2,
          radius: 52,
          r: 255,
          g: 208,
          b: 126,
          intensity: 0.16 * lampBoost,
          kind: 'lamp',
        });
        break;
      }
      default:
        break;
    }
  }

  return lights;
}

/**
 * Menggambar lapisan pencahayaan aditif (bloom 2D) + nuansa senja halus di ruang koordinat dunia.
 * Dipanggil setelah sprite/perabot sehingga pendar lampu ikut menyinari bahu karakter & permukaan meja.
 */
export function drawDynamicPointLights(
  ctx: CanvasRenderingContext2D,
  worldW: number,
  worldH: number,
  lights: readonly PointLight2D[],
  duskShade: number
): void {
  ctx.save();

  // 1. Lapisan senja halus (multiply) agar pendar lampu ruangan tampak kontras & hangat saat sore
  if (duskShade > 0.01) {
    ctx.globalCompositeOperation = 'multiply';
    const r = Math.round(255 - duskShade * 28);
    const g = Math.round(255 - duskShade * 64);
    const b = Math.round(255 - duskShade * 88);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, worldW, worldH);
  }

  // 2. Pancaran titik cahaya lokal (terfokus di sekitar sumber lampu tanpa memutihkan lantai)
  ctx.globalCompositeOperation = 'lighter';
  for (const l of lights) {
    if (l.intensity <= 0.005 || l.radius <= 1) continue;
    const peak = Math.min(0.32, l.intensity);
    const grad = ctx.createRadialGradient(l.x, l.y, 1, l.x, l.y, l.radius);
    grad.addColorStop(0, `rgba(${l.r}, ${l.g}, ${l.b}, ${peak.toFixed(3)})`);
    grad.addColorStop(
      0.36,
      `rgba(${l.r}, ${l.g}, ${l.b}, ${(peak * 0.35).toFixed(3)})`
    );
    grad.addColorStop(1, `rgba(${l.r}, ${l.g}, ${l.b}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
