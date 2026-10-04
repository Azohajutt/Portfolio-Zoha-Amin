import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || "azoha6966@gmail.com").toLowerCase();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || user.email.toLowerCase() !== adminEmail) {
    redirect("/admin/login");
  }

  return { supabase, user };
}
