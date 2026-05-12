// HYETAS Tonight page — auto-generates today's chores + shows shift banner.
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { markDone } from "@/app/actions/done";
import { pickMember } from "@/app/actions/whoami";
import { formatLocalTime } from "@/lib/utils/time";
import { Mascot } from "@/components/brand/Mascot";
import { Wordmark } from "@/components/brand/Wordmark";
import { Avatar } from "@/components/brand/Avatar";
import { Header } from "@/components/brand/Header";
import { memberStyle } from "@/lib/brand/memberStyle";

export const dynamic = "force-dynamic";

type Member = { id: string; name: string; role: string };

type TodayRow = {
  assignment_id: string;
  due_at: string;
  status: "pending" | "done" | "skipped" | "overdue";
  chore_id: string;
  chore_name: string;
  chore_instructions_md: string | null;
  chore_hero_photo_url: string | null;
  member_id: string;
  member_name: string;
  is_for_me: boolean;
};

const PICKER_ORDER: Record<string, number> = {
  Lisa: 0,
  Andrew: 1,
  Alex: 2,
  Hannah: 3,
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ done?: string; error?: string }>;
}) {
  const { done, error } = await searchParams;
  const supabase = await createClient();
  const cookieStore = await cookies();
  const memberId = cookieStore.get("hyetas_member_id")?.value ?? null;

  const { data: members } = await supabase
    .from("members")
    .select("id, name, role");

  const family: Member[] = (members ?? []).slice().sort((a, b) => {
    const ai = PICKER_ORDER[a.name] ?? 99;
    const bi = PICKER_ORDER[b.name] ?? 99;
    return ai - bi;
  });

  const me = memberId ? family.find((m) => m.id === memberId) : null;

  /* -------------- Picker (no cookie / unknown member) -------------- */
  if (!me) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-10 pb-12">
        <div className="flex flex-col items-center text-center">
          <Mascot size={120} />
          <Wordmark size="xl" className="mt-2" />
          <p className="mt-1 text-base text-slate-300">
            Have you ever seen a man throw a shoe.
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.18em] text-slate-500">
            Who&apos;s on this device?
          </p>
        </div>

        <section className="mt-6 grid grid-cols-2 gap-3">
          {family.map((m) => (
            <form key={m.id} action={pickMember}>
              <input type="hidden" name="member_id" value={m.id} />
              <button
                type="submit"
                className="flex w-full flex-col items-center gap-3 rounded-3xl border border-white/10 bg-white/[0.04] px-4 py-6 transition hover:bg-white/[0.08]"
              >
                <Avatar name={m.name} size={72} />
                <span className="text-2xl font-display font-bold text-slate-100">
                  {m.name}
                </span>
                <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  {m.role}
                </span>
              </button>
            </form>
          ))}
        </section>

        <p className="mt-auto pt-12 text-center text-[10px] uppercase tracking-wider text-slate-600">
          the system asks. you don&apos;t have to.
        </p>
      </main>
    );
  }

  /* -------------- Tonight view for the picked member -------------- */
  // Make sure today's chores have been generated from the rotation. Idempotent.
  await supabase.rpc("generate_assignments_for_today");

  const { data: rows } = await supabase.rpc("todays_assignments", {
    p_member_id: me.id,
  });
  const today = (rows as TodayRow[] | null) ?? [];

  // Anyone on a shift starting today (Melbourne)?
  const { data: shiftRows } = await supabase
    .from("v_todays_shifts")
    .select(
      "shift_id, member_id, member_name, shift_type, starts_at, ends_at, is_last_in_block",
    )
    .order("starts_at");
  const todaysShifts =
    (shiftRows as
      | {
          shift_id: string;
          member_id: string;
          member_name: string;
          shift_type: string;
          starts_at: string;
          ends_at: string;
          is_last_in_block: boolean;
        }[]
      | null) ?? [];

  // Next shift for the picked member (within the upcoming 14 days)
  const inFourteenDays = new Date();
  inFourteenDays.setDate(inFourteenDays.getDate() + 14);
  const { data: upcomingShifts } = await supabase
    .from("shifts")
    .select("starts_at, is_last_in_block")
    .eq("member_id", me.id)
    .gt("starts_at", new Date().toISOString())
    .lte("starts_at", inFourteenDays.toISOString())
    .order("starts_at")
    .limit(1);
  const nextShift = upcomingShifts?.[0] ?? null;

  const myPending = today.filter((r) => r.is_for_me && r.status === "pending");
  const myDone = today.filter((r) => r.is_for_me && r.status === "done");
  const otherToday = today.filter((r) => !r.is_for_me);

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header
        subtitle={`Hi, ${me.name}. The system is asking — not you.`}
        rightSlot={
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-[10px] uppercase tracking-wider text-slate-500 hover:text-slate-300"
            >
              Switch user
            </button>
          </form>
        }
      />

      {todaysShifts.map((s) => {
        const isMine = s.member_id === me.id;
        const sleepEnd = s.is_last_in_block ? "2:30 PM" : "5:30 PM";
        return (
          <div
            key={s.shift_id}
            className={`mt-6 overflow-hidden rounded-2xl border px-4 py-3 ${
              isMine
                ? "border-purple-500/40 bg-purple-500/10"
                : "border-white/10 bg-white/[0.04]"
            }`}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] text-purple-200/80">
              🏥 Tonight
            </p>
            <p className="mt-0.5 font-display text-xl font-bold text-slate-50">
              {isMine ? "You're" : `${s.member_name} is`} on {s.shift_type} ·{" "}
              9 PM → 7:30 AM
            </p>
            <p className="mt-0.5 text-xs text-slate-300">
              {isMine
                ? `Early dinner around 6 PM. Sleep tomorrow 9 AM – ${sleepEnd}.`
                : "Early dinner around 6 PM (before shift)."}
              {s.is_last_in_block ? " Last night of block." : ""}
            </p>
          </div>
        );
      })}

      {!todaysShifts.some((s) => s.member_id === me.id) && nextShift ? (
        <p className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-slate-400">
          🏥 Next shift:{" "}
          <span className="text-slate-200">
            {new Date(nextShift.starts_at).toLocaleDateString("en-AU", {
              weekday: "short",
              day: "numeric",
              month: "short",
              timeZone: "Australia/Melbourne",
            })}
          </span>
        </p>
      ) : null}

      {done ? (
        <p className="mt-6 rounded-xl border border-emerald-700/40 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-200">
          Logged. Receipt is in.
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

      <section className="mt-10 space-y-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          For you, tonight
        </p>

        {myPending.length === 0 && myDone.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
            <span className="mr-2">🛋️</span>Nothing on your plate. Sit on a couch.
          </div>
        ) : null}

        {myPending.map((row) => {
          const meAccent = memberStyle(me.name).accent;
          return (
          <article
            key={row.assignment_id}
            style={{ borderLeftWidth: "4px", borderLeftColor: meAccent }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-lg"
          >
            <div
              className="px-6 pt-5 pb-4"
              style={{
                background: `linear-gradient(135deg, ${meAccent}33, ${meAccent}10)`,
              }}
            >
              <p className="text-[10px] uppercase tracking-[0.20em] text-amber-300/90">
                Tonight
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-slate-50">
                {row.chore_name}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {row.member_name} · {formatLocalTime(row.due_at)}
              </p>
            </div>
            <div className="px-6 py-5">
              {row.chore_instructions_md ? (
                <details className="mb-5 group">
                  <summary className="cursor-pointer text-sm font-medium text-amber-300/90 group-open:text-amber-200">
                    How to (tap to open)
                  </summary>
                  <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
                    {row.chore_instructions_md}
                  </pre>
                </details>
              ) : null}
              <form action={markDone}>
                <input type="hidden" name="assignment_id" value={row.assignment_id} />
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-4 py-3.5 text-left transition hover:border-emerald-400 hover:bg-emerald-500/15"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-emerald-500"
                  />
                  <span className="text-sm font-semibold text-emerald-200">
                    Mark complete
                  </span>
                </button>
              </form>
            </div>
          </article>
          );
        })}

        {myDone.map((row) => (
          <article
            key={row.assignment_id}
            className="flex items-center gap-3 rounded-3xl border border-white/5 bg-white/[0.02] px-5 py-4 opacity-70"
          >
            <span
              aria-hidden
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-emerald-500 bg-emerald-500 text-slate-950"
            >
              ✓
            </span>
            <div className="flex-1">
              <p className="text-base font-medium text-slate-200 line-through decoration-emerald-500/60">
                {row.chore_name}
              </p>
              <p className="mt-0.5 text-xs uppercase tracking-wider text-emerald-400">
                Done
              </p>
            </div>
          </article>
        ))}
      </section>

      {otherToday.length > 0 ? (
        <section className="mt-10 space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            On other people today
          </p>
          {otherToday.map((row) => {
            const rowAccent = memberStyle(row.member_name).accent;
            return (
              <div
                key={row.assignment_id}
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: rowAccent,
                }}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                  row.status === "done"
                    ? "border-white/5 bg-white/[0.02] opacity-60"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <Avatar name={row.member_name} size={36} />
                <div className="flex-1">
                  <p
                    className={`text-slate-100 ${
                      row.status === "done" ? "line-through" : ""
                    }`}
                  >
                    {row.chore_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.member_name} ·{" "}
                    {row.status === "done"
                      ? "done ✓"
                      : formatLocalTime(row.due_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </section>
      ) : null}

      <p className="mt-12 text-center text-[10px] uppercase tracking-wider text-slate-600">
        the system asks. you don&apos;t have to.
      </p>
    </main>
  );
}
