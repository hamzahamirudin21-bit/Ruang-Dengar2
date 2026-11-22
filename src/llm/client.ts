import { LLM_CONFIG } from './config';

export interface HttpPostResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  latencyMs: number;
}

export async function postJsonWithTimeout<T>(
  url: string,
  body: unknown,
  timeoutMs: number = LLM_CONFIG.timeoutMs
): Promise<HttpPostResult<T>> {
  const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const endedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const latencyMs = Math.round(endedAt - startedAt);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return {
        ok: false,
        error: `HTTP ${res.status}: ${text || res.statusText}`,
        latencyMs,
      };
    }

    const data = (await res.json()) as T;
    return { ok: true, data, latencyMs };
  } catch (err) {
    const endedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const latencyMs = Math.round(endedAt - startedAt);
    const msg =
      err instanceof Error && err.name === 'AbortError'
        ? `Timeout melebihi ${timeoutMs}ms`
        : err instanceof Error
          ? err.message
          : 'Koneksi gagal';
    return { ok: false, error: msg, latencyMs };
  } finally {
    clearTimeout(timer);
  }
}

export async function checkGeminiServerAvailability(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(LLM_CONFIG.endpoints.health, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return false;
    const data = (await res.json()) as { configured?: boolean };
    return Boolean(data.configured);
  } catch {
    return false;
  }
}
