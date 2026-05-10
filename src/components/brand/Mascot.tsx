/**
 * The HYETAS mascot: yellow cartoon guy mid-throw, shoe arcing through the air.
 * Simpsons-adjacent on purpose (Lisa & Andrew met over the quote), but
 * deliberately off-model so it's legally distinct: stubby hair tuft, broad
 * grin, no Homer signature 2-hair-strand silhouette.
 */
type Props = {
  size?: number;
  className?: string;
};

export function Mascot({ size = 64, className }: Props) {
  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="HYETAS mascot — a cartoon character throwing a shoe"
    >
      {/* Speed swooshes behind the throw */}
      <path
        d="M120 110 Q150 90 175 78"
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
      <path
        d="M132 130 Q165 110 190 100"
        stroke="#fbbf24"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />

      {/* Shirt */}
      <path
        d="M64 158 Q64 140 100 138 Q140 140 140 158 L140 195 Q100 200 64 195 Z"
        fill="#ffffff"
        stroke="#0f172a"
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Pants */}
      <rect
        x="68"
        y="190"
        width="64"
        height="38"
        rx="6"
        fill="#1e40af"
        stroke="#0f172a"
        strokeWidth="4"
      />

      {/* Back arm (balancing) */}
      <path
        d="M70 162 Q42 168 30 184"
        stroke="#fbbf24"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx="28"
        cy="186"
        r="11"
        fill="#fbbf24"
        stroke="#0f172a"
        strokeWidth="4"
      />

      {/* Throwing arm (just released) */}
      <path
        d="M130 158 Q160 130 174 108"
        stroke="#fbbf24"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
      <circle
        cx="178"
        cy="103"
        r="11"
        fill="#fbbf24"
        stroke="#0f172a"
        strokeWidth="4"
      />

      {/* Head */}
      <circle
        cx="100"
        cy="100"
        r="50"
        fill="#fbbf24"
        stroke="#0f172a"
        strokeWidth="4"
      />

      {/* Hair tuft — a single curly forelock, deliberately not Homer's silhouette */}
      <path
        d="M82 56 Q88 38 102 50 Q108 38 118 50 Q108 64 92 64 Q84 62 82 56 Z"
        fill="#0f172a"
      />

      {/* Eyes */}
      <circle cx="86" cy="100" r="11" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
      <circle cx="89" cy="102" r="3.5" fill="#0f172a" />
      <circle cx="114" cy="100" r="11" fill="#ffffff" stroke="#0f172a" strokeWidth="3" />
      <circle cx="117" cy="102" r="3.5" fill="#0f172a" />

      {/* Open grin */}
      <path
        d="M82 124 Q100 144 120 124 Q110 134 82 124 Z"
        fill="#0f172a"
      />
      <path
        d="M89 130 Q100 138 111 130"
        stroke="#fb7185"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />

      {/* The shoe, arcing mid-flight */}
      <g transform="translate(202, 64) rotate(28)">
        <path
          d="M-26 4 Q-26 -8 -14 -10 L18 -10 Q28 -6 28 4 Q28 12 18 14 L-20 14 Q-26 12 -26 4 Z"
          fill="#7c2d12"
          stroke="#0f172a"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* shoe stitching detail */}
        <path
          d="M-18 -2 L20 -2"
          stroke="#92400e"
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="2 2"
        />
        {/* lace bow */}
        <circle cx="2" cy="-3" r="2" fill="#fbbf24" />
      </g>
    </svg>
  );
}
