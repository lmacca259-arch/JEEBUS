import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/brand/Header";
import { Avatar } from "@/components/brand/Avatar";
import { addExpense, toggleSettled } from "@/app/actions/expenses";
import { markEarningPaid } from "@/app/actions/earnings";

export const dynamic = "force-dynamic";

type Member = { id: string; name: string; role: string };

type Expense = {
  id: string;
  item: string;
  amount: number;
  expense_date: string;
  category: string | null;
  settled: boolean;
  notes: string | null;
  paid_by: { id: string; name: string } | null;
};

type Earning = {
  id: string;
  chore_label: string;
  amount: number;
  earned_date: string;
  paid: boolean;
  notes: string | null;
  earner: { id: string; name: string } | null;
  owed_by: { id: string; name: string } | null;
};

const CATEGORY_EMOJI: Record<string, string> = {
  groceries: "🛒",
  bills: "💸",
  rent: "🏠",
  kids: "👶",
  eating_out: "🍽",
  other: "💼",
};

const CATEGORIES: { value: string; label: string }[] = [
  { value: "groceries", label: "Groceries" },
  { value: "bills", label: "Bills" },
  { value: "rent", label: "Rent" },
  { value: "kids", label: "Kids" },
  { value: "eating_out", label: "Eating out" },
  { value: "other", label: "Other" },
];

export default async function MoneyPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; error?: string }>;
}) {
  const { added, error } = await searchParams;
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("members")
    .select("id, name, role");
  const family: Member[] = members ?? [];
  const parents = family.filter((m) => m.role === "parent");
  const kids = family.filter((m) => m.role === "kid");

  const { data: expRows } = await supabase
    .from("expenses")
    .select(
      `id, item, amount, expense_date, category, settled, notes,
       paid_by:members!paid_by_member_id(id, name)`,
    )
    .order("expense_date", { ascending: false })
    .limit(40);
  const expenses = (expRows as unknown as Expense[] | null) ?? [];

  const { data: earnRows } = await supabase
    .from("kid_earnings")
    .select(
      `id, chore_label, amount, earned_date, paid, notes,
       earner:members!earned_by_member_id(id, name),
       owed_by:members!owed_by_member_id(id, name)`,
    )
    .order("earned_date", { ascending: false })
    .limit(40);
  const earnings = (earnRows as unknown as Earning[] | null) ?? [];

  /* -------------- Compute parent balance (unsettled only) -------------- */
  const totals = new Map<string, number>(); // member_id → unsettled paid
  for (const e of expenses) {
    if (e.settled) continue;
    if (!e.paid_by) continue;
    totals.set(e.paid_by.id, (totals.get(e.paid_by.id) ?? 0) + Number(e.amount));
  }
  const balanceLine = parentBalance(parents, totals);

  /* -------------- Compute per-kid earnings totals -------------- */
  const kidTotals = new Map<string, { owed: number; paid: number }>();
  for (const k of kids) kidTotals.set(k.id, { owed: 0, paid: 0 });
  for (const e of earnings) {
    if (!e.earner) continue;
    const t = kidTotals.get(e.earner.id);
    if (!t) continue;
    if (e.paid) t.paid += Number(e.amount);
    else t.owed += Number(e.amount);
  }

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header subtitle="Shared bills + kids' earnings" />

      {added ? (
        <p className="mt-6 rounded-xl border border-emerald-700/40 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-200">
          Added.
        </p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-rose-700/40 bg-rose-900/30 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </p>
      ) : null}

      {/* ============== SHARED BILLS ============== */}
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold text-slate-50">
          Shared bills
        </h2>
        <p className="mt-0.5 text-sm text-slate-400">Andrew + Lisa</p>

        <div
          className="mt-4 overflow-hidden rounded-3xl border border-white/10 p-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(56,189,248,0.18), rgba(251,113,133,0.14))",
          }}
        >
          <p className="text-[10px] uppercase tracking-[0.18em] text-slate-300/80">
            Outstanding (unsettled)
          </p>
          <p className="mt-1 font-display text-2xl font-bold text-slate-50">
            {balanceLine}
          </p>
        </div>

        <ul className="mt-4 space-y-2">
          {expenses.length === 0 ? (
            <li className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
              No expenses yet. Add one below.
            </li>
          ) : (
            expenses.map((e) => (
              <li key={e.id}>
                <form action={toggleSettled}>
                  <input type="hidden" name="id" value={e.id} />
                  <input
                    type="hidden"
                    name="next"
                    value={(!e.settled).toString()}
                  />
                  <button
                    type="submit"
                    className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                      e.settled
                        ? "border-white/5 bg-white/[0.02] text-slate-500"
                        : "border-white/10 bg-white/[0.04] hover:border-amber-500/50"
                    }`}
                  >
                    <span
                      className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                      aria-hidden
                    >
                      {CATEGORY_EMOJI[e.category ?? "other"] ?? "💼"}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            e.settled ? "line-through" : "text-slate-100"
                          }`}
                        >
                          {e.item}
                        </span>
                        <span
                          className={`font-display text-base font-bold ${
                            e.settled ? "text-slate-500" : "text-slate-50"
                          }`}
                        >
                          ${Number(e.amount).toFixed(2)}
                        </span>
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                        {e.paid_by ? (
                          <>
                            <span>Paid by {e.paid_by.name}</span>
                            <span className="text-slate-600">·</span>
                          </>
                        ) : null}
                        <span>{fmtDate(e.expense_date)}</span>
                        {e.settled ? (
                          <>
                            <span className="text-slate-600">·</span>
                            <span className="text-emerald-400">settled ✓</span>
                          </>
                        ) : null}
                      </span>
                      {e.notes ? (
                        <span className="mt-1 block text-[11px] text-slate-500">
                          {e.notes}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>

        {/* Add expense */}
        <details className="mt-5 group">
          <summary className="cursor-pointer rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-3 text-sm font-semibold text-amber-300 hover:border-amber-300/60">
            + Add expense
          </summary>
          <form
            action={addExpense}
            className="mt-3 space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
          >
            <Field label="What was it?">
              <input
                name="item"
                required
                placeholder="e.g. Coles delivery"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (AUD)">
                <input
                  name="amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </Field>
              <Field label="Date">
                <input
                  name="expense_date"
                  type="date"
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Paid by">
                <select
                  name="paid_by"
                  required
                  defaultValue={parents[0]?.id ?? ""}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Category">
                <select
                  name="category"
                  defaultValue="groceries"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Notes (optional)">
              <input
                name="notes"
                placeholder="Anything to remember"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
              />
            </Field>
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
            >
              Save expense
            </button>
          </form>
        </details>
      </section>

      {/* ============== KIDS' EARNINGS ============== */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-bold text-slate-50">
          Kids&apos; earnings
        </h2>
        <p className="mt-0.5 text-sm text-slate-400">Pocket money owed</p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {kids.map((k) => {
            const t = kidTotals.get(k.id) ?? { owed: 0, paid: 0 };
            return (
              <div
                key={k.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-center gap-2">
                  <Avatar name={k.name} size={36} />
                  <span className="font-display text-lg font-bold text-slate-100">
                    {k.name}
                  </span>
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Owed
                </p>
                <p className="font-display text-2xl font-bold text-emerald-300">
                  ${t.owed.toFixed(2)}
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Paid all-time
                </p>
                <p className="text-base font-semibold text-slate-300">
                  ${t.paid.toFixed(2)}
                </p>
              </div>
            );
          })}
        </div>

        <ul className="mt-5 space-y-2">
          {earnings.length === 0 ? (
            <li className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-400">
              No earnings yet. Paid chores (Lawn mow, Pull weeds) auto-log here when
              the kid taps Done.
            </li>
          ) : (
            earnings.map((e) => (
              <li key={e.id}>
                <form action={markEarningPaid}>
                  <input type="hidden" name="id" value={e.id} />
                  <input
                    type="hidden"
                    name="next"
                    value={(!e.paid).toString()}
                  />
                  <button
                    type="submit"
                    className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                      e.paid
                        ? "border-white/5 bg-white/[0.02] text-slate-500"
                        : "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-400/60"
                    }`}
                  >
                    {e.earner ? (
                      <Avatar name={e.earner.name} size={36} />
                    ) : null}
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            e.paid ? "line-through" : "text-slate-100"
                          }`}
                        >
                          {e.chore_label}
                        </span>
                        <span
                          className={`font-display text-base font-bold ${
                            e.paid ? "text-slate-500" : "text-emerald-300"
                          }`}
                        >
                          ${Number(e.amount).toFixed(2)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        {e.earner?.name ?? "?"} ·{" "}
                        {e.owed_by ? `from ${e.owed_by.name}` : ""} ·{" "}
                        {fmtDate(e.earned_date)}
                        {e.paid ? (
                          <span className="ml-1 text-emerald-400">· paid ✓</span>
                        ) : null}
                      </span>
                    </span>
                  </button>
                </form>
              </li>
            ))
          )}
        </ul>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
  });
}

function parentBalance(parents: Member[], totals: Map<string, number>): string {
  if (parents.length < 2) return "—";
  const [a, b] = parents;
  const aTotal = totals.get(a.id) ?? 0;
  const bTotal = totals.get(b.id) ?? 0;
  if (aTotal === 0 && bTotal === 0) return "All settled";
  // Whoever paid more is owed half the difference.
  const diff = Math.abs(aTotal - bTotal) / 2;
  if (aTotal > bTotal) {
    return `${b.name} → ${a.name}: $${diff.toFixed(2)}`;
  }
  if (bTotal > aTotal) {
    return `${a.name} → ${b.name}: $${diff.toFixed(2)}`;
  }
  return "Even split";
}
