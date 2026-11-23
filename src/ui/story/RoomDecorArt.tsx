import React from 'react';
import type { RoomDecorId } from '../../engine/roomDecor';

export interface DecorArtworkProps {
  id: RoomDecorId;
  className?: string;
  reducedMotion?: boolean;
}

/**
 * Ilustrasi vektor hand-inked orisinal (tinta espresso #3e2517 + shading hangat)
 * untuk seluruh 6 item Hias Ruang BK. Dipakai bersama di Toko Dekorasi & Ruang Konsultasi!
 */
export const DecorArtwork: React.FC<DecorArtworkProps> = ({
  id,
  className = 'h-20 w-20',
  reducedMotion = false,
}) => {
  switch (id) {
    case 'tanaman-monstera':
      return (
        <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
          {/* Bayangan pot */}
          <ellipse cx="60" cy="130" rx="28" ry="6" fill="rgba(62,37,23,0.18)" />
          {/* Daun belakang */}
          <path
            d="M60 82 C52 54 53 20 62 10 C71 20 72 54 60 82 Z"
            fill="#3f8552"
            stroke="#3e2517"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path d="M61 20 L60 76" stroke="#2c5e3a" strokeWidth="2" strokeLinecap="round" />
          {/* Daun kiri */}
          <path
            d="M58 84 C30 72 16 42 36 25 C50 13 69 30 61 58 Z"
            fill="#56a66a"
            stroke="#3e2517"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path d="M36 37 L55 68" stroke="#3c7d4d" strokeWidth="2" strokeLinecap="round" />
          {/* Daun kanan */}
          <path
            d="M62 84 C90 73 106 47 89 29 C75 15 58 34 62 59 Z"
            fill="#70be7e"
            stroke="#3e2517"
            strokeWidth="3.2"
            strokeLinejoin="round"
          />
          <path d="M84 40 L66 70" stroke="#488f59" strokeWidth="2" strokeLinecap="round" />
          {/* Kilau daun */}
          <ellipse cx="42" cy="36" rx="4" ry="2" transform="rotate(-30 42 36)" fill="#a5e3b0" />
          <ellipse cx="80" cy="37" rx="4" ry="2" transform="rotate(28 80 37)" fill="#b9f0c2" />
          {/* Pot terakota */}
          <path
            d="M32 85 H88 L80 128 H40 Z"
            fill="#d97a4e"
            stroke="#3e2517"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M36 105 H84" stroke="#b95d35" strokeWidth="2.5" strokeDasharray="6 5" />
          <rect
            x="25"
            y="76"
            width="70"
            height="14"
            rx="7"
            fill="#eb9268"
            stroke="#3e2517"
            strokeWidth="3.5"
          />
          <rect x="33" y="80" width="24" height="3.5" rx="2" fill="#f9bea0" />
        </svg>
      );

    case 'set-teh-hangat':
      return (
        <svg viewBox="0 0 136 96" className={className} aria-hidden="true">
          {/* Nampan kayu hangat */}
          <ellipse cx="68" cy="84" rx="58" ry="8" fill="#c98d53" stroke="#3e2517" strokeWidth="3" />
          {/* Uap teh lembut */}
          <g className={reducedMotion ? '' : 'cozy-steam'}>
            <path d="M50 24 Q45 15 51 8" fill="none" stroke="#fff8e6" strokeWidth="2.8" strokeLinecap="round" />
            <path d="M60 22 Q65 14 59 7" fill="none" stroke="#fff8e6" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
            <path d="M100 38 Q95 29 101 22" fill="none" stroke="#fff8e6" strokeWidth="2.6" strokeLinecap="round" />
          </g>
          {/* Pegangan & corong teko */}
          <path d="M24 52 C12 52 12 72 26 72" fill="none" stroke="#3e2517" strokeWidth="4" strokeLinecap="round" />
          <path d="M69 52 L85 43" stroke="#3e2517" strokeWidth="5" strokeLinecap="round" />
          <path d="M69 52 L84 44" stroke="#f7e7c8" strokeWidth="2.2" strokeLinecap="round" />
          {/* Badan teko keramik */}
          <ellipse cx="48" cy="60" rx="23" ry="19" fill="#fdf1d8" stroke="#3e2517" strokeWidth="3.2" />
          <path d="M27 62 Q48 70 69 62" fill="none" stroke="#3a9b88" strokeWidth="3.5" />
          <ellipse cx="40" cy="52" rx="6" ry="3" transform="rotate(-22 40 52)" fill="#ffffff" opacity="0.75" />
          <ellipse cx="48" cy="41" rx="13" ry="5" fill="#e89a5a" stroke="#3e2517" strokeWidth="2.8" />
          <circle cx="48" cy="34" r="4.5" fill="#e89a5a" stroke="#3e2517" strokeWidth="2.5" />
          {/* Cangkir teh melati */}
          <rect x="86" y="53" width="26" height="24" rx="7" fill="#fffdf6" stroke="#3e2517" strokeWidth="3" />
          <path d="M112 58 C121 58 121 71 112 71" fill="none" stroke="#3e2517" strokeWidth="3" />
          <path d="M90 60 H108" stroke="#c88d42" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="99" cy="67" r="2.2" fill="#e56256" />
        </svg>
      );

    case 'kucing-penenang':
      return (
        <svg viewBox="0 0 116 130" className={className} aria-hidden="true">
          {/* Bantal duduk merah-hangat */}
          <ellipse cx="58" cy="116" rx="40" ry="10" fill="#d8534a" stroke="#3e2517" strokeWidth="3.2" />
          <path d="M28 115 Q58 122 88 115" fill="none" stroke="#ffe599" strokeWidth="2" strokeDasharray="5 4" />
          {/* Badan kucing krem-putih */}
          <path
            d="M27 110 C22 84 26 54 35 40 L29 18 L49 28 C55 26 63 26 69 28 L89 18 L83 40 C92 54 96 84 91 110 Z"
            fill="#fffdf5"
            stroke="#3e2517"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Belang karamel manis */}
          <path d="M33 23 L45 29 L38 39 Z" fill="#eb9256" />
          <path d="M85 23 L73 29 L80 39 Z" fill="#eb9256" />
          <ellipse cx="32" cy="86" rx="6" ry="9" fill="#f3b27a" opacity="0.85" />
          {/* Mata tersenyum & pipi merona */}
          <path d="M41 54 Q46 47 51 54" fill="none" stroke="#3e2517" strokeWidth="3" strokeLinecap="round" />
          <path d="M67 54 Q72 47 77 54" fill="none" stroke="#3e2517" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="38" cy="62" rx="5.5" ry="3.2" fill="#f7a8a8" />
          <ellipse cx="80" cy="62" rx="5.5" ry="3.2" fill="#f7a8a8" />
          <path d="M55 59 Q59 64 63 59" fill="none" stroke="#3e2517" strokeWidth="2.5" strokeLinecap="round" />
          {/* Syal sage-merah & lonceng emas */}
          <path d="M33 73 Q59 81 85 73" fill="none" stroke="#d8534a" strokeWidth="7.5" strokeLinecap="round" />
          <circle cx="59" cy="79" r="6.5" fill="#ffd966" stroke="#3e2517" strokeWidth="2.6" />
          <path d="M56 79 H62" stroke="#3e2517" strokeWidth="1.8" strokeLinecap="round" />
          {/* Papan kecil "Sapa" */}
          <rect x="43" y="88" width="24" height="20" rx="5" fill="#ffe8a3" stroke="#3e2517" strokeWidth="2.5" />
          <path d="M49 95 H61 M49 101 H58" stroke="#3e2517" strokeWidth="2.2" strokeLinecap="round" />
          {/* Tangan kanan melambai lembut */}
          <g className={reducedMotion ? '' : 'cozy-paw-wave'} style={{ transformOrigin: '88px 74px' }}>
            <ellipse cx="90" cy="62" rx="9" ry="13" fill="#fffdf5" stroke="#3e2517" strokeWidth="3" />
            <circle cx="90" cy="56" r="2.2" fill="#f5a3a3" />
          </g>
        </svg>
      );

    case 'lampu-senja':
      return (
        <svg viewBox="0 0 120 140" className={className} aria-hidden="true">
          <defs>
            <radialGradient id="cozy-lamp-glow" cx="50%" cy="55%" r="50%">
              <stop offset="0%" stopColor="#ffe794" stopOpacity="0.65" />
              <stop offset="60%" stopColor="#f7be57" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#f7be57" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="84" r="52" fill="url(#cozy-lamp-glow)" className={reducedMotion ? '' : 'cozy-lamp-pulse'} />
          <line x1="60" y1="0" x2="60" y2="34" stroke="#3e2517" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="60" cy="34" r="5" fill="#d9902e" stroke="#3e2517" strokeWidth="2.5" />
          <path
            d="M27 80 L41 36 L79 36 L93 80 Z"
            fill="#f9cd6e"
            stroke="#3e2517"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path d="M35 67 H85" stroke="#cf8422" strokeWidth="2.8" strokeDasharray="5 4" />
          <path d="M44 42 L38 72" stroke="#fff4cc" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
          <ellipse cx="60" cy="82" rx="16" ry="7" fill="#fff8d6" stroke="#3e2517" strokeWidth="2.8" />
        </svg>
      );

    case 'poster-hangat':
      return (
        <svg viewBox="0 0 150 122" className={className} aria-hidden="true">
          <rect
            x="10"
            y="14"
            width="130"
            height="98"
            rx="14"
            fill="#fffdf6"
            stroke="#3e2517"
            strokeWidth="3.5"
          />
          <rect
            x="19"
            y="23"
            width="112"
            height="80"
            rx="9"
            fill="#fdedd2"
            stroke="#c98e59"
            strokeWidth="2.2"
            strokeDasharray="5 4"
          />
          {/* Selotip washi hangat */}
          <rect
            x="51"
            y="5"
            width="48"
            height="15"
            rx="5"
            fill="#3aa08e"
            stroke="#3e2517"
            strokeWidth="2.6"
          />
          <circle cx="43" cy="52" r="11" fill="#ffd966" stroke="#3e2517" strokeWidth="2.6" />
          <path d="M37 52 Q43 58 49 52" fill="none" stroke="#3e2517" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M64 45 H118 M64 57 H112 M64 69 H102" stroke="#5d3a24" strokeWidth="3.4" strokeLinecap="round" />
          <path
            d="M75 86 C75 80 83 80 83 86 C83 80 91 80 91 86 C91 93 83 97 83 97 C83 97 75 93 75 86 Z"
            fill="#e56256"
            stroke="#3e2517"
            strokeWidth="2.2"
          />
        </svg>
      );

    case 'pemutar-vinyl':
    default:
      return (
        <svg viewBox="0 0 126 102" className={className} aria-hidden="true">
          <rect x="8" y="26" width="110" height="66" rx="14" fill="#c97a4b" stroke="#3e2517" strokeWidth="3.5" />
          <rect x="16" y="33" width="94" height="50" rx="9" fill="#f7e7c8" stroke="#3e2517" strokeWidth="2.5" />
          <g className={reducedMotion ? '' : 'cozy-vinyl-spin'} style={{ transformOrigin: '54px 58px' }}>
            <circle cx="54" cy="58" r="21" fill="#2e241f" stroke="#3e2517" strokeWidth="3" />
            <circle cx="54" cy="58" r="14" fill="none" stroke="#5d4c42" strokeWidth="1.6" />
            <circle cx="54" cy="58" r="7" fill="#e56256" stroke="#3e2517" strokeWidth="2" />
            <circle cx="54" cy="58" r="2" fill="#fffdf5" />
            <path d="M40 48 A16 16 0 0 1 54 42" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />
          </g>
          <path d="M94 40 L74 58" stroke="#3e2517" strokeWidth="3.8" strokeLinecap="round" />
          <circle cx="94" cy="40" r="5" fill="#ffd966" stroke="#3e2517" strokeWidth="2.2" />
          <circle cx="96" cy="72" r="4.5" fill="#3aa08e" stroke="#3e2517" strokeWidth="2" />
          {!reducedMotion && (
            <text x="88" y="20" fontSize="18" fill="#ffe694" stroke="#3e2517" strokeWidth="1.2" className="cozy-steam">
              ♪
            </text>
          )}
        </svg>
      );
  }
};
