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
} from "lucide-react";

export default function ProfileCard() {
  const { admin: cachedAdmin, isSuperAdmin } = useAppSelector((state) => state.auth);
  const { data: profileResponse, isLoading, isFetching, refetch } = useGetProfileQuery();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const admin = profileResponse?.Data || cachedAdmin;

  if (isLoading && !admin) {
    return (
      <div className="flex h-52 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-800 border-t-transparent" />
          <p className="text-xs text-slate-500">Loading admin profile...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const formatDate = (val?: string | Date) => {
    if (!val) return "—";
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
    <>
      {/* Primary Identity Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Avatar + Details */}
          <div className="flex items-start gap-3.5 min-w-0">
            {/* Avatar */}
            <div className="relative shrink-0">
              {admin.ProfileImage ? (
                <img
                  src={getAdminImageUrl(admin.ProfileImage)}
                  alt={admin.Name}
                  className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs"
                />
              ) : (
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-semibold text-lg sm:text-xl border border-slate-200/80 shadow-2xs">
                  {admin.Name.charAt(0)}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                  admin.IsActive ? "bg-emerald-500" : "bg-rose-500"
                }`}
                title={admin.IsActive ? "Account Active" : "Account Suspended"}
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight truncate">
                  {admin.Name}
                </h3>

                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium">
                    <Sparkles className="h-3 w-3 text-slate-500" />
                    Superadmin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80 px-2 py-0.5 text-[10px] font-medium">
                    <Shield className="h-3 w-3 text-slate-500" />
                    Admin
                  </span>
                )}

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                    admin.IsActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200/70"
                      : "bg-rose-50 text-rose-700 border-rose-200/70"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      admin.IsActive ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  {admin.IsActive ? "Active Account" : "Inactive"}
                </span>
              </div>

              {/* Contacts */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{admin.Email}</span>
                </div>
                {admin.Phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{admin.Phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 self-start">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Refresh profile details"
            >
              <RotateCw
                className={`h-3 w-3 ${
                  isFetching ? "animate-spin text-slate-900" : "text-slate-400"
                }`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 cursor-pointer"
            >
              <Edit3 className="h-3 w-3 text-slate-400" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => setIsPasswordOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-2xs transition hover:bg-slate-800 active:scale-95 cursor-pointer"
            >
              <KeyRound className="h-3 w-3" />
              <span>Change Password</span>
            </button>
          </div>
        </div>

        {/* Meta Timestamps */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Last Login:</span>
            <span className="font-medium text-slate-700">
              {formatDate(admin.LastLogin)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Member Since:</span>
            <span className="font-medium text-slate-700">
              {formatDate(admin.createdAt)}
            </span>
          </div>
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
    </>
  );
}
