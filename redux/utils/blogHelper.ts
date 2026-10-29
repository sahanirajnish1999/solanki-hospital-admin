import type { IBlog } from "../types/blog.types";

export function extractHighlights(blog?: IBlog | null): string[] {
  if (!blog) return [];

  const raw =
    blog.KeyClinicalHighlights ??
    (blog as unknown as Record<string, unknown>).keyClinicalHighlights ??
    (blog as unknown as Record<string, unknown>).clinicalHighlights ??
    (blog as unknown as Record<string, unknown>).highlights;

  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return trimmed
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }

  return [];
}
