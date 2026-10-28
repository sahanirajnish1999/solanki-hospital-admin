"use client";

import React from "react";
import { BookOpen, CheckCircle2, FileEdit, Tags } from "lucide-react";

interface BlogStatsCardsProps {
  total: number;
  published: number;
  drafts: number;
  categoriesCount: number;
  currentStatusFilter: string;
  onFilterChange: (status: string) => void;
}

export default function BlogStatsCards({
  total,
  published,
  drafts,
  categoriesCount,
  currentStatusFilter,
  onFilterChange,
}: BlogStatsCardsProps) {
  const cards = [
    {
      key: "all",
      label: "Total Blog Articles",
      value: total,
      sublabel: "Clinical publications",
      icon: BookOpen,
      dotColor: "bg-slate-400",
      activeRing: "border-slate-800 bg-slate-50/90 ring-1 ring-slate-800/10",
      iconActive: "bg-slate-900 text-white border-slate-900",
    },
    {
      key: "published",
      label: "Published & Live",
      value: published,
      sublabel: "Live on patient portal",
      icon: CheckCircle2,
      dotColor: "bg-emerald-500",
      activeRing: "border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-600/20",
      iconActive: "bg-emerald-600 text-white border-emerald-600",
    },
    {
      key: "draft",
      label: "Drafts / In Review",
      value: drafts,
      sublabel: "Unpublished edits",
      icon: FileEdit,
      dotColor: "bg-amber-500",
      activeRing: "border-amber-600 bg-amber-50/40 ring-1 ring-amber-600/20",
      iconActive: "bg-amber-600 text-white border-amber-600",
    },
    {
      key: "categories",
      label: "Categories Covered",
      value: categoriesCount,
      sublabel: "Orthopedic specialties",
      icon: Tags,
      dotColor: "bg-teal-500",
      activeRing: "",
      iconActive: "bg-teal-600 text-white border-teal-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        const isClickable = c.key !== "categories";
        const isActive = currentStatusFilter === c.key;

        return (
          <button
            key={c.key}
            type="button"
            disabled={!isClickable}
            onClick={() => isClickable && onFilterChange(c.key)}
            className={`flex items-center justify-between rounded-xl border p-3 sm:p-3.5 text-left transition-all duration-150 ${
              isClickable ? "cursor-pointer" : "cursor-default"
            } ${
              isActive && c.activeRing
                ? c.activeRing
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
            }`}
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${c.dotColor}`} />
                <span className="text-[11px] font-medium text-slate-500 truncate">
                  {c.label}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {c.value}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block">
                {c.sublabel}
              </span>
            </div>

            <div
              className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors shrink-0 ${
                isActive && isClickable
                  ? c.iconActive
                  : "bg-slate-100/80 text-slate-500 border-slate-200/60"
              }`}
            >
              <Icon className="h-4 w-4" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

