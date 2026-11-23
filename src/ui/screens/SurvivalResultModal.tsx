import React from 'react';
import type { SurvivalSummary } from '../../engine/survivalMission';
import type { StudentAgent } from '../../types';
import { PixelPortrait } from '../characters/PixelPortrait';
import { GameButton } from '../components/game';

export interface SurvivalResultModalProps {
  summary: SurvivalSummary;
  lostAgents: readonly StudentAgent[];
  reducedMotion: boolean;
  onRestart: () => void;
  onContinueExplore?: () => void;
}

const ENDING_COPY = {
  sempurna: {
    badge: '🏆 ENDING TERBAIK · 15/15 BERTAHAN',
    title: 'Tak Satu Pun Tertinggal!',
    body: 'Luar biasa! Kamu berhasil menjaga energi seluruh mahasiswa dan mendampingi setiap kisah mereka tanpa satu pun yang menghilang dari kelas.',
    headerBg: 'linear-gradient(135deg, #2e8274 0%, #1d5d52 100%)',
  },
  baik: {
    badge: '🌟 ENDING BAIK · PENJAGA RUANG DENGAR',
    title: 'Sebagian Besar Terselamatkan!',
    body: 'Kamu tanggap menjaga ritme kelas dan mendampingi hampir seluruh mahasiswa hingga pulih. Satu kursi yang sempat kosong menjadi pengingat berharga untuk sesi berikutnya.',
    headerBg: 'linear-gradient(135deg, #2f7d6e 0%, #245b68 100%)',
  },
  bertahan: {
    badge: '🌤️ ENDING BERTAHAN',
    title: 'Bertahan di Tengah Badai',
    body: 'Seluruh mahasiswa yang tersisa berhasil kamu stabilkan. Dua mahasiswa sempat kehabisan energi sebelum terdampingi — coba kenali latar belakang mereka di balik kartu untuk hasil sempurna!',
    headerBg: 'linear-gradient(135deg, #c9862d 0%, #995d14 100%)',
  },
  gagal: {
    badge: '💔 3 MAHASISWA HILANG · PERMAINAN BERAKHIR',
    title: 'Ruang Lab Mulai Sepi...',
    body: 'Tiga mahasiswa kehabisan energi hingga meninggalkan kelas sebelum sempat pulih. Amati tanda energi menurun lebih awal dan kenali latar belakang tiap mahasiswa agar pilihan jawabanmu makin tepat!',
    headerBg: 'linear-gradient(135deg, #c9473e 0%, #8e2822 100%)',
  },
} as const;

export const SurvivalResultModal: React.FC<SurvivalResultModalProps> = ({
  summary,
  lostAgents,
  reducedMotion,
  onRestart,
  onContinueExplore,
}) => {
  const isLose = summary.status === 'kalah';
  const copy = ENDING_COPY[summary.endingTier];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="survival-result-title"
      data-testid={isLose ? 'game-over-modal' : 'victory-modal'}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#24130a]/75 p-4 backdrop-blur-xs"
    >
      <div className="game-panel-cream fx-panel-in w-full max-w-xl overflow-hidden !rounded-[28px] border-[3.5px] border-[#3e2517] shadow-[0_10px_0_#3e2517,0_26px_60px_rgba(24,10,4,0.6)]">
        <div
          className="border-b-[3px] border-[#3e2517] px-6 py-5 text-[#fffdf6]"
          style={{ background: copy.headerBg }}
        >
          <p className="font-['Fredoka'] text-xs font-bold uppercase tracking-wider text-[#ffe799]">
            {copy.badge}
          </p>
          <h2
            id="survival-result-title"
            className="mt-1 font-['Fredoka'] text-2xl font-bold drop-shadow-[0_2px_0_#3e2517]"
          >
            {copy.title}
          </h2>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm leading-relaxed text-[#4e321e]">{copy.body}</p>

          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-2xl border-2 border-[#3e2517] bg-[#fffdf7] p-3 shadow-[0_3px_0_#3e2517]">
              <div className="font-['Fredoka'] text-xl font-bold text-[#2e8274]">
                {summary.stabilizedCount}/{summary.totalStudents}
              </div>
              <div className="text-[11px] font-bold text-[#6b482e]">Pulih &amp; Stabil</div>
            </div>
            <div className="rounded-2xl border-2 border-[#3e2517] bg-[#fffdf7] p-3 shadow-[0_3px_0_#3e2517]">
              <div className="font-['Fredoka'] text-xl font-bold text-[#3e2517]">
                {summary.activeCount}/{summary.totalStudents}
              </div>
              <div className="text-[11px] font-bold text-[#6b482e]">Bertahan di Lab</div>
            </div>
            <div className="rounded-2xl border-2 border-[#3e2517] bg-[#fffdf7] p-3 shadow-[0_3px_0_#3e2517]">
              <div className="font-['Fredoka'] text-xl font-bold text-[#c6453c]">
                {summary.lostCount}/{summary.maxLost}
              </div>
              <div className="text-[11px] font-bold text-[#6b482e]">Mahasiswa Hilang</div>
            </div>
          </div>

          {lostAgents.length > 0 && (
            <div className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fff6ed] p-3.5">
              <p className="font-['Fredoka'] text-xs font-bold uppercase tracking-wider text-[#9c322b]">
                🚪 Mahasiswa yang Kehabisan Energi (0%)
              </p>
              <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                {lostAgents.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center gap-2 rounded-xl border-2 border-[#3e2517]/25 bg-[#fffdf7] px-2 py-1.5"
                  >
                    <div className="h-10 w-8 shrink-0 overflow-hidden rounded-lg border border-[#3e2517]/30 bg-[#f4e5c8] grayscale">
                      <div className="h-full w-full [&>canvas]:!h-full [&>canvas]:!w-full [&>canvas]:object-contain [&>canvas]:object-bottom [&>img]:!h-full [&>img]:!w-full">
                        <PixelPortrait
                          studentId={a.id}
                          name={a.name}
                          expression="lelah"
                          scale={1}
                          reducedMotion={reducedMotion}
                          demographicLabel={a.demographicLabel}
                        />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <span className="block truncate font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                        {a.name.split(' ')[0]}
                      </span>
                      <span className="block text-[10px] font-semibold text-[#b33931]">
                        Energi 0%
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2.5 pt-2">
            {!isLose && onContinueExplore && (
              <GameButton variant="sekunder" size="md" bounce onClick={onContinueExplore}>
                Lanjut Jelajah Lab
              </GameButton>
            )}
            <GameButton variant="primer" size="md" bounce onClick={onRestart}>
              ↻ Main Lagi dari Awal
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurvivalResultModal;
