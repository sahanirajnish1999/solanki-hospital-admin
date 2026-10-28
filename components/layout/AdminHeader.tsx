"use client";

import React from "react";
import { useAppSelector } from "@/redux/hooks";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import {
  Server,
  User,
} from "lucide-react";
import type { AdminView } from "./AdminSidebar";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface AdminHeaderProps {
  activeView: AdminView;
}

export default function AdminHeader({ activeView }: AdminHeaderProps) {
  const { admin, isSuperAdmin } = useAppSelector((state) => state.auth);

  const viewTitles: Record<AdminView, { title: string; subtitle: string }> = {
    dashboard: {
      title: "Hospital Overview Dashboard",
      subtitle: "Live operations, doctor availability, and department stats",
    },
    specializations: {
      title: "Specializations Management",
      subtitle:
        "Manage clinical departments, medical specialties, and descriptions",
    },
    doctors: {
      title: "Doctors Directory & Management",
      subtitle: "Medical staff profiles, online consultation status, and bookings",
    },
    appointments: {
      title: "Appointments & Consultation Bookings",
      subtitle:
        "Patient tokens, scheduled clinical slots, fees, and payment status",
    },
    admins: {
      title: "Administrators & Access Control",
      subtitle:
        "Superadmin access: Configure staff permissions and activate accounts",
    },
    profile: {
      title: "My Administrator Profile",
      subtitle: "Manage personal credentials, phone number, and security",
    },
  };

  const current = viewTitles[activeView] || viewTitles.dashboard;

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md select-none">
      {/* Left: Refined Breadcrumbs */}
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-slate-400">Admin</span>
          <span className="text-[11px] text-slate-300">/</span>
          <h1 className="text-xs font-semibold text-slate-900 tracking-tight">
            {current.title}
          </h1>
        </div>
        <p className="text-[10px] text-slate-400 hidden sm:block">
          {current.subtitle}
        </p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Backend Gateway indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50/80 px-2.5 py-1 text-[11px] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <Server className="h-3 w-3 text-slate-400" />
          <span className="font-medium text-slate-700">Port 4200</span>
        </div>

        {/* Theme Toggle Icon Button */}
        <ThemeToggle showLabel={false} />

        {/* Admin profile pill */}
        {admin && (
          <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/70 py-1 pl-1.5 pr-2.5">
            {admin.ProfileImage ? (
              <img
                src={getAdminImageUrl(admin.ProfileImage)}
                alt={admin.Name}
                className="h-6 w-6 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[10px] font-medium">
                <User className="h-3 w-3" />
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-800">
                {admin.Name}
              </span>
              {isSuperAdmin && (
                <span className="rounded bg-slate-200/80 px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                  Superadmin
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
