"use client";

import React, { useState, useEffect, useMemo } from "react";
import Dropdown, { DropdownOption } from "@/components/common/Dropdown";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
} from "@/redux/api/blogApi";
import type { IBlog } from "@/redux/types/blog.types";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import { getErrorMessage } from "@/redux/utils/errorHelper";
import categoriesList from "@/data/blogCategories.json";
import {
  X,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ImageIcon,
  Sparkles,
  BookOpen,
  MapPin,
  Type,
  Tag,
  Check,
  Eye,
} from "lucide-react";

interface CreateEditBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogToEdit?: IBlog | null;
  onSuccess?: (message: string) => void;
}

export default function CreateEditBlogModal({
  isOpen,
  onClose,
  blogToEdit,
  onSuccess,
}: CreateEditBlogModalProps) {
  const isEditing = Boolean(blogToEdit);

  // Form states initialized directly from blogToEdit (fresh instance per key)
  const [title, setTitle] = useState(blogToEdit?.Title || "");
  const [category, setCategory] = useState(
    blogToEdit?.Category || categoriesList[0] || "SPORTS INJURY"
  );
  const [content, setContent] = useState(blogToEdit?.Content || "");
  const [highlights, setHighlights] = useState<string[]>(
    Array.isArray(blogToEdit?.KeyClinicalHighlights)
      ? [...blogToEdit.KeyClinicalHighlights]
      : []
  );
  const [highlightInput, setHighlightInput] = useState("");
  const [consultationNote, setConsultationNote] = useState(
    blogToEdit?.ConsultationNote || ""
  );
  const [featuredImage, setFeaturedImage] = useState(
    blogToEdit?.FeaturedImage || ""
  );
  const [imagePreview, setImagePreview] = useState(
    blogToEdit?.FeaturedImage ? getAdminImageUrl(blogToEdit.FeaturedImage) : ""
  );
  const [isPublished, setIsPublished] = useState(
    blogToEdit?.IsPublished ?? true
  );

  const [formError, setFormError] = useState<string | null>(null);

  // RTK Query Mutations
  const [createBlog, { isLoading: isCreating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating }] = useUpdateBlogMutation();
  const isSubmitting = isCreating || isUpdating;

  // Category options for dropdown
  const categoryOptions: DropdownOption[] = useMemo(() => {
    return (categoriesList as string[]).map((cat) => ({
      value: cat,
      label: cat,
    }));
  }, []);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Image File Selection -> Base64
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Featured image size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setFeaturedImage(base64);
      setImagePreview(base64);
      setFormError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFeaturedImage("");
    setImagePreview("");
  };

  // Add highlight item
  const handleAddHighlight = () => {
    const trimmed = highlightInput.trim();
    if (!trimmed) return;
    if (highlights.includes(trimmed)) {
      setHighlightInput("");
      return;
    }
    setHighlights((prev) => [...prev, trimmed]);
    setHighlightInput("");
  };

  // Remove highlight item
  const handleRemoveHighlight = (index: number) => {
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim()) {
      setFormError("Blog Title is required.");
      return;
    }

    if (!category.trim()) {
      setFormError("Please select a clinical category.");
      return;
    }

    if (!content.trim()) {
      setFormError("Blog content is required.");
      return;
    }

    try {
      if (isEditing && blogToEdit) {
        const id = (blogToEdit._id || blogToEdit.Id)!;
        const res = await updateBlog({
          id,
          Title: title.trim(),
          Category: category.trim(),
          Content: content.trim(),
          KeyClinicalHighlights: highlights,
          ConsultationNote: consultationNote.trim() || undefined,
          FeaturedImage: featuredImage || undefined,
          IsPublished: isPublished,
        }).unwrap();

        onSuccess?.(res.Message || "Blog article updated successfully.");
        onClose();
      } else {
        const res = await createBlog({
          Title: title.trim(),
          Category: category.trim(),
          Content: content.trim(),
          KeyClinicalHighlights: highlights,
          ConsultationNote: consultationNote.trim() || undefined,
          FeaturedImage: featuredImage || undefined,
          IsPublished: isPublished,
        }).unwrap();

        onSuccess?.(res.Message || "Blog article published successfully.");
        onClose();
      }
    } catch (err: unknown) {
      setFormError(
        getErrorMessage(
          err,
          `Failed to ${isEditing ? "update" : "create"} blog article. Please check all fields.`
        )
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl sm:max-w-3xl max-h-[92vh] flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95"
      >
        {/* Top Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-teal-500 via-[#008ba3] to-cyan-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 bg-slate-50/70 dark:border-slate-800 dark:bg-[#161619]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-teal-100/60 text-[#008ba3] border border-[#008ba3]/20 shadow-2xs dark:from-cyan-950/40 dark:to-teal-950/60 dark:border-[#008ba3]/30">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {isEditing ? "Edit Medical Blog" : "Create New Medical Blog"}
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-0.5 text-[10px] font-semibold text-[#008ba3] border border-cyan-200/60">
                  <Sparkles className="h-2.5 w-2.5" />
                  {isEditing ? "Article Editor" : "New Publication"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Publish clinical insights, sports medicine guides, and patient education
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Error Banner */}
          {formError && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
              <span className="flex-1">{formError}</span>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-[11px] font-semibold underline text-rose-700 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            {/* Title (7 cols) */}
            <div className="sm:col-span-7">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Type className="h-3.5 w-3.5 text-[#008ba3]" />
                <span>Blog Title</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 px-3 text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10"
              />
            </div>

            {/* Category (5 cols) */}
            <div className="sm:col-span-5">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Tag className="h-3.5 w-3.5 text-[#008ba3]" />
                <span>Clinical Category</span>
                <span className="text-rose-500">*</span>
              </label>
              <Dropdown
                options={categoryOptions}
                value={category}
                onChange={(val) => setCategory(val)}
                searchable={true}
                placeholder="Category"
                triggerClassName="!py-2.5 !rounded-xl text-xs sm:text-[13px] border-slate-200 bg-slate-50/60"
                dropdownClassName="w-full max-h-60 text-xs border-slate-200 shadow-xl"
              />
            </div>
          </div>

          {/* Row 2: Banner Image & Meta (Consultation Note + Publish Status) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            {/* Featured Banner Image (6 cols) */}
            <div className="sm:col-span-6">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <ImageIcon className="h-3.5 w-3.5 text-[#008ba3]" />
                <span>Featured Banner Image</span>
                <span className="text-[10px] font-normal text-slate-400">(Optional)</span>
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 group h-32">
                  <img
                    src={imagePreview}
                    alt="Banner preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1 text-[11px] font-medium text-slate-800 shadow cursor-pointer hover:bg-white">
                      <Upload className="h-3 w-3 text-[#008ba3]" />
                      <span>Change</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-medium text-white shadow cursor-pointer hover:bg-rose-700"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 h-32 text-center cursor-pointer hover:border-[#008ba3]/50 hover:bg-cyan-50/20 transition-all group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-400 group-hover:text-[#008ba3] shadow-2xs border border-slate-100 transition-colors">
                    <Upload className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-semibold text-slate-700 group-hover:text-[#008ba3] transition-colors">
                    Upload banner image
                  </div>
                  <span className="text-[10px] text-slate-400">
                    PNG, JPG, WebP under 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Right Meta Column: Consultation Note + Publish Status (6 cols) */}
            <div className="sm:col-span-6 flex flex-col justify-between gap-3">
              {/* Consultation Note */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#008ba3]" />
                  <span>Consultation Note</span>
                </label>
                <input
                  type="text"
                  value={consultationNote}
                  onChange={(e) => setConsultationNote(e.target.value)}
                  placeholder="Consultation note"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 px-3 text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10"
                />
              </div>

              {/* Publication Status Card */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 flex items-center justify-between dark:border-slate-800 dark:bg-[#141418]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isPublished ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-900">
                      {isPublished ? "Publish Live" : "Save as Draft"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {isPublished
                      ? "Visible on patient & OPD portal"
                      : "Hidden from public view"}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#008ba3]"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Row 3: Key Clinical Highlights */}
          <div className="rounded-2xl border border-slate-200/90 bg-slate-50/40 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-teal-600" />
                <span>Key Clinical Highlights</span>
              </label>
              <span className="text-[10px] font-medium text-slate-400">
                {highlights.length} added
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddHighlight();
                  }
                }}
                placeholder="Clinical highlight"
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#008ba3] focus:ring-3 focus:ring-[#008ba3]/10"
              />
              <button
                type="button"
                onClick={handleAddHighlight}
                disabled={!highlightInput.trim()}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800 cursor-pointer disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            {highlights.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {highlights.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50/90 py-1 pl-2.5 pr-1.5 text-xs font-medium text-teal-900 shadow-2xs animate-in zoom-in-95"
                  >
                    <Check className="h-3 w-3 text-teal-600 shrink-0" />
                    <span className="truncate max-w-xs">{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(index)}
                      className="text-teal-500 hover:text-rose-600 p-0.5 rounded-full hover:bg-white/80 cursor-pointer transition shrink-0"
                      title="Remove highlight"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Row 4: Article Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Article Content <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-slate-400">
                {content.length} characters
              </span>
            </div>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Content"
              required
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-xs sm:text-[13px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#008ba3] focus:bg-white focus:ring-3 focus:ring-[#008ba3]/10 resize-y leading-relaxed"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Eye className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {isPublished ? "Will publish live immediately" : "Will save as draft"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>{isEditing ? "Updating..." : "Publishing..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-teal-400" />
                    <span>{isEditing ? "Save Changes" : "Publish Article"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
