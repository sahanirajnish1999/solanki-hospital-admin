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
  Search,
  RotateCw,
  Plus,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  X,
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
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Doctors
        </h2>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-md p-1.5 transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
              title="Table view"
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`rounded-md p-1.5 transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-2xs dark:bg-slate-800 dark:text-slate-100"
                  : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
              }`}
              title="Cards view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
            title="Refresh doctor list"
          >
            <RotateCw
              className={`h-3 w-3 ${
                isFetching ? "animate-spin text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-2xs transition hover:bg-slate-800 cursor-pointer dark:bg-slate-800 dark:hover:bg-slate-700 dark:border dark:border-slate-700"
          >
            <Plus className="h-3.5 w-3.5" />
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
          className={`flex items-center justify-between rounded-lg p-3 text-xs ${
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
            className="text-[11px] font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs dark:border-slate-800 dark:bg-[#121215]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor name, email, or phone..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-1.5 pl-8.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-900"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 cursor-pointer"
              title="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Specialization Filter */}
        <div className="w-full sm:w-60">
          <Dropdown
            options={specializationOptions}
            value={selectedSpecialization}
            onChange={(val) => setSelectedSpecialization(val)}
            triggerClassName="!py-1.5 !rounded-lg text-xs border-slate-200 bg-slate-50/60"
            dropdownClassName="w-72 text-xs border-slate-200"
            searchable
            clearable
            placeholder="All Specializations"
          />
        </div>

        {/* Verification Status Filter */}
        <div className="w-full sm:w-52">
          <Dropdown
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val as DoctorVerificationStatus | "all");
              setPage(1);
            }}
            triggerClassName="!py-1.5 !rounded-lg text-xs border-slate-200 bg-slate-50/60"
            dropdownClassName="w-64 text-xs border-slate-200"
            placeholder="All Verification Statuses"
          />
        </div>

        {/* Reset Filter Button */}
        {(searchTerm || selectedSpecialization || statusFilter !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedSpecialization("");
              setStatusFilter("all");
              setPage(1);
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shrink-0"
            title="Reset filters"
          >
            <RotateCw className="h-3 w-3 text-slate-400" />
            <span>Reset</span>
          </button>
        )}
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
        <div className="flex items-center justify-between border border-slate-200 bg-white px-4 py-2.5 rounded-xl shadow-2xs">
          <span className="text-xs text-slate-500">
            Page {pagination.Page} of {pagination.TotalPages} ({pagination.Total} total doctors)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.TotalPages, p + 1))}
              disabled={page >= pagination.TotalPages || isFetching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
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
