import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ADMIN_HOSTS = ["admin.gandraspot.rs"];
const SHOP_HOSTS = ["gandraspot.rs", "www.gandraspot.rs"];

function hostName(request: NextRequest): string {
  return (request.headers.get("host") || "").split(":")[0].toLowerCase();
}

function isAdminHost(host: string): boolean {
  return ADMIN_HOSTS.includes(host);
}

function isShopHost(host: string): boolean {
  return SHOP_HOSTS.includes(host);
}

function adminBaseUrl(): string {
  return "https://admin.gandraspot.rs";
}

const SHOP_PATH_PREFIXES = [
  "/order",
  "/o-nama",
  "/politika-kolacica",
  "/politika-privatnosti",
  "/uslovi-koriscenja",
];

function isShopPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return SHOP_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isCourierPath(pathname: string): boolean {
  return pathname === "/dostava" || pathname.startsWith("/dostava/");
}

export function middleware(request: NextRequest) {
  const host = hostName(request);
  const { pathname } = request.nextUrl;

  if (isAdminHost(host)) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (isShopPath(pathname)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (!pathname.startsWith("/admin") && !isCourierPath(pathname)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (isShopHost(host) && pathname.startsWith("/admin")) {
    const adminUrl = new URL(pathname + request.nextUrl.search, adminBaseUrl());
    return NextResponse.redirect(adminUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
