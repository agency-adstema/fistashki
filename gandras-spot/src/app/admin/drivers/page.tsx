"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { driversApi, settingsApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

type DriverRow = {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string;
  payPerDelivery: number | null;
  status: string;
  user: { id: string; email: string } | null;
};

const emptyForm = {
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  phone: "",
  payPerDelivery: "",
};

type EditForm = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  payPerDelivery: string;
};

/** Upozorenje ako je isplata kuriru veća od cene dostave koju plaćaju kupci. */
function confirmPayAboveCustomerDelivery(pay: number, deliveryFee: number): boolean {
  if (!(pay > 0) || pay <= deliveryFee) return true;
  return window.confirm(
    `Da li ste sigurni da želite da stavite veću isplatu dostavljaču (${pay.toLocaleString("sr-RS")} RSD) nego što kupci plaćaju dostavu (${deliveryFee.toLocaleString("sr-RS")} RSD)?`,
  );
}

function EditCourierModal({
  driver,
  deliveryFee,
  onClose,
  onSaved,
}: {
  driver: DriverRow;
  deliveryFee: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<EditForm>({
    email: driver.user?.email ?? "",
    password: "",
    firstName: driver.firstName,
    lastName: driver.lastName ?? "",
    phone: driver.phone,
    payPerDelivery: driver.payPerDelivery != null ? String(driver.payPerDelivery) : "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const pay = form.payPerDelivery ? Number(form.payPerDelivery) : 0;
    if (!confirmPayAboveCustomerDelivery(pay, deliveryFee)) return;

    setLoading(true);
    try {
      await driversApi.updateCourier(driver.id, {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        phone: form.phone,
        ...(form.password ? { password: form.password } : {}),
        payPerDelivery: form.payPerDelivery ? pay : null,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-xl font-black">Izmeni dostavljača</h2>
        <p className="mt-1 text-sm text-gray-500">
          {[driver.firstName, driver.lastName].filter(Boolean).join(" ")}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Kupci plaćaju dostavu: {formatPrice(deliveryFee)}
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm text-gray-600">Email (za prijavu)</span>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="mt-1"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm text-gray-600">Nova lozinka (opciono)</span>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              minLength={6}
              placeholder="Ostavi prazno da ostane ista"
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Ime</span>
            <Input
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              required
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Prezime</span>
            <Input
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Telefon</span>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Isplata po dostavi (RSD)</span>
            <Input
              type="number"
              min={0}
              value={form.payPerDelivery}
              onChange={(e) => setForm((f) => ({ ...f, payPerDelivery: e.target.value }))}
              required
              placeholder="npr. 350"
              className="mt-1"
            />
          </label>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex flex-wrap gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Čuvam..." : "Sačuvaj"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Otkaži
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function DriversAdminPage() {
  const [drivers, setDrivers] = useState<DriverRow[]>([]);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState<DriverRow | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(() => {
    driversApi.list().then((rows) => setDrivers(rows as DriverRow[]));
  }, []);

  useEffect(() => {
    load();
    settingsApi
      .get()
      .then((data) => setDeliveryFee(data.settings?.deliveryFee ?? 0))
      .catch(() => undefined);
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const pay = form.payPerDelivery ? Number(form.payPerDelivery) : 0;
    if (!form.payPerDelivery) {
      setError("Unesite isplatu po dostavi za ovog dostavljača.");
      return;
    }
    if (!confirmPayAboveCustomerDelivery(pay, deliveryFee)) return;

    setLoading(true);
    try {
      await driversApi.createCourier({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName || undefined,
        phone: form.phone,
        payPerDelivery: pay,
      });
      setForm(emptyForm);
      setSuccess("Nalog dostavljača je kreiran. Prijava: /dostava/login");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (driver: DriverRow) => {
    const name = [driver.firstName, driver.lastName].filter(Boolean).join(" ");
    if (!window.confirm(`Obrisati dostavljača „${name}"? Nalog više neće moći da se prijavi.`)) {
      return;
    }
    setError("");
    setSuccess("");
    setDeletingId(driver.id);
    try {
      await driversApi.delete(driver.id);
      setSuccess(`Dostavljač „${name}" je obrisan.`);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri brisanju");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-black">Dostavljači</h1>
        <p className="mt-1 text-sm text-gray-500">
          Kreirajte nalog za dostavljača. On se prijavljuje na{" "}
          <a href="/dostava/login" className="font-semibold text-[#F6A300] hover:underline">
            /dostava/login
          </a>{" "}
          i vidi samo dostave i zaradu. Isplata po dostavi se podešava ovde po dostavljaču (kupci
          plaćaju dostavu: {formatPrice(deliveryFee)}).
        </p>
      </div>

      <form onSubmit={handleCreate} className="max-w-xl space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="font-bold">Novi dostavljač</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="text-sm text-gray-600">Email (za prijavu)</span>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="mt-1"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-sm text-gray-600">Lozinka</span>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              minLength={6}
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Ime</span>
            <Input
              value={form.firstName}
              onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              required
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Prezime</span>
            <Input
              value={form.lastName}
              onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Telefon</span>
            <Input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              required
              className="mt-1"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Isplata po dostavi (RSD)</span>
            <Input
              type="number"
              min={0}
              value={form.payPerDelivery}
              onChange={(e) => setForm((f) => ({ ...f, payPerDelivery: e.target.value }))}
              required
              placeholder="npr. 350"
              className="mt-1"
            />
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-700">{success}</p>}
        <Button type="submit" disabled={loading}>
          {loading ? "Kreiram..." : "Kreiraj nalog dostavljača"}
        </Button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-4 py-3">Ime</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Telefon</th>
              <th className="px-4 py-3">Isplata</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">
                  {[d.firstName, d.lastName].filter(Boolean).join(" ")}
                </td>
                <td className="px-4 py-3 text-gray-600">{d.user?.email ?? "—"}</td>
                <td className="px-4 py-3">{d.phone}</td>
                <td className="px-4 py-3">
                  {d.payPerDelivery != null ? formatPrice(d.payPerDelivery) : "Nije podešeno"}
                </td>
                <td className="px-4 py-3">{d.status}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setEditing(d)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Izmeni
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="gap-1.5 text-red-600 hover:text-red-700"
                      disabled={deletingId === d.id}
                      onClick={() => handleDelete(d)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {deletingId === d.id ? "..." : "Obriši"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Nema dostavljača
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditCourierModal
          driver={editing}
          deliveryFee={deliveryFee}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setSuccess("Podaci dostavljača su sačuvani.");
            load();
          }}
        />
      )}
    </div>
  );
}
