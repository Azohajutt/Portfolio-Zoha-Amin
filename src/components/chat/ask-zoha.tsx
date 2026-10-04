"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { SiteContent } from "@/types/content";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { canonicalizeContact, contactFromContent } from "@/lib/chat-contact";
import { chatSuggestions, followUpSuggestions, type SuggestionKind } from "@/lib/chat-suggestions";
import { cn } from "@/lib/utils";

type Role = "user" | "assistant";
type Message = { id: string; role: Role; content: string; status?: "streaming" | "error"; instant?: boolean };

const STORAGE_KEY = "ask-zoha:v10";
const HISTORY_LIMIT = 10;

let counter = 0;
const newId = () => `m${Date.now().toString(36)}${(counter++).toString(36)}`;

function defaultWelcome(name: string) {
  return `Hi — I’m ${name}’s AI representative. I reason from this portfolio: the work, the stack, and the proof. Ask me anything about it.`;
}

function welcomeMessage(name: string, custom?: string): Message {
  return {
    id: "welcome",
    role: "assistant",
    content: custom?.trim() || defaultWelcome(name),
  };
}

function loadMessages(name: string, custom?: string): Message[] {
  if (typeof window === "undefined") return [welcomeMessage(name, custom)];
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "null") as Message[] | null;
    if (Array.isArray(saved) && saved.length) {
      return saved.map((m) => ({ ...m, status: m.status === "streaming" ? undefined : m.status }));
    }
  } catch {
    // ignore
  }
  return [welcomeMessage(name, custom)];
}

function Icon({
  name,
  className,
}: {
  name: "send" | "stop" | "close" | "reset" | "copy" | "check" | "spark" | "retry" | SuggestionKind;
  className?: string;
}) {
  const paths: Record<typeof name, string> = {
    send: "M4 12h13M12 5l7 7-7 7",
    stop: "M7 7h10v10H7z",
    close: "M6 6l12 12M18 6L6 18",
    reset: "M4 12a8 8 0 1 0 2.3-5.7M4 4v4h4",
    copy: "M9 9h10v10H9zM5 15V5h10",
    check: "M5 12.5l4.2 4.2L19 7",
    spark: "M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z",
    retry: "M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4",
    hire: "M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z",
    voice: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
    live: "M8 5.5v13l11-6.5z",
    stack: "M12 4l8 4-8 4-8-4 8-4zM4 12l8 4 8-4M4 16l8 4 8-4",
    experience: "M8 7V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1M4 7h16v12H4z",
    project: "M4 7h16v12H4zM8 7V5h8v2",
    general: "M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4z",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("h-4 w-4", className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name]} />
    </svg>
  );
}

function TypingDots() {
  return (
    <span className="flex items-center gap-2" role="status" aria-label="Thinking">
      <span className="typing-dots" aria-hidden>
        <span />
        <span />
        <span />
      </span>
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(text).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        });
      }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] text-[var(--muted)] opacity-0 transition hover:text-[var(--fg)] focus-visible:opacity-100 group-hover:opacity-100"
      aria-label="Copy answer"
    >
      <Icon name={copied ? "check" : "copy"} className="h-3.5 w-3.5" />
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function AskZoha({ content }: { content: SiteContent }) {
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => loadMessages(content.name, content.welcomeMessage));
  const starters = useMemo(() => chatSuggestions(content), [content]);
  const contact = useMemo(() => contactFromContent(content), [content]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stickToBottom = useRef(true);
  const warmed = useRef(false);

  const hasConversation = messages.some((m) => m.role === "user");
  const openChat = useCallback(() => setOpen(true), []);

  useEffect(() => {
    const warm = () => {
      if (warmed.current) return;
      warmed.current = true;
      void fetch("/api/chat", { method: "GET" })
        .then((res) => {
          if (res.ok || res.status === 204) setReady(true);
        })
        .catch(() => {});
    };
    let cancelled = false;
    const run = () => {
      if (!cancelled) warm();
    };
    const idleId =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(run, { timeout: 1800 })
        : window.setTimeout(run, 600);
    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleId);
      else window.clearTimeout(idleId);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("open-ask-zoha", openChat);
    const onHash = () => {
      if (window.location.hash === "#ask") openChat();
    };
    window.addEventListener("hashchange", onHash);
    const frame = window.requestAnimationFrame(onHash);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("open-ask-zoha", openChat);
      window.removeEventListener("hashchange", onHash);
    };
  }, [openChat]);

  useEffect(() => {
    if (!open) return;
    if (!warmed.current) {
      warmed.current = true;
      void fetch("/api/chat", { method: "GET" })
        .then((res) => {
          if (res.ok || res.status === 204) setReady(true);
        })
        .catch(() => {});
    }
    const focus = window.setTimeout(() => inputRef.current?.focus(), 80);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focus);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (loading) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-24)));
    } catch {
      // storage full
    }
  }, [messages, loading]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const followUps = useMemo(() => {
    if (loading || !hasConversation) return [];
    const lastAnswer = [...messages].reverse().find((m) => m.role === "assistant" && m.status !== "error");
    const asked = new Set(messages.filter((m) => m.role === "user").map((m) => m.content.toLowerCase()));
    return followUpSuggestions(lastAnswer?.content ?? "", content, asked);
  }, [messages, loading, hasConversation, content]);

  const updateLast = (patch: Partial<Message>) =>
    setMessages((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = { ...copy[copy.length - 1], ...patch };
      return copy;
    });

  async function send(question: string, baseMessages = messages) {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { id: newId(), role: "user", content: trimmed };

    setInput("");
    stickToBottom.current = true;
    if (inputRef.current) inputRef.current.style.height = "auto";

    const history = [...baseMessages.filter((m) => m.id !== "welcome" && m.status !== "error"), userMessage]
      .slice(-HISTORY_LIMIT)
      .map(({ role, content: text }) => ({ role, content: text }));

    setLoading(true);
    setMessages([...baseMessages, userMessage, { id: newId(), role: "assistant", content: "", status: "streaming" }]);

    const controller = new AbortController();
    abortRef.current = controller;
    let assistant = "";
    let frame = 0;
    const flush = () => {
      frame = 0;
      updateLast({ content: assistant });
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "The assistant is unavailable right now.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistant = canonicalizeContact(assistant + decoder.decode(value, { stream: true }), contact);
        if (!frame) frame = window.requestAnimationFrame(flush);
      }
      assistant = canonicalizeContact(assistant + decoder.decode(), contact);
      window.cancelAnimationFrame(frame);

      updateLast(
        assistant.trim()
          ? { content: assistant, status: undefined }
          : { content: `I couldn’t generate an answer just now. You can email Zoha at ${content.email}.`, status: "error" },
      );
    } catch (error) {
      window.cancelAnimationFrame(frame);
      if (controller.signal.aborted) {
        updateLast({ content: assistant ? `${assistant}\n\n(stopped)` : "Stopped.", status: undefined });
      } else {
        updateLast({
          content: error instanceof Error ? error.message : "Something went wrong. Please try again.",
          status: "error",
        });
      }
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  }

  function retry() {
    const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");
    if (lastUserIndex < 0) return;
    void send(messages[lastUserIndex].content, messages.slice(0, lastUserIndex));
  }

  function reset() {
    abortRef.current?.abort();
    setMessages([welcomeMessage(content.name, content.welcomeMessage)]);
    setInput("");
    window.sessionStorage.removeItem(STORAGE_KEY);
    inputRef.current?.focus();
  }

  const panelMotion = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18, scale: 0.97 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 10, scale: 0.98 },
        transition: { duration: 0.2, ease: [0.2, 0.8, 0.2, 1] as const },
      };

  const statusLabel = ready ? "Online" : "Connecting…";

  return (
    <div id="ask" className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open ? (
          <motion.section
            key="panel"
            {...panelMotion}
            role="dialog"
            aria-label="Ask about Zoha"
            className="chat-panel fixed inset-x-3 bottom-[5.5rem] flex h-[min(76vh,620px)] origin-bottom-right flex-col overflow-hidden rounded-[1.6rem] border border-[var(--border)] bg-[color-mix(in_oklab,var(--bg)_94%,var(--panel))] shadow-[0_24px_70px_-28px_rgba(0,0,0,0.55)] sm:static sm:inset-auto sm:h-[min(72vh,580px)] sm:w-[380px]"
          >
            <header className="flex items-center gap-3 border-b border-[var(--border)] bg-[color-mix(in_oklab,var(--panel)_78%,transparent)] px-4 py-3 backdrop-blur-md">
              <div className="relative">
                <Image src={content.avatar} alt="" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--bg)]",
                    loading ? "bg-[var(--accent)]" : "bg-emerald-400",
                  )}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{content.name.split(" ")[0]}’s AI</p>
                <p className="truncate text-[11px] text-[var(--muted)]">{statusLabel}</p>
              </div>
              {hasConversation ? (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] hover:text-[var(--fg)]"
                  aria-label="Start a new chat"
                  title="New chat"
                >
                  <Icon name="reset" />
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 text-[var(--muted)] transition hover:bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] hover:text-[var(--fg)]"
                aria-label="Close chat"
              >
                <Icon name="close" />
              </button>
            </header>

            <div
              ref={scrollRef}
              onScroll={(event) => {
                const el = event.currentTarget;
                stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
              }}
              className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
              aria-live="polite"
            >
              {messages.map((message, index) => {
                const isLast = index === messages.length - 1;
                if (message.role === "user") {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[86%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--accent)] px-3.5 py-2 text-sm leading-relaxed text-[var(--accent-fg)]">
                        {message.content}
                      </div>
                    </div>
                  );
                }
                const streaming = message.status === "streaming";
                return (
                  <div key={message.id} className="group flex gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--accent)]">
                      <Icon name="spark" className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0 max-w-[88%]">
                      <div
                        className={cn(
                          "overflow-hidden break-words rounded-2xl rounded-tl-md border px-3.5 py-2.5 text-sm leading-relaxed",
                          message.status === "error"
                            ? "border-red-500/30 bg-red-500/10 text-[var(--fg)]"
                            : "border-[var(--border)] bg-[var(--panel)] text-[color-mix(in_oklab,var(--fg)_88%,var(--muted))]",
                        )}
                      >
                        {streaming && !message.content ? (
                          <TypingDots />
                        ) : (
                          <>
                            <ChatMarkdown text={message.content} contact={contact} />
                            {streaming ? <span className="chat-caret" aria-hidden /> : null}
                          </>
                        )}
                      </div>
                      {!streaming && message.id !== "welcome" ? (
                        <div className="mt-1 flex items-center gap-2 pl-1">
                          {message.status === "error" && isLast ? (
                            <button
                              type="button"
                              onClick={retry}
                              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-[var(--accent)] hover:underline"
                            >
                              <Icon name="retry" className="h-3.5 w-3.5" />
                              Retry
                            </button>
                          ) : (
                            <CopyButton text={message.content} />
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}

              {!hasConversation ? (
                <div className="pt-3">
                  <p className="mb-2.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                    Try asking
                  </p>
                  <div className="flex flex-col gap-2">
                    {starters.map((starter) => (
                      <button
                        key={starter.question}
                        type="button"
                        onClick={() => void send(starter.question)}
                        className="group flex w-full items-start gap-3 rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--panel)_70%,transparent)] px-3.5 py-3 text-left transition hover:-translate-y-0.5 hover:border-[var(--accent)] hover:bg-[color-mix(in_oklab,var(--accent)_10%,var(--panel))]"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--accent)]">
                          <Icon name={starter.kind} className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold leading-snug text-[var(--fg)]">
                            {starter.title}
                          </span>
                          <span className="mt-0.5 block text-[12px] leading-relaxed text-[var(--muted)]">
                            {starter.detail}
                          </span>
                        </span>
                        <Icon
                          name="send"
                          className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="border-t border-[var(--border)] p-3">
              {followUps.length ? (
                <div className="mb-2.5 flex flex-wrap gap-1.5">
                  {followUps.map((idea) => (
                    <button
                      key={idea.question}
                      type="button"
                      onClick={() => void send(idea.question)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--panel)_60%,transparent)] px-3 py-1.5 text-xs font-medium text-[var(--fg)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      {idea.title}
                      <Icon name="send" className="h-3 w-3 text-[var(--muted)]" />
                    </button>
                  ))}
                </div>
              ) : null}
              <form
                className="flex items-end gap-2 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--panel)_70%,transparent)] py-1 pl-4 pr-1 transition focus-within:border-[var(--accent)]"
                onSubmit={(event) => {
                  event.preventDefault();
                  void send(input);
                }}
              >
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={2000}
                  onChange={(event) => {
                    setInput(event.target.value);
                    const el = event.target;
                    el.style.height = "auto";
                    el.style.height = `${Math.min(el.scrollHeight, 88)}px`;
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      void send(input);
                    }
                  }}
                  placeholder="Ask a question"
                  aria-label="Your question"
                  className="max-h-[88px] min-h-[36px] flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-[var(--muted)]"
                />
                {loading ? (
                  <button
                    type="button"
                    onClick={() => abortRef.current?.abort()}
                    className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--muted)] transition hover:text-[var(--fg)]"
                    aria-label="Stop generating"
                  >
                    <Icon name="stop" className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] transition hover:brightness-110 disabled:opacity-35"
                    aria-label="Send"
                  >
                    <Icon name="send" className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Ask my AI assistant"}
        className="group flex items-center gap-2.5 rounded-full border border-[color-mix(in_oklab,var(--accent)_45%,var(--border))] bg-[var(--bg)] py-1.5 pl-1.5 pr-4 text-sm font-medium shadow-lg shadow-[var(--glow)] transition hover:-translate-y-0.5 hover:border-[var(--accent)]"
      >
        <span className="relative">
          <Image src={content.avatar} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" />
          {!open ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-[var(--bg)] bg-[var(--accent)]" />
            </span>
          ) : null}
        </span>
        {open ? <Icon name="close" className="mr-1 h-4 w-4" /> : "Ask my AI"}
      </button>
    </div>
  );
}
