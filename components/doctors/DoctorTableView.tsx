"use client";

import React, { useState, useEffect } from "react";
import type { IDoctor } from "@/redux/types/doctor.types";
import { getAdminImageUrl } from "@/redux";
import {
  CheckCircle2,
  ChevronDown,
  SlidersHorizontal,
  Stethoscope,
  Eye,
  Check,
  X,
  ShieldCheck,
} from "lucide-react";
import SpecializationIconBadge from "../specializations/SpecializationIconBadge";

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
  const [openStatusDropdownId, setOpenStatusDropdownId] = useState<string | null>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    if (!openStatusDropdownId) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-status-dropdown]")) {
        setOpenStatusDropdownId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenStatusDropdownId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openStatusDropdownId]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs min-h-[220px] dark:border-slate-800 dark:bg-[#121215]">
      <table className="w-full text-left text-xs">
        {/* Table Header */}
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-medium text-slate-500 select-none dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
            <th className="py-3 pl-5 pr-3 w-[36%] font-medium">
              <span>Doctor Details</span>
            </th>
            <th className="py-3 px-3 w-[22%] font-medium">
              <span>Specialization</span>
            </th>
            <th className="py-3 px-3 text-center w-[14%] font-medium">
              <span>Status</span>
            </th>
            <th className="py-3 px-3 w-[14%] font-medium">
              <span>Fee & Schedule</span>
            </th>
            <th className="py-3 pl-3 pr-5 text-right w-[14%] font-medium">
              <span>Actions</span>
            </th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {isLoading && doctors.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-14 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center gap-2.5">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-800 border-t-transparent" />
                  <span className="text-xs font-medium text-slate-500">
                    Loading doctor registry...
                  </span>
                </div>
              </td>
            </tr>
          ) : doctors.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-14 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                    <Stethoscope className="h-5 w-5" />
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    No doctors found
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-sm">
                    Try adjusting your search criteria or register a new practitioner.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            doctors.map((doc, index) => {
              const docId = doc._id || doc.Id || "";
              const vStatus =
                doc.VerificationStatus || (doc.IsVerified ? "approved" : "pending");
              const isApproved = vStatus === "approved";
              const isPending = vStatus === "pending";
              const isRejected = vStatus === "rejected";
              const isSelf = doc.RegisteredBy === "self";
              const isNearBottom = index > 0 && index >= doctors.length - 2;

              return (
                <tr
                  key={docId}
                  className={`group transition-colors duration-150 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 ${
                    openStatusDropdownId === docId ? "relative z-30 bg-slate-50/50 dark:bg-slate-800/50" : ""
                  }`}
                >
                  {/* 1. Doctor Details with Source Tag */}
                  <td className="py-3 pl-5 pr-3 align-middle">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {doc.ProfileImage ? (
                          <img
                            src={getAdminImageUrl(doc.ProfileImage)}
                            alt={doc.Name}
                            className="h-9 w-9 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700 shadow-2xs"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
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

                      {/* Doctor Name, Tags & Contacts */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            onClick={() => onViewProfile(doc)}
                            className="font-semibold text-slate-900 dark:text-slate-100 text-xs leading-tight hover:text-teal-700 dark:hover:text-teal-400 cursor-pointer transition-colors truncate"
                            title="Click to view profile"
                          >
                            {doc.Name}
                          </span>
                          {isApproved && (
                            <span title="Verified Doctor" className="inline-flex">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            </span>
                          )}
                          {/* Source Badge */}
                          <span className="rounded px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 shrink-0">
                            {isSelf ? "Portal" : "Admin"}
                          </span>
                          {doc.Experience && (
                            <span className="rounded bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-500 border border-slate-200/60 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/60 shrink-0">
                              {doc.Experience.toLowerCase().includes("year")
                                ? doc.Experience
                                : `${doc.Experience} Yrs`}
                            </span>
                          )}
                        </div>

                        {/* Email & Phone */}
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                          <span className="truncate">{doc.Email}</span>
                          {doc.Phone && (
                            <>
                              <span className="text-slate-300 dark:text-slate-600">•</span>
                              <span className="shrink-0">{doc.Phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Specialization */}
                  <td className="py-3 px-3 align-middle">
                    <div className="flex items-center gap-2">
                      <SpecializationIconBadge
                        name={doc.Specialization || "General Medicine"}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                          {doc.Specialization || "General Medicine"}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">
                          Specialist
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* 3. Status Badges */}
                  <td className="py-3 px-3 align-middle text-center">
                    <div className="inline-flex flex-col items-center justify-center">
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>Approved</span>
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-0.5 text-[11px] font-medium text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Pending</span>
                        </span>
                      )}
                      {isRejected && (
                        <div className="flex flex-col items-center">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200/80 bg-rose-50/80 px-2.5 py-0.5 text-[11px] font-medium text-rose-700 dark:bg-rose-950/40 dark:border-rose-800/50 dark:text-rose-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span>Rejected</span>
                          </span>
                          {doc.RejectionReason && (
                            <span
                              className="mt-0.5 max-w-[120px] truncate text-[10px] text-rose-600 dark:text-rose-400 italic"
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
                  <td className="py-3 px-3 align-middle">
                    <div className="text-xs">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
                        ₹{doc.ConsultationFee || 500}
                        <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500 ml-1">
                          / visit
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate flex items-center gap-1">
                        <span>{doc.AvailableDays || "Mon - Fri"}</span>
                        {doc.AvailableTime && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="truncate">{doc.AvailableTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 5. Actions */}
                  <td className="py-3 pl-3 pr-5 align-middle text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Single Unified Status Dropdown Button */}
                      <div className="relative" data-status-dropdown>
                        <button
                          type="button"
                          disabled={isVerifying}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenStatusDropdownId((prev) =>
                              prev === docId ? null : docId
                            );
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer ${
                            openStatusDropdownId === docId
                              ? "border-slate-800 bg-slate-900 text-white dark:border-slate-700 dark:bg-slate-800"
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
                          }`}
                          title="Update doctor verification status"
                        >
                          <ShieldCheck className="h-3 w-3 text-slate-400" />
                          <span>Status</span>
                          <ChevronDown
                            className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${
                              openStatusDropdownId === docId ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Dropdown Menu */}
                        {openStatusDropdownId === docId && (
                          <div
                            className={`absolute right-0 ${
                              isNearBottom
                                ? "bottom-full mb-1.5"
                                : "top-full mt-1.5"
                            } z-50 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg text-left dark:border-slate-700 dark:bg-slate-900`}
                          >
                            {/* Option: Approve */}
                            <button
                              type="button"
                              disabled={isVerifying || isApproved}
                              onClick={() => {
                                setOpenStatusDropdownId(null);
                                onApprove(docId);
                              }}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                isApproved
                                  ? "bg-emerald-50 text-emerald-800 font-semibold cursor-default dark:bg-emerald-950/50 dark:text-emerald-300"
                                  : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
                              }`}
                              title={isApproved ? "Already Approved" : "Approve doctor"}
                            >
                              <div className="flex items-center gap-1.5">
                                <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                <span>Approve</span>
                              </div>
                              {isApproved && (
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </button>

                            {/* Option: Reject */}
                            <button
                              type="button"
                              disabled={isVerifying || isRejected}
                              onClick={() => {
                                setOpenStatusDropdownId(null);
                                onReject(doc);
                              }}
                              className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                isRejected
                                  ? "bg-rose-50 text-rose-800 font-semibold cursor-default dark:bg-rose-950/50 dark:text-rose-300"
                                  : "text-slate-700 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"
                              }`}
                              title={isRejected ? "Already Rejected" : "Reject doctor application"}
                            >
                              <div className="flex items-center gap-1.5">
                                <X className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                                <span>Reject</span>
                              </div>
                              {isRejected && (
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Manage Schedule & Fee */}
                      <button
                        type="button"
                        onClick={() => onManage(doc)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-2 py-1 text-[11px] font-medium shadow-2xs transition active:scale-95 cursor-pointer dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
                        title="Manage clinical schedule & consultation fees"
                      >
                        <SlidersHorizontal className="h-3 w-3 text-slate-400" />
                        <span className="hidden xl:inline">Schedule</span>
                      </button>

                      {/* View Profile */}
                      <button
                        type="button"
                        onClick={() => onViewProfile(doc)}
                        className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition active:scale-95 cursor-pointer dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
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

