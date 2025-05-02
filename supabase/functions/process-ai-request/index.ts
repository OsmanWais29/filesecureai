
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExaItem {
  title: string;
  url: string;
  snippet: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY') || '';
    const exaApiKey = Deno.env.get('EXA_API_KEY') || '';

    if (!supabaseUrl || !supabaseKey || !deepseekApiKey) {
      console.error("Missing required environment variables");
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if this is a ping request for health checking
    const reqData = await req.json();
    if (reqData && reqData.ping === true) {
      console.log("Received ping request, responding with pong");
      return new Response(
        JSON.stringify({ status: "ok", message: "pong" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get request parameters
    const { documentId, message, includeRegulatory = true, includeClientExtraction = true, storagePath, title = '' } = reqData;
    
    if (!documentId && !message && !storagePath) {
      console.error("No document ID, message, or storagePath provided");
      throw new Error('Either documentId, message, or storagePath must be provided');
    }
    
    console.log(`Processing request for document ID: ${documentId || 'N/A'}`);
    
    // If we have a documentId, get the document content
    let documentText = message || '';
    let documentTitle = title || '';
    let documentFormType = '';
    let documentPath = storagePath || '';
    
    if (documentId && !documentText) {
      console.log(`Fetching document content for ID: ${documentId}`);
      
      // Get document details
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('title, metadata, storage_path')
        .eq('id', documentId)
        .single();
        
      if (docError) {
        console.error("Error fetching document:", docError);
        throw docError;
      }
      
      documentTitle = document?.title || 'Unknown Document';
      documentFormType = document?.metadata?.formType || document?.metadata?.documentType || '';
      
      // If we have storage path, download document content
      if (document?.storage_path) {
        documentPath = document.storage_path;
        
        console.log(`Downloading document from path: ${documentPath}`);

        try {
          // Download the file
          const { data: fileData, error: downloadError } = await supabase.storage
            .from('documents')
            .download(document.storage_path);
            
          if (downloadError) {
            console.error("Error downloading document:", downloadError);
            throw downloadError;
          }
          
          try {
            documentText = await fileData.text();
            console.log(`Successfully extracted text from document, length: ${documentText.length} characters`);
            
            // Limit text size to avoid token limits
            if (documentText.length > 100000) {
              documentText = documentText.substring(0, 100000);
              console.log("Document text truncated to 100,000 characters");
            }
          } catch (textError) {
            console.error("Error extracting text from document:", textError);
            throw textError;
          }
        } catch (storageError) {
          console.error("Storage error:", storageError);
          throw storageError;
        }
      } else {
        console.error("No storage path found for document");
        throw new Error("Document has no storage path");
      }
    }
    
    // If document text is still empty, return error
    if (!documentText || documentText.trim().length === 0) {
      console.error("No document content available");
      throw new Error('No document content available for analysis');
    }
    
    // Search EXA for BIA regulations (if API key is available)
    let biaRegulations: ExaItem[] = [];
    let regulatoryReferences = [];
    
    if (includeRegulatory && exaApiKey) {
      try {
        console.log("Querying EXA API for regulatory references");
        let searchTerm = "Bankruptcy and Insolvency Act compliance requirements";
        
        // Add form type if available
        if (documentFormType) {
          const formNumber = documentFormType.replace(/[^0-9]/g, '');
          if (formNumber) {
            searchTerm = `Bankruptcy and Insolvency Act Form ${formNumber} requirements compliance Canada`;
          }
        }
        
        const exaResponse = await fetch('https://api.exa.ai/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': exaApiKey
          },
          body: JSON.stringify({
            query: searchTerm,
            num_results: 3,
            highlight_results: true,
            use_autoprompt: false
          })
        });
        
        if (!exaResponse.ok) {
          console.error(`EXA API error: ${exaResponse.status}`);
          throw new Error(`EXA API returned ${exaResponse.status}`);
        }
        
        const exaData = await exaResponse.json();
        biaRegulations = exaData.results || [];
        
        // Format regulations for DeepSeek context
        regulatoryReferences = biaRegulations.map(item => ({
          title: item.title,
          url: item.url,
          snippet: item.text || item.snippet
        }));
        
        console.log(`Found ${regulatoryReferences.length} regulatory references`);
      } catch (exaError) {
        console.error("EXA API error:", exaError);
        console.log("Continuing without EXA references");
      }
    }
    
    // Generate form-specific prompt
    let systemPrompt = "You are a Canadian licensed insolvency trustee AI assistant specialized in bankruptcy documentation. ";
    
    if (documentFormType === 'form-31' || documentTitle.toLowerCase().includes('form 31') || documentTitle.toLowerCase().includes('proof of claim')) {
      systemPrompt += "You are analyzing a Form 31 (Proof of Claim) document. Extract all key information, check for compliance issues, and create a risk assessment.";
    } else if (documentFormType === 'form-47' || documentTitle.toLowerCase().includes('form 47') || documentTitle.toLowerCase().includes('consumer proposal')) {
      systemPrompt += "You are analyzing a Form 47 (Consumer Proposal) document. Extract all key information, check for compliance issues, and create a risk assessment.";
    } else if (documentFormType === 'form-76' || documentTitle.toLowerCase().includes('form 76') || documentTitle.toLowerCase().includes('statement of affairs')) {
      systemPrompt += "You are analyzing a Form 76 (Statement of Affairs) document. Extract all key information, check for compliance issues, and create a risk assessment.";
    } else {
      systemPrompt += "You are analyzing a bankruptcy or insolvency document. Extract all key information, check for compliance issues, and create a risk assessment.";
    }
    
    console.log("Calling DeepSeek API for document analysis");
    
    // Process document with DeepSeek API
    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekApiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-coder',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Document Title: ${documentTitle}\n\nDocument Content:\n${documentText}\n\n${regulatoryReferences.length > 0 ? 'Regulatory References:\n' + JSON.stringify(regulatoryReferences, null, 2) : ''}` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!deepseekResponse.ok) {
      console.error(`DeepSeek API error: ${deepseekResponse.status}`);
      throw new Error(`DeepSeek API returned ${deepseekResponse.status}`);
    }

    // Parse the DeepSeek response
    const deepseekData = await deepseekResponse.json();
    console.log("Successfully parsed DeepSeek response");

    // Extract the content from the response
    let analysisContent;
    try {
      const responseText = deepseekData.choices[0].message.content;
      analysisContent = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Error parsing DeepSeek JSON response:", parseError);
      throw new Error("Failed to parse DeepSeek response");
    }

    // Add regulatory references to the analysis result
    const analysisResult = {
      ...analysisContent,
      regulatory_references: regulatoryReferences,
      timestamp: new Date().toISOString(),
      debug_info: {
        model: 'deepseek-coder',
        document_id: documentId,
        document_title: documentTitle,
        document_length: documentText.length,
        has_regulatory_references: regulatoryReferences.length > 0
      }
    };

    console.log("Added Exa regulatory references to analysis result");

    // Save the analysis result to the database
    try {
      console.log(`Saving analysis results for document ID: ${documentId}`);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error("No authenticated user found when saving analysis");
      }

      // Check if an analysis already exists for this document
      const { data: existingAnalysis, error: checkError } = await supabase
        .from('document_analysis')
        .select('id')
        .eq('document_id', documentId)
        .maybeSingle();

      if (checkError) {
        console.error("Error checking existing analysis:", checkError);
      }

      if (existingAnalysis) {
        // Update existing analysis
        const { error: updateError } = await supabase
          .from('document_analysis')
          .update({
            content: analysisResult,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAnalysis.id);

        if (updateError) {
          console.error("Error updating existing analysis:", updateError);
          throw updateError;
        }
      } else {
        // Create new analysis record
        const { error: insertError } = await supabase
          .from('document_analysis')
          .insert({
            document_id: documentId,
            user_id: user?.id || '00000000-0000-0000-0000-000000000000', // Use a placeholder if no user
            content: analysisResult
          });

        if (insertError) {
          console.error("Error creating new analysis:", insertError);
          throw insertError;
        }
        console.log(`Created new analysis for document ${documentId}`);
      }

      // Update document metadata with the analysis timestamp
      const { error: docUpdateError } = await supabase
        .from('documents')
        .update({
          metadata: {
            analysis_completed_at: new Date().toISOString(),
            has_analysis: true,
            analysis_status: 'complete'
          },
          ai_processing_status: 'complete'
        })
        .eq('id', documentId);

      if (docUpdateError) {
        console.error("Error updating document metadata:", docUpdateError);
      }
      console.log(`Updated document metadata for ${documentId}`);

      // Try to create client record if client info is available
      if (analysisResult.extracted_info && analysisResult.extracted_info.clientName) {
        try {
          await createClientIfNotExists(analysisResult.extracted_info);
        } catch (clientError) {
          console.error("Error creating client record:", clientError);
        }
      } else {
        console.log("Checking if client exists: Not available");
      }
    } catch (dbError) {
      console.error("Error saving analysis to database:", dbError);
    }

    console.log("Analysis complete, returning results");

    // Return the analysis result
    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to create client if not exists
async function createClientIfNotExists(clientInfo: any) {
  if (!clientInfo?.clientName) {
    return null;
  }
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const clientName = clientInfo.clientName.trim();
    
    // Check if client already exists
    const { data: existingClients, error: checkError } = await supabase
      .from('clients')
      .select('id')
      .ilike('name', clientName)
      .limit(1);
      
    if (checkError) throw checkError;
    
    // If client exists, return their ID
    if (existingClients && existingClients.length > 0) {
      return existingClients[0].id;
    }
    
    // Create new client
    const { data: newClient, error } = await supabase
      .from('clients')
      .insert({
        name: clientName,
        email: clientInfo.clientEmail || null,
        phone: clientInfo.clientPhone || null,
        metadata: {
          address: clientInfo.clientAddress || null,
          totalDebts: clientInfo.totalDebts || null,
          totalAssets: clientInfo.totalAssets || null,
          monthlyIncome: clientInfo.monthlyIncome || null
        }
      })
      .select('id')
      .single();
      
    if (error) throw error;
    
    return newClient.id;
  } catch (error) {
    console.error('Error in createClientIfNotExists:', error);
    return null;
  }
}
