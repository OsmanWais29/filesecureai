
import { testDirectUpload } from "./storageDiagnostics";
import type { FileUploadResult } from "./jwtDiagnosticsTypes";

export async function handleDirectUploadFallback(file: File, bucket: string, path: string): Promise<FileUploadResult> {
  try {
    const directResult = await testDirectUpload(file, bucket, path);
    if (directResult.success) {
      return {
        success: true,
        method: "direct-upload-fallback",
        data: directResult.data,
      };
    }
    return {
      success: false,
      method: "direct-upload-fallback",
      error: directResult.error,
    };
  } catch (directError) {
    return {
      success: false,
      method: "direct-upload-fallback",
      error: directError,
    };
  }
}
