"use client";

import React, { useState, useMemo, useEffect } from "react";
import Dropdown, { DropdownOption } from "@/components/common/Dropdown";
import {
  useGetAllSpecializationsQuery,
  useCreateSpecializationMutation,
  useUpdateSpecializationMutation,
  useDeleteSpecializationMutation,
  useToggleSpecializationStatusMutation,
} from "@/redux/api/specializationApi";
import type { ISpecialization } from "@/redux/types/specialization.types";
import { getAdminImageUrl, getErrorMessage } from "@/redux";
import {
  Activity,
  Plus,
  Search,
  RotateCw,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Upload,
  Layers,
  Table as TableIcon,
  LayoutGrid,
} from "lucide-react";
import SpecializationIconBadge from "./SpecializationIconBadge";

export default function SpecializationManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");

  const statusOptions: DropdownOption[] = useMemo(
    () => [
      { value: "all", label: "All Specialties" },
      {
        value: "active",
        label: "Active Only",
        badge: "Active",
        badgeColor: "bg-emerald-100 text-emerald-800",
      },
      {
        value: "inactive",
        label: "Inactive Only",
        badge: "Inactive",
        badgeColor: "bg-slate-100 text-slate-700",
      },
    ],
    []
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<ISpecialization | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Close modal on Escape
  useEffect(() => {
    if (!isAddModalOpen && !editingSpec && !deleteConfirmId) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAddModalOpen(false);
        setEditingSpec(null);
        setDeleteConfirmId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAddModalOpen, editingSpec, deleteConfirmId]);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [iconBase64, setIconBase64] = useState("");
  const [isActive, setIsActive] = useState(true);

  // RTK Query hooks
  const {
    data: specializationsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllSpecializationsQuery({
    All: true,
  });

  const [createSpecialization, { isLoading: isCreating }] =
    useCreateSpecializationMutation();
  const [updateSpecialization, { isLoading: isUpdating }] =
    useUpdateSpecializationMutation();
  const [deleteSpecialization, { isLoading: isDeleting }] =
    useDeleteSpecializationMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleSpecializationStatusMutation();

  const specializations = useMemo(
    () => specializationsResponse?.Data || [],
    [specializationsResponse?.Data]
  );

  // Summary stats
  const stats = useMemo(() => {
    const total = specializations.length;
    const active = specializations.filter((s) => s.IsActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  }, [specializations]);

  const deletingSpec = useMemo(
    () => specializations.find((s) => (s._id || s.Id) === deleteConfirmId),
    [specializations, deleteConfirmId]
  );

  const kpiCards = [
    {
      key: "all",
      label: "Total Specializations",
      value: stats.total,
      icon: Layers,
      dotColor: "bg-slate-400",
    },
    {
      key: "active",
      label: "Active Departments",
      value: stats.active,
      icon: CheckCircle2,
      dotColor: "bg-emerald-500",
    },
    {
      key: "inactive",
      label: "Inactive / Paused",
      value: stats.inactive,
      icon: AlertCircle,
      dotColor: "bg-slate-400",
    },
  ];

  // Filter list
  const filtered = specializations.filter((spec) => {
    const matchesSearch =
      spec.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (spec.Description &&
        spec.Description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? spec.IsActive
        : !spec.IsActive;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setName("");
    setDescription("");
    setIconBase64("");
    setIsActive(true);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (spec: ISpecialization) => {
    setEditingSpec(spec);
    setName(spec.Name);
    setDescription(spec.Description || "");
    setIconBase64("");
    setIsActive(spec.IsActive);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setFeedback({
          type: "error",
          text: "Icon image file must be under 4MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!name.trim()) {
      setFeedback({ type: "error", text: "Specialization name is required." });
      return;
    }

    try {
      if (editingSpec) {
        const id = (editingSpec._id || editingSpec.Id)!;
        const res = await updateSpecialization({
          id,
          Name: name.trim(),
          Description: description.trim(),
          Icon: iconBase64 || undefined,
          IsActive: isActive,
        }).unwrap();

        setFeedback({
          type: "success",
          text: res.Message || `Specialization updated successfully.`,
        });
        setEditingSpec(null);
      } else {
        const res = await createSpecialization({
          Name: name.trim(),
          Description: description.trim(),
          Icon: iconBase64 || undefined,
          IsActive: isActive,
        }).unwrap();

        setFeedback({
          type: "success",
          text: res.Message || `Specialization created successfully.`,
        });
        setIsAddModalOpen(false);
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: getErrorMessage(err, "Action failed. Please try again."),
      });
    }
  };

  const handleDelete = async (id: string) => {
    setFeedback(null);
    try {
      const res = await deleteSpecialization(id).unwrap();
      setFeedback({
        type: "success",
        text: res.Message || "Specialization deleted successfully.",
      });
      setDeleteConfirmId(null);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: getErrorMessage(err, "Failed to delete specialization."),
      });
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setFeedback(null);
    try {
      const res = await toggleStatus({
        id,
        IsActive: !currentStatus,
      }).unwrap();
      setFeedback({
        type: "success",
        text: res.Message || "Specialization status updated.",
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: getErrorMessage(err, "Failed to update status."),
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Specializations
        </h2>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-md p-1.5 transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Table view"
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`rounded-md p-1.5 transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Cards view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            title="Refresh specialization list"
          >
            <RotateCw
              className={`h-3 w-3 ${
                isFetching ? "animate-spin text-slate-900" : "text-slate-400"
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-2xs transition hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Specialization</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {kpiCards.map((c) => {
          const Icon = c.icon;
          const isActive = statusFilter === c.key;

          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setStatusFilter(c.key)}
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

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs ${
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
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search specializations (e.g. Cardiology, Neurology)..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-1.5 pl-8.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="w-full sm:w-56">
          <Dropdown
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val || "all")}
            triggerClassName="!py-1.5 !rounded-lg text-xs border-slate-200 bg-slate-50/60"
            dropdownClassName="w-56 text-xs border-slate-200"
            placeholder="All Specialties"
          />
        </div>

        {(searchTerm || statusFilter !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shrink-0"
            title="Reset filters"
          >
            <RotateCw className="h-3 w-3 text-slate-400" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex h-44 items-center justify-center rounded-xl border border-slate-200 bg-white p-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-800 border-t-transparent" />
            <span className="text-xs text-slate-500">Loading specializations...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-2">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-xs font-semibold text-slate-800">
            No specializations found
          </h3>
          <p className="mt-1 text-[11px] text-slate-400 max-w-sm">
            {searchTerm
              ? "No department matches your search criteria. Try a different keyword or reset filters."
              : "Get started by creating your hospital's first medical specialization."}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Specialization</span>
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((spec) => {
            const specId = (spec._id || spec.Id)!;
            return (
              <div
                key={specId}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-2xs transition-all duration-150 hover:border-slate-300 hover:bg-slate-50/20"
              >
                <div>
                  <div className="flex items-start justify-between gap-2.5 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <SpecializationIconBadge
                        name={spec.Name}
                        icon={spec.Icon}
                        size="md"
                      />
                      <div className="min-w-0 flex-1">
                        <h4
                          onClick={() => handleOpenEdit(spec)}
                          className="text-xs font-semibold text-slate-900 group-hover:text-teal-700 transition truncate cursor-pointer leading-tight"
                          title={spec.Name}
                        >
                          {spec.Name}
                        </h4>
                        <div className="mt-1 flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.2 text-[10px] font-medium border ${
                              spec.IsActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                                : "bg-slate-100 text-slate-600 border-slate-200/80"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                spec.IsActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {spec.IsActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(spec)}
                        className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Edit specialization"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(specId)}
                        className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Delete specialization"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <p
                    className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[2.5rem]"
                    title={spec.Description || ""}
                  >
                    {spec.Description || "No clinical description provided."}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {spec.createdAt
                      ? `Added ${new Date(spec.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}`
                      : "Solanki Clinical Staff"}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggle(specId, spec.IsActive)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                      spec.IsActive
                        ? "border-slate-200 bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-800 hover:border-amber-200"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {spec.IsActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-[#121215]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-medium text-slate-500 select-none dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                <th className="py-3 pl-5 pr-3 w-[28%] font-medium">Specialization</th>
                <th className="py-3 px-3 w-[42%] font-medium">Clinical Overview</th>
                <th className="py-3 px-3 text-center w-[12%] font-medium">Status</th>
                <th className="py-3 px-3 w-[10%] font-medium">Created</th>
                <th className="py-3 pl-3 pr-5 text-right w-[8%] font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((spec) => {
                const specId = (spec._id || spec.Id)!;
                return (
                  <tr
                    key={specId}
                    className="group transition-colors duration-150 hover:bg-slate-50/70"
                  >
                    <td className="py-3 pl-5 pr-3 align-middle">
                      <div className="flex items-center gap-2.5">
                        <SpecializationIconBadge
                          name={spec.Name}
                          icon={spec.Icon}
                          size="sm"
                        />
                        <span
                          onClick={() => handleOpenEdit(spec)}
                          className="font-semibold text-slate-900 text-xs hover:text-teal-700 cursor-pointer transition-colors truncate"
                          title="Click to edit"
                        >
                          {spec.Name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 align-middle">
                      <p className="text-xs text-slate-500 line-clamp-1 max-w-md">
                        {spec.Description || "No clinical description provided."}
                      </p>
                    </td>

                    <td className="py-3 px-3 align-middle text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                          spec.IsActive
                            ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/70"
                            : "bg-slate-100 text-slate-600 border-slate-200/80"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            spec.IsActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {spec.IsActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="py-3 px-3 align-middle text-[11px] text-slate-400">
                      {spec.createdAt
                        ? new Date(spec.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>

                    <td className="py-3 pl-3 pr-5 align-middle text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggle(specId, spec.IsActive)}
                          disabled={isToggling}
                          className={`inline-flex items-center rounded-lg border px-2 py-1 text-[11px] font-medium shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50 ${
                            spec.IsActive
                              ? "border-slate-200 bg-white hover:bg-amber-50 text-slate-600 hover:text-amber-800 hover:border-amber-200"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                          title={spec.IsActive ? "Deactivate" : "Activate"}
                        >
                          {spec.IsActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(spec)}
                          className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition active:scale-95 cursor-pointer"
                          title="Edit specialization"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(specId)}
                          className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-2xs transition active:scale-95 cursor-pointer"
                          title="Delete specialization"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Specialization Modal */}
      {(isAddModalOpen || editingSpec) && (
        <div
          onClick={() => {
            setIsAddModalOpen(false);
            setEditingSpec(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-200 animate-in zoom-in-95"
          >
            {/* Top Accent Bar */}
            <div className="h-1 w-full bg-[#008ba3]" />

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#008ba3] border border-teal-200/60 shadow-2xs">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {editingSpec
                      ? "Edit Specialization"
                      : "Add New Specialization"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingSpec
                      ? "Update department details and availability"
                      : "Create a new medical specialty department"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSpec(null);
                }}
                aria-label="Close modal"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3.5">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Specialization Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cardiology, Orthopedics, Pediatrics"
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-2 px-3 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of medical services and clinical treatments provided..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-2 px-3 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Department Icon / Image (Optional)
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 py-2.5 px-3 text-xs font-medium text-slate-600 transition hover:border-slate-400 hover:bg-white">
                  <Upload className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">
                    {iconBase64 ? "New icon selected" : "Choose icon image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {(iconBase64 || editingSpec?.Icon) && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={
                        iconBase64 ||
                        (editingSpec?.Icon ? getAdminImageUrl(editingSpec.Icon) : "")
                      }
                      alt="Icon Preview"
                      className="h-7 w-7 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    {iconBase64 && (
                      <button
                        type="button"
                        onClick={() => setIconBase64("")}
                        className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="text-xs font-medium text-slate-700 cursor-pointer"
                >
                  Active & Available for Doctor Assignment
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingSpec(null);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs transition hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Specialization</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Unified for Table & Cards) */}
      {deleteConfirmId && (
        <div
          onClick={() => setDeleteConfirmId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl transition-all duration-200 animate-in zoom-in-95"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 shadow-2xs">
                <Trash2 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">
                  Delete Specialization?
                </h4>
                <p className="text-[11px] text-slate-400">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to delete &quot;
              <span className="font-semibold text-slate-900">
                {deletingSpec?.Name || "this specialization"}
              </span>
              &quot;? It will be removed from doctor assignment across the hospital.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
