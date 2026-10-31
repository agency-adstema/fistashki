"use client";

import { useEffect, useState } from "react";
import { settingsApi, type RestaurantSettingsFields } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Store, Truck, CreditCard, Palette } from "lucide-react";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-gray-700">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </label>
  );
}

function inputClass() {
  return "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-[#F6A300] focus:outline-none focus:ring-2 focus:ring-[#F6A300]/20";
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl bg-gray-50 px-4 py-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </div>
      <Checkbox checked={checked} onCheckedChange={(v) => onCheckedChange(v === true)} />
    </div>
  );
}

function formatWorkingHours(wh: Record<string, string> | null): string {
  if (!wh) return "";
  if (wh.display) return wh.display;
  const vals = Object.values(wh);
  if (vals.every((v) => v === vals[0])) return `Pon – Ned: ${vals[0]?.replace("-", " – ") ?? ""}`;
  return vals.join(", ");
}

export default function AdminSettingsPage() {
  const [name, setName] = useState("");
  const [settings, setSettings] = useState<RestaurantSettingsFields | null>(null);
  const [hoursText, setHoursText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    settingsApi
      .get()
      .then((data) => {
        setName(data.name);
        setSettings(data.settings);
        setHoursText(formatWorkingHours(data.settings.workingHours));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Greška"))
      .finally(() => setLoading(false));
  }, []);

  const patch = (partial: Partial<RestaurantSettingsFields>) => {
    setSettings((s) => (s ? { ...s, ...partial } : s));
    setSaved(false);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError("");
    try {
      await settingsApi.update({
        name,
        settings: {
          ...settings,
          workingHours: hoursText.trim() ? { display: hoursText.trim() } : null,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Greška pri čuvanju");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Učitavanje...</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black">Podešavanja</h1>
          <p className="text-gray-500">Osnovne opcije restorana</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Čuvam..." : saved ? "Sačuvano ✓" : "Sačuvaj izmene"}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold">
            <Store className="h-4 w-4 text-[#FFB800]" /> Restoran
          </h2>
          <div className="mt-4 space-y-4">
            <Field label="Naziv">
              <input className={inputClass()} value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }} />
            </Field>
            <Field label="Telefon">
              <input className={inputClass()} value={settings.phone ?? ""} onChange={(e) => patch({ phone: e.target.value })} />
            </Field>
            <Field label="Email">
              <input type="email" className={inputClass()} value={settings.email ?? ""} onChange={(e) => patch({ email: e.target.value })} />
            </Field>
            <Field label="Adresa">
              <input className={inputClass()} value={settings.address ?? ""} onChange={(e) => patch({ address: e.target.value })} />
            </Field>
            <Field label="Grad">
              <input className={inputClass()} value={settings.city ?? ""} onChange={(e) => patch({ city: e.target.value })} />
            </Field>
            <Field label="Radno vreme" hint="Prikazuje se kupcima na sajtu">
              <input
                className={inputClass()}
                placeholder="Pon – Ned: 10:00 – 24:00"
                value={hoursText}
                onChange={(e) => { setHoursText(e.target.value); setSaved(false); }}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold">
            <Truck className="h-4 w-4 text-[#FFB800]" /> Poručivanje & dostava
          </h2>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Restoran otvoren"
              description="Ako je isključeno, kupci ne mogu da poruče"
              checked={settings.isOpen}
              onCheckedChange={(v) => patch({ isOpen: v })}
            />
            <ToggleRow
              label="Dostava uključena"
              checked={settings.deliveryEnabled}
              onCheckedChange={(v) => patch({ deliveryEnabled: v })}
            />
            <ToggleRow
              label="Preuzimanje u lokalu"
              checked={settings.pickupEnabled}
              onCheckedChange={(v) => patch({ pickupEnabled: v })}
            />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Cena dostave (RSD)" hint="Ovo kupci vide na sajtu i po ovoj ceni se obračunava dostava u porudžbini">
              <input
                type="number"
                min={0}
                className={inputClass()}
                value={settings.deliveryFee}
                onChange={(e) => patch({ deliveryFee: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Besplatna dostava od (RSD)" hint="0 = nema besplatne dostave (uvek se naplaćuje)">
              <input
                type="number"
                min={0}
                className={inputClass()}
                value={settings.freeDeliveryMin}
                onChange={(e) => patch({ freeDeliveryMin: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="Minimalna porudžbina (RSD)" hint="0 = bez minimuma">
              <input
                type="number"
                min={0}
                className={inputClass()}
                value={settings.minOrderAmount}
                onChange={(e) => patch({ minOrderAmount: Number(e.target.value) || 0 })}
              />
            </Field>
            <Field label="PDV stopa" hint="0.2 = 20%. Cene u meniju su sa PDV-om; ovo je za prikaz uključenog PDV-a, ne dodaje se na ukupno.">
              <input
                type="number"
                min={0}
                max={1}
                step={0.01}
                className={inputClass()}
                value={settings.taxRate}
                onChange={(e) => patch({ taxRate: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold">
            <CreditCard className="h-4 w-4 text-[#FFB800]" /> Načini plaćanja
          </h2>
          <div className="mt-4 space-y-3">
            <ToggleRow
              label="Gotovina"
              description="Plaćanje kuriru ili pri preuzimanju"
              checked={settings.cashEnabled}
              onCheckedChange={(v) => patch({ cashEnabled: v })}
            />
            <ToggleRow
              label="Kartica"
              description="Online plaćanje karticom"
              checked={settings.cardEnabled}
              onCheckedChange={(v) => patch({ cardEnabled: v })}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold">
            <Palette className="h-4 w-4 text-[#FFB800]" /> Brending
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Primarna boja">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-10 w-12 cursor-pointer rounded-lg border border-gray-200"
                  value={settings.primaryColor}
                  onChange={(e) => patch({ primaryColor: e.target.value })}
                />
                <input
                  className={cn(inputClass(), "flex-1")}
                  value={settings.primaryColor}
                  onChange={(e) => patch({ primaryColor: e.target.value })}
                />
              </div>
            </Field>
            <Field label="Sekundarna boja">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-10 w-12 cursor-pointer rounded-lg border border-gray-200"
                  value={settings.secondaryColor}
                  onChange={(e) => patch({ secondaryColor: e.target.value })}
                />
                <input
                  className={cn(inputClass(), "flex-1")}
                  value={settings.secondaryColor}
                  onChange={(e) => patch({ secondaryColor: e.target.value })}
                />
              </div>
            </Field>
          </div>
        </section>
      </div>
    </div>
  );
}
