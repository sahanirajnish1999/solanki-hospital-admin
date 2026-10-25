"use client";

import React, { useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
              <SlidersHorizontal className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Manage Schedule & Fees
              </h3>
              <p className="text-[11px] text-slate-500">{doctor.Name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3.5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Consultation Fee (₹)
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                min={0}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Available Days
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                placeholder="e.g. Mon - Fri"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Available Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 9:00 AM - 4:00 PM"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
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
