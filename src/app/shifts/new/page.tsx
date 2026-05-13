import Link from "next/link";
import { Header } from "@/components/brand/Header";
import { ShiftForm } from "@/components/shifts/ShiftForm";

export const dynamic = "force-dynamic";

export default async function NewShiftPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header subtitle="Add a Night.1 shift to your roster" />

      <Link
        href="/shifts"
        className="mt-4 inline-block text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
      >
        ← Your roster
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-50">
        New shift
      </h1>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-700/40 bg-rose-900/30 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </p>
      ) : null}

      <ShiftForm mode="new" />
    </main>
  );
}
