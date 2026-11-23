import React, { useEffect, useRef, useState } from 'react';
import { getStudentBackground, type StudentBackgroundInfo } from '../../data/studentBackgrounds';
import { cardAltText } from '../characters/altText';
import type { InterestLabel } from '../characters/interestLabels';
import { PixelPortrait } from '../characters/PixelPortrait';
import { SPRITE_H, SPRITE_W } from '../characters/pixelGrid';
import type { RosterCardModel } from '../characters/rosterModel';
import { drawSprite, onSpriteAssetsReady } from '../characters/spriteCanvas';
import { playSfx } from '../motion/sfx';

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
  const isFlipped = flipped ?? internalFlipped;
  const h = height ?? 150;
  const interests = model.interests.slice(0, 2);
  const firstName = model.name.split(' ')[0];
  const bgInfo = getStudentBackground(model.studentId);

  const handleToggle = () => {
    playSfx('klik');
    if (onToggleFlip) onToggleFlip();
    else setInternalFlipped((prev) => !prev);
  };

  return (
    <li
      aria-label={cardAltText(model.number, model.name)}
      className="roster-flip-scene min-w-0"
      style={{ width: width ?? '100%', height: h }}
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
          {/* SISI DEPAN: Potret Setengah Badan + Nama + Minat + Mini Chibi */}
          <div className="roster-flip-face roster-flip-front roster-card-chamfer grid grid-cols-[52%_48%] overflow-hidden bg-gradient-to-br from-[#fffdf6] via-[#f8edd5] to-[#f0dec0]">
            {/* Kolom Kiri (52%): Potret Setengah Badan Utuh */}
            <div className="relative h-full overflow-hidden border-r-[2.5px] border-[#3e2517]/25 bg-gradient-to-b from-[#cbe6fb] via-[#eaf4f8] to-[#f7e5c6]">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,253,238,0.85),transparent_65%)]"
              />
              <span
                className="absolute left-1.5 top-1.5 z-10 rounded-full border border-[#fffdf6]/40 bg-[#3e2517]/92 px-2 py-0.5 font-['Fredoka',sans-serif] text-[10px] font-bold leading-none text-[#fffdf6] tabular-nums shadow-xs"
                aria-hidden="true"
              >
                #{model.number}
              </span>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1 flex items-end justify-center [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:object-contain [&>canvas]:object-bottom [&>img]:!h-full [&>img]:!w-full">
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

            {/* Kolom Kanan (48%): Nama + Minat + Tombol Hint Balik + Miniatur Chibi */}
            <div className="relative z-10 flex min-w-0 flex-col justify-between p-2">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    title={model.name}
                    className="block truncate font-['Fredoka',sans-serif] text-[0.88rem] font-bold leading-tight text-[#3e2517]"
                  >
                    {firstName}
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 rounded-full border border-[#3e2517]/30 bg-[#ffe9a6] px-1.5 py-0.5 font-['Fredoka',sans-serif] text-[9px] font-bold leading-none text-[#3e2517] transition group-hover:scale-105 group-hover:bg-[#ffd66b]"
                  >
                    ↻ Info
                  </span>
                </div>
                <div className="mt-1.5 flex flex-col gap-1">
                  {interests.map((it) => (
                    <span
                      key={it.key}
                      className="inline-flex min-w-0 items-center gap-1 rounded-full border border-[#3e2517]/25 bg-[#fffdf7] px-2 py-0.5 text-[0.62rem] font-bold leading-tight text-[#3e2517]"
                    >
                      <span className="shrink-0 text-[#2e8274]">
                        <InterestIcon id={it.iconId} />
                      </span>
                      <span className="truncate">{it.text}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-end justify-end pt-1">
                <div className="roster-chibi-hop rounded-xl border border-[#3e2517]/20 bg-[#fff9eb]/90 px-1.5 py-0.5 shadow-[inset_0_-2px_0_#edd8b2]">
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
