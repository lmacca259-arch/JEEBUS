import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { ruleWarning, planningWeekMonday } from "@/lib/utils/rules";

export const dynamic = "force-dynamic";

type RecipeRef = {
  id: string;
  name: string;
  contains: string[] | null;
  is_kid_favourite: boolean;
};

type DayRow = {
  id: string;
  day_date: string;
  eating_at_home: boolean;
  snacks_notes: string | null;
  breakfast: RecipeRef | null;
  lunch: RecipeRef | null;
  dinner: RecipeRef | null;
};

const DAY_LABEL: Record<string, string> = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
};

export default async function MealsPage() {
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

  const monday = planningWeekMonday();
  const sundayDate = new Date(monday + "T00:00:00Z");
  sundayDate.setUTCDate(sundayDate.getUTCDate() + 6);
  const sunday = sundayDate.toISOString().slice(0, 10);

  const { data: rows, error } = await supabase
    .from("meal_plan_days")
    .select(
      `id, day_date, eating_at_home, snacks_notes,
       breakfast:recipes!breakfast_recipe_id(id, name, contains, is_kid_favourite),
       lunch:recipes!lunch_recipe_id(id, name, contains, is_kid_favourite),
       dinner:recipes!dinner_recipe_id(id, name, contains, is_kid_favourite)`,
    )
    .gte("day_date", monday)
    .lte("day_date", sunday)
    .order("day_date");

  const days = (rows as unknown as DayRow[] | null) ?? [];

  return (
    <main className="mx-auto max-w-md px-6 pb-8 pt-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">This week</h1>
        <p className="mt-1 text-sm text-slate-400">
          {fmt(monday)} – {fmt(sunday)}
        </p>
      </header>

      {error ? (
        <p className="mt-6 rounded-xl border border-rose-700/40 bg-rose-900/30 px-4 py-3 text-sm text-rose-300">
          Couldn&apos;t load the meal plan. Try refresh.
        </p>
      ) : null}

      {days.length === 0 ? (
        <p className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
          No meals planned for this week yet. The Saturday auto-planner will fill
          this in next time it runs.
        </p>
      ) : (
        <ol className="mt-8 space-y-4">
          {days.map((d) => (
            <li
              key={d.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="flex items-baseline justify-between">
                <p className="text-base font-semibold">
                  {dayName(d.day_date)}
                </p>
                <p className="text-xs text-slate-500">{shortDate(d.day_date)}</p>
              </div>
              <ul className="mt-3 space-y-2 text-sm">
                <MealRow label="Breakfast" r={d.breakfast} member={memberName} />
                <MealRow label="Lunch" r={d.lunch} member={memberName} />
                <MealRow label="Dinner" r={d.dinner} member={memberName} />
              </ul>
              {d.snacks_notes ? (
                <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-400">
                  {d.snacks_notes}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}

function MealRow({
  label,
  r,
  member,
}: {
  label: string;
  r: RecipeRef | null;
  member: string | null;
}) {
  if (!r) {
    return (
      <li className="flex items-baseline gap-3">
        <span className="w-20 text-[10px] uppercase tracking-[0.16em] text-slate-500">
          {label}
        </span>
        <span className="text-slate-500">—</span>
      </li>
    );
  }
  const warn = ruleWarning(r.contains, member);
  return (
    <li className="flex items-baseline gap-3">
      <span className="w-20 text-[10px] uppercase tracking-[0.16em] text-slate-500">
        {label}
      </span>
      <span className="flex-1">
        <Link
          href={`/recipes/${r.id}`}
          className="text-slate-100 underline-offset-2 hover:underline"
        >
          {r.name}
        </Link>
        {r.is_kid_favourite ? (
          <span className="ml-2 align-middle text-[10px]" aria-label="kids' favourite">
            ⭐
          </span>
        ) : null}
        {warn ? (
          <span className="mt-0.5 block text-[11px] text-amber-400">⚠ {warn}</span>
        ) : null}
      </span>
    </li>
  );
}

function fmt(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}
function shortDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}
function dayName(iso: string) {
  const d = new Date(iso + "T00:00:00").getDay();
  return DAY_LABEL[String(d)] ?? iso;
}
