"use client";

import React, { useState, useMemo } from "react";
import Dropdown, { DropdownOption } from "@/components/common/Dropdown";
import {
  useGetAllBlogsQuery,
  useDeleteBlogMutation,
  useToggleBlogStatusMutation,
} from "@/redux/api/blogApi";
import type { IBlog } from "@/redux/types/blog.types";
import { getAdminImageUrl } from "@/redux/utils/imageHelper";
import { getErrorMessage } from "@/redux/utils/errorHelper";
import categoriesList from "@/data/blogCategories.json";
import BlogStatsCards from "./BlogStatsCards";
import CreateEditBlogModal from "./CreateEditBlogModal";
import BlogDetailsModal from "./BlogDetailsModal";
import DeleteBlogModal from "./DeleteBlogModal";
import {
  BookOpen,
  Plus,
  Search,
  RotateCw,
  Table as TableIcon,
  LayoutGrid,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
} from "lucide-react";

export default function BlogManager() {
  // Query Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Modals state
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const [blogToEdit, setBlogToEdit] = useState<IBlog | null>(null);

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedBlogForDetails, setSelectedBlogForDetails] =
    useState<IBlog | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<IBlog | null>(null);

  // Feedback notifications
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // RTK Query: fetch blogs
  const isPublishedParam =
    statusFilter === "published"
      ? true
      : statusFilter === "draft"
        ? false
        : undefined;

  const {
    data: blogsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetAllBlogsQuery({
    Search: searchTerm.trim() || undefined,
    Category: categoryFilter !== "all" ? categoryFilter : undefined,
    IsPublished: isPublishedParam,
    Page: page,
    Limit: limit,
  });

  const [deleteBlog, { isLoading: isDeleting }] = useDeleteBlogMutation();
  const [toggleStatus, { isLoading: isToggling }] =
    useToggleBlogStatusMutation();

  const blogs = useMemo(() => blogsResponse?.Data || [], [blogsResponse?.Data]);
  const pagination = blogsResponse?.Pagination;
  const totalBlogs = pagination?.Total ?? blogs.length;
  const totalPages = pagination?.Pages || pagination?.TotalPages || 1;

  // Category options for dropdown filter
  const categoryFilterOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: "all", label: "All Categories (50)" },
      ...(categoriesList as string[]).map((cat) => ({
        value: cat,
        label: cat,
      })),
    ];
  }, []);

  // Status options for dropdown filter
  const statusFilterOptions: DropdownOption[] = useMemo(
    () => [
      { value: "all", label: "All Status" },
      {
        value: "published",
        label: "Published Only",
        badge: "Live",
        badgeColor: "bg-emerald-100 text-emerald-800",
      },
      {
        value: "draft",
        label: "Drafts Only",
        badge: "Draft",
        badgeColor: "bg-amber-100 text-amber-800",
      },
    ],
    [],
  );

  // Calculate local stats from current list / responses
  const stats = useMemo(() => {
    const published = blogs.filter((b) => b.IsPublished).length;
    const drafts = blogs.filter((b) => !b.IsPublished).length;
    const uniqueCategories = new Set(blogs.map((b) => b.Category)).size;
    return {
      total: totalBlogs,
      published,
      drafts,
      categoriesCount: uniqueCategories || (categoriesList as string[]).length,
    };
  }, [blogs, totalBlogs]);

  // Handlers
  const handleOpenCreate = () => {
    setBlogToEdit(null);
    setIsCreateEditOpen(true);
  };

  const handleOpenEdit = (blog: IBlog) => {
    setBlogToEdit(blog);
    setIsCreateEditOpen(true);
  };

  const handleOpenDetails = (blog: IBlog) => {
    setSelectedBlogForDetails(blog);
    setIsDetailsOpen(true);
  };

  const handleOpenDelete = (blog: IBlog) => {
    setBlogToDelete(blog);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async (id: string) => {
    setFeedback(null);
    try {
      const res = await deleteBlog(id).unwrap();
      setFeedback({
        type: "success",
        text: res.Message || "Blog article deleted successfully.",
      });
      setIsDeleteOpen(false);
      setBlogToDelete(null);
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: getErrorMessage(err, "Failed to delete blog article."),
      });
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    setFeedback(null);
    try {
      const res = await toggleStatus({
        id,
        IsPublished: !currentStatus,
      }).unwrap();
      setFeedback({
        type: "success",
        text:
          res.Message ||
          `Article ${!currentStatus ? "published live" : "moved to drafts"}.`,
      });

      // Update selected blog in details modal if open
      if (
        selectedBlogForDetails &&
        (selectedBlogForDetails._id === id || selectedBlogForDetails.Id === id)
      ) {
        setSelectedBlogForDetails({
          ...selectedBlogForDetails,
          IsPublished: !currentStatus,
        });
      }
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        text: getErrorMessage(err, "Failed to update publication status."),
      });
    }
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
          Blogs
        </h2>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 bg-slate-100/80 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`rounded-md p-1.5 transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Table view"
            >
              <TableIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`rounded-md p-1.5 transition cursor-pointer ${
                viewMode === "cards"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-400 hover:text-slate-700"
              }`}
              title="Cards view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs transition hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            title="Refresh blog list"
          >
            <RotateCw
              className={`h-3 w-3 ${
                isFetching ? "animate-spin text-slate-900" : "text-slate-400"
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Blog Article</span>
          </button>
        </div>
      </div>

      {/* 2. KPI Metrics Strip */}
      <BlogStatsCards
        total={stats.total}
        published={stats.published}
        drafts={stats.drafts}
        categoriesCount={stats.categoriesCount}
        currentStatusFilter={statusFilter}
        onFilterChange={(newStatus) => {
          setStatusFilter(newStatus);
          setPage(1);
        }}
      />

      {/* 3. Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between rounded-xl p-3 text-xs animate-in fade-in ${
            feedback.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-[11px] font-semibold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4. Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search blogs..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50/60 py-1.5 pl-8.5 pr-8 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-slate-400 focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="w-full sm:w-60">
          <Dropdown
            options={categoryFilterOptions}
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val || "all");
              setPage(1);
            }}
            searchable={true}
            triggerClassName="!py-1.5 !rounded-lg text-xs border-slate-200 bg-slate-50/60"
            dropdownClassName="w-72 max-h-60 text-xs border-slate-200 shadow-xl"
            placeholder="Category"
          />
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-44">
          <Dropdown
            options={statusFilterOptions}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val || "all");
              setPage(1);
            }}
            triggerClassName="!py-1.5 !rounded-lg text-xs border-slate-200 bg-slate-50/60"
            dropdownClassName="w-44 text-xs border-slate-200"
            placeholder="All Status"
          />
        </div>

        {/* Reset button */}
        {(searchTerm || categoryFilter !== "all" || statusFilter !== "all") && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shrink-0"
            title="Reset filters"
          >
            <RotateCw className="h-3 w-3 text-slate-400" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* 5. Main Content View */}
      {isLoading ? (
        <div className="flex h-52 items-center justify-center rounded-xl border border-slate-200 bg-white p-8">
          <div className="flex flex-col items-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-800 border-t-transparent" />
            <span className="text-xs text-slate-500">
              Loading blog articles...
            </span>
          </div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mb-2">
            <BookOpen className="h-5 w-5" />
          </div>
          <h3 className="text-xs font-semibold text-slate-800">
            No blog articles found
          </h3>
          <p className="mt-1 text-[11px] text-slate-400 max-w-sm">
            {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
              ? "No articles match your search or filter settings. Try adjusting your query or resetting filters."
              : "Get started by publishing your hospital's first medical blog article."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-2xs hover:bg-slate-800 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Write New Article</span>
          </button>
        </div>
      ) : viewMode === "cards" ? (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map((blog) => {
            const blogId = (blog._id || blog.Id)!;
            const authorName =
              typeof blog.CreatedBy === "object" && blog.CreatedBy !== null
                ? blog.CreatedBy.Name || "Dr. Solanki"
                : "Dr. Solanki";

            return (
              <div
                key={blogId}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
              >
                {/* Banner Thumbnail */}
                <div
                  onClick={() => handleOpenDetails(blog)}
                  className="relative h-40 bg-slate-100 cursor-pointer overflow-hidden"
                >
                  {blog.FeaturedImage ? (
                    <img
                      src={getAdminImageUrl(blog.FeaturedImage)}
                      alt={blog.Title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <ImageIcon className="h-8 w-8" />
                      <span className="text-[10px] mt-1">No banner image</span>
                    </div>
                  )}

                  {/* Category Pill Tag */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded-full bg-slate-900/85 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-semibold text-white tracking-wide shadow">
                      {blog.Category}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-xs ${
                        blog.IsPublished
                          ? "bg-emerald-500 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      {blog.IsPublished ? "Live" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => handleOpenDetails(blog)}
                      className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition cursor-pointer line-clamp-1 leading-snug"
                      title={blog.Title}
                    >
                      {blog.Title}
                    </h3>

                    <p
                      className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed"
                      title={blog.Content}
                    >
                      {blog.Content}
                    </p>

                    {/* Highlights Preview */}
                    {Array.isArray(blog.KeyClinicalHighlights) &&
                      blog.KeyClinicalHighlights.length > 0 && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-teal-700 font-medium">
                          <Sparkles className="h-3 w-3 text-teal-600 shrink-0" />
                          <span className="truncate">
                            {blog.KeyClinicalHighlights.length} clinical
                            highlights
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Card Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{authorName}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(blog)}
                        className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition active:scale-95 cursor-pointer"
                        title="View article details"
                      >
                        <Eye className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(blog)}
                        className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Edit article"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(blog)}
                        className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-2xs transition active:scale-95 cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-[#121215]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-medium text-slate-500 select-none dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
                  <th className="py-3 pl-4 pr-3 w-[30%] font-medium">
                    Article &amp; Clinical Overview
                  </th>
                  <th className="py-3 px-3 w-[18%] font-medium">Category</th>
                  <th className="py-3 px-3 w-[14%] font-medium">Highlights</th>
                  <th className="py-3 px-3 w-[12%] font-medium">Author</th>
                  <th className="py-3 px-3 text-center w-[12%] font-medium">
                    Status
                  </th>
                  <th className="py-3 pl-3 pr-4 text-right w-[14%] font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blogs.map((blog) => {
                  const blogId = (blog._id || blog.Id)!;
                  const authorName =
                    typeof blog.CreatedBy === "object" &&
                    blog.CreatedBy !== null
                      ? blog.CreatedBy.Name || "Dr. Solanki"
                      : "Dr. Solanki";

                  return (
                    <tr
                      key={blogId}
                      className="group transition-colors duration-150 hover:bg-slate-50/70"
                    >
                      {/* Title & Preview */}
                      <td className="py-3 pl-4 pr-3 align-middle">
                        <div className="flex items-center gap-3">
                          {blog.FeaturedImage ? (
                            <img
                              src={getAdminImageUrl(blog.FeaturedImage)}
                              alt={blog.Title}
                              className="h-10 w-14 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                            />
                          ) : (
                            <div className="h-10 w-14 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-400 shrink-0">
                              <FileText className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <span
                              onClick={() => handleOpenDetails(blog)}
                              className="font-semibold text-slate-900 text-xs hover:text-teal-700 cursor-pointer transition-colors line-clamp-1"
                              title={blog.Title}
                            >
                              {blog.Title}
                            </span>
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                              {blog.ConsultationNote || blog.Content}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 align-middle">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700 border border-slate-200/70 max-w-[180px] truncate">
                          {blog.Category}
                        </span>
                      </td>

                      {/* Highlights */}
                      <td className="py-3 px-3 align-middle">
                        {Array.isArray(blog.KeyClinicalHighlights) &&
                        blog.KeyClinicalHighlights.length > 0 ? (
                          <span
                            className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-medium text-teal-700 border border-teal-200/60"
                            title={blog.KeyClinicalHighlights.join(" • ")}
                          >
                            <Sparkles className="h-2.5 w-2.5 text-teal-600" />
                            <span>
                              {blog.KeyClinicalHighlights.length} points
                            </span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-300">—</span>
                        )}
                      </td>

                      {/* Author */}
                      <td className="py-3 px-3 align-middle text-[11px] text-slate-600">
                        <div className="flex items-center gap-1 truncate">
                          <User className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate">{authorName}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 align-middle text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleTogglePublish(blogId, blog.IsPublished)
                          }
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium border transition cursor-pointer disabled:opacity-50 ${
                            blog.IsPublished
                              ? "bg-emerald-50/80 text-emerald-700 border-emerald-200/70 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200"
                              : "bg-amber-50/80 text-amber-700 border-amber-200/70 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200"
                          }`}
                          title={`Click to ${blog.IsPublished ? "unpublish" : "publish"}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              blog.IsPublished
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          {blog.IsPublished ? "Published" : "Draft"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-3 pr-4 align-middle text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetails(blog)}
                            className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition active:scale-95 cursor-pointer"
                            title="View article details"
                          >
                            <Eye className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(blog)}
                            className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 shadow-2xs transition active:scale-95 cursor-pointer"
                            title="Edit article"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDelete(blog)}
                            className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 shadow-2xs transition active:scale-95 cursor-pointer"
                            title="Delete article"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-slate-500">
          <div>
            Showing Page{" "}
            <span className="font-semibold text-slate-800">{page}</span> of{" "}
            <span className="font-semibold text-slate-800">{totalPages}</span> (
            {totalBlogs} total articles)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page <= 1 || isFetching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded-lg text-xs font-medium transition cursor-pointer ${
                  page === p
                    ? "bg-slate-900 text-white font-semibold shadow-2xs"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page >= totalPages || isFetching}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 7. Modals */}
      {isCreateEditOpen && (
        <CreateEditBlogModal
          key={blogToEdit?._id || blogToEdit?.Id || "new-blog"}
          isOpen={isCreateEditOpen}
          onClose={() => {
            setIsCreateEditOpen(false);
            setBlogToEdit(null);
          }}
          blogToEdit={blogToEdit}
          onSuccess={(msg) => {
            setFeedback({ type: "success", text: msg });
          }}
        />
      )}

      <BlogDetailsModal
        isOpen={isDetailsOpen}
        blog={selectedBlogForDetails}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedBlogForDetails(null);
        }}
        onEdit={(blog) => {
          setIsDetailsOpen(false);
          handleOpenEdit(blog);
        }}
        onToggleStatus={handleTogglePublish}
        isToggling={isToggling}
      />

      <DeleteBlogModal
        isOpen={isDeleteOpen}
        blog={blogToDelete}
        onClose={() => {
          setIsDeleteOpen(false);
          setBlogToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
}
