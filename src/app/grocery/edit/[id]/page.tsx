import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/brand/Header";
import {
  GroceryItemForm,
  type GroceryItemFormValues,
} from "@/components/grocery/GroceryItemForm";
import {
  planningWeekMonday,
  nextPlanningWeekMonday,
} from "@/lib/utils/rules";

export const dynamic = "force-dynamic";

export default async function EditGroceryItemPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { id } = await params;
  const { week } = await searchParams;

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("grocery_items")
    .select("id, item, quantity, aisle, notes, week_of, is_manual, is_standing")
    .eq("id", id)
    .maybeSingle();

  if (!row) notFound();

  // Figure out which week tab this row belongs to so we redirect back correctly.
  // If the row's week_of matches next-planning-week, we treat it as 'next'.
  // Honour an explicit ?week= query param if one is supplied.
  let slot: "current" | "next" = "current";
  if (week === "next") {
    slot = "next";
  } else if (week === "current") {
    slot = "current";
  } else if (row.week_of === nextPlanningWeekMonday()) {
    slot = "next";
  } else if (row.week_of === planningWeekMonday()) {
    slot = "current";
  }

  const initial: GroceryItemFormValues = {
    id: row.id,
    item: row.item,
    quantity: row.quantity,
    aisle: row.aisle,
    notes: row.notes,
  };

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header subtitle="Edit grocery item" />

      <Link
        href={`/grocery?week=${slot}`}
        className="mt-4 inline-block text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
      >
        ← Back to grocery
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-50">
        {row.item}
      </h1>

      {row.is_standing ? (
        <p className="mt-2 rounded-xl border border-amber-400/30 bg-amber-900/20 px-3 py-2 text-[11px] text-amber-200">
          Heads-up: this row was placed by your Standing items rule. Edits here
          override it for this week only. To change it for every week, edit the
          standing item itself on the grocery page.
        </p>
      ) : null}

      <GroceryItemForm
        mode="edit"
        initial={initial}
        weekMonday={row.week_of}
        slot={slot}
      />
    </main>
  );
}
