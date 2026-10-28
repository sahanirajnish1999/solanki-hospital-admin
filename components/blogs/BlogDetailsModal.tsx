"use client";

import React, { useEffect } from "react";
import type { IBlog } from "@/redux/types/blog.types";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import {
  X,
  Calendar,
  User,
  CheckCircle2,
  Sparkles,
  Building,
  Edit2,
  Tag,
  Eye,
} from "lucide-react";

interface BlogDetailsModalProps {
  blog: IBlog | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (blog: IBlog) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  isToggling?: boolean;
}

export default function BlogDetailsModal({
  blog,
  isOpen,
  onClose,
  onEdit,
  onToggleStatus,
  isToggling = false,
}: BlogDetailsModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !blog) return null;

  const blogId = (blog._id || blog.Id)!;

  const authorName =
    typeof blog.CreatedBy === "object" && blog.CreatedBy !== null
      ? blog.CreatedBy.Name || "Dr. Solanki"
      : typeof blog.CreatedBy === "string"
      ? "Dr. Solanki"
      : "Solanki Medical Staff";

  const formattedDate = blog.PublishedDate
    ? new Date(blog.PublishedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : blog.createdAt
    ? new Date(blog.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently Published";

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95"
      >
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-[#008ba3] to-cyan-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                blog.IsPublished
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  blog.IsPublished ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {blog.IsPublished ? "Published" : "Draft / Unpublished"}
            </span>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 border border-slate-200">
              {blog.Category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(blog)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              <Edit2 className="h-3 w-3 text-slate-500" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Featured Image */}
          {blog.FeaturedImage && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100">
              <img
                src={getAdminImageUrl(blog.FeaturedImage)}
                alt={blog.Title}
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-snug">
              {blog.Title}
            </h2>

            {/* Metadata Bar */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium text-slate-700">{authorName}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formattedDate}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-teal-700 font-medium">{blog.Category}</span>
              </div>
            </div>
          </div>

          {/* Key Clinical Highlights */}
          {Array.isArray(blog.KeyClinicalHighlights) &&
            blog.KeyClinicalHighlights.length > 0 && (
              <div className="rounded-xl border border-teal-200/70 bg-teal-50/40 p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Sparkles className="h-4 w-4 text-[#008ba3]" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#008ba3]">
                    Key Clinical Highlights
                  </h4>
                </div>
                <ul className="space-y-2">
                  {blog.KeyClinicalHighlights.map((highlight, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed"
                    >
                      <CheckCircle2 className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {/* Main Article Content */}
          <div className="rounded-xl border border-slate-100 bg-white p-4">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Clinical Summary &amp; Patient Guidance
            </h4>
            <div className="text-xs sm:text-[13px] text-slate-700 leading-relaxed whitespace-pre-wrap">
              {blog.Content}
            </div>
          </div>

          {/* Consultation Note */}
          {blog.ConsultationNote && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 flex items-start gap-3">
              <Building className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                  OPD &amp; Clinical Consultation Note
                </div>
                <p className="mt-0.5 text-xs text-blue-800 font-medium">
                  {blog.ConsultationNote}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
            <span>
              {blog.createdAt
                ? `Created on ${new Date(blog.createdAt).toLocaleString()}`
                : ""}
            </span>
            <span>ID: {blogId}</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => onToggleStatus(blogId, blog.IsPublished)}
            disabled={isToggling}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50 ${
              blog.IsPublished
                ? "border-slate-200 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>
              {blog.IsPublished ? "Unpublish (Move to Draft)" : "Publish to Public"}
            </span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
