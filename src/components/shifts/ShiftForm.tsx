import { addShift, updateShift, removeShift } from "@/app/actions/shifts";

export type ShiftFormValues = {
  id?: string;
  shift_date?: string; // YYYY-MM-DD
};

export function ShiftForm({
  initial,
  mode,
}: {
  initial?: ShiftFormValues;
  mode: "new" | "edit";
}) {
  const action = mode === "new" ? addShift : updateShift;
  const v: ShiftFormValues = initial ?? {};

  return (
    <form action={action} className="mt-6 space-y-4">
      {mode === "edit" && v.id ? (
        <input type="hidden" name="id" value={v.id} />
      ) : null}

      <label className="block">
        <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-slate-400">
          Shift date
        </span>
        <input
          name="shift_date"
          type="date"
          required
          defaultValue={v.shift_date ?? ""}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
        />
        <span className="mt-1 block text-[11px] text-slate-500">
          Night.1 · 9 PM → 7:30 AM Melbourne. Pick the date the shift starts.
        </span>
      </label>

      <div className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5 text-[11px] text-slate-400">
        Blocks update automatically. A shift is the last night of a block when
        there&apos;s no shift the next day. You sleep until 2:30 PM after a
        last-night shift, otherwise 5:30 PM.
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
      >
        {mode === "new" ? "Add shift" : "Save changes"}
      </button>

      {mode === "edit" && v.id ? (
        <RemoveButton id={v.id} />
      ) : null}
    </form>
  );
}

function RemoveButton({ id }: { id: string }) {
  return (
    <form action={removeShift} className="pt-2">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="w-full rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/15"
        aria-label="Remove this shift"
      >
        Remove shift
      </button>
      <p className="mt-1.5 text-center text-[10px] text-slate-500">
        Permanently removes this one shift from your roster.
      </p>
    </form>
  );
}
