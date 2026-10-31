"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const COMPACT_BREAKPOINT = 1280;

type AdminLayoutContextValue = {
  sidebarExpanded: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isCompact: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
};

const AdminLayoutContext = createContext<AdminLayoutContextValue | null>(null);

export function AdminLayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(`(min-width: ${COMPACT_BREAKPOINT}px)`).matches;
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const sync = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < COMPACT_BREAKPOINT);
      setIsCompact(w < COMPACT_BREAKPOINT);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarExpanded((v) => !v);
  }, []);

  const closeSidebar = useCallback(() => {
    if (window.innerWidth < COMPACT_BREAKPOINT) setSidebarExpanded(false);
  }, []);

  const value = useMemo(
    () => ({ sidebarExpanded, isMobile, isTablet, isCompact, toggleSidebar, closeSidebar }),
    [sidebarExpanded, isMobile, isTablet, isCompact, toggleSidebar, closeSidebar],
  );

  return (
    <AdminLayoutContext.Provider value={value}>{children}</AdminLayoutContext.Provider>
  );
}

export function useAdminLayout() {
  const ctx = useContext(AdminLayoutContext);
  if (!ctx) throw new Error("useAdminLayout must be used within AdminLayoutProvider");
  return ctx;
}
