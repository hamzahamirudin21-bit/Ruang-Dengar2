import { ThinkingLevel } from '@google/genai';

/** Hanya untuk sisi server: jangan diimpor dari kode klien agar bundel tidak menarik SDK. */

export const MISSING_KEY_MESSAGE =
  'GEMINI_API_KEY belum dikonfigurasi di server. Isi GEMINI_API_KEY pada berkas .env (salin dari .env.example) lalu jalankan ulang server.';

type EnvMap = Record<string, string | undefined>;

/** Kunci dianggap tersedia bila bukan undefined dan tidak kosong setelah trim. */
export function isLlmConfigured(env: EnvMap): boolean {
  const key = env.GEMINI_API_KEY;
  return typeof key === 'string' && key.trim().length > 0;
}

/**
 * gemini-2.5* memakai thinkingBudget; model lain memakai thinkingLevel LOW.
 * Tidak pernah keduanya. Seri 2.5 Pro tidak dapat mematikan thinking, sehingga
 * memakai batas minimum 128.
 */
export function buildThinkingConfig(
  model: string,
): { thinkingBudget: number } | { thinkingLevel: ThinkingLevel } {
  if (model.startsWith('gemini-2.5')) {
    return { thinkingBudget: model.startsWith('gemini-2.5-pro') ? 128 : 0 };
  }
  return { thinkingLevel: ThinkingLevel.LOW };
}

/** Badan respons /api/gemini/health: hanya { configured, model }. */
export function buildHealthBody(
  env: EnvMap,
  model: string,
): { configured: boolean; model: string } {
  return { configured: isLlmConfigured(env), model };
}
