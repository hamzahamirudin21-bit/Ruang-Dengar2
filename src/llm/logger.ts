import type { LlmAuditLogEntry } from '../types';

const AUDIT_LOG_KEY = 'ruang-dengar:llm-audit-log:v1';
const MAX_LOG_ENTRIES = 200;

let inMemoryAuditLog: LlmAuditLogEntry[] = [];
let loaded = false;

function ensureLoaded(): void {
  if (loaded) return;
  loaded = true;
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const raw = window.localStorage.getItem(AUDIT_LOG_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      inMemoryAuditLog = parsed.slice(0, MAX_LOG_ENTRIES);
    }
  } catch {
    // Abaikan kegagalan penyimpanan lokal
  }
}

export function recordLlmAuditEntry(
  entry: Omit<LlmAuditLogEntry, 'id' | 'timestampIso'>
): LlmAuditLogEntry {
  ensureLoaded();
  const fullEntry: LlmAuditLogEntry = {
    ...entry,
    id: `llm-${Date.now()}-${inMemoryAuditLog.length + 1}`,
    timestampIso: new Date().toISOString(),
  };

  inMemoryAuditLog = [fullEntry, ...inMemoryAuditLog].slice(0, MAX_LOG_ENTRIES);

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(
        AUDIT_LOG_KEY,
        JSON.stringify(inMemoryAuditLog)
      );
    }
  } catch {
    // Abaikan kegagalan penyimpanan lokal
  }

  return fullEntry;
}

export function getLlmAuditLog(): readonly LlmAuditLogEntry[] {
  ensureLoaded();
  return inMemoryAuditLog;
}

export function clearLlmAuditLog(): void {
  loaded = true;
  inMemoryAuditLog = [];
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(AUDIT_LOG_KEY);
    }
  } catch {
    // Abaikan
  }
}
