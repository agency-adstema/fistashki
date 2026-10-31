"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "gandras-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const save = (value: "accepted" | "essential") => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] box-border w-full max-w-[100dvw] border-t border-gray-200 bg-white p-3 shadow-lg sm:p-5">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-gray-600">
          Koristimo neophodne kolačiće i lokalno skladište radi poručivanja. Analitičke
          kolačiće koristimo samo uz vaš pristanak. Više u{" "}
          <Link href="/politika-kolacica" className="font-semibold text-black underline">
            Politici kolačića
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="heroOutline" size="sm" onClick={() => save("essential")}>
            Samo neophodne
          </Button>
          <Button variant="hero" size="sm" onClick={() => save("accepted")}>
            Prihvati sve
          </Button>
        </div>
      </div>
    </div>
  );
}
