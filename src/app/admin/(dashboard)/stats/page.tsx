import { requireAdmin } from "@/lib/admin";
import { revalidatePortfolio } from "@/lib/admin-revalidate";
import { siteContent } from "@/lib/content";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

async function saveStat(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createServiceClient();
  const id = String(formData.get("id") || "");
  const payload = {
    value: String(formData.get("value") || ""),
    label: String(formData.get("label") || ""),
    sort_order: Number(formData.get("sort_order") || 0),
    visible: formData.get("visible") === "on",
  };

  if (id) {
    const { error } = await supabase.from("stats").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("stats").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePortfolio();
}

async function deleteStat(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = createServiceClient();
  const { error } = await supabase.from("stats").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePortfolio();
}

export default async function AdminStatsPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase.from("stats").select("*").order("sort_order", { ascending: true });

  const stats =
    data?.length
      ? data
      : siteContent.stats.map((stat, index) => ({
          id: "",
          value: stat.value,
          label: stat.label,
          sort_order: index,
          visible: true,
        }));

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Hero stats</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">These are the numbers under the hero (languages, calls/day, CRMs, VoIP).</p>
      </section>

      {stats.map((stat) => (
        <div key={stat.id || `${stat.label}-${stat.sort_order}`} className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <form action={saveStat} className="space-y-3">
            <input type="hidden" name="id" value={stat.id || ""} />
            <label className="block text-sm">
              Value
              <input
                name="value"
                defaultValue={stat.value}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-sm">
              Label
              <input
                name="label"
                defaultValue={stat.label}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="block text-sm">
              Sort order
              <input
                name="sort_order"
                type="number"
                defaultValue={stat.sort_order}
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="visible" defaultChecked={stat.visible !== false} />
              Visible
            </label>
            <Button type="submit">{stat.id ? "Save stat" : "Create from seed values"}</Button>
          </form>
          {stat.id ? (
            <form action={deleteStat} className="mt-3">
              <input type="hidden" name="id" value={stat.id} />
              <Button type="submit" variant="secondary" className="border-red-500/40 text-red-300">
                Delete
              </Button>
            </form>
          ) : null}
        </div>
      ))}

      <form action={saveStat} className="space-y-3 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-5">
        <h3 className="font-medium">Add stat</h3>
        <input type="hidden" name="id" value="" />
        <label className="block text-sm">
          Value
          <input
            name="value"
            required
            placeholder="50+"
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          Label
          <input
            name="label"
            required
            placeholder="Languages"
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="block text-sm">
          Sort order
          <input
            name="sort_order"
            type="number"
            defaultValue={stats.length}
            className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="visible" defaultChecked />
          Visible
        </label>
        <Button type="submit">Add stat</Button>
      </form>
    </div>
  );
}
