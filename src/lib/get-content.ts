import { siteContent } from "@/lib/content";
import { defaultDiagram, normalizeDiagram } from "@/lib/diagram";
import { projectDiagrams } from "@/lib/project-diagrams";
import { createServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/server";
import type { SiteContent } from "@/types/content";

function pickText(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function resolveDiagram(slug: string, diagram: unknown, title: string) {
  const live = normalizeDiagram(diagram, title);
  if (diagram && live.nodes.length) return live;
  return projectDiagrams[slug] ?? live ?? defaultDiagram(title);
}

export async function getLiveContent(): Promise<SiteContent> {
  if (!hasSupabaseServiceConfig()) return siteContent;

  try {
    const supabase = createServiceClient();
    const [
      { data: settings },
      { data: stats },
      { data: experiences },
      { data: projects },
      { data: skillGroups },
      { data: education },
      { data: certifications },
    ] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle(),
      supabase.from("stats").select("*").eq("visible", true).order("sort_order"),
      supabase.from("experiences").select("*").eq("visible", true).eq("status", "published").order("sort_order"),
      supabase.from("projects").select("*").eq("visible", true).eq("status", "published").order("sort_order"),
      supabase.from("skill_groups").select("*").eq("visible", true).order("sort_order"),
      supabase.from("education").select("*").limit(1).maybeSingle(),
      supabase.from("certifications").select("*").eq("visible", true).order("sort_order"),
    ]);

    if (!settings) return siteContent;

    return {
      name: pickText(settings.name, siteContent.name) || siteContent.name,
      headline: pickText(settings.headline, siteContent.headline),
      positioning: pickText(settings.positioning, siteContent.positioning),
      summary: pickText(settings.summary, siteContent.summary),
      location: pickText(settings.location, siteContent.location),
      email: pickText(settings.email, siteContent.email).trim() || siteContent.email,
      phone: pickText(settings.phone, siteContent.phone),
      avatar: pickText(settings.avatar, siteContent.avatar) || siteContent.avatar,
      resumePath: pickText(settings.resume_path, siteContent.resumePath) || siteContent.resumePath,
      github: pickText(settings.github, siteContent.github),
      linkedin: pickText(settings.linkedin, siteContent.linkedin),
      welcomeMessage: pickText((settings as { welcome_message?: string }).welcome_message, "") || undefined,
      stats: (stats?.length ? stats : siteContent.stats).map((s: { value: string; label: string }) => ({
        value: s.value,
        label: s.label,
      })),
      experiences: (experiences?.length ? experiences : siteContent.experiences).map(
        (job: {
          company: string;
          role: string;
          start_label?: string;
          start?: string;
          end_label?: string | null;
          end?: string | null;
          location: string;
          highlights: string[];
        }) => ({
          company: job.company,
          role: job.role,
          start: job.start_label || job.start || "",
          end: job.end_label ?? job.end ?? null,
          location: job.location,
          highlights: job.highlights,
        }),
      ),
      projects: (projects?.length ? projects : siteContent.projects).map((project) => {
        const row = project as {
          slug: string;
          title: string;
          tagline: string;
          tier: "flagship" | "range";
          problem: string;
          solution: string;
          impact: string;
          tech: string[];
          cover_image?: string | null;
          coverImage?: string;
          repo_url?: string | null;
          repoUrl?: string;
          demo_url?: string | null;
          demoUrl?: string;
          confidential?: boolean;
          diagram: SiteContent["projects"][number]["diagram"];
        };
        return {
          slug: row.slug,
          title: row.title,
          tagline: row.tagline,
          tier: row.tier,
          problem: row.problem,
          solution: row.solution,
          impact: row.impact,
          tech: row.tech,
          coverImage: row.cover_image || row.coverImage || undefined,
          repoUrl: row.repo_url || row.repoUrl || undefined,
          demoUrl: row.demo_url || row.demoUrl || undefined,
          confidential: Boolean(row.confidential),
          diagram: resolveDiagram(row.slug, row.diagram, row.title),
        };
      }),
      skillGroups: (skillGroups?.length ? skillGroups : siteContent.skillGroups).map(
        (group: { name: string; skills: string[] }) => ({
          name: group.name,
          skills: group.skills,
        }),
      ),
      education: education
        ? {
            institution: education.institution || "",
            degree: education.degree || "",
            years: education.years || "",
            grade: education.grade || "",
          }
        : siteContent.education,
      certifications: (certifications?.length ? certifications : siteContent.certifications).map(
        (cert: { name: string; issuer: string; url?: string | null }) => {
          const seed = siteContent.certifications.find((item) => item.name === cert.name);
          return {
            name: cert.name,
            issuer: cert.issuer || seed?.issuer || "",
            url: cert.url || seed?.url || undefined,
          };
        },
      ),
      chatStarters: Array.isArray(settings.chat_starters) && settings.chat_starters.length
        ? (settings.chat_starters as string[])
        : siteContent.chatStarters,
    };
  } catch (error) {
    console.error("getLiveContent fallback", error);
    return siteContent;
  }
}
