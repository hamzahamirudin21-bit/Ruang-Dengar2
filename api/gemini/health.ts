import { handleGeminiHealth } from '../../src/llm/geminiApi';
import type { ServerlessRequest, ServerlessResponse } from './types';

export default function health(req: ServerlessRequest, res: ServerlessResponse): void {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const result = handleGeminiHealth();
  res.status(result.status).json(result.body);
}
