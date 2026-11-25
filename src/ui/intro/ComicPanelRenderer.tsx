import React, { useEffect, useMemo, useRef } from 'react';
import {
  ComicPanelBlueprint,
  PanelSceneType,
} from './StoryTimeline';
import {
  computeCharacterSkeletalPose,
  computeCloseupFeetPose,
  computeCloseupHandDoorPose,
} from './CharacterAnimationEngine';
import {
  RenderedActorAnchor,
  renderFullBodyComicCharacter,
} from './ComicCharacterRenderer';
import { computePanelCameraMatrix } from './ComicCameraController';
import { computePanelTransitionState } from './ComicTransitionEngine';
import { DialogueEngine } from './DialogueEngine';

export interface ComicPanelRendererProps {
  panel: ComicPanelBlueprint;
  pageElapsedMs: number;
  pageDurationMs: number;
  reducedMotion?: boolean;
  onStartSimulation?: () => void;
  onReplayStory?: () => void;
  onSkipIntro?: () => void;
}

const SCENE_BG_URLS: Partial<Record<PanelSceneType, string>> = {
  'page2-wide-doors-open-lab': '/assets/scenes/diskusi.png',
  'page3-panelA-soldering': '/assets/scenes/elektronik.png',
  'page3-panelB-coding': '/assets/scenes/pemrograman.png',
  'page3-panelC-3dprinter': '/assets/scenes/cetak3d.png',
  'page3-panelD-welding': '/assets/scenes/las.png',
  'page4-groupA-elektronika': '/assets/scenes/elektronik.png',
  'page4-groupB-firmware-ui': '/assets/scenes/pemrograman.png',
  'page4-groupC-instrument-3d': '/assets/scenes/cetak3d.png',
  'page4-groupD-diskusi-riset': '/assets/scenes/konsultasi.png',
  'page4-groupE-robotika': '/assets/scenes/diskusi.png',
  'page5-splash-one-laboratory': '/assets/scenes/diskusi.png',
  'page6-splash-title-reveal': '/assets/scenes/elektronik.png',
};

const loadedImagesCache = new Map<string, HTMLImageElement>();

function getOrLoadSceneImage(url: string | undefined): HTMLImageElement | null {
  if (!url || typeof window === 'undefined' || typeof Image === 'undefined') return null;
  const existing = loadedImagesCache.get(url);
  if (existing) {
    return existing.complete && existing.naturalWidth > 0 ? existing : null;
  }
  const img = new Image();
  img.src = url;
  loadedImagesCache.set(url, img);
  return null;
}

/**
 * Merender 7 Layer Visual Panel Komik pada Canvas 2D:
 * Layer 1: Background (Langit, dinding arsitektur, gambar ruangan HD)
 * Layer 2: Environment (Gedung kampus, pepohonan bergerak, meja praktikum, osiloskop, monitor kode, printer 3D, bilik las K3)
 * Layer 3: Character (Karakter 2D full-body beranimasi rangka)
 * Layer 4: Props (Meja depan, papan PCB, keyboard, rover robotika bergerak)
 * Layer 5: Foreground (Siluet daun, berkas sinar matahari pagi, tepi meja)
 * Layer 6: Effects (Garis kecepatan komik / speed lines, asap solder, percikan las)
 * Layer 7: Dialogue (via DialogueEngine)
 */
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
  const panelElapsedMs = Math.max(0, pageElapsedMs - panel.revealAtMs);

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

  // Hitung koordinat mulut karakter secara deterministik untuk ekor balon dialog
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

  const actorAnchors = useMemo(() => {
    const map: Record<string, RenderedActorAnchor> = {};
    for (const actor of panel.actors) {
      const pose = computeCharacterSkeletalPose(
        actor,
        pageElapsedMs,
        pageDurationMs,
        speakingIds.has(actor.characterId),
        reducedMotion
      );
      map[actor.characterId] = {
        characterId: actor.characterId,
        name: actor.characterId,
        orderNumber: actor.characterId,
        mouthX: pose.xNorm,
        mouthY: Math.max(0.28, pose.yNorm - 0.34 * actor.scale),
        headTopY: Math.max(0.18, pose.yNorm - 0.46 * actor.scale),
        centerX: pose.xNorm,
        xNorm: pose.xNorm,
        yNorm: Math.max(0.32, pose.yNorm - 0.32 * actor.scale),
      } as RenderedActorAnchor & { xNorm: number; yNorm: number };
    }
    return map;
  }, [pageDurationMs, pageElapsedMs, panel.actors, reducedMotion, speakingIds]);

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

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, logicW, logicH);

    // Kamera 2D Sinematik per panel
    const cam = computePanelCameraMatrix(
      panel.cameraPreset,
      panelElapsedMs,
      pageDurationMs,
      reducedMotion
    );

    ctx.translate(logicW * 0.5 + cam.shakeXPx, logicH * 0.5 + cam.shakeYPx);
    ctx.rotate(cam.rotationRad);
    ctx.scale(cam.zoom, cam.zoom);
    ctx.translate(
      -logicW * 0.5 - cam.panXNorm * logicW,
      -logicH * 0.5 - cam.panYNorm * logicH
    );

    const tSec = Math.max(0, pageElapsedMs) / 1000;

    // ========================================================================
    // LAYER 1: BACKGROUND & LAYER 2: ENVIRONMENT
    // ========================================================================
    renderSceneEnvironment(ctx, panel.sceneType, logicW, logicH, tSec, panelElapsedMs, reducedMotion);

    // ========================================================================
    // LAYER 3: FULL-BODY ANIMATED CHARACTERS
    // ========================================================================
    const sortedActors = [...panel.actors].sort((a, b) => a.yNorm - b.yNorm);
    for (const actor of sortedActors) {
      const pose = computeCharacterSkeletalPose(
        actor,
        pageElapsedMs,
        pageDurationMs,
        speakingIds.has(actor.characterId),
        reducedMotion
      );
      renderFullBodyComicCharacter(ctx, actor, pose, logicW, logicH);
    }

    // ========================================================================
    // LAYER 4: FOREGROUND PROPS & EQUIPMENT (Meja Kerja, Rover Robotika, Percikan)
    // ========================================================================
    renderSceneForegroundProps(ctx, panel.sceneType, logicW, logicH, tSec, reducedMotion);

    // ========================================================================
    // LAYER 5 & 6: FOREGROUND LIGHTING & COMIC MOTION EFFECTS (Speed Lines)
    // ========================================================================
    renderComicSpeedLinesAndLighting(
      ctx,
      panel.sceneType,
      logicW,
      logicH,
      tSec,
      transition.speedLinesIntensity01
    );

    ctx.restore();
  }, [
    pageDurationMs,
    pageElapsedMs,
    panel.actors,
    panel.cameraPreset,
    panel.sceneType,
    panelElapsedMs,
    reducedMotion,
    speakingIds,
    transition.speedLinesIntensity01,
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
      data-scene-type={panel.sceneType}
    >
      {/* Kanvas 7-Layer Ilustrasi 2D Penuh */}
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        data-testid={`comic-canvas-${panel.id}`}
      />

      {/* Kilatan Impact Frame saat panel baru terbuka */}
      {transition.impactFlash01 > 0.02 && (
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-amber-100"
          style={{ opacity: transition.impactFlash01 }}
        />
      )}

      {/* Layer 7: Balon Dialog, Narasi & Onomatopoeia */}
      <DialogueEngine
        panel={panel}
        pageElapsedMs={pageElapsedMs}
        actorAnchors={actorAnchors}
      />

      {/* Overlay Dramatis Judul Utama pada PAGE 6 — TITLE REVEAL */}
      {panel.sceneType === 'page6-splash-title-reveal' && (
        <div className=" absolute inset-0 z-30 flex flex-col items-center justify-center px-4 text-center">
          <div className="rounded-3xl border-[4px] border-slate-950 bg-slate-950/88 px-6 py-5 shadow-[8px_8px_0_#fbbf24] backdrop-blur-md sm:px-10 sm:py-7">
            <div className="mb-2 inline-block -rotate-1 border-2 border-slate-950 bg-amber-400 px-3 py-0.5 font-['Fredoka',sans-serif] text-xs font-black tracking-widest uppercase text-slate-950 shadow">
              SIMULASI INTERAKTIF · 18 MAHASISWA · 11 RUANGAN LABORATORIUM
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
/* PELUKIS LINGKUNGAN 2D BERDETAIL TINGGI (LAYER 1 & LAYER 2)                  */
/* ========================================================================== */

function renderSceneEnvironment(
  ctx: CanvasRenderingContext2D,
  sceneType: PanelSceneType,
  w: number,
  h: number,
  tSec: number,
  panelElapsedMs: number,
  reducedMotion: boolean
): void {
  const bgImg = getOrLoadSceneImage(SCENE_BG_URLS[sceneType]);

  switch (sceneType) {
    case 'page1-splash-campus-morning': {
      // Langit fajar keemasan & biru cerah
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      sky.addColorStop(0, '#1e3a8a');
      sky.addColorStop(0.45, '#38bdf8');
      sky.addColorStop(0.85, '#fde68a');
      sky.addColorStop(1, '#fed7aa');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      // Matahari pagi bersinar
      const sunX = w * 0.18;
      const sunY = h * 0.22;
      const sunGlow = ctx.createRadialGradient(sunX, sunY, 6, sunX, sunY, w * 0.35);
      sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.95)');
      sunGlow.addColorStop(0.4, 'rgba(251, 191, 36, 0.35)');
      sunGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = sunGlow;
      ctx.fillRect(0, 0, w, h);

      // Awan pagi bergerak pelan
      const cloudDrift = reducedMotion ? 0 : (tSec * 12) % 160;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
      for (let i = 0; i < 3; i += 1) {
        const cx = ((w * 0.25 * (i + 1) + cloudDrift) % (w + 120)) - 60;
        const cy = h * (0.14 + i * 0.06);
        ctx.beginPath();
        ctx.roundRect(cx, cy, 110, 24, 12);
        ctx.fill();
      }

      // Halaman & Jalan Kampus
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, h * 0.62, w, h * 0.38);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(w, h * 0.72);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Garis ubin trotoar perspektif
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i += 1) {
        const px = (w / 9) * i;
        ctx.beginPath();
        ctx.moveTo(px, h * 0.75);
        ctx.lineTo(px - 35, h);
        ctx.stroke();
      }

      // GEDUNG LABORATORIUM ELEKTRONIKA & IoT 2D Lengkap dengan Jendela & Pintu Kaca
      const bx = w * 0.24;
      const by = h * 0.18;
      const bw = w * 0.68;
      const bh = h * 0.56;

      // Struktur Utama Gedung
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 6);
      ctx.fill();
      ctx.stroke();

      // Atap Fasad Modern
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bx - 10, by - 12, bw + 20, 18);
      ctx.strokeRect(bx - 10, by - 12, bw + 20, 18);

      // Papan Nama Gedung
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx + bw * 0.12, by + 10, bw * 0.76, 26);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx + bw * 0.12, by + 10, bw * 0.76, 26);
      ctx.fillStyle = '#fef08a';
      ctx.font = `900 ${Math.max(10, Math.round(w * 0.018))}px "Fredoka", sans-serif`;
      ctx.fillText('LABORATORIUM ELEKTRONIKA & IoT', bx + bw * 0.18, by + 28);

      // Deretan Jendela Kaca Lantai 1 & 2 yang memperlihatkan lampu lab menyala
      const cols = 5;
      const winW = (bw * 0.8) / cols;
      for (let r = 0; r < 2; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          if (r === 1 && (c === 1 || c === 2)) continue; // Ruang pintu utama
          const wx = bx + bw * 0.08 + c * (winW + 8);
          const wy = by + 48 + r * (bh * 0.36);
          ctx.fillStyle = r === 1 ? '#fde68a' : '#38bdf8';
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2.2;
          ctx.fillRect(wx, wy, winW - 6, bh * 0.25);
          ctx.strokeRect(wx, wy, winW - 6, bh * 0.25);
        }
      }

      // Pintu Kaca Geser Utama & Kanopi
      const doorX = bx + bw * 0.26;
      const doorY = by + bh * 0.52;
      const doorW = bw * 0.32;
      const doorH = bh * 0.48;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(doorX, doorY, doorW, doorH);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeRect(doorX, doorY, doorW, doorH);

      // Pepohonan Kampus Bergerak Tertiup Angin Pagi
      const sway = reducedMotion ? 0 : Math.sin(tSec * 2.3) * 7;
      drawSwayingCampusTree(ctx, w * 0.11, h * 0.72, h * 0.42, sway);
      drawSwayingCampusTree(ctx, w * 0.92, h * 0.70, h * 0.38, -sway * 0.8);
      break;
    }

    case 'page1-detail-sunlight-sign': {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#0284c7');
      grad.addColorStop(0.6, '#38bdf8');
      grad.addColorStop(1, '#fef08a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Close-up Papan Fasad Gedung & Dedaunan Pagi
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.fillRect(w * 0.08, h * 0.36, w * 0.84, h * 0.42);
      ctx.strokeRect(w * 0.08, h * 0.36, w * 0.84, h * 0.42);

      ctx.fillStyle = '#fbbf24';
      ctx.font = `900 ${Math.max(12, Math.round(w * 0.048))}px "Fredoka", sans-serif`;
      ctx.fillText('GEDUNG LAB VOKASI', w * 0.15, h * 0.56);
      ctx.fillStyle = '#38bdf8';
      ctx.font = `700 ${Math.max(10, Math.round(w * 0.035))}px "Plus Jakarta Sans", sans-serif`;
      ctx.fillText('ELEKTRONIKA · MCU · LAS K3 · 3D', w * 0.15, h * 0.70);

      // Ranting daun bergerak di sudut atas
      const sway = reducedMotion ? 0 : Math.sin(tSec * 2.8) * 9;
      ctx.fillStyle = '#16a34a';
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i += 1) {
        ctx.beginPath();
        ctx.ellipse(w * 0.15 + i * 28 + sway, h * 0.16 + (i % 2) * 14, 24, 13, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      break;
    }

    case 'page1-detail-sensor-morning': {
      // Dinding pilar gedung & kotak modul sensor cuaca IoT kampus
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#475569';
      ctx.fillRect(w * 0.15, 0, w * 0.7, h);

      // Kotak Enclosure Sensor IoT
      const sx = w * 0.24;
      const sy = h * 0.22;
      const sw = w * 0.52;
      const sh = h * 0.58;
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(sx, sy, sw, sh, 10);
      ctx.fill();
      ctx.stroke();

      // Layar OLED Telemetri Menyala
      ctx.fillStyle = '#022c22';
      ctx.fillRect(sx + 12, sy + 14, sw - 24, sh * 0.52);
      ctx.fillStyle = '#34d399';
      ctx.font = `800 ${Math.max(10, Math.round(w * 0.042))}px monospace`;
      ctx.fillText('IoT NODE #01', sx + 20, sy + 34);
      ctx.fillText('TEMP : 24.5 C', sx + 20, sy + 54);

      // LED indikator berkedip
      const ledOn = Math.floor(tSec * 3) % 2 === 0;
      ctx.fillStyle = ledOn ? '#22c55e' : '#14532d';
      ctx.beginPath();
      ctx.arc(sx + sw - 22, sy + sh - 18, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'page2-wide-veranda-walk': {
      // Koridor beranda menuju pintu kaca laboratorium
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);

      // Jendela kaca besar di sepanjang koridor
      for (let i = 0; i < 4; i += 1) {
        const wx = w * 0.06 + i * (w * 0.22);
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.fillRect(wx, h * 0.12, w * 0.18, h * 0.48);
        ctx.strokeRect(wx, h * 0.12, w * 0.18, h * 0.48);
      }

      // Lantai keramik koridor
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, h * 0.72, w, h * 0.28);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      for (let i = 0; i <= 10; i += 1) {
        const tx = (w / 10) * i;
        ctx.beginPath();
        ctx.moveTo(tx, h * 0.72);
        ctx.lineTo(tx - 30, h);
        ctx.stroke();
      }
      break;
    }

    case 'page2-closeup-feet-stepping': {
      // Close-up lantai keramik & langkah sepatu mahasiswa (TAP... TAP...)
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(0, h * 0.45, w, h * 0.55);

      // Garis sambungan ubin keramik
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 6; i += 1) {
        const x = (w / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, h * 0.45);
        ctx.lineTo(x - 45, h);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(0, h * 0.72);
      ctx.lineTo(w, h * 0.72);
      ctx.stroke();

      const feet = computeCloseupFeetPose(panelElapsedMs, reducedMotion);
      drawCloseupSteppingShoe(ctx, feet.leftShoeXNorm * w, feet.leftShoeYNorm * h, feet.leftShoeAngleRad, '#1e3a8a', '#991b1b');
      drawCloseupSteppingShoe(ctx, feet.rightShoeXNorm * w, feet.rightShoeYNorm * h, feet.rightShoeAngleRad, '#1e293b', '#7f1d1d');
      break;
    }

    case 'page2-closeup-hand-door': {
      // Close-up Pintu Kaca Laboratorium, Gagang Baja & Tangan Menekan (KLIK!)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);

      // Bingkai Pintu Aluminium & Kaca Biru
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w * 0.46, 0, w * 0.16, h);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(w * 0.62, 0, w * 0.38, h);

      const handPose = computeCloseupHandDoorPose(panelElapsedMs, reducedMotion);

      // Indikator Akses Pintu Pintar
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.fillRect(w * 0.49, h * 0.22, w * 0.1, h * 0.16);
      ctx.strokeRect(w * 0.49, h * 0.22, w * 0.1, h * 0.16);
      ctx.fillStyle = handPose.latchClicked ? '#22c55e' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(w * 0.54, h * 0.30, 7, 0, Math.PI * 2);
      ctx.fill();

      // Dudukan & Tuas Gagang Pintu Baja
      const pivotX = w * 0.54;
      const pivotY = h * 0.54;
      ctx.fillStyle = '#94a3b8';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(pivotX, pivotY, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.translate(pivotX, pivotY);
      ctx.rotate(handPose.handlePressRad);
      ctx.fillStyle = '#e2e8f0';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-6, -8, 68, 16, 7);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Lengan & Tangan Meraih Gagang Pintu
      const hx = handPose.handXNorm * w;
      const hy = handPose.handYNorm * h;
      ctx.save();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 28;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(hx, hy);
      ctx.stroke();

      ctx.strokeStyle = '#1e3a5f'; // lengan blazer/kemeja
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(hx - 14, hy + 6);
      ctx.stroke();

      // Telapak tangan menggenggam gagang
      ctx.fillStyle = '#eab98f';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(hx + 6, hy, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      break;
    }

    default: {
      // Gunakan gambar latar ruangan HD bila sudah dimuat, ditambah detail arsitektur 2D
      if (bgImg) {
        ctx.drawImage(bgImg, 0, 0, w, h);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.24)';
        ctx.fillRect(0, 0, w, h);
      } else {
        const roomGrad = ctx.createLinearGradient(0, 0, 0, h);
        roomGrad.addColorStop(0, '#0f172a');
        roomGrad.addColorStop(0.65, '#1e293b');
        roomGrad.addColorStop(1, '#334155');
        ctx.fillStyle = roomGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // Lantai laboratorium & garis ubin
      ctx.fillStyle = 'rgba(30, 41, 59, 0.78)';
      ctx.fillRect(0, h * 0.74, w, h * 0.26);
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i <= 12; i += 1) {
        const gx = (w / 12) * i;
        ctx.beginPath();
        ctx.moveTo(gx, h * 0.74);
        ctx.lineTo(gx - 24, h);
        ctx.stroke();
      }

      // Peralatan belakang spesifik per ruangan (Osiloskop, Monitor Koding, Printer 3D, Bilik Las K3)
      renderRoomBackWallEquipment(ctx, sceneType, w, h, tSec);
      break;
    }
  }
}

function drawSwayingCampusTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  treeH: number,
  swayPx: number
): void {
  ctx.save();
  // Batang pohon
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x - 10, groundY);
  ctx.lineTo(x - 6 + swayPx * 0.25, groundY - treeH * 0.55);
  ctx.lineTo(x + 6 + swayPx * 0.25, groundY - treeH * 0.55);
  ctx.lineTo(x + 10, groundY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rimbun daun berlapis
  const clusters = [
    { dx: 0, dy: -treeH * 0.72, r: treeH * 0.28, color: '#15803d' },
    { dx: -treeH * 0.18, dy: -treeH * 0.62, r: treeH * 0.22, color: '#16a34a' },
    { dx: treeH * 0.18, dy: -treeH * 0.62, r: treeH * 0.22, color: '#22c55e' },
  ];
  for (const c of clusters) {
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(x + c.dx + swayPx, groundY + c.dy, c.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawCloseupSteppingShoe(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angleRad: number,
  pantColor: string,
  shoeColor: string
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angleRad);

  // Betis celana panjang
  ctx.fillStyle = pantColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-22, -95, 42, 85, 6);
  ctx.fill();
  ctx.stroke();

  // Sepatu laboratorium
  ctx.fillStyle = shoeColor;
  ctx.beginPath();
  ctx.roundRect(-26, -16, 74, 28, 10);
  ctx.fill();
  ctx.stroke();

  // Sol putih
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-26, 6, 74, 6);
  ctx.restore();
}

function renderRoomBackWallEquipment(
  ctx: CanvasRenderingContext2D,
  sceneType: PanelSceneType,
  w: number,
  h: number,
  tSec: number
): void {
  ctx.save();
  if (
    sceneType === 'page3-panelA-soldering' ||
    sceneType === 'page4-groupA-elektronika' ||
    sceneType === 'page2-wide-doors-open-lab'
  ) {
    // Osiloskop Digital dengan Gelombang Sinusoidal Hidup
    const ox = w * 0.44;
    const oy = h * 0.34;
    const ow = w * 0.22;
    const oh = h * 0.24;
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(ox, oy, ow, oh, 6);
    ctx.fill();
    ctx.stroke();

    // Gelombang hijau-sian bergerak
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    for (let x = 0; x <= ow - 16; x += 4) {
      const wy = oy + oh * 0.5 + Math.sin(x * 0.14 + tSec * 8) * (oh * 0.26);
      if (x === 0) ctx.moveTo(ox + 8 + x, wy);
      else ctx.lineTo(ox + 8 + x, wy);
    }
    ctx.stroke();
  }

  if (sceneType === 'page3-panelB-coding' || sceneType === 'page4-groupB-firmware-ui') {
    // Dual Monitor Pemrograman dengan Baris Kode Berjalan
    for (let m = 0; m < 2; m += 1) {
      const mx = w * (0.22 + m * 0.32);
      const my = h * 0.30;
      const mw = w * 0.24;
      const mh = h * 0.26;
      ctx.fillStyle = '#090d16';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(mx, my, mw, mh, 5);
      ctx.fill();
      ctx.stroke();

      // Baris kode warna-warni
      const codeColors = ['#38bdf8', '#4ade80', '#fbbf24', '#c084fc'];
      for (let line = 0; line < 5; line += 1) {
        ctx.fillStyle = codeColors[(line + m) % codeColors.length];
        const len = ((line * 19 + Math.floor(tSec * 6) * 7) % 60) + 25;
        ctx.fillRect(mx + 10, my + 10 + line * 11, (mw - 24) * (len / 100), 4);
      }
    }
  }

  if (sceneType === 'page3-panelC-3dprinter' || sceneType === 'page4-groupC-instrument-3d') {
    // Unit Printer 3D CoreXY dengan Extruder Bergerak
    const px = w * 0.38;
    const py = h * 0.26;
    const pw = w * 0.26;
    const ph = h * 0.42;
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, pw, ph);

    const nozzleX = px + pw * (0.5 + 0.28 * Math.sin(tSec * 3.8));
    const nozzleY = py + ph * 0.56;
    // Rel horizontal gantry
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + 6, nozzleY - 10);
    ctx.lineTo(px + pw - 6, nozzleY - 10);
    ctx.stroke();

    // Kepala Extruder Menyala
    ctx.fillStyle = '#f97316';
    ctx.fillRect(nozzleX - 10, nozzleY - 16, 20, 16);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(px + pw * 0.34, nozzleY, pw * 0.32, ph * 0.24);
  }
  ctx.restore();
}

/* ========================================================================== */
/* LAYER 4: MEJA PRAKTIKUM DEPAN, ROVER ROBOTIKA & PARTIKEL ALAT               */
/* ========================================================================== */

function renderSceneForegroundProps(
  ctx: CanvasRenderingContext2D,
  sceneType: PanelSceneType,
  w: number,
  h: number,
  tSec: number,
  reducedMotion: boolean
): void {
  ctx.save();

  // Meja Praktikum / Meja Diskusi di depan karakter sehingga karakter menyatu di dalam ruangan
  if (
    sceneType === 'page3-panelA-soldering' ||
    sceneType === 'page3-panelB-coding' ||
    sceneType === 'page3-panelD-welding' ||
    sceneType === 'page4-groupA-elektronika' ||
    sceneType === 'page4-groupB-firmware-ui' ||
    sceneType === 'page4-groupD-diskusi-riset'
  ) {
    const tableY = h * 0.77;
    ctx.fillStyle = sceneType === 'page3-panelD-welding' ? '#334155' : '#78350f';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.roundRect(w * 0.14, tableY, w * 0.72, h * 0.16, 6);
    ctx.fill();
    ctx.stroke();

    // Alas solder hijau / PCB di meja elektronika
    if (sceneType === 'page3-panelA-soldering' || sceneType === 'page4-groupA-elektronika') {
      ctx.fillStyle = '#065f46';
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 1.8;
      ctx.fillRect(w * 0.34, tableY + 4, w * 0.26, 14);
      ctx.strokeRect(w * 0.34, tableY + 4, w * 0.26, 14);

      // Asap solder tipis membumbung ke atas
      if (!reducedMotion) {
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let y = 0; y < 38; y += 3) {
          const sx = w * 0.44 + Math.sin(y * 0.22 - tSec * 5) * 6;
          const sy = tableY - y;
          if (y === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }
    }

    // Percikan Bunga Api Las K3 (Flying Welding Sparks)
    if (sceneType === 'page3-panelD-welding') {
      for (let i = 0; i < 14; i += 1) {
        const phase = ((tSec * 2.4 + i * 0.17) % 1);
        const angle = -Math.PI * 0.85 + (i % 7) * 0.24;
        const dist = phase * 75;
        const sx = w * 0.48 + Math.cos(angle) * dist;
        const sy = tableY - 4 + Math.sin(angle) * dist + phase * phase * 55;
        ctx.fillStyle = i % 2 === 0 ? '#fef08a' : '#fb923c';
        ctx.beginPath();
        ctx.arc(sx, sy, 2.4 * (1 - phase * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // Rover Robotika 4-Roda Bergerak di Lantai (Page 4E & Page 5)
  if (
    sceneType === 'page4-groupE-robotika' ||
    sceneType === 'page5-splash-one-laboratory'
  ) {
    const roverOffset = reducedMotion ? 0 : Math.sin(tSec * 2.2) * (w * 0.05);
    const rx = w * 0.48 + roverOffset;
    const ry = h * 0.88;

    // Bodi Sasis Rover
    ctx.fillStyle = '#0284c7';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.roundRect(rx - 28, ry - 18, 56, 16, 5);
    ctx.fill();
    ctx.stroke();

    // Menara Sensor Lidar
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(rx + 8, ry - 22, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Roda berputar
    for (const wx of [rx - 18, rx + 18]) {
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wx, ry - 2, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  ctx.restore();
}

/* ========================================================================== */
/* LAYER 5 & 6: SPEED LINES KOMIK & PENCAHAYAAN SINEMATIK                     */
/* ========================================================================== */

function renderComicSpeedLinesAndLighting(
  ctx: CanvasRenderingContext2D,
  sceneType: PanelSceneType,
  w: number,
  h: number,
  tSec: number,
  intensity01: number
): void {
  ctx.save();

  // Garis Kecepatan Komik (Action Speed Lines) di tepi panel
  const isActionPanel =
    sceneType === 'page2-closeup-feet-stepping' ||
    sceneType === 'page2-closeup-hand-door' ||
    sceneType === 'page2-wide-doors-open-lab' ||
    sceneType === 'page3-panelD-welding' ||
    sceneType === 'page6-splash-title-reveal';

  const lineAlpha = isActionPanel ? Math.max(0.22, intensity01 * 0.35) : intensity01 * 0.14;

  if (lineAlpha > 0.04) {
    ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha.toFixed(3)})`;
    ctx.lineWidth = 1.6;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const rays = 24;
    for (let i = 0; i < rays; i += 1) {
      const ang = (i / rays) * Math.PI * 2 + (tSec * 0.3) % 0.2;
      const rInner = Math.min(w, h) * 0.36;
      const rOuter = Math.max(w, h) * 0.78;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * rInner, cy + Math.sin(ang) * rInner);
      ctx.lineTo(cx + Math.cos(ang) * rOuter, cy + Math.sin(ang) * rOuter);
      ctx.stroke();
    }
  }

  // Bingkai Inking Dalam tipis khas buku komik
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);

  ctx.restore();
}
