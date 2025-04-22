
import { supabase } from "@/lib/supabase";
import type { FileUploadResult } from "./jwtDiagnosticsTypes";

// Attempt standard upload with optional retry
export async function tryStandardUpload(
  bucket: string, 
  path: string, 
  file: File, 
  isPdf: boolean, 
  maxRetries: number = 3
): Promise<{ result: FileUploadResult, lastError: any }> {
  let lastError: any = null;
  for (let attempt = 1; attempt <= maxRetries; ++attempt) {
    const { data, error } = await supabase.storage.from(bucket).upload(
      path, 
      file, 
      { upsert: true, contentType: isPdf ? 'application/pdf' : file.type }
    );
    if (!error) {
      return { result: {
        success: true,
        method: attempt === 1 ? "standard" : `standard-retry-${attempt}`,
        data
      }, lastError: null };
    }
    lastError = error;
    if (!(error.message?.includes('5'))) break;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  return { result: { success: false, method: "standard", error: lastError }, lastError };
}
