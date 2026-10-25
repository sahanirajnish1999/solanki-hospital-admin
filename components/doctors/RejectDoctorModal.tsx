"use client";

import React, { useState } from "react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Reject Doctor Verification
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

        <div className="mt-4 space-y-3">
          <p className="text-xs text-slate-600">
            Please provide an optional explanation or feedback for rejecting this doctor&apos;s registration.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Incomplete medical credential documents or invalid registration number."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-red-600 focus:bg-white"
          />

          <div className="mt-4 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmReject}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
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
