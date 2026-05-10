import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ruleWarning } from "@/lib/utils/rules";

export const dynamic = "force-dynamic";

type Recipe = {
  id: string;
  name: string;
  cuisine: string | null;
  meal_types: string[] | null;
  servings: number | null;
  prep_time_min: number | null;
  notes: string | null;
  is_peanut_free: boolean;
  is_kid_favourite: boolean;
  contains: string[] | null;
  ingredients_md: string | null;
  instructions_md: string | null;
  source_url: string | null;
};

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const cookieStore = await cookies();
  const memberId = cookieStore.get("hyetas_member_id")?.value ?? null;

  let memberName: string | null = null;
  if (memberId) {
    const { data: m } = await supabase
      .from("members")
      .select("name")
      .eq("id", memberId)
      .maybeSingle();
    memberName = m?.name ?? null;
  }

  const { data: r, error } = await supabase
    .from("recipes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !r) notFound();
  const recipe = r as Recipe;
  const warn = ruleWarning(recipe.contains, memberName);

  return (
    <main className="mx-auto max-w-md px-6 pb-8 pt-12">
      <Link
        href="/recipes"
        className="text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
      >
        ← Recipes
      </Link>

      <header className="mt-4">
        <h1 className="text-3xl font-semibold tracking-tight">{recipe.name}</h1>
        <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
          {[
            recipe.cuisine,
            ...(recipe.meal_types ?? []),
            recipe.servings ? `serves ${recipe.servings}` : null,
            recipe.prep_time_min ? `${recipe.prep_time_min} min` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {recipe.is_peanut_free ? (
            <span className="rounded-full border border-emerald-700/40 bg-emerald-900/20 px-2 py-0.5 text-[10px] text-emerald-300">
              peanut-free
            </span>
          ) : null}
          {recipe.is_kid_favourite ? (
            <span className="rounded-full border border-amber-700/40 bg-amber-900/20 px-2 py-0.5 text-[10px] text-amber-300">
              ⭐ kid favourite
            </span>
          ) : null}
        </div>
      </header>

      {warn ? (
        <p className="mt-6 rounded-xl border border-amber-700/40 bg-amber-900/20 px-4 py-3 text-sm text-amber-300">
          ⚠ {warn}
        </p>
      ) : null}

      {recipe.notes ? (
        <p className="mt-6 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
          {recipe.notes}
        </p>
      ) : null}

      {recipe.ingredients_md ? (
        <section className="mt-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Ingredients
          </h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-200 font-sans">
            {recipe.ingredients_md}
          </pre>
        </section>
      ) : null}

      {recipe.instructions_md ? (
        <section className="mt-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Steps
          </h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-200 font-sans">
            {recipe.instructions_md}
          </pre>
        </section>
      ) : null}

      {recipe.source_url ? (
        <p className="mt-8 text-xs text-slate-500">
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300"
          >
            Source ↗
          </a>
        </p>
      ) : null}
    </main>
  );
}
