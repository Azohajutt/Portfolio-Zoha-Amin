type CachedAnswer = { text: string; at: number };

const answerCache = new Map<string, CachedAnswer>();

export function getCachedAnswer(key: string, ttlMs: number) {
  const hit = answerCache.get(key);
  if (!hit || Date.now() - hit.at >= ttlMs) return null;
  return hit.text;
}

export function setCachedAnswer(key: string, text: string) {
  answerCache.set(key, { text, at: Date.now() });
  if (answerCache.size > 80) {
    const oldest = answerCache.keys().next().value;
    if (oldest) answerCache.delete(oldest);
  }
}

export function clearChatAnswerCache() {
  answerCache.clear();
}
