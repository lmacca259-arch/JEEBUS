/**
 * Map household-rule flags on a recipe to a per-member warning string.
 * Returns null if there's no conflict for that member.
 */
export function ruleWarning(
  contains: string[] | null | undefined,
  memberName: string | null | undefined,
): string | null {
  if (!contains?.length || !memberName) return null;

  if (memberName === "Lisa") {
    if (contains.includes("oats")) return "Lisa swap → yogurt + berries.";
    if (contains.includes("avocado")) return "Lisa swap → yogurt + berries.";
  }
  if (memberName === "Andrew" && contains.includes("banana_cooked")) {
    return "Andrew avoids cooked banana — use Buttermilk Pancakes.";
  }
  if (contains.includes("peanut")) {
    return "Contains peanut — household allergy. Skip.";
  }
  return null;
}

export function planningWeekMonday(d: Date = new Date()): string {
  // Returns ISO date (YYYY-MM-DD) for the Monday of the week containing d,
  // computed in Australia/Melbourne so it matches the database view.
  const localStr = d.toLocaleDateString("en-CA", { timeZone: "Australia/Melbourne" });
  const local = new Date(localStr + "T00:00:00");
  const day = local.getUTCDay(); // 0 Sun .. 6 Sat
  const offset = (day + 6) % 7; // distance back to Monday
  local.setUTCDate(local.getUTCDate() - offset);
  return local.toISOString().slice(0, 10);
}

export function nextPlanningWeekMonday(d: Date = new Date()): string {
  const this_mon = planningWeekMonday(d);
  const dt = new Date(this_mon + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() + 7);
  return dt.toISOString().slice(0, 10);
}
