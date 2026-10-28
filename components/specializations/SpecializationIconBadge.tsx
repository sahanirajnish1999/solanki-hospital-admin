"use client";

import React, { useState } from "react";
import {
  HeartPulse,
  Brain,
  Bone,
  Eye,
  Baby,
  Stethoscope,
  Sparkles,
  Smile,
  Syringe,
  Microscope,
} from "lucide-react";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";

interface SpecializationIconBadgeProps {
  name: string;
  icon?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

function renderSpecialtyIcon(specialtyName: string, iconClass: string) {
  const clean = (specialtyName || "").toLowerCase();
  if (clean.includes("card") || clean.includes("heart")) {
    return <HeartPulse className={iconClass} />;
  }
  if (clean.includes("neuro") || clean.includes("brain") || clean.includes("psych")) {
    return <Brain className={iconClass} />;
  }
  if (clean.includes("pediat") || clean.includes("child") || clean.includes("baby")) {
    return <Baby className={iconClass} />;
  }
  if (clean.includes("ortho") || clean.includes("bone") || clean.includes("joint")) {
    return <Bone className={iconClass} />;
  }
  if (clean.includes("eye") || clean.includes("opth") || clean.includes("vision")) {
    return <Eye className={iconClass} />;
  }
  if (clean.includes("dent") || clean.includes("oral")) {
    return <Smile className={iconClass} />;
  }
  if (clean.includes("surg") || clean.includes("operat")) {
    return <Syringe className={iconClass} />;
  }
  if (clean.includes("derma") || clean.includes("skin") || clean.includes("cosmet")) {
    return <Sparkles className={iconClass} />;
  }
  if (clean.includes("patho") || clean.includes("lab") || clean.includes("diagnos")) {
    return <Microscope className={iconClass} />;
  }
  return <Stethoscope className={iconClass} />;
}

export default function SpecializationIconBadge({
  name = "Medical",
  icon,
  size = "md",
  className = "",
}: SpecializationIconBadgeProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "h-7 w-7 text-xs rounded-lg",
    md: "h-8.5 w-8.5 text-xs rounded-lg",
    lg: "h-10 w-10 text-sm rounded-xl",
    xl: "h-12 w-12 text-base rounded-xl",
  }[size];

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-4.5 w-4.5",
    xl: "h-5 w-5",
  }[size];

  const fullImgUrl = icon ? getAdminImageUrl(icon) : null;

  if (fullImgUrl && !imgError) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden shadow-2xs border border-slate-200 bg-white ${sizeClasses} ${className}`}
      >
        <img
          src={fullImgUrl}
          alt={name}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs ${sizeClasses} ${className}`}
      title={name}
    >
      {renderSpecialtyIcon(name, iconSizes)}
    </div>
  );
}
