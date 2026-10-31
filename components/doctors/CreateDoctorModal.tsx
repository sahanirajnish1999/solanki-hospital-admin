"use client";

import React, { useState, useMemo, useEffect } from "react";
import Dropdown, { DropdownOption } from "@/components/common/Dropdown";
import { useCreateDoctorMutation } from "@/redux/api/doctorApi";
import { useGetAllSpecializationsQuery } from "@/redux/api/specializationApi";
import { getErrorMessage } from "@/redux";
import {
  Stethoscope,
  Mail,
  User,
  Phone,
  Lock,
  IndianRupee,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import AvailableDaysSelector from "./AvailableDaysSelector";
import AvailableTimeSelector from "./AvailableTimeSelector";

interface CreateDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function CreateDoctorModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateDoctorModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [specializationId, setSpecializationId] = useState("");
  const [normalFee, setNormalFee] = useState<number | "">("");
  const [mediumFee, setMediumFee] = useState<number | "">("");
  const [emergencyFee, setEmergencyFee] = useState<number | "">("");
  const [availableDays, setAvailableDays] = useState<string>("");
  const [availableTime, setAvailableTime] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { data: specializationsResponse } = useGetAllSpecializationsQuery({
    All: true,
  });
  const [createDoctorApi, { isLoading }] = useCreateDoctorMutation();

  const specializations = useMemo(
    () => specializationsResponse?.Data || [],
    [specializationsResponse?.Data],
  );

  const specializationOptions: DropdownOption[] = useMemo(
    () =>
      specializations.map((spec) => ({
        value: spec._id || spec.Id || "",
        label: spec.Name,
        sublabel: spec.Description || undefined,
      })),
    [specializations],
  );

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !specializationId
    ) {
      setError(
        "Please complete all required fields (*) including specialization.",
      );
      return;
    }

    const hasAnyFee =
      normalFee !== "" || mediumFee !== "" || emergencyFee !== "";
    const feesPayload = hasAnyFee
      ? {
          Normal: normalFee !== "" ? Number(normalFee) : 0,
          ...(mediumFee !== "" ? { Medium: Number(mediumFee) } : {}),
          ...(emergencyFee !== "" ? { Emergency: Number(emergencyFee) } : {}),
        }
      : undefined;

    try {
      const res = await createDoctorApi({
        Name: name.trim(),
        Email: email.trim(),
        Phone: phone.trim(),
        Password: password,
        SpecializationId: specializationId,
        ...(normalFee !== "" ? { ConsultationFee: Number(normalFee) } : {}),
        ...(feesPayload ? { ConsultationFees: feesPayload } : {}),
        AvailableDays: availableDays.trim(),
        AvailableTime: availableTime.trim(),
      }).unwrap();

      onSuccess(
        res.Message ||
          `Doctor ${name} registered successfully! Credentials saved.`,
      );

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setSpecializationId("");
      setNormalFee("");
      setMediumFee("");
      setEmergencyFee("");
      setAvailableDays("");
      setAvailableTime("");
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to register doctor."));
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95 dark:border-slate-800 dark:bg-[#121215]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 text-[#008ba3] border border-[#008ba3]/20 shadow-2xs dark:from-cyan-950/40 dark:to-teal-950/60 dark:border-[#008ba3]/30">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Register New Doctor
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-[#008ba3] border border-cyan-200/60 dark:bg-cyan-950/40 dark:border-cyan-800/50 dark:text-cyan-400">
                  <Sparkles className="h-2.5 w-2.5" />
                  Onboarding
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Add medical practitioner credentials and clinical availability
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
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-800/60 dark:bg-rose-950/40 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {/* Section 1: Doctor Profile Information */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Personal &amp; Contact Details
              </label>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Doctor Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:focus:bg-[#18181b]"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:focus:bg-[#18181b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone Number"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:focus:bg-[#18181b]"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Specialization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Temporary Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10 dark:border-slate-800 dark:bg-[#161619] dark:text-slate-100 dark:focus:bg-[#18181b]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer dark:hover:text-slate-300"
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
                  <Dropdown
                    label="Clinical Specialization"
                    labelClassName="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                    required
                    options={specializationOptions}
                    value={specializationId}
                    onChange={(val) => setSpecializationId(val)}
                    placeholder="Select Specialization..."
                    searchable
                    clearable
                    leadingIcon={<Stethoscope className="h-4 w-4" />}
                    triggerClassName="!py-2.5 !rounded-xl text-xs bg-slate-50/70 border-slate-200 dark:bg-[#161619] dark:border-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Clinical Practice & Schedule */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Consultation Fees &amp; Schedule
              </label>

              {/* 3-Tier Consultation Fees */}
              <div className="mb-3.5">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Consultation Fees (₹)
                  </label>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                    Tiered Pricing
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Normal Fee */}
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 transition-all focus-within:border-[#008ba3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#008ba3]/10 dark:border-slate-800 dark:bg-[#161619] dark:focus-within:bg-[#18181b] dark:focus-within:border-[#008ba3]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        Normal
                      </span>
                      <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50">
                        OPD
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 leading-tight">
                      Routine consultation
                    </p>
                    <div className="relative flex items-center">
                      <IndianRupee className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="number"
                        value={normalFee}
                        onChange={(e) =>
                          setNormalFee(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="Normal Fee"
                        min={0}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs font-bold text-slate-900 outline-none transition focus:border-[#008ba3] dark:border-slate-700 dark:bg-[#121215] dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Medium Fee */}
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 transition-all focus-within:border-[#008ba3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#008ba3]/10 dark:border-slate-800 dark:bg-[#161619] dark:focus-within:bg-[#18181b] dark:focus-within:border-[#008ba3]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        Medium
                      </span>
                      <span className="rounded-md bg-cyan-50 px-1.5 py-0.5 text-[9px] font-bold text-[#008ba3] border border-[#008ba3]/20 dark:bg-cyan-950/40 dark:text-cyan-400 dark:border-cyan-900/50">
                        Priority
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 leading-tight">
                      Priority / follow-up
                    </p>
                    <div className="relative flex items-center">
                      <IndianRupee className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="number"
                        value={mediumFee}
                        onChange={(e) =>
                          setMediumFee(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="Optional"
                        min={0}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs font-bold text-slate-900 outline-none transition focus:border-[#008ba3] dark:border-slate-700 dark:bg-[#121215] dark:text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Emergency Fee */}
                  <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3 transition-all focus-within:border-[#008ba3] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#008ba3]/10 dark:border-slate-800 dark:bg-[#161619] dark:focus-within:bg-[#18181b] dark:focus-within:border-[#008ba3]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        Emergency
                      </span>
                      <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-200/60 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50">
                        Urgent
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 leading-tight">
                      Urgent &amp; 24x7 care
                    </p>
                    <div className="relative flex items-center">
                      <IndianRupee className="absolute left-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="number"
                        value={emergencyFee}
                        onChange={(e) =>
                          setEmergencyFee(
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                        placeholder="Optional"
                        min={0}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs font-bold text-slate-900 outline-none transition focus:border-[#008ba3] dark:border-slate-700 dark:bg-[#121215] dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Symmetrical Schedule Columns: Days & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <AvailableDaysSelector
                  value={availableDays}
                  onChange={setAvailableDays}
                  label="Available Days"
                />

                <AvailableTimeSelector
                  value={availableTime}
                  onChange={setAvailableTime}
                  label="Available Time"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5 rounded-b-3xl shrink-0 dark:border-slate-800 dark:bg-[#161619]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#008ba3] hover:bg-[#007a8f] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Registering Doctor...</span>
                </>
              ) : (
                <span>Register Doctor</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
