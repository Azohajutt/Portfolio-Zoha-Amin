import type { SiteContent } from "@/types/content";

export type ChunkSource =
  | "profile"
  | "experience"
  | "project"
  | "skills"
  | "education"
  | "certification"
  | "contact";

export type KnowledgeChunk = {
  id: string;
  source: ChunkSource;
  title: string;
  text: string;
};

function compact(parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join("\n");
}

/** Turn live portfolio data into retrievable documents. No answers — only facts. */
export function buildKnowledgeChunks(content: SiteContent): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [
    {
      id: "profile",
      source: "profile",
      title: `${content.name} — profile`,
      text: compact([
        `Name: ${content.name}`,
        `Headline: ${content.headline}`,
        content.positioning && `Positioning: ${content.positioning}`,
        content.summary && `Summary: ${content.summary}`,
        `Location: ${content.location}`,
        content.stats.length ? `Published stats: ${content.stats.map((stat) => `${stat.value} ${stat.label}`).join(" · ")}` : undefined,
      ]),
    },
  ];

  content.experiences.forEach((job, index) => {
    chunks.push({
      id: `experience-${index}`,
      source: "experience",
      title: `${job.role} at ${job.company}`,
      text: compact([
        `Company: ${job.company}`,
        `Role: ${job.role}`,
        `Dates: ${job.start} – ${job.end ?? "Present"}`,
        `Location: ${job.location}`,
        "Highlights:",
        ...job.highlights.map((item) => `- ${item}`),
      ]),
    });
  });

  content.projects.forEach((project) => {
    chunks.push({
      id: `project-${project.slug}`,
      source: "project",
      title: project.title,
      text: compact([
        `Title: ${project.title}`,
        `Tagline: ${project.tagline}`,
        `Tier: ${project.tier}`,
        `Problem: ${project.problem}`,
        `Solution: ${project.solution}`,
        `Impact: ${project.impact}`,
        `Technologies: ${project.tech.join(", ")}`,
        project.demoUrl && `Live demo: ${project.demoUrl}`,
        project.repoUrl && `Source: ${project.repoUrl}`,
        project.confidential && "Note: some details are confidential.",
        project.diagram?.engine && `Architecture engine: ${project.diagram.engine}`,
        project.diagram?.lanes?.length ? `Architecture lanes: ${project.diagram.lanes.join(" → ")}` : undefined,
      ]),
    });
  });

  if (content.skillGroups.length) {
    chunks.push({
      id: "skills",
      source: "skills",
      title: "Skills and technologies",
      text: content.skillGroups.map((group) => `${group.name}: ${group.skills.join(", ")}`).join("\n"),
    });
  }

  const edu = content.education;
  if (edu.degree || edu.institution) {
    chunks.push({
      id: "education",
      source: "education",
      title: "Education",
      text: compact([
        edu.degree && `Degree: ${edu.degree}`,
        edu.institution && `Institution: ${edu.institution}`,
        edu.years && `Years: ${edu.years}`,
        edu.grade && `Grade: ${edu.grade}`,
      ]),
    });
  }

  if (content.certifications.length) {
    chunks.push({
      id: "certifications",
      source: "certification",
      title: "Certifications",
      text: content.certifications
        .map((cert) => `- ${cert.name}${cert.issuer ? ` (${cert.issuer})` : ""}`)
        .join("\n"),
    });
  }

  chunks.push({
    id: "contact",
    source: "contact",
    title: "Contact",
    text: compact([
      `Email: ${content.email}`,
      content.phone && `Phone: ${content.phone}`,
      `LinkedIn: ${content.linkedin}`,
      `GitHub: ${content.github}`,
      `Location: ${content.location}`,
      "Resume: available as Download resume on the site header. Do not invent a file path.",
    ]),
  });

  return chunks.filter((chunk) => chunk.text.trim().length > 0);
}

export function fingerprintChunks(chunks: KnowledgeChunk[]) {
  return chunks.map((chunk) => `${chunk.id}:${chunk.text.length}:${chunk.text.slice(0, 48)}`).join("|");
}
