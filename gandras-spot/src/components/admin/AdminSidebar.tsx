"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingBag,
  ChefHat,
  UtensilsCrossed,
  Tag,
  Users,
  Package,
  MapPin,
  BarChart3,
  Settings,
  User,
  LogOut,
  X,
  PanelLeft,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useAdminLayout } from "@/components/admin/admin-layout-context";
import { badgeCountForHref, useAdminOrderBadges } from "@/hooks/use-admin-order-badges";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Porudžbine", icon: ShoppingBag },
  { href: "/admin/kitchen", label: "Kitchen", icon: ChefHat },
  { href: "/admin/delivery", label: "Dostava", icon: MapPin },
  { href: "/admin/menu", label: "Meni", icon: UtensilsCrossed },
  { href: "/admin/coupons", label: "Kuponi", icon: Tag },
  { href: "/admin/customers", label: "Kupci", icon: Users },
  { href: "/admin/inventory", label: "Zalihe", icon: Package },
  { href: "/admin/reports", label: "Izveštaji", icon: BarChart3 },
  { href: "/admin/drivers", label: "Dostavljači", icon: Truck },
  { href: "/admin/settings", label: "Podešavanja", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { sidebarExpanded, isCompact, closeSidebar, toggleSidebar } = useAdminLayout();
  const badges = useAdminOrderBadges();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const handleNav = () => {
    if (isCompact) closeSidebar();
  };

  const collapsed = !sidebarExpanded;
  const overlay = isCompact && sidebarExpanded;

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-gray-800 bg-black text-white transition-[width] duration-200 ease-out",
        sidebarExpanded ? "w-64" : "w-[4.5rem]",
        overlay && "fixed inset-y-0 left-0 z-50 shadow-2xl",
      )}
    >
      <div
        className={cn(
          "relative flex flex-col items-center border-b border-gray-800 py-4",
          collapsed ? "px-2" : "px-4 py-5 text-center",
        )}
      >
        {isCompact && (
          <button
            type="button"
            onClick={sidebarExpanded ? closeSidebar : toggleSidebar}
            aria-label={sidebarExpanded ? "Suzi meni" : "Proširi meni"}
            className={cn(
              "absolute flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-900 hover:text-white",
              sidebarExpanded ? "right-2 top-2" : "right-1 top-1",
            )}
          >
            {sidebarExpanded ? <X className="h-5 w-5" /> : <PanelLeft className="h-4 w-4" />}
          </button>
        )}

        <Link href="/admin" className="inline-flex justify-center" onClick={handleNav}>
          <Logo
            variant="full"
            className={cn(
              "mx-auto object-contain",
              collapsed ? "w-10" : "w-[120px] max-w-[140px]",
            )}
          />
        </Link>
        {!collapsed && (
          <p className="mt-2 text-[10px] font-bold tracking-widest text-gray-500">ADMIN PANEL</p>
        )}
      </div>

      <nav className={cn("flex-1 space-y-1 overflow-y-auto", collapsed ? "p-2" : "p-4")}>
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const count = badgeCountForHref(item.href, badges);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNav}
              title={collapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center rounded-xl text-sm font-medium transition-colors",
                collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-2.5",
                active
                  ? "bg-[#FFB800] text-black"
                  : "text-gray-400 hover:bg-gray-900 hover:text-white",
              )}
            >
              <span className="relative shrink-0">
                <item.icon className="h-5 w-5" />
                {collapsed && count > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </span>
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {count > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-gray-800 space-y-1", collapsed ? "p-2" : "p-4")}>
        <Link
          href="/admin/profile"
          onClick={handleNav}
          title={collapsed ? "Profil" : undefined}
          className={cn(
            "flex items-center rounded-xl text-sm text-gray-400 hover:bg-gray-900 hover:text-white",
            collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-2.5",
          )}
        >
          <User className="h-5 w-5 shrink-0" />
          {!collapsed && "Profil"}
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Odjava" : undefined}
          className={cn(
            "flex w-full items-center rounded-xl text-sm text-gray-400 hover:bg-gray-900 hover:text-white",
            collapsed ? "justify-center px-2 py-3" : "gap-3 px-4 py-2.5",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && "Odjava"}
        </button>
      </div>
    </aside>
  );
}
