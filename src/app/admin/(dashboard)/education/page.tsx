import { requireAdmin } from "@/lib/admin";
import { revalidatePortfolio } from "@/lib/admin-revalidate";
import { siteContent } from "@/lib/content";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

async function saveEducation(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createServiceClient();
  const id = String(formData.get("id") || "");
  const payload = {
    institution: String(formData.get("institution") || ""),
    degree: String(formData.get("degree") || ""),
    years: String(formData.get("years") || ""),
    grade: String(formData.get("grade") || ""),
  };

  if (id) {
    const { error } = await supabase.from("education").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("education").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePortfolio();
}

async function deleteEducation(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = createServiceClient();
  const { error } = await supabase.from("education").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePortfolio();
}

async function saveCertification(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createServiceClient();
  const id = String(formData.get("id") || "");
  const payload = {
    name: String(formData.get("name") || ""),
    issuer: String(formData.get("issuer") || ""),
    url: String(formData.get("url") || "").trim() || null,
    sort_order: Number(formData.get("sort_order") || 0),
    visible: formData.get("visible") === "on",
  };

  if (id) {
    const { error } = await supabase.from("certifications").update(payload).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("certifications").insert(payload);
    if (error) throw new Error(error.message);
  }
  revalidatePortfolio();
}

async function deleteCertification(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;
  const supabase = createServiceClient();
  const { error } = await supabase.from("certifications").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePortfolio();
}

export default async function AdminEducationPage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const [{ data: education }, { data: certifications }] = await Promise.all([
    supabase.from("education").select("*").limit(1).maybeSingle(),
    supabase.from("certifications").select("*").order("sort_order", { ascending: true }),
  ]);

  const edu = education ?? {
    id: "",
    institution: "",
    degree: "",
    years: "",
    grade: "",
  };

  const certs =
    certifications?.length
      ? certifications
      : siteContent.certifications.map((cert, index) => ({
          id: "",
          name: cert.name,
          issuer: cert.issuer,
          url: cert.url || "",
          sort_order: index,
          visible: true,
        }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Education & certifications</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Edit the education block and certification list shown on the site.</p>
      </section>

      <form action={saveEducation} className="max-w-3xl space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6">
        <h3 className="font-medium">Education</h3>
        <input type="hidden" name="id" value={edu.id || ""} />
        {[
          ["institution", "Institution", edu.institution],
          ["degree", "Degree", edu.degree],
          ["years", "Years", edu.years],
          ["grade", "Grade / CGPA", edu.grade],
        ].map(([name, label, value]) => (
          <label key={name} className="block text-sm">
            {label}
            <input
              name={name}
              defaultValue={String(value ?? "")}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
        ))}
        <div className="flex flex-wrap gap-3">
          <Button type="submit">{edu.id ? "Save education" : "Add education"}</Button>
        </div>
      </form>
      {edu.id ? (
        <form action={deleteEducation} className="max-w-3xl">
          <input type="hidden" name="id" value={edu.id} />
          <Button type="submit" variant="secondary" className="border-red-500/40 text-red-300">
            Remove education from site
          </Button>
        </form>
      ) : null}

      <section className="space-y-4">
        <h3 className="font-medium">Certifications</h3>
        {certs.map((cert) => (
          <div key={cert.id || `${cert.name}-${cert.sort_order}`} className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5">
            <form action={saveCertification} className="space-y-3">
              <input type="hidden" name="id" value={cert.id || ""} />
              <label className="block text-sm">
                Name
                <input
                  name="name"
                  defaultValue={cert.name}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="block text-sm">
                Issuer
                <input
                  name="issuer"
                  defaultValue={cert.issuer}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="block text-sm">
                Certificate URL or file path
                <input
                  name="url"
                  type="text"
                  placeholder="https://... or /certificates/my-cert.pdf"
                  defaultValue={"url" in cert ? String(cert.url || "") : ""}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="block text-sm">
                Sort order
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={cert.sort_order}
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="visible" defaultChecked={cert.visible !== false} />
                Visible on site
              </label>
              <div className="flex flex-wrap gap-3">
                <Button type="submit">{cert.id ? "Save certification" : "Create from seed values"}</Button>
              </div>
            </form>
            {cert.id ? (
              <form action={deleteCertification} className="mt-3">
                <input type="hidden" name="id" value={cert.id} />
                <Button type="submit" variant="secondary" className="border-red-500/40 text-red-300">
                  Delete
                </Button>
              </form>
            ) : null}
          </div>
        ))}

        <form action={saveCertification} className="space-y-3 rounded-3xl border border-dashed border-[var(--border)] bg-[var(--panel)] p-5">
          <h4 className="font-medium">Add certification</h4>
          <input type="hidden" name="id" value="" />
          <label className="block text-sm">
            Name
            <input
              name="name"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm">
            Issuer
            <input
              name="issuer"
              required
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm">
            Certificate URL or file path
            <input
              name="url"
              type="text"
              placeholder="https://... or /certificates/my-cert.pdf"
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="block text-sm">
            Sort order
            <input
              name="sort_order"
              type="number"
              defaultValue={certs.length}
              className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="visible" defaultChecked />
            Visible on site
          </label>
          <Button type="submit">Add certification</Button>
        </form>
      </section>
    </div>
  );
}
