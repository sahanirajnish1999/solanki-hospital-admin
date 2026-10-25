"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/authSlice";
import { useLogoutMutation } from "@/redux/api/adminApi";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import {
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  Activity,
} from "lucide-react";

export default function Navbar() {
  const dispatch = useAppDispatch();
  const { admin, isAuthenticated, isSuperAdmin } = useAppSelector(
    (state) => state.auth
  );
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // Even if network fails, clear local credentials
    } finally {
      dispatch(logout());
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-blue-500/20">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Solanki Hospital
              </span>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                Admin
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Healthcare Management Console
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && admin ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50/80 py-1 pl-1.5 pr-4 dark:border-slate-800 dark:bg-slate-800/80">
                {admin.ProfileImage ? (
                  <img
                    src={getAdminImageUrl(admin.ProfileImage)}
                    alt={admin.Name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    <User className="h-4 w-4" />
                  </div>
                )}

                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {admin.Name}
                    </span>
                    {isSuperAdmin ? (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:bg-purple-950/80 dark:text-purple-300">
                        <Sparkles className="h-2.5 w-2.5" />
                        Superadmin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <ShieldCheck className="h-2.5 w-2.5" />
                        Admin
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {admin.Email}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/80 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 active:scale-95 disabled:opacity-50 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/60"
                title="Logout admin session"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>Authentication Required</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
