"use client";

import React from "react";
import type { AppointmentSummary } from "@/redux/types/appointment.types";
import {
  CheckCircle2,
  Users,
  ShieldCheck,
  Clock,
} from "lucide-react";

interface AppointmentStatsCardsProps {
  summary: AppointmentSummary;
  activeStatusFilter: string;
  onSelectFilter: (status: string) => void;
}

export default function AppointmentStatsCards({
  summary,
  activeStatusFilter,
  onSelectFilter,
}: AppointmentStatsCardsProps) {
  const cards = [
    {
      id: "all",
      title: "Today's Slots",
      value: summary.TodayScheduledSlots,
      icon: Clock,
      color: "text-blue-600 bg-blue-50 border-blue-200/80 hover:border-blue-300",
      activeRing: "ring-2 ring-blue-500/20 border-blue-500",
      description: "Scheduled clinical slots",
    },
    {
      id: "Confirmed",
      title: "Confirmed Patients",
      value: summary.ConfirmedPatients,
      icon: ShieldCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200/80 hover:border-emerald-300",
      activeRing: "ring-2 ring-emerald-500/20 border-emerald-500",
      description: "Verified appointments",
    },
    {
      id: "all",
      title: "Total Assigned",
      value: summary.TotalAssignedPatients,
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200/80 hover:border-indigo-300",
      activeRing: "ring-2 ring-indigo-500/20 border-indigo-500",
      description: "Patient bookings assigned",
    },
    {
      id: "Completed",
      title: "Consultations Done",
      value: summary.ConsultationCompleted,
      icon: CheckCircle2,
      color: "text-purple-600 bg-purple-50 border-purple-200/80 hover:border-purple-300",
      activeRing: "ring-2 ring-purple-500/20 border-purple-500",
      description: "Successfully attended",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isActive =
          card.id !== "all" &&
          activeStatusFilter.toLowerCase() === card.id.toLowerCase();

        return (
          <div
            key={idx}
            onClick={() => onSelectFilter(card.id)}
            className={`group cursor-pointer rounded-2xl border bg-white p-4 shadow-xs transition-all hover:shadow-md ${
              isActive ? card.activeRing : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {card.title}
              </span>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${card.color}`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </span>
              <span className="text-[10px] font-medium text-slate-400 group-hover:text-slate-600 transition">
                {card.description}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
