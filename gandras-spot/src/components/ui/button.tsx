import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F6A300] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "rounded-full bg-[#F6A300] text-black hover:bg-[#e09500] hover:scale-[1.02] active:scale-[0.98] shadow-sm",
        product:
          "rounded-md bg-[#F6A300] text-black font-bold uppercase tracking-wide hover:bg-[#e09500] active:scale-[0.98]",
        hero:
          "rounded-lg bg-[#F6A300] text-black font-bold uppercase tracking-wide hover:bg-[#e09500]",
        heroOutline:
          "rounded-lg border border-gray-300 bg-white text-black font-bold uppercase tracking-wide hover:bg-gray-50",
        secondary:
          "rounded-full border-2 border-black bg-white text-black hover:bg-gray-50",
        ghost: "rounded-full text-black hover:bg-black/5",
        dark: "rounded-full bg-black text-white hover:bg-gray-900",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        product: "h-9 min-w-[88px] px-4 text-[11px]",
        hero: "h-11 px-5 text-xs sm:px-6 sm:text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-13 px-8 text-base",
        xl: "h-14 px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
