import { randomUUID } from "crypto";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";

export type LocalContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  ip_hash?: string;
  status: string;
  created_at: string;
};

export type LocalChatLog = {
  id: string;
  question: string;
  answer: string | null;
  unanswered: boolean;
  injection_flagged: boolean;
  ip_hash?: string;
  created_at: string;
};

type InboxStore = {
  contact_messages: LocalContactMessage[];
  chat_logs: LocalChatLog[];
};

const dataDir = path.join(process.cwd(), ".data");
const storePath = path.join(dataDir, "inbox.json");

function emptyStore(): InboxStore {
  return { contact_messages: [], chat_logs: [] };
}

function readStore(): InboxStore {
  try {
    if (!existsSync(storePath)) return emptyStore();
    const raw = readFileSync(storePath, "utf8");
    const parsed = JSON.parse(raw) as InboxStore;
    return {
      contact_messages: parsed.contact_messages ?? [],
      chat_logs: parsed.chat_logs ?? [],
    };
  } catch {
    return emptyStore();
  }
}

function writeStore(store: InboxStore) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
}

export function saveLocalContactMessage(input: {
  id?: string;
  name: string;
  email: string;
  message: string;
  ip_hash?: string;
  created_at?: string;
}) {
  const store = readStore();
  const row: LocalContactMessage = {
    id: input.id || randomUUID(),
    name: input.name,
    email: input.email,
    message: input.message,
    ip_hash: input.ip_hash,
    status: "new",
    created_at: input.created_at || new Date().toISOString(),
  };
  store.contact_messages = [row, ...store.contact_messages.filter((item) => item.id !== row.id)];
  writeStore(store);
  return row;
}

export function saveLocalChatLog(input: {
  id?: string;
  question: string;
  answer: string | null;
  unanswered: boolean;
  injection_flagged: boolean;
  ip_hash?: string;
  created_at?: string;
}) {
  const store = readStore();
  const row: LocalChatLog = {
    id: input.id || randomUUID(),
    question: input.question,
    answer: input.answer,
    unanswered: input.unanswered,
    injection_flagged: input.injection_flagged,
    ip_hash: input.ip_hash,
    created_at: input.created_at || new Date().toISOString(),
  };
  store.chat_logs = [row, ...store.chat_logs.filter((item) => item.id !== row.id)];
  writeStore(store);
  return row;
}

export function listLocalContactMessages(limit = 20) {
  return readStore().contact_messages.slice(0, limit);
}

export function listLocalChatLogs(limit = 20) {
  return readStore().chat_logs.slice(0, limit);
}

export function deleteLocalContactMessage(id: string) {
  const store = readStore();
  store.contact_messages = store.contact_messages.filter((item) => item.id !== id);
  writeStore(store);
}

export function deleteLocalChatLog(id: string) {
  const store = readStore();
  store.chat_logs = store.chat_logs.filter((item) => item.id !== id);
  writeStore(store);
}
