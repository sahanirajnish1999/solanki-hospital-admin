"use client";

import React from "react";
import { useAppSelector } from "@/redux/hooks";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import { User } from "lucide-react";
import type { AdminView } from "./AdminSidebar";
import ThemeToggle from "@/components/theme/ThemeToggle";

interface AdminHeaderProps {
  activeView?: AdminView;
}

export default function AdminHeader({ activeView }: AdminHeaderProps) {
  const { admin, isSuperAdmin } = useAppSelector((state) => state.auth);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-end border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md select-none dark:border-slate-800 dark:bg-[#0e0e11]/95">
      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Theme Toggle Icon Button */}
        <ThemeToggle showLabel={false} />

        {/* Admin profile pill */}
        {admin && (
          <div className="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-50/70 py-1 pl-1.5 pr-2.5 dark:border-slate-800 dark:bg-[#161619]">
            {admin.ProfileImage ? (
              <img
                src={getAdminImageUrl(admin.ProfileImage)}
                alt={admin.Name}
                className="h-6 w-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-[10px] font-medium dark:bg-slate-700 dark:text-slate-200">
                <User className="h-3 w-3" />
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                {admin.Name}
              </span>
              {isSuperAdmin && (
                <span className="rounded bg-slate-200/80 px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider text-slate-600 dark:bg-slate-800 dark:text-slate-300">
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
