/* **************************************************
 * Imports
 **************************************************/
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import type { ReactNode } from "react";

/* **************************************************
 * Types
 ************************************************** */
interface AdminProtectedLayoutProps {
  children: ReactNode;
}

/* **************************************************
 * Admin Protected Layout
 ************************************************** */
export default async function AdminProtectedLayout({ children }: AdminProtectedLayoutProps) {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
