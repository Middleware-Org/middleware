import { NextRequest, NextResponse } from "next/server";
import { i18nSettings } from "@/i18n/settings";

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (i18nSettings.locales.some((loc) => pathname.startsWith(`/${loc}`))) {
    return NextResponse.next();
  }

  const locale = req.headers
    .get("accept-language")
    ?.split(",")[0]
    .slice(0, 2);

  const detected = locale && i18nSettings.locales.includes(locale)
    ? locale
    : i18nSettings.defaultLocale;

  return NextResponse.redirect(new URL(`/${detected}${pathname}`, req.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
