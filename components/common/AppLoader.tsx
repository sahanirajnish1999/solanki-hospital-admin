"use client";

import React from "react";

interface AppLoaderProps {
  message?: string;
}

export default function AppLoader({
  message = "Verifying secure session...",
}: AppLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-slate-50/90 backdrop-blur-xs transition-colors duration-200">
      <div className="flex flex-col items-center justify-center gap-4">
        {/* Round / Circle Spinner */}
        <div className="relative flex items-center justify-center h-16 w-16">
          {/* Subtle outer circular ping effect */}
          <div className="absolute inset-0 rounded-full bg-[#008ba3]/15 animate-ping opacity-50" />

          {/* Circular background track */}
          <div className="h-12 w-12 rounded-full border-[3px] border-slate-200/80" />

          {/* Circular rotating arc */}
          <div className="absolute h-12 w-12 rounded-full border-[3px] border-transparent border-t-[#008ba3] border-r-[#008ba3] animate-spin" />

          {/* Inner accent circle */}
          <div
            className="absolute h-5 w-5 rounded-full border-2 border-dashed border-[#008ba3]/40 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "3s" }}
          />

          {/* Center core pulse dot */}
          <div className="h-2 w-2 rounded-full bg-[#008ba3] animate-pulse" />
        </div>

        {message && (
          <p className="text-[13px] font-semibold text-slate-600 tracking-wide">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

