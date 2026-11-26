import React, { useEffect, useState } from 'react';
import { STRINGS } from '../../data/strings';
import { AppSettings, SimulationSpeed, TextSizeOption } from '../../types';
import { DEFAULT_SETTINGS } from '../../utils/storage';

const SOUND_LABEL = 'Musik Kampus & Efek Suara';
const SOUND_HELP = 'Alunan musik kampus hangat (offline) serta bunyi lembut saat memilih, membalik kartu, & misi selesai.';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onSave: (next: AppSettings) => void;
  onClose: () => void;
  onReplayComicIntro?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
  onReplayComicIntro,
}) => {
  const [draft, setDraft] = useState<AppSettings>(settings);

  useEffect(() => {
    if (isOpen) {
      setDraft(settings);
    }
  }, [isOpen, settings]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const textSizeOptions: TextSizeOption[] = ['normal', 'large', 'xlarge'];
  const speedOptions: SimulationSpeed[] = [1, 2, 4];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const safeSeed = Number.isFinite(draft.seed)
      ? Math.max(1, Math.floor(Math.abs(draft.seed)))
      : DEFAULT_SETTINGS.seed;
    onSave({ ...draft, seed: safeSeed });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-[#2c1a0e]/65 p-4 backdrop-blur-xs"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="game-panel-cream responsive-modal-panel responsive-modal-panel--90 fx-panel-in flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden !rounded-[28px] border-[3.5px] border-[#3e2517] shadow-[0_10px_0_#3e2517,0_24px_50px_rgba(38,20,10,0.45)]"
      >
        <div className="flex items-center justify-between border-b-[3px] border-[#3e2517] bg-gradient-to-r from-[#9c613b] via-[#8a5230] to-[#774425] px-6 py-4 text-[#fffdf6]">
          <div>
            <p className="font-['Fredoka'] text-[11px] font-bold uppercase tracking-wider text-[#ffe8a3]">
              Kenyamanan &amp; Aksesibilitas
            </p>
            <h2
              id="settings-modal-title"
              className="font-['Fredoka'] text-xl font-bold drop-shadow-[0_2px_0_#3e2517]"
            >
              {STRINGS.settings.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="game-btn-secondary !min-h-[2rem] !px-4 text-xs"
          >
            {STRINGS.settings.close}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 space-y-4 overflow-y-auto p-6">
          {/* Ukuran teks */}
          <fieldset>
            <legend className="font-['Fredoka'] text-sm font-bold text-[#3e2517]">
              {STRINGS.settings.textSizeLabel}
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {textSizeOptions.map((opt) => {
                const active = draft.textSize === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, textSize: opt }))}
                    aria-pressed={active}
                    className={`rounded-2xl border-[2.5px] px-3 py-2 font-['Fredoka'] text-sm font-bold transition ${
                      active
                        ? 'border-[#3e2517] bg-gradient-to-b from-[#3aa08e] to-[#267567] text-[#fffdf6] shadow-[0_3px_0_#3e2517]'
                        : 'border-[#3e2517]/40 bg-[#fffdf7] text-[#3e2517] hover:bg-[#faeed5]'
                    }`}
                  >
                    {STRINGS.settings.textSizeOptions[opt]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Kurangi gerak */}
          <div className="flex items-start justify-between gap-4 rounded-2xl border-2 border-[#3e2517]/30 bg-[#fffdf7] p-3.5 shadow-[inset_0_-3px_0_#efe0c0]">
            <div>
              <label
                htmlFor="setting-reduced-motion"
                className="block font-['Fredoka'] text-sm font-bold text-[#3e2517]"
              >
                {STRINGS.settings.reducedMotionLabel}
              </label>
              <p className="mt-0.5 text-xs text-[#6b482e]">
                {STRINGS.settings.reducedMotionHelp}
              </p>
            </div>
            <input
              id="setting-reduced-motion"
              type="checkbox"
              checked={draft.reducedMotion}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, reducedMotion: e.target.checked }))
              }
              className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#2e8274]"
            />
          </div>

          {/* Efek suara */}
          <div className="flex items-start justify-between gap-4 rounded-2xl border-2 border-[#3e2517]/30 bg-[#fffdf7] p-3.5 shadow-[inset_0_-3px_0_#efe0c0]">
            <div>
              <label
                htmlFor="setting-sound"
                className="block font-['Fredoka'] text-sm font-bold text-[#3e2517]"
              >
                {SOUND_LABEL}
              </label>
              <p className="mt-0.5 text-xs text-[#6b482e]">{SOUND_HELP}</p>
            </div>
            <input
              id="setting-sound"
              type="checkbox"
              checked={draft.soundEnabled === true}
              onChange={(e) => setDraft((prev) => ({ ...prev, soundEnabled: e.target.checked }))}
              className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[#2e8274]"
            />
          </div>

          {/* Seed skenario */}
          <div className="rounded-2xl border-2 border-[#3e2517]/25 bg-[#fffaf0] p-3.5">
            <label
              htmlFor="setting-seed"
              className="block font-['Fredoka'] text-sm font-bold text-[#3e2517]"
            >
              {STRINGS.settings.seedLabel}
            </label>
            <p className="mt-0.5 text-xs text-[#6b482e]">
              {STRINGS.settings.seedHelp}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <input
                id="setting-seed"
                type="number"
                min={1}
                step={1}
                value={draft.seed}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    seed: Number(e.target.value) || 1,
                  }))
                }
                className="font-mono-data w-full rounded-xl border-2 border-[#3e2517]/40 bg-[#fffdf7] px-3 py-2 text-sm text-[#3e2517]"
              />
              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    seed: Math.floor(100000 + Math.random() * 899999),
                  }))
                }
                className="game-btn-secondary shrink-0 whitespace-nowrap !px-4 text-xs"
              >
                {STRINGS.settings.randomizeSeed}
              </button>
            </div>
          </div>

          {/* Kecepatan awal simulasi */}
          <fieldset>
            <legend className="font-['Fredoka'] text-sm font-bold text-[#3e2517]">
              {STRINGS.settings.defaultSpeedLabel}
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {speedOptions.map((spd) => {
                const active = draft.defaultSpeed === spd;
                return (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setDraft((prev) => ({ ...prev, defaultSpeed: spd }))}
                    aria-pressed={active}
                    className={`font-['Fredoka'] rounded-2xl border-[2.5px] px-3 py-2 text-sm font-bold transition ${
                      active
                        ? 'border-[#3e2517] bg-gradient-to-b from-[#ffe58f] to-[#f2b53b] text-[#3e2517] shadow-[0_3px_0_#3e2517]'
                        : 'border-[#3e2517]/40 bg-[#fffdf7] text-[#3e2517] hover:bg-[#faeed5]'
                    }`}
                  >
                    {spd}x
                  </button>
                );
              })}
            </div>
          </fieldset>

          {onReplayComicIntro && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border-2 border-[#3e2517]/30 bg-[#fffdf7] p-3.5 shadow-[inset_0_-3px_0_#efe0c0]">
              <div>
                <div className="font-['Fredoka'] text-sm font-bold text-[#3e2517]">
                  Pembuka Sinematik Komik (6 Babak)
                </div>
                <p className="mt-0.5 text-xs text-[#6b482e]">
                  Putar kembali kisah pembuka laboratorium dan perkenalan 18 mahasiswa.
                </p>
              </div>
              <button
                type="button"
                onClick={onReplayComicIntro}
                className="game-btn-secondary shrink-0 !px-3.5 text-xs"
                data-testid="settings-replay-comic-intro-btn"
              >
                🎬 Putar Intro
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-[#3e2517]/20 pt-4">
            <button
              type="button"
              onClick={() => setDraft({ ...DEFAULT_SETTINGS })}
              className="game-btn-secondary !px-4 text-xs"
            >
              {STRINGS.settings.resetDefault}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="game-btn-secondary !px-4 text-sm"
              >
                {STRINGS.settings.close}
              </button>
              <button
                type="submit"
                className="game-btn-primary !px-5 text-sm"
              >
                {STRINGS.settings.save}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
