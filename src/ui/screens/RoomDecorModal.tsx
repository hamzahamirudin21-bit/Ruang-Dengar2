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
import { DecorArtwork } from '../story/RoomDecorArt';

export interface RoomDecorModalProps {
  decor: RoomDecorState;
  missions: Readonly<Record<string, MissionRecord>>;
  onBuy: (itemId: RoomDecorId) => void;
  onToggleEquip: (itemId: RoomDecorId) => void;
  onClose: () => void;
}

/**
 * Pop-Up "Hias Ruang Konsultasi BK" dengan pratinjau langsung ruangan mini!
 * Pemain menukar ⭐ Bintang Empati dari sesi pendampingan untuk menghias Ruang Konsultasi.
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
  const hasEquipped = (id: RoomDecorId) => decor.equippedIds.includes(id);

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
        className="game-panel-cream fx-panel-in flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden !rounded-[28px] border-[3.5px] border-[#3e2517] shadow-[0_10px_0_#3e2517,0_24px_50px_rgba(38,20,10,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#3e2517] bg-gradient-to-r from-[#e56256] via-[#cf4941] to-[#bc3e37] px-6 py-4 text-[#fffdf6]">
          <div>
            <p className="font-['Fredoka'] text-xs font-semibold uppercase tracking-wider text-[#ffe9a8]">
              Koleksi Ruang Konsultasi
            </p>
            <h2
              id="decor-shop-title"
              className="font-['Fredoka'] text-2xl font-bold tracking-wide drop-shadow-[0_2px_0_#3e2517]"
            >
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

        {/* Pratinjau Mini Ruang Konsultasi Langsung (berubah real-time saat beli/pasang!) */}
        <div className="border-b-[3px] border-[#3e2517] bg-[#f7ebd2] px-5 py-3.5">
          <div className="relative h-36 w-full overflow-hidden rounded-[20px] border-[3px] border-[#3e2517] bg-gradient-to-b from-[#fbe9c6] via-[#f5d8a8] to-[#c98b55] shadow-[inset_0_-6px_0_rgba(62,37,23,0.18)]">
            {/* Jendela & dinding ruang konsultasi mini */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-11 border-t-[3px] border-[#3e2517] bg-gradient-to-b from-[#b67546] to-[#945b33]"
            />
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-3 h-20 w-44 -translate-x-1/2 rounded-xl border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#cdeafb] to-[#eef9ff] shadow-inner"
            >
              <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-[#3e2517]/55" />
              <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-[#3e2517]/55" />
            </div>

            {/* Badge status pratinjau */}
            <div className="absolute left-3 top-2.5 z-10 rounded-full border-2 border-[#3e2517] bg-[#fffdf6]/95 px-2.5 py-0.5 font-['Fredoka'] text-[11px] font-bold text-[#3e2517]">
              Pratinjau Ruang BK · {decor.equippedIds.length}/{ROOM_DECOR_CATALOG.length} Terpasang
            </div>

            {/* Hiasan muncul langsung secara real-time di ruang mini! */}
            {hasEquipped('poster-hangat') && (
              <div className="absolute left-[14%] top-4">
                <DecorArtwork id="poster-hangat" className="h-14 w-18" />
              </div>
            )}
            {hasEquipped('lampu-senja') && (
              <div className="absolute right-[12%] top-0">
                <DecorArtwork id="lampu-senja" className="h-18 w-16" />
              </div>
            )}
            {hasEquipped('pemutar-vinyl') && (
              <div className="absolute right-[24%] top-7">
                <DecorArtwork id="pemutar-vinyl" className="h-14 w-16" />
              </div>
            )}
            {hasEquipped('tanaman-monstera') && (
              <div className="absolute bottom-2 left-[5%]">
                <DecorArtwork id="tanaman-monstera" className="h-20 w-18" />
              </div>
            )}
            {hasEquipped('set-teh-hangat') && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                <DecorArtwork id="set-teh-hangat" className="h-14 w-20" />
              </div>
            )}
            {hasEquipped('kucing-penenang') && (
              <div className="absolute bottom-2 right-[5%]">
                <DecorArtwork id="kucing-penenang" className="h-18 w-16" />
              </div>
            )}

            {decor.equippedIds.length === 0 && (
              <div className="absolute inset-x-0 bottom-2 text-center font-['Fredoka'] text-xs font-bold text-[#fff8e6] drop-shadow-[0_1.5px_0_#3e2517]">
                Pasang hiasan pertamamu — kamu sudah punya ⭐ {availableStars} Bintang modal awal!
              </div>
            )}
          </div>
          <p className="mt-2 text-xs font-semibold text-[#5a3b24]">
            Bantu mahasiswa memulihkan energinya untuk meraih ⭐ Bintang Empati (+2 tiap kisah terbuka · total diraih: {totalEarned} ⭐).
          </p>
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
                      ? 'border-[#27786a] bg-[#f2fbf7] shadow-[0_5px_0_#27786a]'
                      : owned
                        ? 'border-[#3e2517] bg-[#fffdf7] shadow-[0_5px_0_#3e2517]'
                        : 'border-[#3e2517]/75 bg-[#fff9ec] shadow-[0_4px_0_rgba(62,37,23,0.38)]'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-[2.5px] border-[#3e2517] bg-gradient-to-b from-[#fff5dc] to-[#f8dfb2] p-1.5 shadow-[inset_0_-3px_0_#e5c17d]">
                        <DecorArtwork id={item.id} className="h-16 w-16" />
                      </div>
                      <span
                        className={`rounded-full border-2 px-2.5 py-0.5 font-['Fredoka'] text-[11px] font-bold ${
                          equipped
                            ? 'border-[#27786a] bg-[#d6f5e8] text-[#1c5b50]'
                            : 'border-[#3e2517]/30 bg-[#f6e6c8] text-[#5b3b23]'
                        }`}
                      >
                        {equipped ? '✓ Terpasang' : item.tag}
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
                        bounce
                        onClick={() => onToggleEquip(item.id)}
                        className="w-full"
                      >
                        {equipped ? 'Lepas Sementara' : 'Pasang di Ruang BK'}
                      </GameButton>
                    ) : (
                      <GameButton
                        variant="primer"
                        size="sm"
                        bounce
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
