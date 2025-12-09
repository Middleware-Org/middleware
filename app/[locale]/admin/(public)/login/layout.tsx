/* **************************************************
 * Imports
 **************************************************/
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth/server";
import type { ReactNode } from "react";

/* **************************************************
 * Types
 ************************************************** */
interface LoginLayoutProps {
  children: ReactNode;
}

/* **************************************************
 * Login Layout
 ************************************************** */
export default async function LoginLayout({ children }: LoginLayoutProps) {
  const user = await getUser();

  if (user) {
    redirect("/admin");
  }

  return <>{children}</>;
}
