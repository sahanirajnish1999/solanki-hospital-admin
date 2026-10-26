"use client";

import React, { useState } from "react";
import AdminSidebar, { AdminView } from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import SpecializationManager from "@/components/specializations/SpecializationManager";
import DoctorManager from "@/components/doctors/DoctorManager";
import AppointmentManager from "@/components/appointments/AppointmentManager";
import AdminManagementTable from "@/components/superadmin/AdminManagementTable";
import ProfileCard from "@/components/profile/ProfileCard";
import AuthForms from "@/components/auth/AuthForms";
import ThemeToggle from "@/components/theme/ThemeToggle";
import AppLoader from "@/components/common/AppLoader";
import { useAppSelector } from "@/redux/hooks";
import { ShieldCheck, Hospital, Zap, Lock } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isSuperAdmin, isInitialized } = useAppSelector(
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans transition-colors duration-200">
      {!isAuthenticated ? (
        /* Unauthenticated Auth Screen */
        <div className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
          {/* Top-right theme switcher */}
          <div className="absolute top-6 right-6 z-20">
            <ThemeToggle showLabel={true} />
          </div>
          <div className="mb-6 text-center max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 mb-3">
              <ShieldCheck className="h-3.5 w-3.5" />
              Solanki Hospital Medical Console
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Admin &amp; Medical Portal
            </h1>
            <p className="mt-1.5 text-xs text-slate-500">
              Manage clinical specialties, doctors, staff permissions, and hospital operations.
            </p>
          </div>

          <AuthForms />

          {/* Quick API status badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1 border border-slate-200 shadow-2xs">
              <Zap className="h-3 w-3 text-amber-500" />
              Admin APIs Active
            </span>
            <span className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1 border border-slate-200 shadow-2xs">
              <Hospital className="h-3 w-3 text-blue-500" />
              Doctor &amp; Specialization APIs Ready
            </span>
            <span className="flex items-center gap-1 rounded-md bg-white px-2.5 py-1 border border-slate-200 shadow-2xs">
              <Lock className="h-3 w-3 text-emerald-500" />
              JWT Authenticated
            </span>
          </div>
        </div>
      ) : (
        /* Authenticated Full Enterprise Admin Panel */
        <div className="flex min-h-screen bg-slate-50">
          {/* Left Sidebar */}
          <AdminSidebar
            activeView={activeView}
            setActiveView={handleSetActiveView}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top Header */}
            <AdminHeader activeView={activeView} />

            {/* Dynamic View Body */}
            <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
              {activeView === "dashboard" && (
                <DashboardOverview setActiveView={handleSetActiveView} />
              )}

              {activeView === "specializations" && <SpecializationManager />}

              {activeView === "doctors" && <DoctorManager />}

              {activeView === "appointments" && <AppointmentManager />}

              {activeView === "admins" && isSuperAdmin && (
                <div className="space-y-4">
                  <AdminManagementTable />
                </div>
              )}

              {activeView === "profile" && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      My Profile &amp; Account Security
                    </h2>
                    <p className="text-xs text-slate-500">
                      View and manage your administrator contact information and password
                    </p>
                  </div>
                  <ProfileCard />
                </div>
              )}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}

