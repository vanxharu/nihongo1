import { ShadowingAnalysis, readShadowingResponse } from '../../utils/shadowing';

const pending = new Map<string, Promise<ShadowingAnalysis>>();
export function requestSentenceAnalysis(sentence: string): Promise<ShadowingAnalysis> {
  const existing = pending.get(sentence);
  if (existing) return existing;
  const request = (async () => {
    const response = await fetch('/api/shadowing/analyze', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sentence }), signal: AbortSignal.timeout(35000),
    });
    const result = await readShadowingResponse(response);
    if (!response.ok || !Array.isArray(result.vocabulary) || !Array.isArray(result.kanji) || !Array.isArray(result.grammar))
      throw new Error(result.error || 'Chưa tải được nghĩa của câu này.');
    return result as ShadowingAnalysis;
  })().finally(() => pending.delete(sentence));
  pending.set(sentence, request);
  return request;
}
