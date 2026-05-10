import { recipeStyle } from "@/lib/brand/recipeStyle";

type Props = {
  name: string;
  cuisine?: string | null;
  height?: number;
  showName?: boolean;
};

/** Big gradient block with the cuisine emoji. Used as a recipe card hero. */
export function RecipeHero({ name, cuisine, height = 140, showName = false }: Props) {
  const { gradient, emoji } = recipeStyle(name, cuisine);
  return (
    <div
      className="relative flex items-end overflow-hidden rounded-2xl"
      style={{ background: gradient, height }}
    >
      <span
        aria-hidden
        className="absolute -right-2 -top-2 select-none"
        style={{ fontSize: height * 0.85, lineHeight: 1, filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.25))" }}
      >
        {emoji}
      </span>
      {showName ? (
        <div className="relative z-10 w-full bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-12">
          <p className="text-base font-semibold text-white drop-shadow">{name}</p>
        </div>
      ) : null}
    </div>
  );
}
