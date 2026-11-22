import { useEffect, useState } from 'react';
import { STRINGS } from './data/strings';
import { createInitialClock } from './engine/clock';
import { AppScreen, AppSettings } from './types';
import { setSfxEnabled } from './ui/motion/sfx';
import { SettingsModal } from './ui/components/SettingsModal';
import { CharacterRosterScreen } from './ui/screens/CharacterRosterScreen';
import { SimulationScreen } from './ui/screens/SimulationScreen';
import { StartScreen } from './ui/screens/StartScreen';
import { loadSettings, saveSettings } from './utils/storage';

function shouldAutostart(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') === '1';
  } catch {
    return false;
  }
}

export default function App() {
  const [initialLoaded] = useState(() => loadSettings(STRINGS.errors.storageReadFailed));
  const [settings, setSettings] = useState<AppSettings>(initialLoaded.value);
  const [storageNotice, setStorageNotice] = useState<string | null>(initialLoaded.error);
  const [screen, setScreen] = useState<AppScreen>(() =>
    shouldAutostart() ? 'simulation' : 'start'
  );
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);

  // Terapkan ukuran teks, opsi kurangi gerak, dan status layar ke root DOM
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.textSize = settings.textSize;
    root.dataset.reducedMotion = settings.reducedMotion ? 'true' : 'false';
  }, [settings.textSize, settings.reducedMotion]);

  useEffect(() => {
    setSfxEnabled(settings.soundEnabled === true);
  }, [settings.soundEnabled]);

  useEffect(() => {
    if (screen === 'start') {
      document.body.dataset.state = 'title';
    }
  }, [screen]);

  const handleSaveSettings = (next: AppSettings) => {
    setSettings(next);
    const result = saveSettings(next, STRINGS.errors.storageWriteFailed);
    setStorageNotice(result.error);
  };

  const handleChangeSeedFromDev = (nextSeed: number) => {
    const updated = { ...settings, seed: nextSeed };
    handleSaveSettings(updated);
  };

  return (
    <div className="min-h-screen bg-[var(--ui-bg)] text-[var(--ui-text)]">
      {storageNotice && (
        <div
          role="status"
          className="flex items-center justify-between border-b border-[var(--ui-warning-border)] bg-[var(--ui-warning-bg)] px-4 py-2 text-xs text-[var(--ui-warning-text)]"
        >
          <span>{storageNotice}</span>
          <button
            type="button"
            onClick={() => setStorageNotice(null)}
            className="ml-4 font-semibold underline"
          >
            {STRINGS.settings.close}
          </button>
        </div>
      )}

      {screen === 'start' ? (
        <StartScreen
          isSettingsOpen={settingsOpen}
          onStart={() => setScreen('roster')}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      ) : screen === 'roster' ? (
        <CharacterRosterScreen
          reducedMotion={settings.reducedMotion}
          onContinue={() => setScreen('simulation')}
          onBack={() => setScreen('start')}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      ) : (
        <SimulationScreen
          initialClock={createInitialClock(settings.defaultSpeed, false)}
          seed={settings.seed}
          reducedMotion={settings.reducedMotion}
          onChangeSeed={handleChangeSeedFromDev}
          onOpenSettings={() => setSettingsOpen(true)}
          onBackToStart={() => setScreen('start')}
        />
      )}

      <SettingsModal
        isOpen={settingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
