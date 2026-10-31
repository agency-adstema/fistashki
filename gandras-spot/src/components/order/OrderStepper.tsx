"use client";

import { cn } from "@/lib/utils";
import { ORDER_PHASES, stepperPhase } from "@/lib/order-steps";

export function OrderStepper({ current }: { current: number }) {
  const phase = stepperPhase(current);

  return (
    <div className="w-full border-b border-gray-100 bg-white px-3 py-3 sm:px-6 sm:py-4">
      <div className="mx-auto w-full min-w-0 max-w-4xl">
        <div className="flex w-full min-w-0 items-center justify-between gap-0.5 sm:gap-1">
          {ORDER_PHASES.map((step, i) => (
            <div key={step.num} className="flex min-w-0 flex-1 items-center last:flex-none">
              <div className="flex shrink-0 flex-col items-center">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors sm:h-8 sm:w-8 sm:text-xs",
                    phase >= step.num ? "bg-[#F6A300] text-black" : "bg-gray-100 text-gray-400",
                  )}
                >
                  {step.num}
                </div>
                <span
                  className={cn(
                    "mt-1 hidden text-[10px] font-bold uppercase tracking-wider sm:block",
                    phase >= step.num ? "text-black" : "text-gray-400",
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < ORDER_PHASES.length - 1 && (
                <div
                  className={cn(
                    "mx-0.5 h-0.5 min-w-0 flex-1 sm:mx-2",
                    phase > step.num ? "bg-[#F6A300]" : "bg-gray-200",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
