import { Mascot } from "./Mascot";
import { Wordmark } from "./Wordmark";

type Props = {
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

/** Standard header used on every authenticated page (mascot + wordmark + sub). */
export function Header({ subtitle, rightSlot }: Props) {
  return (
    <header className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <Mascot size={52} />
        </div>
        <div>
          <Wordmark size="md" />
          {subtitle ? (
            <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {rightSlot}
    </header>
  );
}
