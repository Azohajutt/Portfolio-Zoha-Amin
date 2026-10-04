import { requireAdmin } from "@/lib/admin";
import { revalidatePortfolio } from "@/lib/admin-revalidate";
import { siteContent } from "@/lib/content";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

function parseSkills(value: FormDataEntryValue | null) {
  return String(value || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function saveSkillGroup(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createServiceClient();
  const id = String(formData.get("id") || "");
  const payload = {
    name: String(formData.get("name") || ""),
    skills: parseSkills(formData.get("skills")),
    sort_order: Number(formData.get("sort_order") || 0),
    visible: formData.get("visible") === "on",
  };

  if (id) {
    const { error } = await supabase.from("skill_groups").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("skill_groups").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePortfolio();
}

async function deleteSkillGroup(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = createServiceClient();
  const { error } = await supabase.from("skill_groups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePortfolio();
}

export default async function AdminSkillsPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase.from("skill_groups").select("*").order("sort_order", { ascending: true });

  const groups =
    data?.length
      ? data
      : siteContent.skillGroups.map((group, index) => ({
          id: "",
          name: group.name,
          skills: group.skills,
          sort_order: index,
          visible: true,
        }));

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Skills</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Edit skill groups. Put skills on separate lines or separate them with commas.</p>
      </section>

      {groups.map((group) => (
        <div key={group.id || group.name} className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <form action={saveSkillGroup} className="space-y-3">
            <input type="hidden" name="id" value={group.id || ""} />
            <label className="block text-sm">
              Group name
              <input
                name="name"
                defaultValue={group.name}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-sm">
              Skills
              <textarea
                name="skills"
                rows={5}
                defaultValue={(group.skills as string[]).join("\n")}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-sm">
              Sort order
              <input
                name="sort_order"
                type="number"
                defaultValue={group.sort_order}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="visible" defaultChecked={group.visible !== false} />
              Visible
            </label>
            <Button type="submit">{group.id ? "Save group" : "Create from seed values"}</Button>
          </form>
          {group.id ? (
            <form action={deleteSkillGroup} className="mt-3">
              <input type="hidden" name="id" value={group.id} />
              <Button type="submit" variant="secondary" className="border-red-500/40 text-red-300">
                Delete
              </Button>
            </form>
          ) : null}
        </div>
      ))}

      <form action={saveSkillGroup} className="space-y-3 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-5">
        <h3 className="font-medium">Add skill group</h3>
        <input type="hidden" name="id" value="" />
        <label className="block text-sm">
          Group name
          <input
            name="name"
            required
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          Skills
          <textarea
            name="skills"
            rows={4}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          Sort order
          <input
            name="sort_order"
            type="number"
            defaultValue={groups.length}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="visible" defaultChecked />
          Visible
        </label>
        <Button type="submit">Add group</Button>
      </form>
    </div>
  );
}
