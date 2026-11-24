import React, { useEffect, useRef, useState } from 'react';
import { STRINGS } from '../../data/strings';
import { assetUrl } from '../characters/assetSlots';
import { IconSettings } from '../components/Icons';
import { IconBintang, IconLog, IconObrolan, IconPutar, IconTelinga } from '../components/GameIcons';
import { getPaintedSceneCanvas, onExternalSceneReady } from '../scene/paintedScene';
import { getSceneCanvas } from '../scene/sceneCache';
import { coverCrop } from '../story/dialogLayout';
import { playSfx } from '../motion/sfx';
import { letterBounceDelays, sparkleSpecs } from './titleMotion';
import { buildTitleMenu, titleBackdrop, titleKeyAction, type TitleMenuItem } from './titleModel';

interface StartScreenProps {
  isSettingsOpen: boolean;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
  onOpenTheory?: () => void;
  onStart: () => void;
  onOpenSettings: () => void;
}

const LOGO_LINES = ['RUANG', 'DENGAR'] as const;
const LETTER_STEP_MS = 70;
const LOGO_DELAYS = letterBounceDelays(LOGO_LINES.join(''), LETTER_STEP_MS);
const SPARKLES = sparkleSpecs(7, 8);

const FEATURED_CAST = [
  { id: 'mhs-01', name: 'Raka Pratama', tag: 'Lab Elektronika · Pemimpin Tim', accent: '#2e8274', badge: '⚡ IoT & Mikrokontroler' },
  { id: 'mhs-03', name: 'Tania Wijaya', tag: 'Riset & Desain · Perfeksionis', accent: '#b86b28', badge: '📐 Presisi & Prototipe' },
  { id: 'mhs-16', name: 'Farhan Alfarizi', tag: 'Studio Desain · Kreatif & Ekspresif', accent: '#764ba2', badge: '🎨 Tata Visual & UI' },
  { id: 'mhs-17', name: 'Sekar Kinanti', tag: 'Pojok Baca · Penulis Reflektif', accent: '#256e52', badge: '📖 Jurnal & Narasi' },
  { id: 'mhs-05', name: 'Ayu Permata', tag: 'Pemrograman · Penggerak Kelas', accent: '#3c5aa6', badge: '💻 Algoritma & Sistem' },
  { id: 'mhs-18', name: 'Bagas Prasetyo', tag: 'Bengkel Las & Cetak 3D · Tangguh', accent: '#b8531c', badge: '🔥 Fabrikasi & K3' },
  { id: 'mhs-13', name: 'Nisa Nurhaliza', tag: 'Sensor IoT · Peka Sesama', accent: '#1d7694', badge: '🛰️ Telemetri & Empati' },
] as const;

function prefersReducedMotion(): boolean {
  try {
    return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

function MenuIcon({ id }: { id: TitleMenuItem['id'] }) {
  const cls = 'h-5 w-5 shrink-0';
  if (id === 'mulai') return <IconPutar className={cls} />;
  if (id === 'tentang') return <IconLog className={cls} />;
  return <IconSettings className={cls} />;
}

/** Ornamen Siku Kuningan Terukir (Filigree Brass Corner) agar tidak ada sudut kotak biasa */
const BrassCornerFiligree: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 28 28"
    fill="none"
    aria-hidden="true"
    className={`pointer-events-none absolute h-5 w-5 text-[#ffe38e] ${className ?? ''}`}
  >
    <path
      d="M2 26V9L9 2H26"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 22V11.5L11.5 6H22"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeOpacity="0.65"
      strokeLinecap="round"
    />
    <polygon points="9,9 13,7 11,11" fill="currentColor" />
  </svg>
);

export const StartScreen: React.FC<StartScreenProps> = ({
  isSettingsOpen,
  audioEnabled = false,
  onToggleAudio,
  onOpenTheory,
  onStart,
  onOpenSettings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vfxCanvasRef = useRef<HTMLCanvasElement>(null);
  const pointerNormRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [castIndex, setCastIndex] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const reduced = prefersReducedMotion();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const action = titleKeyAction(e.key, target ? target.tagName : null, isSettingsOpen);
      if (action === 'mulai') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, onStart]);

  // Rotasi lembut sorotan pemeran mahasiswa di panggung kanan Layar Awal
  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setCastIndex((i) => (i + 1) % FEATURED_CAST.length);
    }, 4800);
    return () => window.clearInterval(id);
  }, [reduced]);

  // Latar adegan HD: digambar dengan crop "cover" halus; fallback ke kanvas piksel atau gradasi CSS.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const draw = () => {
      try {
        const { id, variant } = titleBackdrop();
        const src = getPaintedSceneCanvas(id, variant) ?? getSceneCanvas(id, variant);
        const w = Math.max(1, Math.min(1440, window.innerWidth));
        const h = Math.max(1, Math.min(900, window.innerHeight));
        const ctx = canvas.getContext('2d');
        if (!src || !ctx) return;
        canvas.width = w;
        canvas.height = h;
        ctx.imageSmoothingEnabled = true;
        const c = coverCrop(src.width, src.height, w, h);
        ctx.drawImage(src as CanvasImageSource, c.sx, c.sy, c.sw, c.sh, 0, 0, w, h);
      } catch {
        /* kanvas tak tersedia: gradasi CSS menjadi latar */
      }
    };
    draw();
    const unsub = onExternalSceneReady(draw);
    window.addEventListener('resize', draw);
    return () => {
      unsub();
      window.removeEventListener('resize', draw);
    };
  }, []);

  // Kanvas VFX GPU-feel 60 FPS Layar Awal: Bokeh Lensa Sinematik, Pita Gelombang Akustik Empati, & Sorotan Spekular Kursor
  useEffect(() => {
    if (reduced) return;
    const canvas = vfxCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bokehOrbs = Array.from({ length: 24 }, (_, i) => ({
      x: ((i * 61 + 13) % 100) / 100,
      y: ((i * 47 + 23) % 100) / 100,
      r: 8 + (i % 6) * 7,
      vx: (i % 2 === 0 ? 1 : -1) * (0.004 + (i % 4) * 0.0018),
      vy: -(0.004 + (i % 5) * 0.0022),
      hue: i % 3 === 0 ? 'gold' : i % 3 === 1 ? 'teal' : 'amber',
      phase: i * 0.85,
    }));

    let rafId = 0;
    let lastTs = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTs) / 1000));
      lastTs = now;
      const t = now / 1000;

      const w = Math.max(320, Math.floor(window.innerWidth));
      const h = Math.max(240, Math.floor(window.innerHeight));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      // 1. Pita Gelombang Akustik Sinusoidal (Acoustic Empathy Ribbon) mengalir di latar tengah
      for (let wave = 0; wave < 2; wave += 1) {
        ctx.beginPath();
        const baseY = h * (0.54 + wave * 0.06);
        for (let x = 0; x <= w; x += 24) {
          const normX = x / w;
          const amp = (16 + wave * 10) * Math.sin(normX * Math.PI);
          const y =
            baseY +
            Math.sin(normX * 7.5 - t * (1.35 - wave * 0.3) + wave * 1.6) * amp +
            Math.cos(normX * 13 + t * 0.8) * 5;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        const waveGrad = ctx.createLinearGradient(0, baseY - 30, w, baseY + 30);
        waveGrad.addColorStop(0, 'rgba(255, 220, 128, 0)');
        waveGrad.addColorStop(0.35, wave === 0 ? 'rgba(255, 218, 120, 0.14)' : 'rgba(72, 214, 188, 0.12)');
        waveGrad.addColorStop(0.7, wave === 0 ? 'rgba(72, 214, 188, 0.16)' : 'rgba(255, 200, 110, 0.14)');
        waveGrad.addColorStop(1, 'rgba(255, 220, 128, 0)');
        ctx.strokeStyle = waveGrad;
        ctx.lineWidth = wave === 0 ? 2.4 : 1.6;
        ctx.stroke();
      }

      // 2. Bokeh Optik Kamera Kedalaman (Depth-of-Field Light Orbs)
      for (const orb of bokehOrbs) {
        orb.x = (orb.x + orb.vx * dt + 1) % 1;
        orb.y = (orb.y + orb.vy * dt + 1) % 1;
        const px = orb.x * w;
        const py = orb.y * h;
        const pulse = 0.55 + 0.45 * Math.sin(t * 1.7 + orb.phase);
        const rad = orb.r * (0.85 + pulse * 0.35);
        const g = ctx.createRadialGradient(px, py, rad * 0.1, px, py, rad);
        if (orb.hue === 'gold') {
          g.addColorStop(0, `rgba(255, 240, 178, ${(0.18 * pulse).toFixed(3)})`);
          g.addColorStop(0.7, `rgba(255, 212, 118, ${(0.08 * pulse).toFixed(3)})`);
          g.addColorStop(1, 'rgba(255, 212, 118, 0)');
        } else if (orb.hue === 'teal') {
          g.addColorStop(0, `rgba(130, 245, 225, ${(0.15 * pulse).toFixed(3)})`);
          g.addColorStop(0.7, `rgba(64, 196, 176, ${(0.07 * pulse).toFixed(3)})`);
          g.addColorStop(1, 'rgba(64, 196, 176, 0)');
        } else {
          g.addColorStop(0, `rgba(255, 196, 132, ${(0.16 * pulse).toFixed(3)})`);
          g.addColorStop(0.7, `rgba(235, 138, 72, ${(0.07 * pulse).toFixed(3)})`);
          g.addColorStop(1, 'rgba(235, 138, 72, 0)');
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Sorotan Spekular Mengikuti Kursor (Interactive RTX Specular Lift)
      const cx = pointerNormRef.current.x * w;
      const cy = pointerNormRef.current.y * h;
      const cursorGlow = ctx.createRadialGradient(cx, cy, 4, cx, cy, Math.max(w, h) * 0.26);
      cursorGlow.addColorStop(0, 'rgba(255, 236, 175, 0.10)');
      cursorGlow.addColorStop(0.5, 'rgba(255, 206, 120, 0.04)');
      cursorGlow.addColorStop(1, 'rgba(255, 206, 120, 0)');
      ctx.fillStyle = cursorGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(w, h) * 0.26, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      rafId = window.requestAnimationFrame(frame);
    };

    rafId = window.requestAnimationFrame(frame);
    return () => window.cancelAnimationFrame(rafId);
  }, [reduced]);

  const menu = buildTitleMenu({
    startLabel: STRINGS.titleScreen.startLabel,
    aboutLabel: STRINGS.titleScreen.aboutLabel,
    aboutTooltip: STRINGS.titleScreen.aboutTooltip,
    settingsLabel: STRINGS.titleScreen.settingsLabel,
  });

  const featured = FEATURED_CAST[castIndex];

  const handleItem = (id: TitleMenuItem['id']) => {
    playSfx('klik');
    if (id === 'mulai') onStart();
    else if (id === 'pengaturan') onOpenSettings();
    else if (id === 'tentang' && onOpenTheory) onOpenTheory();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const rx = (e.clientX - rect.left) / rect.width;
    const ry = (e.clientY - rect.top) / rect.height;
    pointerNormRef.current = { x: rx, y: ry };
    const nx = rx - 0.5;
    const ny = ry - 0.5;
    setParallax({ x: nx * 14, y: ny * 9 });
  };

  return (
    <main className="title-screen" onPointerMove={handlePointerMove}>
      <canvas ref={canvasRef} className="title-backdrop" aria-hidden="true" />
      <div className="title-sunbeams" aria-hidden="true" />
      <div className="title-shade" aria-hidden="true" />
      {!reduced && (
        <canvas
          ref={vfxCanvasRef}
          data-testid="title-vfx-canvas"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
        />
      )}

      {/* Bingkai Ornamen Arsitektur Atelier (bukan kotak garis putus-putus biasa) */}
      <div className="title-architectural-frame" aria-hidden="true">
        <BrassCornerFiligree className="left-3 top-3" />
        <BrassCornerFiligree className="right-3 top-3 rotate-90" />
        <BrassCornerFiligree className="bottom-3 left-3 -rotate-90" />
        <BrassCornerFiligree className="bottom-3 right-3 rotate-180" />
      </div>

      {/* Bilah cepat Pustaka Landasan Teori & Musik Kampus dengan potongan berlian oktagonal */}
      {(onOpenTheory || onToggleAudio) && (
        <div className="absolute right-6 top-5 z-20 flex flex-wrap items-center justify-end gap-2.5">
          {onOpenTheory && (
            <button
              type="button"
              onClick={() => {
                playSfx('klik');
                onOpenTheory();
              }}
              data-testid="open-theory-library-btn"
              className="title-top-crest-btn title-top-crest-btn--teal"
            >
              <span className="title-top-crest-gem" aria-hidden="true">📚</span>
              <span>Landasan Psikologi</span>
            </button>
          )}
          {onToggleAudio && (
            <button
              type="button"
              onClick={onToggleAudio}
              aria-pressed={audioEnabled}
              aria-label={audioEnabled ? 'Matikan musik kampus & suara' : 'Nyalakan musik kampus & suara'}
              className={`title-top-crest-btn ${
                audioEnabled ? 'title-top-crest-btn--gold' : 'title-top-crest-btn--cream'
              }`}
            >
              <span className="title-top-crest-gem" aria-hidden="true">
                {audioEnabled ? '🔊' : '🔇'}
              </span>
              <span>{audioEnabled ? 'Musik Aktif' : 'Nyalakan Musik'}</span>
            </button>
          )}
        </div>
      )}

      <div className="title-stage">
        {/* Kolom Kiri: Lambang Segi Delapan + Tipografi Pahat + Bilah Komando Miring + Perkamen Stempel Lilin */}
        <div className="title-content">
          <header className="title-logo-wrap">
            <div className="title-sparkles" aria-hidden="true">
              <IconBintang className="title-spark title-spark-a" />
              <IconBintang className="title-spark title-spark-b" />
              <IconBintang className="title-spark title-spark-c" />
              {SPARKLES.map((s, i) => (
                <span
                  key={i}
                  className="fx-sparkle"
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: `${s.leftPct}%`,
                    top: `${s.topPct}%`,
                    width: s.sizePx,
                    height: s.sizePx,
                    animationDelay: reduced ? undefined : `${s.delayMs}ms`,
                    animationDuration: `${s.durationMs}ms`,
                  }}
                />
              ))}
            </div>

            {/* Baris Lambang Segi Delapan (Octagonal Medallions) & Pita Edisi Pahatan */}
            <div className="title-crest-row">
              <div className="title-emblem" aria-hidden="true">
                <span className="title-emblem-disc title-emblem-ear">
                  <IconTelinga className="h-5 w-5" />
                </span>
                <span className="title-emblem-disc title-emblem-bubble">
                  <IconObrolan className="h-5 w-5" />
                </span>
              </div>
              <span className="title-edition-stamp">
                <span className="title-wave-bars" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
                <span>EDISI HD-2D · 18 KISAH · 11 RUANGAN</span>
              </span>
            </div>

            <h1 className="title-logo" aria-label={STRINGS.app.name}>
              {(() => {
                let idx = 0;
                return LOGO_LINES.map((line, li) => (
                  <span
                    key={line}
                    aria-hidden="true"
                    className={li === 0 ? 'title-logo-line' : 'title-logo-line title-logo-line-2'}
                  >
                    {Array.from(line).map((ch, ci) => {
                      const d = LOGO_DELAYS[idx++] ?? 0;
                      return (
                        <span
                          key={ci}
                          className="fx-logo-bounce title-letter"
                          style={{ animationDelay: reduced ? undefined : `${d}ms` }}
                        >
                          {ch}
                        </span>
                      );
                    })}
                  </span>
                ));
              })()}
            </h1>

            <p className="game-ribbon title-subtitle" data-tone="kayu">
              {STRINGS.titleScreen.subtitle}
            </p>
          </header>

          {/* Bilah Komando Pahatan Asimetris (Sculpted Command Blades — Bukan Kotak Biasa!) */}
          <nav aria-label={STRINGS.app.name} className="title-menu">
            {menu.map((item, index) => {
              const tipId = `title-tip-${item.id}`;
              return (
                <React.Fragment key={item.id}>
                  <button
                    type="button"
                    disabled={!item.enabled}
                    aria-disabled={!item.enabled}
                    aria-describedby={item.tooltip ? tipId : undefined}
                    title={item.tooltip}
                    data-start={item.id === 'mulai' ? 'true' : undefined}
                    onClick={() => handleItem(item.id)}
                    className={`title-command-blade ${
                      item.primary
                        ? 'title-command-blade--primary title-menu-btn-main'
                        : 'title-command-blade--secondary'
                    } title-menu-btn`}
                  >
                    {/* Medali Ikon Segi Delapan di Sisi Kiri Bilah */}
                    <span className="title-blade-medallion" aria-hidden="true">
                      <MenuIcon id={item.id} />
                    </span>

                    {/* Teks & Sub-aksen Bilah */}
                    <span className="flex min-w-0 flex-1 flex-col items-start text-left">
                      <span className="title-blade-label">{item.label}</span>
                      {item.primary && (
                        <span className="title-blade-sublabel">
                          Masuki Kampus Vokasi &amp; Dampingi 18 Mahasiswa
                        </span>
                      )}
                    </span>

                    {/* Ornamen Panah Berlian atau Lencana Status di Kanan */}
                    {!item.enabled && item.tooltip ? (
                      <span className="title-soon-pill" aria-hidden="true">
                        {item.tooltip}
                      </span>
                    ) : (
                      <span className="title-blade-chevron" aria-hidden="true">
                        <span className="text-[10px] opacity-65">0{index + 1}</span>
                        <span>◆</span>
                      </span>
                    )}
                  </button>
                  {item.tooltip ? (
                    <span id={tipId} className="sr-only">
                      {item.tooltip}
                    </span>
                  ) : null}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Gulungan Perkamen Berstempel Lilin (Wax-Sealed Parchment Scroll — Bukan Kotak Putih Biasa!) */}
          <section
            aria-label={STRINGS.app.disclaimerTitle}
            className="title-parchment-scroll"
          >
            {/* Stempel Lilin Merah-Emas (Wax Seal Emblem) */}
            <div className="title-wax-seal" aria-hidden="true">
              <span>✦</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="title-disclaimer-title">{STRINGS.app.disclaimerTitle}</h2>
                <span aria-hidden="true" className="h-[1.5px] flex-1 bg-gradient-to-r from-[#b8864b]/50 to-transparent" />
              </div>
              <p className="title-disclaimer-body">{STRINGS.app.disclaimerBody}</p>
            </div>
          </section>

          {/* Pita Pintasan Keyboard Berpotongan Tiket (Ticket-Notched Hint Bar) */}
          <p className="title-hint">
            <span className="title-kbd">Enter</span>
            <span className="title-kbd">Spasi</span>
            <span>{STRINGS.startScreen.keyboardHint}</span>
          </p>
        </div>

        {/* Kolom Kanan: Panggung Diorama Astrolab Akustik Nusantara + Pemeran Hidup + Plakat Teater */}
        <aside className="title-cast-stage" aria-label="Sorotan Pemeran Ruang Dengar">
          {/* Astrolab Akustik Nusantara 3-Cincin SVG (Menggantikan lingkaran dashed biasa!) */}
          <div className="title-astrolabe-wrap" aria-hidden="true">
            <svg
              viewBox="0 0 420 420"
              fill="none"
              className="title-astrolabe-svg"
            >
              <defs>
                <radialGradient id="astrolabeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffe596" stopOpacity="0.48" />
                  <stop offset="52%" stopColor="#3ba08e" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#1c110a" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="brassRingGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fff0b8" />
                  <stop offset="50%" stopColor="#e5a93c" />
                  <stop offset="100%" stopColor="#82e0cb" />
                </linearGradient>
              </defs>

              {/* Pendaran pusat hangat */}
              <circle cx="210" cy="210" r="195" fill="url(#astrolabeGlow)" />

              {/* Cincin Luar Berputar: Kompas Derajat & Bintang 8 Penjuru */}
              <g className="title-astrolabe-ring-outer">
                <circle
                  cx="210"
                  cy="210"
                  r="184"
                  stroke="url(#brassRingGrad)"
                  strokeWidth="1.6"
                  strokeOpacity="0.55"
                />
                <circle
                  cx="210"
                  cy="210"
                  r="172"
                  stroke="#ffe699"
                  strokeWidth="1.2"
                  strokeDasharray="3 9"
                  strokeOpacity="0.65"
                />
                {/* 8 Ornamen Bintang Kompas Nusantara */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <g key={deg} transform={`rotate(${deg} 210 210)`}>
                    <polygon
                      points="210,18 214,28 210,34 206,28"
                      fill="#ffe699"
                      fillOpacity="0.82"
                    />
                  </g>
                ))}
              </g>

              {/* Cincin Tengah Berputar Berlawanan: Bingkai Geometris Belah Ketupat Kembar */}
              <g className="title-astrolabe-ring-inner">
                <rect
                  x="76"
                  y="76"
                  width="268"
                  height="268"
                  rx="24"
                  stroke="#ffe699"
                  strokeWidth="1.2"
                  strokeOpacity="0.32"
                />
                <rect
                  x="76"
                  y="76"
                  width="268"
                  height="268"
                  rx="24"
                  transform="rotate(45 210 210)"
                  stroke="#66d9c2"
                  strokeWidth="1.2"
                  strokeOpacity="0.35"
                />
                <circle
                  cx="210"
                  cy="210"
                  r="134"
                  stroke="#ffe699"
                  strokeWidth="1.5"
                  strokeDasharray="16 8 4 8"
                  strokeOpacity="0.48"
                />
              </g>
            </svg>
          </div>

          <div
            className="title-cast-figures"
            style={
              reduced
                ? undefined
                : { transform: `translate3d(${parallax.x.toFixed(1)}px, ${parallax.y.toFixed(1)}px, 0)` }
            }
          >
            <img
              src={assetUrl('dosen-portrait.png')}
              alt=""
              aria-hidden="true"
              className="title-cast-figure title-cast-figure--dosen"
              draggable={false}
            />
            <img
              key={featured.id}
              src={assetUrl(`${featured.id}-portrait.png`)}
              alt=""
              aria-hidden="true"
              className="title-cast-figure title-cast-figure--student fx-panel-in"
              draggable={false}
            />
          </div>

          {/* Plakat Teater Panggung Pemeran (Sculpted Stage Marquee — Bukan Kotak Putih Biasa!) */}
          <div className="title-marquee-plaque">
            {/* Pita Lencana Spesialisasi Mengambang di Puncak Plakat */}
            <div className="title-marquee-ribbon">
              <span>✦ SOROTAN PEMERAN</span>
              <span className="opacity-50">·</span>
              <span className="text-[#ffe694]">{featured.badge}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              {/* Tombol Geser Kiri */}
              <button
                type="button"
                aria-label="Pemeran sebelumnya"
                onClick={() => {
                  playSfx('klik');
                  setCastIndex((i) => (i - 1 + FEATURED_CAST.length) % FEATURED_CAST.length);
                }}
                className="title-marquee-arrow"
              >
                ‹
              </button>

              <div className="min-w-0 flex-1 text-center">
                <div className="truncate font-['Fredoka',sans-serif] text-[0.98rem] font-bold text-[#3e2517]">
                  Ibu Dosen BK &amp; {featured.name}
                </div>
                <div className="truncate text-[0.73rem] font-semibold text-[#6b482e]">
                  {featured.tag}
                </div>
              </div>

              {/* Tombol Geser Kanan */}
              <button
                type="button"
                aria-label="Pemeran berikutnya"
                onClick={() => {
                  playSfx('klik');
                  setCastIndex((i) => (i + 1) % FEATURED_CAST.length);
                }}
                className="title-marquee-arrow"
              >
                ›
              </button>
            </div>

            {/* Indikator Permata Berlian (Diamond Cast Gems — Bukan Titik Bulat Biasa!) */}
            <div className="title-spotlight-dots" role="group" aria-label="Pilih sorotan pemeran">
              {FEATURED_CAST.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  className="title-spotlight-dot"
                  aria-label={`Tampilkan ${c.name}`}
                  aria-pressed={i === castIndex}
                  onClick={() => {
                    playSfx('klik');
                    setCastIndex(i);
                  }}
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
};
