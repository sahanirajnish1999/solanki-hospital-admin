"use client";

import React, { useState, useRef, useEffect } from "react";
import { useCreateAdminMutation } from "@/redux/api/adminApi";
import {
  ALL_PERMISSIONS,
  DEFAULT_ADMIN_PERMISSIONS,
  PERMISSION_CONFIG,
} from "@/redux/utils/permissions";
import { getErrorMessage } from "@/redux/utils/errorHelper";
import {
  X,
  UserPlus,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Upload,
  Check,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Shield,
} from "lucide-react";

interface CreateAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export default function CreateAdminModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateAdminModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    DEFAULT_ADMIN_PERMISSIONS
  );
  const [imageBase64, setImageBase64] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [createAdminApi, { isLoading }] = useCreateAdminMutation();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setEmail("");
      setPassword("");
      setPhone("");
      setShowPassword(false);
      setSelectedPermissions(DEFAULT_ADMIN_PERMISSIONS);
      setImageBase64("");
      setError(null);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Profile image must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageBase64("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((p) => p !== permId)
        : [...prev, permId]
    );
  };

  const selectAll = () => {
    setSelectedPermissions(ALL_PERMISSIONS);
  };

  const clearAll = () => {
    setSelectedPermissions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Please enter the administrator's full name.");
      return;
    }
    if (!email.trim()) {
      setError("Please provide a valid email address.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await createAdminApi({
        Name: name.trim(),
        Email: email.trim().toLowerCase(),
        Password: password,
        Phone: phone.trim() || undefined,
        Permissions: selectedPermissions,
        ProfileImage: imageBase64 || undefined,
      }).unwrap();

      onSuccess?.(
        res.Message || `Administrator ${name.trim()} created successfully!`
      );
      onClose();
    } catch (err: unknown) {
      setError(
        getErrorMessage(
          err,
          "Failed to create administrator account. Please check your inputs."
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
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Provision New Administrator
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50">
                  <Shield className="h-3 w-3" /> Scoped Staff
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Register a new hospital staff member with controlled module access.
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            {/* Error Notification */}
            {error && (
              <div className="flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Photo & Basic Details */}
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                {imageBase64 ? (
                  <img
                    src={imageBase64}
                    alt="Preview"
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-purple-500/30"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500">
                    <User className="h-8 w-8" />
                  </div>
                )}
                {imageBase64 && (
                  <button
                    type="button"
                    onClick={removeImage}
                    title="Remove photo"
                    className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white shadow-xs hover:bg-rose-700 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>

              <div className="flex-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Profile Photo (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{imageBase64 ? "Change Photo" : "Upload Photo"}</span>
                  </button>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    JPG, PNG or WebP under 5MB
                  </span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Full Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rahul Sharma"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-purple-600 focus:bg-white dark:border-slate-700 dark:bg-[#161619] dark:text-slate-100 dark:focus:bg-[#1a1a1f] dark:focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@solankihospital.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-purple-600 focus:bg-white dark:border-slate-700 dark:bg-[#161619] dark:text-slate-100 dark:focus:bg-[#1a1a1f] dark:focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Password & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-9 text-xs text-slate-900 outline-none transition focus:border-purple-600 focus:bg-white dark:border-slate-700 dark:bg-[#161619] dark:text-slate-100 dark:focus:bg-[#1a1a1f] dark:focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-purple-600 focus:bg-white dark:border-slate-700 dark:bg-[#161619] dark:text-slate-100 dark:focus:bg-[#1a1a1f] dark:focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Module Permissions Picker */}
            <div className="pt-2">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Assigned Module Permissions
                  </span>
                  <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50">
                    {selectedPermissions.length} of {ALL_PERMISSIONS.length} active
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAll}
                    disabled={isLoading}
                    className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={clearAll}
                    disabled={isLoading}
                    className="font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {ALL_PERMISSIONS.map((permId) => {
                  const conf = PERMISSION_CONFIG[permId];
                  if (!conf) return null;
                  const Icon = conf.icon;
                  const isChecked = selectedPermissions.includes(permId);

                  return (
                    <button
                      key={permId}
                      type="button"
                      onClick={() => togglePermission(permId)}
                      className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                        isChecked
                          ? "border-purple-500/80 bg-purple-50/20 shadow-xs ring-1 ring-purple-500/20 dark:border-purple-500/60 dark:bg-purple-950/20 cursor-pointer"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-[#141418] dark:hover:bg-[#18181b] cursor-pointer"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 pr-5">
                        <p
                          className={`text-xs font-bold leading-tight ${
                            isChecked
                              ? "text-slate-900 dark:text-slate-100"
                              : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100"
                          }`}
                        >
                          {conf.label}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                          {conf.sub}
                        </p>
                      </div>

                      <div
                        className={`absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-purple-600 text-white shadow-xs dark:bg-purple-500"
                            : "border border-slate-300 dark:border-slate-700 text-transparent"
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-4 dark:border-slate-800 dark:bg-[#161619]">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Credentials can be used immediately to sign in
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50 dark:bg-purple-600 dark:hover:bg-purple-500"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Creating Admin...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Create Administrator</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

