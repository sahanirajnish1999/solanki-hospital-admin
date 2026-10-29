"use client";

import React, { useState } from "react";
import {
  useGetAllAdminsQuery,
  useUpdateAdminStatusMutation,
} from "@/redux/api/adminApi";
import { useAppSelector } from "@/redux/hooks";
import { getAdminImageUrl, getErrorMessage } from "@/redux";
import type { IAdmin } from "@/redux/types/admin.types";
import {
  ALL_PERMISSIONS,
  PERMISSION_CONFIG,
  isSuperAdmin,
} from "@/redux/utils/permissions";
import ManagePermissionsModal from "./ManagePermissionsModal";
import CreateAdminModal from "./CreateAdminModal";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  User,
  RotateCw,
  SlidersHorizontal,
  Crown,
  Shield,
  UserPlus,
} from "lucide-react";

export default function AdminManagementTable() {
  const currentAdmin = useAppSelector((state) => state.auth.admin);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [managingAdmin, setManagingAdmin] = useState<IAdmin | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    data: adminsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllAdminsQuery({ Page: page, Limit: limit });

  const [updateStatus, { isLoading: isUpdatingStatus }] =
    useUpdateAdminStatusMutation();

  const admins = adminsResponse?.Data || [];
  const pagination = adminsResponse?.Pagination;

  // Filter admins by search term
  const filteredAdmins = admins.filter(
    (a) =>
      a.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.Email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.Phone && a.Phone.includes(searchTerm))
  );

  // Toggle Admin Status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setActionMessage(null);
    if (currentAdmin?._id === id || currentAdmin?.Id === id) {
      setActionMessage({
        type: "error",
        text: "You cannot deactivate your own superadmin account.",
      });
      return;
    }

    try {
      const res = await updateStatus({
        id,
        IsActive: !currentStatus,
      }).unwrap();
      setActionMessage({
        type: "success",
        text: res.Message || `Admin status updated successfully.`,
      });
    } catch (err: unknown) {
      setActionMessage({
        type: "error",
        text: getErrorMessage(err, "Failed to update admin status."),
      });
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-[#121215]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:border dark:border-purple-800/50 dark:text-purple-300">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Hospital Administrators
            </h3>
            {pagination && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {pagination.Total} total
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Superadmin Management: Oversee privileges, toggle activation, and roles
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-purple-600 focus:bg-white dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:focus:bg-[#1a1a1f] dark:focus:border-purple-500"
            />
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-300 dark:hover:bg-[#1a1a1f] cursor-pointer"
            title="Reload administrator list"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-purple-600" : ""}`}
            />
            <span className="hidden sm:inline">
              {isFetching ? "Syncing..." : "Refresh"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition active:scale-95 cursor-pointer dark:bg-purple-600 dark:hover:bg-purple-500 shrink-0"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Create Admin</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionMessage && (
        <div
          className={`mt-4 flex items-center justify-between rounded-xl p-3 text-xs ${
            actionMessage.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "border border-red-200 bg-red-50 text-red-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-rose-400" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-[11px] font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">
                  Admin Name &amp; Email
                </th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">
                  Module Permissions
                </th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading && admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                      <span>Loading administrators...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No administrators found matching your search.
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const adminId = (admin._id || admin.Id || "") as string;
                  const isSelf =
                    currentAdmin?._id === adminId || currentAdmin?.Id === adminId;

                  return (
                    <tr
                      key={adminId}
                      className="transition hover:bg-slate-50/70 dark:hover:bg-[#18181c]"
                    >
                      {/* Name & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {admin.ProfileImage ? (
                            <img
                              src={getAdminImageUrl(admin.ProfileImage)}
                              alt={admin.Name}
                              className="h-9 w-9 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                              <span>{admin.Name}</span>
                              {admin.Role === "superadmin" ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:border-purple-800/50 dark:text-purple-300">
                                  <Crown className="h-2.5 w-2.5" /> Superadmin
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                                  <Shield className="h-2.5 w-2.5" /> Admin
                                </span>
                              )}
                              {isSelf && (
                                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/40 dark:border dark:border-blue-800/40 dark:text-blue-300">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              {admin.Email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                        {admin.Phone || "—"}
                      </td>

                      {/* Module Permissions */}
                      <td className="px-4 py-3.5">
                        {admin.Role === "superadmin" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300 shadow-2xs">
                            <Crown className="h-3 w-3" /> Full Master Access (*)
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                            {admin.Permissions && admin.Permissions.length > 0 ? (
                              admin.Permissions.filter((p) =>
                                ALL_PERMISSIONS.includes(p)
                              ).map((perm) => {
                                const conf = PERMISSION_CONFIG[perm];
                                return (
                                  <span
                                    key={perm}
                                    className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                                  >
                                    <span>{conf?.label || perm}</span>
                                  </span>
                                );
                              })
                            ) : (
                              <span className="text-[11px] text-slate-400 italic dark:text-slate-500">
                                No permissions assigned
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            admin.IsActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-red-100 text-red-700 dark:bg-rose-950/40 dark:text-rose-300"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              admin.IsActive ? "bg-emerald-500" : "bg-red-500"
                            }`}
                          />
                          {admin.IsActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">
                        {admin.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString()
                          : "—"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {admin.Role !== "superadmin" && (
                            <button
                              type="button"
                              onClick={() => setManagingAdmin(admin)}
                              className="inline-flex items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition active:scale-95 cursor-pointer dark:border-purple-800/50 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/40 shadow-2xs"
                              title="Configure Module Permissions"
                            >
                              <SlidersHorizontal className="h-3 w-3" />
                              <span>Permissions</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleStatus(adminId, admin.IsActive)
                            }
                            disabled={isSelf || isUpdatingStatus}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition active:scale-95 disabled:opacity-40 cursor-pointer ${
                              admin.IsActive
                                ? "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                            }`}
                          >
                            {admin.IsActive ? "Deactivate" : "Activate"}
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

        {/* Pagination Footer */}
        {pagination && pagination.TotalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-[#161619]">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Page {pagination.Page} of {pagination.TotalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.TotalPages, p + 1))
                }
                disabled={page >= pagination.TotalPages || isFetching}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Superadmin Manage Permissions Modal */}
      <ManagePermissionsModal
        isOpen={Boolean(managingAdmin)}
        admin={managingAdmin}
        onClose={() => setManagingAdmin(null)}
        onSuccess={(msg) => {
          setActionMessage({ type: "success", text: msg });
        }}
      />

      {/* Superadmin Create Admin Modal */}
      <CreateAdminModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(msg) => {
          setActionMessage({ type: "success", text: msg });
        }}
      />
    </div>
  );
}
