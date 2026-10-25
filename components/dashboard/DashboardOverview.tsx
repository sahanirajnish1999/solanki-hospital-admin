"use client";

import React from "react";
import { useGetAllSpecializationsQuery } from "@/redux/api/specializationApi";
import { useGetPublicDoctorsQuery } from "@/redux/api/doctorApi";
import { useGetAllAdminsQuery } from "@/redux/api/adminApi";
import { useAppSelector } from "@/redux/hooks";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import type { AdminView } from "../layout/AdminSidebar";
import {
  Activity,
  Stethoscope,
  Users,
  ShieldCheck,
  Plus,
  ArrowRight,
  Star,
  CheckCircle2,
  Calendar,
} from "lucide-react";

interface DashboardOverviewProps {
  setActiveView: (view: AdminView) => void;
}

export default function DashboardOverview({
  setActiveView,
}: DashboardOverviewProps) {
  const { isSuperAdmin, admin } = useAppSelector((state) => state.auth);

  const { data: specData } = useGetAllSpecializationsQuery({ All: true });
  const { data: docData } = useGetPublicDoctorsQuery({ Limit: 5 });
  const { data: adminData } = useGetAllAdminsQuery(undefined, {
    skip: !isSuperAdmin,
  });

  const specializations = specData?.Data || [];
  const doctors = docData?.Data?.Doctors || [];
  const totalDoctors = docData?.Data?.Pagination?.Total || doctors.length;
  const onlineDoctorsCount = doctors.filter((d) => d.IsOnline).length;
  const totalAdmins = adminData?.Pagination?.Total || 1;

  const stats = [
    {
      title: "Clinical Specialties",
      value: specializations.length,
      icon: Activity,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      target: "specializations" as AdminView,
    },
    {
      title: "Registered Doctors",
      value: totalDoctors,
      icon: Stethoscope,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      target: "doctors" as AdminView,
    },
    {
      title: "Doctors Online Now",
      value: onlineDoctorsCount,
      icon: CheckCircle2,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      target: "doctors" as AdminView,
    },
    {
      title: "Administrators",
      value: totalAdmins,
      icon: Users,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      target: (isSuperAdmin ? "admins" : "profile") as AdminView,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-lg shadow-blue-500/10 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur-xs">
                Hospital Admin Dashboard
              </span>
              <span className="flex items-center gap-1 text-xs text-blue-100">
                <Calendar className="h-3.5 w-3.5" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl tracking-tight">
              Good day, {admin?.Name || "Administrator"}
            </h1>
            <p className="mt-1 text-xs text-blue-100 sm:text-sm max-w-xl">
              Welcome to the central administrative panel. Manage departments,
              certified doctors, patient schedules, and staff credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveView("specializations")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-md transition hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 text-blue-700" />
              <span>Specializations</span>
            </button>
            <button
              onClick={() => setActiveView("doctors")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-500/30 border border-white/20 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs transition hover:bg-white/20"
            >
              <Stethoscope className="h-4 w-4" />
              <span>Doctors Directory</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveView(stat.target)}
              className="group cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">
                  {stat.title}
                </span>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${stat.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-slate-900">
                  {stat.value}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 group-hover:translate-x-0.5 transition">
                  <span>Manage</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Specialties & Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specializations Quick View */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Activity className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Active Specializations
              </h3>
            </div>
            <button
              onClick={() => setActiveView("specializations")}
              className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <span>View all ({specializations.length})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {specializations.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No specializations defined yet.
              </p>
            ) : (
              specializations.slice(0, 5).map((spec) => (
                <div
                  key={spec._id || spec.Id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    {spec.Icon ? (
                      <img
                        src={getAdminImageUrl(spec.Icon)}
                        alt={spec.Name}
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold text-xs">
                        {spec.Name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {spec.Name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">
                        {spec.Description || "Clinical department"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                      spec.IsActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {spec.IsActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Doctors Directory Preview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Stethoscope className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">
                Medical Practitioners
              </h3>
            </div>
            <button
              onClick={() => setActiveView("doctors")}
              className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <span>View all ({totalDoctors})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {doctors.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">
                No doctors registered yet.
              </p>
            ) : (
              doctors.slice(0, 5).map((doc) => (
                <div
                  key={doc._id || doc.Id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    {doc.ProfileImage ? (
                      <img
                        src={getAdminImageUrl(doc.ProfileImage)}
                        alt={doc.Name}
                        className="h-8 w-8 rounded-lg object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                        {doc.Name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {doc.Name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {doc.Specialization || "General Physician"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                      <Star className="h-3 w-3 fill-amber-400" />
                      <span>{doc.Rating || 4.8}</span>
                    </span>
                    <span
                      className={`h-2 w-2 rounded-full ${
                        doc.IsOnline ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                      title={doc.IsOnline ? "Online" : "Offline"}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Redux Architecture Status Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Connected API Modules & Endpoints
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <span className="font-bold text-slate-800">Admin API</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Signup, Login, Profile (GET/PUT), Password, Superadmin Admins List & Status
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <span className="font-bold text-slate-800">Specialization API</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              GET /specialization, GET /:id, POST, PUT /:id, DELETE /:id, PATCH /:id/status
            </p>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
            <span className="font-bold text-slate-800">Doctor API</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Public directory & profiles, doctor listings, specialization filters
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
