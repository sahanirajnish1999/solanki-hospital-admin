export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Returns full URL for an admin profile image or placeholder
 */
export function getAdminImageUrl(path?: string | null): string {
  if (!path) {
    return "";
  }

  // If already full URL (http, https, data:image)
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  // Handle path starting with /uploads or uploads
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
