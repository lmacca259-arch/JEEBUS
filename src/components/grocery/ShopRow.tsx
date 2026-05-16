"use client";

import Link from "next/link";
import { toggleGotIt } from "@/app/actions/grocery";

export type ShopRowItem = {
  id: string;
  item: string;
  quantity: string | null;
  for_recipes: string | null;
  notes: string | null;
  coles_price: number | null;
  woolies_price: number | null;
  cheaper_at: "coles" | "woolworths" | "tie" | "not_found" | null;
  got_it: boolean;
  is_standing: boolean;
  is_manual: boolean;
};

type Props = {
  row: ShopRowItem;
  shopMode: "coles" | "woolies" | null;
  ownShopUrl: string | null;
  slot: "current" | "next";
};

export function ShopRow({ row, shopMode, ownShopUrl, slot }: Props) {
  // Main row tap: open THIS item on the shop tab AND tick it.
  // Only opens when ticking (not when un-ticking an already-done row).
  function openAndTick() {
    if (!row.got_it && shopMode && ownShopUrl) {
      window.open(ownShopUrl, "hyetas-shop");
    }
  }

  const showSkip = shopMode !== null && !row.got_it;
  const showEdit = !row.got_it;

  return (
    <form action={toggleGotIt} className="flex items-stretch gap-1.5">
      <input type="hidden" name="id" value={row.id} />
      <input type="hidden" name="next" value={(!row.got_it).toString()} />
      <button
        type="submit"
        onClick={openAndTick}
        className={`flex flex-1 items-start gap-3 rounded-2xl border px-3 py-2.5 text-left transition ${
          row.got_it
            ? "border-white/5 bg-white/[0.02] text-slate-500"
            : "border-white/10 bg-white/[0.04] hover:border-amber-500/50"
        }`}
      >
        <span
          className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
            row.got_it
              ? "border-emerald-500 bg-emerald-500 text-slate-950"
              : "border-slate-600"
          }`}
          aria-hidden
        >
          {row.got_it ? "✓" : ""}
        </span>
        <span className="flex-1">
          <span className="flex items-baseline gap-2">
            <span
              className={`text-sm ${
                row.got_it ? "line-through" : "text-slate-100"
              }`}
            >
              {row.item}
            </span>
            {row.is_standing ? (
              <span className="text-[10px] uppercase tracking-wider text-amber-300">
                standing
              </span>
            ) : null}
            {row.is_manual && !row.is_standing ? (
              <span className="text-[10px] uppercase tracking-wider text-violet-300">
                yours
              </span>
            ) : null}
            {row.quantity ? (
              <span className="text-xs text-slate-500">{row.quantity}</span>
            ) : null}
          </span>
          {row.for_recipes ? (
            <span className="block text-[11px] text-slate-500">
              for {row.for_recipes}
            </span>
          ) : null}
          <PriceLine row={row} />
          {row.notes ? (
            <span className="mt-0.5 block text-[11px] text-amber-300/80">
              {row.notes}
            </span>
          ) : null}
        </span>
      </button>
      {showEdit ? (
        <Link
          href={`/grocery/edit/${row.id}?week=${slot}`}
          aria-label={`Edit ${row.item}`}
          title="Edit"
          className="flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-base text-slate-400 transition hover:border-amber-500/50 hover:text-amber-300"
        >
          ✏
        </Link>
      ) : null}
      {showSkip ? (
        <button
          type="submit"
          aria-label="Skip — I already have this"
          title="Skip — I already have this"
          className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-base text-slate-300 transition hover:border-amber-500/50 hover:text-amber-300"
        >
          ↷
        </button>
      ) : null}
    </form>
  );
}

function PriceLine({ row }: { row: ShopRowItem }) {
  if (row.coles_price == null && row.woolies_price == null) return null;
  const c =
    row.coles_price != null ? `$${row.coles_price.toFixed(2)}` : "—";
  const w =
    row.woolies_price != null ? `$${row.woolies_price.toFixed(2)}` : "—";
  const winner =
    row.cheaper_at === "coles"
      ? "Coles wins"
      : row.cheaper_at === "woolworths"
        ? "Woolies wins"
        : row.cheaper_at === "tie"
          ? "Tie"
          : "";
  return (
    <span className="block text-[11px] text-slate-500">
      Coles {c} · Woolies {w}
      {winner ? <span className="ml-2 text-amber-300">{winner}</span> : null}
    </span>
  );
}
