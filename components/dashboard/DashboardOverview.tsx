"use client";

import React from "react";
import { useGetAllSpecializationsQuery } from "@/redux/api/specializationApi";
import { useGetDoctorListQuery } from "@/redux/api/doctorApi";
import { useGetAllAdminsQuery } from "@/redux/api/adminApi";
import { useGetAppointmentsQuery } from "@/redux/api/appointmentApi";
import { useGetAllBlogsQuery } from "@/redux/api/blogApi";
import { useAppSelector } from "@/redux/hooks";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import type { AdminView } from "../layout/AdminSidebar";
import SpecializationIconBadge from "../specializations/SpecializationIconBadge";
import {
  Activity,
  Stethoscope,
  Users,
  Plus,
  ArrowRight,
  Star,
  CheckCircle2,
  Calendar,
  CalendarCheck,
  Clock,
  BookOpen,
} from "lucide-react";

interface DashboardOverviewProps {
  setActiveView: (view: AdminView) => void;
}

function formatAppointmentDate(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function DashboardOverview({
  setActiveView,
}: DashboardOverviewProps) {
  const { isSuperAdmin, admin } = useAppSelector((state) => state.auth);

  const { data: specData } = useGetAllSpecializationsQuery({ All: true });
  const { data: docData } = useGetDoctorListQuery({ limit: 5 });
  const { data: appointmentData } = useGetAppointmentsQuery({ Limit: 5 });
  const { data: blogData } = useGetAllBlogsQuery({ Limit: 5 });
  const { data: adminData } = useGetAllAdminsQuery(undefined, {
    skip: !isSuperAdmin,
  });

  const specializations = specData?.Data || [];
  const doctors = docData?.Data?.Doctors || [];
  const totalDoctors =
    docData?.Data?.Summary?.Total ??
    (docData?.Data?.Pagination?.Total || doctors.length);
  const onlineDoctorsCount = doctors.filter((d) => d.IsOnline).length;
  const totalAdmins = adminData?.Pagination?.Total || 1;
  const totalBlogs = blogData?.Pagination?.Total ?? (blogData?.Data?.length || 0);

  const appointments = appointmentData?.Data?.Appointments || [];
  const totalAppointments =
    appointmentData?.Data?.Pagination?.Total ??
    (appointmentData?.Data?.Summary?.TotalAssignedPatients || appointments.length);
  const appointmentSummary = appointmentData?.Data?.Summary;

  const stats = [
    {
      title: "Clinical Specialties",
      value: specializations.length,
      icon: Activity,
      badge: "Departments Active",
      target: "specializations" as AdminView,
      actionText: "Manage Specialties",
    },
    {
      title: "Registered Doctors",
      value: totalDoctors,
      icon: Stethoscope,
      badge: "Medical Practitioners",
      target: "doctors" as AdminView,
      actionText: "View Directory",
    },
    {
      title: "Active Appointments",
      value: totalAppointments,
      icon: CalendarCheck,
      badge: `${appointmentSummary?.TodayScheduledSlots ?? appointments.length} Today's Slots`,
      target: "appointments" as AdminView,
      actionText: "Consultation Queue",
    },
    {
      title: "Doctors Online Now",
      value: onlineDoctorsCount,
      icon: CheckCircle2,
      badge: "Available for OPD",
      target: "doctors" as AdminView,
      actionText: "Check Availability",
      isLive: true,
    },
    {
      title: "Medical Blogs",
      value: totalBlogs,
      icon: BookOpen,
      badge: "Clinical Articles",
      target: "blogs" as AdminView,
      actionText: "Manage Blogs",
    },
    {
      title: "Administrators",
      value: totalAdmins,
      icon: Users,
      badge: isSuperAdmin ? "Superadmin Active" : "Staff Access",
      target: (isSuperAdmin ? "admins" : "profile") as AdminView,
      actionText: "Access & Roles",
    },
  ];

  const currentDateString = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* 1. Refined Executive Header Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            {/* Top Tagline Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Hospital Admin Console
              </span>

              <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/60 px-2.5 py-0.5 text-[11px] text-slate-400">
                <Calendar className="h-3 w-3 text-slate-400" />
                {currentDateString}
              </span>

              {isSuperAdmin && (
                <span className="rounded-full border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-300">
                  Superadmin
                </span>
              )}
            </div>

            {/* Title & Description */}
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                Good day, {admin?.Name || "Dr. Solanki"}
              </h1>
              <p className="mt-1 text-xs text-slate-400 max-w-xl leading-relaxed">
                Central administrative panel for hospital operations, department
                specialties, verified medical doctors, and live patient consultation queues.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>
                  <strong className="text-slate-200 font-medium">{specializations.length}</strong> Departments
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>
                  <strong className="text-slate-200 font-medium">{onlineDoctorsCount}</strong> Online Doctors
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <span>
                  <strong className="text-slate-200 font-medium">{totalAppointments}</strong> Consultations
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveView("specializations")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-medium text-slate-900 transition hover:bg-slate-100 cursor-pointer shadow-2xs"
            >
              <Plus className="h-3.5 w-3.5 text-slate-900" />
              <span>Specializations</span>
            </button>
            <button
              onClick={() => setActiveView("doctors")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700/80 cursor-pointer"
            >
              <Stethoscope className="h-3.5 w-3.5 text-slate-300" />
              <span>Doctors</span>
            </button>
            <button
              onClick={() => setActiveView("appointments")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700/80 cursor-pointer"
            >
              <CalendarCheck className="h-3.5 w-3.5 text-slate-300" />
              <span>Appointments</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Refined KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveView(stat.target)}
              className="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-xs cursor-pointer"
            >
              {/* Top Row: Title + Clean Neutral Icon */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-500 truncate">
                  {stat.title}
                </span>
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 border border-slate-200/60">
                  <Icon className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Middle Row: Balanced Stat Number + Clean Badge */}
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </span>
                {stat.isLive && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live
                  </span>
                )}
              </div>

              {/* Subtle Contextual Badge */}
              <div className="mt-1">
                <span className="inline-block rounded-md bg-slate-50 border border-slate-200/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                  {stat.badge}
                </span>
              </div>

              {/* Bottom Interactive Link */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-500 group-hover:text-slate-900 transition">
                <span>{stat.actionText}</span>
                <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Operational Sections: 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Active Specializations */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900">
                  Active Clinical Specializations
                </h3>
                <p className="text-[11px] text-slate-400">
                  Hospital departments and clinical services
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView("specializations")}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all ({specializations.length})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-2 divide-y divide-slate-100">
            {specializations.length === 0 ? (
              <div className="py-8 text-center">
                <Activity className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  No specializations found in database.
                </p>
                <button
                  onClick={() => setActiveView("specializations")}
                  className="mt-2 text-xs font-medium text-slate-800 hover:underline cursor-pointer"
                >
                  + Add First Specialty
                </button>
              </div>
            ) : (
              specializations.slice(0, 5).map((spec) => (
                <div
                  key={spec._id || spec.Id}
                  onClick={() => setActiveView("specializations")}
                  className="group flex items-center justify-between py-2.5 px-2 rounded-lg transition hover:bg-slate-50 cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SpecializationIconBadge
                      name={spec.Name}
                      icon={spec.Icon}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-900 group-hover:text-slate-950 transition truncate">
                        {spec.Name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-sm">
                        {spec.Description || "Specialized clinical care & treatment"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-50 border border-slate-200">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          spec.IsActive ? "bg-emerald-500" : "bg-slate-400"
                        }`}
                      />
                      {spec.IsActive ? "Active" : "Inactive"}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Medical Practitioners */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-slate-900">
                  Medical Practitioners
                </h3>
                <p className="text-[11px] text-slate-400">
                  Certified doctors and specialist consultants
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveView("doctors")}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View all ({totalDoctors})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="mt-2 divide-y divide-slate-100">
            {doctors.length === 0 ? (
              <div className="py-8 text-center">
                <Stethoscope className="mx-auto h-7 w-7 text-slate-300" />
                <p className="mt-2 text-xs font-medium text-slate-500">
                  No doctors registered yet.
                </p>
                <button
                  onClick={() => setActiveView("doctors")}
                  className="mt-2 text-xs font-medium text-slate-800 hover:underline cursor-pointer"
                >
                  + Add New Doctor
                </button>
              </div>
            ) : (
              doctors.slice(0, 5).map((doc) => {
                const imgUrl = doc.ProfileImage
                  ? getAdminImageUrl(doc.ProfileImage)
                  : null;
                return (
                  <div
                    key={doc._id || doc.Id}
                    onClick={() => setActiveView("doctors")}
                    className="group flex items-center justify-between py-2.5 px-2 rounded-lg transition hover:bg-slate-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Doctor Avatar with subtle Online Indicator */}
                      <div className="relative shrink-0">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={doc.Name}
                            className="h-8.5 w-8.5 rounded-lg object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-medium text-xs border border-slate-200">
                            {doc.Name.charAt(0)}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-white ${
                            doc.IsOnline ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                          title={doc.IsOnline ? "Online for OPD" : "Offline"}
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-medium text-slate-900 group-hover:text-slate-950 transition truncate">
                            {doc.Name}
                          </p>
                          {doc.IsOnline && (
                            <span className="text-[9px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                              Online
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {doc.Specialization || "General Physician"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/80">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{doc.Rating || 4.8}</span>
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 4. Live Appointments & Patient Consultation Stream */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3.5 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 border border-slate-200/60">
              <CalendarCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold text-slate-900">
                  Recent Appointments &amp; Consultations
                </h3>
                <span className="rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 border border-slate-200">
                  Live Queue ({totalAppointments})
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Scheduled consultation slots, assigned doctor tokens, and patient bookings
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveView("appointments")}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>View Full Queue</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="py-8 text-center">
            <Calendar className="mx-auto h-7 w-7 text-slate-300" />
            <p className="mt-2 text-xs font-medium text-slate-500">
              No appointments scheduled currently.
            </p>
            <button
              onClick={() => setActiveView("appointments")}
              className="mt-2 text-xs font-medium text-slate-800 hover:underline cursor-pointer"
            >
              Open Appointments Manager
            </button>
          </div>
        ) : (
          <div className="mt-2 divide-y divide-slate-100">
            {appointments.slice(0, 5).map((appt) => {
              const doctorDisplayName = (appt.DoctorName || "").trim().startsWith("Dr.")
                ? appt.DoctorName.trim()
                : `Dr. ${(appt.DoctorName || "").trim()}`;

              const getStatusDot = (status: string) => {
                switch (status?.toLowerCase()) {
                  case "confirmed":
                    return "bg-emerald-500";
                  case "completed":
                    return "bg-blue-500";
                  case "cancelled":
                    return "bg-rose-500";
                  default:
                    return "bg-amber-500";
                }
              };

              return (
                <div
                  key={appt._id || appt.Id}
                  onClick={() => setActiveView("appointments")}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-2 rounded-lg transition hover:bg-slate-50 gap-2 cursor-pointer"
                >
                  {/* Patient Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                      #{appt.TokenNumber || 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 group-hover:text-slate-950 transition truncate">
                        {appt.PatientName}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Stethoscope className="h-3 w-3 text-slate-400" />
                          <span>{doctorDisplayName}</span>
                        </span>
                        {appt.DoctorSpecialization && (
                          <>
                            <span>•</span>
                            <span className="truncate">{appt.DoctorSpecialization}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Schedule & Status */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-10.5 sm:pl-0">
                    <div className="text-left sm:text-right">
                      <div className="flex items-center sm:justify-end gap-1 text-[11px] font-medium text-slate-600">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span>{appt.AppointmentTime || "Regular Slot"}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {formatAppointmentDate(appt.AppointmentDate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium border bg-slate-50 text-slate-700 border-slate-200">
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getStatusDot(appt.Status)}`}
                        />
                        {appt.Status}
                      </span>
                      {appt.ConsultationFee !== undefined && (
                        <span className="hidden md:inline-block text-xs font-semibold text-slate-700 tabular-nums">
                          ₹{appt.ConsultationFee}
                        </span>
                      )}
                      <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
