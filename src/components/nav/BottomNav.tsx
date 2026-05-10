"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = { href: string; label: string; icon: string };

const TABS: Tab[] = [
  { href: "/", label: "Tonight", icon: "🌙" },
  { href: "/meals", label: "Meals", icon: "🍽" },
  { href: "/grocery", label: "Grocery", icon: "🛒" },
  { href: "/recipes", label: "Recipes", icon: "📖" },
];

export function BottomNav() {
  const pathname = usePathname();
  // Hide on the picker (root with no cookie redirects don't apply here, but the
  // server can still render this if memberId is set — see layout.tsx).
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-800 bg-slate-950/90 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((t) => {
          const active =
            t.href === "/"
              ? pathname === "/"
              : pathname === t.href || pathname.startsWith(t.href + "/");
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-0.5 py-3 text-[11px] uppercase tracking-[0.16em] transition ${
                  active ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <span className="text-lg" aria-hidden>
                  {t.icon}
                </span>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
