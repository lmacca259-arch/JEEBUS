import Link from "next/link";
import { Header } from "@/components/brand/Header";
import { GroceryItemForm } from "@/components/grocery/GroceryItemForm";
import {
  planningWeekMonday,
  nextPlanningWeekMonday,
} from "@/lib/utils/rules";

export const dynamic = "force-dynamic";

export default async function NewGroceryItemPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const slot: "current" | "next" = week === "next" ? "next" : "current";
  const monday =
    slot === "next" ? nextPlanningWeekMonday() : planningWeekMonday();

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header subtitle={`Add to ${slot === "next" ? "next" : "this"} week's list`} />

      <Link
        href={`/grocery?week=${slot}`}
        className="mt-4 inline-block text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
      >
        ← Back to grocery
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-50">
        New item
      </h1>

      <p className="mt-2 text-sm text-slate-400">
        This row is yours — Rebuild from meal plan won&apos;t touch it.
      </p>

      <GroceryItemForm mode="new" weekMonday={monday} slot={slot} />
    </main>
  );
}
