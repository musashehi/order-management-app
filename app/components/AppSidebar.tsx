"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  Bell,
  Settings,
  ShoppingBag,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "All Orders",
    href: "/orders",
    icon: ClipboardList,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    name: "Reminders",
    href: "/dashboard#reminders",
    icon: Bell,
  },
];

const mobileNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/orders",
    icon: ClipboardList,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-slate-200 flex-col z-40">
        <div className="h-20 px-6 flex items-center border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>

          <div className="ml-3">
            <div className="font-black text-slate-900">
              Store Orders
            </div>

            <div className="text-xs text-slate-400">
              Order Management
            </div>
          </div>
        </div>

        <div className="px-4 pt-6">
          <div className="px-3 mb-3 text-[11px] font-black tracking-widest text-slate-400">
            MENU
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              const active =
                item.href === "/dashboard#reminders"
                  ? false
                  : pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href as Route}
                  className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition ${
                    active
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon size={19} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto px-4 pb-5">
          <div className="border-t border-slate-100 pt-4">
            <div className="px-3 mb-2 text-[11px] font-black tracking-widest text-slate-400">
              ACCOUNT
            </div>

            <Link
              href={"/settings" as Route}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition ${
                pathname === "/settings"
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
        <div className="grid grid-cols-4 h-16">
          {mobileNavigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href as Route}
                className={`flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
                  active
                    ? "text-blue-600"
                    : "text-slate-500"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}