import {
  addGroceryItem,
  updateGroceryItem,
  removeGroceryItem,
} from "@/app/actions/grocery";

const AISLE_OPTIONS = [
  "Produce",
  "Protein",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Frozen",
  "Beverages",
  "Household",
  "Other",
];

export type GroceryItemFormValues = {
  id?: string;
  item?: string;
  quantity?: string | null;
  aisle?: string | null;
  notes?: string | null;
};

export function GroceryItemForm({
  initial,
  mode,
  weekMonday,
  slot,
}: {
  initial?: GroceryItemFormValues;
  mode: "new" | "edit";
  /** ISO Monday of the week this row belongs to. */
  weekMonday: string;
  /** Drives where we redirect after save (`current` or `next`). */
  slot: "current" | "next";
}) {
  const action = mode === "new" ? addGroceryItem : updateGroceryItem;
  const v: GroceryItemFormValues = initial ?? {};

  return (
    <form action={action} className="mt-6 space-y-4">
      {mode === "edit" && v.id ? (
        <input type="hidden" name="id" value={v.id} />
      ) : null}
      <input type="hidden" name="week" value={weekMonday} />
      <input type="hidden" name="slot" value={slot} />

      <Field label="Item">
        <input
          name="item"
          required
          defaultValue={v.item ?? ""}
          placeholder="e.g. ice cream, batteries, dish soap"
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Quantity (optional)">
          <input
            name="quantity"
            defaultValue={v.quantity ?? ""}
            placeholder="e.g. 2 tubs, 500g"
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
          />
        </Field>
        <Field label="Aisle">
          <select
            name="aisle"
            defaultValue={v.aisle ?? "Other"}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
          >
            {AISLE_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Note (optional)">
        <input
          name="notes"
          defaultValue={v.notes ?? ""}
          placeholder="Anything to remember when buying it"
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none"
        />
      </Field>

      <button
        type="submit"
        className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
      >
        {mode === "new" ? "Add item" : "Save changes"}
      </button>

      {mode === "edit" && v.id ? (
        <p className="text-center text-[10px] text-slate-500">
          Saving marks this row as yours — Rebuild from meal plan will leave it
          alone.
        </p>
      ) : null}

      {mode === "edit" && v.id ? (
        <RemoveButton id={v.id} slot={slot} item={v.item ?? "this item"} />
      ) : null}
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function RemoveButton({
  id,
  slot,
  item,
}: {
  id: string;
  slot: "current" | "next";
  item: string;
}) {
  return (
    <form action={removeGroceryItem} className="pt-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slot" value={slot} />
      <button
        type="submit"
        className="w-full rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/15"
        aria-label={`Remove ${item}`}
      >
        Remove from list
      </button>
    </form>
  );
}
