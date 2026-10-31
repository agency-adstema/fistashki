import Link from "next/link";
import { Crown, Facebook, Instagram } from "lucide-react";
import { RESTAURANT } from "@/lib/data/menu";

export function Footer() {
  return (
    <footer id="kontakt" className="border-t border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black">
                <Crown className="h-4 w-4 text-[#F6A300]" />
              </div>
              <span className="font-black tracking-wider">GANDRAS SPOT</span>
            </div>
            <p className="text-sm text-gray-500">{RESTAURANT.address}</p>
            <a
              href={`tel:${RESTAURANT.phone.replace(/\s/g, "")}`}
              className="mt-1 block text-sm text-gray-500 hover:text-[#F6A300]"
            >
              {RESTAURANT.phone}
            </a>
            <p className="mt-1 text-sm text-gray-500">{RESTAURANT.email}</p>
            <p className="mt-3 text-sm text-gray-500">
              PIB {RESTAURANT.pib}
              <span className="mx-2 text-gray-300" aria-hidden>
                ·
              </span>
              MB {RESTAURANT.mb}
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold tracking-widest text-gray-400">
              LINKOVI
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/" className="hover:text-[#F6A300]">Početna</Link></li>
              <li><a href="/#meni" className="hover:text-[#F6A300]">Meni</a></li>
              <li><Link href="/order" className="hover:text-[#F6A300]">Poruči</Link></li>
              <li>
                <Link href="/o-nama" className="hover:text-[#F6A300]">
                  O nama
                </Link>
              </li>
              <li>
                <Link href="/politika-privatnosti" className="hover:text-[#F6A300]">
                  Politika privatnosti
                </Link>
              </li>
              <li>
                <Link href="/uslovi-koriscenja" className="hover:text-[#F6A300]">
                  Uslovi korišćenja
                </Link>
              </li>
              <li>
                <Link href="/politika-kolacica" className="hover:text-[#F6A300]">
                  Kolačići
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-bold tracking-widest text-gray-400">
              PRATITE NAS
            </h4>
            <div className="flex gap-3">
              <Link
                href={RESTAURANT.social.facebook}
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:border-[#F6A300] hover:text-[#F6A300]"
              >
                <Facebook className="h-4 w-4" />
              </Link>
              <a
                href={RESTAURANT.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 hover:border-[#F6A300] hover:text-[#F6A300]"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-xs text-gray-400 sm:flex-row">
          <p>© {new Date().getFullYear()} Gandras Spot. Sva prava zadržana.</p>
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
          <div className="flex gap-6">
            <Link href="/politika-privatnosti" className="hover:text-gray-600">
              Politika privatnosti
            </Link>
            <Link href="/uslovi-koriscenja" className="hover:text-gray-600">
              Uslovi korišćenja
            </Link>
            <Link href="/politika-kolacica" className="hover:text-gray-600">
              Kolačići
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
