import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { PRIVACY_POLICY } from "@/lib/data/legal";

export const metadata: Metadata = {
  title: "Politika privatnosti",
  description: "Politika privatnosti Gandras Spot — kako čuvamo i obrađujemo vaše podatke.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-5rem)] bg-white">
        <LegalDocument
          title="Politika privatnosti"
          intro="Ova stranica objašnjava kako Gandras Spot prikuplja, koristi i štiti vaše lične podatke kada koristite naš sajt i poručujete hranu online."
          sections={PRIVACY_POLICY}
        />
      </main>
    </>
  );
}
