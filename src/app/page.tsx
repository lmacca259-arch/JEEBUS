import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .select("*", { count: "exact", head: true });

  const dbStatus = error ? `db: ${error.message}` : "db: connected";

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">HYETAS</h1>
        <p className="mt-1 text-sm text-slate-400">
          Have you ever seen a man throw a shoe.
        </p>
      </header>

      <section className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
          Tonight
        </p>
        <p className="mt-3 text-xl font-medium">Bins go to the curb</p>
        <p className="mt-1 text-sm text-slate-400">Alex · Sunday 7:06pm</p>
        <button
          type="button"
          className="mt-6 w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-emerald-400"
        >
          Done — show me the photo
        </button>
      </section>

      <p className="mt-auto pt-12 text-[10px] uppercase tracking-wider text-slate-600">
        {dbStatus}
      </p>
    </main>
  );
}
