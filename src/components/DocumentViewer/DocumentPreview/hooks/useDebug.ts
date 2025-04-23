
import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface DebugResult {
  timestamp: string;
  success: boolean;
  message: string;
  details: {
    auth?: {
      isAuthenticated: boolean;
      hasValidSession: boolean;
      user?: any;
    };
    storage?: {
      buckets: any[];
      hasAccess: boolean;
    };
    document?: {
      url?: string | null;
      pathExists?: boolean;
      error?: string;
    };
  };
}

export function useDebug() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DebugResult | null>(null);

  const runDiagnostics = useCallback(async (storagePath: string | null) => {
    if (!storagePath) {
      toast.error("Can't run diagnostics without a storage path");
      return null;
    }

    setIsLoading(true);
    
    try {
      console.group("🔍 Running diagnostics");
      console.log("Storage path:", storagePath);
      
      // Create result object
      const result: DebugResult = {
        timestamp: new Date().toISOString(),
        success: false,
        message: "",
        details: {
          auth: {
            isAuthenticated: false,
            hasValidSession: false
          },
          storage: {
            buckets: [],
            hasAccess: false
          },
          document: {
            pathExists: false
          }
        }
      };
      
      // 1. Check authentication
      console.log("Checking authentication...");
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Authentication error:", userError);
        result.details.auth!.isAuthenticated = false;
        result.details.auth!.hasValidSession = false;
        result.message = "Authentication failed";
      } else {
        result.details.auth!.isAuthenticated = !!user.user;
        result.details.auth!.hasValidSession = !!user.user;
        result.details.auth!.user = user.user;
      }
      console.log("Authentication status:", result.details.auth);

      // 2. Check storage access
      console.log("Checking storage access...");
      try {
        const { data: buckets, error: storageBucketsError } = await supabase.storage.listBuckets();
        if (storageBucketsError) {
          console.error("Storage access error:", storageBucketsError);
          result.details.storage!.hasAccess = false;
          result.message = `Storage access failed: ${storageBucketsError.message}`;
        } else {
          result.details.storage!.buckets = buckets;
          result.details.storage!.hasAccess = true;
          console.log("Storage buckets:", buckets);
        }
      } catch (e: any) {
        console.error("Storage access unexpected error:", e);
        result.details.storage!.hasAccess = false;
        result.message = `Storage access failed: ${e.message}`;
      }

      // 3. Check document access
      if (storagePath) {
        console.log("Checking document access...");
        
        // First check if document exists
        try {
          // Parse path to get bucket name and file path
          const pathParts = storagePath.split('/');
          const bucketName = pathParts[0] || 'documents';
          const filePath = pathParts.slice(1).join('/');
          
          // Check if file exists by getting URL
          const { data: urlData, error: urlError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePath, 60);
          
          if (urlError) {
            console.error("Document access error:", urlError);
            result.details.document!.error = urlError.message;
            result.details.document!.pathExists = false;
          } else {
            result.details.document!.url = urlData?.signedUrl || null;
            result.details.document!.pathExists = !!urlData?.signedUrl;
          }
        } catch (e: any) {
          console.error("Document access unexpected error:", e);
          result.details.document!.error = e.message;
          result.details.document!.pathExists = false;
        }
      }
      
      // Set overall status
      result.success = (
        result.details.auth!.isAuthenticated &&
        result.details.storage!.hasAccess &&
        (result.details.document!.pathExists ?? false)
      );
      
      if (result.success) {
        result.message = "All systems working correctly";
      } else if (!result.message) {
        result.message = "Some checks failed. See details.";
      }
      
      console.log("Final diagnostic results:", result);
      console.groupEnd();
      
      setResults(result);
      return result;
    } catch (e: any) {
      console.error("Diagnostics error:", e);
      setResults({
        timestamp: new Date().toISOString(),
        success: false,
        message: `Diagnostic error: ${e.message}`,
        details: {
          auth: { isAuthenticated: false, hasValidSession: false },
          storage: { buckets: [], hasAccess: false },
          document: { error: e.message }
        }
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    runDiagnostics,
    isLoading,
    results
  };
}
