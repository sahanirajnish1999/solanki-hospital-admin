"use client";

import React, { useEffect } from "react";
import { useGetAppointmentByIdQuery } from "@/redux/api/appointmentApi";
import type { IAppointment } from "@/redux/types/appointment.types";
import { getErrorMessage } from "@/redux/utils/errorHelper";
import {
  X,
  User,
  Stethoscope,
  Calendar,
  Clock,
  Phone,
  Mail,
  CreditCard,
  FileText,
  AlertCircle,
  Hash,
  Tag,
  RotateCw,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Check,
} from "lucide-react";

interface AppointmentDetailsModalProps {
  appointmentId: string | null;
  initialAppointment?: IAppointment | null;
  onClose: () => void;
}

const getInitials = (name?: string) => {
  if (!name) return "—";
  const clean = name.replace(/^Dr\.?\s*/i, "").trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function AppointmentDetailsModal({
  appointmentId,
  initialAppointment,
  onClose,
}: AppointmentDetailsModalProps) {
  // Fetch full live record by ID: GET /v1/api/appointment/:id
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAppointmentByIdQuery(appointmentId || "", {
    skip: !appointmentId,
  });

  const appointment = apiResponse?.Data || initialAppointment || null;

  // Close on Escape key press
  useEffect(() => {
    if (!appointmentId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [appointmentId, onClose]);

  if (!appointmentId) return null;

  const isConfirmed = appointment?.Status?.toLowerCase() === "confirmed";
  const isPending = appointment?.Status?.toLowerCase() === "pending";
  const isCompleted = appointment?.Status?.toLowerCase() === "completed";
  const isCancelled =
    appointment?.Status?.toLowerCase() === "cancelled" ||
    appointment?.Status?.toLowerCase() === "rejected";

  const isPaid = appointment?.PaymentStatus?.toLowerCase() === "paid";

  const appDate = appointment?.AppointmentDate
    ? new Date(appointment.AppointmentDate)
    : null;
  const isValidDate = appDate && !isNaN(appDate.getTime());
  const monthShort = isValidDate
    ? appDate.toLocaleDateString("en-IN", { month: "short" })
    : "—";
  const dayNum = isValidDate ? appDate.getDate() : "—";
  const fullWeekdayDate = isValidDate
    ? appDate.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden text-xs"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Calendar className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 truncate">
                Appointment Details
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="font-medium text-slate-600">
                  Token #{appointment?.TokenNumber || 1}
                </span>
                {appointment?.createdAt && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>
                      Booked{" "}
                      {new Date(appointment.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-3">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              title="Refresh record from API"
            >
              <RotateCw
                className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7.5 w-7.5 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-2xs transition active:scale-95 cursor-pointer"
              title="Close modal"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {/* Loading State when no initial data */}
          {isLoading && !appointment && (
            <div className="py-14 flex flex-col items-center justify-center gap-2.5">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="text-xs text-slate-500">
                Fetching appointment details...
              </p>
            </div>
          )}

          {/* Error State */}
          {isError && !appointment && (
            <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-center px-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-slate-900">
                  Appointment Not Found
                </h4>
                <p className="text-[11px] text-slate-500 max-w-sm mt-0.5">
                  {getErrorMessage(
                    error,
                    "The requested appointment record could not be found on the server.",
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-medium shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <RotateCw className="h-3 w-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Appointment Data Display */}
          {appointment && (
            <>
              {/* Status & Key Badges Banner */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 bg-slate-50/60 px-3 py-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Consultation Status */}
                  {isConfirmed && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span>Confirmed</span>
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                      <span>Pending</span>
                    </span>
                  )}
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      <span>Completed</span>
                    </span>
                  )}
                  {isCancelled && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-[11px] font-medium text-rose-700 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      <span>Cancelled</span>
                    </span>
                  )}

                  {/* Payment Status */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium shadow-2xs ${
                      isPaid
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }`}
                  >
                    <CreditCard className="h-3 w-3" />
                    <span>Payment: {appointment.PaymentStatus || "Pending"}</span>
                  </span>

                  {/* Emergency Level if present */}
                  {appointment.EmergencyLevel && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-medium text-purple-700">
                      <Tag className="h-3 w-3" />
                      <span>{appointment.EmergencyLevel}</span>
                    </span>
                  )}
                </div>

                {/* Token Badge */}
                <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[11px] font-mono font-medium">
                  <Hash className="h-3 w-3 text-blue-500" />
                  <span>Token #{appointment.TokenNumber || 1}</span>
                </div>
              </div>

              {/* Two-Column Grid: Doctor Info & Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Doctor Card */}
                <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/30 via-white to-slate-50/30 p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Stethoscope className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Doctor Practitioner</span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-600 border border-indigo-100">
                      <Sparkles className="h-2.5 w-2.5" /> Assigned
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold text-xs">
                      {getInitials(appointment.DoctorName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {appointment.DoctorName}
                      </h4>
                      <div className="mt-0.5">
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 border border-blue-100">
                          {appointment.DoctorSpecialization || "General Medicine"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Card */}
                <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/30 via-white to-slate-50/30 p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <User className="h-3.5 w-3.5 text-blue-600" />
                      <span>Patient Information</span>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600 border border-blue-100">
                      Registered
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100 font-semibold text-xs">
                      {getInitials(appointment.PatientName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-slate-900 truncate">
                        {appointment.PatientName}
                      </h4>
                      <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="text-slate-700">
                            {appointment.PatientPhone || "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate text-slate-500">
                            {appointment.PatientEmail || "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule & Financials Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Slot Card */}
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      Appointment Schedule
                    </span>
                    <span className="text-[10px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded px-1.5 py-0.5">
                      Scheduled
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 shrink-0">
                      <span className="text-[9px] font-semibold uppercase text-blue-600">
                        {monthShort}
                      </span>
                      <span className="text-xs font-bold leading-tight text-slate-900">
                        {dayNum}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-900">
                        {fullWeekdayDate}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span>{appointment.AppointmentTime || "09:00 AM"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consultation Fee Card */}
                <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/20 via-white to-slate-50/30 p-3.5 shadow-2xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-emerald-600" />
                      Consultation Fee
                    </span>
                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                        <Check className="h-2.5 w-2.5" /> Paid
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-slate-900">
                      ₹{appointment.ConsultationFee || 0}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      / consultation
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    <span>Direct Clinic Consultation</span>
                  </div>
                </div>
              </div>

              {/* Problem Description */}
              {appointment.ProblemDescription && (
                <div className="rounded-xl border-l-3 border-l-blue-500 border border-slate-200/80 bg-slate-50/40 p-3 shadow-2xs">
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-slate-700">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                    <span>Chief Complaint / Problem Description</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pl-5">
                    {appointment.ProblemDescription}
                  </p>
                </div>
              )}

              {/* Clinical Prescription or Notes if available */}
              {(appointment.Prescription || appointment.Notes) && (
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 space-y-2.5 shadow-2xs">
                  {appointment.Prescription && (
                    <div>
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                        <FileText className="h-3 w-3 text-emerald-600" />
                        Clinical Prescription
                      </span>
                      <div className="rounded-lg bg-emerald-50/30 border border-emerald-100 p-2.5 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {appointment.Prescription}
                      </div>
                    </div>
                  )}
                  {appointment.Notes && (
                    <div>
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                        <FileText className="h-3 w-3 text-blue-600" />
                        Internal Clinical Notes
                      </span>
                      <div className="rounded-lg bg-slate-50 border border-slate-200/60 p-2.5 text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {appointment.Notes}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cancellation Reason if any */}
              {appointment.CancellationReason && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800 flex items-start gap-2 shadow-2xs">
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block">
                      Cancellation Reason:
                    </span>
                    <span className="mt-0.5 block leading-relaxed text-[11px] text-rose-700">
                      {appointment.CancellationReason}
                    </span>
                  </div>
                </div>
              )}

              {/* Record Timestamps */}
              <div className="rounded-lg border border-slate-200/60 bg-slate-50/60 px-3.5 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-400">Booked On:</span>
                  <span className="font-medium text-slate-600">
                    {appointment.createdAt
                      ? new Date(appointment.createdAt).toLocaleString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">Last Updated:</span>
                  <span className="font-medium text-slate-600">
                    {appointment.updatedAt
                      ? new Date(appointment.updatedAt).toLocaleString(
                          "en-IN",
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )
                      : "—"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            {isFetching && !isLoading ? (
              <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                <RotateCw className="h-3 w-3 animate-spin" />
                Syncing live data...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-slate-500">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Record Verified
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 hover:bg-slate-800 px-4 py-1.5 text-xs font-medium text-white shadow-2xs transition active:scale-95 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
