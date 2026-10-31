"use client";

import React, { useState, useEffect } from "react";
import { useManageDoctorMutation } from "@/redux/api/doctorApi";
import type { IDoctor } from "@/redux/types/doctor.types";
import { getErrorMessage } from "@/redux";
import {
  SlidersHorizontal,
  IndianRupee,
  X,
  AlertCircle,
} from "lucide-react";
import AvailableDaysSelector from "./AvailableDaysSelector";
import AvailableTimeSelector from "./AvailableTimeSelector";

interface ManageDoctorModalProps {
  doctor: IDoctor | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function ManageDoctorModal({
  doctor,
  onClose,
  onSuccess,
}: ManageDoctorModalProps) {
  const [normalFee, setNormalFee] = useState<number | "">(() => {
    return doctor?.ConsultationFees?.Normal ?? doctor?.ConsultationFee ?? "";
  });
  const [mediumFee, setMediumFee] = useState<number | "">(() => {
    return doctor?.ConsultationFees?.Medium ?? "";
  });
  const [emergencyFee, setEmergencyFee] = useState<number | "">(() => {
    return doctor?.ConsultationFees?.Emergency ?? "";
  });
  const [days, setDays] = useState<string>(() => doctor?.AvailableDays || "");
  const [time, setTime] = useState<string>(() => doctor?.AvailableTime || "");
  const [error, setError] = useState<string | null>(null);

  const [manageDoctorApi, { isLoading }] = useManageDoctorMutation();

  // Close on Escape key press
  useEffect(() => {
    if (!doctor) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [doctor, onClose]);

  if (!doctor) return null;
  const docId = doctor._id || doctor.Id || "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (normalFee === "") {
      setError("Please specify the Normal consultation fee.");
      return;
    }

    try {
      const feesPayload: {
        Normal: number;
        Medium?: number;
        Emergency?: number;
      } = {
        Normal: Number(normalFee),
      };

      if (mediumFee !== "") {
        feesPayload.Medium = Number(mediumFee);
      }
      if (emergencyFee !== "") {
        feesPayload.Emergency = Number(emergencyFee);
      }

      const res = await manageDoctorApi({
        id: docId,
        ConsultationFees: feesPayload,
        AvailableDays: days.trim(),
        AvailableTime: time.trim(),
      }).unwrap();

      onSuccess(
        res.Message ||
          `Clinical schedule and consultation fees updated for ${doctor.Name}.`,
      );
      onClose();
    } catch (err: unknown) {
      setError(
        getErrorMessage(err, "Failed to update doctor schedule and fees."),
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
        className="relative w-full max-w-lg sm:max-w-xl rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95 dark:border-slate-800 dark:bg-[#121215]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 text-[#008ba3] border border-[#008ba3]/20 shadow-2xs dark:from-cyan-950/40 dark:to-teal-950/60 dark:border-[#008ba3]/30">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Manage Schedule &amp; Fees
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {doctor.Name}
                {doctor.Specialization ? ` • ${doctor.Specialization}` : ""}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* 1. Consultation Fees Tiers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
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
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    placeholder="Normal Fee"
                    min={0}
                    required
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
                        e.target.value === "" ? "" : Number(e.target.value),
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
                        e.target.value === "" ? "" : Number(e.target.value),
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

          {/* 2. Available Days */}
          <AvailableDaysSelector
            value={days}
            onChange={setDays}
            label="Available Days"
          />

          {/* 3. Available Time */}
          <AvailableTimeSelector
            value={time}
            onChange={setTime}
            label="Available Time"
          />

          {/* Modal Footer */}
          <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
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
