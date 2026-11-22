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
      className="fixed inset-0 z-[74] flex items-center justify-center bg-[#091224]/75 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="game-panel-cream w-full max-w-xl overflow-hidden !rounded-[8px_26px_8px_26px] border-[3px] border-[#0f1b33] shadow-[0_10px_0_#091122]"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b-2 border-[#0f1b33] bg-gradient-to-r from-[#14233f] via-[#1c3b64] to-[#135c6b] px-6 py-5 text-center text-[#fff8e6]">
          <span className="inline-block rounded-[3px_10px_3px_10px] border border-[#fde08d] bg-[#0f1b33]/75 px-3 py-0.5 font-['Outfit'] text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#fde08d]">
            ✦ Target Shift Tercapai ✦
          </span>
          <h2 id="shift-report-title" className="mt-2 font-['Outfit'] text-2xl font-black">
            {report.archetype.title}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-[#dbe8f7]">
            {report.archetype.tagline}
          </p>
        </header>

        <div className="space-y-4 p-5 sm:p-6">
          {/* 3 Statistik Ringkas */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="rounded-[4px_12px_4px_12px] border-2 border-[#0f1b33] bg-white p-2.5 shadow-[0_3px_0_rgba(15,27,51,0.18)]">
              <div className="font-['Outfit'] text-xl font-black text-[#14233f]">
                {report.unlockedCount}/{report.totalStudents}
              </div>
              <div className="text-[11px] font-bold text-[#475569]">Kisah Terungkap</div>
            </div>
            <div className="rounded-[4px_12px_4px_12px] border-2 border-[#0f1b33] bg-white p-2.5 shadow-[0_3px_0_rgba(15,27,51,0.18)]">
              <div className="font-['Outfit'] text-xl font-black text-emerald-700">
                {report.averageEnergyPct}%
              </div>
              <div className="text-[11px] font-bold text-[#475569]">Energi Rata-rata</div>
            </div>
            <div className="rounded-[4px_12px_4px_12px] border-2 border-[#0f1b33] bg-white p-2.5 shadow-[0_3px_0_rgba(15,27,51,0.18)]">
              <div className="font-['Outfit'] text-xl font-black text-[#175e75]">
                {report.healthyCount}/{report.totalStudents}
              </div>
              <div className="text-[11px] font-bold text-[#475569]">Mahasiswa Stabil</div>
            </div>
          </div>

          {/* Mahasiswa yang Baru Terbantu */}
          {unlockedAgents.length > 0 && (
            <div>
              <h3 className="font-['Outfit'] text-xs font-extrabold uppercase tracking-wider text-[#334155]">
                Kisah yang Sudah Kamu Ungkap
              </h3>
              <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {unlockedAgents.map((a) => {
                  const sig = signalForStudent(a.id);
                  return (
                    <li
                      key={a.id}
                      className="flex items-center gap-2.5 rounded-[4px_10px_4px_10px] border border-[#e5ac3f]/65 bg-[#fffaf0] p-2 text-xs"
                    >
                      <div
                        className="h-10 w-10 shrink-0 overflow-hidden rounded-[3px_8px_3px_8px] border border-[#0f1b33] bg-[#e7f1fa]"
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
                        <div className="font-bold text-[#0f1b33]">{a.name}</div>
                        <div className="truncate text-[#475569]">“{sig.unlockedTitle}”</div>
                      </div>
                      <span className="font-mono-data text-xs font-extrabold text-emerald-700">
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
              Lanjut Ungkap Semua 15 Kisah →
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftReportModal;
