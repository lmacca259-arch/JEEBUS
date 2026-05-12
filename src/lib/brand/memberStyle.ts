/** Per-member colour theme. Stable, hand-picked, playful. */
export function memberStyle(name: string): {
  bg: string;
  ring: string;
  fg: string;
  accent: string;
} {
  switch (name) {
    case "Lisa":
      return {
        bg: "linear-gradient(135deg, #c084fc, #a855f7)", // violet
        ring: "rgba(233, 213, 255, 0.45)",
        fg: "#faf5ff",
        accent: "#c084fc",
      };
    case "Andrew":
      return {
        bg: "linear-gradient(135deg, #38bdf8, #0ea5e9)", // sky
        ring: "rgba(186, 230, 253, 0.45)",
        fg: "#f0f9ff",
        accent: "#38bdf8",
      };
    case "Alex":
      return {
        bg: "linear-gradient(135deg, #34d399, #10b981)", // emerald
        ring: "rgba(167, 243, 208, 0.45)",
        fg: "#ecfdf5",
        accent: "#34d399",
      };
    case "Hannah":
      return {
        bg: "linear-gradient(135deg, #fb7185, #f43f5e)", // coral / rose
        ring: "rgba(254, 205, 211, 0.45)",
        fg: "#fff1f2",
        accent: "#fb7185",
      };
    case "Family":
      return {
        bg: "linear-gradient(135deg, #facc15, #eab308)", // yellow
        ring: "rgba(254, 240, 138, 0.45)",
        fg: "#422006",
        accent: "#facc15",
      };
    default:
      return {
        bg: "linear-gradient(135deg, #fbbf24, #f59e0b)",
        ring: "rgba(254, 240, 138, 0.45)",
        fg: "#1c1917",
        accent: "#fbbf24",
      };
  }
}
