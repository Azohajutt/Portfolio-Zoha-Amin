import { requireAdmin } from "@/lib/admin";
import { revalidatePortfolio } from "@/lib/admin-revalidate";
import { siteContent } from "@/lib/content";
import { createServiceClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

async function updateProfile(formData: FormData) {
  "use server";
  await requireAdmin();
  const supabase = createServiceClient();

  const chatStarters = String(formData.get("chat_starters") || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  const welcomeMessage = String(formData.get("welcome_message") || "").trim();

  const payload = {
    id: 1,
    name: String(formData.get("name") || ""),
    headline: String(formData.get("headline") || ""),
    positioning: String(formData.get("positioning") || ""),
    summary: String(formData.get("summary") || ""),
    location: String(formData.get("location") || ""),
    email: String(formData.get("email") || ""),
    phone: String(formData.get("phone") || ""),
    github: String(formData.get("github") || ""),
    linkedin: String(formData.get("linkedin") || ""),
    avatar: String(formData.get("avatar") || siteContent.avatar),
    resume_path: String(formData.get("resume_path") || siteContent.resumePath),
    chat_starters: chatStarters,
    welcome_message: welcomeMessage || null,
    updated_at: new Date().toISOString(),
  };

  let { error } = await supabase.from("site_settings").upsert(payload);
  if (error && /welcome_message/i.test(error.message)) {
    const { welcome_message: _unused, ...withoutWelcome } = payload;
    ({ error } = await supabase.from("site_settings").upsert(withoutWelcome));
  }
  if (error) throw new Error(error.message);
  revalidatePortfolio();
}

export default async function AdminProfilePage() {
  await requireAdmin();
  const supabase = createServiceClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  const settings = data ?? {
    name: siteContent.name,
    headline: siteContent.headline,
    positioning: siteContent.positioning,
    summary: siteContent.summary,
    location: siteContent.location,
    email: siteContent.email,
    phone: siteContent.phone,
    github: siteContent.github,
    linkedin: siteContent.linkedin,
    avatar: siteContent.avatar,
    resume_path: siteContent.resumePath,
    chat_starters: siteContent.chatStarters,
    welcome_message: siteContent.welcomeMessage || "",
  };

  return (
    <form action={updateProfile} className="max-w-3xl space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Profile & hero</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          These fields power the public site and the chatbot. Contact details are never invented — the assistant only
          uses the email, phone, LinkedIn, and GitHub saved here.
        </p>
      </div>
      {[
        ["name", "Name", settings.name],
        ["headline", "Headline", settings.headline],
        ["positioning", "Positioning line", settings.positioning],
        ["location", "Location", settings.location],
        ["email", "Email", settings.email],
        ["phone", "Phone", settings.phone],
        ["github", "GitHub", settings.github],
        ["linkedin", "LinkedIn", settings.linkedin],
        ["avatar", "Avatar path", settings.avatar || siteContent.avatar],
        ["resume_path", "Resume path", settings.resume_path || siteContent.resumePath],
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
      <label className="block text-sm">
        Summary
        <textarea
          name="summary"
          defaultValue={settings.summary}
          rows={5}
          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="block text-sm">
        Chat welcome message
        <textarea
          name="welcome_message"
          defaultValue={
            String(settings.welcome_message || "") ||
            `Hi — I’m ${settings.name || siteContent.name}’s AI representative. I reason from this portfolio: the work, the stack, and the proof. Ask me anything about it.`
          }
          rows={3}
          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="block text-sm">
        Chat starter questions (one per line)
        <textarea
          name="chat_starters"
          defaultValue={(settings.chat_starters as string[] | undefined)?.join("\n") || siteContent.chatStarters.join("\n")}
          rows={5}
          className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-transparent px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      <Button type="submit">Save profile</Button>
    </form>
  );
}
