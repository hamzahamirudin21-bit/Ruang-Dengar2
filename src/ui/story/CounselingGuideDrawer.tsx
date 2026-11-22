import React, { useState } from 'react';
import {
  CONCEPT_THEORY,
  REFERENCES,
  SKILL_THEORY,
  STAGE_THEORY,
  referenceByKey,
} from '../../data/counselingTheory';
import type { CounselorSkillId } from '../../types';
import {
  COUNSELING_STAGE_STEPS,
  type ActiveCounselingGuidance,
} from './counselingStageModel';

export interface CounselingGuideDrawerProps {
  activeGuidance?: ActiveCounselingGuidance | null;
  onClose: () => void;
  className?: string;
}

const POSITIVE_SKILL_IDS = (Object.keys(SKILL_THEORY) as CounselorSkillId[]).filter(
  (k) => !SKILL_THEORY[k].hindering,
);
const HINDERING_SKILL_IDS = (Object.keys(SKILL_THEORY) as CounselorSkillId[]).filter(
  (k) => SKILL_THEORY[k].hindering,
);

function citesText(keys: readonly string[]): string {
  return keys
    .map((k) => referenceByKey(k)?.cite ?? k)
    .filter(Boolean)
    .join('; ');
}

export const CounselingGuideDrawer: React.FC<CounselingGuideDrawerProps> = ({
  activeGuidance,
  onClose,
  className,
}) => {
  const [tab, setTab] = useState<'tahap' | 'teknik' | 'pustaka'>('tahap');

  return (
    <aside
      aria-label="Buku Saku Teori Bimbingan dan Konseling"
      className={`flex h-full flex-col overflow-hidden bg-[#fdf9f2] text-[#142038] ${className ?? ''}`}
      data-testid="counseling-guide-drawer"
    >
      <header className="flex items-center justify-between gap-2 border-b-2 border-[#0f1b33] bg-[#14233f] px-4 py-3 text-[#fff8e6]">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#fde08d]">
            Landasan Akademik BK
          </p>
          <h2 className="font-['Outfit'] text-base font-extrabold leading-tight">
            Buku Saku Kaidah Konseling
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup Buku Saku BK"
          className="rounded-[4px_10px_4px_10px] border border-[#fde08d]/60 bg-white/10 px-2.5 py-1 text-xs font-bold text-[#fff8e6] hover:bg-[#fde08d] hover:text-[#0f1b33]"
        >
          Tutup
        </button>
      </header>

      {/* Tab internal buku saku */}
      <div className="grid grid-cols-3 gap-1 border-b border-[#0f1b33]/20 bg-[#f3ead8] p-2 text-xs font-bold">
        {[
          { id: 'tahap', label: 'Alur Tahap' },
          { id: 'teknik', label: 'Teknik & Etika' },
          { id: 'pustaka', label: 'Rujukan APA' },
        ].map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id as 'tahap' | 'teknik' | 'pustaka')}
              className={`rounded-[4px_10px_4px_10px] border px-2 py-1.5 transition ${
                active
                  ? 'border-[#0f1b33] bg-[#14233f] text-[#fde08d] shadow-[0_2px_0_#0f1b33]'
                  : 'border-[#0f1b33]/20 bg-white/75 text-[#223250] hover:bg-white'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3.5 text-xs leading-relaxed">
        {tab === 'tahap' && (
          <>
            {activeGuidance && (
              <section className="rounded-[5px_14px_5px_14px] border-2 border-[#0f1b33] bg-[#14233f] p-3 text-[#faf6ec] shadow-[0_4px_0_rgba(15,27,51,0.28)]">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#fde08d]">
                  Sedang Berlangsung
                </p>
                <h3 className="mt-0.5 font-['Outfit'] text-sm font-extrabold">
                  {activeGuidance.stageTitle}
                </h3>
                <p className="mt-1 text-[11px] text-[#dbe5f5]">{activeGuidance.guidance}</p>
                <p className="mt-1.5 text-[10px] font-semibold text-[#fde08d]">
                  Rujukan: {activeGuidance.citation}
                </p>
              </section>
            )}

            <section className="rounded-[5px_14px_5px_14px] border border-[#177e98]/40 bg-[#eef8fa] p-3">
              <h3 className="font-['Outfit'] text-xs font-extrabold uppercase tracking-wide text-[#0f5164]">
                Misi Pengawasan Energi & Isolasi Sosial
              </h3>
              <p className="mt-1 text-[#1e3545]">
                Mahasiswa yang rutin berinteraksi dan mengobrol dengan teman sebaya energinya akan
                bertambah, sedangkan mahasiswa yang terus menyendiri atau terisolasi energinya
                berangsur menurun. Sebagai Dosen BK, amati bilah energi di peta, hampiri mahasiswa
                yang mulai terkuras energinya, dan terapkan kaidah konseling bertahap agar mereka
                merasa aman, pulih, dan berani terhubung kembali.
              </p>
            </section>

            <div className="space-y-2">
              {COUNSELING_STAGE_STEPS.map((step) => {
                const isCurrent = activeGuidance?.stage === step.id && !activeGuidance.isRepairMode;
                return (
                  <article
                    key={step.id}
                    className={`rounded-[5px_14px_5px_14px] border-2 p-2.5 ${
                      isCurrent
                        ? 'border-[#e5ac3f] bg-[#fffaf0] shadow-[0_3px_0_rgba(15,27,51,0.2)]'
                        : 'border-[#0f1b33]/20 bg-white/85'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-['Outfit'] font-extrabold text-[#14233f]">{step.title}</h4>
                      {isCurrent && (
                        <span className="rounded bg-[#e5ac3f] px-1.5 py-0.5 text-[10px] font-extrabold text-[#0f1b33]">
                          AKTIF
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[#334155]">{step.guidance}</p>
                    <p className="mt-1 text-[10px] font-bold text-[#175e75]">{step.theoryRef}</p>
                  </article>
                );
              })}

              <article className="rounded-[5px_14px_5px_14px] border border-[#0f1b33]/20 bg-white/85 p-2.5">
                <h4 className="font-['Outfit'] font-extrabold text-[#14233f]">
                  Tahap 5 · {STAGE_THEORY.lanjutan.title}
                </h4>
                <p className="mt-1 text-[#334155]">{STAGE_THEORY.lanjutan.explanation}</p>
                <p className="mt-1 text-[10px] font-bold text-[#175e75]">
                  {citesText(STAGE_THEORY.lanjutan.refs)}
                </p>
              </article>

              <article className="rounded-[5px_14px_5px_14px] border border-[#9f2744]/40 bg-[#fff5f7] p-2.5">
                <h4 className="font-['Outfit'] font-extrabold text-[#7d1d34]">
                  Bila Terjadi Ketegangan · {CONCEPT_THEORY['keretakan-perbaikan'].title}
                </h4>
                <p className="mt-1 text-[#4c1d2b]">
                  {CONCEPT_THEORY['keretakan-perbaikan'].explanation}
                </p>
                <p className="mt-1 text-[10px] font-bold text-[#8f2239]">
                  {citesText(CONCEPT_THEORY['keretakan-perbaikan'].refs)}
                </p>
              </article>
            </div>
          </>
        )}

        {tab === 'teknik' && (
          <>
            <section className="space-y-2">
              <h3 className="font-['Outfit'] text-xs font-extrabold uppercase tracking-wide text-[#136552]">
                10 Keterampilan Dasar Konseling (Dianjurkan)
              </h3>
              {POSITIVE_SKILL_IDS.map((id) => {
                const s = SKILL_THEORY[id];
                return (
                  <article
                    key={id}
                    className="rounded-[4px_12px_4px_12px] border border-[#136552]/30 bg-white p-2.5"
                  >
                    <h4 className="font-bold text-[#0f1b33]">{s.title}</h4>
                    <p className="mt-0.5 text-[#334155]">{s.explanation}</p>
                    <p className="mt-1 text-[10px] font-bold text-[#175e75]">
                      {s.theory} · {citesText(s.refs)}
                    </p>
                  </article>
                );
              })}
            </section>

            <section className="space-y-2 pt-1">
              <h3 className="font-['Outfit'] text-xs font-extrabold uppercase tracking-wide text-[#9f2744]">
                4 Penghambat Komunikasi Gordon (Hindari!)
              </h3>
              {HINDERING_SKILL_IDS.map((id) => {
                const s = SKILL_THEORY[id];
                return (
                  <article
                    key={id}
                    className="rounded-[4px_12px_4px_12px] border border-[#9f2744]/35 bg-[#fff5f7] p-2.5"
                  >
                    <h4 className="font-bold text-[#7d1d34]">{s.title}</h4>
                    <p className="mt-0.5 text-[#4c1d2b]">{s.explanation}</p>
                    <p className="mt-1 text-[10px] font-bold text-[#8f2239]">
                      {citesText(s.refs)}
                    </p>
                  </article>
                );
              })}
            </section>
          </>
        )}

        {tab === 'pustaka' && (
          <section className="space-y-2">
            <h3 className="font-['Outfit'] text-xs font-extrabold uppercase tracking-wide text-[#14233f]">
              Daftar Pustaka Teori Konseling (APA 7)
            </h3>
            <p className="text-[#475569]">
              Seluruh skenario percakapan, tahapan wawancara, dan rubrik umpan balik di RUANG DENGAR
              merujuk pada literatur ilmiah bimbingan dan konseling berikut:
            </p>
            <ol className="space-y-2 pl-4 list-decimal">
              {REFERENCES.map((ref) => (
                <li
                  key={ref.key}
                  className="rounded-[4px_10px_4px_10px] border border-[#0f1b33]/15 bg-white p-2 text-[11px] text-[#1e293b]"
                >
                  <span className="font-semibold text-[#14233f]">[{ref.cite}]</span> {ref.apa}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </aside>
  );
};

export default CounselingGuideDrawer;
