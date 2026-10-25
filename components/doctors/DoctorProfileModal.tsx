"use client";

import React from "react";
import type { IDoctor } from "@/redux/types/doctor.types";
import { getAdminImageUrl } from "@/redux";
import { X, SlidersHorizontal } from "lucide-react";

interface DoctorProfileModalProps {
  doctor: IDoctor | null;
  onClose: () => void;
  onOpenManage: (doc: IDoctor) => void;
}

export default function DoctorProfileModal({
  doctor,
  onClose,
  onOpenManage,
}: DoctorProfileModalProps) {
  if (!doctor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">
            Doctor Profile Details
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-4">
            {doctor.ProfileImage ? (
              <img
                src={getAdminImageUrl(doctor.ProfileImage)}
                alt={doctor.Name}
                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue-500/20"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold text-xl">
                {doctor.Name.charAt(0)}
              </div>
            )}
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {doctor.Name}
              </h4>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {doctor.Specialization || "General Medicine"}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    doctor.VerificationStatus === "approved"
                      ? "bg-emerald-50 text-emerald-700"
                      : doctor.VerificationStatus === "pending"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {doctor.VerificationStatus || "pending"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
            <div>
              <span className="text-slate-400">Email:</span>
              <p className="font-semibold text-slate-800 truncate">
                {doctor.Email}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Phone:</span>
              <p className="font-semibold text-slate-800">
                {doctor.Phone}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Experience:</span>
              <p className="font-semibold text-slate-800">
                {doctor.Experience || "Not specified"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Consultation Fee:</span>
              <p className="font-semibold text-slate-800">
                ₹{doctor.ConsultationFee || 500}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Available Days:</span>
              <p className="font-semibold text-slate-800">
                {doctor.AvailableDays || "Mon - Fri"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Hours:</span>
              <p className="font-semibold text-slate-800">
                {doctor.AvailableTime || "9:00 AM - 4:00 PM"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Registered By:</span>
              <p className="font-semibold text-slate-800 uppercase">
                {doctor.RegisteredBy || "Self"}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Registration Date:</span>
              <p className="font-semibold text-slate-800">
                {doctor.createdAt
                  ? new Date(doctor.createdAt).toLocaleDateString()
                  : "—"}
              </p>
            </div>
          </div>

          {doctor.About && (
            <div>
              <span className="text-xs font-semibold text-slate-700">
                About Doctor:
              </span>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {doctor.About}
              </p>
            </div>
          )}

          {doctor.RejectionReason && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <span className="font-bold">Rejection Note:</span>{" "}
              {doctor.RejectionReason}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                onClose();
                onOpenManage(doctor);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Manage Schedule & Fee</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
