import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { markDone } from "@/app/actions/done";
import { pickMember } from "@/app/actions/whoami";
import { formatLocalTime } from "@/lib/utils/time";

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

// Display order: Lisa first (her app), then Andrew, then the kids.
const PICKER_ORDER: Record<string, number> = {
  Lisa: 0,
  Andrew: 1,
  Alex: 2,
  Hannah: 3,
};

const ROLE_TINT: Record<string, string> = {
  parent: "border-emerald-700/60 hover:border-emerald-400",
  kid: "border-sky-700/60 hover:border-sky-400",
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

  // Always load the family — needed for both the picker and the header.
  const { data: members } = await supabase
    .from("members")
    .select("id, name, role");

  const family: Member[] = (members ?? []).slice().sort((a, b) => {
    const ai = PICKER_ORDER[a.name] ?? 99;
    const bi = PICKER_ORDER[b.name] ?? 99;
    return ai - bi;
  });

  const me = memberId ? family.find((m) => m.id === memberId) : null;

  // ----- Picker (no cookie yet, or cookie points at a stale member) -----
  if (!me) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-12">
        <header>
          <h1 className="text-3xl font-semibold tracking-tight">HYETAS</h1>
          <p className="mt-1 text-sm text-slate-400">Who&apos;s on this device?</p>
        </header>

        <section className="mt-12 grid grid-cols-2 gap-3">
          {family.map((m) => (
            <form key={m.id} action={pickMember}>
              <input type="hidden" name="member_id" value={m.id} />
              <button
                type="submit"
                className={`w-full rounded-2xl border bg-slate-900 px-5 py-8 text-left transition ${
                  ROLE_TINT[m.role] ?? "border-slate-800 hover:border-slate-500"
                }`}
              >
                <p className="text-2xl font-semibold">{m.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                  {m.role}
                </p>
              </button>
            </form>
          ))}
        </section>

        <p className="mt-auto pt-12 text-[10px] uppercase tracking-wider text-slate-600">
          the system asks. you don&apos;t have to.
        </p>
      </main>
    );
  }

  // ----- Tonight view for the picked member -----
  const { data: rows } = await supabase.rpc("todays_assignments", {
    p_member_id: me.id,
  });
  const today = (rows as TodayRow[] | null) ?? [];

  const myPending = today.filter((r) => r.is_for_me && r.status === "pending");
  const myDone = today.filter((r) => r.is_for_me && r.status === "done");
  const otherToday = today.filter((r) => !r.is_for_me);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-12">
      <header className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">HYETAS</h1>
          <p className="mt-1 text-sm text-slate-400">
            Hi, {me.name}. The system is asking — not Lisa.
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="text-[10px] uppercase tracking-wider text-slate-600 hover:text-slate-400"
          >
            Switch user
          </button>
        </form>
      </header>

      {done ? (
        <p className="mt-6 rounded-xl border border-emerald-700/40 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-300">
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
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-sm text-slate-400">
            Nothing on your plate. Sit on a couch.
          </div>
        ) : null}

        {myPending.map((row) => (
          <article
            key={row.assignment_id}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg"
          >
            <p className="text-xl font-medium">{row.chore_name}</p>
            <p className="mt-1 text-sm text-slate-400">
              {row.member_name} · {formatLocalTime(row.due_at)}
            </p>

            {row.chore_instructions_md ? (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-emerald-400 hover:text-emerald-300">
                  How to (tap to open)
                </summary>
                <pre className="mt-3 whitespace-pre-wrap text-sm text-slate-300">
                  {row.chore_instructions_md}
                </pre>
              </details>
            ) : null}

            <form action={markDone} className="mt-6">
              <input
                type="hidden"
                name="assignment_id"
                value={row.assignment_id}
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
              >
                Done
              </button>
            </form>
          </article>
        ))}

        {myDone.map((row) => (
          <article
            key={row.assignment_id}
            className="rounded-2xl border border-slate-800/60 bg-slate-900/60 p-6 opacity-70"
          >
            <p className="text-base font-medium line-through decoration-emerald-500/60">
              {row.chore_name}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wider text-emerald-500">
              Done ✓
            </p>
          </article>
        ))}
      </section>

      {otherToday.length > 0 ? (
        <section className="mt-10 space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
            Family today
          </p>
          {otherToday.map((row) => (
            <div
              key={row.assignment_id}
              className="rounded-xl border border-slate-800/60 bg-slate-900/40 px-4 py-3 text-sm"
            >
              <span className="text-slate-100">{row.chore_name}</span>
              <span className="ml-2 text-slate-500">
                {row.member_name} ·{" "}
                {row.status === "done" ? "done ✓" : formatLocalTime(row.due_at)}
              </span>
            </div>
          ))}
        </section>
      ) : null}

      <p className="mt-auto pt-12 text-[10px] uppercase tracking-wider text-slate-600">
        the system asks. you don&apos;t have to.
      </p>
    </main>
  );
}
