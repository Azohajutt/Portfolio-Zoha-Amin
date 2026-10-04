import { requireAdmin } from "@/lib/admin";
import { revalidatePortfolio } from "@/lib/admin-revalidate";
import { siteContent } from "@/lib/content";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

function parseHighlights(value: FormDataEntryValue | null) {
  return String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function saveExperience(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createServiceClient();
  const id = String(formData.get("id") || "");
  const endLabel = String(formData.get("end_label") || "").trim();
  const payload = {
    company: String(formData.get("company") || ""),
    role: String(formData.get("role") || ""),
    start_label: String(formData.get("start_label") || ""),
    end_label: endLabel || null,
    location: String(formData.get("location") || ""),
    highlights: parseHighlights(formData.get("highlights")),
    sort_order: Number(formData.get("sort_order") || 0),
    visible: formData.get("visible") === "on",
    status: formData.get("published") === "on" ? "published" : "draft",
  };

  if (id) {
    const { error } = await supabase.from("experiences").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("experiences").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePortfolio();
}

async function deleteExperience(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = createServiceClient();
  const { error } = await supabase.from("experiences").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePortfolio();
}

export default async function AdminExperiencePage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase.from("experiences").select("*").order("sort_order", { ascending: true });

  const experiences =
    data?.length
      ? data
      : siteContent.experiences.map((job, index) => ({
          id: "",
          company: job.company,
          role: job.role,
          start_label: job.start,
          end_label: job.end,
          location: job.location,
          highlights: job.highlights,
          sort_order: index,
          visible: true,
          status: "published",
        }));

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Experience</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Edit roles, dates, and bullet points. One highlight per line.</p>
      </section>

      {experiences.map((job) => (
        <div key={job.id || `${job.company}-${job.start_label}`} className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <form action={saveExperience} className="space-y-3">
            <input type="hidden" name="id" value={job.id || ""} />
            {[
              ["company", "Company", job.company],
              ["role", "Role", job.role],
              ["start_label", "Start", job.start_label],
              ["end_label", "End (leave blank for Present)", job.end_label || ""],
              ["location", "Location", job.location],
              ["sort_order", "Sort order", String(job.sort_order)],
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
              Highlights (one per line)
              <textarea
                name="highlights"
                rows={6}
                defaultValue={(job.highlights as string[]).join("\n")}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="visible" defaultChecked={job.visible !== false} />
                Visible
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="published" defaultChecked={job.status !== "draft"} />
                Published
              </label>
            </div>
            <Button type="submit">{job.id ? "Save experience" : "Create from seed values"}</Button>
          </form>
          {job.id ? (
            <form action={deleteExperience} className="mt-3">
              <input type="hidden" name="id" value={job.id} />
              <Button type="submit" variant="secondary" className="border-red-500/40 text-red-300">
                Delete
              </Button>
            </form>
          ) : null}
        </div>
      ))}

      <form action={saveExperience} className="space-y-3 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-5">
        <h3 className="font-medium">Add experience</h3>
        <input type="hidden" name="id" value="" />
        {[
          ["company", "Company"],
          ["role", "Role"],
          ["start_label", "Start"],
          ["end_label", "End (leave blank for Present)"],
          ["location", "Location"],
        ].map(([name, label]) => (
          <label key={name} className="block text-sm">
            {label}
            <input
              name={name}
              required={name !== "end_label"}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
        ))}
        <label className="block text-sm">
          Sort order
          <input
            name="sort_order"
            type="number"
            defaultValue={experiences.length}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          Highlights (one per line)
          <textarea
            name="highlights"
            rows={5}
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
        <Button type="submit">Add experience</Button>
      </form>
    </div>
  );
}
