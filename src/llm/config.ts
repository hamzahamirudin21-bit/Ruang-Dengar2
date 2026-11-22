/**
 * Pusat konfigurasi tunggal untuk lapisan dialog Gemini (klasifikasi keterampilan konseling dan pembangkitan ucapan mahasiswa).
 * Nama model hanya didefinisikan di berkas ini agar mudah dikelola.
 * Berkas ini tidak mengimpor SDK karena juga dipakai oleh kode klien.
 */
export const DEFAULT_MODEL = 'gemini-3.6-flash';

/** Pilih nama model: nilai GEMINI_MODEL bila tidak kosong, jika tidak model bawaan. */
export function resolveModel(env: Record<string, string | undefined>): string {
  const override = env.GEMINI_MODEL?.trim();
  return override ? override : DEFAULT_MODEL;
}

/** Di klien (Vite) `process` tidak terdefinisi, sehingga model jatuh ke nilai bawaan. */
const runtimeEnv: Record<string, string | undefined> =
  typeof process !== 'undefined' && process.env ? process.env : {};

export const LLM_CONFIG = {
  model: resolveModel(runtimeEnv),
  /** Catatan profil suhu rendah (0.4-0.7) sesuai panduan pedagogis; dikendalikan lewat konfigurasi thinking dan instruksi sistem yang ringkas */
  targetTemperatureBand: 0.5,
  timeoutMs: 8000,
  maxRetries: 1,
  maxReplyWords: 40,
  maxNonverbalWords: 12,
  endpoints: {
    health: '/api/gemini/health',
    classify: '/api/gemini/classify',
    utterance: '/api/gemini/utterance',
  },
} as const;
