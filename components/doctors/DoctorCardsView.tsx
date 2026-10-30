"use client";

import React from "react";
import type { IDoctor } from "@/redux/types/doctor.types";
import { getAdminImageUrl } from "@/redux";
import {
  Calendar,
  Clock,
  Stethoscope,
  Mail,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Check,
  Eye,
  SlidersHorizontal,
} from "lucide-react";

import SpecializationIconBadge from "../specializations/SpecializationIconBadge";

interface DoctorCardsViewProps {
  doctors: IDoctor[];
  isVerifying: boolean;
  onApprove: (id: string) => void;
  onManage: (doc: IDoctor) => void;
  onViewProfile: (doc: IDoctor) => void;
}

export default function DoctorCardsView({
  doctors,
  isVerifying,
  onApprove,
  onManage,
  onViewProfile,
}: DoctorCardsViewProps) {
  if (doctors.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-[#121215] dark:text-slate-400">
        <Stethoscope className="mx-auto mb-2 h-7 w-7 text-slate-300 dark:text-slate-600" />
        No doctors found matching the active filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {doctors.map((doc) => {
        const docId = doc._id || doc.Id || "";
        const vStatus =
          doc.VerificationStatus || (doc.IsVerified ? "approved" : "pending");
        const isApproved = vStatus === "approved";
        const isPending = vStatus === "pending";

        return (
          <div
            key={docId}
            className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50/20 dark:border-slate-800 dark:bg-[#121215] dark:hover:border-slate-700 dark:hover:bg-[#16161a]"
          >
            <div>
              {/* Doctor Head */}
              <div className="flex items-start gap-3 mb-3">
                <div className="relative shrink-0">
                  {doc.ProfileImage ? (
                    <img
                      src={getAdminImageUrl(doc.ProfileImage)}
                      alt={doc.Name}
                      className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                      {doc.Name.replace(/^Dr\.\s*/i, "").charAt(0) || "D"}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 ${
                      doc.IsOnline ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                    }`}
                    title={doc.IsOnline ? "Online Now" : "Offline"}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      onClick={() => onViewProfile(doc)}
                      className="truncate text-xs font-semibold text-slate-900 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-400 transition cursor-pointer"
                    >
                      {doc.Name}
                    </h4>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50/80 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300 shrink-0">
                        <AlertCircle className="h-3 w-3 animate-pulse" />
                        Pending
                      </span>
                    )}
                    {!isApproved && !isPending && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50/80 px-2 py-0.5 text-[10px] font-medium text-rose-700 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300 shrink-0">
                        <XCircle className="h-3 w-3" />
                        Rejected
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <div className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                      <SpecializationIconBadge
                        name={doc.Specialization || "General Medicine"}
                        size="sm"
                      />
                      <span className="truncate max-w-[150px] font-medium text-slate-800 dark:text-slate-200">
                        {doc.Specialization || "General Medicine"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                    <Mail className="h-3 w-3 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{doc.Email}</span>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate">{doc.AvailableDays || "—"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="truncate">{doc.AvailableTime || "—"}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-baseline gap-0.5 font-semibold text-slate-900 dark:text-slate-100 text-xs">
                {(doc.ConsultationFees?.Normal ?? doc.ConsultationFee) !== undefined ? (
                  <>
                    <span>₹{doc.ConsultationFees?.Normal ?? doc.ConsultationFee}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal ml-0.5">/ visit</span>
                  </>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 font-normal">—</span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {!isApproved && (
                  <button
                    type="button"
                    onClick={() => onApprove(docId)}
                    disabled={isVerifying}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50 shadow-2xs cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                    <span>Approve</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onManage(doc)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
                  title="Manage schedule & fee"
                >
                  <SlidersHorizontal className="h-3 w-3 text-slate-400" />
                  <span>Schedule</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewProfile(doc)}
                  className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
                  title="View full doctor profile"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
