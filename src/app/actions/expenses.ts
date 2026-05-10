"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function addExpense(formData: FormData) {
  const item = String(formData.get("item") ?? "").trim();
  const amount = parseFloat(String(formData.get("amount") ?? "0"));
  const paid_by_member_id = String(formData.get("paid_by") ?? "");
  const category = String(formData.get("category") ?? "other");
  const expense_date = String(formData.get("expense_date") ?? "");
  const notes = String(formData.get("notes") ?? "") || null;

  if (!item || !amount || !paid_by_member_id) {
    redirect("/money?error=Missing+required+fields");
  }

  const supabase = await createClient();

  // Resolve household via the chosen member (cleanest path with current schema)
  const { data: payer } = await supabase
    .from("members")
    .select("household_id")
    .eq("id", paid_by_member_id)
    .maybeSingle();

  if (!payer?.household_id) {
    redirect("/money?error=Could+not+find+household");
  }

  const { error } = await supabase.from("expenses").insert({
    household_id: payer.household_id,
    item,
    amount,
    paid_by_member_id,
    category,
    expense_date: expense_date || new Date().toISOString().slice(0, 10),
    notes,
    settled: false,
  });

  if (error) redirect(`/money?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/money");
  redirect("/money?added=1");
}

export async function toggleSettled(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("expenses").update({ settled: next }).eq("id", id);
  revalidatePath("/money");
}

// Used by the form to default to "the person on this device".
export async function getCurrentMemberId(): Promise<string | null> {
  const c = await cookies();
  return c.get("hyetas_member_id")?.value ?? null;
}
