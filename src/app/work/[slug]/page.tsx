import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemVisualizer } from "@/components/diagrams/system-visualizer";
import { SiteHeader } from "@/components/site-header";
import { getLiveContent } from "@/lib/get-content";
import { Button } from "@/components/ui/button";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const content = await getLiveContent();
  return content.projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const content = await getLiveContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.tagline,
  };
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params;
  const content = await getLiveContent();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const titleParts = project.title.split(/\s+/);
  const accentWord = titleParts[0] || "";
  const restTitle = titleParts.slice(1).join(" ");

  return (
    <>
      <SiteHeader resumePath={content.resumePath} />
      <main className="section-pad pt-10">
        <div className="container-page">
          <Link href="/#work" className="text-sm text-[var(--muted)] hover:text-[var(--fg)]">
            ← Back to work
          </Link>

          <div className="mt-8 space-y-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                {project.tier === "flagship" ? "Flagship case study" : "Case study"}
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight uppercase sm:text-5xl">
                <span className="text-[var(--accent)]">{accentWord}</span>
                {restTitle ? <span> {restTitle}</span> : null}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">{project.solution}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noreferrer">
                    <Button>Live demo</Button>
                  </a>
                )}
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noreferrer">
                    <Button variant="secondary">View code</Button>
                  </a>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-md border border-[var(--border)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <SystemVisualizer diagram={project.diagram} title={project.title} />
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Problem", project.problem],
              ["Solution", project.solution],
              ["Impact", project.impact],
            ].map(([label, text]) => (
              <div key={label} className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">{label}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
