import Link from "next/link";
import type { LegalSection } from "@/lib/data/legal";
import { LEGAL_LAST_UPDATED } from "@/lib/data/legal";

type LegalDocumentProps = {
  title: string;
  intro: string;
  sections: LegalSection[];
};

export function LegalDocument({ title, intro, sections }: LegalDocumentProps) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#F6A300]">
        Pravna dokumentacija
      </p>
      <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-black sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-gray-500">Poslednja izmena: {LEGAL_LAST_UPDATED}</p>
      <p className="mt-6 text-sm leading-relaxed text-gray-600 sm:text-base sm:leading-7">
        {intro}
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-black text-black">{section.title}</h2>
            <div className="mt-3 space-y-3">
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 48)}
                  className="text-sm leading-relaxed text-gray-600 sm:text-[15px] sm:leading-7"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            {section.list && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                {section.list.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-4 border-t border-gray-200 pt-8 text-sm">
        <Link href="/politika-privatnosti" className="font-semibold text-black hover:text-[#F6A300]">
          Politika privatnosti
        </Link>
        <Link href="/uslovi-koriscenja" className="font-semibold text-black hover:text-[#F6A300]">
          Uslovi korišćenja
        </Link>
        <Link href="/politika-kolacica" className="font-semibold text-black hover:text-[#F6A300]">
          Politika kolačića
        </Link>
      </div>
    </article>
  );
}
