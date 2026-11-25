import { drawSprite, onSpriteAssetsReady } from '../characters/spriteCanvas';
import {
  SPRITE_WORLD_H,
  SPRITE_WORLD_W,
  spriteFeet,
} from '../world/worldMetrics';
import { MiniSpriteAnimationState } from './CharacterAnimationEngine';
import { PanelWorldCamera, worldTileToPanelNorm } from './ComicCameraController';
import {
  ComicCharacterProfile,
  LabWorkEffectKind,
  PanelMiniActorSpec,
  getCharacterProfile,
} from './StoryTimeline';

export interface RenderedActorAnchor {
  characterId: string;
  name: string;
  orderNumber: string;
  /** Posisi X kaki sprite dalam koordinat dunia LAB_MAP */
  feetWorldX: number;
  /** Posisi Y kaki sprite dalam koordinat dunia LAB_MAP */
  feetWorldY: number;
  /** Posisi normalisasi (0..1) puncak kepala di dalam panel untuk ekor balon dialog */
  xNorm: number;
  yNorm: number;
}

export { onSpriteAssetsReady };

/**
 * Merender Mini Character Sprite resmi dari dataset simulasi utama (`drawSprite`)
 * dengan titik anchor tepat di bagian dasar kaki (`spriteFeet`), rasio aspek asli 48:72,
 * tanpa memisahkan tangan/kaki, tanpa stretch, dan tanpa distorsi.
 */
export function renderMiniComicCharacter(
  ctx: CanvasRenderingContext2D,
  actor: PanelMiniActorSpec,
  animState: MiniSpriteAnimationState,
  tileSizePx: number,
  camera: PanelWorldCamera,
  canvasWidth: number,
  canvasHeight: number
): RenderedActorAnchor {
  const profile: ComicCharacterProfile = getCharacterProfile(actor.characterId);
  const feet = spriteFeet({ x: animState.tileX, y: animState.tileY }, tileSizePx);

  // 1. Efek aktivitas peralatan laboratorium di sekitar posisi kerja (di bawah/depan sprite)
  if (actor.workEffect) {
    renderMiniWorkStationEffect(
      ctx,
      actor.workEffect,
      feet.x,
      feet.y,
      animState.dir,
      animState.workPulse01
    );
  }

  // 2. Cincin sorotan halus di kaki bila karakter sedang berbicara aktif
  if (animState.isSpeaking) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 181, 71, 0.24)';
    ctx.strokeStyle = '#FFC96B';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(feet.x, feet.y, SPRITE_WORLD_W * 0.42, 7.0, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // 3. Bayangan kontak oval 2D realistis tepat di bawah sepatu sprite miniatur
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.40)';
  ctx.beginPath();
  ctx.ellipse(feet.x, feet.y - 0.5, 12.5, 4.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Gambar Mini Character Sprite utuh dari dataset simulasi utama (48x72)
  drawSprite(ctx, {
    studentId: actor.characterId,
    dir: animState.dir,
    anim: animState.anim,
    frame: animState.frame,
    x: feet.x,
    y: feet.y,
    width: SPRITE_WORLD_W,
    fallback: profile.fallback,
  });

  // 5. Indikator status aktivitas bulat mungil di atas bahu kanan (konsisten dengan agentRenderer.ts)
  drawMiniActivityDot(ctx, feet.x + 14, feet.y - SPRITE_WORLD_H + 6, actor.activity, animState.isSpeaking);

  // 6. Kapsul nama miniatur dark-glass di bawah kaki (konsisten dengan peta simulasi utama)
  drawMiniCharacterNamePill(
    ctx,
    feet.x,
    feet.y + 2.5,
    `${profile.orderNumber} ${profile.shortName}`,
    animState.isSpeaking
  );

  const headNorm = worldTileToPanelNorm(
    animState.tileX,
    animState.tileY,
    camera,
    canvasWidth,
    canvasHeight,
    tileSizePx,
    -SPRITE_WORLD_H * 0.72
  );

  return {
    characterId: actor.characterId,
    name: profile.name,
    orderNumber: profile.orderNumber,
    feetWorldX: feet.x,
    feetWorldY: feet.y,
    xNorm: headNorm.xNorm,
    yNorm: headNorm.yNorm,
  };
}

function drawMiniActivityDot(
  ctx: CanvasRenderingContext2D,
  bx: number,
  by: number,
  activity: PanelMiniActorSpec['activity'],
  isSpeaking: boolean
): void {
  ctx.save();
  const fill = isSpeaking
    ? '#FFC96B'
    : activity === 'work'
      ? '#00DFFF'
      : activity === 'walk'
        ? '#38bdf8'
        : '#10b981';
  ctx.fillStyle = 'rgba(6, 21, 34, 0.75)';
  ctx.beginPath();
  ctx.arc(bx, by, 4.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = fill;
  ctx.strokeStyle = '#061522';
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.arc(bx, by, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawMiniCharacterNamePill(
  ctx: CanvasRenderingContext2D,
  feetX: number,
  topY: number,
  label: string,
  emphasized: boolean
): void {
  ctx.save();
  ctx.font = emphasized
    ? '800 8.5px "Plus Jakarta Sans", Outfit, sans-serif'
    : '700 7.8px "Plus Jakarta Sans", Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(label).width;
  const bw = tw + 10;
  const bh = 12;
  const bx = feetX - bw * 0.5;

  ctx.fillStyle = 'rgba(3, 10, 18, 0.55)';
  ctx.beginPath();
  ctx.roundRect(bx, topY + 1, bw, bh, 4);
  ctx.fill();

  ctx.fillStyle = emphasized ? 'rgba(10, 38, 54, 0.96)' : 'rgba(6, 21, 34, 0.90)';
  ctx.strokeStyle = emphasized ? '#FFC96B' : 'rgba(0, 223, 255, 0.55)';
  ctx.lineWidth = emphasized ? 1.3 : 0.95;
  ctx.beginPath();
  ctx.roundRect(bx, topY, bw, bh, 4);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = emphasized ? '#FFC96B' : '#EAF6FF';
  ctx.fillText(label, feetX, topY + bh * 0.5 + 0.3);
  ctx.restore();
}

function renderMiniWorkStationEffect(
  ctx: CanvasRenderingContext2D,
  kind: LabWorkEffectKind,
  feetX: number,
  feetY: number,
  dir: 'bawah' | 'kiri' | 'kanan' | 'atas',
  pulse01: number
): void {
  const offsetX = dir === 'kiri' ? -18 : dir === 'kanan' ? 18 : 0;
  const offsetY = dir === 'atas' ? -36 : dir === 'bawah' ? 10 : -20;
  const tx = feetX + offsetX;
  const ty = feetY + offsetY;

  ctx.save();
  switch (kind) {
    case 'solder': {
      // Titik pijar timah solder & cincin gelombang mikro di meja elektronika
      ctx.fillStyle = pulse01 > 0.4 ? '#fef08a' : '#fb923c';
      ctx.beginPath();
      ctx.arc(tx - 4, ty, 2.2 + pulse01 * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(tx - 4, ty - 2);
      ctx.lineTo(tx - 2, ty - 8 - pulse01 * 4);
      ctx.stroke();
      break;
    }
    case 'oscilloscope': {
      // Pendaran sinyal hijau-sian dari layar osiloskop
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(tx, ty, 5 + pulse01 * 3, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case 'code': {
      // Pantulan cahaya biru-sian monitor kode
      ctx.fillStyle = `rgba(56, 189, 248, ${(0.14 + pulse01 * 0.12).toFixed(2)})`;
      ctx.beginPath();
      ctx.ellipse(tx, ty + 4, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 'print3d': {
      // Indikator cetak 3D aktif
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(tx - 5, ty - 5, 10, 10);
      break;
    }
    case 'weld': {
      // Kilatan busur las K3 & percikan mikro di meja bengkel las
      const r = 4 + pulse01 * 7;
      const g = ctx.createRadialGradient(tx, ty, 0.5, tx, ty, r);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.45, '#38bdf8');
      g.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(tx, ty, r, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < 5; i += 1) {
        const ang = -Math.PI * 0.8 + i * 0.4 + pulse01;
        const dist = 4 + pulse01 * 10;
        ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#fb923c';
        ctx.beginPath();
        ctx.arc(tx + Math.cos(ang) * dist, ty + Math.sin(ang) * dist, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'rover': {
      // Unit Mini Rover Robotika 2D di lantai dekat kaki karakter
      const rx = feetX + (dir === 'kiri' ? -22 : 20);
      const ry = feetY - 2;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.beginPath();
      ctx.ellipse(rx, ry + 3, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(rx - 9, ry - 5, 18, 8, 2.5);
      ctx.fill();
      ctx.stroke();

      // Sensor LiDAR emas di atas rover
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(rx + 2, ry - 6, 2.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Pancaran gelombang sensor rover
      ctx.strokeStyle = `rgba(52, 211, 153, ${(0.35 + pulse01 * 0.4).toFixed(2)})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(rx + 6, ry - 2, 6 + pulse01 * 5, -0.6, 0.6);
      ctx.stroke();
      break;
    }
    default:
      break;
  }
  ctx.restore();
}
