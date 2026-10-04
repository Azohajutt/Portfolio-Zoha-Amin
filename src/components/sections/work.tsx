import Link from "next/link";
import type { SiteContent } from "@/types/content";
import { SystemVisualizer } from "@/components/diagrams/system-visualizer";

export function Work({ content }: { content: SiteContent }) {
  const flagship = content.projects.filter((p) => p.tier === "flagship");
  const range = content.projects.filter((p) => p.tier === "range");

  return (
    <section id="work" className="section-pad">
      <div className="container-page">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Featured work</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance">
            Production systems first, then the broader stack
          </h2>
          <p className="mt-3 text-[var(--muted)] text-pretty">
            Each build has its own animated architecture — the real data flow, decision points, and feedback loops — with
            scenarios you can step through. Open any case study for the problem, solution, and impact.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          <div className="mb-2 flex items-end justify-between gap-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--muted)]">Lead systems</h3>
            <p className="text-xs text-[var(--muted)]">{flagship.length} spotlight projects</p>
          </div>

          {flagship.map((project, index) => {
            const titleParts = project.title.split(/\s+/);
            const accentWord = titleParts[0] || "";
            const restTitle = titleParts.slice(1).join(" ");

            return (
              <article
                key={project.slug}
                className="rounded-[1.8rem] border border-[var(--border)] bg-[color-mix(in_oklab,var(--panel)_55%,transparent)] p-4 lg:p-5"
              >
                <SystemVisualizer diagram={project.diagram} title={project.title} />
                <div className="mt-5 grid gap-6 px-1 lg:grid-cols-[1.1fr_0.9fr]">
                  <div>
                    <p className="font-mono text-xs text-[var(--muted)]">
                      {String(index + 1).padStart(2, "0")} · AI SYSTEM
                    </p>
                    <h3 className="mt-3 text-3xl font-semibold tracking-tight uppercase sm:text-4xl">
                      <span className="text-[var(--accent)]">{accentWord}</span>
                      {restTitle ? <span className="text-[var(--fg)]"> {restTitle}</span> : null}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-[15px]">
                      {project.solution}
                    </p>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-[var(--border)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <Link
                        href={`/work/${project.slug}`}
                        className="text-sm font-medium text-[var(--accent)] transition hover:translate-x-0.5"
                      >
                        View case study →
                      </Link>
                      {project.demoUrl ? (
                        <a
                          href={project.demoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-[var(--muted)] hover:text-[var(--fg)]"
                        >
                          View live
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-14">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-[var(--muted)]">More systems</h3>
            <p className="text-xs text-[var(--muted)]">{range.length} projects</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {range.map((project, index) => (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className="group flex h-full flex-col rounded-[1.4rem] border border-[var(--border)] bg-[color-mix(in_oklab,var(--panel)_75%,transparent)] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[var(--accent)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-[var(--muted)] opacity-0 transition group-hover:opacity-100">
                    Open →
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-semibold tracking-tight transition group-hover:text-[var(--accent)]">
                  {project.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted)]">{project.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.tech.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full border border-[var(--border)] px-2.5 py-1 text-[11px] text-[var(--muted)]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
