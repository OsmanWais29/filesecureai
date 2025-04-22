
import { supabase } from "@/lib/supabase";
import { verifyJwtToken } from "./jwtVerifier";

export async function maybeRunDiagnostics(file: File, runDiagnostics?: boolean): Promise<{ valid: boolean, reason?: string }> {
  const isPdf = file.type === 'application/pdf';
  if (runDiagnostics || isPdf) {
    const tokenDiag = await verifyJwtToken();
    if (!tokenDiag.isValid) {
      if (isPdf) {
        await refreshJwt(true);
      }
      return { valid: false, reason: tokenDiag.reason || tokenDiag.error };
    }
  }
  return { valid: true };
}

export async function refreshJwt(verbose = false): Promise<boolean> {
  const { error } = await supabase.auth.refreshSession();
  if (error) {
    if (verbose) console.error("JWT refresh failed: ", error.message);
    return false;
  }
  if (verbose) console.log("JWT refreshed successfully");
  return true;
}
