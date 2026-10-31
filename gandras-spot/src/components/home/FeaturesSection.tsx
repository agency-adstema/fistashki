"use client";

import { motion } from "framer-motion";
import { Leaf, Clock, CreditCard, Star } from "lucide-react";

const features = [
  {
    icon: Leaf,
    title: "Sveži sastojci",
    subtitle: "Samo najkvalitetnije",
  },
  {
    icon: Clock,
    title: "Brza dostava",
    subtitle: "Stižemo brzo do tebe",
  },
  {
    icon: CreditCard,
    title: "Plaćanje karticom",
    subtitle: "Sigurno i jednostavno",
  },
  {
    icon: Star,
    title: "100% ukus",
    subtitle: "Zagarantovano uživanje",
  },
];

export function FeaturesBar() {
  return (
    <section className="border-t border-gray-100 bg-[#f7f7f7] py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between lg:flex-nowrap lg:gap-4 xl:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 lg:flex-1 lg:justify-center xl:gap-4"
            >
              <f.icon
                className="h-9 w-9 shrink-0 text-[#F6A300] sm:h-[38px] sm:w-[38px]"
                strokeWidth={1.4}
              />
              <div className="min-w-0">
                <h3 className="text-[11px] font-bold uppercase leading-tight tracking-[0.04em] text-black sm:text-[12px]">
                  {f.title}
                </h3>
                <p className="mt-0.5 text-[11px] leading-snug text-[#6b6b6b] sm:text-[12px]">
                  {f.subtitle}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
