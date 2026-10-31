"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityControlProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  compact?: boolean;
  className?: string;
}

export function QuantityControl({ value, onChange, min = 0, compact, className }: QuantityControlProps) {
  const btn = compact ? "h-7 w-7" : "h-8 w-8";
  const icon = compact ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div
      className={cn("flex shrink-0 items-center gap-0.5 rounded-full border border-gray-200 bg-white p-0.5", className)}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Smanji količinu"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn("flex items-center justify-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-30", btn)}
      >
        <Minus className={icon} />
      </button>
      <span className={cn("text-center font-bold tabular-nums", compact ? "min-w-[1.25rem] text-xs" : "min-w-[1.5rem] text-sm")}>
        {value}
      </span>
      <button
        type="button"
        aria-label="Povećaj količinu"
        onClick={() => onChange(value + 1)}
        className={cn("flex items-center justify-center rounded-full bg-[#F6A300] text-black transition-colors hover:bg-[#e59500]", btn)}
      >
        <Plus className={icon} />
      </button>
    </div>
  );
}
