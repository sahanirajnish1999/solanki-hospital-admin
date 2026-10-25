"use client";

import React, { useState } from "react";
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
} from "lucide-react";

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
  const [consultationFee, setConsultationFee] = useState<number>(500);
  const [availableDays, setAvailableDays] = useState("Mon - Fri");
  const [availableTime, setAvailableTime] = useState("9:00 AM - 4:00 PM");
  const [error, setError] = useState<string | null>(null);

  const { data: specializationsResponse } = useGetAllSpecializationsQuery({
    All: true,
  });
  const [createDoctorApi, { isLoading }] = useCreateDoctorMutation();

  const specializations = specializationsResponse?.Data || [];

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
      setError("Please complete all required fields (*) including specialization.");
      return;
    }

    try {
      const res = await createDoctorApi({
        Name: name.trim(),
        Email: email.trim(),
        Phone: phone.trim(),
        Password: password,
        SpecializationId: specializationId,
        ConsultationFee: Number(consultationFee) || 500,
        AvailableDays: availableDays.trim() || "Mon - Fri",
        AvailableTime: availableTime.trim() || "9:00 AM - 4:00 PM",
      }).unwrap();

      onSuccess(
        res.Message ||
          `Doctor ${name} registered successfully! Credentials saved.`,
      );

      // Reset
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setSpecializationId("");
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to register doctor."));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Register New Doctor
              </h3>
              <p className="text-[11px] text-slate-500">
                POST /v1/api/doctor/create
              </p>
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              Doctor Full Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dr. Sunita Rao"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="doctor@solankihospital.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543211"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="DoctorSecret@2026"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Clinical Specialization *
              </label>
              <select
                value={specializationId}
                onChange={(e) => setSpecializationId(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="">Select Specialization...</option>
                {specializations.map((spec) => (
                  <option
                    key={spec._id || spec.Id}
                    value={spec._id || spec.Id || ""}
                  >
                    {spec.Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Consultation Fee (₹)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(Number(e.target.value))}
                  min={0}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Available Days
              </label>
              <input
                type="text"
                value={availableDays}
                onChange={(e) => setAvailableDays(e.target.value)}
                placeholder="Mon - Fri"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Available Time
              </label>
              <input
                type="text"
                value={availableTime}
                onChange={(e) => setAvailableTime(e.target.value)}
                placeholder="9:00 AM - 4:00 PM"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white"
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
                  <span>Registering...</span>
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
