
import { supabase } from "@/lib/supabase";
import type { FileUploadResult } from "./jwtDiagnosticsTypes";

// Handles large PDF uploads via signed URL
export async function uploadViaSignedUrl(bucket: string, path: string, file: File): Promise<FileUploadResult> {
  const { data, error: urlError } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (urlError) {
    return { success: false, method: "signed-url", error: urlError };
  }
  try {
    const response = await fetch(data.signedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    });
    if (response.ok) {
      return { success: true, method: "signed-url-pdf", data: { path } };
    }
    const errorText = await response.text();
    return { success: false, method: "signed-url", error: { message: errorText, status: response.status } };
  } catch (e) {
    return { success: false, method: "signed-url", error: e };
  }
}
