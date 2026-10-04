import { Fragment, type ReactNode } from "react";
import { canonicalizeContact, canonicalizeEmails, type ChatContact } from "@/lib/chat-contact";

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\((?:https?:\/\/|mailto:|\/)[^)\s]+\)|https?:\/\/[^\s)]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g;

function linkClass() {
  return "font-medium text-[var(--accent)] underline decoration-[color-mix(in_oklab,var(--accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--accent)]";
}

function emailClass() {
  return `${linkClass()} inline-block max-w-full break-keep`;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(INLINE)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > last) out.push(text.slice(last, start));
    const key = `${keyPrefix}-${index++}`;

    if (token.startsWith("**")) {
      out.push(
        <strong key={key} className="font-semibold text-[var(--fg)]">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      out.push(
        <code key={key} className="rounded bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] px-1 py-0.5 font-mono text-[0.85em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      const isResume = /resume|\.pdf$/i.test(href) || /resume|\bcv\b/i.test(label);
      if (isResume) {
        out.push(
          <span key={key} className="font-medium text-[var(--fg)]">
            Download resume in the header
          </span>,
        );
      } else if (href.startsWith("mailto:")) {
        const address = href.replace(/^mailto:/i, "").split("?")[0];
        out.push(
          <a key={key} href={href} className={emailClass()}>
            {address}
          </a>,
        );
      } else {
        out.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={linkClass()}>
            {label}
          </a>,
        );
      }
    } else if (token.startsWith("http")) {
      const clean = token.replace(/[.,;:]+$/, "");
      out.push(
        <a key={key} href={clean} target="_blank" rel="noopener noreferrer" className={linkClass()}>
          {clean.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>,
      );
      if (clean.length < token.length) out.push(token.slice(clean.length));
    } else {
      const address = token.replace(/[.,;:]+$/, "");
      out.push(
        <a key={key} href={`mailto:${address}`} className={emailClass()}>
          {address}
        </a>,
      );
      if (address.length < token.length) out.push(token.slice(address.length));
    }
    last = start + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { type: "p"; lines: string[] }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "h"; text: string }
  | { type: "code"; lang: string; text: string };

function toBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let fence: { lang: string; lines: string[] } | null = null;

  for (const raw of source.split("\n")) {
    const line = raw.trimEnd();
    const fenceOpen = line.match(/^```(\w*)$/);
    if (fence) {
      if (line.startsWith("```")) {
        blocks.push({ type: "code", lang: fence.lang, text: fence.lines.join("\n") });
        fence = null;
      } else {
        fence.lines.push(raw);
      }
      continue;
    }
    if (fenceOpen) {
      fence = { lang: fenceOpen[1] || "", lines: [] };
      continue;
    }

    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
    const prev = blocks[blocks.length - 1];

    if (!line.trim()) {
      blocks.push({ type: "p", lines: [] });
    } else if (heading) {
      blocks.push({ type: "h", text: heading[1] });
    } else if (bullet) {
      if (prev?.type === "ul") prev.items.push(bullet[1]);
      else blocks.push({ type: "ul", items: [bullet[1]] });
    } else if (numbered) {
      if (prev?.type === "ol") prev.items.push(numbered[1]);
      else blocks.push({ type: "ol", items: [numbered[1]] });
    } else if (prev?.type === "p") {
      prev.lines.push(line);
    } else {
      blocks.push({ type: "p", lines: [line] });
    }
  }
  if (fence) blocks.push({ type: "code", lang: fence.lang, text: fence.lines.join("\n") });
  return blocks.filter((block) => block.type !== "p" || block.lines.length > 0);
}

function withoutResumeDump(text: string) {
  return text
    .replace(/\[[^\]]*resume[^\]]*\]\((?:https?:\/\/|\/)[^)\s]+\)/gi, "Download resume in the header")
    .replace(/(?:https?:\/\/[^\s)]+)?\/resume\/[^\s)]+/gi, "Download resume in the header");
}

export function ChatMarkdown({ text, contact, email }: { text: string; contact?: ChatContact; email?: string }) {
  const cleaned = contact
    ? canonicalizeContact(withoutResumeDump(text), contact)
    : canonicalizeEmails(withoutResumeDump(text), email);
  const blocks = toBlocks(cleaned);
  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        const key = `b-${i}`;
        if (block.type === "code") {
          return (
            <pre key={key} className="overflow-x-auto rounded-xl bg-[color-mix(in_oklab,var(--fg)_8%,transparent)] px-3 py-2 text-[12px] leading-relaxed">
              <code>{block.text}</code>
            </pre>
          );
        }
        if (block.type === "h") {
          return (
            <p key={key} className="font-semibold text-[var(--fg)]">
              {renderInline(block.text, key)}
            </p>
          );
        }
        if (block.type === "ul" || block.type === "ol") {
          const List = block.type === "ul" ? "ul" : "ol";
          return (
            <List
              key={key}
              className={block.type === "ul" ? "space-y-1.5 pl-1" : "list-decimal space-y-1.5 pl-5 marker:text-[var(--muted)]"}
            >
              {block.items.map((item, j) => (
                <li key={`${key}-${j}`} className={block.type === "ul" ? "flex gap-2" : undefined}>
                  {block.type === "ul" ? (
                    <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                  ) : null}
                  <span>{renderInline(item, `${key}-${j}`)}</span>
                </li>
              ))}
            </List>
          );
        }
        if (block.type !== "p") return null;
        return (
          <p key={key}>
            {block.lines.map((line, j) => (
              <Fragment key={`${key}-${j}`}>
                {j > 0 ? <br /> : null}
                {renderInline(line, `${key}-${j}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
