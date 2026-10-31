"use client";

import { Menu, PanelLeftClose } from "lucide-react";
import { AdminOrderBell } from "@/components/admin/AdminOrderBell";
import { useAdminLayout } from "@/components/admin/admin-layout-context";

export function AdminTopBar() {
  const { toggleSidebar, sidebarExpanded, isCompact } = useAdminLayout();

  return (
    <div className="sticky top-0 z-[60] flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50/95 px-3 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
      {isCompact ? (
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarExpanded ? "Suzi meni" : "Otvori meni"}
          aria-expanded={sidebarExpanded}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-black shadow-sm transition-colors hover:bg-gray-100"
        >
          {sidebarExpanded ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      ) : (
        <div className="w-10" />
      )}
      <div className="flex flex-1 items-center justify-end">
        <AdminOrderBell />
      </div>
    </div>
  );
}
