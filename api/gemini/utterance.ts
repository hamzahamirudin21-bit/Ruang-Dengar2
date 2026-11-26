import { handleGeminiUtterance } from '../../src/llm/geminiApi';
import type { ServerlessRequest, ServerlessResponse } from './types';

export default async function utterance(
  req: ServerlessRequest,
  res: ServerlessResponse
): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const result = await handleGeminiUtterance(req.body);
  res.status(result.status).json(result.body);
}
