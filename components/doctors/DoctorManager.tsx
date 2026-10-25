"use client";

import React, { useState } from "react";
import { useGetPublicDoctorsQuery } from "@/redux/api/doctorApi";
import { useGetAllSpecializationsQuery } from "@/redux/api/specializationApi";
import type { IDoctor } from "@/redux/types/doctor.types";
import { getAdminImageUrl } from "@/redux";
import {
  Stethoscope,
  Search,
  RotateCw,
  Phone,
  Mail,
  User,
  Star,
  Clock,
  Calendar,
  IndianRupee,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function DoctorManager() {
  const [page, setPage] = useState(1);
  const limit = 9;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [onlineFilter, setOnlineFilter] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<IDoctor | null>(null);

  // RTK Query Hooks for Admin Panel Directory
  const {
    data: doctorsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetPublicDoctorsQuery({
    Page: page,
    Limit: limit,
    Search: searchTerm || undefined,
    Specialization: selectedSpecialization || undefined,
    IsOnline:
      onlineFilter === "online"
        ? true
        : onlineFilter === "offline"
        ? false
        : undefined,
  });

  const { data: specializationsResponse } = useGetAllSpecializationsQuery({
    All: true,
  });

  const doctors = doctorsResponse?.Data?.Doctors || [];
  const pagination = doctorsResponse?.Data?.Pagination;
  const specializations = specializationsResponse?.Data || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Stethoscope className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Doctors Directory
            </h2>
            {pagination && (
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                {pagination.Total} Doctors
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-slate-500">
            Certified medical staff, clinic availability, and active public profiles
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            title="Refresh doctors"
          >
            <RotateCw
              className={`h-3.5 w-3.5 ${isFetching ? "animate-spin text-blue-600" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="flex items-center gap-2.5 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-800">
        <ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />
        <span>
          Doctors manage their individual registrations, schedules, and clinical profiles via the dedicated Doctor Portal. This dashboard provides verified administrative overview and directory management.
        </span>
      </div>

      {/* Filter / Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor name or specialty..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
          />
        </div>

        {/* Specialization Filter */}
        <div>
          <select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:bg-white"
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec._id || spec.Id} value={spec.Name}>
                {spec.Name}
              </option>
            ))}
          </select>
        </div>

        {/* Online Status Filter */}
        <div>
          <select
            value={onlineFilter}
            onChange={(e) => setOnlineFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-600 focus:bg-white"
          >
            <option value="all">All Consultation Statuses</option>
            <option value="online">Online & Available</option>
            <option value="offline">Offline</option>
          </select>
        </div>
      </div>

      {/* Doctor Cards Grid */}
      {isLoading ? (
        <div className="flex h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-7 w-7 animate-spin rounded-full border-3 border-blue-600 border-t-transparent" />
            <span className="text-xs text-slate-500">Loading doctor profiles...</span>
          </div>
        </div>
      ) : doctors.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Stethoscope className="h-10 w-10 text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-800">
            No doctors found
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            {searchTerm || selectedSpecialization
              ? "No medical doctors match your active search filters."
              : "No doctor profiles have been published yet in the directory."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => {
            const docId = (doc._id || doc.Id)!;
            return (
              <div
                key={docId}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md"
              >
                <div>
                  {/* Doctor Card Top */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="relative shrink-0">
                      {doc.ProfileImage ? (
                        <img
                          src={getAdminImageUrl(doc.ProfileImage)}
                          alt={doc.Name}
                          className="h-14 w-14 rounded-2xl object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold text-lg">
                          {doc.Name.charAt(0)}
                        </div>
                      )}
                      <span
                        className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white ${
                          doc.IsOnline ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                        title={doc.IsOnline ? "Doctor Online" : "Doctor Offline"}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="truncate text-sm font-bold text-slate-900 group-hover:text-blue-600 transition">
                          {doc.Name}
                        </h4>
                      </div>

                      <div className="mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
                          {doc.Specialization || "General Medicine"}
                        </span>
                        {doc.Experience && (
                          <span className="text-[11px] text-slate-500 font-medium">
                            • {doc.Experience}
                          </span>
                        )}
                      </div>

                      {/* Rating */}
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{doc.Rating || 4.8}</span>
                        <span className="text-slate-400 font-normal">
                          ({doc.ReviewsCount || 120} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="space-y-1 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 mb-3 border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.Email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{doc.Phone}</span>
                    </div>
                  </div>

                  {/* Schedule & Fee */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.AvailableDays || "Mon - Sat"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.AvailableTime || "9am - 5pm"}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-0.5 font-bold text-slate-900 text-xs">
                    <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
                    <span>{doc.ConsultationFee || 500}</span>
                    <span className="text-[10px] text-slate-400 font-normal">/visit</span>
                  </div>

                  <button
                    onClick={() => setSelectedDoctor(doc)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-blue-600 transition"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>View Profile</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Footer */}
      {pagination && pagination.Pages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 rounded-2xl shadow-xs">
          <span className="text-xs text-slate-500">
            Page {pagination.Page} of {pagination.Pages} ({pagination.Total} total doctors)
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isFetching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.Pages, p + 1))}
              disabled={page >= pagination.Pages || isFetching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Doctor Details Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Doctor Profile Details
              </h3>
              <button
                onClick={() => setSelectedDoctor(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                {selectedDoctor.ProfileImage ? (
                  <img
                    src={getAdminImageUrl(selectedDoctor.ProfileImage)}
                    alt={selectedDoctor.Name}
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-blue-500/20"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 font-bold text-xl">
                    {selectedDoctor.Name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {selectedDoctor.Name}
                  </h4>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {selectedDoctor.Specialization || "General Medicine"}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        selectedDoctor.IsOnline
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          selectedDoctor.IsOnline
                            ? "bg-emerald-500"
                            : "bg-slate-400"
                        }`}
                      />
                      {selectedDoctor.IsOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs border border-slate-100">
                <div>
                  <span className="text-slate-400">Email:</span>
                  <p className="font-semibold text-slate-800 truncate">
                    {selectedDoctor.Email}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Phone:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedDoctor.Phone}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Experience:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedDoctor.Experience || "Not specified"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Consultation Fee:</span>
                  <p className="font-semibold text-slate-800">
                    ₹{selectedDoctor.ConsultationFee || 500}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Available Days:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedDoctor.AvailableDays || "Mon - Sat"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Hours:</span>
                  <p className="font-semibold text-slate-800">
                    {selectedDoctor.AvailableTime || "9:00 AM - 5:00 PM"}
                  </p>
                </div>
              </div>

              {selectedDoctor.About && (
                <div>
                  <span className="text-xs font-semibold text-slate-700">
                    About Doctor:
                  </span>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {selectedDoctor.About}
                  </p>
                </div>
              )}

              <div className="mt-6 flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
