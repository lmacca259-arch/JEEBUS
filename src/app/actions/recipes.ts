"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack", "side"] as const;
const CONTAINS_TAGS = ["peanut", "avocado", "oats", "banana_cooked"] as const;

async function getHouseholdId(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("households")
    .select("id")
    .eq("name", "McTonkin")
    .maybeSingle();
  return data?.id ?? null;
}

export async function addRecipe(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/recipes/new?error=Name+is+required");

  const cuisine = String(formData.get("cuisine") ?? "").trim() || null;

  const mealTypeValues = formData.getAll("meal_types").map(String);
  const meal_types = MEAL_TYPES.filter((t) => mealTypeValues.includes(t));
  if (meal_types.length === 0) {
    redirect(`/recipes/new?error=${encodeURIComponent("Pick at least one meal type")}`);
  }

  const containsValues = formData.getAll("contains").map(String);
  const contains = CONTAINS_TAGS.filter((t) => containsValues.includes(t));
  // is_peanut_free defaults true, flipped only if peanut explicitly ticked.
  const is_peanut_free = !contains.includes("peanut");
  const is_kid_favourite = formData.get("is_kid_favourite") === "on";

  const servingsRaw = String(formData.get("servings") ?? "").trim();
  const servings = servingsRaw ? parseInt(servingsRaw, 10) : 4;

  const prepRaw = String(formData.get("prep_time_min") ?? "").trim();
  const prep_time_min = prepRaw ? parseInt(prepRaw, 10) : null;

  const ingredients_md =
    String(formData.get("ingredients_md") ?? "").trim() || null;
  const instructions_md =
    String(formData.get("instructions_md") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const supabase = await createClient();
  const householdId = await getHouseholdId();
  if (!householdId) redirect("/recipes?error=Household+not+found");

  const { error } = await supabase.from("recipes").insert({
    household_id: householdId,
    name,
    cuisine,
    meal_types,
    servings,
    prep_time_min,
    is_peanut_free,
    is_kid_favourite,
    contains,
    is_cooked: true,
    ingredients_md,
    instructions_md,
    notes,
  });

  if (error)
    redirect(`/recipes/new?error=${encodeURIComponent(error.message)}`);

  revalidatePath("/recipes");
  revalidatePath("/meals");
  redirect("/recipes?added=1");
}
