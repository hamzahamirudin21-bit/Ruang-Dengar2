import React, { useEffect, useRef, useState } from 'react';
import { getStudentBackground, type StudentBackgroundInfo } from '../../data/studentBackgrounds';
import { cardAltText } from '../characters/altText';
import type { InterestLabel } from '../characters/interestLabels';
import { PixelPortrait } from '../characters/PixelPortrait';
import { SPRITE_H, SPRITE_W } from '../characters/pixelGrid';
import type { RosterCardModel } from '../characters/rosterModel';
import { drawSprite, onSpriteAssetsReady } from '../characters/spriteCanvas';
import { playFeedbackSfx } from '../motion/sfx';

export interface RosterCardProps {
  model: RosterCardModel;
  reducedMotion: boolean;
  /** Ukuran kartu dari computeRosterLayout (px). */
  width?: number;
  height?: number;
  /** Kontrol balik kartu eksternal opsional (mis. tombol Balik Semua). */
  flipped?: boolean;
  onToggleFlip?: () => void;
}

const TYPE_TONE_CLASSES: Record<StudentBackgroundInfo['typeTone'], string> = {
  teal: 'border-[#1f6b5f] bg-[#dcf5ee] text-[#175248]',
  amber: 'border-[#9c5a0e] bg-[#ffefc9] text-[#7a4207]',
  rose: 'border-[#a5353a] bg-[#ffe3e4] text-[#832327]',
  indigo: 'border-[#38478a] bg-[#e5e9ff] text-[#283369]',
  emerald: 'border-[#256f49] bg-[#ddf6e8] text-[#1a5536]',
};

const PORTRAIT_BACKDROP_GRADIENT: Record<StudentBackgroundInfo['typeTone'], string> = {
  teal: 'from-[#b5e4dc] via-[#def4ef] to-[#f4e4c4]',
  amber: 'from-[#f9dca6] via-[#fceed1] to-[#f2dec0]',
  rose: 'from-[#f8cbd2] via-[#fce7ea] to-[#f5e1c5]',
  indigo: 'from-[#c6d3f7] via-[#e6ecfc] to-[#f4e3c5]',
  emerald: 'from-[#bde8ce] via-[#e2f6ea] to-[#f4e5c6]',
};

const CARD_ACCENT_BAR: Record<StudentBackgroundInfo['typeTone'], string> = {
  teal: 'bg-gradient-to-r from-[#2e8274] to-[#46a897]',
  amber: 'bg-gradient-to-r from-[#d4882a] to-[#f0b44c]',
  rose: 'bg-gradient-to-r from-[#c94e53] to-[#e5787c]',
  indigo: 'bg-gradient-to-r from-[#4b5ca8] to-[#7485d1]',
  emerald: 'bg-gradient-to-r from-[#2c8a58] to-[#52b37f]',
};

const SpriteCanvas: React.FC<{ studentId: string }> = ({ studentId }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const paint = () => {
      const canvas = ref.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawSprite(ctx, {
        studentId,
        dir: 'bawah',
        anim: 'idle',
        frame: 0,
        x: canvas.width / 2,
        y: canvas.height,
        width: canvas.width,
      });
    };
    paint();
    return onSpriteAssetsReady(paint);
  }, [studentId]);
  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      width={SPRITE_W * 6}
      height={SPRITE_H * 6}
      className="h-[3.15rem] w-[2.1rem] drop-shadow-[0_2px_4px_rgba(15,23,42,0.55)]"
    />
  );
};

const InterestIcon: React.FC<{ id: InterestLabel['iconId'] }> = ({ id }) => {
  const common = {
    viewBox: '0 0 16 16',
    width: 12,
    height: 12,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (id) {
    case 'chip':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="8" height="8" />
          <path d="M6 1v3M10 1v3M6 12v3M10 12v3M1 6h3M1 10h3M12 6h3M12 10h3" />
        </svg>
      );
    case 'kode':
      return (
        <svg {...common}>
          <path d="M5 4 1 8l4 4M11 4l4 4-4 4M9 3l-2 10" />
        </svg>
      );
    case 'api-las':
      return (
        <svg {...common}>
          <path d="M8 1c1 3 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 2 1 2 0-2 0-4 1-6Z" />
        </svg>
      );
    case 'printer3d':
    default:
      return (
        <svg {...common}>
          <path d="M8 1 2 4v8l6 3 6-3V4L8 1ZM2 4l6 3 6-3M8 7v8" />
        </svg>
      );
  }
};

export const RosterCard: React.FC<RosterCardProps> = ({
  model,
  reducedMotion,
  width,
  height,
  flipped,
  onToggleFlip,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties | undefined>(undefined);
  const isFlipped = flipped ?? internalFlipped;
  const h = height ?? 150;
  const interests = model.interests.slice(0, 2);
  const firstName = model.name.split(' ')[0];
  const bgInfo = getStudentBackground(model.studentId);

  const handleToggle = () => {
    playFeedbackSfx('flip');
    if (onToggleFlip) onToggleFlip();
    else setInternalFlipped((prev) => !prev);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotY = ((px - 0.5) * 9).toFixed(2);
    const rotX = ((0.5 - py) * 7).toFixed(2);
    setTiltStyle({
      '--holo-rx': `${rotX}deg`,
      '--holo-ry': `${rotY}deg`,
      '--holo-gx': `${Math.round(px * 100)}%`,
      '--holo-gy': `${Math.round(py * 100)}%`,
      '--holo-opacity': '0.32',
    } as React.CSSProperties);
  };

  const handlePointerLeave = () => {
    if (reducedMotion) return;
    setTiltStyle(undefined);
  };

  return (
    <li
      aria-label={cardAltText(model.number, model.name)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="roster-flip-scene holo-card-scene min-w-0"
      style={{ width: width ?? '100%', height: h, ...tiltStyle }}
    >
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={isFlipped}
        aria-label={
          isFlipped
            ? `Balik kartu ${model.name} ke tampilan foto`
            : `Balik kartu ${model.name} untuk melihat latar belakang, tipe, dan kesukaannya`
        }
        data-testid={`roster-card-${model.studentId}`}
        data-flipped={isFlipped ? 'true' : 'false'}
        className="group relative block h-full w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffe694]"
      >
        <div
          className={`roster-flip-inner ${reducedMotion ? 'roster-flip-inner--reduced' : ''}`}
          data-flipped={isFlipped ? 'true' : 'false'}
        >
          {/* SISI DEPAN: Kartu ID Lencana Kampus Vokasi (Atelier Collectible Pass) */}
          <div className="roster-flip-face roster-flip-front roster-card-chamfer yearbook-card holo-card-face grid grid-cols-[44%_56%] overflow-hidden bg-gradient-to-br from-[#fffdf7] via-[#f9efd8] to-[#efe0c2]">
            <span aria-hidden="true" className="holo-card-glare" />
            {/* Pita aksen jurusan tipis di puncak kartu */}
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-x-0 top-0 z-10 h-[3.5px] ${CARD_ACCENT_BAR[bgInfo.typeTone]}`}
            />
            {/* Pin kuningan buku tahunan mungil di tengah atas kartu */}
            <span aria-hidden="true" className="yearbook-pin" />

            {/* Kolom Kiri (44%): Bingkai Potret Setengah Badan Berlatar Nada Jurusan */}
            <div
              className={`relative h-full overflow-hidden border-r-2 border-[#3e2517]/20 bg-gradient-to-b ${PORTRAIT_BACKDROP_GRADIENT[bgInfo.typeTone]}`}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(255,253,242,0.72),transparent_68%)]"
              />
              <span
                className="absolute left-1.5 top-2 z-10 rounded-md border border-[#ffe694]/55 bg-[#3e2517] px-1.5 py-0.5 font-['Fredoka',sans-serif] text-[9.5px] font-bold leading-none text-[#ffe694] tabular-nums shadow-[0_1.5px_0_rgba(0,0,0,0.35)]"
                aria-hidden="true"
              >
                #{model.number}
              </span>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1.5 flex items-end justify-center [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:object-contain [&>canvas]:object-bottom [&>img]:!h-full [&>img]:!w-full">
                <PixelPortrait
                  studentId={model.studentId}
                  name={model.name}
                  expression="netral"
                  scale={2}
                  fit="contain"
                  reducedMotion={reducedMotion}
                />
              </div>
            </div>

            {/* Kolom Kanan (56%): Identitas Lega + Lencana Tipe + Pita Minat + Panggung Mini Chibi */}
            <div className="relative z-10 flex min-w-0 flex-col justify-between px-2.5 pb-1.5 pt-2.5">
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <span
                      title={model.name}
                      className="block truncate font-['Fredoka',sans-serif] text-[0.9rem] font-bold leading-tight text-[#3e2517]"
                    >
                      {firstName}
                    </span>
                    <span
                      className="mt-0.5 block truncate font-['Plus_Jakarta_Sans',sans-serif] text-[9px] font-semibold leading-tight text-[#7a5234]"
                      title={bgInfo.typeTag}
                    >
                      {bgInfo.typeTag}
                    </span>
                  </div>
                  <span
                    aria-hidden="true"
                    className="shrink-0 rounded-full border border-[#3e2517]/35 bg-gradient-to-b from-[#fff2be] to-[#f7cf65] px-1.5 py-0.5 font-['Fredoka',sans-serif] text-[8.5px] font-bold leading-none text-[#3e2517] shadow-[0_1.5px_0_#3e2517] transition group-hover:scale-105"
                  >
                    ↻ Profil
                  </span>
                </div>

                {/* Daftar minat praktikum rapi dengan batas aman */}
                <div className="mt-1.5 flex flex-col gap-1">
                  {interests.map((it) => (
                    <span
                      key={it.key}
                      className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-lg border border-[#3e2517]/22 bg-[#fffdf8]/95 px-1.5 py-0.5 text-[0.61rem] font-bold leading-tight text-[#3e2517] shadow-[0_1px_0_rgba(62,37,23,0.12)]"
                    >
                      <span className="shrink-0 text-[#2e8274]">
                        <InterestIcon id={it.iconId} />
                      </span>
                      <span className="truncate">{it.text}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-between gap-1 pt-0.5">
                <span
                  aria-hidden="true"
                  className="truncate font-['Fredoka',sans-serif] text-[8.5px] font-semibold tracking-wide text-[#8c623e] uppercase"
                >
                  ID Vokasi
                </span>
                <div className="roster-chibi-hop shrink-0 rounded-xl border border-[#3e2517]/25 bg-gradient-to-b from-[#fffdf6] to-[#f4e2be] px-1.5 py-0.5 shadow-[inset_0_-2px_0_#dfc391,0_2px_0_rgba(62,37,23,0.18)]">
                  <SpriteCanvas studentId={model.studentId} />
                </div>
              </div>
            </div>
          </div>

          {/* SISI BELAKANG: Dossier Latar Belakang, Tipe, & Kesukaan Mahasiswa */}
          <div className="roster-flip-face roster-flip-back roster-card-chamfer flex flex-col overflow-hidden bg-gradient-to-br from-[#fffaf0] via-[#f9edd3] to-[#f0ddb6]">
            <div className="flex shrink-0 items-center justify-between gap-1.5 border-b-2 border-[#3e2517] bg-gradient-to-r from-[#5a3520] to-[#3e2517] px-2.5 py-1.5 text-[#fffdf6]">
              <div className="min-w-0">
                <span className="block truncate font-['Fredoka',sans-serif] text-[11px] font-bold leading-tight text-[#ffe694]">
                  #{model.number} {model.name}
                </span>
                <span className="block truncate text-[9px] font-medium text-[#f5dec0]">
                  {bgInfo.originAndCohort}
                </span>
              </div>
              <span
                aria-hidden="true"
                className="shrink-0 rounded-full border border-[#ffe694]/50 bg-[#fffdf6]/15 px-1.5 py-0.5 font-['Fredoka',sans-serif] text-[9px] font-bold leading-none text-[#ffe694]"
              >
                ↺ Foto
              </span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-1.5 text-[10px] leading-[1.32] text-[#3e2517]">
              <div className="flex flex-wrap items-center gap-1">
                <span
                  className={`inline-block max-w-full truncate rounded-full border px-2 py-0.5 font-['Fredoka',sans-serif] text-[9.5px] font-bold leading-none ${TYPE_TONE_CLASSES[bgInfo.typeTone]}`}
                >
                  ✦ {bgInfo.typeTag}
                </span>
              </div>

              <p className="text-[#4a2e1b]">
                <strong className="font-['Fredoka',sans-serif] text-[#2e8274]">Suka:</strong>{' '}
                {bgInfo.likes}
              </p>

              <p className="text-[#3e2517]">
                <strong className="font-['Fredoka',sans-serif] text-[#9c4c1b]">Latar:</strong>{' '}
                {bgInfo.background}
              </p>
            </div>
          </div>
        </div>
      </button>
    </li>
  );
};

export default RosterCard;
