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
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-xs text-slate-500">
        <Stethoscope className="mx-auto mb-2 h-8 w-8 text-slate-300" />
        No doctors found matching the active filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {doctors.map((doc) => {
        const docId = doc._id || doc.Id || "";
        const vStatus =
          doc.VerificationStatus || (doc.IsVerified ? "approved" : "pending");
        const isApproved = vStatus === "approved";
        const isPending = vStatus === "pending";

        return (
          <div
            key={docId}
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-400 hover:shadow-md"
          >
            <div>
              {/* Doctor Head */}
              <div className="flex items-start gap-3.5 mb-3.5">
                <div className="relative shrink-0">
                  {doc.ProfileImage ? (
                    <img
                      src={getAdminImageUrl(doc.ProfileImage)}
                      alt={doc.Name}
                      className="h-12 w-12 rounded-2xl object-cover ring-1 ring-slate-200 shadow-2xs"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-base shadow-xs shadow-blue-500/20">
                      {doc.Name.replace(/^Dr\.\s*/i, "").charAt(0) || "D"}
                    </div>
                  )}
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      doc.IsOnline ? "bg-emerald-500" : "bg-slate-300"
                    }`}
                    title={doc.IsOnline ? "Online Now" : "Offline"}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4
                      onClick={() => onViewProfile(doc)}
                      className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600 transition cursor-pointer"
                    >
                      {doc.Name}
                    </h4>
                    {isApproved && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 shrink-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Approved
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 shrink-0">
                        <AlertCircle className="h-3 w-3" />
                        Pending
                      </span>
                    )}
                    {!isApproved && !isPending && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700 shrink-0">
                        <XCircle className="h-3 w-3" />
                        Rejected
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-800">
                      <Stethoscope className="h-3 w-3 text-blue-600 shrink-0" />
                      <span className="truncate max-w-[150px]">
                        {doc.Specialization || "General Medicine"}
                      </span>
                    </span>
                  </div>

                  <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.Email}</span>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{doc.AvailableDays || "Mon - Fri"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                  <span className="truncate">{doc.AvailableTime || "9am - 4pm"}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-baseline gap-0.5 font-bold text-slate-900 text-xs">
                <span className="text-[10px] text-slate-400">₹</span>
                <span className="text-sm font-extrabold">{doc.ConsultationFee || 500}</span>
                <span className="text-[10px] text-slate-400 font-normal ml-0.5">/visit</span>
              </div>

              <div className="flex items-center gap-1.5">
                {!isApproved && (
                  <button
                    type="button"
                    onClick={() => onApprove(docId)}
                    disabled={isVerifying}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50 shadow-2xs"
                  >
                    <Check className="h-3 w-3" />
                    <span>Approve</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onManage(doc)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                  title="Manage schedule & fee"
                >
                  <SlidersHorizontal className="h-3 w-3 text-slate-500" />
                  <span>Manage</span>
                </button>
                <button
                  type="button"
                  onClick={() => onViewProfile(doc)}
                  className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs"
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
