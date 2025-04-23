
import { useCallback } from "react";

export function useFilePreviewError(setError: (err: string | null) => void) {
  // In a real scenario, could add logging/reporting/UI toasts here
  const setPreviewError = useCallback((msg: string | null) => setError(msg), [setError]);
  return { setPreviewError };
}
