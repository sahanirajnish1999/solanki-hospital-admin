"use client";

import React, { useState, useEffect } from "react";
import { useManageDoctorMutation } from "@/redux/api/doctorApi";
import type { IDoctor } from "@/redux/types/doctor.types";
import { getErrorMessage } from "@/redux";
import {
  SlidersHorizontal,
  IndianRupee,
  Calendar,
  Clock,
  X,
  AlertCircle,
} from "lucide-react";

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
  const [fee, setFee] = useState<number>(doctor?.ConsultationFee || 500);
  const [days, setDays] = useState(doctor?.AvailableDays || "Mon - Fri");
  const [time, setTime] = useState(doctor?.AvailableTime || "9:00 AM - 4:00 PM");
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

    try {
      const res = await manageDoctorApi({
        id: docId,
        ConsultationFee: Number(fee) || 0,
        AvailableDays: days.trim() || "Mon - Fri",
        AvailableTime: time.trim() || "9:00 AM - 4:00 PM",
      }).unwrap();

      onSuccess(
        res.Message ||
          `Clinical schedule and consultation fee updated for ${doctor.Name}.`,
      );
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to update doctor schedule and fees."));
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95"
      >
        {/* Top Gradient Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#008ba3] via-teal-500 to-cyan-400" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-50 text-[#008ba3] border border-[#008ba3]/20 shadow-2xs">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Manage Schedule &amp; Fees
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {doctor.Name} • {doctor.Specialization || "Doctor"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 flex items-center gap-2.5 rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Consultation Fee (₹)
            </label>
            <div className="relative flex items-center">
              <IndianRupee className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                min={0}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Available Days
            </label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="e.g. Mon - Fri"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Available Time
            </label>
            <div className="relative flex items-center">
              <Clock className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 9:00 AM - 4:00 PM"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
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
