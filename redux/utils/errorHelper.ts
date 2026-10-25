export function getErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred."
): string {
  if (err && typeof err === "object") {
    const errorObj = err as Record<string, unknown>;
    if (errorObj.data && typeof errorObj.data === "object") {
      const data = errorObj.data as Record<string, unknown>;
      if (typeof data.Message === "string") return data.Message;
      if (typeof data.message === "string") return data.message;
    }
    if (typeof errorObj.message === "string") return errorObj.message;
  }
  return fallback;
}
