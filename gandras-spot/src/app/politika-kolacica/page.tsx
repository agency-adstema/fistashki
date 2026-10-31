import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { COOKIE_POLICY } from "@/lib/data/legal";

export const metadata: Metadata = {
  title: "Politika kolačića",
  description: "Politika kolačića Gandras Spot — kako koristimo cookies i localStorage.",
};

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-5rem)] bg-white">
        <LegalDocument
          title="Politika kolačića"
          intro="Ova stranica objašnjava koje kolačiće i slične tehnologije koristimo na sajtu Gandras Spot, u koju svrhu i kako možete upravljati svojim izborima."
          sections={COOKIE_POLICY}
        />
      </main>
    </>
  );
}
