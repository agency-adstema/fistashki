"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PopularBurgers() {
  return (
    <section id="meni" className="bg-white py-16 sm:py-20">
      <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
        <Button asChild size="lg" className="min-w-[220px] px-10 text-base font-black uppercase">
          <Link href="/order">Poručiti</Link>
        </Button>
      </div>
    </section>
  );
}
