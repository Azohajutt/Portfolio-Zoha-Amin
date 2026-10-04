import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { siteContent } from "../src/lib/content";

config({ path: ".env.local" });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const settingsPayload = {
    id: 1,
    name: siteContent.name,
    headline: siteContent.headline,
    positioning: siteContent.positioning,
    summary: siteContent.summary,
    location: siteContent.location,
    email: siteContent.email,
    phone: siteContent.phone,
    avatar: siteContent.avatar,
    resume_path: siteContent.resumePath,
    github: siteContent.github,
    linkedin: siteContent.linkedin,
    chat_starters: siteContent.chatStarters,
    welcome_message: siteContent.welcomeMessage ?? null,
  };
  let { error: settingsError } = await supabase.from("site_settings").upsert(settingsPayload);
  if (settingsError && /welcome_message/i.test(settingsError.message)) {
    const { welcome_message: _unused, ...withoutWelcome } = settingsPayload;
    ({ error: settingsError } = await supabase.from("site_settings").upsert(withoutWelcome));
  }
  if (settingsError) throw settingsError;

  await supabase.from("stats").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: statsError } = await supabase.from("stats").insert(
    siteContent.stats.map((stat, index) => ({
      value: stat.value,
      label: stat.label,
      sort_order: index,
      visible: true,
    })),
  );
  if (statsError) throw statsError;

  await supabase.from("experiences").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: expError } = await supabase.from("experiences").insert(
    siteContent.experiences.map((job, index) => ({
      company: job.company,
      role: job.role,
      start_label: job.start,
      end_label: job.end,
      location: job.location,
      highlights: job.highlights,
      sort_order: index,
      visible: true,
      status: "published",
    })),
  );
  if (expError) throw expError;

  await supabase.from("projects").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: projectError } = await supabase.from("projects").insert(
    siteContent.projects.map((project, index) => ({
      slug: project.slug,
      title: project.title,
      tagline: project.tagline,
      tier: project.tier,
      problem: project.problem,
      solution: project.solution,
      impact: project.impact,
      tech: project.tech,
      cover_image: project.coverImage ?? null,
      repo_url: project.repoUrl ?? null,
      demo_url: project.demoUrl ?? null,
      confidential: project.confidential,
      diagram: project.diagram,
      sort_order: index,
      visible: true,
      status: "published",
    })),
  );
  if (projectError) throw projectError;

  await supabase.from("skill_groups").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: skillError } = await supabase.from("skill_groups").insert(
    siteContent.skillGroups.map((group, index) => ({
      name: group.name,
      skills: group.skills,
      sort_order: index,
      visible: true,
    })),
  );
  if (skillError) throw skillError;

  await supabase.from("education").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: eduError } = await supabase.from("education").insert({
    institution: siteContent.education.institution,
    degree: siteContent.education.degree,
    years: siteContent.education.years,
    grade: siteContent.education.grade,
  });
  if (eduError) throw eduError;

  await supabase.from("certifications").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { error: certError } = await supabase.from("certifications").insert(
    siteContent.certifications.map((cert, index) => ({
      name: cert.name,
      issuer: cert.issuer,
      sort_order: index,
      visible: true,
    })),
  );
  if (certError) throw certError;

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
