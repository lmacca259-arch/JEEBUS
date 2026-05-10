"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Tab = {
  href: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const stroke = (active: boolean) => (active ? "#fbbf24" : "#94a3b8");

const TABS: Tab[] = [
  {
    href: "/",
    label: "Tonight",
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M20 14.5A8 8 0 1 1 9.5 4 6.5 6.5 0 0 0 20 14.5Z"
          stroke={stroke(active)}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/meals",
    label: "Meals",
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M4 3v8a3 3 0 0 0 3 3v7M7 3v8M10 3v8M16 3c-1.7 1-3 3-3 5s1.3 4 3 5v8"
          stroke={stroke(active)}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/grocery",
    label: "Grocery",
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M3 4h2l2.4 11.5a2 2 0 0 0 2 1.5h7.6a2 2 0 0 0 2-1.5L21 7H6"
          stroke={stroke(active)}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9.5" cy="20" r="1.5" stroke={stroke(active)} strokeWidth="2" />
        <circle cx="17.5" cy="20" r="1.5" stroke={stroke(active)} strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: "/recipes",
    label: "Recipes",
    icon: (active) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path
          d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v17.5a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 20.5Z"
          stroke={stroke(active)}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M9 8h6M9 12h6M9 16h4"
          stroke={stroke(active)}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-white/5 bg-[#0b1220]/85 backdrop-blur supports-[backdrop-filter]:bg-[#0b1220]/65 pb-[env(safe-area-inset-bottom)]"
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
                className={`flex flex-col items-center gap-1 py-3 text-[11px] uppercase tracking-[0.16em] transition ${
                  active ? "text-amber-300" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.icon(active)}
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
