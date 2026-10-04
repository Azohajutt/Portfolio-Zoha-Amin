import { requireAdmin } from "@/lib/admin";
import { revalidatePortfolio } from "@/lib/admin-revalidate";
import { siteContent } from "@/lib/content";
import { defaultDiagram } from "@/lib/diagram";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

function parseList(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function saveProject(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createServiceClient();
  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "");
  const slug = String(formData.get("slug") || "").trim() || slugify(title);
  const payload = {
    slug,
    title,
    tagline: String(formData.get("tagline") || ""),
    tier: String(formData.get("tier") || "range") === "flagship" ? "flagship" : "range",
    problem: String(formData.get("problem") || ""),
    solution: String(formData.get("solution") || ""),
    impact: String(formData.get("impact") || ""),
    tech: parseList(formData.get("tech")),
    repo_url: String(formData.get("repo_url") || "") || null,
    demo_url: String(formData.get("demo_url") || "") || null,
    cover_image: String(formData.get("cover_image") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
    visible: formData.get("visible") === "on",
    status: formData.get("published") === "on" ? "published" : "draft",
  };

  if (id) {
    const { error } = await supabase.from("projects").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("projects").insert({
      ...payload,
      diagram: defaultDiagram(payload.title),
      confidential: false,
    });
    if (error) throw new Error(error.message);
  }
  revalidatePortfolio();
}

async function deleteProject(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = createServiceClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePortfolio();
}

export default async function AdminProjectsPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
  const projects = data?.length
    ? data
    : siteContent.projects.map((project, index) => ({
        id: "",
        slug: project.slug,
        title: project.title,
        tagline: project.tagline,
        tier: project.tier,
        problem: project.problem,
        solution: project.solution,
        impact: project.impact,
        tech: project.tech,
        repo_url: project.repoUrl || "",
        demo_url: project.demoUrl || "",
        cover_image: project.coverImage || "",
        visible: true,
        status: "published",
        sort_order: index,
      }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Edit case studies, links, visibility, and publish state.</p>
      </div>

      {projects.map((project) => (
        <div key={project.id || project.slug} className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <form action={saveProject} className="space-y-3">
            <input type="hidden" name="id" value={project.id || ""} />
            {[
              ["title", "Title", project.title],
              ["slug", "Slug", project.slug],
              ["tagline", "Tagline", project.tagline],
              ["repo_url", "Repo URL", project.repo_url || ""],
              ["demo_url", "Demo URL", project.demo_url || ""],
              ["cover_image", "Cover image path", project.cover_image || ""],
              ["sort_order", "Sort order", String(project.sort_order)],
            ].map(([name, label, value]) => (
              <label key={name} className="block text-sm">
                {label}
                <input
                  name={name}
                  type={name === "sort_order" ? "number" : "text"}
                  defaultValue={String(value ?? "")}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>
            ))}
            <label className="block text-sm">
              Tier
              <select
                name="tier"
                defaultValue={project.tier}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
              >
                <option value="flagship">Flagship</option>
                <option value="range">Range</option>
              </select>
            </label>
            {(["problem", "solution", "impact"] as const).map((field) => (
              <label key={field} className="block text-sm capitalize">
                {field}
                <textarea
                  name={field}
                  defaultValue={project[field]}
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>
            ))}
            <label className="block text-sm">
              Tech (comma or new line)
              <textarea
                name="tech"
                rows={3}
                defaultValue={(project.tech as string[]).join("\n")}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="visible" defaultChecked={project.visible !== false} />
                Visible
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="published" defaultChecked={project.status !== "draft"} />
                Published
              </label>
            </div>
            <Button type="submit">{project.id ? "Save project" : "Create from seed values"}</Button>
          </form>
          {project.id ? (
            <form action={deleteProject} className="mt-3">
              <input type="hidden" name="id" value={project.id} />
              <Button type="submit" variant="secondary" className="border-red-500/40 text-red-300">
                Delete
              </Button>
            </form>
          ) : null}
        </div>
      ))}

      <form action={saveProject} className="space-y-3 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-5">
        <h3 className="font-medium">Add project</h3>
        <input type="hidden" name="id" value="" />
        {[
          ["title", "Title"],
          ["slug", "Slug (optional)"],
          ["tagline", "Tagline"],
          ["repo_url", "Repo URL"],
          ["demo_url", "Demo URL"],
          ["cover_image", "Cover image path"],
        ].map(([name, label]) => (
          <label key={name} className="block text-sm">
            {label}
            <input
              name={name}
              required={name === "title" || name === "tagline"}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
        ))}
        <label className="block text-sm">
          Tier
          <select
            name="tier"
            defaultValue="range"
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
          >
            <option value="flagship">Flagship</option>
            <option value="range">Range</option>
          </select>
        </label>
        {(["problem", "solution", "impact"] as const).map((field) => (
          <label key={field} className="block text-sm capitalize">
            {field}
            <textarea
              name={field}
              rows={3}
              required
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
        ))}
        <label className="block text-sm">
          Tech
          <textarea
            name="tech"
            rows={3}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          Sort order
          <input
            name="sort_order"
            type="number"
            defaultValue={projects.length}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="visible" defaultChecked />
            Visible
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="published" defaultChecked />
            Published
          </label>
        </div>
        <Button type="submit">Add project</Button>
      </form>
    </div>
  );
}
