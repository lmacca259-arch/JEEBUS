"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type Cadence = "Daily" | "Weekly" | "Fortnightly" | "Monthly";
type DayHint = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun" | "Anytime";

function buildRecurrenceRule(cadence: Cadence, dayHint: DayHint): string {
  const dayMap: Record<string, string> = {
    Mon: "MO", Tue: "TU", Wed: "WE", Thu: "TH", Fri: "FR", Sat: "SA", Sun: "SU",
  };
  const byday = dayMap[dayHint];
  switch (cadence) {
    case "Daily":
      return "FREQ=DAILY";
    case "Weekly":
      return byday ? `FREQ=WEEKLY;BYDAY=${byday}` : "FREQ=WEEKLY";
    case "Fortnightly":
      return byday
        ? `FREQ=WEEKLY;INTERVAL=2;BYDAY=${byday}`
        : "FREQ=WEEKLY;INTERVAL=2";
    case "Monthly":
      return byday ? `FREQ=MONTHLY;BYDAY=${byday}` : "FREQ=MONTHLY";
    default:
      return "FREQ=DAILY";
  }
}

async function getHouseholdId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("households")
    .select("id")
    .eq("name", "McTonkin")
    .maybeSingle();
  return data?.id ?? null;
}

function readForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const cadence = String(formData.get("cadence") ?? "Weekly") as Cadence;
  const dayHint = String(formData.get("day_hint") ?? "Anytime") as DayHint;
  const assigneeRaw = String(formData.get("default_assignee") ?? "");
  const default_assignee = assigneeRaw === "FAMILY" || !assigneeRaw ? null : assigneeRaw;
  const paysRaw = String(formData.get("pays_aud") ?? "").trim();
  const pays_aud = paysRaw ? parseFloat(paysRaw) : null;
  const paidByRaw = String(formData.get("paid_by_member_id") ?? "");
  const paid_by_member_id = paidByRaw && pays_aud && pays_aud > 0 ? paidByRaw : null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const is_active = formData.get("is_active") === "on";
  return {
    name,
    cadence,
    dayHint,
    default_assignee,
    pays_aud,
    paid_by_member_id,
    notes,
    is_active,
  };
}

export async function addChore(formData: FormData) {
  const data = readForm(formData);
  if (!data.name) redirect("/chores/new?error=Name+is+required");

  const supabase = await createClient();
  const householdId = await getHouseholdId();
  if (!householdId) redirect("/chores?error=Household+not+found");

  const { error } = await supabase.from("chores").insert({
    household_id: householdId,
    name: data.name,
    default_assignee: data.default_assignee,
    recurrence_rule: buildRecurrenceRule(data.cadence, data.dayHint),
    cadence: data.cadence,
    day_hint: data.dayHint,
    notes: data.notes,
    pays_aud: data.pays_aud,
    paid_by_member_id: data.paid_by_member_id,
    is_active: data.is_active,
    points: 1,
  });

  if (error) redirect(`/chores/new?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/chores");
  revalidatePath("/");
  redirect("/chores?added=1");
}

export async function updateChore(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/chores?error=Missing+chore+id");

  const data = readForm(formData);
  const supabase = await createClient();

  const { error } = await supabase
    .from("chores")
    .update({
      name: data.name,
      default_assignee: data.default_assignee,
      recurrence_rule: buildRecurrenceRule(data.cadence, data.dayHint),
      cadence: data.cadence,
      day_hint: data.dayHint,
      notes: data.notes,
      pays_aud: data.pays_aud,
      paid_by_member_id: data.paid_by_member_id,
      is_active: data.is_active,
    })
    .eq("id", id);

  if (error)
    redirect(`/chores/${id}?error=${encodeURIComponent(error.message)}`);

  // Re-point any open pending assignments to the new owner so today doesn't
  // get stranded on the old person (matches what we did manually for Andrew).
  await supabase
    .from("assignments")
    .update({ member_id: data.default_assignee })
    .eq("chore_id", id)
    .eq("status", "pending");

  revalidatePath("/chores");
  revalidatePath("/");
  redirect("/chores?saved=1");
}

export async function removeChore(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("chores").update({ is_active: false }).eq("id", id);
  revalidatePath("/chores");
  revalidatePath("/");
  redirect("/chores?removed=1");
}
