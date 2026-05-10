/**
 * Format an ISO timestamp in Australia/Melbourne local time.
 * Examples: "Sun 7:06 PM", "Tonight 7:06 PM"
 */
export function formatLocalTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-AU", {
    timeZone: "Australia/Melbourne",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatLocalDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-AU", {
    timeZone: "Australia/Melbourne",
    weekday: "long",
  });
}

export function isToday(iso: string): boolean {
  const d = new Date(iso);
  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Australia/Melbourne",
  });
  const dStr = d.toLocaleDateString("en-CA", {
    timeZone: "Australia/Melbourne",
  });
  return todayStr === dStr;
}
