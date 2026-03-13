/* **************************************************
 * Imports
 **************************************************/
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import { withLocale } from "@/lib/i18n/path";
import type { ReactNode } from "react";

/* **************************************************
 * Types
 ************************************************** */
interface LoginLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/* **************************************************
 * Login Layout
 ************************************************** */
export default async function LoginLayout({ children, params }: LoginLayoutProps) {
  const { locale } = await params;
  const user = await getUser();

  if (user) {
    redirect(withLocale("/admin", locale));
  }

  return <>{children}</>;
}
