import { buildKnowledgeChunks, fingerprintChunks, type KnowledgeChunk } from "@/lib/chat-chunks";
import type { VisitorKind } from "@/lib/chat-visitor";
import type { SiteContent } from "@/types/content";

type IndexedChunk = KnowledgeChunk & { vector: number[] | null };

type Index = {
  fingerprint: string;
  chunks: IndexedChunk[];
};

const EMBED_MODEL = process.env.GEMINI_EMBEDDING_MODEL?.trim() || "text-embedding-004";
const TOP_K = 6;

let index: Index | null = null;
let building: Promise<Index> | null = null;

function cosine(a: number[], b: number[]) {
  let dot = 0;
  let left = 0;
  let right = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) {
    dot += a[i] * b[i];
    left += a[i] * a[i];
    right += b[i] * b[i];
  }
  const denom = Math.sqrt(left) * Math.sqrt(right);
  return denom ? dot / denom : 0;
}

function tokens(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9+]+/)
    .filter((token) => token.length > 2);
}

function lexicalScore(query: string, chunk: KnowledgeChunk) {
  const words = tokens(query);
  if (!words.length) return 0;
  const hay = `${chunk.title} ${chunk.text}`.toLowerCase();
  return words.reduce((sum, word) => sum + (hay.includes(word) ? (word.length > 5 ? 2 : 1) : 0), 0);
}

async function embedTexts(apiKey: string, texts: string[], taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY") {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBED_MODEL}:batchEmbedContents`;
  const vectors: number[][] = [];

  for (let i = 0; i < texts.length; i += 16) {
    const batch = texts.slice(i, i + 16);
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        requests: batch.map((text) => ({
          model: `models/${EMBED_MODEL}`,
          content: { parts: [{ text: text.slice(0, 8000) }] },
          taskType,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`embed ${response.status}`);
    }

    const json = (await response.json()) as { embeddings?: Array<{ values?: number[] }> };
    for (const item of json.embeddings || []) {
      if (item.values?.length) vectors.push(item.values);
    }
  }

  return vectors;
}

async function buildIndex(content: SiteContent, apiKey?: string): Promise<Index> {
  const chunks = buildKnowledgeChunks(content);
  const fingerprint = fingerprintChunks(chunks);
  const indexed: IndexedChunk[] = chunks.map((chunk) => ({ ...chunk, vector: null }));

  if (apiKey) {
    try {
      const vectors = await embedTexts(
        apiKey,
        chunks.map((chunk) => `${chunk.title}\n${chunk.text}`),
        "RETRIEVAL_DOCUMENT",
      );
      if (vectors.length === chunks.length) {
        vectors.forEach((vector, i) => {
          indexed[i].vector = vector;
        });
      }
    } catch (error) {
      console.error("chat rag embed failed", error);
    }
  }

  return { fingerprint, chunks: indexed };
}

export async function ensureChatIndex(content: SiteContent, apiKey?: string) {
  const fingerprint = fingerprintChunks(buildKnowledgeChunks(content));
  if (index && index.fingerprint === fingerprint) return index;
  if (!building) {
    building = buildIndex(content, apiKey)
      .then((value) => {
        index = value;
        return value;
      })
      .finally(() => {
        building = null;
      });
  }
  return building;
}

export function invalidateChatIndex() {
  index = null;
  building = null;
}

export async function retrievePortfolioContext(
  content: SiteContent,
  question: string,
  visitor: VisitorKind,
  apiKey?: string,
) {
  const store = await ensureChatIndex(content, apiKey);
  let queryVector: number[] | null = null;

  if (apiKey && store.chunks.some((chunk) => chunk.vector)) {
    try {
      const [vector] = await embedTexts(apiKey, [question], "RETRIEVAL_QUERY");
      queryVector = vector ?? null;
    } catch {
      queryVector = null;
    }
  }

  const lexicalMax = Math.max(1, ...store.chunks.map((chunk) => lexicalScore(question, chunk)));

  const ranked = store.chunks
    .map((chunk) => {
      const lexical = lexicalScore(question, chunk) / lexicalMax;
      const semantic = queryVector && chunk.vector ? (cosine(queryVector, chunk.vector) + 1) / 2 : 0;
      let score = queryVector && chunk.vector ? 0.72 * semantic + 0.28 * lexical : lexical;
      if (visitor === "recruiter" && (chunk.source === "experience" || chunk.source === "project" || chunk.source === "profile")) {
        score += 0.04;
      }
      if (visitor === "technical" && (chunk.source === "project" || chunk.source === "skills")) {
        score += 0.04;
      }
      return { chunk, score };
    })
    .sort((a, b) => b.score - a.score);

  const picked = new Map<string, KnowledgeChunk>();
  const profile = store.chunks.find((chunk) => chunk.id === "profile");
  const contact = store.chunks.find((chunk) => chunk.id === "contact");
  if (profile) picked.set(profile.id, profile);
  if (contact) picked.set(contact.id, contact);

  for (const item of ranked) {
    picked.set(item.chunk.id, item.chunk);
    if (picked.size >= TOP_K + 1) break;
  }

  const sections = [...picked.values()].map((chunk) => `### ${chunk.title}\n${chunk.text}`);
  return sections.join("\n\n");
}
