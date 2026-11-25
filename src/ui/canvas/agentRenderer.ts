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
import type { CampusWeatherMode } from '../gpu/sunLighting';

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
  const bx = feet.x + 14.5;
  const by = feet.y - SPRITE_WORLD_H - 3.5;

  ctx.save();
  if (agent.socialStatus === 'konflik-ringan') {
    // Segitiga tanda gesekan ringan berbingkai neon merah-amber (bentuk + warna untuk aksesibilitas)
    ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
    ctx.beginPath();
    ctx.arc(bx, by, 7.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.strokeStyle = '#FFC96B';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(bx, by - 5.2);
    ctx.lineTo(bx + 5.2, by + 4);
    ctx.lineTo(bx - 5.2, by + 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  let fill = '#64748b';
  let glow = 'rgba(148, 163, 184, 0.22)';
  let border = '#EAF6FF';
  if (agent.status === 'bekerja') {
    fill = '#00DFFF';
    glow = 'rgba(0, 223, 255, 0.28)';
    border = '#061522';
  } else if (agent.status === 'mengobrol') {
    fill = '#10b981';
    glow = 'rgba(16, 185, 129, 0.30)';
    border = '#061522';
  } else if (agent.status === 'istirahat') {
    fill = '#FFB547';
    glow = 'rgba(255, 181, 71, 0.30)';
    border = '#061522';
  } else if (agent.status === 'berpindah') {
    fill = '#168BFF';
    glow = 'rgba(22, 139, 255, 0.28)';
    border = '#EAF6FF';
  }

  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(bx, by, 6.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fill;
  ctx.strokeStyle = border;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.arc(bx, by, 3.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Titik kilau spekular mikro
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(bx - 1.1, by - 1.1, 1.0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** Mengambil kode nomor urut mahasiswa (#01..#18) dari agent.id ('mhs-1' -> '#01'). */
function formatAgentIdBadge(agentId: string): string {
  const m = /(\d+)$/.exec(agentId);
  if (!m) return '#00';
  const num = Number.parseInt(m[1], 10);
  return `#${String(num).padStart(2, '0')}`;
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
  const isSelected = agent.id === options.selectedAgentId;
  const isHovered = agent.id === options.hoveredAgentId;
  const isCommunicating =
    agent.interactingWithIds.length > 0 ||
    agent.socialStatus === 'berinteraksi' ||
    agent.socialStatus === 'berkelompok';
  const showNumber =
    isCritical ||
    isWarning ||
    isSelected ||
    isHovered ||
    options.camera.scale >= 1.15;

  // Sesuai referensi AAA: kapsul komposit [#ID | ====Energy Bar====] di bawah kaki karakter
  const idCode = formatAgentIdBadge(agent.id);
  const badgeW = 17.5;
  const barW = 28;
  const totalW = badgeW + barW + 3;
  const barH = 6.2;
  const totalH = 9.6;
  const startX = feet.x - totalW / 2;
  const startY = feet.y + 0.8;
  const bx = startX + badgeW + 2;
  const by = startY + (totalH - barH) / 2;

  ctx.save();

  // Bayangan bawah kapsul HUD kaki
  ctx.fillStyle = 'rgba(3, 10, 18, 0.55)';
  ctx.beginPath();
  ctx.roundRect(startX - 0.5, startY + 1.2, totalW + 1, totalH, 4.5);
  ctx.fill();

  // Sasis utama kapsul dark-glass (#061522 -> #0A2636)
  ctx.fillStyle = isSelected ? 'rgba(10, 38, 54, 0.96)' : 'rgba(6, 21, 34, 0.92)';
  ctx.strokeStyle = isCritical
    ? 'rgba(239, 68, 68, 0.85)'
    : isSelected
      ? '#FFC96B'
      : isHovered
        ? '#00DFFF'
        : 'rgba(0, 223, 255, 0.42)';
  ctx.lineWidth = isSelected ? 1.35 : 1.0;
  ctx.beginPath();
  ctx.roundRect(startX, startY, totalW, totalH, 4.5);
  ctx.fill();
  ctx.stroke();

  // Pill kiri untuk kode #ID (#01..#18)
  ctx.fillStyle = isSelected
    ? 'rgba(255, 181, 71, 0.22)'
    : 'rgba(15, 43, 62, 0.95)';
  ctx.beginPath();
  ctx.roundRect(startX + 1.2, startY + 1.2, badgeW - 1, totalH - 2.4, 3.2);
  ctx.fill();

  ctx.font = '800 6.8px Outfit, Inter, ui-sans-serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isSelected ? '#FFC96B' : '#EAF6FF';
  ctx.fillText(idCode, startX + badgeW / 2 + 0.5, startY + totalH / 2 + 0.3);

  // Track bilah energi gelap
  ctx.fillStyle = '#091a28';
  ctx.beginPath();
  ctx.roundRect(bx, by, barW - 1.5, barH, 2.5);
  ctx.fill();

  // Isi warna dinamis stabil: cyan-emerald (stabil), amber (waspada), merah (kritis)
  const trackW = barW - 1.5;
  const fillW = Math.max(2.2, trackW * energy);

  const barGrad = ctx.createLinearGradient(bx, by, bx + fillW, by);
  if (isCritical) {
    barGrad.addColorStop(0, '#ef4444');
    barGrad.addColorStop(1, '#fb7185');
  } else if (isWarning) {
    barGrad.addColorStop(0, '#f59e0b');
    barGrad.addColorStop(1, '#FFC96B');
  } else {
    barGrad.addColorStop(0, '#10b981');
    barGrad.addColorStop(1, '#00DFFF');
  }

  ctx.fillStyle = barGrad;
  ctx.beginPath();
  ctx.roundRect(bx, by, fillW, barH, 2.5);
  ctx.fill();

  // Garis segmen mikro (3 takik ala bar sci-fi)
  ctx.fillStyle = 'rgba(6, 21, 34, 0.45)';
  for (let s = 1; s <= 2; s += 1) {
    const sx = bx + (trackW * s) / 3;
    ctx.fillRect(sx, by + 0.5, 0.8, barH - 1);
  }

  // Kilau spekular atas tipis pada bilah energi
  ctx.fillStyle = 'rgba(255, 255, 255, 0.36)';
  ctx.fillRect(bx + 1, by + 0.6, Math.max(0, fillW - 2), 1.3);

  // Angka persentase mungil tajam di sisi kanan kapsul bila dipilih/waspada/zoom dekat
  if (showNumber) {
    const label = `${pct}%`;
    ctx.font = '800 7px Outfit, ui-sans-serif, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(label).width;
    const px = startX + totalW + 2;
    const py = startY + 0.3;
    ctx.fillStyle = isCritical
      ? 'rgba(127, 29, 29, 0.94)'
      : isWarning
        ? 'rgba(120, 53, 15, 0.92)'
        : 'rgba(6, 21, 34, 0.92)';
    ctx.strokeStyle = isCritical
      ? 'rgba(248, 113, 113, 0.7)'
      : isWarning
        ? 'rgba(255, 181, 71, 0.7)'
        : 'rgba(0, 223, 255, 0.45)';
    ctx.lineWidth = 0.85;
    ctx.beginPath();
    ctx.roundRect(px, py, tw + 4.5, 9, 2.5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = isCritical ? '#fecaca' : isWarning ? '#FFC96B' : '#EAF6FF';
    ctx.fillText(label, px + 2.2, py + 4.7);
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
    ? '700 9.5px Outfit, Inter, ui-sans-serif, system-ui, sans-serif'
    : '600 8.5px Outfit, Inter, ui-sans-serif, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(label).width;
  const bw = tw + 13;
  const bh = 14.5;
  const bx = feet.x - bw / 2;
  const by = feet.y + 11.5;

  // Bayangan bawah dark-glass
  ctx.fillStyle = 'rgba(3, 10, 18, 0.55)';
  ctx.beginPath();
  ctx.roundRect(bx, by + 1.5, bw, bh, 5);
  ctx.fill();

  // Panel kapsul dark-glass dengan bingkai neon cyan / warm gold saat dipilih
  ctx.fillStyle = emphasized ? 'rgba(10, 38, 54, 0.96)' : 'rgba(6, 21, 34, 0.90)';
  ctx.strokeStyle = emphasized ? '#FFC96B' : 'rgba(0, 223, 255, 0.55)';
  ctx.lineWidth = emphasized ? 1.4 : 1.05;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.fill();
  ctx.stroke();

  // Aksen garis kilau atas tipis
  ctx.fillStyle = emphasized ? 'rgba(255, 201, 107, 0.45)' : 'rgba(0, 223, 255, 0.32)';
  ctx.fillRect(bx + 3, by + 0.8, Math.max(4, bw - 6), 1);

  ctx.fillStyle = emphasized ? '#FFC96B' : '#EAF6FF';
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
  const bh = 17.5;
  const bx = feet.x - bw / 2;
  // Diposisikan stabil di atas kepala agar tidak pernah bergetar atau menutupi wajah karakter
  const by = feet.y - SPRITE_WORLD_H - 13 - bh;

  // Pendaran luar halus di sekitar balon ucapan
  ctx.fillStyle = 'rgba(0, 223, 255, 0.14)';
  ctx.beginPath();
  ctx.roundRect(bx - 1.5, by - 1.5, bw + 3, bh + 3, 9.5);
  ctx.fill();

  // Bayangan gelembung
  ctx.fillStyle = 'rgba(6, 21, 34, 0.42)';
  ctx.beginPath();
  ctx.roundRect(bx, by + 2, bw, bh, 8.5);
  ctx.fill();

  // Balon ucapan putih-gading bersih berbingkai dark-navy & aksen cyan halus (sesuai referensi)
  ctx.fillStyle = '#F8FDFF';
  ctx.strokeStyle = '#0A2636';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 8.5);
  ctx.fill();
  ctx.stroke();

  // Garis rim dalam cyan lembut
  ctx.strokeStyle = 'rgba(0, 223, 255, 0.45)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.roundRect(bx + 1, by + 1, bw - 2, bh - 2, 7.5);
  ctx.stroke();

  // Ekor balon kecil di tengah bawah
  ctx.fillStyle = '#F8FDFF';
  ctx.strokeStyle = '#0A2636';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(feet.x - 3.5, by + bh - 0.8);
  ctx.lineTo(feet.x, by + bh + 4.2);
  ctx.lineTo(feet.x + 3.5, by + bh - 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#061522';
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

  // Cincin radar peringatan merah stabil di kaki bila energi mahasiswa kritis (< 35%)
  if (agent.energy < 0.35) {
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.72)';
    ctx.fillStyle = 'rgba(239, 68, 68, 0.12)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(feet.x, feet.y, 18.5, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  if (isSelected || isHovered) {
    ctx.save();
    ctx.fillStyle = isSelected ? 'rgba(255, 181, 71, 0.22)' : 'rgba(0, 223, 255, 0.16)';
    ctx.strokeStyle = isSelected ? '#FFC96B' : '#00DFFF';
    ctx.lineWidth = isSelected ? 2.2 : 1.5;
    ctx.beginPath();
    ctx.ellipse(feet.x, feet.y, SPRITE_WORLD_W / 2 - 4, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  const dir = facingOf(agent, (id) => allById.get(id)?.position);
  const moving = isWalking(agent);

  // Bayangan kontak oval 2D realistis tepat di bawah sepatu karakter (sesuai referensi top-down 2D)
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.38)';
  ctx.beginPath();
  ctx.ellipse(feet.x, feet.y - 0.5, 12.5, 4.6, 0, 0, Math.PI * 2);
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

  // Penanda anime halus bila stres tinggi (> 0.65): tetes keringat cel-shaded stabil + busur amber
  if (agent.stress > 0.65) {
    const sx = feet.x + 15.5;
    const sy = feet.y - SPRITE_WORLD_H + 14;

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
