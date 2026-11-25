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
  /** Indeks urutan kartu untuk animasi masuk bertahap (staggered entrance). */
  index?: number;
}

/** Ringkasan jabatan/peran singkat di bawah nama sesuai data asli STUDENT_BACKGROUNDS */
function shortRoleLabel(bg: StudentBackgroundInfo): string {
  const raw = bg.typeTag.split('·')[0]?.trim() || bg.typeTag;
  return raw.length > 22 ? raw.slice(0, 22).trim() : raw;
}

const BACK_TONE_BADGE: Record<StudentBackgroundInfo['typeTone'], string> = {
  teal: 'border-[#00e5ff]/55 bg-[#00e5ff]/15 text-[#7ef4ff]',
  amber: 'border-[#ffbd59]/60 bg-[#ffbd59]/16 text-[#ffd794]',
  rose: 'border-[#ff6b8b]/55 bg-[#ff6b8b]/15 text-[#ffb4c4]',
  indigo: 'border-[#5ea8ff]/55 bg-[#168bff]/18 text-[#a8d1ff]',
  emerald: 'border-[#2ef2b8]/55 bg-[#2ef2b8]/15 text-[#98fce0]',
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
      className="h-[2.35rem] w-[1.55rem] drop-shadow-[0_2px_6px_rgba(0,229,255,0.45)]"
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
    strokeWidth: 1.65,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };
  switch (id) {
    case 'chip':
      return (
        <svg {...common}>
          <rect x="4" y="4" width="8" height="8" rx="1" />
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
  index = 0,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties | undefined>(undefined);
  const isFlipped = flipped ?? internalFlipped;
  const h = height ?? 154;
  const interests = model.interests.slice(0, 2);
  const firstName = model.name.split(' ')[0];
  const bgInfo = getStudentBackground(model.studentId);
  const roleSubtitle = shortRoleLabel(bgInfo);

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
    const rotY = ((px - 0.5) * 7.5).toFixed(2);
    const rotX = ((0.5 - py) * 6).toFixed(2);
    setTiltStyle({
      '--holo-rx': `${rotX}deg`,
      '--holo-ry': `${rotY}deg`,
      '--holo-gx': `${Math.round(px * 100)}%`,
      '--holo-gy': `${Math.round(py * 100)}%`,
      '--holo-opacity': '0.38',
    } as React.CSSProperties);
  };

  const handlePointerLeave = () => {
    if (reducedMotion) return;
    setTiltStyle(undefined);
  };

  const staggerDelay = reducedMotion ? undefined : `${Math.min(index * 28, 380)}ms`;

  return (
    <li
      aria-label={cardAltText(model.number, model.name)}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="roster-flip-scene holo-card-scene rtx-card-entrance min-w-0"
      style={{
        width: width ?? '100%',
        height: h,
        animationDelay: staggerDelay,
        ...tiltStyle,
      }}
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
        className="rtx-card-btn group relative block h-full w-full cursor-pointer text-left focus-visible:outline-none"
      >
        <div
          className={`roster-flip-inner ${reducedMotion ? 'roster-flip-inner--reduced' : ''}`}
          data-flipped={isFlipped ? 'true' : 'false'}
        >
          {/* =================================================================
              SISI DEPAN: KARTU HOLOGRAFIK AAA SCI-FI LAB (100% KARAKTER ASLI)
             ================================================================= */}
          <div className="roster-flip-face roster-flip-front rtx-card-surface grid grid-cols-[46%_54%] overflow-hidden">
            {/* Sapuan cahaya holografik halus saat hover */}
            <span aria-hidden="true" className="holo-card-glare" />
            {/* Sudut braket teknikal cyan-gold */}
            <span aria-hidden="true" className="rtx-card-corner rtx-card-corner--tl" />
            <span aria-hidden="true" className="rtx-card-corner rtx-card-corner--tr" />
            <span aria-hidden="true" className="rtx-card-corner rtx-card-corner--bl" />
            <span aria-hidden="true" className="rtx-card-corner rtx-card-corner--br" />

            {/* Kolom Kiri (46%): Potret Asli Mahasiswa + Lencana Nomor #01 Emas-Hitam */}
            <div className="rtx-card-portrait-well relative h-full overflow-hidden">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(0,229,255,0.22),transparent_70%)] transition-opacity duration-300 group-hover:opacity-100"
              />
              <span
                className="rtx-card-number-badge"
                aria-hidden="true"
              >
                #{model.number}
              </span>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1.5 flex items-end justify-center transition-transform duration-300 group-hover:scale-[1.03] [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:object-contain [&>canvas]:object-bottom [&>img]:!h-full [&>img]:!w-full">
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

            {/* Kolom Kanan (54%): Nama, Peran Singkat, 2 Badge Keahlian Cyan, & Tombol Profil Emas */}
            <div className="relative z-10 flex min-w-0 flex-col justify-between px-2.5 py-2">
              <div className="min-w-0">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <span
                      title={model.name}
                      className="block truncate font-['Plus_Jakarta_Sans','Fredoka',sans-serif] text-[0.98rem] font-extrabold tracking-tight text-[#EAF7FF] drop-shadow-[0_1px_4px_rgba(0,0,0,0.65)]"
                    >
                      {firstName}
                    </span>
                    <span
                      title={bgInfo.typeTag}
                      className="mt-0.5 block truncate font-['Plus_Jakarta_Sans',sans-serif] text-[0.68rem] font-medium leading-tight text-[#9EB7C7]"
                    >
                      {roleSubtitle}
                    </span>
                  </div>
                </div>

                {/* 2 Badge Bidang Keahlian Holografik */}
                <div className="mt-1.5 flex flex-col gap-1">
                  {interests.map((it) => (
                    <span
                      key={it.key}
                      className="rtx-skill-badge"
                    >
                      <span className="shrink-0 text-[#00E5FF]">
                        <InterestIcon id={it.iconId} />
                      </span>
                      <span className="truncate">{it.text}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Baris Bawah: Avatar Mini Chibi (opsional halus) + Tombol Profil → Emas Bercahaya */}
              <div className="flex items-center justify-between gap-1.5 pt-1">
                <span className="rtx-profile-cta">
                  <span>Profil</span>
                  <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
                <div
                  className="roster-chibi-hop shrink-0 rounded-lg border border-[#00e5ff]/25 bg-[#061522]/75 px-1 py-0.5 shadow-[inset_0_0_8px_rgba(0,229,255,0.16)]"
                  title="Avatar Chibi Lab"
                >
                  <SpriteCanvas studentId={model.studentId} />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================================
              SISI BELAKANG: DOSSIER HOLOGRAFIK LATAR BELAKANG, TIPE, & KESUKAAN
             ================================================================= */}
          <div className="roster-flip-face roster-flip-back rtx-card-surface rtx-card-surface--back flex flex-col overflow-hidden">
            <span aria-hidden="true" className="rtx-card-corner rtx-card-corner--tl" />
            <span aria-hidden="true" className="rtx-card-corner rtx-card-corner--tr" />
            <span aria-hidden="true" className="rtx-card-corner rtx-card-corner--bl" />
            <span aria-hidden="true" className="rtx-card-corner rtx-card-corner--br" />

            <div className="flex shrink-0 items-center justify-between gap-1.5 border-b border-[#00e5ff]/30 bg-gradient-to-r from-[#092b38]/95 via-[#0c3747]/95 to-[#061522]/95 px-2.5 py-1.5 text-[#EAF7FF]">
              <div className="min-w-0">
                <span className="block truncate font-['Plus_Jakarta_Sans','Fredoka',sans-serif] text-[11px] font-bold leading-tight text-[#FFBD59]">
                  #{model.number} {model.name}
                </span>
                <span className="block truncate text-[9.5px] font-medium text-[#9EB7C7]">
                  {bgInfo.originAndCohort}
                </span>
              </div>
              <span
                aria-hidden="true"
                className="shrink-0 rounded-full border border-[#ffbd59]/55 bg-[#ffbd59]/15 px-2 py-0.5 font-['Plus_Jakarta_Sans',sans-serif] text-[9px] font-bold leading-none text-[#FFBD59]"
              >
                ↺ Foto
              </span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-2.5 py-1.5 text-[10px] leading-[1.35] text-[#EAF7FF]">
              <div className="flex flex-wrap items-center gap-1">
                <span
                  className={`inline-block max-w-full truncate rounded-full border px-2 py-0.5 font-['Plus_Jakarta_Sans',sans-serif] text-[9.5px] font-bold leading-none ${BACK_TONE_BADGE[bgInfo.typeTone]}`}
                >
                  ✦ {bgInfo.typeTag}
                </span>
              </div>

              <p className="text-[#d4ebf7]">
                <strong className="font-bold text-[#00E5FF]">Suka:</strong>{' '}
                {bgInfo.likes}
              </p>

              <p className="text-[#EAF7FF]">
                <strong className="font-bold text-[#FFBD59]">Latar:</strong>{' '}
                {bgInfo.background}
              </p>

              <p className="mt-auto rounded-md border border-[#00e5ff]/25 bg-[#061522]/75 px-2 py-1 text-[9.5px] text-[#9EB7C7]">
                <strong className="font-bold text-[#00E5FF]">Kunci Komunikasi:</strong>{' '}
                {bgInfo.communicationStyle}
              </p>
            </div>
          </div>
        </div>
      </button>
    </li>
  );
};

export default RosterCard;
