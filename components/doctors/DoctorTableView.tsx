"use client";

import React from "react";
import type { IDoctor } from "@/redux/types/doctor.types";
import { getAdminImageUrl } from "@/redux";
import {
  User,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  SlidersHorizontal,
  Stethoscope,
  Eye,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";

interface DoctorTableViewProps {
  doctors: IDoctor[];
  isLoading: boolean;
  isVerifying: boolean;
  onApprove: (id: string) => void;
  onReject: (doc: IDoctor) => void;
  onManage: (doc: IDoctor) => void;
  onViewProfile: (doc: IDoctor) => void;
}

export default function DoctorTableView({
  doctors,
  isLoading,
  isVerifying,
  onApprove,
  onReject,
  onManage,
  onViewProfile,
}: DoctorTableViewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      <table className="w-full text-left text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
            <th className="py-3.5 pl-5 pr-3 w-[36%]">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Doctor Details</span>
              </div>
            </th>
            <th className="py-3.5 px-3 w-[22%]">
              <div className="flex items-center gap-1.5">
                <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                <span>Specialization</span>
              </div>
            </th>
            <th className="py-3.5 px-3 text-center w-[14%]">
              <div className="flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                <span>Status</span>
              </div>
            </th>
            <th className="py-3.5 px-3 w-[14%]">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Fee & Schedule</span>
              </div>
            </th>
            <th className="py-3.5 pl-3 pr-5 text-right w-[14%]">
              <span>Actions</span>
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100">
          {isLoading && doctors.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-14 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-2.5">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <span className="text-xs font-semibold text-slate-600">
                    Loading doctor registry...
                  </span>
                </div>
              </td>
            </tr>
          ) : doctors.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-14 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    No doctors found
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Try adjusting your search criteria or register a new practitioner.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            doctors.map((doc) => {
              const docId = doc._id || doc.Id || "";
              const vStatus =
                doc.VerificationStatus || (doc.IsVerified ? "approved" : "pending");
              const isApproved = vStatus === "approved";
              const isPending = vStatus === "pending";
              const isRejected = vStatus === "rejected";
              const isSelf = doc.RegisteredBy === "self";

              return (
                <tr
                  key={docId}
                  className="group transition-colors duration-150 hover:bg-slate-50/70"
                >
                  {/* 1. Doctor Details with Source Tag */}
                  <td className="py-3.5 pl-5 pr-3 align-middle">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {doc.ProfileImage ? (
                          <img
                            src={getAdminImageUrl(doc.ProfileImage)}
                            alt={doc.Name}
                            className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-xs shadow-blue-500/20">
                            {doc.Name.replace(/^Dr\.\s*/i, "").charAt(0) || "D"}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                            doc.IsOnline ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                          title={doc.IsOnline ? "Online Now" : "Offline"}
                        />
                      </div>

                      {/* Doctor Name, Tags & Contacts */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            onClick={() => onViewProfile(doc)}
                            className="font-bold text-slate-900 text-sm leading-tight hover:text-blue-600 cursor-pointer transition-colors truncate"
                            title="Click to view profile"
                          >
                            {doc.Name}
                          </span>
                          {isApproved && (
                            <span title="Verified Doctor" className="inline-flex">
                              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                            </span>
                          )}
                          {/* Source Badge */}
                          {isSelf ? (
                            <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-sky-50 text-sky-700 border border-sky-100 shrink-0">
                              Portal
                            </span>
                          ) : (
                            <span className="rounded px-1.5 py-0.5 text-[9px] font-semibold bg-purple-50 text-purple-700 border border-purple-100 shrink-0">
                              Admin
                            </span>
                          )}
                          {doc.Experience && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 shrink-0">
                              {doc.Experience}
                            </span>
                          )}
                        </div>

                        {/* Email & Phone */}
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 truncate">
                          <span className="truncate">{doc.Email}</span>
                          {doc.Phone && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span className="shrink-0">{doc.Phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Specialization (Clean Medical Chip) */}
                  <td className="py-3.5 px-3 align-middle">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                        <Stethoscope className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {doc.Specialization || "General Medicine"}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Specialist
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 3. Status Badges */}
                  <td className="py-3.5 px-3 align-middle text-center">
                    <div className="inline-flex flex-col items-center justify-center">
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-2xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Approved</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-2xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                          <span>Pending</span>
                        </span>
                      )}
                      {isRejected && (
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 shadow-2xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <XCircle className="h-3.5 w-3.5 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                          {doc.RejectionReason && (
                            <span
                              className="mt-0.5 max-w-[120px] truncate text-[10px] text-rose-600 italic"
                              title={doc.RejectionReason}
                            >
                              &quot;{doc.RejectionReason}&quot;
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 4. Fee & Schedule */}
                  <td className="py-3.5 px-3 align-middle">
                    <div className="text-xs">
                      <div className="font-bold text-slate-900">
                        ₹{doc.ConsultationFee || 500}
                        <span className="text-[10px] font-normal text-slate-400 ml-1">
                          / visit
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                        <span>{doc.AvailableDays || "Mon - Fri"}</span>
                        {doc.AvailableTime && (
                          <>
                            <span className="text-slate-300">•</span>
                            <span className="truncate">{doc.AvailableTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 5. Actions */}
                  <td className="py-3.5 pl-3 pr-5 align-middle text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Quick Approve */}
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => onApprove(docId)}
                          disabled={isVerifying}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 text-xs font-semibold shadow-2xs transition active:scale-95 disabled:opacity-50"
                          title="Verify and approve practitioner"
                        >
                          <Check className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                      )}

                      {/* Quick Reject */}
                      {!isRejected && (
                        <button
                          type="button"
                          onClick={() => onReject(doc)}
                          disabled={isVerifying}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 px-2 py-1 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
                          title="Reject doctor application"
                        >
                          <X className="h-3 w-3" />
                          <span>Reject</span>
                        </button>
                      )}

                      {/* Manage Schedule & Fee */}
                      <button
                        type="button"
                        onClick={() => onManage(doc)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-2 py-1 text-xs font-medium shadow-2xs transition active:scale-95"
                        title="Manage clinical schedule & consultation fees"
                      >
                        <SlidersHorizontal className="h-3 w-3 text-slate-500" />
                        <span className="hidden xl:inline">Schedule</span>
                      </button>

                      {/* View Profile */}
                      <button
                        type="button"
                        onClick={() => onViewProfile(doc)}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 shadow-2xs transition active:scale-95"
                        title="View doctor details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

