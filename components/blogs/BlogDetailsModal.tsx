"use client";

import React, { useEffect } from "react";
import type { IBlog } from "@/redux/types/blog.types";
import { useGetBlogByIdQuery } from "@/redux/api/blogApi";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import { extractHighlights } from "@/redux/utils/blogHelper";
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

  const rawBlogId = blog?._id || blog?.Id;
  const { data: singleBlogResponse, isLoading: isLoadingFullBlog } = useGetBlogByIdQuery(rawBlogId || "", {
    skip: !isOpen || !rawBlogId,
  });

  if (!isOpen || !blog) return null;

  const activeBlog = singleBlogResponse?.Data || blog;
  const blogId = (activeBlog._id || activeBlog.Id || rawBlogId)!;
  const highlights = extractHighlights(activeBlog);

  const authorName =
    typeof activeBlog.CreatedBy === "object" && activeBlog.CreatedBy !== null
      ? activeBlog.CreatedBy.Name || "Author"
      : typeof activeBlog.CreatedBy === "string" && activeBlog.CreatedBy
      ? activeBlog.CreatedBy
      : "Medical Staff";

  const formattedDate = activeBlog.PublishedDate
    ? new Date(activeBlog.PublishedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : activeBlog.createdAt
    ? new Date(activeBlog.createdAt).toLocaleDateString("en-US", {
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
        className="w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95 dark:border-slate-800 dark:bg-[#121215]"
      >
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-[#008ba3] to-cyan-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 shrink-0 bg-slate-50/50 dark:border-slate-800 dark:bg-[#161619]">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                activeBlog.IsPublished
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/50 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/50 dark:text-amber-300"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  activeBlog.IsPublished ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {activeBlog.IsPublished ? "Published" : "Draft / Unpublished"}
            </span>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
              {activeBlog.Category}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(activeBlog)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Edit2 className="h-3 w-3 text-slate-500 dark:text-slate-400" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Featured Image */}
          {activeBlog.FeaturedImage && (
            <div className="relative rounded-xl overflow-hidden border border-slate-200/90 shadow-2xs bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
              <img
                src={getAdminImageUrl(activeBlog.FeaturedImage)}
                alt={activeBlog.Title}
                className="w-full max-h-64 object-cover"
              />
            </div>
          )}

          {/* Title */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-snug">
              {activeBlog.Title}
            </h2>

            {/* Metadata Bar */}
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">{authorName}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>{formattedDate}</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <div className="flex items-center gap-1">
                <Tag className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-teal-700 dark:text-teal-400 font-medium">{activeBlog.Category}</span>
              </div>
            </div>
          </div>

          {/* Key Clinical Highlights */}
          {highlights.length > 0 ? (
            <div className="rounded-xl border border-teal-200/70 bg-teal-50/40 p-4 dark:border-teal-900/40 dark:bg-teal-950/20">
              <div className="flex items-center gap-2 mb-2.5">
                <Sparkles className="h-4 w-4 text-[#008ba3]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#008ba3]">
                  Key Clinical Highlights
                </h4>
              </div>
              <ul className="space-y-2">
                {highlights.map((highlight, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed"
                  >
                    <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : isLoadingFullBlog ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 flex items-center gap-2.5 text-xs text-slate-400 animate-pulse dark:border-slate-800 dark:bg-slate-900/40">
              <Sparkles className="h-4 w-4 text-teal-500 animate-spin" />
              <span>Loading complete clinical highlights...</span>
            </div>
          ) : null}

          {/* Main Article Content */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-[#161619]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Clinical Summary &amp; Patient Guidance
            </h4>
            <div className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {activeBlog.Content}
            </div>
          </div>

          {/* Consultation Note */}
          {activeBlog.ConsultationNote && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 flex items-start gap-3 dark:border-blue-900/40 dark:bg-blue-950/20">
              <Building className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                  OPD &amp; Clinical Consultation Note
                </div>
                <p className="mt-0.5 text-xs text-blue-800 dark:text-blue-300 font-medium">
                  {activeBlog.ConsultationNote}
                </p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
            <span>
              {activeBlog.createdAt
                ? `Created on ${new Date(activeBlog.createdAt).toLocaleString()}`
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
