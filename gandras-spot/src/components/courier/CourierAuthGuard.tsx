"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export function CourierAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate().then(() => {
      const token = localStorage.getItem("gandras_token");
      if (!token) {
        router.replace("/dostava/login");
        return;
      }
      const role = useAuthStore.getState().user?.role;
      if (role && role !== "COURIER") {
        router.replace("/admin");
      }
    });
  }, [hydrate, router]);

  if (!user && typeof window !== "undefined" && !localStorage.getItem("gandras_token")) {
    return null;
  }

  if (user && user.role !== "COURIER") {
    return null;
  }

  return <>{children}</>;
}
