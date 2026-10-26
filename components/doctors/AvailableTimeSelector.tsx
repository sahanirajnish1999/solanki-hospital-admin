"use client";

import React, { useMemo } from "react";
import { Clock } from "lucide-react";
import Dropdown, { DropdownOption } from "@/components/common/Dropdown";

export interface AvailableTimeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  helperText?: string;
}

interface TimeShift {
  key: string;
  label: string;
  time: string;
}

const TIME_SHIFTS: TimeShift[] = [
  { key: "morning", label: "Morning", time: "9:00 AM - 1:00 PM" },
  { key: "day", label: "General", time: "10:00 AM - 6:00 PM" },
  { key: "evening", label: "Evening", time: "5:00 PM - 9:00 PM" },
  { key: "fullday", label: "Full Day", time: "9:00 AM - 5:00 PM" },
];

const TIME_PRESET_OPTIONS: DropdownOption[] = [
  {
    value: "9:00 AM - 5:00 PM",
    label: "9:00 AM - 5:00 PM",
    sublabel: "Full Day OPD (8 Hours)",
    badge: "Full Day",
    badgeColor: "bg-cyan-50 text-[#008ba3] border border-cyan-200",
  },
  {
    value: "9:00 AM - 1:00 PM",
    label: "9:00 AM - 1:00 PM",
    sublabel: "Morning Shift (4 Hours)",
    badge: "Morning",
    badgeColor: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  {
    value: "10:00 AM - 2:00 PM",
    label: "10:00 AM - 2:00 PM",
    sublabel: "Midday Clinic (4 Hours)",
  },
  {
    value: "10:00 AM - 6:00 PM",
    label: "10:00 AM - 6:00 PM",
    sublabel: "Regular OPD (8 Hours)",
  },
  {
    value: "4:00 PM - 8:00 PM",
    label: "4:00 PM - 8:00 PM",
    sublabel: "Evening Clinic (4 Hours)",
    badge: "Evening",
    badgeColor: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  },
  {
    value: "5:00 PM - 9:00 PM",
    label: "5:00 PM - 9:00 PM",
    sublabel: "Late Evening OPD (4 Hours)",
  },
  {
    value: "custom",
    label: "Custom Hours",
    sublabel: "Type exact custom hours",
  },
];

/**
 * Normalizes a time string for lenient comparison (e.g. "09:00 AM" vs "9:00 AM").
 */
function normalizeTime(str: string): string {
  return str
    .toLowerCase()
    .replace(/^0(\d)/, "$1")
    .replace(/ - 0(\d)/, " - $1")
    .replace(/\s+/g, " ")
    .trim();
}

export default function AvailableTimeSelector({
  value,
  onChange,
  label = "Available Time",
  required = false,
  className = "",
  helperText,
}: AvailableTimeSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const normalizedCurrent = useMemo(() => normalizeTime(value || ""), [value]);

  // Determine active preset
  const activePreset = useMemo(() => {
    if (!normalizedCurrent) return "custom";
    for (const preset of TIME_PRESET_OPTIONS) {
      if (preset.value === "custom") continue;
      if (normalizeTime(preset.value) === normalizedCurrent) {
        return preset.value;
      }
    }
    return "custom";
  }, [normalizedCurrent]);

  // Determine active shift pill
  const activeShiftKey = useMemo(() => {
    if (!normalizedCurrent) return null;
    const match = TIME_SHIFTS.find(
      (s) => normalizeTime(s.time) === normalizedCurrent,
    );
    return match ? match.key : null;
  }, [normalizedCurrent]);

  const handlePresetSelect = (presetVal: string) => {
    if (presetVal === "custom") return;
    onChange(presetVal);
  };

  const handleShiftSelect = (shift: TimeShift) => {
    onChange(shift.time);
  };

  return (
    <div
      className={`space-y-1.5 relative transition-all ${
        isDropdownOpen ? "z-50" : "z-10"
      } ${className}`}
    >
      {/* Label and Custom Dropdown Component */}
      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-semibold text-slate-700 truncate">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="w-40 sm:w-44 shrink-0">
          <Dropdown
            options={TIME_PRESET_OPTIONS}
            value={activePreset}
            onChange={handlePresetSelect}
            onOpenChange={setIsDropdownOpen}
            triggerClassName="!py-1 !px-2.5 !rounded-lg text-[11px] font-semibold bg-slate-50/90 border-slate-200"
            dropdownClassName="w-64 !left-auto right-0 text-xs shadow-2xl border-slate-200"
            placeholder="Preset..."
            placement="auto"
          />
        </div>
      </div>

      {/* Quick Shift Pills */}
      <div className="flex items-center justify-between gap-1 rounded-xl border border-slate-200/70 bg-slate-50/80 p-1">
        {TIME_SHIFTS.map((shift) => {
          const isSelected = activeShiftKey === shift.key;
          return (
            <button
              key={shift.key}
              type="button"
              onClick={() => handleShiftSelect(shift)}
              title={`${shift.label}: ${shift.time}`}
              className={`flex-1 rounded-lg py-1.5 text-center text-[10px] sm:text-[11px] font-semibold transition-all duration-150 cursor-pointer select-none ${
                isSelected
                  ? "bg-[#008ba3] text-white shadow-2xs font-bold scale-[1.02]"
                  : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-800"
              }`}
            >
              {shift.label}
            </button>
          );
        })}
      </div>

      {/* Editable Input for Exact Custom Time */}
      <div className="relative flex items-center">
        <Clock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. 9:00 AM - 4:00 PM"
          required={required}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-10 pr-3.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-150 focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10"
        />
      </div>

      {helperText && (
        <p className="text-[11px] text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
