"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bebas_Neue } from "next/font/google";
import { ArrowRight, ChefHat, Flame, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ABOUT } from "@/lib/data/menu";

const displayFont = Bebas_Neue({
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

const statIcons = [Flame, Users, ChefHat] as const;

export function AboutSection() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F6A300]">
              O nama
            </p>
            <h2
              className={`${displayFont.className} mt-2 text-4xl leading-none tracking-wide text-black sm:text-5xl`}
            >
              KO SMO MI?
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
              {ABOUT.intro}
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-black">
                  Šta radimo
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-[15px] sm:leading-7">
                  {ABOUT.whatWeDo}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wide text-black">
                  Naše iskustvo
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 sm:text-[15px] sm:leading-7">
                  {ABOUT.experience}
                </p>
              </div>
            </div>

            <Button asChild variant="hero" size="hero" className="mt-8">
              <Link href="/order">
                PORUČI ODMAH
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-gray-100 bg-[#fafafa] shadow-sm">
              <Image
                src="/images/bbq-smash-burger.png"
                alt="Gandras Spot burger"
                fill
                className="object-contain p-6 sm:p-8"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {ABOUT.stats.map((stat, i) => {
                const Icon = statIcons[i] ?? Flame;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="rounded-xl border border-gray-100 bg-[#f7f7f7] px-3 py-4 text-center sm:px-4 sm:py-5"
                  >
                    <Icon
                      className="mx-auto h-5 w-5 text-[#F6A300] sm:h-6 sm:w-6"
                      strokeWidth={1.5}
                    />
                    <p
                      className={`${displayFont.className} mt-2 text-2xl leading-none text-black sm:text-3xl`}
                    >
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase leading-tight tracking-wide text-gray-500 sm:text-[11px]">
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
