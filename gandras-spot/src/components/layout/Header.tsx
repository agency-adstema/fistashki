"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoLink } from "@/components/brand/Logo";
import { ActiveOrderBag } from "@/components/layout/ActiveOrderBag";
import { RESTAURANT } from "@/lib/data/menu";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "POČETNA" },
  { href: "/#meni", label: "MENI" },
  { href: "/o-nama", label: "O NAMA" },
  { href: "/#kontakt", label: "KONTAKT" },
];

export function Header() {
  const pathname = usePathname();
  const showNav = pathname === "/" || pathname === "/o-nama";

  return (
    <header className="sticky top-0 z-50 w-full min-w-0 border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex w-full min-w-0 max-w-7xl items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6 lg:px-8">
        <LogoLink />

        {showNav && (
          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-xs font-bold tracking-widest transition-colors hover:text-[#F6A300]",
                  link.href === "/o-nama" && pathname === "/o-nama"
                    ? "text-[#F6A300]"
                    : "text-gray-700",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <a
            href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`}
            className="hidden items-center gap-2 text-sm font-semibold text-black sm:flex"
          >
            <Phone className="h-4 w-4 text-[#F6A300]" />
            {RESTAURANT.phone}
          </a>
          <ActiveOrderBag />
          <Button asChild variant="hero" size="sm" className={cn("hidden sm:inline-flex")}>
            <Link href="/order">PORUČI ODMAH</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
