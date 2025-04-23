
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Configuration, OpenAIApi } from "https://esm.sh/openai@3.2.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get document ID and storage path from request
    const { documentId, storagePath } = await req.json();
    
    if (!documentId || !storagePath) {
      throw new Error("Missing required parameters: documentId and/or storagePath");
    }
    
    console.log(`Processing document: ${documentId} at path ${storagePath}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Update document status to processing
    await supabase
      .from("documents")
      .update({ ai_processing_status: "processing" })
      .eq("id", documentId);
    
    // Download the document from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(storagePath);
      
    if (downloadError) {
      throw new Error(`Error downloading file: ${downloadError.message}`);
    }
    
    // Convert to text
    const text = await fileData.text();
    const textSample = text.slice(0, 3000); // Use a sample for OpenAI to conserve tokens
    
    // Initialize OpenAI API
    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      throw new Error("Missing OpenAI API key");
    }
    
    const configuration = new Configuration({ apiKey: openAIApiKey });
    const openai = new OpenAIApi(configuration);
    
    console.log("Sending document to OpenAI for analysis");
    
    // Analyze document using OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a financial document analyzer specializing in bankruptcy forms.
          Extract key information and identify risks from the document.
          Structure your analysis in JSON format with the following sections:
          1. documentType (exact form number if identifiable)
          2. clientInformation (name, contact details, filing status)
          3. financialSummary (key financial figures and dates)
          4. riskAssessment (array of identified risks with severity level, description, BIA section references, and suggested solutions)
          5. complianceIssues (any problems in document completion or submission)`
        },
        {
          role: "user",
          content: `Analyze this financial document and extract the key information: ${textSample}`
        }
      ],
      temperature: 0.2,
    });
    
    const analysisResult = completion.data.choices[0]?.message?.content || "{}";
    console.log("Analysis complete, processing results");
    
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysisResult);
    } catch (e) {
      console.error("Error parsing OpenAI response:", e);
      parsedAnalysis = {
        documentType: "Unknown",
        clientInformation: { name: "Unknown" },
        riskAssessment: []
      };
    }
    
    // Store analysis results in document_analysis table
    const analysisData = {
      document_id: documentId,
      content: {
        analysis: parsedAnalysis,
        raw_text_sample: textSample.substring(0, 500),
        analyzed_at: new Date().toISOString()
      }
    };
    
    const { error: analysisError } = await supabase
      .from("document_analysis")
      .upsert(analysisData);
      
    if (analysisError) {
      throw new Error(`Error saving analysis: ${analysisError.message}`);
    }
    
    // Extract client information
    let clientName = parsedAnalysis.clientInformation?.name || "Unknown Client";
    if (clientName === "Unknown" && parsedAnalysis.documentType) {
      // Try to extract from document content
      const nameMatch = text.match(/(?:name|client|debtor)[\s:]+([A-Za-z\s.]{2,30})/i);
      if (nameMatch && nameMatch[1]) {
        clientName = nameMatch[1].trim();
      }
    }
    
    // Update document metadata with analysis results
    await supabase
      .from("documents")
      .update({
        metadata: {
          document_type: parsedAnalysis.documentType,
          client_name: clientName,
          risk_count: parsedAnalysis.riskAssessment?.length || 0,
          analysis_completed: true
        },
        ai_processing_status: "complete"
      })
      .eq("id", documentId);
      
    console.log("Document processing completed successfully");
    
    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        analysis: parsedAnalysis
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error("Error processing document:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
