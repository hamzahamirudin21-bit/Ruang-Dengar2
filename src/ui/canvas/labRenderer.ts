import {
  CanvasViewOptions,
  ConsultationDoorMode,
  DevPathTestState,
  LabFurniture,
  LabMapData,
  LabZone,
  StudentAgent,
  ZoneType,
} from '../../types';
import {
  computeAgentBubbles,
  drawAgentOverlays,
  drawAgentSprite,
  drawInteractionLines,
  type AgentRenderOptions,
} from './agentRenderer';
import {
  drawAgentMarkers,
  drawAvatar,
  drawCompanion,
  drawRouteLine,
  type StoryRenderOptions,
} from './storyLayer';
import { companionPosition } from '../../engine/story/avatar';
import type { PixelGrid } from '../characters/pixelGrid';
import { drawTilemap, getTilemapCanvas } from '../world/tilemapCache';
import { buildTileGrid } from '../world/tilemap';
import { buildDecor, paintDecor, type DecorItem, type DecorKind } from '../world/decor';
import {
  PRINTER_LED_RECT,
  paintFurniture,
  printerLedColor,
  printerUnitIndex,
  type FurnitureSprite,
} from '../world/furnitureArt';
import { paintPlaque } from '../world/plaque';
import {
  drawEquippedBkDecorOnMap,
  drawIllustratedFurniture,
  drawIllustratedZoneLabel,
  drawOutdoorAmbientParticles,
  drawOutdoorCampusCourtyard,
  getIllustratedLabBackdrop,
} from '../world/illustratedLab';
import type { RoomDecorId } from '../../engine/roomDecor';
import { computeSunLighting, type CampusWeatherMode } from '../gpu/sunLighting';
import { collectMapPointLights, drawDynamicPointLights } from '../gpu/pointLights';
import { buildDrawList, spriteFeet } from '../world/worldMetrics';

export interface CameraTransform {
  offsetX: number;
  offsetY: number;
  scale: number;
}

/** Data lapisan cerita; kamera, ukuran petak, dan agen diambil dari input renderer. */
export type StoryRenderLayer = Omit<StoryRenderOptions, 'camera' | 'tileSizePx' | 'agents'>;

export interface ClickRippleState {
  x: number;
  y: number;
  startedAtSec: number;
}

export interface WorldPopup {
  x: number;
  y: number;
  text: string;
  tone: 'gold' | 'teal' | 'warn';
  startedAtSec: number;
}

export interface LabRenderInput {
  map: LabMapData;
  camera: CameraTransform;
  viewOptions: CanvasViewOptions;
  hoveredZoneId: ZoneType | null;
  selectedZoneId: ZoneType | null;
  agents: readonly StudentAgent[];
  selectedAgentId: string | null;
  hoveredAgentId: string | null;
  devPathTest: DevPathTestState | null;
  clockMinutesOfDay: number;
  /** Waktu animasi (detik) dan preferensi gerak untuk sprite agen. */
  timeSeconds?: number;
  reducedMotion?: boolean;
  /** Riak umpan balik klik pada koordinat dunia. */
  clickRipple?: ClickRippleState | null;
  /** Daftar hiasan Ruang BK yang terpasang agar tampil nyata di peta 2D. */
  equippedDecor?: readonly RoomDecorId[];
  /** Teks umpan balik melayang pada koordinat dunia (mis. +2 ⭐ Pulih!). */
  worldPopups?: readonly WorldPopup[];
  /** Mode cuaca & pencahayaan kampus (otomatis, cerah, senja, hujan). */
  weatherMode?: CampusWeatherMode;
  /** Opsional. Bila tidak ada, render identik dengan sebelumnya. */
  story?: StoryRenderLayer;
}

interface Palette {
  voidBg: string;
  floor: string;
  corridor: string;
  grid: string;
  wall: string;
  wallTop: string;
  doorVisible: string;
  doorSide: string;
  furniture: string;
  furnitureStroke: string;
  slot: string;
  k3Yellow: string;
  k3Dark: string;
  labelBg: string;
  labelText: string;
  pathColor: string;
  agentTestColor: string;
  accent: string;
  zoneColors: Record<string, string>;
}

function readPalette(canvas: HTMLCanvasElement, map: LabMapData): Palette {
  const styles = getComputedStyle(canvas);
  const readVar = (name: string, fallback: string) => {
    const val = styles.getPropertyValue(name).trim();
    return val || fallback;
  };

  const zoneColors: Record<string, string> = {};
  for (const zone of map.zones) {
    zoneColors[zone.id] = readVar(zone.colorVar, '#eef2f6');
  }

  return {
    voidBg: readVar('--lab-void', '#e6ebf0'),
    floor: readVar('--lab-floor', '#f8fafb'),
    corridor: readVar('--lab-corridor', '#eef2f6'),
    grid: readVar('--lab-grid', '#dce3ec'),
    wall: readVar('--lab-wall', '#334155'),
    wallTop: readVar('--lab-wall-top', '#475569'),
    doorVisible: readVar('--lab-door-visible', '#b45309'),
    doorSide: readVar('--lab-door-side', '#0f766e'),
    furniture: readVar('--lab-furniture', '#cbd5e1'),
    furnitureStroke: readVar('--lab-furniture-stroke', '#64748b'),
    slot: readVar('--lab-slot', '#94a3b8'),
    k3Yellow: readVar('--lab-k3-yellow', '#eab308'),
    k3Dark: readVar('--lab-k3-dark', '#334155'),
    labelBg: readVar('--lab-label-bg', 'rgba(255, 255, 255, 0.92)'),
    labelText: readVar('--lab-label-text', '#1e293b'),
    pathColor: readVar('--lab-path', '#0284c7'),
    agentTestColor: readVar('--lab-agent-test', '#0f766e'),
    accent: readVar('--ui-accent', '#1d5d7a'),
    zoneColors,
  };
}

export function computeFitCamera(
  canvasWidth: number,
  canvasHeight: number,
  map: LabMapData
): CameraTransform {
  const worldW = map.width * map.tileSizePx;
  const worldH = map.height * map.tileSizePx;
  const padding = 28;
  const availW = Math.max(200, canvasWidth - padding * 2);
  const availH = Math.max(160, canvasHeight - padding * 2);
  const scale = Math.max(0.45, Math.min(2.2, Math.min(availW / worldW, availH / worldH)));
  const offsetX = (canvasWidth - worldW * scale) / 2;
  const offsetY = (canvasHeight - worldH * scale) / 2;
  return { offsetX, offsetY, scale };
}

export function screenToTile(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  camera: CameraTransform,
  tileSizePx: number
): { x: number; y: number } {
  const localX = clientX - canvasRect.left;
  const localY = clientY - canvasRect.top;
  const worldX = (localX - camera.offsetX) / camera.scale;
  const worldY = (localY - camera.offsetY) / camera.scale;
  return {
    x: Math.floor(worldX / tileSizePx),
    y: Math.floor(worldY / tileSizePx),
  };
}

export function findZoneAtTile(
  map: LabMapData,
  tileX: number,
  tileY: number
): LabZone | null {
  for (const zone of map.zones) {
    const b = zone.bounds;
    if (tileX >= b.x && tileX < b.x + b.w && tileY >= b.y && tileY < b.y + b.h) {
      return zone;
    }
  }
  return null;
}

function drawDoor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  orientation: 'horizontal' | 'vertical',
  color: string,
  highlight: boolean
): void {
  const px = x * t;
  const py = y * t;

  ctx.save();
  // Ambang pintu bersih
  ctx.fillStyle = highlight ? 'rgba(180, 83, 9, 0.14)' : 'rgba(148, 163, 184, 0.16)';
  ctx.fillRect(px, py, t, t);

  ctx.strokeStyle = color;
  ctx.lineWidth = highlight ? 2.5 : 2;

  if (orientation === 'horizontal') {
    // Daun pintu + busur ayun tipis
    ctx.beginPath();
    ctx.moveTo(px + 2, py + t * 0.5);
    ctx.lineTo(px + t - 2, py + 4);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(px + 2, py + t * 0.5, t - 6, -Math.PI / 3, 0);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(px + t * 0.5, py + 2);
    ctx.lineTo(px + 4, py + t - 2);
    ctx.stroke();

    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(px + t * 0.5, py + 2, t - 6, Math.PI / 2, (Math.PI * 5) / 6);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Cache sprite luar layar (perabot, dekor, plakat)
// ---------------------------------------------------------------------------

/** Piksel dunia per piksel seni (tilemap 14 piksel seni = 28 piksel dunia). */
const ART_SCALE = 2;
const PLAQUE_SCALE = 2;

type GridSurface = HTMLCanvasElement | OffscreenCanvas;

/** Gambar PixelGrid ke kanvas luar layar skala 1; null bila kanvas tak tersedia. */
function gridToSurface(grid: PixelGrid): GridSurface | null {
  try {
    let surface: GridSurface | null = null;
    if (typeof document !== 'undefined') {
      surface = document.createElement('canvas');
      surface.width = grid.width;
      surface.height = grid.height;
    } else if (typeof OffscreenCanvas !== 'undefined') {
      surface = new OffscreenCanvas(grid.width, grid.height);
    }
    const sctx = surface?.getContext('2d') as CanvasRenderingContext2D | null | undefined;
    if (!surface || !sctx) return null;
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x < grid.width; x++) {
        const color = grid.cells[y * grid.width + x];
        if (!color) continue;
        sctx.fillStyle = color;
        sctx.fillRect(x, y, 1, 1);
      }
    }
    return surface;
  } catch {
    return null;
  }
}

interface CachedArt {
  grid: PixelGrid;
  surface: GridSurface | null;
}

function makeCachedArt(grid: PixelGrid): CachedArt {
  return { grid, surface: gridToSurface(grid) };
}

/** Lukis sprite tembolok pada (x, y) dunia dengan skala; cadangan: sel per sel. */
function blitArt(
  ctx: CanvasRenderingContext2D,
  art: CachedArt,
  x: number,
  y: number,
  scale: number
): void {
  const { grid, surface } = art;
  if (surface) {
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(surface, x, y, grid.width * scale, grid.height * scale);
    return;
  }
  for (let gy = 0; gy < grid.height; gy++) {
    for (let gx = 0; gx < grid.width; gx++) {
      const color = grid.cells[gy * grid.width + gx];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + gx * scale, y + gy * scale, scale, scale);
    }
  }
}

const furnitureArtCache = new WeakMap<LabFurniture, CachedArt & { sprite: FurnitureSprite }>();
const decorArtCache = new Map<DecorKind, CachedArt>();
const plaqueArtCache = new Map<string, CachedArt>();
const decorListCache = new WeakMap<LabMapData, Map<ConsultationDoorMode, readonly DecorItem[]>>();

function furnitureArtFor(item: LabFurniture): CachedArt & { sprite: FurnitureSprite } {
  let hit = furnitureArtCache.get(item);
  if (!hit) {
    const sprite = paintFurniture(item);
    hit = { ...makeCachedArt(sprite.grid), sprite };
    furnitureArtCache.set(item, hit);
  }
  return hit;
}

function decorArtFor(kind: DecorKind): CachedArt {
  let hit = decorArtCache.get(kind);
  if (!hit) {
    hit = makeCachedArt(paintDecor(kind));
    decorArtCache.set(kind, hit);
  }
  return hit;
}

function plaqueArtFor(label: string, highlighted: boolean): CachedArt {
  const key = `${highlighted ? 1 : 0}|${label}`;
  let hit = plaqueArtCache.get(key);
  if (!hit) {
    hit = makeCachedArt(paintPlaque(label, { highlighted }));
    plaqueArtCache.set(key, hit);
  }
  return hit;
}

function floorDecorFor(map: LabMapData, doorMode: ConsultationDoorMode): readonly DecorItem[] {
  let byMode = decorListCache.get(map);
  if (!byMode) {
    byMode = new Map();
    decorListCache.set(map, byMode);
  }
  let list = byMode.get(doorMode);
  if (!list) {
    try {
      list = buildDecor(map, buildTileGrid(map, doorMode)).filter((d) => d.placement === 'lantai');
    } catch {
      list = [];
    }
    byMode.set(doorMode, list);
  }
  return list;
}

// ---------------------------------------------------------------------------
// Cadangan lantai datar (bila kanvas tilemap tak tersedia)
// ---------------------------------------------------------------------------

function drawFlatBackdrop(
  ctx: CanvasRenderingContext2D,
  map: LabMapData,
  palette: Palette,
  doorMode: ConsultationDoorMode
): void {
  const t = map.tileSizePx;
  ctx.fillStyle = palette.floor;
  ctx.fillRect(0, 0, map.width * t, map.height * t);
  ctx.fillStyle = palette.corridor;
  ctx.fillRect(1 * t, 9 * t, (map.width - 2) * t, 2 * t);
  ctx.fillRect(28 * t, 11 * t, 2 * t, 12 * t);
  ctx.fillRect(28 * t, 16 * t, 12 * t, 2 * t);

  for (const zone of map.zones) {
    ctx.fillStyle = palette.zoneColors[zone.id] ?? palette.floor;
    ctx.fillRect(zone.bounds.x * t, zone.bounds.y * t, zone.bounds.w * t, zone.bounds.h * t);
  }
  for (const div of map.lowDividers) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(div.x * t + 2, div.y * t + t * 0.35, div.w * t - 4, div.h * t * 0.3);
  }
  for (const wall of map.walls) {
    ctx.fillStyle = palette.wall;
    ctx.fillRect(wall.x * t, wall.y * t, wall.w * t, wall.h * t);
    ctx.fillStyle = palette.wallTop;
    ctx.fillRect(wall.x * t, wall.y * t, wall.w * t, Math.min(4, wall.h * t));
  }
  for (const door of map.doors) {
    if (door.mode !== undefined && door.mode !== doorMode) {
      for (const tile of door.tiles) {
        ctx.fillStyle = palette.wall;
        ctx.fillRect(tile.x * t, tile.y * t, t, t);
        ctx.fillStyle = palette.wallTop;
        ctx.fillRect(tile.x * t, tile.y * t, t, 4);
      }
      continue;
    }
    const isConsultDoor = door.zoneId === 'konsultasi';
    const doorColor = isConsultDoor
      ? doorMode === 'lab'
        ? palette.doorVisible
        : palette.doorSide
      : palette.furnitureStroke;
    for (const tile of door.tiles) {
      drawDoor(ctx, tile.x, tile.y, t, door.orientation, doorColor, isConsultDoor);
    }
  }
}

// ---------------------------------------------------------------------------
// Efek atmosfer cahaya matahari dinamis & riak klik kanvas
// ---------------------------------------------------------------------------

function drawDaylightAtmosphere(
  ctx: CanvasRenderingContext2D,
  worldW: number,
  worldH: number,
  clockMinutesOfDay: number,
  timeSeconds: number,
  reducedMotion: boolean
): void {
  const isMorning = clockMinutesOfDay < 660;
  const isLateAfternoon = clockMinutesOfDay >= 870;

  ctx.save();
  // Hanya tampilkan debu cahaya emas mikro saat bergerak (tanpa kabut putih/balok sinar putih yang membuat lantai silau!)
  if (!reducedMotion) {
    const moteColor = isLateAfternoon ? '248, 198, 96' : isMorning ? '255, 232, 162' : '255, 240, 185';
    for (let i = 0; i < 12; i += 1) {
      const seed = i * 73.13;
      const baseX = ((seed * 19.7) % worldW + worldW) % worldW;
      const baseY = ((seed * 31.3) % worldH + worldH) % worldH;
      const driftX = (baseX + timeSeconds * (4.5 + (i % 4) * 1.8) + Math.sin(timeSeconds + i) * 5) % worldW;
      const driftY = (baseY - timeSeconds * (2.2 + (i % 3) * 1.2) + worldH * 10) % worldH;
      const pulseAlpha = 0.12 + 0.16 * (0.5 + 0.5 * Math.sin(timeSeconds * 1.7 + i * 1.4));
      const r = 1.0 + (i % 3) * 0.45;
      ctx.fillStyle = `rgba(${moteColor}, ${pulseAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(driftX, driftY, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawClickRipple(
  ctx: CanvasRenderingContext2D,
  ripple: ClickRippleState | null | undefined,
  timeSeconds: number,
  reducedMotion: boolean
): void {
  if (!ripple) return;
  const elapsed = timeSeconds - ripple.startedAtSec;
  const duration = reducedMotion ? 0.32 : 0.65;
  if (elapsed < 0 || elapsed >= duration) return;

  const progress = elapsed / duration;
  const ease = reducedMotion ? 0.45 : 1 - (1 - progress) * (1 - progress);
  const alpha = Math.max(0, 1 - progress);

  ctx.save();
  // Cincin luar emas-kuningan
  ctx.strokeStyle = `rgba(229, 172, 63, ${(alpha * 0.92).toFixed(3)})`;
  ctx.lineWidth = 2.4 * (1 - progress * 0.45);
  ctx.beginPath();
  ctx.ellipse(ripple.x, ripple.y, 7 + ease * 24, 3.5 + ease * 11, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Cincin dalam biru-toska tajam
  ctx.strokeStyle = `rgba(23, 126, 152, ${(alpha * 0.78).toFixed(3)})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(ripple.x, ripple.y, 3 + ease * 14, 1.8 + ease * 6.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawWorldPopups(
  ctx: CanvasRenderingContext2D,
  popups: readonly WorldPopup[] | undefined,
  timeSeconds: number,
  reducedMotion: boolean
): void {
  if (!popups || popups.length === 0) return;
  const duration = reducedMotion ? 1.2 : 2.1;

  ctx.save();
  ctx.font = '700 10px Fredoka, Plus Jakarta Sans, ui-sans-serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const p of popups) {
    const elapsed = timeSeconds - p.startedAtSec;
    if (elapsed < 0 || elapsed >= duration) continue;
    const progress = elapsed / duration;
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const lift = reducedMotion ? 14 : 6 + easeOut * 28;
    const alpha = progress < 0.68 ? 1 : Math.max(0, 1 - (progress - 0.68) / 0.32);

    const cx = p.x;
    const cy = p.y - lift;
    const tw = ctx.measureText(p.text).width;
    const bw = tw + 14;
    const bh = 18;
    const bx = cx - bw / 2;
    const by = cy - bh / 2;

    ctx.globalAlpha = alpha;
    ctx.fillStyle =
      p.tone === 'gold' ? '#ffe694' : p.tone === 'teal' ? '#d8faef' : '#fee2e2';
    ctx.strokeStyle = '#3e2517';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 9);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle =
      p.tone === 'gold' ? '#3e2517' : p.tone === 'teal' ? '#165442' : '#991b1b';
    ctx.fillText(p.text, cx, cy + 0.5);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Render utama
// ---------------------------------------------------------------------------

export function renderLabCanvas(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  widthCss: number,
  heightCss: number,
  input: LabRenderInput
): void {
  const {
    map,
    camera,
    viewOptions,
    hoveredZoneId,
    selectedZoneId,
    agents,
    selectedAgentId,
    hoveredAgentId,
    devPathTest,
    clockMinutesOfDay,
  } = input;
  const palette = readPalette(canvas, map);
  const t = map.tileSizePx;
  const worldW = map.width * t;
  const worldH = map.height * t;
  const doorMode: ConsultationDoorMode = viewOptions.consultationDoorMode;

  const timeSec = input.timeSeconds ?? 0;
  const reduced = input.reducedMotion ?? false;
  const weatherMode: CampusWeatherMode = input.weatherMode ?? 'otomatis';
  const sun = computeSunLighting(clockMinutesOfDay, weatherMode);

  // 1. Halaman Kampus Hidup 2.5D di luar gedung (rumput sunlit sesuai jam/cuaca, kolam koi, jalan batu, pohon bergoyang)
  drawOutdoorCampusCourtyard(
    ctx,
    widthCss,
    heightCss,
    camera,
    map,
    timeSec,
    reduced,
    clockMinutesOfDay,
    weatherMode
  );

  ctx.save();
  ctx.translate(camera.offsetX, camera.offsetY);
  ctx.scale(camera.scale, camera.scale);

  // 2. Denah gedung 2.5D Ilustrasi HD (bebas pixel kasar!); cadangan tilemap/datar jika offscreen tidak ada
  const illustratedBg = getIllustratedLabBackdrop(map, doorMode);
  if (illustratedBg) {
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(illustratedBg, 0, 0, worldW, worldH);
    // Hiasan Ruang BK yang dibeli pemain langsung tampak hidup di dalam peta 2D!
    drawEquippedBkDecorOnMap(ctx, map, input.equippedDecor, timeSec, reduced);
  } else {
    const tilemap = getTilemapCanvas(map, doorMode);
    if (tilemap) {
      drawTilemap(ctx, tilemap, map);
    } else {
      drawFlatBackdrop(ctx, map, palette, doorMode);
    }
  }

  // 3. Sorot zona (terpilih/hover) dan slot berdiri (hanya saat grid aktif)
  for (const zone of map.zones) {
    const zx = zone.bounds.x * t;
    const zy = zone.bounds.y * t;
    const zw = zone.bounds.w * t;
    const zh = zone.bounds.h * t;
    const isSelected = selectedZoneId === zone.id;
    const isHovered = hoveredZoneId === zone.id;
    if (isSelected || isHovered) {
      ctx.fillStyle = isSelected ? 'rgba(29, 93, 122, 0.10)' : 'rgba(100, 116, 139, 0.08)';
      ctx.fillRect(zx, zy, zw, zh);
      ctx.strokeStyle = isSelected ? palette.accent : '#64748b';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.strokeRect(zx + 1, zy + 1, zw - 2, zh - 2);
    }
  }

  if (viewOptions.showGrid) {
    ctx.strokeStyle = palette.grid;
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

    for (const zone of map.zones) {
      for (const slot of zone.standingSlots) {
        const cx = (slot.x + 0.5) * t;
        const cy = (slot.y + 0.5) * t;
        ctx.strokeStyle = palette.slot;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
        ctx.fill();
      }
    }
  }

  // 4. Jejak uji A* (hanya saat Panel Dev menguji teleport & jalan)
  if (devPathTest && devPathTest.active && devPathTest.path.length > 0) {
    ctx.save();
    ctx.strokeStyle = palette.pathColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    devPathTest.path.forEach((pt, idx) => {
      const px = (pt.x + 0.5) * t;
      const py = (pt.y + 0.5) * t;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc((devPathTest.start.x + 0.5) * t, (devPathTest.start.y + 0.5) * t, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = palette.pathColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(
      (devPathTest.targetSlot.x + 0.5) * t,
      (devPathTest.targetSlot.y + 0.5) * t,
      7,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    ctx.fillStyle = palette.agentTestColor;
    ctx.beginPath();
    ctx.arc(
      (devPathTest.currentPos.x + 0.5) * t,
      (devPathTest.currentPos.y + 0.5) * t,
      7.5,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // 5. Garis interaksi dan rute (di bawah semua sprite)
  const story = input.story;
  const storyOpts: StoryRenderOptions | null = story
    ? {
        ...story,
        camera,
        tileSizePx: t,
        agents,
        clockMinutesOfDay,
        weatherMode,
      }
    : null;
  drawInteractionLines(
    ctx,
    agents,
    t,
    input.timeSeconds ?? 0,
    input.reducedMotion ?? false
  );
  if (storyOpts) drawRouteLine(ctx, storyOpts);

  // 6. Perabot, dekor lantai, agen, avatar, dan pendamping menurut y dasar
  const agentById = new Map<string, StudentAgent>();
  for (const a of agents) agentById.set(a.id, a);

  const avatar = storyOpts?.avatar ?? null;
  const companionPos = avatar ? companionPosition(avatar) : null;
  const companionId = avatar?.companion?.agentId ?? null;
  const companion =
    companionPos && companionId ? { id: companionId, x: companionPos.x, y: companionPos.y } : null;
  // Agen pendamping digambar lewat jalur pendamping; hindari sprite ganda.
  const visibleAgents = companion ? agents.filter((a) => a.id !== companion.id) : agents;

  const avatarIdlePosition =
    avatar && avatar.mode === 'idle' ? { x: avatar.position.x, y: avatar.position.y } : null;
  const agentOptions: AgentRenderOptions = {
    tileSizePx: t,
    camera,
    selectedAgentId,
    hoveredAgentId,
    timeSeconds: input.timeSeconds,
    reducedMotion: input.reducedMotion,
    clockMinutesOfDay,
    weatherMode,
    avatarIdlePosition,
  };

  const furnitureById = new Map<string, LabFurniture>();
  for (const f of map.furniture) furnitureById.set(f.id, f);

  const drawList = buildDrawList(
    map.furniture,
    visibleAgents,
    avatar ? avatar.position : null,
    companion,
    t
  );

  // Dekor & perabot digambar dengan gaya Ilustrasi 2.5D HD menyatu bersama chibi!
  const useIllustrated = Boolean(illustratedBg);
  const floorDecor = useIllustrated ? [] : floorDecorFor(map, doorMode);
  type Entry =
    | { type: 'draw'; baseY: number; item: (typeof drawList)[number] }
    | { type: 'decor'; baseY: number; decor: DecorItem };
  const entries: Entry[] = [
    ...floorDecor.map((d): Entry => ({ type: 'decor', baseY: (d.tile.y + 1) * t, decor: d })),
    ...drawList.map((item): Entry => ({ type: 'draw', baseY: item.baseY, item })),
  ];
  entries.sort((a, b) => a.baseY - b.baseY || (a.type === b.type ? 0 : a.type === 'decor' ? -1 : 1));

  for (const entry of entries) {
    if (entry.type === 'decor') {
      const art = decorArtFor(entry.decor.kind);
      blitArt(
        ctx,
        art,
        entry.decor.tile.x * t,
        (entry.decor.tile.y + 1) * t - art.grid.height * ART_SCALE,
        ART_SCALE
      );
      continue;
    }
    const item = entry.item;
    if (item.kind === 'perabot') {
      const f = furnitureById.get(item.id);
      if (!f) continue;
      if (useIllustrated) {
        drawIllustratedFurniture(ctx, f, t, timeSec, reduced);
      } else {
        const art = furnitureArtFor(f);
        const fx = f.rect.x * t;
        const fy = (f.rect.y + f.rect.h) * t - art.grid.height * ART_SCALE;
        blitArt(ctx, art, fx, fy, ART_SCALE);
        if (f.kind === 'printer-3d') {
          const led = PRINTER_LED_RECT;
          ctx.fillStyle = printerLedColor(clockMinutesOfDay, printerUnitIndex(f.id));
          ctx.fillRect(
            fx + led.x * ART_SCALE,
            fy + led.y * ART_SCALE,
            led.w * ART_SCALE,
            led.h * ART_SCALE
          );
        }
      }
    } else if (item.kind === 'agen') {
      const agent = agentById.get(item.id);
      if (agent) drawAgentSprite(ctx, agent, agentById, agentOptions);
    } else if (item.kind === 'avatar') {
      if (storyOpts) drawAvatar(ctx, storyOpts);
    } else if (item.kind === 'pendamping') {
      if (storyOpts) drawCompanion(ctx, storyOpts);
    }
  }

  // 6b. Pencahayaan Titik Dinamis 2D (Dynamic Point Lights & Emissive Bloom) di 11 ruangan
  if (useIllustrated) {
    const pointLights = collectMapPointLights(
      map,
      input.equippedDecor,
      clockMinutesOfDay,
      timeSec,
      reduced,
      weatherMode
    );
    drawDynamicPointLights(ctx, worldW, worldH, pointLights, sun.duskShade);
  }

  // 7. Overlay setelah semua sprite: status, balon, nama, penanda misi
  const bubbles = computeAgentBubbles(visibleAgents, agentOptions);
  const overlayOrder = [...visibleAgents].sort(
    (a, b) => spriteFeet(a.position, t).y - spriteFeet(b.position, t).y
  );
  for (const agent of overlayOrder) {
    drawAgentOverlays(ctx, agent, agentOptions, bubbles.get(agent.id) ?? null);
  }
  if (storyOpts) {
    for (const agent of overlayOrder) drawAgentMarkers(ctx, agent, storyOpts);
  }

  // 8. Plakat zona ilustrasi bersih & lencana pintu Konsultasi
  if (viewOptions.showZoneLabels) {
    for (const zone of map.zones) {
      if (useIllustrated) {
        drawIllustratedZoneLabel(ctx, zone, t, selectedZoneId === zone.id);
      } else {
        const art = plaqueArtFor(zone.shortLabel, selectedZoneId === zone.id);
        const pw = art.grid.width * PLAQUE_SCALE;
        const ph = art.grid.height * PLAQUE_SCALE;
        const cx = (zone.bounds.x + zone.bounds.w / 2) * t;
        const cy = (zone.bounds.y + zone.bounds.h - 0.55) * t;
        const px = Math.min(Math.max(0, Math.round(cx - pw / 2)), Math.max(0, worldW - pw));
        blitArt(ctx, art, px, Math.round(cy - ph / 2), PLAQUE_SCALE);
      }
    }

    ctx.font = '700 9.5px Fredoka, ui-sans-serif, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const doorBadgeText = doorMode === 'lab' ? '🚪 Pintu Lab' : '🚪 Pintu Samping';
    const doorBadgeX = doorMode === 'lab' ? 28.4 * t : 35.8 * t;
    const doorBadgeY = doorMode === 'lab' ? 13.5 * t : 16.5 * t;
    const bw = ctx.measureText(doorBadgeText).width + 12;
    ctx.fillStyle = doorMode === 'lab' ? '#fff3cc' : '#dcfbf3';
    ctx.strokeStyle = '#3e2517';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(doorBadgeX - bw / 2, doorBadgeY - 8.5, bw, 17, 8.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = doorMode === 'lab' ? '#78350f' : '#134e4a';
    ctx.fillText(doorBadgeText, doorBadgeX, doorBadgeY + 0.5);
  }

  // 9. Cahaya matahari dinamis (pagi/siang/sore), debu cahaya, riak klik, & teks pop-up dunia
  drawDaylightAtmosphere(ctx, worldW, worldH, clockMinutesOfDay, timeSec, reduced);
  drawClickRipple(ctx, input.clickRipple, timeSec, reduced);
  drawWorldPopups(ctx, input.worldPopups, timeSec, reduced);

  ctx.restore();

  // 10. Partikel hidup halaman luar (awan melintas, kelopak/daun, kupu-kupu, atau hujan rintik + riak air)
  drawOutdoorAmbientParticles(ctx, widthCss, heightCss, camera, map, timeSec, reduced, weatherMode);
}
