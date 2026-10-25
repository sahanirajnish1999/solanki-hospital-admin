"use client";

import React from "react";
import { useAppSelector } from "@/redux/hooks";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import {
  ShieldCheck,
  Sparkles,
  Server,
  User,
} from "lucide-react";
import type { AdminView } from "./AdminSidebar";

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-600">Admin</span>
          <span className="text-xs text-slate-300">/</span>
          <h1 className="text-sm font-bold text-slate-900 capitalize">
            {current.title}
          </h1>
        </div>
        <p className="text-[11px] text-slate-500 hidden sm:block">
          {current.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Backend Gateway indicator */}
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <Server className="h-3 w-3 text-slate-400" />
          <span className="font-medium text-slate-700">API Port 4200</span>
        </div>

        {/* Admin profile pill */}
        {admin && (
          <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50/80 py-1 pl-1.5 pr-3">
            {admin.ProfileImage ? (
              <img
                src={getAdminImageUrl(admin.ProfileImage)}
                alt={admin.Name}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-blue-500"
              />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                {admin.Name}
              </span>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-purple-700">
                  <Sparkles className="h-2.5 w-2.5" />
                  Superadmin
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-700">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Admin
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
