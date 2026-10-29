"use client";

import React, { useState, useEffect } from "react";
import type { IAdmin } from "@/redux/types/admin.types";
import { useUpdateAdminPermissionsMutation } from "@/redux/api/adminApi";
import {
  ALL_PERMISSIONS,
  PERMISSION_CONFIG,
  isSuperAdmin,
} from "@/redux/utils/permissions";
import { getErrorMessage } from "@/redux/utils/errorHelper";
import {
  X,
  Shield,
  SlidersHorizontal,
  Check,
  CheckCircle2,
  AlertCircle,
  Crown,
  Loader2,
  Lock,
} from "lucide-react";

interface ManagePermissionsModalProps {
  admin: IAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export default function ManagePermissionsModal({
  admin,
  isOpen,
  onClose,
  onSuccess,
}: ManagePermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [updatePermissionsApi, { isLoading: isSaving }] =
    useUpdateAdminPermissionsMutation();

  const isTargetSuperAdmin = isSuperAdmin(admin);

  useEffect(() => {
    if (!admin) return;
    setError(null);
    if (isTargetSuperAdmin) {
      setSelectedPermissions(ALL_PERMISSIONS);
    } else {
      const current = (admin.Permissions || [])
        .map((p) => String(p).trim().toLowerCase())
        .filter((p) => ALL_PERMISSIONS.includes(p));
      setSelectedPermissions(current);
    }
  }, [admin, isTargetSuperAdmin]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !admin) return null;

  const adminId = (admin._id || admin.Id || "") as string;

  const togglePermission = (permId: string) => {
    if (isTargetSuperAdmin || isSaving) return;
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId]
    );
  };

  const selectAll = () => {
    if (isTargetSuperAdmin || isSaving) return;
    setSelectedPermissions(ALL_PERMISSIONS);
  };

  const clearAll = () => {
    if (isTargetSuperAdmin || isSaving) return;
    setSelectedPermissions([]);
  };

  const handleSave = async () => {
    setError(null);
    if (isTargetSuperAdmin) {
      setError("Cannot modify permissions of a superadmin.");
      return;
    }

    try {
      const res = await updatePermissionsApi({
        adminId,
        Permissions: selectedPermissions,
      }).unwrap();

      onSuccess?.(
        res.Message || `Permissions updated for ${admin.Name} successfully.`
      );
      onClose();
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Failed to update administrator permissions. Please try again."
        )
      );
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95 dark:border-slate-800 dark:bg-[#121215]"
      >
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 dark:bg-[#161619]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/60 shadow-2xs dark:bg-purple-950/40 dark:border-purple-900/50 dark:text-purple-400">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Manage Administrator Permissions
                </h3>
                {isTargetSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50">
                    <Crown className="h-3 w-3" /> Superadmin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50">
                    <Shield className="h-3 w-3" /> Scoped Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {admin.Name} • <span className="font-mono">{admin.Email}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Superadmin Notice Banner */}
          {isTargetSuperAdmin ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300 flex items-start gap-3">
              <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-sm block">
                  Master Access Role
                </span>
                <p className="leading-relaxed text-amber-800 dark:text-amber-200">
                  Superadmins inherently hold complete unrestricted master access (<code className="font-mono font-bold">*</code>) across all hospital clinical modules and administrator functions.
                  Individual permissions cannot be restricted for superadmin accounts.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Authorized Hospital Modules
                </span>
                <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50">
                  {selectedPermissions.length} of {ALL_PERMISSIONS.length} active
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAll}
                  disabled={isSaving}
                  className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  Select All
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={isSaving}
                  className="font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:underline cursor-pointer disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}

          {/* Permission Tile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_PERMISSIONS.map((permId) => {
              const conf = PERMISSION_CONFIG[permId];
              if (!conf) return null;
              const Icon = conf.icon;
              const isChecked = selectedPermissions.includes(permId);

              return (
                <button
                  key={permId}
                  type="button"
                  disabled={isTargetSuperAdmin || isSaving}
                  onClick={() => togglePermission(permId)}
                  className={`group relative flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all duration-150 ${
                    isTargetSuperAdmin
                      ? "opacity-80 border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-[#161619] cursor-default"
                      : isChecked
                      ? `border-purple-500/80 bg-purple-50/20 shadow-xs ring-1 ring-purple-500/20 dark:border-purple-500/60 dark:bg-purple-950/20 cursor-pointer`
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-[#141418] dark:hover:bg-[#18181b] cursor-pointer"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 pr-6">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        isChecked
                          ? "text-slate-900 dark:text-slate-100"
                          : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                      }`}
                    >
                      {conf.label}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                      {conf.sub}
                    </p>
                  </div>

                  {/* Active Indicator Checkmark */}
                  <div
                    className={`absolute top-3.5 right-3.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isChecked
                        ? "bg-purple-600 text-white shadow-xs dark:bg-purple-500"
                        : "border border-slate-300 dark:border-slate-700 text-transparent"
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>

          {!isTargetSuperAdmin && selectedPermissions.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                With no permissions assigned, this administrator will only have read-only dashboard access.
              </span>
            </p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-[#161619]">
          <div className="text-xs text-slate-400 dark:text-slate-500">
            {isTargetSuperAdmin ? (
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Superadmin permissions are locked
              </span>
            ) : (
              <span>Updates apply immediately to staff session</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            {!isTargetSuperAdmin && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50 dark:bg-purple-600 dark:hover:bg-purple-500"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Save Permissions</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

