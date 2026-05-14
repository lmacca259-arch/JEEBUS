import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Header } from "@/components/brand/Header";
import { ShiftForm, type ShiftFormValues } from "@/components/shifts/ShiftForm";

export const dynamic = "force-dynamic";

export default async function EditShiftPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  type ShiftRow = {
    shift_id: string;
    member_name: string;
    shift_type: string;
    shift_date: string;
    is_last_in_block: boolean;
  };

  const { data: rawShift } = await supabase
    .from("v_shifts_enriched")
    .select("shift_id, member_name, shift_type, shift_date, is_last_in_block")
    .eq("shift_id", id)
    .maybeSingle();
  const shift = rawShift as unknown as ShiftRow | null;

  if (!shift) notFound();

  const initial: ShiftFormValues = {
    id: shift.shift_id,
    shift_date: shift.shift_date,
  };

  return (
    <main className="mx-auto max-w-md px-6 pt-10 pb-8">
      <Header subtitle={`Edit ${shift.shift_type} shift`} />

      <Link
        href="/shifts"
        className="mt-4 inline-block text-[10px] uppercase tracking-[0.18em] text-slate-500 hover:text-slate-300"
      >
        ← Your roster
      </Link>

      <h1 className="mt-3 font-display text-3xl font-bold text-slate-50">
        {shift.shift_type}
        {shift.is_last_in_block ? (
          <span className="ml-3 align-middle rounded-full border border-amber-300/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-200/90">
            Last night
          </span>
        ) : null}
      </h1>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-rose-700/40 bg-rose-900/30 px-4 py-3 text-sm text-rose-300"
        >
          {error}
        </p>
      ) : null}

      <ShiftForm initial={initial} mode="edit" />
    </main>
  );
}
