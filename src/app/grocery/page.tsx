import { createClient } from "@/lib/supabase/server";
import { toggleGotIt } from "@/app/actions/grocery";
import { planningWeekMonday } from "@/lib/utils/rules";

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

export default async function GroceryPage() {
  const supabase = await createClient();
  const monday = planningWeekMonday();

  const { data: rows } = await supabase
    .from("grocery_items")
    .select(
      "id, item, quantity, aisle, for_recipes, notes, coles_price, woolies_price, best_price, cheaper_at, got_it, is_standing",
    )
    .eq("week_of", monday)
    .order("aisle")
    .order("item");

  const items = (rows as Item[] | null) ?? [];

  // Group by aisle in our preferred order
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

  // Totals from priced items only
  const colesTotal = items.reduce((s, i) => s + (i.coles_price ?? 0), 0);
  const wooliesTotal = items.reduce((s, i) => s + (i.woolies_price ?? 0), 0);
  const bestTotal = items.reduce((s, i) => s + (i.best_price ?? 0), 0);
  const pricedCount = items.filter((i) => i.best_price != null).length;
  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.got_it).length;

  return (
    <main className="mx-auto max-w-md px-6 pb-8 pt-12">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Grocery list</h1>
          <p className="mt-1 text-sm text-slate-400">
            Week of {fmt(monday)} · {checkedCount} of {totalCount} ticked
          </p>
        </div>
      </header>

      {pricedCount > 0 ? (
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Priced ({pricedCount} items)
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Total label="Coles" amount={colesTotal} winner={colesTotal <= wooliesTotal && colesTotal <= bestTotal} />
            <Total label="Woolies" amount={wooliesTotal} winner={wooliesTotal < colesTotal && wooliesTotal <= bestTotal} />
            <Total label="Best mix" amount={bestTotal} winner={bestTotal < colesTotal && bestTotal < wooliesTotal} />
          </div>
        </section>
      ) : null}

      <section className="mt-6 space-y-6">
        {orderedAisles.map((aisle) => (
          <div key={aisle}>
            <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              {aisle}
            </h2>
            <ul className="mt-2 space-y-1">
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
                      className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left transition ${
                        it.got_it
                          ? "border-slate-800/60 bg-slate-900/40 text-slate-500"
                          : "border-slate-800 bg-slate-900 hover:border-emerald-600"
                      }`}
                    >
                      <span
                        className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
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
                            <span className="text-[10px] uppercase tracking-wider text-amber-400">
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
                          <span className="mt-0.5 block text-[11px] text-amber-400/80">
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
      {winner ? <span className="ml-2 text-emerald-400">{winner}</span> : null}
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
      className={`rounded-lg border px-2 py-2 ${
        winner
          ? "border-emerald-500/60 bg-emerald-900/20"
          : "border-slate-800 bg-slate-950"
      }`}
    >
      <p className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p
        className={`mt-1 text-base font-semibold ${
          winner ? "text-emerald-300" : "text-slate-200"
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
