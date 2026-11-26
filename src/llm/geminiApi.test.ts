import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LLM_CONFIG } from './config';
import {
  handleGeminiClassify,
  handleGeminiHealth,
  handleGeminiUtterance,
} from './geminiApi';

test('health endpoint reports server configuration without exposing credentials', () => {
  const result = handleGeminiHealth({ GEMINI_API_KEY: '  ' });
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { configured: false, model: LLM_CONFIG.model });
});

test('Gemini requests return actionable status for missing keys and invalid payloads', async () => {
  const missingKey = await handleGeminiClassify({ counselorText: 'Halo' }, {});
  assert.equal(missingKey.status, 503);
  assert.match((missingKey.body as { error: string }).error, /GEMINI_API_KEY/);

  const invalidClassify = await handleGeminiClassify(
    { counselorText: '   ' },
    { GEMINI_API_KEY: 'test-key' }
  );
  assert.equal(invalidClassify.status, 400);
  assert.deepEqual(invalidClassify.body, { error: 'counselorText wajib diisi.' });

  const invalidUtterance = await handleGeminiUtterance(
    {},
    { GEMINI_API_KEY: 'test-key' }
  );
  assert.equal(invalidUtterance.status, 400);
  assert.deepEqual(invalidUtterance.body, { error: 'stateCard wajib dikirim.' });
});
