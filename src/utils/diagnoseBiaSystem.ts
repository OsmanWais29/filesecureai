
import { supabase } from "@/lib/supabase";
import { safeStringCast, safeObjectCast } from "@/utils/typeGuards";

/**
 * Runs comprehensive diagnostics on the Bankruptcy & Insolvency Act (BIA) system
 * @param documentId The document ID to diagnose
 * @returns Diagnostic results
 */
export const runFullSystemDiagnostics = async (documentId: string) => {
  console.log(`Running full system diagnostics for document: ${documentId}`);
  
  const results = {
    success: true,
    message: "All systems operational",
    supabaseConnection: true,
    documentFound: false,
    analysisFound: false,
    storagePathValid: false,
    analysisStatus: "unknown",
    details: {} as Record<string, any>
  };
  
  try {
    // Test 1: Basic Supabase Connection
    try {
      const { count, error } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        results.supabaseConnection = false;
        results.success = false;
        results.message = `Supabase connection issue: ${error.message}`;
        return results;
      }
      
      results.details.documentCount = count;
    } catch (e: any) {
      results.supabaseConnection = false;
      results.success = false;
      results.message = `Supabase connection error: ${e.message}`;
      return results;
    }
    
    // Test 2: Document Existence
    try {
      const { data: document, error } = await supabase
        .from('documents')
        .select('id, title, storage_path, ai_processing_status, metadata')
        .eq('id', documentId)
        .single();
      
      if (error || !document) {
        results.documentFound = false;
        results.success = false;
        results.message = `Document not found: ${error?.message || 'Unknown error'}`;
        return results;
      }
      
      results.documentFound = true;
      results.details.documentTitle = document.title;
      results.details.aiProcessingStatus = document.ai_processing_status;
      results.details.metadata = document.metadata;
      
      // Test storage path validity
      if (document.storage_path) {
        results.storagePathValid = true;
        results.details.storagePath = document.storage_path;
        
        // Check if file exists in storage
        try {
          const { data, error: storageError } = await supabase.storage
            .from('documents')
            .download(safeStringCast(document.storage_path));
          
          if (storageError) {
            results.storagePathValid = false;
            results.details.storagePathError = storageError.message;
          } else {
            results.details.fileSize = data.size;
          }
        } catch (storageErr) {
          results.storagePathValid = false;
          results.details.storagePathError = (storageErr as Error).message;
        }
      } else {
        results.storagePathValid = false;
        results.details.storagePathMissing = true;
      }
    } catch (e: any) {
      results.documentFound = false;
      results.success = false;
      results.message = `Error checking document: ${e.message}`;
      return results;
    }
    
    // Test 3: Analysis Existence
    try {
      const { data: analysis, error } = await supabase
        .from('document_analysis')
        .select('id, content, created_at, updated_at')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })
        .maybeSingle();
      
      if (error) {
        results.success = false;
        results.message = `Error checking analysis: ${error.message}`;
        return results;
      }
      
      if (!analysis) {
        results.analysisFound = false;
        results.analysisStatus = "missing";
        results.success = false;
        results.message = "Document analysis not found. Document may need processing.";
      } else {
        results.analysisFound = true;
        results.analysisStatus = "found";
        results.details.analysisCreatedAt = analysis.created_at;
        results.details.analysisUpdatedAt = analysis.updated_at;
        
        // Check if content exists and has proper structure
        if (!analysis.content) {
          results.analysisStatus = "empty";
          results.success = false;
          results.message = "Analysis exists but content is empty";
        } else {
          const content = safeObjectCast(analysis.content);
          
          // Check extracted_info
          if (!content.extracted_info) {
            results.analysisStatus = "incomplete";
            results.success = false;
            results.message = "Analysis missing extracted_info";
          }
          
          // Check summary (either directly or in extracted_info)
          const extractedInfo = safeObjectCast(content.extracted_info);
          const summary = content.summary || extractedInfo.summary;
          if (!summary) {
            if (results.analysisStatus === "incomplete") {
              results.message += " and summary";
            } else {
              results.analysisStatus = "incomplete";
              results.success = false;
              results.message = "Analysis missing summary";
            }
          } else {
            results.details.hasSummary = true;
          }
          
          // Check risks
          if (!content.risks || !Array.isArray(content.risks)) {
            if (results.analysisStatus === "incomplete") {
              results.message += " and risks";
            } else {
              results.analysisStatus = "incomplete";
              results.success = false;
              results.message = "Analysis missing risks array";
            }
          } else {
            results.details.riskCount = content.risks.length;
          }
        }
        
        results.details.analysisId = analysis.id;
      }
    } catch (e: any) {
      results.analysisFound = false;
      results.success = false;
      results.message = `Error checking analysis: ${e.message}`;
      return results;
    }
    
    return results;
    
  } catch (e: any) {
    console.error("Diagnostic error:", e);
    return {
      success: false,
      message: `System diagnostic failed: ${e.message}`,
      error: e
    };
  }
};

/**
 * Tests if the OpenAI API key is valid and operational
 */
export const testOpenAIKey = async () => {
  try {
    // Call the edge function to test the OpenAI key
    const { data, error } = await supabase.functions.invoke('process-ai-request', {
      body: {
        message: "This is a test to verify OpenAI connectivity.",
        testMode: true
      }
    });
    
    if (error) {
      return { success: false, message: `OpenAI test failed: ${error.message}` };
    }
    
    return { success: true, message: "OpenAI API key is valid", details: data };
  } catch (e: any) {
    console.error("OpenAI key test error:", e);
    return { success: false, message: `OpenAI test error: ${e.message}` };
  }
};
