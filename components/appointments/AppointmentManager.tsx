"use client";

import React, { useState, useMemo } from "react";
import { useGetAppointmentsQuery } from "@/redux/api/appointmentApi";
import type { IAppointment } from "@/redux/types/appointment.types";
import AppointmentStatsCards from "./AppointmentStatsCards";
import AppointmentTableView from "./AppointmentTableView";
import AppointmentDetailsModal from "./AppointmentDetailsModal";
import {
  Search,
  RotateCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function AppointmentManager() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<IAppointment | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  // Fetch appointments via RTK Query
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAppointmentsQuery({
    Page: page,
    Limit: limit,
    Status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const appointments = useMemo(
    () => apiResponse?.Data?.Appointments || [],
    [apiResponse]
  );
  const summary = apiResponse?.Data?.Summary || {
    TodayScheduledSlots: 0,
    ConsultationCompleted: 0,
    TotalAssignedPatients: 0,
    ConfirmedPatients: 0,
  };
  const pagination = apiResponse?.Data?.Pagination || {
    Total: appointments.length,
    Page: page,
    Limit: limit,
    Pages: 1,
    Next: null,
    Previous: null,
    HasNextPage: false,
    HasPrevPage: false,
  };

  // Client-side search filtering (by patient name, phone, email, doctor name, or appointment number)
  const filteredAppointments = useMemo(() => {
    if (!searchQuery.trim()) return appointments;
    const q = searchQuery.toLowerCase().trim();
    return appointments.filter(
      (app) =>
        app.PatientName?.toLowerCase().includes(q) ||
        app.PatientPhone?.toLowerCase().includes(q) ||
        app.PatientEmail?.toLowerCase().includes(q) ||
        app.DoctorName?.toLowerCase().includes(q) ||
        app.AppointmentNumber?.toLowerCase().includes(q) ||
        String(app.TokenNumber).includes(q)
    );
  }, [appointments, searchQuery]);

  const statusTabs = [
    { id: "all", label: "All Appointments" },
    { id: "Pending", label: "Pending Review" },
    { id: "Confirmed", label: "Confirmed" },
    { id: "Completed", label: "Completed" },
    { id: "Cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Appointments
        </h2>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 cursor-pointer dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Refresh appointments"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <AppointmentStatsCards
        summary={summary}
        activeStatusFilter={statusFilter}
        onSelectFilter={(st) => {
          setStatusFilter(st);
          setPage(1);
        }}
      />

      {/* Controls Bar: Search & Status Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by patient, phone, doctor, or token #..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
          />
        </div>

        {/* Status Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {statusTabs.map((tab) => {
              const isSelected =
                statusFilter.toLowerCase() === tab.id.toLowerCase();
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setStatusFilter(tab.id);
                    setPage(1);
                  }}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <AppointmentTableView
        appointments={filteredAppointments}
        isLoading={isLoading}
        onViewDetails={(app) => {
          setSelectedAppointment(app);
          setSelectedAppointmentId(app._id || app.Id || "");
        }}
      />

      {/* Pagination Bar */}
      {pagination.Total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 px-1">
          <div>
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredAppointments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-900">
              {pagination.Total}
            </span>{" "}
            appointments
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <span className="text-slate-600 font-medium px-1">
              Page {page} of {Math.max(1, pagination.Pages || 1)}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.Pages || 1, p + 1))
              }
              disabled={page >= (pagination.Pages || 1) || isFetching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointmentId && (
        <AppointmentDetailsModal
          appointmentId={selectedAppointmentId}
          initialAppointment={selectedAppointment}
          onClose={() => {
            setSelectedAppointmentId(null);
            setSelectedAppointment(null);
          }}
        />
      )}
    </div>
  );
}
