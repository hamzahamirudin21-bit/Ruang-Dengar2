import { sharedAnimeAssetManager } from '../anime/CharacterAssetManager';
import { drawSprite, onSpriteAssetsReady as onMiniSpriteReady } from '../characters/spriteCanvas';
import { getPoseAssetPath } from '../characters/poseCatalog';
import { SPRITE_WORLD_H, SPRITE_WORLD_W, spriteFeet } from '../world/worldMetrics';
import { MiniSpriteAnimationState } from './CharacterAnimationEngine';
import { PanelWorldCamera, worldTileToPanelNorm } from './ComicCameraController';
import {
  CameraShotType,
  ComicCharacterProfile,
  LabWorkEffectKind,
  PanelMiniActorSpec,
  getCharacterProfile,
} from './StoryTimeline';

export interface RenderedActorAnchor {
  characterId: string;
  name: string;
  orderNumber: string;
  feetWorldX: number;
  feetWorldY: number;
  xNorm: number;
  yNorm: number;
}

export function onSpriteAssetsReady(cb: () => void): () => void {
  const unsub1 = sharedAnimeAssetManager.onAssetReady(cb);
  const unsub2 = onMiniSpriteReady(cb);
  return () => {
    unsub1();
    unsub2();
  };
}

/**
 * Merender karakter pada framing Close-Up / Medium Shot / Medium Full Shot
 * menggunakan aset anime studio P01–P20 transparan (`480x600`) yang menyatu alami
 * di belakang meja kerja, monitor, osiloskop, atau meja diskusi (tanpa kaki buatan!).
 */
export function renderMediumOrCloseupAnimeActor(
  ctx: CanvasRenderingContext2D,
  actor: PanelMiniActorSpec,
  shotType: CameraShotType,
  canvasWidth: number,
  canvasHeight: number,
  isSpeaking: boolean,
  pageElapsedMs: number,
  reducedMotion: boolean
): RenderedActorAnchor {
  const profile = getCharacterProfile(actor.characterId);
  const xNorm = actor.stageXNorm ?? 0.5;
  const cx = xNorm * canvasWidth;
  const tSec = Math.max(0, pageElapsedMs) / 1000;

  // Gerakan halus yang alami (bernapas / anggukan menyimak / penekanan bicara / langkah jalan)
  const bobPx = reducedMotion
    ? 0
    : actor.activity === 'walk'
      ? Math.abs(Math.sin(tSec * 6.5)) * -7
      : isSpeaking
        ? Math.sin(tSec * 5.2) * -2.2
        : Math.sin(tSec * 2.1 + xNorm * 4) * 1.4;

  const poseId = actor.poseId ?? (isSpeaking ? 'P14' : 'P17');
  const poseUrl =
    actor.characterId === 'dosen'
      ? '/assets/characters/dosen-portrait.png'
      : getPoseAssetPath(actor.characterId, poseId) ??
        `/assets/characters/${actor.characterId}-portrait.png`;

  const fallbackUrl =
    actor.characterId === 'dosen'
      ? '/assets/characters/dosen-portrait.png'
      : `/assets/characters/${actor.characterId}-portrait.png`;

  let img = sharedAnimeAssetManager.getCachedImage(poseUrl);
  if (!img) {
    void sharedAnimeAssetManager.loadImage(poseUrl);
    img = sharedAnimeAssetManager.getCachedImage(fallbackUrl);
    if (!img) void sharedAnimeAssetManager.loadImage(fallbackUrl);
  }

  // Framing fleksibel: Close-Up lebih dekat ke wajah & bahu; Medium Shot pinggang ke atas
  const heightRatio =
    shotType === 'close-up'
      ? 1.06
      : shotType === 'medium-full-shot'
        ? 0.92
        : 0.86;
  const drawH = canvasHeight * heightRatio;
  const drawW = img && img.naturalHeight > 0
    ? (drawH * img.naturalWidth) / img.naturalHeight
    : drawH * 0.8;

  const bottomY =
    shotType === 'close-up'
      ? canvasHeight * 1.14 + bobPx
      : canvasHeight * 0.96 + bobPx;

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.save();
    ctx.translate(cx, bottomY);
    if (actor.facing === 'kiri') {
      ctx.scale(-1, 1);
    }
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) {
      ctx.imageSmoothingQuality = 'high';
    }
    // Sorotan rim halus saat karakter berbicara
    if (isSpeaking) {
      ctx.filter = 'brightness(1.04) saturate(1.04)';
    } else {
      ctx.filter = 'brightness(0.95)';
    }
    ctx.drawImage(img, -drawW * 0.5, -drawH, drawW, drawH);
    ctx.restore();
  }

  return {
    characterId: actor.characterId,
    name: profile.name,
    orderNumber: profile.orderNumber,
    feetWorldX: cx,
    feetWorldY: bottomY,
    xNorm,
    yNorm: Math.max(0.18, (bottomY - drawH * 0.72) / Math.max(1, canvasHeight)),
  };
}

/**
 * Merender Karakter pada Wide Shot & Full-Body Shot di atas dunia LAB_MAP
 * menggunakan aset sprite resmi yang lolos QC anatomi (tanpa kaki tempelan).
 */
export function renderMiniComicCharacter(
  ctx: CanvasRenderingContext2D,
  actor: PanelMiniActorSpec,
  animState: MiniSpriteAnimationState,
  tileSizePx: number,
  camera: PanelWorldCamera,
  canvasWidth: number,
  canvasHeight: number,
  _pageElapsedMs = 0,
  _reducedMotion = false
): RenderedActorAnchor {
  const profile: ComicCharacterProfile = getCharacterProfile(actor.characterId);
  const feet = spriteFeet({ x: animState.tileX, y: animState.tileY }, tileSizePx);

  if (actor.workEffect) {
    renderLabStationEffect(ctx, actor.workEffect, feet.x, feet.y, animState.dir, animState.workPulse01);
  }

  if (animState.isSpeaking) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 181, 71, 0.24)';
    ctx.strokeStyle = '#FFC96B';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.ellipse(feet.x, feet.y, 18, 6.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.40)';
  ctx.beginPath();
  ctx.ellipse(feet.x, feet.y - 0.5, 12.5, 4.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

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

function renderLabStationEffect(
  ctx: CanvasRenderingContext2D,
  kind: LabWorkEffectKind,
  feetX: number,
  feetY: number,
  dir: 'bawah' | 'kiri' | 'kanan' | 'atas',
  pulse01: number
): void {
  const offsetX = dir === 'kiri' ? -20 : dir === 'kanan' ? 20 : 0;
  const offsetY = dir === 'atas' ? -42 : dir === 'bawah' ? 12 : -22;
  const tx = feetX + offsetX;
  const ty = feetY + offsetY;

  ctx.save();
  if (kind === 'solder') {
    ctx.fillStyle = pulse01 > 0.4 ? '#fef08a' : '#fb923c';
    ctx.beginPath();
    ctx.arc(tx - 4, ty, 2.5 + pulse01 * 1.8, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'weld') {
    const r = 5 + pulse01 * 8;
    const g = ctx.createRadialGradient(tx, ty, 0.5, tx, ty, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.45, '#38bdf8');
    g.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'rover') {
    const rx = feetX + (dir === 'kiri' ? -26 : 24);
    const ry = feetY - 2;
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(rx - 10, ry - 6, 20, 9, 2.5);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}
