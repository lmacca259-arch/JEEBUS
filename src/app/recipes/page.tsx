import Link from "next/link";
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
  is_peanut_free: boolean;
  is_kid_favourite: boolean;
  contains: string[] | null;
};

export default async function RecipesPage() {
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

  const { data: rows } = await supabase
    .from("recipes")
    .select(
      "id, name, cuisine, meal_types, servings, prep_time_min, is_peanut_free, is_kid_favourite, contains",
    )
    .order("name");

  const recipes = (rows as Recipe[] | null) ?? [];

  return (
    <main className="mx-auto max-w-md px-6 pb-8 pt-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Recipes</h1>
        <p className="mt-1 text-sm text-slate-400">
          {recipes.length} in the cookbook · all peanut-free
        </p>
      </header>

      <ul className="mt-8 space-y-2">
        {recipes.map((r) => {
          const warn = ruleWarning(r.contains, memberName);
          return (
            <li key={r.id}>
              <Link
                href={`/recipes/${r.id}`}
                className="block rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 transition hover:border-emerald-600"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-base font-medium">
                    {r.name}
                    {r.is_kid_favourite ? (
                      <span className="ml-2 align-middle text-[10px]" aria-label="kids' favourite">
                        ⭐
                      </span>
                    ) : null}
                  </p>
                  {r.prep_time_min ? (
                    <p className="text-xs text-slate-500">{r.prep_time_min} min</p>
                  ) : null}
                </div>
                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  {[r.cuisine, ...(r.meal_types ?? [])].filter(Boolean).join(" · ")}
                </p>
                {warn ? (
                  <p className="mt-2 text-[11px] text-amber-400">⚠ {warn}</p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
