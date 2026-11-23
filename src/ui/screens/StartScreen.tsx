import React, { useEffect, useRef, useState } from 'react';
import { STRINGS } from '../../data/strings';
import { assetUrl } from '../characters/assetSlots';
import { IconSettings } from '../components/Icons';
import { IconBintang, IconLog, IconObrolan, IconPutar, IconTelinga } from '../components/GameIcons';
import { GameButton, GameFrame } from '../components/game';
import { getPaintedSceneCanvas, onExternalSceneReady } from '../scene/paintedScene';
import { getSceneCanvas } from '../scene/sceneCache';
import { coverCrop } from '../story/dialogLayout';
import { playSfx } from '../motion/sfx';
import { letterBounceDelays, sparkleSpecs } from './titleMotion';
import { buildTitleMenu, titleBackdrop, titleKeyAction, type TitleMenuItem } from './titleModel';

interface StartScreenProps {
  isSettingsOpen: boolean;
  onStart: () => void;
  onOpenSettings: () => void;
}

const LOGO_LINES = ['RUANG', 'DENGAR'] as const;
const LETTER_STEP_MS = 70;
const LOGO_DELAYS = letterBounceDelays(LOGO_LINES.join(''), LETTER_STEP_MS);
const SPARKLES = sparkleSpecs(7, 8);

const FEATURED_CAST = [
  { id: 'mhs-01', name: 'Raka Pratama', tag: 'Lab Elektronika · Pemimpin Tim' },
  { id: 'mhs-03', name: 'Tania Wijaya', tag: 'Riset & Desain · Perfeksionis' },
  { id: 'mhs-05', name: 'Ayu Permata', tag: 'Pemrograman · Penggerak Kelas' },
  { id: 'mhs-13', name: 'Nisa Nurhaliza', tag: 'Sensor IoT · Peka Sesama' },
  { id: 'mhs-10', name: 'Teguh Santosa', tag: 'Praktikum · Tekun & Fokus' },
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

export const StartScreen: React.FC<StartScreenProps> = ({
  isSettingsOpen,
  onStart,
  onOpenSettings,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setParallax({ x: nx * 12, y: ny * 8 });
  };

  return (
    <main className="title-screen" onPointerMove={handlePointerMove}>
      <canvas ref={canvasRef} className="title-backdrop" aria-hidden="true" />
      <div className="title-sunbeams" aria-hidden="true" />
      {!reduced && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] overflow-hidden">
          {[
            { left: '14%', top: '26%', size: 6, delay: '0s' },
            { left: '38%', top: '18%', size: 8, delay: '1.8s' },
            { left: '62%', top: '28%', size: 6, delay: '3.2s' },
            { left: '78%', top: '20%', size: 7, delay: '0.9s' },
            { left: '88%', top: '46%', size: 5, delay: '4.1s' },
          ].map((mote, idx) => (
            <span
              key={idx}
              className="fx-dust absolute"
              style={{
                left: mote.left,
                top: mote.top,
                width: `${mote.size}px`,
                height: `${mote.size}px`,
                animationDelay: mote.delay,
              }}
            />
          ))}
        </div>
      )}
      <div className="title-shade" aria-hidden="true" />
      <div className="title-border" aria-hidden="true" />

      <div className="title-stage">
        {/* Kolom Kiri: Identitas Game Orisinal + Menu Kinetik + Papan Etika */}
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

            <div className="title-crest-row">
              <div className="title-emblem" aria-hidden="true">
                <span className="title-emblem-disc title-emblem-ear">
                  <IconTelinga className="h-6 w-6" />
                </span>
                <span className="title-emblem-disc title-emblem-bubble">
                  <IconObrolan className="h-6 w-6" />
                </span>
              </div>
              <span className="title-edition-stamp">
                <span className="title-wave-bars" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
                <span>15 Kisah · Kampus Vokasi</span>
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

          <nav aria-label={STRINGS.app.name} className="title-menu">
            {menu.map((item) => {
              const tipId = `title-tip-${item.id}`;
              return (
                <React.Fragment key={item.id}>
                  <GameButton
                    variant={item.primary ? 'primer' : 'sekunder'}
                    size="lg"
                    bounce
                    icon={<MenuIcon id={item.id} />}
                    disabled={!item.enabled}
                    aria-disabled={!item.enabled}
                    aria-describedby={item.tooltip ? tipId : undefined}
                    title={item.tooltip}
                    data-start={item.id === 'mulai' ? 'true' : undefined}
                    className={`title-menu-btn${item.primary ? ' title-menu-btn-main' : ''}`}
                    onClick={() => handleItem(item.id)}
                  >
                    <span>{item.label}</span>
                    {!item.enabled && item.tooltip ? (
                      <span className="title-soon-pill" aria-hidden="true">
                        {item.tooltip}
                      </span>
                    ) : null}
                  </GameButton>
                  {item.tooltip ? (
                    <span id={tipId} className="sr-only">
                      {item.tooltip}
                    </span>
                  ) : null}
                </React.Fragment>
              );
            })}
          </nav>

          <GameFrame
            variant="krem"
            nails
            as="section"
            aria-label={STRINGS.app.disclaimerTitle}
            className="title-disclaimer"
          >
            <h2 className="title-disclaimer-title">{STRINGS.app.disclaimerTitle}</h2>
            <p className="title-disclaimer-body">{STRINGS.app.disclaimerBody}</p>
          </GameFrame>

          <p className="title-hint">
            <span className="title-kbd">Enter</span>
            <span className="title-kbd">Spasi</span>
            <span>{STRINGS.startScreen.keyboardHint}</span>
          </p>
        </div>

        {/* Kolom Kanan: Panggung Key-Art Pemeran Studio Anime Hidup (Ibu Dosen BK + Sorotan Mahasiswa) */}
        <aside className="title-cast-stage" aria-label="Sorotan Pemeran Ruang Dengar">
          <div className="title-cast-halo" aria-hidden="true" />
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

          <div className="title-spotlight-bar">
            <div className="min-w-0">
              <div className="font-['Fredoka',sans-serif] text-[0.68rem] font-bold tracking-[0.08em] text-[#c6453c] uppercase">
                Sorotan Pemeran
              </div>
              <div className="truncate font-['Fredoka',sans-serif] text-sm font-bold text-[#3e2517]">
                Ibu Dosen BK &amp; {featured.name}
              </div>
              <div className="truncate text-[0.72rem] font-semibold text-[#6b482e]">{featured.tag}</div>
            </div>
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
