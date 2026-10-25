"use client";

import React, { useState, useMemo } from "react";
import Dropdown, { DropdownOption } from "@/components/common/Dropdown";
import {
  useGetDoctorListQuery,
  useVerifyDoctorMutation,
} from "@/redux/api/doctorApi";
import { useGetAllSpecializationsQuery } from "@/redux/api/specializationApi";
import type {
  IDoctor,
  DoctorVerificationStatus,
} from "@/redux/types/doctor.types";
import { getErrorMessage } from "@/redux";
import {
  Stethoscope,
  Search,
  RotateCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import DoctorStatsCards from "./DoctorStatsCards";
import DoctorTableView from "./DoctorTableView";
import DoctorCardsView from "./DoctorCardsView";
import CreateDoctorModal from "./CreateDoctorModal";
import ManageDoctorModal from "./ManageDoctorModal";
import RejectDoctorModal from "./RejectDoctorModal";
import DoctorProfileModal from "./DoctorProfileModal";

export default function DoctorManager() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const [statusFilter, setStatusFilter] = useState<
    DoctorVerificationStatus | "all"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Notifications
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDoctorForView, setSelectedDoctorForView] =
    useState<IDoctor | null>(null);
  const [selectedDoctorForManage, setSelectedDoctorForManage] =
    useState<IDoctor | null>(null);
  const [selectedDoctorForReject, setSelectedDoctorForReject] =
    useState<IDoctor | null>(null);

  // RTK Query Hooks
  const {
    data: doctorListResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetDoctorListQuery({
    page,
    limit,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchTerm.trim() || undefined,
  });

  const { data: specializationsResponse } = useGetAllSpecializationsQuery({
    All: true,
  });

  const [verifyDoctorApi, { isLoading: isVerifying }] =
    useVerifyDoctorMutation();

  const doctors = doctorListResponse?.Data?.Doctors || [];
  const summary = doctorListResponse?.Data?.Summary || {
    Total: 0,
    Pending: 0,
    Approved: 0,
    Rejected: 0,
  };
  const pagination = doctorListResponse?.Data?.Pagination;
  const specializations = useMemo(
    () => specializationsResponse?.Data || [],
    [specializationsResponse?.Data]
  );

  const specializationOptions: DropdownOption[] = useMemo(
    () => [
      { value: "", label: "All Specializations" },
      ...specializations.map((spec) => ({
        value: spec.Name,
        label: spec.Name,
        sublabel: spec.Description || undefined,
      })),
    ],
    [specializations]
  );

  const statusOptions: DropdownOption[] = useMemo(
    () => [
      { value: "all", label: "All Verification Statuses" },
      {
        value: "pending",
        label: "Pending Verification",
        badge: "Pending",
        badgeColor: "bg-amber-100 text-amber-800",
      },
      {
        value: "approved",
        label: "Approved",
        badge: "Approved",
        badgeColor: "bg-emerald-100 text-emerald-800",
      },
      {
        value: "rejected",
        label: "Rejected",
        badge: "Rejected",
        badgeColor: "bg-rose-100 text-rose-800",
      },
    ],
    []
  );

  // Filter client-side by specialization if selected
  const filteredDoctors = selectedSpecialization
    ? doctors.filter(
        (doc) =>
          doc.Specialization === selectedSpecialization ||
          doc.SpecializationId === selectedSpecialization,
      )
    : doctors;

  // Handle Quick Approve
  const handleApprove = async (id: string) => {
    setFeedback(null);
    try {
      const res = await verifyDoctorApi({
        id,
        Status: "approved",
      }).unwrap();

      setFeedback({
        type: "success",
        message: res.Message || "Doctor verified and approved successfully.",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Failed to approve doctor verification."),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Doctor Administration
            </h2>
            <p className="text-xs text-slate-500">
              Staff registration, profile verification, and clinical schedule management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-lg p-1.5 transition ${
                viewMode === "table"
                  ? "bg-slate-100 text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Table view"
            >
              <TableIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`rounded-lg p-1.5 transition ${
                viewMode === "cards"
                  ? "bg-slate-100 text-blue-600"
                  : "text-slate-400 hover:text-slate-600"
              }`}
              title="Cards view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            title="Refresh doctor list"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${
                isFetching ? "animate-spin text-blue-600" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Register Doctor</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards Component */}
      <DoctorStatsCards
        summary={summary}
        activeFilter={statusFilter}
        onSelectFilter={(f) => {
          setStatusFilter(f);
          setPage(1);
        }}
      />

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-3.5 text-xs ${
            feedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
          />
        </div>

        {/* Specialization Filter */}
        <div>
          <Dropdown
            options={specializationOptions}
            value={selectedSpecialization}
            onChange={(val) => setSelectedSpecialization(val)}
            placeholder="All Specializations"
            searchable
            clearable
          />
        </div>

        {/* Status Filter Dropdown */}
        <div>
          <Dropdown
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter((val || "all") as DoctorVerificationStatus | "all");
              setPage(1);
            }}
            placeholder="All Verification Statuses"
            showBadgeInTrigger
          />
        </div>
      </div>

      {/* View Component: Table or Cards */}
      {viewMode === "table" ? (
        <DoctorTableView
          doctors={filteredDoctors}
          isLoading={isLoading}
          isVerifying={isVerifying}
          onApprove={handleApprove}
          onReject={(doc) => setSelectedDoctorForReject(doc)}
          onManage={(doc) => setSelectedDoctorForManage(doc)}
          onViewProfile={(doc) => setSelectedDoctorForView(doc)}
        />
      ) : (
        <DoctorCardsView
          doctors={filteredDoctors}
          isVerifying={isVerifying}
          onApprove={handleApprove}
          onManage={(doc) => setSelectedDoctorForManage(doc)}
          onViewProfile={(doc) => setSelectedDoctorForView(doc)}
        />
      )}

      {/* Pagination Footer */}
      {pagination && pagination.TotalPages > 1 && (
        <div className="flex items-center justify-between border border-slate-200 bg-white px-4 py-3 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500">
            Page {pagination.Page} of {pagination.TotalPages} ({pagination.Total} total doctors)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.TotalPages, p + 1))}
              disabled={page >= pagination.TotalPages || isFetching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Component Modals */}
      <CreateDoctorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(msg) => setFeedback({ type: "success", message: msg })}
      />

      {selectedDoctorForManage && (
        <ManageDoctorModal
          key={`manage-${selectedDoctorForManage._id || selectedDoctorForManage.Id}`}
          doctor={selectedDoctorForManage}
          onClose={() => setSelectedDoctorForManage(null)}
          onSuccess={(msg) => setFeedback({ type: "success", message: msg })}
        />
      )}

      {selectedDoctorForReject && (
        <RejectDoctorModal
          key={`reject-${selectedDoctorForReject._id || selectedDoctorForReject.Id}`}
          doctor={selectedDoctorForReject}
          onClose={() => setSelectedDoctorForReject(null)}
          onSuccess={(msg) => setFeedback({ type: "success", message: msg })}
        />
      )}

      {selectedDoctorForView && (
        <DoctorProfileModal
          key={`view-${selectedDoctorForView._id || selectedDoctorForView.Id}`}
          doctor={selectedDoctorForView}
          onClose={() => setSelectedDoctorForView(null)}
          onOpenManage={(doc) => setSelectedDoctorForManage(doc)}
        />
      )}
    </div>
  );
}
