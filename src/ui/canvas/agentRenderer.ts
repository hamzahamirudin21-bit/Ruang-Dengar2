import type { StudentAgent } from '../../types';
import type { CameraTransform } from './labRenderer';
import { drawSprite } from '../characters/spriteCanvas';
import { facingOf, isWalking, phaseOffsetFor, selectFrame } from '../characters/animation';
import {
  SPRITE_WORLD_H,
  SPRITE_WORLD_W,
  hitTestAgents,
  spriteFeet,
} from '../world/worldMetrics';
import {
  bubbleFor,
  selectBubbles,
  type BubbleSpec,
} from '../world/speechBubble';
import { computeSunLighting, type CampusWeatherMode } from '../gpu/sunLighting';

export interface AgentRenderOptions {
  tileSizePx: number;
  camera: CameraTransform;
  selectedAgentId: string | null;
  hoveredAgentId: string | null;
  timeSeconds?: number;
  reducedMotion?: boolean;
  clockMinutesOfDay?: number;
  weatherMode?: CampusWeatherMode;
  /** Posisi tile avatar bila sedang idle; dipakai untuk balon sapaan "Hi!". */
  avatarIdlePosition?: { x: number; y: number } | null;
}

function drawStatusIndicator(
  ctx: CanvasRenderingContext2D,
  agent: StudentAgent,
  tileSizePx: number
): void {
  const feet = spriteFeet(agent.position, tileSizePx);
  const bx = feet.x + 14;
  const by = feet.y - SPRITE_WORLD_H - 4;

  if (agent.socialStatus === 'konflik-ringan') {
    // Segitiga kecil tanda gesekan ringan (bentuk + warna untuk aksesibilitas)
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(bx, by - 5);
    ctx.lineTo(bx + 5, by + 4);
    ctx.lineTo(bx - 5, by + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    return;
  }

  let fill = '#64748b';
  if (agent.status === 'bekerja') fill = '#1d5d7a';
  else if (agent.status === 'mengobrol') fill = '#0f766e';
  else if (agent.status === 'istirahat') fill = '#b45309';
  else if (agent.status === 'berpindah') fill = '#0284c7';

  ctx.fillStyle = fill;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.arc(bx, by, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
}

function drawAgentEnergyBar(
  ctx: CanvasRenderingContext2D,
  agent: StudentAgent,
  options: AgentRenderOptions
): void {
  const feet = spriteFeet(agent.position, options.tileSizePx);
  const energy = Math.min(1, Math.max(0, agent.energy));
  const pct = Math.round(energy * 100);
  const timeSec = options.timeSeconds ?? 0;
  const reduced = options.reducedMotion ?? false;
  const isCritical = energy < 0.35;
  const isWarning = energy >= 0.35 && energy < 0.6;
  const isCommunicating =
    agent.interactingWithIds.length > 0 ||
    agent.socialStatus === 'berinteraksi' ||
    agent.socialStatus === 'berkelompok';
  const showNumber =
    isCritical ||
    isWarning ||
    agent.id === options.selectedAgentId ||
    agent.id === options.hoveredAgentId ||
    options.camera.scale >= 1.15;

  const barW = 34;
  const barH = 5.5;
  const bx = feet.x - barW / 2;
  const by = feet.y + 1.5;

  ctx.save();
  // Latar bilah tinta biru-dongker
  ctx.fillStyle = '#0f1b33';
  ctx.beginPath();
  ctx.roundRect(bx - 1.2, by - 1.2, barW + 2.4, barH + 2.4, 3);
  ctx.fill();

  ctx.fillStyle = '#24324d';
  ctx.beginPath();
  ctx.roundRect(bx, by, barW, barH, 2);
  ctx.fill();

  // Isi warna dinamis: hijau (stabil/naik), kuning (waspada), merah berdenyut (kritis)
  const fillW = Math.max(2, barW * energy);
  const pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(timeSec * 6.5);
  ctx.fillStyle = isCritical
    ? pulse > 0.5
      ? '#ef4444'
      : '#f87171'
    : isWarning
      ? '#f59e0b'
      : '#10b981';
  ctx.beginPath();
  ctx.roundRect(bx, by, fillW, barH, 2);
  ctx.fill();

  // Kilau atas tipis pada bilah energi
  ctx.fillStyle = 'rgba(255, 255, 255, 0.32)';
  ctx.fillRect(bx + 1, by + 0.6, Math.max(0, fillW - 2), 1.4);

  // Indikator aliran energi hidup (+ hijau saat mengobrol, - merah/amber saat terisolasi & menurun)
  if (!reduced) {
    if (isCommunicating) {
      const lift = ((timeSec * 1.4 + phaseOffsetFor(agent.id)) % 1) * 7;
      const alpha = Math.max(0, 1 - lift / 7);
      ctx.font = '800 9px Outfit, ui-sans-serif, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = `rgba(16, 185, 129, ${alpha.toFixed(2)})`;
      ctx.fillText('+', bx + barW + 2.5, by + 2 - lift);
    } else if (energy < 0.6 && agent.status !== 'istirahat') {
      const drop = ((timeSec * 1.2 + phaseOffsetFor(agent.id)) % 1) * 5;
      const alpha = Math.max(0, 1 - drop / 5);
      ctx.font = '800 9px Outfit, ui-sans-serif, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isCritical
        ? `rgba(239, 68, 68, ${alpha.toFixed(2)})`
        : `rgba(217, 119, 6, ${alpha.toFixed(2)})`;
      ctx.fillText('▼', bx + barW + 2, by + 1 + drop);
    }
  }

  // Angka persentase mungil tajam di sisi kiri bilah energi
  if (showNumber) {
    const label = `${pct}%`;
    ctx.font = '800 7.5px Outfit, ui-sans-serif, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = isCritical
      ? 'rgba(153, 27, 27, 0.94)'
      : isWarning
        ? 'rgba(120, 53, 15, 0.92)'
        : 'rgba(15, 27, 51, 0.88)';
    ctx.beginPath();
    ctx.roundRect(bx - tw - 6.5, by - 2.2, tw + 4.5, 10, 2.5);
    ctx.fill();
    ctx.fillStyle = isCritical ? '#fecaca' : isWarning ? '#fde68a' : '#d1fae5';
    ctx.fillText(label, bx - 4.2, by + 3);
  }
  ctx.restore();
}

function drawAgentNameTag(
  ctx: CanvasRenderingContext2D,
  agent: StudentAgent,
  tileSizePx: number,
  label: string,
  emphasized: boolean
): void {
  const feet = spriteFeet(agent.position, tileSizePx);
  ctx.save();
  ctx.font = emphasized
    ? '700 10px Outfit, ui-sans-serif, system-ui, sans-serif'
    : '600 9px Outfit, ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(label).width;
  const bw = tw + 11;
  const bh = 15;
  const bx = feet.x - bw / 2;
  const by = feet.y + 10.5;

  // Bayangan cetak 3D tipis ala Batik-Blueprint Atelier
  ctx.fillStyle = 'rgba(15, 27, 51, 0.32)';
  ctx.beginPath();
  ctx.roundRect(bx + 1, by + 1.5, bw, bh, [2, 6, 2, 6]);
  ctx.fill();

  ctx.fillStyle = emphasized ? '#14233f' : 'rgba(255, 250, 240, 0.95)';
  ctx.strokeStyle = emphasized ? '#e5ac3f' : '#0f1b33';
  ctx.lineWidth = emphasized ? 1.5 : 1.15;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, [2, 6, 2, 6]);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = emphasized ? '#fff8e6' : '#0f1b33';
  ctx.fillText(label, feet.x, by + bh / 2 + 0.5);
  ctx.restore();
}

function drawBubble(
  ctx: CanvasRenderingContext2D,
  agent: StudentAgent,
  tileSizePx: number,
  spec: BubbleSpec
): void {
  const feet = spriteFeet(agent.position, tileSizePx);
  const text = spec.text;
  ctx.save();
  ctx.font = '700 9.5px Fredoka, Plus Jakarta Sans, ui-sans-serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(text).width;
  const bw = Math.max(24, tw + 14);
  const bh = 18;
  const bx = feet.x - bw / 2;
  const by = feet.y - SPRITE_WORLD_H - 12 - bh - spec.hopPx * 2;

  // Bayangan gelembung
  ctx.fillStyle = 'rgba(62, 37, 23, 0.22)';
  ctx.beginPath();
  ctx.roundRect(bx, by + 2, bw, bh, 9);
  ctx.fill();

  // Awan bicara vektor halus berbingkai tinta espresso
  ctx.fillStyle = '#fffdf7';
  ctx.strokeStyle = '#3e2517';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 9);
  ctx.fill();
  ctx.stroke();

  // Ekor awan kecil
  ctx.fillStyle = '#fffdf7';
  ctx.beginPath();
  ctx.moveTo(feet.x - 3.5, by + bh - 1);
  ctx.lineTo(feet.x, by + bh + 4.5);
  ctx.lineTo(feet.x + 3.5, by + bh - 1);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#3e2517';
  ctx.fillText(text, feet.x, by + bh / 2 + 0.5);
  ctx.restore();
}

/** Garis interaksi sosial antar-agen aktif (digambar di bawah sprite). */
export function drawInteractionLines(
  ctx: CanvasRenderingContext2D,
  agents: readonly StudentAgent[],
  tileSizePx: number,
  timeSeconds = 0,
  reducedMotion = false
): void {
  const t = tileSizePx;
  const byId = new Map<string, StudentAgent>();
  for (const agent of agents) byId.set(agent.id, agent);

  ctx.save();
  let pairIndex = 0;
  for (const agent of agents) {
    if (agent.status === 'berpindah') continue;
    const ax = (agent.position.x + 0.5) * t;
    const ay = (agent.position.y + 0.5) * t;

    for (const partnerId of agent.interactingWithIds) {
      if (agent.id >= partnerId) continue;
      const partner = byId.get(partnerId);
      if (
        !partner ||
        partner.status === 'berpindah' ||
        partner.currentZoneId !== agent.currentZoneId
      ) {
        continue;
      }

      const bx = (partner.position.x + 0.5) * t;
      const by = (partner.position.y + 0.5) * t;

      const isConflict =
        agent.socialStatus === 'konflik-ringan' ||
        partner.socialStatus === 'konflik-ringan';
      ctx.strokeStyle = isConflict
        ? 'rgba(220, 38, 38, 0.52)'
        : 'rgba(15, 118, 110, 0.4)';
      ctx.lineWidth = isConflict ? 1.9 : 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();

      // Kilau obrolan / percikan ketegangan halus di sepanjang garis sosial
      if (!reducedMotion) {
        ctx.setLineDash([]);
        if (isConflict) {
          const mx = (ax + bx) / 2;
          const my = (ay + by) / 2;
          const s = 2.6 + Math.sin(timeSeconds * 7 + pairIndex) * 0.9;
          ctx.fillStyle = 'rgba(239, 68, 68, 0.78)';
          ctx.beginPath();
          ctx.moveTo(mx, my - s);
          ctx.lineTo(mx + s, my);
          ctx.lineTo(mx, my + s);
          ctx.lineTo(mx - s, my);
          ctx.closePath();
          ctx.fill();
        } else {
          const frac = 0.5 + 0.4 * Math.sin(timeSeconds * 2.1 + pairIndex * 1.3);
          const sx = ax + (bx - ax) * frac;
          const sy = ay + (by - ay) * frac;
          ctx.fillStyle = 'rgba(251, 211, 108, 0.92)';
          ctx.beginPath();
          ctx.arc(sx, sy, 2.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      pairIndex += 1;
    }
  }
  ctx.restore();
}

/** Menghitung balon ucapan yang tampil (maks 4, terdekat ke avatar lebih dulu). */
export function computeAgentBubbles(
  agents: readonly StudentAgent[],
  options: AgentRenderOptions
): ReadonlyMap<string, BubbleSpec> {
  const timeSeconds = options.timeSeconds ?? 0;
  const reducedMotion = options.reducedMotion ?? false;
  const avatar = options.avatarIdlePosition ?? null;
  const candidates: { agentId: string; spec: BubbleSpec; distance: number }[] = [];
  for (const agent of agents) {
    const distance = avatar
      ? Math.hypot(agent.position.x - avatar.x, agent.position.y - avatar.y)
      : null;
    const spec = bubbleFor({
      agentId: agent.id,
      status: agent.status,
      socialStatus: agent.socialStatus,
      hasInteractionPartner: agent.interactingWithIds.length > 0,
      distanceToAvatarTiles: distance,
      timeSeconds,
      reducedMotion,
    });
    if (spec) candidates.push({ agentId: agent.id, spec, distance: distance ?? Number.MAX_SAFE_INTEGER });
  }
  const chosen = new Set(selectBubbles(candidates));
  const result = new Map<string, BubbleSpec>();
  for (const c of candidates) {
    if (chosen.has(c.agentId)) result.set(c.agentId, c.spec);
  }
  return result;
}

/** Menggambar satu sprite agen 48x72 beserta bayangan, cincin seleksi/hover, dan jalur. */
export function drawAgentSprite(
  ctx: CanvasRenderingContext2D,
  agent: StudentAgent,
  allById: ReadonlyMap<string, StudentAgent>,
  options: AgentRenderOptions
): void {
  const t = options.tileSizePx;
  const timeSeconds = options.timeSeconds ?? 0;
  const reducedMotion = options.reducedMotion ?? false;
  const isSelected = agent.id === options.selectedAgentId;
  const isHovered = agent.id === options.hoveredAgentId;
  const feet = spriteFeet(agent.position, t);

  if (isSelected && agent.status === 'berpindah' && agent.path.length > 1) {
    ctx.save();
    ctx.strokeStyle = 'rgba(2, 132, 199, 0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    agent.path.forEach((pt, idx) => {
      const px = (pt.x + 0.5) * t;
      const py = (pt.y + 0.5) * t;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();
  }

  // Cincin radar peringatan merah berdenyut di kaki bila energi mahasiswa kritis (< 35%)
  if (agent.energy < 0.35) {
    const p = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(timeSeconds * 5.2 + phaseOffsetFor(agent.id) * 6);
    ctx.save();
    ctx.strokeStyle = `rgba(239, 68, 68, ${(0.45 + 0.45 * p).toFixed(3)})`;
    ctx.fillStyle = `rgba(239, 68, 68, ${(0.08 + 0.1 * p).toFixed(3)})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(feet.x, feet.y, 18 + 5 * p, 7.5 + 2.2 * p, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  if (isSelected || isHovered) {
    ctx.save();
    ctx.fillStyle = isSelected ? 'rgba(229, 172, 63, 0.20)' : 'rgba(29, 93, 122, 0.14)';
    ctx.strokeStyle = isSelected ? '#0f1b33' : '#1d5d7a';
    ctx.lineWidth = isSelected ? 2.4 : 1.6;
    ctx.beginPath();
    ctx.ellipse(feet.x, feet.y, SPRITE_WORLD_W / 2 - 4, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (isSelected) {
      ctx.strokeStyle = '#f5c249';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(feet.x, feet.y, SPRITE_WORLD_W / 2 - 1.5, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  const dir = facingOf(agent, (id) => allById.get(id)?.position);
  const moving = isWalking(agent);

  // Kepulan debu langkah kaki chibi halus saat berjalan
  if (moving && !reducedMotion) {
    const dx = dir === 'kanan' ? -1 : dir === 'kiri' ? 1 : 0;
    const dy = dir === 'bawah' ? -1 : dir === 'atas' ? 1 : 0;
    const seed = phaseOffsetFor(agent.id);
    ctx.save();
    for (let i = 0; i < 2; i += 1) {
      const cycle = (timeSeconds * 3.0 + seed + i * 0.5) % 1;
      const dist = 4.5 + cycle * 11;
      const px = feet.x + dx * dist + (dx === 0 ? (i === 0 ? -2.5 : 2.5) : 0);
      const py = feet.y - 2 + dy * dist * 0.6 - cycle * 3;
      const r = 2 + cycle * 1.9;
      ctx.fillStyle = `rgba(248, 241, 224, ${Math.max(0, (1 - cycle) * 0.42).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Bayangan matahari terarah waktu nyata + bayangan kontak AO di bawah kaki chibi
  const sun = computeSunLighting(
    options.clockMinutesOfDay ?? 660,
    options.weatherMode ?? 'otomatis'
  );
  ctx.save();
  ctx.fillStyle = sun.shadowColor;
  ctx.beginPath();
  ctx.ellipse(
    feet.x + sun.shadowDirX * 7.5,
    feet.y + 1 + sun.shadowDirY * 4.5,
    14 * (0.85 + sun.shadowLength * 0.35),
    5.2,
    sun.shadowDirX * 0.24,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
  ctx.beginPath();
  ctx.ellipse(feet.x, feet.y - 1, 13.5, 4.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const choice = selectFrame({
    moving,
    timeSeconds,
    reducedMotion,
    phaseOffset: phaseOffsetFor(agent.id),
  });
  drawSprite(ctx, {
    studentId: agent.id,
    dir,
    anim: choice.anim,
    frame: choice.frame,
    x: feet.x,
    y: feet.y,
    width: SPRITE_WORLD_W,
    fallback: {
      hairStyle: agent.demographicLabel.hairStyle,
      avatarHue: agent.demographicLabel.avatarHue,
    },
  });
}

/**
 * Menggambar lapisan atas satu agen: indikator status/gesekan di atas kepala,
 * tanda stres, balon ucapan (bila dipilih), dan label nama.
 */
export function drawAgentOverlays(
  ctx: CanvasRenderingContext2D,
  agent: StudentAgent,
  options: AgentRenderOptions,
  bubble: BubbleSpec | null
): void {
  const t = options.tileSizePx;
  const isSelected = agent.id === options.selectedAgentId;
  const isHovered = agent.id === options.hoveredAgentId;
  const feet = spriteFeet(agent.position, t);

  drawStatusIndicator(ctx, agent, t);

  // Penanda anime halus bila stres tinggi (> 0.65): tetes keringat cel-shaded + busur amber
  if (agent.stress > 0.65) {
    const timeSec = options.timeSeconds ?? 0;
    const reduced = options.reducedMotion ?? false;
    const bob = reduced ? 0 : Math.sin(timeSec * 4.2 + phaseOffsetFor(agent.id) * 6) * 1.6;
    const sx = feet.x + 15.5;
    const sy = feet.y - SPRITE_WORLD_H + 14 + bob;

    ctx.save();
    ctx.fillStyle = '#7dd3fc';
    ctx.strokeStyle = '#0f1b33';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.moveTo(sx, sy - 5.2);
    ctx.bezierCurveTo(sx + 3.6, sy - 0.8, sx + 3.6, sy + 3.8, sx, sy + 3.8);
    ctx.bezierCurveTo(sx - 3.6, sy + 3.8, sx - 3.6, sy - 0.8, sx, sy - 5.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(sx - 0.9, sy + 0.8, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  if (agent.stress > 0.7) {
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.75)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(feet.x, feet.y - SPRITE_WORLD_H / 2, SPRITE_WORLD_H * 0.42, Math.PI * 1.15, Math.PI * 1.85);
    ctx.stroke();
  }

  if (bubble) drawBubble(ctx, agent, t, bubble);

  // Bilah energi selalu tampak pada setiap miniatur mahasiswa
  drawAgentEnergyBar(ctx, agent, options);

  // Label nama (selalu untuk yang dipilih/hover, atau semua saat zoom >= 1.35)
  if (isSelected || isHovered || options.camera.scale >= 1.35) {
    const firstName = agent.name.split(' ')[0];
    drawAgentNameTag(ctx, agent, t, isSelected ? agent.name : firstName, isSelected);
  }
}

/**
 * Menggambar seluruh agen mahasiswa beserta garis interaksi sosialnya.
 * Urutan: garis interaksi, lalu sprite menurut y, lalu lapisan atas.
 * labRenderer dapat memakai drawAgentSprite/drawAgentOverlays langsung untuk urutan y bersama perabot.
 */
export function renderAgentsLayer(
  ctx: CanvasRenderingContext2D,
  agents: readonly StudentAgent[],
  options: AgentRenderOptions
): void {
  const byId = new Map<string, StudentAgent>();
  for (const agent of agents) byId.set(agent.id, agent);

  drawInteractionLines(
    ctx,
    agents,
    options.tileSizePx,
    options.timeSeconds ?? 0,
    options.reducedMotion ?? false
  );

  const ordered = [...agents].sort(
    (a, b) =>
      spriteFeet(a.position, options.tileSizePx).y -
      spriteFeet(b.position, options.tileSizePx).y
  );
  for (const agent of ordered) drawAgentSprite(ctx, agent, byId, options);

  const bubbles = computeAgentBubbles(agents, options);
  for (const agent of ordered) {
    drawAgentOverlays(ctx, agent, options, bubbles.get(agent.id) ?? null);
  }
}

export function findAgentAtScreenPoint(
  clientX: number,
  clientY: number,
  canvasRect: DOMRect,
  camera: CameraTransform,
  tileSizePx: number,
  agents: readonly StudentAgent[]
): StudentAgent | null {
  const localX = clientX - canvasRect.left;
  const localY = clientY - canvasRect.top;
  const worldX = (localX - camera.offsetX) / camera.scale;
  const worldY = (localY - camera.offsetY) / camera.scale;

  const id = hitTestAgents(worldX, worldY, agents, tileSizePx);
  return id ? (agents.find((a) => a.id === id) ?? null) : null;
}
