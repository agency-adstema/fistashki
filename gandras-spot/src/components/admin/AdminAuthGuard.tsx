"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate().then(() => {
      const token = localStorage.getItem("gandras_token");
      if (!token) {
        router.replace("/admin/login");
        return;
      }
      const role = useAuthStore.getState().user?.role;
      if (role === "COURIER") {
        router.replace("/dostava");
      }
    });
  }, [hydrate, router]);

  if (!user && typeof window !== "undefined" && !localStorage.getItem("gandras_token")) {
    return null;
  }

  if (user?.role === "COURIER") {
    return null;
  }

  return <>{children}</>;
}
