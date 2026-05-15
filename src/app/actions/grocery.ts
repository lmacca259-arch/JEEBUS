"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleGotIt(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const next = formData.get("next") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("grocery_items").update({ got_it: next }).eq("id", id);
  revalidatePath("/grocery");
}

type ConsolidatedRow = {
  aisle: string | null;
  name: string;
  qty_unit: string | null;
  total_qty: number | null;
  has_unquantified: boolean | null;
  display_quantity: string | null;
  for_recipes: string | null;
  is_hannah_home: boolean | null;
  target_servings: number | null;
};

type StandingItemRow = {
  item: string;
  quantity: string | null;
  aisle: string | null;
  notes: string | null;
  home_only: boolean;
};

type GroceryInsert = {
  household_id: string;
  week_of: string;
  item: string;
  quantity: string | null;
  aisle: string | null;
  for_recipes: string | null;
  is_standing: boolean;
  got_it: boolean;
  notes: string | null;
};

/**
 * Rebuild the grocery list for a given week from the meal plan.
 * - Wipes ALL existing rows for that week (standing + hand-built).
 * - Inserts consolidated rows from `consolidate_grocery_for_week`.
 * - Adds every entry from `standing_items` (respecting home_only flag).
 */
export async function rebuildGrocery(formData: FormData) {
  const weekMonday = String(formData.get("week") ?? "");
  const slot = String(formData.get("slot") ?? "current"); // 'current' | 'next'
  if (!weekMonday) return;

  const supabase = await createClient();

  // 1. Household.
  const { data: hh } = await supabase
    .from("households")
    .select("id")
    .limit(1)
    .single();
  if (!hh) return;
  const householdId = hh.id as string;

  // 2. Call the consolidator.
  const { data: rows, error } = await supabase.rpc(
    "consolidate_grocery_for_week",
    {
      p_household_id: householdId,
      p_week_monday: weekMonday,
    },
  );
  if (error) {
    console.error("consolidate_grocery_for_week failed", error);
    return;
  }

  const consolidated = (rows ?? []) as ConsolidatedRow[];
  const isHannahHome = consolidated[0]?.is_hannah_home ?? false;

  // 3. Wipe the week (standing + non-standing both).
  await supabase
    .from("grocery_items")
    .delete()
    .eq("household_id", householdId)
    .eq("week_of", weekMonday);

  // 4. Build the insert payload from consolidator rows.
  const inserts: GroceryInsert[] = consolidated.map((r) => ({
    household_id: householdId,
    week_of: weekMonday,
    item: r.name,
    quantity: r.display_quantity,
    aisle: r.aisle,
    for_recipes: r.for_recipes,
    is_standing: false,
    got_it: false,
    notes: null,
  }));

  // 5. Standing items from the user-managed table.
  const { data: standingRows } = await supabase
    .from("standing_items")
    .select("item, quantity, aisle, notes, home_only")
    .eq("household_id", householdId)
    .order("item");

  for (const s of (standingRows ?? []) as StandingItemRow[]) {
    if (s.home_only && !isHannahHome) continue;
    inserts.push({
      household_id: householdId,
      week_of: weekMonday,
      item: s.item,
      quantity: s.quantity,
      aisle: s.aisle,
      for_recipes: null,
      is_standing: true,
      got_it: false,
      notes: s.notes,
    });
  }

  await supabase.from("grocery_items").insert(inserts);

  revalidatePath("/grocery");
  redirect(`/grocery?week=${slot}&rebuilt=1`);
}

export async function addStandingItem(formData: FormData) {
  const item = String(formData.get("item") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "").trim() || null;
  const aisle = String(formData.get("aisle") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const homeOnly = formData.get("home_only") === "on";
  if (!item) return;

  const supabase = await createClient();
  const { data: hh } = await supabase
    .from("households")
    .select("id")
    .limit(1)
    .single();
  if (!hh) return;

  await supabase.from("standing_items").insert({
    household_id: hh.id,
    item,
    quantity,
    aisle,
    notes,
    home_only: homeOnly,
  });

  revalidatePath("/grocery");
}

export async function removeStandingItem(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("standing_items").delete().eq("id", id);

  revalidatePath("/grocery");
}
