"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/Logo";

export default function CourierLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const role = useAuthStore.getState().user?.role;
      if (role !== "COURIER") {
        useAuthStore.getState().logout();
        setError("Ovaj nalog nije za dostavljače. Koristite admin prijavu.");
        return;
      }
      router.push("/dostava");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri prijavi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f1115] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 text-white shadow-xl"
      >
        <div className="mb-8 flex justify-center">
          <Logo variant="full" priority className="w-[200px] max-w-[220px]" />
        </div>
        <p className="-mt-4 mb-8 text-center text-xs font-bold tracking-widest text-[#FFB800]">
          PRIJAVA DOSTAVLJAČA
        </p>

        <label className="mb-4 block">
          <span className="text-sm font-medium text-gray-300">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 border-gray-700 bg-black/40 text-white"
            required
          />
        </label>

        <label className="mb-6 block">
          <span className="text-sm font-medium text-gray-300">Lozinka</span>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 border-gray-700 bg-black/40 text-white"
            required
          />
        </label>

        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <Button type="submit" className="w-full bg-[#FFB800] text-black hover:bg-[#e6a600]" disabled={loading}>
          {loading ? "Prijava..." : "Prijavi se"}
        </Button>
      </form>
    </div>
  );
}
