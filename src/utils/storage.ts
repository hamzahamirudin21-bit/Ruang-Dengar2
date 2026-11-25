import {
  AgentMemoryRecord,
  AnecdotalRecord,
  AppSettings,
  CounselorHypothesis,
} from '../types';

const SETTINGS_STORAGE_KEY = 'ruang-dengar:settings:v1';
// Versi dinaikkan ke v2: id mhs-01..mhs-15 dipakai ulang oleh mahasiswa berbeda
// setelah kohort dikurangi ke 15, sehingga data v1 tidak boleh dibaca atau dimigrasi.
const COUNSELOR_RECORDS_STORAGE_KEY = 'ruang-dengar:counselor-records:v2';
const AGENT_MEMORY_STORAGE_KEY = 'ruang-dengar:agent-memory:v2';
export const COMIC_INTRO_COMPLETED_KEY = 'ruang-dengar:comic-intro-completed:v1';

export interface StoredCounselorRecords {
  hypotheses: CounselorHypothesis[];
  anecdotalRecords: AnecdotalRecord[];
}

export const DEFAULT_SETTINGS: AppSettings = {
  textSize: 'normal',
  reducedMotion: false,
  seed: 202601,
  defaultSpeed: 1,
  soundEnabled: false,
};

export interface StorageResult<T> {
  value: T;
  error: string | null;
}

export function loadSettings(errorMessage: string): StorageResult<AppSettings> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { value: { ...DEFAULT_SETTINGS }, error: null };
    }
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      return { value: { ...DEFAULT_SETTINGS }, error: null };
    }
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const textSize =
      parsed.textSize === 'large' || parsed.textSize === 'xlarge' || parsed.textSize === 'normal'
        ? parsed.textSize
        : DEFAULT_SETTINGS.textSize;
    const defaultSpeed =
      parsed.defaultSpeed === 1 || parsed.defaultSpeed === 2 || parsed.defaultSpeed === 4
        ? parsed.defaultSpeed
        : DEFAULT_SETTINGS.defaultSpeed;
    const seed =
      typeof parsed.seed === 'number' && Number.isFinite(parsed.seed)
        ? Math.max(1, Math.floor(Math.abs(parsed.seed)))
        : DEFAULT_SETTINGS.seed;

    return {
      value: {
        textSize,
        reducedMotion: Boolean(parsed.reducedMotion),
        seed,
        defaultSpeed,
        soundEnabled: parsed.soundEnabled === true,
      },
      error: null,
    };
  } catch {
    return { value: { ...DEFAULT_SETTINGS }, error: errorMessage };
  }
}

export function saveSettings(
  settings: AppSettings,
  errorMessage: string
): { ok: boolean; error: string | null } {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { ok: true, error: null };
    }
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: errorMessage };
  }
}

export function loadCounselorRecords(): StoredCounselorRecords {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { hypotheses: [], anecdotalRecords: [] };
    }
    const raw = window.localStorage.getItem(COUNSELOR_RECORDS_STORAGE_KEY);
    if (!raw) {
      return { hypotheses: [], anecdotalRecords: [] };
    }
    const parsed = JSON.parse(raw) as Partial<StoredCounselorRecords>;
    return {
      hypotheses: Array.isArray(parsed.hypotheses) ? parsed.hypotheses : [],
      anecdotalRecords: Array.isArray(parsed.anecdotalRecords)
        ? parsed.anecdotalRecords
        : [],
    };
  } catch {
    return { hypotheses: [], anecdotalRecords: [] };
  }
}

export function saveCounselorRecords(records: StoredCounselorRecords): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(
      COUNSELOR_RECORDS_STORAGE_KEY,
      JSON.stringify(records)
    );
  } catch {
    // Abaikan kegagalan penyimpanan lokal sesuai aturan permanen
  }
}

export function loadAgentMemoryMap(): Record<string, AgentMemoryRecord> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {};
    }
    const raw = window.localStorage.getItem(AGENT_MEMORY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, AgentMemoryRecord>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveAgentMemoryMap(
  memoryMap: Readonly<Record<string, AgentMemoryRecord>>
): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(
      AGENT_MEMORY_STORAGE_KEY,
      JSON.stringify(memoryMap)
    );
  } catch {
    // Abaikan kegagalan penyimpanan lokal sesuai aturan permanen
  }
}

export function hasCompletedComicIntro(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    return window.localStorage.getItem(COMIC_INTRO_COMPLETED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markComicIntroCompleted(completed = true): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    if (completed) {
      window.localStorage.setItem(COMIC_INTRO_COMPLETED_KEY, '1');
    } else {
      window.localStorage.removeItem(COMIC_INTRO_COMPLETED_KEY);
    }
  } catch {
    // Abaikan kegagalan penyimpanan lokal sesuai aturan permanen
  }
}
