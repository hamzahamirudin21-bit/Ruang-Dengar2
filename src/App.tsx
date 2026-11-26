import { useCallback, useEffect, useRef, useState } from 'react';
import { STRINGS } from './data/strings';
import { createInitialClock } from './engine/clock';
import { AppScreen, AppSettings } from './types';
import { playSfx, setSfxEnabled } from './ui/motion/sfx';
import { SettingsModal } from './ui/components/SettingsModal';
import { TheoryLibraryModal } from './ui/components/TheoryLibraryModal';
import { ComicIntroController } from './ui/intro/ComicIntroController';
import { CharacterRosterScreen } from './ui/screens/CharacterRosterScreen';
import { SimulationScreen } from './ui/screens/SimulationScreen';
import { StartScreen } from './ui/screens/StartScreen';
import {
  hasCompletedComicIntro,
  loadSettings,
  markComicIntroCompleted,
  saveSettings,
} from './utils/storage';

function shouldAutostart(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') === '1';
  } catch {
    return false;
  }
}

function shouldAutoOpenComicIntro(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('intro') === '1' || params.has('introPage');
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
  const [theoryOpen, setTheoryOpen] = useState<boolean>(false);
  const [comicIntroOpen, setComicIntroOpen] = useState<boolean>(() =>
    shouldAutoOpenComicIntro()
  );
  const [transitioning, setTransitioning] = useState<boolean>(false);
  const transitionTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
    };
  }, []);

  const navigateScreen = useCallback(
    (next: AppScreen) => {
      if (next === screen) return;
      if (settings.reducedMotion) {
        setScreen(next);
        return;
      }
      playSfx('ganti-adegan');
      setTransitioning(true);
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      transitionTimerRef.current = window.setTimeout(() => {
        setScreen(next);
        transitionTimerRef.current = window.setTimeout(() => {
          setTransitioning(false);
          transitionTimerRef.current = null;
        }, 160);
      }, 150);
    },
    [screen, settings.reducedMotion],
  );

  const handleSaveSettings = useCallback((next: AppSettings) => {
    setSettings(next);
    const result = saveSettings(next, STRINGS.errors.storageWriteFailed);
    setStorageNotice(result.error);
  }, []);

  const handleToggleAudio = useCallback(() => {
    const nextSound = settings.soundEnabled !== true;
    const updated: AppSettings = { ...settings, soundEnabled: nextSound };
    setSfxEnabled(nextSound);
    if (nextSound) playSfx('pilih');
    handleSaveSettings(updated);
  }, [settings, handleSaveSettings]);

  const handleChangeSeedFromDev = (nextSeed: number) => {
    const updated = { ...settings, seed: nextSeed };
    handleSaveSettings(updated);
  };

  const handleStartFromTitle = useCallback(() => {
    if (!hasCompletedComicIntro()) {
      setComicIntroOpen(true);
      return;
    }
    navigateScreen('roster');
  }, [navigateScreen]);

  const handleFinishComicIntro = useCallback(() => {
    markComicIntroCompleted(true);
    setComicIntroOpen(false);
    if (screen === 'start') {
      navigateScreen('roster');
    }
  }, [navigateScreen, screen]);

  return (
    <div className="min-h-screen bg-[var(--ui-bg)] text-[var(--ui-text)]">
      <div className="portrait-orientation-notice" role="status">
        Putar perangkat ke mode landscape untuk pengalaman bermain terbaik.
      </div>
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
          isSettingsOpen={settingsOpen || theoryOpen || comicIntroOpen}
          audioEnabled={settings.soundEnabled === true}
          onToggleAudio={handleToggleAudio}
          onOpenTheory={() => setTheoryOpen(true)}
          onOpenComicIntro={() => setComicIntroOpen(true)}
          onStart={handleStartFromTitle}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      ) : screen === 'roster' ? (
        <CharacterRosterScreen
          reducedMotion={settings.reducedMotion}
          audioEnabled={settings.soundEnabled === true}
          onToggleAudio={handleToggleAudio}
          onContinue={() => navigateScreen('simulation')}
          onBack={() => navigateScreen('start')}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      ) : (
        <SimulationScreen
          initialClock={createInitialClock(settings.defaultSpeed, false)}
          seed={settings.seed}
          reducedMotion={settings.reducedMotion}
          audioEnabled={settings.soundEnabled === true}
          onToggleAudio={handleToggleAudio}
          onOpenTheory={() => setTheoryOpen(true)}
          onChangeSeed={handleChangeSeedFromDev}
          onOpenSettings={() => setSettingsOpen(true)}
          onBackToStart={() => navigateScreen('start')}
        />
      )}

      {/* Tirai transisi layar cozy (nonaktif otomatis saat reducedMotion) */}
      <div
        aria-hidden="true"
        className={`cozy-curtain ${transitioning ? 'cozy-curtain--active' : ''}`}
      />

      <SettingsModal
        isOpen={settingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setSettingsOpen(false)}
        onReplayComicIntro={() => {
          setSettingsOpen(false);
          setComicIntroOpen(true);
        }}
      />

      <TheoryLibraryModal
        isOpen={theoryOpen}
        onClose={() => setTheoryOpen(false)}
      />

      {comicIntroOpen && (
        <ComicIntroController
          reducedMotion={settings.reducedMotion}
          onComplete={handleFinishComicIntro}
          onSkip={handleFinishComicIntro}
        />
      )}
    </div>
  );
}
