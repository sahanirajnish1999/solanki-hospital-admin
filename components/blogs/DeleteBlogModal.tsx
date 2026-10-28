"use client";

import React, { useEffect } from "react";
import type { IBlog } from "@/redux/types/blog.types";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface DeleteBlogModalProps {
  isOpen: boolean;
  blog: IBlog | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isDeleting: boolean;
}

export default function DeleteBlogModal({
  isOpen,
  blog,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteBlogModalProps) {
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

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95"
      >
        <div className="h-1 w-full bg-rose-500" />

        <div className="p-5">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60 shadow-2xs">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Delete Blog Article?
              </h3>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-slate-800">
                  &quot;{blog.Title}&quot;
                </span>
                ? This action cannot be undone and will permanently remove this
                article from the hospital database.
              </p>

              <div className="mt-2.5 rounded-lg bg-slate-50 px-2.5 py-1.5 border border-slate-200/80 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700">Category: </span>
                <span>{blog.Category}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(blogId)}
              disabled={isDeleting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-rose-700 transition cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete Article</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

