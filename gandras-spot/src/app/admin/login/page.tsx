"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/brand/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("admin@gandrasspot.rs");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const role = useAuthStore.getState().user?.role;
      // #region agent log
      fetch('http://127.0.0.1:7375/ingest/54af1a43-3763-48c7-8c65-1ddf55fe8f73',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'163fcb'},body:JSON.stringify({sessionId:'163fcb',location:'admin/login:redirect',message:'post-login redirect',data:{role,target:role==='COURIER'?'/dostava':'/admin'},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      if (role === "COURIER") {
        setError("Ovaj nalog je za dostavljača. Preusmeravamo na portal dostave...");
        router.push("/dostava");
        return;
      }
      router.push("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Greška pri prijavi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1A1A1A] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-8 flex justify-center">
          <Logo variant="full" priority className="w-[200px] max-w-[220px]" />
        </div>
        <p className="-mt-4 mb-8 text-center text-xs font-bold tracking-widest text-gray-400">
          ADMIN PRIJAVA
        </p>

        <label className="mb-4 block">
          <span className="text-sm font-medium text-gray-600">Email</span>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1"
            required
          />
        </label>

        <label className="mb-6 block">
          <span className="text-sm font-medium text-gray-600">Lozinka</span>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1"
            required
          />
        </label>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Prijava..." : "Prijavi se"}
        </Button>
      </form>
    </div>
  );
}
