"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="w-full bg-white px-6 pt-3 sm:px-10 sm:pt-5 lg:px-16 lg:pt-6 xl:px-20">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative mx-auto w-full max-w-6xl"
      >
        <Image
          src="/images/hero-new.png"
          alt="Gandras Spot — The taste that's hard to find"
          width={1920}
          height={640}
          className="h-auto w-full rounded-sm"
          priority
          sizes="(max-width: 1280px) calc(100vw - 48px), 1152px"
        />

        <div className="mt-4 flex flex-col gap-2.5 sm:absolute sm:bottom-[10%] sm:left-[5%] sm:z-10 sm:mt-0 sm:flex-row sm:flex-wrap sm:gap-3 md:left-[6%]">
          <Button asChild variant="hero" size="hero" className="w-full sm:w-auto">
            <Link href="/order">
              PORUČI ODMAH
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="heroOutline" size="hero" className="w-full sm:w-auto">
            <a href="#meni">POGLEDAJ MENI</a>
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
