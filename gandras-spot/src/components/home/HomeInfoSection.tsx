"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Facebook, Instagram } from "lucide-react";
import { RESTAURANT } from "@/lib/data/menu";
import { useShopSettings } from "@/store/restaurant-store";
import { blowBrush } from "@/lib/fonts/blowbrush";

const cardTitleFont = blowBrush;

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.75a8.18 8.18 0 0 0 4.78 1.52V6.87a4.85 4.85 0 0 1-1.01-.18z" />
    </svg>
  );
}

export function HomeInfoSection() {
  const settings = useShopSettings();

  return (
    <section id="kontakt" className="bg-[#f3f3f3] pb-6 pt-10 sm:pt-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {/* Dostava */}
          <div className="flex min-h-[180px] items-center justify-between gap-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:min-h-[190px] sm:gap-3 sm:p-6">
            <div className="flex-1 overflow-visible pr-1">
              <h3
                className={`${cardTitleFont.className} overflow-visible text-[1.65rem] leading-[1.05] text-black sm:text-[1.85rem] lg:text-[2rem]`}
              >
                <span className="block overflow-visible">DOSTAVA</span>
              </h3>
              <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-gray-600 sm:text-xs">
                Cena dostave {settings.deliveryFee.toLocaleString("sr-RS")} RSD
              </p>
              <Link
                href="/order"
                className="mt-4 inline-block w-fit rounded-md border border-[#F6A300] bg-white px-5 py-2 text-[11px] font-semibold uppercase tracking-wide text-black transition-colors hover:bg-[#F6A300]/5 sm:text-xs"
              >
                Naruči odmah
              </Link>
            </div>
            <div className="flex h-[150px] w-[130px] shrink-0 items-center justify-center rounded-xl bg-[#fffaf2] p-1 sm:h-[165px] sm:w-[145px] sm:p-2">
              <Image
                src="/images/delivery-scooter.png"
                alt="Dostava na skuteru"
                width={994}
                height={794}
                unoptimized
                className="h-full w-full object-contain object-center contrast-[1.15] saturate-[1.2]"
              />
            </div>
          </div>

          {/* Radno vreme */}
          <div className="flex min-h-[160px] flex-col justify-center rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <h3
              className={`${cardTitleFont.className} overflow-visible px-1 text-center text-[1.65rem] text-black sm:text-[1.85rem] lg:text-[2rem]`}
            >
              RADNO VREME
            </h3>
            <div className="mt-5 flex items-center justify-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-[#F6A300] bg-[#F6A300]/10">
                <Clock className="h-7 w-7 text-[#F6A300]" strokeWidth={1.5} />
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium">Ponedeljak – Nedelja</p>
                <p className="mt-0.5 font-semibold text-black">10:00 – 24:00</p>
              </div>
            </div>
          </div>

          {/* Pratite nas + burger */}
          <div className="flex min-h-[160px] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="relative w-[42%] shrink-0 sm:w-[45%]">
              <Image
                src="/images/bbq-smash-burger.png"
                alt="Gandras Spot burger"
                fill
                className="object-contain bg-white p-2"
                sizes="200px"
              />
            </div>
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-5">
              <h3 className="text-sm font-black uppercase tracking-[0.15em] text-black">
                Pratite nas
              </h3>
              <div className="mt-4 flex gap-2">
                {[
                  { Icon: Facebook, label: "Facebook", href: RESTAURANT.social.facebook },
                  { Icon: Instagram, label: "Instagram", href: RESTAURANT.social.instagram, external: true },
                  { Icon: TikTokIcon, label: "TikTok", href: RESTAURANT.social.tiktok },
                ].map(({ Icon, label, href, external }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    {...(external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-black transition-colors hover:border-[#F6A300]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer traka */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gray-200 pt-5 text-[11px] text-gray-400 sm:flex-row sm:text-xs">
          <p>© 2026 Gandras Spot. Sva prava zadržana.</p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>PIB {RESTAURANT.pib}</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <span>MB {RESTAURANT.mb}</span>
          </p>
          <p>
            powered by{" "}
            <a
              href="https://adstema.com/usluge/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-500 transition-colors hover:text-[#F6A300]"
            >
              Adstema
            </a>
          </p>
          <div className="flex items-center gap-2">
            <Link href="/politika-privatnosti" className="hover:text-gray-600">
              Politika privatnosti
            </Link>
            <span aria-hidden>•</span>
            <Link href="/uslovi-koriscenja" className="hover:text-gray-600">
              Uslovi korišćenja
            </Link>
            <span aria-hidden>•</span>
            <Link href="/politika-kolacica" className="hover:text-gray-600">
              Kolačići
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
