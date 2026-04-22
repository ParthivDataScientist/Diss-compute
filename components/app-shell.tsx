"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, Laptop, LayoutDashboard, LineChart, LogOut, Menu,
  PanelLeftClose, PanelLeftOpen, Plus, Shield, Users
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import type { Session } from "@/lib/auth/types";

type AppShellProps = {
  session: Session;
  children: React.ReactNode;
};

const managerNav = [
  { href: "/", label: "My Leads", icon: LayoutDashboard },
  { href: "/add-lead", label: "Add Lead", icon: Plus }
];

const adminNav = [
  { href: "/", label: "All Leads", icon: LayoutDashboard },
  { href: "/add-lead", label: "Add Lead", icon: Plus },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/admin/users", label: "User Management", icon: Users }
];

export function AppShell({ session, children }: AppShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navItems = session.role === "admin" ? adminNav : managerNav;

  const initials = session.name
    .split(" ")
    .map(n => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-line bg-white transition-all duration-300 ease-in-out lg:flex ${
          sidebarOpen ? "w-[240px]" : "w-0 overflow-hidden border-r-0"
        }`}
      >
        <div className="flex h-full flex-col px-4 py-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 rounded-lg px-2 py-2 transition-opacity hover:opacity-80">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-600 text-white shadow-sm">
              <Laptop size={16} />
            </span>
            <span>
              <span className="block text-[14px] font-bold tracking-tight text-ink">Circuit CRM</span>
              <span className="block text-[11px] font-medium text-muted">Computer Shop</span>
            </span>
          </Link>

          {/* Role badge */}
          <div className="mt-4 px-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              session.role === "admin"
                ? "bg-accent-100 text-accent-700"
                : "bg-gray-100 text-gray-600"
            }`}>
              <Shield size={11} />
              {session.role === "admin" ? "Administrator" : "Manager"}
            </span>
          </div>

          {/* Nav */}
          <nav className="mt-5 flex-1 space-y-0.5 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              const isAdmin = item.href === "/admin/users" || item.href === "/analytics";
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                    isActive
                      ? "bg-accent-50 text-accent-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-ink"
                  }`}
                >
                  <item.icon
                    size={16}
                    className={`shrink-0 ${isActive ? "text-accent-600" : "text-gray-400 group-hover:text-gray-600"}`}
                  />
                  {item.label}
                  {isAdmin && (
                    <span className="ml-auto rounded px-1.5 py-0.5 text-[9px] font-bold uppercase bg-accent-100 text-accent-600">
                      Admin
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom: Add Lead CTA + User */}
          <div className="mt-4 shrink-0 space-y-3">
            <Link
              href="/add-lead"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-accent-600 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-accent-700"
            >
              <Plus size={15} />
              Add Lead
            </Link>

            <div className="flex items-center gap-3 rounded-xl border border-line p-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[12px] font-bold text-accent-700">
                {initials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-[13px] font-semibold text-ink">{session.name}</p>
                <p className="truncate text-[11px] text-gray-500 capitalize">{session.role}</p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-red-500"
                >
                  <LogOut size={14} />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:pl-[240px]" : "lg:pl-0"}`}>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white/90 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(p => !p)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink"
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen
                ? <PanelLeftClose size={18} className="hidden lg:block" />
                : <PanelLeftOpen size={18} className="hidden lg:block" />
              }
              <Menu size={18} className="lg:hidden" />
            </button>
            <span className="text-[14px] font-semibold text-ink hidden sm:block">
              {navItems.find(n => n.href === "/" ? pathname === "/" : pathname.startsWith(n.href))?.label ?? "Circuit CRM"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {session.role === "admin" && (
              <span className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-1 text-[11px] font-bold text-accent-700">
                <Shield size={11} />
                Admin View
              </span>
            )}
            <button className="relative text-gray-500 hover:text-ink transition-colors">
              <Bell size={18} />
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                3
              </span>
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-100 text-[12px] font-bold text-accent-700">
              {initials}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1200px] p-8">{children}</div>
      </main>
    </div>
  );
}
