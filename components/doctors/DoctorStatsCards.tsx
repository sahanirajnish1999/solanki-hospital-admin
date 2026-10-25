"use client";

import React from "react";
import type {
  DoctorListSummary,
  DoctorVerificationStatus,
} from "@/redux/types/doctor.types";
import {
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface DoctorStatsCardsProps {
  summary: DoctorListSummary;
  activeFilter: DoctorVerificationStatus | "all";
  onSelectFilter: (filter: DoctorVerificationStatus | "all") => void;
}

export default function DoctorStatsCards({
  summary,
  activeFilter,
  onSelectFilter,
}: DoctorStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
      {/* 1. Total Doctors */}
      <button
        type="button"
        onClick={() => onSelectFilter("all")}
        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
          activeFilter === "all"
            ? "border-blue-500 bg-blue-50/40 shadow-xs ring-1 ring-blue-500"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div>
          <span className="text-xs font-semibold text-slate-500">
            Total Doctors
          </span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">
            {summary.Total}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Stethoscope className="h-5 w-5" />
        </div>
      </button>

      {/* 2. Pending Verification */}
      <button
        type="button"
        onClick={() => onSelectFilter("pending")}
        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
          activeFilter === "pending"
            ? "border-amber-500 bg-amber-50/40 shadow-xs ring-1 ring-amber-500"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div>
          <span className="text-xs font-semibold text-slate-500">
            Pending Review
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {summary.Pending}
            </span>
            {summary.Pending > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 animate-pulse">
                Action needed
              </span>
            )}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <AlertCircle className="h-5 w-5" />
        </div>
      </button>

      {/* 3. Approved Doctors */}
      <button
        type="button"
        onClick={() => onSelectFilter("approved")}
        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
          activeFilter === "approved"
            ? "border-emerald-500 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-500"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div>
          <span className="text-xs font-semibold text-slate-500">
            Approved Doctors
          </span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">
            {summary.Approved}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
      </button>

      {/* 4. Rejected Requests */}
      <button
        type="button"
        onClick={() => onSelectFilter("rejected")}
        className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
          activeFilter === "rejected"
            ? "border-rose-500 bg-rose-50/40 shadow-xs ring-1 ring-rose-500"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div>
          <span className="text-xs font-semibold text-slate-500">
            Rejected Applications
          </span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">
            {summary.Rejected}
          </div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
          <XCircle className="h-5 w-5" />
        </div>
      </button>
    </div>
  );
}
