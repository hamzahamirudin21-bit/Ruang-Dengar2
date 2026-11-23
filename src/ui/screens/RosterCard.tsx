import React, { useEffect, useRef } from 'react';
import { cardAltText } from '../characters/altText';
import type { InterestLabel } from '../characters/interestLabels';
import { PixelPortrait } from '../characters/PixelPortrait';
import { SPRITE_H, SPRITE_W } from '../characters/pixelGrid';
import type { RosterCardModel } from '../characters/rosterModel';
import { drawSprite, onSpriteAssetsReady } from '../characters/spriteCanvas';

export interface RosterCardProps {
  model: RosterCardModel;
  reducedMotion: boolean;
  /** Ukuran kartu dari computeRosterLayout (px). */
  width?: number;
  height?: number;
}

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

export const RosterCard: React.FC<RosterCardProps> = ({ model, reducedMotion, width, height }) => {
  const h = height ?? 150;
  const interests = model.interests.slice(0, 2);
  const firstName = model.name.split(' ')[0];

  return (
    <li
      aria-label={cardAltText(model.number, model.name)}
      className="roster-card-chamfer group relative grid min-w-0 grid-cols-[52%_48%] overflow-hidden bg-gradient-to-br from-[#fffdf6] via-[#f8edd5] to-[#f0dec0]"
      style={{ width: width ?? '100%', height: h }}
    >
      {/* Kolom Kiri (52%): Potret Setengah Badan / Sedada Utuh Tanpa Tertutup Teks! */}
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

      {/* Kolom Kanan (48%): Nama + Minat + Miniatur Chibi Simetris */}
      <div className="relative z-10 flex min-w-0 flex-col justify-between p-2">
        <div className="min-w-0">
          <span
            title={model.name}
            className="block truncate font-['Fredoka',sans-serif] text-[0.88rem] font-bold leading-tight text-[#3e2517]"
          >
            {firstName}
          </span>
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

        {/* Miniatur Chibi di sudut kanan bawah */}
        <div className="flex items-end justify-end pt-1">
          <div className="roster-chibi-hop rounded-xl border border-[#3e2517]/20 bg-[#fff9eb]/90 px-1.5 py-0.5 shadow-[inset_0_-2px_0_#edd8b2]">
            <SpriteCanvas studentId={model.studentId} />
          </div>
        </div>
      </div>
    </li>
  );
};

export default RosterCard;
