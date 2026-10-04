import type { SiteContent } from "@/types/content";

export function Education({ content }: { content: SiteContent }) {
  const edu = content.education;
  const hasEducation = Boolean(edu.degree || edu.institution || edu.years || edu.grade);
  const meta = [edu.years, edu.grade].filter(Boolean).join(" · ");
  const hasCerts = content.certifications.length > 0;

  if (!hasEducation && !hasCerts) return null;

  return (
    <section id="education" className="section-pad">
      <div className="container-page grid gap-8 lg:grid-cols-2">
        {hasEducation ? (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Education</p>
            {edu.degree ? (
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{edu.degree}</h2>
            ) : null}
            {edu.institution ? <p className="mt-3 text-[var(--muted)]">{edu.institution}</p> : null}
            {meta ? <p className="mt-1 text-sm text-[var(--muted)]">{meta}</p> : null}
          </div>
        ) : null}
        {hasCerts ? (
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">Certifications</p>
            <ul className="mt-4 space-y-3">
              {content.certifications.map((cert) => {
                const body = (
                  <>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-sm text-[var(--muted)]">{cert.issuer}</p>
                    {cert.url ? (
                      <p className="mt-1 text-xs text-[var(--accent)]">View certificate →</p>
                    ) : null}
                  </>
                );

                return (
                  <li key={cert.name}>
                    {cert.url ? (
                      <a
                        href={cert.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3 transition hover:border-[var(--accent)]"
                      >
                        {body}
                      </a>
                    ) : (
                      <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
                        {body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
