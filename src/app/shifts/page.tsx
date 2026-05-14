import Link from "next/link";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/brand/Header";
import { Toast } from "@/components/brand/Toast";
import { memberStyle } from "@/lib/brand/memberStyle";

export const dynamic = "force-dynamic";

type EnrichedShift = {
  shift_id: string;
  member_id: string;
  member_name: string;
  shift_type: string;
  starts_at: string;
  ends_at: string;
  location: string | null;
  notes: string | null;
  shift_date: string; // YYYY-MM-DD
  is_last_in_block: boolean;
};

function fmtDate(iso: string): string {
  // shift_date is a plain YYYY-MM-DD (no time). Treat as local.
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function fmtDateRange(start: string, end: string): string {
  const [, , dStart] = start.split("-").map(Number);
  const [yEnd, mEnd, dEnd] = end.split("-").map(Number);
  const monthEnd = new Date(Date.UTC(yEnd, mEnd - 1, dEnd)).toLocaleDateString(
    "en-AU",
    { month: "short", timeZone: "UTC" },
  );
  if (start === end) return `${monthEnd} ${dEnd}`;
  return `${monthEnd} ${dStart}–${dEnd}`;
}

function todayMelbourneISO(): string {
  // Returns today's date in Australia/Melbourne as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Melbourne",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function ShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string; saved?: string; removed?: string }>;
}) {
  const { added, saved, removed } = await searchParams;
  const toastMessage = added
    ? "Shift added"
    : saved
      ? "Changes saved"
      : removed
        ? "Shift removed"
        : null;

  const supabase = await createClient();
  const cookieStore = await cookies();
  const memberId = cookieStore.get("hyetas_member_id")?.value ?? null;

  let memberName: string | null = null;
  if (memberId) {
    const { data: m } = await supabase
      .from("members")
      .select("name")
      .eq("id", memberId)
      .maybeSingle();
    memberName = m?.name ?? null;
  }

  const today = todayMelbourneISO();

  // Cut-off: show shifts from 14 days ago onward so Lisa keeps context on
  // a block she just finished. The kerned-up past gets greyed out.
  const cutoff = new Date(today + "T00:00:00Z");
  cutoff.setUTCDate(cutoff.getUTCDate() - 14);
  const cutoffIso = cutoff.toISOString();

  let shifts: EnrichedShift[] = [];
  if (memberId) {
    const { data: rows } = await supabase
      .from("v_shifts_enriched")
      .select(
        "shift_id, member_id, member_name, shift_type, starts_at, ends_at, location, notes, shift_date, is_last_in_block",
      )
      .eq("member_id", memberId)
      .gte("starts_at", cutoffIso)
      .order("starts_at");
    shifts = (rows as unknown as EnrichedShift[] | null) ?? [];
  }

  // Group consecutive shifts into blocks.
  const blocks: EnrichedShift[][] = [];
  let current: EnrichedShift[] = [];
  for (const s of shifts) {
    current.push(s);
    if (s.is_last_in_block) {
      blocks.push(current);
      current = [];
    }
  }
  if (current.length) blocks.push(current);

  const upcomingShifts = shifts.filter((s) => s.shift_date >= today);
  const upcomingBlocks = blocks.filter((b) => b[b.length - 1].shift_date >= today);

  const accent = memberStyle(memberName ?? "Family").accent;

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header
        subtitle={
          memberName
            ? `${upcomingShifts.length} shifts coming up · ${upcomingBlocks.length} ${upcomingBlocks.length === 1 ? "block" : "blocks"}`
            : "Pick a person first"
        }
        rightSlot={
          memberName ? (
            <Link
              href="/shifts/new"
              className="rounded-xl bg-amber-300 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-950 hover:bg-amber-200"
            >
              + Add
            </Link>
          ) : null
        }
      />

      <Toast message={toastMessage} />

      <Link
        href="/"
        className="mt-4 inline-block text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
      >
        ← Tonight
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-50">
        {memberName ? `${memberName}'s roster` : "Your roster"}
      </h1>

      {!memberName ? (
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
          Switch user on the Tonight page, then come back here.
        </p>
      ) : shifts.length === 0 ? (
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
          <p>No shifts on your roster yet.</p>
          <p className="mt-2 text-slate-500">
            Tap <span className="text-amber-300">+ Add</span> to put one in.
          </p>
        </section>
      ) : (
        <div className="mt-8 space-y-6">
          {blocks.map((block, blockIdx) => {
            const lastDate = block[block.length - 1].shift_date;
            const isPast = lastDate < today;
            const firstDate = block[0].shift_date;
            const containsToday =
              block.some((b) => b.shift_date === today);
            const nights = block.length;
            return (
              <section
                key={blockIdx}
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: containsToday ? accent : "transparent",
                }}
                className={`overflow-hidden rounded-3xl border bg-white/[0.04] ${
                  isPast
                    ? "border-white/5 opacity-60"
                    : "border-white/10"
                }`}
              >
                <header
                  className="px-5 pt-4 pb-3"
                  style={{
                    background: isPast
                      ? "transparent"
                      : `linear-gradient(135deg, ${accent}22, ${accent}08)`,
                  }}
                >
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    {isPast
                      ? "Past block"
                      : containsToday
                        ? "This block · in progress"
                        : "Upcoming block"}
                  </p>
                  <p className="mt-0.5 font-display text-xl font-bold text-slate-50">
                    {fmtDateRange(firstDate, lastDate)}{" "}
                    <span className="text-sm font-medium text-slate-400">
                      · {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                  </p>
                </header>

                <ul className="divide-y divide-white/5">
                  {block.map((s) => {
                    const isToday = s.shift_date === today;
                    return (
                      <li key={s.shift_id}>
                        <Link
                          href={`/shifts/${s.shift_id}`}
                          className="flex items-center gap-3 px-5 py-3 transition hover:bg-white/[0.04]"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-100">
                              {fmtDate(s.shift_date)}
                              {isToday ? (
                                <span
                                  className="ml-2 rounded-full px-2 py-0.5 align-middle text-[10px] uppercase tracking-wider"
                                  style={{
                                    background: `${accent}33`,
                                    color: accent,
                                  }}
                                >
                                  Today
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-500">
                              {s.shift_type} · 9 PM → 7:30 AM
                              {s.location ? ` · ${s.location}` : ""}
                            </p>
                          </div>
                          {s.is_last_in_block ? (
                            <span
                              className="rounded-full border border-amber-300/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-200/90"
                              title="Sleep until 2:30 PM the day after this shift"
                            >
                              Last night
                            </span>
                          ) : null}
                          <span className="text-slate-500" aria-hidden>
                            ›
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-12 text-center text-[10px] uppercase tracking-wider text-slate-600">
        gaps make blocks. add a night, blocks update.
      </p>
    </main>
  );
}
