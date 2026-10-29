"use client";

import React, { useState } from "react";
import AdminSidebar, { AdminView } from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import SpecializationManager from "@/components/specializations/SpecializationManager";
import DoctorManager from "@/components/doctors/DoctorManager";
import AppointmentManager from "@/components/appointments/AppointmentManager";
import BlogManager from "@/components/blogs/BlogManager";
import AdminManagementTable from "@/components/superadmin/AdminManagementTable";
import ProfileCard from "@/components/profile/ProfileCard";
import AuthForms from "@/components/auth/AuthForms";
import ThemeToggle from "@/components/theme/ThemeToggle";
import AppLoader from "@/components/common/AppLoader";
import { useAppSelector } from "@/redux/hooks";
import { hasPermission } from "@/redux/utils/permissions";
import { ShieldCheck, Hospital, Zap, Lock } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isSuperAdmin, isInitialized, admin } = useAppSelector(
    (state) => state.auth
  );
  // Restore previous active view after page reload
  const [activeView, setActiveView] = useState<AdminView>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_active_view") as AdminView | null;
      if (
        saved &&
        [
          "dashboard",
          "specializations",
          "doctors",
          "appointments",
          "blogs",
          "admins",
          "profile",
        ].includes(saved)
      ) {
        return saved;
      }
    }
    return "dashboard";
  });

  const handleSetActiveView = (view: AdminView) => {
    setActiveView(view);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_active_view", view);
    }
  };

  // 1. Show smooth medical session loader while verifying local credentials on page load
  if (!isInitialized) {
    return <AppLoader message="Verifying secure session..." />;
  }

  // 2. Main Application Flow
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans transition-colors duration-200 dark:bg-[#09090c] dark:text-slate-100">
      {!isAuthenticated ? (
        /* Unauthenticated Auth Screen */
        <div className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#09090b]">
          {/* Top Bar with Brand Badge & Theme Switcher */}
          <div className="absolute top-6 inset-x-6 flex items-center justify-between z-20 max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white pl-2 pr-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs dark:border-slate-800 dark:bg-[#121215] dark:text-slate-300">
              <img
                src="/bbc-logo.png"
                alt="Solanki Hospital Logo"
                className="h-5 w-5 object-contain"
              />
              <span>Solanki Hospital Console</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Staff Access
              </span>
            </div>

            <ThemeToggle showLabel={true} />
          </div>

          <div className="relative z-10 w-full flex flex-col items-center pt-12 sm:pt-4">
            <AuthForms />

            {/* Quick Security & Compliance Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 border border-slate-200 shadow-2xs dark:border-slate-800 dark:bg-[#121215] dark:text-slate-300">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <span>Admin APIs Active</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 border border-slate-200 shadow-2xs dark:border-slate-800 dark:bg-[#121215] dark:text-slate-300">
                <Hospital className="h-3.5 w-3.5 text-blue-500" />
                <span>Clinical &amp; Specialist Portal</span>
              </span>
              <span className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 border border-slate-200 shadow-2xs dark:border-slate-800 dark:bg-[#121215] dark:text-slate-300">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                <span>JWT Authenticated</span>
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Full Enterprise Admin Panel */
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0b0c10]">
          {/* Left Sidebar */}
          <AdminSidebar
            activeView={activeView}
            setActiveView={handleSetActiveView}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
            {/* Top Header */}
            <AdminHeader activeView={activeView} />

            {/* Dynamic View Body */}
            <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
              {!isSuperAdmin &&
              activeView !== "profile" &&
              !hasPermission(admin, activeView) ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-center max-w-lg mx-auto my-12 dark:border-amber-900/40 dark:bg-amber-950/20 shadow-xs">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 mb-3">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Module Access Restricted
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    You do not currently have administrative permission to access this hospital section.
                    Please contact your hospital Superadmin to request module privileges.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSetActiveView("dashboard")}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Return to Dashboard
                  </button>
                </div>
              ) : (
                <>
                  {activeView === "dashboard" && (
                    <DashboardOverview setActiveView={handleSetActiveView} />
                  )}

                  {activeView === "specializations" && <SpecializationManager />}

                  {activeView === "doctors" && <DoctorManager />}

                  {activeView === "appointments" && <AppointmentManager />}

                  {activeView === "blogs" && <BlogManager />}

                  {activeView === "admins" && isSuperAdmin && (
                    <div className="space-y-4">
                      <AdminManagementTable />
                    </div>
                  )}

                  {activeView === "profile" && (
                    <div className="space-y-4 max-w-4xl mx-auto">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-teal-400 shadow-2xs">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                            My Profile &amp; Account Security
                          </h2>
                          <p className="text-xs text-slate-400">
                            View and manage your administrator contact information and password
                          </p>
                        </div>
                      </div>
                      <ProfileCard />
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

