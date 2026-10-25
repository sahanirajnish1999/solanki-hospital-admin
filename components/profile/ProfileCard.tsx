"use client";

import React, { useState } from "react";
import { useGetProfileQuery } from "@/redux/api/adminApi";
import { useAppSelector } from "@/redux/hooks";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import EditProfileModal from "./EditProfileModal";
import ChangePasswordModal from "./ChangePasswordModal";
import {
  Mail,
  Phone,
  Shield,
  Clock,
  Calendar,
  Edit3,
  KeyRound,
  RotateCw,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function ProfileCard() {
  const { admin: cachedAdmin, isSuperAdmin } = useAppSelector((state) => state.auth);
  const { data: profileResponse, isLoading, isFetching, refetch } = useGetProfileQuery();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const admin = profileResponse?.Data || cachedAdmin;

  if (isLoading && !admin) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-xs text-slate-500">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const formatDate = (val?: string | Date) => {
    if (!val) return "N/A";
    try {
      return new Date(val).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(val);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Avatar + Identity */}
        <div className="flex items-start gap-4">
          <div className="relative">
            {admin.ProfileImage ? (
              <img
                src={getAdminImageUrl(admin.ProfileImage)}
                alt={admin.Name}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-blue-500/20 shadow-xs"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold text-2xl shadow-xs">
                {admin.Name.charAt(0)}
              </div>
            )}
            <span
              className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white ${
                admin.IsActive ? "bg-emerald-500" : "bg-red-500"
              }`}
              title={admin.IsActive ? "Account Active" : "Account Suspended"}
            >
              <span className="h-2 w-2 rounded-full bg-white" />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {admin.Name}
              </h2>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                  <Sparkles className="h-3 w-3" />
                  Superadmin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  <Shield className="h-3 w-3" />
                  Admin
                </span>
              )}

              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  admin.IsActive
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                {admin.IsActive ? "Active Account" : "Inactive"}
              </span>
            </div>

            <div className="mt-2.5 space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{admin.Email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{admin.Phone || "No phone added"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            title="Refresh profile details from backend"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
            />
            <span>{isFetching ? "Syncing..." : "Refresh"}</span>
          </button>

          <button
            onClick={() => setIsEditOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95"
          >
            <Edit3 className="h-3.5 w-3.5 text-blue-600" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setIsPasswordOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-95"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Meta timestamps */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>Last Login:</span>
          <span className="font-medium text-slate-700">
            {formatDate(admin.LastLogin)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Member Since:</span>
          <span className="font-medium text-slate-700">
            {formatDate(admin.createdAt)}
          </span>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        admin={admin}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      <ChangePasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
      />
    </div>
  );
}
