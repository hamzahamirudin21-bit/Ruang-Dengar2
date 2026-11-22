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
      className="roster-card-chamfer group relative flex min-w-0 flex-col justify-between overflow-hidden bg-gradient-to-b from-[#bfe0fa] via-[#e5f1fa] to-[#f4e5c8]"
      style={{ width: width ?? '100%', height: h }}
    >
      {/* Siluet cahaya matahari & garis grid blueprint halus di latar kartu */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(255,250,224,0.82),transparent_58%)]"
      />
      {/* Potret anime penuh di latar kartu */}
      <div className="pointer-events-none absolute inset-0 [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:object-contain [&>canvas]:object-bottom [&>img]:!h-full [&>img]:!w-full">
        <PixelPortrait
          studentId={model.studentId}
          name={model.name}
          expression="netral"
          scale={2}
          fit="cover-head"
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Gradasi halus bawah agar lencana chibi & minat selalu tajam terbaca */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0f1b33]/78 via-[#0f1b33]/28 to-transparent"
      />

      {/* Lencana nomor miring & nama asli sistem di kiri atas */}
      <div className="relative z-10 flex items-start justify-between p-1.5">
        <div className="flex max-w-[70%] flex-col gap-0.5">
          <span className="dossier-index-tag w-fit tabular-nums">
            #{model.number}
          </span>
          <span
            title={model.name}
            className="inline-flex w-fit max-w-full truncate rounded-tr-lg rounded-bl-lg border border-[#e5ac3f]/70 bg-[#0f1b33]/92 px-2 py-0.5 font-['Outfit','Plus_Jakarta_Sans',sans-serif] text-[0.75rem] font-extrabold leading-tight text-[#fff9ec] shadow-sm"
          >
            {firstName}
          </span>
        </div>
      </div>

      {/* Baris bawah: miniatur chibi kiri + kartu minat kanan */}
      <div className="relative z-10 flex items-end justify-between gap-1.5 px-2 pb-1.5">
        <div className="roster-chibi-hop shrink-0 -mb-0.5">
          <SpriteCanvas studentId={model.studentId} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-tr-xl rounded-bl-xl border-[1.5px] border-[#0f1b33]/80 bg-[#fdf9ef]/95 px-2 py-1 shadow-[0_2px_0_rgba(15,27,51,0.55)]">
          {interests.map((it) => (
            <span
              key={it.key}
              className="inline-flex min-w-0 items-center gap-1 text-[0.64rem] font-bold leading-tight text-[#0f1b33]"
            >
              <span className="shrink-0 text-[#15667f]">
                <InterestIcon id={it.iconId} />
              </span>
              <span className="truncate">{it.text}</span>
            </span>
          ))}
        </div>
      </div>
    </li>
  );
};

export default RosterCard;
