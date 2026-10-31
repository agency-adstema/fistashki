"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { AdminLayoutProvider, useAdminLayout } from "@/components/admin/admin-layout-context";
import { initOrderAudio } from "@/lib/socket";

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarExpanded, isCompact, closeSidebar } = useAdminLayout();

  useEffect(() => {
    if (pathname !== "/admin/login") initOrderAudio();
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminAuthGuard>
      <div className="flex min-h-screen overflow-x-hidden bg-gray-50">
        {isCompact && sidebarExpanded && (
          <button
            type="button"
            aria-label="Zatvori meni"
            className="fixed inset-0 z-40 bg-black/50"
            onClick={closeSidebar}
          />
        )}
        <AdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <AdminTopBar />
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </AdminAuthGuard>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutProvider>
      <AdminShellInner>{children}</AdminShellInner>
    </AdminLayoutProvider>
  );
}
