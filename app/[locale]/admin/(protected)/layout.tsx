/* **************************************************
 * Imports
 **************************************************/
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { getDictionary } from "@/lib/i18n/utils";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import { withLocale } from "@/lib/i18n/path";
import type { ReactNode } from "react";
import Sidebar from "./components/Sidebar";
import SWRProvider from "@/components/providers/SWRProvider";
//import SWRCacheIndicator from "@/components/debug/SWRCacheIndicator";

/* **************************************************
 * Types
 ************************************************** */
interface AdminProtectedLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/* **************************************************
 * Admin Protected Layout
 ************************************************** */
export default async function AdminProtectedLayout({
  children,
  params,
}: AdminProtectedLayoutProps) {
  const { locale } = await params;
  const user = await getUser();

  if (!user) {
    redirect(withLocale("/admin/login", locale));
  }

  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return (
    <SWRProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar dict={dict} locale={locale} currentUserRole={user.role} />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      {/* Debug indicator solo in development */}
      {/* {process.env.NODE_ENV === "development" && <SWRCacheIndicator />} */}
    </SWRProvider>
  );
}
