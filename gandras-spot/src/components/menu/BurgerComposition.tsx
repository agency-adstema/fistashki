import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { parseCompositionText } from "@/lib/composition";

export { parseCompositionText };

/** Sastav iz admin polja (description) ili statičkog composition */
export function getBurgerComposition(burger: MenuItem): string[] {
  if (burger.composition?.length) return burger.composition;
  return parseCompositionText(burger.description);
}

interface BurgerCompositionProps {
  burger: MenuItem;
  className?: string;
  compact?: boolean;
  dense?: boolean;
  hideHeading?: boolean;
}

export function BurgerComposition({
  burger,
  className,
  compact,
  dense,
  hideHeading,
}: BurgerCompositionProps) {
  const items = getBurgerComposition(burger);
  if (items.length === 0) return null;

  const itemClass = dense ? "text-xs leading-snug text-gray-500" : "text-sm leading-snug text-gray-600";

  if (compact) {
    return (
      <p className={cn("text-xs leading-relaxed text-gray-500", className)}>
        {items.join(" · ")}
      </p>
    );
  }

  return (
    <div className={className}>
      {!hideHeading && (
        <p
          className={cn(
            "font-bold uppercase tracking-wide text-gray-400",
            dense ? "text-[10px]" : "text-[11px]",
          )}
        >
          Sastav
        </p>
      )}
      <ul className={cn("space-y-1", !hideHeading && (dense ? "mt-1" : "mt-1.5"))}>
        {items.map((item) => (
          <li key={item} className={cn("flex items-start gap-2", itemClass)}>
            <span
              className={cn(
                "shrink-0 rounded-full bg-[#F6A300]",
                dense ? "mt-1.5 h-1 w-1" : "mt-2 h-1.5 w-1.5",
              )}
              aria-hidden
            />
            <span className="break-words">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
