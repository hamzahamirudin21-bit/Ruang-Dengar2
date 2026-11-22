import React from 'react';

interface IconProps {
  className?: string;
}

export const IconZoomIn: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const IconZoomOut: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

export const IconResetView: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <polyline points="3 3 3 8 8 8" />
  </svg>
);

export const IconGrid: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="1" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="3" y1="15" x2="21" y2="15" />
    <line x1="9" y1="3" x2="9" y2="21" />
    <line x1="15" y1="3" x2="15" y2="21" />
  </svg>
);

export const IconTag: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7" cy="7" r="1.5" />
  </svg>
);

export const IconDoor: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M4 21h16" />
    <path d="M7 21V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v17" />
    <circle cx="14" cy="12" r="1" />
  </svg>
);

export const IconPlay: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <polygon points="6,4 20,12 6,20" />
  </svg>
);

export const IconPause: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

export const IconSettings: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

export const IconShieldNotice: React.FC<IconProps> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <circle cx="12" cy="16" r="0.8" fill="currentColor" />
  </svg>
);

export const IconLabEmblem: React.FC<IconProps> = ({ className = 'w-full h-auto' }) => (
  <svg viewBox="0 0 320 220" fill="none" className={className} aria-hidden="true">
    <rect x="8" y="8" width="304" height="204" rx="10" fill="#ffffff" stroke="#d5dde6" strokeWidth="2" />
    {/* Lantai zona simbolik */}
    <rect x="20" y="20" width="84" height="62" rx="4" fill="#f7efe6" stroke="#cbd5e1" />
    <rect x="112" y="20" width="96" height="62" rx="4" fill="#e8f1f8" stroke="#cbd5e1" />
    <rect x="216" y="20" width="84" height="62" rx="4" fill="#eceff3" stroke="#cbd5e1" />

    {/* Koridor tengah */}
    <rect x="20" y="90" width="280" height="20" rx="2" fill="#eef2f6" />

    {/* Area pemrograman, diskusi, dan ruang konsultasi */}
    <rect x="20" y="118" width="88" height="82" rx="4" fill="#eaf4f2" stroke="#cbd5e1" />
    <rect x="116" y="118" width="98" height="82" rx="4" fill="#f1f5ec" stroke="#cbd5e1" />
    <rect x="222" y="118" width="78" height="44" rx="4" fill="#e9f3f1" stroke="#0f766e" strokeWidth="1.5" />
    <rect x="222" y="168" width="78" height="32" rx="4" fill="#efeff6" stroke="#cbd5e1" />

    {/* Meja diskusi pusat */}
    <rect x="142" y="144" width="46" height="26" rx="4" fill="#cbd5e1" stroke="#64748b" />
    {/* Dua kursi di ruang konsultasi (dialog empat mata) */}
    <circle cx="246" cy="140" r="6" fill="#1d5d7a" />
    <circle cx="274" cy="140" r="6" fill="#0f766e" />
    <path d="M254 140h12" stroke="#64748b" strokeWidth="2" strokeDasharray="3 2" />

    {/* Pintu samping & indikator K3 */}
    <rect x="24" y="26" width="22" height="8" rx="1" fill="#eab308" />
    <rect x="220" y="132" width="4" height="14" fill="#b45309" />
    <rect x="262" y="160" width="16" height="4" fill="#0f766e" />
  </svg>
);
