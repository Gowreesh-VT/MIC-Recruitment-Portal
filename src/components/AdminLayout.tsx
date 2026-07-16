"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BarChart3, Users, Settings, LogOut, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: "dashboard" | "applications" | "settings" | "analytics";
}

export function AdminLayout({ children, activePage }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: "Dashboard",
      href: "/admin/dashboard",
      key: "dashboard" as const,
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Analytics",
      href: "/admin/analytics",
      key: "analytics" as const,
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Applications",
      href: "/admin/applications",
      key: "applications" as const,
    },
    {
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
      href: "/admin/settings",
      key: "settings" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-slate-100 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-56 bg-black border-r border-zinc-900 flex flex-col z-20">
        <div className="p-6 border-b border-zinc-900">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-extrabold">
            MIC Admin
          </p>
          <p className="text-base font-extrabold text-white mt-1">Portal</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activePage === item.key || pathname.startsWith(item.href);
            return (
              <Button
                key={item.href}
                variant={isActive ? "default" : "ghost"}
                onClick={() => router.push(item.href)}
                className={`w-full justify-start gap-3 px-3.5 py-2.5 text-sm font-bold transition-all ${
                  isActive
                    ? "bg-teal-500 text-slate-950 shadow-[0_0_15px_rgba(20,184,166,0.25)]"
                    : "text-zinc-400 hover:bg-zinc-900/60 hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full justify-start gap-3 px-3.5 py-2.5 text-sm font-bold text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-56 flex-1 min-h-screen flex flex-col bg-black">
        {children}
      </main>
    </div>
  );
}
