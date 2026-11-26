import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LAB_MAP } from '../../data/map';
import type { LabFurniture } from '../../types';
import {
  drawAnimatedLabHolograms,
  drawIllustratedFurniture,
  drawIllustratedZoneLabel,
  getIllustratedLabBackdrop,
} from '../world/illustratedLab';
import { SPRITE_WORLD_H, spriteFeet } from '../world/worldMetrics';
import { computeMiniSpriteAnimationState } from './CharacterAnimationEngine';
import {
  computePanelWorldCamera,
  worldTileToPanelNorm,
} from './ComicCameraController';
import {
  RenderedActorAnchor,
  onSpriteAssetsReady,
  renderMediumOrCloseupAnimeActor,
  renderMiniComicCharacter,
} from './ComicCharacterRenderer';
import { computePanelTransitionState } from './ComicTransitionEngine';
import { DialogueEngine } from './DialogueEngine';
import { ActionStageKind, ComicPanelBlueprint } from './StoryTimeline';

export interface ComicPanelRendererProps {
  panel: ComicPanelBlueprint;
  pageElapsedMs: number;
  pageDurationMs: number;
  reducedMotion?: boolean;
  onStartSimulation?: () => void;
  onReplayStory?: () => void;
  onSkipIntro?: () => void;
}

const SCENE_BG_BY_STAGE: Partial<Record<ActionStageKind, string>> = {
  'corridor-medium-walk': '/assets/scenes/diskusi.png',
  'oscilloscope-medium-bench': '/assets/scenes/elektronik.png',
  'coding-medium-desk': '/assets/scenes/pemrograman.png',
  'printer-3d-ecu': '/assets/scenes/cetak3d.png',
  'welding-k3-medium': '/assets/scenes/las.png',
  'discussion-medium-table': '/assets/scenes/diskusi.png',
  'studio-design-medium': '/assets/scenes/pemrograman.png',
  'gudang-calibration-closeup': '/assets/scenes/elektronik.png',
  'reading-corner-medium': '/assets/scenes/konsultasi.png',
  'robotics-corridor-track': '/assets/scenes/diskusi.png',
  'community-reaction-strip': '/assets/scenes/diskusi.png',
};

const stageBgCache = new Map<string, HTMLImageElement>();

function getStageBgImage(stage: ActionStageKind, onLoad: () => void): HTMLImageElement | null {
  const url = SCENE_BG_BY_STAGE[stage];
  if (!url || typeof window === 'undefined' || typeof Image === 'undefined') return null;
  const hit = stageBgCache.get(url);
  if (hit) return hit.complete && hit.naturalWidth > 0 ? hit : null;
  const img = new Image();
  img.onload = onLoad;
  img.src = url;
  stageBgCache.set(url, img);
  return null;
}

export const ComicPanelRenderer: React.FC<ComicPanelRendererProps> = ({
  panel,
  pageElapsedMs,
  pageDurationMs,
  reducedMotion = false,
  onStartSimulation,
  onReplayStory,
  onSkipIntro,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [assetVersion, setAssetVersion] = useState<number>(0);
  const panelElapsedMs = Math.max(0, pageElapsedMs - panel.revealAtMs);

  useEffect(() => {
    return onSpriteAssetsReady(() => {
      setAssetVersion((v) => v + 1);
    });
  }, []);

  const transition = useMemo(
    () =>
      computePanelTransitionState(
        panel.enterDirection,
        pageElapsedMs,
        panel.revealAtMs,
        reducedMotion
      ),
    [pageElapsedMs, panel.enterDirection, panel.revealAtMs, reducedMotion]
  );

  const speakingIds = useMemo(() => {
    const active = new Set<string>();
    for (const dlg of panel.dialogues) {
      if (
        dlg.speakerId &&
        pageElapsedMs >= dlg.startOffsetMs &&
        pageElapsedMs <= dlg.startOffsetMs + dlg.durationMs
      ) {
        active.add(dlg.speakerId);
      }
    }
    return active;
  }, [pageElapsedMs, panel.dialogues]);

  // Anchor posisi kepala karakter untuk ekor balon dialog
  const actorAnchors = useMemo(() => {
    const map: Record<string, RenderedActorAnchor> = {};
    if (panel.actionStage !== 'lab-map-wide') {
      for (const actor of panel.actors) {
        const xNorm = actor.stageXNorm ?? 0.5;
        map[actor.characterId] = {
          characterId: actor.characterId,
          name: actor.characterId,
          orderNumber: actor.characterId,
          feetWorldX: xNorm,
          feetWorldY: 0.9,
          xNorm,
          yNorm: 0.34,
        };
      }
      return map;
    }

    const estW = 640;
    const estH = 360;
    const cam = computePanelWorldCamera(
      panel.startViewport,
      panel.endViewport,
      panelElapsedMs,
      pageDurationMs,
      estW,
      estH,
      LAB_MAP.tileSizePx,
      reducedMotion
    );
    for (const actor of panel.actors) {
      const animState = computeMiniSpriteAnimationState(
        actor,
        pageElapsedMs,
        pageDurationMs,
        speakingIds.has(actor.characterId),
        reducedMotion
      );
      const feet = spriteFeet({ x: animState.tileX, y: animState.tileY }, LAB_MAP.tileSizePx);
      const norm = worldTileToPanelNorm(
        animState.tileX,
        animState.tileY,
        cam,
        estW,
        estH,
        LAB_MAP.tileSizePx,
        -SPRITE_WORLD_H * 0.72
      );
      map[actor.characterId] = {
        characterId: actor.characterId,
        name: actor.characterId,
        orderNumber: actor.characterId,
        feetWorldX: feet.x,
        feetWorldY: feet.y,
        xNorm: norm.xNorm,
        yNorm: norm.yNorm,
      };
    }
    return map;
  }, [
    pageDurationMs,
    pageElapsedMs,
    panel.actionStage,
    panel.actors,
    panel.endViewport,
    panel.startViewport,
    panelElapsedMs,
    reducedMotion,
    speakingIds,
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1;
    const w = Math.max(320, Math.round((rect.width || 640) * dpr));
    const h = Math.max(200, Math.round((rect.height || 360) * dpr));

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    const logicW = w / dpr;
    const logicH = h / dpr;
    const tSec = Math.max(0, pageElapsedMs) / 1000;
    const progress01 = Math.max(0, Math.min(1, panelElapsedMs / Math.max(1, pageDurationMs)));

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#0c1624';
    ctx.fillRect(0, 0, logicW, logicH);

    if (panel.actionStage === 'lab-map-wide') {
      renderLabMapWideStage(
        ctx,
        panel,
        logicW,
        logicH,
        pageElapsedMs,
        panelElapsedMs,
        pageDurationMs,
        tSec,
        reducedMotion,
        speakingIds
      );
    } else {
      renderCinematicActionStage(
        ctx,
        panel,
        logicW,
        logicH,
        pageElapsedMs,
        panelElapsedMs,
        progress01,
        tSec,
        reducedMotion,
        speakingIds,
        () => setAssetVersion((v) => v + 1)
      );
    }

    renderPanelAmbientLighting(ctx, panel.ambientTheme, logicW, logicH);
    ctx.restore();
  }, [
    assetVersion,
    pageDurationMs,
    pageElapsedMs,
    panel,
    panelElapsedMs,
    reducedMotion,
    speakingIds,
  ]);

  return (
    <section
      className={`comic-book-panel relative overflow-hidden border-[3.5px] border-slate-950 bg-slate-900 shadow-[5px_5px_0_#020617] ${panel.gridClass}`}
      style={{
        transform: transition.cssTransform,
        clipPath: transition.cssClipPath,
        opacity: transition.opacity,
      }}
      data-panel-id={panel.id}
      data-shot-type={panel.shotType}
      data-camera-direction={panel.cameraDirection}
      data-focus-zones={panel.focusZoneIds.join(',')}
    >
      <div className="pointer-events-none absolute top-2 left-2 z-20 rounded border-2 border-slate-950 bg-slate-950/90 px-2 py-0.5 text-[10px] font-black tracking-wider uppercase text-amber-300 shadow-[2px_2px_0_#020617]">
        {panel.title}
      </div>

      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        data-testid={`comic-canvas-${panel.id}`}
      />

      {transition.impactFlash01 > 0.02 && (
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-amber-100"
          style={{ opacity: transition.impactFlash01 }}
        />
      )}

      <DialogueEngine
        panel={panel}
        pageElapsedMs={pageElapsedMs}
        actorAnchors={actorAnchors}
      />

      {panel.ambientTheme === 'title-climax' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 text-center">
          <div className="rounded-3xl border-[4px] border-slate-950 bg-slate-950/88 px-6 py-5 shadow-[8px_8px_0_#fbbf24] backdrop-blur-md sm:px-10 sm:py-7">
            <div className="mb-2 inline-block -rotate-1 border-2 border-slate-950 bg-amber-400 px-3 py-0.5 font-['Fredoka',sans-serif] text-xs font-black tracking-widest uppercase text-slate-950 shadow">
              ACTION-DRIVEN ANIME MOTION COMIC · 18 MAHASISWA · 11 RUANGAN
            </div>
            <h1 className="font-['Fredoka',sans-serif] text-4xl font-black tracking-tight text-white drop-shadow-[0_4px_0_#020617] sm:text-6xl">
              RUANG DENGAR
            </h1>
            <p className="mt-1 font-['Plus_Jakarta_Sans',sans-serif] text-xs font-black tracking-[0.22em] uppercase text-sky-300 sm:text-base">
              SIMULASI LABORATORIUM ELEKTRONIKA &amp; IoT
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onStartSimulation}
                className="cursor-pointer rounded-xl border-[3px] border-slate-950 bg-gradient-to-b from-amber-300 to-amber-500 px-5 py-2.5 font-['Fredoka',sans-serif] text-xs font-black tracking-wider uppercase text-slate-950 shadow-[4px_4px_0_#020617] transition hover:-translate-y-0.5 active:translate-y-0 sm:text-sm"
                data-testid="comic-intro-cta-start"
              >
                ▶ MULAI SIMULASI
              </button>
              <button
                type="button"
                onClick={onReplayStory}
                className="cursor-pointer rounded-xl border-[3px] border-slate-950 bg-sky-400 px-4 py-2.5 font-['Fredoka',sans-serif] text-xs font-black tracking-wider uppercase text-slate-950 shadow-[4px_4px_0_#020617] transition hover:-translate-y-0.5 sm:text-sm"
                data-testid="comic-intro-cta-replay"
              >
                ↻ ULANGI CERITA
              </button>
              <button
                type="button"
                onClick={onSkipIntro}
                className="cursor-pointer rounded-xl border-[3px] border-slate-950 bg-slate-200 px-4 py-2.5 font-['Fredoka',sans-serif] text-xs font-black tracking-wider uppercase text-slate-950 shadow-[4px_4px_0_#020617] transition hover:-translate-y-0.5 sm:text-sm"
                data-testid="comic-intro-cta-skip"
              >
                ⏭ LEWATI INTRO
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ========================================================================== */
/* STAGE A: WIDE SHOT / FULL-BODY SHOT DI ATAS DUNIA LAB_MAP                  */
/* ========================================================================== */

function renderLabMapWideStage(
  ctx: CanvasRenderingContext2D,
  panel: ComicPanelBlueprint,
  logicW: number,
  logicH: number,
  pageElapsedMs: number,
  panelElapsedMs: number,
  pageDurationMs: number,
  tSec: number,
  reducedMotion: boolean,
  speakingIds: Set<string>
): void {
  const t = LAB_MAP.tileSizePx;
  const worldW = LAB_MAP.width * t;
  const worldH = LAB_MAP.height * t;

  const camera = computePanelWorldCamera(
    panel.startViewport,
    panel.endViewport,
    panelElapsedMs,
    pageDurationMs,
    logicW,
    logicH,
    t,
    reducedMotion
  );

  ctx.save();
  ctx.translate(camera.offsetX, camera.offsetY);
  ctx.scale(camera.scale, camera.scale);

  const backdrop = getIllustratedLabBackdrop(LAB_MAP, 'lab');
  if (backdrop) {
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(backdrop, 0, 0, worldW, worldH);
  }

  type DepthItem =
    | { kind: 'furniture'; baseY: number; item: LabFurniture }
    | { kind: 'actor'; baseY: number; actor: (typeof panel.actors)[number] };

  const items: DepthItem[] = LAB_MAP.furniture.map((item) => ({
    kind: 'furniture',
    baseY: (item.rect.y + item.rect.h) * t,
    item,
  }));

  for (const actor of panel.actors) {
    const animState = computeMiniSpriteAnimationState(
      actor,
      pageElapsedMs,
      pageDurationMs,
      speakingIds.has(actor.characterId),
      reducedMotion
    );
    const feet = spriteFeet({ x: animState.tileX, y: animState.tileY }, t);
    items.push({ kind: 'actor', baseY: feet.y, actor });
  }

  items.sort((a, b) => a.baseY - b.baseY);

  for (const d of items) {
    if (d.kind === 'furniture') {
      drawIllustratedFurniture(ctx, d.item, t, tSec, reducedMotion);
    } else {
      const animState = computeMiniSpriteAnimationState(
        d.actor,
        pageElapsedMs,
        pageDurationMs,
        speakingIds.has(d.actor.characterId),
        reducedMotion
      );
      renderMiniComicCharacter(
        ctx,
        d.actor,
        animState,
        t,
        camera,
        logicW,
        logicH,
        pageElapsedMs,
        reducedMotion
      );
    }
  }

  drawAnimatedLabHolograms(ctx, LAB_MAP, tSec, reducedMotion);
  const focusSet = new Set(panel.focusZoneIds);
  for (const zone of LAB_MAP.zones) {
    drawIllustratedZoneLabel(ctx, zone, t, focusSet.has(zone.id) && focusSet.size <= 3);
  }
  ctx.restore();
}

/* ========================================================================== */
/* STAGE B: EXTREME CLOSE-UP, CLOSE-UP & MEDIUM SHOT ACTION STAGES            */
/* ========================================================================== */

function renderCinematicActionStage(
  ctx: CanvasRenderingContext2D,
  panel: ComicPanelBlueprint,
  w: number,
  h: number,
  pageElapsedMs: number,
  panelElapsedMs: number,
  progress01: number,
  tSec: number,
  reducedMotion: boolean,
  speakingIds: Set<string>,
  onBgReady: () => void
): void {
  // Kamera sinematik terpisah untuk background vs foreground (parallax depth)
  const bgZoom = reducedMotion
    ? 1.02
    : panel.cameraDirection === 'dolly-in'
      ? 1.02 + progress01 * 0.08
      : panel.cameraDirection === 'dolly-out'
        ? 1.1 - progress01 * 0.07
        : 1.04;
  const bgPanX = reducedMotion
    ? 0
    : panel.cameraDirection === 'pan' || panel.cameraDirection === 'tracking'
      ? (-0.03 + progress01 * 0.06) * w
      : 0;

  // 1. LAYER BACKGROUND
  ctx.save();
  ctx.translate(w * 0.5 + bgPanX, h * 0.5);
  ctx.scale(bgZoom, bgZoom);
  ctx.translate(-w * 0.5, -h * 0.5);

  const bgImg = getStageBgImage(panel.actionStage, onBgReady);
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, w, h);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.fillRect(0, 0, w, h);
  } else {
    renderCustomActionBackground(ctx, panel.actionStage, w, h, tSec, panelElapsedMs, reducedMotion);
  }
  ctx.restore();

  // 2. LAYER CHARACTERS (Medium Shot / Close-Up Anime Pose P01-P20)
  for (const actor of panel.actors) {
    renderMediumOrCloseupAnimeActor(
      ctx,
      actor,
      panel.shotType,
      w,
      h,
      speakingIds.has(actor.characterId),
      pageElapsedMs,
      reducedMotion
    );
  }

  // 3. LAYER FOREGROUND PROPS & ENVIRONMENT INTERACTION
  renderForegroundActionProps(ctx, panel.actionStage, w, h, tSec, panelElapsedMs, reducedMotion);
}

function renderCustomActionBackground(
  ctx: CanvasRenderingContext2D,
  stage: ActionStageKind,
  w: number,
  h: number,
  tSec: number,
  panelElapsedMs: number,
  reducedMotion: boolean
): void {
  if (stage === 'building-sign-ecu') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#0284c7');
    grad.addColorStop(0.6, '#38bdf8');
    grad.addColorStop(1, '#fef08a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Papan Nama Gedung Laboratorium Berdetail Tinggi
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(w * 0.08, h * 0.30, w * 0.84, h * 0.44, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = `900 ${Math.max(12, Math.round(w * 0.052))}px "Fredoka", sans-serif`;
    ctx.fillText('LABORATORIUM', w * 0.14, h * 0.50);
    ctx.fillStyle = '#38bdf8';
    ctx.font = `800 ${Math.max(10, Math.round(w * 0.042))}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText('ELEKTRONIKA & IoT', w * 0.14, h * 0.65);

    const sway = reducedMotion ? 0 : Math.sin(tSec * 2.6) * 8;
    ctx.fillStyle = '#16a34a';
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.ellipse(w * 0.14 + i * 26 + sway, h * 0.15 + (i % 2) * 10, 22, 11, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    return;
  }

  if (stage === 'stepping-feet-ecu') {
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, h * 0.45, w, h * 0.55);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i += 1) {
      const gx = (w / 5) * i;
      ctx.beginPath();
      ctx.moveTo(gx, h * 0.45);
      ctx.lineTo(gx - 38, h);
      ctx.stroke();
    }

    const cycle = reducedMotion ? 0.6 : tSec * 5.6;
    const s = Math.sin(cycle);
    const c = Math.cos(cycle);
    drawSteppingShoe(ctx, (0.34 + s * 0.1) * w, (0.76 - Math.max(0, c) * 0.12) * h, -c * 0.2, '#1e3a8a', '#7f1d1d');
    drawSteppingShoe(ctx, (0.64 - s * 0.1) * w, (0.76 - Math.max(0, -c) * 0.12) * h, c * 0.2, '#1e293b', '#991b1b');
    return;
  }

  if (stage === 'door-handle-ecu') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w * 0.45, 0, w * 0.18, h);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(w * 0.63, 0, w * 0.37, h);

    const p = reducedMotion ? 1 : Math.min(1, panelElapsedMs / 750);
    const press = reducedMotion ? 0.36 : Math.max(0, Math.min(1, (panelElapsedMs - 650) / 500)) * 0.4;
    const clicked = press > 0.2;

    // Indikator RFID hijau saat pintu terbuka
    ctx.fillStyle = clicked ? '#22c55e' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(w * 0.54, h * 0.28, 7, 0, Math.PI * 2);
    ctx.fill();

    // Gagang Pintu Baja
    const px = w * 0.54;
    const py = h * 0.54;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(press);
    ctx.fillStyle = '#e2e8f0';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-6, -8, 62, 16, 7);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Tangan meraih & menekan gagang
    const hx = (0.2 + p * 0.34) * w;
    const hy = (0.66 - p * 0.12 + press * 0.08) * h;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.8);
    ctx.lineTo(hx, hy);
    ctx.stroke();
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.8);
    ctx.lineTo(hx - 12, hy + 5);
    ctx.stroke();
    ctx.fillStyle = '#eab98f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(hx + 5, hy, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

function drawSteppingShoe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  pantCol: string,
  shoeCol: string
): void {
  ctx.save();
  ctx.translate(x, y);
  // Bayangan kontak lantai
  ctx.fillStyle = 'rgba(2, 6, 23, 0.38)';
  ctx.beginPath();
  ctx.ellipse(8, 16, 36, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.rotate(angle);
  ctx.fillStyle = pantCol;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.8;
  ctx.beginPath();
  ctx.roundRect(-20, -88, 38, 78, 6);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = shoeCol;
  ctx.beginPath();
  ctx.roundRect(-22, -14, 66, 24, 9);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-22, 4, 66, 5);
  ctx.restore();
}

function renderForegroundActionProps(
  ctx: CanvasRenderingContext2D,
  stage: ActionStageKind,
  w: number,
  h: number,
  tSec: number,
  _panelElapsedMs: number,
  reducedMotion: boolean
): void {
  ctx.save();

  if (stage === 'oscilloscope-medium-bench') {
    // Meja praktikum depan + Osiloskop gelombang sinus hidup + PCB hijau
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.fillRect(0, h * 0.80, w, h * 0.20);
    ctx.strokeRect(0, h * 0.80, w, h * 0.20);

    // Layar Osiloskop
    const ox = w * 0.38;
    const oy = h * 0.64;
    const ow = w * 0.26;
    const oh = h * 0.24;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(ox, oy, ow, oh, 6);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let x = 0; x <= ow - 14; x += 4) {
      const sy = oy + oh * 0.5 + Math.sin(x * 0.16 + tSec * 7) * (oh * 0.26);
      if (x === 0) ctx.moveTo(ox + 7 + x, sy);
      else ctx.lineTo(ox + 7 + x, sy);
    }
    ctx.stroke();
  } else if (stage === 'coding-medium-desk' || stage === 'studio-design-medium') {
    // Meja komputer depan + Monitor dengan baris kode / UI
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.fillRect(0, h * 0.82, w, h * 0.18);
    ctx.strokeRect(0, h * 0.82, w, h * 0.18);

    const mx = w * 0.36;
    const my = h * 0.66;
    const mw = w * 0.28;
    const mh = h * 0.22;
    ctx.fillStyle = '#090d16';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, 5);
    ctx.fill();
    ctx.stroke();

    const cols = ['#38bdf8', '#4ade80', '#fbbf24', '#c084fc'];
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = cols[i];
      const len = ((i * 21 + Math.floor(tSec * 5) * 6) % 55) + 30;
      ctx.fillRect(mx + 8, my + 8 + i * 9, (mw - 18) * (len / 100), 3.5);
    }
  } else if (stage === 'printer-3d-ecu') {
    // Frame Printer 3D di foreground kiri + Nozzle bergerak mencetak objek cyan
    const px = w * 0.08;
    const py = h * 0.26;
    const pw = w * 0.52;
    const ph = h * 0.62;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.roundRect(px, py, pw, ph, 8);
    ctx.fill();
    ctx.stroke();

    const nx = px + pw * (0.5 + (reducedMotion ? 0 : Math.sin(tSec * 3.6) * 0.28));
    const ny = py + ph * 0.54;
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + 8, ny - 10);
    ctx.lineTo(px + pw - 8, ny - 10);
    ctx.stroke();

    ctx.fillStyle = '#f97316';
    ctx.fillRect(nx - 12, ny - 16, 24, 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(px + pw * 0.30, ny, pw * 0.40, ph * 0.28);
  } else if (stage === 'welding-k3-medium') {
    // Meja kerja industrial K3 + Percikan api las
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.6;
    ctx.fillRect(0, h * 0.80, w, h * 0.20);
    ctx.strokeRect(0, h * 0.80, w, h * 0.20);

    // Kilatan & bunga api las
    const fx = w * 0.48;
    const fy = h * 0.78;
    const g = ctx.createRadialGradient(fx, fy, 2, fx, fy, 36);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.4, '#38bdf8');
    g.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(fx, fy, 36, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 12; i += 1) {
      const ph = (tSec * 2.4 + i * 0.19) % 1;
      const ang = -Math.PI * 0.85 + (i % 6) * 0.28;
      const dist = ph * 68;
      ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#fb923c';
      ctx.beginPath();
      ctx.arc(fx + Math.cos(ang) * dist, fy + Math.sin(ang) * dist + ph * ph * 45, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (stage === 'discussion-medium-table' || stage === 'reading-corner-medium') {
    // Meja diskusi kayu ek + Dokumen skema terbuka + Laptop
    ctx.fillStyle = '#b47438';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.6;
    ctx.fillRect(0, h * 0.80, w, h * 0.20);
    ctx.strokeRect(0, h * 0.80, w, h * 0.20);

    // Dokumen skema putih di tengah meja
    ctx.fillStyle = '#fffbeb';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.6;
    ctx.fillRect(w * 0.40, h * 0.83, w * 0.20, h * 0.12);
    ctx.strokeRect(w * 0.40, h * 0.83, w * 0.20, h * 0.12);
  } else if (stage === 'robotics-corridor-track') {
    // Rover robotika bergerak melintasi lantai depan
    const rx = w * (0.48 + (reducedMotion ? 0 : Math.sin(tSec * 2.2) * 0.08));
    const ry = h * 0.88;
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(rx - 30, ry - 18, 60, 18, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(rx + 8, ry - 22, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}

function renderPanelAmbientLighting(
  ctx: CanvasRenderingContext2D,
  theme: ComicPanelBlueprint['ambientTheme'],
  w: number,
  h: number
): void {
  ctx.save();
  if (theme === 'morning-exterior') {
    const sunGrad = ctx.createLinearGradient(0, 0, w * 0.75, h * 0.65);
    sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
    sunGrad.addColorStop(0.45, 'rgba(251, 191, 36, 0.07)');
    sunGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);
  } else if (theme === 'title-climax') {
    const titleGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.1, w * 0.5, h * 0.5, w * 0.72);
    titleGrad.addColorStop(0, 'rgba(15, 23, 42, 0.14)');
    titleGrad.addColorStop(1, 'rgba(2, 6, 23, 0.62)');
    ctx.fillStyle = titleGrad;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3);
  ctx.restore();
}
