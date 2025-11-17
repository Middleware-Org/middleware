/* **************************************************
 * Imports
 **************************************************/
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderTree,
  Users,
  BookOpen,
  Image as ImageIcon,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/classes";
import { authClient } from "@/lib/auth/client";

/* **************************************************
 * Sidebar Component
 **************************************************/
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      href: "/admin/categories",
      label: "Categorie",
      icon: FolderTree,
    },
    {
      href: "/admin/authors",
      label: "Autori",
      icon: Users,
    },
    {
      href: "/admin/issues",
      label: "Issues",
      icon: BookOpen,
    },
    {
      href: "/admin/media",
      label: "Media",
      icon: ImageIcon,
    },
    {
      href: "/admin/articles",
      label: "Articoli",
      icon: FileText,
    },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    "hover:bg-gray-800",
                    isActive ? "bg-gray-800 text-white" : "text-gray-300",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-800 text-gray-400 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
