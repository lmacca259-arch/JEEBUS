import { addRecipe, updateRecipe, removeRecipe } from "@/app/actions/recipes";

const MEAL_TYPES = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
  { value: "side", label: "Side" },
];

const CONTAINS = [
  { value: "peanut", label: "Peanut" },
  { value: "avocado", label: "Avocado" },
  { value: "oats", label: "Oats" },
  { value: "banana_cooked", label: "Cooked banana" },
];

const INPUT =
  "w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 focus:border-amber-500 focus:outline-none";

const TEXTAREA =
  "w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-slate-100 leading-relaxed focus:border-amber-500 focus:outline-none";

export type RecipeFormValues = {
  id?: string;
  name?: string;
  cuisine?: string | null;
  meal_types?: string[] | null;
  servings?: number | null;
  prep_time_min?: number | null;
  is_kid_favourite?: boolean;
  contains?: string[] | null;
  ingredients_md?: string | null;
  instructions_md?: string | null;
  notes?: string | null;
};

export function RecipeForm({
  initial,
  mode,
}: {
  initial?: RecipeFormValues;
  mode: "new" | "edit";
}) {
  const action = mode === "new" ? addRecipe : updateRecipe;
  const v: RecipeFormValues = initial ?? {};
  const mealTypes = v.meal_types ?? [];
  const contains = v.contains ?? [];

  return (
    <form action={action} className="mt-6 space-y-4">
      {mode === "edit" && v.id ? (
        <input type="hidden" name="id" value={v.id} />
      ) : null}

      <Field label="Recipe name">
        <input
          name="name"
          required
          defaultValue={v.name ?? ""}
          placeholder="e.g. Spinach & Feta Pie"
          className={INPUT}
        />
      </Field>

      <Field label="Cuisine (optional)">
        <input
          name="cuisine"
          defaultValue={v.cuisine ?? ""}
          placeholder="e.g. Greek, Aussie, Italian"
          className={INPUT}
        />
      </Field>

      <Field label="Meal types (pick at least one)">
        <div className="grid grid-cols-2 gap-2">
          {MEAL_TYPES.map((t) => (
            <label
              key={t.value}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
            >
              <input
                type="checkbox"
                name="meal_types"
                value={t.value}
                defaultChecked={mealTypes.includes(t.value)}
                className="h-4 w-4 accent-amber-300"
              />
              <span className="text-xs text-slate-200">{t.label}</span>
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Servings">
          <input
            name="servings"
            type="number"
            min="1"
            defaultValue={v.servings != null ? String(v.servings) : "4"}
            className={INPUT}
          />
        </Field>
        <Field label="Prep time (min, optional)">
          <input
            name="prep_time_min"
            type="number"
            min="0"
            defaultValue={
              v.prep_time_min != null ? String(v.prep_time_min) : ""
            }
            placeholder="e.g. 30"
            className={INPUT}
          />
        </Field>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
        <input
          type="checkbox"
          name="is_kid_favourite"
          defaultChecked={v.is_kid_favourite ?? false}
          className="h-4 w-4 accent-amber-300"
        />
        <span className="text-sm text-slate-200">⭐ Kid favourite</span>
      </label>

      <Field label="Contains (household-relevant flags)">
        <div className="grid grid-cols-2 gap-2">
          {CONTAINS.map((c) => (
            <label
              key={c.value}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
            >
              <input
                type="checkbox"
                name="contains"
                value={c.value}
                defaultChecked={contains.includes(c.value)}
                className="h-4 w-4 accent-rose-400"
              />
              <span className="text-xs text-slate-200">{c.label}</span>
            </label>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Tick anything the recipe contains so warnings + auto-suggest filter
          it correctly.
        </p>
      </Field>

      <Field label="Ingredients">
        <textarea
          name="ingredients_md"
          rows={6}
          defaultValue={v.ingredients_md ?? ""}
          placeholder={
            "One per line — markdown supported:\n- 500g beef mince\n- 1 onion, diced\n- 2 cloves garlic"
          }
          className={TEXTAREA}
        />
      </Field>

      <Field label="Instructions">
        <textarea
          name="instructions_md"
          rows={6}
          defaultValue={v.instructions_md ?? ""}
          placeholder={
            "Numbered or freeform:\n1. Brown the mince\n2. Add onion and garlic\n3. Simmer 20 min"
          }
          className={TEXTAREA}
        />
      </Field>

      <Field label="Notes (optional)">
        <textarea
          name="notes"
          rows={2}
          defaultValue={v.notes ?? ""}
          placeholder="Family tweaks, who likes it, what to serve with..."
          className={TEXTAREA}
        />
      </Field>

      <button
        type="submit"
        className="w-full rounded-xl bg-amber-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-200"
      >
        {mode === "new" ? "Save recipe" : "Save changes"}
      </button>

      {mode === "edit" && v.id ? (
        <RemoveButton id={v.id} name={v.name ?? "this recipe"} />
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

function RemoveButton({ id, name }: { id: string; name: string }) {
  return (
    <form action={removeRecipe} className="pt-2">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="w-full rounded-xl border border-rose-500/30 bg-rose-500/5 px-4 py-2.5 text-sm font-semibold text-rose-300 transition hover:bg-rose-500/15"
        aria-label={`Remove ${name}`}
      >
        Remove recipe
      </button>
      <p className="mt-1.5 text-center text-[10px] text-slate-500">
        Keeps it linked to any past meal plans; just stops it appearing in the
        cookbook and auto-suggest.
      </p>
    </form>
  );
}
