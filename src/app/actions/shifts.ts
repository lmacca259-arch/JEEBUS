"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

function readDate(formData: FormData): string | null {
  const raw = String(formData.get("shift_date") ?? "").trim();
  // HTML <input type="date"> returns "YYYY-MM-DD".
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

async function currentMemberId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("hyetas_member_id")?.value ?? null;
}

export async function addShift(formData: FormData) {
  const date = readDate(formData);
  if (!date) redirect("/shifts/new?error=Please+pick+a+date");

  const memberId = await currentMemberId();
  if (!memberId) redirect("/shifts/new?error=No+member+selected");

  const supabase = await createClient();
  const { error } = await supabase.rpc("upsert_shift", {
    p_id: null,
    p_member_id: memberId,
    p_date: date,
  });

  if (error) redirect(`/shifts/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/shifts");
  revalidatePath("/");
  redirect("/shifts?added=1");
}

export async function updateShift(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/shifts?error=Missing+shift+id");

  const date = readDate(formData);
  if (!date) redirect(`/shifts/${id}?error=Please+pick+a+date`);

  const memberId = await currentMemberId();
  if (!memberId) redirect(`/shifts/${id}?error=No+member+selected`);

  const supabase = await createClient();
  const { error } = await supabase.rpc("upsert_shift", {
    p_id: id,
    p_member_id: memberId,
    p_date: date,
  });

  if (error) redirect(`/shifts/${id}?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/shifts");
  revalidatePath("/");
  redirect("/shifts?saved=1");
}

export async function removeShift(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("shifts").delete().eq("id", id);
  revalidatePath("/shifts");
  revalidatePath("/");
  redirect("/shifts?removed=1");
}
