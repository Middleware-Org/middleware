/* **************************************************
 * Imports
 **************************************************/
import { NextRequest, NextResponse } from "next/server";
import { i18nSettings } from "@/lib/i18n/settings";

/* **************************************************
 * Proxy
 **************************************************/
export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const search = req.nextUrl.search;
  const hash = req.nextUrl.hash;

  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  if (i18nSettings.locales.some((loc) => pathname.startsWith(`/${loc}`))) {
    return NextResponse.next();
  }

  const locale = req.headers.get("accept-language")?.split(",")[0].slice(0, 2);

  const detected =
    locale && i18nSettings.locales.includes(locale) ? locale : i18nSettings.defaultLocale;

  return NextResponse.redirect(new URL(`/${detected}${pathname}${search}${hash}`, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|sw.js|.*\\.).*)"],
};
