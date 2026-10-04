"use client";

import { useEffect, useRef, useState } from "react";
import type { SiteContent } from "@/types/content";
import { Button } from "@/components/ui/button";
import { INVALID_EMAIL_MESSAGE, isValidEmail } from "@/lib/validate";

export function Contact({ content }: { content: SiteContent }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "sent") return;
    const timer = window.setTimeout(() => setStatus("idle"), 4000);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const website = String(formData.get("website") || "");

    if (name.length < 2) {
      setStatus("error");
      setError("Please enter your name.");
      return;
    }
    if (!isValidEmail(email)) {
      setStatus("error");
      setError(INVALID_EMAIL_MESSAGE);
      return;
    }
    if (!message) {
      setStatus("error");
      setError("Please write a message.");
      return;
    }

    setStatus("sending");
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website }),
      });
      const text = await res.text();
      let data: { error?: string } = {};
      try {
        data = text ? (JSON.parse(text) as { error?: string }) : {};
      } catch {
        throw new Error("Could not send the message. Please email me instead.");
      }
      if (!res.ok) throw new Error(data.error || "Failed to send");
      form.reset();
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to send");
    }
  }

  return (
    <section id="contact" className="section-pad border-t border-[var(--border)]">
      <div className="container-page grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Contact</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Start a conversation</h2>
          <p className="mt-3 text-[var(--muted)]">
            Hiring managers and technical leads — email works best, or use the form. I reply from{" "}
            <a className="text-[var(--accent)]" href={`mailto:${content.email}`}>
              {content.email}
            </a>
            .
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <a className="rounded-full border border-[var(--border)] px-4 py-2" href={content.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
            <a className="rounded-full border border-[var(--border)] px-4 py-2" href={content.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a className="rounded-full border border-[var(--border)] px-4 py-2" href={`tel:${content.phone.replace(/\s/g, "")}`}>
              {content.phone}
            </a>
          </div>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onChange={() => {
            if (status === "sent" || status === "error") {
              setStatus("idle");
              setError("");
            }
          }}
          className="rounded-[1.6rem] border border-[var(--border)] bg-[var(--panel)] p-6"
          noValidate
        >
          <label className="block text-sm">
            Name
            <input
              required
              name="name"
              autoComplete="name"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="mt-4 block text-sm">
            Email
            <input
              required
              type="email"
              name="email"
              inputMode="email"
              autoComplete="email"
              placeholder="name@example.com"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="mt-4 block text-sm">
            Message
            <textarea
              required
              name="message"
              rows={5}
              placeholder="Write your message..."
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div className="mt-5 flex items-center gap-3">
            <Button type="submit" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : "Send message"}
            </Button>
            {status === "sent" && <p className="text-sm text-[var(--accent)]">Message received.</p>}
            {status === "error" && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </form>
      </div>
    </section>
  );
}
