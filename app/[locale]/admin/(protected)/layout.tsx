/* **************************************************
 * Imports
 **************************************************/
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import type { ReactNode } from "react";
import Sidebar from "./components/Sidebar";
import SWRProvider from "@/components/providers/SWRProvider";
import SWRCacheIndicator from "@/components/debug/SWRCacheIndicator";

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
    <SWRProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      {/* Debug indicator solo in development */}
      {/* {process.env.NODE_ENV === "development" && <SWRCacheIndicator />} */}
    </SWRProvider>
  );
}
