"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_HEADER = {
  src: "/images/logo-header.png",
  width: 124,
  height: 107,
} as const;

const LOGO_FULL = {
  src: "/images/logo.png",
  width: 200,
  height: 168,
} as const;

type LogoProps = {
  className?: string;
  variant?: "header" | "full";
  priority?: boolean;
};

export function Logo({ className, variant = "header", priority }: LogoProps) {
  const logo = variant === "header" ? LOGO_HEADER : LOGO_FULL;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.src}
      alt="Gandras Spot — The taste that's hard to find"
      width={logo.width}
      height={logo.height}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      className={cn(
        "block h-auto max-w-full object-contain object-center",
        variant === "header" && "w-[96px] sm:w-[124px]",
        variant === "full" && "w-[200px]",
        className,
      )}
    />
  );
}

export function LogoLink({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex min-w-0 shrink items-center leading-none", className)}>
      <Logo variant="header" priority />
    </Link>
  );
}
