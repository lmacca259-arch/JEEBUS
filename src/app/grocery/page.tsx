import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleGotIt, rebuildGrocery } from "@/app/actions/grocery";
import {
  planningWeekMonday,
  nextPlanningWeekMonday,
} from "@/lib/utils/rules";
import { Header } from "@/components/brand/Header";

export const dynamic = "force-dynamic";

type Item = {
  id: string;
  item: string;
  quantity: string | null;
  aisle: string | null;
  for_recipes: string | null;
  notes: string | null;
  coles_price: number | null;
  woolies_price: number | null;
  best_price: number | null;
  cheaper_at: "coles" | "woolworths" | "tie" | "not_found" | null;
  got_it: boolean;
  is_standing: boolean;
};

const AISLE_ORDER = [
  "Produce",
  "Protein",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Household",
  "Other",
];

const AISLE_EMOJI: Record<string, string> = {
  Produce: "🥬",
  Protein: "🍗",
  "Dairy & Eggs": "🥛",
  Bakery: "🍞",
  Pantry: "🥫",
  Frozen: "🧊",
  Beverages: "🥤",
  Household: "🧴",
  Other: "🛒",
};

export default async function GroceryPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; rebuilt?: string }>;
}) {
  const sp = await searchParams;
  const slot = sp.week === "next" ? "next" : "current";
  const justRebuilt = sp.rebuilt === "1";

  const thisMonday = planningWeekMonday();
  const nextMonday = nextPlanningWeekMonday();
  const monday = slot === "next" ? nextMonday : thisMonday;

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("grocery_items")
    .select(
      "id, item, quantity, aisle, for_recipes, notes, coles_price, woolies_price, best_price, cheaper_at, got_it, is_standing",
    )
    .eq("week_of", monday)
    .order("aisle")
    .order("item");

  const items = (rows as Item[] | null) ?? [];

  const byAisle = new Map<string, Item[]>();
  for (const it of items) {
    const a = it.aisle ?? "Other";
    if (!byAisle.has(a)) byAisle.set(a, []);
    byAisle.get(a)!.push(it);
  }
  const orderedAisles = [
    ...AISLE_ORDER.filter((a) => byAisle.has(a)),
    ...[...byAisle.keys()].filter((a) => !AISLE_ORDER.includes(a)),
  ];

  const colesTotal = items.reduce((s, i) => s + (i.coles_price ?? 0), 0);
  const wooliesTotal = items.reduce((s, i) => s + (i.woolies_price ?? 0), 0);
  const bestTotal = items.reduce((s, i) => s + (i.best_price ?? 0), 0);
  const pricedCount = items.filter((i) => i.best_price != null).length;
  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.got_it).length;

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header
        subtitle={`Week of ${fmt(monday)} · ${checkedCount} of ${totalCount} ticked`}
      />

      {justRebuilt ? (
        <div className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-900/20 px-4 py-2.5 text-sm text-emerald-200">
          ✓ Rebuilt from meal plan
        </div>
      ) : null}

      {/* Week toggle */}
      <div className="mt-5 flex gap-2">
        <WeekPill
          label="This week"
          dateLabel={fmt(thisMonday)}
          href="/grocery?week=current"
          active={slot === "current"}
        />
        <WeekPill
          label="Next week"
          dateLabel={fmt(nextMonday)}
          href="/grocery?week=next"
          active={slot === "next"}
        />
      </div>

      {/* Rebuild button */}
      <form action={rebuildGrocery} className="mt-3">
        <input type="hidden" name="week" value={monday} />
        <input type="hidden" name="slot" value={slot} />
        <button
          type="submit"
          className="w-full rounded-2xl border border-amber-400/40 bg-amber-900/20 px-4 py-2.5 text-sm font-medium text-amber-200 transition hover:bg-amber-900/30"
        >
          🔄 Rebuild from meal plan
        </button>
        <p className="mt-1.5 text-[11px] text-slate-500">
          Wipes this week&apos;s list and refills it from the planned meals
          {totalCount > 0 ? ` (${totalCount} items will be replaced)` : ""}.
        </p>
      </form>

      {pricedCount > 0 ? (
        <section
          className="mt-6 overflow-hidden rounded-3xl border border-white/10 p-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(251,191,36,0.18), rgba(251,113,133,0.10))",
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200/80">
            Priced ({pricedCount} items)
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Total
              label="Coles"
              amount={colesTotal}
              winner={colesTotal <= wooliesTotal && colesTotal <= bestTotal}
            />
            <Total
              label="Woolies"
              amount={wooliesTotal}
              winner={wooliesTotal < colesTotal && wooliesTotal <= bestTotal}
            />
            <Total
              label="Best mix"
              amount={bestTotal}
              winner={bestTotal < colesTotal && bestTotal < wooliesTotal}
            />
          </div>
        </section>
      ) : null}

      {items.length === 0 ? (
        <p className="mt-10 text-center text-sm text-slate-500">
          No items for this week yet. Tap{" "}
          <span className="text-amber-300">Rebuild from meal plan</span> to fill
          it in.
        </p>
      ) : null}

      <section className="mt-6 space-y-7">
        {orderedAisles.map((aisle) => (
          <div key={aisle}>
            <h2 className="flex items-center gap-2 text-sm font-display font-bold uppercase tracking-[0.16em] text-slate-300">
              <span aria-hidden>{AISLE_EMOJI[aisle] ?? "🛒"}</span>
              {aisle}
            </h2>
            <ul className="mt-2 space-y-1.5">
              {byAisle.get(aisle)!.map((it) => (
                <li key={it.id}>
                  <form action={toggleGotIt}>
                    <input type="hidden" name="id" value={it.id} />
                    <input
                      type="hidden"
                      name="next"
                      value={(!it.got_it).toString()}
                    />
                    <button
                      type="submit"
                      className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
                        it.got_it
                          ? "border-white/5 bg-white/[0.02] text-slate-500"
                          : "border-white/10 bg-white/[0.04] hover:border-amber-500/50"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
                          it.got_it
                            ? "border-emerald-500 bg-emerald-500 text-slate-950"
                            : "border-slate-600"
                        }`}
                        aria-hidden
                      >
                        {it.got_it ? "✓" : ""}
                      </span>
                      <span className="flex-1">
                        <span className="flex items-baseline gap-2">
                          <span
                            className={`text-sm ${
                              it.got_it ? "line-through" : "text-slate-100"
                            }`}
                          >
                            {it.item}
                          </span>
                          {it.is_standing ? (
                            <span className="text-[10px] uppercase tracking-wider text-amber-300">
                              standing
                            </span>
                          ) : null}
                          {it.quantity ? (
                            <span className="text-xs text-slate-500">
                              {it.quantity}
                            </span>
                          ) : null}
                        </span>
                        {it.for_recipes ? (
                          <span className="block text-[11px] text-slate-500">
                            for {it.for_recipes}
                          </span>
                        ) : null}
                        {priceLine(it)}
                        {it.notes ? (
                          <span className="mt-0.5 block text-[11px] text-amber-300/80">
                            {it.notes}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </main>
  );
}

function WeekPill({
  label,
  dateLabel,
  href,
  active,
}: {
  label: string;
  dateLabel: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex-1 rounded-2xl border px-3 py-2 text-center transition ${
        active
          ? "border-amber-400 bg-amber-500/20 text-amber-100"
          : "border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/20"
      }`}
    >
      <span className="block text-[11px] uppercase tracking-[0.14em]">
        {label}
      </span>
      <span className="block text-sm font-medium">{dateLabel}</span>
    </Link>
  );
}

function priceLine(it: Item) {
  if (it.coles_price == null && it.woolies_price == null) return null;
  const c = it.coles_price != null ? `$${it.coles_price.toFixed(2)}` : "—";
  const w = it.woolies_price != null ? `$${it.woolies_price.toFixed(2)}` : "—";
  const winner =
    it.cheaper_at === "coles"
      ? "Coles wins"
      : it.cheaper_at === "woolworths"
        ? "Woolies wins"
        : it.cheaper_at === "tie"
          ? "Tie"
          : "";
  return (
    <span className="block text-[11px] text-slate-500">
      Coles {c} · Woolies {w}
      {winner ? <span className="ml-2 text-amber-300">{winner}</span> : null}
    </span>
  );
}

function Total({
  label,
  amount,
  winner,
}: {
  label: string;
  amount: number;
  winner: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-2 py-2 ${
        winner
          ? "border-emerald-400/60 bg-emerald-900/20"
          : "border-white/10 bg-black/20"
      }`}
    >
      <p className="text-[10px] uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1 font-display text-xl font-bold ${
          winner ? "text-emerald-300" : "text-slate-100"
        }`}
      >
        ${amount.toFixed(2)}
      </p>
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}
