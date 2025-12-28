/* **************************************************
 * Imports
 **************************************************/
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { getDictionary } from "@/lib/i18n/utils";
import { TRANSLATION_NAMESPACES } from "@/lib/i18n/consts";
import type { ReactNode } from "react";
import Sidebar from "./components/Sidebar";

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
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const { locale } = await params;
  const dict = await getDictionary(locale, TRANSLATION_NAMESPACES.COMMON);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar dict={dict} locale={locale} />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
