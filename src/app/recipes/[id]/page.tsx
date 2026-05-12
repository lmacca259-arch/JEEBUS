import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ruleWarning } from "@/lib/utils/rules";
import { RecipeHero } from "@/components/brand/RecipeHero";

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
    <main className="mx-auto max-w-md pb-8">
      <RecipeHero name={recipe.name} cuisine={recipe.cuisine} height={220} />

      <div className="px-6 -mt-12 relative z-10 flex items-center justify-between">
        <Link
          href="/recipes"
          className="inline-block text-[10px] uppercase tracking-[0.18em] text-white drop-shadow hover:text-amber-200"
        >
          ← Recipes
        </Link>
        <Link
          href={`/recipes/${recipe.id}/edit`}
          className="rounded-full border border-white/40 bg-black/30 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white drop-shadow hover:bg-black/50"
        >
          Edit
        </Link>
      </div>

      <header className="px-6 mt-6">
        <h1 className="font-display text-4xl font-bold tracking-tight text-slate-50">
          {recipe.name}
        </h1>
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
        <p className="mx-6 mt-6 rounded-xl border border-amber-700/40 bg-amber-900/20 px-4 py-3 text-sm text-amber-200">
          ⚠ {warn}
        </p>
      ) : null}

      {recipe.notes ? (
        <p className="mx-6 mt-6 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-300">
          {recipe.notes}
        </p>
      ) : null}

      {recipe.ingredients_md ? (
        <section className="px-6 mt-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Ingredients
          </h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-200 font-body">
            {recipe.ingredients_md}
          </pre>
        </section>
      ) : null}

      {recipe.instructions_md ? (
        <section className="px-6 mt-8">
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Steps
          </h2>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-200 font-body">
            {recipe.instructions_md}
          </pre>
        </section>
      ) : null}

      {recipe.source_url ? (
        <p className="px-6 mt-8 text-xs text-slate-500">
          <a
            href={recipe.source_url}
            target="_blank"
            rel="noreferrer"
            className="text-amber-300 hover:text-amber-200"
          >
            Source ↗
          </a>
        </p>
      ) : null}
    </main>
  );
}
