/**
 * Per-recipe visual treatment: a cuisine-tinted gradient + a hero emoji.
 * Falls back to a sensible default if no entry matches.
 */
type Style = { gradient: string; emoji: string };

const RECIPE_OVERRIDES: Record<string, Style> = {
  "Spaghetti Bolognese": {
    gradient: "linear-gradient(135deg, #ef4444 0%, #f97316 60%, #fbbf24 100%)",
    emoji: "🍝",
  },
  "Banana Pancakes": {
    gradient: "linear-gradient(135deg, #fde68a 0%, #fbbf24 60%, #f97316 100%)",
    emoji: "🥞",
  },
  "Pasta Salad": {
    gradient: "linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #ef4444 100%)",
    emoji: "🥗",
  },
  "Bacon & Eggs": {
    gradient: "linear-gradient(135deg, #fcd34d 0%, #f97316 50%, #b91c1c 100%)",
    emoji: "🥓",
  },
  "Tomato Soup & Grilled Cheese": {
    gradient: "linear-gradient(135deg, #fca5a5 0%, #ef4444 60%, #fbbf24 100%)",
    emoji: "🥪",
  },
  "Homemade Margherita Pizza": {
    gradient: "linear-gradient(135deg, #ef4444 0%, #fbbf24 50%, #16a34a 100%)",
    emoji: "🍕",
  },
  "Honey Garlic Chicken Stir-Fry": {
    gradient: "linear-gradient(135deg, #34d399 0%, #fbbf24 60%, #f59e0b 100%)",
    emoji: "🥢",
  },
  "Sheet Pan Chicken Fajitas": {
    gradient: "linear-gradient(135deg, #fbbf24 0%, #ef4444 60%, #be123c 100%)",
    emoji: "🌶️",
  },
  "Buttermilk Pancakes": {
    gradient: "linear-gradient(135deg, #fef3c7 0%, #fbbf24 60%, #d97706 100%)",
    emoji: "🥞",
  },
  "Baked Salmon & Veggies": {
    gradient: "linear-gradient(135deg, #fb7185 0%, #f97316 60%, #fbbf24 100%)",
    emoji: "🐟",
  },
  "Scrambled Eggs & Toast": {
    gradient: "linear-gradient(135deg, #fde68a 0%, #fbbf24 60%, #f59e0b 100%)",
    emoji: "🍳",
  },
  "Yogurt Parfaits": {
    gradient: "linear-gradient(135deg, #fbcfe8 0%, #f9a8d4 60%, #c084fc 100%)",
    emoji: "🥄",
  },
  "Chicken Caesar Salad": {
    gradient: "linear-gradient(135deg, #86efac 0%, #34d399 60%, #fbbf24 100%)",
    emoji: "🥗",
  },
  "Beef Tacos": {
    gradient: "linear-gradient(135deg, #fbbf24 0%, #ef4444 60%, #7c2d12 100%)",
    emoji: "🌮",
  },
  "Berry Smoothie Bowls": {
    gradient: "linear-gradient(135deg, #fda4af 0%, #c084fc 60%, #38bdf8 100%)",
    emoji: "🥤",
  },
  "Turkey & Cheese Wraps": {
    gradient: "linear-gradient(135deg, #fde68a 0%, #fbbf24 60%, #65a30d 100%)",
    emoji: "🌯",
  },
  "Avocado Toast with Egg": {
    gradient: "linear-gradient(135deg, #bef264 0%, #65a30d 60%, #14532d 100%)",
    emoji: "🥑",
  },
  "Roast Chicken & Veggies": {
    gradient: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 60%, #92400e 100%)",
    emoji: "🍗",
  },
  "Overnight Oats with Berries": {
    gradient: "linear-gradient(135deg, #fda4af 0%, #c084fc 60%, #6366f1 100%)",
    emoji: "🥣",
  },
};

const CUISINE_FALLBACK: Record<string, string> = {
  Italian: "linear-gradient(135deg, #ef4444 0%, #fbbf24 100%)",
  Mexican: "linear-gradient(135deg, #fbbf24 0%, #ef4444 100%)",
  Asian: "linear-gradient(135deg, #34d399 0%, #fbbf24 100%)",
  American: "linear-gradient(135deg, #38bdf8 0%, #fbbf24 100%)",
  Mediterranean: "linear-gradient(135deg, #38bdf8 0%, #34d399 100%)",
  Indian: "linear-gradient(135deg, #fbbf24 0%, #d946ef 100%)",
  Other: "linear-gradient(135deg, #475569 0%, #fbbf24 100%)",
};

export function recipeStyle(
  name: string,
  cuisine?: string | null,
): Style {
  const direct = RECIPE_OVERRIDES[name];
  if (direct) return direct;
  return {
    gradient:
      CUISINE_FALLBACK[cuisine ?? "Other"] ?? CUISINE_FALLBACK.Other,
    emoji: "🍽",
  };
}
