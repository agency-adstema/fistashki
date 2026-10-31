"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut, Truck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { CourierAuthGuard } from "@/components/courier/CourierAuthGuard";

export function CourierShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  if (pathname === "/dostava/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    logout();
    router.replace("/dostava/login");
  };

  return (
    <CourierAuthGuard>
      <div className="min-h-screen bg-[#0f1115] text-white">
        <header className="relative border-b border-gray-800 bg-black/60 px-4 py-3 sm:px-6 sm:py-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleLogout}
            className="absolute right-3 top-2 z-10 gap-1.5 sm:right-4 sm:top-3"
          >
            <LogOut className="h-4 w-4" />
            Odjava
          </Button>
          <div className="mx-auto flex max-w-5xl items-center gap-3 pr-[5.5rem] sm:pr-28">
            <Logo variant="header" className="h-10 w-auto shrink-0" />
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#FFB800]">
                <Truck className="h-4 w-4 shrink-0" />
                Dostava
              </p>
              {user && (
                <p className="truncate text-xs text-gray-400">
                  {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                </p>
              )}
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </CourierAuthGuard>
  );
}
