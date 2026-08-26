"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
  Store,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

export default function SettingsUI({ email }: { email: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [notifications, setNotifications] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:ml-[260px]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 lg:px-9 py-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Settings
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage your account and application preferences.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="p-6 lg:p-9 max-w-5xl">
        <div className="grid gap-6">

          {/* Account */}
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <User size={20} />
                </div>

                <div>
                  <h2 className="font-black text-slate-900">
                    Account
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your Store Orders account.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                  {email.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email
                  </div>

                  <div className="flex items-center gap-2 mt-1 font-semibold text-slate-900">
                    <Mail size={16} />
                    {email}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                  <Bell size={20} />
                </div>

                <div>
                  <h2 className="font-black text-slate-900">
                    Notifications
                  </h2>

                  <p className="text-sm text-slate-500">
                    Choose how order reminders are shown.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 flex items-center justify-between gap-5">
              <div>
                <div className="font-bold text-slate-900">
                  Order reminders
                </div>

                <p className="text-sm text-slate-500 mt-1">
                  Show reminders for orders that need your attention.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setNotifications((current) => !current)}
                className={`relative w-12 h-7 rounded-full transition ${
                  notifications ? "bg-blue-600" : "bg-slate-300"
                }`}
                aria-label="Toggle order reminders"
              >
                <span
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${
                    notifications ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </section>

          {/* Application */}
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Settings size={20} />
                </div>

                <div>
                  <h2 className="font-black text-slate-900">
                    Application
                  </h2>

                  <p className="text-sm text-slate-500">
                    Information about your order management system.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Store size={19} className="text-slate-400" />

                  <div>
                    <div className="font-bold text-slate-900">
                      Application
                    </div>

                    <div className="text-sm text-slate-500">
                      Store Orders
                    </div>
                  </div>
                </div>

                <Check size={18} className="text-green-600" />
              </div>

              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ShieldCheck size={19} className="text-slate-400" />

                  <div>
                    <div className="font-bold text-slate-900">
                      Account security
                    </div>

                    <div className="text-sm text-slate-500">
                      Authentication protected by Supabase
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">
                  Active
                </span>
              </div>

              <div className="p-6 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">
                    Version
                  </div>

                  <div className="text-sm text-slate-500">
                    Store Orders web application
                  </div>
                </div>

                <span className="text-sm font-semibold text-slate-500">
                  1.0.0
                </span>
              </div>
            </div>
          </section>

          {/* Logout */}
          <section className="bg-white border border-red-100 rounded-2xl overflow-hidden">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <h2 className="font-black text-slate-900">
                  Log out
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Sign out of your Store Orders account.
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition disabled:opacity-50"
              >
                <LogOut size={18} />

                {loading ? "Logging out..." : "Log out"}
              </button>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}