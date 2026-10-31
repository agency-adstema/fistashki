"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { Button } from "@/components/ui/button";

const BUN_BASE = "/images/hero-scroll/bun-base.png";
const BURGER_FULL = "/images/hero-scroll/burger-full.png";

export function HeroScrollBurger() {
  const reduce = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const copyOpacity = useTransform(scrollYProgress, [0, 0.1], reduce ? [1, 1] : [0, 1]);
  const copyY = useTransform(scrollYProgress, [0, 0.1], reduce ? [0, 0] : [20, 0]);

  /** Reveal full burger from bottom upward (matches bun-base alignment) */
  const clipBottom = useTransform(
    scrollYProgress,
    [0.08, 0.82],
    reduce ? ["0%", "0%"] : ["72%", "0%"],
  );
  const clipPath = useMotionTemplate`inset(0 0 ${clipBottom} 0)`;

  /** Crossfade base bun once full burger bottom is visible */
  const baseOpacity = useTransform(
    scrollYProgress,
    [0.18, 0.32],
    reduce ? [0, 0] : [1, 0],
  );

  /** Subtle settle when assembly completes */
  const burgerScale = useTransform(
    scrollYProgress,
    [0.78, 0.92],
    reduce ? [1, 1] : [1, 1.03],
  );

  const steamOpacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.35],
    reduce ? [0, 0, 0] : [1, 0.6, 0],
  );

  return (
    <section
      ref={containerRef}
      className={reduce ? "relative bg-black" : "relative h-[300vh] bg-black sm:h-[360vh]"}
    >
      <div className={reduce ? "relative px-6 py-14" : "sticky top-0 min-h-[100dvh] overflow-hidden"}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 50% 55% at 58% 52%, rgba(246,163,0,0.06) 0%, transparent 65%)",
          }}
        />

        <div className="relative mx-auto flex min-h-[100dvh] max-w-7xl flex-col items-center justify-center gap-10 px-6 py-16 lg:flex-row lg:gap-14 lg:px-12 lg:py-20">
          <motion.div
            style={{ opacity: copyOpacity, y: copyY }}
            className="z-10 flex w-full flex-col items-center gap-4 text-center lg:w-[40%] lg:items-start lg:text-left"
          >
            <h1 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl lg:text-6xl">
              <span className="block">Gandras</span>
              <span className="block text-[#F6A300]">Burgers</span>
            </h1>
            <p className="max-w-sm text-sm text-zinc-400 sm:text-base">
              {`The taste that's hard to find`}
            </p>
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild variant="hero" size="hero" className="w-full sm:w-auto">
                <Link href="/order">
                  PORUČI ODMAH
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="hero"
                className="w-full rounded-lg border border-white/20 bg-transparent font-bold uppercase tracking-wide text-white hover:bg-white/10 sm:w-auto"
              >
                <a href="#meni">POGLEDAJ MENI</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            style={{ scale: burgerScale }}
            className="relative flex w-full items-end justify-center lg:w-[60%]"
          >
            <div className="relative aspect-[4/5] w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[420px]">
              {/* steam on base bun (early scroll) */}
              <motion.div
                style={{ opacity: steamOpacity }}
                className="pointer-events-none absolute bottom-[38%] left-1/2 z-20 h-24 w-16 -translate-x-1/2 bg-gradient-to-t from-white/10 to-transparent blur-md"
                aria-hidden
              />

              {/* bottom bun - start frame */}
              <motion.div
                style={{ opacity: baseOpacity }}
                className="absolute inset-0 z-10 will-change-[opacity]"
              >
                <Image
                  src={BUN_BASE}
                  alt=""
                  fill
                  priority
                  className="object-contain object-bottom"
                  sizes="(max-width: 768px) 280px, 420px"
                />
              </motion.div>

              {/* full burger - revealed upward on scroll */}
              <motion.div
                style={{ clipPath }}
                className="absolute inset-0 z-20 will-change-[clip-path]"
              >
                <Image
                  src={BURGER_FULL}
                  alt="Gandras Spot premium burger"
                  fill
                  priority
                  className="object-contain object-bottom"
                  sizes="(max-width: 768px) 280px, 420px"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
