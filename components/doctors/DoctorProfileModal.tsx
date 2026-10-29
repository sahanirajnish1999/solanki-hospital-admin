"use client";

import React, { useEffect } from "react";
import type { IDoctor } from "@/redux/types/doctor.types";
import { getAdminImageUrl } from "@/redux";
import {
  X,
  SlidersHorizontal,
  Mail,
  Phone,
  AlertCircle,
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
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95 dark:border-slate-800 dark:bg-[#111114]"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 dark:border-slate-800/80">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Doctor Profile
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Doctor Identity Header */}
        <div className="p-5 pb-3">
          <div className="flex items-start gap-3.5">
            {/* Avatar */}
            {doctor.ProfileImage ? (
              <img
                src={getAdminImageUrl(doctor.ProfileImage)}
                alt={doctor.Name}
                className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 font-bold text-base ring-1 ring-slate-200 dark:ring-slate-700">
                {doctor.Name.charAt(0)}
              </div>
            )}

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  {doctor.Name}
                </h2>

                {/* Minimal Status Badge */}
                <div className="flex items-center gap-1.5">
                  {doctor.VerificationStatus === "approved" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Approved
                    </span>
                  )}
                  {doctor.VerificationStatus === "pending" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Pending Review
                    </span>
                  )}
                  {doctor.VerificationStatus === "rejected" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Specialization & Registration Details */}
              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {doctor.Specialization || "General Medicine"}
                </span>
                <span>•</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Registered {doctor.createdAt ? new Date(doctor.createdAt).toLocaleDateString() : "—"}
                </span>
                <span>•</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Added via {doctor.RegisteredBy || "Self"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto px-5 pb-5 space-y-3.5">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-[#161619]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                Fee
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                ₹{doctor.ConsultationFee || 500}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-[#161619]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                Experience
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {doctor.Experience || "—"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-[#161619]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                Days
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {doctor.AvailableDays || "Mon - Fri"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-[#161619]">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-0.5">
                Hours
              </span>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                {doctor.AvailableTime || "9am - 4pm"}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-[#161619]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
              Contact &amp; Directory
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
                    Email Address
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 break-all block select-all">
                    {doctor.Email}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 shadow-2xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-medium">
                    Phone Number
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block select-all">
                    {doctor.Phone}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* About Doctor Bio */}
          {doctor.About && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-[#161619]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Biography
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {doctor.About}
              </p>
            </div>
          )}

          {/* Rejection Reason if any */}
          {doctor.RejectionReason && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div>
                <span className="font-semibold text-xs block">Verification Rejection Note:</span>
                <span className="mt-0.5 text-xs block font-normal">{doctor.RejectionReason}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-[#161619]">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenManage(doctor);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span>Manage Schedule &amp; Fee</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white shadow-2xs transition cursor-pointer dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
