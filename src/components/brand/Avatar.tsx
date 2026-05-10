import { memberStyle } from "@/lib/brand/memberStyle";

type Props = {
  name: string;
  size?: number;
  className?: string;
};

/** Circular avatar with the member's initial on a per-person colour wash. */
export function Avatar({ name, size = 56, className = "" }: Props) {
  const { bg, ring, fg } = memberStyle(name);
  const initial = (name?.[0] ?? "?").toUpperCase();
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-display font-bold ${className}`}
      style={{
        width: size,
        height: size,
        background: bg,
        color: fg,
        boxShadow: `inset 0 0 0 3px ${ring}`,
        fontSize: size * 0.5,
      }}
      aria-label={name}
    >
      {initial}
    </span>
  );
}
