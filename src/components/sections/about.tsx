import type { SiteContent } from "@/types/content";

export function About({ content }: { content: SiteContent }) {
  return (
    <section id="about" className="section-pad">
      <div className="container-page grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">About</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Built for production conversations</h2>
        </div>
        <p className="max-w-3xl text-lg leading-relaxed text-[var(--muted)] text-pretty">{content.summary}</p>
      </div>
    </section>
  );
}
