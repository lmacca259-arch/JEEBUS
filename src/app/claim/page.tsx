import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { claim } from "./actions";

export const dynamic = "force-dynamic";

type UnclaimedMember = {
  id: string;
  name: string;
  role: string;
  household_name: string;
};

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // If already claimed, jump home.
  const { data: existing } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) redirect("/");

  const { data: members, error: rpcError } = await supabase.rpc(
    "list_unclaimed_members",
  );

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 py-12">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Who are you?</h1>
        <p className="mt-2 text-sm text-slate-400">
          Pick yourself once. We&apos;ll remember after that.
        </p>
      </header>

      <section className="mt-12 space-y-3">
        {rpcError ? (
          <p className="text-sm text-rose-400">
            Couldn&apos;t load the family. Refresh and try again.
          </p>
        ) : null}

        {(members as UnclaimedMember[] | null)?.length ? (
          (members as UnclaimedMember[]).map((m) => (
            <form key={m.id} action={claim}>
              <input type="hidden" name="member_id" value={m.id} />
              <button
                type="submit"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900 px-5 py-4 text-left transition hover:border-emerald-500"
              >
                <p className="text-lg font-medium">{m.name}</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                  {m.role} · {m.household_name}
                </p>
              </button>
            </form>
          ))
        ) : (
          <p className="text-sm text-slate-400">
            Everyone has already been claimed. Check with whoever set this up.
          </p>
        )}

        {error ? (
          <p className="mt-4 text-sm text-rose-400" role="alert">
            {error}
          </p>
        ) : null}
      </section>

      <form
        action="/auth/signout"
        method="post"
        className="mt-auto pt-12"
      >
        <button
          type="submit"
          className="text-[10px] uppercase tracking-wider text-slate-600 hover:text-slate-400"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
