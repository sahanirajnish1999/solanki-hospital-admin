"use client";

import React, { useState } from "react";
import { useUpdateProfileMutation } from "@/redux/api/adminApi";
import type { IAdmin } from "@/redux/types/admin.types";
import { getAdminImageUrl, getErrorMessage } from "@/redux";
import { X, User, Phone, Upload, CheckCircle2, AlertCircle } from "lucide-react";

interface EditProfileModalProps {
  admin: IAdmin;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({
  admin,
  isOpen,
  onClose,
}: EditProfileModalProps) {
  const [name, setName] = useState(admin.Name || "");
  const [phone, setPhone] = useState(admin.Phone || "");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    try {
      await updateProfile({
        Name: name.trim(),
        Phone: phone.trim(),
        ProfileImage: imageBase64 || undefined,
      }).unwrap();

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1000);
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Failed to update profile. Please try again.")
      );
    }
  };

  const currentPreview =
    imageBase64 || (admin.ProfileImage ? getAdminImageUrl(admin.ProfileImage) : "");

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl transition-all duration-200 animate-in zoom-in-95"
      >
        {/* Accent Bar */}
        <div className="h-1 w-full bg-[#008ba3]" />

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-[#008ba3] border border-teal-200/60 shadow-2xs">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Edit Admin Profile
              </h3>
              <p className="text-[11px] text-slate-400">
                Update your administrator identity and contact details
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Avatar Preview & Upload */}
          <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="relative shrink-0">
              {currentPreview ? (
                <img
                  src={currentPreview}
                  alt="Admin Avatar"
                  className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200 shadow-2xs"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-700 font-semibold text-lg border border-slate-200 shadow-2xs">
                  {admin.Name.charAt(0)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-2xs transition">
                <Upload className="h-3.5 w-3.5 text-slate-400" />
                <span>Upload New Avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              <p className="mt-1 text-[11px] text-slate-400">
                PNG, JPG or WebP (Max 5MB)
              </p>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-2 pl-8.5 pr-3 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-2 pl-8.5 pr-3 text-xs text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-2xs transition hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
