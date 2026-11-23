import React from 'react';
import type { RoomDecorId } from '../../engine/roomDecor';
import type { StoryScene } from '../../engine/story/storyTypes';
import { DecorArtwork } from './RoomDecorArt';

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
        <div className="absolute right-[9%] top-[8%]">
          <DecorArtwork
            id="lampu-senja"
            reducedMotion={reducedMotion}
            className="h-36 w-32 drop-shadow-[0_8px_16px_rgba(62,37,23,0.28)]"
          />
        </div>
      )}

      {/* Bingkai Poster Hangat di dinding kiri atas */}
      {has('poster-hangat') && (
        <div className="absolute left-[13%] top-[13%] hidden sm:block">
          <DecorArtwork
            id="poster-hangat"
            reducedMotion={reducedMotion}
            className="h-28 w-36 drop-shadow-[0_8px_14px_rgba(62,37,23,0.25)]"
          />
        </div>
      )}

      {/* Pemutar Vinyl Lo-Fi di rak kanan atas */}
      {has('pemutar-vinyl') && (
        <div className="absolute right-[19%] top-[17%] hidden md:block">
          <DecorArtwork
            id="pemutar-vinyl"
            reducedMotion={reducedMotion}
            className="h-24 w-28 drop-shadow-[0_8px_14px_rgba(62,37,23,0.25)]"
          />
        </div>
      )}

      {/* Pot Monstera & Kaktus hangat di sudut kiri bawah */}
      {has('tanaman-monstera') && (
        <div className="absolute bottom-[2%] left-[1.5%] hidden sm:block">
          <DecorArtwork
            id="tanaman-monstera"
            reducedMotion={reducedMotion}
            className="h-28 w-24 drop-shadow-[0_8px_14px_rgba(62,37,23,0.28)]"
          />
        </div>
      )}

      {/* Teko Teh Melati Hangat di meja depan tengah-bawah (di bawah koridor percakapan) */}
      {has('set-teh-hangat') && (
        <div className="absolute bottom-[1.5%] left-1/2 hidden -translate-x-1/2 lg:block">
          <DecorArtwork
            id="set-teh-hangat"
            reducedMotion={reducedMotion}
            className="h-20 w-28 drop-shadow-[0_8px_14px_rgba(62,37,23,0.28)]"
          />
        </div>
      )}

      {/* Patung Kucing Sapa Penenang di sudut kanan bawah (pesona maskot meja!) */}
      {has('kucing-penenang') && (
        <div className="absolute bottom-[2%] right-[1.5%] hidden sm:block">
          <DecorArtwork
            id="kucing-penenang"
            reducedMotion={reducedMotion}
            className="h-24 w-20 drop-shadow-[0_8px_14px_rgba(62,37,23,0.28)]"
          />
        </div>
      )}
    </div>
  );
};

export default RoomDecorOverlay;
