import type {
  CounselorInputClassification,
  GeneratedUtterancePayload,
} from '../types';

const REPLAY_CACHE_KEY = 'ruang-dengar:llm-replay-cache:v1';

export interface ReplayCacheStore {
  classifications: Record<string, CounselorInputClassification>;
  utterances: Record<string, GeneratedUtterancePayload>;
}

const memoryStore: ReplayCacheStore = {
  classifications: {},
  utterances: {},
};

let loadedFromStorage = false;

function ensureLoaded(): void {
  if (loadedFromStorage) return;
  loadedFromStorage = true;
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const raw = window.localStorage.getItem(REPLAY_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<ReplayCacheStore>;
    if (parsed.classifications && typeof parsed.classifications === 'object') {
      memoryStore.classifications = { ...parsed.classifications };
    }
    if (parsed.utterances && typeof parsed.utterances === 'object') {
      memoryStore.utterances = { ...parsed.utterances };
    }
  } catch {
    // Abaikan kegagalan penyimpanan lokal sesuai aturan permanen
  }
}

function persistCache(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(REPLAY_CACHE_KEY, JSON.stringify(memoryStore));
  } catch {
    // Abaikan kegagalan penyimpanan lokal sesuai aturan permanen
  }
}

export function hashNormalizedText(text: string): string {
  const normalized = text.trim().toLowerCase().replace(/\s+/g, ' ');
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

export function buildClassificationCacheKey(params: {
  seed: number;
  agentId: string;
  level: number;
  counselorText: string;
}): string {
  return `cls:${params.seed}:${params.agentId}:L${params.level}:${hashNormalizedText(params.counselorText)}`;
}

export function buildUtteranceCacheKey(params: {
  seed: number;
  agentId: string;
  day: number;
  turnNumber: number;
  level: number;
  tone: string;
  counselorText: string;
}): string {
  return `utt:${params.seed}:${params.agentId}:d${params.day}:t${params.turnNumber}:L${params.level}:${params.tone}:${hashNormalizedText(params.counselorText)}`;
}

export function getCachedClassification(
  key: string
): CounselorInputClassification | null {
  ensureLoaded();
  const found = memoryStore.classifications[key];
  return found ? { ...found, source: 'cache' } : null;
}

export function setCachedClassification(
  key: string,
  value: CounselorInputClassification
): void {
  ensureLoaded();
  memoryStore.classifications[key] = value;
  persistCache();
}

export function getCachedUtterance(
  key: string
): GeneratedUtterancePayload | null {
  ensureLoaded();
  const found = memoryStore.utterances[key];
  return found ? { ...found } : null;
}

export function setCachedUtterance(
  key: string,
  value: GeneratedUtterancePayload
): void {
  ensureLoaded();
  memoryStore.utterances[key] = value;
  persistCache();
}

export function clearReplayCache(): void {
  loadedFromStorage = true;
  memoryStore.classifications = {};
  memoryStore.utterances = {};
  persistCache();
}
