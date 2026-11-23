import React, { useState } from 'react';
import type { ShiftReportSummary } from '../../engine/storySignals';
import { signalForStudent } from '../../engine/storySignals';
import type { StudentAgent } from '../../types';
import { PixelPortrait } from '../characters/PixelPortrait';
import { GameButton } from '../components/game';

export interface ShiftReportModalProps {
  report: ShiftReportSummary;
  agents: readonly StudentAgent[];
  reducedMotion: boolean;
  onOpenJournal: () => void;
  onClose: () => void;
}

/**
 * Kartu Hasil Shift Dosen BK (muncul saat 3 kisah terungkap atau dibuka dari Panel Misi).
 * Dirancang agar seru dibandingkan & dibagikan oleh teman-teman lewat website!
 */
export const ShiftReportModal: React.FC<ShiftReportModalProps> = ({
  report,
  agents,
  reducedMotion,
  onOpenJournal,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const unlockedAgents = report.unlockedAgentIds
    .map((id) => agents.find((a) => a.id === id))
    .filter((a): a is StudentAgent => Boolean(a));

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report.shareText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shift-report-title"
      data-testid="shift-report-modal"
      className="fixed inset-0 z-[74] flex items-center justify-center bg-[#2c1a0e]/70 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="game-panel-cream w-full max-w-xl overflow-hidden !rounded-[28px] border-[3.5px] border-[#3e2517] shadow-[0_10px_0_#3e2517,0_24px_50px_rgba(38,20,10,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b-[3px] border-[#3e2517] bg-gradient-to-r from-[#d8534a] via-[#c74840] to-[#b53d37] px-6 py-5 text-center text-[#fffdf6]">
          <span className="inline-block rounded-full border-2 border-[#3e2517] bg-[#ffe694] px-3.5 py-0.5 font-['Fredoka'] text-xs font-bold uppercase tracking-wider text-[#3e2517] shadow-[0_2px_0_#3e2517]">
            ✦ Target Shift Tercapai ✦
          </span>
          <h2 id="shift-report-title" className="mt-2 font-['Fredoka'] text-2xl font-bold drop-shadow-[0_2px_0_#3e2517]">
            {report.archetype.title}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[#fff2e0]">
            {report.archetype.tagline}
          </p>
        </header>

        <div className="space-y-4 p-5 sm:p-6">
          {/* 3 Statistik Ringkas */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-2xl border-[2.5px] border-[#3e2517] bg-[#fffdf7] p-2.5 shadow-[0_4px_0_#3e2517]">
              <div className="font-['Fredoka'] text-xl font-bold text-[#3e2517]">
                {report.unlockedCount}/{report.totalStudents}
              </div>
              <div className="text-[11px] font-bold text-[#6b482e]">Kisah Terungkap</div>
            </div>
            <div className="rounded-2xl border-[2.5px] border-[#3e2517] bg-[#fffdf7] p-2.5 shadow-[0_4px_0_#3e2517]">
              <div className="font-['Fredoka'] text-xl font-bold text-[#247a63]">
                {report.averageEnergyPct}%
              </div>
              <div className="text-[11px] font-bold text-[#6b482e]">Energi Rata-rata</div>
            </div>
            <div className="rounded-2xl border-[2.5px] border-[#3e2517] bg-[#fffdf7] p-2.5 shadow-[0_4px_0_#3e2517]">
              <div className="font-['Fredoka'] text-xl font-bold text-[#c6453c]">
                {report.healthyCount}/{report.totalStudents}
              </div>
              <div className="text-[11px] font-bold text-[#6b482e]">Mahasiswa Stabil</div>
            </div>
          </div>

          {/* Mahasiswa yang Baru Terbantu */}
          {unlockedAgents.length > 0 && (
            <div>
              <h3 className="font-['Fredoka'] text-xs font-bold uppercase tracking-wider text-[#5d3d26]">
                Kisah yang Sudah Kamu Ungkap
              </h3>
              <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {unlockedAgents.map((a) => {
                  const sig = signalForStudent(a.id);
                  return (
                    <li
                      key={a.id}
                      className="flex items-center gap-2.5 rounded-2xl border-2 border-[#3e2517]/25 bg-[#fff9eb] p-2 text-xs"
                    >
                      <div
                        className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border-2 border-[#3e2517] bg-[#e7f1fa]"
                        style={{ lineHeight: 0 }}
                      >
                        <PixelPortrait
                          studentId={a.id}
                          name={a.name}
                          expression="tersenyum"
                          scale={1}
                          fit="cover-head"
                          reducedMotion={reducedMotion}
                          demographicLabel={a.demographicLabel}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-['Fredoka'] font-bold text-[#3e2517]">{a.name}</div>
                        <div className="truncate text-[#6b482e]">“{sig.unlockedTitle}”</div>
                      </div>
                      <span className="font-mono-data text-xs font-extrabold text-[#247a63]">
                        {Math.round(a.energy * 100)}%
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Tombol Bagikan & Lanjut */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#0f1b33]/15 pt-3">
            <div className="flex flex-wrap gap-2">
              <GameButton variant="sekunder" size="sm" onClick={handleCopy}>
                {copied ? '✓ Teks Tersalin!' : 'Salin Hasil untuk Dibagikan'}
              </GameButton>
              <GameButton
                variant="sekunder"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenJournal();
                }}
              >
                Buka Jurnal ({report.unlockedCount}/{report.totalStudents})
              </GameButton>
            </div>
            <GameButton variant="primer" size="sm" bounce onClick={onClose}>
              Lanjut Ungkap Semua {report.totalStudents} Kisah →
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftReportModal;
