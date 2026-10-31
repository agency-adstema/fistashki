import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { TERMS_OF_USE } from "@/lib/data/legal";

export const metadata: Metadata = {
  title: "Uslovi korišćenja",
  description: "Uslovi korišćenja sajta i online poručivanja Gandras Spot.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-5rem)] bg-white">
        <LegalDocument
          title="Uslovi korišćenja"
          intro="Molimo vas da pažljivo pročitate ove uslove pre korišćenja sajta i slanja porudžbine. Korišćenjem sajta smatramo da ste sa uslovima saglasni."
          sections={TERMS_OF_USE}
        />
      </main>
    </>
  );
}
