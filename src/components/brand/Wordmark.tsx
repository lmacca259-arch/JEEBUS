type Props = {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const SIZES = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-5xl",
  xl: "text-6xl",
};

export function Wordmark({ size = "md", className = "" }: Props) {
  return (
    <span
      className={`font-display font-bold tracking-tight text-amber-300 ${SIZES[size]} ${className}`}
      style={{ letterSpacing: "-0.02em" }}
    >
      HYETAS
    </span>
  );
}
