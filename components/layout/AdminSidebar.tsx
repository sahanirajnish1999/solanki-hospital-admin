"use client";

import React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logout } from "@/redux/features/authSlice";
import { useLogoutMutation } from "@/redux/api/adminApi";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import { hasPermission } from "@/redux/utils/permissions";
import {
  LayoutDashboard,
  Stethoscope,
  Activity,
  Users,
  UserCheck,
  CalendarCheck,
  LogOut,
  Hospital,
  BookOpen,
} from "lucide-react";

export type AdminView =
  | "dashboard"
  | "specializations"
  | "doctors"
  | "appointments"
  | "blogs"
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

  const allNavItems = [
    {
      id: "dashboard" as AdminView,
      label: "Dashboard",
      icon: LayoutDashboard,
      permission: "dashboard",
    },
    {
      id: "specializations" as AdminView,
      label: "Specializations",
      icon: Activity,
      permission: "specializations",
    },
    {
      id: "doctors" as AdminView,
      label: "Doctors Directory",
      icon: Stethoscope,
      permission: "doctors",
    },
    {
      id: "appointments" as AdminView,
      label: "Appointments",
      icon: CalendarCheck,
      permission: "appointments",
    },
    {
      id: "blogs" as AdminView,
      label: "Medical Blogs",
      icon: BookOpen,
      permission: "blogs",
    },
    ...(isSuperAdmin
      ? [
          {
            id: "admins" as AdminView,
            label: "Administrators",
            icon: Users,
            permission: "admins",
          },
        ]
      : []),
    {
      id: "profile" as AdminView,
      label: "My Profile",
      icon: UserCheck,
    },
  ];

  const navItems = allNavItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(admin, item.permission);
  });

  return (
    <aside className="w-60 shrink-0 border-r border-slate-200/90 bg-white flex flex-col justify-between h-screen sticky top-0 z-20 overflow-y-auto select-none">
      <div className="flex flex-col flex-1 min-h-0">
        {/* 1. Refined Hospital Brand Header */}
        <div className="flex items-center justify-center px-4 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <img
            src="/bbc-logo.png"
            alt="Solanki Hospital Logo"
            className="h-12 w-auto max-w-[180px] object-contain transition-transform duration-200 hover:scale-105"
          />
        </div>

        {/* 2. Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3 py-3.5 min-h-0">
          <div className="px-2.5 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-slate-100 text-slate-900 font-semibold shadow-2xs"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? "text-[#008ba3]" : "text-slate-400"
                      }`}
                    />
                    <span className={isActive ? "text-slate-900 font-semibold" : ""}>
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#008ba3]" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* 3. Refined Admin User & Session Footer - Always pinned to bottom */}
      <div className="p-3 pb-4 border-t border-slate-100 shrink-0 mt-auto">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          {admin && (
            <div className="flex items-center gap-2 min-w-0">
              {admin.ProfileImage ? (
                <img
                  src={getAdminImageUrl(admin.ProfileImage)}
                  alt={admin.Name}
                  className="h-7 w-7 rounded-lg object-cover border border-slate-200 shrink-0"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 shrink-0">
                  {admin.Name.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-900 leading-tight">
                  {admin.Name}
                </p>
                <span className="block truncate text-[10px] text-slate-400 font-medium">
                  {isSuperAdmin ? "Superadmin" : "Administrator"}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            title="Sign out of console"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
