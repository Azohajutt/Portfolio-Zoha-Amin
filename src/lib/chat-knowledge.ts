import { clearChatAnswerCache } from "@/lib/chat-answer-cache";
import { invalidateChatIndex } from "@/lib/chat-rag";
import { getLiveContent } from "@/lib/get-content";
import type { SiteContent } from "@/types/content";

const TTL_MS = 5 * 60_000;

type Knowledge = { content: SiteContent; email: string; fetchedAt: number };

let cached: Knowledge | null = null;
let inflight: Promise<Knowledge> | null = null;

async function load(): Promise<Knowledge> {
  const content = await getLiveContent();
  return { content, email: content.email, fetchedAt: Date.now() };
}

/** Live portfolio snapshot, cached so each message skips the database. */
export async function getChatKnowledge(): Promise<Knowledge> {
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) return cached;
  if (!inflight) {
    inflight = load()
      .then((value) => {
        cached = value;
        return value;
      })
      .finally(() => {
        inflight = null;
      });
  }
  if (cached) return cached;
  return inflight;
}

export function invalidateChatKnowledge() {
  cached = null;
  invalidateChatIndex();
  clearChatAnswerCache();
}
