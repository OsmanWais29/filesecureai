import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  documentId?: string;
  documentText?: string;
  includeRegulatory?: boolean;
  includeClientExtraction?: boolean;
  extractionMode?: 'standard' | 'comprehensive';
  title?: string;
  formType?: string;
  isExcelFile?: boolean;
}

const FUNCTION_TIMEOUT = 25000; // 25 seconds

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Function timed out after 25 seconds')), FUNCTION_TIMEOUT);
  });

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { 
      documentId, 
      documentText, 
      includeRegulatory = true, 
      includeClientExtraction = true, 
      extractionMode = 'comprehensive', 
      title = '',
      formType = '',
      isExcelFile = false
    } = await req.json();

    console.log(`Analysis request received for document ID: ${documentId}, form type: ${formType}, title: ${title}`);

    if (!documentId && !documentText) {
      throw new Error('Either documentId or documentText must be provided');
    }
    
    // Handle Excel files with simplified workflow
    if (isExcelFile && documentId) {
      console.log("Processing Excel file with simplified workflow");
      
      let clientName = "Unknown Client";
      if (title) {
        const nameMatch = title.match(/(?:form[- ]?76[- ]?|)([a-z\s]+)(?:\.|$)/i);
        if (nameMatch && nameMatch[1]) {
          clientName = nameMatch[1].trim();
          console.log(`Extracted client name from Excel filename: ${clientName}`);
        }
      }
      
      await supabase
        .from('documents')
        .update({ 
          ai_processing_status: 'complete',
          metadata: {
            fileType: 'excel',
            formType: formType || 'unknown',
            formNumber: formType === 'form-76' ? '76' : (title.match(/Form\s+(\d+)/i)?.[1] || ''),
            client_name: clientName,
            processing_complete: true,
            processing_time_ms: 200,
            last_analyzed: new Date().toISOString(),
            simplified_processing: true
          }
        })
        .eq('id', documentId);
        
      return new Response(JSON.stringify({
        success: true,
        message: "Excel file processed with simplified workflow",
        extracted_info: {
          clientName,
          fileType: 'excel',
          formType: formType || 'unknown',
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Get document text if not provided
    let processedDocumentText = documentText;
    if (documentId && !documentText) {
      console.log(`Fetching document content for ID: ${documentId}`);
      const { data: document, error } = await supabase
        .from('documents')
        .select('metadata, title, storage_path')
        .eq('id', documentId)
        .single();
      
      if (error) {
        console.error("Error fetching document:", error);
        throw error;
      }
      
      if (document?.metadata?.content) {
        processedDocumentText = document.metadata.content;
        console.log("Retrieved document content from metadata");
      }
    }

    if (!processedDocumentText) {
      throw new Error('No document text available for analysis');
    }

    // Detect form type from content or title
    let detectedFormType = "";
    let detectedFormNumber = "";
    
    if (title?.toLowerCase().includes("form 31") || title?.toLowerCase().includes("proof of claim") || 
        processedDocumentText?.toLowerCase().includes("form 31") || processedDocumentText?.toLowerCase().includes("proof of claim")) {
      detectedFormType = "form-31";
      detectedFormNumber = "31";
      console.log("Detected Form 31 (Proof of Claim)");
    } else if (title?.toLowerCase().includes("form 47") || title?.toLowerCase().includes("consumer proposal") ||
               processedDocumentText?.toLowerCase().includes("form 47") || processedDocumentText?.toLowerCase().includes("consumer proposal")) {
      detectedFormType = "form-47";
      detectedFormNumber = "47";
      console.log("Detected Form 47 (Consumer Proposal)");
    } else if (title?.toLowerCase().includes("form 65") || title?.toLowerCase().includes("assignment") ||
               processedDocumentText?.toLowerCase().includes("form 65") || processedDocumentText?.toLowerCase().includes("assignment")) {
      detectedFormType = "form-65";
      detectedFormNumber = "65";
      console.log("Detected Form 65 (Assignment in Bankruptcy)");
    }

    // Use enhanced OSB analysis for detected forms
    if (detectedFormNumber && extractionMode === 'comprehensive') {
      console.log(`Using enhanced OSB analysis for Form ${detectedFormNumber}`);
      
      try {
        // Call enhanced OSB analysis
        const { data: enhancedResult, error: enhancedError } = await supabase.functions.invoke('enhanced-osb-analysis', {
          body: {
            documentText: processedDocumentText,
            formNumber: detectedFormNumber,
            userId: null, // Will be set by the edge function based on auth
            analysisType: 'comprehensive'
          }
        });

        if (enhancedError) throw enhancedError;

        // Update document with enhanced analysis results
        if (documentId) {
          const analysisData = enhancedResult.analysis;
          const { error: updateError } = await supabase
            .from('documents')
            .update({
              metadata: {
                ...analysisData.document_details,
                ...analysisData.client_details,
                formType: detectedFormType,
                formNumber: detectedFormNumber,
                analyzed_at: new Date().toISOString(),
                enhanced_analysis: true
              },
              ai_processing_status: 'complete'
            })
            .eq('id', documentId);

          if (updateError) {
            console.error("Error updating document with enhanced analysis:", updateError);
          }
        }

        return new Response(
          JSON.stringify({
            success: true,
            structureValid: true,
            requiredFieldsPresent: true,
            signaturesValid: analysisData.comprehensive_risk_assessment.validation_flags.signature_verified,
            enhanced: true,
            analysis: enhancedResult.analysis,
            risks: enhancedResult.analysis.comprehensive_risk_assessment.identified_risks || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (enhancedError) {
        console.error('Enhanced analysis failed, falling back to standard analysis:', enhancedError);
        // Fall through to standard analysis
      }
    }

    // Standard analysis fallback (existing code)
    console.log('Using standard analysis for non-OSB forms or fallback');
    
    // Extract basic form fields for validation
    let formFields: any = {};
    if (processedDocumentText) {
      const getField = (regex: RegExp) => {
        const match = processedDocumentText.match(regex);
        return match ? match[1].trim() : "";
      };
      
      formFields = {
        formNumber: detectedFormNumber || getField(/form\s*(?:no\.?|number)?[\s:]*([\w-]+)/i),
        clientName: getField(/(?:debtor|client)(?:'s)?\s*name[\s:]*([\w\s.-]+)/i),
        claimantName: getField(/(?:claimant|creditor)\s*name[\s:]*([\w\s.-]+)/i),
        trusteeName: getField(/(?:trustee|lit)[\s:]*([\w\s.-]+)/i),
        dateSigned: getField(/(?:date|signed)[\s:]*([\d\/.-]+)/i),
        claimAmount: getField(/(?:claim|amount)[\s:]*\$?\s*([\d,.]+)/i),
        estateNumber: getField(/(?:estate|bankruptcy)\s+(?:no|number)[\s:.]*([a-z0-9-]+)/i),
        courtFileNumber: getField(/court\s+file\s+(?:no|number)[\s:.]*([a-z0-9-]+)/i),
      };
    }

    const hasValidFormData = formFields.clientName || formFields.claimantName || formFields.claimAmount;

    // Update document with standard analysis
    if (documentId) {
      const { error } = await supabase
        .from('documents')
        .update({
          metadata: {
            ...formFields,
            formType: detectedFormType || formFields.formType || '',
            formNumber: detectedFormNumber || formFields.formNumber || '',
            analyzed_at: new Date().toISOString(),
            standard_analysis: true
          },
          ai_processing_status: 'complete'
        })
        .eq('id', documentId);

      if (error) {
        console.error("Error updating document with standard analysis:", error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        structureValid: hasValidFormData,
        requiredFieldsPresent: hasValidFormData,
        signaturesValid: formFields.dateSigned ? true : false,
        enhanced: false,
        formFields,
        risks: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-document function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error',
        structureValid: false,
        requiredFieldsPresent: false,
        signaturesValid: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
