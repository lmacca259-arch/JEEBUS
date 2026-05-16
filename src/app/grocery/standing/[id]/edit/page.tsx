import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/brand/Header";
import {
  updateStandingItem,
  removeStandingItem,
} from "@/app/actions/grocery";

export const dynamic = "force-dynamic";

const AISLE_OPTIONS = [
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

export default async function EditStandingItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("standing_items")
    .select("id, item, quantity, aisle, notes, home_only")
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header subtitle="Edit standing item" />

      <Link
        href="/grocery"
        className="mt-4 inline-block text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
      >
        ← Back to grocery
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-50">
        {row.item}
      </h1>

      <p className="mt-2 text-sm text-slate-400">
        Standing items get added to every weekly list when you tap Rebuild.
      </p>

      <form action={updateStandingItem} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={row.id} />

        <Field label="Item">
          <input
            name="item"
            required
            defaultValue={row.item}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Quantity (optional)">
            <input
              name="quantity"
              defaultValue={row.quantity ?? ""}
              placeholder="e.g. 1 tub, 500g"
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </Field>
          <Field label="Aisle">
            <select
              name="aisle"
              defaultValue={row.aisle ?? "Household"}
              className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              {AISLE_OPTIONS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Note (optional)">
          <input
            name="notes"
            defaultValue={row.notes ?? ""}
            placeholder="Anything to remember"
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
          />
        </Field>

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
          <input
            type="checkbox"
            name="home_only"
            defaultChecked={row.home_only}
            className="h-4 w-4 accent-amber-300"
          />
          <span className="text-sm text-slate-200">HOME weeks only</span>
          <span className="ml-auto text-[11px] text-slate-500">
            Skip when Hannah&apos;s away
          </span>
        </label>

        <button
          type="submit"
          className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
        >
          Save changes
        </button>
      </form>

      <form action={removeStandingItem} className="mt-3">
        <input type="hidden" name="id" value={row.id} />
        <button
          type="submit"
          className="w-full rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/15"
          aria-label={`Remove ${row.item}`}
        >
          Remove standing item
        </button>
      </form>
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
