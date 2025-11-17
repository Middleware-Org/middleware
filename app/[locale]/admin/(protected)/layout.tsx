/* **************************************************
 * Imports
 **************************************************/
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import type { ReactNode } from "react";
import Sidebar from "./components/Sidebar";

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

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
