import React, { useEffect, useState } from 'react';
import { STRINGS } from '../../data/strings';
import { AppSettings, SimulationSpeed, TextSizeOption } from '../../types';
import { DEFAULT_SETTINGS } from '../../utils/storage';

const SOUND_LABEL = 'Efek Suara';
const SOUND_HELP = 'Bunyi sederhana saat memilih dan saat misi selesai. Bawaan: mati.';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onSave: (next: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        className="w-full max-w-lg rounded-xl border border-[var(--ui-border)] bg-[var(--ui-surface)] p-6 shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--ui-border)] pb-4">
          <h2 id="settings-modal-title" className="text-lg font-semibold text-[var(--ui-text)]">
            {STRINGS.settings.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--ui-border)] px-3 py-1.5 text-sm font-medium text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-muted)] hover:text-[var(--ui-text)]"
          >
            {STRINGS.settings.close}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Ukuran teks */}
          <fieldset>
            <legend className="text-sm font-semibold text-[var(--ui-text)]">
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
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'border-[var(--ui-accent)] bg-[var(--ui-accent-soft)] text-[var(--ui-accent)]'
                        : 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]'
                    }`}
                  >
                    {STRINGS.settings.textSizeOptions[opt]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Kurangi gerak */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-3.5">
            <div>
              <label
                htmlFor="setting-reduced-motion"
                className="block text-sm font-semibold text-[var(--ui-text)]"
              >
                {STRINGS.settings.reducedMotionLabel}
              </label>
              <p className="mt-0.5 text-xs text-[var(--ui-text-muted)]">
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
              className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[var(--ui-accent)]"
            />
          </div>

          {/* Efek suara */}
          <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface-muted)] p-3.5">
            <div>
              <label
                htmlFor="setting-sound"
                className="block text-sm font-semibold text-[var(--ui-text)]"
              >
                {SOUND_LABEL}
              </label>
              <p className="mt-0.5 text-xs text-[var(--ui-text-muted)]">{SOUND_HELP}</p>
            </div>
            <input
              id="setting-sound"
              type="checkbox"
              checked={draft.soundEnabled === true}
              onChange={(e) => setDraft((prev) => ({ ...prev, soundEnabled: e.target.checked }))}
              className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[var(--ui-accent)]"
            />
          </div>

          {/* Seed skenario */}
          <div>
            <label
              htmlFor="setting-seed"
              className="block text-sm font-semibold text-[var(--ui-text)]"
            >
              {STRINGS.settings.seedLabel}
            </label>
            <p className="mt-0.5 text-xs text-[var(--ui-text-muted)]">
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
                className="font-mono-data w-full rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-sm text-[var(--ui-text)]"
              />
              <button
                type="button"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    seed: Math.floor(100000 + Math.random() * 899999),
                  }))
                }
                className="shrink-0 whitespace-nowrap rounded-lg border border-[var(--ui-border)] bg-[var(--ui-surface)] px-3 py-2 text-sm font-medium text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]"
              >
                {STRINGS.settings.randomizeSeed}
              </button>
            </div>
          </div>

          {/* Kecepatan awal simulasi */}
          <fieldset>
            <legend className="text-sm font-semibold text-[var(--ui-text)]">
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
                    className={`font-mono-data rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'border-[var(--ui-accent)] bg-[var(--ui-accent-soft)] text-[var(--ui-accent)]'
                        : 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]'
                    }`}
                  >
                    {spd}x
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--ui-border)] pt-4">
            <button
              type="button"
              onClick={() => setDraft({ ...DEFAULT_SETTINGS })}
              className="rounded-lg border border-[var(--ui-border)] px-3 py-2 text-sm font-medium text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-muted)] hover:text-[var(--ui-text)]"
            >
              {STRINGS.settings.resetDefault}
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[var(--ui-border)] px-4 py-2 text-sm font-medium text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]"
              >
                {STRINGS.settings.close}
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[var(--ui-accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--ui-accent-hover)]"
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
