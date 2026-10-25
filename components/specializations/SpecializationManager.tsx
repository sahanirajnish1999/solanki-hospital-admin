"use client";

import React, { useState } from "react";
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
} from "lucide-react";

export default function SpecializationManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSpec, setEditingSpec] = useState<ISpecialization | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
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

  const specializations = specializationsResponse?.Data || [];

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
      {/* Top Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Activity className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Clinical Specializations
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
              {specializations.length} Total
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Define medical specialties assigned to doctors across Solanki
            Hospital
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            title="Refresh list"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
            />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Specialization</span>
          </button>
        </div>
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
            className="text-[11px] font-semibold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search specializations (e.g. Cardiology, Neurology)..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:bg-white"
          >
            <option value="all">All Specialties</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Specialization Cards Grid */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            <span className="text-xs text-slate-500">Loading specializations...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Layers className="h-10 w-10 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">
            No specializations found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {searchTerm
              ? "No department matches your search criteria."
              : "Get started by creating your hospital's first medical specialization."}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span>Create Specialization</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((spec) => {
            const specId = (spec._id || spec.Id)!;
            return (
              <div
                key={specId}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {spec.Icon ? (
                        <img
                          src={getAdminImageUrl(spec.Icon)}
                          alt={spec.Name}
                          className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-base">
                          {spec.Name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {spec.Name}
                        </h4>
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                            spec.IsActive
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              spec.IsActive ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                          {spec.IsActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(spec)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition"
                        title="Edit specialization"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(specId)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Delete specialization"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-3 min-h-[3rem]">
                    {spec.Description || "No department description provided."}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {spec.createdAt
                      ? `Added ${new Date(spec.createdAt).toLocaleDateString()}`
                      : ""}
                  </span>

                  <button
                    onClick={() => handleToggle(specId, spec.IsActive)}
                    disabled={isToggling}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      spec.IsActive
                        ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                        : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    }`}
                  >
                    {spec.IsActive ? "Deactivate" : "Activate"}
                  </button>
                </div>

                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === specId && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/95 p-4 text-center backdrop-blur-xs">
                    <p className="text-xs font-bold text-slate-900">
                      Delete &quot;{spec.Name}&quot;?
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      This action cannot be undone.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(specId)}
                        disabled={isDeleting}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
                      >
                        {isDeleting ? "Deleting..." : "Confirm Delete"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Specialization Modal */}
      {(isAddModalOpen || editingSpec) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingSpec
                  ? "Edit Specialization"
                  : "Add New Specialization"}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSpec(null);
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Specialization Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cardiology, Orthopedics, Pediatrics"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of medical services and treatments provided..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Department Icon / Image (Optional)
                </label>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 py-3 px-3 text-xs font-medium text-slate-600 transition hover:border-blue-500 hover:bg-blue-50/30">
                  <Upload className="h-4 w-4 text-slate-400" />
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
                      className="h-8 w-8 rounded-lg object-cover ring-1 ring-blue-500"
                    />
                    {iconBase64 && (
                      <button
                        type="button"
                        onClick={() => setIconBase64("")}
                        className="text-[11px] text-red-500 hover:underline"
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
                  className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <label
                  htmlFor="isActiveToggle"
                  className="text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Active & Available for Doctor Assignment
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingSpec(null);
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating || isUpdating ? "Saving..." : "Save Specialization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
