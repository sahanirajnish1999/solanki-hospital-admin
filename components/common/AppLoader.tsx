"use client";

import React from "react";
import { Hospital, ShieldCheck } from "lucide-react";

interface AppLoaderProps {
  message?: string;
}

export default function AppLoader({
  message = "Verifying secure session...",
}: AppLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 transition-colors duration-200">
      {/* Centered Brand Card */}
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        {/* Animated Hospital Emblem */}
        <div className="relative mb-6">
          {/* Subtle Outer Glow Rings */}
          <div className="absolute -inset-2.5 rounded-3xl bg-blue-500/10 animate-pulse" />
          <div className="absolute -inset-1 rounded-2xl bg-blue-600/20" />

          {/* Icon Box */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/25">
            <Hospital className="h-8 w-8 animate-pulse" />
          </div>

          {/* Verified Security Tag */}
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Hospital Branding */}
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
          Solanki Hospital
        </h2>
        <p className="mt-1 text-xs font-medium text-slate-500">
          Admin &amp; Medical Operations Console
        </p>

        {/* Indeterminate Animated Progress Bar */}
        <div className="mt-7 w-48 overflow-hidden rounded-full bg-slate-200/90 h-1.5 relative">
          <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-blue-600 to-indigo-600 w-1/2 rounded-full animate-[shimmer_1.4s_infinite_linear]" />
        </div>

        {/* Dynamic Status Text */}
        <div className="mt-3 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-600 animate-ping" />
          <span className="text-xs font-semibold text-slate-600">
            {message}
          </span>
        </div>

        {/* Security Footer Note */}
        <div className="mt-8 text-[11px] text-slate-400">
          Protected by Solanki Hospital Clinical Security
        </div>
      </div>
    </div>
  );
}
