import type { StudentAgent } from '../../types';
import type { StoryOutcomeKind } from '../../engine/story/storyTypes';
import { companionPosition, type AvatarState } from '../../engine/story/avatar';
import type { CameraTransform } from './labRenderer';
import { drawSprite } from '../characters/spriteCanvas';
import { phaseOffsetFor, selectFrame } from '../characters/animation';
import type { Direction, PixelGrid } from '../characters/pixelGrid';
import { paintPlaque } from '../world/plaque';
import {
  SPRITE_WORLD_H,
  SPRITE_WORLD_W,
  spriteFeet,
} from '../world/worldMetrics';

/**
 * Lapisan cerita di denah: avatar Dosen BK (sprite), penanda misi,
 * pendamping (sprite mahasiswa), lencana hasil sementara, dan garis rute.
 * Fungsi gambar diekspor terpisah agar `labRenderer` dapat menyisipkannya
 * menurut y dasar; `renderStoryLayer` tetap menggambar semuanya sekaligus.
 * Koordinat dalam piksel dunia; kamera diterapkan pemanggil.
 */

export interface StoryRenderOptions {
  camera: CameraTransform;
  tileSizePx: number;
  avatar: AvatarState;
  agents: readonly StudentAgent[];
  /** Id mahasiswa dengan misi aktif. */
  missionAgentIds: ReadonlySet<string> | readonly string[];
  /** Lencana hasil sementara per id mahasiswa (selama satu hari simulasi). */
  outcomeBadges: Readonly<Record<string, StoryOutcomeKind>>;
  reducedMotion: boolean;
  timeSeconds: number;
}

/** Id sprite untuk avatar Dosen BK. */
export const DOSEN_SPRITE_ID = 'dosen';
const PLAQUE_SCALE = 2;

function clamp01(v: number): number {
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
}

/** Denyut 0..1; konstan 0 saat gerak dikurangi. */
function pulse(opts: StoryRenderOptions, periodSeconds: number): number {
  if (opts.reducedMotion) return 0;
  return 0.5 + 0.5 * Math.sin((opts.timeSeconds / periodSeconds) * Math.PI * 2);
}

function toWorld(p: { x: number; y: number }, t: number): { x: number; y: number } {
  return { x: (p.x + 0.5) * t, y: (p.y + 0.5) * t };
}

function paintGrid(
  ctx: CanvasRenderingContext2D,
  grid: PixelGrid,
  left: number,
  top: number,
  scale: number
): void {
  for (let y = 0; y < grid.height; y++) {
    for (let x = 0; x < grid.width; x++) {
      const color = grid.cells[y * grid.width + x];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(left + x * scale, top + y * scale, scale, scale);
    }
  }
}

function directionToward(
  from: { x: number; y: number },
  to: { x: number; y: number } | undefined
): Direction {
  if (!to) return 'bawah';
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return 'bawah';
  if (Math.abs(dx) >= Math.abs(dy)) return dx < 0 ? 'kiri' : 'kanan';
  return dy < 0 ? 'atas' : 'bawah';
}

function avatarWalking(avatar: AvatarState): boolean {
  return avatar.mode === 'menuju-mahasiswa' || avatar.mode === 'berdua-ke-bk';
}

/** Arah avatar dari langkah berikutnya pada path; 'bawah' bila diam. */
function avatarFacing(avatar: AvatarState): Direction {
  if (!avatarWalking(avatar)) return 'bawah';
  const next = avatar.path[Math.min(Math.max(avatar.stepIndex, 0), avatar.path.length - 1)];
  return directionToward(avatar.position, next);
}

// ---------------------------------------------------------------------------
// Debu langkah kaki chibi saat berjalan (deterministik, non-aktif saat reducedMotion)
// ---------------------------------------------------------------------------

function drawFootstepPuffs(
  ctx: CanvasRenderingContext2D,
  feet: { x: number; y: number },
  dir: Direction,
  timeSeconds: number,
  reducedMotion: boolean,
  seedOffset: number
): void {
  if (reducedMotion) return;
  const dx = dir === 'kanan' ? -1 : dir === 'kiri' ? 1 : 0;
  const dy = dir === 'bawah' ? -1 : dir === 'atas' ? 1 : 0;
  ctx.save();
  for (let i = 0; i < 3; i += 1) {
    const cycle = (timeSeconds * 3.1 + seedOffset + i * 0.33) % 1;
    const dist = 5 + cycle * 13;
    const spread = Math.sin((i + seedOffset) * 2.7) * 3.5;
    const px = feet.x + dx * dist + (dx === 0 ? spread : 0);
    const py = feet.y - 2 + dy * dist * 0.65 - cycle * 3.5;
    const radius = 2.4 + cycle * 2.2;
    const alpha = Math.max(0, (1 - cycle) * 0.45);
    ctx.fillStyle = `rgba(248, 241, 224, ${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Garis rute bercahaya dengan animasi gerak & suar tujuan
// ---------------------------------------------------------------------------

export function drawRouteLine(ctx: CanvasRenderingContext2D, opts: StoryRenderOptions): void {
  const { avatar, tileSizePx: t } = opts;
  if (avatar.mode !== 'menuju-mahasiswa' || avatar.path.length < 2) return;
  const from = Math.min(Math.max(avatar.stepIndex, 0), avatar.path.length - 1);

  const start = toWorld(avatar.position, t);
  const end = toWorld(avatar.path[avatar.path.length - 1], t);

  const tracePath = () => {
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    for (let i = from + 1; i < avatar.path.length; i++) {
      const p = toWorld(avatar.path[i], t);
      ctx.lineTo(p.x, p.y);
    }
  };

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Jalur luar biru-dongker/toska halus
  ctx.strokeStyle = 'rgba(15, 27, 51, 0.28)';
  ctx.lineWidth = 4.6;
  tracePath();
  ctx.stroke();

  // Jejak emas-gading bergerak menuntun arah jalan
  ctx.strokeStyle = 'rgba(253, 224, 132, 0.92)';
  ctx.lineWidth = 2.2;
  ctx.setLineDash([6, 6]);
  ctx.lineDashOffset = opts.reducedMotion ? 0 : -opts.timeSeconds * 24;
  tracePath();
  ctx.stroke();

  // Ujung rute: suar cincin berdenyut di lantai tujuan
  const p = pulse(opts, 1.3);
  ctx.setLineDash([]);
  ctx.lineDashOffset = 0;
  ctx.strokeStyle = `rgba(229, 172, 63, ${(0.5 + 0.45 * (1 - p)).toFixed(3)})`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(end.x, end.y + 4, 8 + 5 * p, 3.8 + 2.2 * p, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#0f1b33';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(end.x, end.y - 1);
  ctx.lineTo(end.x + 4, end.y + 3);
  ctx.lineTo(end.x, end.y + 7);
  ctx.lineTo(end.x - 4, end.y + 3);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Penanda misi: belah ketupat emas berkilau + aura + tanda seru
// ---------------------------------------------------------------------------

export function drawMissionMarker(
  ctx: CanvasRenderingContext2D,
  agent: Pick<StudentAgent, 'position'> & { energy?: number },
  opts: StoryRenderOptions
): void {
  const feet = spriteFeet(agent.position, opts.tileSizePx);
  const cx = feet.x;
  const isCritical = typeof agent.energy === 'number' && agent.energy < 0.35;
  const bob = opts.reducedMotion ? 0 : Math.sin(opts.timeSeconds * (isCritical ? 5.2 : 3.4)) * (isCritical ? 2.4 : 1.8);
  const glow = pulse(opts, isCritical ? 0.95 : 1.6);
  const r = isCritical ? 7.2 : 6.2;
  const my = feet.y - SPRITE_WORLD_H - r - 3.5 + bob;

  ctx.save();
  // Aura emas (atau merah-kritis berdenyut bila energi mahasiswa < 35%)
  ctx.fillStyle = isCritical
    ? `rgba(239, 68, 68, ${(0.24 + 0.28 * glow).toFixed(3)})`
    : `rgba(250, 204, 21, ${(0.18 + 0.16 * glow).toFixed(3)})`;
  ctx.beginPath();
  ctx.arc(cx, my, r + (isCritical ? 4.8 : 3.2) + glow * (isCritical ? 2.8 : 1.6), 0, Math.PI * 2);
  ctx.fill();

  const grad = ctx.createLinearGradient(cx, my - r, cx, my + r);
  if (isCritical) {
    grad.addColorStop(0, '#fca5a5');
    grad.addColorStop(0.5, '#ef4444');
    grad.addColorStop(1, '#991b1b');
  } else {
    grad.addColorStop(0, '#fef08a');
    grad.addColorStop(0.55, '#f5b82e');
    grad.addColorStop(1, '#d98812');
  }

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#0f1b33';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, my - r);
  ctx.lineTo(cx + r, my);
  ctx.lineTo(cx, my + r);
  ctx.lineTo(cx - r, my);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Kilau spekular tipis di sisi kiri atas belah ketupat
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.beginPath();
  ctx.moveTo(cx, my - r + 1.5);
  ctx.lineTo(cx - r + 2.2, my);
  ctx.lineTo(cx - 1.5, my - 0.6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = isCritical ? '#ffffff' : '#0f1b33';
  ctx.beginPath();
  ctx.roundRect(cx - 0.9, my - 3.6, 1.8, 4.1, 0.9);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, my + 2.5, 1.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Lencana hasil sementara
// ---------------------------------------------------------------------------

function drawBadgeGlyph(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  kind: StoryOutcomeKind
): void {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  if (kind === 'terbantu') {
    ctx.moveTo(x - 2.4, y + 0.2);
    ctx.lineTo(x - 0.7, y + 1.9);
    ctx.lineTo(x + 2.6, y - 1.9);
  } else if (kind === 'kemajuan-kecil') {
    ctx.moveTo(x, y + 2.4);
    ctx.lineTo(x, y - 2.4);
    ctx.moveTo(x - 2.2, y - 0.2);
    ctx.lineTo(x, y - 2.4);
    ctx.lineTo(x + 2.2, y - 0.2);
  } else {
    ctx.moveTo(x - 1.4, y - 2.2);
    ctx.lineTo(x - 1.4, y + 2.2);
    ctx.moveTo(x + 1.4, y - 2.2);
    ctx.lineTo(x + 1.4, y + 2.2);
  }
  ctx.stroke();
}

function drawMiniBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  value: number,
  color: string
): void {
  ctx.fillStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 2.6, 1.3);
  ctx.fill();
  const fw = Math.max(1.3, w * clamp01(value));
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, fw, 2.6, 1.3);
  ctx.fill();
}

export function drawOutcomeBadge(
  ctx: CanvasRenderingContext2D,
  agent: StudentAgent,
  kind: StoryOutcomeKind,
  tileSizePx: number
): void {
  const feet = spriteFeet(agent.position, tileSizePx);
  const cx = feet.x;
  const midY = feet.y - SPRITE_WORLD_H / 2;
  const color =
    kind === 'terbantu' ? '#15803d' : kind === 'kemajuan-kecil' ? '#0369a1' : '#b45309';

  ctx.save();
  // Cincin di kaki sprite
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.ellipse(cx, feet.y - 1, SPRITE_WORLD_W / 2 - 4, 7, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Glif di sudut kiri atas kepala
  const gx = cx - SPRITE_WORLD_W / 2 + 4;
  const gy = feet.y - SPRITE_WORLD_H + 4;
  ctx.fillStyle = color;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(gx, gy, 4.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  drawBadgeGlyph(ctx, gx, gy, kind);

  // Dua bilah mini di samping kanan: energi (atas), stres (bawah)
  const bw = 14;
  const bx = cx + SPRITE_WORLD_W / 2 + 2;
  const by = midY - 4;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.roundRect(bx - 1.5, by - 1.5, bw + 3, 8.2, 2);
  ctx.fill();
  drawMiniBar(ctx, bx, by, bw, agent.energy, '#16a34a');
  drawMiniBar(ctx, bx, by + 3.4, bw, agent.stress, '#d97706');
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Avatar Dosen BK (sprite) dan pendamping
// ---------------------------------------------------------------------------

/** Menggambar avatar Dosen BK: cincin kompas emas-toska, debu langkah, bayangan, sprite 48 px, plakat. */
export function drawAvatar(ctx: CanvasRenderingContext2D, opts: StoryRenderOptions): void {
  const { avatar } = opts;
  const feet = spriteFeet(avatar.position, opts.tileSizePx);
  const idle = avatar.mode === 'idle';
  const walking = avatarWalking(avatar);
  const dir = avatarFacing(avatar);

  ctx.save();

  // Cincin kompas emas-toska saat idle (statis bila gerak dikurangi)
  if (idle) {
    const p = pulse(opts, 1.8);
    ctx.strokeStyle = `rgba(15, 118, 110, ${(0.35 + 0.35 * (opts.reducedMotion ? 0.5 : 1 - p)).toFixed(3)})`;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.ellipse(feet.x, feet.y - 1, 16.5 + 3.2 * p, 7.2 + 1.5 * p, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(229, 172, 63, 0.72)';
    ctx.lineWidth = 1.25;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.ellipse(feet.x, feet.y - 1, 13.5, 5.8, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (walking) {
    drawFootstepPuffs(ctx, feet, dir, opts.timeSeconds, opts.reducedMotion, 0.1);
  }

  // Bayangan
  ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
  ctx.beginPath();
  ctx.ellipse(feet.x, feet.y - 0.5, 11.5, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();

  const choice = selectFrame({
    moving: walking,
    timeSeconds: opts.timeSeconds,
    reducedMotion: opts.reducedMotion,
    phaseOffset: phaseOffsetFor(DOSEN_SPRITE_ID),
  });
  drawSprite(ctx, {
    studentId: DOSEN_SPRITE_ID,
    dir,
    anim: choice.anim,
    frame: choice.frame,
    x: feet.x,
    y: feet.y,
    width: SPRITE_WORLD_W,
    fallback: { hairStyle: 'pendek', avatarHue: 190 },
  });

  // Plakat pixel "Dosen BK" di atas kepala
  const plaque = paintPlaque('Dosen BK', { highlighted: false });
  const pw = plaque.width * PLAQUE_SCALE;
  const ph = plaque.height * PLAQUE_SCALE;
  paintGrid(
    ctx,
    plaque,
    Math.round(feet.x - pw / 2),
    Math.round(feet.y - SPRITE_WORLD_H - ph - 2),
    PLAQUE_SCALE
  );

  ctx.restore();
}

/** Menggambar pendamping memakai sprite mahasiswa terkait; no-op bila tidak ada pendamping. */
export function drawCompanion(ctx: CanvasRenderingContext2D, opts: StoryRenderOptions): void {
  const { avatar, tileSizePx: t, agents } = opts;
  const pos = companionPosition(avatar);
  if (!pos || !avatar.companion) return;
  const agent = agents.find((a) => a.id === avatar.companion!.agentId);
  const feet = spriteFeet(pos, t);
  const walking = avatar.mode === 'berdua-ke-bk';
  const companionId = avatar.companion.agentId;
  const dir = walking ? avatarFacing(avatar) : 'bawah';

  ctx.save();
  if (walking) {
    drawFootstepPuffs(ctx, feet, dir, opts.timeSeconds, opts.reducedMotion, 0.55);
  }

  ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
  ctx.beginPath();
  ctx.ellipse(feet.x, feet.y - 0.5, 10.8, 3.9, 0, 0, Math.PI * 2);
  ctx.fill();

  const choice = selectFrame({
    moving: walking,
    timeSeconds: opts.timeSeconds,
    reducedMotion: opts.reducedMotion,
    phaseOffset: phaseOffsetFor(companionId),
  });
  drawSprite(ctx, {
    studentId: companionId,
    dir,
    anim: choice.anim,
    frame: choice.frame,
    x: feet.x,
    y: feet.y,
    width: SPRITE_WORLD_W,
    fallback: {
      hairStyle: agent ? agent.demographicLabel.hairStyle : 'pendek',
      avatarHue: agent ? agent.demographicLabel.avatarHue : 200,
    },
  });

  // Tanda berjalan bersama: cincin putus-putus emas-toska di kaki
  ctx.strokeStyle = 'rgba(229, 172, 63, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 2.5]);
  ctx.beginPath();
  ctx.ellipse(feet.x, feet.y - 1, 16, 7, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Titik masuk
// ---------------------------------------------------------------------------

function missionSet(opts: StoryRenderOptions): ReadonlySet<string> {
  return opts.missionAgentIds instanceof Set
    ? opts.missionAgentIds
    : new Set(opts.missionAgentIds as readonly string[]);
}

/** Lencana hasil dan penanda misi satu agen (tidak menggambar agen pendamping). */
export function drawAgentMarkers(
  ctx: CanvasRenderingContext2D,
  agent: StudentAgent,
  opts: StoryRenderOptions
): void {
  if (agent.id === (opts.avatar.companion?.agentId ?? null)) return;
  const kind = opts.outcomeBadges[agent.id];
  if (kind) drawOutcomeBadge(ctx, agent, kind, opts.tileSizePx);
  if (missionSet(opts).has(agent.id)) drawMissionMarker(ctx, agent, opts);
}

/**
 * Menggambar seluruh lapisan cerita sekaligus (tanpa penyisipan y).
 * Panggil setelah `renderAgentsLayer` dengan ctx berkamera.
 */
export function renderStoryLayer(
  ctx: CanvasRenderingContext2D,
  opts: StoryRenderOptions
): void {
  ctx.save();
  drawRouteLine(ctx, opts);
  for (const agent of opts.agents) drawAgentMarkers(ctx, agent, opts);
  drawCompanion(ctx, opts);
  drawAvatar(ctx, opts);
  ctx.restore();
}
