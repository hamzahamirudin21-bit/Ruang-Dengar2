import React, { useEffect, useState } from 'react';
import {
  CONCEPT_THEORY,
  REFERENCES,
  SKILL_THEORY,
  STAGE_THEORY,
  referenceByKey,
  type TheoryConceptId,
  type TheoryStageId,
} from '../../data/counselingTheory';
import type { CounselorSkillId } from '../../types';
import { GameButton } from './game';
import { playSfx } from '../motion/sfx';

export interface TheoryLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TheoryTabId = 'tahap' | 'keterampilan' | 'konsep' | 'pustaka';

const STAGE_ORDER: readonly TheoryStageId[] = [
  'lab',
  'bk-eksplorasi',
  'bk-pemahaman',
  'bk-rencana',
  'lanjutan',
];

const CONCEPT_ORDER: readonly TheoryConceptId[] = [
  'keterbukaan',
  'aliansi',
  'keretakan-perbaikan',
  'etika',
];

const SKILL_IDS = Object.keys(SKILL_THEORY) as CounselorSkillId[];

function CiteBadges({ refKeys }: { refKeys: readonly string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {refKeys.map((k) => {
        const ref = referenceByKey(k);
        if (!ref) return null;
        return (
          <span
            key={k}
            className="inline-flex items-center rounded-full border border-[#3e2517]/35 bg-[#fff5d8] px-2 py-0.5 font-['Fredoka'] text-[10px] font-bold text-[#7a4b10]"
          >
            📖 {ref.cite}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Buku Landasan Psikologi Pendidikan & Panduan Konseling Interaktif.
 * Mengambil seluruh data terverifikasi langsung dari `src/data/counselingTheory.ts`.
 */
export const TheoryLibraryModal: React.FC<TheoryLibraryModalProps> = ({ isOpen, onClose }) => {
  const [tab, setTab] = useState<TheoryTabId>('tahap');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const helpfulSkills = SKILL_IDS.filter((id) => !SKILL_THEORY[id].hindering);
  const hinderingSkills = SKILL_IDS.filter((id) => SKILL_THEORY[id].hindering);

  const tabs: readonly { id: TheoryTabId; icon: string; label: string }[] = [
    { id: 'tahap', icon: '🧭', label: '5 Tahap Konseling' },
    { id: 'keterampilan', icon: '💬', label: '14 Keterampilan' },
    { id: 'konsep', icon: '🏛️', label: 'Konsep & Etika' },
    { id: 'pustaka', icon: '📚', label: `Daftar Pustaka (${REFERENCES.length})` },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="theory-library-title"
      data-testid="theory-library-modal"
      className="fixed inset-0 z-[82] flex items-center justify-center bg-[#2c1a0e]/70 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="game-panel-cream responsive-modal-panel responsive-modal-panel--89 fx-panel-in flex max-h-[89vh] w-full max-w-4xl flex-col overflow-hidden !rounded-[28px] border-[3.5px] border-[#3e2517] shadow-[0_10px_0_#3e2517,0_26px_60px_rgba(32,16,8,0.52)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Buku Ilustrasi Psikologi */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#3e2517] bg-gradient-to-r from-[#2e8274] via-[#256f62] to-[#1d584e] px-6 py-4 text-[#fffdf6]">
          <div>
            <p className="font-['Fredoka'] text-xs font-bold uppercase tracking-wider text-[#ffe8a3]">
              Landasan Ilmiah · Psikologi Pendidikan &amp; Bimbingan Konseling
            </p>
            <h2
              id="theory-library-title"
              className="mt-0.5 font-['Fredoka'] text-2xl font-bold drop-shadow-[0_2px_0_#3e2517]"
            >
              Pustaka Landasan Ruang Dengar
            </h2>
          </div>
          <GameButton
            variant="sekunder"
            size="sm"
            onClick={() => {
              playSfx('klik');
              onClose();
            }}
          >
            Tutup
          </GameButton>
        </header>

        {/* Bilah 4 Tab Navigasi Buku */}
        <div
          role="tablist"
          aria-label="Bagian Landasan Teori"
          className="flex flex-wrap gap-1.5 border-b-[3px] border-[#3e2517] bg-[#f4e4c5] px-5 pt-2.5"
        >
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  playSfx('klik');
                  setTab(t.id);
                }}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-t-[16px] border-x-[2.5px] border-t-[2.5px] border-[#3e2517] px-3.5 py-2 font-['Fredoka'] text-xs font-bold transition ${
                  active
                    ? '-mb-[3px] bg-[#fffdf5] pb-2.5 text-[#3e2517]'
                    : 'bg-[#e9d5b0] text-[#6b482e] hover:bg-[#f7ebd2]'
                }`}
              >
                <span aria-hidden="true">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Konten Buku */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {tab === 'tahap' && (
            <div className="space-y-3">
              <p className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fff7de] px-4 py-2.5 text-xs leading-relaxed text-[#5c3d26]">
                Alur pendampingan di <strong>RUANG DENGAR</strong> disusun mengikuti tahapan konseling berbasis bukti: mulai dari membangun rasa aman di ruang lab hingga evaluasi tindak lanjut, tanpa label diagnosis klinis.
              </p>
              <ol className="grid gap-3 md:grid-cols-2">
                {STAGE_ORDER.map((id, idx) => {
                  const note = STAGE_THEORY[id];
                  return (
                    <li
                      key={id}
                      className="rounded-[22px] border-[2.5px] border-[#3e2517] bg-[#fffdf7] p-4 shadow-[inset_0_-4px_0_#edd9b4,0_4px_0_#3e2517]"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#3e2517] bg-[#ffe694] font-['Fredoka'] text-xs font-bold text-[#3e2517]">
                          {idx + 1}
                        </span>
                        <h3 className="font-['Fredoka'] text-sm font-bold text-[#3e2517]">
                          {note.title}
                        </h3>
                      </div>
                      <p className="mt-2 font-['Fredoka'] text-[11px] font-bold text-[#267567]">
                        {note.theory}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#4f3320]">
                        {note.explanation}
                      </p>
                      <CiteBadges refKeys={note.refs} />
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {tab === 'keterampilan' && (
            <div className="space-y-5">
              <section>
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="rounded-full border-2 border-[#3e2517] bg-[#2e8274] px-3 py-0.5 font-['Fredoka'] text-xs font-bold text-[#fffdf6]">
                    ✓ Keterampilan Membangun ({helpfulSkills.length})
                  </span>
                  <span className="text-xs font-semibold text-[#6b482e]">
                    Membantu mahasiswa merasa didengar &amp; memulihkan energi
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {helpfulSkills.map((id) => {
                    const note = SKILL_THEORY[id];
                    return (
                      <article
                        key={id}
                        className="rounded-[20px] border-2 border-[#27786a] bg-[#f4fcf9] p-3.5 shadow-[0_3px_0_#27786a]"
                      >
                        <h3 className="font-['Fredoka'] text-sm font-bold text-[#1c5b50]">
                          {note.title}
                        </h3>
                        <p className="mt-1 text-[11px] font-semibold text-[#2e8274]">
                          {note.theory}
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#3e2517]">
                          {note.explanation}
                        </p>
                        <CiteBadges refKeys={note.refs} />
                      </article>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="mb-2.5 flex items-center gap-2">
                  <span className="rounded-full border-2 border-[#3e2517] bg-[#d8534a] px-3 py-0.5 font-['Fredoka'] text-xs font-bold text-[#fffdf6]">
                    ✕ Penghambat Komunikasi ({hinderingSkills.length})
                  </span>
                  <span className="text-xs font-semibold text-[#6b482e]">
                    Memicu ketegangan, menurunkan rasa aman, &amp; menguras energi
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {hinderingSkills.map((id) => {
                    const note = SKILL_THEORY[id];
                    return (
                      <article
                        key={id}
                        className="rounded-[20px] border-2 border-[#c6453c] bg-[#fff5f4] p-3.5 shadow-[0_3px_0_#c6453c]"
                      >
                        <h3 className="font-['Fredoka'] text-sm font-bold text-[#942b24]">
                          {note.title}
                        </h3>
                        <p className="mt-1 text-[11px] font-semibold text-[#b83d36]">
                          {note.theory}
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-[#3e2517]">
                          {note.explanation}
                        </p>
                        <CiteBadges refKeys={note.refs} />
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          )}

          {tab === 'konsep' && (
            <div className="grid gap-3.5 sm:grid-cols-2">
              {CONCEPT_ORDER.map((id) => {
                const note = CONCEPT_THEORY[id];
                return (
                  <article
                    key={id}
                    className="rounded-[22px] border-[2.5px] border-[#3e2517] bg-[#fffdf7] p-4 shadow-[inset_0_-4px_0_#edd9b4,0_4px_0_#3e2517]"
                  >
                    <h3 className="font-['Fredoka'] text-base font-bold text-[#3e2517]">
                      {note.title}
                    </h3>
                    <p className="mt-1 font-['Fredoka'] text-xs font-bold text-[#9c4c1b]">
                      {note.theory}
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-[#4f3320]">
                      {note.explanation}
                    </p>
                    <CiteBadges refKeys={note.refs} />
                  </article>
                );
              })}
            </div>
          )}

          {tab === 'pustaka' && (
            <div className="space-y-3">
              <p className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fff7de] px-4 py-2.5 text-xs leading-relaxed text-[#5c3d26]">
                Seluruh rujukan berikut berformat <strong>APA 7</strong> dan menjadi dasar penyusunan skenario, keterampilan konseling, dinamika sosiometri, serta etika simulasi <strong>RUANG DENGAR</strong>.
              </p>
              <ol className="space-y-2.5">
                {REFERENCES.map((r, i) => (
                  <li
                    key={r.key}
                    className="flex items-start gap-3 rounded-2xl border-2 border-[#3e2517]/25 bg-[#fffdf7] p-3 text-xs shadow-[inset_0_-2px_0_#f0e0bf]"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#3e2517] bg-[#f6e5c3] font-['Fredoka'] text-[11px] font-bold text-[#3e2517]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="leading-relaxed text-[#3e2517]">{r.apa}</p>
                      <a
                        href={r.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block font-['Fredoka'] text-[11px] font-bold text-[#267567] underline hover:text-[#1b574c]"
                      >
                        Verifikasi Referensi ({r.cite}) ↗
                      </a>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TheoryLibraryModal;
