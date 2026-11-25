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
  renderMiniComicCharacter,
} from './ComicCharacterRenderer';
import { computePanelTransitionState } from './ComicTransitionEngine';
import { DialogueEngine } from './DialogueEngine';
import { ComicPanelBlueprint } from './StoryTimeline';

export interface ComicPanelRendererProps {
  panel: ComicPanelBlueprint;
  pageElapsedMs: number;
  pageDurationMs: number;
  reducedMotion?: boolean;
  onStartSimulation?: () => void;
  onReplayStory?: () => void;
  onSkipIntro?: () => void;
}

/**
 * Merender Panel Komik 2D Berdetail Tinggi yang terhubung langsung dengan
 * konfigurasi peta simulasi utama (`LAB_MAP` & `illustratedLab.ts`) dalam 10 Layer:
 * 1. Background environment (Taman kampus, pepohonan rimbun, cahaya pagi)
 * 2. Building structure (Fasad gedung batu-baja, tangga utama selatan)
 * 3. Walls and room partitions (Dinding ruangan, sekat rendah, pintu kaca geser)
 * 4. Floor texture (Keramik, beton dengan marka K3, kayu hangat, karpet/rumput)
 * 5. Furniture (Meja kerja, sofa, rak buku, lemari dari LAB_MAP.furniture)
 * 6. Laboratory equipment (Osiloskop, power supply, breadboard, PCB, mesin las, tabung gas, APAR, printer 3D, spool filamen, monitor kode, dev board, tablet desain, dispenser)
 * 7. Decorations (Tanaman pot, plakat identitas ruangan, lampu koridor, buku & dokumen)
 * 8. Character sprite (Mini Character Sprite utuh dari dataset simulasi, diurutkan menurut Y bersama furnitur)
 * 9. Foreground objects (Hologram 3D, mini rover robotika, indikator layar aktif)
 * 10. Lighting and visual effects (Cahaya fajar, pendaran lampu koridor, bingkai komik)
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
  const [spriteVersion, setSpriteVersion] = useState<number>(0);
  const panelElapsedMs = Math.max(0, pageElapsedMs - panel.revealAtMs);

  // Dengarkan pembaruan saat sprite sheet eksternal selesai dimuat
  useEffect(() => {
    return onSpriteAssetsReady(() => {
      setSpriteVersion((v) => v + 1);
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

  // Hitung posisi anchor kepala tiap sprite miniatur untuk ekor balon dialog
  const actorAnchors = useMemo(() => {
    const map: Record<string, RenderedActorAnchor> = {};
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
      const feet = spriteFeet(
        { x: animState.tileX, y: animState.tileY },
        LAB_MAP.tileSizePx
      );
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
    const t = LAB_MAP.tileSizePx;
    const worldW = LAB_MAP.width * t;
    const worldH = LAB_MAP.height * t;
    const tSec = Math.max(0, pageElapsedMs) / 1000;

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
    ctx.scale(dpr, dpr);

    // Latar dasar taman kampus gelap-hangat di luar batas peta
    ctx.fillStyle = '#0c1624';
    ctx.fillRect(0, 0, logicW, logicH);

    // Terapkan matriks kamera dunia 2D
    ctx.save();
    ctx.translate(camera.offsetX, camera.offsetY);
    ctx.scale(camera.scale, camera.scale);

    // ========================================================================
    // LAYER 1..4 & 7: BACKGROUND ENVIRONMENT, BUILDING STRUCTURE, WALLS,
    // PARTITIONS, FLOOR TEXTURE (Keramik, Beton K3, Kayu, Karpet) & DECORATIONS
    // Diambil langsung dari getIllustratedLabBackdrop(LAB_MAP, 'lab') (2.5x HD)
    // ========================================================================
    const backdrop = getIllustratedLabBackdrop(LAB_MAP, 'lab');
    if (backdrop) {
      ctx.imageSmoothingEnabled = true;
      if ('imageSmoothingQuality' in ctx) {
        ctx.imageSmoothingQuality = 'high';
      }
      ctx.drawImage(backdrop, 0, 0, worldW, worldH);
    }

    // ========================================================================
    // LAYER 6: ROOM-SPECIFIC LABORATORY EQUIPMENT DETAILS
    // Menambahkan peralatan mikro & instrumen aktif sesuai ruangan di LAB_MAP
    // ========================================================================
    renderRoomSpecificEquipmentLayer(ctx, t, tSec, reducedMotion);

    // ========================================================================
    // LAYER 5 & 8: DEPTH-SORTED FURNITURE + MINI CHARACTER SPRITES
    // Mengurutkan furnitur LAB_MAP dan sprite miniatur berdasarkan koordinat Y
    // sehingga karakter dan objek tidak pernah saling menembus secara tidak wajar.
    // ========================================================================
    type DepthDrawable =
      | { kind: 'furniture'; baseY: number; item: LabFurniture }
      | {
          kind: 'actor';
          baseY: number;
          actor: (typeof panel.actors)[number];
        };

    const drawables: DepthDrawable[] = [];

    for (const item of LAB_MAP.furniture) {
      const baseY = (item.rect.y + item.rect.h) * t;
      drawables.push({ kind: 'furniture', baseY, item });
    }

    for (const actor of panel.actors) {
      const animState = computeMiniSpriteAnimationState(
        actor,
        pageElapsedMs,
        pageDurationMs,
        speakingIds.has(actor.characterId),
        reducedMotion
      );
      const feet = spriteFeet({ x: animState.tileX, y: animState.tileY }, t);
      drawables.push({ kind: 'actor', baseY: feet.y, actor });
    }

    drawables.sort((a, b) => a.baseY - b.baseY);

    for (const d of drawables) {
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
          logicH
        );
      }
    }

    // ========================================================================
    // LAYER 9: FOREGROUND OBJECTS & ROOM IDENTITY PLAQUES
    // ========================================================================
    drawAnimatedLabHolograms(ctx, LAB_MAP, tSec, reducedMotion);

    const focusSet = new Set(panel.focusZoneIds);
    for (const zone of LAB_MAP.zones) {
      const isFocused = focusSet.has(zone.id);
      drawIllustratedZoneLabel(ctx, zone, t, isFocused && focusSet.size <= 3);
    }

    ctx.restore(); // akhir transformasi kamera dunia

    // ========================================================================
    // LAYER 10: LIGHTING AND VISUAL EFFECTS (Pencahayaan Pagi / Koridor / Bingkai)
    // ========================================================================
    renderPanelAmbientLighting(ctx, panel.ambientTheme, logicW, logicH);

    ctx.restore();
  }, [
    pageDurationMs,
    pageElapsedMs,
    panel.actors,
    panel.ambientTheme,
    panel.endViewport,
    panel.focusZoneIds,
    panel.startViewport,
    panelElapsedMs,
    reducedMotion,
    speakingIds,
    spriteVersion,
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
      data-focus-zones={panel.focusZoneIds.join(',')}
    >
      {/* Header Label Panel Komik Tipis di Sudut Kiri Atas */}
      <div className="pointer-events-none absolute top-2 left-2 z-20 rounded border-2 border-slate-950 bg-slate-950/90 px-2 py-0.5 text-[10px] font-black tracking-wider uppercase text-amber-300 shadow-[2px_2px_0_#020617]">
        {panel.title}
      </div>

      {/* Kanvas 10-Layer Peta Simulasi + Mini Character Sprites */}
      <canvas
        ref={canvasRef}
        className="block h-full w-full"
        data-testid={`comic-canvas-${panel.id}`}
      />

      {/* Impact Flash halus saat panel baru terbuka */}
      {transition.impactFlash01 > 0.02 && (
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-amber-100"
          style={{ opacity: transition.impactFlash01 }}
        />
      )}

      {/* Balon Percakapan Komik, Kotak Narasi & Tipografi SFX */}
      <DialogueEngine
        panel={panel}
        pageElapsedMs={pageElapsedMs}
        actorAnchors={actorAnchors}
      />

      {/* Overlay Tombol Aksi Utama pada SCENE 06 — TITLE REVEAL */}
      {panel.ambientTheme === 'title-climax' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 text-center">
          <div className="rounded-3xl border-[4px] border-slate-950 bg-slate-950/88 px-6 py-5 shadow-[8px_8px_0_#fbbf24] backdrop-blur-md sm:px-10 sm:py-7">
            <div className="mb-2 inline-block -rotate-1 border-2 border-slate-950 bg-amber-400 px-3 py-0.5 font-['Fredoka',sans-serif] text-xs font-black tracking-widest uppercase text-slate-950 shadow">
              SIMULASI INTERAKTIF · 18 MAHASISWA MINIATUR · 11 RUANGAN LABORATORIUM
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
/* LAYER 6: PERALATAN LABORATORIUM SPESIFIK 11 RUANGAN (A s.d. K)             */
/* ========================================================================== */

function renderRoomSpecificEquipmentLayer(
  ctx: CanvasRenderingContext2D,
  t: number,
  tSec: number,
  reducedMotion: boolean
): void {
  ctx.save();
  const pulse = reducedMotion ? 0.5 : 0.5 + 0.5 * Math.sin(tSec * 4.5);

  // A. BENGKEL LAS (K3) (x=1..9, y=1..7): Tabung gas argon, tirai pembatas las, rak perkakas & marka K3
  ctx.fillStyle = '#0284c7';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  // Tabung gas bertekanan di samping mesin las
  ctx.beginPath();
  ctx.roundRect(8.2 * t, 2.1 * t, 0.55 * t, 1.4 * t, 4);
  ctx.fill();
  ctx.stroke();
  // Tirai pelindung kuning-transparan pembatas area las
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(5.3 * t, 1.5 * t);
  ctx.lineTo(5.3 * t, 3.8 * t);
  ctx.stroke();

  // B. RUANG CETAK 3D (x=11..20, y=1..7): Rak gulungan filamen warna-warni & meja pasca-proses
  const spoolColors = ['#38bdf8', '#f59e0b', '#10b981', '#ec4899'];
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = spoolColors[i];
    ctx.beginPath();
    ctx.arc((12.4 + i * 2.2) * t, 1.55 * t, 3.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // C. ELEKTRONIKA & IoT (x=22..30, y=1..7): Breadboard, PCB hijau, kabel jumper & sensor
  ctx.fillStyle = '#065f46';
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 1;
  ctx.fillRect(23.5 * t, 2.35 * t, 0.9 * t, 0.45 * t);
  ctx.strokeRect(23.5 * t, 2.35 * t, 0.9 * t, 0.45 * t);
  // Gelombang osiloskop hidup di meja alat ukur
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(27.3 * t, 2.1 * t);
  ctx.lineTo(27.55 * t, (2.0 + pulse * 0.15) * t);
  ctx.lineTo(27.8 * t, (2.2 - pulse * 0.15) * t);
  ctx.stroke();

  // D. PEMROGRAMAN & MCU (x=1..12, y=11..16): Papan dev board mikrokontroler & kabel USB di meja komputer
  for (const dx of [3.2, 5.0, 8.2, 10.0]) {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(dx * t, 13.45 * t, 0.45 * t, 0.3 * t);
    ctx.fillStyle = pulse > 0.45 ? '#22c55e' : '#ef4444';
    ctx.beginPath();
    ctx.arc((dx + 0.2) * t, 13.6 * t, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // E. GUDANG ALAT (x=32..38, y=1..7): Meja pemeriksaan alat ukur & label inventaris
  ctx.fillStyle = '#cbd5e1';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(34.0 * t, 4.3 * t, 2.4 * t, 1.1 * t, 3);
  ctx.fill();
  ctx.stroke();
  // Multimeter kuning di atas meja pemeriksaan Gudang Alat
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(34.8 * t, 4.55 * t, 0.55 * t, 0.6 * t);

  // F. STUDIO DESAIN (x=40..50, y=1..7): Kursi kerja studio & stylus pen-display
  for (const cx of [42.8, 47.6]) {
    ctx.fillStyle = '#a855f7';
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(cx * t, 3.65 * t, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // G. MEJA DISKUSI (x=15..26, y=11..18): Papan presentasi / whiteboard telemetri menyala
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(24.7 * t, 12.1 * t);
  ctx.lineTo(25.3 * t, (11.9 + pulse * 0.2) * t);
  ctx.lineTo(25.9 * t, 12.15 * t);
  ctx.stroke();

  // H. RUANG KONSULTASI (x=31..38, y=12..14): Rak dokumen konseling & dekorasi hangat
  ctx.fillStyle = '#b4834e';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.1;
  ctx.fillRect(31.3 * t, 11.4 * t, 1.8 * t, 0.55 * t);
  ctx.strokeRect(31.3 * t, 11.4 * t, 1.8 * t, 0.55 * t);

  // I. POJOK BACA (x=40..50, y=12..22): Pendaran lampu baca hangat di atas meja baca
  const lampGlow = ctx.createRadialGradient(
    45.2 * t,
    15.8 * t,
    2,
    45.2 * t,
    15.8 * t,
    1.8 * t
  );
  lampGlow.addColorStop(0, 'rgba(254, 240, 138, 0.32)');
  lampGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = lampGlow;
  ctx.beginPath();
  ctx.arc(45.2 * t, 15.8 * t, 1.8 * t, 0, Math.PI * 2);
  ctx.fill();

  // J. RUANG ISTIRAHAT (x=1..12, y=18..22): Lemari penyimpanan / mesin minuman & cangkir di meja kecil
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(8.5 * t, 21.4 * t, 3.2, 0, Math.PI * 2);
  ctx.fill();

  // K. RUANG DOSEN (x=31..38, y=19..22): Lemari dokumen administrasi & lampu meja kerja dosen
  ctx.fillStyle = '#784c20';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.1;
  ctx.fillRect(37.6 * t, 19.3 * t, 1.1 * t, 1.4 * t);
  ctx.strokeRect(37.6 * t, 19.3 * t, 1.1 * t, 1.4 * t);

  ctx.restore();
}

/* ========================================================================== */
/* LAYER 10: PENCAHAYAAN SINEMATIK 2D & BINGKAI KOMIK                         */
/* ========================================================================== */

function renderPanelAmbientLighting(
  ctx: CanvasRenderingContext2D,
  theme: ComicPanelBlueprint['ambientTheme'],
  w: number,
  h: number
): void {
  ctx.save();

  if (theme === 'morning-exterior') {
    // Berkas sinar matahari pagi keemasan dari sudut kiri-atas gedung
    const sunGrad = ctx.createLinearGradient(0, 0, w * 0.75, h * 0.65);
    sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.24)');
    sunGrad.addColorStop(0.45, 'rgba(251, 191, 36, 0.08)');
    sunGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(0, 0, w, h);
  } else if (theme === 'corridor-entry') {
    const corrGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.1, w * 0.5, h * 0.5, w * 0.7);
    corrGrad.addColorStop(0, 'rgba(254, 243, 199, 0.08)');
    corrGrad.addColorStop(1, 'rgba(2, 6, 23, 0.22)');
    ctx.fillStyle = corrGrad;
    ctx.fillRect(0, 0, w, h);
  } else if (theme === 'title-climax') {
    const titleGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.1, w * 0.5, h * 0.5, w * 0.72);
    titleGrad.addColorStop(0, 'rgba(15, 23, 42, 0.15)');
    titleGrad.addColorStop(1, 'rgba(2, 6, 23, 0.62)');
    ctx.fillStyle = titleGrad;
    ctx.fillRect(0, 0, w, h);
  }

  // Garis bingkai tinta dalam komik
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.88)';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(1.5, 1.5, w - 3, h - 3);

  ctx.restore();
}
