/**
 * Small "✓ message" banner shown when a server action redirects with a
 * success query param (?added=1, ?saved=1, ?removed=1). Static — clears on
 * next navigation.
 */
export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-700/40 bg-emerald-900/30 px-4 py-3 text-sm text-emerald-200"
    >
      <span aria-hidden>✓</span>
      <span>{message}</span>
    </div>
  );
}
