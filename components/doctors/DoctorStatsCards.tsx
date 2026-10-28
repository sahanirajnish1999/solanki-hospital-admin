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
  const cards = [
    {
      key: "all" as const,
      label: "Total Doctors",
      value: summary.Total,
      icon: Stethoscope,
      dotColor: "bg-slate-400",
    },
    {
      key: "pending" as const,
      label: "Pending Review",
      value: summary.Pending,
      icon: AlertCircle,
      dotColor: "bg-amber-500",
      badge: summary.Pending > 0 ? "Action needed" : null,
    },
    {
      key: "approved" as const,
      label: "Approved Doctors",
      value: summary.Approved,
      icon: CheckCircle2,
      dotColor: "bg-emerald-500",
    },
    {
      key: "rejected" as const,
      label: "Rejected Applications",
      value: summary.Rejected,
      icon: XCircle,
      dotColor: "bg-slate-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = activeFilter === c.key;

        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onSelectFilter(c.key)}
            className={`flex items-center justify-between rounded-xl border p-3 sm:p-3.5 text-left transition-all duration-150 cursor-pointer ${
              isActive
                ? "border-slate-800 bg-slate-50/90 shadow-2xs ring-1 ring-slate-800/10 dark:border-slate-700 dark:bg-slate-800/90 dark:ring-slate-700/50"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/50"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${c.dotColor}`} />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {c.label}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
                  {c.value}
                </span>
                {c.badge && (
                  <span className="rounded bg-amber-50 border border-amber-200/80 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300">
                    {c.badge}
                  </span>
                )}
              </div>
            </div>

            <div
              className={`flex h-7.5 w-7.5 items-center justify-center rounded-lg border transition-colors ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                  : "bg-slate-100/80 text-slate-500 border-slate-200/60 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700/60"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
