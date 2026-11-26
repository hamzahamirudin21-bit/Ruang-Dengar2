import assert from 'node:assert/strict';
import { test } from 'node:test';
import classify from './classify';
import health from './health';
import type { ServerlessRequest, ServerlessResponse } from './types';
import utterance from './utterance';

async function invoke(
  handler: (
    req: ServerlessRequest,
    res: ServerlessResponse
  ) => void | Promise<void>,
  method: string,
  body?: unknown
): Promise<{ status: number; body: unknown }> {
  const result = { status: 200, body: undefined as unknown };
  const response = {
    status(code: number) {
      result.status = code;
      return this;
    },
    json(payload: unknown) {
      result.body = payload;
      return this;
    },
  } as unknown as ServerlessResponse;

  await handler({ method, body } as ServerlessRequest, response);
  return result;
}

test('Vercel Gemini handlers expose the health route and enforce endpoint methods', async () => {
  const healthResult = await invoke(health, 'GET');
  assert.equal(healthResult.status, 200);
  assert.equal(typeof (healthResult.body as { configured: unknown }).configured, 'boolean');

  const classifyMethod = await invoke(classify, 'GET');
  assert.equal(classifyMethod.status, 405);

  const utteranceMethod = await invoke(utterance, 'GET');
  assert.equal(utteranceMethod.status, 405);
});

test('Vercel Gemini POST handlers return validation errors without making model calls', async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = 'test-key';
  try {
    const classifyResult = await invoke(classify, 'POST', {});
    assert.equal(classifyResult.status, 400);
    assert.deepEqual(classifyResult.body, { error: 'counselorText wajib diisi.' });

    const utteranceResult = await invoke(utterance, 'POST', {});
    assert.equal(utteranceResult.status, 400);
    assert.deepEqual(utteranceResult.body, { error: 'stateCard wajib dikirim.' });
  } finally {
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = previousKey;
  }
});
