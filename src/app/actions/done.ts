"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markDone(formData: FormData) {
  const assignmentId = String(formData.get("assignment_id") ?? "");
  const notes = String(formData.get("notes") ?? "") || null;
  if (!assignmentId) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_assignment_done", {
    p_assignment_id: assignmentId,
    p_photo_url: null,
    p_notes: notes,
  });

  if (error) {
    redirect(`/?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/");
  redirect("/?done=1");
}
