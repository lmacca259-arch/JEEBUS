"use client";

import Link from "next/link";

type ShopMode = "coles" | "woolies" | null;

type Props = {
  shopMode: ShopMode;
  weekParam: "current" | "next";
  firstShopUrl: string | null;
  remainingCount: number;
};

const STORE_LABEL: Record<"coles" | "woolies", string> = {
  coles: "Coles",
  woolies: "Woolworths",
};

export function ShopModeBanner({
  shopMode,
  weekParam,
  firstShopUrl,
  remainingCount,
}: Props) {
  if (!shopMode) {
    return (
      <section className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
        <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">
          Shop the list at
        </p>
        <div className="mt-2 flex gap-2">
          <Link
            href={`/grocery?week=${weekParam}&shop=coles`}
            className="flex-1 rounded-xl border border-rose-500/40 bg-rose-900/20 px-3 py-2 text-center text-sm font-medium text-rose-100 transition hover:bg-rose-900/30"
          >
            🛒 Coles
          </Link>
          <Link
            href={`/grocery?week=${weekParam}&shop=woolies`}
            className="flex-1 rounded-xl border border-emerald-500/40 bg-emerald-900/20 px-3 py-2 text-center text-sm font-medium text-emerald-100 transition hover:bg-emerald-900/30"
          >
            🛒 Woolworths
          </Link>
        </div>
      </section>
    );
  }

  const storeName = STORE_LABEL[shopMode];
  const accent =
    shopMode === "coles"
      ? "border-rose-500/40 bg-rose-900/20 text-rose-100"
      : "border-emerald-500/40 bg-emerald-900/20 text-emerald-100";

  function startShopping() {
    if (firstShopUrl) {
      window.open(firstShopUrl, "hyetas-shop");
    }
  }

  return (
    <section
      className={`mt-3 rounded-2xl border ${accent} p-3`}
      role="status"
    >
      <p className="text-sm font-medium">
        🛒 Shopping at {storeName}
      </p>
      <p className="mt-0.5 text-[11px] opacity-80">
        Tap an item to view + tick it. Use ↷ to skip what you already have.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={startShopping}
          disabled={!firstShopUrl}
          className="flex-1 rounded-xl bg-white/15 px-3 py-1.5 text-sm font-medium transition hover:bg-white/25 disabled:opacity-40"
        >
          {remainingCount > 0
            ? `Open first item${remainingCount > 1 ? ` (of ${remainingCount})` : ""}`
            : "All ticked — well done"}
        </button>
        <Link
          href={`/grocery?week=${weekParam}`}
          className="rounded-xl border border-white/20 px-3 py-1.5 text-sm font-medium transition hover:bg-white/10"
        >
          Stop
        </Link>
      </div>
    </section>
  );
}
