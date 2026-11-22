import React from 'react';
import type { StatusShape } from '../story/storyLayout';

interface IconProps {
  className?: string;
}

const DEFAULT_CLASS = 'w-4 h-4';

/** Pembungkus seragam: viewBox 24, stroke 2, garis membulat, warna mengikuti currentColor. */
const Svg: React.FC<IconProps & { children: React.ReactNode }> = ({ className = DEFAULT_CLASS, children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconProfil: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
  </Svg>
);

export const IconJadwal: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="3" x2="8" y2="7" />
    <line x1="16" y1="3" x2="16" y2="7" />
  </Svg>
);

export const IconRiwayat: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <polyline points="3 3 3 8 8 8" />
    <polyline points="12 7 12 12 15.5 14" />
  </Svg>
);

export const IconRelasi: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="6" cy="6" r="2.5" />
    <circle cx="18" cy="8" r="2.5" />
    <circle cx="10" cy="19" r="2.5" />
    <line x1="8.3" y1="7" x2="15.7" y2="7.6" />
    <line x1="7" y1="8.4" x2="9.2" y2="16.5" />
    <line x1="16.9" y1="10.3" x2="11.8" y2="17.2" />
  </Svg>
);

export const IconAuto: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <polygon points="6 4 15 12 6 20 6 4" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </Svg>
);

export const IconSkip: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <polygon points="4 5 12 12 4 19 4 5" />
    <polygon points="12 5 20 12 12 19 12 5" />
  </Svg>
);

export const IconLog: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="8" y1="8" x2="16" y2="8" />
    <line x1="8" y1="12" x2="16" y2="12" />
    <line x1="8" y1="16" x2="13" y2="16" />
  </Svg>
);

export const IconSimpan: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M5 3h11l4 4v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <rect x="8" y="3" width="7" height="5" />
    <rect x="7" y="13" width="10" height="8" />
  </Svg>
);

export const IconMuat: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 7a1 1 0 0 1 1-1h5l2 2h8a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <polyline points="9 14 12 17 15 14" />
  </Svg>
);

export const IconAkhiri: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5" />
    <line x1="10" y1="12" x2="20" y2="12" />
    <polyline points="16 8 20 12 16 16" />
  </Svg>
);

export const IconIkuti: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="7" />
    <circle cx="12" cy="12" r="2" />
    <line x1="12" y1="2" x2="12" y2="5" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="2" y1="12" x2="5" y2="12" />
    <line x1="19" y1="12" x2="22" y2="12" />
  </Svg>
);

export const IconPanahCiut: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <polyline points="6 15 12 9 18 15" />
  </Svg>
);

export const IconPanahLuas: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <polyline points="6 9 12 15 18 9" />
  </Svg>
);

/** Titik status: bentuk berbeda per status agar tidak bergantung pada warna saja. */
export const StatusShapeIcon: React.FC<IconProps & { shape: StatusShape }> = ({
  shape,
  className = 'w-3 h-3',
}) => (
  <svg
    viewBox="0 0 12 12"
    className={className}
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {shape === 'lingkaran' && <circle cx="6" cy="6" r="4.5" />}
    {shape === 'persegi' && <rect x="1.5" y="1.5" width="9" height="9" />}
    {shape === 'belah-ketupat' && <polygon points="6 1 11 6 6 11 1 6" />}
    {shape === 'segitiga' && <polygon points="6 1.5 11 10.5 1 10.5" />}
    {shape === 'garis' && <line x1="1.5" y1="6" x2="10.5" y2="6" strokeWidth="2.5" />}
  </svg>
);

/** Ikon HUD khas: kontur tebal, isi lembut dari currentColor. */
const SvgIsi: React.FC<IconProps & { children: React.ReactNode }> = ({ className = DEFAULT_CLASS, children }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    fillOpacity="0.25"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const IconBintang: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <polygon points="12 2.5 14.9 8.7 21.5 9.5 16.6 14 18 20.7 12 17.3 6 20.7 7.4 14 2.5 9.5 9.1 8.7 12 2.5" />
  </SvgIsi>
);

export const IconJam: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 6.5 12 12 16 14" fill="none" />
  </SvgIsi>
);

export const IconKalender: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <line x1="3" y1="10.5" x2="21" y2="10.5" fill="none" />
    <line x1="8" y1="3" x2="8" y2="7" fill="none" />
    <line x1="16" y1="3" x2="16" y2="7" fill="none" />
  </SvgIsi>
);

export const IconOrang: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <circle cx="12" cy="7.5" r="4" />
    <path d="M4 21c0-4.6 3.6-7.5 8-7.5s8 2.9 8 7.5z" />
  </SvgIsi>
);

export const IconEnergi: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <polygon points="13.5 2 5 13.5 11 13.5 10 22 19 10 12.5 10 13.5 2" />
  </SvgIsi>
);

export const IconStres: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 16c1-1.5 2.5-2 4-2s3 .5 4 2" fill="none" />
    <line x1="8.5" y1="9.5" x2="10" y2="10.5" fill="none" />
    <line x1="15.5" y1="9.5" x2="14" y2="10.5" fill="none" />
  </SvgIsi>
);

export const IconJeda: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <rect x="6" y="4.5" width="4" height="15" rx="1" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" />
  </SvgIsi>
);

export const IconPutar: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <polygon points="7 4.5 19 12 7 19.5 7 4.5" />
  </SvgIsi>
);

export const IconKecepatan: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <polygon points="3 5.5 11 12 3 18.5 3 5.5" />
    <polygon points="12 5.5 20 12 12 18.5 12 5.5" />
  </SvgIsi>
);

export const IconTelinga: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M7 9a5 5 0 0 1 10 0c0 3-2 4-3 5.5s-.5 3.5-2.5 3.5a2.5 2.5 0 0 1-2.5-2.5" />
    <path d="M10.5 9a1.5 1.5 0 0 1 3 0" fill="none" />
  </SvgIsi>
);

export const IconObrolan: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
  </SvgIsi>
);

/* ---------- Ikon emote (di atas kepala potret) ---------- */

export type EmoteIconId = 'hati' | 'tanya' | 'keringat' | 'awan' | 'kilau' | 'seru';

export const EmoteHati: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M12 20.5C5 15.5 3 12 3 8.8A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 9 2.4c0 3.2-2 6.7-9 11.7z" />
  </SvgIsi>
);

export const EmoteTanya: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M8.5 9a3.5 3.5 0 1 1 5.6 2.8c-1.2.9-2.1 1.5-2.1 3.2" fill="none" />
    <circle cx="12" cy="19.5" r="1" />
  </SvgIsi>
);

export const EmoteKeringat: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M12 3C12 3 5.5 10.5 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 10.5 12 3 12 3z" />
    <path d="M9 15a3 3 0 0 0 3 3" fill="none" />
  </SvgIsi>
);

export const EmoteAwan: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M7 18a4 4 0 0 1-.6-7.95A5.5 5.5 0 0 1 17 9.5a4.2 4.2 0 0 1 .5 8.5H7z" />
  </SvgIsi>
);

export const EmoteKilau: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M12 3l1.8 5.7L19.5 10.5l-5.7 1.8L12 18l-1.8-5.7L4.5 10.5l5.7-1.8L12 3z" />
    <path d="M19 16v4M17 18h4" fill="none" />
  </SvgIsi>
);

export const EmoteSeru: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M12 3.5v11" fill="none" strokeWidth="3.5" />
    <circle cx="12" cy="19.5" r="1.6" />
  </SvgIsi>
);

export const EMOTE_ICONS: Record<EmoteIconId, React.FC<IconProps>> = {
  hati: EmoteHati,
  tanya: EmoteTanya,
  keringat: EmoteKeringat,
  awan: EmoteAwan,
  kilau: EmoteKilau,
  seru: EmoteSeru,
};

export const EmoteIcon: React.FC<IconProps & { id: EmoteIconId }> = ({ id, ...p }) => {
  const C = EMOTE_ICONS[id];
  return <C {...p} />;
};

/* ---------- Ikon gaya ucapan (kartu pilihan) ---------- */

export type ChoiceStyleIconId = 'tanya' | 'ruang' | 'hangat' | 'saran';

export const ChoiceTanya: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 4 2c-1 .7-1.5 1.1-1.5 2.5" fill="none" />
    <circle cx="12" cy="17" r="0.8" />
  </SvgIsi>
);

export const ChoiceRuang: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z" />
    <path d="M7.5 12h9" fill="none" />
    <path d="M10 9l-2.5 3 2.5 3M14 9l2.5 3-2.5 3" fill="none" />
  </SvgIsi>
);

export const ChoiceHangat: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M12 20.5C5 15.5 3 12 3 8.8A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 9 2.4c0 3.2-2 6.7-9 11.7z" />
    <path d="M7.5 9.5c.3-1 1.1-1.7 2-1.8" fill="none" />
  </SvgIsi>
);

export const ChoiceSaran: React.FC<IconProps> = (p) => (
  <SvgIsi {...p}>
    <path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
    <line x1="9.5" y1="20" x2="14.5" y2="20" fill="none" />
    <line x1="10.5" y1="22" x2="13.5" y2="22" fill="none" />
  </SvgIsi>
);

export const CHOICE_STYLE_ICONS: Record<ChoiceStyleIconId, React.FC<IconProps>> = {
  tanya: ChoiceTanya,
  ruang: ChoiceRuang,
  hangat: ChoiceHangat,
  saran: ChoiceSaran,
};

export const ChoiceStyleIcon: React.FC<IconProps & { id: ChoiceStyleIconId }> = ({ id, ...p }) => {
  const C = CHOICE_STYLE_ICONS[id];
  return <C {...p} />;
};
