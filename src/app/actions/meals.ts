"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Recipes containing any of these tags get filtered out — they fail
// household-wide rules (peanut) or specific member rules (avocado/oats/Lisa,
// cooked banana/Andrew). Apples already filtered at recipe-import time.
const UNSAFE_CONTAINS = ["peanut", "avocado", "oats", "banana_cooked"];

function addDaysIso(iso: string, days: number): string {
  const dt = new Date(iso + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function getDow(iso: string): number {
  // 0 Sun .. 6 Sat
  return new Date(iso + "T00:00:00Z").getUTCDay();
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Recipe = {
  id: string;
  name: string;
  contains: string[] | null;
  is_kid_favourite: boolean;
  meal_types: string[] | null;
};

type ExistingDay = {
  id: string;
  day_date: string;
  dinner_recipe_id: string | null;
};

export async function autoFillDinners(formData: FormData) {
  const weekMonday = String(formData.get("week_monday") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekMonday)) return;

  const supabase = await createClient();

  const { data: hh } = await supabase
    .from("households")
    .select("id")
    .eq("name", "McTonkin")
    .maybeSingle();
  const householdId = hh?.id;
  if (!householdId) return;

  // 7 days starting at the given Monday.
  const days = Array.from({ length: 7 }, (_, i) => addDaysIso(weekMonday, i));
  const sunday = days[6];

  // Fetch any rows that already exist for this week.
  const { data: existingRows } = await supabase
    .from("meal_plan_days")
    .select("id, day_date, dinner_recipe_id")
    .gte("day_date", weekMonday)
    .lte("day_date", sunday);

  const existing = (existingRows as ExistingDay[] | null) ?? [];
  const existingByDate = new Map<string, ExistingDay>();
  for (const r of existing) existingByDate.set(r.day_date, r);

  // Eligible dinner recipes — has 'dinner' in meal_types, no unsafe tags.
  const { data: recipes } = await supabase
    .from("recipes")
    .select("id, name, contains, is_kid_favourite, meal_types")
    .contains("meal_types", ["dinner"]);

  const eligible = ((recipes as Recipe[] | null) ?? []).filter((r) => {
    const c = r.contains ?? [];
    return !c.some((tag) => UNSAFE_CONTAINS.includes(tag));
  });

  // Avoid picking a recipe already in this week's existing dinners.
  const usedIds = new Set<string>();
  for (const r of existing) {
    if (r.dinner_recipe_id) usedIds.add(r.dinner_recipe_id);
  }

  // Shuffled pools so consecutive auto-fills don't always look identical.
  const kidFavs = shuffle(eligible.filter((r) => r.is_kid_favourite));
  const others = shuffle(eligible.filter((r) => !r.is_kid_favourite));

  function pickFor(isSchoolNight: boolean): string | null {
    // Mon-Fri prefer kid favourites; weekends treat all eligible equally.
    const primary = isSchoolNight ? kidFavs : others;
    const secondary = isSchoolNight ? others : kidFavs;
    for (const r of primary) {
      if (!usedIds.has(r.id)) {
        usedIds.add(r.id);
        return r.id;
      }
    }
    for (const r of secondary) {
      if (!usedIds.has(r.id)) {
        usedIds.add(r.id);
        return r.id;
      }
    }
    // Library smaller than 7 unique safe recipes? Relax and allow repeats.
    const all = [...kidFavs, ...others];
    if (all.length > 0) return all[0].id;
    return null;
  }

  for (const dayIso of days) {
    const row = existingByDate.get(dayIso);
    if (row?.dinner_recipe_id) continue; // already planned, leave alone

    const dow = getDow(dayIso);
    const isSchoolNight = dow >= 1 && dow <= 5; // Mon-Fri
    const recipeId = pickFor(isSchoolNight);
    if (!recipeId) continue;

    if (row) {
      await supabase
        .from("meal_plan_days")
        .update({ dinner_recipe_id: recipeId })
        .eq("id", row.id);
    } else {
      await supabase.from("meal_plan_days").insert({
        household_id: householdId,
        day_date: dayIso,
        dinner_recipe_id: recipeId,
        eating_at_home: true,
      });
    }
  }

  revalidatePath("/meals");
}

// Clear all dinners in the week, then re-fill from scratch. Used by the
// "Shuffle these dinners" button when Lisa wants a different set of picks.
export async function shuffleDinners(formData: FormData) {
  const weekMonday = String(formData.get("week_monday") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekMonday)) return;

  const supabase = await createClient();
  const sunday = addDaysIso(weekMonday, 6);

  await supabase
    .from("meal_plan_days")
    .update({ dinner_recipe_id: null })
    .gte("day_date", weekMonday)
    .lte("day_date", sunday);

  // Re-use the fill logic — same shape, same rules.
  await autoFillDinners(formData);
}
