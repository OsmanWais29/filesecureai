
import { useState, useEffect } from "react";

// Example API expected: useFilePreview("some-file-url.pdf")
// Returns: { url, isLoading, error }
export const useFilePreview = (fileUrl: string | null) => {
  const [url, setUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileUrl) {
      setUrl(null);
      setIsLoading(false);
      setError("No file URL provided");
      return;
    }
    setIsLoading(true);
    setError(null);

    // Simulate loading (could fetch/validate, or just set as-is)
    setTimeout(() => {
      setUrl(fileUrl);
      setIsLoading(false);
      setError(null);
    }, 250);
  }, [fileUrl]);

  return { url, isLoading, error };
};
