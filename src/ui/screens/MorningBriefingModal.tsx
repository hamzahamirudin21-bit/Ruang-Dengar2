import React from 'react';
import { MAX_LOST_STUDENTS } from '../../engine/survivalMission';
import { assetUrl } from '../characters/assetSlots';
import { GameButton } from '../components/game';

export interface MorningBriefingModalProps {
  onStartShift: () => void;
}

/**
 * Briefing Pagi bergaya kartu ilustrasi tinta hangat (hand-inked cozy):
 * menjelaskan aturan jaga energi (1-1,5 menit), kalah saat 3 mahasiswa hilang,
 * dan percakapan 7 langkah dengan 2 pilihan jawaban yang makin menantang.
 */
export const MorningBriefingModal: React.FC<MorningBriefingModalProps> = ({ onStartShift }) => {
  const dosenSrc = assetUrl('dosen-portrait.png');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="briefing-title"
      data-testid="morning-briefing-modal"
      className="fixed inset-0 z-[75] flex items-center justify-center bg-[#2c1a0e]/68 p-4 backdrop-blur-xs"
    >
      <div className="game-panel-cream responsive-modal-panel responsive-modal-panel--90 responsive-modal-scroll fx-panel-in relative grid w-full max-w-2xl overflow-hidden !rounded-[28px] border-[3.5px] border-[#3e2517] shadow-[0_10px_0_#3e2517,0_26px_60px_rgba(38,20,10,0.5)] sm:grid-cols-[0.82fr_1.18fr]">
        {/* Sisi Kiri: Ibu Dosen BK + Cap Pagi Hangat */}
        <div className="relative flex flex-col items-center justify-end overflow-hidden border-b-[3px] border-[#3e2517] bg-gradient-to-b from-[#fce6b8] via-[#f6cf8a] to-[#e6ac62] px-4 pt-5 sm:border-b-0 sm:border-r-[3px]">
          <span className="absolute left-3 top-3 rounded-full border-2 border-[#3e2517] bg-[#d9534f] px-3 py-0.5 font-['Fredoka'] text-[11px] font-bold uppercase tracking-wider text-[#fffaf0] shadow-[0_3px_0_#3e2517]">
            ☀️ 08.00 · Shift Pagi
          </span>
          <img
            src={dosenSrc}
            alt="Ibu Dosen BK"
            className="mt-6 h-52 w-auto object-contain object-bottom drop-shadow-[0_10px_16px_rgba(62,37,23,0.35)] sm:h-64"
          />
        </div>

        {/* Sisi Kanan: Aturan Main yang Jelas & Seru */}
        <div className="flex flex-col justify-between gap-4 p-5 sm:p-6">
          <div>
            <p className="font-['Fredoka'] text-xs font-bold uppercase tracking-wider text-[#c4453d]">
              Ruang Dengar · Misi Dosen Konselor
            </p>
            <h2
              id="briefing-title"
              className="mt-1 font-['Fredoka'] text-2xl font-bold leading-tight text-[#3e2517]"
            >
              Jangan Biarkan Energi Mereka Habis!
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#5c3d28]">
              Waktu peta berjalan terus dan energi tiap mahasiswa bertahan sekitar <strong>1–1,5 menit</strong>.
              Dampingi mereka sebelum energinya kosong!
            </p>

            <ol className="mt-3.5 space-y-2 text-xs leading-relaxed text-[#3e2517]">
              <li className="flex items-start gap-2.5 rounded-[16px] border-2 border-[#3e2517]/25 bg-[#fffdf7] p-2.5 shadow-[inset_0_-3px_0_#eedcb9]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#3e2517] bg-[#f7c85c] font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                  1
                </span>
                <span>
                  <strong>Cegah mahasiswa hilang (0%).</strong> Bila energi menyentuh 0%, mahasiswa
                  meninggalkan kelas. Jika <strong>{MAX_LOST_STUDENTS} mahasiswa hilang</strong>, kamu kalah!
                </span>
              </li>
              <li className="flex items-start gap-2.5 rounded-[16px] border-2 border-[#3e2517]/25 bg-[#fffdf7] p-2.5 shadow-[inset_0_-3px_0_#eedcb9]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#3e2517] bg-[#f7c85c] font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                  2
                </span>
                <span>
                  <strong>7 percakapan · 2 pilihan jawaban.</strong> Respons tepat memulihkan energi
                  (<strong className="text-emerald-700">+12%</strong>); respons keliru justru menguras
                  energi (<strong className="text-red-700">-14%</strong>)!
                </span>
              </li>
              <li className="flex items-start gap-2.5 rounded-[16px] border-2 border-[#3e2517]/25 bg-[#fffdf7] p-2.5 shadow-[inset_0_-3px_0_#eedcb9]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#3e2517] bg-[#f7c85c] font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                  3
                </span>
                <span>
                  <strong>Kenali latar belakang tiap mahasiswa.</strong> Makin jauh percakapan, pilihan
                  makin menantang — cek tombol profil kanan atas saat ngobrol kalau butuh petunjuk!
                </span>
              </li>
            </ol>

            <div className="mt-3.5 rounded-[16px] border-2 border-[#3e2517] bg-[#fff3cc] px-3.5 py-2 font-['Fredoka'] text-xs font-semibold text-[#3e2517] shadow-[0_3px_0_#3e2517]">
              🛡️ Target: Stabilkan mahasiswa sebelum {MAX_LOST_STUDENTS} orang hilang &amp; hias Ruang BK-mu!
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
              Mulai Shift Pagi →
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorningBriefingModal;
