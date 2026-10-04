import type { SiteContent } from "@/types/content";

export function Skills({ content }: { content: SiteContent }) {
  return (
    <section id="skills" className="section-pad border-y border-[var(--border)]">
      <div className="container-page">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Skills</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Grouped the way the work is done</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {content.skillGroups.map((group) => (
            <div key={group.name} className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5">
              <h3 className="font-medium">{group.name}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <li key={skill} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]">
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
