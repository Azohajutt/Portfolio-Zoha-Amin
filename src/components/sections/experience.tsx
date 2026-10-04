import type { SiteContent } from "@/types/content";

export function Experience({ content }: { content: SiteContent }) {
  return (
    <section id="experience" className="section-pad border-y border-[var(--border)]">
      <div className="container-page">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Experience</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Where the systems shipped</h2>
        <ol className="mt-10 space-y-8">
          {content.experiences.map((job) => (
            <li key={`${job.company}-${job.start}`} className="grid gap-4 border-l border-[var(--border)] pl-6 md:grid-cols-[220px_1fr]">
              <div>
                <p className="font-medium">{job.company}</p>
                <p className="text-sm text-[var(--muted)]">{job.role}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  {job.start} – {job.end ?? "Present"}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">{job.location}</p>
              </div>
              <ul className="space-y-3 text-sm leading-relaxed text-[var(--muted)]">
                {job.highlights.map((item) => (
                  <li key={item.slice(0, 48)} className="relative pl-4 before:absolute before:left-0 before:top-2 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--accent)]">
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
