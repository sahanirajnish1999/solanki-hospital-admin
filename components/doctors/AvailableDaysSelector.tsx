"use client";

import React, { useMemo } from "react";
import { Calendar } from "lucide-react";
import Dropdown, { DropdownOption } from "@/components/common/Dropdown";

export interface AvailableDaysSelectorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  helperText?: string;
}

interface DayItem {
  key: string;
  label: string;
  full: string;
}

const WEEK_DAYS: DayItem[] = [
  { key: "Mon", label: "Mon", full: "Monday" },
  { key: "Tue", label: "Tue", full: "Tuesday" },
  { key: "Wed", label: "Wed", full: "Wednesday" },
  { key: "Thu", label: "Thu", full: "Thursday" },
  { key: "Fri", label: "Fri", full: "Friday" },
  { key: "Sat", label: "Sat", full: "Saturday" },
  { key: "Sun", label: "Sun", full: "Sunday" },
];

const DAY_PRESET_OPTIONS: DropdownOption[] = [
  {
    value: "Mon - Sat",
    label: "Mon - Sat",
    sublabel: "Mon to Sat (6 Days)",
    badge: "Common",
    badgeColor: "bg-teal-50 text-[#008ba3] border border-teal-200",
  },
  {
    value: "Mon - Fri",
    label: "Mon - Fri",
    sublabel: "Mon to Fri (Weekdays)",
  },
  {
    value: "All Days",
    label: "All Days",
    sublabel: "Mon to Sun (Everyday / 24x7)",
  },
  {
    value: "Mon, Wed, Fri",
    label: "Mon, Wed, Fri",
    sublabel: "Alternate Days (MWF)",
  },
  {
    value: "Tue, Thu, Sat",
    label: "Tue, Thu, Sat",
    sublabel: "Alternate Days (TTS)",
  },
  {
    value: "Sat - Sun",
    label: "Sat - Sun",
    sublabel: "Weekends Only",
  },
  {
    value: "custom",
    label: "Custom...",
    sublabel: "Toggle days or type custom",
  },
];

/**
 * Extracts list of active day keys (e.g. ['Mon', 'Tue', ...]) from a string.
 */
function parseDaysFromString(str: string): string[] {
  if (!str) return [];
  const clean = str.trim().toLowerCase();

  // All days / 24/7 / Daily check
  if (
    clean.includes("all day") ||
    clean.includes("everyday") ||
    clean.includes("daily") ||
    clean.includes("24/7") ||
    clean.includes("7 days")
  ) {
    return WEEK_DAYS.map((d) => d.key);
  }

  // Range match e.g. "Mon - Fri", "Mon to Sat"
  const rangeMatch = clean.match(
    /(mon|tue|wed|thu|fri|sat|sun)[a-z]*\s*(?:-|–|—|to)\s*(mon|tue|wed|thu|fri|sat|sun)[a-z]*/i,
  );
  if (rangeMatch) {
    const dayKeys = WEEK_DAYS.map((d) => d.key);
    const startKey = rangeMatch[1].slice(0, 3).toLowerCase();
    const endKey = rangeMatch[2].slice(0, 3).toLowerCase();
    const startIdx = dayKeys.findIndex((d) => d.toLowerCase() === startKey);
    const endIdx = dayKeys.findIndex((d) => d.toLowerCase() === endKey);

    if (startIdx !== -1 && endIdx !== -1) {
      if (startIdx <= endIdx) {
        return dayKeys.slice(startIdx, endIdx + 1);
      } else {
        return [...dayKeys.slice(startIdx), ...dayKeys.slice(0, endIdx + 1)];
      }
    }
  }

  // Token-based matching e.g. "Mon, Wed, Fri"
  const tokens = clean.split(/[,/ &+]+/);
  const matched: string[] = [];
  const dayKeys = WEEK_DAYS.map((d) => d.key);

  for (const token of tokens) {
    const trimmed = token.trim();
    if (!trimmed) continue;
    const short = trimmed.slice(0, 3).toLowerCase();
    const found = dayKeys.find((d) => d.toLowerCase() === short);
    if (found && !matched.includes(found)) {
      matched.push(found);
    }
  }
  return matched;
}

/**
 * Produces a human-friendly string from selected days.
 */
function formatDaysFromSelection(selectedDays: string[]): string {
  if (selectedDays.length === 0) return "";
  if (selectedDays.length === 7) return "All Days";

  const dayKeys = WEEK_DAYS.map((d) => d.key);
  const sorted = [...selectedDays].sort(
    (a, b) => dayKeys.indexOf(a) - dayKeys.indexOf(b),
  );

  // Exact known sets
  if (sorted.length === 6 && !sorted.includes("Sun")) {
    return "Mon - Sat";
  }
  if (sorted.length === 5 && sorted.join(",") === "Mon,Tue,Wed,Thu,Fri") {
    return "Mon - Fri";
  }
  if (sorted.length === 2 && sorted.join(",") === "Sat,Sun") {
    return "Sat - Sun";
  }
  if (sorted.length === 3 && sorted.join(",") === "Mon,Wed,Fri") {
    return "Mon, Wed, Fri";
  }
  if (sorted.length === 3 && sorted.join(",") === "Tue,Thu,Sat") {
    return "Tue, Thu, Sat";
  }

  // Contiguous range >= 3 days (e.g. Mon - Thu)
  const indices = sorted.map((d) => dayKeys.indexOf(d));
  let isContiguous = true;
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) {
      isContiguous = false;
      break;
    }
  }
  if (isContiguous && sorted.length >= 3) {
    return `${sorted[0]} - ${sorted[sorted.length - 1]}`;
  }

  // Disjoint / list of days
  return sorted.join(", ");
}

export default function AvailableDaysSelector({
  value,
  onChange,
  label = "Available Days",
  required = false,
  className = "",
  helperText,
}: AvailableDaysSelectorProps) {
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  // Identify which individual days are currently active
  const activeDays = useMemo(() => parseDaysFromString(value), [value]);

  // Identify which preset matches the current value
  const activePreset = useMemo(() => {
    const clean = (value || "").trim().toLowerCase();
    if (!clean) return "custom";

    if (clean === "mon - sat" || clean === "mon-sat") return "Mon - Sat";
    if (clean === "mon - fri" || clean === "mon-fri") return "Mon - Fri";
    if (
      clean === "all days" ||
      clean === "all day" ||
      clean === "mon - sun" ||
      clean === "everyday" ||
      clean === "daily"
    ) {
      return "All Days";
    }
    if (clean === "mon, wed, fri" || clean === "mon,wed,fri" || clean === "mwf") {
      return "Mon, Wed, Fri";
    }
    if (clean === "tue, thu, sat" || clean === "tue,thu,sat" || clean === "tts") {
      return "Tue, Thu, Sat";
    }
    if (clean === "sat - sun" || clean === "sat-sun") return "Sat - Sun";

    return "custom";
  }, [value]);

  // Handle Preset Selection
  const handlePresetSelect = (presetVal: string) => {
    if (presetVal === "custom") {
      return;
    }
    onChange(presetVal);
  };

  // Toggle an individual day pill
  const handleToggleDay = (dayKey: string) => {
    const exists = activeDays.includes(dayKey);
    let newDays: string[];
    if (exists) {
      newDays = activeDays.filter((d) => d !== dayKey);
    } else {
      newDays = [...activeDays, dayKey];
    }
    const formatted = formatDaysFromSelection(newDays);
    onChange(formatted);
  };

  return (
    <div
      className={`space-y-1.5 relative transition-all ${
        isDropdownOpen ? "z-50" : "z-10"
      } ${className}`}
    >
      {/* Label and Custom Dropdown Component */}
      <div className="flex items-center justify-between gap-1.5">
        <label className="block text-xs font-semibold text-slate-700 whitespace-nowrap shrink-0">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        <div className="w-32 sm:w-36 shrink-0">
          <Dropdown
            options={DAY_PRESET_OPTIONS}
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

      {/* 7-Day Interactive Pill Badges */}
      <div className="flex items-center justify-between gap-1 rounded-xl border border-slate-200/70 bg-slate-50/80 p-1">
        {WEEK_DAYS.map((day) => {
          const isSelected = activeDays.includes(day.key);
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => handleToggleDay(day.key)}
              title={`${day.full} - Click to toggle`}
              className={`flex-1 rounded-lg py-1.5 text-center text-[10px] sm:text-[11px] font-semibold transition-all duration-150 cursor-pointer select-none ${
                isSelected
                  ? "bg-[#008ba3] text-white shadow-2xs font-bold scale-[1.02]"
                  : "text-slate-500 hover:bg-slate-200/60 hover:text-slate-800"
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      {/* Editable Input for Exact Custom Needs */}
      <div className="relative flex items-center">
        <Calendar className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g. Mon - Fri or custom"
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
