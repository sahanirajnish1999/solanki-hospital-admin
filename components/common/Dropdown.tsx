"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  sublabel?: string;
  badge?: string;
  badgeColor?: string; // e.g. "bg-teal-100 text-teal-800"
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  clearable?: boolean;
  className?: string;
  triggerClassName?: string;
  dropdownClassName?: string;
  error?: string;
  leadingIcon?: React.ReactNode;
  variant?: "default" | "ghost";
  placement?: "bottom" | "top" | "auto";
  showBadgeInTrigger?: boolean;
  labelClassName?: string;
}

export default function Dropdown({
  options,
  value,
  onChange,
  label,
  placeholder = "Select an option...",
  searchable = false,
  disabled = false,
  required = false,
  clearable = false,
  className = "",
  triggerClassName = "",
  dropdownClassName = "",
  labelClassName = "",
  error,
  leadingIcon,
  variant = "default",
  placement = "auto",
  showBadgeInTrigger = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverPlacement, setPopoverPlacement] = useState<"bottom" | "top">(
    placement === "top" ? "top" : "bottom"
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeDropdown = () => {
    setIsOpen(false);
    setSearchQuery("");
  };

  // Auto-detect space below / above
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const animId = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      if (placement === "top") {
        setPopoverPlacement("top");
        return;
      }
      if (placement === "bottom") {
        setPopoverPlacement("bottom");
        return;
      }
      const rect = containerRef.current.getBoundingClientRect();

      // Find nearest scrollable or clipping parent if any
      let parentBottom = window.innerHeight;
      let el: HTMLElement | null = containerRef.current.parentElement;
      while (el && el !== document.body) {
        const style = window.getComputedStyle(el);
        if (
          style.overflowY === "auto" ||
          style.overflowY === "scroll" ||
          style.overflowY === "hidden"
        ) {
          const parentRect = el.getBoundingClientRect();
          parentBottom = Math.min(parentBottom, parentRect.bottom);
          break;
        }
        el = el.parentElement;
      }

      const spaceBelow = Math.min(
        window.innerHeight - rect.bottom,
        parentBottom - rect.bottom
      );
      const spaceAbove = rect.top;

      if (spaceBelow < 250 && spaceAbove > 180) {
        setPopoverPlacement("top");
      } else {
        setPopoverPlacement("bottom");
      }
    });
    return () => cancelAnimationFrame(animId);
  }, [isOpen, placement]);

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable]);

  // Find currently selected option object
  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Filter options based on query
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(q)) ||
        (opt.badge && opt.badge.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const handleSelect = (opt: DropdownOption) => {
    if (opt.disabled) return;
    onChange(opt.value);
    closeDropdown();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    closeDropdown();
  };

  return (
    <div ref={containerRef} className={`relative ${isOpen ? "z-50" : "z-10"} ${className}`}>
      {/* Label */}
      {label && (
        <label className={`block text-[12px] font-semibold text-slate-700 mb-1 ${labelClassName}`}>
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full text-left flex items-center justify-between transition-all cursor-pointer ${
          variant === "ghost"
            ? `px-3 py-1.5 rounded-full ${
                disabled
                  ? "text-slate-400 cursor-not-allowed opacity-60"
                  : isOpen
                  ? "bg-slate-100/90 text-slate-900"
                  : "hover:bg-slate-50 text-slate-800"
              }`
            : `px-3 py-2 rounded-xl border ${
                disabled
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                  : error
                  ? "bg-white border-[#c62828] ring-1 ring-[#c62828]"
                  : isOpen
                  ? "bg-white border-[#008ba3] ring-3 ring-[#008ba3]/10 shadow-xs"
                  : "bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
              }`
        } ${triggerClassName}`}
      >
        <div className="flex items-center gap-2 overflow-hidden flex-1 mr-2">
          {leadingIcon && (
            <span className="text-[#008ba3] shrink-0">{leadingIcon}</span>
          )}

          {selectedOption ? (
            <div className="flex items-center gap-2 truncate">
              {selectedOption.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}
              <span className="text-xs sm:text-[13px] font-medium text-slate-800 truncate">
                {selectedOption.label}
              </span>
              {showBadgeInTrigger && selectedOption.badge && (
                <span
                  className={`text-[12px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                    selectedOption.badgeColor || "bg-cyan-50 text-[#008ba3] border border-cyan-200"
                  }`}
                >
                  {selectedOption.badge}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[13px] text-slate-400 truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {clearable && selectedOption && !disabled && (
            <span
              onClick={handleClear}
              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}

          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#008ba3]" : ""
            }`}
          />
        </div>
      </button>

      {/* Error message */}
      {error && <p className="text-[12px] text-[#c62828] mt-1">{error}</p>}

      {/* Floating Options Panel */}
      {isOpen && (
        <div className={`absolute ${popoverPlacement === "top" ? "bottom-full mb-2" : "top-full mt-2"} left-0 right-0 z-[100] bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${dropdownClassName}`}>
          {/* Search Bar */}
          {searchable && (
            <div className="p-2 border-b border-slate-100 bg-slate-50/70 flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (filteredOptions.length > 0) {
                      handleSelect(filteredOptions[0]);
                    }
                  }
                }}
                placeholder="Search..."
                className="w-full bg-transparent text-[12px] text-slate-900 placeholder-slate-400 outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={opt.disabled}
                    onClick={() => handleSelect(opt)}
                    className={`w-full px-3 py-2 rounded-lg text-left text-[13px] flex items-center justify-between transition-colors cursor-pointer ${
                      opt.disabled
                        ? "text-slate-300 cursor-not-allowed bg-transparent"
                        : isSelected
                        ? "bg-cyan-50 text-[#008ba3] font-bold"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden flex-1 mr-2">
                      {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                      <div className="truncate">
                        <div className="truncate">{opt.label}</div>
                        {opt.sublabel && (
                          <div className="text-[12px] text-slate-500 font-normal truncate mt-0.5">
                            {opt.sublabel}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span
                          className={`text-[12px] font-bold px-1.5 py-0.5 rounded ${
                            opt.badgeColor || "bg-cyan-50 text-[#008ba3] border border-cyan-200"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="w-4 h-4 text-[#008ba3] shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-[12px] text-slate-400">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
