import React from "react";
import type { IAdmin } from "../types/admin.types";
import {
  LayoutDashboard,
  Activity,
  Stethoscope,
  CalendarCheck,
  BookOpen,
  Users,
} from "lucide-react";

export interface PermissionConfig {
  id: string;
  label: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  activeBorder: string;
  activeGlow: string;
}

export const PERMISSION_CONFIG: Record<string, PermissionConfig> = {
  dashboard: {
    id: "dashboard",
    label: "Dashboard",
    sub: "Overview metrics & analytics",
    icon: LayoutDashboard,
    accentColor: "text-blue-500",
    badgeBg: "bg-blue-50 dark:bg-blue-950/40",
    badgeText: "text-blue-700 dark:text-blue-300",
    activeBorder: "border-blue-500",
    activeGlow: "shadow-blue-500/10",
  },
  specializations: {
    id: "specializations",
    label: "Specializations",
    sub: "Clinical specialties & catalog",
    icon: Activity,
    accentColor: "text-teal-500",
    badgeBg: "bg-teal-50 dark:bg-teal-950/40",
    badgeText: "text-teal-700 dark:text-teal-300",
    activeBorder: "border-teal-500",
    activeGlow: "shadow-teal-500/10",
  },
  doctors: {
    id: "doctors",
    label: "Doctors Directory",
    sub: "Staff registration & verification",
    icon: Stethoscope,
    accentColor: "text-indigo-500",
    badgeBg: "bg-indigo-50 dark:bg-indigo-950/40",
    badgeText: "text-indigo-700 dark:text-indigo-300",
    activeBorder: "border-indigo-500",
    activeGlow: "shadow-indigo-500/10",
  },
  appointments: {
    id: "appointments",
    label: "Appointments",
    sub: "Patient bookings & schedules",
    icon: CalendarCheck,
    accentColor: "text-emerald-500",
    badgeBg: "bg-emerald-50 dark:bg-emerald-950/40",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    activeBorder: "border-emerald-500",
    activeGlow: "shadow-emerald-500/10",
  },
  blogs: {
    id: "blogs",
    label: "Medical Blogs",
    sub: "Articles, clinical guidance & updates",
    icon: BookOpen,
    accentColor: "text-amber-500",
    badgeBg: "bg-amber-50 dark:bg-amber-950/40",
    badgeText: "text-amber-700 dark:text-amber-300",
    activeBorder: "border-amber-500",
    activeGlow: "shadow-amber-500/10",
  },
  admins: {
    id: "admins",
    label: "Staff Directory",
    sub: "Hospital personnel list (read-only for staff)",
    icon: Users,
    accentColor: "text-purple-500",
    badgeBg: "bg-purple-50 dark:bg-purple-950/40",
    badgeText: "text-purple-700 dark:text-purple-300",
    activeBorder: "border-purple-500",
    activeGlow: "shadow-purple-500/10",
  },
};

export const ALL_PERMISSIONS = Object.keys(PERMISSION_CONFIG);

export const DEFAULT_ADMIN_PERMISSIONS = [
  "dashboard",
  "doctors",
  "appointments",
];

export function isSuperAdmin(admin?: IAdmin | null): boolean {
  if (!admin) return false;
  return admin.Role === "superadmin";
}

export function hasPermission(
  admin?: IAdmin | null,
  permissionId?: string
): boolean {
  if (!admin) return false;
  if (isSuperAdmin(admin)) return true;

  if (!permissionId) return true;

  const userPerms = (admin.Permissions || []).map((p) =>
    String(p).trim().toLowerCase()
  );

  if (userPerms.includes("*") || userPerms.includes("all")) {
    return true;
  }

  return userPerms.includes(permissionId.toLowerCase());
}

