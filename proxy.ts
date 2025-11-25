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

  // Se il pathname include un punto, è probabilmente un file statico
  if (pathname.includes(".")) {
    return NextResponse.next();
  }

  // Controlla se il pathname inizia già con un locale valido
  const pathSegments = pathname.split("/").filter(Boolean);
  const firstSegment = pathSegments[0];

  // Se il primo segmento è un locale valido, non fare redirect (evita loop)
  if (firstSegment && i18nSettings.locales.includes(firstSegment)) {
    return NextResponse.next();
  }

  // Se il pathname è solo "/" o vuoto, gestiscilo come root
  if (pathname === "/" || pathname === "") {
    const locale = req.headers.get("accept-language")?.split(",")[0].slice(0, 2);
    const detected =
      locale && i18nSettings.locales.includes(locale) ? locale : i18nSettings.defaultLocale;
    return NextResponse.redirect(new URL(`/${detected}${search}${hash}`, req.url));
  }

  // Rileva il locale dall'header o usa quello di default
  const locale = req.headers.get("accept-language")?.split(",")[0].slice(0, 2);
  const detected =
    locale && i18nSettings.locales.includes(locale) ? locale : i18nSettings.defaultLocale;

  // Aggiungi il locale al pathname e fai redirect
  return NextResponse.redirect(new URL(`/${detected}${pathname}${search}${hash}`, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|sw.js|.*\\.).*)"],
};
