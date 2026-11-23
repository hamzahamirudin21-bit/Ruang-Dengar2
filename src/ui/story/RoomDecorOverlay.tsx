import React from 'react';
import type { RoomDecorId } from '../../engine/roomDecor';
import type { StoryScene } from '../../engine/story/storyTypes';

export interface RoomDecorOverlayProps {
  setting: StoryScene['setting'];
  equippedIds: readonly RoomDecorId[];
  reducedMotion?: boolean;
}

/**
 * Hiasan Ruang Konsultasi bergaya ilustrasi tinta hangat (hand-inked cozy).
 * Hanya tampil saat berada di Ruang Konsultasi dan diletakkan di tepi panggung
 * agar tidak menutupi karakter maupun kotak dialog.
 */
export const RoomDecorOverlay: React.FC<RoomDecorOverlayProps> = ({
  setting,
  equippedIds,
  reducedMotion = false,
}) => {
  if (setting !== 'ruang-konsultasi' || equippedIds.length === 0) return null;
  const has = (id: RoomDecorId) => equippedIds.includes(id);

  return (
    <div
      aria-hidden="true"
      data-testid="room-decor-overlay"
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
    >
      {/* Cahaya Lampu Senja lembut di sudut atas kanan */}
      {has('lampu-senja') && (
        <div
          className="absolute right-[10%] top-[10%] h-44 w-44"
          style={{
            background:
              'radial-gradient(circle, rgba(255, 224, 140, 0.34) 0%, rgba(255, 198, 102, 0.12) 48%, transparent 72%)',
          }}
        >
          <svg viewBox="0 0 120 140" className="mx-auto h-32 w-28 drop-shadow-md">
            <line x1="60" y1="0" x2="60" y2="34" stroke="#3e2517" strokeWidth="3.5" strokeLinecap="round" />
            <path
              d="M30 78 L42 36 L78 36 L90 78 Z"
              fill="#f8cb6e"
              stroke="#3e2517"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <path d="M36 66 L84 66" stroke="#d9932c" strokeWidth="2.5" strokeDasharray="4 4" />
            <ellipse cx="60" cy="80" rx="14" ry="6" fill="#fff7cc" stroke="#3e2517" strokeWidth="2.5" />
          </svg>
        </div>
      )}

      {/* Bingkai Poster Hangat di dinding kiri atas */}
      {has('poster-hangat') && (
        <div className="absolute left-[14%] top-[14%] hidden sm:block">
          <svg viewBox="0 0 150 118" className="h-28 w-36 drop-shadow-md">
            <rect
              x="10"
              y="12"
              width="130"
              height="96"
              rx="12"
              fill="#fff9ec"
              stroke="#3e2517"
              strokeWidth="3.5"
            />
            <rect
              x="18"
              y="20"
              width="114"
              height="80"
              rx="8"
              fill="#fdecd2"
              stroke="#c98e59"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {/* Selotip sudut atas */}
            <rect x="52" y="4" width="46" height="14" rx="4" fill="#f3b27a" stroke="#3e2517" strokeWidth="2.5" />
            <circle cx="42" cy="48" r="10" fill="#f4b952" stroke="#3e2517" strokeWidth="2.5" />
            <path d="M36 48 Q42 54 48 48" fill="none" stroke="#3e2517" strokeWidth="2" strokeLinecap="round" />
            <path d="M64 42 H118 M64 54 H112 M64 66 H102" stroke="#5d3a24" strokeWidth="3.2" strokeLinecap="round" />
            <path
              d="M74 82 C74 76 82 76 82 82 C82 76 90 76 90 82 C90 89 82 93 82 93 C82 93 74 89 74 82 Z"
              fill="#e06158"
              stroke="#3e2517"
              strokeWidth="2"
            />
          </svg>
        </div>
      )}

      {/* Pemutar Vinyl Lo-Fi di rak kanan atas */}
      {has('pemutar-vinyl') && (
        <div className="absolute right-[19%] top-[18%] hidden md:block">
          <svg viewBox="0 0 120 96" className="h-24 w-28 drop-shadow-md">
            <rect x="8" y="24" width="104" height="62" rx="12" fill="#c97a4b" stroke="#3e2517" strokeWidth="3.5" />
            <rect x="16" y="30" width="88" height="46" rx="8" fill="#f5e3c6" stroke="#3e2517" strokeWidth="2.5" />
            <circle cx="52" cy="53" r="20" fill="#2c2420" stroke="#3e2517" strokeWidth="3" />
            <circle cx="52" cy="53" r="12" fill="none" stroke="#5c4d44" strokeWidth="1.5" />
            <circle cx="52" cy="53" r="6" fill="#e86f5e" stroke="#3e2517" strokeWidth="2" />
            <path d="M88 38 L70 55" stroke="#3e2517" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="88" cy="38" r="4.5" fill="#f7c85c" stroke="#3e2517" strokeWidth="2" />
            {!reducedMotion && (
              <text x="86" y="20" fontSize="18" fill="#ffe79e" stroke="#3e2517" strokeWidth="1">
                ♪
              </text>
            )}
          </svg>
        </div>
      )}

      {/* Pot Monstera & Kaktus hangat di sudut kiri bawah */}
      {has('tanaman-monstera') && (
        <div className="absolute bottom-[23%] left-[2.5%] hidden sm:block">
          <svg viewBox="0 0 120 140" className="h-32 w-28 drop-shadow-md">
            {/* Daun monstera */}
            <path
              d="M58 84 C32 70 20 42 38 26 C52 14 70 30 62 56 Z"
              fill="#56a168"
              stroke="#3e2517"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <path
              d="M62 84 C88 72 104 48 88 30 C74 16 58 34 62 58 Z"
              fill="#6cb879"
              stroke="#3e2517"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            <path
              d="M60 82 C54 56 54 24 62 12 C70 24 70 56 60 82 Z"
              fill="#468c57"
              stroke="#3e2517"
              strokeWidth="3.2"
              strokeLinejoin="round"
            />
            {/* Pot terakota */}
            <path
              d="M32 84 H88 L80 128 H40 Z"
              fill="#d8794f"
              stroke="#3e2517"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            <rect x="26" y="76" width="68" height="14" rx="6" fill="#e68d63" stroke="#3e2517" strokeWidth="3.5" />
          </svg>
        </div>
      )}

      {/* Teko Teh Melati Hangat di bagian tengah-bawah di atas kotak dialog */}
      {has('set-teh-hangat') && (
        <div className="absolute bottom-[24%] left-[44%] hidden lg:block">
          <svg viewBox="0 0 130 90" className="h-20 w-32 drop-shadow-md">
            {/* Uap teh lembut */}
            {!reducedMotion && (
              <>
                <path d="M52 24 Q47 16 52 8" fill="none" stroke="#fff7e2" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
                <path d="M98 34 Q94 26 98 18" fill="none" stroke="#fff7e2" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
              </>
            )}
            {/* Teko keramik */}
            <path d="M24 52 C14 52 14 68 26 68" fill="none" stroke="#3e2517" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M68 50 L82 42" stroke="#3e2517" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="48" cy="58" rx="22" ry="18" fill="#f7e7c8" stroke="#3e2517" strokeWidth="3.2" />
            <ellipse cx="48" cy="40" rx="12" ry="4.5" fill="#e89a5a" stroke="#3e2517" strokeWidth="2.8" />
            <circle cx="48" cy="34" r="4" fill="#e89a5a" stroke="#3e2517" strokeWidth="2.5" />
            {/* Cangkir hangat */}
            <rect x="86" y="52" width="24" height="22" rx="6" fill="#fffaf0" stroke="#3e2517" strokeWidth="3" />
            <path d="M110 57 C118 57 118 68 110 68" fill="none" stroke="#3e2517" strokeWidth="3" />
            <path d="M89 58 H107" stroke="#c88d42" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      )}

      {/* Patung Kucing Sapa Penenang di sudut kanan bawah (pesona maskot meja!) */}
      {has('kucing-penenang') && (
        <div className="absolute bottom-[23%] right-[2.5%] hidden sm:block">
          <svg viewBox="0 0 110 125" className="h-28 w-24 drop-shadow-md">
            {/* Badan kucing krem-putih */}
            <path
              d="M26 112 C22 86 26 56 34 42 L28 20 L48 30 C54 28 62 28 68 30 L88 20 L82 42 C90 56 94 86 90 112 Z"
              fill="#fffaf0"
              stroke="#3e2517"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Belang telinga karamel */}
            <path d="M32 25 L43 31 L36 40 Z" fill="#e88d55" />
            <path d="M84 25 L73 31 L80 40 Z" fill="#e88d55" />
            {/* Mata tersenyum & pipi merah muda */}
            <path d="M40 54 Q45 48 50 54" fill="none" stroke="#3e2517" strokeWidth="3" strokeLinecap="round" />
            <path d="M66 54 Q71 48 76 54" fill="none" stroke="#3e2517" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="38" cy="61" rx="5" ry="3" fill="#f5a3a3" />
            <ellipse cx="78" cy="61" rx="5" ry="3" fill="#f5a3a3" />
            <path d="M54 59 Q58 64 62 59" fill="none" stroke="#3e2517" strokeWidth="2.5" strokeLinecap="round" />
            {/* Syal merah + lonceng emas */}
            <path d="M32 72 Q58 80 84 72" fill="none" stroke="#d9534f" strokeWidth="7" strokeLinecap="round" />
            <circle cx="58" cy="78" r="6" fill="#f7c85c" stroke="#3e2517" strokeWidth="2.5" />
            {/* Tangan kanan melambai */}
            <ellipse cx="88" cy="64" rx="9" ry="12" fill="#fffaf0" stroke="#3e2517" strokeWidth="3" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default RoomDecorOverlay;
