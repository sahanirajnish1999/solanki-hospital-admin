"use client";

import React from "react";
import type { IAppointment } from "@/redux/types/appointment.types";
import {
  Calendar,
  Eye,
  Stethoscope,
  User,
  CreditCard,
} from "lucide-react";

interface AppointmentTableViewProps {
  appointments: IAppointment[];
  isLoading: boolean;
  onViewDetails: (appointment: IAppointment) => void;
}

export default function AppointmentTableView({
  appointments,
  isLoading,
  onViewDetails,
}: AppointmentTableViewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-[#121215]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-xs">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none whitespace-nowrap dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
              <th className="py-3.5 pl-5 pr-3 w-[23%] align-middle whitespace-nowrap">
                <div className="flex items-center gap-1.5 leading-none">
                  <Stethoscope className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Doctor &amp; Specialty</span>
                </div>
              </th>
              <th className="py-3.5 px-3 w-[23%] align-middle whitespace-nowrap">
                <div className="flex items-center gap-1.5 leading-none">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Patient Details</span>
                </div>
              </th>
              <th className="py-3.5 px-3 w-[22%] align-middle whitespace-nowrap">
                <div className="flex items-center gap-1.5 leading-none">
                  <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Appointment Date &amp; Time</span>
                </div>
              </th>
              <th className="py-3.5 px-3 w-[16%] align-middle whitespace-nowrap">
                <div className="flex items-center gap-1.5 leading-none">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>Fee &amp; Payment</span>
                </div>
              </th>
              <th className="py-3.5 px-3 text-center w-[10%] align-middle whitespace-nowrap">
                <div className="flex items-center justify-center leading-none">
                  <span>Status</span>
                </div>
              </th>
              <th className="py-3.5 pl-3 pr-5 text-right w-[6%] align-middle whitespace-nowrap">
                <div className="flex items-center justify-end leading-none">
                  <span>Action</span>
                </div>
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-slate-100">
            {isLoading && appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2.5">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span className="text-xs font-semibold text-slate-600">
                      Loading appointments registry...
                    </span>
                  </div>
                </td>
              </tr>
            ) : appointments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-bold text-slate-800">
                      No appointments found
                    </div>
                    <p className="text-xs text-slate-500 max-w-sm">
                      No clinical bookings match your filter criteria.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              appointments.map((app) => {
                const appId = app._id || app.Id || "";
                const isConfirmed = app.Status?.toLowerCase() === "confirmed";
                const isPending = app.Status?.toLowerCase() === "pending";
                const isCompleted = app.Status?.toLowerCase() === "completed";
                const isCancelled =
                  app.Status?.toLowerCase() === "cancelled" ||
                  app.Status?.toLowerCase() === "rejected";

                const isPaid = app.PaymentStatus?.toLowerCase() === "paid";

                const formattedDate = app.AppointmentDate
                  ? new Date(app.AppointmentDate).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—";

                return (
                  <tr
                    key={appId}
                    className="group transition-colors duration-150 hover:bg-slate-50/70"
                  >
                    {/* 1. Doctor & Specialty */}
                    <td className="py-3.5 pl-5 pr-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
                          <Stethoscope className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">
                            {app.DoctorName}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {app.DoctorSpecialization || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. Patient Details */}
                    <td className="py-3.5 px-3 align-middle">
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-xs truncate">
                          {app.PatientName}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 truncate">
                          <span>{app.PatientPhone || "—"}</span>
                          {app.PatientEmail && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="truncate max-w-[130px]">
                                {app.PatientEmail}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 3. Appointment Date & Time */}
                    <td className="py-3.5 px-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 font-mono font-bold text-blue-700 text-xs border border-blue-100">
                          #{app.TokenNumber ?? "—"}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900">
                            {formattedDate}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {app.AppointmentTime || "—"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 4. Fee & Payment */}
                    <td className="py-3.5 px-3 align-middle">
                      <div className="text-xs">
                        <div className="font-bold text-slate-900 dark:text-slate-100">
                          ₹{app.ConsultationFee ?? "—"}
                        </div>
                        <div className="mt-0.5">
                          <span
                            className={`inline-flex items-center rounded px-1.5 py-0.2 text-[9px] font-semibold ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}
                          >
                            {app.PaymentStatus || "Pending"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* 5. Status Badge with Single Dot */}
                    <td className="py-3.5 px-3 align-middle text-center">
                      <div className="inline-flex flex-col items-center justify-center">
                        {isConfirmed && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-2xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Confirmed</span>
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-2xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Pending</span>
                          </span>
                        )}
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 shadow-2xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                            <span>Completed</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 shadow-2xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>Cancelled</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 6. Action */}
                    <td className="py-3.5 pl-3 pr-5 align-middle text-right">
                      <button
                        type="button"
                        onClick={() => onViewDetails(app)}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 shadow-2xs transition active:scale-95 cursor-pointer"
                        title="View appointment details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
