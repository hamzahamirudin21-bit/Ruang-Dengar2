import React from 'react';
import {
  ComicCharacterPose,
  ComicPanelCharacterPlacement,
  getComicCharacterIdentity,
} from './comicIntroData';

export interface ComicCharacterProps {
  placement: ComicPanelCharacterPlacement;
  isSpeaking?: boolean;
  compactMode?: boolean;
}

const POSE_ICON_MAP: Readonly<Record<ComicCharacterPose, { label: string; badgeClass: string }>> = {
  idle: { label: 'Siap', badgeClass: 'border-sky-300/60 bg-sky-950/85 text-sky-200' },
  walking: { label: 'Melangkah', badgeClass: 'border-amber-300/60 bg-amber-950/85 text-amber-200' },
  'looking-around': { label: 'Mengamati', badgeClass: 'border-cyan-300/60 bg-cyan-950/85 text-cyan-200' },
  talking: { label: 'Berbicara', badgeClass: 'border-amber-300/75 bg-amber-950/90 text-amber-100' },
  'working-electronics': { label: 'Elektronika & IoT', badgeClass: 'border-emerald-300/65 bg-emerald-950/85 text-emerald-200' },
  'working-code': { label: 'Firmware & Koding', badgeClass: 'border-sky-300/65 bg-sky-950/85 text-sky-200' },
  'working-weld': { label: 'Bengkel Las K3', badgeClass: 'border-orange-300/65 bg-orange-950/85 text-orange-200' },
  'working-3d': { label: 'Cetak 3D & Desain', badgeClass: 'border-violet-300/65 bg-violet-950/85 text-violet-200' },
  discussing: { label: 'Diskusi & Riset', badgeClass: 'border-teal-300/65 bg-teal-950/85 text-teal-200' },
};

export const ComicCharacter: React.FC<ComicCharacterProps> = ({
  placement,
  isSpeaking = false,
  compactMode = false,
}) => {
  const identity = getComicCharacterIdentity(placement.characterId);
  const poseMeta = POSE_ICON_MAP[placement.pose] ?? POSE_ICON_MAP.idle;
  const scale = placement.scale ?? 1;

  if (compactMode) {
    return (
      <div
        className="comic-intro-char-card group relative flex flex-col items-center rounded-xl border-2 border-slate-900/90 bg-slate-900/90 p-1.5 shadow-[0_4px_0_#090d16] transition-transform duration-200 hover:-translate-y-0.5"
        data-character-id={identity.id}
        style={{ borderColor: identity.accentColor }}
      >
        <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/20 bg-slate-800 sm:h-16 sm:w-16">
          <img
            src={identity.portraitUrl}
            alt={identity.name}
            className="h-full w-full object-cover object-top"
            loading="eager"
          />
          <span
            className="absolute top-0.5 left-0.5 rounded px-1 py-0.2 text-[9px] font-black tracking-tight text-slate-950"
            style={{ backgroundColor: identity.accentColor }}
          >
            {identity.orderNumber}
          </span>
        </div>
        <div className="mt-1 w-full text-center">
          <div className="truncate text-[11px] font-extrabold tracking-tight text-white">
            {identity.name.split(' ')[0]}
          </div>
          <div className="truncate text-[9px] font-semibold text-amber-200/90">
            {identity.specialtyGroup.split('&')[0].trim()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="comic-intro-character absolute bottom-0 flex flex-col items-center select-none"
      style={{
        left: `${placement.xPercent}%`,
        transform: `translateX(-50%) scale(${scale})`,
        zIndex: isSpeaking ? 25 : 15,
      }}
      data-character-id={identity.id}
      data-character-pose={placement.pose}
    >
      {/* Lencana aktivitas di atas bahu (tidak pernah menutupi wajah) */}
      <div
        className={`mb-1.5 flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase shadow-md backdrop-blur-sm ${poseMeta.badgeClass}`}
      >
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: identity.accentColor }}
        />
        <span>{placement.activityBadge ?? poseMeta.label}</span>
      </div>

      {/* Potret Ilustrasi 2D High-Detail */}
      <div
        className={`relative overflow-hidden rounded-t-2xl border-2 bg-gradient-to-b from-slate-800/75 to-slate-950/95 shadow-[0_10px_24px_rgba(2,6,23,0.75)] transition-all duration-300 ${
          isSpeaking
            ? 'ring-2 ring-amber-300/90 brightness-105'
            : 'border-slate-700/80 brightness-98'
        }`}
        style={{
          width: 'clamp(138px, 16vw, 198px)',
          height: 'clamp(175px, 23vh, 248px)',
          borderColor: isSpeaking ? '#fcd34d' : identity.accentColor,
        }}
      >
        <img
          src={identity.portraitUrl}
          alt={identity.name}
          className="h-full w-full object-cover object-top"
          style={{
            transform: placement.flipX ? 'scaleX(-1)' : undefined,
          }}
          loading="eager"
        />

        {/* Pita nomor urut & asal mahasiswa */}
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md border border-slate-950/80 bg-slate-950/85 px-1.5 py-0.5 text-[10px] font-black text-white shadow">
          <span style={{ color: identity.accentColor }}>{identity.orderNumber}</span>
          <span className="text-slate-300">·</span>
          <span className="text-[9px] font-semibold text-slate-200">{identity.origin}</span>
        </div>
      </div>

      {/* Papan Nama Bergaya Komik di Bawah Karakter */}
      <div className="-mt-2 flex min-w-[154px] max-w-[220px] flex-col items-center rounded-lg border-2 border-slate-950 bg-slate-900/95 px-2.5 py-1 text-center shadow-[0_3px_0_#020617]">
        <div className="flex items-center gap-1 text-xs font-black tracking-wide text-white">
          <span>{identity.name}</span>
          {isSpeaking && (
            <span
              className="inline-block h-2 w-2 rounded-full bg-amber-400"
              title="Sedang berbicara"
            />
          )}
        </div>
        <div className="line-clamp-1 text-[10px] font-semibold text-amber-300/95">
          {identity.typeTag}
        </div>
      </div>
    </div>
  );
};
