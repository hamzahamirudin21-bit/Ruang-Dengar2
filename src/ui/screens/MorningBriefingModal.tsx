import React from 'react';
import { SHIFT_TARGET_STORIES } from '../../engine/storySignals';
import { assetUrl } from '../characters/assetSlots';
import { GameButton } from '../components/game';

export interface MorningBriefingModalProps {
  onStartShift: () => void;
}

/**
 * Briefing Pagi 1-kartu saat pemain baru memasuki Lab Vokasi:
 * memberi konteks cerita, alasan jelas menghampiri mahasiswa, dan target shift yang menarik.
 */
export const MorningBriefingModal: React.FC<MorningBriefingModalProps> = ({ onStartShift }) => {
  const dosenSrc = assetUrl('assets/characters/dosen-portrait.png');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-title"
      data-testid="morning-briefing-modal"
      className="fixed inset-0 z-[75] flex items-center justify-center bg-[#091224]/72 p-4 backdrop-blur-xs"
    >
      <div className="game-panel-cream relative grid w-full max-w-2xl overflow-hidden !rounded-[8px_26px_8px_26px] border-[3px] border-[#0f1b33] shadow-[0_10px_0_#091122,0_26px_60px_rgba(5,10,22,0.65)] sm:grid-cols-[0.82fr_1.18fr]">
        {/* Sisi Kiri: Ilustrasi Ibu Dosen BK + Cap Shift Pagi */}
        <div className="relative flex flex-col items-center justify-end overflow-hidden border-b-2 border-[#0f1b33] bg-gradient-to-b from-[#17305a] via-[#1c486e] to-[#122240] px-4 pt-5 sm:border-b-0 sm:border-r-2">
          <span className="absolute left-3 top-3 rounded-[3px_10px_3px_10px] border border-[#fde08d]/65 bg-[#0f1b33]/85 px-2.5 py-1 font-['Outfit'] text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#fde08d]">
            08.00 WIB · Shift Pagi
          </span>
          <img
            src={dosenSrc}
            alt="Ibu Dosen BK"
            className="mt-6 h-52 w-auto object-contain object-bottom drop-shadow-[0_12px_20px_rgba(5,10,22,0.55)] sm:h-64"
          />
        </div>

        {/* Sisi Kanan: Premis Cerita & 3 Langkah Misi */}
        <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
          <div>
            <p className="font-['Outfit'] text-[11px] font-extrabold uppercase tracking-[0.12em] text-[#175e75]">
              Misi Hari Ini · Di Balik Ruang Lab
            </p>
            <h2
              id="briefing-title"
              className="mt-1 font-['Outfit'] text-2xl font-black leading-tight text-[#0f1b33]"
            >
              Ada Cerita di Balik Setiap Keheningan
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#2d3b52]">
              Di balik ramainya praktikum hari ini, beberapa mahasiswa diam-diam mulai menjauh,
              memendam beban, dan kehabisan energi sosialnya.
            </p>

            <ol className="mt-3.5 space-y-2 text-xs leading-relaxed text-[#1d2b44]">
              <li className="flex items-start gap-2.5 rounded-[4px_12px_4px_12px] border border-[#0f1b33]/18 bg-white/80 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px_7px_3px_7px] bg-[#14233f] font-['Outfit'] text-[11px] font-black text-[#fde08d]">
                  1
                </span>
                <span>
                  <strong>Pantau bilah energi di peta.</strong> Mahasiswa yang mengobrol energinya
                  naik (<strong className="text-emerald-700">+</strong>), sedangkan yang terus
                  menyendiri energinya makin meredup (<strong className="text-red-700">▼</strong>).
                </span>
              </li>
              <li className="flex items-start gap-2.5 rounded-[4px_12px_4px_12px] border border-[#0f1b33]/18 bg-white/80 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px_7px_3px_7px] bg-[#14233f] font-['Outfit'] text-[11px] font-black text-[#fde08d]">
                  2
                </span>
                <span>
                  <strong>Baca sinyal perilaku mereka.</strong> Setiap mahasiswa yang mulai
                  terisolasi meninggalkan petunjuk kecil. Klik untuk menghampiri dan cari tahu
                  alasannya.
                </span>
              </li>
              <li className="flex items-start gap-2.5 rounded-[4px_12px_4px_12px] border border-[#0f1b33]/18 bg-white/80 p-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px_7px_3px_7px] bg-[#14233f] font-['Outfit'] text-[11px] font-black text-[#fde08d]">
                  3
                </span>
                <span>
                  <strong>Dengarkan dengan hati, bukan menceramahi.</strong> Cara bicaramu
                  menentukan apakah mereka berani membuka kisahnya dan energinya pulih kembali.
                </span>
              </li>
            </ol>

            <div className="mt-3.5 rounded-[4px_12px_4px_12px] border-2 border-[#e5ac3f] bg-[#fff8e6] px-3 py-2 text-xs font-bold text-[#14233f]">
              🎯 Target Shift: Ungkap minimal {SHIFT_TARGET_STORIES} kisah mahasiswa &amp; jaga
              energi lab (bebas lanjut hingga semua 15 kisah terbuka!).
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <GameButton
              variant="primer"
              size="md"
              bounce
              onClick={onStartShift}
              className="w-full sm:w-auto"
            >
              Mulai Mengawasi Lab →
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorningBriefingModal;
