"use client";

import React, { useEffect } from "react";
import type { IDoctor } from "@/redux/types/doctor.types";
import { getAdminImageUrl } from "@/redux";
import {
  X,
  SlidersHorizontal,
  Mail,
  Phone,
  IndianRupee,
  Award,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Stethoscope,
  Building2,
} from "lucide-react";

interface DoctorProfileModalProps {
  doctor: IDoctor | null;
  onClose: () => void;
  onOpenManage: (doc: IDoctor) => void;
}

export default function DoctorProfileModal({
  doctor,
  onClose,
  onOpenManage,
}: DoctorProfileModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!doctor) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [doctor, onClose]);

  if (!doctor) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95"
      >
        {/* Top Decorative Banner */}
        <div className="relative h-24 w-full bg-gradient-to-r from-[#008ba3] via-teal-600 to-cyan-500 p-4 flex items-start justify-between">
          <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold">
            <Building2 className="h-4 w-4" />
            <span>Solanki Hospital Medical Faculty</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-xs transition-colors hover:bg-black/35 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Profile Card Header (overlapping banner) */}
        <div className="-mt-10 px-6 flex flex-wrap items-end justify-between gap-3">
          {/* Avatar */}
          <div className="relative">
            {doctor.ProfileImage ? (
              <img
                src={getAdminImageUrl(doctor.ProfileImage)}
                alt={doctor.Name}
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#008ba3] to-cyan-600 font-bold text-2xl text-white ring-4 ring-white shadow-md">
                {doctor.Name.charAt(0)}
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 pb-1">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-[#008ba3] border border-cyan-200/80 shadow-2xs">
              <Stethoscope className="h-3 w-3" />
              {doctor.Specialization || "General Medicine"}
            </span>

            {doctor.VerificationStatus === "approved" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-2xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Approved
              </span>
            )}
            {doctor.VerificationStatus === "pending" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200 shadow-2xs">
                <Clock className="h-3.5 w-3.5 text-amber-600" />
                Pending Review
              </span>
            )}
            {doctor.VerificationStatus === "rejected" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 shadow-2xs">
                <XCircle className="h-3.5 w-3.5 text-rose-600" />
                Rejected
              </span>
            )}
          </div>
        </div>

        {/* Doctor Name & Subtitle */}
        <div className="px-6 mt-3">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {doctor.Name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Registered: {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : "—"} • Added via {doctor.RegisteredBy || "Self"}
          </p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-3.5">
          {/* Clinical Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <IndianRupee className="h-3 w-3 text-[#008ba3]" />
                Fee
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900">
                ₹{doctor.ConsultationFee || 500}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Award className="h-3 w-3 text-[#008ba3]" />
                Experience
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900 truncate">
                {doctor.Experience || "—"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Calendar className="h-3 w-3 text-[#008ba3]" />
                Days
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900 truncate">
                {doctor.AvailableDays || "Mon - Fri"}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <Clock className="h-3 w-3 text-[#008ba3]" />
                Hours
              </span>
              <p className="mt-1 text-sm font-bold text-slate-900 truncate">
                {doctor.AvailableTime || "9am - 4pm"}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 space-y-2.5 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Contact &amp; Directory
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] text-slate-400 block">Email Address</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {doctor.Email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] text-slate-400 block">Phone Number</span>
                  <span className="font-semibold text-slate-800 truncate block">
                    {doctor.Phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About Doctor Bio */}
          {doctor.About && (
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
                <UserCheck className="h-3.5 w-3.5 text-[#008ba3]" />
                About Doctor
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {doctor.About}
              </p>
            </div>
          )}

          {/* Rejection Reason if any */}
          {doctor.RejectionReason && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-bold block">Verification Rejection Note:</span>
                <span className="mt-0.5 block">{doctor.RejectionReason}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenManage(doctor);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#008ba3]" />
            <span>Manage Schedule &amp; Fee</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
