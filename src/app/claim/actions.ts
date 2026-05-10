"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function claim(formData: FormData) {
  const memberId = String(formData.get("member_id") ?? "");
  if (!memberId) redirect("/claim?error=Pick+who+you+are");

  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_member", {
    p_member_id: memberId,
  });

  if (error) {
    redirect(`/claim?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}
