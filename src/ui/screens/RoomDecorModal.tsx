import React from 'react';
import {
  ROOM_DECOR_CATALOG,
  computeAvailableStars,
  computeEarnedEmpathyStars,
  type RoomDecorId,
  type RoomDecorState,
} from '../../engine/roomDecor';
import type { MissionRecord } from '../../engine/story/saveSlot';
import { GameButton } from '../components/game';

export interface RoomDecorModalProps {
  decor: RoomDecorState;
  missions: Readonly<Record<string, MissionRecord>>;
  onBuy: (itemId: RoomDecorId) => void;
  onToggleEquip: (itemId: RoomDecorId) => void;
  onClose: () => void;
}

const DECOR_EMOJI: Record<RoomDecorId, string> = {
  'tanaman-monstera': '🪴',
  'set-teh-hangat': '🫖',
  'kucing-penenang': '🐱',
  'lampu-senja': '🏮',
  'poster-hangat': '🖼️',
  'pemutar-vinyl': '🎵',
};

/**
 * Pop-Up "Hias Ruang Konsultasi BK": pemain menukar ⭐ Bintang Empati dari
 * sesi pendampingan untuk menghias Ruang Konsultasi secara nyata!
 */
export const RoomDecorModal: React.FC<RoomDecorModalProps> = ({
  decor,
  missions,
  onBuy,
  onToggleEquip,
  onClose,
}) => {
  const availableStars = computeAvailableStars(missions, decor);
  const totalEarned = computeEarnedEmpathyStars(missions);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="decor-shop-title"
      data-testid="room-decor-modal"
      className="fixed inset-0 z-[73] flex items-center justify-center bg-[#2c1a0e]/65 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="game-panel-cream flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden !rounded-[28px] border-[3.5px] border-[#3e2517] shadow-[0_10px_0_#3e2517,0_24px_50px_rgba(38,20,10,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#3e2517] bg-gradient-to-r from-[#d4574e] via-[#c74942] to-[#b83f3a] px-6 py-4 text-[#fffaf0]">
          <div>
            <p className="font-['Fredoka'] text-xs font-semibold uppercase tracking-wider text-[#ffe9a8]">
              Koleksi Ruang Konsultasi
            </p>
            <h2 id="decor-shop-title" className="font-['Fredoka'] text-2xl font-bold tracking-wide drop-shadow-[0_2px_0_#3e2517]">
              Hias Ruang BK Impianmu!
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-[#3e2517] bg-[#fff5d6] px-3.5 py-1 font-['Fredoka'] text-sm font-bold text-[#3e2517] shadow-[0_3px_0_#3e2517]">
              <span>⭐</span>
              <span>{availableStars} Bintang</span>
            </div>
            <GameButton variant="sekunder" size="sm" onClick={onClose}>
              Tutup
            </GameButton>
          </div>
        </header>

        <div className="border-b-2 border-[#3e2517]/15 bg-[#f7ebd2] px-6 py-2.5 text-xs font-semibold text-[#5a3b24]">
          Bantu mahasiswa memulihkan energinya untuk meraih ⭐ Bintang Empati (+2 setiap kisah terbuka · total diraih: {totalEarned} ⭐). Hiasan yang terpasang akan langsung muncul di Ruang Konsultasi saat kamu mengobrol!
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {ROOM_DECOR_CATALOG.map((item) => {
              const owned = decor.ownedIds.includes(item.id);
              const equipped = decor.equippedIds.includes(item.id);
              const canAfford = availableStars >= item.cost;

              return (
                <article
                  key={item.id}
                  className={`flex flex-col justify-between gap-3 rounded-[22px] border-[3px] p-4 transition ${
                    equipped
                      ? 'border-[#2d7a6e] bg-[#f3fbf7] shadow-[0_5px_0_#2d7a6e]'
                      : owned
                        ? 'border-[#3e2517] bg-[#fffdf7] shadow-[0_5px_0_#3e2517]'
                        : 'border-[#3e2517]/70 bg-[#fff9ec] shadow-[0_4px_0_rgba(62,37,23,0.35)]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-[2.5px] border-[#3e2517] bg-[#fde9be] text-2xl shadow-[inset_0_-3px_0_#e5c17d]">
                        {DECOR_EMOJI[item.id]}
                      </span>
                      <span className="rounded-full border-2 border-[#3e2517]/30 bg-[#f6e6c8] px-2.5 py-0.5 font-['Fredoka'] text-[11px] font-semibold text-[#5b3b23]">
                        {item.tag}
                      </span>
                    </div>
                    <h3 className="mt-2.5 font-['Fredoka'] text-base font-bold text-[#3e2517]">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#62442e]">
                      {item.description}
                    </p>
                  </div>

                  <div>
                    {owned ? (
                      <GameButton
                        variant={equipped ? 'sekunder' : 'primer'}
                        size="sm"
                        onClick={() => onToggleEquip(item.id)}
                        className="w-full"
                      >
                        {equipped ? '✓ Terpasang (Lepas)' : 'Pasang di Ruang BK'}
                      </GameButton>
                    ) : (
                      <GameButton
                        variant="primer"
                        size="sm"
                        disabled={!canAfford}
                        onClick={() => onBuy(item.id)}
                        className="w-full"
                      >
                        {canAfford ? `Beli & Pasang · ⭐ ${item.cost}` : `Butuh ⭐ ${item.cost}`}
                      </GameButton>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDecorModal;
