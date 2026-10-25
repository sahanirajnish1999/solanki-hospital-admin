"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/authSlice";
import { useLogoutMutation } from "@/redux/api/adminApi";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import {
  LayoutDashboard,
  Stethoscope,
  Activity,
  Users,
  UserCheck,
  LogOut,
  Hospital,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export type AdminView =
  | "dashboard"
  | "specializations"
  | "doctors"
  | "admins"
  | "profile";

interface AdminSidebarProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
}

export default function AdminSidebar({
  activeView,
  setActiveView,
}: AdminSidebarProps) {
  const dispatch = useAppDispatch();
  const { admin, isSuperAdmin } = useAppSelector((state) => state.auth);
  const [logoutApi, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch {
      // ignore
    } finally {
      dispatch(logout());
    }
  };

  const navItems = [
    {
      id: "dashboard" as AdminView,
      label: "Dashboard",
      icon: LayoutDashboard,
      desc: "Overview & key metrics",
    },
    {
      id: "specializations" as AdminView,
      label: "Specializations",
      icon: Activity,
      desc: "Departments & services",
    },
    {
      id: "doctors" as AdminView,
      label: "Doctors Directory",
      icon: Stethoscope,
      desc: "Medical practitioners",
    },
    ...(isSuperAdmin
      ? [
          {
            id: "admins" as AdminView,
            label: "Administrators",
            icon: Users,
            desc: "Admin roles & access",
          },
        ]
      : []),
    {
      id: "profile" as AdminView,
      label: "My Profile",
      icon: UserCheck,
      desc: "Account settings",
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between min-h-screen">
      <div>
        {/* Hospital Brand Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <Hospital className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-slate-900 tracking-tight">
                Solanki Hospital
              </span>
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              Admin & Medical Portal
            </p>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="px-3 py-5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive ? "text-blue-600" : "text-slate-400"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-blue-600" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin User Footer Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70 m-3 rounded-2xl border">
        {admin && (
          <div className="flex items-center gap-2.5 mb-3">
            {admin.ProfileImage ? (
              <img
                src={getAdminImageUrl(admin.ProfileImage)}
                alt={admin.Name}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/20"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">
                {admin.Name.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="truncate text-xs font-bold text-slate-900">
                  {admin.Name}
                </p>
                {isSuperAdmin && (
                  <Sparkles className="h-3 w-3 text-purple-600 shrink-0" />
                )}
              </div>
              <span className="block truncate text-[10px] text-slate-500 uppercase font-semibold">
                {admin.Role}
              </span>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white py-2 text-xs font-semibold text-red-600 shadow-sm transition hover:bg-red-50 disabled:opacity-50"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
        </button>
      </div>
    </aside>
  );
}
