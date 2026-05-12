import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/brand/Header";
import { RecipeForm, type RecipeFormValues } from "@/components/recipes/RecipeForm";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: recipe } = await supabase
    .from("recipes")
    .select(
      "id, name, cuisine, meal_types, servings, prep_time_min, is_kid_favourite, contains, ingredients_md, instructions_md, notes",
    )
    .eq("id", id)
    .maybeSingle();

  if (!recipe) notFound();

  const initial: RecipeFormValues = {
    id: recipe.id,
    name: recipe.name,
    cuisine: recipe.cuisine,
    meal_types: recipe.meal_types,
    servings: recipe.servings,
    prep_time_min: recipe.prep_time_min,
    is_kid_favourite: recipe.is_kid_favourite,
    contains: recipe.contains,
    ingredients_md: recipe.ingredients_md,
    instructions_md: recipe.instructions_md,
    notes: recipe.notes,
  };

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header subtitle="Edit recipe" />

      <Link
        href={`/recipes/${id}`}
        className="mt-4 inline-block text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
      >
        ← Back to recipe
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-50">
        {recipe.name}
      </h1>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-700/40 bg-rose-900/30 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </p>
      ) : null}

      <RecipeForm initial={initial} mode="edit" />
    </main>
  );
}
