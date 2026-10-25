"use client";

import React, { useState, useEffect } from "react";
import { useVerifyDoctorMutation } from "@/redux/api/doctorApi";
import type { IDoctor } from "@/redux/types/doctor.types";
import { getErrorMessage } from "@/redux";
import { ShieldAlert, X, AlertCircle } from "lucide-react";

interface RejectDoctorModalProps {
  doctor: IDoctor | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export default function RejectDoctorModal({
  doctor,
  onClose,
  onSuccess,
}: RejectDoctorModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [verifyDoctorApi, { isLoading }] = useVerifyDoctorMutation();

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

  const handleConfirmReject = async () => {
    setError(null);
    try {
      const res = await verifyDoctorApi({
        id: docId,
        Status: "rejected",
        RejectionReason: reason.trim() || undefined,
      }).unwrap();

      onSuccess(
        res.Message || `Doctor ${doctor.Name}'s verification has been rejected.`,
      );
      setReason("");
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to reject doctor verification."));
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
        {/* Top Accent Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-500 to-amber-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/60 shadow-2xs">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reject Doctor Verification
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">{doctor.Name}</p>
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

        <div className="px-6 py-4 space-y-3.5">
          <p className="text-xs text-slate-600 leading-relaxed">
            Please provide an optional explanation or feedback for declining this doctor&apos;s credentials or verification status.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Incomplete medical credential documents or invalid medical license number."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-3 focus:ring-rose-500/10 resize-none"
          />

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-slate-50 hover:border-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <span>Confirm Rejection</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
