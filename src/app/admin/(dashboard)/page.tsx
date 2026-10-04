import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import {
  deleteLocalChatLog,
  deleteLocalContactMessage,
  listLocalChatLogs,
  listLocalContactMessages,
} from "@/lib/local-inbox";
import { createServiceClient, hasSupabaseServiceConfig } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

async function deleteContactMessage(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  deleteLocalContactMessage(id);

  if (hasSupabaseServiceConfig()) {
    const supabase = createServiceClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) console.error("delete contact failed", error.message);
  }

  revalidatePath("/admin");
}

async function deleteChatLog(formData: FormData) {
  "use server";
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) return;

  deleteLocalChatLog(id);

  if (hasSupabaseServiceConfig()) {
    const supabase = createServiceClient();
    const { error } = await supabase.from("chat_logs").delete().eq("id", id);
    if (error) console.error("delete chat log failed", error.message);
  }

  revalidatePath("/admin");
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const localMessages = listLocalContactMessages(50);
  const localChats = listLocalChatLogs(50);
  let messages = localMessages;
  let chats = localChats;
  let notice = "";

  if (hasSupabaseServiceConfig()) {
    const supabase = createServiceClient();
    const [{ data: messageData, error: messageError }, { data: chatData, error: chatError }] =
      await Promise.all([
        supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("chat_logs").select("*").order("created_at", { ascending: false }).limit(50),
      ]);

    if (messageError || chatError) {
      notice =
        "Could not fully sync with Supabase, so some items may only be on this computer. Delete still works for both stores when available.";
    }

    messages = mergeById(messageData ?? [], localMessages);
    chats = mergeById(chatData ?? [], localChats);
  } else {
    notice = "Supabase is not configured. Inbox is using local storage on this computer.";
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Inbox</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Contact form messages and chatbot questions. Use Delete to remove an item from the panel and the database.
        </p>
      </section>

      {notice && (
        <section className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-5 text-sm leading-relaxed">
          <p className="font-medium text-amber-200">Note</p>
          <p className="mt-2 text-amber-100/90">{notice}</p>
        </section>
      )}

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium">Contact messages</h3>
          <p className="text-xs text-[var(--muted)]">{messages.length} total</p>
        </div>
        <div className="mt-4 space-y-3">
          {messages.length === 0 && <p className="text-sm text-[var(--muted)]">No messages yet.</p>}
          {messages.map((message) => (
            <article key={message.id} className="rounded-2xl border border-[var(--border)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {message.name} · {message.email}
                  </p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{message.message}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {new Date(message.created_at).toLocaleString()}
                  </p>
                </div>
                <form action={deleteContactMessage}>
                  <input type="hidden" name="id" value={message.id} />
                  <Button type="submit" variant="secondary" className="border-red-500/40 text-red-300 hover:border-red-400">
                    Delete
                  </Button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-medium">Chat logs</h3>
          <p className="text-xs text-[var(--muted)]">{chats.length} total</p>
        </div>
        <div className="mt-4 space-y-3">
          {chats.length === 0 && <p className="text-sm text-[var(--muted)]">No chat questions yet.</p>}
          {chats.map((chat) => (
            <article key={chat.id} className="rounded-2xl border border-[var(--border)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{chat.question}</p>
                  <p className="mt-2 text-sm text-[var(--muted)]">{chat.answer}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    {chat.unanswered ? "Unanswered · " : ""}
                    {chat.injection_flagged ? "Injection flagged · " : ""}
                    {new Date(chat.created_at).toLocaleString()}
                  </p>
                </div>
                <form action={deleteChatLog}>
                  <input type="hidden" name="id" value={chat.id} />
                  <Button type="submit" variant="secondary" className="border-red-500/40 text-red-300 hover:border-red-400">
                    Delete
                  </Button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function mergeById<T extends { id: string; created_at: string }>(primary: T[], secondary: T[]) {
  const map = new Map<string, T>();
  for (const item of [...primary, ...secondary]) {
    if (!map.has(item.id)) map.set(item.id, item);
  }
  return [...map.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}
