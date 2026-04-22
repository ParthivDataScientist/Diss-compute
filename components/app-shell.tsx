"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Laptop,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Users,
  X
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import { cn } from "@/lib/utils";
import type { Session } from "@/lib/auth/types";

type AppShellProps = {
  session: Session;
  children: React.ReactNode;
};

const managerNav = [{ href: "/", label: "My Leads", icon: LayoutDashboard }];

const adminNav = [
  { href: "/", label: "All Leads", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: LineChart },
  { href: "/admin/users", label: "User Management", icon: Users }
];

export function AppShell({ session, children }: AppShellProps) {
  const pathname = usePathname();
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navItems = session.role === "admin" ? adminNav : managerNav;

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const activeLabel =
    navItems.find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)))?.label ?? "Circuit CRM";

  const renderNav = (collapsed = false) => (
    <nav className="flex-1 space-y-1.5">
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex h-11 items-center rounded-xl px-3 text-[14px] font-medium transition-all duration-200 lg:h-10 lg:rounded-lg lg:text-[13px]",
              collapsed ? "justify-center px-0" : "gap-3",
              isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <span
              className={cn(
                "absolute left-0 top-2 bottom-2 w-0.5 rounded-full transition-colors",
                isActive ? "bg-accent-600" : "bg-transparent group-hover:bg-slate-200"
              )}
            />
            <item.icon size={17} className={cn("shrink-0", isActive ? "text-accent-600" : "text-slate-400 group-hover:text-slate-600")} />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </Link>
        );
      })}
    </nav>
  );

  const renderSidebarBody = (collapsed = false) => (
    <div className="flex h-full flex-col px-3 py-4">
      <Link href="/" className={cn("flex items-center rounded-lg px-2 py-2 text-slate-900 transition-opacity hover:opacity-90", collapsed ? "justify-center" : "gap-3")}>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Laptop size={16} />
        </span>
        {!collapsed ? (
          <span>
            <span className="block text-[14px] font-semibold tracking-tight">Circuit CRM</span>
            <span className="block text-[11px] text-slate-500">Computer Shop</span>
          </span>
        ) : null}
      </Link>

      {!collapsed ? <p className="mt-4 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">Navigation</p> : null}

      <div className="mt-4 flex-1">{renderNav(collapsed)}</div>

      <div className="border-t border-slate-200 pt-3">
        <Link
          href="/add-lead"
          className={cn(
            "flex h-11 items-center justify-center rounded-xl bg-slate-900 text-[14px] font-semibold text-white transition-colors duration-200 hover:bg-slate-800 lg:h-10 lg:rounded-lg lg:text-[13px]",
            collapsed ? "w-10" : "gap-2"
          )}
          aria-label="Add Lead"
        >
          <Plus size={15} />
          {!collapsed ? <span>Add Lead</span> : null}
        </Link>

        <div className={cn("mt-3 flex items-center rounded-xl bg-slate-50 px-2 py-2", collapsed ? "justify-center" : "gap-3")}>
          <InitialsAvatar name={session.name} className="h-9 w-9 bg-white" labelClassName="text-[12px]" />
          {!collapsed ? (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-slate-900">{session.name}</p>
                <p className="truncate text-[11px] capitalize text-slate-500">{session.role}</p>
              </div>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-white hover:text-slate-700 lg:h-8 lg:w-8 lg:rounded-lg"
                >
                  <LogOut size={14} />
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface">
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/20 backdrop-blur-[1px] transition-opacity lg:hidden",
          mobileSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileSidebarOpen(false)}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[288px] border-r border-slate-200 bg-white transition-transform duration-200 lg:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(false)}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close sidebar"
        >
          <X size={16} />
        </button>
        {renderSidebarBody()}
      </aside>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-20 hidden border-r border-slate-200 bg-white transition-[width] duration-200 lg:block",
          desktopSidebarOpen ? "w-[248px]" : "w-[92px]"
        )}
      >
        {renderSidebarBody(!desktopSidebarOpen)}
      </aside>

      <main
        className={cn(
          "min-h-screen transition-[padding] duration-200",
          desktopSidebarOpen ? "lg:pl-[248px]" : "lg:pl-[92px]"
        )}
      >
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={18} />
            </button>

            <button
              type="button"
              onClick={() => setDesktopSidebarOpen((open) => !open)}
              className="hidden h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 lg:flex"
              aria-label={desktopSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {desktopSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
            </button>

            <div>
              <p className="text-[14px] font-semibold text-slate-900">{activeLabel}</p>
              <p className="hidden text-[12px] text-slate-500 sm:block">Operational workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900"
              aria-label="Notifications"
            >
              <Bell size={17} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <InitialsAvatar name={session.name} />
          </div>
        </header>

        <div className="mx-auto max-w-[1200px] px-4 py-5 md:px-6 md:py-8">{children}</div>
      </main>
    </div>
  );
}
