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
  // Returns ISO date (YYYY-MM-DD) for the Monday of the "current planning week",
  // computed in Australia/Melbourne so it matches the database.
  //
  // Rule: on Sunday we roll FORWARD to the upcoming Monday. The Saturday
  // auto-planner has already drafted next week's plan, Mon delivery is
  // tomorrow, and Lisa is mentally on next week — not the one ending today.
  // Mon..Sat: roll back to this week's Monday.
  const localStr = d.toLocaleDateString("en-CA", { timeZone: "Australia/Melbourne" });
  const local = new Date(localStr + "T00:00:00Z");
  const day = local.getUTCDay(); // 0 Sun .. 6 Sat
  if (day === 0) {
    local.setUTCDate(local.getUTCDate() + 1);
  } else {
    local.setUTCDate(local.getUTCDate() - (day - 1));
  }
  return local.toISOString().slice(0, 10);
}

export function nextPlanningWeekMonday(d: Date = new Date()): string {
  const this_mon = planningWeekMonday(d);
  const dt = new Date(this_mon + "T00:00:00Z");
  dt.setUTCDate(dt.getUTCDate() + 7);
  return dt.toISOString().slice(0, 10);
}
