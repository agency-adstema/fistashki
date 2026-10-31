"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderStepActionsProps {
  onBack: () => void;
  backLabel?: string;
  children?: React.ReactNode;
  className?: string;
}

export function OrderStepActions({
  onBack,
  backLabel = "Nazad",
  children,
  className,
}: OrderStepActionsProps) {
  return (
    <div
      className={cn(
        "flex w-full max-w-full flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <Button variant="secondary" onClick={onBack} className="w-full shrink-0 sm:w-auto">
        {backLabel}
      </Button>
      {children && (
        <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          {children}
        </div>
      )}
    </div>
  );
}
