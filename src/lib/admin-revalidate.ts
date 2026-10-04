import { revalidatePath } from "next/cache";
import { invalidateChatKnowledge } from "@/lib/chat-knowledge";

export function revalidatePortfolio() {
  invalidateChatKnowledge();
  revalidatePath("/", "layout");
  revalidatePath("/work", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/profile");
  revalidatePath("/admin/projects");
  revalidatePath("/admin/experience");
  revalidatePath("/admin/education");
  revalidatePath("/admin/skills");
  revalidatePath("/admin/stats");
}
